import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import AppError from '../utils/AppError.js';
import Waitlist from '../models/Waitlist.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';

/**
 * POST /api/waitlist/join/:doctorId
 * Patient joins a doctor's waitlist to receive alerts when slots become available.
 * Protect: requireAuth, requireRole('patient')
 */
export const joinWaitlist = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  // Verify the doctor profile exists
  const doctor = await DoctorProfile.findById(doctorId);
  if (!doctor) {
    throw new AppError('Doctor profile not found.', 404);
  }

  // Check if patient is already on the waitlist for this doctor
  const existing = await Waitlist.findOne({
    patient: req.user.id,
    doctor: doctorId,
  });

  if (existing) {
    if (!existing.notified) {
      throw new AppError('You are already on the waitlist for this doctor.', 400);
    }
    
    // If they were previously notified, reset their waitlist status to unnotified
    existing.notified = false;
    existing.notifiedAt = null;
    await existing.save();
    
    return successResponse(res, 200, 'Your waitlist subscription has been reactivated successfully.', {
      waitlist: existing,
    });
  }

  // Create new waitlist entry
  const waitlist = await Waitlist.create({
    patient: req.user.id,
    doctor: doctorId,
  });

  return successResponse(res, 201, "You've successfully joined the waitlist. We will notify you as soon as new slots open!", {
    waitlist,
  });
});

/**
 * DELETE /api/waitlist/leave/:doctorId
 * Patient opts-out and leaves a doctor's waitlist.
 * Protect: requireAuth, requireRole('patient')
 */
export const leaveWaitlist = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  const waitlist = await Waitlist.findOneAndDelete({
    patient: req.user.id,
    doctor: doctorId,
  });

  if (!waitlist) {
    throw new AppError('You are not currently subscribed to this waitlist.', 404);
  }

  return successResponse(res, 200, 'Removed from waitlist successfully.');
});

/**
 * GET /api/waitlist/status/:doctorId
 * Checks if the logged-in patient is active on a doctor's waitlist.
 * Protect: requireAuth
 */
export const checkWaitlistStatus = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  const entry = await Waitlist.findOne({
    patient: req.user.id,
    doctor: doctorId,
  });

  // Active only if they are subscribed and haven't been notified yet
  const onWaitlist = !!(entry && !entry.notified);

  return successResponse(res, 200, 'Waitlist status retrieved', {
    onWaitlist,
    entry,
  });
});

/**
 * GET /api/waitlist/mine
 * Retrieves all waitlist entries where the patient is subscribed.
 * Protect: requireAuth, requireRole('patient')
 */
export const getMyWaitlists = asyncHandler(async (req, res) => {
  const waitlists = await Waitlist.find({ patient: req.user.id })
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name profileImage specialization' },
    })
    .sort({ createdAt: -1 });

  return successResponse(res, 200, 'Your waitlisted doctors retrieved', waitlists);
});
