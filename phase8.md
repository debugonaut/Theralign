All three phases fully read. I now have complete context on everything built. Here is Phase 8.

---

# PhysioConnect — Phase 8 Complete Prompt Set
## AI Integration — Symptom Search & Doctor Summaries

---

# PROMPT 8.1 — AI Service Architecture & Provider Configuration

## Objective
Create the isolated `aiService.js` module that centralizes all AI API interactions. Configure the chosen provider (OpenAI `gpt-4o-mini`), establish the service boundary so no AI logic leaks into controllers or other services, implement graceful fallback behavior, and add the API key to the environment configuration. This service sits on top of the already-complete SaaS platform — it enhances it, never controls it.

## Architecture Reasoning
The single most important architectural decision in this phase is **isolation**. AI integration has a tendency to creep into controllers, frontend components, and utility files when developers implement it without a clear boundary. This creates fragile systems where the entire application degrades when the AI API is slow or unavailable.

The correct architecture treats AI exactly like any other external service — Cloudinary for files, Razorpay for payments. It gets its own config module, its own service file, and a strict rule: **no component outside `aiService.js` ever imports the OpenAI SDK directly**. Everything goes through the service.

`gpt-4o-mini` is selected over `gpt-4o` because:
- Token cost is approximately 15x cheaper
- Response latency is lower — important for symptom search UX
- Capability is more than sufficient for structured symptom interpretation and bio summarization
- The free tier / low budget of an MVP sprint demands cost awareness

The service must fail gracefully. If the OpenAI API returns an error, times out, or the key is missing, the application continues functioning — patients can still manually browse doctors, filters still work, doctor profiles still load. AI is an enhancement layer, not a dependency.

## Implementation Scope Boundaries
- Install OpenAI SDK on the server
- Add `OPENAI_API_KEY` to environment configuration
- Create `server/src/services/aiService.js` completely
- Create `server/src/config/openai.js` config module
- Do NOT call AI from any controller yet (Prompts 8.2 and 8.3 handle that)
- Do NOT add any frontend components yet

## Package Installation

```bash
# Inside /server directory
npm install openai
```

## Environment Variable Addition

Add to `server/.env`:
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
```

Add to `server/.env.example`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

`OPENAI_API_KEY` was already defined as an optional key in `server/.env.example` from Phase 1. Confirm it exists and fill in the real value.

## OpenAI Config Module

```javascript
// server/src/config/openai.js

import OpenAI from 'openai'
import { config } from './env.js'

let openaiClient = null

export const getOpenAIClient = () => {
  if (!config.ai.openaiKey) {
    return null   // Caller must handle null gracefully
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: config.ai.openaiKey })
  }

  return openaiClient
}
```

The lazy singleton pattern means the client is only instantiated when first needed, and the `null` return when the key is missing forces every caller to handle the unavailable case — making graceful degradation mandatory rather than optional.

## `aiService.js` Complete Specification

```javascript
// server/src/services/aiService.js

import { getOpenAIClient } from '../config/openai.js'
import { logger } from '../utils/logger.js'

const AI_TIMEOUT_MS = 8000   // 8 second timeout before giving up
const MODEL = 'gpt-4o-mini'

// ─── Core helper ──────────────────────────────────────────────

const callAI = async (messages, options = {}) => {
  const client = getOpenAIClient()

  if (!client) {
    logger.warn('AI service unavailable — OpenAI client not initialized')
    return null
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
    ])

    return completion.choices[0]?.message?.content?.trim() || null

  } catch (err) {
    logger.error(`AI service error: ${err.message}`)
    return null   // Always return null on failure — never throw
  }
}
```

The `Promise.race` timeout pattern is critical. Without it, a slow OpenAI response will hang the entire request until Express's default timeout. Eight seconds is the maximum acceptable wait for a user-facing search interaction.

`temperature: 0.3` is deliberately low. The platform needs consistent, structured outputs — not creative variation. Lower temperature = more predictable, repeatable responses. This matters especially for the specialization recommendation output that will be used to filter doctors.

---

### Function 1: `interpretSymptoms(symptomsText)`

```javascript
export const interpretSymptoms = async (symptomsText) => {

  // Input sanitization — never send raw user input without validation
  if (!symptomsText || typeof symptomsText !== 'string') return null
  const sanitized = symptomsText.trim().slice(0, 500) // Hard cap at 500 chars

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
  ]

  const rawResponse = await callAI(messages, {
    temperature: 0.2,    // Very low — we need consistent JSON structure
    maxTokens: 200
  })

  if (!rawResponse) return null

  try {
    const parsed = JSON.parse(rawResponse)

    // Validate the response has required fields
    const validSpecializations = [
      'Orthopedic Physiotherapy', 'Sports Physiotherapy',
      'Neurological Physiotherapy', 'Pediatric Physiotherapy',
      'Geriatric Physiotherapy', 'Cardiopulmonary Physiotherapy',
      'Postural & Spinal Rehabilitation', 'Post-Surgical Rehabilitation',
      "Women's Health Physiotherapy", 'General Physiotherapy'
    ]

    if (!validSpecializations.includes(parsed.suggestedSpecialization)) {
      logger.warn(`AI returned invalid specialization: ${parsed.suggestedSpecialization}`)
      parsed.suggestedSpecialization = 'General Physiotherapy'
    }

    return {
      suggestedSpecialization: parsed.suggestedSpecialization,
      confidence: parsed.confidence || 'medium',
      briefExplanation: parsed.briefExplanation || '',
      disclaimer: 'This suggestion is informational only and not a medical diagnosis. Please consult a qualified physiotherapist.'
      // Always override disclaimer — never trust the model to write it correctly
    }

  } catch (parseErr) {
    logger.error(`AI response JSON parse failed: ${parseErr.message}`)
    logger.error(`Raw AI response: ${rawResponse}`)
    return null
  }
}
```

**Why validate the specialization against the known enum?**
The AI might return `"Orthopedics"` instead of `"Orthopedic Physiotherapy"`. If this string is passed directly to the MongoDB query filter, it returns zero results. Validation + fallback to `General Physiotherapy` ensures the discovery flow always works.

**Why override the disclaimer?**
The disclaimer is a legal and ethical concern. If the model decides to omit it, abbreviate it, or rephrase it in a way that sounds medical, the platform has a liability problem. Always enforce the exact disclaimer text in application code, not in the prompt.

---

### Function 2: `generateDoctorSummary(doctorData)`

```javascript
export const generateDoctorSummary = async (doctorData) => {

  const {
    name, specialization, experience,
    bio, qualifications, clinicName, languages
  } = doctorData

  // Don't call AI if there's not enough content to summarize
  if (!bio || bio.trim().length < 30) return null

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
  ]

  const summary = await callAI(messages, {
    temperature: 0.5,   // Slightly higher — some stylistic variation is fine
    maxTokens: 100
  })

  return summary   // May be null if AI fails — caller handles gracefully
}
```

---

### Function 3: `batchGenerateSummaries(doctorProfileIds)`

```javascript
// Used by admin or a manual trigger to generate/refresh summaries
// for multiple doctors at once — not called per request

export const batchGenerateSummaries = async (doctors) => {
  const results = []

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
    })

    results.push({
      doctorId: doctor._id,
      summary,
      success: !!summary
    })

    // 300ms delay between calls to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  return results
}
```

## `config/env.js` Update

Confirm `config.ai.openaiKey` is already defined from Phase 1. If not, add:

```javascript
// In config/env.js config object:
ai: {
  openaiKey: process.env.OPENAI_API_KEY || null
}
```

The `|| null` default is important — it allows the `getOpenAIClient()` null check to work correctly when the key is not set.

## Validation Checkpoints
- [ ] `npm install openai` completes without errors
- [ ] `getOpenAIClient()` returns null when `OPENAI_API_KEY` is not set
- [ ] `getOpenAIClient()` returns an OpenAI instance when key is present
- [ ] `interpretSymptoms('lower back pain while sitting')` returns valid JSON response
- [ ] `interpretSymptoms('')` returns null without calling the API
- [ ] `interpretSymptoms` with a very long input is capped at 500 characters
- [ ] Invalid specialization in AI response falls back to `General Physiotherapy`
- [ ] Disclaimer text is always the hardcoded string, not AI-generated
- [ ] `generateDoctorSummary` with bio shorter than 30 chars returns null without calling AI
- [ ] Removing `OPENAI_API_KEY` from `.env` → all AI functions return null, no crashes

## Common Mistakes to Avoid
- **Do NOT** import `openai` directly in controllers — always go through `aiService.js`
- **Do NOT** `throw` errors from `aiService.js` functions — always `return null` on failure
- **Do NOT** use `temperature: 1.0` for structured outputs — high temperature produces inconsistent JSON that breaks parsing
- **Do NOT** trust the AI to always return valid JSON — always wrap `JSON.parse` in try/catch
- **Do NOT** use `gpt-4o` — the cost difference is significant and capability is identical for this use case
- **Do NOT** make parallel AI calls for batch operations — use sequential with delays to avoid rate limit errors

## Interview Explanation Points
- "I isolated all AI logic in `aiService.js` and made it the only file that imports the OpenAI SDK. Every function returns `null` on failure rather than throwing — this forces every caller to handle the absent-AI case, making graceful degradation a structural guarantee rather than something I hope developers remember."
- "I set `temperature: 0.2` for symptom interpretation because I need consistent JSON structure. Temperature controls randomness — at 0.2 the model almost always follows the format. At 1.0 it might decide to be creative and return prose instead of JSON."
- "The disclaimer is hardcoded in application code, not generated by the AI. Healthcare disclaimers have legal implications — I can't risk the model shortening it or rephrasing it in a way that sounds medical."
- "The 8-second `Promise.race` timeout prevents a slow AI response from hanging the user's request indefinitely. If AI doesn't respond in 8 seconds, the function returns null and discovery falls back to standard filtering — the user never sees an error."

## What NOT to Implement Yet
- No frontend components yet
- No AI routes yet
- No admin summary generation trigger yet (Prompt 8.5)

---

# PROMPT 8.2 — Symptom Interpretation API Endpoint

## Objective
Create the backend API endpoint that receives a patient's symptom description, calls `aiService.interpretSymptoms()`, and returns a structured specialization recommendation. This endpoint becomes the backend of the symptom search feature on the landing page and discovery page.

## Architecture Reasoning
The symptom interpretation endpoint is deliberately a standalone route rather than being embedded inside the discovery route. This separation means:
- It can be called independently by the frontend before or during a search
- It has its own rate limiting and validation
- The discovery endpoint stays clean — it receives a specialization string, not raw symptoms
- Future versions could add caching, logging, or A/B testing to just this endpoint

The endpoint is **unauthenticated** because symptom search is a discovery feature — requiring login before a patient can even describe their symptoms is a conversion-killing friction point. The AI call happens without knowing who the user is.

## Implementation Scope Boundaries
- Create `server/src/controllers/ai.controller.js`
- Create `server/src/routes/ai.routes.js`
- Mount in `app.js`: `app.use('/api/ai', aiRoutes)`
- Do NOT implement summary generation endpoint here (Prompt 8.3)
- Do NOT add rate limiting yet — acceptable MVP omission

## Route Definition

```
POST /api/ai/interpret-symptoms    → Public, no auth required
```

## Controller Specification

```javascript
// controllers/ai.controller.js

import { interpretSymptoms } from '../services/aiService.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import AppError from '../utils/AppError.js'

export const interpretSymptomsController = asyncHandler(async (req, res) => {

  const { symptoms } = req.body

  // Input validation
  if (!symptoms || typeof symptoms !== 'string') {
    throw new AppError('Symptoms text is required', 400)
  }

  const trimmed = symptoms.trim()

  if (trimmed.length < 5) {
    throw new AppError('Please describe your symptoms in more detail (minimum 5 characters)', 400)
  }

  if (trimmed.length > 500) {
    throw new AppError('Symptom description is too long (maximum 500 characters)', 400)
  }

  // Call AI service — returns null if unavailable
  const result = await interpretSymptoms(trimmed)

  if (!result) {
    // AI unavailable — return a graceful fallback response
    // Frontend will handle this by showing standard search instead
    return successResponse(res, 200, 'AI service temporarily unavailable', {
      aiAvailable: false,
      suggestedSpecialization: null,
      fallbackMessage: 'AI recommendations are temporarily unavailable. Please use our search filters to find a physiotherapist.'
    })
  }

  return successResponse(res, 200, 'Symptoms interpreted successfully', {
    aiAvailable: true,
    ...result
    // Spreads: suggestedSpecialization, confidence, briefExplanation, disclaimer
  })
})
```

The `aiAvailable` flag in the response is what the frontend uses to decide between showing the AI recommendation UI or falling back to the standard filter UI. Never make the frontend guess whether AI is working.

## Route File

```javascript
// routes/ai.routes.js

import express from 'express'
import { interpretSymptomsController } from '../controllers/ai.controller.js'

const router = express.Router()

// Public — no auth required
router.post('/interpret-symptoms', interpretSymptomsController)

export default router
```

## Mount in `app.js`

```javascript
import aiRoutes from './src/routes/ai.routes.js'
app.use('/api/ai', aiRoutes)
```

## Expected Request/Response

**Request:**
```json
POST /api/ai/interpret-symptoms
Content-Type: application/json

{
  "symptoms": "sharp knee pain when going down stairs, worse after running"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Symptoms interpreted successfully",
  "data": {
    "aiAvailable": true,
    "suggestedSpecialization": "Sports Physiotherapy",
    "confidence": "high",
    "briefExplanation": "Knee pain that worsens with activity and stair descent often indicates a sports or movement-related condition that a sports physiotherapist is trained to assess and treat.",
    "disclaimer": "This suggestion is informational only and not a medical diagnosis. Please consult a qualified physiotherapist."
  }
}
```

**Fallback Response (AI unavailable):**
```json
{
  "success": true,
  "message": "AI service temporarily unavailable",
  "data": {
    "aiAvailable": false,
    "suggestedSpecialization": null,
    "fallbackMessage": "AI recommendations are temporarily unavailable. Please use our search filters to find a physiotherapist."
  }
}
```

## Validation Checkpoints
- [ ] `POST /api/ai/interpret-symptoms` with valid symptoms returns specialization
- [ ] `POST /api/ai/interpret-symptoms` with empty body returns 400
- [ ] `POST /api/ai/interpret-symptoms` with 3-character symptoms returns 400
- [ ] Response always includes `aiAvailable` boolean field
- [ ] Removing `OPENAI_API_KEY` → returns graceful fallback response, not a 500
- [ ] Response `suggestedSpecialization` is always one of the 10 valid enum strings
- [ ] `disclaimer` field always present and contains correct text
- [ ] Route accessible without Authorization header

## Common Mistakes to Avoid
- **Do NOT** return a 503 or 500 when AI is unavailable — return 200 with `aiAvailable: false` — the frontend handles this gracefully
- **Do NOT** log the actual symptom text at INFO level in production — it's patient health information. Log only that a request was received, not the content
- **Do NOT** forget to mount the route in `app.js`

## Interview Explanation Points
- "The endpoint returns HTTP 200 even when AI is unavailable, with an `aiAvailable: false` flag. A 503 would cause the frontend to show an error state and break the discovery flow entirely. The correct behavior is graceful degradation — return a structured response that tells the frontend to fall back to manual filtering."
- "I validate symptom length both on the backend (authoritative) and will validate on the frontend (UX). Backend validation is the security layer. Frontend validation is the UX layer."

---

# PROMPT 8.3 — Doctor Summary Generation Endpoint & Storage

## Objective
Create the backend endpoint that triggers AI summary generation for a doctor's profile, stores the generated summary in `DoctorProfile.aiSummary`, and returns it. Implement the logic for when summaries are generated — on first profile view if no summary exists, and on manual admin trigger. Store summaries in the database to avoid repeated API calls.

## Architecture Reasoning
Doctor summaries must be **stored in the database**, not generated on every profile view. If the profile page called the AI API on every load, a popular doctor with 100 daily visitors would burn through API budget rapidly and introduce latency on every profile page load. The correct pattern is generate-once, store, serve from DB. This is the same pattern used in production AI-enhanced products.

The generation trigger has two paths:
1. **Lazy generation**: When a patient views a doctor profile and `aiSummary` is null, the backend generates it, stores it, and returns it in the same response
2. **Admin batch trigger**: Admin can regenerate summaries for all doctors (useful after prompt improvements)

## Implementation Scope Boundaries
- Add summary generation logic to `ai.controller.js`
- Add `GET /api/ai/doctor-summary/:doctorId` endpoint
- Add `POST /api/ai/admin/batch-summaries` admin endpoint
- Modify `discovery.controller.js` — trigger lazy summary generation on profile view
- Do NOT add frontend components yet (Prompt 8.4)

## Summary Generation Controller

```javascript
// Add to controllers/ai.controller.js

import { generateDoctorSummary, batchGenerateSummaries } from '../services/aiService.js'
import DoctorProfile from '../models/DoctorProfile.model.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'

// GET /api/ai/doctor-summary/:doctorId  — Public
export const getDoctorAISummary = asyncHandler(async (req, res) => {

  const profile = await DoctorProfile.findById(req.params.doctorId)
    .populate('user', 'name')

  if (!profile) throw new AppError('Doctor not found', 404)

  // If summary already exists in DB — return it directly (no AI call)
  if (profile.aiSummary) {
    return successResponse(res, 200, 'Summary retrieved', {
      aiSummary: profile.aiSummary,
      fromCache: true
    })
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
  })

  if (summary) {
    // Store in DB so next request is served from cache
    await DoctorProfile.findByIdAndUpdate(
      req.params.doctorId,
      { aiSummary: summary }
    )
  }

  return successResponse(res, 200, 'Summary generated', {
    aiSummary: summary,   // May be null if AI unavailable
    fromCache: false
  })
})
```

## Admin Batch Summary Endpoint

```javascript
// POST /api/ai/admin/batch-summaries — Admin only

export const batchGenerateDoctorSummaries = asyncHandler(async (req, res) => {

  // Fetch doctors that have bio but no summary yet
  const doctors = await DoctorProfile.find({
    verificationStatus: 'verified',
    bio: { $exists: true, $ne: '' },
    $or: [
      { aiSummary: null },
      { aiSummary: { $exists: false } }
    ]
  })
  .populate('user', 'name')
  .limit(50)   // Process max 50 at once

  if (doctors.length === 0) {
    return successResponse(res, 200, 'No doctors need summaries generated', {
      processed: 0
    })
  }

  const results = await batchGenerateSummaries(doctors)

  // Update DB for successful generations
  for (const result of results) {
    if (result.success && result.summary) {
      await DoctorProfile.findByIdAndUpdate(
        result.doctorId,
        { aiSummary: result.summary }
      )
    }
  }

  const successCount = results.filter(r => r.success).length

  return successResponse(res, 200, 'Batch summary generation complete', {
    processed: doctors.length,
    successful: successCount,
    failed: doctors.length - successCount
  })
})
```

## Route Additions

```javascript
// Add to routes/ai.routes.js

import { requireAuth } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'
import {
  interpretSymptomsController,
  getDoctorAISummary,
  batchGenerateDoctorSummaries
} from '../controllers/ai.controller.js'

// Public
router.get('/doctor-summary/:doctorId', getDoctorAISummary)

// Admin only
router.post(
  '/admin/batch-summaries',
  requireAuth,
  requireRole('admin'),
  batchGenerateDoctorSummaries
)
```

## Validation Checkpoints
- [ ] `GET /api/ai/doctor-summary/:id` for doctor without summary → generates and returns it
- [ ] `GET /api/ai/doctor-summary/:id` called again → returns from DB (`fromCache: true`), no AI call made
- [ ] Summary is stored in `DoctorProfile.aiSummary` in Atlas after generation
- [ ] `POST /api/ai/admin/batch-summaries` without admin token → 403
- [ ] `POST /api/ai/admin/batch-summaries` → generates summaries for all doctors without one
- [ ] Doctor with bio shorter than 30 chars → returns `aiSummary: null`, no AI call
- [ ] AI unavailable → `aiSummary: null` returned, no crash

## Common Mistakes to Avoid
- **Do NOT** call `generateDoctorSummary` on every profile view — always check `profile.aiSummary` first
- **Do NOT** run batch generation in parallel — use the sequential `batchGenerateSummaries` function with built-in delays
- **Do NOT** allow patients or doctors to trigger batch generation — admin only

## Interview Explanation Points
- "I cache AI-generated summaries in the DoctorProfile document after the first generation. A doctor's profile might be viewed hundreds of times a day — calling the OpenAI API on every view would be expensive and slow. Generate once, store, serve from DB."
- "The batch endpoint processes doctors sequentially with 300ms delays rather than in parallel. Parallel AI calls for 50 doctors would immediately trigger OpenAI's rate limiter. Sequential with small delays is the reliable pattern for batch AI operations."

---

# PROMPT 8.4 — Symptom Search UI (Landing Page & Discovery Page)

## Objective
Build the symptom search UI component that appears on the landing page hero section and integrates into the discovery page. The component accepts free-text symptom input, calls the AI interpretation endpoint, displays the AI recommendation card with specialization suggestion and explanation, and seamlessly triggers the doctor discovery filter with the suggested specialization.

## Architecture Reasoning
The AI symptom search must feel **integrated into the product**, not bolted on. The UX flow should be:

```
Patient types symptoms → AI interprets → Recommendation card appears →
Patient clicks "Find [Specialization] Doctors" → Discovery page filtered
```

The entire flow should feel like one continuous experience — not like the patient is using a separate AI tool. The recommendation card is the bridge between AI output and the existing discovery system built in Phase 4.

## Implementation Scope Boundaries
- Build `components/ai/SymptomSearchBox.jsx`
- Build `components/ai/AIRecommendationCard.jsx`
- Integrate into `pages/public/LandingPage.jsx`
- Integrate into `pages/public/DoctorListingPage.jsx`
- Add API function to `api/ai.api.js`
- Do NOT redesign the landing page — integrate into existing hero section

## API Function

```javascript
// api/ai.api.js (create this file)

import axiosInstance from './axiosInstance'

export const interpretSymptomsAPI = async (symptoms) => {
  const response = await axiosInstance.post('/ai/interpret-symptoms', { symptoms })
  return response.data
}

export const getDoctorAISummaryAPI = async (doctorId) => {
  const response = await axiosInstance.get(`/ai/doctor-summary/${doctorId}`)
  return response.data
}
```

## `SymptomSearchBox.jsx` — Complete Specification

```jsx
// components/ai/SymptomSearchBox.jsx

State:
  symptoms: ''           // Controlled input value
  loading: false         // While AI call is in flight
  result: null           // AI interpretation result
  error: null            // Error message if validation fails

Props:
  onSpecializationFound: (specialization) => void
    Called when AI returns a valid specialization
    Parent uses this to trigger the discovery filter

UI:

[LARGE TEXTAREA or INPUT]
"Describe your symptoms or condition..."
e.g. "lower back pain", "knee pain when running", "neck stiffness"

[AI SEARCH BUTTON]
"✨ Find My Physiotherapist"
Loading state: "Analyzing symptoms..." with spinner
Disabled: when symptoms < 5 chars or loading is true

[SMALL DISCLAIMER TEXT below input]
"AI-powered suggestions are for guidance only, not medical advice."

[AIRecommendationCard — shown when result is available]

Behavior:

const handleSearch = async () => {
  if (symptoms.trim().length < 5) {
    setError('Please describe your symptoms (minimum 5 characters)')
    return
  }

  setLoading(true)
  setResult(null)
  setError(null)

  try {
    const response = await interpretSymptomsAPI(symptoms)
    const data = response.data

    if (!data.aiAvailable) {
      // Graceful fallback — show message, don't break
      setError(data.fallbackMessage)
      return
    }

    setResult(data)
    onSpecializationFound?.(data.suggestedSpecialization)

  } catch (err) {
    setError('Unable to analyze symptoms right now. Please use the search filters below.')
  } finally {
    setLoading(false)
  }
}
```

## `AIRecommendationCard.jsx` — Complete Specification

```jsx
// components/ai/AIRecommendationCard.jsx

Props:
  result: {
    suggestedSpecialization,
    confidence,
    briefExplanation,
    disclaimer
  }
  onViewDoctors: () => void    // Called when patient clicks the CTA

Visual design:
┌────────────────────────────────────────────────────────┐
│  ✨ AI Recommendation                    [confidence]  │
│─────────────────────────────────────────────────────── │
│  Based on your symptoms, we suggest:                   │
│                                                        │
│  ┌─────────────────────────────────────┐               │
│  │  🏥  Sports Physiotherapy           │               │
│  └─────────────────────────────────────┘               │
│                                                        │
│  Knee pain that worsens with activity and stair        │
│  descent often indicates a sports or movement-related  │
│  condition...                                          │
│                                                        │
│  [View Sports Physiotherapy Doctors →]                 │
│                                                        │
│  ⚠️  This suggestion is informational only and not    │
│      a medical diagnosis...                            │
└────────────────────────────────────────────────────────┘

Confidence badge:
  high   → green badge "High Confidence"
  medium → amber badge "Moderate Confidence"
  low    → gray badge "Low Confidence"

The CTA button text: "View {suggestedSpecialization} Doctors →"

Disclaimer: smaller text, muted color, always visible below CTA
```

```jsx
const AIRecommendationCard = ({ result, onViewDoctors }) => {
  if (!result) return null

  const confidenceConfig = {
    high:   { label: 'High Confidence',     className: 'bg-green-100 text-green-700' },
    medium: { label: 'Moderate Confidence', className: 'bg-amber-100 text-amber-700' },
    low:    { label: 'Low Confidence',      className: 'bg-gray-100 text-gray-600'  },
  }

  const conf = confidenceConfig[result.confidence] || confidenceConfig.medium

  return (
    <div className="mt-4 p-5 bg-blue-50 border border-blue-200 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-blue-800 flex items-center gap-1">
          ✨ AI Recommendation
        </span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${conf.className}`}>
          {conf.label}
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-2">Based on your symptoms, we suggest:</p>

      <div className="bg-white rounded-lg px-4 py-3 mb-3 border border-blue-100">
        <span className="font-semibold text-gray-900">
          🏥 {result.suggestedSpecialization}
        </span>
      </div>

      {result.briefExplanation && (
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
          {result.briefExplanation}
        </p>
      )}

      <button
        onClick={onViewDoctors}
        className="w-full bg-primary text-white py-2.5 px-4 rounded-lg
                   font-medium text-sm hover:bg-primary-dark transition-colors"
      >
        View {result.suggestedSpecialization} Doctors →
      </button>

      <p className="text-xs text-gray-400 mt-3 leading-relaxed">
        ⚠️ {result.disclaimer}
      </p>
    </div>
  )
}
```

## Landing Page Integration

In `LandingPage.jsx`, add `SymptomSearchBox` to the hero section:

```jsx
// In hero section, below the headline:
<SymptomSearchBox
  onSpecializationFound={(specialization) => {
    // Navigate to discovery page with specialization pre-filtered
    navigate(`/doctors?specialization=${encodeURIComponent(specialization)}`)
  }}
/>
```

The hero section already exists from Phase 10 planning. Add the symptom box below the main headline and above any existing search controls.

## Discovery Page Integration

In `DoctorListingPage.jsx`, add `SymptomSearchBox` at the top of the page, above the filter sidebar layout:

```jsx
// Above the main grid layout:
<div className="mb-6">
  <SymptomSearchBox
    onSpecializationFound={(specialization) => {
      // Update URL params to filter by this specialization
      updateFilter('specialization', specialization)
      // Smooth scroll to results
      window.scrollTo({ top: 300, behavior: 'smooth' })
    }}
  />
</div>
```

When AI returns a specialization and `onSpecializationFound` fires, the existing `updateFilter` function from Phase 4 handles the rest — it updates the URL, triggers a re-fetch, and the filtered results appear. AI becomes a smart input for the existing filter system.

## Validation Checkpoints
- [ ] Typing symptoms and clicking search calls the API
- [ ] Loading spinner appears on the button while AI processes
- [ ] `AIRecommendationCard` appears with correct specialization after response
- [ ] Confidence badge shows correct color for each level
- [ ] CTA button text includes the suggested specialization name
- [ ] Clicking CTA navigates to `/doctors?specialization=Sports Physiotherapy` (or equivalent)
- [ ] Discovery page filters automatically by the AI-suggested specialization
- [ ] When AI unavailable, error message shows instead of card — no crash, no empty state
- [ ] Disclaimer text always visible below CTA button
- [ ] Input shorter than 5 characters → button disabled or inline error shown
- [ ] Component renders correctly on both landing page and discovery page

## Common Mistakes to Avoid
- **Do NOT** auto-submit on keystroke — only submit when the user explicitly clicks the button
- **Do NOT** hide the `AIRecommendationCard` behind a loading state after it appears — keep it visible while the patient reads
- **Do NOT** navigate away from the current page on mobile — use URL params that update in place on the discovery page
- **Do NOT** show the AI card while loading — show it only after the complete result is received
- **Do NOT** make the disclaimer small enough to be invisible — it must be readable, not hidden

## Interview Explanation Points
- "The AI symptom search doesn't replace the filter system — it feeds into it. When the AI suggests 'Sports Physiotherapy', it simply calls the same `updateFilter('specialization', ...)` function that the sidebar uses. There's no special AI-specific discovery path."
- "The `onSpecializationFound` callback pattern decouples the AI recommendation card from the navigation logic. The card doesn't know whether it's on the landing page or discovery page — the parent decides what to do with the specialization."

---

# PROMPT 8.5 — AI Summary Display on Doctor Profile Page

## Objective
Integrate the AI-generated doctor summary into the `DoctorProfilePage.jsx`. Fetch the summary lazily (only when the profile page loads), display it in a dedicated section with clear AI attribution, and handle the case where no summary is available without visual disruption.

## Architecture Reasoning
The AI summary enhances the doctor profile without being required for it. The profile page already works without a summary (Phase 3 built it). This prompt adds the summary as an optional enhancement that appears if available and is silently absent if not.

The summary fetch is triggered as a **secondary non-blocking request** after the main profile loads. The profile data appears immediately. The AI summary section either populates within a second or quietly remains hidden — the patient never waits for AI before seeing the doctor's information.

## Implementation Scope Boundaries
- Modify `pages/public/DoctorProfilePage.jsx` to add AI summary section
- Implement non-blocking secondary API call for summary
- Add visual treatment for AI-generated content
- Do NOT modify backend endpoints (already complete from Prompt 8.3)

## Profile Page Modification

```javascript
// In DoctorProfilePage.jsx

// Existing state:
const [profile, setProfile] = useState(null)
const [loading, setLoading] = useState(true)

// New state for AI summary:
const [aiSummary, setAiSummary] = useState(null)
const [summaryLoading, setSummaryLoading] = useState(false)

useEffect(() => {
  const fetchProfile = async () => {
    // ... existing profile fetch logic ...
    setProfile(data)
    setLoading(false)

    // After profile loads, fetch AI summary as secondary non-blocking call
    fetchAISummary(data._id)
  }

  fetchProfile()
}, [id])

const fetchAISummary = async (doctorId) => {
  setSummaryLoading(true)
  try {
    const res = await getDoctorAISummaryAPI(doctorId)
    if (res.data?.aiSummary) {
      setAiSummary(res.data.aiSummary)
    }
  } catch {
    // Silently fail — missing AI summary is not an error state
  } finally {
    setSummaryLoading(false)
  }
}
```

## AI Summary Section JSX

Add this section to the profile page, inside the "About" column, below the bio text:

```jsx
{/* AI Summary Section */}
{summaryLoading && (
  <div className="mt-4 h-16 bg-gray-100 rounded-lg animate-pulse" />
)}

{!summaryLoading && aiSummary && (
  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50
                  border border-blue-100 rounded-xl">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
        ✨ AI-Generated Summary
      </span>
    </div>
    <p className="text-sm text-gray-700 leading-relaxed italic">
      "{aiSummary}"
    </p>
    <p className="text-xs text-gray-400 mt-2">
      Generated by AI based on profile information. Not a personal endorsement.
    </p>
  </div>
)}
```

Visual reasoning:
- The gradient blue background visually distinguishes AI content from human-written content
- `italic` styling signals that this is a generated summary, not the doctor's own words
- The "AI-Generated Summary" label with a ✨ icon makes the source explicit
- The small attribution line at the bottom manages expectations

## Validation Checkpoints
- [ ] Doctor profile page loads without waiting for AI summary
- [ ] AI summary section appears within 1-2 seconds after profile loads
- [ ] Summary displays in styled card with correct visual treatment
- [ ] If AI summary is null → section is completely absent, no empty card
- [ ] "AI-Generated Summary" label clearly visible
- [ ] Skeleton loader visible briefly while summary is fetching
- [ ] If `getDoctorAISummaryAPI` throws a network error → profile page unaffected

## Common Mistakes to Avoid
- **Do NOT** await the AI summary fetch before displaying the profile — it makes the entire page feel slow
- **Do NOT** show an error state if the summary is unavailable — simply don't render the section
- **Do NOT** use the same loading state for profile and AI summary — they are independent

## Interview Explanation Points
- "The AI summary fetch is completely non-blocking. The profile page renders with full information immediately. The summary appears as a secondary enhancement a second later. If it never arrives, nothing breaks and nothing looks incomplete."
- "I visually distinguish AI-generated content with a specific design treatment — a blue gradient card, italic text, and an explicit label. This is an ethical UX practice: patients should always know what a human wrote versus what AI generated."

---

# PROMPT 8.6 — Admin AI Controls & Summary Management

## Objective
Add an AI management section to the admin dashboard that allows triggering batch summary generation for all verified doctors. This gives the admin operational control over the AI layer without requiring direct database access.

## Implementation Scope Boundaries
- Add "AI Tools" section to admin dashboard
- Implement batch summary trigger button
- Show generation results
- No new backend work needed (Prompt 8.3 already built the endpoint)

## Admin AI Tools Section

Add to `pages/admin/AdminDashboard.jsx` or create `pages/admin/AdminAITools.jsx`:

```jsx
const AdminAITools = () => {
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)

  const handleBatchGenerate = async () => {
    setGenerating(true)
    setResult(null)
    try {
      const res = await triggerBatchSummariesAPI()
      setResult(res.data)
      toast.success(`Generated summaries for ${res.data.successful} doctors`)
    } catch (err) {
      toast.error('Batch generation failed')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <h2 className="text-lg font-semibold mb-1">AI Tools</h2>
      <p className="text-sm text-gray-500 mb-6">
        Manage AI-generated content across the platform.
      </p>

      <div className="p-4 bg-gray-50 rounded-lg border">
        <h3 className="font-medium mb-1">Doctor Profile Summaries</h3>
        <p className="text-sm text-gray-600 mb-4">
          Generate AI summaries for verified doctors who don't have one yet.
          Processes up to 50 doctors per batch.
        </p>

        <button
          onClick={handleBatchGenerate}
          disabled={generating}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm
                     font-medium disabled:opacity-50"
        >
          {generating ? 'Generating...' : '✨ Generate Doctor Summaries'}
        </button>

        {result && (
          <div className="mt-4 text-sm text-gray-600">
            Processed: {result.processed} doctors •
            Successful: {result.successful} •
            Failed: {result.failed}
          </div>
        )}
      </div>
    </div>
  )
}
```

## API Function Addition

```javascript
// Add to api/admin.api.js
export const triggerBatchSummariesAPI = () =>
  axiosInstance.post('/ai/admin/batch-summaries')
```

## Admin Sidebar Addition

```
✨ AI Tools → /admin/ai-tools
```

## Validation Checkpoints
- [ ] Admin can trigger batch summary generation
- [ ] Result shows correct processed/successful/failed counts
- [ ] Button is disabled during generation to prevent double-trigger
- [ ] After generation, visiting doctor profiles shows new summaries
- [ ] Non-admin accessing this page → 403

---

# PROMPT 8.7 — Demo Seed Update for Phase 8

## Objective
Update the seed script to pre-populate AI summaries for seeded doctors so the demo immediately shows the AI feature without requiring a live OpenAI call during the demo presentation.

## Architecture Reasoning
Demo data credibility matters. Running live AI calls during a demo introduces unpredictability — slow responses, rate limits, or API outages can break the demo at the worst moment. Pre-seeded summaries mean the AI feature always looks polished during the demonstration.

## Implementation Scope Boundaries
- Modify `server/src/config/seed.js`
- Add `aiSummary` field to each seeded doctor profile

## Seed Addition

```javascript
// For each doctor in doctorSeeds, add an aiSummary:

{
  ...existingProfileFields,
  aiSummary: "Specializes in sports injury rehabilitation with 8+ years of experience treating athletes and active individuals. Dr. Sharma combines evidence-based techniques with personalized recovery programs to help patients return to peak performance."
}
```

Write unique 2-sentence summaries for each of the 15 seeded doctors. Each should sound natural, reflect their specialization and experience, and be under 60 words.

## Validation Checkpoints
- [ ] After re-running seed, all doctor profiles show AI summary on profile page
- [ ] Summary displays immediately on profile load (from DB, no AI call)
- [ ] Admin AI Tools page shows "0 doctors need summaries" after seeding

---

## Phase 8 Completion Gate

Before moving to Phase 9 (Admin Dashboard & Analytics), ALL of the following must be true:

```
✅ OpenAI SDK installed, config module created
✅ OPENAI_API_KEY in server .env
✅ aiService.js has interpretSymptoms and generateDoctorSummary functions
✅ Both functions return null gracefully when AI is unavailable
✅ POST /api/ai/interpret-symptoms returns structured specialization recommendation
✅ POST /api/ai/interpret-symptoms returns graceful fallback when AI unavailable
✅ GET /api/ai/doctor-summary/:id generates and caches summary on first call
✅ GET /api/ai/doctor-summary/:id returns from DB cache on subsequent calls
✅ POST /api/ai/admin/batch-summaries generates summaries for all eligible doctors
✅ SymptomSearchBox component renders on landing page and discovery page
✅ AIRecommendationCard shows specialization, confidence, explanation, disclaimer
✅ Clicking CTA navigates to discovery page filtered by suggested specialization
✅ Discovery page filters correctly when AI specialization is applied
✅ AI summary section renders on doctor profile page as non-blocking secondary load
✅ AI summary visually distinguished with labeled card design
✅ Graceful fallback UI when AI is unavailable (no crashes, no broken states)
✅ Admin AI Tools page allows batch summary generation
✅ Seed script includes pre-written AI summaries for all demo doctors
✅ All components handle null AI responses without visual breakage
```

**Phase 8 unlocks Phase 9 (Admin Dashboard & Analytics) because:**
- `DoctorProfile.aiSummary` field is populated — admin can see AI coverage metrics
- The platform now has all core data flows complete: users, doctors, bookings, payments, reviews, AI
- Admin analytics in Phase 9 will aggregate across all of these collections
- The admin AI Tools section established in this phase naturally extends into the broader admin dashboard built in Phase 9

---

Say **"generate Phase 9 prompts"** when ready.