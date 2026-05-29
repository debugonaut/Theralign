import { Router } from 'express';
import {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  cancelAppointment,
  completeAppointment,
  getAllAppointmentsAdmin,
  rescheduleAppointment,
} from '../controllers/appointment.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Order Matters: Named routes must be declared before any parameterized routes
router.post('/book', requireAuth, requireRole('patient'), bookAppointment);
router.get('/mine', requireAuth, requireRole('patient'), getMyAppointments);
router.get('/doctor/mine', requireAuth, requireRole('doctor'), getDoctorAppointments);
router.get('/admin/all', requireAuth, requireRole('admin'), getAllAppointmentsAdmin);

// Parameterized lifecycles
router.patch('/:id/cancel', requireAuth, cancelAppointment);
router.patch('/:id/complete', requireAuth, requireRole('doctor'), completeAppointment);
router.patch('/:id/reschedule', requireAuth, requireRole('patient'), rescheduleAppointment);

export default router;
