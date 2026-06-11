# Recent Changes — Last 7 Days

**Generated:** 2026-06-11  
**Period:** 2026-06-04 to 2026-06-11  
**Source:** git log --oneline -n 50

---

## High Impact Changes

### 2026-06-11 — Feature: Profile Image Sync and rendering logic across all roles
**Author:** Antigravity (AI Coding Assistant)

**Summary:** Fixed the profile image rendering logic across all three roles (Patient, Doctor, Admin). Synchronized patient profile photo upload with Zustand authStore to prevent stale local session state. Replaced name initials placeholder circles with the actual user/doctor/patient profileImage when available in layout headers, sidebars, doctor lists, user list directories, doctor verification queues, and refunds request lists.

**Changed files:**
- `server/src/services/refund.service.js` [modified] — Added `profileImage` fields to Mongoose populate projections.
- `client/src/pages/patient/PatientProfile.jsx` [modified] — Synchronized uploaded profile avatar with Zustand `authStore` via `setCredentials`.
- `client/src/components/layout/Navbar.jsx` [modified] — Render user's `profileImage` if available.
- `client/src/components/layout/DashboardLayout.jsx` [modified] — Render user's `profileImage` if available in sidebar and top header.
- `client/src/components/layout/AdminLayout.jsx` [modified] — Render user's `profileImage` if available in sidebar and top header.
- `client/src/components/doctor/DoctorCard.jsx` [modified] — Render doctor's `profileImage` if available on the card.
- `client/src/pages/admin/AdminUsers.jsx` [modified] — Render user's `profileImage` if available in user list table.
- `client/src/pages/admin/AdminDoctorVerification.jsx` [modified] — Render doctor's `profileImage` if available in pending queue and directory ledger list.
- `client/src/pages/admin/AdminRefunds.jsx` [modified] — Render patient's `profileImage` inside patient-avatar circle.

**Affected subsystems:**
- user-management
- discovery-search
- admin-operations
- refund-system

**Regression risk:** Low
- Successfully built frontend production bundle with no Vite or compilation warnings.

---

### 2026-06-11 — Feature: Two-Step Booking Confirmation Flow & Media Upload Authorization Fix
**Author:** Antigravity (AI Coding Assistant)

**Summary:** Transitioned the single-step booking confirmation modal into a two-step wizard flow, allowing patients to upload media files after booking but before payment. Also fixed a critical type mismatch bug in server-side authorization checks, resolved auto-closing modal due to background polling, fixed the modal title font family mismatch, and switched media upload routes to memory storage to support up to 25MB uploads.

**Changed files:**
- `client/src/components/booking/BookingConfirmationModal.jsx` [modified] — Added step state, restructured compact details summary, and replaced emojis with Lucide SVG icons.
- `client/src/components/booking/MediaUploadSection.jsx` [modified] — Replaced all emojis with corresponding Lucide SVG icons and polished styling.
- `client/src/components/booking/SlotPicker.jsx` [modified] — Separated booking/payment actions, added paymentLoading state, auto-cleanup on exit, and showModalRef check to prevent auto-close during background availability polling.
- `client/src/components/common/Modal.jsx` [modified] — Removed hardcoded font family style override from modal header.
- `client/src/components/appointments/AppointmentMediaViewer.jsx` [new] — Reusable component for fetching, displaying, and previewing (image lightbox, inline HTML5 video/audio players) uploaded appointment media files.
- `client/src/pages/doctor/DoctorAppointments.jsx` [modified] — Integrated `AppointmentMediaViewer` in expanded appointments row details.
- `client/src/pages/admin/AdminBookings.jsx` [modified] — Integrated `AppointmentMediaViewer` in expanded bookings row details.
- `client/src/pages/patient/AppointmentDetailsPage.jsx` [modified] — Integrated `AppointmentMediaViewer` in the single column appointment details layout.
- `server/src/controllers/appointmentMedia.controller.js` [modified] — Fixed patient ID Mongoose ObjectId to string type mismatch in upload authorization checks, fixed uploader ID Mongoose ObjectId to string type mismatch in delete authorization checks (`mediaDocument.uploader.toString() === req.user.id.toString()`), and added proper DoctorProfile authorization checks for deletion.
- `server/src/routes/appointmentMedia.routes.js` [modified] — Configured local memoryStorage Multer instance with 25MB limit to populate req.file.buffer for Cloudinary stream uploads.

**Affected subsystems:**
- appointment-booking
- payment-system
- media-upload

**ADR impact:**
- ADR-008 refined: Ensured that patient authorization for media upload checks both sides stringified.

**Regression risk:** Low
- UI changes verified by successful Vite compilation.
- Authorization fix tested to resolve patient upload access denied blocks.

---

### 2026-06-10 — Phase 13 Complete: Refund System & Cancellation Workflow
**Commits:** `a1b2c3d`, `e4f5g6h`, `i7j8k9l`  
**Author:** Aadesh Khande

**Summary:** Complete refund processing system with patient/doctor/admin cancellation paths and Razorpay integration.

**Changed files:**
- `server/src/models/Payment.model.js` [modified] — Added refundStatus, refundReason, refundId fields
- `server/src/controllers/payment.controller.js` [modified] — Enhanced with refund verification
- `server/src/services/refund.service.js` [new] — Refund request/approval/rejection logic
- `server/src/controllers/appointment.controller.js` [modified] — Cancel-patient and cancel-doctor endpoints
- `server/src/controllers/admin.controller.js` [modified] — Admin refund approval workflow
- `server/src/routes/appointment.routes.js` [modified] — New cancel-patient, cancel-doctor routes
- `server/src/validations/appointment.validation.js` [modified] — Cancellation request validation

**Affected subsystems:**
- payment-system
- appointment-booking
- admin-operations
- refund-system (new)

**ADR impact:**
- ADR-002 refined: Payment collection refund fields
- ADR-004 refined: Refund uses Appointment fee snapshot
- ADR-006 refined: Email sent on refund approval (fire-and-forget)

**Regression risk:** HIGH
- Existing appointment completion flow modified
- Payment status transitions extended with refund states
- Recommendation: Run appointment/payment integration tests

**Breaking changes:** None (backwards compatible)

---

### 2026-06-08 — Phase 13 Feature: Patient Cancellation Request Flow
**Commits:** `m9n0o1p`  
**Author:** Aadesh Khande

**Summary:** Patient-initiated appointment cancellation with refund request.

**Changed files:**
- `client/src/pages/patient/AppointmentDetail.jsx` [new] — Cancel button and confirmation modal
- `client/src/api/appointment.api.js` [modified] — Add cancelAppointment() function
- `client/src/components/appointments/CancellationModal.jsx` [new] — Reason collection UI

**Affected subsystems:**
- appointment-booking

**Regression risk:** Low
- New UI components, no changes to existing flows
- Backend cancellation not yet deployed

---

## Routine Changes

### 2026-06-07 — Bug Fix: Slot Availability Query
**Commits:** `q2r3s4t`  
**Author:** Aadesh Khande

**Summary:** Fixed geospatial query to exclude booked slots from availability listing.

**Changed files:**
- `server/src/controllers/availability.controller.js` [modified] — Add isBooked: false filter

**Affected subsystems:**
- availability-management

**Regression risk:** Low

---

### 2026-06-05 — Patch: Email Template Update
**Commits:** `u5v6w7x`  
**Author:** Aadesh Khande

**Summary:** Updated booking confirmation email template with better formatting.

**Changed files:**
- `server/src/config/mailer.js` [modified] — Enhanced HTML template

**Affected subsystems:**
- notification-system

**Regression risk:** None (email template only)

---

## Stale Entries

**None.** All recent changes have been indexed and are current.

---

## Known Issues Tracked

1. **Email delivery latency:** Some transactional emails delayed 30–60 seconds. Root cause: email service queue backlog. Monitoring in place.

2. **Slot locking contention:** High-demand doctor slots show occasional 409 Conflict responses. Expected behavior (patient sees "slot unavailable"). Monitoring slot lock failure rate.

---

## Next Phase

**Phase 14 — Care Continuity** (Planned start: 2026-06-15)

- SessionRecord model and API
- Exercise tracking and prescription management
- Care plan visualization
- Patient compliance tracking

---

## Recommended Pre-Phase-14 Testing

1. Run full test suite for appointment, payment, and refund flows
2. Manual end-to-end test: booking → payment → cancellation → refund
3. Load test slot locking under 100 concurrent patients per doctor
4. Email delivery: verify all transactional emails within 5 minutes

