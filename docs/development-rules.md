# Theralign Development Rules

These are the conventions and rules every developer (human or AI agent) must follow.

---

## Error Handling & Response Format

**All controller functions must use asyncHandler:**
```javascript
import asyncHandler from '@/utils/asyncHandler';

export const bookAppointment = asyncHandler(async (req, res) => {
  // Your code here. Errors are automatically caught.
});
```

**All errors are thrown as AppError:**
```javascript
import AppError from '@/utils/AppError';

if (!slot) throw new AppError('Slot not found', 404);
if (!isVerified) throw new AppError('Doctor not verified', 403);
```

**All responses use apiResponse helper:**
```javascript
import apiResponse from '@/utils/apiResponse';

// Success
res.status(201).json(apiResponse.success(appointment, 'Appointment booked'));

// The AppError is automatically converted to error response by error middleware
```

---

## Naming Conventions

**Models (Mongoose schemas):**
- PascalCase, singular: `Appointment`, `DoctorProfile`, `AvailabilitySlot`
- File: `server/src/models/Appointment.model.js`

**Controllers:**
- camelCase with "Controller" suffix: `appointmentController`, `paymentController`
- File: `server/src/controllers/appointment.controller.js`
- Export functions: `bookAppointment`, `cancelAppointment`, `getAppointments`

**Services:**
- camelCase with "Service" or plain name: `authService`, `emailService`, `upload`
- File: `server/src/services/auth.service.js`, `server/src/services/upload.service.js`
- Export functions: Specific actions like `createRazorpayOrder`, `sendBookingEmail`

**Routes:**
- kebab-case URIs: `/api/appointments/book`, `/api/availability/slots`
- File: `server/src/routes/appointment.routes.js`

**Constants:**
- UPPER_SNAKE_CASE: `PLATFORM_COMMISSION_PERCENT`, `JWT_EXPIRY_DAYS`, `RAZORPAY_TIMEOUT_MS`
- File: `server/src/utils/constants.js`

---

## Date Handling

**Always use YYYY-MM-DD string format for dates in Appointment and AvailabilitySlot:**

```javascript
// CORRECT
const today = new Date().toISOString().split('T')[0]; // "2026-06-11"
const appointment = {
  date: '2026-06-11',
  startTime: '09:00',
  endTime: '10:00'
};

// WRONG
const appointment = {
  date: new Date(2026, 5, 11),  // Don't use Date objects for appointment date
  startTime: new Date(...),      // Don't use Date objects for time
};
```

**Reason:** String comparison is locale-independent. Date object comparison is error-prone across timezones.

**For timestamps (createdAt, updatedAt):**
```javascript
// Mongoose handles this automatically
createdAt: { type: Date, default: Date.now }
```

---

## Financial Calculations

**Database stores amounts in rupees (integer):**
```javascript
const consultationFee = 500; // rupees
```

**Convert to paise only at Razorpay API call:**
```javascript
const razorpayOrder = await razorpay.orders.create({
  amount: consultationFee * 100,  // 50000 paise
  currency: 'INR'
});
```

**Commission calculation (always 10/90 split):**
```javascript
const platformCommission = Math.floor(consultationFee * 0.10);
const doctorEarnings = consultationFee - platformCommission;

// ADR-004: These are snapshotted at booking time
const appointment = {
  consultationFee,
  platformCommission,
  doctorEarnings
};
```

**Never recalculate after booking.**

---

## Authentication & Authorization

**All authenticated routes require auth middleware:**
```javascript
router.post('/api/appointments/book',
  auth,           // Verify JWT token
  role('patient'), // Verify user role
  appointmentController.bookAppointment
);
```

**Role guards are enforced at route level, NOT in controller:**

```javascript
// CORRECT — guard in routes
router.patch('/api/appointments/:id/complete',
  auth,
  role('doctor'),  // ← Route level
  appointmentController.markCompleted
);

// WRONG — guard in controller
export const markCompleted = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    throw new AppError('Only doctors can mark appointments as completed', 403);
  }
  // ...
});
```

**Access user from req.user (set by auth middleware):**
```javascript
export const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user._id });
  res.json(apiResponse.success(appointments));
});
```

---

## Email Sending

**Email is fire-and-forget. Never await.**

```javascript
// CORRECT
export const bookAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.create(bookingData);
  
  // Send email without awaiting
  emailService.sendBookingConfirmation(appointment); // No await
  
  res.status(201).json(apiResponse.success(appointment));
});

// WRONG
await emailService.sendBookingConfirmation(appointment); // Blocks patient
```

**Errors inside email service are logged, not propagated:**
```javascript
export async function sendBookingConfirmation(appointment) {
  try {
    await mailer.send({
      to: appointment.patientEmail,
      subject: 'Appointment Confirmed',
      template: 'booking-confirmation',
      data: appointment
    });
  } catch (err) {
    logger.error('Email send failed', { appointmentId: appointment._id, err });
    Sentry.captureException(err);
    // Do not throw — email failure doesn't fail the booking
  }
}
```

---

## Database Queries

**Always add required indexes to models:**
```javascript
appointmentSchema.index({ patient: 1, status: 1 });
appointmentSchema.index({ doctor: 1 });
appointmentSchema.index({ date: 1 });
```

**Use lean() for read-only queries (faster):**
```javascript
const appointments = await Appointment.find({ patient: id }).lean();
```

**Use populate() for relationships, but consider the performance impact:**
```javascript
// OK for single document
const appointment = await Appointment.findById(id).populate('doctor');

// Use lean with batch queries
const appointments = await Appointment.find({ patient: id })
  .lean()
  .populate('doctor'); // Still has overhead, use if necessary
```

**Never modify with .save() after concurrent operations:**
```javascript
// WRONG — race condition
const slot = await AvailabilitySlot.findById(slotId);
slot.isBooked = true;
await slot.save();

// CORRECT — atomic
const slot = await AvailabilitySlot.findOneAndUpdate(
  { _id: slotId, isBooked: false },
  { isBooked: true },
  { new: true }
);
```

---

## File Organization

**Backend structure:**
```
server/src/
├── config/          # Database, email, payment service setup
├── controllers/     # Route handlers (thin)
├── middleware/      # Auth, error, validation
├── models/          # Mongoose schemas
├── routes/          # Express routes
├── services/        # Business logic (thick)
├── utils/           # Helpers, constants, error classes
└── validations/     # Request validation schemas
```

**Frontend structure:**
```
client/src/
├── api/             # Axios API calls
├── components/
│   ├── common/      # Button, Card, Badge, etc.
│   ├── layout/      # Navbar, Footer, Layout wrappers
│   └── [feature]/   # Feature-specific components
├── pages/           # Route-level page components
├── styles/          # CSS, Tailwind config
└── utils/           # Helpers, formatting, constants
```

---

## API Endpoint Structure

**Resource-based naming:**
```
POST   /api/appointments/book           — Create appointment
GET    /api/appointments/mine           — List user's appointments
PATCH  /api/appointments/:id/complete   — Mark completed
POST   /api/appointments/:id/cancel-*   — Cancel (specific reason)
```

**Success response format:**
```json
{
  "success": true,
  "data": {
    "appointmentId": "...",
    "status": "confirmed",
    "date": "2026-06-15"
  },
  "message": "Appointment booked"
}
```

**Error response format (via error middleware):**
```json
{
  "success": false,
  "error": "Slot already booked",
  "statusCode": 409
}
```

---

## Validation

**All request bodies are validated using Joi:**

```javascript
// server/src/validations/appointment.validation.js
import Joi from 'joi';

export const bookAppointmentSchema = Joi.object({
  slotId: Joi.string().required().messages({
    'string.required': 'Slot ID is required'
  }),
  patientNotes: Joi.string().max(500)
});

// In routes
import { validate } from '@/middleware/validate.middleware';
import { bookAppointmentSchema } from '@/validations/appointment.validation';

router.post('/book',
  auth,
  validate(bookAppointmentSchema),  // ← Validation middleware
  appointmentController.bookAppointment
);
```

---

## Comments & Documentation

**Write comments for why, not what:**

```javascript
// GOOD — explains business decision
// ADR-001: Use findOneAndUpdate to prevent double-booking via atomic operation
const slot = await AvailabilitySlot.findOneAndUpdate(
  { _id: slotId, isBooked: false },
  { isBooked: true },
  { new: true }
);

// BAD — obvious from code
// Mark slot as booked
slot.isBooked = true;
```

**Reference ADRs for architectural decisions:**

```javascript
// ADR-004: Fee is snapshotted at booking time, never recalculated
const appointment = {
  consultationFee: doctorProfile.consultationFee,
  // ...
};
```

---

## Testing

**Write tests for critical paths:**

1. Atomic slot locking (concurrent booking attempts)
2. Fee snapshot (fee change doesn't affect existing appointments)
3. Signature verification (forged webhooks are rejected)
4. Authorization (patient cannot access other patient's appointments)

**Naming convention for test files:**
```
appointment.controller.spec.js    — Unit tests
appointment.integration.spec.js   — Integration tests
```

---

## Server vs. Client Isolation

**Server changes never cascade to client:**
- API contract changes must be coordinated
- New API endpoints can be added without breaking existing ones
- Database schema changes don't directly affect frontend

**Client changes never modify server:**
- Frontend build is independent
- Frontend deployment doesn't require server restart
- Frontend can be deployed separately (Vercel)

---

## Environment Variables

**Server (.env):**
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/theralign
JWT_SECRET=[32+ character random string]
CLIENT_URL=https://theralign.vercel.app
RAZORPAY_KEY_ID=rzp_live_abc123
RAZORPAY_KEY_SECRET=[secret key]
CLOUDINARY_NAME=abc123
CLOUDINARY_API_KEY=xyz789
CLOUDINARY_API_SECRET=[secret]
OPENAI_API_KEY=sk-abc123
```

**Client (.env):**
```
VITE_API_URL=https://theralign-api.onrender.com
VITE_RAZORPAY_KEY_ID=rzp_live_abc123
```

**Never commit .env files. Use .env.example as template.**

---

## Logging & Monitoring

**Use structured logging:**
```javascript
logger.error('Payment verification failed', {
  appointmentId: appointment._id,
  error: err.message,
  signature: receivedSignature
});
```

**Alert on critical errors:**
- Payment signature verification failure (potential attack)
- Slot lock failure rate > 5% (contention)
- Email delivery failure > 10% (service issue)

---

## Code Review Checklist

Before merging, verify:

- [ ] asyncHandler wrapper on all controllers
- [ ] All errors are AppError instances
- [ ] All responses use apiResponse helper
- [ ] Dates stored as YYYY-MM-DD strings (not Date objects)
- [ ] Financial values in rupees (not paise)
- [ ] Role guards at route level
- [ ] Email not awaited in critical flows
- [ ] ADRs referenced in comments where applicable
- [ ] Indexes added to new models
- [ ] Tests cover critical paths
- [ ] No hardcoded secrets
- [ ] No console.log (use logger)

---

## When in Doubt

1. Check the ADRs in `.ai/adr/` — they contain the decisions you need
2. Look at similar existing code — copy the pattern
3. Read `.ai/context/active-decisions.md` — these are hard rules
4. Ask the team — architectural decisions are discussed before implementation

