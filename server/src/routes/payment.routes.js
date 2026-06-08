import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  createOrder,
  verifyPayment,
  getMyPayments,
  getAllPaymentsAdmin,
  requestRefund,
  getRefundRequestsAdmin,
  resolveRefund,
} from '../controllers/payment.controller.js';
import {
  createOrderValidation,
  verifyPaymentValidation
} from '../validations/payment.validation.js';

const router = express.Router();

// Define payment routes
router.get('/admin/all', requireAuth, requireRole('admin'), getAllPaymentsAdmin);
router.get('/admin/refunds', requireAuth, requireRole('admin'), getRefundRequestsAdmin);
router.patch('/admin/:paymentId/refund', requireAuth, requireRole('admin'), resolveRefund);
router.post('/create-order', requireAuth, requireRole('patient'), createOrderValidation, validate, createOrder);
router.post('/verify', requireAuth, requireRole('patient'), verifyPaymentValidation, validate, verifyPayment);
router.get('/mine', requireAuth, requireRole('patient'), getMyPayments);
router.post('/:paymentId/request-refund', requireAuth, requireRole('patient'), requestRefund);

export default router;
