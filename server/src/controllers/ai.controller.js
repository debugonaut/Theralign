import { interpretSymptoms, batchGenerateSummaries, generateExerciseFromPrompt, handleChatbotMessage } from '../services/aiService.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import { successResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { DOCTOR_STATUS } from '../utils/constants.js';

/**
 * POST /api/ai/interpret-symptoms
 * Free-text symptom analysis for specialization recommendations. Requires auth.
 */
export const interpretSymptomsController = asyncHandler(async (req, res) => {
  const { symptoms } = req.body;

  // Input validation
  if (!symptoms || typeof symptoms !== 'string') {
    throw new AppError('Symptoms text is required', 400);
  }

  const trimmed = symptoms.trim();

  if (trimmed.length < 5) {
    throw new AppError('Please describe your symptoms in more detail (minimum 5 characters)', 400);
  }

  if (trimmed.length > 500) {
    throw new AppError('Symptom description is too long (maximum 500 characters)', 400);
  }

  // Call AI service — returns null if unavailable
  const result = await interpretSymptoms(trimmed);

  if (!result) {
    // AI unavailable — return a graceful fallback response
    // Frontend will handle this by showing standard search instead
    return successResponse(res, 200, 'AI service temporarily unavailable', {
      aiAvailable: false,
      suggestedSpecialization: null,
      fallbackMessage: 'AI recommendations are temporarily unavailable. Please use our search filters to find a physiotherapist.'
    });
  }

  return successResponse(res, 200, 'Symptoms interpreted successfully', {
    aiAvailable: true,
    ...result
  });
});

/**
 * GET /api/ai/doctor-summary/:doctorId
 * Cache-only read for verified doctors — never calls Groq (generation is admin-only).
 */
export const getDoctorAISummary = asyncHandler(async (req, res) => {
  const profile = await DoctorProfile.findOne({
    _id: req.params.doctorId,
    verificationStatus: DOCTOR_STATUS.VERIFIED,
  }).select('aiSummary');

  if (!profile) {
    throw new AppError('Doctor not found', 404);
  }

  return successResponse(res, 200, 'Summary retrieved successfully', {
    aiSummary: profile.aiSummary || null,
    fromCache: Boolean(profile.aiSummary),
  });
});

/**
 * POST /api/ai/admin/batch-summaries
 * Triggers batch summary generations for verified doctors who lack one. Admin access only.
 */
export const batchGenerateDoctorSummaries = asyncHandler(async (req, res) => {
  // Fetch verified doctors that have bio but no summary yet
  const doctors = await DoctorProfile.find({
    verificationStatus: 'verified',
    bio: { $exists: true, $ne: '' },
    $or: [
      { aiSummary: null },
      { aiSummary: { $exists: false } }
    ]
  })
  .populate('user', 'name')
  .limit(50); // Process max 50 at once

  if (doctors.length === 0) {
    return successResponse(res, 200, 'No doctors need summaries generated', {
      processed: 0,
      successful: 0,
      failed: 0
    });
  }

  const results = await batchGenerateSummaries(doctors);

  // Update DB for successful generations
  for (const result of results) {
    if (result.success && result.summary) {
      await DoctorProfile.findByIdAndUpdate(
        result.doctorId,
        { aiSummary: result.summary }
      );
    }
  }

  const successCount = results.filter(r => r.success).length;

  return successResponse(res, 200, 'Batch summary generation complete', {
    processed: doctors.length,
    successful: successCount,
    failed: doctors.length - successCount
  });
});

/**
 * POST /api/ai/generate-exercise
 * Generates a structured clinical exercise prescription from a natural language prompt.
 * Doctor-only. Rate-limited to 10 requests per minute per doctor.
 */
export const generateExercise = asyncHandler(async (req, res) => {
  const { prompt, targetMuscleGroups = [], patientCondition = null, difficultyLevel = 'intermediate' } = req.body;

  const exercise = await generateExerciseFromPrompt({
    prompt,
    targetMuscleGroups,
    patientCondition,
    difficultyLevel,
  });

  // Validate required fields before returning
  const required = ['name', 'category', 'sets', 'reps', 'stepByStepInstructions', 'youtubeSearchQuery'];
  for (const field of required) {
    if (exercise[field] === undefined || exercise[field] === null) {
      throw new AppError(`AI response was incomplete (missing ${field}). Please try again.`, 502);
    }
  }

  return successResponse(res, 200, 'Exercise generated successfully', exercise);
});

/**
 * POST /api/ai/chatbot
 * Chatbot query resolver. Public endpoint with optional authentication.
 */
export const chatbotQueryController = asyncHandler(async (req, res) => {
  const { message, chatHistory = [] } = req.body;

  if (!message || typeof message !== 'string') {
    throw new AppError('Message text is required', 400);
  }

  if (message.trim().length > 500) {
    throw new AppError('Message exceeds maximum limit of 500 characters', 400);
  }

  // Determine user identity and role (dynamic auth)
  let role = 'guest';
  let user = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const foundUser = await User.findById(decoded.id);
      if (foundUser && foundUser.isActive) {
        role = foundUser.role;
        user = {
          id: foundUser._id,
          role: foundUser.role,
          name: foundUser.name,
          email: foundUser.email,
        };
      }
    } catch (err) {
      // Ignored: expired or invalid token defaults to 'guest' role gracefully
    }
  }

  const result = await handleChatbotMessage({
    message,
    role,
    chatHistory,
    user,
  });

  return successResponse(res, 200, 'Chatbot query processed', result);
});
