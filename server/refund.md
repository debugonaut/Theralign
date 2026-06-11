You don't need any new keys. Razorpay refunds use the same `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` already in your environment. The SDK call literally is one line. You have everything you need.

Give this to Antigravity.

---

## Theralign — Cancellation & Refund System
### Complete Build Prompt

---

### Context

Theralign already has appointment cancellation, payment models with a `refunded` status in the enum, `razorpayPaymentId` stored on every payment, and `cancellationReason` on appointments. This prompt wires all of that together into a complete refund flow. No new Razorpay keys needed — use existing credentials.

Two distinct cancellation paths exist:

**Path A — Patient cancels:** Patient submits a cancellation request with a mandatory text reason. A refund request is created with status `pending`. Admin reviews and approves or rejects. On approval Razorpay refund API is called and patient is notified.

**Path B — Doctor cancels:** Doctor cancels the appointment. Refund is triggered automatically — no admin approval needed, no patient input needed. Patient sees a notification immediately and their payment history shows the refund status.

---

## PART 1 — BACKEND

### Step 1 — Extend The Payment Model

Do not create a separate Refund model. Extend the existing `Payment` model with these additional fields:

```javascript
refundStatus: {
  type: String,
  enum: ['none', 'pending', 'approved', 'rejected', 'processed'],
  default: 'none'
},
refundId: {
  type: String,
  default: null
  // Razorpay refund ID returned after successful refund call
},
refundReason: {
  type: String,
  default: null
  // Patient-submitted reason for cancellation
},
refundRequestedAt: {
  type: Date,
  default: null
},
refundProcessedAt: {
  type: Date,
  default: null
},
adminNote: {
  type: String,
  default: null
  // Admin's note on approval or rejection
},
refundInitiatedBy: {
  type: String,
  enum: ['patient', 'doctor', null],
  default: null
  // Who triggered the refund request
},
refundAmount: {
  type: Number,
  default: null
  // Amount to be refunded — always full consultation fee for MVP
}
```

---

### Step 2 — Cancellation & Refund Service

Create `server/src/services/refund.service.js`.

---

**`initiatePatientCancellation(appointmentId, patientId, reason)`**

```
Purpose: Called when patient cancels a confirmed + paid appointment.

Validations:
1. Find appointment by ID
2. Verify appointment.patient === patientId — patient can only cancel their own
3. Verify appointment.status === 'confirmed' — cannot cancel pending or completed
4. Verify reason exists and is at least 10 characters
   If reason is empty or too short: throw AppError('Please provide a reason for cancellation (minimum 10 characters)', 400)
5. Find the associated Payment document where appointment === appointmentId AND status === 'paid'
   If no paid payment found: throw AppError('No paid payment found for this appointment', 400)

Actions:
1. Update Appointment:
   status: 'cancelled'
   cancellationReason: reason
   cancelledBy: 'patient'
   cancelledAt: new Date()

2. Update Payment:
   refundStatus: 'pending'
   refundReason: reason
   refundRequestedAt: new Date()
   refundInitiatedBy: 'patient'
   refundAmount: payment.amount  // full refund always

3. Create notification for admin:
   type: 'REFUND_REQUEST'
   message: `Refund requested by patient for appointment with Dr. ${doctorName}`
   
4. Create notification for patient:
   type: 'CANCELLATION_CONFIRMED'
   message: 'Your appointment has been cancelled. Your refund request is under review.'

5. Return: { appointment, payment }
```

---

**`initiateDoctorCancellation(appointmentId, doctorId)`**

```
Purpose: Called when doctor cancels. Refund is automatic — no admin step.

Validations:
1. Find appointment by ID
2. Verify appointment.doctor === doctorId
3. Verify appointment.status === 'confirmed'
4. Find paid payment

Actions:
1. Update Appointment:
   status: 'cancelled'
   cancellationReason: 'Cancelled by physiotherapist'
   cancelledBy: 'doctor'
   cancelledAt: new Date()

2. Call Razorpay refund API immediately:
   const refund = await razorpayInstance.payments.refund(
     payment.razorpayPaymentId,
     { amount: payment.amount * 100 }  // Razorpay expects amount in paise
   )

3. Update Payment:
   status: 'refunded'
   refundStatus: 'processed'
   refundId: refund.id
   refundInitiatedBy: 'doctor'
   refundAmount: payment.amount
   refundProcessedAt: new Date()

4. Create notification for patient:
   type: 'DOCTOR_CANCELLED'
   message: `Dr. ${doctorName} has cancelled your appointment. A full refund of ₹${payment.amount} will be credited to your original payment method within 2-3 business days.`

5. Create notification for doctor:
   type: 'CANCELLATION_CONFIRMED'
   message: 'Appointment cancelled. The patient has been automatically refunded.'

6. Return: { appointment, payment, refund }
```

---

**`approveRefund(paymentId, adminId, adminNote)`**

```
Purpose: Admin approves a pending refund request.

Validations:
1. Find Payment by ID
2. Verify payment.refundStatus === 'pending'
   If not pending: throw AppError('This refund request is not in pending status', 400)

Actions:
1. Call Razorpay refund API:
   const refund = await razorpayInstance.payments.refund(
     payment.razorpayPaymentId,
     { amount: payment.refundAmount * 100 }
   )

2. Update Payment:
   status: 'refunded'
   refundStatus: 'processed'
   refundId: refund.id
   refundProcessedAt: new Date()
   adminNote: adminNote || 'Refund approved'

3. Create notification for patient:
   type: 'REFUND_APPROVED'
   message: `Your refund of ₹${payment.refundAmount} has been approved and processed. It will appear in your account within 2-3 business days depending on your payment method.`

4. Return: { payment, refund }
```

---

**`rejectRefund(paymentId, adminId, adminNote)`**

```
Purpose: Admin rejects a pending refund request.

Validations:
1. Find Payment by ID
2. Verify payment.refundStatus === 'pending'
3. Verify adminNote exists and is not empty
   If empty: throw AppError('A rejection reason is required', 400)

Actions:
1. Update Payment:
   refundStatus: 'rejected'
   adminNote: adminNote

2. Update Appointment:
   status back to 'confirmed' — the rejection means the cancellation is reversed
   OR keep as cancelled but mark refund rejected — decision: keep as cancelled, no reinstatement

3. Create notification for patient:
   type: 'REFUND_REJECTED'
   message: `Your refund request has been reviewed. Note from our team: ${adminNote}`

4. Return: { payment }
```

---

**`getPendingRefunds({ page, limit })`**

```
Purpose: Admin fetches all pending refund requests.

Query:
  Payment.find({ refundStatus: 'pending' })
  .populate('appointment')
  .populate({ path: 'appointment', populate: { path: 'patient', select: 'name email' } })
  .populate({ path: 'appointment', populate: { path: 'doctor', populate: { path: 'user', select: 'name' } } })
  .sort({ refundRequestedAt: 1 })  // oldest first — fair queue
  .skip((page-1) * limit)
  .limit(limit)

Return: { refunds, total, page, totalPages }
```

---

### Step 3 — Razorpay Instance

In `config/razorpay.js` create and export the Razorpay instance:

```javascript
import Razorpay from 'razorpay'
import { config } from './env.js'

const razorpayInstance = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret
})

export default razorpayInstance
```

Import this instance in `refund.service.js`. This is the same instance already used for order creation — just centralize it here.

---

### Step 4 — Refund Controller

Create `server/src/controllers/refund.controller.js`.

```javascript
// Patient cancels their appointment
POST cancelAppointmentPatient(req, res):
  const { appointmentId } = req.params
  const { reason } = req.body
  const result = await refundService.initiatePatientCancellation(
    appointmentId, req.user.id, reason
  )
  return successResponse(res, 200, 'Appointment cancelled. Refund request submitted.', result)

// Doctor cancels appointment
POST cancelAppointmentDoctor(req, res):
  const { appointmentId } = req.params
  const result = await refundService.initiateDoctorCancellation(
    appointmentId, req.user.id
  )
  return successResponse(res, 200, 'Appointment cancelled. Patient refund initiated automatically.', result)

// Admin gets pending refund queue
GET getPendingRefunds(req, res):
  const { page = 1, limit = 20 } = req.query
  const result = await refundService.getPendingRefunds({ page: Number(page), limit: Number(limit) })
  return successResponse(res, 200, 'Pending refunds retrieved', result)

// Admin approves refund
PATCH approveRefund(req, res):
  const { paymentId } = req.params
  const { adminNote } = req.body
  const result = await refundService.approveRefund(paymentId, req.user.id, adminNote)
  return successResponse(res, 200, 'Refund approved and processed', result)

// Admin rejects refund
PATCH rejectRefund(req, res):
  const { paymentId } = req.params
  const { adminNote } = req.body
  const result = await refundService.rejectRefund(paymentId, req.user.id, adminNote)
  return successResponse(res, 200, 'Refund request rejected', result)
```

---

### Step 5 — Routes

Add to `routes/appointment.routes.js`:
```
POST /api/appointments/:appointmentId/cancel-patient
  requireAuth + requireRole('patient')
  Body: { reason: string }

POST /api/appointments/:appointmentId/cancel-doctor
  requireAuth + requireRole('doctor')
  No body required
```

Add to `routes/admin.routes.js`:
```
GET  /api/admin/refunds              → getPendingRefunds
PATCH /api/admin/refunds/:paymentId/approve → approveRefund
PATCH /api/admin/refunds/:paymentId/reject  → rejectRefund
```

---

### Step 6 — Error Handling for Razorpay Refund Failures

Wrap every Razorpay refund API call in a try/catch. If the Razorpay API call fails:

```javascript
try {
  const refund = await razorpayInstance.payments.refund(paymentId, { amount })
} catch (razorpayError) {
  logger.error(`Razorpay refund failed: ${razorpayError.message}`)
  // Update payment refundStatus to 'pending' — keep it in the queue
  // Do NOT update to processed
  // Throw AppError so admin knows the Razorpay call failed
  throw new AppError(
    `Refund initiation failed with Razorpay: ${razorpayError.error?.description || razorpayError.message}. Please try again or contact Razorpay support.`,
    502
  )
}
```

This prevents silent failures where the admin thinks the refund went through but Razorpay rejected it.

---

## PART 2 — FRONTEND

### Step 7 — Patient Cancellation Flow

In `pages/patient/PatientAppointments.jsx`:

On each confirmed + paid appointment row, a `CANCEL APPOINTMENT` text link appears on the far right in `#C0392B` danger color. Small, Inter 600, `12px`. This link only appears when:
```javascript
appointment.status === 'confirmed' && appointment.paymentStatus === 'paid'
```

Clicking it opens a cancellation modal.

**The Cancellation Modal:**

Title: `Cancel Appointment` in Inter 700, `18px`. Below the title a thin separator.

A warning box immediately below the separator. Background `#FEF3E2`. Border `1px solid #B45309`. Border-radius `8px`. Padding `12px 16px`. Content: `⚠️ This appointment has been paid. Cancelling will submit a refund request that requires admin approval. Refunds typically process within 2-3 business days.` in Inter 400, `13px`, `#B45309`.

Below the warning: the appointment summary — doctor name, date, time, amount paid. Gray bordered box, padding `12px 16px`, border-radius `8px`.

Below the summary: the reason textarea.

Label: `Reason for cancellation` in Inter 600, `12px`, `#1C2B3A`, uppercase, letter-spacing `0.06em`.

Textarea: full width, `height: 100px`, `border: 1px solid #DDE3EA`, `border-radius: 8px`, `padding: 12px`, Inter 400, `14px`. Placeholder: `Please explain why you are cancelling this appointment. This helps us improve our service and process your refund request. (Minimum 10 characters)`. This field is mandatory — the submit button is disabled until the textarea has at least 10 characters. A character counter appears bottom-right of the textarea: `{count}/10 minimum` in `#A8B8C8`, turns `#0A7E6E` when the minimum is met.

Two buttons at the bottom of the modal:
- `KEEP APPOINTMENT` ghost button left — closes modal with no action
- `CANCEL & REQUEST REFUND →` danger button right — background `#C0392B`, white text, `border-radius: 8px`. On click: disabled + shows `SUBMITTING...` with spinner

On successful submission:
- Modal closes
- Toast success: `Appointment cancelled. Your refund request has been submitted for review.`
- The appointment row status badge changes from `CONFIRMED` teal to `CANCELLED` gray
- A refund status chip appears on the row: background `#FEF3E2`, text `#B45309`, `REFUND PENDING` in amber

---

### Step 8 — Doctor Cancellation Flow

In `pages/doctor/DoctorAppointments.jsx`:

On each confirmed appointment row a `CANCEL` text link appears in danger color. Clicking it opens a simpler confirmation modal — no reason input, no refund explanation needed since the refund is automatic.

**The Doctor Cancellation Modal:**

Title: `Cancel Appointment`

A warning box: `⚠️ Cancelling this appointment will automatically issue a full refund to the patient. This action cannot be undone.` in amber warning style.

Appointment summary showing patient name (first name + last initial), date, time.

A single informational note: `The patient will be notified immediately and their refund will be processed automatically.`

Two buttons:
- `KEEP APPOINTMENT` ghost button
- `CANCEL APPOINTMENT →` danger button

No reason input for the doctor — the system records `Cancelled by physiotherapist` automatically.

On successful submission:
- Toast: `Appointment cancelled. Patient refund has been initiated automatically.`
- Appointment row status changes to `CANCELLED` with a `REFUND AUTO-ISSUED` chip in teal

---

### Step 9 — Patient Payment History — Refund Status Display

In `pages/patient/PatientPayments.jsx` or wherever payment history is shown:

Each payment row must show a refund status indicator when `payment.refundStatus !== 'none'`:

**`pending`:** Amber chip `REFUND PENDING`. On hover tooltip: `Your refund request is under review by our team.`

**`approved` / `processed`:** Teal chip `REFUNDED`. Below the chip in small gray text: `₹{refundAmount} · 2-3 business days`. On hover tooltip: `Refund processed. Please allow 2-3 business days for it to appear in your account.`

**`rejected`:** Gray chip `REFUND REJECTED`. On hover tooltip showing admin note: `Reason: ${adminNote}`.

When `cancelledBy === 'doctor'` and refund is processed — add a special note in the row:
```
Cancelled by physiotherapist · Full refund issued automatically
```
In Inter 400, `12px`, `#6B7C93`, italic. This gives the patient complete context without them needing to contact support.

---

### Step 10 — Admin Refund Queue Page

Create `pages/admin/AdminRefunds.jsx`.

Add to admin sidebar navigation between `APPOINTMENTS` and `REVENUE`:
```
💸 Refunds  →  /admin/refunds
```
When pending refund count is greater than zero — show a badge on this sidebar item exactly like the doctor verification badge. Amber bordered rectangle with the pending count. This badge creates operational urgency — admin sees it needs attention.

**Page Layout:**

Section header: `REFUND REQUESTS` in display size.

A metric row at the top — three bordered cards side by side:
- `PENDING REVIEW` — count of `refundStatus: 'pending'` payments — amber border
- `PROCESSED THIS MONTH` — count of refunds processed this month — teal border  
- `TOTAL REFUNDED` — sum of all refundAmount where refundStatus is processed — teal border

Below metrics: the refund queue table.

**Table columns:**
```
PATIENT | DOCTOR | APPOINTMENT DATE | AMOUNT | REQUESTED | REASON | STATUS | ACTIONS
```

**PATIENT column:** Patient name and email in two lines. First name + last initial for name.

**DOCTOR column:** Doctor name only.

**APPOINTMENT DATE column:** Formatted date and time.

**AMOUNT column:** `₹{refundAmount}` right-aligned, teal color, tabular nums.

**REQUESTED column:** Relative time — `2 hours ago`, `1 day ago`. Small gray text.

**REASON column:** First 40 characters of `refundReason` with `...`. On hover a tooltip shows the full reason text. This is critical — admin needs to read the reason to make a fair decision.

**STATUS column:** Badge system.
- `PENDING`: amber badge
- `PROCESSED`: teal badge
- `REJECTED`: gray badge

**ACTIONS column:** Only visible on `PENDING` rows.
Two text links: `APPROVE` in `#0A7E6E` teal and `REJECT` in `#C0392B` danger. Both uppercase, Inter 600, `12px`.

**Approve flow:**

Clicking `APPROVE` opens an inline expansion below the row — not a modal. The expansion shows:

A confirmation summary: patient name, doctor name, amount, appointment date.

An optional admin note input: `Add a note for the patient (optional)` — small textarea, `height: 60px`. Placeholder: `e.g. Refund approved as per our cancellation policy.`

Two buttons: `CONFIRM APPROVAL →` in teal primary style and `CANCEL` ghost. Clicking `CONFIRM APPROVAL →` calls the approve API, shows a loading state, then collapses the expansion and updates the row status to `PROCESSED` in teal.

**Reject flow:**

Clicking `REJECT` opens an inline expansion below the row.

A mandatory note input: `Reason for rejection (required)` — textarea, `height: 60px`. The `CONFIRM REJECTION →` button is disabled until the textarea has content.

Two buttons: `CONFIRM REJECTION →` in danger style and `CANCEL` ghost.

**Why inline expansion instead of modal:**
The admin needs to see the full row context — patient, doctor, amount, reason — while writing their note. A modal would hide this context. Inline expansion keeps everything visible simultaneously.

---

### Step 11 — Notifications for Refund Events

Ensure these notifications exist and render correctly in the notification bell dropdown for each role:

**Patient receives:**

`REFUND_PENDING` — `Your refund request of ₹{amount} has been submitted and is under review.`

`REFUND_APPROVED` — `Great news! Your refund of ₹{amount} has been approved. It will appear in your {paymentMethod} within 2-3 business days.`

`REFUND_REJECTED` — `Your refund request has been reviewed. Please check your payment history for details.`

`DOCTOR_CANCELLED` — `Dr. {name} has cancelled your appointment on {date}. A full refund of ₹{amount} will be credited to your original payment method within 2-3 business days.`

**Doctor receives:**

`CANCELLATION_CONFIRMED` — when they cancel — `Appointment cancelled. The patient has been automatically refunded.`

**Admin receives:**

`REFUND_REQUEST` — `New refund request: {patientName} cancelled their appointment with Dr. {doctorName}. Amount: ₹{amount}.`

---

### Step 12 — API Functions on Frontend

Create or add to `client/src/api/appointments.api.js`:

```javascript
export const cancelAppointmentPatientAPI = (appointmentId, reason) =>
  axiosInstance.post(`/appointments/${appointmentId}/cancel-patient`, { reason })

export const cancelAppointmentDoctorAPI = (appointmentId) =>
  axiosInstance.post(`/appointments/${appointmentId}/cancel-doctor`)
```

Create or add to `client/src/api/admin.api.js`:

```javascript
export const getPendingRefundsAPI = (params) =>
  axiosInstance.get('/admin/refunds', { params })

export const approveRefundAPI = (paymentId, adminNote) =>
  axiosInstance.patch(`/admin/refunds/${paymentId}/approve`, { adminNote })

export const rejectRefundAPI = (paymentId, adminNote) =>
  axiosInstance.patch(`/admin/refunds/${paymentId}/reject`, { adminNote })
```

---

## PART 3 — VERIFICATION

After full implementation test these exact scenarios:

**Scenario 1 — Patient cancellation + admin approval:**
1. Book and pay for an appointment as patient
2. Go to patient appointments — click `CANCEL APPOINTMENT`
3. Verify modal opens with warning box and reason textarea
4. Try submitting with fewer than 10 characters — verify button stays disabled
5. Enter a valid reason — verify button activates
6. Submit — verify appointment shows `CANCELLED` and `REFUND PENDING` amber chip
7. Log in as admin — verify refund appears in `/admin/refunds` with amber pending badge on sidebar
8. Click `APPROVE` — verify inline expansion opens
9. Add optional note — click `CONFIRM APPROVAL →`
10. Verify row status changes to `PROCESSED` teal
11. Log in as patient — verify `REFUNDED` teal chip on payment history row
12. Verify patient notification appears in bell dropdown

**Scenario 2 — Patient cancellation + admin rejection:**
1. Same steps 1-6 as above
2. Admin clicks `REJECT`
3. Try submitting without rejection note — verify button disabled
4. Add rejection note — confirm rejection
5. Verify row shows `REJECTED` gray badge
6. Patient sees `REFUND REJECTED` gray chip on payment row with rejection reason in tooltip

**Scenario 3 — Doctor cancellation (automatic refund):**
1. Book and pay for appointment as patient
2. Log in as doctor — find the appointment — click `CANCEL`
3. Verify confirmation modal shows automatic refund warning
4. Confirm cancellation
5. Verify doctor sees `REFUND AUTO-ISSUED` chip on their appointment row
6. Log in as patient — verify appointment shows `CANCELLED` with note `Cancelled by physiotherapist · Full refund issued automatically`
7. Verify patient notification: `Dr. {name} has cancelled your appointment. A full refund of ₹{amount} will be credited...`
8. Verify payment row shows `REFUNDED` teal chip immediately — no admin step

**Scenario 4 — Razorpay refund API failure handling:**
Temporarily use an invalid payment ID to simulate a Razorpay failure. Verify the error is caught, the payment refundStatus stays `pending`, and the admin sees a clear error message explaining the Razorpay call failed. The refund remains in the queue for retry.

**Edge cases to verify:**
- Patient cannot cancel a `pending` (unpaid) appointment through the refund flow — that is a different cancellation path with no refund
- Patient cannot cancel a `completed` appointment — the cancel link does not appear
- Doctor cannot cancel a `completed` appointment
- Admin cannot approve an already-processed refund
- Admin cannot reject without a note