# Theralign AI-Native Codebase Knowledge Base

This directory contains the complete architectural knowledge base for Theralign. It exists to dramatically reduce AI agent context consumption while improving code quality and consistency.

---

## Structure

```
.ai/
├── context/
│   ├── project-summary.md          # First file every agent reads
│   ├── active-decisions.md         # Constraints from ADRs
│   └── recent-changes.md           # Last 7 days of activity
│
├── indexes/
│   ├── architecture-index.json     # All subsystems and their metadata
│   ├── feature-index.json          # All features mapped to files
│   ├── dependency-graph.json       # Import/call graph
│   └── staleness-manifest.json     # Which indexes are out of date
│
├── adr/
│   ├── ADR-001.md                  # Atomic slot locking
│   ├── ADR-002.md                  # Separate Payment collection
│   ├── ADR-003.md                  # Cloudinary resource_type
│   ├── ADR-004.md                  # Fee snapshot at booking
│   ├── ADR-005.md                  # Indian number formatting
│   ├── ADR-006.md                  # Fire-and-forget email
│   ├── ADR-007.md                  # SessionRecord collection
│   ├── ADR-008.md                  # AppointmentMedia collection
│   └── ADR-009.md                  # Razorpay signature verification
│
└── README.md                       # This file
```

---

## Quick Start for AI Agents

**When working on this codebase:**

1. **Always read first:** `.ai/context/project-summary.md` (5 min)
2. **Always read second:** `.ai/context/active-decisions.md` (2 min)
3. **If investigating recent changes:** `.ai/context/recent-changes.md` (2 min)
4. **If working on a feature:** Query `.ai/indexes/feature-index.json` for related files
5. **If planning a change:** Query `.ai/indexes/dependency-graph.json` to see what's affected
6. **Only then:** Read specific source files identified by the above

**Total time before reading source:** 5–10 minutes  
**Context tokens before reading source:** ~500 tokens (vs. 50,000+ for raw codebase)

---

## Key Architectural Patterns

### Atomic Slot Locking (ADR-001)

The booking system prevents double-booking via MongoDB's atomic `findOneAndUpdate`:

```javascript
const slot = await AvailabilitySlot.findOneAndUpdate(
  { _id: slotId, isBooked: false },  // Condition
  { isBooked: true },                 // Update
  { new: true }
);
if (!slot) throw new AppError('Slot already booked', 409);
```

**Never use separate find + save.** This pattern is **non-negotiable.**

### Fee Snapshot (ADR-004)

At booking time, fees are **copied** from DoctorProfile to Appointment:

```javascript
const appointment = await Appointment.create({
  consultationFee: doctor.consultationFee,    // Snapshot
  platformCommission: Math.floor(doctor.consultationFee * 0.10),
  doctorEarnings: Math.floor(doctor.consultationFee * 0.90),
});
```

**Never read fees from DoctorProfile for historical appointments.** Always read from Appointment.

### Signature Verification (ADR-009)

All Razorpay webhooks must verify HMAC-SHA256 before updating payment status:

```javascript
const expectedSignature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(orderId + '|' + paymentId)
  .digest('hex');

if (expectedSignature !== receivedSignature) {
  throw new AppError('Invalid signature', 400);
}
```

**Never skip this.** Forged webhooks would allow payment manipulation.

### Fire-and-Forget Email (ADR-006)

Email is **never awaited** in critical flows:

```javascript
// CORRECT
emailService.sendBookingConfirmation(appointment); // No await
res.json(apiResponse.success(appointment));

// WRONG — blocks patient interaction
await emailService.sendBookingConfirmation(appointment);
```

---

## Subsystems at a Glance

| Subsystem | Purpose | Entry Point | Critical Pattern |
|-----------|---------|-------------|-------------------|
| **Authentication** | JWT + roles | `auth.middleware.js` | Token validation, role guards |
| **Appointment Booking** | Slot locking + fee snapshot | `appointment.controller.js` | ADR-001, ADR-004 |
| **Payment Processing** | Razorpay integration | `payment.controller.js` | ADR-006, ADR-009 |
| **Refund System** | Request/approve/refund | `refund.service.js` | ADR-004 snapshot read |
| **Admin Operations** | Verification, analytics, refunds | `admin.controller.js` | Role-gated routes |
| **Notifications** | Email + in-app | `notificationService.js` | ADR-008 fire-and-forget |
| **Discovery & Search** | Doctor listing + search | `discovery.controller.js` | Geospatial + full-text |
| **Reviews & Ratings** | Patient feedback | `review.controller.js` | Only for completed appointments |
| **AI Integration** | Symptom triage + summaries | `ai.controller.js` | OpenAI integration |
| **Document Storage** | Credentials, avatars, PDFs | `upload.service.js` | ADR-003 resource_type |

---

## Common Tasks

### Task: Add a field to Appointment model

1. **Read:** `ADR-004` (fee snapshot constraints)
2. **Modify:** `server/src/models/Appointment.model.js`
3. **Check impact:** Query dependency-graph.json for all uses of Appointment
4. **Update:** `appointment.controller.js`, any services that access field
5. **Test:** Booking flow, payment verification, refund logic

### Task: Add new Razorpay webhook handling

1. **Read:** `ADR-009` (signature verification)
2. **Implement:** Verify signature before any database update
3. **Update:** `payment.controller.js`, webhook handler
4. **Test:** Valid signature passes, invalid signature is rejected

### Task: Add field to DoctorProfile

1. **Read:** `ADR-004` (this field won't be snapshotted to Appointment)
2. **Modify:** `server/src/models/DoctorProfile.model.js`
3. **Consider:** Will this affect existing appointments? (Answer: no, because fees are snapshotted)
4. **Update:** Doctor profile controller/service
5. **Test:** Doctor profile updates, discovery filters

### Task: Add email notification for new feature

1. **Read:** `ADR-006` (fire-and-forget pattern)
2. **Implement:** Call `emailService.sendXxx(data)` without await
3. **Location:** After main operation completes, before response
4. **Error handling:** Inside email service, not in controller
5. **Test:** Main flow completes even if email fails

### Task: Modify slot locking logic

1. **Read:** `ADR-001` (atomic locking is non-negotiable)
2. **Warning:** Do not deviate from `findOneAndUpdate` pattern
3. **If you must change:** Create a new ADR explaining why
4. **Test:** Concurrent booking attempts for same slot

---

## Development Rules

See `/docs/development-rules.md` for the full set. Key rules:

1. All controller functions use `asyncHandler` wrapper
2. All errors thrown as `AppError(message, statusCode)`
3. All responses use `apiResponse.success(data, message)` or `apiResponse.error(...)`
4. Dates stored as YYYY-MM-DD strings, not Date objects
5. Monetary values stored in rupees in database, converted to paise at Razorpay API call site
6. Role guards at route level, not controller level
7. Email never awaited in critical flows
8. Server directory never touched by frontend; frontend never modifies server code

---

## Phase Completion

| Phase | Status | Key Endpoints |
|-------|--------|---------------|
| 1–2 | ✅ | Auth (2 endpoints) |
| 3 | ✅ | Doctor profiles (2) + Patient profiles (3) |
| 4 | ✅ | Discovery (5) + Search (2) |
| 5 | ✅ | Booking (5) + Availability (5) |
| 6 | ✅ | Payments (3) |
| 7 | ✅ | Reviews (5) |
| 8 | ✅ | AI (3) |
| 9 | ✅ | Admin (12) + Notifications (4) |
| 10–12 | ✅ | UX, Accessibility, Waitlist |
| 13 | ✅ | Cancellation & Refunds (8) |
| **14** | 📋 | **Care Continuity (TBD)** |

---

## When to Update This Knowledge Base

**Automatic updates:** On git commit (via pre-commit hook)

**Manual updates when:**
- Adding a new subsystem or service
- Creating a new ADR (update `active-decisions.md`)
- Phase completion (update `recent-changes.md`)
- Major architectural change (refresh all indexes)

**Command to manually refresh (when implemented):**
```bash
npm run ai:refresh-knowledge-base
```

---

## For Humans (Not AI Agents)

This knowledge base is designed for AI agents, but it's valuable for humans too:

- **New team members:** Read `project-summary.md` on day 1
- **Architecture decisions:** Check `.ai/adr/` before proposing changes
- **Impact analysis:** Use `dependency-graph.json` to plan refactors
- **Code reviews:** Check `active-decisions.md` to ensure decisions are followed

---

## Contact / Questions

If the knowledge base is out of date or incorrect, please:
1. Note the specific section and why it's wrong
2. Regenerate the affected index or ADR
3. Commit with message: `docs: update knowledge base — [reason]`

The knowledge base is a living system. It should be updated as the codebase evolves.

