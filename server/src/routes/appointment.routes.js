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
import {
  cancelAppointmentPatient,
  cancelAppointmentDoctor,
} from '../controllers/refund.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  bookAppointmentValidation,
  cancelAppointmentValidation,
  completeAppointmentValidation,
  rescheduleAppointmentValidation,
} from '../validations/appointment.validation.js';

const router = Router();

// Order Matters: Named routes must be declared before any parameterized routes
router.post('/book', requireAuth, requireRole('patient'), bookAppointmentValidation, validate, bookAppointment);
router.get('/mine', requireAuth, requireRole('patient'), getMyAppointments);
router.get('/doctor/mine', requireAuth, requireRole('doctor'), getDoctorAppointments);
router.get('/admin/all', requireAuth, requireRole('admin'), getAllAppointmentsAdmin);

// Parameterized lifecycles
router.patch('/:id/cancel', requireAuth, cancelAppointmentValidation, validate, cancelAppointment);
router.patch('/:id/complete', requireAuth, requireRole('doctor'), completeAppointmentValidation, validate, completeAppointment);
router.patch('/:id/reschedule', requireAuth, requireRole('patient'), rescheduleAppointmentValidation, validate, rescheduleAppointment);

// Refund routes
router.post('/:appointmentId/cancel-patient', requireAuth, requireRole('patient'), cancelAppointmentPatient);
router.post('/:appointmentId/cancel-doctor', requireAuth, requireRole('doctor'), cancelAppointmentDoctor);

export default router;
