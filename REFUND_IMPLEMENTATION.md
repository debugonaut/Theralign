# Refund System Implementation Guide

## Overview
Complete cancellation and refund system for Theralign with support for both patient-initiated and doctor-initiated cancellations.

## Backend Implementation

### 1. Models Updated

#### Payment Model (`server/src/models/payment.model.js`)
- ✅ Updated refund tracking fields:
  - `refundStatus`: enum ['none', 'pending', 'approved', 'rejected', 'processed']
  - `refundId`: Razorpay refund ID
  - `refundReason`: Patient-submitted cancellation reason
  - `refundRequestedAt`: When refund was requested
  - `refundProcessedAt`: When refund was processed
  - `adminNote`: Admin's approval/rejection note
  - `refundInitiatedBy`: 'patient' or 'doctor'
  - `refundAmount`: Amount to be refunded

#### Appointment Model (`server/src/models/appointment.model.js`)
- ✅ Added `cancelledAt` timestamp field

### 2. New Services

#### Refund Service (`server/src/services/refund.service.js`)
**Exports:**
- `initiatePatientCancellation(appointmentId, patientId, reason)` - Patient cancellation with admin review
- `initiateDoctorCancellation(appointmentId, doctorId)` - Automatic doctor cancellation
- `approveRefund(paymentId, adminId, adminNote)` - Admin approves refund
- `rejectRefund(paymentId, adminId, adminNote)` - Admin rejects refund
- `getPendingRefunds({ page, limit })` - Fetch pending refunds with pagination
- `getRefundStats()` - Dashboard statistics

### 3. New Controllers

#### Refund Controller (`server/src/controllers/refund.controller.js`)
- `cancelAppointmentPatient()` - POST endpoint
- `cancelAppointmentDoctor()` - POST endpoint
- `getPendingRefunds()` - GET endpoint
- `approveRefund()` - PATCH endpoint
- `rejectRefund()` - PATCH endpoint
- `getRefundStats()` - GET endpoint

### 4. Routes Updated

#### Appointment Routes (`server/src/routes/appointment.routes.js`)
```javascript
POST /appointments/:appointmentId/cancel-patient  (requireAuth, requireRole('patient'))
POST /appointments/:appointmentId/cancel-doctor   (requireAuth, requireRole('doctor'))
```

#### Admin Routes (`server/src/routes/admin.routes.js`)
```javascript
GET  /admin/refunds/stats                        (requireAuth, requireRole('admin'))
GET  /admin/refunds                              (requireAuth, requireRole('admin'))
PATCH /admin/refunds/:paymentId/approve          (requireAuth, requireRole('admin'))
PATCH /admin/refunds/:paymentId/reject           (requireAuth, requireRole('admin'))
```

## Frontend Implementation

### 1. API Functions

#### Refund API (`client/src/api/refund.api.js`)
- `cancelAppointmentPatientAPI(appointmentId, reason)`
- `cancelAppointmentDoctorAPI(appointmentId)`
- `getPendingRefundsAPI(params)`
- `getRefundStatsAPI()`
- `approveRefundAPI(paymentId, adminNote)`
- `rejectRefundAPI(paymentId, adminNote)`

### 2. UI Components

#### Patient Cancellation Modal
- **File:** `client/src/components/booking/CancellationModal.jsx`
- **Features:**
  - Warning box about refund approval requirement
  - Appointment summary display
  - Reason textarea with 10-character minimum requirement
  - Character counter with color change when minimum met
  - Submit/Cancel buttons with loading state
  - Disabled state when reason is invalid

#### Doctor Cancellation Modal
- **File:** `client/src/components/appointments/DoctorCancellationModal.jsx`
- **Features:**
  - Automatic refund warning
  - Patient name (first name + last initial)
  - Appointment details
  - Info note about automatic processing
  - Submit/Cancel buttons with loading state

#### Admin Refunds Dashboard
- **File:** `client/src/pages/admin/AdminRefunds.jsx`
- **Features:**
  - Statistics cards (Pending, Processed This Month, Total Refunded)
  - Refund requests table with:
    - Patient info (name, email, avatar)
    - Doctor name
    - Appointment date/time
    - Refund amount
    - Request time (relative)
    - Cancellation reason (truncated with hover tooltip)
    - Status badge
    - Action links (Approve/Reject)
  - Inline expansion for approval/rejection with:
    - Confirmation summary
    - Optional note for approval
    - Required note for rejection
    - Disabled state when note is empty
  - Pagination support

### 3. CSS Styling

All components include comprehensive CSS with:
- Design system colors (teal #0a7e6e, danger #c0392b, warning #b45309)
- Typography (Inter 12-18px, 400-700 weight)
- Responsive design (mobile, tablet, desktop)
- Animations (slide-up, spin)
- Hover states and transitions

## Flow Diagrams

### Patient Cancellation Flow
```
Patient clicks CANCEL on confirmed+paid appointment
    ↓
Cancellation Modal opens
    ↓
Patient enters reason (min 10 characters)
    ↓
Submit button enabled
    ↓
Patient confirms
    ↓
appointmentId: status='cancelled', cancelledBy='patient'
paymentId: refundStatus='pending', refundReason=reason
    ↓
Notifications sent to admin & patient
    ↓
Admin reviews in /admin/refunds
    ↓
Admin approves or rejects
    ↓
If approved: Razorpay refund API called, patient notified
If rejected: Patient notified with rejection reason
```

### Doctor Cancellation Flow
```
Doctor clicks CANCEL on confirmed+paid appointment
    ↓
Doctor Cancellation Modal opens
    ↓
Doctor confirms
    ↓
Razorpay refund API called immediately
    ↓
appointmentId: status='cancelled', cancelledBy='doctor'
paymentId: status='refunded', refundStatus='processed'
    ↓
Patient notified immediately about auto-refund
Doctor notified of confirmation
```

## Key Features

### 1. Validation
- Patient can only cancel their own appointments
- Doctor can only cancel their own appointments
- Can only cancel 'confirmed' appointments
- Patient cancellation requires reason (min 10 characters)
- Admin rejection requires a note

### 2. Razorpay Integration
- Uses existing `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- Refund amount always in paise (amount * 100)
- Error handling keeps payment in 'pending' for manual retry

### 3. Notifications
- Patient cancellation: Admin notified of new request
- Patient cancellation: Patient notified that cancellation is under review
- Doctor cancellation: Patient notified of auto-refund
- Doctor cancellation: Doctor notified of confirmation
- Admin approval: Patient notified of approval and processing timeline
- Admin rejection: Patient notified with admin's reason

### 4. Admin Dashboard
- Pending refund count badge on sidebar
- Queue ordered by oldest request first (fair processing)
- Inline expansions preserve context while reviewing
- Full-text reason visible on hover
- Statistics for monitoring (monthly processing, total refunded)

## Testing Checklist

### Scenario 1: Patient Cancellation + Admin Approval
- [ ] Book and pay for appointment as patient
- [ ] Go to patient appointments
- [ ] Click CANCEL APPOINTMENT
- [ ] Modal opens with warning and summary
- [ ] Try submit with <10 characters → disabled
- [ ] Enter valid reason → button enables
- [ ] Submit → appointment shows CANCELLED, REFUND PENDING badge
- [ ] Admin sees new request in /admin/refunds with amber badge
- [ ] Admin clicks APPROVE
- [ ] Inline expansion opens
- [ ] Add optional note
- [ ] Confirm → row changes to PROCESSED
- [ ] Patient sees REFUNDED badge with timeline
- [ ] Patient notification appears

### Scenario 2: Patient Cancellation + Admin Rejection
- [ ] Follow steps 1-7 from Scenario 1
- [ ] Admin clicks REJECT
- [ ] Try submit without note → disabled
- [ ] Add rejection note → button enables
- [ ] Confirm rejection → row shows REJECTED gray badge
- [ ] Patient sees REFUND REJECTED chip
- [ ] Hover shows admin's rejection reason

### Scenario 3: Doctor Cancellation (Automatic Refund)
- [ ] Book and pay for appointment as patient
- [ ] Doctor finds appointment
- [ ] Click CANCEL
- [ ] Doctor modal shows auto-refund warning
- [ ] Confirm cancellation
- [ ] Doctor sees REFUND AUTO-ISSUED chip
- [ ] Patient sees CANCELLED appointment
- [ ] Appointment note: "Cancelled by physiotherapist · Full refund issued automatically"
- [ ] Patient notification: auto-refund message
- [ ] Payment shows REFUNDED badge immediately

### Scenario 4: Razorpay Failure Handling
- [ ] Simulate Razorpay API failure
- [ ] Payment refundStatus stays 'pending'
- [ ] Admin sees clear error message
- [ ] Refund stays in queue for retry

## Integration Notes

1. **Existing Models**: Payment and Appointment models already have refund/cancellation fields. Updated schema to match spec exactly.

2. **Razorpay Instance**: Already exists at `server/src/config/razorpay.js`. Refund service imports and uses directly.

3. **Notification Service**: Existing `createNotification()` service handles all notification creation. Works with Notification model.

4. **Error Handling**: Uses existing `AppError` class and async error handler.

5. **Response Format**: Uses existing `successResponse()` utility for API responses.

## Deployment Notes

- No new environment variables needed (uses existing Razorpay keys)
- Database indexes already exist on payment and appointment lookups
- Migration: No schema migration needed if fields already exist
- Frontend: Import `react-hot-toast` for notifications (should already be installed)

## File Structure

```
Backend:
├── server/src/
│   ├── services/
│   │   └── refund.service.js (NEW)
│   ├── controllers/
│   │   └── refund.controller.js (NEW)
│   ├── models/
│   │   ├── payment.model.js (UPDATED)
│   │   └── appointment.model.js (UPDATED)
│   └── routes/
│       ├── appointment.routes.js (UPDATED)
│       └── admin.routes.js (UPDATED)

Frontend:
├── client/src/
│   ├── api/
│   │   └── refund.api.js (NEW)
│   ├── components/
│   │   ├── booking/
│   │   │   ├── CancellationModal.jsx (NEW)
│   │   │   └── CancellationModal.css (NEW)
│   │   └── appointments/
│   │       ├── DoctorCancellationModal.jsx (NEW)
│   │       └── DoctorCancellationModal.css (NEW)
│   └── pages/
│       └── admin/
│           ├── AdminRefunds.jsx (NEW)
│           └── AdminRefunds.css (NEW)

Documentation:
└── REFUND_IMPLEMENTATION.md (NEW - this file)
```

## Next Steps

1. **Component Integration**: Import and use modals in:
   - `PatientAppointmentCard.jsx` - Add cancel button for confirmed+paid appointments
   - `DoctorAppointmentCard.jsx` - Add cancel button for confirmed appointments
   
2. **Navigation Integration**: Add refund management link to admin sidebar between APPOINTMENTS and REVENUE

3. **Testing**: Run through all 4 test scenarios

4. **Deployment**: Deploy backend first, then frontend
