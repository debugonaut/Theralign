I have the full project summary internalized. Phase 13 complete, moving to Phase 14.

Two features to build from the brainstorm. I'll do them one at a time, starting with the most foundational one since everything else depends on it.

**Feature 1 — Session Records & Care Continuity (Phase 14)**
**Feature 2 — Pre-Booking Media Upload (Phase 15)**

Starting with Feature 1 now.

---

# Phase 14 — Session Records & Care Continuity

## Complete Implementation Prompt

---

Paste the Universal Design Prompt first, then this below it.

---

### Context

You are building Phase 14 of Theralign. Read `project-summary.md` fully before touching any file. Phases 1–13 are complete. The Appointment model, Payment model, Notification service, and Cloudinary upload infrastructure are all live. You are building on top of them — not modifying their core structure.

Phase 14 adds the clinical layer: after a doctor marks an appointment complete, they fill a structured Session Record. The patient receives it automatically. Both parties can reference it forever. This transforms Theralign from a booking platform into a care continuity platform.

---

### Part 1 — Data Model

**File to create:** `server/src/models/SessionRecord.model.js`

Do not modify the Appointment model. SessionRecord is a separate collection linked to Appointment by reference. This follows the existing pattern established by AppointmentMedia, Review, and Notification — all separate collections linked via appointment ID (see ADR in project-summary.md: "Appointment Collection Immutability").

```javascript
SessionRecord Schema:

appointment:
  type: ObjectId, ref: 'Appointment'
  required: true
  unique: true          // One session record per appointment — enforced at DB level

doctor:
  type: ObjectId, ref: 'DoctorProfile'
  required: true

patient:
  type: ObjectId, ref: 'User'
  required: true

// Clinical fields

presentingCondition:
  type: String
  required: true
  maxLength: 500
  // What the patient came in for this session

treatmentProvided:
  type: String
  required: true
  maxLength: 1000
  // What the doctor actually did during the session

progressRating:
  type: String
  enum: ['worse', 'no_change', 'slight_improvement', 'significant_improvement', 'resolved']
  required: true
  // Doctor's clinical assessment of patient progress

painScoreBefore:
  type: Number
  min: 0, max: 10
  default: null
  // Optional — doctor records patient's reported pain before session

painScoreAfter:
  type: Number
  min: 0, max: 10
  default: null
  // Optional — doctor records patient's reported pain after session

exercisePrescription:
  type: [{
    exerciseName: { type: String, required: true, trim: true },
    sets: { type: Number, min: 1, default: null },
    reps: { type: Number, min: 1, default: null },
    frequency: { type: String, default: null },   // e.g. 'twice daily', '3x per week'
    duration: { type: String, default: null },     // e.g. '30 seconds', '10 minutes'
    notes: { type: String, default: null }
  }]
  default: []
  // Structured exercise prescription — array of exercises

medications:
  type: [String]
  default: []
  // Array of medication/supplement names recommended

clinicalObservations:
  type: String
  maxLength: 2000
  default: null
  // Free-form clinical notes — the doctor's professional observations

followUpRecommendation:
  type: {
    recommended: { type: Boolean, default: false },
    intervalDays: { type: Number, default: null },   // e.g. 7, 14, 30
    suggestedDate: { type: String, default: null },  // YYYY-MM-DD format
    sessionGoal: { type: String, default: null }     // What to achieve next session
  }
  default: { recommended: false }

isSharedWithPatient:
  type: Boolean
  default: true
  // Doctor can choose not to share — defaults to shared

doctorSignedAt:
  type: Date
  default: null
  // When the doctor finalized and submitted the record

timestamps: true
```

**Indexes to add:**
```javascript
SessionRecordSchema.index({ appointment: 1 }, { unique: true })
SessionRecordSchema.index({ doctor: 1 })
SessionRecordSchema.index({ patient: 1 })
```

---

### Part 2 — Service Layer

**File to create:** `server/src/services/sessionRecord.service.js`

---

**`createSessionRecord(doctorUserId, appointmentId, recordData)`**

```
Steps:
1. Find appointment by ID
   File: server/src/models/Appointment.model.js
   
2. Verify appointment.status === 'completed'
   If not: throw new AppError('Session records can only be created for completed appointments', 400)

3. Verify the doctor on the appointment matches doctorUserId
   Find DoctorProfile where user === doctorUserId
   Verify appointment.doctor.toString() === doctorProfile._id.toString()
   If mismatch: throw new AppError('Unauthorized — this is not your appointment', 403)

4. Check no session record already exists for this appointment
   SessionRecord.findOne({ appointment: appointmentId })
   If exists: throw new AppError('A session record already exists for this appointment', 409)

5. Create SessionRecord document with all recordData fields
   Set doctor: doctorProfile._id
   Set patient: appointment.patient
   Set doctorSignedAt: new Date()

6. If followUpRecommendation.recommended is true AND suggestedDate exists:
   Create a notification for the patient via notification service
   Type: 'FOLLOW_UP_RECOMMENDED'
   Message: 'Dr. {doctorName} recommends a follow-up session on {suggestedDate}. Book your next appointment to continue your recovery.'
   Include the doctor's profile ID in relatedEntity so the notification links directly to that doctor's booking page

7. If isSharedWithPatient is true:
   Create a notification for the patient
   Type: 'SESSION_RECORD_AVAILABLE'
   Message: 'Your session record from {appointmentDate} with Dr. {doctorName} is now available. View your treatment notes and exercise plan.'

8. Return created SessionRecord
```

---

**`getSessionRecordByAppointment(appointmentId, requestingUserId, requestingRole)`**

```
Steps:
1. Find SessionRecord where appointment === appointmentId
   Populate appointment fields: date, startTime, endTime, consultationFee
   
2. If not found: throw new AppError('No session record found for this appointment', 404)

3. Access control:
   If requestingRole === 'patient':
     Verify record.patient.toString() === requestingUserId
     Verify record.isSharedWithPatient === true
     If not shared: throw new AppError('This record has not been shared by the doctor', 403)
   
   If requestingRole === 'doctor':
     Find DoctorProfile where user === requestingUserId
     Verify record.doctor.toString() === doctorProfile._id.toString()
   
   If requestingRole === 'admin':
     Allow always — admin has read access for operational purposes

4. Return SessionRecord
```

---

**`getDoctorSessionHistory(doctorUserId, { patientId, page, limit })`**

```
Purpose: Doctor views all their session records, optionally filtered by patient.

Steps:
1. Find DoctorProfile where user === doctorUserId
2. Build query: { doctor: doctorProfile._id }
   If patientId provided: add patient: patientId to query
3. Paginate, sort by createdAt descending
4. Populate appointment: date, startTime
5. Populate patient: name (from User via appointment)
6. Return paginated results
```

---

**`getPatientCareTimeline(patientUserId, { page, limit })`**

```
Purpose: Patient views their complete care history across all doctors.

Steps:
1. Query SessionRecord where patient === patientUserId AND isSharedWithPatient === true
2. Sort by createdAt descending
3. Populate appointment: date, startTime, consultationFee
4. Populate doctor: then populate doctor's user for name and profileImage
5. Return paginated results with rich doctor info
```

---

**`updateSessionRecord(doctorUserId, appointmentId, updateData)`**

```
Purpose: Doctor can edit a session record within 24 hours of creation.

Steps:
1. Find SessionRecord by appointmentId
2. Verify requesting doctor owns this record
3. Check record was created within last 24 hours:
   const hoursSinceCreation = (Date.now() - record.createdAt) / (1000 * 60 * 60)
   If > 24: throw new AppError('Session records can only be edited within 24 hours of creation', 403)
4. Apply updates — only allow specific fields to be updated:
   presentingCondition, treatmentProvided, progressRating,
   painScoreBefore, painScoreAfter, exercisePrescription,
   medications, clinicalObservations, followUpRecommendation, isSharedWithPatient
5. Never allow updating: appointment, doctor, patient, doctorSignedAt
6. Save and return
```

---

### Part 3 — Controller

**File to create:** `server/src/controllers/sessionRecord.controller.js`

All functions wrapped in asyncHandler. Follow existing controller pattern from `server/src/controllers/appointment.controller.js`.

```javascript
createSessionRecord(req, res):
  Calls sessionRecordService.createSessionRecord(req.user.id, req.params.appointmentId, req.body)
  Returns 201 with created record

getSessionRecord(req, res):
  Calls sessionRecordService.getSessionRecordByAppointment(
    req.params.appointmentId, req.user.id, req.user.role
  )
  Returns 200 with record

getDoctorHistory(req, res):
  const { patientId, page = 1, limit = 10 } = req.query
  Calls sessionRecordService.getDoctorSessionHistory(req.user.id, { patientId, page, limit })
  Returns 200 with paginated results

getPatientTimeline(req, res):
  const { page = 1, limit = 10 } = req.query
  Calls sessionRecordService.getPatientCareTimeline(req.user.id, { page, limit })
  Returns 200 with paginated results

updateSessionRecord(req, res):
  Calls sessionRecordService.updateSessionRecord(
    req.user.id, req.params.appointmentId, req.body
  )
  Returns 200 with updated record
```

---

### Part 4 — Routes

**File to create:** `server/src/routes/sessionRecord.routes.js`

```
POST   /api/session-records/:appointmentId
  requireAuth + requireRole('doctor')
  → createSessionRecord

GET    /api/session-records/:appointmentId
  requireAuth + requireRole('patient', 'doctor', 'admin')
  → getSessionRecord

PUT    /api/session-records/:appointmentId
  requireAuth + requireRole('doctor')
  → updateSessionRecord

GET    /api/session-records/doctor/history
  requireAuth + requireRole('doctor')
  → getDoctorHistory

GET    /api/session-records/patient/timeline
  requireAuth + requireRole('patient')
  → getPatientTimeline
```

**Mount in** `server/src/app.js`:
```javascript
import sessionRecordRoutes from './routes/sessionRecord.routes.js'
app.use('/api/session-records', sessionRecordRoutes)
```

**Critical route ordering:** Define `/doctor/history` and `/patient/timeline` BEFORE `/:appointmentId` in the route file. Express matches top-to-bottom — if `/:appointmentId` is first, it will match `doctor` and `patient` as appointment IDs and throw CastErrors.

---

### Part 5 — Validation

**File to modify:** `server/src/validations/` — add `sessionRecord.validation.js`

```javascript
createSessionRecordValidation = [
  body('presentingCondition')
    .notEmpty().withMessage('Presenting condition is required')
    .isLength({ max: 500 }),
  
  body('treatmentProvided')
    .notEmpty().withMessage('Treatment provided is required')
    .isLength({ max: 1000 }),
  
  body('progressRating')
    .notEmpty()
    .isIn(['worse', 'no_change', 'slight_improvement', 'significant_improvement', 'resolved'])
    .withMessage('Invalid progress rating'),
  
  body('painScoreBefore')
    .optional()
    .isInt({ min: 0, max: 10 }),
  
  body('painScoreAfter')
    .optional()
    .isInt({ min: 0, max: 10 }),
  
  body('exercisePrescription')
    .optional()
    .isArray()
    .withMessage('Exercise prescription must be an array'),
  
  body('exercisePrescription.*.exerciseName')
    .if(body('exercisePrescription').exists())
    .notEmpty()
    .withMessage('Exercise name is required for each exercise'),
  
  body('clinicalObservations')
    .optional()
    .isLength({ max: 2000 }),
  
  body('followUpRecommendation.intervalDays')
    .optional()
    .isInt({ min: 1, max: 365 }),
  
  body('followUpRecommendation.suggestedDate')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Suggested date must be in YYYY-MM-DD format')
]
```

---

### Part 6 — Frontend: Doctor Side

**File to create:** `client/src/pages/doctor/SessionRecordForm.jsx`

This page opens after a doctor marks an appointment complete. It can also be accessed from the doctor's appointments list by clicking `ADD SESSION NOTES →` on any completed appointment without a session record.

**Route:** `/doctor/appointments/:appointmentId/session-record`

Add this route to `client/src/routes/AppRoutes.jsx` inside the doctor protected routes section.

---

**Page Structure:**

The page uses the standard `DashboardLayout`. Page title follows the existing `SectionHeader` pattern.

Top section — appointment context bar. A gray bordered card (`background: #F7F9FB`, `border: 1px solid #EEF2F6`, `border-radius: 12px`, `padding: 16px 24px`) showing: patient name (first name + last initial), appointment date formatted as `Wednesday, 11 June 2026`, appointment time, and consultation fee. This gives the doctor context without leaving the form. Read this data from `GET /api/appointments/doctor/mine` using the appointmentId from the URL params — find the matching appointment in the response.

---

**The form is divided into five collapsible sections.** Each section is a card with a header zone and a body zone following the Theralign card pattern defined in the Universal Design Prompt. The header zone contains the section title and a collapse/expand chevron on the right. Sections start expanded. The doctor can collapse sections they have completed to reduce visual noise.

**Section 1 — Session Summary** (required fields — cannot be collapsed until filled)

Two full-width inputs stacked:

`PRESENTING CONDITION` — textarea, height `80px`, placeholder `What did the patient present with today? Describe their chief complaint and any relevant symptoms observed.`

`TREATMENT PROVIDED` — textarea, height `120px`, placeholder `Describe the treatment modalities applied, techniques used, and areas treated during this session.`

---

**Section 2 — Progress Assessment**

A horizontal row with two elements:

Left — `PROGRESS RATING` segmented control. Five options spanning full width of the left half:
- `WORSE` — if selected, background `#FDF2F2`, text `#C0392B`
- `NO CHANGE` — if selected, background `#F0F4F7`, text `#6B7C93`
- `SLIGHT IMPROVEMENT` — if selected, background `#FEF3E2`, text `#B45309`
- `SIGNIFICANT IMPROVEMENT` — if selected, background `#E8F8F5`, text `#0A7E6E`
- `RESOLVED` — if selected, background `#E8F4F8`, text `#0B4F6C`

Each option is a bordered rectangle. The color change on selection makes the clinical assessment immediately readable at a glance.

Right — pain score row. Two number inputs side by side: `PAIN BEFORE (0-10)` and `PAIN AFTER (0-10)`. Both optional. When both are filled: show a small delta indicator between them. If after < before: show `↓ {before - after} improvement` in success green. If after > before: show `↑ {after - before} increase` in danger red. If equal: show `= no change` in neutral gray. This gives the doctor instant visual feedback on whether the session helped.

---

**Section 3 — Exercise Prescription**

Header shows the count of exercises added — `EXERCISE PRESCRIPTION (3 exercises)` — updates reactively.

Add form at the top of the section body:

A two-row inline form:
- Row 1: `EXERCISE NAME` (50% width) + `FREQUENCY` (25% width) + `DURATION` (25% width)
- Row 2: `SETS` (20%) + `REPS` (20%) + `NOTES` (50%) + `ADD →` button (10%)

`ADD →` button: primary style, height `38px`.

Exercise list below the add form. Each exercise is a bordered row (`height: 64px`, border-bottom `1px solid #EEF2F6`). Inside each row:
- Exercise name in Inter 600, `14px`, `#1C2B3A` — left-anchored
- Sets × Reps in Inter 500, `12px`, `#6B7C93` — e.g. `3 × 12`
- Frequency and duration in Inter 400, `12px`, `#A8B8C8`
- Notes in Inter 400, `12px`, `#6B7C93`, italic, truncated
- `REMOVE` red text link far right

Empty state: dashed bordered box with `No exercises prescribed yet` and `Add exercises above`.

---

**Section 4 — Medications & Observations**

Two columns:

Left column (`medications`): Label `MEDICATIONS RECOMMENDED`. Same tag-input pattern as the patient profile qualifications field — type a medication name and press Enter to add. Each medication renders as a small chip with an X to remove. Chips: background `#E8F4F8`, text `#0B4F6C`, border-radius `4px`.

Right column (`clinicalObservations`): Label `CLINICAL OBSERVATIONS`. Textarea, height `160px`, placeholder `Professional observations, clinical findings, patient response to treatment, contraindications noted, etc.` Character counter bottom-right: `{count}/2000`.

---

**Section 5 — Follow-Up Recommendation**

A toggle at the top of this section: `RECOMMEND FOLLOW-UP SESSION`. Toggle off by default. When toggled on, the section body expands to show:

`RECOMMENDED INTERVAL` — a segmented control: `1 WEEK` · `2 WEEKS` · `3 WEEKS` · `1 MONTH` · `CUSTOM`. Selecting an interval auto-calculates and fills the suggested date field below. `CUSTOM` shows a number input for days.

`SUGGESTED DATE` — a date input, pre-filled based on interval selection. YYYY-MM-DD format. Minimum: tomorrow. Editable by the doctor.

`GOAL FOR NEXT SESSION` — a single-line text input, placeholder `What should the patient aim to achieve by their next visit?`

A note below these fields: `When you save this record, the patient will receive a notification with your follow-up recommendation and a link to book their next appointment.` In Inter 400, `12px`, `#6B7C93`.

---

**Share Toggle:**

Before the submit button — a single horizontal row:

Left: `SHARE THIS RECORD WITH PATIENT` label in Inter 600, `13px`, `#1C2B3A`.
Right: a toggle switch. Default ON (teal). When toggled off: the record saves but the patient cannot see it. A warning appears: `This record will not be visible to the patient.` in amber.

---

**Bottom Action Bar** (sticky):

Same pattern as the patient profile form bottom bar:
- `SAVE DRAFT` ghost button left — saves to localStorage
- `SUBMIT SESSION RECORD →` primary button right — calls POST API

On submit: button shows `SUBMITTING...` with rectangular spinner. On success: navigate to `/doctor/appointments` with a success toast: `Session record submitted. Patient has been notified.`

---

**API function to create:**
`client/src/api/sessionRecord.api.js`

```javascript
export const createSessionRecordAPI = (appointmentId, data) =>
  axiosInstance.post(`/session-records/${appointmentId}`, data)

export const getSessionRecordAPI = (appointmentId) =>
  axiosInstance.get(`/session-records/${appointmentId}`)

export const updateSessionRecordAPI = (appointmentId, data) =>
  axiosInstance.put(`/session-records/${appointmentId}`, data)

export const getDoctorSessionHistoryAPI = (params) =>
  axiosInstance.get('/session-records/doctor/history', { params })

export const getPatientCareTimelineAPI = (params) =>
  axiosInstance.get('/session-records/patient/timeline', { params })
```

---

### Part 7 — Frontend: Doctor Appointments Integration

**File to modify:** `client/src/pages/doctor/DoctorAppointments.jsx`

On completed appointment rows where no session record exists yet:
- Show `ADD SESSION NOTES →` button in primary style, small size (`height: 32px`)
- On click: navigate to `/doctor/appointments/${appointment._id}/session-record`

On completed appointment rows where a session record already exists:
- Show `VIEW NOTES →` text link in `#0B4F6C`
- On click: open the session record view inline or navigate to the record page

To check whether a session record exists: add `hasSessionRecord` boolean to the appointments list response. Modify `GET /api/appointments/doctor/mine` in `server/src/controllers/appointment.controller.js` to include this field:

```javascript
// In the appointments list query, after fetching appointments:
const appointmentIds = appointments.map(a => a._id)
const recordedIds = await SessionRecord.find({
  appointment: { $in: appointmentIds }
}).select('appointment').lean()

const recordedSet = new Set(recordedIds.map(r => r.appointment.toString()))

const appointmentsWithFlag = appointments.map(a => ({
  ...a.toObject(),
  hasSessionRecord: recordedSet.has(a._id.toString())
}))
```

---

### Part 8 — Frontend: Patient Care Timeline

**File to create:** `client/src/pages/patient/PatientCareTimeline.jsx`

**Route:** `/patient/care-timeline`

Add to `client/src/routes/AppRoutes.jsx` inside patient protected routes.
Add to patient sidebar navigation as `Care History` between `My Appointments` and `Payment History`.

---

**Page Layout:**

Section header: `CARE HISTORY` with subtitle `Your complete treatment journey across all physiotherapists.`

A summary row at the top — three small metric cards:
- `TOTAL SESSIONS` — count of all session records
- `DOCTORS SEEN` — count of unique doctors
- `LATEST PROGRESS` — the progressRating from the most recent session record, displayed as the colored label used in the form

Below the summary row: the timeline list.

---

**Timeline Item Design:**

Each session record renders as a horizontal card with `border-radius: 12px`, shadow Level 1, `padding: 0`. The card is divided into two zones:

Left zone (`200px`): background `#0B4F6C`. Border-radius `12px 0 0 12px`. Padding `20px`. Flex-column, justify-content center.
- Doctor's initials circle (white on teal, `48px`)
- Doctor name: `Dr. Firstname Lastname` in white, Inter 700, `14px`
- Specialization in `rgba(255,255,255,0.7)`, Inter 500, `11px`
- Appointment date in `rgba(255,255,255,0.6)`, Inter 400, `11px`

Right zone (flex: 1): background white. Border-radius `0 12px 12px 0`. Padding `20px 24px`. Flex-column, gap `12px`.

Inside right zone:

Row 1 — progress and pain:
Left: progress badge using the same color system as the form — `SIGNIFICANT IMPROVEMENT` in success green badge style.
Right: if pain scores exist — `Pain: {before}/10 → {after}/10` with a colored arrow. If pain decreased: arrow in success green. If increased: arrow in danger red.

Row 2 — treatment summary:
`treatmentProvided` text truncated to 2 lines using `-webkit-line-clamp: 2`. Inter 400, `13px`, `#3D5166`.

Row 3 — exercise count + medications:
Left: if exercises exist — `💪 {count} exercises prescribed` in Inter 500, `12px`, `#0B4F6C`. Clicking expands inline.
Right: if medications exist — `💊 {medications.join(', ')}` truncated. Inter 400, `12px`, `#6B7C93`.

Row 4 — follow-up recommendation:
If `followUpRecommendation.recommended` is true: a teal bordered chip `📅 Follow-up recommended: {suggestedDate}` with a `BOOK NOW →` coral text link that navigates to the doctor's booking page.

Bottom of right zone — `VIEW FULL RECORD →` text link in `#0B4F6C`, Inter 600, `12px`, right-aligned. Clicking expands the card to show the full session record inline.

---

**Expanded Record View (inline, no navigation):**

When `VIEW FULL RECORD →` is clicked the card expands downward. The expansion reveals:

- Full `presentingCondition` text
- Full `treatmentProvided` text  
- Full `clinicalObservations` text if present
- Complete exercise prescription as a table: Exercise Name, Sets, Reps, Frequency, Duration, Notes
- Complete medications list as chips
- Doctor's follow-up recommendation details

An `COLLAPSE ↑` link at the bottom of the expansion. Clicking it collapses back to the summary view. Expansion animation: `max-height: 0` to `max-height: 1000px` over `300ms ease-out`.

---

**Empty state:**
```
Icon: Lucide ClipboardList
Title: No care records yet
Description: Your session records will appear here after your physiotherapist 
             completes their notes following each appointment.
```

---

### Part 9 — Frontend: Patient Appointment Integration

**File to modify:** `client/src/pages/patient/PatientAppointments.jsx`

On completed appointment rows where a session record exists and `isSharedWithPatient === true`:
- Show `VIEW SESSION NOTES →` text link in `#0B4F6C`
- On click: open inline expansion showing the full session record below the row

On completed appointment rows where no session record exists yet:
- Show `Awaiting doctor's notes` in Inter 400, `12px`, `#A8B8C8`, italic
- No button — just informational text

To get this data: modify `GET /api/appointments/mine` in the patient appointments controller to include a `sessionRecord` field on each completed appointment. Same pattern as the `hasSessionRecord` flag for doctors but include the full record (or null if none exists).

---

### Part 10 — Notification Types

**File to modify:** `server/src/utils/constants.js`

Add to the notification type constants:
```javascript
SESSION_RECORD_AVAILABLE: 'SESSION_RECORD_AVAILABLE',
FOLLOW_UP_RECOMMENDED: 'FOLLOW_UP_RECOMMENDED',
```

**File to modify:** `client/src/components/common/NotificationBell.jsx` (or wherever notification types are rendered)

Add handling for the two new notification types:
- `SESSION_RECORD_AVAILABLE`: icon `ClipboardList`, links to `/patient/appointments`
- `FOLLOW_UP_RECOMMENDED`: icon `Calendar`, links to `/doctors/{doctorProfileId}` for direct booking

---

### Part 11 — Verification Checklist

After full implementation verify in production:

**Backend:**
- [ ] `POST /api/session-records/:appointmentId` with doctor token creates record correctly
- [ ] `POST /api/session-records/:appointmentId` for non-completed appointment returns 400
- [ ] `POST /api/session-records/:appointmentId` by wrong doctor returns 403
- [ ] `POST /api/session-records/:appointmentId` when record already exists returns 409
- [ ] `GET /api/session-records/:appointmentId` with patient token returns record only if `isSharedWithPatient: true`
- [ ] `GET /api/session-records/:appointmentId` with wrong patient token returns 403
- [ ] `PUT /api/session-records/:appointmentId` within 24 hours succeeds
- [ ] `PUT /api/session-records/:appointmentId` after 24 hours returns 403
- [ ] `GET /api/session-records/doctor/history` returns paginated records for that doctor only
- [ ] `GET /api/session-records/patient/timeline` returns only shared records for that patient
- [ ] Follow-up recommendation triggers `FOLLOW_UP_RECOMMENDED` notification
- [ ] Session record submission triggers `SESSION_RECORD_AVAILABLE` notification

**Frontend:**
- [ ] Doctor appointments page shows `ADD SESSION NOTES →` on completed appointments without records
- [ ] Doctor appointments page shows `VIEW NOTES →` on completed appointments with records
- [ ] Session record form validates required fields before submission
- [ ] Progress rating segmented control colors update correctly on selection
- [ ] Pain score delta indicator shows correct direction and value
- [ ] Exercise prescription add/remove works with reactive count in section header
- [ ] Follow-up toggle expands/collapses the recommendation fields
- [ ] Share toggle shows warning when turned off
- [ ] Patient care timeline page loads and shows records
- [ ] Expanding a timeline card reveals full record inline
- [ ] `BOOK NOW →` on follow-up recommendation navigates to correct doctor booking page
- [ ] Patient appointments page shows `VIEW SESSION NOTES →` or `Awaiting doctor's notes` correctly
- [ ] Both new notification types render with correct icons and navigate to correct pages

---

Once Phase 14 is complete and verified, say **"Phase 15"** and I will generate the Pre-Booking Media Upload prompt.