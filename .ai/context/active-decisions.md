# Active Decisions — Constraints Every Agent Must Not Violate

**Generated:** 2026-06-11  
**Source:** Compiled from .ai/adr/ directory  
**Valid until:** Next ADR is added or status changes

---

## Active Architecture Decisions

**Do not modify these architectural choices without creating a new ADR and updating this file.**

### ADR-001 — Atomic Slot Locking via findOneAndUpdate

**Constraint:** Use MongoDB's `findOneAndUpdate` with conditional query `{ _id: slotId, isBooked: false }` for all slot locking operations. Never use separate find + save operations.

**Why:** Prevents race conditions and double-booking. This is an atomic operation at the database level.

**If violated:** Appointment slot can be booked twice, breaking refund logic.

---

### ADR-002 — Separate Payment Collection from Appointment

**Constraint:** Payment is a separate collection linked via `appointment` ObjectId. Do not embed Payment inside Appointment.

**Why:** Different lifecycles. Appointments and payments are queried separately. Embedding would complicate refund workflow and admin analytics.

**If violated:** Larger Appointment documents, complex payment updates, broken Razorpay webhook handling.

---

### ADR-003 — Cloudinary resource_type Configuration

**Constraint:** 
- Use `resource_type: 'raw'` for PDFs (credentials, session notes)
- Use `resource_type: 'auto'` for images (avatars)
- PDFs cannot be transformed; they are delivered as-is

**Why:** Maintains file integrity and enables proper transformations for images.

**If violated:** PDFs may be corrupted or rejected by Cloudinary. Images may not transform correctly.

---

### ADR-004 — Consultation Fee Snapshotted at Booking Time

**Constraint:** `consultationFee`, `platformCommission`, and `doctorEarnings` are written to Appointment at booking time. Never recalculate after booking. Never read from DoctorProfile for historical appointments.

**Why:** Preserves historical accuracy. Changing doctor fee does not retroactively change patient-visible appointments or admin-reported revenue.

**If violated:** Admin analytics report wrong revenue. Patients see appointments with wrong fees. Refunds are calculated incorrectly.

---

### ADR-005 — Indian Number Formatting (en-IN Locale)

**Constraint:** All UI formatting uses `Intl.NumberFormat('en-IN')` for numbers, ₹ for currency, DD/MM/YYYY for dates.

**Why:** Matches Indian user expectations. Accessibility tools read numbers correctly in Indian context.

**If violated:** Indian users see Western formatting, appear unprofessional.

---

### ADR-006 — Fire-and-Forget Email Sending

**Constraint:** Email is never awaited in critical flows (booking, cancellation, payment). Email is sent asynchronously in background.

**Why:** Email delivery is slow (0.5–2 seconds typical). Awaiting blocks patient confirmation. Network timeouts would fail entire booking.

**If violated:** Booking flow becomes slow. Patient sees delays or errors due to email server problems.

---

### ADR-007 — Session Records as Separate Collection

**Constraint:** SessionRecord is a separate collection linked via `appointment` ObjectId. Do not embed session data in Appointment.

**Why:** Different access patterns (doctor-only vs. patient-visible). Independent modification lifecycle.

**If violated:** Authorization model breaks. Cannot implement privacy controls. Appointment documents grow over time.

---

### ADR-008 — AppointmentMedia with uploadedBy Field

**Constraint:** AppointmentMedia is a separate collection with explicit `uploadedBy` field ('patient', 'doctor', 'admin'). Do not embed media in Appointment.

**Why:** Explicit ownership. Audit trail. Different mutable lifecycles.

**If violated:** Cannot determine who uploaded media. No audit trail. Cannot delete media without modifying Appointment.

---

### ADR-009 — HMAC-SHA256 Payment Signature Verification

**Constraint:** All payment status changes require HMAC-SHA256 signature verification before updating Payment or Appointment records. No exceptions.

**Why:** Prevents forged webhooks and payment manipulation.

**If violated:** Attacker can mark payments as successful, create appointments, and cause financial loss.

---

## Development Rules (from docs/development-rules.md)

**Additional constraints:**

1. **Server directory immutability:** Server changes never cascade to client. Frontend changes never modify server code.

2. **API contract stability:** API contracts are never changed without a new ADR.

3. **Dependency management:** New npm dependencies are noted in commit message with justification.

4. **Date format consistency:** All date comparisons use YYYY-MM-DD string format, not Date objects.

5. **consultationFee precedence:** After booking, always read consultationFee from Appointment, never from DoctorProfile.

6. **Role guards at route level:** All role-based access control (patient, doctor, admin) is enforced in routes, not controllers.

7. **AsyncHandler wrapper requirement:** All controller functions must use asyncHandler wrapper for automatic error handling.

8. **Razorpay paise conversion:** Database stores amounts in rupees. Convert to paise (multiply by 100) only at Razorpay API call site.

---

## When to Violate (Exceptions)

**No exceptions.** These decisions have been made for good reasons. If you believe a violation is justified, create a new ADR that supersedes the old one.

---

## How to Request Changes

1. Create a new ADR in `.ai/adr/` with `Status: Proposed`
2. Document the context, decision, and why the old decision is wrong
3. Note which existing ADR is superseded
4. Update `.ai/context/active-decisions.md` once approved

