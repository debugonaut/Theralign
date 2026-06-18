# Theralign Chatbot Knowledge Base

This document contains the role-aware questions, answers, redirect routes, gap analysis, and quick-reply configurations for the Theralign Chatbot system.

---

## 1. Role-Aware Question Bank

### GUEST (Not Logged In)

#### Category: What is Theralign?
ROLE: guest
Q: What is Theralign?
A: Theralign is a curated marketplace that connects patients with verified physiotherapy professionals across India for discovery, booking, and post-session care.
ROUTE: /

ROLE: guest
Q: Who is Theralign built for?
A: It is built for patients seeking physical rehabilitation (sports injuries, post-surgery, back pain, pediatric, neurological, geriatric conditions) and practitioners wanting to manage their clinic and prescriptions.
ROUTE: /

ROLE: guest
Q: How do I contact Theralign?
A: You can reach our support team through the Help Center page or check our FAQs.
ROUTE: /help

ROLE: guest
Q: Is there a mobile app?
A: Theralign is a fully responsive web application optimized for both mobile and desktop browsers.
ROUTE: /

#### Category: How does doctor verification work?
ROLE: guest
Q: Are the physiotherapists on the platform qualified?
A: Yes, every doctor goes through a strict verification process where the admin reviews their credentials, licenses, and experience documents before they can list public profiles.
ROUTE: /standards

ROLE: guest
Q: What is the "Verified" badge?
A: A badge displayed on doctor profiles indicating that the Theralign administrative team has checked their registration certificates and clinical licenses.
ROUTE: /standards

ROLE: guest
Q: How long does it take for a doctor to get verified?
A: The verification process typically takes 24 to 48 hours after submitting the complete documentation.
ROUTE: /standards

#### Category: Is my payment secure?
ROLE: guest
Q: How does Theralign handle payments?
A: All payments are securely processed through Razorpay using industry-standard cryptographic validation. We do not store your credit card information.
ROUTE: /refund

ROLE: guest
Q: Can I pay at the clinic directly?
A: All appointments must be prepaid online to secure the slot and automate booking records.
ROUTE: /pricing

ROLE: guest
Q: Will I receive an invoice/receipt for my payment?
A: Yes, once payment is verified, a receipt is automatically generated and can be downloaded from your profile dashboard.
ROUTE: /refund

#### Category: What specialisations are available?
ROLE: guest
Q: What kind of physiotherapists can I find here?
A: You can search for specialists in Orthopedic, Sports, Neurological, Pediatric, Geriatric, Cardiopulmonary, Postural/Spinal Rehab, and Women's Health.
ROUTE: /doctors

ROLE: guest
Q: How do I find a sports physiotherapist?
A: Go to the Find Doctors page and filter by the "Sports Physiotherapy" specialization.
ROUTE: /doctors

ROLE: guest
Q: Do you support pediatric physiotherapy?
A: Yes, we list specialized pediatric physiotherapists who treat developmental disorders and pediatric injuries.
ROUTE: /doctors

ROLE: guest
Q: Can I search for neurological rehabilitation?
A: Yes, search for "Neurological Physiotherapy" to find experts in stroke rehabilitation, Parkinson's, and other neurological conditions.
ROUTE: /doctors

#### Category: How do I register as a patient vs a doctor?
ROLE: guest
Q: How do I sign up as a patient?
A: Go to the Register page, choose the "Patient" role, and fill out your details.
ROUTE: /register

ROLE: guest
Q: How do I sign up as a doctor?
A: Go to the Register page, select the "Doctor" role, and fill out the onboarding application form.
ROUTE: /register

ROLE: guest
Q: Can I register a junior doctor under my clinic?
A: Yes, senior doctors can invite subordinate junior doctors using the register junior link or from their practice management panel.
ROUTE: /register/junior

ROLE: guest
Q: Is registration free?
A: Yes, creating a basic account as a patient or doctor is completely free.
ROUTE: /register

ROLE: guest
Q: What do I need to register as a doctor?
A: You need to submit your professional qualifications, clinic address, government registration license, and medical credentials.
ROUTE: /register

#### Category: Cancellation policy
ROLE: guest
Q: What is your refund policy for cancellations?
A: Patient-initiated cancellations are subject to review and require admin approval. Doctor-initiated cancellations are automatically approved and refunded immediately.
ROUTE: /refund

ROLE: guest
Q: How long do refunds take?
A: Approved refunds are processed via Razorpay and typically reflect in your account within 5-7 business days.
ROUTE: /refund

ROLE: guest
Q: Is there a cancellation fee?
A: No cancellation fees are charged, but cancellations must be requested prior to the appointment slot time.
ROUTE: /refund

ROLE: guest
Q: How do I request a cancellation?
A: If you are logged in, go to your Appointments page, click the specific appointment, and select "Request Cancellation".
ROUTE: /refund

ROLE: guest
Q: What happens if a doctor cancels my session?
A: You will be notified instantly via email/in-app, and your payment will be refunded to your original payment source.
ROUTE: /refund

ROLE: guest
Q: Can I reschedule an appointment?
A: We currently do not support direct rescheduling; you must cancel the booking and book a new slot.
ROUTE: /refund

---

### PATIENT

#### Category: Booking flow questions
ROLE: patient
Q: How do I book a session with a physiotherapist?
A: Browse verified doctors, click on a profile, select an available date and time slot, and click "Book Now".
ROUTE: /doctors

ROLE: patient
Q: What is the "slot-locking" system?
A: To prevent double-booking, the slot you choose is temporarily locked at the database level for you during checkout.
ROUTE: /doctors

ROLE: patient
Q: Can I book multiple slots at once?
A: Currently, slots must be booked individually to ensure accurate payment and tracking.
ROUTE: /doctors

ROLE: patient
Q: How do I check if my booking was successful?
A: Navigate to your Appointments dashboard to see all booked sessions and their current status.
ROUTE: /patient/appointments

#### Category: Rescheduling and cancellation
ROLE: patient
Q: How do I cancel my booked appointment?
A: Go to your Appointments page, select the active appointment, and click "Request Cancellation".
ROUTE: /patient/appointments

ROLE: patient
Q: Can I cancel a completed appointment?
A: No, completed appointments cannot be canceled or refunded.
ROUTE: /patient/appointments

ROLE: patient
Q: Where can I check the status of my refund request?
A: Check the Payments tab on your dashboard or review the specific appointment detail page.
ROUTE: /patient/payments

#### Category: Payment and receipts
ROLE: patient
Q: Where can I download my payment receipts?
A: Go to your Payments page, locate the transaction, and click the download button to save the receipt.
ROUTE: /patient/payments

ROLE: patient
Q: Which payment modes are supported?
A: We support cards, UPI, net banking, and wallets via Razorpay.
ROUTE: /patient/payments

ROLE: patient
Q: Does the fee change after booking?
A: No, the consultation fee is snapshotted at the time of booking. Any subsequent fee adjustments by the doctor will not affect your booked sessions.
ROUTE: /patient/payments

#### Category: Session records and care timeline
ROLE: patient
Q: Where can I see my medical session records?
A: All notes, prescriptions, and updates shared by your therapist are displayed in your Care Timeline.
ROUTE: /patient/care-timeline

ROLE: patient
Q: Can my doctor see my private medical history?
A: Your private medical history entered in your profile settings is kept private and secure, and is not shared with doctors.
ROUTE: /patient/profile

ROLE: patient
Q: How do I print my prescription?
A: Go to the Care Timeline, find the prescription card, and click the "Print" or "Download PDF" option.
ROUTE: /patient/care-timeline

#### Category: Viewing follow-up recommendations
ROLE: patient
Q: Where do I check when my next session is recommended?
A: Your doctor's follow-up recommendations are shown at the end of each session record in your timeline.
ROUTE: /patient/care-timeline

ROLE: patient
Q: How do I know if the doctor has written my notes?
A: You will receive an in-app notification when the doctor publishes and signs off on your session record.
ROUTE: /patient/care-timeline

#### Category: Exercise prescriptions and compliance
ROLE: patient
Q: How do I access my assigned home exercises?
A: Navigate to your Care Timeline to view your active exercise prescriptions, including sets, reps, and steps.
ROUTE: /patient/care-timeline

ROLE: patient
Q: Where can I watch demonstrations for my exercises?
A: Each exercise card contains a link to search for a video demonstration on YouTube.
ROUTE: /patient/care-timeline

ROLE: patient
Q: How do I report my exercise progress to the doctor?
A: You can log your feedback or pain scores directly inside the exercise timeline under the prescription.
ROUTE: /patient/care-timeline

#### Category: Finding the right specialisation (trigger symptom triage here)
ROLE: patient
Q: How do I know which specialist to book?
A: Use our AI Symptom Triage tool. Describe what hurts in plain language, and the AI will recommend the correct specialization.
ROUTE: /doctors

ROLE: patient
Q: What is the AI Symptom Triage?
A: A feature that maps your described pain (e.g. back pain, knee issues) to target physiotherapy specialties.
ROUTE: /doctors

ROLE: patient
Q: Can the AI diagnose my medical condition?
A: No, the AI tool provides information for specialization routing only. It does not provide medical diagnoses.
ROUTE: /doctors

#### Category: Profile and account settings
ROLE: patient
Q: How do I update my profile picture?
A: Go to your Profile settings page and click on the avatar circle to upload a photo.
ROUTE: /patient/profile

ROLE: patient
Q: How do I add my contact number?
A: Update your profile page under personal details. Phone numbers are formatted using standard Indian formatting.
ROUTE: /patient/profile

ROLE: patient
Q: Can I change my registered email?
A: Your registered email is your unique login ID and cannot be changed directly. Please contact support.
ROUTE: /patient/profile

#### Category: How to upload pre-booking media
ROLE: patient
Q: How do I upload my MRI or X-ray reports before my appointment?
A: Go to your Appointment details page, scroll to the Pre-Appointment Media section, and upload your files (images, audio, or video).
ROUTE: /patient/appointments

ROLE: patient
Q: What file formats are supported for media uploads?
A: You can upload image (PNG, JPG), video (MP4), or audio (MP3/WAV) files.
ROUTE: /patient/appointments

ROLE: patient
Q: Is there a limit on how many files I can upload?
A: Yes, each appointment has a file count limit (maximum 5 files) to optimize cloud storage.
ROUTE: /patient/appointments

ROLE: patient
Q: Can the doctor see the media I upload?
A: Yes, the doctor can access and view all media files uploaded to the specific appointment details dashboard.
ROUTE: /patient/appointments

ROLE: patient
Q: Can I delete a media file I uploaded?
A: Yes, you can delete your uploaded media from the appointment media section as long as the session is not completed.
ROUTE: /patient/appointments

ROLE: patient
Q: Are my uploaded medical reports secure?
A: Yes, files are stored securely in Cloudinary and only accessible to the patient, doctor, and platform admins.
ROUTE: /patient/appointments

---

### DOCTOR (Physio)

#### Category: Verification and onboarding
ROLE: doctor
Q: How do I submit my verification documents?
A: On first login, you will be directed to the onboarding flow where you can upload credentials and verify your clinical details.
ROUTE: /doctor/profile

ROLE: doctor
Q: What happens if my profile application is rejected?
A: You will receive an email and notification with the admin feedback. You can revise your details and resubmit.
ROUTE: /doctor/profile

ROLE: doctor
Q: Can I edit my bio after verification?
A: Yes, you can edit your bio in profile settings. A new AI summary will be compiled by admins if needed.
ROUTE: /doctor/profile

#### Category: Managing availability slots
ROLE: doctor
Q: How do I create new availability slots?
A: Go to the Availability page, select a date and time, and click "Create Slot".
ROUTE: /doctor/availability

ROLE: doctor
Q: Can I delete an availability slot?
A: Yes, you can delete any slot as long as it has not been booked by a patient.
ROUTE: /doctor/availability

ROLE: doctor
Q: How do I edit slot times?
A: Go to your availability dashboard, locate the slot, click edit, and input the new timing.
ROUTE: /doctor/availability

#### Category: Viewing and managing bookings
ROLE: doctor
Q: Where do I see my scheduled patient appointments?
A: Navigate to the Doctor Appointments tab to view your complete schedule.
ROUTE: /doctor/appointments

ROLE: doctor
Q: How do I mark an appointment as completed?
A: Open the active appointment card on your dashboard and click "Mark Completed" once the session is done.
ROUTE: /doctor/appointments

ROLE: doctor
Q: Can I cancel a patient appointment?
A: Yes. If you cancel, the system automatically triggers an immediate refund to the patient.
ROUTE: /doctor/appointments

#### Category: Session notes and records
ROLE: doctor
Q: How do I write session notes for a completed appointment?
A: Go to your appointments page, click "Create Session Record" on the completed appointment, and fill out the details.
ROUTE: /doctor/appointments

ROLE: doctor
Q: Can I edit a session record after signing off?
A: You can edit signed-off notes only within a strict 24-hour window. After 24 hours, the record is locked.
ROUTE: /doctor/appointments

ROLE: doctor
Q: How do I share session notes with the patient?
A: Turn on the "Share with Patient" toggle in the session record form and sign the document.
ROUTE: /doctor/appointments

#### Category: Prescribing exercises to patients
ROLE: doctor
Q: How do I prescribe exercises in session notes?
A: Use the visual exercise library or the AI Exercise Creator inside the session record form.
ROUTE: /doctor/appointments

ROLE: doctor
Q: What is the AI Exercise Creator?
A: A doctor-only tool powered by Llama 3.1 8B that generates structured clinical exercises from natural language prompts.
ROUTE: /doctor/appointments

ROLE: doctor
Q: Where are custom exercises saved?
A: Custom exercises you generate are saved in your local browser storage for easy access.
ROUTE: /doctor/appointments

#### Category: Viewing patient adherence/compliance data
ROLE: doctor
Q: Can I see if the patient is doing their exercises?
A: Yes, check the patient's care record history in your dashboard to view logged exercise compliance and pain feedback.
ROUTE: /doctor/appointments

ROLE: doctor
Q: Can I modify an active exercise plan?
A: You can update the prescription by creating a new session record or editing the active record (if within 24 hours).
ROUTE: /doctor/appointments

#### Category: Earnings and payment history
ROLE: doctor
Q: How do I view my platform earnings?
A: Navigate to the Doctor Earnings page to view your total payouts and revenue history.
ROUTE: /doctor/earnings

ROLE: doctor
Q: What is the platform commission rate?
A: The platform charges a flat 10% commission on all bookings. You receive 90% of your consultation fee.
ROUTE: /doctor/earnings

ROLE: doctor
Q: How do I check if a patient has paid?
A: Only paid and confirmed bookings appear on your calendar. Payment receipts are attached to the appointments.
ROUTE: /doctor/earnings

#### Category: Managing junior doctor associations
ROLE: doctor
Q: How do I invite a junior doctor to my clinic?
A: Open the Practice Management page and send an invitation using the junior doctor's email.
ROUTE: /doctor/practice

ROLE: doctor
Q: What roles do junior doctors have?
A: Junior doctors can manage appointments and session records, but cannot edit consultation fees or billing info.
ROUTE: /doctor/practice

ROLE: doctor
Q: Do junior doctors require admin verification?
A: Junior doctors invited by verified senior clinics automatically bypass the admin verification queue.
ROUTE: /doctor/practice

ROLE: doctor
Q: Can I remove a junior doctor from my team?
A: Yes, you can delete a junior doctor profile from your team list on the Practice Management page.
ROUTE: /doctor/practice

ROLE: doctor
Q: Can a junior doctor run their own clinic?
A: Junior doctors are associated with a supervising senior clinic and operate under that clinic's license.
ROUTE: /doctor/practice

#### Category: Profile visibility and ratings
ROLE: doctor
Q: How do I improve my profile ratings?
A: Ratings are calculated as an average of verified reviews submitted by patients after completed sessions.
ROUTE: /doctor/reviews

ROLE: doctor
Q: Can I hide a negative review?
A: Reviews cannot be hidden by doctors. Only admin can moderate reviews that violate platform policies.
ROUTE: /doctor/reviews

ROLE: doctor
Q: How do I update my profile languages?
A: Go to your profile settings and add or remove languages from your profile criteria.
ROUTE: /doctor/profile

ROLE: doctor
Q: Can junior doctors get reviews?
A: Yes, patients can review the junior doctor who performed the treatment session.
ROUTE: /doctor/reviews

ROLE: doctor
Q: Where is my clinic address displayed?
A: Your clinic details and geospatial coordinates are displayed on your public profile.
ROUTE: /doctor/profile

---

### ADMIN

#### Category: Verifying doctor applications
ROLE: admin
Q: Where do I verify pending doctor applications?
A: Go to the Doctor Verification tab on the admin sidebar to view credentials of pending practitioners.
ROUTE: /admin/doctors

ROLE: admin
Q: How do I review a doctor's certificates?
A: Click on the pending doctor profile to view and download their verification PDFs.
ROUTE: /admin/doctors

ROLE: admin
Q: How do I reject a doctor registration?
A: Click "Reject" on the doctor detail view. You must provide a rejection note explaining what needs to be fixed.
ROUTE: /admin/doctors

ROLE: admin
Q: Can I suspend a verified doctor?
A: Yes, admins can click "Suspend" on any doctor profile to temporarily block them from search and booking.
ROUTE: /admin/doctors

ROLE: admin
Q: How do I move a rejected doctor back to pending?
A: Use the "Reconsider" action on the doctor's details to restore their profile to the review list.
ROUTE: /admin/doctors

#### Category: Platform analytics overview
ROLE: admin
Q: Where can I see total platform revenue?
A: View the Analytics or Revenue dashboard for a visual breakdown of commissions, payouts, and earnings.
ROUTE: /admin/analytics

ROLE: admin
Q: Is revenue analytics calculated in real-time?
A: Yes, the revenue metrics reflect real-time aggregations from captured payments.
ROUTE: /admin/analytics

ROLE: admin
Q: Where can I see active booking status ratios?
A: The Admin Analytics dashboard displays a donut chart of appointments (Booked, Completed, Cancelled).
ROUTE: /admin/analytics

ROLE: admin
Q: How do I check the top-performing doctors?
A: Go to the Analytics page and view the "Top performing doctor statistics" list.
ROUTE: /admin/analytics

#### Category: Managing users
ROLE: admin
Q: How do I view all registered patients on the platform?
A: Open the Admin Users panel and filter by the "Patient" role.
ROUTE: /admin/users

ROLE: admin
Q: Can I suspend a patient account?
A: Yes, admins can toggle the status of any user (Active/Inactive) from the user management screen.
ROUTE: /admin/users

ROLE: admin
Q: How do I view doctor details from user list?
A: Click on the user row to navigate directly to their detailed professional profile view.
ROUTE: /admin/doctors

#### Category: Flagged content or disputes
ROLE: admin
Q: How do I manage review visibility?
A: Go to the Admin Reviews panel. You can toggle the visibility of individual reviews on/off.
ROUTE: /admin/reviews

ROLE: admin
Q: Where do I manage patient refund requests?
A: Open the Refund queue under Admin Refunds to review, approve, or reject pending requests.
ROUTE: /admin/refunds

ROLE: admin
Q: What happens when I approve a refund?
A: The system automatically calls Razorpay to process the refund and returns the payment to the patient's original source.
ROUTE: /admin/refunds

ROLE: admin
Q: Can I reject a refund without feedback?
A: No, the system requires an explanation note to process a refund rejection.
ROUTE: /admin/refunds

ROLE: admin
Q: What is the commission fee snapshot?
A: Commission rates are snapshotted at booking time, protecting historical platform metrics from subsequent plan pricing modifications.
ROUTE: /admin/revenue

ROLE: admin
Q: How do I run batch doctor summaries?
A: Go to the AI tools page and click "Batch Generate Summaries" to compile bios for verified doctors.
ROUTE: /admin/ai-tools

ROLE: admin
Q: Where can I check recent activity audits?
A: Review the recent activity log feed at the bottom of the Admin Dashboard.
ROUTE: /admin/dashboard

ROLE: admin
Q: Can admins bypass Razorpay signature verification?
A: No, signature verification is hard-coded at the webhook controller level to prevent payment tampering.
ROUTE: /admin/revenue

---

## 2. Gap List (High-Value Hidden Features)

The following Theralign features are present in the backend endpoints and schema constraints but may not be immediately obvious to new users without chatbot intervention:

1. **Atomic Slot-Locking during checkout**: Users might wonder why a slot disappears if they take too long to pay. The system automatically locks it at the database level using `findOneAndUpdate` (`isBooked: false` check), and unlocks it if the payment fails or checkout expires.
2. **Session notes edit lock (24-hour compliance rule)**: Doctors might expect to be able to edit patient session records indefinitely. However, the system enforces a strict 24-hour compliance lock window from the `doctorSignedAt` time.
3. **Junior Doctor auto-verification**: Senior doctors might not know that inviting a junior doctor automatically verifies them, bypassing the standard admin verification queue and inheriting verified status.
4. **Junior doctor billing restrictions**: Junior doctors might be confused as to why they cannot configure consultation fees or view system-wide earnings. These controls are restricted by the senior doctor hierarchy.
5. **Consultation fee snapshotting (ADR-004)**: Changing a doctor's fee in their profile does not change active booking fees. Fees are snapshotted to the `Appointment` collection at booking time to preserve transaction records.
6. **Refund approval routing differences**: Doctor-initiated cancellations automatically trigger a Razorpay refund instantly, while patient-initiated cancellation requests are routed to the admin queue for human review.
7. **Pre-Appointment Media upload limits**: Each appointment has a count limit (maximum of 5 files) to protect server assets, which may confuse users trying to upload folder loads of historic scans.
8. **Waitlist Join Idempotency**: Joining a doctor's waitlist is idempotent at the database level. If a patient attempts to join a waitlist they are already on, the system responds with success without duplicating entries.

---

## 3. Quick-Reply Chips configuration

Below is the suggested set of 6 quick-reply chips per role to show when the chat first opens:

### GUEST (Not Logged In)
1. What is Theralign?
2. How does doctor verification work?
3. How do I register as a patient?
4. How do I register as a doctor?
5. What specialisations do you support?
6. What is the cancellation policy?

### PATIENT
1. How do I book an appointment?
2. I want to check my symptoms (AI)
3. Where are my exercise plans?
4. How do I cancel my booking?
5. Where do I find my payment receipt?
6. How do I upload medical reports?

### DOCTOR (Physio)
1. How do I set my availability?
2. How do I create patient notes?
3. How do I use the AI Exercise Creator?
4. How do I invite a junior doctor?
5. Where can I see my earnings?
6. How do I review patient feedback?

### ADMIN
1. Show pending doctor verifications
2. Check pending refund requests
3. Generate doctor AI summaries
4. View platform revenue stats
5. Manage flagged review posts
6. Suspend or block a user account
