import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import AppError from '../utils/AppError.js';
import * as adminService from '../services/admin.service.js';
import User from '../models/User.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';

/**
 * GET /api/admin/doctors/pending
 * Retrieve all pending doctor verification requests.
 */
export const getPendingDoctors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const profiles = await adminService.getPendingDoctorProfiles();
  return successResponse(res, 200, 'Pending doctor profiles retrieved', {
    profiles,
    total: profiles.length,
  });
});

/**
 * PATCH /api/admin/doctors/:profileId/verify
 * Approve a doctor's onboarding application.
 */
export const verifyDoctor = asyncHandler(async (req, res) => {
  const { profileId } = req.params;
  const profile = await adminService.verifyDoctorProfile(profileId);
  return successResponse(res, 200, 'Doctor profile approved and verified successfully', { profile });
});

/**
 * PATCH /api/admin/doctors/:profileId/reject
 * Reject a doctor's onboarding application with feedback.
 */
export const rejectDoctor = asyncHandler(async (req, res) => {
  const { profileId } = req.params;
  const { rejectionReason } = req.body;
  const profile = await adminService.rejectDoctorProfile(profileId, rejectionReason);
  return successResponse(res, 200, 'Doctor profile application rejected successfully', { profile });
});

/**
 * PATCH /api/admin/doctors/:profileId/suspend
 * Suspend a verified doctor — removes from public listings.
 */
export const suspendDoctor = asyncHandler(async (req, res) => {
  const { profileId } = req.params;
  const { reason } = req.body;

  if (!reason || reason.trim().length < 10) {
    throw new AppError('Suspension reason must be at least 10 characters', 400);
  }

  const profile = await DoctorProfile.findById(profileId);
  if (!profile) throw new AppError('Doctor not found', 404);

  if (profile.verificationStatus !== 'verified') {
    throw new AppError('Only verified doctors can be suspended', 400);
  }

  profile.verificationStatus = 'pending';
  profile.isAvailable = false;
  profile.verificationNote = `Suspended: ${reason.trim()}`;
  await profile.save();

  await profile.populate('user', 'name email profileImage phone');
  return successResponse(res, 200, 'Doctor suspended successfully', { profile });
});

/**
 * PATCH /api/admin/doctors/:profileId/reconsider
 * Reset a rejected doctor back to pending (re-enters verification queue).
 */
export const reconsiderDoctor = asyncHandler(async (req, res) => {
  const { profileId } = req.params;

  const profile = await DoctorProfile.findById(profileId);
  if (!profile) throw new AppError('Doctor not found', 404);

  profile.verificationStatus = 'pending';
  profile.rejectionReason = null;
  profile.verificationNote = null;
  await profile.save();

  await profile.populate('user', 'name email profileImage phone');
  return successResponse(res, 200, 'Doctor reconsidered — moved to pending queue', { profile });
});

/**
 * GET /api/admin/doctors/all
 * Get all doctors with filters and pagination.
 */
export const getAllDoctors = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;

  const query = {};
  if (status) query.verificationStatus = status;

  let profiles = await DoctorProfile.find(query)
    .populate('user', 'name email profileImage phone')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  // Filter by search after populate
  if (search) {
    const lower = search.toLowerCase();
    profiles = profiles.filter(
      (p) =>
        p.user?.name?.toLowerCase().includes(lower) ||
        p.clinicName?.toLowerCase().includes(lower) ||
        (Array.isArray(p.specialization) &&
          p.specialization.some((s) => s.toLowerCase().includes(lower)))
    );
  }

  const total = await DoctorProfile.countDocuments(query);

  return successResponse(res, 200, 'Doctors retrieved', {
    profiles,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  });
});

/**
 * GET /api/admin/users
 * Get all users with filters, search, and pagination.
 */
export const getAllUsersAdmin = asyncHandler(async (req, res) => {
  const { role, isActive, page = 1, limit = 20, search } = req.query;

  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return successResponse(res, 200, 'Users retrieved', {
    users,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  });
});

/**
 * PATCH /api/admin/users/:id/status
 * Toggle isActive status on a user account.
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'admin') throw new AppError('Cannot deactivate admin accounts', 403);

  user.isActive = !user.isActive;
  await user.save();

  return successResponse(
    res,
    200,
    `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    { user: { id: user._id, name: user.name, isActive: user.isActive } }
  );
});
