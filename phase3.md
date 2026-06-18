# PhysioConnect — Phase 3 Complete Prompt Set
## Doctor Onboarding, File Uploads & Profile Verification

---

# PROMPT 3.1 — DoctorProfile Model & Geospatial Indexing

## Objective
Design and implement the complete Mongoose `DoctorProfile` model that stores professional credentials, clinic details, and verification status for physiotherapists on the platform. The schema must support geospatial indexing on the clinic's physical coordinates to enable proximity-based search in Phase 4.

## Architecture Reasoning
A physiotherapist's profile is decoupled from the `User` model to keep the authentication core lightweight. The `DoctorProfile` schema references the `User` model via a one-to-one relationship.

Geospatial proximity search is a core value proposition of Theralign. Storing clinic coordinates using MongoDB's standardized GeoJSON format allows us to use `$near` or `$geoWithin` operators to find nearby physiotherapists. Mongoose requires a specific structure for GeoJSON points: a sub-document containing `type: { type: String, enum: ['Point'], required: true }` and `coordinates: { type: [Number], required: true }`. Remember that MongoDB GeoJSON coordinates are in `[longitude, latitude]` order—swapping these is a common bug.

## Implementation Scope Boundaries
- Implement `models/DoctorProfile.model.js` completely
- Configure geospatial index on the clinic location field
- Configure indexes on verification status and experience
- Do NOT implement controllers, services, or file uploads yet
- Reference the User model and `DOCTOR_STATUS` constants from Phase 1

## Exact Schema Specification

```javascript
DoctorProfile Schema Fields:

user:
  type: Schema.Types.ObjectId
  ref: 'User'
  required: true
  unique: true            ← Enforces 1-to-1 doctor-profile relationship

specialization:
  type: [String]          ← Array of strings (e.g., ['Sports Injury', 'Orthopedic'])
  required: true
  validate: min 1 specialization

experience:
  type: Number
  required: true
  min: 0

clinicName:
  type: String
  required: true
  trim: true

clinicAddress:
  type: String
  required: true
  trim: true

clinicLocation:
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],       ← [longitude, latitude]
    required: true
  }

consultationFee:
  type: Number
  required: true
  min: 0

bio:
  type: String
  required: true
  minLength: 50
  maxLength: 1000

registrationNumber:
  type: String
  required: true
  unique: true            ← Medical license registration number

degreeDocument:
  type: String            ← Cloudinary URL for degree PDF/Image
  required: true

licenseDocument:
  type: String            ← Cloudinary URL for medical license PDF/Image
  required: true

verificationStatus:
  type: String
  enum: [DOCTOR_STATUS.PENDING, DOCTOR_STATUS.VERIFIED, DOCTOR_STATUS.REJECTED]
  default: DOCTOR_STATUS.PENDING
  required: true

rejectionReason:
  type: String
  default: null           ← Set when verificationStatus is rejected

averageRating:
  type: Number
  default: 0
  min: 0
  max: 5

totalReviews:
  type: Number
  default: 0
  min: 0

timestamps: true
```

## Index Configuration
```javascript
clinicLocation: '2dsphere' ← CRITICAL: required for geospatial queries
verificationStatus: 1      ← Index for filtering verified listings in searches
experience: -1            ← Frequently used in ordering/sorting listings
```

## Validation Checkpoints
- [ ] Attempting to create a profile for a non-existent `User` ID throws Mongoose ValidationError
- [ ] Registering two doctor profiles with the same `registrationNumber` throws duplicate key error
- [ ] Attempting to set `clinicLocation.coordinates` as `[latitude, longitude]` runs, but fails proximity validation if coordinates are out of bounds (lat must be between -90 and 90, lng between -180 and 180)
- [ ] `verificationStatus` default is successfully set to `'pending'`
- [ ] `clinicLocation` is successfully indexed as a `2dsphere` index (verify using `db.doctorprofiles.getIndexes()` in MongoDB shell/compass)

## Common Mistakes to Avoid
- **Do NOT** forget to set the index on `clinicLocation` as `2dsphere`. Without this, geospatial queries will fail at runtime.
- **Do NOT** swap longitude and latitude in GeoJSON coordinates. In GeoJSON, longitude always comes first.
- **Do NOT** allow duplicate profiles for the same user. Enforce this using `unique: true` on the `user` reference field.

## Interview Explanation Points
- "I modeled `clinicLocation` using GeoJSON format and created a `2dsphere` index because proximity-based discovery is a core feature. GeoJSON coordinates must be structured as `[longitude, latitude]`, which is the industry standard for mapping APIs."
- "The doctor's profile is separated from the `User` document because it contains domain-specific details that are irrelevant to auth. Decoupling them keeps the `User` collection clean, fast, and optimized for session retrieval."

---

# PROMPT 3.2 — Multer & Cloudinary File Upload Infrastructure

## Objective
Configure the file upload pipeline on the backend. Implement `config/cloudinary.js` to initialize the Cloudinary SDK, and create `middleware/upload.middleware.js` using `multer` to handle multi-part form-data, filter incoming files by mime type, enforce file size limits, and securely stream files to Cloudinary.

## Architecture Reasoning
Doctors must upload proof of qualifications (degrees, medical licenses) and profile pictures during onboarding. Since our server will be deployed on Render (which uses ephemeral filesystems that discard files on restart), we cannot store these documents locally. They must be uploaded to Cloudinary, a robust cloud storage service.

To avoid clogging server disk space, files are parsed from the incoming request using `multer` and temporarily stored in a local `/tmp` folder inside the workspace before being sent to Cloudinary. Once the upload is successful, the local temporary file is immediately deleted using Node's `fs.promises.unlink()` to prevent disk leakage.

## Implementation Scope Boundaries
- Configure Cloudinary client in `config/cloudinary.js`
- Implement `middleware/upload.middleware.js` with file size and type filters
- Implement an upload service `services/upload.service.js` that uploads files to Cloudinary
- Do NOT build any frontend upload buttons or API routes yet
- Load credentials from `config.cloudinary` defined in Phase 1's config setup

## Multer Middleware Specification
```javascript
// middleware/upload.middleware.js

Storage configuration:
- Use Multer's diskStorage, saving to server/tmp/uploads/ directory (ensure this folder is created at startup if not exists)

File filters:
- Allowed file types: image/jpeg, image/png, application/pdf
- File size limit: 5MB maximum for documents, 2MB for profile images

Error Handling:
- Handle MulterError (e.g., file too large) by throwing an AppError with 400 Bad Request
```

## Cloudinary Upload Utility Specification
```javascript
// services/upload.service.js

/**
 * Uploads a local file to Cloudinary and deletes the local temp file.
 * 
 * @param {string} localFilePath - Path to temp file
 * @param {string} folder - Cloudinary folder name ('doctor_docs' or 'profile_pics')
 * @returns {Promise<string>} Secure URL of uploaded resource
 */
export const uploadToCloudinary = async (localFilePath, folder) => {
  // 1. Upload to Cloudinary using cloudinary.v2.uploader.upload
  //    Configure: resource_type: 'auto' (to support PDF documents and images)
  // 2. Wrap in try/catch/finally
  // 3. In 'finally' block: check if local file exists, then delete it using fs.promises.unlink
}
```

## Validation Checkpoints
- [ ] Uploading a file larger than 5MB returns 400 Bad Request with a clear error message
- [ ] Uploading a `.exe` or `.txt` file is blocked by the MimeType filter and returns 400
- [ ] Uploading a valid image or PDF succeeds and returns the secure Cloudinary HTTPS URL
- [ ] Regardless of whether the Cloudinary upload succeeds or fails, the temporary file in `server/tmp/uploads/` is always deleted
- [ ] Missing Cloudinary credentials in `.env` prints a warning at startup but does not crash the server

## Common Mistakes to Avoid
- **Do NOT** forget the `finally` block to delete local temp files. Leaking files on disk will eventually crash the server due to Out-Of-Memory/disk-full errors in production.
- **Do NOT** hardcode Cloudinary credentials. Always pull them from the centralized `config/env.js` module.
- **Do NOT** set the `resource_type` to `image` if PDFs are allowed. Use `auto` to support both images and PDFs.

## Interview Explanation Points
- "We use local disk storage as a temporary staging area before streaming to Cloudinary. It's critical to clean up these local temp files in a `finally` block to guarantee they are deleted even if the Cloudinary upload fails, preventing disk space leaks on our server."
- "I configured a strict MimeType filter at the `multer` layer to block unsupported file formats (like executable scripts) before they ever reach our application logic, serving as an important security boundary."

---

# PROMPT 3.3 — Doctor Profile Onboarding Service & Controller Layer

## Objective
Implement the backend routes, services, and controller functions that allow registered doctor users to complete their professional onboarding profile. The onboarding handler must support uploading two documents (`degreeDocument` and `licenseDocument`) and parsing JSON profile details in a single multi-part form-data request.

## Architecture Reasoning
During registration, users only provide their basic details (name, email, password, role). When a user with the `doctor` role logs in for the first time, they must complete onboarding before they can appear in search listings or accept bookings.

This step updates or creates a `DoctorProfile` document. The endpoint must accept a `multipart/form-data` request because it contains both text fields (specializations, fee, clinic info) and file fields (qualification documents). Since `express.json()` cannot parse multi-part requests, we use `multer`'s `.fields()` configuration to extract both files and text fields, mapping files to `req.files` and textual fields to `req.body`.

## Implementation Scope Boundaries
- Configure `routes/doctor.routes.js` with the onboarding endpoint
- Implement onboarding logic in `controllers/doctor.controller.js`
- Implement profile persistence in `services/doctor.service.js`
- Protect onboarding route using `requireAuth` and `requireRole('doctor')`
- Do NOT implement search queries or listings yet (Phase 4)

## Route & Controller Specifications
```
PUT /api/doctors/profile/onboard
  Headers: 
    - Authorization: Bearer <token>
    - Content-Type: multipart/form-data
  Files expected:
    - degreeDocument (single file)
    - licenseDocument (single file)
  Body fields expected (req.body):
    - specialization (JSON string array, e.g., '["Sports Injury", "Dry Needling"]')
    - experience (number)
    - clinicName (string)
    - clinicAddress (string)
    - latitude (number)
    - longitude (number)
    - consultationFee (number)
    - bio (string)
    - registrationNumber (string)

Response:
  Status: 200 OK
  Body: { success: true, message: 'Onboarding profile submitted for review', data: { profile } }
```

## Business Rules & Logic in Service Layer
```javascript
// services/doctor.service.js

export const onboardDoctor = async (userId, profileData, files) => {
  // 1. Verify user exists and actually has the role 'doctor'
  //    If not: throw AppError('Only doctors can complete professional onboarding', 400)
  
  // 2. Check if a profile already exists for this doctor
  //    If yes: check if verificationStatus is 'verified'. If already verified, restrict changes
  //    to prevent doctors from bypassing verification by modifying documents later.
  
  // 3. Upload degreeDocument and licenseDocument to Cloudinary using uploadToCloudinary
  
  // 4. Parse specialization JSON string array: JSON.parse(profileData.specialization)
  
  // 5. Structure GeoJSON: 
  //    clinicLocation = {
  //      type: 'Point',
  //      coordinates: [parseFloat(profileData.longitude), parseFloat(profileData.latitude)]
  //    }
  
  // 6. Create or update DoctorProfile in DB, setting verificationStatus to 'pending'
  
  // 7. Return the profile
}
```

## Validation Checkpoints
- [ ] A patient attempting to onboard returns 403 Forbidden via the role guard
- [ ] Submitting a profile without `registrationNumber` returns a validation error
- [ ] Submitting invalid JSON for `specialization` throws a syntax error that is caught gracefully and returns 400 Bad Request
- [ ] Uploaded documents appear successfully in the Cloudinary dashboard under the correct folders
- [ ] The returned profile object has a `verificationStatus` of `'pending'` and the correct GeoJSON structure

## Common Mistakes to Avoid
- **Do NOT** forget to convert `latitude` and `longitude` to floats using `parseFloat()` before saving to MongoDB GeoJSON. String coordinates will break geospatial calculations.
- **Do NOT** allow already-verified doctors to update their documents without resetting their status to `pending`. Otherwise, verified doctors could replace their degrees with fraudulent documents.
- **Do NOT** forget that `req.body` variables from multipart forms are parsed as strings. You must cast numbers (experience, consultationFee) to actual numbers before saving.

## Interview Explanation Points
- "I designed the onboarding flow to accept a multi-part form-data request because professional onboarding requires both structured metadata and verified documents. We parse the text fields with Mongoose casting and upload the files to Cloudinary in a single atomic request."
- "I enforce a critical security constraint: if a doctor updates their medical license or degree document after being verified, their status is immediately reset to `pending`. This prevents verified users from changing their credentials to unverified documents."

---

# PROMPT 3.4 — Admin Verification Engine & Operations

## Objective
Implement backend routes and services that allow platform admins to view the queue of doctors pending verification, inspect their qualifications, and either approve (verify) or reject their profiles.

## Architecture Reasoning
To maintain a safe healthcare marketplace, the platform must not allow unverified doctors to appear in searches or accept patient bookings. An admin must manually inspect the uploaded degree and medical license documents, verify the registration number against medical registries, and change the status.

Putting this logic behind `requireRole('admin')` ensures only authorized staff can alter doctor statuses. Rejections must include a `rejectionReason` so doctors know how to correct their profile for resubmission.

## Implementation Scope Boundaries
- Implement admin endpoints in `routes/admin.routes.js`
- Implement verification logic in `controllers/admin.controller.js`
- Protect routes with `requireAuth` and `requireRole('admin')`
- Do NOT build the frontend UI dashboard yet (Prompt 3.6)

## Admin Endpoint Specifications

```
GET /api/admin/doctors/pending
  Description: Get list of all doctor profiles with 'pending' verification status
  Response: { success: true, data: { profiles: [ ... ] } }
  Status: 200

PATCH /api/admin/doctors/:profileId/verify
  Description: Approve a doctor profile
  Body: none
  Response: { success: true, message: 'Doctor verified successfully', data: { profile } }
  Status: 200

PATCH /api/admin/doctors/:profileId/reject
  Description: Reject a doctor profile
  Body: { rejectionReason }
  Response: { success: true, message: 'Doctor profile rejected', data: { profile } }
  Status: 200
```

## Business Logic in Service Layer
```javascript
// services/admin.service.js

export const verifyDoctorProfile = async (profileId) => {
  // 1. Find profile by ID, populate the 'user' field to see user details
  // 2. If not found: throw AppError('Profile not found', 404)
  // 3. Set verificationStatus = 'verified'
  // 4. Set rejectionReason = null (clear any previous rejection)
  // 5. Save and return updated profile
}

export const rejectDoctorProfile = async (profileId, reason) => {
  // 1. If !reason: throw AppError('Rejection reason is required', 400)
  // 2. Find profile by ID
  // 3. If not found: throw AppError('Profile not found', 404)
  // 4. Set verificationStatus = 'rejected'
  // 5. Set rejectionReason = reason
  // 6. Save and return updated profile
}
```

## Validation Checkpoints
- [ ] A doctor or patient attempting to access admin routes returns 403 Forbidden
- [ ] Rejecting a doctor without providing `rejectionReason` returns 400 Bad Request
- [ ] Verifying a doctor successfully changes their `verificationStatus` to `'verified'` and clears any stale `rejectionReason`
- [ ] Deactivating a doctor's user account (via user service) is distinct from rejecting their profile, though both block bookings

## Common Mistakes to Avoid
- **Do NOT** forget to validate that `rejectionReason` is not empty. If an admin rejects a profile without giving a reason, the doctor has no actionable feedback.
- **Do NOT** omit the `.populate('user')` when fetching pending lists if the admin needs to see the doctor's name and email in the queue.

## Interview Explanation Points
- "I designed the verification flow to separate user account lifecycle (active/inactive) from professional profile status (pending/verified/rejected). This means we can reject a profile for a typo but keep the user active so they can log in, edit their profile, and resubmit immediately without re-registering."
- "Rejection requires an explicit `rejectionReason` that is stored in the database. This directly supports a self-healing onboarding loop—doctors see the reason on their dashboard and know exactly what to correct."

---

# PROMPT 3.5 — Doctor Onboarding Form Wizard (Frontend)

## Objective
Build a professional, multi-step onboarding wizard on the frontend (`DoctorProfileEditor.jsx`). The wizard must guide the doctor through entering professional details, clinic location (using a map selector or manual coordinates), and uploading credential documents. It must display their current verification status with clear contextual layouts for "pending review" and "rejected (with actionable feedback)."

## Architecture Reasoning
Completing professional onboarding is a high-cognitive-load task. Breaking the form down into a structured multi-step wizard (Step 1: Professional Details, Step 2: Clinic & Fees, Step 3: Document Uploads) prevents forms from feeling overwhelming, which reduces onboarding drop-offs.

Because the form contains file uploads, the submission handler must construct a `FormData` object instead of a JSON payload and set the Axios request header to `multipart/form-data`. The UI must display real-time upload progress indicators and disable submit buttons to prevent double-submissions.

## Implementation Scope Boundaries
- Implement `pages/doctor/DoctorProfileEditor.jsx`
- Support step-by-step navigation with field validation per step
- Handle `FormData` creation and multi-part API submission
- Integrate status display banners based on `verificationStatus`
- Do NOT build calendar scheduling or slot setups yet (Phase 5)

## Visual Design & UX Requirements
- **Stepper Header:** Visual indicators of completed, active, and upcoming steps.
- **Role Dashboard Status Banner:** 
  - *Pending:* Large yellow banner ("Your professional profile is under review by our admin team. This usually takes 24-48 hours. You will be notified once verified.")
  - *Rejected:* Crimson banner ("Profile Verification Failed. Reason: [Rejection Reason]. Please update your details and resubmit.")
  - *Verified:* Green check badge ("Profile Verified. You are now visible in search results.")
- **File Upload Slots:** Interactive drag-and-drop zones showing the uploaded filename or a green checkmark when a file is selected.

```
Layout Preview:

+-------------------------------------------------------------+
|  Onboarding Progress: (1) Professional  -> (2) Clinic  -> (3) Uploads |
+-------------------------------------------------------------+
|                                                             |
|   [ Step 2: Clinic & Consultation Fees ]                    |
|                                                             |
|   Clinic Name:    [--------------------------------------]  |
|   Clinic Address: [--------------------------------------]  |
|   Consultation Fee (₹): [ 500 ]                             |
|                                                             |
|   Select Coordinates (Proximity Search):                     |
|   Latitude:  [ 12.9716 ]   Longitude: [ 77.5946 ]           |
|                                                             |
|   +-----------------------------------------------------+   |
|   | Map Placement Box (or clear coordinates fields)     |   |
|   +-----------------------------------------------------+   |
|                                                             |
|   < Back                                         Next >     |
+-------------------------------------------------------------+
```

## Form State & Submission Logic
```javascript
const handleOnboardSubmit = async () => {
  const formData = new FormData()
  
  // Append text fields
  formData.append('clinicName', form.clinicName)
  formData.append('clinicAddress', form.clinicAddress)
  formData.append('consultationFee', form.consultationFee)
  formData.append('experience', form.experience)
  formData.append('bio', form.bio)
  formData.append('registrationNumber', form.registrationNumber)
  formData.append('latitude', form.latitude)
  formData.append('longitude', form.longitude)
  
  // Append arrays as JSON string
  formData.append('specialization', JSON.stringify(form.specializations))
  
  // Append files
  formData.append('degreeDocument', degreeFile)
  formData.append('licenseDocument', licenseFile)

  try {
    setIsSubmitting(true)
    await onboardDoctorAPI(formData)
    toast.success('Onboarding profile submitted!')
    // Refresh auth user data/profile status
  } catch (err) {
    toast.error(err.response?.data?.message || 'Submission failed')
  } finally {
    setIsSubmitting(false)
  }
}
```

## Validation Checkpoints
- [ ] Doctor cannot advance to Step 2 without filling in all Step 1 required fields
- [ ] Selecting a file updates the UI with the file name and size, showing a success state
- [ ] Attempting to submit without attaching both files blocks submission and shows an inline error
- [ ] The submission API call is made with `Content-Type: multipart/form-data` and contains the JWT token in headers
- [ ] Successful submission updates the user's dashboard view to display the "Pending Verification" yellow banner

## Common Mistakes to Avoid
- **Do NOT** send `specialization` as a raw Javascript array. Convert it to a JSON string using `JSON.stringify(specializations)` because standard multipart forms only accept strings and files.
- **Do NOT** forget to add an `isLoading` or `isSubmitting` state that disables all form inputs and buttons during the API call.

## Interview Explanation Points
- "I implemented a step-by-step form wizard because professional onboarding requires sensitive documents and geographical coordinates, which can feel overwhelming in a single long form. Breaking it into logical steps reduces cognitive load."
- "Since we are submitting binary files (degree and license documents), we must construct a `FormData` object instead of a standard JSON payload. We serialize arrays like `specialization` into a JSON string so they can pass safely through the multi-part boundary."

---

# PROMPT 3.6 — Admin Doctor Verification UI & Review Panel

## Objective
Build the admin verification dashboard page (`AdminDoctorVerification.jsx`) on the frontend. The dashboard must display a queue of all doctor profiles pending verification. Admins must be able to click a profile, open a detailed review modal or sidebar drawer, inspect all credentials (including viewing or downloading the uploaded PDFs/images), and approve or reject the profile.

## Architecture Reasoning
The admin dashboard is the security gate for the platform. Admins require a highly efficient interface to review and act on applications. The design must let admins open documents in a separate preview panel or new tab cleanly without losing their place in the queue.

Action modals are used for rejection to ensure that the admin cannot accidentally submit an empty rejection reason—the "Submit Rejection" button remains disabled until the explanation is typed.

## Implementation Scope Boundaries
- Implement `pages/admin/AdminDoctorVerification.jsx`
- Build a responsive queue list with status badges
- Implement a detailed review drawer/modal
- Add document preview links for PDF and image documents
- Build the rejection reason modal with validation
- Integrate with admin verification API endpoints

## UI & Visual Design Requirements
- **Queue Table/Cards:** Shows applicant name, registration number, specialization tags, registration date, and a clean "Review Application" CTA button.
- **Document Viewer:** Securely links to the Cloudinary URL. If it's an image, embed a thumbnail that expands. If it's a PDF, show a "View PDF Document" button that opens in a new secure tab (`target="_blank" rel="noopener noreferrer"`).
- **Verification Panel CTAs:**
  - *Approve Button:* Solid green, asks for a confirmation toast.
  - *Reject Button:* Outline red, opens the Rejection Dialog asking for the reason.
- **Rejection Modal:** Generous textarea, disables submit if less than 15 characters are typed.

```
Layout Preview:

+-------------------------------------------------------------+
|  Admin Console: Doctor Verification Queue      [Count: 3]   |
+-------------------------------------------------------------+
|                                                             |
|   Name             Reg. Number      Submitted     Action    |
|   --------------------------------------------------------  |
|   Dr. Sarah Connor   REG-991823       2 hours ago   [Review]|
|   Dr. Alan Grant     REG-552811       1 day ago     [Review]|
|                                                             |
+-------------------------------------------------------------+
|  [Review Drawer: Dr. Sarah Connor]                          |
|  Specialization: Orthopedic Rehab, Geriatric Care            |
|  Experience: 8 Years                                        |
|  Clinic: Hope Rehab Clinic, Bangalore                       |
|                                                             |
|  Uploaded Credentials:                                      |
|  - Degree Document:  [View Degree PDF] (Opens in new tab)    |
|  - Medical License:  [View License PDF] (Opens in new tab)   |
|                                                             |
|  [ Reject Application ]                     [ Approve & Verify ] |
+-------------------------------------------------------------+
```

## Validation Checkpoints
- [ ] Navigating to the admin verification URL as a patient or doctor redirects to their respective dashboards (role guard check)
- [ ] Opening the preview link opens the document in a new tab securely without taking the admin away from the queue page
- [ ] Clicking "Approve" makes a PATCH call to the backend `/verify` endpoint and removes the applicant from the pending list upon success
- [ ] Rejecting requires a minimum 15-character reason before sending the PATCH call to the `/reject` endpoint
- [ ] System handles network errors gracefully, showing error states in toast messages

## Common Mistakes to Avoid
- **Do NOT** forget to add `rel="noopener noreferrer"` to external `target="_blank"` links to protect against reverse tabnabbing security exploits.
- **Do NOT** let the admin click "Approve" or "Reject" multiple times in quick succession. Disable buttons immediately upon the first click.

## Interview Explanation Points
- "I designed the document viewer to launch files in a separate tab securely using `rel="noopener noreferrer"`. This provides a clean review experience, letting the admin cross-reference credentials side-by-side without leaving their dashboard queue."
- "The rejection form strictly enforces a minimum character limit on the reason before allowing submission. Actionable feedback is the only way to ensure doctors can resolve discrepancies and get onboarded quickly, lowering platform support overhead."

---

# PROMPT 3.7 — Unified Profile Photo & File Upload Component

## Objective
Build a reusable frontend file upload component (`FileUploadZone.jsx`) that handles both user avatar (profile photo) uploads and document (PDF/Image) uploads. The component must support drag-and-drop actions, display live upload previews, show file size errors, and render elegant loading states during uploads.

## Architecture Reasoning
Having individual file upload logics scattered across different forms (e.g., register page, profile edit page, admin verification pages) results in visual inconsistency and duplicate code. Centralizing this UX pattern into a single reusable component ensures consistent behavior.

Using HTML5 Drag and Drop APIs combined with file type validations ensures that files are filtered *before* they are sent to the backend.

## Implementation Scope Boundaries
- Create `components/common/FileUploadZone.jsx`
- Support standard input select and drag-and-drop events
- Validate file size limits (5MB documents, 2MB images) and file types
- Support uploading both images (show preview) and PDFs (show document icon)
- Integrate visual progress and upload success markers

## Component Props Specification
```javascript
FileUploadZone.propTypes = {
  label: PropTypes.string.isRequired,
  accept: PropTypes.string,           // e.g., "image/*,application/pdf"
  maxSizeMB: PropTypes.number,        // e.g., 5
  onFileSelect: PropTypes.func.isRequired,
  selectedFile: PropTypes.object,     // Current selected file instance
  previewUrl: PropTypes.string        // Stored URL if updating existing profile
}
```

## UX & Visual States
- **Default State:** Dashed border container, folder icon, text: "Drag and drop your file here, or click to browse. Max size 5MB (PDF or JPG/PNG)."
- **Hover State (on Drag Over):** Border color changes to primary brand color, background gains subtle tint, showing that dropping is active.
- **Selected State:** Border solidifies, displays the file name, file size in KB/MB, and a clear "Remove file" red cross icon.
- **Preview State (Images):** Renders a rounded image thumbnail box so doctors can verify they uploaded the correct image.

## Validation Checkpoints
- [ ] Dragging an invalid file type (e.g. a zip file) shows a validation error instantly and rejects the file
- [ ] Selecting a file larger than `maxSizeMB` shows an error message and rejects the file
- [ ] Component handles reset correctly—clicking the "Remove" icon clears the selection and resets the view
- [ ] Dropping a file in the drop area successfully fires the `onFileSelect` callback with the file object

## Common Mistakes to Avoid
- **Do NOT** forget to call `e.preventDefault()` on drag events. Without this, browsers will navigate away from the app and open the dropped file in the tab.
- **Do NOT** create memory leaks with image previews. When creating local object URLs via `URL.createObjectURL(file)`, make sure to revoke the URL via `URL.revokeObjectURL()` when the component unmounts or the file is removed.

## Interview Explanation Points
- "I designed a unified `FileUploadZone` component that encapsulates HTML5 Drag-and-Drop events, file size limits, and type filters. This ensures consistent document handling across both patient avatar updates and doctor medical credentials."
- "To prevent memory leaks when displaying local file previews, I clean up object URLs using `URL.revokeObjectURL()` during component unmounts and file changes. This is an important optimization for SPA lifecycles."

---

## Phase 3 Completion Gate

Before moving to Phase 4, ALL of the following must be true:

```
✅ DoctorProfile model exists with correct GeoJSON location schema and 2dsphere index
✅ Cloudinary SDK client is configured and connects successfully
✅ Multer middleware validates file types (Image/PDF) and file size limits (5MB)
✅ Local temporary files uploaded by Multer are guaranteed to be unlinked after Cloudinary upload
✅ PUT /api/doctors/profile/onboard accepts files + text fields and successfully creates/updates profiles
✅requireRole('doctor') prevents patients/admins from onboarding as a doctor
✅ GET /api/admin/doctors/pending returns only profiles with 'pending' status
✅ PATCH /api/admin/doctors/:id/verify changes status to 'verified' and clears rejection details
✅ PATCH /api/admin/doctors/:id/reject changes status to 'rejected' and requires rejectionReason
✅ DoctorProfileEditor UI on frontend allows multi-step onboarding submission with document attachments
✅ Banners on doctor dashboard dynamically reflect verification status and show rejection reasons
✅ Admin verification queue renders applicants and launches document inspection in a secure tab
✅ Reusable FileUploadZone component handles drag-and-drop, validation, and previews without leaks
```

**Phase 3 unlocks Phase 4 (Doctor Discovery & Search) because:**
- Verified doctor profiles are now stored in the database with physical coordinate locations.
- We have a rich population of doctor details (specializations, fees, names) ready to be queried.
- Only profiles with `verificationStatus: 'verified'` will be exposed in searches, matching the business rules.

---

Say **"generate Phase 4 prompts"** when ready.
