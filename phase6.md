Good — I have the exact format locked in. Here is the complete Phase 6 prompt set.

---

# PhysioConnect — Phase 6 Complete Prompt Set
## Razorpay Payment Integration

---

# PROMPT 6.1 — Payment Model

## Objective
Create the `Payment` Mongoose model. This schema is a dedicated ledger record for every payment transaction processed through Razorpay. It exists separately from the Appointment model to keep financial records clean, auditable, and independently queryable by the admin.

## Architecture Reasoning
It would be tempting to store all payment data directly on the Appointment document. This works for simple cases but creates problems as the platform scales: refund tracking, partial payment states, and payment audit logs all become awkward when embedded in a booking record. A separate Payment document means the Appointment remains a booking record and the Payment remains a financial record — two different concerns, two different schemas. They are linked by a reference. This mirrors how real payment platforms (Stripe, Razorpay) recommend structuring financial data.

## Implementation Scope
- Create `server/src/models/Payment.model.js`
- Do NOT create controllers or routes yet
- Do NOT modify any existing files

## Schema Specification

```js
// server/src/models/Payment.model.js

const paymentSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
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

    // Razorpay identifiers
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,       // Populated after payment capture
    },
    razorpaySignature: {
      type: String,
      default: null,       // Populated after signature verification
    },

    amount: {
      type: Number,
      required: true,      // Stored in rupees (not paise) for readability
    },
    currency: {
      type: String,
      default: 'INR',
    },

    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded'],
      default: 'created',
    },

    // Breakdown snapshot (copied from Appointment at payment time)
    platformCommission: { type: Number, required: true },
    doctorEarnings: { type: Number, required: true },
  },
  { timestamps: true }
);
```

## Required Indexes

```js
paymentSchema.index({ appointment: 1 });
paymentSchema.index({ patient: 1 });
paymentSchema.index({ razorpayOrderId: 1 }, { unique: true });
```

## Why Store Amount in Rupees, Not Paise?
Razorpay's API requires amounts in paise (smallest currency unit). The conversion (`amount * 100`) is done at the moment of the API call, not in the database. Storing in rupees keeps the database human-readable and avoids confusion when reading records in MongoDB Atlas. The conversion is a one-line concern at the controller level.

## Why `status: 'created'` As Default?
A Payment document is created when Razorpay order is initialized — before the user has paid. This `created` state represents an intent-to-pay. The status transitions to `paid` after webhook verification confirms successful payment. This lifecycle mirrors how Razorpay's own dashboard tracks orders.

## Validation Checkpoints
- [ ] Model imports and exports without errors
- [ ] `razorpayOrderId` has unique index
- [ ] `status` enum covers all four states
- [ ] `timestamps: true` is set

## Interview Explanation Points
- "I keep Payment as a separate model from Appointment because they represent different concerns — a booking record vs a financial ledger entry. This makes audit queries, refund tracking, and revenue analytics significantly cleaner."
- "I store amount in rupees in the database and convert to paise only when calling the Razorpay API. This prevents confusion when reading raw database records."
- "The `created` status represents payment intent — the order exists in Razorpay's system but money hasn't moved yet. This allows abandoned payment detection in future iterations."

---

# PROMPT 6.2 — Razorpay Environment Configuration & Server Setup

## Objective
Install the Razorpay Node.js SDK, configure environment variables, and create a reusable Razorpay instance that all payment controllers can import. Set up the Razorpay configuration as a clean module following the same pattern as the existing database configuration.

## Architecture Reasoning
Centralizing the Razorpay instance creation in a config file (rather than initializing it inside individual controllers) follows the same pattern already established for the database connection and Cloudinary. This ensures the API key pair is loaded once, the instance is reusable, and key rotation only requires changing environment variables rather than hunting through controller files.

## Implementation Scope
- Install Razorpay npm package (server)
- Create `server/src/config/razorpay.js`
- Add Razorpay environment variables to `.env` and `.env.example`
- Install `crypto` (Node.js built-in — no install needed) — used for webhook signature verification
- Do NOT create controllers or routes yet

## Package Installation

```bash
# Inside /server directory
npm install razorpay
```

## Environment Variables

Add to `server/.env`:
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

Add to `server/.env.example`:
```
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

Add to `client/.env`:
```
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

Add to `client/.env.example`:
```
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```

**Why the key ID also goes in the client `.env`?**
The Razorpay checkout SDK loaded in the browser requires the `key_id` to initialize the payment modal. The `key_secret` must NEVER go to the frontend — it stays server-only. The key ID is not sensitive and is designed to be public-facing.

## Razorpay Config Module

```js
// server/src/config/razorpay.js

const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpayInstance;
```

## Razorpay Test Account Setup (Instructions for Developer)

```
1. Go to https://dashboard.razorpay.com
2. Create a free account (no business registration needed for test mode)
3. Navigate to Settings → API Keys
4. Generate test API keys
5. Copy Key ID and Key Secret into server/.env
6. Copy Key ID (only) into client/.env
7. Test mode transactions use card: 4111 1111 1111 1111
   Expiry: any future date, CVV: any 3 digits, OTP: 1234 (for Razorpay test flow)
```

## Validation Checkpoints
- [ ] `npm install razorpay` completes without errors
- [ ] `razorpay.js` config module imports without errors
- [ ] Both `.env` files have Razorpay variables added
- [ ] `.env.example` files updated accordingly
- [ ] `RAZORPAY_KEY_SECRET` is NOT present in `client/.env`

## Common Mistakes to Avoid
- **Do NOT** put `RAZORPAY_KEY_SECRET` in any frontend file or environment — it must remain server-only
- **Do NOT** hardcode the key values in the config file — always read from `process.env`
- **Do NOT** use production keys during development — always use Razorpay test keys (`rzp_test_...`) until the app is ready to go live

## Interview Explanation Points
- "I keep the Razorpay secret key exclusively on the server. The client only receives the key ID, which is safe to expose — it's analogous to a public API key. The secret key is used only for server-side signature verification."
- "I followed the same config module pattern used for the database and Cloudinary — consistent architectural patterns make the codebase easier to navigate and extend."

---

# PROMPT 6.3 — Payment Initiation Endpoint (Create Razorpay Order)

## Objective
Build the backend endpoint that creates a Razorpay order when a patient initiates payment. This endpoint bridges the PhysioConnect appointment system with Razorpay's order infrastructure, returning order details that the frontend uses to launch the Razorpay checkout modal.

## Architecture Reasoning
The payment flow has two distinct server-side steps: order creation (this prompt) and payment verification (next prompt). Splitting them is architecturally correct because they serve different purposes — order creation is synchronous and returns immediately, verification is triggered asynchronously by the client after the user completes payment in the Razorpay modal. Keeping them as separate endpoints with separate responsibilities follows single-responsibility principles and mirrors how Razorpay's own documentation structures the integration.

## Implementation Scope
- Create `server/src/controllers/payment.controller.js`
- Create `server/src/routes/payment.routes.js`
- Modify `server/src/app.js` — mount: `app.use('/api/payments', paymentRoutes)`
- Do NOT implement webhook handler yet (Prompt 6.4)

## Existing Dependencies
- `razorpay.js` config — created in Prompt 6.2
- `Payment.model.js` — created in Prompt 6.1
- `Appointment.model.js` — exists from Phase 5
- `protect`, `authorizeRoles` — exist from Phase 2

## API Endpoint

```
POST /api/payments/create-order    → Patient initiates payment for an appointment
```

## Controller Logic — createOrder

```
1. Extract { appointmentId } from req.body
2. Validate appointmentId is present — return 400 if missing

3. Find Appointment by appointmentId:
   - Populate doctor (name, specialization)
   - If not found: return 404
   - Verify appointment.patient matches req.user._id — return 403 if not
   - If appointment.paymentStatus === 'paid': return 400
     "This appointment has already been paid for."
   - If appointment.status === 'cancelled': return 400
     "Cannot pay for a cancelled appointment."

4. Create Razorpay order:
   const order = await razorpayInstance.orders.create({
     amount: appointment.consultationFee * 100,  // Convert rupees to paise
     currency: 'INR',
     receipt: `receipt_${appointmentId}`,
     notes: {
       appointmentId: appointmentId.toString(),
       patientId: req.user._id.toString(),
     }
   })

5. Create Payment document in database:
   {
     appointment: appointmentId,
     patient: req.user._id,
     doctor: appointment.doctor._id,
     razorpayOrderId: order.id,
     amount: appointment.consultationFee,
     currency: 'INR',
     status: 'created',
     platformCommission: appointment.platformCommission,
     doctorEarnings: appointment.doctorEarnings,
   }

6. Return 201:
   {
     orderId: order.id,
     amount: appointment.consultationFee,
     currency: 'INR',
     keyId: process.env.RAZORPAY_KEY_ID,
     appointmentId,
     doctorName: appointment.doctor.name,
   }
```

## Why Include `keyId` in the Response?
The frontend needs `RAZORPAY_KEY_ID` to initialize the Razorpay checkout modal. While it's also available from `VITE_RAZORPAY_KEY_ID` on the client, returning it from the server means the client only needs one source of truth. Either approach is valid — returning it from the API is slightly cleaner.

## Route Definition

```js
// payment.routes.js
router.post('/create-order', protect, authorizeRoles('patient'), createOrder);
```

## Validation Checkpoints
- [ ] `POST /api/payments/create-order` with valid patient JWT and appointmentId creates a Razorpay order
- [ ] A Payment document with status `'created'` exists in MongoDB after the call
- [ ] Calling the endpoint on an already-paid appointment returns 400
- [ ] Calling with another patient's appointmentId returns 403
- [ ] The `razorpayOrderId` in the Payment document matches the order ID returned by Razorpay

## Common Mistakes to Avoid
- **Do NOT** forget to multiply `consultationFee * 100` — Razorpay requires paise, not rupees
- **Do NOT** create a new Payment document if one already exists for this appointment — check first or use upsert
- **Do NOT** return `RAZORPAY_KEY_SECRET` in the response — only `keyId`

## Interview Explanation Points
- "Order creation is a separate step from payment verification because Razorpay's flow is asynchronous — the order is created server-side, the user pays client-side, and then the server verifies the payment signature. These are three distinct responsibilities."
- "I store a Payment document at order creation time with status `created` so abandoned payments (user opens checkout but doesn't complete) are visible in the database and can be tracked or followed up later."
- "The `receipt` field in the Razorpay order is used for reconciliation — it ties the Razorpay order back to the PhysioConnect appointment ID."

---

# PROMPT 6.4 — Payment Verification Endpoint (Signature Verification)

## Objective
Build the payment verification endpoint. After a patient completes payment in the Razorpay checkout modal, the frontend sends the payment result back to this endpoint. The server cryptographically verifies the Razorpay signature to confirm the payment is authentic, then updates the Appointment and Payment records accordingly.

## Architecture Reasoning
Signature verification is the security layer of the entire payment flow. Without it, a malicious user could send a fake "payment successful" request and get an appointment marked as paid without actually paying. Razorpay provides a cryptographic signature (`razorpay_signature`) that is generated using HMAC-SHA256 of the order ID and payment ID, signed with the secret key. Only a server that knows the secret key can verify this signature. This means the verification is unforgeable without access to the secret.

## Implementation Scope
- Extend `server/src/controllers/payment.controller.js`
- Extend `server/src/routes/payment.routes.js`
- Node.js built-in `crypto` module is used — no additional install

## API Endpoint

```
POST /api/payments/verify    → Verify Razorpay signature after client-side payment
```

## Controller Logic — verifyPayment

```
1. Extract from req.body:
   { razorpayOrderId, razorpayPaymentId, razorpaySignature, appointmentId }

2. Validate all four fields are present — return 400 if any missing

3. SIGNATURE VERIFICATION:
   const crypto = require('crypto');
   const expectedSignature = crypto
     .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
     .update(`${razorpayOrderId}|${razorpayPaymentId}`)
     .digest('hex');

   if (expectedSignature !== razorpaySignature) {
     return res.status(400).json({
       success: false,
       message: 'Payment verification failed. Invalid signature.'
     });
   }

4. Find Payment document by razorpayOrderId
   If not found: return 404 "Payment record not found."

5. Update Payment document:
   {
     razorpayPaymentId,
     razorpaySignature,
     status: 'paid',
   }

6. Update Appointment document:
   {
     paymentStatus: 'paid',
     paymentId: razorpayPaymentId,
   }

7. Return 200:
   {
     success: true,
     message: 'Payment verified successfully.',
     appointmentId,
   }
```

## The Signature Verification Logic Explained

```
The formula Razorpay uses:
  HMAC-SHA256( razorpayOrderId + "|" + razorpayPaymentId, RAZORPAY_KEY_SECRET )

Razorpay generates this signature on their side using your secret key and
sends it to the client after payment. Your server recomputes the same
signature using the same secret key. If both match, the payment is genuine.
If they don't match, someone tampered with the data.
```

## Route Addition

```js
// Add to payment.routes.js
router.post('/verify', protect, authorizeRoles('patient'), verifyPayment);
```

## Validation Checkpoints
- [ ] Valid signature from Razorpay test flow results in 200 and both documents updated
- [ ] Tampered signature (manually changed) returns 400 "Invalid signature"
- [ ] After verification: `Appointment.paymentStatus === 'paid'`
- [ ] After verification: `Payment.status === 'paid'`
- [ ] After verification: `Payment.razorpayPaymentId` is populated
- [ ] Calling verify on an already-paid payment doesn't create duplicate records

## Common Mistakes to Avoid
- **Do NOT** skip signature verification and trust the frontend — this is a critical security step
- **Do NOT** use `==` for signature comparison — always use `crypto.timingSafeEqual()` or direct string comparison (Razorpay's SDK handles timing-safe comparison internally if using their helper)
- **Do NOT** update Appointment before the signature check passes

## Interview Explanation Points
- "Signature verification is non-negotiable. Without it, anyone could POST a fake verification request and mark any appointment as paid without actually paying. The HMAC-SHA256 signature using the secret key means only Razorpay — who also knows the secret key — could have generated the correct signature."
- "The verification logic is essentially: recompute the signature server-side and compare it to what the client sent. If they match, the payment is genuine. If not, reject it."
- "I update both the Payment document and the Appointment document atomically so the financial record and the booking record stay in sync."

---

# PROMPT 6.5 — Payment History Endpoints (Patient & Admin)

## Objective
Build the endpoints that allow patients to view their payment history and allow the admin to see platform-wide payment data with revenue aggregates.

## Architecture Reasoning
Payment history is a trust signal in any marketplace — patients expect to see a clear record of what they paid and when. The admin needs payment data to understand platform revenue beyond just appointment commission snapshots. Having a dedicated payment history API (rather than combining it with the appointment API) keeps the data layers clean and allows future enhancements like payment receipts, refund tracking, or financial exports without touching the appointment system.

## Implementation Scope
- Extend `server/src/controllers/payment.controller.js`
- Extend `server/src/routes/payment.routes.js`

## API Endpoints

```
GET /api/payments/mine          → Patient views their payment history
GET /api/payments/admin/all     → Admin views all payments with revenue totals
```

## Controller Logic — getMyPayments (Patient)

```
1. Query: Payment.find({ patient: req.user._id, status: 'paid' })
2. Populate:
   - appointment (date, startTime, endTime, status)
   - doctor (name, specialization)
3. Sort: { createdAt: -1 }
4. Return array
```

## Controller Logic — getAllPaymentsAdmin

```
1. Extract page (default 1), limit (default 10) from req.query

2. Run in parallel (Promise.all):
   a) Payment.find({ status: 'paid' })
        .populate('patient', 'name email')
        .populate('doctor', 'name specialization')
        .populate('appointment', 'date startTime endTime')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)

   b) Payment.countDocuments({ status: 'paid' })

   c) Payment.aggregate([
        { $match: { status: 'paid' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            totalCommission: { $sum: '$platformCommission' },
            totalDoctorEarnings: { $sum: '$doctorEarnings' },
          }
        }
      ])

3. Return:
   {
     payments,
     totalCount,
     totalPages,
     currentPage: page,
     revenue: {
       totalRevenue: aggregate.totalRevenue || 0,
       totalCommission: aggregate.totalCommission || 0,
       totalDoctorEarnings: aggregate.totalDoctorEarnings || 0,
     }
   }
```

## Route Additions

```js
// Add to payment.routes.js
router.get('/mine', protect, authorizeRoles('patient'), getMyPayments);
router.get('/admin/all', protect, authorizeRoles('admin'), getAllPaymentsAdmin);
```

**Route ordering note:** `GET /admin/all` must be defined BEFORE any potential `GET /:id` route to avoid Express treating `"admin"` as a param.

## Validation Checkpoints
- [ ] Patient can retrieve their paid payment history
- [ ] Unpaid/failed payments do NOT appear in patient history
- [ ] Admin endpoint returns paginated payments with populated references
- [ ] Revenue aggregate returns correct totals
- [ ] Empty state (no payments) returns empty array with zero revenue totals — not an error

## Interview Explanation Points
- "I query only `status: 'paid'` for patient history because showing `created` or `failed` states to patients creates confusion. The patient UI only needs confirmed successful payments."
- "The admin aggregate runs three queries in parallel using `Promise.all` — total count, paginated records, and revenue totals — to avoid sequential round trips to the database."

---

# PROMPT 6.6 — Frontend Payment Flow (Razorpay Checkout Modal)

## Objective
Build the complete client-side payment flow. Replace the Phase 5 "Confirm Booking" button with a payment initiation flow that creates a Razorpay order, opens the Razorpay checkout modal, captures the payment result, and verifies it with the backend.

## Architecture Reasoning
Razorpay's checkout modal is loaded as an external script (`checkout.js`) rather than an npm package. This is Razorpay's recommended approach and keeps the bundle size lean. The modal handles all PCI compliance concerns — card data never touches PhysioConnect's code. The integration is therefore purely about orchestration: create order → open modal → capture result → verify result → confirm success.

## Implementation Scope
- Modify `client/index.html` — add Razorpay checkout script
- Create `client/src/api/payment.api.js`
- Create `client/src/hooks/useRazorpay.js` — custom hook that wraps the modal logic
- Modify `client/src/components/booking/BookingConfirmationModal.jsx` — replace confirm button with payment flow
- Create `client/src/pages/patient/PaymentHistory.jsx`

## Step 1 — Add Razorpay Script to index.html

```html
<!-- Add inside <head> in client/index.html -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

This loads Razorpay's checkout library globally. It must be in `index.html` — do NOT import it as an ES module.

## Step 2 — Payment API Service

```js
// client/src/api/payment.api.js

import axiosInstance from './axiosInstance';

export const createPaymentOrder = (appointmentId) =>
  axiosInstance.post('/payments/create-order', { appointmentId });

export const verifyPayment = (data) =>
  axiosInstance.post('/payments/verify', data);

export const getMyPayments = () =>
  axiosInstance.get('/payments/mine');
```

## Step 3 — useRazorpay Custom Hook

```js
// client/src/hooks/useRazorpay.js

import { useState } from 'react';
import toast from 'react-hot-toast';
import { createPaymentOrder, verifyPayment } from '../api/payment.api';

export const useRazorpay = () => {
  const [loading, setLoading] = useState(false);

  const initiatePayment = async ({ appointmentId, onSuccess, onFailure }) => {
    setLoading(true);

    try {
      // Step 1: Create order on backend
      const { data: orderData } = await createPaymentOrder(appointmentId);

      // Step 2: Configure Razorpay modal options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100,          // Paise
        currency: orderData.currency,
        name: 'PhysioConnect',
        description: `Consultation with ${orderData.doctorName}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          // Step 3: User paid — verify with backend
          try {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              appointmentId,
            });
            toast.success('Payment successful! Appointment confirmed.');
            onSuccess?.();
          } catch (err) {
            toast.error('Payment verification failed. Contact support.');
            onFailure?.();
          }
        },
        prefill: {},                              // Can be populated from user context
        theme: { color: '#0EA5E9' },             // Primary brand color
        modal: {
          ondismiss: () => {
            toast('Payment cancelled.', { icon: 'ℹ️' });
            setLoading(false);
            onFailure?.();
          },
        },
      };

      // Step 4: Open Razorpay modal
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      toast.error('Could not initiate payment. Please try again.');
      onFailure?.();
    } finally {
      setLoading(false);
    }
  };

  return { initiatePayment, loading };
};
```

## Step 4 — Modify BookingConfirmationModal.jsx

Replace the existing "Confirm Booking" flow with payment initiation. The booking now happens as part of Phase 5's `POST /appointments/book`, which creates the appointment with `paymentStatus: 'unpaid'`. The payment step follows immediately after.

**Updated modal flow:**
```
Old Flow (Phase 5):
  Confirm → POST /appointments/book → success

New Flow (Phase 6):
  Confirm & Pay → POST /appointments/book → get appointmentId
                → initiatePayment({ appointmentId }) → Razorpay modal opens
                → User pays → verify → success
```

**Updated `onConfirm` logic in the parent (SlotPicker.jsx):**
```js
const { initiatePayment, loading: paymentLoading } = useRazorpay();

const handleConfirmBooking = async () => {
  setBookingLoading(true);
  try {
    // Step 1: Create the appointment
    const { data } = await bookAppointment({ slotId: selectedSlot._id });
    const appointmentId = data.appointment._id;

    // Step 2: Immediately initiate payment
    await initiatePayment({
      appointmentId,
      onSuccess: () => {
        setShowModal(false);
        setTimeout(() => navigate('/patient/appointments'), 1500);
      },
      onFailure: () => {
        // Appointment exists but unpaid — user lands on appointments page
        // and can pay later (if pay-later flow is implemented)
        setShowModal(false);
        navigate('/patient/appointments');
      },
    });
  } catch (err) {
    if (err.response?.status === 409) {
      toast.error('This slot was just booked. Please select another.');
      refetchAvailability();
    } else {
      toast.error('Booking failed. Please try again.');
    }
  } finally {
    setBookingLoading(false);
  }
};
```

**Updated modal button:**
```jsx
// In BookingConfirmationModal.jsx
<button onClick={onConfirm} disabled={loading}>
  {loading ? <Spinner /> : 'Confirm & Pay'}
</button>
```

## Step 5 — Update Payment Info Text in Modal

```jsx
// Replace the Phase 5 placeholder text:
// OLD: "Payment is collected at the time of your visit."
// NEW:
<p className="text-sm text-gray-500">
  Secure online payment via Razorpay. You will be redirected to complete payment.
</p>
```

## Validation Checkpoints
- [ ] Razorpay checkout script loads without console errors
- [ ] Clicking "Confirm & Pay" creates an appointment AND opens the Razorpay modal
- [ ] Completing payment in modal shows success toast and redirects to appointments page
- [ ] Dismissing the modal without paying shows cancellation toast
- [ ] After successful payment: `Appointment.paymentStatus === 'paid'` in database
- [ ] After successful payment: `Payment.status === 'paid'` in database
- [ ] Test card (4111 1111 1111 1111) processes successfully in Razorpay test mode

## Common Mistakes to Avoid
- **Do NOT** npm install Razorpay checkout — it must be loaded via `<script>` tag in `index.html`
- **Do NOT** access `window.Razorpay` before the script has loaded — the `<script>` tag in `index.html` ensures it's available on app load
- **Do NOT** show the Razorpay modal on app load — only open it on user action
- **Do NOT** trust the frontend payment result without server-side signature verification

## Interview Explanation Points
- "Razorpay's checkout is loaded as an external script rather than an npm package because that's Razorpay's recommended integration method. It also means card data never touches our application code — Razorpay handles all PCI compliance."
- "The `handler` callback fires only after Razorpay confirms payment on their side. But I still verify the signature server-side before marking the appointment as paid — the handler payload alone is not sufficient proof of genuine payment."
- "I created a `useRazorpay` custom hook to encapsulate all payment modal logic, keeping the booking components clean and making the payment logic reusable anywhere in the app."

---

# PROMPT 6.7 — Patient Payment History UI

## Objective
Build the Payment History page in the patient dashboard. Patients can view all their confirmed payments with appointment details, amounts paid, and timestamps.

## Architecture Reasoning
Payment history is a fundamental trust feature in any marketplace. Patients need a receipt-like view of what they paid, when, and for which appointment. This is also a demo-critical screen — the interviewer booking a test appointment will immediately want to verify the payment was recorded. A clean payment history page directly validates the entire Phase 6 flow.

## Implementation Scope
- Create `client/src/pages/patient/PaymentHistory.jsx`
- Modify patient dashboard routing/navigation to link to `/patient/payments`

## Existing Dependencies
- `payment.api.js` — created in Prompt 6.6
- Patient dashboard layout — exists
- Tailwind CSS — configured

## PaymentHistory.jsx — Component Specification

**State:**
```js
const [payments, setPayments] = useState([]);
const [loading, setLoading] = useState(true);
```

**On Mount:** Call `getMyPayments()` → set state

**UI Layout:**

```
Payment History

[If loading] → skeleton cards (3 rows)

[If empty] →
  "No payments yet."
  "Your payment records will appear here after completed transactions."

[For each payment — card]:
┌──────────────────────────────────────────────────────┐
│  Dr. {doctor.name}                    ₹{amount}      │
│  {doctor.specialization}                             │
│  📅 {appointment.date}  ·  {startTime} – {endTime}   │
│  🕐 Paid on {createdAt formatted date}               │
│  Payment ID: {razorpayPaymentId (last 8 chars)}      │
│                                              [Paid ✓] │
└──────────────────────────────────────────────────────┘
```

**Payment ID Display:**
Show only the last 8 characters of `razorpayPaymentId` for space. Full ID can be shown on hover/tooltip. This mimics how real payment receipts display transaction IDs.

**Date Formatting:**
```js
new Date(payment.createdAt).toLocaleDateString('en-IN', {
  day: 'numeric', month: 'long', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
})
```

**Status Badge:** Always green "Paid ✓" — this page only shows `status: 'paid'` records.

## Navigation Update

Add to patient dashboard sidebar/navigation:
```
💳 Payment History → /patient/payments
```

## Validation Checkpoints
- [ ] Payment history page loads and shows payments after a successful test transaction
- [ ] Payment cards show correct doctor name, amount, and date
- [ ] Empty state displays when no payments exist
- [ ] Loading skeleton shows during fetch
- [ ] Navigation link works from patient dashboard

## Interview Explanation Points
- "I show only the last 8 characters of the Razorpay payment ID — enough for identification without overwhelming the UI. This is how real fintech products handle transaction reference numbers."

---

# PROMPT 6.8 — Admin Revenue Dashboard Section

## Objective
Add a revenue section to the admin dashboard that shows platform earnings, total commission collected, and a paginated payments table with full financial breakdown.

## Architecture Reasoning
The admin revenue view is the platform's financial control panel. It needs to show three numbers clearly: total patient payments, platform commission retained, and doctor earnings passed through. These are already calculated and stored on the Payment documents — the admin view is simply an aggregation and display of that data. This section transforms the admin dashboard from a verification tool into a proper platform operations view.

## Implementation Scope
- Create `client/src/components/admin/PaymentsTable.jsx`
- Modify `client/src/pages/admin/AdminDashboard.jsx` — add revenue metrics and payments table
- Add `getAllPayments` to `client/src/api/admin.api.js`

## API Addition

```js
// Add to client/src/api/admin.api.js
export const getAllPayments = (page = 1, limit = 10) =>
  axiosInstance.get(`/payments/admin/all?page=${page}&limit=${limit}`);
```

## Revenue Metrics Row

Add three new metric cards to the admin dashboard's existing metrics section:

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Total Revenue   │  │ Platform Earned  │  │  Doctor Payouts  │
│  ₹{totalRevenue} │  │ ₹{totalComm...}  │  │ ₹{totalDoctor..} │
│  from all paid   │  │  10% commission  │  │  90% passed thru │
│  appointments    │  │                  │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

Fetch these values from the `revenue` object returned by `getAllPayments(1, 1)`.

## PaymentsTable.jsx — Component Specification

**State:** `payments`, `loading`, `currentPage`, `totalPages`, `revenue`

**Table Columns:**
```
Patient | Doctor | Date | Amount | Commission | Doctor Earnings | Status | Payment ID
```

**Payment ID Column:** Show last 8 chars only.

**Status Badge:** Green "Paid", Red "Failed", Gray "Created".

**Pagination:** Same prev/next pattern as the appointments table from Phase 5.

**Layout:**
```
Platform Payments

[Revenue metrics row — 3 cards]

[Table header row]
[Table data rows]
[Pagination]
[Empty state if no paid payments]
```

## Validation Checkpoints
- [ ] Admin dashboard shows correct total revenue, commission, and doctor earnings
- [ ] Payments table renders with all columns
- [ ] Pagination works correctly across multiple pages
- [ ] Values match what's in the Payment collection in MongoDB Atlas
- [ ] Empty state displays when no payments exist

## Interview Explanation Points
- "The three revenue metrics — total, commission, and doctor earnings — all come from the Payment collection aggregate. The 10/90 split is pre-computed at booking time and stored on Payment, so the admin query is a simple sum operation."
- "Displaying doctor earnings as a column in the admin table demonstrates the platform's transparency — the admin can see exactly what each doctor receives per transaction."

---

# PROMPT 6.9 — Update Appointment Status Display for Paid Appointments

## Objective
Update the appointment cards in both the patient and doctor dashboards to reflect payment status. A confirmed-and-paid appointment should visually communicate this to both parties. The appointment detail should show payment confirmation alongside booking confirmation.

## Architecture Reasoning
Payment status is information both patients and doctors care about. A patient wants to confirm their payment went through. A doctor wants to know if an appointment is paid before the patient arrives. Adding payment status display to existing appointment cards is a small but meaningful improvement that makes Phase 6 feel complete.

## Implementation Scope
- Modify `client/src/components/appointments/PatientAppointmentCard.jsx`
- Modify `client/src/components/appointments/DoctorAppointmentCard.jsx`
- No backend changes needed

## PatientAppointmentCard.jsx — Addition

Add below the consultation fee line:
```jsx
{appointment.paymentStatus === 'paid' ? (
  <span className="text-green-600 text-sm font-medium flex items-center gap-1">
    ✓ Payment confirmed
  </span>
) : (
  <span className="text-amber-500 text-sm flex items-center gap-1">
    ⏳ Payment pending
  </span>
)}
```

For cancelled appointments with `paymentStatus: 'paid'`, show:
```jsx
<span className="text-blue-500 text-sm">Refund eligible</span>
```
(Refund processing is a future feature — the label sets the expectation without requiring implementation.)

## DoctorAppointmentCard.jsx — Addition

Add a compact payment indicator on the card:
```jsx
<span className={`text-xs px-2 py-0.5 rounded-full ${
  appointment.paymentStatus === 'paid'
    ? 'bg-green-100 text-green-700'
    : 'bg-amber-100 text-amber-700'
}`}>
  {appointment.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
</span>
```

## Validation Checkpoints
- [ ] Patient appointment card shows "Payment confirmed" after successful payment
- [ ] Doctor appointment card shows "Paid" badge for paid appointments
- [ ] Unpaid appointments show "Payment pending" / "Unpaid" label
- [ ] No visual regressions on existing appointment card layout

---

# PROMPT 6.10 — Demo Seed Update for Phase 6

## Objective
Update the seed script from Phase 5 to also create Payment records for completed appointments, so the admin revenue dashboard and patient payment history show meaningful data immediately during demos.

## Implementation Scope
- Modify `server/src/config/seed.js` (created in Prompt 5.10)

## Seed Additions

```
For the 1 completed appointment created in Phase 5 seeding:

1. Create a corresponding Payment document:
   {
     appointment: completedAppointment._id,
     patient: patientUser._id,
     doctor: doctorProfile._id,
     razorpayOrderId: 'order_demo_' + Date.now(),   // Fake but realistic-looking
     razorpayPaymentId: 'pay_demo_' + Date.now(),
     razorpaySignature: 'demo_signature_hash',
     amount: consultationFee,
     currency: 'INR',
     status: 'paid',
     platformCommission: completedAppointment.platformCommission,
     doctorEarnings: completedAppointment.doctorEarnings,
   }

2. Update the completed Appointment:
   paymentStatus: 'paid',
   paymentId: payment.razorpayPaymentId

3. Log: "Payment seed: 1 demo payment record created"
```

**Note for developer:** Demo payment records use fake Razorpay IDs prefixed with `demo_`. This is clearly identifiable as seeded data and won't cause issues since these IDs are never verified against Razorpay's API.

## Validation Checkpoints
- [ ] Admin dashboard shows non-zero revenue after running updated seed script
- [ ] Patient payment history shows 1 payment entry after seeding
- [ ] Completed appointment card shows "Payment confirmed" badge

---

## Phase 6 Completion Gate

Before moving to Phase 7 (Reviews & Ratings), ALL of the following must be true:

```
✅ Payment model created with correct fields and indexes
✅ Razorpay SDK installed and config module created
✅ RAZORPAY_KEY_ID and KEY_SECRET in server .env (test keys)
✅ VITE_RAZORPAY_KEY_ID in client .env (key ID only — no secret)
✅ POST /api/payments/create-order creates Razorpay order and Payment document
✅ POST /api/payments/verify validates HMAC-SHA256 signature and updates both documents
✅ GET /api/payments/mine returns patient payment history
✅ GET /api/payments/admin/all returns paginated payments with revenue aggregate
✅ Razorpay checkout.js script loaded in index.html
✅ useRazorpay hook encapsulates modal logic
✅ Booking flow opens Razorpay modal after appointment creation
✅ Successful test payment updates Appointment.paymentStatus to 'paid'
✅ Patient payment history page shows confirmed transactions
✅ Admin dashboard shows total revenue, commission, and doctor earnings
✅ PaymentsTable renders in admin dashboard with pagination
✅ Appointment cards show payment status badges
✅ Seed script creates 1 demo payment for revenue dashboard population
✅ Test card (4111 1111 1111 1111) processes end-to-end in Razorpay test mode
```

**Phase 6 unlocks Phase 7 (Reviews) because:**
- `Appointment.paymentStatus === 'paid'` confirms the appointment was a real transaction
- `Appointment.status === 'completed'` is the gate for review eligibility
- `Appointment.reviewSubmitted === false` prevents duplicate reviews
- All three of these fields exist and are correctly set — Phase 7 reads them without requiring any schema changes

---

When you're ready, say **"generate Phase 7 prompts"** and I'll produce the complete Reviews & Ratings system prompt set.