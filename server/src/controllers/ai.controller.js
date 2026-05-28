import { interpretSymptoms, generateDoctorSummary, batchGenerateSummaries } from '../services/aiService.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import { successResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * POST /api/ai/interpret-symptoms
 * Free-text symptom analysis for specialization recommendations. Public access.
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
 * Retrieves or generates an AI summary for a doctor's profile. Public access.
 */
export const getDoctorAISummary = asyncHandler(async (req, res) => {
  const profile = await DoctorProfile.findById(req.params.doctorId)
    .populate('user', 'name');

  if (!profile) {
    throw new AppError('Doctor not found', 404);
  }

  // If summary already exists in DB — return it directly (no AI call)
  if (profile.aiSummary) {
    return successResponse(res, 200, 'Summary retrieved successfully', {
      aiSummary: profile.aiSummary,
      fromCache: true
    });
  }

  // Check if there is enough content to generate a summary
  if (!profile.bio || profile.bio.trim().length < 30) {
    return successResponse(res, 200, 'Profile bio is too short to summarize', {
      aiSummary: null,
      fromCache: false
    });
  }

  // Generate new summary
  const summary = await generateDoctorSummary({
    name: profile.user?.name,
    specialization: profile.specialization,
    experience: profile.experience,
    bio: profile.bio,
    qualifications: profile.qualifications,
    clinicName: profile.clinicName,
    languages: profile.languages
  });

  if (summary) {
    // Store in DB so next request is served from cache
    await DoctorProfile.findByIdAndUpdate(
      req.params.doctorId,
      { aiSummary: summary }
    );
  }

  return successResponse(res, 200, 'Summary generated successfully', {
    aiSummary: summary, // May be null if AI unavailable
    fromCache: false
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
