import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  interpretSymptomsController,
  getDoctorAISummary,
  batchGenerateDoctorSummaries
} from '../controllers/ai.controller.js';
import {
  interpretSymptomsValidation,
  getDoctorAISummaryValidation
} from '../validations/ai.validation.js';

const router = express.Router();

// Public routes - no authentication required for discovery
router.post('/interpret-symptoms', interpretSymptomsValidation, validate, interpretSymptomsController);
router.get('/doctor-summary/:doctorId', getDoctorAISummaryValidation, validate, getDoctorAISummary);

// Admin-only routes
router.post(
  '/admin/batch-summaries',
  requireAuth,
  requireRole('admin'),
  batchGenerateDoctorSummaries
);

export default router;
