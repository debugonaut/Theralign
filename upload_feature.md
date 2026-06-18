Feature: Two-Step Booking Confirmation Flow with Pre-Payment Media Upload

Context:
The booking confirmation modal (BookingConfirmationModal.jsx) currently does everything in one step — the patient fills in notes, clicks "Confirm & Pay", the appointment is created via bookAppointment(), and Razorpay immediately launches. The MediaUploadSection component already exists in the modal but is hidden because appointmentId is null at modal open time. The appointmentMedia API and backend routes are already fully implemented.

Goal:
Split the modal into two distinct steps so the patient can upload media after the appointment is created but before payment is initiated.

Step 1 — "Review & Book" (shown when modal first opens, appointmentId is null):

Show the existing appointment summary (doctor, date, time, fee)

Show the symptoms/notes textarea

CTA button: "Book Appointment →"

On click: call bookAppointment({ slotId, patientNotes }) in SlotPicker.jsx, get back the appointmentId, set it via setTempAppointmentId(appointmentId), then advance the modal to step 2

Show a loading spinner on the button while the API call is in progress

On error: show toast, stay on step 1

Step 2 — "Upload & Pay" (shown after appointment is created, appointmentId is not null):

Show a compact read-only summary of the booking at the top (doctor name, date, time, fee) — no need to repeat the full detail list

Show the MediaUploadSection component (always visible, not behind the appointmentId && guard since we're guaranteed to have it at this point)

Show a small helper text: "You can optionally attach X-rays, prescriptions, or any relevant medical documents for your physiotherapist."

CTA button: "Confirm & Pay ₹{consultationFee} →" with the lock icon

On click: call initiatePayment(...) exactly as it currently works in handleConfirmBooking

Also show a secondary text link (not a full button): "Skip & Pay →" that does the same thing as the CTA (for patients who don't want to upload)

If the patient closes the modal on step 2 (without paying), call cancelAppointment(appointmentId, 'Booking abandoned before payment') to clean up the pending appointment, then reset tempAppointmentId to null — exactly like the current onFailure handler

Implementation notes:

Add a step state variable (1 or 2) inside BookingConfirmationModal — reset to 1 whenever isOpen changes to false

The onConfirm prop signature stays the same — onConfirm(patientNotes) — but it's now only called from the step 1 CTA. Rename it to onBook for clarity if you want, but update the prop name in SlotPicker.jsx too

In SlotPicker.jsx, split handleConfirmBooking into two functions:

handleBookAppointment(patientNotes) — calls bookAppointment(), sets tempAppointmentId, advances modal to step 2 (just set the id, the modal reacts to appointmentId becoming non-null)

The existing initiatePayment(...) call moves to a new handleProceedToPayment() function triggered by the step 2 CTA

Pass handleProceedToPayment as a new prop onPay to the modal

The bookingLoading state in SlotPicker covers step 1 button loading. Add a separate paymentLoading state for the step 2 pay button

Do not change any backend code — all APIs already exist and work