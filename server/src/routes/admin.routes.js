import { Router } from 'express';
import { getPendingDoctors, verifyDoctor, rejectDoctor } from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Apply auth and admin checks globally to all routes in this file
router.use(requireAuth);
router.use(requireRole('admin'));

/**
 * GET /api/admin/doctors/pending
 * Protected (Admin) — Fetch all doctor profiles awaiting verification review.
 */
router.get('/doctors/pending', getPendingDoctors);

/**
 * PATCH /api/admin/doctors/:profileId/verify
 * Protected (Admin) — Approve doctor profile verification.
 */
router.patch('/doctors/:profileId/verify', verifyDoctor);

/**
 * PATCH /api/admin/doctors/:profileId/reject
 * Protected (Admin) — Reject doctor profile verification with explanation.
 */
router.patch('/doctors/:profileId/reject', rejectDoctor);

export default router;
