# Theralign — Project Summary

**Generated:** 2026-06-11  
**System Version:** 0.2.0  
**Last Updated:** 2026-06-11

---

## Product Purpose

Theralign is a SaaS platform connecting patients with verified physiotherapy professionals. Patients discover nearby physiotherapists, browse profiles with ratings and reviews, book appointments with atomic slot locking, complete secure Razorpay payments, and receive session documentation. Doctors manage availability, accept bookings, provide treatment, and earn commission-based revenue. Admins operate the platform, verify professionals, manage refunds, and analyze metrics.

---

## Architecture Overview

**Core Subsystems:**

| Subsystem | Responsibility | Tech |
|-----------|---|---|
| **Authentication** | JWT + bcrypt user identity | middleware/auth.middleware.js |
| **User Management** | Patient/Doctor/Admin registration and roles | User model + auth service |
| **Doctor Profiles** | Professional verification, credentials, specialization | DoctorProfile model + doctor service |
| **Availability Management** | Weekly schedule + slot creation/management | AvailabilitySlot + WeeklySchedule models |
| **Discovery & Search** | Geospatial proximity + full-text search + AI recommendations | discovery + search controllers |
| **Appointment Booking** | Atomic slot locking + fee snapshotting + payment integration | Appointment model + booking flow |
| **Payment Processing** | Razorpay order creation + HMAC-SHA256 verification | Payment model + payment controller |
| **Refund System** | Request/approve/reject refunds + Razorpay integration | refund service + admin controller |
| **Reviews & Ratings** | Patient review submission + visibility control | Review model + review controller |
| **AI Integration** | Symptom triage + doctor profile summaries | OpenAI service + ai controller |
| **Admin Dashboard** | Analytics, doctor verification, user management, refunds | admin controller + analytics service |
| **Notifications** | In-app notifications + email delivery | Notification model + notification service |
| **Session Documents** | PDF uploads for clinical notes | Cloudinary + appointmentMedia controller |
| **Waitlist System** | Patient interest tracking for unavailable doctors | Waitlist model + waitlist controller |

---

## Technology Decisions

**Backend:** Node.js + Express (production-grade error handling via asyncHandler pattern)  
**Database:** MongoDB + Mongoose (atomic operations via findOneAndUpdate for slot locking)  
**Authentication:** JWT + bcrypt (stateless, scalable)  
**Payments:** Razorpay (requires paise conversion; see ADR-001)  
**File Storage:** Cloudinary (resource_type: 'raw' for PDFs; see ADR-003)  
**AI:** OpenAI GPT-3.5 (doctor summaries + symptom triage)  
**Deployment:** Vercel (frontend) + Render (backend) + MongoDB Atlas (database)  
**Date Handling:** YYYY-MM-DD string format (not Date objects; see development rules)

---

## Database Summary

| Model | Primary Fields | Relationships |
|-------|---|---|
| **User** | email, passwordHash, role, isActive | ← PatientProfile, DoctorProfile |
| **DoctorProfile** | user, specialization, consultationFee, isVerified, credentials | → Appointments, AvailabilitySlots, Reviews |
| **PatientProfile** | user, medicalHistory, avatar | → Appointments, Reviews, Waitlist |
| **AvailabilitySlot** | doctor, date, startTime, endTime, isBooked, weeklySchedule | ← Appointment |
| **WeeklySchedule** | doctor, dayOfWeek, startTime, endTime, isActive | → AvailabilitySlot |
| **Appointment** | patient, doctor, slot, date, startTime, endTime, status, consultationFee (snapshot), platformCommission (snapshot), doctorEarnings (snapshot), paymentStatus, sessionDocument | ← Payment, AppointmentMedia, Review, Notification |
| **Payment** | appointment, razorpayOrderId, razorpayPaymentId, razorpaySignature, amount, status, platformCommission (snapshot), doctorEarnings (snapshot), refundStatus | ← Appointment |
| **Review** | appointment, patient, doctor, rating, comment, visibility, isVerified | ← Appointment |
| **AppointmentMedia** | appointment, media (array), uploadedBy, uploadedAt | ← Appointment |
| **Notification** | user, type, content, isRead, relatedAppointment | ← Appointment, Payment |
| **Waitlist** | patient, doctor, joinedAt, status | ← DoctorProfile |

---

## API Surface Summary

**Public (no auth):**
- GET /api/health — Server health check
- POST /api/auth/register — User registration
- POST /api/auth/login — User login
- GET /api/discover — Paginated doctor listing
- GET /api/discover/nearby — Geospatial proximity recommendations
- GET /api/discover/search — Full-text search
- GET /api/search/suggestions — Autocomplete suggestions
- GET /api/discover/:id — Doctor public profile
- GET /api/availability/:doctorId/available — Available slots for doctor
- POST /api/ai/interpret-symptoms — Free-text symptom analysis
- GET /api/ai/doctor-summary/:doctorId — Cached doctor summary
- GET /api/reviews/doctor/:doctorId — Visible reviews for doctor

**Patient (authenticated, role: patient):**
- GET/PUT /api/patients/profile/me — Patient profile CRUD
- POST /api/patients/profile/avatar — Avatar upload
- POST /api/appointments/book — Book appointment
- GET /api/appointments/mine — Patient's appointments
- PATCH /api/appointments/:id/cancel-patient — Request cancellation
- POST /api/payments/create-order — Initiate payment
- POST /api/payments/verify — Verify payment signature
- GET /api/payments/mine — Payment history
- POST /api/reviews — Submit review
- GET /api/reviews/mine — Review history
- GET /api/waitlist/mine — Waitlisted doctors
- GET /api/waitlist/status/:doctorId — Waitlist status
- POST /api/waitlist/join/:doctorId — Join waitlist
- DELETE /api/waitlist/leave/:doctorId — Leave waitlist
- GET/PATCH /api/notifications/... — Notification management

**Doctor (authenticated, role: doctor):**
- GET/PUT /api/doctors/profile/me — Doctor profile CRUD
- PUT /api/doctors/profile/onboard — Onboarding with documents
- POST /api/availability/slots — Create slot
- GET /api/availability/slots/mine — Own slots
- PUT/DELETE /api/availability/slots/:slotId — Slot management
- GET /api/appointments/doctor/mine — Doctor's appointments
- PATCH /api/appointments/:id/complete — Mark completed
- POST /api/appointments/:id/cancel-doctor — Cancel with auto-refund
- POST /api/documents/upload/:appointmentId — Upload session notes
- DELETE /api/documents/:appointmentId — Delete session notes
- GET /api/notifications/... — Notification management

**Admin (authenticated, role: admin):**
- GET /api/admin/doctors/pending — Pending verification
- GET /api/admin/doctors/all — All doctors
- PATCH /api/admin/doctors/:profileId/verify — Approve doctor
- PATCH /api/admin/doctors/:profileId/reject — Reject doctor
- PATCH /api/admin/doctors/:profileId/suspend — Suspend doctor
- PATCH /api/admin/doctors/:profileId/reconsider — Reconsider rejected
- GET /api/admin/users — All users
- PATCH /api/admin/users/:id/status — Toggle user status
- GET /api/admin/analytics/* — Analytics endpoints (6 total)
- GET /api/admin/refunds/stats — Refund statistics
- GET /api/admin/refunds — Refund queue
- PATCH /api/admin/refunds/:paymentId/approve — Approve refund
- PATCH /api/admin/refunds/:paymentId/reject — Reject refund
- GET /api/appointments/admin/all — All appointments
- GET /api/payments/admin/all — All payments
- GET /api/reviews/admin/all — All reviews
- PATCH /api/reviews/:id/visibility — Toggle review visibility
- POST /api/ai/admin/batch-summaries — Batch generate summaries

---

## Active Constraints

**Do Not Violate:**

1. **Slot Locking (ADR-001):** Use `findOneAndUpdate` with `isBooked: false` condition for atomic slot locking. Never use separate find + save operations.

2. **Fee Snapshot (ADR-004):** `consultationFee`, `platformCommission`, and `doctorEarnings` are written to Appointment at booking time from DoctorProfile. Never recalculate after booking. Never read from DoctorProfile for historical appointments.

3. **Razorpay Paise Conversion (ADR-006):** Always convert rupees to paise (multiply by 100) before Razorpay API calls. Store amounts in rupees in database.

4. **Signature Verification (ADR-009):** Verify HMAC-SHA256 signature before updating payment status or appointment status.

5. **Payment Before Status Change:** No appointment can transition to `confirmed` or `completed` unless payment status is `paid`.

6. **Date Format:** Use YYYY-MM-DD string format for all date comparisons. Never store Date objects in date field of Appointment or AvailabilitySlot.

7. **Email Fire-and-Forget (ADR-008):** Never await email sending in booking, cancellation, or payment flows. Email is asynchronous.

8. **Role Guards:** All role-based access control is enforced at route level, not controller level.

9. **AsyncHandler Wrapper:** All controller functions require asyncHandler wrapper for automatic error handling.

10. **Server Directory:** Server directory changes never cascade to client build. Frontend changes never modify server code.

11. **Appointment Collection Immutability:** AppointmentMedia, Notification, and Review are separate collections linked via appointment ID. Never embed arrays of these inside Appointment.

12. **Refund Reasons:** Refund rejection must always include explanation note in `refundAdminNote` field.

---

## Coding Conventions

**File Organization:**

- Controllers: One per resource (appointment.controller.js, payment.controller.js, etc.)
- Services: Business logic; controllers are route handlers only
- Models: Mongoose schemas with required indexes defined
- Routes: Grouped by resource; role guards at route level
- Middleware: Auth, error handling, validation, upload configured in app.js
- Validations: Request schema validation using industry-standard validator
- Utils: asyncHandler, AppError, apiResponse, constants, logger

**Error Handling:**

```javascript
// All controllers wrapped with asyncHandler
export const bookAppointment = asyncHandler(async (req, res) => {
  // Throw AppError — asyncHandler catches and formats
  if (!slot) throw new AppError('Slot not found', 404);
  // ... logic
  res.json(apiResponse.success(data, 'Appointment booked'));
});
```

**Response Format:**

```javascript
// Success response
res.json(apiResponse.success(data, message));

// Error response (automatic via error middleware)
throw new AppError(message, statusCode);
```

**Naming Conventions:**

- Models: PascalCase (Appointment, DoctorProfile, AvailabilitySlot)
- Controllers: camelCase (appointmentController, paymentController)
- Functions: camelCase (bookAppointment, verifySignature)
- Constants: UPPER_SNAKE_CASE (PLATFORM_COMMISSION_PERCENT = 10)
- Routes: kebab-case (/api/appointments/book, /api/availability/slots)

**Date Handling:**

```javascript
// Always use YYYY-MM-DD format for comparison
const today = new Date().toISOString().split('T')[0]; // "2026-06-11"
const appointment = await Appointment.findOne({ date: today });
```

**Financial Calculations:**

```javascript
// Database: stored in rupees
const consultationFee = 500; // rupees

// Razorpay API: convert to paise
const razorpayAmount = consultationFee * 100; // 50000 paise

// Commission split
const platformCommission = Math.floor(consultationFee * 0.10);
const doctorEarnings = consultationFee - platformCommission;
```

---

## Dependencies

**Core Production Dependencies:**

- `express` — HTTP server framework
- `mongoose` — MongoDB ORM
- `jsonwebtoken` — JWT authentication
- `bcrypt` — Password hashing
- `dotenv` — Environment variable management
- `cloudinary` — File storage
- `razorpay` — Payment processing
- `openai` — AI integration
- `nodemailer` — Email sending
- `joi` — Request validation
- `cors` — Cross-origin resource sharing

**Node Version:** 18+  
**Package Manager:** npm

---

## Critical Patterns

**Atomic Slot Locking:**

```javascript
// CORRECT — atomic operation
const slot = await AvailabilitySlot.findOneAndUpdate(
  { _id: slotId, isBooked: false },
  { isBooked: true },
  { new: true }
);

// WRONG — race condition
const slot = await AvailabilitySlot.findById(slotId);
if (!slot.isBooked) {
  slot.isBooked = true;
  await slot.save();
}
```

**Fee Snapshot:**

```javascript
// At booking time
const doctorProfile = await DoctorProfile.findById(doctorId);
const appointment = await Appointment.create({
  consultationFee: doctorProfile.consultationFee,
  platformCommission: Math.floor(doctorProfile.consultationFee * 0.10),
  doctorEarnings: Math.floor(doctorProfile.consultationFee * 0.90),
  // ...
});

// Later retrieval — never recalculate
const fee = appointment.consultationFee; // always read from Appointment
```

**Razorpay Order Creation:**

```javascript
// Always convert to paise
const razorpayOrder = await razorpay.orders.create({
  amount: consultationFee * 100, // rupees to paise
  currency: 'INR',
  // ...
});
```

**Signature Verification:**

```javascript
// HMAC-SHA256 verification before any status change
import crypto from 'crypto';

const expectedSignature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(orderId + '|' + paymentId)
  .digest('hex');

if (expectedSignature !== receivedSignature) {
  throw new AppError('Invalid payment signature', 400);
}
```

---

## Phase Completion Status

| Phase | Status | Endpoints | Features |
|-------|--------|-----------|----------|
| 1. Foundation | ✅ Complete | 1 | Health check |
| 2. Authentication | ✅ Complete | 2 | Register, Login |
| 3. Doctor Onboarding | ✅ Complete | 2 | Profile, Documents |
| 4. Discovery & Search | ✅ Complete | 5 | Listing, Proximity, Search |
| 5. Booking System | ✅ Complete | 5 | Book, Cancel, Complete |
| 6. Payments | ✅ Complete | 3 | Create Order, Verify, History |
| 7. Reviews & Ratings | ✅ Complete | 5 | Submit, View, Admin Control |
| 8. AI Integration | ✅ Complete | 3 | Symptom Triage, Summaries |
| 9. Admin Dashboard | ✅ Complete | 12 | Analytics, Verification, Users |
| 10. Polish & Deploy | ✅ Complete | — | Live deployment |
| 11. Patient Experience | ✅ Complete | — | UX enhancements |
| 12. Accessibility | ✅ Complete | — | WCAG compliance |
| 13. Refunds & Cancellation | ✅ Complete | 8 | Patient/Doctor/Admin cancel, Refund approval |
| 14. Session Records & Care Continuity | ✅ Complete | 6 | Session Record CRUD, Timeline query, Admin archive, Notifications |

**Next Phase:** Phase 15 — Patient Compliance Tracking (Exercise Compliance)

---

## When to Read Source Files

**Always read source first for:**
- Modifying Payment or Appointment models
- Changing fee calculation logic
- Modifying slot locking mechanism
- Changes to Razorpay integration
- Changes to signature verification
- Changes to refund workflow
- Any change to authentication middleware

**Check Recent Changes before reading source:**
- Any file marked stale in staleness-manifest.json
- Files modified in the last 7 days
- Any file that is a direct dependency of your change

**Query the dependency graph before:**
- Changing a model (to see affected controllers/services)
- Changing a controller (to see affected routes/services)
- Changing a service (to see what depends on it)

