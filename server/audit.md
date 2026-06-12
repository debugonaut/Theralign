Give this to Antigravity.

---

## Theralign — Complete End-to-End Flow Audit & Fix
### Full Real-Time Journey from Registration to Appointment Completion

---

### Context

This is a complete audit and fix of the entire user journey on Theralign. Every step of the flow must work correctly in production on the live Vercel + Render deployment. Work through each act in strict order. Do not move to the next act until the current one is fully verified. Test every step in the production URL, not locally.

---

## ACT 1 — Patient Registration & Profile Creation

### 1.1 — Registration

Navigate to `theralign.vercel.app/register`.

Verify the role toggle shows `Patient` and `Physiotherapist` as two options. Verify the transition between them has a `200ms` color change — not an instant snap.

Select `Patient`. Fill in name, email, password. Submit.

**Verify:**
- A JWT token is issued and stored in localStorage under `physio_token`
- The patient user document is created in MongoDB with `role: 'patient'`
- The patient is redirected to `/patient/dashboard` automatically
- The dashboard shows a welcome message with the patient's first name
- No console errors appear in the browser

**Fix if broken:**
- If redirect fails: check the post-registration navigation logic in the auth store — `dashboardRoutes['patient']` must resolve to `/patient/dashboard`
- If token is not stored: check the Axios response interceptor and `setCredentials` in the Zustand auth store
- If the user document is not created: check `POST /api/auth/register` on the Render logs

### 1.2 — Patient Profile Completion

Navigate to `/patient/profile`.

Verify the five-tab stepper renders with Basic Info as the active step.

Fill in Basic Info: full name, phone number, date of birth, gender, blood group. Click `SAVE & CONTINUE →`.

**Verify:**
- `PUT /api/patients/profile/me` is called with the correct body
- The profile completion percentage in the left column updates after save
- The stepper advances to Medical History (step 2) automatically after save
- The draft autosave chip appears after typing in any field

Fill in Medical History: add one condition, one medication, one past surgery. Save.

Fill in Lifestyle: set occupation, activity level, smoking and alcohol status. Save.

Fill in Emergency Contacts: add one contact with name, relationship, and phone. Save.

Fill in Insurance: add provider name and policy number. Save.

**Verify after all tabs complete:**
- Profile completion shows `100%` in the left column
- The progress bar is fully filled in primary teal
- All data persists — refresh the page and all fields still show the saved values
- `GET /api/patients/profile/me` returns all saved fields correctly

**Fix if broken:**
- If data does not persist after refresh: check that the form is reading from API response on mount, not just from local state
- If profile completion does not update: check the computed completion percentage logic — verify it counts all major sections

### 1.3 — Draft Save Verification

On any profile tab, type in a field without saving. Navigate to a different tab. Verify the amber bordered banner appears: `UNSAVED CHANGES IN [TAB NAME]` with `SAVE NOW` and `DISCARD` options.

Refresh the page. Verify the draft banner appears offering to restore the unsaved changes.

Click `SAVE NOW`. Verify the data saves and the banner disappears.

---

## ACT 2 — Doctor Registration & Onboarding

### 2.1 — Registration

Open a new incognito window. Navigate to `theralign.vercel.app/register`.

Select `Physiotherapist` from the role toggle. Verify the informational note appears below the toggle: `After registration, you will complete your professional profile and submit it for verification before appearing in patient searches.`

Fill in name, email, password. Submit.

**Verify:**
- User document created with `role: 'doctor'`
- JWT issued and stored
- Redirected to `/doctor/dashboard`
- Dashboard shows an onboarding banner: `Complete your profile to start accepting patients` with a `COMPLETE PROFILE SETUP →` button

**Fix if broken:**
- If the onboarding banner does not appear: check the dashboard mount logic — it should call `GET /api/doctors/profile/me` and if it returns 404 show the banner
- If redirect goes to wrong page: check role-based redirect in the login/register handler

### 2.2 — Multi-Phase Onboarding Form

Click `COMPLETE PROFILE SETUP →`. Verify it navigates to `/doctor/onboarding` or the onboarding modal opens.

Verify the four-phase step indicator renders at the top: `Personal Info → Clinic & Location → Professional Details → Documents`.

**Phase 1 — Personal Info:**
Fill in: full name (pre-filled from registration, editable), phone number, date of birth, gender. Upload a profile photo using the bordered square uploader. Verify the photo previews immediately inside the square after selection before the upload completes.

Click `NEXT →`.

**Verify:**
- Phase 1 fields validate before advancing — empty required fields show shake animation and red border
- Phase 1 data saves to localStorage draft
- The step indicator advances to Phase 2 with Phase 1 showing as completed (teal filled circle with checkmark)

**Phase 2 — Clinic & Location:**
Fill in: clinic name, full clinic address.

Click `USE MY LOCATION →`. Verify the browser location permission prompt appears. Grant permission.

**Verify:**
- Latitude and longitude fields populate automatically after permission is granted
- The coordinates are displayed as read-only fields showing real coordinate values
- If location is denied: an error message appears explaining how to enable location in browser settings — the form does not break

If location cannot be granted during testing, manually enter Pune coordinates: latitude `18.5204`, longitude `73.8567`.

Click `NEXT →`.

**Verify:**
- Clinic address and coordinates save to localStorage draft
- Phase 2 marked complete in step indicator

**Phase 3 — Professional Details:**
Fill in: specialization from the dropdown, years of experience, consultation fee in rupees, at least two qualifications as tags, languages, and a professional bio of at least 50 characters.

Click `NEXT →`.

**Verify:**
- All fields validate
- Character counter on bio textarea updates in real time
- Phase 3 marked complete

**Phase 4 — Documents:**
Upload at least one document — a JPG, PNG, or PDF. Verify the file appears in the uploaded documents list with its filename.

**Verify:**
- File uploads to Cloudinary successfully
- The Cloudinary URL is stored in `DoctorProfile.verificationDocuments` array — check in MongoDB Atlas
- Files over 10MB are rejected with a clear error message before upload starts
- The `SUBMIT FOR VERIFICATION →` button is active

Click `SUBMIT FOR VERIFICATION →`.

**Verify:**
- `POST /api/doctors/profile` creates a DoctorProfile document in MongoDB with `verificationStatus: 'pending'`
- The doctor is redirected to `/doctor/dashboard`
- The dashboard now shows a pending verification banner: `Your profile is under review. We'll notify you once approved.`
- The DoctorProfile document in Atlas has all submitted fields including the GeoJSON location point in the correct format: `{ type: 'Point', coordinates: [longitude, latitude] }` — longitude first

**Fix if broken:**
- If coordinates are stored as `[0, 0]`: the onboarding form is not sending latitude/longitude correctly in the POST body — add explicit `latitude` and `longitude` fields to the submission payload
- If `verificationDocuments` is empty: the document upload step is not completing before form submission — ensure upload resolves before the profile creation POST fires
- If the GeoJSON format is wrong: check `doctor.service.js` `createDoctorProfile` function — it must convert `latitude/longitude` to `{ type: 'Point', coordinates: [longitude, latitude] }`

### 2.3 — Draft Save During Onboarding

Go back to Phase 2. Type in the clinic name field. Navigate away from the onboarding form entirely.

Return to onboarding. Verify the draft banner appears: `You have a saved draft from your previous session` with `Continue` and `Start Fresh` options.

Click `Continue`. Verify the form restores to Phase 2 with the clinic name field populated and the step indicator showing Phase 1 as complete.

---

## ACT 3 — Admin Verification & Real-Time Doctor Approval

### 3.1 — Admin Sees Pending Application

In the original browser window (not incognito), log in using the demo admin quick-login button or manually with `admin@theralign.com` / `Admin@123456`.

Navigate to `/admin/doctors`.

**Verify:**
- The pending verification badge on the Doctors sidebar item shows a count of at least 1
- The `PENDING APPLICATIONS` section at the top of the page shows the newly registered doctor's card
- The card shows: doctor name, email, specialization, years of experience, and the date/time of application
- The `REVIEW` button is visible on the doctor's card

**Fix if broken:**
- If the doctor does not appear in pending: check `GET /api/admin/doctors/pending` — verify it filters `verificationStatus: 'pending'` and that the newly created DoctorProfile has this status
- If the pending badge count is wrong: check the badge fetch logic in `AdminLayout.jsx` — it calls `GET /api/admin/doctors/pending` with `limit: 1` and reads `total` from the response

### 3.2 — Admin Reviews and Approves

Click `REVIEW` on the pending doctor's card.

**Verify:**
- The doctor detail view opens showing all profile information: name, specialization, experience, fee, bio, clinic address, qualifications, languages
- The uploaded verification documents are visible as clickable links or thumbnails
- Clicking a document link opens the Cloudinary URL in a new tab and the document is viewable
- Two action buttons are visible: `APPROVE` and `REJECT`

Click `APPROVE`.

**Verify:**
- `PATCH /api/admin/doctors/:id/verify` is called with `{ action: 'verify' }`
- The response updates `verificationStatus` to `verified` in MongoDB — check in Atlas immediately
- The doctor's card moves out of the pending section in the UI
- A success toast appears: `Doctor has been verified and is now visible in listings`
- The pending badge count decrements by 1

**Fix if broken:**
- If the PATCH request fails: check the admin route middleware — `requireAuth` and `requireRole('admin')` must both pass
- If the status does not update in Atlas: check the `verifyDoctor` service function — it must call `profile.save()` after updating the status field

### 3.3 — Real-Time Notification to Doctor

Switch to the incognito window where the doctor is logged in.

**Verify within 30 seconds without manual page refresh:**
- The pending verification banner on the doctor dashboard changes to a verified confirmation banner: `Your profile has been verified. You are now visible to patients.`
- A notification appears in the notification bell — clicking it shows a notification: `VERIFICATION APPROVED · Your profile has been verified by our team`
- The notification bell badge count shows 1

This requires polling or WebSocket implementation. Verify which is implemented:

If polling: the doctor dashboard must poll `GET /api/doctors/profile/me` every `15` seconds. When `verificationStatus` changes from `pending` to `verified` the banner must update automatically.

If the banner does not update automatically: add a `15-second` polling interval on the doctor dashboard that re-fetches the profile status and updates the banner state accordingly. Use `setInterval` in a `useEffect` with cleanup on unmount.

**Fix if broken:**
- If polling is not implemented: add it now. In `DoctorDashboard.jsx` add:
```javascript
useEffect(() => {
  const interval = setInterval(async () => {
    const res = await getMyDoctorProfileAPI()
    if (res.data.profile.verificationStatus === 'verified') {
      setVerificationStatus('verified')
      clearInterval(interval)
    }
  }, 15000)
  return () => clearInterval(interval)
}, [])
```
- If the notification does not appear: check the notification creation logic — approving a doctor must create a Notification document for that doctor user

### 3.4 — Doctor Appears in Find Doctors and on Map

In the patient browser window navigate to `/doctors`.

**Verify without page reload:**
- The newly verified doctor appears in the doctor listing
- Their card shows: name, specialization, rating, fee, clinic name, verified badge
- If the patient enables `Near Me` and grants location permission: the doctor appears in nearby results with a distance badge showing their distance from the patient's location

**Verify the map specifically:**
Navigate to the Find Doctors page and enable the nearby doctors view or map view if implemented.

The doctor's clinic location must appear as a pin on the map. The pin coordinates must match the latitude and longitude submitted during onboarding.

**Verify in MongoDB Atlas:**
The doctor's DoctorProfile document must have:
```javascript
location: {
  type: 'Point',
  coordinates: [73.8567, 18.5204]  // or whatever was submitted
}
```
And `verificationStatus: 'verified'` and `isAvailable: true`.

**Fix if broken:**
- If doctor does not appear in listing: the discovery service query `{ verificationStatus: 'verified', isAvailable: true }` is not matching — verify the DoctorProfile fields match exactly
- If location pin is wrong or missing: the GeoJSON coordinates are stored incorrectly — re-check the coordinate format (longitude first)
- If nearby search returns no results: verify the `2dsphere` index exists on the `location` field in the `doctorprofiles` collection in Atlas

---

## ACT 4 — Appointment Booking Flow

### 4.1 — Patient Finds and Selects the New Doctor

In the patient browser window, navigate to `/doctors`.

Search for the newly verified doctor by name or filter by their specialization.

**Verify:**
- The doctor's card appears with correct information
- Clicking the card navigates to `/doctors/:id` — the doctor's public profile page
- The profile page shows: full name, specialization, bio, qualifications, clinic address, rating, fee, verified badge
- The `BOOK APPOINTMENT →` button is visible

### 4.2 — Slot Selection

Click `BOOK APPOINTMENT →`.

**Verify:**
- If not logged in as patient: redirected to `/login` with `state: { from: /doctors/:id }` — after login returns to the same doctor profile
- If logged in as patient: the booking interface opens — either a modal or an inline panel

The booking interface must show:
- A date picker starting from today, no past dates selectable
- Available time slots for the selected date based on the doctor's weekly schedule
- The consultation fee displayed clearly before confirmation

Select a date that falls on a day the doctor has enabled in their weekly schedule. Verify time slots appear for that date.

Select a time slot.

**Verify:**
- The selected slot is visually highlighted
- A booking summary shows: doctor name, date, time, fee breakdown (consultation fee, platform fee, total)
- A `CONFIRM & PAY →` button in coral accent is visible

**Fix if broken:**
- If no slots appear: check `GET /api/doctors/:doctorId/available-slots?date=YYYY-MM-DD` — it must generate slots from the doctor's WeeklySchedule and exclude already-booked slots
- If the date picker allows past dates: add `min={new Date().toISOString().split('T')[0]}` to the date input

### 4.3 — Payment Flow

Click `CONFIRM & PAY →`.

**Verify before payment modal opens:**
- An Appointment document is created in MongoDB with `status: 'pending'` and `paymentStatus: 'unpaid'`
- A Razorpay order is created via `POST /api/payments/create-order`
- The Razorpay checkout opens in the browser

In the Razorpay checkout, verify the test mode banner is visible on the payment modal showing: `TEST MODE — Use card 4111 1111 1111 1111`.

Enter test payment details:
```
Card number: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any 3 digits
Name: Any name
```

Complete the payment.

**Verify after payment:**
- `POST /api/payments/verify` is called with `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`
- The backend verifies the signature using: `crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(orderId + '|' + paymentId).digest('hex')`
- If signature matches: Payment document status updates to `paid`
- Appointment document status updates to `confirmed`
- `DoctorProfile.totalEarnings` increments by `consultationFee * 0.9`
- The patient sees a booking confirmation screen

**Verify the confirmation screen shows:**
- Confirmation number (last 8 characters of appointment ID)
- Doctor name and specialization
- Appointment date and time
- Amount paid with rupee symbol
- Razorpay payment ID
- A `DOWNLOAD RECEIPT →` button
- A `VIEW MY APPOINTMENTS →` button

**Fix if broken:**
- If signature verification fails: the most common cause is wrong string format — verify it is `orderId + "|" + paymentId` with a pipe character separator, no spaces
- If `RAZORPAY_KEY_SECRET` is wrong: check the Render environment variables — it must be the secret key not the key ID
- If the appointment status does not update: check the payment verification controller — it must update both the Payment and Appointment documents in the same transaction

### 4.4 — Receipt Download

Click `DOWNLOAD RECEIPT →`.

**Verify:**
- The browser's print dialog opens OR a PDF downloads
- The receipt content includes: `THERALIGN — BOOKING CONFIRMATION`, confirmation number, patient name, doctor name and specialization, appointment date and time, clinic name, fee breakdown, Razorpay payment ID, `Payment Status: CONFIRMED ✓`
- The receipt is generated entirely client-side from data already in the component state — no additional API call is made for receipt generation

**Fix if broken:**
- If the download button does nothing: implement client-side receipt using `window.print()` with a print-specific CSS class that hides all page elements except the receipt div
- If the receipt is missing data: ensure all required fields are stored in the component state after the payment verification response returns

### 4.5 — Email Confirmation

**Verify:**
- The patient receives a booking confirmation email to the email address used during registration
- The email contains: confirmation number, doctor name, appointment date and time, amount paid
- The email arrives within 2 minutes of payment completion

**Fix if broken:**
- If no email is received: check whether the email service (Nodemailer or SendGrid) is configured in the backend
- If the email service is not implemented: implement a basic Nodemailer setup using Gmail SMTP for the demo. Add `GMAIL_USER` and `GMAIL_APP_PASSWORD` to Render environment variables. Send the email inside the payment verification controller after successful payment, not as a separate endpoint. The email must be sent asynchronously — do not await it in the main response flow so a slow email send does not delay the payment confirmation response to the patient.

The email template must be plain HTML — no complex styling. It must render correctly in Gmail, Outlook, and Apple Mail. Use inline styles only. No external CSS files in email templates.

---

## ACT 5 — Doctor Appointment Management

### 5.1 — Doctor Sees the New Appointment

Switch to the incognito window where the doctor is logged in.

Navigate to `/doctor/appointments`.

**Verify without manual refresh:**
- The newly booked appointment appears in the doctor's appointment list
- The appointment card or row shows: patient name (first name and last initial only), appointment date, time, and status badge `CONFIRMED` in teal
- If the doctor dashboard has real-time polling: the appointment appears within 30 seconds without a refresh

**Verify the appointment detail shows:**
- Patient name
- Appointment date and time
- Session type (In-Person)
- Consultation fee the doctor will receive (fee minus 10% commission)
- A `MARK AS COMPLETED` button — only visible if the appointment date has passed OR always visible for demo purposes

**Fix if broken:**
- If the appointment does not appear: check `GET /api/appointments/mine` with doctor role — verify it filters appointments where `doctor === req.user.id` and `status === 'confirmed'`
- If patient full name is shown instead of first name + last initial: update the appointment query population to select only `name` from the patient User document and format it as `${firstName} ${lastName.charAt(0)}.` in the response

### 5.2 — Doctor Marks Appointment Complete

Click `MARK AS COMPLETED` on the appointment.

**Verify:**
- `PATCH /api/appointments/:id/status` is called with `{ status: 'completed' }`
- The backend verifies the requesting user is the doctor on this appointment before allowing the update
- The appointment status updates to `completed` in MongoDB
- The appointment row status badge changes from `CONFIRMED` teal to `COMPLETED` in the UI immediately
- A success toast appears: `Appointment marked as complete`

**Fix if broken:**
- If the PATCH request returns 403: the role check is too restrictive — the middleware must allow the doctor who owns the appointment to update its status, not just admin
- If the status does not update in the UI: the component must update local state after the successful API response — do not wait for a page refresh

---

## ACT 6 — Patient Review Flow

### 6.1 — Review Prompt Appears

Switch back to the patient browser window.

Navigate to `/patient/appointments`.

**Verify:**
- The completed appointment row shows a `RATE YOUR DOCTOR →` button
- This button appears because `appointment.status === 'completed'` AND `appointment.reviewSubmitted === false`
- No other appointment rows show this button unless they also meet both conditions

**Fix if broken:**
- If the button does not appear after the doctor marks complete: the patient appointments page is not re-fetching after the status change — add a polling interval of `15 seconds` on the patient appointments page that re-fetches appointments and checks for newly completed ones
- If the button appears on non-completed appointments: the condition check is wrong — fix the conditional render logic

### 6.2 — Star Rating Interaction

Click `RATE YOUR DOCTOR →`.

**Verify the review modal opens and shows:**
- The doctor's name and specialization at the top
- Five stars in a horizontal row, all outlined by default
- On hovering over star 3: stars 1, 2, and 3 fill with coral accent color `#F4845F`, stars 4 and 5 remain outlined
- On clicking star 3: the three filled stars change from coral to teal `#0B4F6C` indicating the rating is confirmed
- Hovering after clicking continues to show the teal confirmed stars — the click locks the selection
- An optional comment textarea below the stars
- `SUBMIT REVIEW →` accent button and `MAYBE LATER` ghost button

**Fix if broken:**
- If stars do not change on hover: the hover state logic is missing — each star needs an `onMouseEnter` handler that sets `hoverRating` state and the star fill condition must be `index <= (hoverRating || confirmedRating)`
- If clicking does not lock the selection: add a `confirmedRating` state separate from `hoverRating` — clicking sets `confirmedRating`, hovering sets `hoverRating`, display uses `hoverRating || confirmedRating`
- If the coral-to-teal color distinction is missing: confirmed stars use `#0B4F6C`, hover stars use `#F4845F`

### 6.3 — Review Submission

Select 5 stars. Add a comment. Click `SUBMIT REVIEW →`.

**Verify:**
- `POST /api/reviews` is called with `{ appointmentId, rating: 5, comment }`
- Backend validates: appointment exists, belongs to this patient, status is completed, reviewSubmitted is false
- Review document is created in MongoDB
- `appointment.reviewSubmitted` is set to `true`
- `DoctorProfile.reviewCount` increments by 1
- `DoctorProfile.rating` is recalculated as the average of all reviews for this doctor
- The modal closes
- The `RATE YOUR DOCTOR →` button is replaced with a `★ RATED` teal chip on the appointment row — no page refresh required, update local state

**Fix if broken:**
- If the review creates but rating does not update: check the review submission service — after creating the Review document it must recalculate and save the DoctorProfile rating
- If `reviewSubmitted` is not set to true: add `await Appointment.findByIdAndUpdate(appointmentId, { reviewSubmitted: true })` in the review creation service

### 6.4 — Rating Reflects on Doctor Profile

Navigate to the newly verified doctor's public profile at `/doctors/:id`.

**Verify:**
- The rating now shows `5.0` or the correct average if other reviews exist
- The review count shows `1 review` or the correct count
- The review appears in the reviews section of the profile with the patient's first name and last initial, the star rating, the comment, and the relative date

**Fix if broken:**
- If rating shows 0: the DoctorProfile rating field was not updated after review submission
- If the review does not appear on the profile: check `GET /api/discover/:id` — it must populate recent reviews from the Review collection

---

## ACT 7 — Admin Real-Time Dashboard Update

### 7.1 — Metrics Update After Booking

Switch to the admin browser window. Navigate to `/admin/dashboard`.

**Verify the metric cards show updated numbers reflecting the new booking:**
- `TOTAL APPOINTMENTS` has incremented by 1
- `TOTAL REVENUE` has incremented by the consultation fee amount
- `PLATFORM COMMISSION` has incremented by 10% of the fee
- `DOCTOR PAYOUTS` has incremented by 90% of the fee
- `TOTAL REVIEWS` has incremented by 1

These updates must appear within 30 seconds without a manual refresh — the admin dashboard polls `GET /api/admin/analytics/overview` every 30 seconds.

**Fix if broken:**
- If polling is not implemented: add a `30-second` interval in `AdminDashboard.jsx` that re-fetches the overview and updates metric card values
- If numbers are stale: the analytics aggregation must query live data — verify no caching layer is returning old results

### 7.2 — Recent Activity Feed Shows the Events

On the admin dashboard, verify the recent activity feed shows:
- The doctor registration event
- The verification approval event
- The patient booking event
- The payment completion event
- The review submission event

All five events should appear in reverse chronological order.

**Fix if broken:**
- If events are missing: check `getRecentActivity` in `analytics.service.js` — it merges events from Appointment, User, Payment, and Review collections. Verify each collection is being queried and the results are sorted by `createdAt: -1`

---

## ACT 8 — Notification System Audit

### 8.1 — Verify All Notification Types

Verify the following notifications are created and delivered to the correct user:

**Doctor receives:**
- `VERIFICATION APPROVED` — when admin approves their profile
- `NEW APPOINTMENT` — when a patient books with them
- `APPOINTMENT COMPLETED` — confirmation when they mark an appointment complete

**Patient receives:**
- `BOOKING CONFIRMED` — after successful payment
- `REVIEW REMINDER` — when their appointment is marked complete by the doctor

**Admin receives:**
- `NEW DOCTOR APPLICATION` — when a doctor submits their profile for verification

**Verify for each notification:**
- The notification bell badge count increments
- The notification appears in the dropdown with correct icon, title, category label, and timestamp
- Clicking the notification navigates to the relevant page
- The notification is marked as read after clicking
- Read notifications do not show the left border accent
- All notifications auto-dismiss from the bell dropdown after being read — they do not accumulate indefinitely

### 8.2 — Toast Notifications

Verify across the entire flow that:
- Success toasts auto-dismiss after exactly 4 seconds
- Error toasts require manual dismissal — they do not auto-dismiss
- No toast stacks more than 3 deep — if a 4th toast fires while 3 are showing, the oldest dismisses first
- Toast slide animation is `150ms` from bottom-right

---

## ACT 9 — Edge Cases and Failure Recovery

### 9.1 — Duplicate Booking Prevention

As the same patient, attempt to book the same doctor for the same date and time slot that is already confirmed.

**Verify:**
- The time slot appears as unavailable (grayed out or hidden) in the slot picker
- If the slot somehow reaches the backend: `POST /api/bookings` returns `409 Conflict` with message `This slot is already booked`
- The patient sees a clear error message — not a generic 500 error

### 9.2 — Payment Failure Recovery

Initiate a booking but cancel the Razorpay checkout without completing payment.

**Verify:**
- The Appointment document created with `status: 'pending'` before the Razorpay checkout opened either stays as `pending` or is deleted after the checkout is cancelled
- The patient sees a message: `Payment was not completed. Your booking has not been confirmed.`
- The patient can try booking again — the slot is still available since no payment was completed

### 9.3 — Doctor Profile Edit After Verification

As the verified doctor, navigate to `/doctor/profile` and update the consultation fee.

**Verify:**
- `PUT /api/doctors/profile/me` accepts the updated fee
- The `verificationStatus` field does not change — it stays `verified`
- The updated fee appears immediately on the doctor's public profile at `/doctors/:id`
- The updated fee appears in the slot picker when a patient next views booking options

### 9.4 — Admin Cannot Be Deactivated

As admin, navigate to `/admin/users`. Find the admin account.

**Verify:**
- No `DEACTIVATE` button appears on the admin account row
- Attempting `PATCH /api/admin/users/:adminId/status` via direct API call returns `403 Forbidden` with message `Cannot deactivate admin accounts`

### 9.5 — Password Reset Flow

On the login page click `Forgot Password?`.

Enter the patient's registered email. Submit.

**Verify:**
- The reset token appears in the response (demo behavior — production would send an email)
- Copy the token
- Enter the token and a new password in the reset form
- Submit
- Verify `Password updated. You can now log in.` message appears
- Log in with the new password — verify it works
- Log in with the old password — verify it fails

---

## Final Production Checklist

After completing all 9 acts verify these global conditions:

**Performance:**
- [ ] Every page loads in under 3 seconds on the production URL
- [ ] No API call takes more than 2 seconds — check the browser Network tab
- [ ] The Render dyno does not cold-start during the demo — keep it warm by hitting `/api/health` every 14 minutes using a cron job or UptimeRobot

**Environment:**
- [ ] All environment variables are set correctly on Render and Vercel — list every one and confirm
- [ ] `NODE_ENV=production` on Render
- [ ] Razorpay is in test mode — key ID starts with `rzp_test_`
- [ ] CORS allows requests from the exact Vercel URL — no trailing slash mismatch

**Data:**
- [ ] At least 10 seeded verified doctors are visible in Find Doctors
- [ ] At least 30 historical appointments exist in the database for analytics
- [ ] The admin overview metrics show non-zero values for all cards
- [ ] The revenue chart shows data points across 30 days

**Demo accounts:**
- [ ] Demo quick-login buttons work for all three roles
- [ ] Patient demo account has a complete profile
- [ ] Doctor demo account is verified with a weekly schedule set
- [ ] Admin account can log in and see the full dashboard

**Browser:**
- [ ] Test the entire flow in Chrome — this is the demo browser
- [ ] No console errors on any page
- [ ] No failed network requests in the Network tab
- [ ] localStorage is cleared between demo runs — add a `RESET DEMO` button on the admin dashboard that clears demo-specific data if needed

---

## What A Perfect Demo Run Looks Like

You open the website. You click `LOGIN AS PATIENT`. The patient dashboard loads in under 2 seconds. You navigate to Find Doctors. You show the seeded doctors with their ratings and distances. You search by symptom using the AI search box. You click a doctor. You book and pay in under 60 seconds. You download the receipt. You switch to the doctor account using the demo quick-login. The appointment is already there. You mark it complete. You switch back to patient. The rate button appears. You give 5 stars. You switch to admin. The metrics have updated. The whole flow took under 10 minutes and nothing broke.

That is the goal. Every fix in this prompt exists to make that run possible.