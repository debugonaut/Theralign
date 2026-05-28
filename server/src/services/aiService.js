import { getOpenAIClient } from '../config/openai.js';
import logger from '../utils/logger.js';

const AI_TIMEOUT_MS = 8000; // 8 second timeout before giving up
const MODEL = 'gpt-4o-mini';

// ─── Core helper ──────────────────────────────────────────────

const callAI = async (messages, options = {}) => {
  const client = getOpenAIClient();

  if (!client) {
    logger.warn('AI service unavailable — OpenAI client not initialized');
    return null;
  }

  try {
    const completion = await Promise.race([
      client.chat.completions.create({
        model: MODEL,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 300,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI request timed out')), AI_TIMEOUT_MS)
      )
    ]);

    return completion.choices[0]?.message?.content?.trim() || null;

  } catch (err) {
    logger.error(`AI service error: ${err.message}`);
    return null; // Always return null on failure — never throw
  }
};

/**
 * Interprets a patient's symptoms free-text to suggest a relevant specialization.
 * 
 * @param {string} symptomsText 
 * @returns {object|null} Structured suggestion or null
 */
export const interpretSymptoms = async (symptomsText) => {
  // Input sanitization — never send raw user input without validation
  if (!symptomsText || typeof symptomsText !== 'string') return null;
  const sanitized = symptomsText.trim().slice(0, 500); // Hard cap at 500 chars

  const messages = [
    {
      role: 'system',
      content: `You are a physiotherapy triage assistant for a healthcare platform 
called PhysioConnect. Your ONLY job is to analyze symptoms described by patients 
and suggest the most relevant physiotherapy specialization to help them find 
the right doctor.

You MUST respond in valid JSON only. No preamble, no explanation, 
no markdown, no backticks. Just raw JSON.

Response format:
{
  "suggestedSpecialization": "<one of the exact specialization strings below>",
  "confidence": "<high | medium | low>",
  "briefExplanation": "<1-2 sentences explaining why this specialization fits>",
  "disclaimer": "This suggestion is informational only and not a medical diagnosis. Please consult a qualified physiotherapist."
}

Valid specialization values (use EXACTLY as written):
- Orthopedic Physiotherapy
- Sports Physiotherapy
- Neurological Physiotherapy
- Pediatric Physiotherapy
- Geriatric Physiotherapy
- Cardiopulmonary Physiotherapy
- Postural & Spinal Rehabilitation
- Post-Surgical Rehabilitation
- Women's Health Physiotherapy
- General Physiotherapy

If symptoms are unclear, unrelated to physiotherapy, or potentially serious, 
use "General Physiotherapy" as the specialization and set confidence to "low".
Never suggest emergency care or diagnose medical conditions.`
    },
    {
      role: 'user',
      content: `Patient symptoms: "${sanitized}"`
    }
  ];

  const rawResponse = await callAI(messages, {
    temperature: 0.2, // Very low — we need consistent JSON structure
    maxTokens: 200
  });

  if (!rawResponse) return null;

  try {
    // Strip possible markdown code blocks if the model ignored system prompts and returned them
    let cleanJson = rawResponse;
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.slice(7);
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.slice(3);
    }
    if (cleanJson.endsWith('```')) {
      cleanJson = cleanJson.slice(0, -3);
    }
    cleanJson = cleanJson.trim();

    const parsed = JSON.parse(cleanJson);

    // Validate the response has required fields
    const validSpecializations = [
      'Orthopedic Physiotherapy', 'Sports Physiotherapy',
      'Neurological Physiotherapy', 'Pediatric Physiotherapy',
      'Geriatric Physiotherapy', 'Cardiopulmonary Physiotherapy',
      'Postural & Spinal Rehabilitation', 'Post-Surgical Rehabilitation',
      "Women's Health Physiotherapy", 'General Physiotherapy'
    ];

    if (!validSpecializations.includes(parsed.suggestedSpecialization)) {
      logger.warn(`AI returned invalid specialization: ${parsed.suggestedSpecialization}`);
      parsed.suggestedSpecialization = 'General Physiotherapy';
    }

    return {
      suggestedSpecialization: parsed.suggestedSpecialization,
      confidence: parsed.confidence || 'medium',
      briefExplanation: parsed.briefExplanation || '',
      disclaimer: 'This suggestion is informational only and not a medical diagnosis. Please consult a qualified physiotherapist.'
      // Always override disclaimer — never trust the model to write it correctly
    };

  } catch (parseErr) {
    logger.error(`AI response JSON parse failed: ${parseErr.message}`);
    logger.error(`Raw AI response: ${rawResponse}`);
    return null;
  }
};

/**
 * Generates a warm, professional, trust-building bio summary for a doctor's profile.
 * 
 * @param {object} doctorData 
 * @returns {string|null} Summary text or null
 */
export const generateDoctorSummary = async (doctorData) => {
  const {
    name, specialization, experience,
    bio, qualifications, clinicName, languages
  } = doctorData;

  // Don't call AI if there's not enough content to summarize
  if (!bio || bio.trim().length < 30) return null;

  const messages = [
    {
      role: 'system',
      content: `You are a professional copywriter for a healthcare platform. 
Write concise, trust-building professional summaries for physiotherapist profiles.

Rules:
- Maximum 2 sentences
- Maximum 60 words total
- Third person voice (e.g., "Dr. Sharma specializes in...")
- Highlight specialization, experience, and key strength
- Professional and warm tone — not clinical or robotic
- Do NOT fabricate certifications or claims not present in the input
- Do NOT use phrases like "passionate about" or "dedicated to" — these are clichés
- Respond with ONLY the summary text — no quotes, no preamble`
    },
    {
      role: 'user',
      content: `Generate a profile summary for:
Name: Dr. ${name}
Specialization: ${specialization}
Experience: ${experience} years
Qualifications: ${qualifications?.join(', ') || 'Not specified'}
Languages: ${languages?.join(', ') || 'English'}
Clinic: ${clinicName}
Their own bio: "${bio}"`
    }
  ];

  const summary = await callAI(messages, {
    temperature: 0.5, // Slightly higher — some stylistic variation is fine
    maxTokens: 100
  });

  return summary; // May be null if AI fails — caller handles gracefully
};

/**
 * Sequential batch summary generator with standard delays.
 * 
 * @param {Array} doctors 
 * @returns {Array} List of results
 */
export const batchGenerateSummaries = async (doctors) => {
  const results = [];

  for (const doctor of doctors) {
    // Sequential, not parallel — avoids rate limit bursts
    const summary = await generateDoctorSummary({
      name: doctor.user?.name,
      specialization: doctor.specialization,
      experience: doctor.experience,
      bio: doctor.bio,
      qualifications: doctor.qualifications,
      clinicName: doctor.clinicName,
      languages: doctor.languages
    });

    results.push({
      doctorId: doctor._id,
      summary,
      success: !!summary
    });

    // 300ms delay between calls to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  return results;
};
