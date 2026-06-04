import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import DoctorProfile from '../models/DoctorProfile.model.js';

/**
 * GET /api/search/suggestions
 * Public real-time autocomplete suggester. Matches search queries to verified
 * doctors' names, specializations, and clinic cities in parallel.
 */
export const getSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return successResponse(res, 200, 'Suggestions fetched successfully', { suggestions: [] });
  }

  const query = q.trim().slice(0, 50); // Prevent regex performance exploitation
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedQuery, 'i'); // Case-insensitive matching

  // Run Mongoose distinct & populate queries concurrently
  const [nameMatches, specializationMatches, cityMatches] = await Promise.all([
    // 1. Match doctor user names
    DoctorProfile.find({ verificationStatus: 'verified' })
      .populate({ 
        path: 'user', 
        match: { name: regex }, 
        select: 'name' 
      })
      .limit(10)
      .then(docs => 
        docs
          .filter(d => d.user) // Remove profiles where the populate match returned null
          .map(d => ({
            type: 'doctor',
            label: d.user.name,
            value: d.user.name,
            subLabel: Array.isArray(d.specialization) ? d.specialization.join(', ') : d.specialization,
            doctorId: d._id,
          }))
          .slice(0, 3) // Return top 3 matching doctors
      ),

    // 2. Match specializations distinct list
    DoctorProfile.distinct('specialization', {
      verificationStatus: 'verified',
      specialization: regex,
    }).then(specs => 
      specs
        .slice(0, 3)
        .map(s => ({
          type: 'specialization',
          label: s,
          value: s,
          subLabel: 'Specialization',
        }))
    ),

    // 3. Match distinct cities
    DoctorProfile.distinct('city', {
      verificationStatus: 'verified',
      city: regex,
    }).then(cities => 
      cities
        .filter(Boolean)
        .slice(0, 3)
        .map(c => ({
          type: 'city',
          label: c,
          value: c,
          subLabel: 'Location (City)',
        }))
    ),
  ]);

  const suggestions = [...specializationMatches, ...nameMatches, ...cityMatches];

  return successResponse(res, 200, 'Suggestions retrieved successfully', { suggestions });
});
