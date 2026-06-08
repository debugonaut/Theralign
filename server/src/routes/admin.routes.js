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
  resetDemoFlow,
  getDoctorDetailAdmin,
} from '../controllers/admin.controller.js';
import {
  getPendingRefunds,
  approveRefund,
  rejectRefund,
  getRefundStats,
} from '../controllers/refund.controller.js';
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
  getDoctorDetailAdminValidation,
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

/** GET /api/admin/doctors/:profileId — Fetch detailed doctor profile for admin */
router.get('/doctors/:profileId', getDoctorDetailAdminValidation, validate, getDoctorDetailAdmin);

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

/** POST /api/admin/reset-demo — Reset the demo doctor flow (Admin Only) */
router.post('/reset-demo', resetDemoFlow);

// ─── Refund Management Routes ───────────────────────────────────────────────
/** GET /api/admin/refunds/stats — Get refund statistics */
router.get('/refunds/stats', getRefundStats);

/** GET /api/admin/refunds — Get pending refund requests with pagination */
router.get('/refunds', getPendingRefunds);

/** PATCH /api/admin/refunds/:paymentId/approve — Approve pending refund */
router.patch('/refunds/:paymentId/approve', approveRefund);

/** PATCH /api/admin/refunds/:paymentId/reject — Reject pending refund */
router.patch('/refunds/:paymentId/reject', rejectRefund);

export default router;
