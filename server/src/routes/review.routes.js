import { Router } from 'express';
import {
  submitReview,
  getDoctorReviews,
  getMyReviews,
  getAllReviewsAdmin,
  toggleReviewVisibility,
} from '../controllers/review.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  submitReviewValidation,
  getDoctorReviewsValidation,
  getAllReviewsAdminValidation,
  toggleReviewVisibilityValidation,
} from '../validations/review.validation.js';

const router = Router();

// ─── ORDER MATTERS: named/specific routes BEFORE parameterized routes ─────────

// Admin: all reviews (including hidden) — paginated
router.get('/admin/all', requireAuth, requireRole('admin'), getAllReviewsAdminValidation, validate, getAllReviewsAdmin);

// Patient: reviews they have written
router.get('/mine', requireAuth, requireRole('patient'), getMyReviews);

// Public: visible reviews for a specific doctor (no auth required)
router.get('/doctor/:doctorId', getDoctorReviewsValidation, validate, getDoctorReviews);

// Patient: submit a new review
router.post('/', requireAuth, requireRole('patient'), submitReviewValidation, validate, submitReview);

// Admin: toggle review visibility (hide / unhide)
router.patch('/:id/visibility', requireAuth, requireRole('admin'), toggleReviewVisibilityValidation, validate, toggleReviewVisibility);

export default router;
