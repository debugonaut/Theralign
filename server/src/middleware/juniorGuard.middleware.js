import AppError from '../utils/AppError.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * seniorOnly — Blocks junior doctors from accessing senior-only routes.
 *
 * Must run AFTER requireAuth + requireRole('doctor').
 * Looks up the DoctorProfile for the authenticated user and checks doctorType.
 *
 * Junior doctors cannot:
 * - Modify their own availability (slots)
 * - Change their consultation fees
 * - Access their own earnings reports
 * - Submit onboarding (they join via invitation)
 *
 * Why DB lookup and not a JWT claim?
 * The JWT doesn't carry doctorType — adding it would require token invalidation
 * logic across all existing sessions when a doctor's type changes. The DB lookup
 * is the correct pragmatic choice at MVP scale.
 */
export const seniorOnly = asyncHandler(async (req, res, next) => {
  const profile = await DoctorProfile.findOne({ user: req.user.id }).select('doctorType').lean();
  if (!profile) throw new AppError('Doctor profile not found', 404);
  if (profile.doctorType === 'junior') {
    throw new AppError('Junior doctors do not have access to this feature', 403);
  }
  next();
});

// Attach doctorType and seniorDoctor to req for downstream use
// Apply this to all doctor routes so controllers can read req.doctorContext
export const attachDoctorContext = asyncHandler(async (req, res, next) => {
  const profile = await DoctorProfile.findOne({ user: req.user.id })
    .select('doctorType seniorDoctor juniorDoctors maxJuniorDoctors practiceName')
    .lean();
  req.doctorContext = profile || null;
  next();
});
