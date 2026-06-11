# Quick Start — Knowledge Base Navigation

**For AI Agents Starting a Session on Theralign**

---

## In 30 Seconds

You are working on **Theralign**, a physiotherapist discovery and booking platform. Before touching code, read these three files (in order):

1. **`.ai/context/project-summary.md`** (5 min) — What is Theralign? What are the constraints?
2. **`.ai/context/active-decisions.md`** (2 min) — What must you NOT do?
3. **Task-specific file** (2 min) — Feature index or ADR

Then read source files.

---

## Common Tasks

### "Fix bug in appointment booking"
→ Read ADR-001 (slot locking), ADR-004 (fees), then query feature-index.json

### "Add field to Payment model"
→ Read ADR-002 (payment separation), check dependency-graph for impact

### "Implement new payment webhook"
→ Read ADR-009 (signature verification), then payment.controller.js

### "Understand refund flow"
→ Read feature-index.json → refund-workflow, then services/refund.service.js

### "Add new feature for Phase 14"
→ Read ADR-007 (SessionRecord), then architecture-index.json for subsystem pattern

---

## File Index

| File | Purpose | Read When |
|------|---------|-----------|
| `project-summary.md` | What is Theralign? | Starting session |
| `active-decisions.md` | Hard constraints | Before any implementation |
| `recent-changes.md` | Last 7 days of work | Checking for conflicts |
| `architecture-index.json` | All subsystems | Planning changes |
| `feature-index.json` | All features → files | Looking for related endpoints |
| `dependency-graph.json` | Import/call relationships | Assessing change impact |
| `staleness-manifest.json` | Which entries are out of date | Checking data freshness |
| `ADR-*.md` | Architectural decisions | When you need the full reasoning |
| `/docs/development-rules.md` | Coding conventions | Writing code |

---

## The 9 Critical ADRs

| ADR | Topic | Don't Violate |
|-----|-------|---------------|
| ADR-001 | Slot locking | Must use `findOneAndUpdate` with `isBooked:false` condition |
| ADR-002 | Payment collection | Payment is separate from Appointment, not embedded |
| ADR-003 | Cloudinary files | PDFs use `resource_type: 'raw'`, images use `resource_type: 'auto'` |
| ADR-004 | Fee snapshot | Copy fees at booking time, never recalculate from DoctorProfile |
| ADR-005 | Number formatting | Frontend uses `Intl.NumberFormat('en-IN')` |
| ADR-006 | Email sending | Never await email in critical flows |
| ADR-007 | SessionRecord | Separate collection from Appointment |
| ADR-008 | AppointmentMedia | Separate collection with explicit `uploadedBy` |
| ADR-009 | Signature verify | All Razorpay webhooks must verify HMAC-SHA256 before update |

---

## Key Patterns to Know

**Atomic Slot Locking (ADR-001):**
```javascript
const slot = await AvailabilitySlot.findOneAndUpdate(
  { _id: slotId, isBooked: false },
  { isBooked: true },
  { new: true }
);
if (!slot) throw new AppError('Slot already booked', 409);
```

**Fee Snapshot (ADR-004):**
```javascript
// At booking time: copy fees
const appointment = {
  consultationFee: doctor.consultationFee,
  platformCommission: Math.floor(doctor.consultationFee * 0.10),
  doctorEarnings: Math.floor(doctor.consultationFee * 0.90)
};
// Later: never read from DoctorProfile, always from Appointment
```

**Fire-and-Forget Email (ADR-006):**
```javascript
// CORRECT
emailService.sendBookingEmail(appointment); // No await

// WRONG
await emailService.sendBookingEmail(appointment);
```

**Signature Verification (ADR-009):**
```javascript
const expectedSignature = crypto
  .createHmac('sha256', RAZORPAY_SECRET)
  .update(orderId + '|' + paymentId)
  .digest('hex');

if (expectedSignature !== receivedSignature) {
  throw new AppError('Invalid signature', 400);
}
```

---

## Subsystems Cheat Sheet

| System | Main File | Key Models | Key Pattern |
|--------|-----------|-----------|-------------|
| **Authentication** | auth.middleware.js | User | JWT tokens, role guards |
| **Appointments** | appointment.controller.js | Appointment | ADR-001 (atomic slot lock), ADR-004 (fees) |
| **Payments** | payment.controller.js | Payment | ADR-009 (signature verify) |
| **Refunds** | refund.service.js | Payment | ADR-004 (read fees from Appointment) |
| **Availability** | availability.controller.js | AvailabilitySlot | ADR-001 (atomic operations) |
| **Discovery** | discovery.controller.js | DoctorProfile | Geospatial + full-text queries |
| **Reviews** | review.controller.js | Review | Only for completed appointments |
| **Admin** | admin.controller.js | All | Role: admin guard at route |
| **Notifications** | notificationService.js | Notification | ADR-006 (fire-and-forget) |

---

## Quick Decision Matrix

| Situation | Check | Then Read |
|-----------|-------|-----------|
| "Should I change X?" | active-decisions.md | ADR-00X related to X |
| "What files does X affect?" | dependency-graph.json | Related files identified |
| "What endpoints exist for X?" | feature-index.json | Find feature, see endpoints |
| "What's the pattern for X?" | development-rules.md | Code examples |
| "Did someone already do X?" | recent-changes.md | Recent work |
| "Is my change wise?" | architecture-index.json | Subsystem context |

---

## Rule Summary

**Do:**
- ✅ Use `asyncHandler` on all controllers
- ✅ Use `AppError` for all errors
- ✅ Use `apiResponse` for all responses
- ✅ Use YYYY-MM-DD for dates
- ✅ Use rupees in database, paise at Razorpay API only
- ✅ Use atomic `findOneAndUpdate` for slot locking
- ✅ Use fire-and-forget email
- ✅ Reference ADRs in comments

**Don't:**
- ❌ Use separate find + save for slot locking
- ❌ Recalculate fees after booking
- ❌ Await email in critical flows
- ❌ Store dates as Date objects in Appointment
- ❌ Embed Payment inside Appointment
- ❌ Skip Razorpay signature verification
- ❌ Use role guards in controllers (use in routes)
- ❌ Modify Appointment after booking without reading ADR-004

---

## Session Workflow

```
1. Agent starts session
   ↓
2. Read project-summary.md (3 min, ~500 tokens)
   ↓
3. Read active-decisions.md (2 min, ~300 tokens)
   ↓
4. Identify task type (bug fix, new feature, etc.)
   ↓
5. Query appropriate index (feature-index, dependency-graph, ADR)
   ↓
6. Read specific source files (10 min, ~1500 tokens)
   ↓
7. Implement with known constraints and patterns
   ↓
8. Total: 15 min, ~2300 tokens
   (vs. 45 min, 20,000+ tokens without KB)
```

---

## Version

**Knowledge Base Version:** 1.0.0  
**Date:** 2026-06-11  
**Status:** ✅ Production Ready  
**Total Lines:** 3,800+ (project-summary, ADRs, indexes, rules)  
**Maintenance:** Auto-refresh on git commit (when hook configured)

---

## Get Started

1. Open `.ai/context/project-summary.md` → Read product & constraints
2. Open `.ai/context/active-decisions.md` → Read what you must not do
3. Search `.ai/indexes/feature-index.json` for your task
4. Query `.ai/indexes/dependency-graph.json` for impact
5. Read `/docs/development-rules.md` for conventions
6. Read specific source files identified above
7. Implement with confidence

**Good luck! The codebase patterns are in place. Follow them.**

