import { Router } from 'express';
import { onboard, getMyProfile } from '../controllers/doctor.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { uploadOnboardingDocs } from '../middleware/upload.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { onboardValidation } from '../validations/doctor.validation.js';

const router = Router();

/**
 * PUT /api/doctors/profile/onboard
 * Protected (Doctor) — Submit professional details and upload verification documents.
 */
router.put(
  '/profile/onboard',
  requireAuth,
  requireRole('doctor'),
  uploadOnboardingDocs,
  onboardValidation,
  validate,
  onboard
);

/**
 * GET /api/doctors/profile/me
 * Protected (Doctor) — Retrieve currently logged-in doctor's profile.
 */
router.get(
  '/profile/me',
  requireAuth,
  requireRole('doctor'),
  getMyProfile
);

export default router;
