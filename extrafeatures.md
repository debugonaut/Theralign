Here are the prompts for all 9 features.

---

# PROMPT F1 — Appointment Reminders via Email

## Objective
Send automated emails at two points in the appointment lifecycle: an immediate booking confirmation when an appointment is created, and a reminder 24 hours before the appointment date. Use Nodemailer with Gmail SMTP — no third-party email service required.

## Architecture Reasoning
Email is the most universally expected communication channel in any booking platform. A patient who books and receives no confirmation has no trust signal that the booking worked. The 24-hour reminder reduces no-shows, which is a direct business metric doctors care about. Both emails are triggered server-side from existing controller hooks — no new infrastructure, no webhooks, no queues needed for MVP. The reminder uses a scheduled job pattern via `node-cron` which runs inside the existing Express process.

## Implementation Scope
- Install `nodemailer` and `node-cron`
- Create `server/src/config/mailer.js`
- Create `server/src/services/emailService.js`
- Modify `server/src/controllers/appointment.controller.js` — trigger confirmation email after booking
- Create `server/src/jobs/reminderJob.js` — daily cron that sends 24-hour reminders
- Modify `server/src/server.js` — initialize the cron job on startup
- Add Gmail env vars

## Package Installation

```bash
npm install nodemailer node-cron
```

## Environment Variables

Add to `server/.env`:
```
EMAIL_USER=your.gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=PhysioConnect <your.gmail@gmail.com>
```

**Important:** Gmail requires an App Password, not the account password. Generate one at: Google Account → Security → 2-Step Verification → App Passwords. This is a common setup mistake.

Add to `server/.env.example`:
```
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=PhysioConnect <your_gmail_address>
```

## Mailer Config Module

```js
// server/src/config/mailer.js

import nodemailer from 'nodemailer'

let transporter = null

export const getMailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null   // Email degrades gracefully — missing config never crashes the app
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }

  return transporter
}
```

Same lazy singleton pattern used for Razorpay and OpenAI in previous phases — consistent architecture.

## Email Service

```js
// server/src/services/emailService.js

import { getMailTransporter } from '../config/mailer.js'
import { logger } from '../utils/logger.js'

const sendMail = async ({ to, subject, html }) => {
  const transporter = getMailTransporter()
  if (!transporter) {
    logger.warn('Email service unavailable — mailer not configured')
    return false
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    })
    return true
  } catch (err) {
    logger.error(`Email send failed: ${err.message}`)
    return false   // Never throw — email failure must never break a booking
  }
}

// ─── Email 1: Booking Confirmation ──────────────────────────

export const sendBookingConfirmation = async ({ patientEmail, patientName, doctorName, date, startTime, endTime, consultationFee, appointmentId }) => {
  const subject = `Appointment Confirmed — ${date} at ${startTime}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0EA5E9; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">PhysioConnect</h1>
      </div>

      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #1E293B;">Appointment Confirmed ✓</h2>
        <p style="color: #475569;">Hi ${patientName},</p>
        <p style="color: #475569;">
          Your appointment has been successfully booked. Here are your details:
        </p>

        <div style="background: #F8FAFC; border-left: 4px solid #0EA5E9;
                    padding: 16px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 4px 0; color: #1E293B;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p style="margin: 4px 0; color: #1E293B;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 4px 0; color: #1E293B;"><strong>Time:</strong> ${startTime} – ${endTime}</p>
          <p style="margin: 4px 0; color: #1E293B;"><strong>Consultation Fee:</strong> ₹${consultationFee}</p>
          <p style="margin: 4px 0; color: #64748B; font-size: 12px;">
            Appointment ID: ${appointmentId}
          </p>
        </div>

        <p style="color: #475569;">
          Please arrive 5 minutes early. If you need to cancel or reschedule,
          log in to your PhysioConnect account.
        </p>
      </div>

      <div style="padding: 16px; background: #F8FAFC; text-align: center;">
        <p style="color: #94A3B8; font-size: 12px; margin: 0;">
          © 2025 PhysioConnect. This is an automated message.
        </p>
      </div>
    </div>
  `

  return sendMail({ to: patientEmail, subject, html })
}

// ─── Email 2: 24-Hour Reminder ───────────────────────────────

export const sendAppointmentReminder = async ({ patientEmail, patientName, doctorName, date, startTime, endTime }) => {
  const subject = `Reminder: Your appointment tomorrow at ${startTime}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0EA5E9; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">PhysioConnect</h1>
      </div>

      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #1E293B;">Appointment Tomorrow 🗓️</h2>
        <p style="color: #475569;">Hi ${patientName},</p>
        <p style="color: #475569;">
          This is a friendly reminder that you have an appointment tomorrow.
        </p>

        <div style="background: #F8FAFC; border-left: 4px solid #0EA5E9;
                    padding: 16px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 4px 0; color: #1E293B;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p style="margin: 4px 0; color: #1E293B;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 4px 0; color: #1E293B;"><strong>Time:</strong> ${startTime} – ${endTime}</p>
        </div>

        <p style="color: #475569;">
          See you tomorrow! Please arrive a few minutes early.
        </p>
      </div>

      <div style="padding: 16px; background: #F8FAFC; text-align: center;">
        <p style="color: #94A3B8; font-size: 12px; margin: 0;">
          © 2025 PhysioConnect. This is an automated message.
        </p>
      </div>
    </div>
  `

  return sendMail({ to: patientEmail, subject, html })
}

// ─── Email 3: Cancellation Notice ────────────────────────────

export const sendCancellationNotice = async ({ patientEmail, patientName, doctorName, date, startTime, cancelledBy }) => {
  const subject = `Appointment Cancelled — ${date} at ${startTime}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0EA5E9; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">PhysioConnect</h1>
      </div>

      <div style="padding: 32px;">
        <h2 style="color: #1E293B;">Appointment Cancelled</h2>
        <p style="color: #475569;">Hi ${patientName},</p>
        <p style="color: #475569;">
          Your appointment with Dr. ${doctorName} on ${date} at ${startTime}
          has been cancelled${cancelledBy === 'doctor' ? ' by the doctor' : ''}.
        </p>
        <p style="color: #475569;">
          You can book a new appointment anytime on PhysioConnect.
        </p>
      </div>

      <div style="padding: 16px; background: #F8FAFC; text-align: center;">
        <p style="color: #94A3B8; font-size: 12px; margin: 0;">
          © 2025 PhysioConnect.
        </p>
      </div>
    </div>
  `

  return sendMail({ to: patientEmail, subject, html })
}
```

## Appointment Controller Modifications

```js
// In appointment.controller.js

// After successfully creating appointment in bookAppointment():
import { sendBookingConfirmation } from '../services/emailService.js'

// After appointment is created and slot is locked:
const patientUser = await User.findById(req.user._id).select('name email')
const doctorUser = await User.findById(doctorProfile.user).select('name')

// Fire and forget — do NOT await. Email must never delay the booking response.
sendBookingConfirmation({
  patientEmail: patientUser.email,
  patientName: patientUser.name,
  doctorName: doctorUser.name,
  date: slot.date,
  startTime: slot.startTime,
  endTime: slot.endTime,
  consultationFee: appointment.consultationFee,
  appointmentId: appointment._id,
})

// After cancellation in cancelAppointment():
import { sendCancellationNotice } from '../services/emailService.js'

sendCancellationNotice({
  patientEmail: patientUser.email,
  patientName: patientUser.name,
  doctorName: doctorUser.name,
  date: appointment.date,
  startTime: appointment.startTime,
  cancelledBy: appointment.cancelledBy,
})
```

**Why fire-and-forget (no await)?**
Email is a non-critical side effect. The patient's booking is confirmed the moment the database write succeeds. Making the API response wait for SMTP would add 200-500ms of latency to every booking — never acceptable for a user-facing transaction.

## Reminder Cron Job

```js
// server/src/jobs/reminderJob.js

import cron from 'node-cron'
import { Appointment } from '../models/Appointment.model.js'
import { User } from '../models/User.model.js'
import { DoctorProfile } from '../models/DoctorProfile.model.js'
import { sendAppointmentReminder } from '../services/emailService.js'
import { logger } from '../utils/logger.js'

export const initReminderJob = () => {
  // Runs every day at 9:00 AM IST (03:30 UTC)
  cron.schedule('30 3 * * *', async () => {
    logger.info('Running appointment reminder job...')

    try {
      // Get tomorrow's date in YYYY-MM-DD format
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      // Find all confirmed appointments for tomorrow
      const appointments = await Appointment.find({
        date: tomorrowStr,
        status: 'confirmed',
      })
        .populate('patient', 'name email')
        .populate('doctor')

      logger.info(`Found ${appointments.length} appointments to remind`)

      for (const appt of appointments) {
        const doctorUser = await User.findById(appt.doctor.user).select('name')

        await sendAppointmentReminder({
          patientEmail: appt.patient.email,
          patientName: appt.patient.name,
          doctorName: doctorUser.name,
          date: appt.date,
          startTime: appt.startTime,
          endTime: appt.endTime,
        })
      }

      logger.info(`Reminder job complete. Sent ${appointments.length} reminders.`)
    } catch (err) {
      logger.error(`Reminder job failed: ${err.message}`)
    }
  })

  logger.info('Appointment reminder job scheduled (daily at 9:00 AM IST)')
}
```

## server.js Initialization

```js
// In server.js — after DB connection established:
import { initReminderJob } from './jobs/reminderJob.js'

// Inside the DB connect callback / after mongoose.connect():
initReminderJob()
```

## Validation Checkpoints
- [ ] Booking confirmation email arrives in patient inbox within 30 seconds of booking
- [ ] Email renders correctly with appointment details
- [ ] Cancellation email triggers when either party cancels
- [ ] Booking API response time is NOT increased by email (fire-and-forget confirmed)
- [ ] Reminder job runs without errors (check server logs at scheduled time)
- [ ] Missing `EMAIL_USER`/`EMAIL_PASS` does not crash the app — just logs a warning
- [ ] Gmail app password (not account password) is used

## Interview Explanation Points
- "I fire emails without awaiting them because email is a side effect of booking, not the booking itself. The patient's confirmation is the database record — the email is a convenience notification. Awaiting SMTP would add network latency to every booking API response."
- "The reminder cron job runs inside the Express process using `node-cron`. For MVP scale this is perfectly adequate. For high volume, the natural evolution is to extract it into a separate worker process or use a queue like Bull."

---

# PROMPT F2 — Doctor Availability Recurring Slots

## Objective
Allow doctors to create recurring availability slots — a single form submission that generates the same time slot across multiple consecutive weeks. Eliminates the current one-at-a-time slot creation friction which would be a real operational burden for any working physiotherapist.

## Architecture Reasoning
The current slot creation creates exactly one `AvailabilitySlot` document per submission. Recurring slots are architecturally identical — the backend simply runs the same creation logic in a loop across N future dates on the same day of the week. No new schema is needed. The compound unique index already prevents duplicates if the job runs twice. This is a pure controller and UI enhancement on top of existing infrastructure.

## Implementation Scope
- Modify `server/src/controllers/availability.controller.js` — add `createRecurringSlots`
- Modify `server/src/routes/availability.routes.js` — add new endpoint
- Modify `client/src/pages/doctor/AvailabilityManager.jsx` — add recurring toggle to form

## Backend — New Endpoint

```
POST /api/availability/slots/recurring    → Doctor creates recurring slots
```

## Controller Logic — createRecurringSlots

```js
export const createRecurringSlots = async (req, res) => {
  const { date, startTime, endTime, repeatWeeks } = req.body

  // Validate
  if (!date || !startTime || !endTime || !repeatWeeks) {
    return res.status(400).json({ message: 'All fields are required.' })
  }

  if (repeatWeeks < 1 || repeatWeeks > 12) {
    return res.status(400).json({
      message: 'repeatWeeks must be between 1 and 12.'
    })
  }

  if (startTime >= endTime) {
    return res.status(400).json({
      message: 'Start time must be before end time.'
    })
  }

  const doctorProfile = await DoctorProfile.findOne({ user: req.user._id })
  if (!doctorProfile) return res.status(404).json({ message: 'Doctor profile not found.' })

  // Generate all target dates
  const targetDates = []
  const baseDate = new Date(date + 'T00:00:00')   // Avoid UTC shift

  for (let week = 0; week < repeatWeeks; week++) {
    const d = new Date(baseDate)
    d.setDate(d.getDate() + week * 7)
    targetDates.push(d.toISOString().split('T')[0])  // YYYY-MM-DD
  }

  // Attempt to create all slots — skip duplicates individually
  const results = { created: 0, skipped: 0, dates: [] }

  for (const slotDate of targetDates) {
    try {
      await AvailabilitySlot.create({
        doctor: doctorProfile._id,
        date: slotDate,
        startTime,
        endTime,
      })
      results.created++
      results.dates.push(slotDate)
    } catch (err) {
      if (err.code === 11000) {
        results.skipped++   // Duplicate — already exists, skip silently
      } else {
        throw err           // Unexpected error — let global handler catch it
      }
    }
  }

  return res.status(201).json({
    message: `Created ${results.created} slots. Skipped ${results.skipped} duplicates.`,
    ...results,
  })
}
```

## Route Addition

```js
// availability.routes.js
router.post(
  '/slots/recurring',
  protect,
  authorizeRoles('doctor'),
  createRecurringSlots
)
```

**Route ordering note:** `/slots/recurring` must be defined BEFORE `/slots/:slotId` to prevent Express matching `"recurring"` as a param.

## Frontend — AvailabilityManager.jsx Modifications

Add a "Repeat" toggle to the existing slot creation form.

**New state:**
```js
const [isRecurring, setIsRecurring] = useState(false)
const [repeatWeeks, setRepeatWeeks] = useState(4)
```

**Updated form section:**
```jsx
{/* Existing date/startTime/endTime inputs */}

{/* Recurring toggle */}
<div className="flex items-center gap-3 mt-2">
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={isRecurring}
      onChange={(e) => setIsRecurring(e.target.checked)}
      className="w-4 h-4 accent-primary"
    />
    <span className="text-sm text-gray-700">Repeat weekly</span>
  </label>

  {isRecurring && (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">for</span>
      <select
        value={repeatWeeks}
        onChange={(e) => setRepeatWeeks(Number(e.target.value))}
        className="border border-gray-200 rounded px-2 py-1 text-sm"
      >
        {[2, 3, 4, 6, 8, 12].map(w => (
          <option key={w} value={w}>{w} weeks</option>
        ))}
      </select>
    </div>
  )}
</div>
```

**Updated submit handler:**
```js
const handleSubmit = async () => {
  if (formData.startTime >= formData.endTime) {
    setFormError('Start time must be before end time.')
    return
  }

  setSubmitting(true)
  setFormError('')

  try {
    if (isRecurring) {
      const res = await createRecurringSlots({
        ...formData,
        repeatWeeks,
      })
      toast.success(res.data.message)
    } else {
      await createSlot(formData)
      toast.success('Slot added.')
    }
    await refetchSlots()
    setFormData({ date: '', startTime: '', endTime: '' })
    setIsRecurring(false)
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to create slot.'
    if (msg.includes('already exists')) {
      toast.error('A slot already exists for this time.')
    } else {
      toast.error(msg)
    }
  } finally {
    setSubmitting(false)
  }
}
```

**Add to `availability.api.js`:**
```js
export const createRecurringSlots = (data) =>
  axiosInstance.post('/availability/slots/recurring', data)
```

## Validation Checkpoints
- [ ] Creating a recurring slot for 4 weeks generates 4 slot documents in MongoDB
- [ ] The response message correctly states "Created 4 slots. Skipped 0 duplicates."
- [ ] Running the same recurring creation again skips all 4 (all duplicates) without error
- [ ] Partial duplicates work: if 2 of 4 dates already have slots, creates 2 and skips 2
- [ ] `repeatWeeks` of 13 returns 400
- [ ] Recurring toggle shows repeat dropdown only when checked
- [ ] Slot list refreshes after recurring creation showing all new dates

## Interview Explanation Points
- "Recurring slots are architecturally just a loop around the existing single-slot creation. The compound unique index handles the duplicate prevention — I can safely attempt to create all slots and silently skip any that already exist. No special transaction logic needed."
- "I cap recurring weeks at 12 to prevent a doctor accidentally creating a year of slots in one click — a reasonable business rule that also controls database write volume."

---

# PROMPT F3 — Prescription / Session Notes Upload

## Objective
After marking an appointment as complete, the doctor can upload a PDF document (prescription, session notes, or exercise plan) via Cloudinary. The patient sees a download link in their appointment history. Reuses the existing Cloudinary upload infrastructure from Phase 3 entirely.

## Architecture Reasoning
A healthcare booking platform without any document exchange feels incomplete. Physiotherapists routinely provide exercise sheets, posture correction plans, and session summaries. Storing these in Cloudinary and linking them to the Appointment document is architecturally clean — Cloudinary handles storage, the Appointment holds the reference, and both parties access it through their existing appointment views. No new storage infrastructure needed.

## Implementation Scope
- Modify `server/src/models/Appointment.model.js` — add `sessionDocument` field
- Create `server/src/controllers/document.controller.js`
- Create `server/src/routes/document.routes.js`
- Modify `server/src/app.js` — mount routes
- Modify `client/src/components/appointments/DoctorAppointmentCard.jsx` — add upload UI
- Modify `client/src/components/appointments/PatientAppointmentCard.jsx` — add download link

## Model Modification

```js
// Add to Appointment schema:
sessionDocument: {
  url: { type: String, default: null },
  publicId: { type: String, default: null },  // For Cloudinary deletion if needed
  uploadedAt: { type: Date, default: null },
  fileName: { type: String, default: null },  // Original filename for display
}
```

## Cloudinary PDF Upload Config

```js
// In document.controller.js — use existing cloudinary config from Phase 3
// Cloudinary accepts PDFs natively — just set resource_type: 'raw'

const uploadToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'physioconnect/session-documents',
        resource_type: 'raw',     // Required for non-image files (PDFs)
        format: 'pdf',
        public_id: `doc_${Date.now()}`,
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    uploadStream.end(fileBuffer)
  })
}
```

## Controller Logic — uploadSessionDocument

```
POST /api/documents/upload/:appointmentId  (protected, doctor only)

1. Find appointment by :appointmentId
2. Verify appointment.doctor matches authenticated doctor's profile
3. Verify appointment.status === 'completed' — only completed appointments
4. Validate file: must be PDF, max 5MB
   Check: req.file.mimetype === 'application/pdf'
   Check: req.file.size <= 5 * 1024 * 1024
5. Upload buffer to Cloudinary with resource_type: 'raw'
6. Update Appointment:
   sessionDocument: {
     url: result.secure_url,
     publicId: result.public_id,
     uploadedAt: new Date(),
     fileName: req.file.originalname,
   }
7. Return updated appointment
```

## Controller Logic — deleteSessionDocument

```
DELETE /api/documents/:appointmentId  (protected, doctor only)

1. Find appointment, verify doctor ownership
2. If no sessionDocument.publicId: return 400
3. Delete from Cloudinary: cloudinary.uploader.destroy(publicId, { resource_type: 'raw' })
4. Clear sessionDocument fields on Appointment
5. Return 200
```

## Route Definitions

```js
// document.routes.js
import multer from 'multer'
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

router.post(
  '/upload/:appointmentId',
  protect,
  authorizeRoles('doctor'),
  upload.single('document'),
  uploadSessionDocument
)
router.delete(
  '/:appointmentId',
  protect,
  authorizeRoles('doctor'),
  deleteSessionDocument
)
```

**Note:** `multer` is already installed from Phase 3 — no new package needed.

## Frontend — DoctorAppointmentCard.jsx Addition

Add below the existing "Mark Complete" area, only shown when `appointment.status === 'completed'`:

```jsx
{appointment.status === 'completed' && (
  <div className="mt-3 pt-3 border-t border-gray-100">
    {appointment.sessionDocument?.url ? (
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 flex items-center gap-1">
          📄 {appointment.sessionDocument.fileName || 'Session document'}
        </span>
        <button
          onClick={() => handleDeleteDocument(appointment._id)}
          className="text-xs text-red-400 hover:text-red-600"
        >
          Remove
        </button>
      </div>
    ) : (
      <label className="cursor-pointer">
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => handleDocumentUpload(e, appointment._id)}
        />
        <span className="text-sm text-primary hover:text-primary-dark
                         flex items-center gap-1 cursor-pointer">
          📎 Upload session notes (PDF)
        </span>
      </label>
    )}
  </div>
)}
```

**Upload handler:**
```js
const handleDocumentUpload = async (e, appointmentId) => {
  const file = e.target.files[0]
  if (!file) return
  if (file.type !== 'application/pdf') {
    toast.error('Only PDF files are accepted.')
    return
  }

  const formData = new FormData()
  formData.append('document', file)

  setUploading(appointmentId)
  try {
    const res = await axiosInstance.post(
      `/documents/upload/${appointmentId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    toast.success('Document uploaded successfully.')
    // Update local state with new document info
    updateAppointmentInList(res.data.appointment)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Upload failed.')
  } finally {
    setUploading(null)
  }
}
```

## Frontend — PatientAppointmentCard.jsx Addition

Add to completed appointments:

```jsx
{appointment.sessionDocument?.url && (
  
    href={appointment.sessionDocument.url}
    target="_blank"
    rel="noopener noreferrer"
    className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2
               text-sm text-primary hover:text-primary-dark block"
  >
    📄 Download Session Notes
    <span className="text-xs text-gray-400">
      ({appointment.sessionDocument.fileName || 'PDF'})
    </span>
  </a>
)}
```

## Validation Checkpoints
- [ ] Doctor can upload a PDF on a completed appointment
- [ ] Non-PDF file upload returns 400 with clear message
- [ ] PDF over 5MB returns 400
- [ ] Uploaded file appears in Cloudinary under `session-documents` folder
- [ ] Patient appointment card shows "Download Session Notes" link after upload
- [ ] Download link opens the PDF correctly in a new tab
- [ ] Doctor can delete/replace the document
- [ ] Upload only available on completed appointments — not confirmed or cancelled

## Interview Explanation Points
- "I reuse the existing Cloudinary integration from Phase 3 with `resource_type: 'raw'` for PDF support. The only new infrastructure is a Multer middleware call and a Cloudinary folder — everything else is pattern reuse."
- "Session notes are linked to the Appointment document rather than the Doctor or Patient — because a document belongs to a specific encounter, not to a person. This makes retrieval and display logic clean on both dashboard views."

---

# PROMPT F5 — Appointment Reschedule Flow

## Objective
Add a "Reschedule" button to confirmed appointments that lets a patient select a new slot with the same doctor, releasing the original slot and claiming the new one in a single atomic flow. Eliminates the friction of manual cancel-then-rebook.

## Architecture Reasoning
Reschedule is a compound operation: unlock the old slot, lock the new slot, update the appointment. All three must succeed or none should — this is the one place in the application that genuinely benefits from a try/rollback pattern. The existing atomic slot-locking logic from Phase 5 is reused for the new slot. The old slot is unlocked only after the new slot is successfully claimed — order of operations matters here.

## Implementation Scope
- Extend `server/src/controllers/appointment.controller.js` — add `rescheduleAppointment`
- Extend `server/src/routes/appointment.routes.js`
- Modify `client/src/components/appointments/PatientAppointmentCard.jsx` — add Reschedule button
- Modify `client/src/components/booking/SlotPicker.jsx` — support reschedule mode

## Backend — New Endpoint

```
PATCH /api/appointments/:id/reschedule    → Patient reschedules to a new slot
```

## Controller Logic — rescheduleAppointment

```
1. Extract { newSlotId } from req.body

2. Find existing appointment by :id
   Verify: appointment.patient matches req.user._id — else 403
   Verify: appointment.status === 'confirmed' — else 400
   Verify: appointment.date > today — else 400 "Cannot reschedule a past appointment."

3. Verify new slot exists and belongs to the same doctor:
   AvailabilitySlot.findOne({
     _id: newSlotId,
     doctor: appointment.doctor   // Must be same doctor
   })
   If not found: return 400 "Invalid slot for this doctor."
   If slot._id equals appointment.slot: return 400 "Already booked on this slot."

4. ATOMIC LOCK on new slot:
   const newSlot = await AvailabilitySlot.findOneAndUpdate(
     { _id: newSlotId, isBooked: false, isActive: true },
     { $set: { isBooked: true } },
     { new: true }
   )
   If null: return 409 "This slot is no longer available."

5. Now safe to unlock old slot (new slot is secured):
   await AvailabilitySlot.findByIdAndUpdate(
     appointment.slot,
     { $set: { isBooked: false } }
   )

6. Update appointment:
   {
     slot: newSlot._id,
     date: newSlot.date,
     startTime: newSlot.startTime,
     endTime: newSlot.endTime,
   }

7. Return updated appointment

On any failure after step 4:
   Rollback: AvailabilitySlot.findByIdAndUpdate(newSlotId, { isBooked: false })
   Return 500
```

## Route Addition

```js
router.patch('/:id/reschedule', protect, authorizeRoles('patient'), rescheduleAppointment)
```

## Frontend — PatientAppointmentCard.jsx Modification

Add Reschedule button alongside Cancel on eligible appointments:

```jsx
{appointment.status === 'confirmed' && appointment.date > todayStr && (
  <div className="flex gap-2 mt-3">
    <button
      onClick={() => onReschedule(appointment)}
      className="text-sm text-primary border border-primary
                 px-3 py-1.5 rounded-lg hover:bg-primary/5"
    >
      Reschedule
    </button>
    <button
      onClick={() => onCancel(appointment._id)}
      className="text-sm text-red-500 border border-red-200
                 px-3 py-1.5 rounded-lg hover:bg-red-50"
    >
      Cancel
    </button>
  </div>
)}
```

## Frontend — Reschedule Modal

Create `client/src/components/booking/RescheduleModal.jsx`:

```
Props: { isOpen, onClose, appointment, onSuccess }

State: availabilityByDate, selectedDate, selectedSlot, submitting

On open: fetch getDoctorAvailability(appointment.doctor._id)
         Filter out the currently booked slot from results

UI:
┌────────────────────────────────────────────┐
│  Reschedule Appointment                    │
│  Currently: {date} at {startTime}          │
│                                            │
│  Select a new date:                        │
│  [date pills — same as SlotPicker]         │
│                                            │
│  Select a new time:                        │
│  [time chips]                              │
│                                            │
│  [Cancel]  [Confirm Reschedule →]          │
└────────────────────────────────────────────┘

On confirm:
  Call PATCH /api/appointments/:id/reschedule with { newSlotId }
  On success: toast "Appointment rescheduled.", onSuccess(), onClose()
  On 409: toast "Slot just taken. Please select another.", refetch availability
```

**Add to `appointment.api.js`:**
```js
export const rescheduleAppointment = (id, newSlotId) =>
  axiosInstance.patch(`/appointments/${id}/reschedule`, { newSlotId })
```

## Validation Checkpoints
- [ ] Patient can reschedule a future confirmed appointment
- [ ] Old slot becomes `isBooked: false` after reschedule
- [ ] New slot becomes `isBooked: true` after reschedule
- [ ] Appointment document reflects new date/time/slot
- [ ] Attempting to reschedule to an already-booked slot returns 409
- [ ] Attempting to reschedule to a different doctor's slot returns 400
- [ ] Cannot reschedule a past or cancelled appointment
- [ ] On reschedule success the card in patient dashboard updates immediately

## Interview Explanation Points
- "The order of operations is critical: I lock the new slot first, then unlock the old slot. If I did it the other way and the new slot lock failed, the patient would have lost their original booking with nothing to replace it. New slot secured first — old slot released only after success."
- "The reschedule endpoint enforces that the new slot must belong to the same doctor. This is a business rule — a reschedule is a time change, not a doctor change. If the patient wants a different doctor, they cancel and book fresh."

---

# PROMPT F6 — Doctor Availability Heatmap

## Objective
Add a 4-week visual calendar heatmap to the doctor profile page showing slot availability at a glance. Green dates have open slots, amber dates are partially booked, gray dates are fully booked or unavailable. Patients see availability density before choosing a date — making the slot picker interaction intentional rather than exploratory.

## Architecture Reasoning
The existing `GET /api/availability/:doctorId` endpoint already returns all future slots grouped by date. The heatmap is a pure frontend computation and rendering task — no new backend work needed. The data is already there; this prompt is entirely about surfacing it in a more informative visual format above the slot picker.

## Implementation Scope
- Create `client/src/components/booking/AvailabilityHeatmap.jsx`
- Modify `client/src/components/booking/SlotPicker.jsx` — render heatmap above date pills, pass selected date down
- No backend changes needed

## AvailabilityHeatmap.jsx — Component Specification

**Props:** `{ availabilityByDate, selectedDate, onDateSelect }`

`availabilityByDate` is the existing array of `{ date: 'YYYY-MM-DD', slots: [...] }` already fetched in SlotPicker.

**Derived computation:**

```js
// Build a map of date → slot availability status
const getDateStatus = (dateStr) => {
  const entry = availabilityByDate.find(d => d.date === dateStr)
  if (!entry || entry.slots.length === 0) return 'unavailable'

  const total = entry.slots.length
  const available = entry.slots.filter(s => !s.isBooked).length

  if (available === 0) return 'full'
  if (available < total / 2) return 'limited'
  return 'available'
}

// Status → Tailwind class
const statusStyles = {
  available:   'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer',
  limited:     'bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer',
  full:        'bg-gray-100 text-gray-400 cursor-not-allowed',
  unavailable: 'bg-gray-50 text-gray-300 cursor-not-allowed',
}
```

**Generate 28 dates (4 weeks from today):**
```js
const generateNext28Days = () => {
  const dates = []
  const today = new Date()
  for (let i = 0; i < 28; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}
```

**UI Layout:**

```
Availability Overview

Mon  Tue  Wed  Thu  Fri  Sat  Sun
─── ─── ─── ─── ─── ─── ───
[  ] [🟢] [🟡] [  ] [🟢] [⬜] [⬜]   ← Week 1
[🟢] [🟢] [  ] [🟡] [🟢] [⬜] [⬜]   ← Week 2
[⬜] [🟢] [🟢] [🟢] [  ] [⬜] [⬜]   ← Week 3
[🟢] [  ] [🟡] [🟢] [🟢] [⬜] [⬜]   ← Week 4

Legend: 🟢 Available  🟡 Limited  ⬛ Fully Booked  ⬜ No slots
```

**JSX structure:**
```jsx
<div>
  <h3 className="text-sm font-semibold text-gray-700 mb-3">
    Availability Overview
  </h3>

  {/* Day headers */}
  <div className="grid grid-cols-7 gap-1 mb-1">
    {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
      <div key={d} className="text-xs text-gray-400 text-center font-medium">
        {d}
      </div>
    ))}
  </div>

  {/* 4-week grid */}
  <div className="grid grid-cols-7 gap-1">
    {generateNext28Days().map(dateStr => {
      const status = getDateStatus(dateStr)
      const dayNum = new Date(dateStr + 'T00:00:00').getDate()
      const isSelected = dateStr === selectedDate
      const isClickable = status === 'available' || status === 'limited'

      return (
        <button
          key={dateStr}
          disabled={!isClickable}
          onClick={() => isClickable && onDateSelect(dateStr)}
          className={`
            aspect-square rounded-lg text-xs font-medium
            flex items-center justify-center
            transition-all duration-150
            ${statusStyles[status]}
            ${isSelected ? 'ring-2 ring-primary ring-offset-1' : ''}
          `}
          title={dateStr}
        >
          {dayNum}
        </button>
      )
    })}
  </div>

  {/* Legend */}
  <div className="flex gap-4 mt-3">
    {[
      { color: 'bg-green-100', label: 'Available' },
      { color: 'bg-amber-100', label: 'Limited' },
      { color: 'bg-gray-100',  label: 'Fully booked' },
    ].map(({ color, label }) => (
      <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
        <div className={`w-3 h-3 rounded ${color}`} />
        {label}
      </div>
    ))}
  </div>
</div>
```

## SlotPicker.jsx Integration

Replace the current date pill row with the heatmap, passing the selected date handler:

```jsx
// In SlotPicker.jsx, above the time slot chips:
<AvailabilityHeatmap
  availabilityByDate={availabilityByDate}
  selectedDate={selectedDate}
  onDateSelect={setSelectedDate}
/>

// Time slot chips remain below — unchanged
```

The heatmap replaces the pill buttons as the date selector. Date pills can be removed once the heatmap is in place, since clicking a calendar cell directly sets `selectedDate`.

## Validation Checkpoints
- [ ] Heatmap renders a 7×4 grid (28 days) starting from today
- [ ] Green cells correctly identify dates with available unbooked slots
- [ ] Amber cells correctly identify dates where most slots are booked
- [ ] Gray cells show for fully booked dates (not clickable)
- [ ] Empty cells show for dates with no slots at all
- [ ] Clicking a green or amber cell selects the date and updates time chips below
- [ ] Selected date cell shows ring highlight
- [ ] Gray/empty cells are not clickable
- [ ] Legend renders below the grid
- [ ] Heatmap is responsive — fits mobile viewport without overflow

## Interview Explanation Points
- "The heatmap requires zero new backend work — it's a pure transformation of data already fetched by the slot picker. The `availabilityByDate` array already exists; the heatmap is just a more informative way to visualize it."
- "I distinguish between 'limited' (some slots booked) and 'available' (most slots open) because a patient who sees amber might choose a different day with more flexibility, reducing congestion on popular slots."

---

# PROMPT F7 — Platform Notification Center

## Objective
Build an in-app notification system. A bell icon in the Navbar shows an unread count badge. Clicking it opens a dropdown of recent notifications. Notifications are created server-side on key platform events: new booking, appointment cancellation, review received, and doctor verification status change.

## Architecture Reasoning
Notifications are a simple polling-based system — no websockets, no Redis pub/sub, no external service. The Notification model stores records in MongoDB. The frontend polls for unread count every 60 seconds. This is the correct MVP approach: websockets add operational complexity that is not justified until the polling latency is demonstrably unacceptable. For a healthcare booking platform, 60-second notification delay is completely acceptable.

## Implementation Scope
- Create `server/src/models/Notification.model.js`
- Create `server/src/services/notificationService.js`
- Create `server/src/controllers/notification.controller.js`
- Create `server/src/routes/notification.routes.js`
- Modify `server/src/app.js` — mount routes
- Modify key controllers to trigger notifications
- Create `client/src/components/layout/NotificationBell.jsx`
- Modify `client/src/components/layout/Navbar.jsx` — embed NotificationBell

## Notification Model

```js
// server/src/models/Notification.model.js

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'appointment_booked',
        'appointment_cancelled',
        'appointment_completed',
        'review_received',
        'verification_approved',
        'verification_rejected',
        'document_uploaded',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: null },    // Frontend route to navigate to
    isRead: { type: Boolean, default: false },
    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null }, // appointmentId, etc.
  },
  { timestamps: true }
)

notificationSchema.index({ recipient: 1, isRead: 1 })
notificationSchema.index({ recipient: 1, createdAt: -1 })
```

## Notification Service

```js
// server/src/services/notificationService.js

import { Notification } from '../models/Notification.model.js'
import { logger } from '../utils/logger.js'

export const createNotification = async ({
  recipientId, type, title, message, link = null, relatedId = null
}) => {
  try {
    await Notification.create({
      recipient: recipientId,
      type, title, message, link, relatedId,
    })
  } catch (err) {
    // Notification failure must never crash the calling controller
    logger.error(`Failed to create notification: ${err.message}`)
  }
}
```

## Notification Triggers — Add to Existing Controllers

```js
// In appointment.controller.js — bookAppointment():
import { createNotification } from '../services/notificationService.js'

// After appointment is created:
// Notify patient
createNotification({
  recipientId: req.user._id,
  type: 'appointment_booked',
  title: 'Appointment Confirmed',
  message: `Your appointment with Dr. ${doctorUser.name} on ${slot.date} at ${slot.startTime} is confirmed.`,
  link: '/patient/appointments',
  relatedId: appointment._id,
})

// Notify doctor
createNotification({
  recipientId: doctorProfile.user,
  type: 'appointment_booked',
  title: 'New Appointment Booked',
  message: `${patientUser.name} has booked an appointment for ${slot.date} at ${slot.startTime}.`,
  link: '/doctor/appointments',
  relatedId: appointment._id,
})

// In cancelAppointment():
// Notify the other party (not the one who cancelled)
const notifyUserId = cancelledBy === 'patient'
  ? doctorProfile.user
  : appointment.patient

createNotification({
  recipientId: notifyUserId,
  type: 'appointment_cancelled',
  title: 'Appointment Cancelled',
  message: `Your appointment on ${appointment.date} at ${appointment.startTime} has been cancelled.`,
  link: cancelledBy === 'patient' ? '/doctor/appointments' : '/patient/appointments',
  relatedId: appointment._id,
})

// In review.controller.js — submitReview():
// Notify doctor of new review
createNotification({
  recipientId: doctorProfile.user,
  type: 'review_received',
  title: 'New Patient Review',
  message: `A patient left you a ${rating}-star review.`,
  link: '/doctor/reviews',
  relatedId: review._id,
})

// In admin doctor verification controller — when status changes:
createNotification({
  recipientId: doctorProfile.user,
  type: status === 'verified' ? 'verification_approved' : 'verification_rejected',
  title: status === 'verified' ? 'Profile Verified ✓' : 'Verification Update',
  message: status === 'verified'
    ? 'Your profile has been verified. You can now receive bookings.'
    : 'Your verification requires additional review. Check your profile.',
  link: '/doctor/dashboard',
})
```

## API Endpoints

```
GET   /api/notifications/mine           → Get recent notifications (last 20)
GET   /api/notifications/unread-count   → Get unread count only (for polling)
PATCH /api/notifications/:id/read       → Mark one as read
PATCH /api/notifications/read-all       → Mark all as read
```

## Controller Logic

```js
// getMyNotifications:
Notification.find({ recipient: req.user._id })
  .sort({ createdAt: -1 })
  .limit(20)

// getUnreadCount:
const count = await Notification.countDocuments({
  recipient: req.user._id,
  isRead: false,
})
return res.json({ count })

// markAsRead:
Notification.findOneAndUpdate(
  { _id: req.params.id, recipient: req.user._id },
  { isRead: true }
)

// markAllRead:
Notification.updateMany(
  { recipient: req.user._id, isRead: false },
  { isRead: true }
)
```

## NotificationBell.jsx — Component Specification

```jsx
const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Poll for unread count every 60 seconds
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await axiosInstance.get('/notifications/unread-count')
        setUnreadCount(res.data.count)
      } catch {}   // Silent — polling failure must not show errors
    }

    fetchCount()
    const interval = setInterval(fetchCount, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleOpen = async () => {
    setOpen(prev => !prev)
    if (!open) {
      setLoading(true)
      try {
        const res = await axiosInstance.get('/notifications/mine')
        setNotifications(res.data)
        // Mark all as read after opening
        await axiosInstance.patch('/notifications/read-all')
        setUnreadCount(0)
      } catch {}
      setLoading(false)
    }
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('#notification-bell')) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div id="notification-bell" className="relative">
      {/* Bell button */}
      <button onClick={handleOpen} className="relative p-2 text-gray-600 hover:text-primary">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white
                           text-xs rounded-full w-4 h-4 flex items-center justify-center
                           font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-elevated
                        border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-800 text-sm">Notifications</span>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-400">
                No notifications yet
              </div>
            )}

            {!loading && notifications.map(n => (
              <div
                key={n._id}
                className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50
                            cursor-pointer ${!n.isRead ? 'bg-blue-50/40' : ''}`}
                onClick={() => n.link && navigate(n.link)}
              >
                <p className="text-sm font-medium text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

**Navbar.jsx — add NotificationBell inside the logged-in user section:**
```jsx
{user && <NotificationBell />}
```

`formatDistanceToNow` comes from `date-fns` — install if not already present: `npm install date-fns`

## Validation Checkpoints
- [ ] Bell icon appears in Navbar for logged-in users
- [ ] Red badge shows correct unread count
- [ ] Booking an appointment creates notifications for both patient and doctor
- [ ] Cancellation notifies the non-cancelling party
- [ ] Review submission notifies the doctor
- [ ] Opening the bell dropdown shows recent notifications
- [ ] Badge resets to 0 after opening the dropdown
- [ ] Clicking a notification with a link navigates correctly
- [ ] Polling every 60 seconds updates the count without page refresh
- [ ] Missing notifications never crash the app

## Interview Explanation Points
- "I chose polling over websockets deliberately. 60-second notification latency is completely acceptable for a healthcare booking platform — nobody needs to know about a new booking in under a minute. Websockets would require a separate connection layer, state management for socket instances, and handling reconnection logic. Polling is 20 lines of code."
- "Notifications are fire-and-forget from the calling controller — they never block or throw. A notification failure must never rollback a booking."

---

# PROMPT F8 — Doctor Profile Completion Score

## Objective
Show a profile completion percentage on the doctor's dashboard with a progress bar and specific action items for each missing field. Drives doctors to fill out their profiles fully, which directly improves patient conversion on their listing card.

## Architecture Reasoning
Profile completeness is computed entirely from fields that already exist on the DoctorProfile and User models — no new database fields needed. The score is computed client-side from the profile data already fetched for the dashboard. This is a zero-backend-cost feature that delivers meaningful UX value and demonstrates product thinking in interviews.

## Implementation Scope
- Create `client/src/components/doctor/ProfileCompletionCard.jsx`
- Create `client/src/utils/profileCompletion.js` — pure computation function
- Modify `client/src/pages/doctor/DoctorDashboard.jsx` — add card

## Completion Criteria & Weights

```js
// client/src/utils/profileCompletion.js

export const calculateProfileCompletion = (doctorProfile, user) => {
  const criteria = [
    {
      key: 'profileImage',
      label: 'Add a profile photo',
      weight: 20,
      met: !!doctorProfile?.profileImage,
      link: '/doctor/profile',
    },
    {
      key: 'bio',
      label: 'Write a bio (min 50 characters)',
      weight: 20,
      met: doctorProfile?.bio && doctorProfile.bio.trim().length >= 50,
      link: '/doctor/profile',
    },
    {
      key: 'consultationFee',
      label: 'Set your consultation fee',
      weight: 15,
      met: !!doctorProfile?.consultationFee && doctorProfile.consultationFee > 0,
      link: '/doctor/profile',
    },
    {
      key: 'specialization',
      label: 'Set your specialization',
      weight: 15,
      met: !!doctorProfile?.specialization,
      link: '/doctor/profile',
    },
    {
      key: 'experience',
      label: 'Add years of experience',
      weight: 10,
      met: !!doctorProfile?.experienceYears && doctorProfile.experienceYears > 0,
      link: '/doctor/profile',
    },
    {
      key: 'location',
      label: 'Add your clinic location',
      weight: 10,
      met: !!doctorProfile?.location?.city,
      link: '/doctor/profile',
    },
    {
      key: 'availability',
      label: 'Add at least one availability slot',
      weight: 10,
      met: doctorProfile?.hasSlots === true,  // Pass this flag from the dashboard
      link: '/doctor/availability',
    },
  ]

  const completedWeight = criteria
    .filter(c => c.met)
    .reduce((sum, c) => sum + c.weight, 0)

  const missing = criteria.filter(c => !c.met)

  return {
    percentage: completedWeight,
    missing,
    isComplete: completedWeight === 100,
  }
}
```

## ProfileCompletionCard.jsx — Component Specification

**Props:** `{ doctorProfile, user, slotCount }`

```jsx
const ProfileCompletionCard = ({ doctorProfile, user, slotCount }) => {
  const profileWithSlots = { ...doctorProfile, hasSlots: slotCount > 0 }
  const { percentage, missing, isComplete } = calculateProfileCompletion(profileWithSlots, user)

  if (isComplete) return null   // Hide the card entirely when profile is 100%

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Complete Your Profile</h3>
        <span className="text-2xl font-bold text-primary">{percentage}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-5">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-sm text-gray-500 mb-4">
        A complete profile gets up to 3× more bookings. Here's what's missing:
      </p>

      <ul className="space-y-2">
        {missing.map(item => (
          <li key={item.key}>
            <Link
              to={item.link}
              className="flex items-center gap-2 text-sm text-gray-600
                         hover:text-primary group"
            >
              <span className="w-4 h-4 rounded-full border-2 border-gray-300
                               group-hover:border-primary flex-shrink-0" />
              {item.label}
              <span className="text-xs text-gray-400 ml-auto">+{item.weight}%</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## DoctorDashboard.jsx Integration

The dashboard already fetches the doctor's profile and appointments. Also fetch slot count:

```js
// In existing dashboard useEffect, add:
const slotsRes = await getMySlots()
setSlotCount(slotsRes.data.length)
```

Render the card in the dashboard layout:

```jsx
<ProfileCompletionCard
  doctorProfile={doctorProfile}
  user={user}
  slotCount={slotCount}
/>
```

Place it prominently — first card in the dashboard for new doctors, below metrics for established ones. Hide when `percentage === 100`.

## Validation Checkpoints
- [ ] New doctor (no profile data) shows ~10-20% completion
- [ ] Adding profile image updates the percentage correctly
- [ ] Writing a bio under 50 chars does NOT count toward completion
- [ ] Writing a bio over 50 chars counts toward completion
- [ ] Adding availability slots increments the percentage
- [ ] At 100% completion the card disappears entirely
- [ ] Each missing item is a clickable link to the relevant page
- [ ] Progress bar animates smoothly as percentage changes

## Interview Explanation Points
- "Profile completion is computed entirely client-side from data already fetched for the dashboard. It costs zero additional API calls and zero backend changes — it's pure UX value from existing data."
- "The card disappears at 100% rather than showing a completed state. The feature's purpose is to surface incomplete items — once there are none, it has done its job and should get out of the way."

---

# PROMPT F9 — Smart Search Suggestions (Autocomplete)

## Objective
Add real-time autocomplete suggestions to the doctor search bar on the discovery page. As the patient types, a dropdown shows matching doctor names, specializations, and cities. Selecting a suggestion immediately applies it as a filter.

## Architecture Reasoning
A plain text input for search requires patients to know exactly what to type. Autocomplete shows what's available, reduces typos, and makes the search feel responsive and intelligent. The backend endpoint uses MongoDB's case-insensitive regex — no full-text search infrastructure needed. Results are debounced client-side to avoid a query on every keystroke.

## Implementation Scope
- Create `server/src/controllers/search.controller.js`
- Create `server/src/routes/search.routes.js`
- Modify `server/src/app.js` — mount routes
- Create `client/src/components/search/SearchSuggestions.jsx`
- Modify `client/src/components/search/SearchBar.jsx` (or equivalent) on the discovery page

## Backend Endpoint

```
GET /api/search/suggestions?q=knee    → Returns suggestions (public, no auth)
```

## Controller Logic — getSuggestions

```js
export const getSuggestions = async (req, res) => {
  const { q } = req.query

  if (!q || q.trim().length < 2) {
    return res.json({ suggestions: [] })
  }

  const query = q.trim().slice(0, 50)  // Hard cap
  const regex = new RegExp(query, 'i') // Case-insensitive match

  // Run three queries in parallel
  const [nameMatches, specializationMatches, cityMatches] = await Promise.all([

    // Doctor names
    DoctorProfile.find({ verificationStatus: 'verified' })
      .populate({ path: 'user', match: { name: regex }, select: 'name' })
      .limit(10)
      .then(docs => docs
        .filter(d => d.user)  // populate match may return null
        .map(d => ({
          type: 'doctor',
          label: d.user.name,
          value: d.user.name,
          subLabel: d.specialization,
          doctorId: d._id,
        }))
        .slice(0, 3)
      ),

    // Specializations
    DoctorProfile.distinct('specialization', {
      verificationStatus: 'verified',
      specialization: regex,
    }).then(specs => specs.slice(0, 3).map(s => ({
      type: 'specialization',
      label: s,
      value: s,
      subLabel: 'Specialization',
    }))),

    // Cities
    DoctorProfile.distinct('location.city', {
      verificationStatus: 'verified',
      'location.city': regex,
    }).then(cities => cities
      .filter(Boolean)
      .slice(0, 3)
      .map(c => ({
        type: 'city',
        label: c,
        value: c,
        subLabel: 'Location',
      }))
    ),
  ])

  const suggestions = [...specializationMatches, ...nameMatches, ...cityMatches]

  return res.json({ suggestions })
}
```

## Route Definition

```js
// search.routes.js
router.get('/suggestions', getSuggestions)  // Public — no auth
```

```js
// app.js
app.use('/api/search', searchRoutes)
```

## SearchSuggestions.jsx — Component Specification

**Props:** `{ query, onSelect, visible }`

```jsx
const SearchSuggestions = ({ query, onSelect, visible }) => {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  // Debounce: wait 300ms after typing stops before fetching
  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await axiosInstance.get(`/search/suggestions?q=${encodeURIComponent(query)}`)
        setSuggestions(res.data.suggestions)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)  // Cancel on each keystroke
  }, [query])

  if (!visible || (!loading && suggestions.length === 0)) return null

  const typeIcons = {
    specialization: '🏥',
    doctor: '👨‍⚕️',
    city: '📍',
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl
                    shadow-elevated border border-gray-100 z-50 overflow-hidden">
      {loading && (
        <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>
      )}

      {!loading && suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s)}
          className="w-full flex items-center gap-3 px-4 py-3
                     hover:bg-gray-50 text-left border-b border-gray-50 last:border-0"
        >
          <span className="text-base">{typeIcons[s.type]}</span>
          <div>
            <p className="text-sm font-medium text-gray-800">{s.label}</p>
            <p className="text-xs text-gray-400">{s.subLabel}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
```

## Discovery Page Search Bar Integration

Modify the existing search input on `DoctorListingPage.jsx`:

```jsx
const [searchQuery, setSearchQuery] = useState('')
const [showSuggestions, setShowSuggestions] = useState(false)

const handleSuggestionSelect = (suggestion) => {
  setShowSuggestions(false)

  if (suggestion.type === 'specialization') {
    setFilters(prev => ({ ...prev, specialization: suggestion.value }))
  } else if (suggestion.type === 'city') {
    setFilters(prev => ({ ...prev, city: suggestion.value }))
  } else if (suggestion.type === 'doctor') {
    setFilters(prev => ({ ...prev, name: suggestion.value }))
  }
}

// In the search input wrapper — must be position: relative
<div className="relative">
  <input
    type="text"
    placeholder="Search by name, specialization, or city..."
    value={searchQuery}
    onChange={(e) => {
      setSearchQuery(e.target.value)
      setShowSuggestions(true)
    }}
    onFocus={() => setShowSuggestions(true)}
    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
               focus:outline-none focus:ring-2 focus:ring-primary/30"
  />

  <SearchSuggestions
    query={searchQuery}
    onSelect={handleSuggestionSelect}
    visible={showSuggestions}
  />
</div>
```

**Note on `onBlur` delay:** The 200ms timeout prevents the dropdown from closing before the click on a suggestion registers. A common implementation mistake is using `onBlur={() => setShowSuggestions(false)}` directly, which closes the dropdown before `onClick` fires.

## Validation Checkpoints
- [ ] Typing 2+ characters shows a suggestion dropdown
- [ ] Suggestions appear within 300ms of stopping typing (debounce working)
- [ ] Specialization suggestions show for matching specialization text
- [ ] Doctor name suggestions show matching verified doctors
- [ ] City suggestions show matching clinic cities
- [ ] Selecting a specialization suggestion applies the specialization filter
- [ ] Selecting a city suggestion applies the city filter
- [ ] Dropdown closes after selection
- [ ] Dropdown closes when clicking outside the input
- [ ] Typing 1 character shows no suggestions (minimum 2 chars enforced)
- [ ] No extra API calls on every keystroke — debounce confirmed via Network tab

## Interview Explanation Points
- "Debouncing at 300ms means we only fire an API request after the user pauses typing, not on every keystroke. For a user typing 'knee pain', that's the difference between 9 API calls and 1."
- "The `onBlur` uses a 200ms timeout before hiding the dropdown. Without the delay, the dropdown closes before the click event on a suggestion fires — the click never registers. This is a subtle but very common implementation bug."

---

# PROMPT F10 — Doctor Waitlist

## Objective
When a verified doctor has no available slots, patients see a "Join Waitlist" button instead of the empty slot picker. When the doctor later adds new slots, waitlisted patients receive an in-app notification. Retains patient intent instead of losing them to drop-off.

## Architecture Reasoning
The current flow when a doctor has no slots: the patient sees an empty picker and leaves. A waitlist converts that dead-end into a retained patient. The implementation is a simple `Waitlist` collection that stores patient–doctor pairs. When new slots are created, the availability controller checks for waitlisted patients and fires notifications via the existing notification service from Feature F7. If F7 was not implemented, notifications are simply omitted — the waitlist itself still has value.

## Implementation Scope
- Create `server/src/models/Waitlist.model.js`
- Create `server/src/controllers/waitlist.controller.js`
- Create `server/src/routes/waitlist.routes.js`
- Modify `server/src/controllers/availability.controller.js` — notify on slot creation
- Modify `server/src/app.js` — mount routes
- Modify `client/src/components/booking/SlotPicker.jsx` — show waitlist UI when no slots

## Waitlist Model

```js
// server/src/models/Waitlist.model.js

const waitlistSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: true,
    },
    notified: {
      type: Boolean,
      default: false,   // True after notification has been sent
    },
    notifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

// One entry per patient-doctor pair
waitlistSchema.index({ patient: 1, doctor: 1 }, { unique: true })
waitlistSchema.index({ doctor: 1, notified: 1 })
```

## API Endpoints

```
POST   /api/waitlist/join/:doctorId     → Patient joins waitlist for a doctor
DELETE /api/waitlist/leave/:doctorId    → Patient leaves waitlist
GET    /api/waitlist/status/:doctorId   → Check if current patient is on waitlist
GET    /api/waitlist/mine               → Patient views all their waitlist entries
```

## Controller Logic — joinWaitlist

```js
1. Check patient is not already on waitlist for this doctor
   (unique index handles DB-level enforcement, but check first for clean error)
   If already exists: return 400 "You are already on the waitlist for this doctor."

2. Create Waitlist entry: { patient: req.user._id, doctor: doctorId }
3. Return 201 { message: "You've joined the waitlist. We'll notify you when slots open." }
```

## Controller Logic — leaveWaitlist

```js
1. Find and delete: { patient: req.user._id, doctor: doctorId }
2. Return 200 { message: "Removed from waitlist." }
```

## Controller Logic — checkWaitlistStatus

```js
1. const entry = await Waitlist.findOne({ patient: req.user._id, doctor: doctorId })
2. Return { onWaitlist: !!entry }
```

## Availability Controller Modification — Notify on Slot Creation

In `createSlot` and `createRecurringSlots`, after successfully creating slot(s), check for waitlisted patients:

```js
// After slot(s) created — notify waitlisted patients
const waitlistEntries = await Waitlist.find({
  doctor: doctorProfile._id,
  notified: false,
}).populate('patient', 'name')

for (const entry of waitlistEntries) {
  // Notify via notification service (F7)
  createNotification({
    recipientId: entry.patient._id,
    type: 'appointment_booked',   // Reuse closest type
    title: 'New Slots Available',
    message: `Dr. ${doctorUser.name} has added new availability slots. Book now before they fill up.`,
    link: `/doctors/${doctorProfile._id}`,
  })

  // Mark as notified so they don't get repeated notifications
  entry.notified = true
  entry.notifiedAt = new Date()
  await entry.save()
}
```

## Frontend — SlotPicker.jsx Modification

In the SlotPicker, after loading availability and finding it empty:

```jsx
// Add state:
const [onWaitlist, setOnWaitlist] = useState(false)
const [waitlistLoading, setWaitlistLoading] = useState(false)

// After availability loads:
useEffect(() => {
  if (availabilityByDate.length === 0 && user) {
    // Check if already on waitlist
    checkWaitlistStatus(doctorId)
      .then(res => setOnWaitlist(res.data.onWaitlist))
      .catch(() => {})
  }
}, [availabilityByDate])

// Replace the "No availability slots" empty state with:
{availabilityByDate.length === 0 && (
  <div className="text-center py-8">
    <p className="text-gray-500 text-sm mb-2">
      No availability slots open right now.
    </p>

    {!user ? (
      <p className="text-sm text-gray-400">
        <Link to="/login" className="text-primary">Log in</Link> to join the waitlist.
      </p>
    ) : onWaitlist ? (
      <div>
        <p className="text-sm text-green-600 font-medium mb-2">
          ✓ You're on the waitlist
        </p>
        <p className="text-xs text-gray-400 mb-3">
          We'll notify you when new slots open.
        </p>
        <button
          onClick={handleLeaveWaitlist}
          className="text-xs text-gray-400 hover:text-red-500"
        >
          Leave waitlist
        </button>
      </div>
    ) : (
      <div>
        <p className="text-xs text-gray-400 mb-3">
          Join the waitlist and get notified when slots open up.
        </p>
        <button
          onClick={handleJoinWaitlist}
          disabled={waitlistLoading}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm
                     font-medium hover:bg-primary-dark disabled:opacity-50"
        >
          {waitlistLoading ? 'Joining...' : '🔔 Join Waitlist'}
        </button>
      </div>
    )}
  </div>
)}
```

**Add to `appointment.api.js`:**
```js
export const joinWaitlist = (doctorId) =>
  axiosInstance.post(`/waitlist/join/${doctorId}`)

export const leaveWaitlist = (doctorId) =>
  axiosInstance.delete(`/waitlist/leave/${doctorId}`)

export const checkWaitlistStatus = (doctorId) =>
  axiosInstance.get(`/waitlist/status/${doctorId}`)
```

## Validation Checkpoints
- [ ] "Join Waitlist" button appears when doctor has no available slots
- [ ] Button does not appear when slots are available
- [ ] Joining waitlist shows "You're on the waitlist" state
- [ ] Unauthenticated patient sees "Log in to join" prompt
- [ ] Creating a new slot for a doctor with waitlisted patients triggers notifications
- [ ] Waitlist entry is marked `notified: true` after notification fires
- [ ] Same patient is not notified twice for the same doctor (idempotent)
- [ ] Leaving waitlist removes the entry and resets UI to join state
- [ ] Joining again after leaving works correctly
- [ ] Duplicate join attempt returns 400

## Interview Explanation Points
- "The waitlist converts an empty slot page from a dead end into a retained user. Instead of the patient leaving and forgetting about the platform, their intent is captured. When slots open, the platform proactively re-engages them."
- "I mark waitlist entries as `notified: true` after sending the notification so the same patient isn't spammed every time the doctor adds a slot. The notification is sent once per 'availability restored' event, not once per slot."