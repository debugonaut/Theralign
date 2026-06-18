import { getOpenAIClient } from '../config/openai.js';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

const AI_TIMEOUT_MS = 8000; // 8 second timeout before giving up
const MODEL = 'llama-3.1-8b-instant';

// ─── Core helper ──────────────────────────────────────────────

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const callAI = async (messages, options = {}, retries = 2) => {
  const client = getOpenAIClient();

  if (!client) {
    logger.warn('AI service unavailable — Gemini client not initialized');
    return null;
  }

  try {
    const result = await Promise.race([
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

    return result.choices[0]?.message?.content?.trim() || null;

  } catch (err) {
    if (retries > 0 && err.message?.includes('429')) {
      const match = err.message.match(/(\d+)s/);
      const waitMs = match ? (parseInt(match[1]) + 1) * 1000 : 20000;
      logger.warn(`AI rate limited. Retrying in ${waitMs / 1000}s...`);
      await sleep(waitMs);
      return callAI(messages, options, retries - 1);
    }
    logger.error(`AI service error: ${err.message}`);
    return null;
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
called Theralign. Your ONLY job is to analyze symptoms described by patients 
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

/**
 * Generates a structured clinical exercise prescription from a natural-language prompt.
 * Called by the doctor-facing AI Exercise Creator feature.
 *
 * @param {object} params
 * @param {string} params.prompt - Doctor's free-text exercise description
 * @param {string[]} params.targetMuscleGroups
 * @param {string|null} params.patientCondition
 * @param {string} params.difficultyLevel - beginner | intermediate | advanced
 * @returns {object} Structured exercise object
 * @throws {Error} On AI failure or malformed response
 */
export const generateExerciseFromPrompt = async ({ prompt, targetMuscleGroups = [], patientCondition = null, difficultyLevel = 'intermediate' }) => {
  const systemPrompt = `You are a clinical physiotherapy exercise designer for Theralign, an Indian physiotherapy platform. You generate evidence-based exercise prescriptions for physiotherapists to assign to patients.

Return ONLY a valid JSON object. No markdown. No preamble. No explanation. The JSON must exactly match this structure:

{
  "name": "string — exercise name, Title Case, 2–6 words",
  "category": "string — one of: Strength, Flexibility, Balance, Cardio, Posture, Breathing, Functional, Manual Therapy",
  "targetMuscleGroups": ["string array — anatomical muscle names"],
  "difficulty": "string — beginner | intermediate | advanced",
  "sets": number,
  "reps": number,
  "holdDuration": "string or null — e.g. '30 seconds', null if not applicable",
  "frequency": "string — e.g. 'twice daily', '3 times per week'",
  "stepByStepInstructions": ["array of strings — each string is one clear instruction step"],
  "commonMistakes": ["array of strings — 2–3 common errors to avoid"],
  "contraindications": ["array of strings — conditions where this exercise should not be performed"],
  "modifications": {
    "easier": "string — how to make it easier",
    "harder": "string — how to make it harder"
  },
  "equipmentRequired": ["array of strings — or empty array if none needed"],
  "youtubeSearchQuery": "string — a precise search query that would find a demonstration video for this exact exercise on YouTube",
  "clinicalNotes": "string — brief clinical context, 1–2 sentences"
}`;

  const muscleGroupsText = targetMuscleGroups.length > 0 ? `Target muscle groups: ${targetMuscleGroups.join(', ')}` : '';
  const conditionText = patientCondition ? `Patient condition context: ${patientCondition}` : '';

  const userMessage = `Generate a physiotherapy exercise for the following:

Description: ${prompt}
${muscleGroupsText}
${conditionText}
Difficulty level: ${difficultyLevel}

Generate a safe, evidence-based exercise appropriate for a physiotherapy clinic setting in India.`;

  const rawContent = await callAI(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    { temperature: 0.4, maxTokens: 1000 }
  );

  if (!rawContent) {
    const error = new Error('AI did not return a response. Please try again.');
    error.statusCode = 502;
    throw error;
  }

  // Strip possible markdown code blocks
  let cleanJson = rawContent;
  if (cleanJson.startsWith('```json')) cleanJson = cleanJson.slice(7);
  else if (cleanJson.startsWith('```')) cleanJson = cleanJson.slice(3);
  if (cleanJson.endsWith('```')) cleanJson = cleanJson.slice(0, -3);
  cleanJson = cleanJson.trim();

  let exercise;
  try {
    exercise = JSON.parse(cleanJson);
  } catch {
    const error = new Error('AI returned an unreadable response. Please rephrase your prompt and try again.');
    error.statusCode = 502;
    throw error;
  }

  return exercise;
};

export const getChatbotFilePath = () => {
  const rootPath = path.resolve(process.cwd(), 'chatbot.md');
  const parentPath = path.resolve(process.cwd(), '../chatbot.md');
  if (fs.existsSync(rootPath)) return rootPath;
  if (fs.existsSync(parentPath)) return parentPath;
  return rootPath;
};

export const parseChatbotMD = () => {
  try {
    const filePath = getChatbotFilePath();
    if (!fs.existsSync(filePath)) {
      logger.warn(`chatbot.md not found at path: ${filePath}`);
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const entries = [];
    let currentEntry = null;

    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('ROLE:')) {
        if (currentEntry) entries.push(currentEntry);
        currentEntry = { role: line.replace('ROLE:', '').trim().toLowerCase() };
      } else if (line.startsWith('Q:') && currentEntry) {
        currentEntry.question = line.replace('Q:', '').trim();
      } else if (line.startsWith('A:') && currentEntry) {
        currentEntry.answer = line.replace('A:', '').trim();
      } else if (line.startsWith('ROUTE:') && currentEntry) {
        currentEntry.route = line.replace('ROUTE:', '').trim();
      }
    }
    if (currentEntry) entries.push(currentEntry);
    return entries;
  } catch (error) {
    logger.error(`Failed to parse chatbot.md: ${error.message}`);
    return [];
  }
};

export const handleChatbotMessage = async ({ message, role = 'guest', chatHistory = [], user = null }) => {
  if (!message || typeof message !== 'string') {
    return { answer: 'Please send a valid message.', route: null };
  }

  const entries = parseChatbotMD();
  const normalizedQuery = message.toLowerCase().replace(/[?,.!]/g, '').trim();

  // 1. Try local match first (exact or partial)
  for (const entry of entries) {
    if (entry.role !== role.toLowerCase()) continue;
    const normalizedQ = entry.question.toLowerCase().replace(/[?,.!]/g, '').trim();

    // Check if user message matches the question closely
    if (normalizedQuery === normalizedQ || normalizedQuery.includes(normalizedQ) || normalizedQ.includes(normalizedQuery)) {
      return {
        answer: entry.answer,
        route: entry.route || null,
        isScripted: true,
      };
    }
  }

  // 2. Fallback to Llama 3.1 8B via Groq
  const roleQuestions = entries.filter(e => e.role === role.toLowerCase());

  const systemMessageContent = `You are the Theralign Chatbot, a helpful AI assistant for Theralign, an Indian physiotherapy discovery and appointment booking platform.
You are chatting with a user whose role is: ${role.toUpperCase()}.
${user ? `The user's name is ${user.name} and email is ${user.email}.` : 'The user is not logged in.'}

Here is a list of pre-approved questions and answers for this role:
${roleQuestions.map((q, idx) => `${idx + 1}. Q: ${q.question}\n   A: ${q.answer}\n   ROUTE: ${q.route || 'null'}`).join('\n')}

Rules:
1. Answer the user's question clearly, warmly, and helpfully using the information from the pre-approved list whenever possible.
2. If the question is NOT in the list, answer to the best of your knowledge based on Theralign's business (connecting patients with verified physiotherapists, bookings via Razorpay, flat 10% platform commission, 24h sign-off lock on clinical notes, junior doctor hierarchy, etc.).
3. Do NOT output generic dashboard routes (e.g. '/patient/dashboard', '/doctor/dashboard', '/admin/dashboard') in the "route" field. Always point the user to the specific page/action (e.g. '/patient/appointments' for appointments/bookings, '/patient/care-timeline' for home exercises/prescriptions, '/patient/payments' for payments/receipts, '/patient/profile' for settings, '/doctor/availability' for slots, '/doctor/practice' for junior doctors, '/admin/doctors' for verification reviews, '/admin/refunds' for refunds, etc.).
4. You MUST respond with a JSON object. No explanation outside JSON. No markdown backticks.
Format:
{
  "answer": "Your detailed friendly response here",
  "route": "Optional relative path to redirect the user to (e.g. '/doctors', '/patient/appointments'), or null if no redirect is needed"
}

If the user is describing pain or symptoms, suggest they use the symptom triage feature by redirecting to "/doctors" and recommend they search for a suitable specialist. Keep your answer professional and concise.`;

  const messages = [
    { role: 'system', content: systemMessageContent },
    ...chatHistory.slice(-6).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    })),
    { role: 'user', content: message }
  ];

  const rawContent = await callAI(messages, {
    temperature: 0.3,
    maxTokens: 500
  });

  if (!rawContent) {
    return {
      answer: 'Sorry, I am having trouble connecting to my service right now. Please try again.',
      route: null,
      isScripted: false
    };
  }

  // Strip possible markdown code blocks
  let cleanJson = rawContent;
  if (cleanJson.startsWith('```json')) cleanJson = cleanJson.slice(7);
  else if (cleanJson.startsWith('```')) cleanJson = cleanJson.slice(3);
  if (cleanJson.endsWith('```')) cleanJson = cleanJson.slice(0, -3);
  cleanJson = cleanJson.trim();

  try {
    const parsed = JSON.parse(cleanJson);
    return {
      answer: parsed.answer || 'How can I assist you today?',
      route: parsed.route || null,
      isScripted: false
    };
  } catch (err) {
    logger.error(`Chatbot AI JSON parse error: ${err.message}. Raw: ${rawContent}`);
    // If JSON parsing fails, fallback to raw string answer
    return {
      answer: rawContent,
      route: null,
      isScripted: false
    };
  }
};
