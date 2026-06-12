Got it. I now have the exact format. Here is the complete Phase 5 prompt set, structured identically to Phase 1.

---

# PhysioConnect — Phase 5 Complete Prompt Set
## Availability Slots & Appointment Booking

---

# PROMPT 5.1 — AvailabilitySlot Model

## Objective
Create the `AvailabilitySlot` Mongoose model. This schema represents a single bookable time window that a doctor makes available on a specific date. It is the foundational data structure that the entire booking system depends on.

## Architecture Reasoning
Availability slots are kept as a **separate collection** from Appointments intentionally. Slots exist independently — a doctor can create 20 slots for next week without any patient involvement. When a patient books, an Appointment is created that *references* the slot and locks it. This separation means doctors control their schedule freely while the booking system operates on top of it cleanly. Embedding slots inside the Doctor document would make querying, updating, and locking individual slots significantly more complex and is the wrong architectural choice here.

## Implementation Scope
- Create `server/src/models/AvailabilitySlot.model.js`
- Do NOT create controllers, routes, or services yet
- Do NOT modify any existing files

## Schema Specification

```js
// server/src/models/AvailabilitySlot.model.js

const availabilitySlotSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: true,
    },
    date: {
      type: String,       // Format: "YYYY-MM-DD"
      required: true,
    },
    startTime: {
      type: String,       // Format: "HH:mm" — e.g., "09:00"
      required: true,
    },
    endTime: {
      type: String,       // Format: "HH:mm" — e.g., "09:30"
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
```

## Required Indexes

```js
// Compound unique index — prevents duplicate slots for same doctor/date/time
availabilitySlotSchema.index(
  { doctor: 1, date: 1, startTime: 1 },
  { unique: true }
);

// Query index — used heavily when fetching available slots for a doctor
availabilitySlotSchema.index({ doctor: 1, date: 1, isBooked: 1 });
```

## Why String for Date and Time (Not Date Type)?
Storing date as `"YYYY-MM-DD"` string and time as `"HH:mm"` string deliberately avoids UTC/timezone conversion issues. The platform is India-focused. MongoDB's Date type stores in UTC, which creates off-by-one date bugs when comparing or rendering in IST. String comparison for dates and times is straightforward, predictable, and completely sufficient for this use case. This is a defensible MVP tradeoff.

## Why `isActive` Alongside `isBooked`?
`isBooked` tracks whether a patient has claimed the slot. `isActive` allows doctors to soft-disable a slot without deleting it — for example, if they become unavailable for a day. These are two independent concerns and should not be collapsed into one field.

## Validation Checkpoints
- [ ] Model file imports and exports without errors
- [ ] Mongoose schema has all required fields with correct types
- [ ] Both indexes are defined correctly
- [ ] `timestamps: true` is set

## What NOT to Implement Yet
- No controllers
- No routes
- No service layer
- No frontend components

## Interview Explanation Points
- "I stored time as a string rather than a Date to avoid UTC/IST timezone conversion issues — a common subtle bug in India-focused apps."
- "The compound unique index on `{ doctor, date, startTime }` is the database-level enforcement that prevents a doctor from accidentally creating duplicate slots."
- "The `isActive` flag gives doctors soft-disable control over individual slots without deleting booking history or disrupting other slots."

---

# PROMPT 5.2 — Appointment Model

## Objective
Create the `Appointment` Mongoose model. This schema represents a confirmed booking — the transactional record created when a patient books an availability slot. It captures a snapshot of the fee at booking time, calculates platform commission, and holds appointment lifecycle state.

## Architecture Reasoning
The Appointment model is the **central business object** of the platform. Everything converges here: the patient who booked, the doctor being seen, the slot that was claimed, the money involved, the status of the appointment, and later, whether a review has been submitted. Keeping this in its own collection (rather than embedding in User or DoctorProfile) is the correct relational design for a marketplace — appointments are platform-level records, not user-level records.

## Implementation Scope
- Create `server/src/models/Appointment.model.js`
- Do NOT create controllers, routes, or services yet
- Do NOT modify any existing files

## Schema Specification

```js
// server/src/models/Appointment.model.js

const appointmentSchema = new mongoose.Schema(
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
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AvailabilitySlot',
      required: true,
    },

    // Denormalized for display and cancellation logic without extra joins
    date: { type: String, required: true },         // "YYYY-MM-DD"
    startTime: { type: String, required: true },    // "HH:mm"
    endTime: { type: String, required: true },      // "HH:mm"

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'confirmed',
    },

    // Financial snapshot — recorded at booking time, not recalculated later
    consultationFee: { type: Number, required: true },
    platformCommission: { type: Number, required: true },  // 10% of consultationFee
    doctorEarnings: { type: Number, required: true },      // 90% of consultationFee

    // Phase 6 (Razorpay) will populate these
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentId: { type: String, default: null },

    patientNotes: { type: String, maxlength: 500, default: '' },
    cancellationReason: { type: String, default: '' },
    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', 'admin', ''],
      default: '',
    },

    // Phase 7 (Reviews) will check this flag before allowing review submission
    reviewSubmitted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
```

## Required Indexes

```js
appointmentSchema.index({ patient: 1, status: 1 });
appointmentSchema.index({ doctor: 1, status: 1 });
appointmentSchema.index({ slot: 1 });
```

## Financial Snapshot Reasoning
`consultationFee`, `platformCommission`, and `doctorEarnings` are calculated and stored **at the moment of booking**, not derived dynamically from the Doctor document. This is critical because a doctor may update their fee after existing appointments are created. Snapshotting preserves the agreed price. The admin commission dashboard then simply sums `platformCommission` across completed appointments — no recalculation needed.

## Phase Integration Points
- **Phase 6:** `paymentId` and `paymentStatus` are populated by Razorpay webhook handler
- **Phase 7:** Review submission checks `status === 'completed' && reviewSubmitted === false` before proceeding, then sets `reviewSubmitted: true`

## Validation Checkpoints
- [ ] Model imports and exports without errors
- [ ] All enum values are correct
- [ ] Financial fields are all `Number` type
- [ ] `reviewSubmitted` defaults to `false`
- [ ] `paymentId` defaults to `null`
- [ ] `timestamps: true` is set

## Interview Explanation Points
- "I snapshot the consultation fee at booking time because the doctor might change their fee later — previous bookings should reflect the price the patient originally agreed to."
- "Commission is pre-calculated and stored so the admin analytics page is just a simple aggregation query — no join with Doctor to recalculate."
- "The `reviewSubmitted` flag lives on Appointment rather than on a separate collection because it's a property of the booking lifecycle, not an independent entity."

---

# PROMPT 5.3 — Availability Slot Controller & Routes (Doctor-Facing)

## Objective
Build the complete backend API for doctors to manage their availability slots. Doctors can create, view, update, and delete slots. A public endpoint allows patients (or unauthenticated visitors) to view a doctor's available slots.

## Architecture Reasoning
Slot management is entirely doctor-initiated. The doctor is the supply side of the marketplace — they define when they're available. These routes must be protected so only the authenticated doctor can modify their own slots. The one public endpoint (`GET /:doctorId/available`) is intentionally unauthenticated to allow patient browsing before login.

## Implementation Scope
- Create `server/src/controllers/availability.controller.js`
- Create `server/src/routes/availability.routes.js`
- Modify `server/src/app.js` — mount route: `app.use('/api/availability', availabilityRoutes)`
- Do NOT touch Appointment model or booking logic yet

## Existing Dependencies (Already Built in Phases 1–4)
- `auth.middleware.js` — exports `protect` (JWT verification) and `authorizeRoles(...roles)`
- `DoctorProfile.model.js` — has `userId` field linking to User
- `asyncHandler.js` and `apiResponse.js` utilities exist and should be used

## API Endpoints

```
POST   /api/availability/slots                  → Doctor creates a slot
GET    /api/availability/slots/mine             → Doctor views their own slots
PUT    /api/availability/slots/:slotId          → Doctor updates a slot
DELETE /api/availability/slots/:slotId          → Doctor deletes a slot
GET    /api/availability/:doctorId/available    → Public: patient views doctor's open slots
```

## Controller Logic — createSlot

```
1. Find DoctorProfile where userId === req.user._id
2. Validate: startTime must be strictly before endTime
   (compare "09:00" < "09:30" — string comparison works for HH:mm format)
3. Create AvailabilitySlot with { doctor: doctorProfile._id, date, startTime, endTime }
4. On MongoDB error code 11000 (duplicate key): return 409
   "A slot already exists for this date and time."
5. Return 201 with created slot
```

## Controller Logic — getMySlots

```
1. Find DoctorProfile where userId === req.user._id
2. Query: AvailabilitySlot.find({ doctor: doctorProfile._id })
3. Sort: { date: 1, startTime: 1 }
4. Return array of slots
```

## Controller Logic — updateSlot

```
1. Find slot by :slotId
2. Verify slot.doctor matches authenticated doctor's DoctorProfile._id — else 403
3. If slot.isBooked === true: return 400 "Cannot modify a slot that is already booked."
4. Allow updating: startTime, endTime, isActive only (never allow changing date or doctor)
5. Re-validate startTime < endTime after update
6. Save and return updated slot
```

## Controller Logic — deleteSlot

```
1. Find slot by :slotId
2. Verify slot.doctor matches authenticated doctor's DoctorProfile._id — else 403
3. If slot.isBooked === true: return 400 "Cannot delete a slot with an existing booking."
4. Delete and return 200 { message: "Slot deleted." }
```

## Controller Logic — getAvailableSlots (Public)

```
1. Accept :doctorId as URL param
2. Get today's date string in "YYYY-MM-DD" format
3. Query: AvailabilitySlot.find({
     doctor: doctorId,
     isBooked: false,
     isActive: true,
     date: { $gte: todayString }
   })
4. Sort: { date: 1, startTime: 1 }
5. Group results by date before returning:
   [
     { date: "2024-02-10", slots: [ {...}, {...} ] },
     { date: "2024-02-11", slots: [ {...} ] }
   ]
6. Return grouped array (empty array is valid — not a 404)
```

## Route Definitions

```js
// availability.routes.js
router.post('/slots', protect, authorizeRoles('doctor'), createSlot);
router.get('/slots/mine', protect, authorizeRoles('doctor'), getMySlots);
router.put('/slots/:slotId', protect, authorizeRoles('doctor'), updateSlot);
router.delete('/slots/:slotId', protect, authorizeRoles('doctor'), deleteSlot);
router.get('/:doctorId/available', getAvailableSlots);  // Public — no auth middleware
```

## Validation Checkpoints
- [ ] `POST /api/availability/slots` with valid doctor JWT creates a slot
- [ ] Duplicate slot returns 409 with clear message
- [ ] `GET /api/availability/slots/mine` returns only the authenticated doctor's slots
- [ ] `DELETE` on a booked slot returns 400
- [ ] `GET /api/availability/:doctorId/available` works without auth header
- [ ] Returns only future-dated slots grouped by date
- [ ] Patient-role JWT cannot access doctor-only endpoints (403)

## Common Mistakes to Avoid
- **Do NOT** use `new Date()` for today's date comparison — construct `"YYYY-MM-DD"` string manually to match stored format
- **Do NOT** allow doctors to modify another doctor's slots — always verify ownership before update/delete
- **Do NOT** return booked or inactive slots from the public endpoint

## Interview Explanation Points
- "The public availability endpoint is unauthenticated so patients can browse doctor schedules even before deciding to register. Reducing friction in discovery increases conversion."
- "I group slots by date server-side rather than client-side because it simplifies frontend rendering and reduces redundant logic duplication."

---

# PROMPT 5.4 — Appointment Booking Controller (Patient Books a Slot)

## Objective
Build the most critical backend endpoint in Phase 5: the patient booking flow. A patient selects a slot, the system atomically locks it to prevent duplicate bookings, and an Appointment record is created with snapshotted financial data.

## Architecture Reasoning
The slot-locking mechanism is the most important piece of business logic in this phase. Without atomic locking, two patients could simultaneously request the same slot and both succeed, creating a double-booking. The solution uses MongoDB's `findOneAndUpdate` with a conditional filter — only one database operation can win when the condition is `isBooked: false`. This avoids distributed locks, transactions, or any realtime infrastructure. It is simple, effective, and directly explainable in interviews.

## Implementation Scope
- Create `server/src/controllers/appointment.controller.js`
- Create `server/src/routes/appointment.routes.js`
- Modify `server/src/app.js` — mount: `app.use('/api/appointments', appointmentRoutes)`
- Do NOT add lifecycle endpoints yet (those are Prompt 5.5)

## Existing Dependencies
- `AvailabilitySlot.model.js` — exists from Prompt 5.1
- `Appointment.model.js` — exists from Prompt 5.2
- `DoctorProfile.model.js` — has `consultationFee` field
- `protect`, `authorizeRoles` middleware — already exists

## API Endpoints (This Prompt Only)

```
POST  /api/appointments/book       → Patient creates a booking
GET   /api/appointments/mine       → Patient views their appointments
GET   /api/appointments/doctor/mine → Doctor views their appointments
```

## Controller Logic — bookAppointment

```
1. Extract { slotId, patientNotes } from req.body
2. Validate slotId is present — return 400 if missing

3. ATOMIC SLOT LOCK — this is the race condition prevention:
   const slot = await AvailabilitySlot.findOneAndUpdate(
     { _id: slotId, isBooked: false, isActive: true },
     { $set: { isBooked: true } },
     { new: true }
   )
   If slot is null: return 409 "This slot is no longer available."

4. Fetch the DoctorProfile using slot.doctor to get consultationFee
   If doctor not found or not verified: rollback slot (set isBooked: false), return 400

5. Calculate financials:
   const consultationFee = doctorProfile.consultationFee
   const platformCommission = parseFloat((consultationFee * 0.10).toFixed(2))
   const doctorEarnings = parseFloat((consultationFee * 0.90).toFixed(2))

6. Create Appointment:
   {
     patient: req.user._id,
     doctor: slot.doctor,
     slot: slot._id,
     date: slot.date,
     startTime: slot.startTime,
     endTime: slot.endTime,
     status: 'confirmed',
     consultationFee,
     platformCommission,
     doctorEarnings,
     patientNotes: patientNotes || '',
   }

7. If Appointment.create() fails for any reason:
   Rollback: AvailabilitySlot.findByIdAndUpdate(slot._id, { isBooked: false })
   Return 500 with error message

8. Return 201 with created appointment
   Populate: doctor (name, specialization), slot (date, startTime, endTime)
```

## Controller Logic — getMyAppointments (Patient)

```
1. Query: Appointment.find({ patient: req.user._id })
2. Populate: doctor (name, specialization, profileImage), slot (date, startTime, endTime)
3. Sort: { date: -1 } (most recent first)
4. Return array
```

## Controller Logic — getDoctorAppointments (Doctor)

```
1. Find DoctorProfile where userId === req.user._id
2. Query: Appointment.find({ doctor: doctorProfile._id })
3. Populate: patient (name, email, phone)
4. Sort: { date: 1 } (upcoming first)
5. Return array
```

## Route Definitions

```js
// appointment.routes.js
router.post('/book', protect, authorizeRoles('patient'), bookAppointment);
router.get('/mine', protect, authorizeRoles('patient'), getMyAppointments);
router.get('/doctor/mine', protect, authorizeRoles('doctor'), getDoctorAppointments);
```

**Route ordering note:** `GET /doctor/mine` must be defined BEFORE any `GET /:id` route (added in Prompt 5.5) to prevent Express from matching `"doctor"` as a param value.

## Validation Checkpoints
- [ ] Patient can book an available slot via Postman
- [ ] `isBooked` on the slot is `true` after booking
- [ ] Second booking attempt on same slot returns 409
- [ ] `consultationFee`, `platformCommission`, `doctorEarnings` are correct on the created Appointment
- [ ] Slot is rolled back to `isBooked: false` if Appointment creation fails
- [ ] Doctor-role JWT cannot call `POST /api/appointments/book`
- [ ] `GET /api/appointments/mine` returns only the authenticated patient's appointments
- [ ] `GET /api/appointments/doctor/mine` returns only the authenticated doctor's appointments

## Common Mistakes to Avoid
- **Do NOT** use a `find()` then `save()` pattern for slot locking — this creates a race condition window
- **Do NOT** forget the rollback on Appointment creation failure — a locked slot with no appointment is a data integrity bug
- **Do NOT** mount `GET /:id` before `GET /doctor/mine` in route order

## Interview Explanation Points
- "I used `findOneAndUpdate` with `{ isBooked: false }` as an atomic condition. MongoDB's document-level atomicity ensures exactly one request can win — the second concurrent request gets `null` back and receives a 409. No locks, no transactions needed."
- "If the Appointment document creation fails after the slot is locked, I immediately roll back by setting `isBooked: false`. This prevents phantom-locked slots that no one can book."
- "Auto-confirming appointments (status: confirmed immediately) is a deliberate MVP simplification. Physiotherapists posting their own slots are signaling availability — a pending approval step adds friction without meaningful product value at this stage."

---

# PROMPT 5.5 — Appointment Lifecycle Endpoints (Cancel, Complete, Admin View)

## Objective
Build the appointment lifecycle management endpoints: doctors can mark appointments complete, patients and doctors can cancel, and the admin can view all appointments with commission data.

## Architecture Reasoning
Lifecycle management is what transforms the Appointment model from a static record into a living business object. Cancellation must also unlock the slot — these two operations must happen together or the slot remains permanently locked even after the booking is gone. Admin visibility into all appointments with commission totals is the foundation of the platform's revenue dashboard in Phase 6+.

## Implementation Scope
- Extend `server/src/controllers/appointment.controller.js`
- Extend `server/src/routes/appointment.routes.js`
- No new files needed

## API Endpoints

```
PATCH  /api/appointments/:id/cancel    → Patient or Doctor cancels
PATCH  /api/appointments/:id/complete  → Doctor marks complete
GET    /api/appointments/admin/all     → Admin views all appointments
```

**Note:** Add `GET /api/appointments/admin/all` route BEFORE `PATCH /:id/*` routes to avoid param collision.

## Controller Logic — cancelAppointment

```
1. Find Appointment by :id
2. If not found: return 404

3. Determine who is cancelling:
   - Check if req.user._id matches appointment.patient → role is 'patient'
   - Check if authenticated doctor's DoctorProfile._id matches appointment.doctor → role is 'doctor'
   - If neither matches: return 403 "Not authorized to cancel this appointment."

4. If appointment.status !== 'confirmed': return 400
   "Only confirmed appointments can be cancelled."

5. If canceller is patient AND appointment.date <= today:
   return 400 "Cannot cancel a past appointment."

6. Update Appointment:
   status: 'cancelled',
   cancellationReason: req.body.reason || '',
   cancelledBy: (determined role above)

7. UNLOCK THE SLOT:
   await AvailabilitySlot.findByIdAndUpdate(
     appointment.slot,
     { $set: { isBooked: false } }
   )

8. Return updated appointment
```

## Controller Logic — completeAppointment

```
1. Find Appointment by :id
2. If not found: return 404
3. Verify appointment.doctor matches authenticated doctor's DoctorProfile._id — else 403
4. If appointment.status !== 'confirmed': return 400
   "Only confirmed appointments can be marked as complete."
5. Update status to 'completed'
6. Return updated appointment
```

## Controller Logic — getAllAppointmentsAdmin

```
1. Extract page (default 1) and limit (default 10) from req.query
2. const skip = (page - 1) * limit

3. Run in parallel (Promise.all):
   a) Appointment.find({})
        .populate('patient', 'name email')
        .populate('doctor', 'name specialization')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

   b) Appointment.countDocuments({})

   c) Appointment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$platformCommission' } } }
      ])

4. Return:
   {
     appointments,
     totalCount,
     totalPages: Math.ceil(totalCount / limit),
     currentPage: page,
     totalPlatformCommission: aggregate result or 0
   }
```

## Route Additions

```js
// Add to appointment.routes.js — ORDER MATTERS
router.get('/admin/all', protect, authorizeRoles('admin'), getAllAppointmentsAdmin);
router.patch('/:id/cancel', protect, cancelAppointment);      // Both patient and doctor — check inside controller
router.patch('/:id/complete', protect, authorizeRoles('doctor'), completeAppointment);
```

## Validation Checkpoints
- [ ] Doctor can mark a confirmed appointment as complete
- [ ] Patient can cancel a future confirmed appointment
- [ ] Doctor can cancel any confirmed appointment
- [ ] Cancelled appointment sets `isBooked: false` on the slot (re-bookable afterward)
- [ ] Completing an already-cancelled appointment returns 400
- [ ] Cancelling a completed appointment returns 400
- [ ] Admin receives paginated appointments with correct populate
- [ ] `totalPlatformCommission` returns correct sum of completed appointment commissions
- [ ] Route ordering does not cause `/admin/all` or `/doctor/mine` to be swallowed by `/:id`

## Common Mistakes to Avoid
- **Do NOT** forget to unlock the slot on cancellation — this is the most common oversight
- **Do NOT** allow patients to cancel past appointments — check date before proceeding
- **Do NOT** put `/:id` wildcard routes before named routes like `/admin/all`

## Interview Explanation Points
- "Cancellation always unlocks the slot atomically — the two operations are coupled intentionally so cancelled slots immediately become available for re-booking."
- "I run the admin query, count, and commission aggregate in parallel using `Promise.all` to avoid sequential database round trips."

---

# PROMPT 5.6 — Doctor Availability Manager UI

## Objective
Build the Availability Manager page inside the doctor dashboard. Doctors can add time slots for specific dates and see, manage, and delete their existing slots from a clean UI.

## Architecture Reasoning
Keeping the availability manager as a dedicated dashboard section (rather than a modal or inline widget) gives it room to grow. Doctors interact with this frequently — it is an operational tool, not a one-time setup screen. The UI must clearly distinguish booked slots (immutable) from available slots (deletable) to prevent confusion.

## Implementation Scope
- Create `client/src/api/availability.api.js`
- Create `client/src/pages/doctor/AvailabilityManager.jsx`
- Modify doctor dashboard routing/navigation to include the new page

## Existing Dependencies
- `axiosInstance.js` — exists with auth header injection
- Doctor dashboard layout component — exists from Phase 3/4
- Tailwind CSS — configured

## API Service File

```js
// client/src/api/availability.api.js

import axiosInstance from './axiosInstance';

export const createSlot = (data) =>
  axiosInstance.post('/availability/slots', data);

export const getMySlots = () =>
  axiosInstance.get('/availability/slots/mine');

export const deleteSlot = (slotId) =>
  axiosInstance.delete(`/availability/slots/${slotId}`);
```

## AvailabilityManager.jsx — Component Specification

**State:**
```js
const [slots, setSlots] = useState([]);
const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);
const [formData, setFormData] = useState({ date: '', startTime: '', endTime: '' });
const [formError, setFormError] = useState('');
```

**On Mount:** Call `getMySlots()` and populate `slots` state.

**Slot Grouping Logic (computed from slots state):**
```js
const slotsByDate = slots.reduce((acc, slot) => {
  if (!acc[slot.date]) acc[slot.date] = [];
  acc[slot.date].push(slot);
  return acc;
}, {});
```

**Form Submission Logic:**
```js
1. Client-side validate: startTime < endTime — set formError if not, return early
2. Set submitting = true
3. Call createSlot(formData)
4. On success: refetch slots, reset form, show success toast
5. On 409 error: show toast "A slot already exists for this time."
6. On other error: show generic toast
7. Set submitting = false
```

**Delete Logic:**
```js
1. If slot.isBooked: do nothing (button is disabled)
2. Call deleteSlot(slot._id)
3. On success: remove slot from local state (filter), show toast "Slot deleted."
```

## UI Layout Specification

```
Page: "Manage Availability"
Subtext: "Add time slots to let patients book appointments with you."

──────────────────────────────────────────────
Add New Slot [card]
  Date:       [date input — min=today]
  Start Time: [time input]
  End Time:   [time input]
  [inline error if startTime >= endTime]
  [Add Slot button — disabled while submitting, shows spinner]
──────────────────────────────────────────────
Your Slots

  [If no slots] → empty state:
  "No availability slots added yet. Add your first slot above."

  [For each date group]
  ── February 10, 2024 ──────────────────────
  [slot card] 09:00 – 09:30   [Available ✓]  [Delete btn]
  [slot card] 10:00 – 10:30   [Booked]        [Delete btn — disabled, tooltip: "Has booking"]
  [slot card] 11:00 – 11:30   [Available ✓]  [Delete btn]
──────────────────────────────────────────────
```

**Status Badge Colors:**
- Available: green background, green text
- Booked: gray background, gray text

**Date Display:** Convert "2024-02-10" string to a human-readable label using `new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })`

## Validation Checkpoints
- [ ] Doctor can add a slot from the UI and it appears in the list
- [ ] Duplicate submission shows toast error
- [ ] Client-side time validation prevents submitting invalid ranges
- [ ] Booked slot delete button is visually disabled
- [ ] Available slot can be deleted and disappears from list
- [ ] Empty state shows when no slots exist
- [ ] Loading state shows while fetching

## Common Mistakes to Avoid
- **Do NOT** use a date picker library — native `<input type="date">` is sufficient
- **Do NOT** reload the entire page on slot creation — update state locally
- **Do NOT** show identical success/error toasts for different operations — be specific

## Interview Explanation Points
- "I group slots by date client-side using `reduce` so the UI renders a clear date-by-date schedule view rather than a flat unsorted list."
- "The delete button is disabled for booked slots with a tooltip explaining why — preventing user confusion about why an action isn't working."

---

# PROMPT 5.7 — Patient Slot Picker & Booking Flow UI

## Objective
Build the slot picker component on the doctor profile page and the booking confirmation modal. This is the patient-facing booking flow — the moment where the marketplace converts discovery into a transaction.

## Architecture Reasoning
The booking flow is embedded directly on the doctor profile page rather than a separate route. This reduces steps in the patient journey. Discovery → selection → booking happens on one screen. The confirmation modal adds a deliberate confirmation step before the API call, which prevents accidental bookings and creates a moment to display the consultation fee clearly.

## Implementation Scope
- Create `client/src/api/appointment.api.js`
- Create `client/src/components/booking/SlotPicker.jsx`
- Create `client/src/components/booking/BookingConfirmationModal.jsx`
- Modify `client/src/pages/public/DoctorProfile.jsx` — add `<SlotPicker>` below doctor info

## Existing Dependencies
- `DoctorProfile.jsx` page — exists from Phase 4
- `axiosInstance.js` — exists
- Auth context — provides `user` object and role
- `react-hot-toast` — already installed

## API Service File

```js
// client/src/api/appointment.api.js

import axiosInstance from './axiosInstance';

export const getDoctorAvailability = (doctorId) =>
  axiosInstance.get(`/availability/${doctorId}/available`);

export const bookAppointment = (data) =>
  axiosInstance.post('/appointments/book', data);

export const getMyAppointments = () =>
  axiosInstance.get('/appointments/mine');

export const cancelAppointment = (id, reason = '') =>
  axiosInstance.patch(`/appointments/${id}/cancel`, { reason });
```

## SlotPicker.jsx — Component Specification

**Props:** `{ doctorId, doctorName, consultationFee }`

**State:**
```js
const [availabilityByDate, setAvailabilityByDate] = useState([]); // [{ date, slots: [] }]
const [selectedDate, setSelectedDate] = useState(null);
const [selectedSlot, setSelectedSlot] = useState(null);
const [showModal, setShowModal] = useState(false);
const [loading, setLoading] = useState(true);
```

**On Mount:** Fetch `getDoctorAvailability(doctorId)` → set `availabilityByDate`

**Derived State:**
```js
const slotsForSelectedDate = availabilityByDate
  .find(d => d.date === selectedDate)?.slots || [];
```

**UI Layout:**
```
──────────────────────────────────────
Book an Appointment

[If not logged in]:
  "Login to book an appointment" [link to /login]

[If loading]:
  Skeleton placeholder rows

[If no availability]:
  "No availability slots currently. Check back soon."

[If slots exist]:
  Select a Date:
  [pill button: Mon, Feb 10] [pill button: Tue, Feb 11] ...
  (only show dates with at least 1 unbooked slot)

  [After date selected] Select a Time:
  [chip: 09:00 – 09:30]  [chip: 10:00 – 10:30]  ...
  (selected chip has distinct highlight style)

  [After slot selected]:
  [Book This Slot →] button
──────────────────────────────────────
```

**Date Pill Format:** Display short format — `"Mon, Feb 10"` using `toLocaleDateString`

**On "Book This Slot" click:** Open `BookingConfirmationModal`

## BookingConfirmationModal.jsx — Component Specification

**Props:** `{ isOpen, onClose, onConfirm, slot, doctorName, consultationFee, loading }`

**UI Layout:**
```
[Modal Overlay]
┌─────────────────────────────────────┐
│  Confirm Appointment                │
│                                     │
│  Doctor:   Dr. {doctorName}         │
│  Date:     Monday, Feb 10, 2024     │
│  Time:     09:00 – 09:30            │
│  Fee:      ₹{consultationFee}       │
│                                     │
│  ℹ Payment is collected at the      │
│    time of your visit.              │
│                                     │
│  [Cancel]   [Confirm Booking →]     │
│             (spinner if loading)    │
└─────────────────────────────────────┘
```

**onConfirm logic (called in parent SlotPicker):**
```js
1. Set bookingLoading = true
2. Call bookAppointment({ slotId: selectedSlot._id })
3. On success:
   - Close modal
   - toast.success("Appointment booked successfully!")
   - setTimeout(() => navigate('/patient/appointments'), 1500)
4. On 409 error:
   - Close modal
   - toast.error("This slot was just booked. Please select another.")
   - Refetch availability (refresh slot list)
5. On other error:
   - toast.error("Booking failed. Please try again.")
6. Set bookingLoading = false
```

## DoctorProfile.jsx Modification

Add below the existing doctor information section:
```jsx
{doctor?.isVerified && (
  <SlotPicker
    doctorId={doctor._id}
    doctorName={doctor.name}
    consultationFee={doctor.consultationFee}
  />
)}
```

## Validation Checkpoints
- [ ] Doctor profile page shows slot picker section
- [ ] Only verified doctors show the slot picker
- [ ] Date pills only appear for dates with available slots
- [ ] Selecting a date updates the time slot chips
- [ ] Confirmation modal shows correct doctor, date, time, and fee
- [ ] Successful booking shows toast and redirects to patient appointments
- [ ] Booking an already-taken slot shows specific error toast
- [ ] Unauthenticated users see login prompt instead of the picker

## Common Mistakes to Avoid
- **Do NOT** show the slot picker for unverified doctors
- **Do NOT** navigate immediately on success — add a short delay so the toast is visible
- **Do NOT** leave a stale slot list after a 409 — always refetch availability

## Interview Explanation Points
- "I embedded the slot picker directly on the doctor profile page to minimize the steps between discovery and booking. Fewer steps mean higher conversion in a marketplace."
- "The 409 error triggers an automatic availability refresh — so the patient immediately sees the current slot state rather than seeing a now-unavailable slot still selected."

---

# PROMPT 5.8 — Patient & Doctor Dashboard Appointment Sections

## Objective
Integrate appointment data into both the patient and doctor dashboards. Each role gets a dedicated appointments section showing relevant booking activity with appropriate action buttons.

## Architecture Reasoning
Dashboards are the operational control center for each user role. The doctor needs to see upcoming appointments and act on them (complete, cancel). The patient needs visibility into their booking history and upcoming visits. Both experiences are list-based with status-driven conditional rendering — no need for complex state management.

## Implementation Scope
- Create `client/src/components/appointments/PatientAppointmentCard.jsx`
- Create `client/src/components/appointments/DoctorAppointmentCard.jsx`
- Create `client/src/pages/patient/MyAppointments.jsx`
- Create `client/src/pages/doctor/DoctorAppointments.jsx`
- Modify patient and doctor dashboard routing/navigation to include new pages

## Existing Dependencies
- `appointment.api.js` — created in Prompt 5.7
- Patient and Doctor dashboard layout wrappers — exist from Phase 3
- `react-hot-toast` — installed
- Auth context — provides user identity

## PatientAppointmentCard.jsx — Specification

**Props:** `{ appointment, onCancel }`

```
┌─────────────────────────────────────────────┐
│  Dr. {doctor.name}              [Status Badge] │
│  {doctor.specialization}                    │
│  📅  {date}  ·  {startTime} – {endTime}     │
│  💰  ₹{consultationFee}                     │
│                                             │
│  [Cancel Appointment]  ← only if:           │
│    status === 'confirmed' AND date > today  │
└─────────────────────────────────────────────┘
```

**Status Badge Colors:**
- `confirmed` → blue
- `completed` → green
- `cancelled` → red/gray

## DoctorAppointmentCard.jsx — Specification

**Props:** `{ appointment, onComplete, onCancel }`

```
┌─────────────────────────────────────────────┐
│  {patient.name}                 [Status Badge] │
│  {patient.email}                            │
│  📅  {date}  ·  {startTime} – {endTime}     │
│  💰  ₹{consultationFee}  (Commission: ₹{x}) │
│                                             │
│  [Mark Complete]   ← only if: confirmed     │
│  [Cancel]          ← only if: confirmed     │
└─────────────────────────────────────────────┘
```

## MyAppointments.jsx (Patient Page) — Specification

**State:** `appointments`, `loading`, `cancelling` (id of appointment being cancelled), `cancelModal` (`{ open, appointmentId, reason }`)

**On Mount:** Call `getMyAppointments()` → set state

**Grouping Logic:**
```js
const today = new Date().toISOString().split('T')[0];
const upcoming = appointments.filter(
  a => a.status === 'confirmed' && a.date >= today
);
const past = appointments.filter(
  a => a.status === 'completed' || a.status === 'cancelled' || a.date < today
);
```

**Cancel Flow:**
```
1. Patient clicks Cancel on a card
2. Modal opens: "Are you sure? Add a reason (optional)." [text input] [Confirm Cancel]
3. On confirm: call cancelAppointment(id, reason)
4. On success: update appointment in local state (status → 'cancelled'), close modal, toast
5. On error: toast error
```

**Layout:**
```
My Appointments

[Upcoming]
  [If empty] "No upcoming appointments. Book one now →" [link to /doctors]
  [AppointmentCard] ...

[Past Appointments]
  [If empty] "No past appointments yet."
  [AppointmentCard] ... (no cancel button)
```

## DoctorAppointments.jsx (Doctor Page) — Specification

**State:** `appointments`, `loading`, `filter` (default: `'upcoming'`)

**On Mount:** Call `getDoctorAppointments()` → set state

**Filter Tabs:** `Upcoming` | `Completed` | `Cancelled`

**Filtering Logic:**
```js
const today = new Date().toISOString().split('T')[0];
const filtered = {
  upcoming: appointments.filter(a => a.status === 'confirmed' && a.date >= today),
  completed: appointments.filter(a => a.status === 'completed'),
  cancelled: appointments.filter(a => a.status === 'cancelled'),
}[filter];
```

**Complete Flow:**
```js
1. Call completeAppointment(id) — add this to appointment.api.js:
   export const completeAppointment = (id) =>
     axiosInstance.patch(`/appointments/${id}/complete`);
2. On success: update appointment status in local state, toast "Marked as complete."
```

**Cancel Flow:** Same pattern as patient (modal with optional reason).

## Validation Checkpoints
- [ ] Patient dashboard shows upcoming and past appointments correctly
- [ ] Cancel button only appears on eligible appointments
- [ ] Cancel modal accepts optional reason and calls API
- [ ] Cancelled appointment updates status in UI without page reload
- [ ] Doctor dashboard shows appointments filtered by tab
- [ ] Mark Complete button works and updates card status
- [ ] Empty states show with appropriate messaging and links
- [ ] Loading skeletons show while fetching

## Common Mistakes to Avoid
- **Do NOT** refetch the entire appointment list after every action — update local state directly for snappy UX
- **Do NOT** show the cancel button on past-dated appointments even if status is 'confirmed'
- **Do NOT** forget loading/disabled state on action buttons during API calls

## Interview Explanation Points
- "I update local state optimistically after cancel/complete rather than refetching — this makes the UI feel instant and avoids an unnecessary network round trip."
- "Both dashboards share similar card patterns but with different action sets — I kept them as separate components rather than one complex conditional component for readability."

---

# PROMPT 5.9 — Admin Appointment Visibility & Commission Metrics

## Objective
Add appointment data and commission metrics to the admin dashboard. The admin gains visibility into all platform bookings and the total commission earned from completed appointments.

## Architecture Reasoning
Admin visibility into bookings is the foundation of platform operational control and revenue tracking. This prompt adds the minimum necessary to make the admin dashboard feel operationally complete for Phase 5 — a metrics row and a paginated appointments table. Full analytics charts come in a later phase when more data is available.

## Implementation Scope
- Create `client/src/api/admin.api.js` (or extend if already exists)
- Create `client/src/components/admin/AppointmentsTable.jsx`
- Modify `client/src/pages/admin/AdminDashboard.jsx` — add metrics and table

## Existing Dependencies
- Admin dashboard page — exists from Phase 3 (doctor verification section)
- Axios instance — exists

## API Addition

```js
// Add to client/src/api/admin.api.js
export const getAllAppointments = (page = 1, limit = 10) =>
  axiosInstance.get(`/appointments/admin/all?page=${page}&limit=${limit}`);
```

## Admin Dashboard Metrics Row Addition

Add these two new metric cards alongside existing admin metrics:

```
┌─────────────────────┐   ┌─────────────────────┐
│  Total Appointments │   │  Platform Earnings   │
│       {count}       │   │   ₹{commission}      │
│  across all statuses│   │  from completed appts│
└─────────────────────┘   └─────────────────────┘
```

Fetch `getAllAppointments(1, 1)` and use the returned `totalCount` and `totalPlatformCommission` values.

## AppointmentsTable.jsx — Specification

**State:** `appointments`, `loading`, `currentPage`, `totalPages`

**On Mount:** Fetch `getAllAppointments(1, 10)` → set state

**Table Columns:**
```
Patient Name | Doctor Name | Specialization | Date | Time | Fee | Commission | Status
```

**Status Badge:** Same color coding as patient/doctor views.

**Pagination:**
```
[← Previous]  Page {currentPage} of {totalPages}  [Next →]
```

On page change: fetch `getAllAppointments(newPage, 10)` and update state.

**Layout:**
```
Recent Appointments

[Table with headers and rows]
[Pagination controls]
[If no appointments] "No appointments yet."
```

## Validation Checkpoints
- [ ] Admin dashboard shows total appointment count
- [ ] Platform earnings figure is correct (sum of completed commissions)
- [ ] Appointments table renders with all columns
- [ ] Pagination works correctly
- [ ] Empty state displays when no appointments exist
- [ ] Status badges render with correct colors

## Common Mistakes to Avoid
- **Do NOT** fetch all appointments in one request for pagination — always use `page` and `limit` params
- **Do NOT** display patient personal details beyond name and email in the admin table

## Interview Explanation Points
- "The commission aggregate runs server-side in the API response rather than being calculated in the frontend to keep the client logic simple and avoid potential floating-point errors across large datasets."

---

# PROMPT 5.10 — Demo Seed Data for Phase 5

## Objective
Create a seed script that populates the database with realistic availability slots and appointment records so every dashboard section shows meaningful data during demos instead of empty states.

## Implementation Scope
- Create `server/src/config/seed.js`
- Script is run manually: `node src/config/seed.js`
- Do NOT auto-run on server start

## Seed Script Logic

```
Prerequisites assumed already in DB (from Phase 3/4 seeding):
- At least 2 verified doctor accounts with DoctorProfile records
- At least 1 patient account

Seed operations:

1. Create availability slots for each verified doctor:
   - Next 7 days
   - 4 slots per day: 09:00–09:30, 10:00–10:30, 14:00–14:30, 15:00–15:30
   - Use upsert/skipDuplicates pattern (don't fail on re-run)

2. Create 3 sample appointments:
   a) 1 confirmed appointment (upcoming date) — slot marked isBooked: true
   b) 1 completed appointment (past date) — slot marked isBooked: true
   c) 1 cancelled appointment — slot remains isBooked: false (was unlocked)

3. For each appointment, calculate correct commission values

4. Log: "Seed complete: X slots created, 3 appointments created"
```

## Validation Checkpoints
- [ ] Script runs without errors
- [ ] Doctor dashboard shows upcoming appointment after seeding
- [ ] Admin dashboard shows non-zero appointment count and commission figure
- [ ] Patient dashboard shows appointment history after seeding
- [ ] Re-running the script does not create duplicate slots (safe re-run)

---

## Phase 5 Completion Gate

Before moving to Phase 6 (Razorpay Payments), ALL of the following must be true:

```
✅ AvailabilitySlot model created with correct indexes
✅ Appointment model created with all financial and lifecycle fields
✅ Doctor can create, view, and delete availability slots via API
✅ Public availability endpoint returns grouped unbooked future slots
✅ Patient can book a slot — atomic lock prevents double booking
✅ Consultation fee, commission (10%), and doctor earnings (90%) stored on Appointment
✅ Doctor can mark appointment complete
✅ Patient and doctor can cancel — slot unlocks on cancellation
✅ Admin can view all appointments with commission aggregate
✅ Doctor dashboard: Availability Manager UI functional
✅ Doctor dashboard: Appointments list with complete/cancel actions
✅ Patient dashboard: Slot picker on doctor profile page works end-to-end
✅ Patient dashboard: My Appointments shows upcoming and past bookings
✅ Admin dashboard: Appointment table and commission metrics visible
✅ All loading states, empty states, and error states handled
✅ Seed data populates all dashboards with meaningful content
✅ No .env changes needed — Phase 5 uses no new external services
```

**Phase 5 unlocks Phase 6 (Payments) because:**
- Every Appointment has `paymentStatus: 'unpaid'` and `paymentId: null` — ready to receive Razorpay data
- The booking flow returns `appointment._id` — Phase 6 uses this to initiate a Razorpay order
- The `consultationFee` is already stored — Razorpay order amount is pulled from it
- The "Confirm Booking" modal button in `BookingConfirmationModal.jsx` is replaced with "Pay Now → Razorpay" in Phase 6 with minimal component changes

---

When you're ready, say **"generate Phase 6 prompts"** and I'll produce the complete Razorpay payment integration prompt set.