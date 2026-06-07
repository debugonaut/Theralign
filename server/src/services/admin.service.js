import DoctorProfile from '../models/DoctorProfile.model.js';
import AppError from '../utils/AppError.js';
import { DOCTOR_STATUS } from '../utils/constants.js';

/**
 * Retrieves all doctor profiles that are pending verification.
 * Populates basic user information (name, email, profileImage, phone).
 *
 * @returns {Promise<Array>} List of pending doctor profiles
 */
export const getPendingDoctorProfiles = async () => {
  return DoctorProfile.find({ verificationStatus: DOCTOR_STATUS.PENDING, isOnboarded: true })
    .populate('user', 'name email profileImage phone')
    .sort({ createdAt: 1 }); // Oldest applications first
};

/**
 * Approves and verifies a doctor's professional profile.
 *
 * @param {string} profileId - Database ID of the DoctorProfile
 * @returns {Promise<object>} The updated DoctorProfile document
 */
export const verifyDoctorProfile = async (profileId) => {
  const profile = await DoctorProfile.findById(profileId);
  if (!profile) {
    throw new AppError('Doctor profile not found', 404);
  }

  profile.verificationStatus = DOCTOR_STATUS.VERIFIED;
  profile.isAvailable = true; // Ensure they are available to appear in patient discovery listings
  profile.rejectionReason = null; // Clear any old rejection comments

  await profile.save();
  return profile.populate('user', 'name email profileImage phone');
};

/**
 * Rejects a doctor's professional profile with actionable feedback.
 *
 * @param {string} profileId - Database ID of the DoctorProfile
 * @param {string} reason - Detailed rejection message explaining what details need fixing
 * @returns {Promise<object>} The updated DoctorProfile document
 */
export const rejectDoctorProfile = async (profileId, reason) => {
  if (!reason || typeof reason !== 'string' || reason.trim().length < 15) {
    throw new AppError('Rejection reason must be at least 15 characters long.', 400);
  }

  const profile = await DoctorProfile.findById(profileId);
  if (!profile) {
    throw new AppError('Doctor profile not found', 404);
  }

  profile.verificationStatus = DOCTOR_STATUS.REJECTED;
  profile.isAvailable = false; // Revoke discovery availability on rejection
  profile.rejectionReason = reason.trim();

  await profile.save();
  return profile.populate('user', 'name email profileImage phone');
};
