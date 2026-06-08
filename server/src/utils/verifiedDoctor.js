import DoctorProfile from '../models/DoctorProfile.model.js';
import AppError from '../utils/AppError.js';
import { DOCTOR_STATUS } from '../utils/constants.js';

/**
 * Ensures a doctor profile exists and is verified before public availability exposure.
 */
export const requireVerifiedDoctorProfile = async (doctorId) => {
  const profile = await DoctorProfile.findById(doctorId).select('verificationStatus isAvailable');
  if (!profile) {
    throw new AppError('Doctor not found.', 404);
  }
  return profile;
};
