import PatientProfile from '../models/PatientProfile.model.js';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import { uploadToCloudinary } from '../services/upload.service.js';
import AppError from '../utils/AppError.js';

/**
 * GET /api/patients/profile/me
 * Fetch the currently authenticated patient's profile.
 * Protect: requireAuth, requireRole('patient')
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  let profile = await PatientProfile.findOne({ user: req.user.id }).populate('user', 'name phone profileImage email');
  
  // If no profile exists yet, we return a default structure for the frontend
  if (!profile) {
    const user = await User.findById(req.user.id).select('name phone profileImage email');
    profile = {
      user,
      medicalHistory: { conditions: [], medications: [], surgeries: [] },
      lifestyle: { occupation: '', activityLevel: '', smoking: null, alcohol: null },
      emergencyContacts: [],
      insurance: { provider: '', policyNumber: '' },
      completionPercentage: 0
    };
  } else {
    // Manually add completionPercentage as virtuals might not serialize perfectly in all mongoose setups
    // or we can rely on toJSON { virtuals: true } if configured.
    profile = profile.toJSON({ virtuals: true });
  }

  return successResponse(res, 200, 'Patient profile retrieved successfully', { profile });
});

/**
 * PUT /api/patients/profile/me
 * Update the patient's profile. Accepts partial updates for tabs.
 * Protect: requireAuth, requireRole('patient')
 */
export const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, phone, ...profileData } = req.body;
  
  // 1. Update User model fields if provided
  if (name || phone) {
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    await User.findByIdAndUpdate(req.user.id, { $set: updateFields }, { runValidators: true });
  }

  // 2. Update or Create PatientProfile using partial updates
  const $set = { user: req.user.id };
  const $unset = {};
  
  // Basic info fields
  if (profileData.dateOfBirth !== undefined) {
    if (profileData.dateOfBirth === '') $unset.dateOfBirth = 1;
    else $set.dateOfBirth = profileData.dateOfBirth;
  }
  if (profileData.gender !== undefined) {
    if (profileData.gender === '') $unset.gender = 1;
    else $set.gender = profileData.gender;
  }
  if (profileData.bloodGroup !== undefined) {
    if (profileData.bloodGroup === '') $unset.bloodGroup = 1;
    else $set.bloodGroup = profileData.bloodGroup;
  }
  if (profileData.height !== undefined) {
    if (profileData.height === '') $unset.height = 1;
    else $set.height = profileData.height;
  }
  if (profileData.weight !== undefined) {
    if (profileData.weight === '') $unset.weight = 1;
    else $set.weight = profileData.weight;
  }
  
  // Tab objects
  if (profileData.medicalHistory) $set.medicalHistory = profileData.medicalHistory;
  if (profileData.lifestyle) $set.lifestyle = profileData.lifestyle;
  if (profileData.emergencyContacts) $set.emergencyContacts = profileData.emergencyContacts;
  if (profileData.insurance) $set.insurance = profileData.insurance;

  const updateDoc = { $set };
  if (Object.keys($unset).length > 0) {
    updateDoc.$unset = $unset;
  }

  const profile = await PatientProfile.findOneAndUpdate(
    { user: req.user.id },
    updateDoc,
    { new: true, upsert: true, runValidators: true }
  ).populate('user', 'name phone profileImage email');

  return successResponse(res, 200, 'Profile updated successfully', { 
    profile: profile.toJSON({ virtuals: true }) 
  });
});

/**
 * POST /api/patients/profile/avatar
 * Upload profile picture to Cloudinary.
 * Protect: requireAuth, requireRole('patient')
 */
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No image file provided', 400);
  }

  // Upload to Cloudinary
  const imageUrl = await uploadToCloudinary(req.file.path, 'patient_avatars');
  
  // Update User model
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { profileImage: imageUrl },
    { new: true, runValidators: true }
  ).select('name phone profileImage email');

  return successResponse(res, 200, 'Avatar uploaded successfully', { user });
});
