# phase 14 — Session Records & Care Continuity
## Complete Implementation Prompt (Enhanced)

---

> Paste your MASTER_CONTEXT.md into the conversation first, then paste this prompt below it.

---

### Context

You are building phase 14 of Theralign. Read `MASTER_CONTEXT.md` fully before touching any file. Phases 1–13 are complete and production-live at `theralign.vercel.app` (frontend) and `theralign-api.onrender.com` (backend). The Appointment model, Payment model, Notification service, email service, and Cloudinary upload infrastructure are all live. You are building on top of them — never modifying their core structure.

phase 14 adds the clinical layer. After a doctor marks an appointment complete, they fill a structured Session Record documenting treatment, progress, exercise prescriptions, and follow-up recommendations. Patients receive it automatically and can track their full care history across all doctors. This transforms Theralign from a booking platform into a care continuity platform and lays the foundation for Phase 16 (exercise compliance tracking).

This prompt incorporates six additions beyond the base plan — each is marked `[ENHANCEMENT]`. They are non-negotiable parts of this phase.

---

### Absolute Constraints — Read Before Writing Any Code

All 9 ADRs from `MASTER_CONTEXT.md` are binding. The ones most relevant to this phase:

**ADR-001:** Never use separate find + save for any booking-adjacent operation. Use `findOneAndUpdate` with conditions.

**ADR-004:** Never read financial fields from DoctorProfile for display in this feature. Always read `consultationFee`, `platformCommission`, and `doctorEarnings` from the Appointment document.

**ADR-005:** All dates displayed to users use `DD/MM/YYYY` format. All dates stored and transmitted use `YYYY-MM-DD` string format. Never use JavaScript Date objects in stored data.

**ADR-006:** Email is fire-and-forget. If you send any email notification in this phase, never `await` it.

**ADR-007:** SessionRecord is a separate collection linked to Appointment via ObjectId. Never embed session data inside the Appointment document.

All controller functions use `asyncHandler`. All errors use `throw new AppError(message, statusCode)`. All responses use `res.status(code).json(apiResponse.success(data, message))`. Role guards go on routes, never inside controllers. Read-only queries use `.lean()`. Comments explain WHY, not WHAT.

---

### Part 1 — Data Model

**File:** `server/src/models/SessionRecord.model.js`

This model already exists in the file tree per `MASTER_CONTEXT.md`. Verify it matches the schema below exactly. If it does not exist, create it. Do not modify `Appointment.model.js`.

```javascript
import mongoose from 'mongoose';

const exercisePrescriptionItemSchema = new mongoose.Schema({
  exerciseName: { type: String, required: true, trim: true },
  sets:         { type: Number, min: 1, default: null },
  reps:         { type: Number, min: 1, default: null },
  frequency:    { type: String, default: null },  // e.g. 'twice daily', '3x per week'
  duration:     { type: String, default: null },  // e.g. '30 seconds', '10 minutes'
  notes:        { type: String, default: null }
}, { _id: true });

const sessionRecordSchema = new mongoose.Schema({

  // ── Core references ──────────────────────────────────
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true  // One record per appointment — enforced at DB level
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorProfile',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ── Clinical fields ───────────────────────────────────
  presentingCondition: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  treatmentProvided: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  progressRating: {
    type: String,
    required: true,
    enum: ['worse', 'no_change', 'slight_improvement', 'significant_improvement', 'resolved']
  },
  painScoreBefore: { type: Number, min: 0, max: 10, default: null },
  painScoreAfter:  { type: Number, min: 0, max: 10, default: null },
  exercisePrescription: {
    type: [exercisePrescriptionItemSchema],
    default: []
  },
  medications: {
    type: [String],
    default: []
  },
  clinicalObservations: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: null
  },
  followUpRecommendation: {
    recommended:   { type: Boolean, default: false },
    intervalDays:  { type: Number, default: null },  // e.g. 7, 14, 30
    suggestedDate: { type: String, default: null },  // YYYY-MM-DD string — ADR-005
    sessionGoal:   { type: String, default: null }   // What to achieve next session
  },

  // ── Visibility ────────────────────────────────────────
  isSharedWithPatient: {
    type: Boolean,
    default: true  // Shared by default — doctor must explicitly opt out
  },

  // ── Audit fields ─────────────────────────────────────
  doctorSignedAt: {
    type: Date,
    default: null  // Set at creation time — used for 24-hour edit window
  },

  // [ENHANCEMENT] Edit audit trail
  // Every time the doctor edits within the 24-hour window, append a record here.
  // This enables compliance review if a patient disputes a change.
  editHistory: [{
    editedAt:      { type: Date, required: true },
    changedFields: { type: [String], required: true }
  }],

  // [ENHANCEMENT] Soft archive — admin-only
  // Never hard-delete session records. Archived records are hidden from
  // patient timeline and doctor history views but remain in the database
  // for compliance and dispute resolution.
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt:   { type: Date, default: null },
  archivedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }

}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────
sessionRecordSchema.index({ appointment: 1 }, { unique: true });
sessionRecordSchema.index({ doctor: 1 });
sessionRecordSchema.index({ patient: 1 });
// [ENHANCEMENT] Compound index for patient timeline query (most common read path)
sessionRecordSchema.index({ patient: 1, isSharedWithPatient: 1, createdAt: -1 });
// [ENHANCEMENT] Index for doctor history query
sessionRecordSchema.index({ doctor: 1, createdAt: -1 });

const SessionRecord = mongoose.model('SessionRecord', sessionRecordSchema);
export default SessionRecord;
```

---

### Part 2 — Validation

**File:** `server/src/validations/sessionRecord.validation.js`

Create this file. Use Joi, following the pattern in `server/src/validations/appointment.validation.js`.

```javascript
import Joi from 'joi';

// Shared progress rating values — also used in frontend badge colors
export const PROGRESS_RATING_VALUES = [
  'worse',
  'no_change',
  'slight_improvement',
  'significant_improvement',
  'resolved'
];

const exerciseItemSchema = Joi.object({
  exerciseName: Joi.string().trim().required(),
  sets:         Joi.number().integer().min(1).allow(null).default(null),
  reps:         Joi.number().integer().min(1).allow(null).default(null),
  frequency:    Joi.string().trim().allow(null, '').default(null),
  duration:     Joi.string().trim().allow(null, '').default(null),
  notes:        Joi.string().trim().allow(null, '').max(300).default(null)
});

export const createSessionRecordSchema = Joi.object({
  presentingCondition:  Joi.string().trim().min(1).max(500).required(),
  treatmentProvided:    Joi.string().trim().min(1).max(1000).required(),
  progressRating:       Joi.string().valid(...PROGRESS_RATING_VALUES).required(),
  painScoreBefore:      Joi.number().integer().min(0).max(10).allow(null).default(null),
  painScoreAfter:       Joi.number().integer().min(0).max(10).allow(null).default(null),
  exercisePrescription: Joi.array().items(exerciseItemSchema).default([]),
  medications:          Joi.array().items(Joi.string().trim()).default([]),
  clinicalObservations: Joi.string().trim().max(2000).allow(null, '').default(null),
  followUpRecommendation: Joi.object({
    recommended:   Joi.boolean().default(false),
    intervalDays:  Joi.number().integer().min(1).max(365).allow(null).default(null),
    suggestedDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .allow(null, '')
      .default(null)
      .messages({ 'string.pattern.base': 'Suggested date must be in YYYY-MM-DD format' }),
    sessionGoal: Joi.string().trim().max(300).allow(null, '').default(null)
  }).default({ recommended: false }),
  isSharedWithPatient: Joi.boolean().default(true)
});

// PUT updates allow the same fields — all optional since it's a partial update
export const updateSessionRecordSchema = Joi.object({
  presentingCondition:  Joi.string().trim().min(1).max(500),
  treatmentProvided:    Joi.string().trim().min(1).max(1000),
  progressRating:       Joi.string().valid(...PROGRESS_RATING_VALUES),
  painScoreBefore:      Joi.number().integer().min(0).max(10).allow(null),
  painScoreAfter:       Joi.number().integer().min(0).max(10).allow(null),
  exercisePrescription: Joi.array().items(exerciseItemSchema),
  medications:          Joi.array().items(Joi.string().trim()),
  clinicalObservations: Joi.string().trim().max(2000).allow(null, ''),
  followUpRecommendation: Joi.object({
    recommended:   Joi.boolean(),
    intervalDays:  Joi.number().integer().min(1).max(365).allow(null),
    suggestedDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).allow(null, ''),
    sessionGoal:   Joi.string().trim().max(300).allow(null, '')
  }),
  isSharedWithPatient: Joi.boolean()
}).min(1);  // Reject empty update bodies
```

---

### Part 3 — Service Layer

**File:** `server/src/services/sessionRecord.service.js`

Thick service layer — all business logic lives here. Controllers call service functions and return the result. No business logic in controllers.

---

#### `createSessionRecord(doctorUserId, appointmentId, recordData)`

```
1. Find appointment by appointmentId
   If not found: throw AppError('Appointment not found', 404)

2. Verify appointment.status === 'completed'
   If not: throw AppError('Session records can only be created for completed appointments', 400)

3. Find DoctorProfile where user === doctorUserId
   If not found: throw AppError('Doctor profile not found', 404)

4. Verify appointment.doctor.toString() === doctorProfile._id.toString()
   // Ownership check — ADR pattern: explicit string comparison, never rely on type coercion
   If mismatch: throw AppError('Unauthorized — this appointment belongs to another doctor', 403)

5. Check no session record already exists for this appointment
   Existing = await SessionRecord.findOne({ appointment: appointmentId })
   If exists: throw AppError('A session record already exists for this appointment', 409)

6. [ENHANCEMENT — AUDIT] Compute which fields were provided at creation
   This initializes editHistory as an empty array. The first submission is the signed record,
   not an edit. Do not add to editHistory on creation.

7. Create SessionRecord:
   {
     ...recordData,
     appointment: appointmentId,
     doctor: doctorProfile._id,
     patient: appointment.patient,
     doctorSignedAt: new Date(),
     editHistory: [],
     isArchived: false
   }

8. Fire follow-up notification (fire-and-forget — never await — ADR-006):
   If recordData.followUpRecommendation?.recommended === true:
     notificationService.create({
       user: appointment.patient,
       type: 'FOLLOW_UP_RECOMMENDED',
       content: `Dr. ${doctorProfile.user.name} recommends a follow-up session${
         recordData.followUpRecommendation.suggestedDate
           ? ` on ${formatDisplayDate(recordData.followUpRecommendation.suggestedDate)}`
           : ''
       }. Book your next appointment to continue your recovery.`,
       relatedAppointment: appointmentId,
       relatedDoctor: doctorProfile._id  // Used by frontend to deep-link to booking page
     })

9. Fire session available notification (fire-and-forget — never await — ADR-006):
   If recordData.isSharedWithPatient !== false:
     notificationService.create({
       user: appointment.patient,
       type: 'SESSION_RECORD_AVAILABLE',
       content: `Your session record from ${formatDisplayDate(appointment.date)} with Dr. ${doctorProfile.user.name} is now available. View your treatment notes and exercise plan.`,
       relatedAppointment: appointmentId
     })

10. Return created SessionRecord

Notes:
- To get doctorProfile.user.name, populate the user field when fetching DoctorProfile:
  DoctorProfile.findOne({ user: doctorUserId }).populate('user', 'name')
- formatDisplayDate converts 'YYYY-MM-DD' → 'DD/MM/YYYY' (ADR-005)
  Use the existing date utility in server/src/utils/date.js
```

---

#### `getSessionRecordByAppointment(appointmentId, requestingUserId, requestingRole)`

```
1. Find SessionRecord where appointment === appointmentId AND isArchived !== true
   Populate appointment: date, startTime, endTime, consultationFee
   Populate doctor: (then its user: name, profileImage)
   If not found: throw AppError('No session record found for this appointment', 404)

2. Access control by role:

   role === 'patient':
     Verify record.patient.toString() === requestingUserId.toString()
     If mismatch: throw AppError('Access denied — this is not your appointment', 403)
     Verify record.isSharedWithPatient === true
     If not shared: throw AppError('This record has not been shared by your doctor', 403)

   role === 'doctor':
     Find DoctorProfile where user === requestingUserId
     Verify record.doctor.toString() === doctorProfile._id.toString()
     If mismatch: throw AppError('Access denied — this record belongs to another doctor', 403)
     // Doctors can view their own records even if isSharedWithPatient is false

   role === 'admin':
     Allow always — admin has read access for operational and compliance purposes

3. Return SessionRecord with all populated fields
```

---

#### `updateSessionRecord(doctorUserId, appointmentId, updateData)`

```
1. Find SessionRecord where appointment === appointmentId AND isArchived !== true
   If not found: throw AppError('Session record not found', 404)

2. Find DoctorProfile where user === doctorUserId
   Verify record.doctor.toString() === doctorProfile._id.toString()
   If mismatch: throw AppError('Unauthorized — this is not your record', 403)

3. [ENHANCEMENT — 24-HOUR WINDOW ENFORCEMENT]
   // Use doctorSignedAt (creation time), not record.createdAt, for the window check.
   // This is deliberate: doctorSignedAt is the clinical signature moment.
   const msElapsed = Date.now() - new Date(record.doctorSignedAt).getTime()
   const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000  // 86_400_000
   if (msElapsed > EDIT_WINDOW_MS) {
     throw AppError('Session records can only be edited within 24 hours of signing', 403)
   }

4. [ENHANCEMENT — AUDIT TRAIL]
   // Track exactly which top-level fields changed in this edit.
   const EDITABLE_FIELDS = [
     'presentingCondition', 'treatmentProvided', 'progressRating',
     'painScoreBefore', 'painScoreAfter', 'exercisePrescription',
     'medications', 'clinicalObservations', 'followUpRecommendation',
     'isSharedWithPatient'
   ]
   const changedFields = Object.keys(updateData).filter(k => EDITABLE_FIELDS.includes(k))
   
   // Append to editHistory — never replace it
   const editEntry = { editedAt: new Date(), changedFields }

5. Apply updates using findOneAndUpdate (atomic — ADR pattern):
   const updatedRecord = await SessionRecord.findOneAndUpdate(
     { appointment: appointmentId, isArchived: { $ne: true } },
     {
       ...sanitizedUpdateData,  // Only EDITABLE_FIELDS from updateData
       $push: { editHistory: editEntry }
     },
     { new: true, runValidators: true }
   )

6. Return updatedRecord

Guard: never allow updating appointment, doctor, patient, doctorSignedAt, editHistory
(directly), isArchived, archivedAt, archivedBy — strip these from updateData before
applying the update even if somehow passed in the request body.
```

---

#### `getDoctorSessionHistory(doctorUserId, { patientId, page = 1, limit = 10 })`

```
1. Find DoctorProfile where user === doctorUserId
   If not found: throw AppError('Doctor profile not found', 404)

2. Build query:
   { doctor: doctorProfile._id, isArchived: { $ne: true } }
   If patientId provided: add patient: new mongoose.Types.ObjectId(patientId)

3. const skip = (page - 1) * limit (coerce both to Number)

4. Run two queries in parallel:
   [records, total] = await Promise.all([
     SessionRecord.find(query)
       .sort({ createdAt: -1 })
       .skip(skip)
       .limit(limit)
       .populate('appointment', 'date startTime endTime consultationFee')
       .populate('patient', 'name profileImage')
       .lean(),
     SessionRecord.countDocuments(query)
   ])

5. Return { records, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
```

---

#### `getPatientCareTimeline(patientUserId, { doctorId, dateFrom, dateTo, page = 1, limit = 10 })`

```
Note the [ENHANCEMENT] parameters: doctorId, dateFrom, dateTo for filtering.

1. Build base query:
   { patient: patientUserId, isSharedWithPatient: true, isArchived: { $ne: true } }

2. [ENHANCEMENT — FILTER SUPPORT]
   If doctorId provided: add doctor: new mongoose.Types.ObjectId(doctorId)
   If dateFrom provided: add createdAt: { $gte: new Date(dateFrom) }
   If dateTo provided: merge createdAt: { ...existing, $lte: new Date(dateTo + 'T23:59:59Z') }

3. const skip = (page - 1) * limit

4. Run in parallel:
   [records, total] = await Promise.all([
     SessionRecord.find(query)
       .sort({ createdAt: -1 })
       .skip(skip)
       .limit(limit)
       .populate('appointment', 'date startTime endTime consultationFee')
       .populate({
         path: 'doctor',
         populate: { path: 'user', select: 'name profileImage' },
         select: 'specialization clinicName user'
       })
       .lean(),
     SessionRecord.countDocuments(query)
   ])

5. [ENHANCEMENT — SUMMARY METRICS]
   Also compute (in parallel with the above, not sequentially):
   const [uniqueDoctors, totalSessions, latestRecord] = await Promise.all([
     SessionRecord.distinct('doctor', { patient: patientUserId, isSharedWithPatient: true, isArchived: { $ne: true } }),
     SessionRecord.countDocuments({ patient: patientUserId, isSharedWithPatient: true, isArchived: { $ne: true } }),
     SessionRecord.findOne({ patient: patientUserId, isSharedWithPatient: true, isArchived: { $ne: true } })
       .sort({ createdAt: -1 })
       .select('progressRating')
       .lean()
   ])

   Return {
     records,
     pagination: { page, limit, total, pages: Math.ceil(total / limit) },
     summary: {
       totalSessions,
       doctorsSeen: uniqueDoctors.length,
       latestProgressRating: latestRecord?.progressRating ?? null
     }
   }
```

---

#### `archiveSessionRecord(adminUserId, appointmentId)` [ENHANCEMENT]

```
Admin-only. Soft-delete a session record for compliance or operational reasons.

1. Find SessionRecord where appointment === appointmentId
   If not found: throw AppError('Session record not found', 404)
   If already archived: throw AppError('Session record is already archived', 409)

2. findOneAndUpdate atomically:
   {
     isArchived: true,
     archivedAt: new Date(),
     archivedBy: adminUserId
   }

3. Return updated record

This is permanent (for this session). There is no unarchive endpoint.
Archived records remain in the database and are visible to admins via
direct database queries but are excluded from all patient and doctor
facing endpoints via the isArchived: { $ne: true } query guard.
```

---

### Part 4 — Controller

**File:** `server/src/controllers/sessionRecord.controller.js`

All functions wrapped in `asyncHandler`. Thin controllers — delegate all logic to the service layer. Follow the pattern in `server/src/controllers/appointment.controller.js`.

```javascript
import asyncHandler from '../utils/asyncHandler.js';
import apiResponse from '../utils/apiResponse.js';
import * as sessionRecordService from '../services/sessionRecord.service.js';

export const createSessionRecord = asyncHandler(async (req, res) => {
  const record = await sessionRecordService.createSessionRecord(
    req.user._id,
    req.params.appointmentId,
    req.body
  );
  res.status(201).json(apiResponse.success(record, 'Session record created'));
});

export const getSessionRecord = asyncHandler(async (req, res) => {
  const record = await sessionRecordService.getSessionRecordByAppointment(
    req.params.appointmentId,
    req.user._id,
    req.user.role
  );
  res.status(200).json(apiResponse.success(record, 'Session record retrieved'));
});

export const updateSessionRecord = asyncHandler(async (req, res) => {
  const record = await sessionRecordService.updateSessionRecord(
    req.user._id,
    req.params.appointmentId,
    req.body
  );
  res.status(200).json(apiResponse.success(record, 'Session record updated'));
});

export const getDoctorHistory = asyncHandler(async (req, res) => {
  const { patientId, page = 1, limit = 10 } = req.query;
  const result = await sessionRecordService.getDoctorSessionHistory(
    req.user._id,
    { patientId, page: Number(page), limit: Number(limit) }
  );
  res.status(200).json(apiResponse.success(result, 'Doctor session history retrieved'));
});

export const getPatientTimeline = asyncHandler(async (req, res) => {
  const { doctorId, dateFrom, dateTo, page = 1, limit = 10 } = req.query;
  const result = await sessionRecordService.getPatientCareTimeline(
    req.user._id,
    { doctorId, dateFrom, dateTo, page: Number(page), limit: Number(limit) }
  );
  res.status(200).json(apiResponse.success(result, 'Patient care timeline retrieved'));
});

// [ENHANCEMENT] Admin archive
export const archiveSessionRecord = asyncHandler(async (req, res) => {
  const record = await sessionRecordService.archiveSessionRecord(
    req.user._id,
    req.params.appointmentId
  );
  res.status(200).json(apiResponse.success(record, 'Session record archived'));
});
```

---

### Part 5 — Routes

**File:** `server/src/routes/sessionRecord.routes.js`

```javascript
import { Router } from 'express';
import { auth } from '../middleware/auth.middleware.js';
import { role } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createSessionRecordSchema, updateSessionRecordSchema } from '../validations/sessionRecord.validation.js';
import * as sessionRecordController from '../controllers/sessionRecord.controller.js';

const router = Router();

// CRITICAL ROUTE ORDER:
// Static paths (/doctor/history, /patient/timeline) MUST be defined BEFORE
// the dynamic path (/:appointmentId). Express matches top-to-bottom.
// If /:appointmentId is first, Express casts 'doctor' and 'patient' as
// MongoDB ObjectIds and throws a CastError.

// Doctor history — static path first
router.get(
  '/doctor/history',
  auth,
  role('doctor'),
  sessionRecordController.getDoctorHistory
);

// Patient timeline — static path first
router.get(
  '/patient/timeline',
  auth,
  role('patient'),
  sessionRecordController.getPatientTimeline
);

// Create session record — doctor only
router.post(
  '/:appointmentId',
  auth,
  role('doctor'),
  validate(createSessionRecordSchema),
  sessionRecordController.createSessionRecord
);

// Get session record — patient, doctor, and admin
router.get(
  '/:appointmentId',
  auth,
  role('doctor', 'patient', 'admin'),
  sessionRecordController.getSessionRecord
);

// Update session record — doctor only, within 24h (enforced in service)
router.put(
  '/:appointmentId',
  auth,
  role('doctor'),
  validate(updateSessionRecordSchema),
  sessionRecordController.updateSessionRecord
);

// [ENHANCEMENT] Archive session record — admin only
router.patch(
  '/:appointmentId/archive',
  auth,
  role('admin'),
  sessionRecordController.archiveSessionRecord
);

export default router;
```

**Mount in** `server/src/app.js`:
```javascript
import sessionRecordRoutes from './routes/sessionRecord.routes.js';
app.use('/api/session-records', sessionRecordRoutes);
```

---

### Part 6 — Notification Constants

**File to modify:** `server/src/utils/constants.js`

Add to the NOTIFICATION_TYPES object:
```javascript
SESSION_RECORD_AVAILABLE: 'SESSION_RECORD_AVAILABLE',
FOLLOW_UP_RECOMMENDED:    'FOLLOW_UP_RECOMMENDED',
```

---

### Part 7 — Doctor Appointments Integration

**File to modify:** `server/src/controllers/appointment.controller.js` (or the relevant service)

In `GET /api/appointments/doctor/mine`, after fetching the appointments array, attach a `hasSessionRecord` boolean to each appointment. Use the batch Set pattern — never query per-appointment (that is an N+1 query and will degrade under load):

```javascript
// After: const appointments = await Appointment.find(query).lean()

const appointmentIds = appointments.map(a => a._id);

// Single batch query — O(1) lookups via Set
const recordedDocs = await SessionRecord.find({
  appointment: { $in: appointmentIds },
  isArchived: { $ne: true }
}).select('appointment').lean();

const recordedSet = new Set(recordedDocs.map(r => r.appointment.toString()));

const appointmentsWithFlag = appointments.map(a => ({
  ...a,
  hasSessionRecord: recordedSet.has(a._id.toString())
}));

// Return appointmentsWithFlag instead of appointments
```

---

### Part 8 — Patient Appointments Integration

**File to modify:** `server/src/controllers/appointment.controller.js` (patient appointments endpoint)

In `GET /api/appointments/mine`, after fetching completed appointments, attach the full session record (or null) to each completed appointment. Only attach for `status === 'completed'` — there is no session record for pending/confirmed/cancelled appointments.

```javascript
// Fetch session records for all completed appointment IDs in one batch query
const completedIds = appointments
  .filter(a => a.status === 'completed')
  .map(a => a._id);

const sessionRecords = await SessionRecord.find({
  appointment: { $in: completedIds },
  isSharedWithPatient: true,
  isArchived: { $ne: true }
}).lean();

const sessionRecordMap = {};
sessionRecords.forEach(r => {
  sessionRecordMap[r.appointment.toString()] = r;
});

const appointmentsWithRecords = appointments.map(a => ({
  ...a,
  sessionRecord: a.status === 'completed'
    ? (sessionRecordMap[a._id.toString()] ?? null)
    : undefined  // Don't attach the key at all for non-completed appointments
}));
```

---

### Part 9 — API Client

**File:** `client/src/api/sessionRecord.api.js`

This file is referenced in `MASTER_CONTEXT.md` as a phase 14 addition. Create it:

```javascript
import axiosInstance from './axiosInstance.js';

export const createSessionRecordAPI = (appointmentId, data) =>
  axiosInstance.post(`/session-records/${appointmentId}`, data);

export const getSessionRecordAPI = (appointmentId) =>
  axiosInstance.get(`/session-records/${appointmentId}`);

export const updateSessionRecordAPI = (appointmentId, data) =>
  axiosInstance.put(`/session-records/${appointmentId}`, data);

export const getDoctorSessionHistoryAPI = (params) =>
  axiosInstance.get('/session-records/doctor/history', { params });

export const getPatientCareTimelineAPI = (params) =>
  axiosInstance.get('/session-records/patient/timeline', { params });
```

---

### Part 10 — SessionRecordForm (Doctor)

**File:** `client/src/pages/doctor/SessionRecordForm.jsx`

**Route:** `/doctor/appointments/:appointmentId/session-record`

Add this route to `client/src/routes/AppRoutes.jsx` inside the doctor protected routes block.

---

#### Design

This page uses `DashboardLayout`. Page background `#F7F9FB`. Max-width `1200px`. Padding `32px 40px`.

**Page title area** (use the existing `SectionHeader` pattern):
- Title: `Session Notes`
- Subtitle: `Document treatment details for this appointment`
- No action button in the header

**Appointment context bar** — sits immediately below the page title, above the form:
A card with `background: #F7F9FB`, `border: 1px solid #EEF2F6`, `border-radius: 12px`, `padding: 16px 24px`, `margin-bottom: 24px`. This card is not a form section — it is informational only.

Inside the context bar (horizontal flex, `gap: 32px`, `align-items: center`):
- Patient avatar circle (40px) with initials fallback — same pattern as existing appointment cards
- Patient name: Inter 600, 15px, `#1C2B3A`
- Separator dot `·` in `#A8B8C8`
- Date formatted as `Wednesday, 11 June 2026` — Inter 500, 13px, `#6B7C93`
- Separator dot `·`
- Time: `09:00 – 10:00` — Inter 500, 13px, `#6B7C93`
- Separator dot `·`
- Fee: `₹500` — Inter 600, 13px, `#0B4F6C` — read from `appointment.consultationFee` (ADR-004)

Fetch this data by calling `GET /api/appointments/doctor/mine` and finding the matching appointment by `appointmentId` from URL params.

---

#### [ENHANCEMENT] Draft Autosave

Before anything else in this component, implement localStorage draft saving:

```javascript
const DRAFT_KEY = `sessionRecord_draft_${appointmentId}`;

// On mount: check for existing draft and restore it
useEffect(() => {
  const savedDraft = localStorage.getItem(DRAFT_KEY);
  if (savedDraft) {
    try {
      const draft = JSON.parse(savedDraft);
      setFormData(draft);
      setHasDraft(true);  // triggers the resume banner
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }
}, []);

// On form change: debounced save to localStorage (500ms)
useEffect(() => {
  const timer = setTimeout(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
  }, 500);
  return () => clearTimeout(timer);
}, [formData]);

// On successful submission: clear draft
localStorage.removeItem(DRAFT_KEY);
```

If `hasDraft` is true on mount, show a resume banner directly below the context bar:
- Background `#E8F4F8`, border `1px solid #B3D5E4`, border-radius `8px`, padding `12px 16px`
- Icon: Lucide `RotateCcw` in `#0B4F6C`, 16px
- Text: `Draft restored from your last session` — Inter 500, 13px, `#0B4F6C`
- Right side: a ghost button `Discard Draft` (Inter 600, 12px, `#6B7C93`) that clears localStorage and resets form to defaults

---

#### Form Layout

The form is divided into four collapsible sections using accordion cards. Each section is a white card (`background: #FFFFFF`, shadow Level 1, `border-radius: 12px`, `margin-bottom: 16px`). The section header is a horizontal flex row with `padding: 16px 24px`, `cursor: pointer`, and a Lucide `ChevronDown` icon that rotates 180° when expanded. All sections start expanded. Toggle animation: `max-height` transition `300ms cubic-bezier(0.4, 0, 0.2, 1)`.

Section header typography: Inter 600, 15px, `#1C2B3A`. Section subtitle: Inter 400, 12px, `#6B7C93`, right-aligned in the header.

---

**Section 1 — Clinical Assessment** (required)

Fields inside (padding `24px`, `gap: 20px` between fields):

`Presenting Condition` — Textarea, 3 rows min, max 500 chars. Label: `Presenting Condition *`. Placeholder: `What brought the patient in today? Describe their primary complaint.` Character counter bottom-right: `{chars}/500` in Inter 400, 11px, `#A8B8C8`.

`Treatment Provided` — Textarea, 4 rows min, max 1000 chars. Label: `Treatment Provided *`. Placeholder: `Describe the treatment, techniques, and interventions used during this session.` Character counter: `{chars}/1000`.

`Progress Rating` — A horizontal segmented control. Five options: `Worse`, `No Change`, `Slight Improvement`, `Significant Improvement`, `Resolved`. Selected option fills with the appropriate color. Unselected options are gray text on white. Colors by value:
- `worse`: `#C0392B` background, white text
- `no_change`: `#B45309` background, white text  
- `slight_improvement`: `#0B4F6C` background, white text
- `significant_improvement`: `#0A7E6E` background, white text
- `resolved`: `#0A7E6E` background, white text, plus a Lucide `CheckCircle` icon 14px before the text

The entire segmented control has `border: 1.5px solid #DDE3EA`, `border-radius: 6px`, each segment `padding: 8px 12px`. On selection: smooth background transition `150ms`. Label above: `Progress Rating *`.

`Pain Scores (Optional)` — Two side-by-side number inputs on one row. Left: `Pain Before (0–10)`, right: `Pain After (0–10)`. Inputs are `width: 120px`, `height: 40px`, `text-align: center`, Inter 700, 16px. Only integers 0–10 accepted. Between them: a `→` arrow in `#A8B8C8`.

If both pain scores are filled: show a delta pill immediately to the right of the arrow:
- If after < before: `↓ {delta} better` — success green badge style
- If after > before: `↑ {delta} worse` — danger red badge style
- If equal: `No change` — neutral badge style

Section header subtitle shows: `{progressRating display name}` once a rating is selected, or `Required` in `#C0392B` if not.

---

**Section 2 — Exercise Prescription** (optional)

Section header subtitle: `{count} exercise{count !== 1 ? 's' : ''} added`.

If no exercises yet: an empty state inside the section — `background: #FAFBFC`, `border: 1px dashed #DDE3EA`, `border-radius: 8px`, `padding: 32px`, centered. Lucide `Dumbbell` icon 28px `#DDE3EA`. Text: `No exercises prescribed yet` Inter 700, 14px `#1C2B3A`. Sub-text: `Add exercises to give your patient a clear home program.` Inter 400, 12px `#6B7C93`.

`+ Add Exercise` button (primary style, `height: 36px`, Icon: Lucide `Plus` 14px) — centered below empty state or at bottom of exercise list.

Each exercise item is a white bordered row (`border: 1px solid #EEF2F6`, `border-radius: 8px`, `padding: 16px 20px`, `margin-bottom: 8px`):

Row 1: `Exercise Name` text input spanning full width.

Row 2 (four columns, `gap: 12px`): `Sets` number input (width 80px), `Reps` number input (width 80px), `Frequency` text input (placeholder: `e.g. twice daily`), `Duration` text input (placeholder: `e.g. 30 seconds`).

Row 3: `Notes` text input spanning full width, placeholder `Optional notes for this exercise`.

Top-right of each exercise item: Lucide `Trash2` icon `#C0392B`, 16px, cursor pointer. On click: remove exercise from array (no confirmation needed — it is easily re-added).

Adding a new exercise pushes a blank object to the array and scrolls the new item into view.

---

**Section 3 — Medications & Observations** (optional)

`Medications / Supplements` — A tag input. Type a medication name and press Enter or comma to add it as a chip. Each chip: `background: #E8F4F8`, `color: #0B4F6C`, `border-radius: 4px`, Inter 500, 12px, `padding: 3px 8px`, with an `×` button to remove. Input below chips: `border: 1.5px solid #DDE3EA`, `border-radius: 6px`, placeholder `Type a medication and press Enter`.

`Clinical Observations` — Textarea, 5 rows, max 2000 chars. Label: `Clinical Observations`. Placeholder: `Free-form clinical notes, professional observations, contraindications, special considerations.` Character counter: `{chars}/2000`.

---

**Section 4 — Follow-Up & Sharing** (optional)

`Recommend Follow-Up` toggle — A labeled toggle switch (same style as existing toggles in the codebase). Label: `Recommend Follow-Up Session`. When toggled ON, expand the follow-up fields below with a `max-height` animation `200ms`.

Follow-up fields (only visible when toggle is ON):
- `Suggested Return Date` — date input (`type="date"`, min set to tomorrow's date in YYYY-MM-DD format). Label: `Suggested Return Date`.
- `Return Interval` — select input. Options: `1 week`, `2 weeks`, `3 weeks`, `1 month`, `6 weeks`, `2 months`, `3 months`, `Custom`. When `Custom` is selected, show a number input for days. Selecting a preset auto-fills the date field (e.g. selecting `2 weeks` sets suggested date to today + 14 days). Label: `Follow-Up Interval`.
- `Session Goal` — text input, max 300 chars. Placeholder: `What should the next session aim to achieve?`. Label: `Session Goal (Optional)`.

`Share With Patient` toggle — below the follow-up section. Label: `Share With Patient`. Default: ON.

**[ENHANCEMENT] Confirmation modal when Share With Patient is toggled OFF:**
Do not show just a warning inline. When the toggle is switched from ON to OFF, intercept the toggle and show a modal (use the existing `Modal` component):
- Title: `Hide From Patient?`
- Body: `This record will be saved but your patient won't be able to see it. You can share it later by editing the record.`
- Two buttons: `Cancel` (ghost) and `Yes, Keep Private` (danger style)
- If `Cancel` is clicked: toggle stays ON (shared)
- If `Yes, Keep Private` is clicked: toggle turns OFF

---

#### Form Footer

Fixed to the bottom of the page (not the viewport — bottom of the form layout, after all sections). `border-top: 1px solid #EEF2F6`, `padding: 20px 40px`, `background: #FFFFFF`.

Left side: If the record already exists (edit mode): `Last saved {time}` in Inter 400, 12px, `#A8B8C8`.

Right side (flex row, `gap: 12px`):
- `Cancel` button (ghost style) — navigates back to `/doctor/appointments`
- `Save Session Record` button (primary style, 40px height) — submits the form. Loading state: shows Lucide `Loader2` spinning icon + `Saving…` text. Disabled while loading.

On successful creation: `toast.success('Session record saved successfully')`. Navigate to `/doctor/appointments` after a `500ms` delay.

On error: `toast.error(err.response?.data?.message || 'Failed to save session record. Please try again.')`.

**Edit mode:** If a session record already exists for this appointment (detected by a `409` response on initial load attempt, or by `hasSessionRecord` flag), load the existing record data into the form and switch to PUT on submit. Show an edit mode indicator in the context bar: `· Editing` in warning amber, Inter 500, 12px. If the 24-hour window has expired, show the form in read-only mode with a banner: `This record was finalized on {date}. The 24-hour edit window has closed.` — no save button in read-only mode.

---

### Part 11 — Doctor Appointments Page Integration

**File to modify:** `client/src/pages/doctor/DoctorAppointments.jsx`

For each appointment row where `status === 'completed'`:

If `hasSessionRecord === false`:
- Show `Add Session Notes →` button — primary style, `height: 32px`, Inter 600, 12px
- On click: `navigate('/doctor/appointments/${appointment._id}/session-record')`

If `hasSessionRecord === true`:
- Show `View Notes →` — text link, `color: #0B4F6C`, Inter 600, 12px, no button border
- On click: `navigate('/doctor/appointments/${appointment._id}/session-record')` (opens in edit/read mode)

---

### Part 12 — PatientCareTimeline (Patient)

**File:** `client/src/pages/patient/PatientCareTimeline.jsx`

**Route:** `/patient/care-timeline`

Add to `client/src/routes/AppRoutes.jsx` inside patient protected routes.

Add `Care History` to the patient sidebar navigation — between `My Appointments` and `Payment History`. Icon: Lucide `ClipboardList`.

---

#### Page Structure

Page title: `Care History`. Subtitle: `Your complete treatment journey across all physiotherapists.`

---

#### [ENHANCEMENT] Summary Metrics Row

Three metric cards in a horizontal row, `gap: 20px`, below the page title and above the filter bar.

Each card: white background, shadow Level 1, `border-radius: 12px`, `padding: 20px 24px`.
- Card 1: `TOTAL SESSIONS` — value from `data.summary.totalSessions` — Inter 800, 28px, `#1C2B3A`
- Card 2: `DOCTORS SEEN` — value from `data.summary.doctorsSeen` — same style
- Card 3: `LATEST PROGRESS` — the `latestProgressRating` rendered as a colored badge (same badge colors as the form's progress rating segmented control). If null: `-`

---

#### [ENHANCEMENT] Filter Bar

A horizontal filter row below the summary metrics, above the timeline list. `background: #FFFFFF`, shadow Level 1, `border-radius: 12px`, `padding: 16px 24px`, `margin-bottom: 24px`.

Filters (left to right):
- `Filter by Doctor` — a select dropdown. Options built from unique doctors in the fetched records. Default: `All Doctors`. Selecting updates `doctorId` query param.
- `From Date` — date input
- `To Date` — date input
- `Clear Filters` — ghost button (only visible if any filter is active)

Changing any filter resets to page 1 and re-fetches. The filter state lives in local component state (not URL params — this is not a shareable URL feature).

---

#### Timeline Item Design

Each session record renders as a horizontal card, `border-radius: 12px`, shadow Level 1, `padding: 0`, `margin-bottom: 16px`, `overflow: hidden`. Staggered load animation: `opacity 0 → 1` at `250ms + index * 60ms cubic-bezier(0.4, 0, 0.2, 1)`. Respects `prefers-reduced-motion`.

**Left zone (220px wide, fixed):**
- Background: `#0B4F6C`
- Border-radius: `12px 0 0 12px`
- Padding: `20px`
- Flex-column, `justify-content: center`, `gap: 8px`
- Doctor avatar: if `doctor.user.profileImage` exists — circular 48px image. If not — initials circle, white background, `#0B4F6C` text, 48px, Inter 700, 18px
- Doctor name: `Dr. {name}` — white, Inter 700, 14px
- Specialization: first item from `doctor.specialization` array — `rgba(255,255,255,0.7)`, Inter 500, 11px
- Appointment date formatted as `DD/MM/YYYY` — `rgba(255,255,255,0.6)`, Inter 400, 11px (ADR-005)

**Right zone (flex: 1):**
- Background: `#FFFFFF`
- Border-radius: `0 12px 12px 0`
- Padding: `20px 24px`
- Flex-column, `gap: 10px`

Row 1 — Progress and pain:
- Left: progress badge using the color system from the form. UPPERCASE badge text (ADR typography).
- Right: if both pain scores exist — `Pain: {before}/10 → {after}/10`. The arrow colored by direction: `#0A7E6E` if improved, `#C0392B` if worsened, `#6B7C93` if unchanged. Inter 500, 12px.

Row 2 — Treatment summary:
- `treatmentProvided` text, `-webkit-line-clamp: 2`, `overflow: hidden`. Inter 400, 13px, `#3D5166`.

Row 3 — Exercise and medication counts (if either exists):
- `{count} exercise{count !== 1 ? 's' : ''} prescribed` — Lucide `Dumbbell` icon 14px, Inter 500, 12px, `#0B4F6C`
- `{medications.join(' · ')}` truncated — Lucide `Pill` icon 14px, Inter 400, 12px, `#6B7C93`
- Only show rows if data exists — no empty rows

Row 4 — Follow-up chip (only if `followUpRecommendation.recommended === true`):
- Chip: `border: 1px solid #B3D5E4`, `border-radius: 8px`, `background: #E8F4F8`, `padding: 6px 12px`
- Lucide `Calendar` icon 14px `#0B4F6C` + `Follow-up: {suggestedDate formatted DD/MM/YYYY}` — Inter 500, 12px, `#0B4F6C`
- Separator `·`
- [ENHANCEMENT] `Book Now →` — this link should navigate to `/doctors/{doctorProfileId}#book`, not `/doctors/{doctorProfileId}`. The `#book` hash causes the DoctorDetailPage to scroll the slot picker into view on load. This saves one tap compared to landing on the profile top. Color: `#F4845F`, Inter 600, 12px.

Bottom of right zone:
- `View Full Record →` — `color: #0B4F6C`, Inter 600, 12px, right-aligned, cursor pointer

---

#### Expanded Record View (Inline)

When `View Full Record →` is clicked, the card expands downward below the summary zone. The expansion has `border-top: 1px solid #F0F4F7`, `padding: 20px 24px`. Animation: `max-height: 0 → 2000px`, `300ms ease-out`. `Collapse ↑` link at the bottom, same style as the expand link.

Expansion content:

**Presenting Condition** — section label Inter 600, 11px, UPPERCASE, `#6B7C93`. Content Inter 400, 13px, `#1C2B3A`.

**Treatment Provided** — same label style. Full text, not truncated.

**Clinical Observations** — same label style. Only shown if `clinicalObservations` is not null/empty.

**Exercise Prescription** — if `exercisePrescription.length > 0`:
Table with headers: `EXERCISE`, `SETS`, `REPS`, `FREQUENCY`, `DURATION` (UPPERCASE, Inter 600, 11px, `#6B7C93`). Table header row background `#F0F4F7`. Row height 48px. Inter 400, 13px, `#1C2B3A`. If `notes` exists on an exercise, show it as a second line in the Exercise cell in Inter 400, 11px, `#6B7C93`.

**[ENHANCEMENT] Export Button** — above the exercise table, right-aligned:
`Download Exercise Plan` — ghost button, Lucide `Download` icon 14px. On click: generate a simple print-friendly view.

Implementation: open `window.print()` with a temporary print-only `<div>` injected into the DOM containing the patient name, date, doctor name, and exercise table. Use a `<style>` tag scoped to `@media print` that hides everything except this div. Remove the div after printing. This requires zero backend work and produces a clean printable page.

**Medications** — if `medications.length > 0`:
Chips rendered identically to the form's tag chips. `background: #E8F4F8`, `color: #0B4F6C`, `border-radius: 4px`, Inter 500, 12px.

**Follow-Up Details** — if recommended:
- `Suggested Date`: formatted DD/MM/YYYY
- `Interval`: `{intervalDays} days`
- `Session Goal`: text if provided

**Record metadata** (bottom of expansion, `border-top: 1px solid #F0F4F7`, `padding-top: 12px`, `margin-top: 12px`):
- `Signed by Dr. {name} on {date formatted as DD MMMM YYYY}` — Inter 400, 11px, `#A8B8C8`
- If `editHistory.length > 0`: `Last edited {editedAt formatted as DD MMMM YYYY at HH:mm}` — same style

---

#### Empty State

```
Container: background #FAFBFC, border 1px dashed #DDE3EA, border-radius 12px, padding 48px
Icon: Lucide ClipboardList, 32px, #DDE3EA
Title: No care records yet — Inter 700, 18px, #1C2B3A, Title Case
Description: Your session records will appear here after your physiotherapist
             completes their notes following each appointment. — Inter 400, 13px, #6B7C93
```

---

### Part 13 — Patient Appointments Integration

**File to modify:** `client/src/pages/patient/MyAppointments.jsx`

For each row where `status === 'completed'`:

If `sessionRecord` is not null (exists and is shared):
- Show `View Session Notes →` text link, `color: #0B4F6C`, Inter 600, 12px
- On click: expand the appointment row inline (not a navigation) to show the session record summary — use the same card design as the PatientCareTimeline expanded view but without the left colored zone

If `sessionRecord` is null:
- Show `Awaiting doctor's notes` — Inter 400, 12px, `#A8B8C8`, `font-style: italic`
- No interaction

---

### Part 14 — Notification Rendering

**File to modify:** `client/src/components/common/NotificationBell.jsx` (or wherever notifications are rendered into list items)

Add handling for the two new notification types. Follow the existing pattern for other notification types in this file:

```javascript
case 'SESSION_RECORD_AVAILABLE':
  return {
    icon: ClipboardList,  // Lucide
    color: '#0B4F6C',
    navigateTo: '/patient/appointments'
  };

case 'FOLLOW_UP_RECOMMENDED':
  return {
    icon: Calendar,  // Lucide
    color: '#0A7E6E',
    navigateTo: notification.relatedDoctor
      ? `/doctors/${notification.relatedDoctor}#book`
      : '/patient/appointments'
  };
```

The `relatedDoctor` field on the notification was set by the service layer in Part 3. Ensure the Notification model and notification service support storing and returning this field. If `relatedDoctor` is not currently on the Notification model, add it:
```javascript
relatedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorProfile', default: null }
```

---

### Part 15 — AppRoutes Registration

**File to modify:** `client/src/routes/AppRoutes.jsx`

Add inside the doctor protected routes:
```jsx
<Route path="/doctor/appointments/:appointmentId/session-record" element={<SessionRecordForm />} />
```

Add inside the patient protected routes:
```jsx
<Route path="/patient/care-timeline" element={<PatientCareTimeline />} />
```

Import both components at the top of AppRoutes.jsx.

---

### Part 16 — Verification Checklist

After full implementation, verify every item below before marking phase 14 complete.

**Backend — Core CRUD:**
- [ ] `POST /api/session-records/:appointmentId` with doctor token and valid body returns 201
- [ ] `POST` for a non-completed appointment returns 400 with message about completed status
- [ ] `POST` by wrong doctor (not on the appointment) returns 403
- [ ] `POST` when a record already exists for this appointment returns 409
- [ ] `POST` with missing required fields returns 400 with Joi validation errors
- [ ] `GET /api/session-records/:appointmentId` with patient token returns record only if `isSharedWithPatient: true`
- [ ] `GET` with patient token for unshared record returns 403
- [ ] `GET` with wrong patient token returns 403
- [ ] `GET` with admin token succeeds regardless of `isSharedWithPatient`
- [ ] `PUT /api/session-records/:appointmentId` within 24 hours by owning doctor succeeds with 200
- [ ] `PUT` after 24 hours returns 403 with edit window message
- [ ] `PUT` by wrong doctor returns 403
- [ ] `PUT` with empty body returns 400 (Joi `.min(1)` guard)
- [ ] `PUT` does not allow updating appointment, doctor, patient, or doctorSignedAt fields
- [ ] `PUT` appends to `editHistory` — verify the array grows with each edit
- [ ] `GET /api/session-records/doctor/history` returns only this doctor's records, paginated
- [ ] `GET /api/session-records/patient/timeline` returns only shared, non-archived records for this patient
- [ ] `GET /api/session-records/patient/timeline` with `doctorId` filter returns correctly scoped records
- [ ] `PATCH /api/session-records/:appointmentId/archive` with admin token sets `isArchived: true`
- [ ] Archived records do not appear in patient timeline or doctor history
- [ ] `GET /api/appointments/doctor/mine` now includes `hasSessionRecord` boolean on each appointment
- [ ] `GET /api/appointments/mine` now includes `sessionRecord` object (or null) on completed appointments

**Backend — Notifications:**
- [ ] Creating a record with `isSharedWithPatient: true` creates a `SESSION_RECORD_AVAILABLE` notification for the patient
- [ ] Creating a record with `followUpRecommendation.recommended: true` creates a `FOLLOW_UP_RECOMMENDED` notification for the patient
- [ ] Creating a record with `isSharedWithPatient: false` does NOT create a `SESSION_RECORD_AVAILABLE` notification
- [ ] Creating a record with `followUpRecommendation.recommended: false` does NOT create a `FOLLOW_UP_RECOMMENDED` notification
- [ ] Both notification types are in `constants.js`

**Frontend — SessionRecordForm:**
- [ ] Form loads with the appointment context bar showing correct patient name, date, time, and fee
- [ ] Fee is read from `appointment.consultationFee`, not re-fetched from DoctorProfile
- [ ] Draft autosave: change a field, navigate away, return — form state is restored
- [ ] Draft resume banner appears on return and `Discard Draft` clears the form
- [ ] Progress rating segmented control visually updates with correct color on selection
- [ ] Pain score delta pill shows correct direction, value, and color
- [ ] Adding an exercise increases the Section 2 header subtitle count
- [ ] Removing an exercise decreases the count
- [ ] Follow-up toggle expands/collapses the recommendation fields
- [ ] Interval preset selection updates the suggested date automatically
- [ ] Share With Patient toggle OFF shows confirmation modal — Cancel keeps it ON, confirm turns it OFF
- [ ] Save button shows loading state during submission
- [ ] Successful submission shows toast and navigates back to `/doctor/appointments` after 500ms
- [ ] Form loads in edit mode if a record exists — existing data is pre-filled
- [ ] Edit mode: read-only banner + no save button when 24-hour window has expired

**Frontend — Doctor Appointments:**
- [ ] Completed appointments without records show `Add Session Notes →` primary button
- [ ] Completed appointments with records show `View Notes →` text link
- [ ] Both navigate to the correct session record route

**Frontend — PatientCareTimeline:**
- [ ] Summary metrics row shows correct total sessions, doctors seen, latest progress
- [ ] Filter by doctor works — list updates correctly
- [ ] Filter by date range works — list updates correctly
- [ ] `Clear Filters` button appears when filters are active and clears them
- [ ] Timeline cards render with correct left zone (doctor info) and right zone (record summary)
- [ ] Progress badge uses correct color for each enum value
- [ ] Pain arrow direction and color correct
- [ ] `View Full Record →` expands inline with animation
- [ ] Exercise table renders in expanded view
- [ ] `Download Exercise Plan` opens print dialog with correct content
- [ ] `Collapse ↑` closes the expansion
- [ ] `Book Now →` on follow-up chip navigates to `/doctors/{id}#book`
- [ ] Empty state shows correctly when no records exist
- [ ] Staggered load animation works (or is disabled for `prefers-reduced-motion`)
- [ ] Page appears in patient sidebar navigation as `Care History`

**Frontend — Patient Appointments:**
- [ ] Completed rows with shared records show `View Session Notes →`
- [ ] Completed rows without shared records show `Awaiting doctor's notes` in italic gray

**Frontend — Notifications:**
- [ ] `SESSION_RECORD_AVAILABLE` notification renders with `ClipboardList` icon
- [ ] `SESSION_RECORD_AVAILABLE` notification navigates to `/patient/appointments` on click
- [ ] `FOLLOW_UP_RECOMMENDED` notification renders with `Calendar` icon
- [ ] `FOLLOW_UP_RECOMMENDED` notification navigates to `/doctors/{id}#book` when `relatedDoctor` is present

---

### Summary of Enhancements vs Base Plan

| Enhancement | Where | Why |
|---|---|---|
| `editHistory[]` audit array on schema | Model, Service (updateSessionRecord) | Healthcare compliance — track what changed and when |
| `isArchived` soft-delete + admin endpoint | Model, Service, Routes, Controller | Never hard-delete clinical records; admin operational safety |
| 24-hour window uses `doctorSignedAt`, not `createdAt` | Service (updateSessionRecord) | `doctorSignedAt` is the clinical signing moment — semantically correct |
| Draft autosave to localStorage | SessionRecordForm | Prevents data loss on tab close or navigation during long form completion |
| Timeline filters (doctor + date range) | Service (getPatientCareTimeline), PatientCareTimeline | Timeline becomes unusable without filters at 10+ records |
| `Book Now →` deep links to `#book` hash | PatientCareTimeline | Saves one tap — user lands directly at the slot picker |
| Exercise plan print export | PatientCareTimeline (expanded view) | High patient value, zero backend cost |
| Share toggle confirmation modal | SessionRecordForm | Prevents accidental unsharing — currently a silent toggle |
| Summary metrics from parallel DB queries | Service (getPatientCareTimeline), PatientCareTimeline | Summary is computed in the same request, not a separate API call |
| Compound indexes for timeline and history | Model | Performance at scale — these are the two highest-traffic read paths |

---

phase 14 is complete when all 55 checklist items above pass in production.

Once verified, say **"Phase 16"** and the compliance tracking prompt will follow.