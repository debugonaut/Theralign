import { Router } from 'express';
import {
  getPendingDoctors,
  verifyDoctor,
  rejectDoctor,
  suspendDoctor,
  reconsiderDoctor,
  getAllDoctors,
  getAllUsersAdmin,
  toggleUserStatus,
} from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  verifyDoctorValidation,
  rejectDoctorValidation,
  suspendDoctorValidation,
  reconsiderDoctorValidation,
  getAllDoctorsValidation,
  getAllUsersAdminValidation,
  toggleUserStatusValidation,
} from '../validations/admin.validation.js';

const router = Router();

// Apply auth and admin checks globally to all routes in this file
router.use(requireAuth);
router.use(requireRole('admin'));

// ─── Doctor Verification Routes ───────────────────────────────────────────────
/** GET /api/admin/doctors/pending — Fetch all doctor profiles awaiting verification */
router.get('/doctors/pending', getPendingDoctors);

/** GET /api/admin/doctors/all — Fetch all doctors with optional status filter */
router.get('/doctors/all', getAllDoctorsValidation, validate, getAllDoctors);

/** PATCH /api/admin/doctors/:profileId/verify — Approve doctor profile */
router.patch('/doctors/:profileId/verify', verifyDoctorValidation, validate, verifyDoctor);

/** PATCH /api/admin/doctors/:profileId/reject — Reject doctor profile with feedback */
router.patch('/doctors/:profileId/reject', rejectDoctorValidation, validate, rejectDoctor);

/** PATCH /api/admin/doctors/:profileId/suspend — Suspend a verified doctor */
router.patch('/doctors/:profileId/suspend', suspendDoctorValidation, validate, suspendDoctor);

/** PATCH /api/admin/doctors/:profileId/reconsider — Move rejected doctor back to pending */
router.patch('/doctors/:profileId/reconsider', reconsiderDoctorValidation, validate, reconsiderDoctor);

// ─── User Management Routes ───────────────────────────────────────────────────
/** GET /api/admin/users — Get all users with filters and pagination */
router.get('/users', getAllUsersAdminValidation, validate, getAllUsersAdmin);

/** PATCH /api/admin/users/:id/status — Toggle user isActive */
router.patch('/users/:id/status', toggleUserStatusValidation, validate, toggleUserStatus);

export default router;
