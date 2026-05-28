import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import * as adminService from '../services/admin.service.js';

/**
 * GET /api/admin/doctors/pending
 * Retrieve all pending doctor verification requests.
 * Protect: requireAuth, requireRole('admin')
 */
export const getPendingDoctors = asyncHandler(async (req, res) => {
  const profiles = await adminService.getPendingDoctorProfiles();
  return successResponse(res, 200, 'Pending doctor profiles retrieved', { profiles });
});

/**
 * PATCH /api/admin/doctors/:profileId/verify
 * Approve a doctor's onboarding application.
 * Protect: requireAuth, requireRole('admin')
 */
export const verifyDoctor = asyncHandler(async (req, res) => {
  const { profileId } = req.params;
  const profile = await adminService.verifyDoctorProfile(profileId);
  return successResponse(res, 200, 'Doctor profile approved and verified successfully', { profile });
});

/**
 * PATCH /api/admin/doctors/:profileId/reject
 * Reject a doctor's onboarding application with feedback.
 * Protect: requireAuth, requireRole('admin')
 */
export const rejectDoctor = asyncHandler(async (req, res) => {
  const { profileId } = req.params;
  const { rejectionReason } = req.body;
  const profile = await adminService.rejectDoctorProfile(profileId, rejectionReason);
  return successResponse(res, 200, 'Doctor profile application rejected successfully', { profile });
});
