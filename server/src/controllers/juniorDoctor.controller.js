import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import * as juniorDoctorService from '../services/juniorDoctor.service.js';

/**
 * POST /api/junior/invite
 * Senior doctor generates/resends an invite.
 */
export const inviteJunior = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await juniorDoctorService.inviteJuniorDoctor(req.user.id, email);
  return successResponse(res, 200, 'Invitation processed successfully.', result);
});

/**
 * POST /api/junior/accept/:token
 * Public — accept invitation and register junior doctor account.
 */
export const acceptInvitation = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const result = await juniorDoctorService.acceptJuniorInvitation(token, req.body);
  return successResponse(res, 201, 'Junior doctor account created successfully.', result);
});

/**
 * GET /api/junior/team
 * Senior doctor retrieves active and pending team summary.
 */
export const getTeam = asyncHandler(async (req, res) => {
  const result = await juniorDoctorService.getJuniorDoctors(req.user.id);
  return successResponse(res, 200, 'Practice team retrieved successfully.', result);
});

/**
 * DELETE /api/junior/team/:juniorProfileId
 * Senior doctor removes junior from practice.
 */
export const removeJunior = asyncHandler(async (req, res) => {
  const { juniorProfileId } = req.params;
  const result = await juniorDoctorService.removeJuniorDoctor(req.user.id, juniorProfileId);
  return successResponse(res, 200, 'Junior doctor removed successfully.', result);
});

/**
 * PATCH /api/junior/settings
 * Senior doctor updates practice settings.
 */
export const updateSettings = asyncHandler(async (req, res) => {
  const result = await juniorDoctorService.updatePracticeSettings(req.user.id, req.body);
  return successResponse(res, 200, 'Practice settings updated successfully.', result);
});

/**
 * DELETE /api/junior/invite
 * Senior doctor cancels a pending invitation.
 */
export const cancelInvitation = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await juniorDoctorService.cancelJuniorInvitation(req.user.id, email);
  return successResponse(res, 200, 'Invitation cancelled successfully.', result);
});
