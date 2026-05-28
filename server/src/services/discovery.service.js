import DoctorProfile from '../models/DoctorProfile.model.js';
import User from '../models/User.model.js';
import AppError from '../utils/AppError.js';
import { DOCTOR_STATUS, ROLES, GEOSPATIAL } from '../utils/constants.js';

/**
 * Assembles a MongoDB filter object from optional query parameters.
 *
 * @param {object} filters - Search filters
 * @returns {object} MongoDB filter object
 */
export const buildDiscoveryQuery = (filters = {}) => {
  const query = {
    verificationStatus: DOCTOR_STATUS.VERIFIED,
    isAvailable: true,
  };

  const {
    specialization,
    minFee,
    maxFee,
    minRating,
    minExperience,
    search,
  } = filters;

  if (specialization) {
    // Map AI-suggested specializations to seeded database values
    const specMapping = {
      'Sports Physiotherapy': 'Sports Injury Rehab',
      'Neurological Physiotherapy': 'Neurological Rehabilitation',
      'Geriatric Physiotherapy': 'Geriatric Care',
      'Cardiopulmonary Physiotherapy': 'Cardiopulmonary Rehab'
    };
    const mapped = specMapping[specialization] || specialization;
    query.specialization = mapped;
  }

  if (minFee !== undefined || maxFee !== undefined) {
    query.consultationFee = {};
    if (minFee !== undefined && minFee !== null) {
      query.consultationFee.$gte = Number(minFee);
    }
    if (maxFee !== undefined && maxFee !== null) {
      query.consultationFee.$lte = Number(maxFee);
    }
  }

  if (minRating !== undefined && minRating !== null) {
    query.averageRating = { $gte: Number(minRating) };
  }

  if (minExperience !== undefined && minExperience !== null) {
    query.experience = { $gte: Number(minExperience) };
  }

  if (search) {
    query.$or = [
      { specialization: { $regex: search, $options: 'i' } },
      { clinicName: { $regex: search, $options: 'i' } },
      { clinicAddress: { $regex: search, $options: 'i' } },
    ];
  }

  return query;
};

/**
 * Map averageRating & totalReviews to rating & reviewCount for frontend compatibility
 */
const mapProfileFields = (doc) => {
  if (!doc) return null;
  return {
    ...doc,
    rating: doc.averageRating ?? 0,
    reviewCount: doc.totalReviews ?? 0,
  };
};

/**
 * Standard doctor listing without location filtering.
 */
export const getDiscoveryListing = async ({ filters = {}, sortBy = 'rating', page = 1, limit = 12 } = {}) => {
  const query = buildDiscoveryQuery(filters);

  // Build sort object
  let sort = { averageRating: -1 };
  if (sortBy === 'rating') {
    sort = { averageRating: -1 };
  } else if (sortBy === 'experience') {
    sort = { experience: -1 };
  } else if (sortBy === 'fee_asc') {
    sort = { consultationFee: 1 };
  } else if (sortBy === 'fee_desc') {
    sort = { consultationFee: -1 };
  }

  const total = await DoctorProfile.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  const doctors = await DoctorProfile.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'name profileImage')
    .lean();

  const mappedDoctors = doctors.map(mapProfileFields);

  return {
    doctors: mappedDoctors,
    total,
    page,
    totalPages,
    hasNextPage: page * limit < total,
  };
};

/**
 * Haversine formula to compute the distance in kilometers between two coordinates.
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Location-aware doctor discovery using MongoDB geospatial queries.
 */
export const getNearbyDoctors = async ({ latitude, longitude, maxDistance, filters = {}, page = 1, limit = 12 }) => {
  if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
    throw new AppError('Latitude and longitude are required for proximity searches', 400);
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (isNaN(lat) || lat < -90 || lat > 90) {
    throw new AppError('Invalid latitude coordinate', 400);
  }
  if (isNaN(lng) || lng < -180 || lng > 180) {
    throw new AppError('Invalid longitude coordinate', 400);
  }

  const baseFilters = buildDiscoveryQuery(filters);

  // $near performs spatial sorting automatically (distance ascending)
  const searchRadius = maxDistance ? Number(maxDistance) : GEOSPATIAL.DEFAULT_DISTANCE_METERS;

  const allNearby = await DoctorProfile.find({
    ...baseFilters,
    clinicLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat], // GeoJSON format: [longitude, latitude]
        },
        $maxDistance: searchRadius,
      },
    },
  })
    .populate('user', 'name profileImage')
    .lean();

  // Map fields and compute distance Km
  const doctorsWithDistance = allNearby.map((doc) => {
    const docLng = doc.clinicLocation.coordinates[0];
    const docLat = doc.clinicLocation.coordinates[1];
    const distanceKm = calculateDistance(lat, lng, docLat, docLng);

    return {
      ...mapProfileFields(doc),
      distanceKm: Number(distanceKm.toFixed(1)),
    };
  });

  // Apply in-memory pagination
  const total = doctorsWithDistance.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedDoctors = doctorsWithDistance.slice(startIndex, startIndex + limit);

  return {
    doctors: paginatedDoctors,
    total,
    page,
    totalPages,
    hasNextPage: page * limit < total,
    searchRadius,
  };
};

/**
 * Full text search including doctor names.
 */
export const searchDoctors = async ({ query, filters = {}, page = 1, limit = 12 }) => {
  if (!query || query.trim().length < 2) {
    throw new AppError('Search query must be at least 2 characters', 400);
  }

  const cleanQuery = query.trim();

  // Phase 1: Search User collection for matching doctor names
  const matchingUsers = await User.find({
    role: ROLES.DOCTOR,
    isActive: true,
    name: { $regex: cleanQuery, $options: 'i' },
  }).select('_id');

  const matchingUserIds = matchingUsers.map((u) => u._id);

  // Phase 2: Build compound query
  const baseFilters = buildDiscoveryQuery(filters);

  const searchQuery = {
    ...baseFilters,
    $or: [
      { user: { $in: matchingUserIds } },
      { specialization: { $regex: cleanQuery, $options: 'i' } },
      { clinicName: { $regex: cleanQuery, $options: 'i' } },
      { bio: { $regex: cleanQuery, $options: 'i' } },
    ],
  };

  const total = await DoctorProfile.countDocuments(searchQuery);
  const totalPages = Math.ceil(total / limit);

  const doctors = await DoctorProfile.find(searchQuery)
    .sort({ averageRating: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'name profileImage')
    .lean();

  const mappedDoctors = doctors.map(mapProfileFields);

  return {
    doctors: mappedDoctors,
    total,
    page,
    totalPages,
    hasNextPage: page * limit < total,
    searchQuery: cleanQuery,
  };
};

/**
 * Fetch doctors by exact specialization.
 */
export const getDoctorsBySpecialization = async (specialization, { page = 1, limit = 12 } = {}) => {
  if (!specialization) {
    throw new AppError('Specialization is required', 400);
  }

  const query = {
    verificationStatus: DOCTOR_STATUS.VERIFIED,
    isAvailable: true,
    specialization: specialization,
  };

  const total = await DoctorProfile.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  const doctors = await DoctorProfile.find(query)
    .sort({ averageRating: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'name profileImage')
    .lean();

  const mappedDoctors = doctors.map(mapProfileFields);

  return {
    doctors: mappedDoctors,
    total,
    page,
    totalPages,
    hasNextPage: page * limit < total,
  };
};

/**
 * Returns top-rated verified doctors for landing page preview.
 */
export const getFeaturedDoctors = async (limit = 6) => {
  const query = {
    verificationStatus: DOCTOR_STATUS.VERIFIED,
    isAvailable: true,
    totalReviews: { $gte: 1 },
  };

  const doctors = await DoctorProfile.find(query)
    .sort({ averageRating: -1, totalReviews: -1 })
    .limit(limit)
    .populate('user', 'name profileImage')
    .lean();

  return {
    doctors: doctors.map(mapProfileFields),
  };
};
