import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import * as discoveryService from '../services/discovery.service.js';
import * as doctorService from '../services/doctor.service.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import Review from '../models/Review.model.js';
import AppError from '../utils/AppError.js';
import { PAGINATION, GEOSPATIAL } from '../utils/constants.js';

const SPECIALIZATIONS = [
  'Sports Injury Rehab',
  'Orthopedic Physiotherapy',
  'Neurological Rehabilitation',
  'Geriatric Care',
  'Pediatric Physiotherapy',
  'Cardiopulmonary Rehab',
  'Dry Needling',
  'Manual Therapy',
  'Vestibular Rehabilitation',
];

/**
 * GET /api/discover
 * Standard doctor listing with optional filtering and sorting.
 */
export const getDiscoveryListing = asyncHandler(async (req, res) => {
  const {
    specialization,
    city,
    minFee,
    maxFee,
    minRating,
    minExperience,
    sortBy = 'rating',
    page = 1,
    limit = 12,
  } = req.query;

  // Sanitize and structure filters
  const filters = {
    specialization,
    city,
    minFee: minFee !== undefined ? Number(minFee) : undefined,
    maxFee: maxFee !== undefined ? Number(maxFee) : undefined,
    minRating: minRating !== undefined ? Number(minRating) : undefined,
    minExperience: minExperience !== undefined ? Number(minExperience) : undefined,
  };

  // Remove undefined keys to avoid polluting the query builder
  Object.keys(filters).forEach((key) => filters[key] === undefined && delete filters[key]);

  const result = await discoveryService.getDiscoveryListing({
    filters,
    sortBy,
    page: Number(page),
    limit: Math.min(Number(limit), PAGINATION.MAX_LIMIT),
  });

  return successResponse(res, 200, 'Doctors retrieved successfully', result);
});

/**
 * GET /api/discover/nearby
 * Location-aware doctor discovery using geospatial coordinates.
 */
export const getNearbyDoctors = asyncHandler(async (req, res) => {
  const {
    latitude,
    longitude,
    maxDistance,
    specialization,
    page = 1,
    limit = 12,
  } = req.query;

  if (latitude === undefined || longitude === undefined) {
    throw new AppError('latitude and longitude query parameters are required', 400);
  }

  const result = await discoveryService.getNearbyDoctors({
    latitude: Number(latitude),
    longitude: Number(longitude),
    maxDistance: maxDistance ? Number(maxDistance) : GEOSPATIAL.DEFAULT_DISTANCE_METERS,
    filters: { specialization },
    page: Number(page),
    limit: Number(limit),
  });

  return successResponse(res, 200, 'Nearby doctors retrieved successfully', result);
});

/**
 * GET /api/discover/search
 * Full text search across names, specializations, bios, etc.
 */
export const searchDoctors = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 12, ...filters } = req.query;

  if (!q || q.trim().length < 2) {
    throw new AppError('Search query must be at least 2 characters', 400);
  }

  const result = await discoveryService.searchDoctors({
    query: q.trim(),
    filters,
    page: Number(page),
    limit: Number(limit),
  });

  return successResponse(res, 200, 'Search results retrieved successfully', result);
});

/**
 * GET /api/discover/featured
 * Returns top-rated verified doctors for landing page preview.
 */
export const getFeaturedDoctors = asyncHandler(async (req, res) => {
  const result = await discoveryService.getFeaturedDoctors(6);
  return successResponse(res, 200, 'Featured doctors retrieved successfully', result);
});

/**
 * GET /api/discover/specializations
 * Returns specializations with doctor counts.
 */
export const getSpecializationList = asyncHandler(async (req, res) => {
  const specializationCounts = await DoctorProfile.aggregate([
    { $match: { verificationStatus: 'verified', isAvailable: true } },
    { $unwind: '$specialization' },
    { $group: { _id: '$specialization', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Merge with full enum list so all specializations appear, even with count 0
  const allSpecializations = SPECIALIZATIONS.map((spec) => ({
    name: spec,
    count: specializationCounts.find((s) => s._id === spec)?.count || 0,
  }));

  // Also catch any custom specializations not in the predefined list
  specializationCounts.forEach((sc) => {
    if (!SPECIALIZATIONS.includes(sc._id)) {
      allSpecializations.push({
        name: sc._id,
        count: sc.count,
      });
    }
  });

  return successResponse(res, 200, 'Specializations retrieved successfully', {
    specializations: allSpecializations,
  });
});

/**
 * GET /api/discover/:id
 * Retrieve public doctor profile with recent reviews placeholder.
 */
export const getDoctorPublicProfile = asyncHandler(async (req, res) => {
  const profile = await doctorService.getPublicDoctorProfileById(req.params.id);
  profile.rating = profile.averageRating ?? 0;
  profile.reviewCount = profile.totalReviews ?? 0;

  // Retrieve actual reviews for this doctor profile
  const reviews = await Review.find({ doctor: profile._id, isVisible: true })
    .populate('patient', 'name')
    .sort({ createdAt: -1 });

  return successResponse(res, 200, 'Doctor profile retrieved successfully', {
    profile,
    reviews,
    reviewCount: profile.reviewCount,
    rating: profile.rating,
  });
});
