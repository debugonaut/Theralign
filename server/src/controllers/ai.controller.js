import { interpretSymptoms, batchGenerateSummaries } from '../services/aiService.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
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
