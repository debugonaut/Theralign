import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { aiRateLimit } from '../middleware/aiRateLimit.middleware.js';
import {
  interpretSymptomsController,
  getDoctorAISummary,
  batchGenerateDoctorSummaries,
  generateExercise,
  chatbotQueryController,
} from '../controllers/ai.controller.js';
import {
  interpretSymptomsValidation,
  getDoctorAISummaryValidation,
  generateExerciseValidation,
} from '../validations/ai.validation.js';

const router = express.Router();

// Groq-backed — authenticated only to prevent API key abuse / billing attacks
router.post(
  '/interpret-symptoms',
  requireAuth,
  requireRole('patient'),
  interpretSymptomsValidation,
  validate,
  interpretSymptomsController
);

// Cache-only public read — never triggers Groq generation (admin batch handles that)
router.get('/doctor-summary/:doctorId', getDoctorAISummaryValidation, validate, getDoctorAISummary);

// Admin-only routes
router.post(
  '/admin/batch-summaries',
  requireAuth,
  requireRole('admin'),
  batchGenerateDoctorSummaries
);

// Doctor-only: AI exercise generation (rate-limited 10 req/min per doctor)
router.post(
  '/generate-exercise',
  requireAuth,
  requireRole('doctor'),
  aiRateLimit,
  generateExerciseValidation,
  validate,
  generateExercise
);

// Public chatbot route (with optional dynamic auth inside controller)
router.post(
  '/chatbot',
  chatbotQueryController
);

export default router;
