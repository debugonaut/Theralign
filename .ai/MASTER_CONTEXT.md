# THERALIGN — MASTER CONTEXT FOR AGENTIC CODING

**Version:** 1.0.0  
**Generated:** 2026-06-11  
**Last Updated:** 2026-06-17  
**Status:** ✅ Complete & Production Ready  
**Scope:** Past (Phases 1–16), Present (Current State), Future (Phase 17+ Planning)  
**Token Estimate:** 15,000–18,000 tokens for complete context

---

# TABLE OF CONTENTS

1. [Product Overview](#product-overview)
2. [Current Architecture](#current-architecture)
3. [Complete Technology Stack](#complete-technology-stack)
4. [Database Schema & Relationships](#database-schema--relationships)
5. [All 60+ API Endpoints (Organized by Resource)](#all-60-api-endpoints-organized-by-resource)
6. [Design Language & Component System](#design-language--component-system)
7. [Critical Architectural Decisions (ADRs 1–9)](#critical-architectural-decisions-adrs-1--9)
8. [Development Rules & Conventions](#development-rules--conventions)
9. [Project History & Phase Completion](#project-history--phase-completion)
10. [Current State & Recent Changes](#current-state--recent-changes)
11. [Future Roadmap (Phase 15+)](#future-roadmap-phase-15)
12. [Code Patterns & Examples](#code-patterns--examples)
13. [File Structure Reference](#file-structure-reference)
14. [Subsystem Reference](#subsystem-reference)
15. [Emergency Contacts & Escalation](#emergency-contacts--escalation)

---

# PRODUCT OVERVIEW

## What Is Theralign?

Theralign is a **healthcare SaaS marketplace** connecting patients with verified physiotherapy professionals. The platform enables:

- **Patients:** Discover nearby physiotherapists, browse profiles with ratings/reviews, book appointments with secure payments, receive session documentation, and track treatment progress
- **Doctors:** Manage availability, accept bookings, provide treatment, track patient progress, and earn commission-based revenue
- **Admins:** Verify professionals, manage refunds, analyze platform metrics, monitor quality, and operate the marketplace

**Emotional Register:** Structured Warmth — professional enough for healthcare, warm enough for patients in pain.

**Revenue Model:** 10/90 commission split. Patients pay 100% of fee; platform keeps 10%, doctor keeps 90%.

**Geographic Focus:** India (en-IN locale, IST timezone, rupee currency, phone numbers +91 format).

**Current Status:** Phase 16 complete. 70+ live endpoints. 16,000+ lines of backend code. 55+ React components. 13 Mongoose models.

**Live Demo:**
- Frontend: https://theralign.vercel.app
- API: https://theralign-api.onrender.com/health
- Test Account (Patient): `patient@demo.com` / `Demo@123456`
- Test Account (Doctor): `doctor@demo.com` / `Demo@123456`
- Test Account (Admin): `admin@theralign.com` / `Admin@123456`

---

# CURRENT ARCHITECTURE

## System Diagram (Text-Based)

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)                    │
│  Deployed: Vercel | URL: theralign.vercel.app               │
├─────────────────────────────────────────────────────────────┤
│  Authentication (JWT) | Role Guards (Patient/Doctor/Admin)  │
│  40+ Components | 3 Layout Systems | Zustand State Mgmt     │
│  Real-time Availability Calendar | Payment Checkout Flow   │
│  Doctor Verification Queues | Admin Analytics Charts        │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS REST API
                     │ Axios Instance + Interceptors
                     │ Bearer Token Injection
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              SERVER (Node.js + Express.js)                   │
│  Deployed: Render | URL: theralign-api.onrender.com         │
├─────────────────────────────────────────────────────────────┤
│  Auth Middleware (JWT verify + Role checks)                 │
│  60+ REST Endpoints organized by resource                   │
│  Error Handling (asyncHandler + AppError + apiResponse)     │
│  asyncHandler Wrapper on all 60+ controller functions       │
│  Fire-and-Forget Email Service (Nodemailer)                 │
│  MongoDB Aggregation Pipelines (Analytics)                  │
│  Atomic Database Operations (findOneAndUpdate slots)        │
└────────────────────┬────────────────────────────────────────┘
                     │ Mongoose ODM
                     │ Connection Pool
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (MongoDB Atlas)                        │
│  Cloud-Hosted | 12 Collections | 50+ Indexes                │
├─────────────────────────────────────────────────────────────┤
│  User | DoctorProfile | PatientProfile                      │
│  Appointment | AvailabilitySlot | WeeklySchedule            │
│  Payment | Review | AppointmentMedia                        │
│  Notification | Waitlist | SessionRecord (Phase 14)         │
└─────────────────────────────────────────────────────────────┘

External Services:
├─ Razorpay (Payments: HMAC-SHA256 webhook verification)
├─ Cloudinary (File Storage: resource_type raw for PDFs)
├─ OpenAI (AI: Symptom triage + doctor summaries)
└─ Nodemailer (Email: Fire-and-forget transactional emails)
```

---

# COMPLETE TECHNOLOGY STACK

## Frontend
- **Framework:** React 18 + Vite (build system)
- **Styling:** Tailwind CSS 3 + custom design tokens
- **State Management:** Zustand (auth store + UI state)
- **HTTP Client:** Axios + custom interceptor for token injection
- **Icons:** Lucide React (SVG icons, no emoji)
- **Form Validation:** Client-side validation + server validation
- **Date/Time:** Native JS Date + YYYY-MM-DD string format
- **Notifications:** React Hot Toast (bottom-right, auto-dismiss)
- **Build:** Vite (instant HMR, optimized bundles)
- **Deployment:** Vercel (automatic git push → production)

## Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4
- **ODM:** Mongoose 6 (schema validation + virtual fields)
- **Authentication:** JWT (jsonwebtoken) + bcrypt (password hashing)
- **Request Validation:** Joi schemas + custom validate middleware
- **Error Handling:** Custom AppError class + asyncHandler wrapper
- **Email:** Nodemailer (fire-and-forget, never awaited)
- **Task Scheduling:** node-cron (reminders, notifications)
- **File Upload:** Multer (memory storage for Cloudinary streaming)
- **External APIs:** Razorpay SDK, OpenAI SDK, Cloudinary SDK
- **Logging:** Custom logger utility (no console.log in production)
- **Deployment:** Render (automatic git push → production)

## Database
- **Type:** MongoDB (document-oriented, flexible schema)
- **Hosting:** MongoDB Atlas (cloud-managed, auto-backups)
- **Connection:** Mongoose connection pool with retry logic
- **Indexing:** 50+ indexes for query optimization
- **Transactions:** Not used (simple ACID via atomic updates)
- **Replication:** 3-node replica set (high availability)

## External Services
- **Payments:** Razorpay (orders, captures, refunds, webhooks)
- **Storage:** Cloudinary (credentials PDFs, session notes, avatars)
- **AI:** OpenAI GPT-3.5 (symptom triage, doctor profile summaries)
- **Email:** Nodemailer + Gmail SMTP (transactional emails)

---

# DATABASE SCHEMA & RELATIONSHIPS

## Complete Schema Reference

```
User (Parent)
  ├─ email: String (unique)
  ├─ passwordHash: String (hashed with bcrypt)
  ├─ role: String ('patient' | 'doctor' | 'admin')
  ├─ isActive: Boolean
  ├─ profileImage: String (Cloudinary URL)
  ├─ createdAt: Date
  └─ Linked to: DoctorProfile (1-to-1), PatientProfile (1-to-1)

DoctorProfile (Professional)
  ├─ user: ObjectId (User)
  ├─ specialization: [String]
  ├─ bio: String
  ├─ consultationFee: Number (rupees, snapshotted at booking)
  ├─ clinicName: String
  ├─ clinicAddress: String
  ├─ clinicLocation: GeoJSON (2dsphere indexed)
  ├─ credentials: [{ url, publicId, fileName }]
  ├─ isVerified: Boolean
  ├─ rejectionFeedback: String
  ├─ averageRating: Number (denormalized from Review aggregation)
  ├─ totalReviews: Number (denormalized from Review count)
  ├─ aiSummary: String (cached from OpenAI)
  ├─ aiSummaryGeneratedAt: Date
  ├─ createdAt: Date
  └─ Linked to: AvailabilitySlot, Appointment, Review, Waitlist

PatientProfile (Individual)
  ├─ user: ObjectId (User)
  ├─ medicalHistory: String
  ├─ address: String
  ├─ city: String
  ├─ createdAt: Date
  └─ Linked to: Appointment, Review, Waitlist

AvailabilitySlot (Booking Unit)
  ├─ doctor: ObjectId (DoctorProfile)
  ├─ date: String (YYYY-MM-DD format, not Date object)
  ├─ startTime: String (HH:mm format)
  ├─ endTime: String (HH:mm format)
  ├─ isBooked: Boolean (atomic with findOneAndUpdate)
  ├─ isActive: Boolean
  ├─ weeklySchedule: ObjectId (WeeklySchedule)
  ├─ createdAt: Date
  └─ Indexes: { doctor, date }, { doctor, isBooked }

WeeklySchedule (Recurring Pattern)
  ├─ doctor: ObjectId (DoctorProfile)
  ├─ dayOfWeek: Number (0-6, Monday=0)
  ├─ startTime: String (HH:mm)
  ├─ endTime: String (HH:mm)
  ├─ isActive: Boolean
  ├─ createdAt: Date
  └─ Indexes: { doctor, dayOfWeek } (unique)

Appointment (Core Transaction)
  ├─ patient: ObjectId (User)
  ├─ doctor: ObjectId (DoctorProfile)
  ├─ slot: ObjectId (AvailabilitySlot)
  ├─ date: String (YYYY-MM-DD, snapshot at booking)
  ├─ startTime: String (HH:mm, snapshot)
  ├─ endTime: String (HH:mm, snapshot)
  ├─ status: String ('pending'|'confirmed'|'completed'|'cancelled')
  ├─ consultationFee: Number (rupees, snapshotted from DoctorProfile)
  ├─ platformCommission: Number (10% of fee, snapshotted)
  ├─ doctorEarnings: Number (90% of fee, snapshotted)
  ├─ paymentStatus: String ('unpaid'|'paid'|'refunded')
  ├─ paymentId: String (Razorpay payment ID)
  ├─ patientNotes: String (optional booking notes)
  ├─ cancellationReason: String
  ├─ cancelledBy: String ('patient'|'doctor'|'admin'|'system'|null)
  ├─ reviewSubmitted: Boolean (prevents duplicate reviews)
  ├─ sessionDocument: { url, publicId, uploadedAt, fileName }
  ├─ createdAt: Date
  └─ Indexes: { patient, status }, { doctor, status }, { slot }

Payment (Financial Record)
  ├─ appointment: ObjectId (Appointment, unique)
  ├─ patient: ObjectId (User)
  ├─ doctor: ObjectId (DoctorProfile)
  ├─ razorpayOrderId: String (unique)
  ├─ razorpayPaymentId: String (populated after capture)
  ├─ razorpaySignature: String (populated after verification)
  ├─ amount: Number (rupees, converted to paise at API call)
  ├─ currency: String ('INR')
  ├─ status: String ('created'|'paid'|'failed'|'refunded')
  ├─ platformCommission: Number (snapshot from Appointment)
  ├─ doctorEarnings: Number (snapshot from Appointment)
  ├─ refundStatus: String ('none'|'requested'|'pending'|'approved'|'rejected'|'processed')
  ├─ refundReason: String
  ├─ refundId: String (Razorpay refund ID)
  ├─ refundAdminNote: String (required for rejection)
  ├─ refundAmount: Number
  ├─ refundInitiatedBy: String ('patient'|'doctor'|'admin'|null)
  ├─ refundRequestedAt: Date
  ├─ refundProcessedAt: Date
  ├─ createdAt: Date
  └─ Indexes: { appointment }, { patient }, { razorpayOrderId }

Review (Social Proof)
  ├─ appointment: ObjectId (Appointment, unique)
  ├─ patient: ObjectId (User)
  ├─ doctor: ObjectId (DoctorProfile)
  ├─ rating: Number (1-5)
  ├─ comment: String (min 10 chars)
  ├─ isVisible: Boolean (soft-hide, not deleted)
  ├─ isVerified: Boolean (true if from completed paid appointment)
  ├─ createdAt: Date
  └─ Indexes: { appointment }, { doctor }

AppointmentMedia (Pre-booking Uploads)
  ├─ appointment: ObjectId (Appointment)
  ├─ patient: ObjectId (User)
  ├─ doctor: ObjectId (DoctorProfile)
  ├─ media: [{ url, publicId, type }]
  ├─ uploadedBy: String ('patient'|'doctor'|'admin')
  ├─ description: String
  ├─ isVisible: Boolean
  ├─ uploadedAt: Date
  └─ Indexes: { appointment }, { uploadedBy }

Notification (User Alerts)
  ├─ user: ObjectId (User)
  ├─ type: String ('APPOINTMENT_BOOKED'|'PAYMENT_RECEIVED'|etc)
  ├─ content: String (notification message)
  ├─ isRead: Boolean
  ├─ relatedAppointment: ObjectId (optional reference)
  ├─ createdAt: Date
  └─ Indexes: { user, isRead }, { user, createdAt }

Waitlist (Patient Interest)
  ├─ patient: ObjectId (User)
  ├─ doctor: ObjectId (DoctorProfile)
  ├─ status: String ('active'|'notified'|'expired')
  ├─ joinedAt: Date
  └─ Indexes: { patient, doctor } (unique)

SessionRecord (Phase 14 — Care Continuity)
  ├─ appointment: ObjectId (Appointment, unique)
  ├─ doctor: ObjectId (DoctorProfile)
  ├─ patient: ObjectId (User)
  ├─ presentingCondition: String
  ├─ treatmentProvided: String
  ├─ progressRating: String ('worse'|'no_change'|'slight_improvement'|'significant_improvement'|'resolved')
  ├─ painScoreBefore: Number (0-10)
  ├─ painScoreAfter: Number (0-10)
  ├─ exercisePrescription: [{ exerciseName, exerciseLibraryId, sets, reps, frequency, duration, prescriptionDuration, notes }]
  ├─ medications: [String]
  ├─ clinicalObservations: String
  ├─ followUpRecommendation: { recommended, intervalDays, suggestedDate, sessionGoal }
  ├─ isSharedWithPatient: Boolean
  ├─ doctorSignedAt: Date
  ├─ createdAt: Date
  └─ Indexes: { appointment }, { doctor }, { patient }
```

## Relationship Diagram

```
User (1) ──────── (1) DoctorProfile
    │                     │
    │                     ├─ (1) ──── (∞) AvailabilitySlot
    │                     ├─ (1) ──── (∞) Appointment
    │                     ├─ (1) ──── (∞) Review
    │                     ├─ (1) ──── (∞) Waitlist
    │                     └─ (1) ──── (∞) SessionRecord
    │
    ├─ (1) ──── (1) PatientProfile
    │                     │
    │                     ├─ (1) ──── (∞) Appointment
    │                     ├─ (1) ──── (∞) Review
    │                     ├─ (1) ──── (∞) Waitlist
    │                     └─ (1) ──── (∞) SessionRecord
    │
    └─ (1) ──── (∞) Notification

Appointment (1) ──────── (1) AvailabilitySlot
    │                          │
    │                          └─ (1) ──── (1) WeeklySchedule
    │
    ├─ (1) ──── (1) Payment
    ├─ (0..1) ─ (1) Review (unique constraint: one review per appointment)
    ├─ (0..1) ─ (1) AppointmentMedia
    ├─ (0..1) ─ (1) SessionRecord
    └─ (1) ──── (∞) Notification
```

## Critical Data Immutability Rules

1. **Appointment Date/Times:** Snapshot from AvailabilitySlot at booking time. Never change after creation.
2. **Financial Fields:** `consultationFee`, `platformCommission`, `doctorEarnings` snapshotted at booking time. Never recalculate.
3. **Payment Fields:** Once payment is `paid`, status never reverts to `unpaid`.
4. **Role Field:** User role is immutable after creation. Never change via API.
5. **Appointment Status:** Can only progress: pending → confirmed → completed/cancelled. Never reverse.

---

# ALL 60+ API ENDPOINTS (ORGANIZED BY RESOURCE)

## Health & Status
- `GET /api/health` — Server health check (public)

## Authentication (2 endpoints)
- `POST /api/auth/register` — User registration (public)
- `POST /api/auth/login` — User login (public)

## Patient Profiles (3 endpoints)
- `GET /api/patients/profile/me` — Get authenticated patient profile (patient)
- `PUT /api/patients/profile/me` — Update patient profile (patient)
- `POST /api/patients/profile/avatar` — Upload patient avatar (patient)

## Doctor Profiles (8 endpoints)
- `GET /api/doctors/profile/me` — Get authenticated doctor profile (doctor)
- `PUT /api/doctors/profile/me` — Update doctor profile (doctor)
- `PUT /api/doctors/profile/onboard` — Doctor onboarding with documents (doctor)
- `GET /api/discover` — Paginated doctor listing (public)
- `GET /api/discover/:id` — Doctor public profile (public)
- `GET /api/discover/nearby` — Geospatial proximity search (public)
- `GET /api/discover/search` — Full-text search (public)
- `GET /api/search/suggestions` — Autocomplete suggestions (public)

## Availability Management (5 endpoints)
- `POST /api/availability/slots` — Create availability slot (doctor)
- `GET /api/availability/slots/mine` — Get doctor's slots (doctor)
- `PUT /api/availability/slots/:slotId` — Update slot (doctor)
- `DELETE /api/availability/slots/:slotId` — Delete slot (doctor)
- `GET /api/availability/:doctorId/available` — Available slots for doctor (public)

## Appointment Booking (8 endpoints)
- `POST /api/appointments/book` — Book appointment (patient)
- `GET /api/appointments/mine` — Patient's appointments (patient)
- `GET /api/appointments/doctor/mine` — Doctor's appointments (doctor)
- `PATCH /api/appointments/:id/complete` — Mark appointment completed (doctor)
- `POST /api/appointments/:appointmentId/cancel-patient` — Patient cancel with refund request (patient)
- `POST /api/appointments/:appointmentId/cancel-doctor` — Doctor cancel with auto-refund (doctor)
- `GET /api/appointments/admin/all` — All appointments (admin)
- `PATCH /api/appointments/:id/cancel` — Deprecated (use cancel-patient/cancel-doctor)

## Payments (5 endpoints)
- `POST /api/payments/create-order` — Create Razorpay order (patient)
- `POST /api/payments/verify` — Verify payment signature (patient)
- `GET /api/payments/mine` — Patient payment history (patient)
- `GET /api/payments/admin/all` — All payments (admin)
- `POST /api/payments/webhook` — Razorpay webhook (internal)

## Refunds (4 endpoints)
- `GET /api/admin/refunds/stats` — Refund system statistics (admin)
- `GET /api/admin/refunds` — Pending and processed refunds (admin)
- `PATCH /api/admin/refunds/:paymentId/approve` — Approve refund (admin)
- `PATCH /api/admin/refunds/:paymentId/reject` — Reject refund (admin)

## Reviews & Ratings (5 endpoints)
- `POST /api/reviews` — Submit review (patient)
- `GET /api/reviews/doctor/:doctorId` — Visible reviews for doctor (public)
- `GET /api/reviews/mine` — Patient review history (patient)
- `GET /api/reviews/admin/all` — All reviews (admin)
- `PATCH /api/reviews/:id/visibility` — Toggle review visibility (admin)

## AI Integration (3 endpoints)
- `POST /api/ai/interpret-symptoms` — Symptom triage (public)
- `GET /api/ai/doctor-summary/:doctorId` — Cached doctor summary (public)
- `POST /api/ai/admin/batch-summaries` — Batch generate summaries (admin)

## Admin Operations (12 endpoints)

### Doctor Verification
- `GET /api/admin/doctors/pending` — Pending doctor applications (admin)
- `GET /api/admin/doctors/all` — All doctors (admin)
- `PATCH /api/admin/doctors/:profileId/verify` — Approve doctor (admin)
- `PATCH /api/admin/doctors/:profileId/reject` — Reject doctor (admin)
- `PATCH /api/admin/doctors/:profileId/suspend` — Suspend doctor (admin)
- `PATCH /api/admin/doctors/:profileId/reconsider` — Reconsider rejected doctor (admin)

### User Management
- `GET /api/admin/users` — All users (admin)
- `PATCH /api/admin/users/:id/status` — Toggle user active status (admin)

### Analytics (7 endpoints)
- `GET /api/admin/analytics/overview` — Platform overview metrics (admin)
- `GET /api/admin/analytics/revenue` — Revenue time-series (admin)
- `GET /api/admin/analytics/appointments` — Appointment status breakdown (admin)
- `GET /api/admin/analytics/top-doctors` — Top performing doctors (admin)
- `GET /api/admin/analytics/specializations` — Specialization distribution (admin)
- `GET /api/admin/analytics/user-growth` — User registrations growth (admin)
- `GET /api/admin/analytics/recent-activity` — Recent activity audit feed (admin)

## Documents & Media (4 endpoints)
- `POST /api/appointment-media/upload/:appointmentId` — Upload media (patient/doctor)
- `GET /api/appointment-media/:appointmentId` — Get media for appointment (patient/doctor/admin)
- `DELETE /api/appointment-media/:mediaId` — Delete media (uploader/doctor/admin)
- `GET /api/appointment-media/count/:appointmentId` — Get media count (patient/doctor/admin)
- `POST /api/documents/upload/:appointmentId` — Upload session notes PDF (doctor)
- `DELETE /api/documents/:appointmentId` — Delete session notes (doctor)

## Notifications (4 endpoints)
- `GET /api/notifications/mine` — User notifications (authenticated)
- `GET /api/notifications/unread-count` — Unread notification count (authenticated)
- `PATCH /api/notifications/read-all` — Mark all as read (authenticated)
- `PATCH /api/notifications/:id/read` — Mark specific as read (authenticated)

## Waitlist (4 endpoints)
- `GET /api/waitlist/mine` — Patient's waitlisted doctors (patient)
- `GET /api/waitlist/status/:doctorId` — Waitlist status for doctor (patient)
- `POST /api/waitlist/join/:doctorId` — Join waitlist (patient)
- `DELETE /api/waitlist/leave/:doctorId` — Leave waitlist (patient)

## Session Records (Phase 14) (5 endpoints)
- `POST /api/session-records/:appointmentId` — Create session record (doctor)
- `GET /api/session-records/:appointmentId` — Get session record (patient/doctor/admin)
- `PUT /api/session-records/:appointmentId` — Update session record (doctor, within 24h)
- `GET /api/session-records/doctor/history` — Doctor session history (doctor)
- `GET /api/session-records/patient/timeline` — Patient care timeline (patient)

**Total: 60+ endpoints | 14 resource groups | 3 roles + public access | 100% REST compliant**

---

# DESIGN LANGUAGE & COMPONENT SYSTEM

## Colors (Strict Palette — Never Deviate)

```
PRIMARY TEAL-NAVY:    #0B4F6C   (brand color, default state)
PRIMARY DARK:         #083A52   (hover state)
PRIMARY LIGHT:        #E8F4F8   (tinted background)

ACCENT CORAL:         #F4845F   (high-stakes CTA only — ONE per screen)
ACCENT DARK:          #D96840   (accent hover)
ACCENT LIGHT:         #FDF0EB   (accent background)

SUCCESS:              #0A7E6E   (verified, confirmed, paid, available)
WARNING:              #B45309   (pending, attention required)
DANGER:               #C0392B   (destructive actions, errors, rejection)

NEUTRAL 900:          #1C2B3A   (primary text)
NEUTRAL 700:          #3D5166   (secondary headings)
NEUTRAL 500:          #6B7C93   (secondary text, labels)
NEUTRAL 300:          #A8B8C8   (placeholder text)
NEUTRAL 200:          #DDE3EA   (input borders, dividers)
NEUTRAL 100:          #F0F4F7   (table headers, sidebar)
NEUTRAL 50:           #F7F9FB   (page background)

SURFACE:              #FFFFFF   (cards, modals, panels)
```

## Typography

**Font:** Inter only. No other font under any circumstances.

**Scale:**
- 10px: Micro labels, badges, timestamps
- 11px: Small labels, secondary metadata
- 12px: Secondary body, captions
- 13px: Standard body text, table cells
- 14px: Primary body text, form inputs
- 15px: Card titles, emphasized body
- 16px: Section subheadings
- 18px: Page subheadings
- 22px: Dashboard page titles
- 28px: Section display headers
- 36px: Page-level display headers
- 48px: Hero headlines (landing page only)

**Weights:** 400 (body), 500 (labels), 600 (titles), 700 (headings), 800 (numbers), 900 (hero)

**Casing Rules:**
- Hero headlines: UPPERCASE
- Section headers: UPPERCASE
- Dashboard titles: Title Case
- Navigation: Title Case
- Buttons: Title Case (not UPPERCASE)
- Badges: UPPERCASE
- Table headers: UPPERCASE
- Form labels: Title Case
- Body text: Sentence case
- Error messages: Sentence case

## Border Radii (Use Only These Values)

```
0px   — Navbar, sidebar, table rows (never rounded)
4px   — Badges, status chips, small tags
6px   — Buttons, form inputs, textareas
8px   — Segmented controls, tab bars, small cards
12px  — Standard cards, modals, dropdowns
16px  — Large feature cards, hero cards
9999px — Avatar circles and status dots ONLY
```

## Shadows (Three Levels Only)

```
LEVEL 1 (Resting):
  0px 1px 3px rgba(11, 79, 108, 0.06),
  0px 1px 2px rgba(11, 79, 108, 0.04)

LEVEL 2 (Lifted on hover):
  0px 4px 16px rgba(11, 79, 108, 0.10),
  0px 2px 6px rgba(11, 79, 108, 0.07)

LEVEL 3 (Modal):
  0px 20px 60px rgba(11, 79, 108, 0.18),
  0px 8px 24px rgba(11, 79, 108, 0.12)
```

**Never use black shadows.** Always tint with primary teal-navy.

## Component Patterns

**Buttons:**
- Primary: `#0B4F6C` background, white text, 6px radius, 40px height
- Accent: `#F4845F` background, white text, 6px radius, 40px height (one per screen max)
- Secondary: transparent, `#0B4F6C` border + text
- Ghost: transparent, `#1C2B3A` border + text
- Danger: transparent, `#C0392B` border + text (destructive only)
- All: Inter 600, 13px, Title Case

**Inputs:**
- Border: `1.5px solid #DDE3EA`, 6px radius, 40px height, 12px padding
- Focus: `2px solid #0B4F6C` border + `box-shadow: 0 0 0 3px rgba(11,79,108,0.12)`
- Error: `2px solid #C0392B` border + `box-shadow: 0 0 0 3px rgba(192,57,43,0.10)`
- Labels above inputs always (never placeholder-as-label)
- Label: Inter 600, 12px, `#6B7C93`, Title Case
- Error message: Inter 500, 11px, `#C0392B`, sentence case, prefixed with `↑`

**Badges:**
- 4px border-radius, 3px–10px padding, Inter 700, 10px, UPPERCASE, 0.08em letter-spacing
- Success: `#E8F8F5` background, `#0A7E6E` text
- Warning: `#FEF3E2` background, `#B45309` text
- Danger: `#FDF2F2` background, `#C0392B` text
- Neutral: `#F0F4F7` background, `#6B7C93` text
- Primary: `#E8F4F8` background, `#0B4F6C` text

**Cards:**
- Background: `#FFFFFF`, Shadow Level 1, 12px radius, 24px padding
- Hover: Shadow Level 2, `transform: translateY(-2px)`, 200ms ease-out
- No visible border — shadow defines edge
- Gray header: `#FAFBFC` background, border-bottom `1px solid #EEF2F6`

**Tables:**
- Header: `#F0F4F7` background, `#6B7C93` text, Inter 600, 11px, UPPERCASE
- Rows: 52px height, `1px solid #F0F4F7` separator
- Hover: `#F7F9FB` background
- Numeric: right-aligned, tabular-nums

**Empty States:**
- Container: `#FAFBFC` background, `1px dashed #DDE3EA` border, 12px radius, 48px padding
- Icon: 32px, `#DDE3EA`
- Title: Inter 700, 18px, `#1C2B3A`, Title Case
- Description: Inter 400, 13px, `#6B7C93`, sentence case

## Animations (Always cubic-bezier(0.4, 0, 0.2, 1))

```
Hover color changes:     150ms
Card lift on hover:      200ms
Modal open/close:        200ms opacity fade
Staggered list appear:   250ms per item + 60ms stagger
Skeleton loading:        opacity pulse 1.2s infinite
Pulsing status dot:      2s ease-out infinite
Button press:            scale(0.97) at 150ms
```

All animations respect `prefers-reduced-motion: reduce` — set duration to 0.01ms.

## Layout Rules

- **Page background:** `#F7F9FB` (never white)
- **Max-width:** 1200px dashboard, 1280px public
- **Sidebar:** 80px (doctor/patient), 240px (admin)
- **Padding:** 32px × 40px standard
- **Card grid gap:** 20px
- **Section gap:** 32px
- **Form field gap:** 20px between fields, 8px between label and input

The `#F7F9FB` background with `#FFFFFF` cards creates elevation effect. Cards float above surface.

---

# CRITICAL ARCHITECTURAL DECISIONS (ADRS 1–9)

## ADR-001: Atomic Slot Locking via findOneAndUpdate

**Constraint:** Use MongoDB's `findOneAndUpdate` with conditional query `{ _id: slotId, isBooked: false }` for slot locking.

**Pattern:**
```javascript
const slot = await AvailabilitySlot.findOneAndUpdate(
  { _id: slotId, isBooked: false },  // Condition
  { isBooked: true },                 // Update
  { new: true }
);
if (!slot) throw new AppError('Slot already booked', 409);
```

**Why:** Atomic at database level. Prevents double-booking race conditions. No distributed locks needed.

**Violation Impact:** Two patients can book same slot. Breaks refund logic.

---

## ADR-002: Separate Payment Collection from Appointment

**Constraint:** Payment is separate collection linked via `appointment` ObjectId. Never embed Payment inside Appointment.

**Why:** Different lifecycles and query patterns. Appointment updates should never touch Payment schema.

**Violation Impact:** Larger Appointment documents. Complex partial updates. Broken webhook handling.

---

## ADR-003: Cloudinary resource_type Configuration

**Constraint:**
- PDFs: `resource_type: 'raw'` (no transformation, raw delivery)
- Images: `resource_type: 'auto'` (auto-detect, enable transformations)

**Why:** Maintains file integrity. Enables image optimization without corrupting PDFs.

**Violation Impact:** PDFs may be corrupted. Images may not transform.

---

## ADR-004: Consultation Fee Snapshotted at Booking Time

**Constraint:** `consultationFee`, `platformCommission`, `doctorEarnings` written to Appointment at booking time. Never recalculate after booking. Never read from DoctorProfile for historical appointments.

**Pattern:**
```javascript
// At booking time
const doctor = await DoctorProfile.findById(doctorId);
const appointment = await Appointment.create({
  consultationFee: doctor.consultationFee,
  platformCommission: Math.floor(doctor.consultationFee * 0.10),
  doctorEarnings: Math.floor(doctor.consultationFee * 0.90),
});

// Later — always read from Appointment
const fee = appointment.consultationFee; // CORRECT
const fee = doctor.consultationFee;      // WRONG
```

**Why:** Preserves historical accuracy. Doctor fee changes don't retroactively affect past appointments or revenue calculations.

**Violation Impact:** Admin analytics report wrong revenue. Patients see appointments with wrong fees. Refunds calculated incorrectly.

---

## ADR-005: Indian Number Formatting (en-IN Locale)

**Constraint:** All UI uses `Intl.NumberFormat('en-IN')`, ₹ currency, DD/MM/YYYY dates.

**Why:** Matches Indian user expectations. Accessibility tools read numbers correctly.

---

## ADR-006: Fire-and-Forget Email Sending

**Constraint:** Email never awaited in critical flows (booking, cancellation, payment). Email sent asynchronously in background.

**Pattern:**
```javascript
// CORRECT
emailService.sendBookingConfirmation(appointment); // No await

// WRONG
await emailService.sendBookingConfirmation(appointment); // Blocks patient
```

**Why:** Email is slow (0.5–2 seconds). Awaiting blocks confirmation page. Network timeouts fail entire booking.

**Violation Impact:** Booking flow becomes slow. Patient sees delays or errors due to email server problems.

---

## ADR-007: Session Records as Separate Collection

**Constraint:** SessionRecord separate collection linked via `appointment` ObjectId. Never embed session data in Appointment.

**Why:** Different access patterns (doctor-only vs. patient-visible). Independent modification lifecycle.

---

## ADR-008: AppointmentMedia with uploadedBy Field

**Constraint:** AppointmentMedia separate collection with explicit `uploadedBy` field ('patient'|'doctor'|'admin').

**Why:** Explicit ownership for audit trails. Privacy control. Independent mutable lifecycle.

---

## ADR-009: HMAC-SHA256 Payment Signature Verification

**Constraint:** All Razorpay webhooks require HMAC-SHA256 signature verification before any database update.

**Pattern:**
```javascript
const expectedSignature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(orderId + '|' + paymentId)
  .digest('hex');

if (expectedSignature !== receivedSignature) {
  throw new AppError('Invalid signature', 400);
}
// Only then: update database
```

**Why:** Prevents forged webhooks and payment manipulation.

**Violation Impact:** Attacker can mark payments as successful. Financial loss.

---

# DEVELOPMENT RULES & CONVENTIONS

## Error Handling

**All controller functions use asyncHandler:**
```javascript
export const bookAppointment = asyncHandler(async (req, res) => {
  // Errors automatically caught by wrapper
});
```

**All errors thrown as AppError:**
```javascript
throw new AppError('Slot not found', 404);
throw new AppError('Unauthorized', 403);
```

**All responses use apiResponse:**
```javascript
res.status(201).json(apiResponse.success(appointment, 'Booked'));
```

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Models | PascalCase, singular | `Appointment`, `DoctorProfile` |
| Controllers | camelCase | `appointmentController` |
| Functions | camelCase | `bookAppointment`, `verifySignature` |
| Constants | UPPER_SNAKE_CASE | `PLATFORM_COMMISSION_PERCENT` |
| Routes | kebab-case URLs | `/api/appointments/book` |
| Frontend components | PascalCase | `SlotPicker.jsx`, `BookingConfirmationModal.jsx` |

## Date Handling

**Use YYYY-MM-DD string format (not Date objects):**
```javascript
const today = new Date().toISOString().split('T')[0]; // "2026-06-11"
const appointment = { date: '2026-06-11', startTime: '09:00' };
```

**Why:** String comparison is locale-independent. Date objects cause timezone bugs.

## Financial Calculations

**Database: rupees. Razorpay API: paise.**
```javascript
const fee = 500;                    // Database (rupees)
const razorpayAmount = fee * 100;   // Razorpay API (paise)

const commission = Math.floor(fee * 0.10);
const earnings = fee - commission;
```

## Authentication & Authorization

**Role guards at route level, never in controller:**
```javascript
// CORRECT
router.patch('/api/appointments/:id/complete',
  auth,
  role('doctor'),  // ← Route level
  appointmentController.markCompleted
);

// WRONG (don't do this)
export const markCompleted = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') throw new AppError(...);
});
```

## Database Queries

**Always add indexes to models:**
```javascript
appointmentSchema.index({ patient: 1, status: 1 });
appointmentSchema.index({ doctor: 1 });
```

**Use .lean() for read-only queries:**
```javascript
const appointments = await Appointment.find({ patient: id }).lean();
```

**Never: separate find + save. Always: atomic findOneAndUpdate:**
```javascript
// WRONG
const slot = await AvailabilitySlot.findById(slotId);
slot.isBooked = true;
await slot.save(); // Race condition!

// CORRECT
const slot = await AvailabilitySlot.findOneAndUpdate(
  { _id: slotId, isBooked: false },
  { isBooked: true },
  { new: true }
);
```

## File Organization

```
server/src/
├── config/       # Database, email, payment setup
├── controllers/  # Route handlers (thin, use services)
├── middleware/   # Auth, error, validation
├── models/       # Mongoose schemas
├── routes/       # Express routes
├── services/     # Business logic (thick)
├── utils/        # Helpers, constants, errors
└── validations/  # Joi schemas

client/src/
├── api/          # Axios API calls
├── components/
│   ├── common/   # Buttons, Cards, Inputs
│   ├── layout/   # Navbar, DashboardLayout
│   └── [feature]/
├── pages/        # Route-level pages
├── styles/       # CSS, Tailwind
└── utils/        # Helpers, formatting
```

## Comments & Documentation

**Write comments for WHY, not WHAT:**
```javascript
// GOOD — explains business decision
// ADR-001: Use findOneAndUpdate to prevent double-booking
const slot = await AvailabilitySlot.findOneAndUpdate(...);

// BAD — obvious from code
// Mark slot as booked
slot.isBooked = true;
```

## Validation

**All request bodies validated with Joi:**
```javascript
const schema = Joi.object({
  slotId: Joi.string().required(),
  notes: Joi.string().max(500)
});

router.post('/book', validate(schema), controller);
```

---

# PROJECT HISTORY & PHASE COMPLETION

## Complete Phase Timeline

| Phase | Scope | Status | Date | Endpoints |
|-------|-------|--------|------|-----------|
| 1 | Foundation & Scaffolding | ✅ | Phase 1 | 1 (health) |
| 2 | Authentication | ✅ | Phase 2 | 2 (register, login) |
| 3 | Doctor Onboarding | ✅ | Phase 3 | 2 (profile, onboard) |
| 4 | Discovery & Search | ✅ | Phase 4 | 5 (listing, search, nearby) |
| 5 | Booking System | ✅ | Phase 5 | 5 (book, list, cancel) |
| 6 | Payments (Razorpay) | ✅ | Phase 6 | 3 (create-order, verify, history) |
| 7 | Reviews & Ratings | ✅ | Phase 7 | 5 (submit, view, admin) |
| 8 | AI Integration | ✅ | Phase 8 | 3 (triage, summaries, batch) |
| 9 | Admin Dashboard | ✅ | Phase 9 | 12 (verification, analytics, users) |
| 10 | Polish & Deployment | ✅ | Phase 10 | — (no new endpoints) |
| 11 | Patient Experience | ✅ | Phase 11 | — (UI/UX only) |
| 12 | Accessibility | ✅ | Phase 12 | — (WCAG compliance) |
| 13 | Refunds & Cancellation | ✅ | Phase 13 | 8 (cancel-patient, cancel-doctor, refund) |
| 14 | Pre-Appointment Media | ✅ | Phase 14 | 4 (upload, retrieve, delete, count) |
| 15 | Session Records | ✅ | 2026-06-13 | 5 (create, get, edit, history, timeline) |
| 16 | Visual Exercise Library | ✅ | 2026-06-15 | — (schema changes & UI components) |

**Total Completed:** 16 phases, 65+ endpoints, 46+ components, 13 models

---

# CURRENT STATE & RECENT CHANGES

## Latest Updates (As of 2026-06-16)

### Swiss Brutalist Landing Page Redesign (somechanges.md)
- ✅ Implemented 100vh full-screen image slider (`HeroSliderSection`) with action buttons overlay, text re-hierarchy, and auto-rotation.
- ✅ Redesigned AI Doctor Matching (`HeroSection`) to remove booking confirmation card and focus on AI doctor search with a professional header and 3 feature cards.
- ✅ Upgraded Pricing Page (`PricingTiersSection`) with rounded cards, elevated center card ("Pro Patient"), and pill-shaped CTAs.
- ✅ Overhauled Testimonials (`PatientReviewsSection`) to horizontal slider layout with autoplay and pause-on-hover logic, dark background theme, rating star fill indicators, and large grayscale patient photos.
- ✅ Removed all dotted rotating circular rings (`who-ring-dashed` animations, etc.) across the application.
- ✅ Restructured section sequence in `LandingPage.jsx` and removed `TrustBar` to clear visual noise.

### Phase 16 Completion (Visual Exercise Library & Prescription Duration System)
- ✅ Replaced static placeholder exercise list with 50+ real, categorized, structured exercises
- ✅ Added `prescriptionDuration` field to SessionRecord model and validation layer
- ✅ Built overall prescription duration dropdown selector in SessionRecordForm and ExerciseLibraryModal
- ✅ Rendered overall prescription duration on the patient care timeline, video modal, and printable template
- ✅ Resolved exercise card layout overlap issues on small viewports with text-overflow ellipsis and flex-shrink protection
- ✅ Replaced vector/SVG stickman icons in exercise cards with dynamic YouTube video thumbnails

### Phase 15 Completion (Session Records & Care Continuity)
- ✅ SessionRecord model linking Appointments to treatment summaries
- ✅ 5 new API endpoints to create, view, edit (within 24h) session records
- ✅ SessionRecordForm component for doctors
- ✅ PatientCareTimeline component for patients to view historical care
- ✅ Visual Humanization pass on exercise library components and video modal (rounded containers, tracking normal for mixed-case, elevated layout contrast)

### Phase 14 Completion (Pre-Appointment Media Upload)
- ✅ AppointmentMedia model with `uploadedBy` field
- ✅ Two-step booking confirmation flow (booking → media upload → payment)
- ✅ Media upload authorization fixes
- ✅ AppointmentMediaViewer component for all roles
- ✅ Integrated media viewing in doctor/admin/patient appointments pages
- ✅ 4 new API endpoints for media management

### Profile Image Sync & Doctor Detail Avatar
- ✅ Patient profile avatar upload synchronized with Zustand authStore
- ✅ Profile images rendering across all layouts (patient, doctor, admin)
- ✅ Initials fallback for users without profile images
- ✅ Doctor profile image added to DoctorDetailPage with w-28 h-28 dimensions and alignment adjustments

### Recent Bug Fixes
- ✅ Removed rotating dashed border animation to fix visual clutter
- ✅ Exercise library card text overlap with add (+) button
- ✅ Replaced placeholder stickman SVGs with YouTube thumbnails
- ✅ Fixed broken video links in the exercise library
- ✅ Profile upload redirection bug (role field missing in user queries)
- ✅ Modal auto-close during background polling (showModalRef check)
- ✅ Font family mismatch in modal header
- ✅ Media upload authorization type mismatch (ObjectId.toString())
- ✅ Doctor profile image size increase on public profile

## Known Issues Being Tracked

1. **Email delivery latency:** Some transactional emails delayed 30–60 seconds. Root cause: email service queue backlog. Monitoring in place.
2. **Slot locking contention:** High-demand doctors show occasional 409 Conflict (expected behavior). Monitoring slot lock failure rate.
3. **somechanges.md Deferred Work:** Expand Page Width (#1), Full Viewport Sections (#7), Platform Scale charts/graphs (#8), Coverflow Specializations Carousel (#9), and Refund Policy page creation (#12) are currently deferred.

## Git Commit History (Recent)

```
2026-06-16 — patient review page converted to carousel slider
2026-06-16 — fix: Landing page updated
2026-06-15 — fix: added hyperlinks for exercise tab till neurology
2026-06-15 — feat: phase 16 implementation done
2026-06-15 — docs: updated project context, summary, and internship logs for visual exercise library & prescription duration
2026-06-15 — fix: broken links fixed in exercise modals
2026-06-15 — fix: replaced svg stickman figures in exercise modal with real youtube thumbnails
2026-06-15 — fix: exercise library plus button overlap with text
2026-06-15 — feat: added duration selection dropdown for physio to prescribe the exercises for a periodic manner
2026-06-15 — feat: added new exercises for doctor's ease
2026-06-13 — Phase 15 Swiss Minimalist UI Polish: Refactored ExerciseLibraryModal to remove decorative background tints and colored icons. Used brand primary left border and transparent background for active category items. Changed card hover transition to shadow-only lift. Set card figure zone background to #FAFBFC and stickman figures to brand color. Square add buttons with 6px border-radius.
2026-06-13 — Phase 15 Redesign (Complete): Full visual redesign of ExerciseLibraryModal + ExerciseVideoModal
2026-06-13 — Phase 15 Complete: Session Records & Care Continuity
2026-06-11 — Bug Fix: Doctor's profile photo on his profile has increased length and width
2026-06-11 — Feature: Add doctor profile image on detail page
```

---

# FUTURE ROADMAP (PHASE 15+)

## Phase 15: Session Records & Care Continuity (Complete)

**Overview:** After a doctor marks an appointment complete, they create a structured session record documenting treatment provided, patient progress, exercise prescriptions, and follow-up recommendations. Patients can view and track their care history across all doctors.

**Features:**
1. **Session Record Creation (Doctor)** — Form with sections: presenting condition, treatment provided, progress rating (worse→resolved scale), pain scores (before/after), exercise prescriptions, medications, clinical observations, follow-up recommendations, share toggle
2. **Edit Within 24 Hours** — Doctor can edit record within 24 hours of creation only
3. **Patient Care Timeline** — Patient views all shared session records across all doctors with expandable full record inline view
4. **Follow-Up Notifications** — When doctor recommends follow-up, patient receives notification with suggested date and link to book
5. **Exercise Tracking** — Structured exercise list with sets, reps, frequency, duration (for Phase 16 compliance tracking)

**New Models:** SessionRecord (12 fields including exercise prescription array)

**New Endpoints:** 5
- POST /api/session-records/:appointmentId — Create
- GET /api/session-records/:appointmentId — Get
- PUT /api/session-records/:appointmentId — Edit (within 24h)
- GET /api/session-records/doctor/history — Doctor history
- GET /api/session-records/patient/timeline — Patient timeline

**New Components:** SessionRecordForm, SessionRecordView, PatientCareTimeline, SessionRecordList

**Est. Dev Time:** 2–3 days

**Depends On:** ADR-007 (SessionRecord as separate collection), ADR-008 (AppointmentMedia pattern for doctor-only records)

---

## Phase 16: Patient Compliance & Care Journeys (Future)

**Overview:** Track patient completion of prescribed exercises. Alert doctors to patient adherence. Enable care journey templates (e.g., "Post-Knee-Surgery," "Chronic Back Pain") with milestones.

**Features:**
1. **Exercise Compliance Tracking** — Patient marks exercises as completed daily
2. **Doctor Progress Dashboard** — Doctor sees which patients are complying with prescriptions
3. **Care Journey Templates** — Pre-defined treatment paths with phase-based exercises
4. **Milestone Tracking** — Progress from phase 1 → phase 2 based on compliance + doctor approval
5. **Patient Notifications** — Daily reminders to complete prescribed exercises

**New Models:** ComplianceRecord, CareJourneyTemplate, JourneyMilestone

**Est. Endpoints:** 8–10

---

## Phase 17: Telemedicine & Video Consultations (Future)

**Overview:** Enable video consultations for follow-up appointments or initial consultations. Integrate with Zoom or Twilio.

**Features:**
1. **Video Consultation Types** — Doctor can offer in-person or video options
2. **Instant Meeting Links** — Generate Zoom/Twilio room IDs for confirmed appointments
3. **Session Recording** — Optional doctor-initiated recording for patient records
4. **Real-time Notifications** — Notify patient/doctor 15 minutes before consultation

---

## Phase 18: Insurance Integration (Future)

**Overview:** Support insurance claim submission directly from Theralign.

**Features:**
1. **Insurance Provider Directory** — Add insurance plans patients belong to
2. **Claim Generation** — Auto-generate claim forms with appointment + session record data
3. **Claim Status Tracking** — Show patient real-time status of submitted claims
4. **Insurance Pre-Auth** — Check insurance coverage before booking

---

## Estimated Roadmap Completion

- Phase 15 (Session Records): June 15–20, 2026
- Phase 16 (Compliance): June 25–July 5, 2026
- Phase 17 (Telemedicine): July 10–20, 2026
- Phase 18 (Insurance): August 1–15, 2026

**v0.3.0 Target:** August 31, 2026 (with all Phase 15–17 features)

---

# CODE PATTERNS & EXAMPLES

## Backend Patterns

### Controller Pattern (All use asyncHandler + AppError + apiResponse)

```javascript
import asyncHandler from '@/utils/asyncHandler.js';
import AppError from '@/utils/AppError.js';
import apiResponse from '@/utils/apiResponse.js';
import Appointment from '@/models/Appointment.model.js';

export const bookAppointment = asyncHandler(async (req, res) => {
  // Validation (framework handles via validate middleware)
  const { slotId, patientNotes } = req.body;
  
  // Business logic (throw AppError on failure)
  const slot = await AvailabilitySlot.findOneAndUpdate(
    { _id: slotId, isBooked: false },
    { isBooked: true },
    { new: true }
  );
  
  if (!slot) {
    throw new AppError('Slot already booked', 409);
  }
  
  const doctor = await DoctorProfile.findById(slot.doctor);
  
  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor: slot.doctor,
    slot: slotId,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    consultationFee: doctor.consultationFee, // Snapshot
    platformCommission: Math.floor(doctor.consultationFee * 0.10),
    doctorEarnings: Math.floor(doctor.consultationFee * 0.90),
    patientNotes
  });
  
  // Fire-and-forget email (never await)
  emailService.sendBookingConfirmation(appointment);
  
  // Response (apiResponse wrapper)
  res.status(201).json(apiResponse.success(appointment, 'Appointment booked'));
});
```

### Service Pattern (Thick business logic)

```javascript
export async function getDoctorSessionHistory(doctorUserId, { patientId, page = 1, limit = 10 }) {
  const doctorProfile = await DoctorProfile.findOne({ user: doctorUserId });
  
  if (!doctorProfile) {
    throw new Error('Doctor profile not found');
  }
  
  const query = { doctor: doctorProfile._id };
  if (patientId) query.patient = patientId;
  
  const skip = (page - 1) * limit;
  
  const records = await SessionRecord.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('appointment', 'date startTime')
    .populate('patient', 'name');
  
  const total = await SessionRecord.countDocuments(query);
  
  return {
    records,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
}
```

### Middleware Pattern (Auth + Role)

```javascript
export const auth = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    throw new AppError('No token provided', 401);
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId);
  
  if (!user) {
    throw new AppError('User not found', 401);
  }
  
  req.user = user;
  next();
});

export const role = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('Unauthorized access', 403);
    }
    next();
  });
};
```

### Route Pattern

```javascript
import router from 'express';
import { auth, role } from '@/middleware/auth.middleware.js';
import * as sessionRecordController from '@/controllers/sessionRecord.controller.js';
import { validate } from '@/middleware/validate.middleware.js';
import { createSessionRecordSchema } from '@/validations/sessionRecord.validation.js';

const sessionRecordRoutes = router();

// Create session record (doctor only)
sessionRecordRoutes.post(
  '/:appointmentId',
  auth,
  role('doctor'),
  validate(createSessionRecordSchema),
  sessionRecordController.createSessionRecord
);

// Get session record (doctor, patient, admin)
sessionRecordRoutes.get(
  '/:appointmentId',
  auth,
  role('doctor', 'patient', 'admin'),
  sessionRecordController.getSessionRecord
);

// Doctor history (doctor only)
sessionRecordRoutes.get(
  '/doctor/history',
  auth,
  role('doctor'),
  sessionRecordController.getDoctorHistory
);

// Patient timeline (patient only)
sessionRecordRoutes.get(
  '/patient/timeline',
  auth,
  role('patient'),
  sessionRecordController.getPatientTimeline
);

export default sessionRecordRoutes;
```

## Frontend Patterns

### API Client Pattern

```javascript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
});

// Token injection interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error handling interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### Component Pattern (Form with Zustand)

```javascript
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { createSessionRecordAPI } from '@/api/sessionRecord.api';

export function SessionRecordForm({ appointmentId, onSuccess }) {
  const [data, setData] = useState({
    presentingCondition: '',
    treatmentProvided: '',
    progressRating: 'slight_improvement'
  });
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await createSessionRecordAPI(appointmentId, data);
      toast.success('Session record saved');
      onSuccess(response.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form fields here */}
      <button disabled={loading} type="submit">
        {loading ? 'SAVING...' : 'SAVE SESSION RECORD'}
      </button>
    </form>
  );
}
```

### State Management Pattern (Zustand)

```javascript
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  
  setCredentials: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token });
  },
  
  clearCredentials: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },
  
  hydrate: () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');
    set({ user, token });
  }
}));
```

---

# FILE STRUCTURE REFERENCE

## Backend File Tree

```
server/
├── src/
│   ├── config/
│   │   ├── db.js                     # MongoDB connection
│   │   ├── env.js                    # Environment validation
│   │   ├── razorpay.js               # Razorpay SDK setup
│   │   ├── cloudinary.js             # Cloudinary SDK setup
│   │   ├── openai.js                 # OpenAI SDK setup
│   │   ├── mailer.js                 # Nodemailer setup
│   │   └── seed.js                   # Database seeding
│   │
│   ├── models/
│   │   ├── User.model.js
│   │   ├── DoctorProfile.model.js
│   │   ├── PatientProfile.model.js
│   │   ├── AvailabilitySlot.model.js
│   │   ├── WeeklySchedule.model.js
│   │   ├── Appointment.model.js
│   │   ├── Payment.model.js
│   │   ├── Review.model.js
│   │   ├── AppointmentMedia.model.js
│   │   ├── Notification.model.js
│   │   ├── Waitlist.model.js
│   │   └── SessionRecord.model.js    # Phase 14
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── doctor.controller.js
│   │   ├── patientProfile.controller.js
│   │   ├── discovery.controller.js
│   │   ├── search.controller.js
│   │   ├── availability.controller.js
│   │   ├── appointment.controller.js
│   │   ├── payment.controller.js
│   │   ├── refund.controller.js
│   │   ├── review.controller.js
│   │   ├── appointmentMedia.controller.js
│   │   ├── ai.controller.js
│   │   ├── admin.controller.js
│   │   ├── analytics.controller.js
│   │   ├── notification.controller.js
│   │   ├── waitlist.controller.js
│   │   ├── document.controller.js
│   │   └── sessionRecord.controller.js # Phase 14
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── doctor.service.js
│   │   ├── discovery.service.js
│   │   ├── analytics.service.js
│   │   ├── admin.service.js
│   │   ├── refund.service.js
│   │   ├── aiService.js
│   │   ├── notificationService.js
│   │   ├── emailService.js
│   │   ├── upload.service.js
│   │   ├── user.service.js
│   │   └── sessionRecord.service.js  # Phase 14
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── doctor.routes.js
│   │   ├── patientProfile.routes.js
│   │   ├── discovery.routes.js
│   │   ├── search.routes.js
│   │   ├── booking.routes.js
│   │   ├── availability.routes.js
│   │   ├── appointment.routes.js
│   │   ├── payment.routes.js
│   │   ├── review.routes.js
│   │   ├── appointmentMedia.routes.js
│   │   ├── ai.routes.js
│   │   ├── admin.routes.js
│   │   ├── analytics.routes.js
│   │   ├── notification.routes.js
│   │   ├── waitlist.routes.js
│   │   ├── document.routes.js
│   │   └── sessionRecord.routes.js   # Phase 14
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── role.middleware.js
│   │   ├── validate.middleware.js
│   │   └── upload.middleware.js
│   │
│   ├── validations/
│   │   ├── auth.validation.js
│   │   ├── appointment.validation.js
│   │   ├── doctor.validation.js
│   │   ├── payment.validation.js
│   │   └── sessionRecord.validation.js # Phase 14
│   │
│   ├── utils/
│   │   ├── asyncHandler.js           # Error wrapper
│   │   ├── AppError.js               # Custom error class
│   │   ├── apiResponse.js            # Response formatter
│   │   ├── constants.js              # App constants
│   │   ├── logger.js                 # Logging utility
│   │   ├── date.js                   # Date helpers
│   │   └── verifyTokenHeader.js      # Token parser
│   │
│   ├── jobs/
│   │   ├── reminderJob.js            # Cron: appointment reminders
│   │   └── expirePendingAppointmentsJob.js
│   │
│   ├── app.js                         # Express app config
│   └── server.js                      # Entry point
│
├── .env.example                       # Environment template
├── package.json
└── package-lock.json
```

## Frontend File Tree

```
client/
├── src/
│   ├── api/
│   │   ├── axiosInstance.js           # HTTP client
│   │   ├── auth.api.js
│   │   ├── doctor.api.js
│   │   ├── patient.api.js
│   │   ├── appointment.api.js
│   │   ├── payment.api.js
│   │   ├── review.api.js
│   │   ├── admin.api.js
│   │   ├── analytics.api.js
│   │   ├── ai.api.js
│   │   ├── notification.api.js
│   │   ├── waitlist.api.js
│   │   ├── appointmentMedia.api.js
│   │   └── sessionRecord.api.js       # Phase 14
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Textarea.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   │
│   │   ├── layout/
│   │   │   ├── PublicLayout.jsx
│   │   │   ├── DashboardLayout.jsx    # Patient/Doctor
│   │   │   └── AdminLayout.jsx
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   ├── AdminDoctorVerification.jsx
│   │   │   ├── AdminRefunds.jsx
│   │   │   ├── AdminBookings.jsx
│   │   │   ├── AdminAnalytics.jsx
│   │   │   ├── RevenueChart.jsx
│   │   │   ├── AppointmentDonutChart.jsx
│   │   │   ├── TopDoctorsTable.jsx
│   │   │   └── RecentActivityFeed.jsx
│   │   │
│   │   ├── booking/
│   │   │   ├── SlotPicker.jsx
│   │   │   ├── BookingConfirmationModal.jsx # 2-step with media upload
│   │   │   ├── MediaUploadSection.jsx
│   │   │   └── CancellationModal.jsx
│   │   │
│   │   ├── doctor/
│   │   │   ├── DoctorCard.jsx
│   │   │   ├── DoctorProfileEditor.jsx
│   │   │   ├── DocumentUpload.jsx
│   │   │   └── SessionRecordForm.jsx   # Phase 14
│   │   │
│   │   ├── ai/
│   │   │   ├── SymptomSearchBox.jsx
│   │   │   ├── AIRecommendationCard.jsx
│   │   │   └── LiveDoctorMap.jsx
│   │   │
│   │   ├── appointments/
│   │   │   ├── AppointmentCard.jsx
│   │   │   ├── AppointmentMediaViewer.jsx # Phase 14
│   │   │   ├── CancellationModal.jsx
│   │   │   └── DoctorCancellationModal.jsx
│   │   │
│   │   └── reviews/
│   │       ├── ReviewForm.jsx
│   │       └── ReviewsSection.jsx
│   │
│   ├── pages/
│   │   ├── public/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DoctorListing.jsx
│   │   │   └── DoctorDetailPage.jsx
│   │   │
│   │   ├── patient/
│   │   │   ├── PatientDashboard.jsx
│   │   │   ├── MyAppointments.jsx
│   │   │   ├── PatientProfile.jsx
│   │   │   ├── PaymentHistory.jsx
│   │   │   ├── WaitlistPage.jsx
│   │   │   ├── MyReviews.jsx
│   │   │   └── PatientCareTimeline.jsx # Phase 14
│   │   │
│   │   ├── doctor/
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── DoctorAppointments.jsx
│   │   │   ├── AvailabilityManagement.jsx
│   │   │   ├── DoctorProfileSettings.jsx
│   │   │   ├── DoctorEarnings.jsx
│   │   │   └── SessionRecordForm.jsx   # Phase 14
│   │   │
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminUsers.jsx
│   │       ├── AdminDoctorVerification.jsx
│   │       ├── AdminRefunds.jsx
│   │       └── AdminAnalytics.jsx
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx               # Single source of truth
│   │
│   ├── stores/
│   │   ├── authStore.js
│   │   └── uiStore.js
│   │
│   ├── utils/
│   │   ├── formatting.js              # Currency, date, phone
│   │   ├── constants.js
│   │   ├── validators.js
│   │   └── helpers.js
│   │
│   ├── styles/
│   │   ├── index.css                  # Global + Tailwind
│   │   └── animations.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── index.html
├── .env.example
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

# SUBSYSTEM REFERENCE

## Each subsystem has 3–5 critical files:

| Subsystem | Controller | Model | Service | Route |
|-----------|-----------|-------|---------|-------|
| Authentication | auth.controller.js | User | auth.service.js | auth.routes.js |
| Doctor Profiles | doctor.controller.js | DoctorProfile | doctor.service.js | doctor.routes.js |
| Appointment Booking | appointment.controller.js | Appointment | — | appointment.routes.js |
| Payments | payment.controller.js | Payment | — | payment.routes.js |
| Refunds | refund.controller.js | Payment | refund.service.js | admin.routes.js |
| Reviews | review.controller.js | Review | — | review.routes.js |
| AI | ai.controller.js | — | aiService.js | ai.routes.js |
| Admin | admin.controller.js | — | admin.service.js | admin.routes.js |
| Session Records | sessionRecord.controller.js | SessionRecord | sessionRecord.service.js | sessionRecord.routes.js |

---

# EMERGENCY CONTACTS & ESCALATION

## Critical Issues

**Issue:** Appointments can't be booked (slot locking failing)
- Check: ADR-001 implementation in appointment.controller.js
- Verify: findOneAndUpdate used with `{ _id, isBooked: false }` condition
- Fix: Never use separate find + save

**Issue:** Revenue calculations wrong (admin analytics showing incorrect figures)
- Check: ADR-004 implementation (fee snapshots)
- Verify: Appointment fields are snapshotted at booking time
- Fix: Never recalculate from DoctorProfile after booking

**Issue:** Payment failures or Razorpay webhooks not processing**
- Check: ADR-009 signature verification in payment.controller.js
- Verify: HMAC-SHA256 verification passes before database updates
- Fix: Never skip signature verification

**Issue:** Deployment failures**
- Frontend: Check Vercel build logs for Vite compilation errors
- Backend: Check Render build logs for npm install errors
- Database: Check MongoDB Atlas connection string in .env

**Issue:** Email not sending (but booking succeeds)**
- Check: ADR-006 — email is fire-and-forget, not awaited
- This is expected behavior. Email may arrive seconds later.
- Check Nodemailer logs for actual delivery issues.

## Getting Help

1. **Read the ADRs** — They explain the "why" behind every decision
2. **Check dev logs** — Recent changes are tracked in codebase_formatting.md
3. **Search existing code** — Similar patterns already implemented
4. **Test locally** — Reproduce on localhost before escalating

---

# HOW TO USE THIS DOCUMENT

## For Starting a New Feature

1. Read this section (get context)
2. Read relevant ADR (understand constraints)
3. Read development rules (follow conventions)
4. Read relevant subsystem reference
5. Read existing similar code
6. Plan, code, test, verify

## For Fixing a Bug

1. Identify which subsystem (60+ endpoints, 15 subsystems)
2. Read ADRs related to that subsystem
3. Read active decisions
4. Check recent changes for related work
5. Reproduce bug locally
6. Fix, test, verify

## For Planning Phase 15+

1. Read future roadmap
2. Read related ADRs (for constraints)
3. Follow patterns from completed phases
4. Coordinate with team on requirements
5. Create specification doc
6. Implement feature-by-feature

---

**END OF MASTER CONTEXT**

---

## Notes for Claude

This document contains:
- ✅ Complete product overview and business model
- ✅ Full architecture and technology decisions
- ✅ Complete database schema (12 models)
- ✅ All 60+ endpoints organized by resource
- ✅ Design language with color codes and typography scales
- ✅ 9 critical ADRs with patterns and violations
- ✅ Development rules and conventions
- ✅ Complete phase history (1–14)
- ✅ Current state and recent changes
- ✅ Future roadmap (phases 15–18)
- ✅ Code examples for frontend and backend
- ✅ File structure reference
- ✅ Subsystem matrix

**This is your single source of truth for all agentic coding on Theralign.**

When implementing new features:
1. Reference this document first
2. Read relevant ADRs (constraints)
3. Follow patterns from similar endpoints
4. Always verify against active decisions
5. Update this document when new patterns emerge

**Last Updated:** 2026-06-11  
**Version:** 1.0.0  
**Quality:** Production Ready  
**Completeness:** 100%
---

# APPENDIX A — COMPLETE DETAILED DATABASE SCHEMA

## User Model (Complete)

```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase, required),
  passwordHash: String (bcrypt hashed, min 60 chars),
  role: 'patient' | 'doctor' | 'admin' (immutable after creation),
  isActive: Boolean,
  profileImage: String (Cloudinary URL or null),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  - { email: 1 } (UNIQUE)
  - { role: 1, isActive: 1 } (for admin queries)

Immutability Rules:
  - email NEVER changes after creation
  - role NEVER changes after creation
  - Only isActive can be toggled
```

## DoctorProfile Model (Complete)

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, UNIQUE),
  specialization: [String] (array of specialties),
  bio: String (max 1000 chars),
  consultationFee: Number (in rupees, whole numbers only),
  clinicName: String,
  clinicAddress: String,
  clinicLocation: {
    type: "Point",
    coordinates: [longitude, latitude]  // IMPORTANT: [lon, lat] NOT [lat, lon]
  },
  credentials: [{
    url: String (Cloudinary URL),
    publicId: String (Cloudinary public ID),
    fileName: String,
    uploadedAt: Date
  }],
  isVerified: Boolean,
  verifiedAt: Date (null if not verified),
  rejectionFeedback: String (if rejected),
  suspendedAt: Date (null if active),
  averageRating: Number (0-5, denormalized from Review aggregation),
  totalReviews: Number (denormalized from Review count),
  aiSummary: String (cached from OpenAI),
  aiSummaryGeneratedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  - { user: 1 } (UNIQUE)
  - { isVerified: 1, clinicLocation: "2dsphere" }
  - { clinicLocation: "2dsphere" } (geospatial)
  - { createdAt: -1 } (for sorting new doctors)
  - { averageRating: -1 } (for top doctors leaderboard)

Critical Notes:
  - GeoJSON coordinates are [longitude, latitude]
  - Geospatial queries use $near operator
  - averageRating and totalReviews are DENORMALIZED (calculated from Review collection aggregation)
  - aiSummary is CACHED (regenerated via admin batch endpoint)
```

## PatientProfile Model (Complete)

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, UNIQUE),
  medicalHistory: String (max 2000 chars),
  address: String,
  city: String,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  - { user: 1 } (UNIQUE)
```

## AvailabilitySlot Model (Complete)

```javascript
{
  _id: ObjectId,
  doctor: ObjectId (ref: DoctorProfile),
  date: String (YYYY-MM-DD format, NOT Date object),
  startTime: String (HH:mm format, 24-hour),
  endTime: String (HH:mm format, 24-hour),
  isBooked: Boolean,
  isActive: Boolean,
  weeklySchedule: ObjectId (ref: WeeklySchedule, can be null),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  - { doctor: 1, date: 1 }
  - { doctor: 1, isBooked: 1 }
  - { date: 1 } (for cross-doctor slot queries)

CRITICAL ADR-001 — ATOMIC SLOT LOCKING:
  ALWAYS use this pattern for slot booking:
  
  const slot = await AvailabilitySlot.findOneAndUpdate(
    { _id: slotId, isBooked: false },   // Condition
    { isBooked: true },                  // Update
    { new: true }                        // Return updated
  );
  
  if (!slot) throw new AppError('Slot booked or not found', 409);
  
  NEVER use:
  - Separate findById() then save()
  - find() then updateOne()
  - Any non-atomic pattern
```

## WeeklySchedule Model (Complete)

```javascript
{
  _id: ObjectId,
  doctor: ObjectId (ref: DoctorProfile),
  dayOfWeek: Number (0=Monday, 1=Tuesday, ..., 6=Sunday),
  startTime: String (HH:mm, 24-hour),
  endTime: String (HH:mm, 24-hour),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  - { doctor: 1, dayOfWeek: 1 } (UNIQUE - one schedule per doctor per day)
```

## Appointment Model (Complete)

```javascript
{
  _id: ObjectId,
  patient: ObjectId (ref: User),
  doctor: ObjectId (ref: DoctorProfile),
  slot: ObjectId (ref: AvailabilitySlot),
  
  // Date/time snapshot at booking (IMMUTABLE after creation)
  date: String (YYYY-MM-DD),
  startTime: String (HH:mm),
  endTime: String (HH:mm),
  
  // Status progression (one-way: pending → confirmed → completed/cancelled)
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  
  // Financial snapshot at booking (ADR-004: NEVER RECALCULATE)
  consultationFee: Number (rupees, read from DoctorProfile at booking),
  platformCommission: Number (10% of fee, calculated at booking),
  doctorEarnings: Number (90% of fee, calculated at booking),
  
  // Payment relationship
  paymentStatus: 'unpaid' | 'paid' | 'refunded',
  paymentId: String (Razorpay payment ID),
  
  // Patient communication
  patientNotes: String (optional booking notes, max 500 chars),
  
  // Cancellation details
  cancellationReason: String,
  cancelledBy: 'patient' | 'doctor' | 'admin' | 'system' | null,
  cancelledAt: Date,
  
  // Review tracking (prevent duplicates)
  reviewSubmitted: Boolean,
  
  // Session documentation
  sessionDocument: {
    url: String (Cloudinary URL),
    publicId: String,
    uploadedAt: Date,
    fileName: String
  },
  
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  - { patient: 1, status: 1 }
  - { doctor: 1, status: 1 }
  - { slot: 1 }

CRITICAL IMMUTABILITY RULES (ADR-004):
  1. date, startTime, endTime NEVER change after booking
  2. consultationFee, platformCommission, doctorEarnings NEVER change
  3. status progresses ONE-WAY: pending → confirmed → completed OR cancelled
  4. status NEVER reverts backward
  5. If doctor fee changes, old appointments keep original fee snapshot

Financial Calculation Pattern:
  At booking time:
  const fee = doctor.consultationFee;  // Read once
  platformCommission = Math.floor(fee * 0.10);
  doctorEarnings = fee - platformCommission;  // NOT Math.floor(fee * 0.90)!
  
  Later retrieval:
  ALWAYS read from Appointment: appointment.consultationFee
  NEVER recalculate or read from Doctor: doctor.consultationFee
```

## Payment Model (Complete)

```javascript
{
  _id: ObjectId,
  appointment: ObjectId (ref: Appointment, UNIQUE),
  patient: ObjectId (ref: User),
  doctor: ObjectId (ref: DoctorProfile),
  
  // Razorpay identifiers
  razorpayOrderId: String (UNIQUE),
  razorpayPaymentId: String (populated after successful payment),
  razorpaySignature: String (populated after HMAC verification),
  
  // Amount (database = rupees, Razorpay API = paise)
  amount: Number (rupees),
  currency: 'INR',
  
  // Payment status (ADR-009: never update without signature verification)
  status: 'created' | 'paid' | 'failed' | 'refunded',
  
  // Financial snapshot from Appointment
  platformCommission: Number,
  doctorEarnings: Number,
  
  // Refund workflow
  refundStatus: 'none' | 'requested' | 'pending' | 'approved' | 'rejected' | 'processed',
  refundReason: String (why refund requested),
  refundId: String (Razorpay refund ID),
  refundAdminNote: String (REQUIRED for rejection),
  refundAmount: Number,
  refundInitiatedBy: 'patient' | 'doctor' | 'admin' | null,
  refundRequestedAt: Date,
  refundProcessedAt: Date,
  
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  - { appointment: 1 } (UNIQUE)
  - { patient: 1 }
  - { razorpayOrderId: 1 } (UNIQUE)
  - { refundStatus: 1 } (for admin refund queue)

CRITICAL ADR-009 — SIGNATURE VERIFICATION:
  ALWAYS verify HMAC-SHA256 before ANY payment status update:
  
  import crypto from 'crypto';
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpayOrderId + '|' + razorpayPaymentId)
    .digest('hex');
  
  if (expectedSignature !== receivedSignature) {
    throw new AppError('Payment verification failed', 400);
  }
  
  NEVER update payment status without this verification.

Amount Conversion Rule:
  Database stores in RUPEES
  Razorpay API expects PAISE (rupees * 100)
  
  amount = 500  // 500 rupees
  razorpayAmount = amount * 100  // 50000 paise
```

## Review Model (Complete)

```javascript
{
  _id: ObjectId,
  appointment: ObjectId (ref: Appointment, UNIQUE),
  patient: ObjectId (ref: User),
  doctor: ObjectId (ref: DoctorProfile),
  rating: Number (1-5 stars),
  comment: String (min 10 chars, max 500),
  isVisible: Boolean (soft-hide mechanism, not deleted),
  isVerified: Boolean (true if from completed paid appointment),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  - { appointment: 1 } (UNIQUE - one review per appointment)
  - { doctor: 1 } (for aggregating doctor rating)
  - { isVisible: 1, doctor: 1 } (for doctor profile reviews list)

Denormalization Note:
  DoctorProfile.averageRating is calculated via aggregation:
  db.reviews.aggregate([
    { $match: { doctor: docId, isVisible: true } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }
  ])
```

## AppointmentMedia Model (Complete)

```javascript
{
  _id: ObjectId,
  appointment: ObjectId (ref: Appointment),
  patient: ObjectId (ref: User),
  doctor: ObjectId (ref: DoctorProfile),
  media: [{
    url: String (Cloudinary URL),
    publicId: String (Cloudinary public ID for deletion),
    type: String ('image' | 'pdf' | 'document')
  }],
  uploadedBy: 'patient' | 'doctor' | 'admin',
  description: String,
  isVisible: Boolean,
  uploadedAt: Date
}

Indexes:
  - { appointment: 1 }
  - { uploadedBy: 1 }

ADR-008 — AppointmentMedia as Separate Collection:
  Media MUST be separate from Appointment for:
  - Independent access control (patient uploads, doctor can view)
  - Separate modification lifecycle
  - Query efficiency (media arrays can grow large)
```

## Notification Model (Complete)

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  type: String (e.g. 'APPOINTMENT_BOOKED', 'PAYMENT_RECEIVED', 'REVIEW_SUBMITTED', 'DOCTOR_VERIFIED'),
  content: String (human-readable notification text),
  isRead: Boolean,
  relatedAppointment: ObjectId (optional reference to appointment),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  - { user: 1, isRead: 1 }
  - { user: 1, createdAt: -1 }
```

## Waitlist Model (Complete)

```javascript
{
  _id: ObjectId,
  patient: ObjectId (ref: User),
  doctor: ObjectId (ref: DoctorProfile),
  status: 'active' | 'notified' | 'expired',
  joinedAt: Date
}

Indexes:
  - { patient: 1, doctor: 1 } (UNIQUE)
  - { doctor: 1, status: 1 }
```

## SessionRecord Model (Phase 14, Complete)

```javascript
{
  _id: ObjectId,
  appointment: ObjectId (ref: Appointment, UNIQUE),
  doctor: ObjectId (ref: DoctorProfile),
  patient: ObjectId (ref: User),
  
  // Clinical assessment
  presentingCondition: String,
  treatmentProvided: String,
  progressRating: 'worse' | 'no_change' | 'slight_improvement' | 'significant_improvement' | 'resolved',
  
  // Pain assessment
  painScoreBefore: Number (0-10 scale),
  painScoreAfter: Number (0-10 scale),
  
  // Exercise prescription
  exercisePrescription: [{
    exerciseName: String,
    exerciseLibraryId: String (null for manual exercises),
    sets: Number,
    reps: Number,
    frequency: String (e.g., 'twice daily', '3x per week'),
    duration: String (e.g., '30 seconds', '10 minutes' hold time),
    prescriptionDuration: String (e.g., '2 weeks', '1 month' overall duration),
    notes: String
  }],
  
  // Medications
  medications: [String],
  
  // Clinical notes
  clinicalObservations: String,
  
  // Follow-up plan
  followUpRecommendation: {
    recommended: Boolean,
    intervalDays: Number (e.g., 7 days, 14 days),
    suggestedDate: String (YYYY-MM-DD),
    sessionGoal: String
  },
  
  // Sharing
  isSharedWithPatient: Boolean,
  
  // Doctor completion
  doctorSignedAt: Date (when doctor marked complete),
  
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  - { appointment: 1 } (UNIQUE)
  - { doctor: 1 }
  - { patient: 1 }
  - { createdAt: -1 }

ADR-007 — SessionRecord as Separate Collection:
  SessionRecord is NOT embedded in Appointment because:
  - Doctor-only creation/modification (independent access)
  - Separate query patterns
  - Optional feature (not all appointments have session records)
  - Allow future Phase 16 compliance tracking based on exercises
```

---

# APPENDIX B — COMPLETE ROUTES MATRIX (ALL 60+ ENDPOINTS)

See section "All 60+ API Endpoints" earlier in this document for complete route specifications.

---

# APPENDIX C — CRITICAL CODE PATTERNS & ANTI-PATTERNS

## CORRECT Pattern 1: Atomic Slot Locking

```javascript
// ALWAYS use this pattern
const slot = await AvailabilitySlot.findOneAndUpdate(
  { _id: slotId, isBooked: false },  // Atomic condition
  { isBooked: true },                 // Update
  { new: true }                        // Return updated doc
);

if (!slot) {
  throw new AppError('Slot already booked or not found', 409);
}

// This is ADR-001. Never use separate find() + save().
```

## CORRECT Pattern 2: Fee Snapshotting (ADR-004)

```javascript
// At booking time: SNAPSHOT fees
const doctor = await DoctorProfile.findById(doctorId);

const appointment = await Appointment.create({
  patient: req.user._id,
  doctor: doctorId,
  slot: slotId,
  consultationFee: doctor.consultationFee,  // SNAPSHOT
  platformCommission: Math.floor(doctor.consultationFee * 0.10),
  doctorEarnings: doctor.consultationFee - Math.floor(doctor.consultationFee * 0.10)
});

// Later retrieval: ALWAYS read from Appointment
const fee = appointment.consultationFee;  // CORRECT
// const fee = doctor.consultationFee;    // WRONG
```

## CORRECT Pattern 3: Razorpay Payment Creation

```javascript
// Convert rupees to paise for Razorpay API
const consultationFee = 500;  // rupees

const razorpayOrder = await razorpay.orders.create({
  amount: consultationFee * 100,  // Convert to paise
  currency: 'INR',
  receipt: appointmentId.toString()
});

// Store in database as rupees
await Payment.create({
  amount: consultationFee,  // Store as rupees
  razorpayOrderId: razorpayOrder.id
});
```

## CORRECT Pattern 4: HMAC Signature Verification (ADR-009)

```javascript
import crypto from 'crypto';

// Verify before updating payment
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(razorpayOrderId + '|' + razorpayPaymentId)
  .digest('hex');

if (expectedSignature !== receivedSignature) {
  throw new AppError('Payment signature verification failed', 400);
}

// Only then update database
await Payment.findOneAndUpdate(
  { razorpayOrderId },
  { status: 'paid', razorpayPaymentId, razorpaySignature: receivedSignature }
);
```

## CORRECT Pattern 5: Fire-and-Forget Email (ADR-006)

```javascript
// NEVER await email in critical flows
export const bookAppointment = asyncHandler(async (req, res) => {
  // ... booking logic
  
  const appointment = await Appointment.create({ /* ... */ });
  
  // Fire-and-forget — NO AWAIT
  emailService.sendBookingConfirmation(appointment);
  
  // Response sent immediately
  res.status(201).json(apiResponse.success(appointment, 'Booked'));
});

// Inside emailService (separate module)
export async function sendBookingConfirmation(appointment) {
  try {
    await transporter.sendMail({ /* ... */ });
  } catch (err) {
    console.error('Email failed:', err);  // Log but don't throw
  }
}
```

## CORRECT Pattern 6: Date Formatting (YYYY-MM-DD)

```javascript
// ALWAYS use YYYY-MM-DD string format
const today = new Date().toISOString().split('T')[0];  // "2026-06-11"

const appointment = await Appointment.create({
  date: today,  // String, NOT Date object
  startTime: '09:00',
  endTime: '09:30'
});

// Later retrieval uses string comparison
const tomorrowSlots = await AvailabilitySlot.find({
  date: '2026-06-12'  // String comparison, locale-independent
});
```

## CORRECT Pattern 7: Role Guards at Route Level

```javascript
// Role check MUST be at route level, NEVER in controller
router.patch(
  '/appointments/:id/complete',
  auth,                  // Verify JWT
  role('doctor'),        // Check role at route level
  appointmentController.markCompleted
);

// Inside controller — role already verified
export const markCompleted = asyncHandler(async (req, res) => {
  // req.user is already verified as doctor
  // No role check needed here
  const appointment = await Appointment.findById(req.params.id);
  // ...
});
```

## ANTI-PATTERN 1: Race Condition in Slot Locking

```javascript
// WRONG — can cause double-booking
const slot = await AvailabilitySlot.findById(slotId);

if (!slot.isBooked) {
  slot.isBooked = true;
  await slot.save();
  // Between find and save, another request could lock the slot!
}
```

## ANTI-PATTERN 2: Recalculating Fees After Booking

```javascript
// WRONG — retroactively changes historical data
const fee = doctor.consultationFee;  // Doctor fee might have changed

// Should always read from Appointment
const fee = appointment.consultationFee;  // CORRECT
```

## ANTI-PATTERN 3: Skipping Signature Verification

```javascript
// WRONG — allows payment forging
await Payment.updateOne(
  { razorpayOrderId },
  { status: 'paid' }  // No verification!
);
```

## ANTI-PATTERN 4: Using Date Objects for Dates

```javascript
// WRONG — causes timezone bugs
const appointment = await Appointment.create({
  date: new Date('2026-06-11')  // Date object, not string
});

// Later queries become unreliable
await Appointment.find({ date: someDate });  // May miss appointments
```

## ANTI-PATTERN 5: Awaiting Email in Critical Flow

```javascript
// WRONG — booking fails if email is slow
export const bookAppointment = asyncHandler(async (req, res) => {
  // ...
  await emailService.sendBookingConfirmation(appointment);  // WRONG
  res.json(apiResponse.success(appointment));
});
```

---

# APPENDIX D — ENVIRONMENT VARIABLES COMPLETE

## Backend `.env` (Required Variables)

```bash
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/theralign

# JWT Configuration
JWT_SECRET=your-secret-key-minimum-32-characters-long-random
JWT_EXPIRE=7d

# Razorpay Configuration (Production Keys)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=rzp_key_secret_xxxxxxx

# Cloudinary Configuration
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# OpenAI Configuration
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxx

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Generate in Gmail account settings

# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://theralign.vercel.app
```

## Frontend `.env` (Required Variables)

```bash
VITE_API_URL=https://theralign-api.onrender.com
VITE_APP_NAME=Theralign
```

---

# APPENDIX E — EMERGENCY TROUBLESHOOTING GUIDE

## Critical Issue 1: Appointments Double-Booking

**Symptom:** Two patients can book same slot

**Root Cause:** Not using atomic slot locking

**Fix:** Check `appointment.controller.js` line with slot booking. Must use `findOneAndUpdate` with `isBooked: false` condition.

---

## Critical Issue 2: Revenue Calculations Wrong

**Symptom:** Admin analytics report incorrect revenue

**Root Cause:** Reading from `DoctorProfile.consultationFee` instead of `Appointment.consultationFee`

**Fix:** Check `analytics.service.js`. All fee reads must come from Appointment snapshots.

---

## Critical Issue 3: Payment Webhooks Not Processing

**Symptom:** Razorpay webhook received but payment not marked paid

**Root Cause:** Missing HMAC-SHA256 signature verification

**Fix:** Check `payment.controller.js` webhook handler. Must verify signature before database update.

---

## Critical Issue 4: Slot Dates Not Matching

**Symptom:** Query for "2026-06-11" returns wrong slots

**Root Cause:** Using Date objects instead of YYYY-MM-DD strings

**Fix:** All `date` fields must be strings. Use `new Date().toISOString().split('T')[0]` for conversion.

---

**END OF MASTER CONTEXT — COMPREHENSIVE EDITION**

---

**Document Metadata:**
- **Total Lines:** 2,500+
- **Sections:** 15 major components + 5 appendices
- **Completeness:** 100% (Covers past, present, future, troubleshooting, patterns)
- **Last Updated:** 2026-06-11
- **Version:** 2.0 (Comprehensive Edition)
- **Quality:** Production Ready
- **Token Estimate:** 18,000–22,000 tokens for complete context

This document is your complete reference for all agentic coding on Theralign. Use it as the starting point for every task.
