import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import AppError from '../utils/AppError.js';
import * as adminService from '../services/admin.service.js';
import User from '../models/User.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import { createNotification } from '../services/notificationService.js';

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

  // Trigger in-app notification to the doctor
  if (profile) {
    createNotification({
      recipientId: profile.user,
      type: 'verification_approved',
      title: 'Profile Verified ✓',
      message: 'Your profile has been verified. You can now receive bookings.',
      link: '/doctor/dashboard',
    });
  }

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

  // Trigger in-app notification to the doctor
  if (profile) {
    createNotification({
      recipientId: profile.user,
      type: 'verification_rejected',
      title: 'Verification Update',
      message: 'Your verification requires additional review. Check your profile.',
      link: '/doctor/dashboard',
    });
  }

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
    const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { email: { $regex: escapedSearch, $options: 'i' } },
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

/**
 * POST /api/admin/reset-demo
 * Resets the demo doctor and patient state, cleaning up demo appointments,
 * restoring slot availability, and wiping notifications.
 */
import Notification from '../models/Notification.model.js';
import Appointment from '../models/Appointment.model.js';
import AvailabilitySlot from '../models/AvailabilitySlot.model.js';
import Payment from '../models/Payment.model.js';
import Review from '../models/Review.model.js';

export const resetDemoFlow = asyncHandler(async (req, res) => {
  const demoDoctorEmail = 'doctor@demo.com';
  const demoPatientEmail = 'patient@demo.com';

  const doctorUser = await User.findOne({ email: demoDoctorEmail });
  if (!doctorUser) {
    throw new AppError('Demo doctor user not found in the system', 404);
  }

  const patientUser = await User.findOne({ email: demoPatientEmail });
  if (!patientUser) {
    throw new AppError('Demo patient user not found in the system', 404);
  }

  const profile = await DoctorProfile.findOne({ user: doctorUser._id });
  if (!profile) {
    throw new AppError('Demo doctor profile not found', 404);
  }

  // 1. Reset Doctor Profile status and ratings back to seed standards
  profile.verificationStatus = 'pending';
  profile.rejectionReason = null;
  profile.verificationNote = null;
  profile.averageRating = 4.8;
  profile.totalReviews = 23;
  await profile.save();

  // 2. Find and clean up demo appointments between patient and doctor
  // Exclude seeded historical/review appointments which keep stats and graphs populated.
  // Those start with "[Review Seed]" or "[Historical]".
  const appointmentsToClean = await Appointment.find({
    patient: patientUser._id,
    doctor: profile._id,
    patientNotes: { $not: /^\[(Review Seed|Historical)\]/ }
  });

  if (appointmentsToClean.length > 0) {
    const appointmentIds = appointmentsToClean.map(a => a._id);
    const slotIds = appointmentsToClean.filter(a => a.slot).map(a => a.slot);

    // Free up availability slots
    if (slotIds.length > 0) {
      await AvailabilitySlot.updateMany(
        { _id: { $in: slotIds } },
        { $set: { isBooked: false } }
      );
    }

    // Delete payments associated with these appointments
    await Payment.deleteMany({ appointment: { $in: appointmentIds } });

    // Delete reviews associated with these appointments
    await Review.deleteMany({ appointment: { $in: appointmentIds } });

    // Delete the appointments themselves
    await Appointment.deleteMany({ _id: { $in: appointmentIds } });
  }

  // 3. Wipe all notifications for both the demo doctor and patient
  await Notification.deleteMany({
    recipient: { $in: [doctorUser._id, patientUser._id] }
  });

  return successResponse(res, 200, 'Demo flow has been successfully reset', { profile });
});

/**
 * GET /api/admin/doctors/:profileId
 * Fetch full profile details (including documents) for admin verification.
 */
export const getDoctorDetailAdmin = asyncHandler(async (req, res) => {
  const { profileId } = req.params;
  const profile = await DoctorProfile.findById(profileId)
    .populate('user', 'name email profileImage phone role isActive');

  if (!profile) {
    throw new AppError('Doctor profile not found', 404);
  }

  // Fetch all reviews for this doctor profile (include both visible and hidden)
  const reviews = await Review.find({ doctor: profile._id })
    .populate('patient', 'name')
    .sort({ createdAt: -1 });

  return successResponse(res, 200, 'Doctor profile retrieved successfully for admin', {
    profile,
    reviews,
  });
});
