import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import * as doctorService from '../services/doctor.service.js';

/**
 * PUT /api/doctors/profile/onboard
 * Submit doctor onboarding details and files.
 * Protect: requireAuth, requireRole('doctor')
 */
export const onboard = asyncHandler(async (req, res) => {
  const profile = await doctorService.onboardDoctor(req.user.id, req.body, req.files);
  return successResponse(res, 200, 'Onboarding profile submitted for review', { profile });
});

/**
 * GET /api/doctors/profile/me
 * Fetch the currently authenticated doctor's profile details.
 * Protect: requireAuth, requireRole('doctor')
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await doctorService.getDoctorProfileByUserId(req.user.id);
  return successResponse(res, 200, 'Doctor profile retrieved successfully', { profile });
});
