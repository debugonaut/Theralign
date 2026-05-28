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

const router = Router();

// ─── ORDER MATTERS: named/specific routes BEFORE parameterized routes ─────────

// Admin: all reviews (including hidden) — paginated
router.get('/admin/all', requireAuth, requireRole('admin'), getAllReviewsAdmin);

// Patient: reviews they have written
router.get('/mine', requireAuth, requireRole('patient'), getMyReviews);

// Public: visible reviews for a specific doctor (no auth required)
router.get('/doctor/:doctorId', getDoctorReviews);

// Patient: submit a new review
router.post('/', requireAuth, requireRole('patient'), submitReview);

// Admin: toggle review visibility (hide / unhide)
router.patch('/:id/visibility', requireAuth, requireRole('admin'), toggleReviewVisibility);

export default router;
