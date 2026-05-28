import DoctorProfile from '../models/DoctorProfile.model.js';
import User from '../models/User.model.js';
import AppError from '../utils/AppError.js';
import { DOCTOR_STATUS } from '../utils/constants.js';
import { uploadToCloudinary } from './upload.service.js';

/**
 * Creates or updates the onboarding profile for a doctor user.
 * Parses coordinates, uploads required documents to Cloudinary, and sets status to pending.
 *
 * @param {string} userId - ID of the logged-in user
 * @param {object} profileData - req.body text inputs
 * @param {object} files - req.files uploaded file metadata
 * @returns {Promise<object>} Created/updated DoctorProfile document
 */
export const onboardDoctor = async (userId, profileData, files) => {
  // 1. Verify user exists and has the doctor role
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User account not found', 404);
  }
  if (user.role !== 'doctor') {
    throw new AppError('Only doctors can complete professional onboarding', 403);
  }

  // 2. Extract and validate files
  const degreeFile = files?.degreeDocument?.[0];
  const licenseFile = files?.licenseDocument?.[0];

  // Fetch existing profile if any
  let profile = await DoctorProfile.findOne({ user: userId });

  // For a brand new profile, both files are strictly required
  if (!profile && (!degreeFile || !licenseFile)) {
    throw new AppError('Both degree and medical license documents are required for onboarding.', 400);
  }

  // 3. Upload new files if provided
  let degreeDocumentUrl = profile?.degreeDocument;
  let licenseDocumentUrl = profile?.licenseDocument;

  if (degreeFile) {
    degreeDocumentUrl = await uploadToCloudinary(degreeFile.path, 'doctor_docs');
  }
  if (licenseFile) {
    licenseDocumentUrl = await uploadToCloudinary(licenseFile.path, 'doctor_docs');
  }

  // 4. Parse and structure data
  let parsedSpecializations;
  try {
    // If it's a string (e.g. from multipart form-data), parse it
    parsedSpecializations = typeof profileData.specialization === 'string'
      ? JSON.parse(profileData.specialization)
      : profileData.specialization;
  } catch (error) {
    throw new AppError('Invalid specialization array format. Must be a valid JSON array.', 400);
  }

  if (!Array.isArray(parsedSpecializations) || parsedSpecializations.length === 0) {
    throw new AppError('At least one specialization is required.', 400);
  }

  const lat = parseFloat(profileData.latitude);
  const lng = parseFloat(profileData.longitude);

  if (isNaN(lat) || isNaN(lng)) {
    throw new AppError('Valid latitude and longitude coordinates are required for the clinic location.', 400);
  }

  const clinicLocation = {
    type: 'Point',
    coordinates: [lng, lat], // GeoJSON order: [longitude, latitude]
  };

  const experience = parseInt(profileData.experience, 10);
  const consultationFee = parseFloat(profileData.consultationFee);

  if (isNaN(experience) || experience < 0) {
    throw new AppError('Experience must be a positive number.', 400);
  }
  if (isNaN(consultationFee) || consultationFee < 0) {
    throw new AppError('Consultation fee must be a positive number.', 400);
  }

  // 5. Save/Update Profile
  const updatePayload = {
    user: userId,
    specialization: parsedSpecializations,
    experience,
    clinicName: profileData.clinicName,
    clinicAddress: profileData.clinicAddress,
    clinicLocation,
    consultationFee,
    bio: profileData.bio,
    registrationNumber: profileData.registrationNumber,
    degreeDocument: degreeDocumentUrl,
    licenseDocument: licenseDocumentUrl,
    verificationStatus: DOCTOR_STATUS.PENDING, // Any submission resets status to pending
    rejectionReason: null, // Clear any previous rejection reasons
  };

  if (profile) {
    // Update existing profile
    profile = await DoctorProfile.findOneAndUpdate({ user: userId }, updatePayload, {
      new: true,
      runValidators: true,
    });
  } else {
    // Create new profile
    profile = await DoctorProfile.create(updatePayload);
  }

  return profile.populate('user');
};

/**
 * Fetch the profile of a specific doctor by user ID.
 * Returns null if the profile doesn't exist yet.
 *
 * @param {string} userId - User ID of the doctor
 * @returns {Promise<object|null>} DoctorProfile populated with user details
 */
export const getDoctorProfileByUserId = async (userId) => {
  return DoctorProfile.findOne({ user: userId }).populate('user');
};
