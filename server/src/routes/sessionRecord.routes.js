import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  createSessionRecordValidation,
  updateSessionRecordValidation,
} from '../validations/sessionRecord.validation.js';
import * as sessionRecordController from '../controllers/sessionRecord.controller.js';

const router = Router();

// CRITICAL ROUTE ORDER:
// Static paths (/doctor/history, /patient/timeline) MUST be defined BEFORE
// the dynamic path (/:appointmentId). Express matches top-to-bottom.
// If /:appointmentId is first, Express treats 'doctor' and 'patient' as
// MongoDB ObjectIds and throws a CastError on 'doctor' and 'patient' strings.

// Doctor history — static path first
router.get(
  '/doctor/history',
  requireAuth,
  requireRole('doctor'),
  sessionRecordController.getDoctorHistory
);

// Patient timeline — static path first
router.get(
  '/patient/timeline',
  requireAuth,
  requireRole('patient'),
  sessionRecordController.getPatientTimeline
);

// Archive — static path with suffix must also precede bare /:appointmentId
// to prevent Express matching /:appointmentId/archive as id='<id>/archive'
// Note: this is fine because /archive is a distinct segment, but explicit ordering is safer.

// Create session record — doctor only
router.post(
  '/:appointmentId',
  requireAuth,
  requireRole('doctor'),
  createSessionRecordValidation,
  validate,
  sessionRecordController.createSessionRecord
);

// Get session record — patient, doctor, and admin
router.get(
  '/:appointmentId',
  requireAuth,
  requireRole('doctor', 'patient', 'admin'),
  sessionRecordController.getSessionRecord
);

// Update session record — doctor only, within 24h (enforced in service)
router.put(
  '/:appointmentId',
  requireAuth,
  requireRole('doctor'),
  updateSessionRecordValidation,
  validate,
  sessionRecordController.updateSessionRecord
);

// Archive session record — admin only
router.patch(
  '/:appointmentId/archive',
  requireAuth,
  requireRole('admin'),
  sessionRecordController.archiveSessionRecord
);

export default router;
