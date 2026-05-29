# PhysioConnect — Phase 7 Complete Prompt Set
## Reviews & Ratings System

---

# PROMPT 7.1 — Review Model

## Objective
Create the `Review` Mongoose model. This schema represents a patient's rating and written feedback for a doctor, submitted after a completed and paid appointment. It is the trust and social proof layer of the marketplace.

## Architecture Reasoning
Reviews are a first-class entity in a healthcare marketplace — they directly influence which doctors patients choose. Keeping reviews in their own collection (rather than embedding them in Doctor or Appointment documents) is the correct architectural choice because: reviews are queried independently (show all reviews for a doctor), they need to be aggregated (average rating calculation), and they have their own lifecycle (could be moderated, edited, or removed by admin in future phases). The Review references both the Appointment it came from and the Doctor it targets, enabling both audit trails and aggregation.

## Implementation Scope
- Create `server/src/models/Review.model.js`
- Do NOT create controllers or routes yet
- Do NOT modify any existing files

## Schema Specification

```js
// server/src/models/Review.model.js

const reviewSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true,       // One review per appointment — enforced at schema level
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
      trim: true,
    },
    isVisible: {
      type: Boolean,
      default: true,        // Admin can hide reviews without deleting them
    },
  },
  { timestamps: true }
);
```

## Required Indexes

```js
// One review per appointment — schema-level unique already covers this,
// but an explicit index makes the constraint visible and queryable
reviewSchema.index({ appointment: 1 }, { unique: true });

// Primary query pattern: all reviews for a doctor
reviewSchema.index({ doctor: 1, isVisible: 1 });

// Check if patient has reviewed a specific appointment
reviewSchema.index({ patient: 1, appointment: 1 });
```

## Post-Save Hook — Update Doctor Average Rating

After every review is saved, the Doctor's `averageRating` and `totalReviews` fields must be recalculated. This denormalization keeps the doctor listing page fast — no need to aggregate reviews on every search query.

```js
reviewSchema.post('save', async function () {
  const Review = this.constructor;
  const DoctorProfile = mongoose.model('DoctorProfile');

  const stats = await Review.aggregate([
    { $match: { doctor: this.doctor, isVisible: true } },
    {
      $group: {
        _id: '$doctor',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await DoctorProfile.findByIdAndUpdate(this.doctor, {
      averageRating: parseFloat(stats[0].averageRating.toFixed(1)),
      totalReviews: stats[0].totalReviews,
    });
  }
});
```

## DoctorProfile Model Update Required

The `DoctorProfile` model from Phase 3 must have these two fields added if not already present:

```js
// Add to DoctorProfile schema:
averageRating: { type: Number, default: 0 },
totalReviews: { type: Number, default: 0 },
```

Modify `server/src/models/DoctorProfile.model.js` to add these two fields. This is the only existing model file that needs updating in Phase 7.

## Why Denormalize Rating onto DoctorProfile?
The doctor listing and search pages (Phase 4) sort and filter by rating. If rating lived only in the Review collection, every listing query would require an expensive aggregation join. Storing `averageRating` and `totalReviews` directly on DoctorProfile makes listing queries a simple find — the tradeoff is that writes (new reviews) trigger a recalculation. For a marketplace with far more reads than writes, this is the correct tradeoff. This is a strong interview answer.

## Validation Checkpoints
- [ ] Model imports and exports without errors
- [ ] `appointment` field has `unique: true`
- [ ] `rating` min/max enforced (test with rating: 6 — should fail)
- [ ] `comment` minlength enforced
- [ ] Post-save hook exists and references correct model names
- [ ] DoctorProfile model has `averageRating` and `totalReviews` fields added

## Interview Explanation Points
- "The `unique: true` on the appointment field at the schema level is one layer of protection. The application layer also checks `reviewSubmitted` on the Appointment before allowing submission — defense in depth."
- "I denormalize `averageRating` onto the DoctorProfile using a post-save hook because the doctor listing page queries doctors by rating frequently. Aggregating the Review collection on every search would be expensive. Writes are rare; reads are frequent."
- "The `isVisible` flag allows admin moderation without hard-deleting reviews. A hidden review still exists in the database for audit purposes but doesn't affect the doctor's displayed rating."

---

# PROMPT 7.2 — Review Submission Endpoint

## Objective
Build the backend endpoint that allows a patient to submit a review. The endpoint enforces all eligibility gates before creating the review: the appointment must be completed, payment must be confirmed, and no prior review must exist for this appointment.

## Architecture Reasoning
Review eligibility is a multi-gate check. All gates must pass before a review is created. The order of checks matters for both performance and user experience — fail fast on the cheapest checks first. The `reviewSubmitted` flag on Appointment is the primary gate; the database unique constraint on Review is the safety net. Both must exist because the flag prevents wasted queries and the constraint prevents race conditions.

## Implementation Scope
- Create `server/src/controllers/review.controller.js`
- Create `server/src/routes/review.routes.js`
- Modify `server/src/app.js` — mount: `app.use('/api/reviews', reviewRoutes)`

## Existing Dependencies
- `Review.model.js` — created in Prompt 7.1
- `Appointment.model.js` — has `reviewSubmitted`, `status`, `paymentStatus` fields
- `protect`, `authorizeRoles` — exist

## API Endpoint

```
POST /api/reviews    → Patient submits a review
```

## Controller Logic — submitReview

```
1. Extract { appointmentId, rating, comment } from req.body

2. Validate inputs:
   - appointmentId: required
   - rating: required, must be integer 1–5
   - comment: required, minimum 10 characters
   Return 400 with specific field errors if validation fails

3. Find Appointment by appointmentId:
   If not found: return 404

4. Eligibility Gate 1 — Ownership:
   If appointment.patient.toString() !== req.user._id.toString():
   return 403 "You can only review your own appointments."

5. Eligibility Gate 2 — Completion:
   If appointment.status !== 'completed':
   return 400 "You can only review a completed appointment."

6. Eligibility Gate 3 — Payment:
   If appointment.paymentStatus !== 'paid':
   return 400 "Payment must be confirmed before submitting a review."

7. Eligibility Gate 4 — No Prior Review:
   If appointment.reviewSubmitted === true:
   return 400 "You have already submitted a review for this appointment."

8. Create Review:
   {
     appointment: appointmentId,
     patient: req.user._id,
     doctor: appointment.doctor,
     rating,
     comment,
   }
   — The post-save hook fires automatically and updates DoctorProfile rating

9. Update Appointment:
   await Appointment.findByIdAndUpdate(appointmentId, { reviewSubmitted: true })

10. Return 201 with the created review
```

## Route Definition

```js
// review.routes.js
router.post('/', protect, authorizeRoles('patient'), submitReview);
```

## Validation Checkpoints
- [ ] Patient can submit a review for a completed, paid appointment
- [ ] After submission: `appointment.reviewSubmitted === true`
- [ ] After submission: `doctorProfile.averageRating` and `totalReviews` are updated
- [ ] Second submission for same appointment returns 400 "already submitted"
- [ ] Submission for a confirmed (not completed) appointment returns 400
- [ ] Submission for an unpaid appointment returns 400
- [ ] Submission for another patient's appointment returns 403
- [ ] Rating of 6 returns validation error
- [ ] Comment under 10 characters returns validation error

## Common Mistakes to Avoid
- **Do NOT** skip the `paymentStatus` gate — a patient who didn't pay should not be able to review
- **Do NOT** rely solely on the database unique constraint — the `reviewSubmitted` flag check should run first for a clean user-facing error message
- **Do NOT** forget to set `reviewSubmitted: true` on the Appointment after creating the review — this is what prevents duplicate submissions

## Interview Explanation Points
- "I have two layers preventing duplicate reviews: the application-level `reviewSubmitted` flag check gives a clean error message to the user, and the database-level unique constraint on the appointment field is the safety net if the flag check is somehow bypassed. Defense in depth."
- "The post-save hook on the Review model automatically recalculates and updates the doctor's average rating. The controller doesn't need to handle this — it's an automatic consequence of saving a review."
- "I check payment status as a review gate because reviews should represent genuine patient experiences. Someone who booked but didn't pay hasn't received a service."

---

# PROMPT 7.3 — Review Retrieval Endpoints

## Objective
Build the endpoints for fetching reviews. Patients can see reviews they've written. Doctors can see reviews about them. The public doctor profile page displays a doctor's visible reviews. Admin can see all reviews including hidden ones.

## Implementation Scope
- Extend `server/src/controllers/review.controller.js`
- Extend `server/src/routes/review.routes.js`

## API Endpoints

```
GET /api/reviews/doctor/:doctorId    → Public: all visible reviews for a doctor
GET /api/reviews/mine                → Patient: reviews they have written
GET /api/reviews/admin/all           → Admin: all reviews including hidden
```

## Controller Logic — getDoctorReviews (Public)

```
1. Accept :doctorId as URL param
2. Query: Review.find({ doctor: doctorId, isVisible: true })
3. Populate: patient (name only — no email for privacy)
4. Sort: { createdAt: -1 }
5. Return array
   (empty array is valid — not a 404)
```

## Controller Logic — getMyReviews (Patient)

```
1. Query: Review.find({ patient: req.user._id })
2. Populate: doctor (name, specialization, profileImage)
3. Populate: appointment (date, startTime, endTime)
4. Sort: { createdAt: -1 }
5. Return array
```

## Controller Logic — getAllReviewsAdmin

```
1. Extract page (default 1), limit (default 10) from req.query
2. Query: Review.find({})              ← All reviews, including isVisible: false
3. Populate: patient (name, email)
4. Populate: doctor (name, specialization)
5. Sort: { createdAt: -1 }
6. Skip + limit for pagination
7. Also return totalCount: Review.countDocuments({})
8. Return: { reviews, totalCount, totalPages, currentPage }
```

## Route Additions

```js
// Add to review.routes.js — ORDER MATTERS
router.get('/admin/all', protect, authorizeRoles('admin'), getAllReviewsAdmin);
router.get('/mine', protect, authorizeRoles('patient'), getMyReviews);
router.get('/doctor/:doctorId', getDoctorReviews);    // Public — no auth
```

## Validation Checkpoints
- [ ] Public doctor reviews endpoint works without auth header
- [ ] Returns only `isVisible: true` reviews on the public endpoint
- [ ] Patient review history returns only their own reviews
- [ ] Admin endpoint returns all reviews including hidden ones
- [ ] Pagination works on admin endpoint
- [ ] Patient name populates correctly on public endpoint
- [ ] Empty array returned for doctor with no reviews — not 404

## Common Mistakes to Avoid
- **Do NOT** expose patient email on the public doctor reviews endpoint — name only
- **Do NOT** put `GET /doctor/:doctorId` before `GET /mine` — Express would match `"mine"` as a doctorId param

---

# PROMPT 7.4 — Admin Review Moderation Endpoint

## Objective
Build the admin endpoint to toggle review visibility. Admin can hide a review that violates platform guidelines without permanently deleting it. Hiding a review must also trigger a recalculation of the doctor's average rating.

## Architecture Reasoning
Soft-hiding rather than deleting reviews is the correct approach for moderation. Deleted data cannot be audited, disputed, or restored. A hidden review remains in the database with `isVisible: false` — visible to admins, invisible to the public. When a review is hidden, the doctor's rating must be recalculated to exclude it. This means the same post-save hook logic used during submission needs to be triggered again, or the recalculation must be done explicitly in the controller.

## Implementation Scope
- Extend `server/src/controllers/review.controller.js`
- Extend `server/src/routes/review.routes.js`

## API Endpoint

```
PATCH /api/reviews/:id/visibility    → Admin toggles review visibility
```

## Controller Logic — toggleReviewVisibility

```
1. Find Review by :id — return 404 if not found

2. Toggle: review.isVisible = !review.isVisible

3. Save the review
   NOTE: The post-save hook will NOT fire correctly here because
   the hook only recalculates based on isVisible: true reviews.
   After toggling, manually trigger the recalculation:

4. Recalculate doctor rating after save:
   const stats = await Review.aggregate([
     { $match: { doctor: review.doctor, isVisible: true } },
     { $group: {
         _id: '$doctor',
         averageRating: { $avg: '$rating' },
         totalReviews: { $sum: 1 }
     }}
   ]);

   if (stats.length > 0) {
     await DoctorProfile.findByIdAndUpdate(review.doctor, {
       averageRating: parseFloat(stats[0].averageRating.toFixed(1)),
       totalReviews: stats[0].totalReviews,
     });
   } else {
     // All reviews hidden — reset to zero
     await DoctorProfile.findByIdAndUpdate(review.doctor, {
       averageRating: 0,
       totalReviews: 0,
     });
   }

5. Return updated review with new isVisible state and message:
   "Review visibility updated."
```

## Route Addition

```js
router.patch('/:id/visibility', protect, authorizeRoles('admin'), toggleReviewVisibility);
```

## Validation Checkpoints
- [ ] Admin can hide a visible review
- [ ] Admin can unhide a hidden review (toggle works both directions)
- [ ] After hiding: doctor's `averageRating` and `totalReviews` recalculate correctly
- [ ] After unhiding: doctor's `averageRating` and `totalReviews` recalculate correctly
- [ ] Hiding all reviews for a doctor resets their rating to 0 and totalReviews to 0
- [ ] Non-admin JWT returns 403

## Common Mistakes to Avoid
- **Do NOT** rely solely on the post-save hook for the toggle case — the hook logic may not handle the direction correctly after a toggle; run the aggregate explicitly
- **Do NOT** hard-delete reviews from the admin panel — always use the visibility toggle

## Interview Explanation Points
- "When a review is hidden, I recalculate the doctor's average rating to exclude it. This keeps the displayed rating accurate. If a doctor had 5 reviews and one is hidden, their displayed average should reflect only 4 reviews."
- "I handle the edge case where hiding a review reduces totalReviews to zero — in that case, I reset the doctor's averageRating to 0 rather than leaving a stale value."

---

# PROMPT 7.5 — Review Section on Doctor Profile Page (Frontend)

## Objective
Build the reviews display section on the public doctor profile page. Show the doctor's overall rating summary at the top, followed by individual patient reviews. This section is visible to all visitors and is a primary trust signal for patient booking decisions.

## Architecture Reasoning
The review section sits on the same page as the booking flow (doctor profile page). This is intentional — the patient reads reviews, builds trust, and books in a single flow without navigating away. The rating summary (stars + count) at the top provides quick signal; individual reviews below provide depth. Both use data already available from the existing doctor profile API and the new reviews API.

## Implementation Scope
- Create `client/src/api/review.api.js`
- Create `client/src/components/reviews/StarRating.jsx`
- Create `client/src/components/reviews/ReviewCard.jsx`
- Create `client/src/components/reviews/DoctorReviewsSection.jsx`
- Modify `client/src/pages/public/DoctorProfile.jsx` — add `<DoctorReviewsSection>` below the slot picker

## API Service File

```js
// client/src/api/review.api.js

import axiosInstance from './axiosInstance';

export const getDoctorReviews = (doctorId) =>
  axiosInstance.get(`/reviews/doctor/${doctorId}`);

export const submitReview = (data) =>
  axiosInstance.post('/reviews', data);

export const getMyReviews = () =>
  axiosInstance.get('/reviews/mine');
```

## StarRating.jsx — Component Specification

**Props:** `{ rating, size? }` (size: 'sm' | 'md' | 'lg', default 'md')

```jsx
// Renders filled/half/empty stars based on a 1–5 rating
// Use Unicode stars: ★ (filled) ☆ (empty) for simplicity — no library needed

// Logic:
// For i in [1, 2, 3, 4, 5]:
//   if i <= Math.floor(rating) → filled star
//   else → empty star

// Display: ★★★★☆  4.0  (show numeric rating alongside)
```

**Size mapping:**
- `sm`: `text-sm`
- `md`: `text-base`
- `lg`: `text-xl`

## ReviewCard.jsx — Component Specification

**Props:** `{ review }`

```
┌─────────────────────────────────────────────┐
│  [Patient initial avatar]  Patient Name     │
│                            [★★★★☆]          │
│                            Feb 10, 2024     │
│                                             │
│  "The treatment was excellent. Dr. [name]   │
│   explained everything clearly and the      │
│   recovery plan was very effective."        │
└─────────────────────────────────────────────┘
```

**Patient Initial Avatar:**
```jsx
// Circle with patient's first initial, colored background
<div className="w-10 h-10 rounded-full bg-primary/10 text-primary
                flex items-center justify-center font-semibold">
  {review.patient.name.charAt(0).toUpperCase()}
</div>
```

**Date Format:** `new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })`

## DoctorReviewsSection.jsx — Component Specification

**Props:** `{ doctorId, averageRating, totalReviews }`

**State:**
```js
const [reviews, setReviews] = useState([]);
const [loading, setLoading] = useState(true);
```

**On Mount:** Call `getDoctorReviews(doctorId)` → set state

**UI Layout:**

```
──────────────────────────────────────────
Patient Reviews

[Rating Summary Row]
  [★★★★☆ Large Stars]
  4.3 out of 5
  Based on 12 reviews

──────────────────────────────────────────

[If loading] → 3 skeleton review cards

[If reviews.length === 0]:
  "No reviews yet. Be the first to share your experience."

[For each review]:
  <ReviewCard review={review} />

──────────────────────────────────────────
```

**Show maximum 5 reviews by default.** If more than 5 exist, show a "Show all X reviews" button that expands to show all. This prevents the page from becoming too long with many reviews.

## DoctorProfile.jsx Modification

Add below the `<SlotPicker>` component:

```jsx
<DoctorReviewsSection
  doctorId={doctor._id}
  averageRating={doctor.averageRating}
  totalReviews={doctor.totalReviews}
/>
```

## Validation Checkpoints
- [ ] Doctor profile page shows review section
- [ ] Star rating renders correctly for ratings 1 through 5
- [ ] Individual review cards show patient initial, name, stars, date, comment
- [ ] Empty state shows for doctors with no reviews
- [ ] "Show all" button appears and works when more than 5 reviews exist
- [ ] Loading skeleton shows during fetch
- [ ] `averageRating` and `totalReviews` from doctor object show in the summary

## Common Mistakes to Avoid
- **Do NOT** import a star library — Unicode characters are sufficient for MVP
- **Do NOT** show patient email in review cards — name and initial only
- **Do NOT** re-fetch `averageRating` from the reviews list — use the value already on the doctor object (it's already denormalized there)

## Interview Explanation Points
- "I use the `averageRating` already stored on the DoctorProfile object rather than calculating it from the reviews array in the frontend. The denormalization in Phase 7.1 exists precisely to avoid this recalculation."
- "I limit the initial display to 5 reviews to keep the page load light and the UI uncluttered. The full list is available on demand via the expand button."

---

# PROMPT 7.6 — Review Submission Form (Patient — Post-Appointment)

## Objective
Build the review submission form that appears on the patient's appointment detail. After an appointment is completed and paid, the patient sees a "Leave a Review" prompt on the appointment card. Submitting the form marks the appointment as reviewed and the card updates to show the submitted review.

## Architecture Reasoning
Surfacing the review prompt directly on the appointment card (rather than a separate page) keeps the review action contextual and in-the-moment. The patient just had the appointment — seeing the prompt immediately after is the highest-conversion placement. The form is a minimal inline expansion rather than a navigation away, which reduces friction.

## Implementation Scope
- Create `client/src/components/reviews/ReviewForm.jsx`
- Modify `client/src/components/appointments/PatientAppointmentCard.jsx` — add review prompt and form

## ReviewForm.jsx — Component Specification

**Props:** `{ appointmentId, doctorName, onSuccess }`

**State:**
```js
const [rating, setRating] = useState(0);          // 0 = unselected
const [comment, setComment] = useState('');
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState('');
```

**UI Layout:**

```
┌────────────────────────────────────────────┐
│  How was your experience with Dr. {name}?  │
│                                            │
│  [☆] [☆] [☆] [☆] [☆]  ← clickable stars  │
│  (selected stars fill in as user hovers)   │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │  Share your experience... (textarea) │  │
│  │  min 10 chars, max 1000 chars        │  │
│  └──────────────────────────────────────┘  │
│  {comment.length}/1000                     │
│                                            │
│  [Submit Review]                           │
│  (disabled if rating === 0 or comment < 10)│
└────────────────────────────────────────────┘
```

**Interactive Star Selection:**
```jsx
// Stars are clickable — clicking sets rating
// Hovering previews the rating (use separate hoverRating state)
const [hoverRating, setHoverRating] = useState(0);

// Render each star:
{[1, 2, 3, 4, 5].map((star) => (
  <button
    key={star}
    onClick={() => setRating(star)}
    onMouseEnter={() => setHoverRating(star)}
    onMouseLeave={() => setHoverRating(0)}
    className="text-2xl focus:outline-none"
  >
    {star <= (hoverRating || rating) ? '★' : '☆'}
  </button>
))}
```

**Submit Logic:**
```js
1. Client-side validate:
   - rating must be 1–5 (not 0)
   - comment.trim().length >= 10
   Set error message if not valid

2. setSubmitting = true
3. Call submitReview({ appointmentId, rating, comment })
4. On success:
   - toast.success('Review submitted! Thank you.')
   - onSuccess() → parent updates card state
5. On 400 error: show error message from API
6. On other error: generic toast
7. setSubmitting = false
```

## PatientAppointmentCard.jsx Modification

Add review prompt logic to the card. The card now has three states:

**State 1 — Eligible but no review yet:**
Show an expandable "Leave a Review" button at the bottom of the card.
Eligibility condition:
```js
appointment.status === 'completed' &&
appointment.paymentStatus === 'paid' &&
!appointment.reviewSubmitted
```

**State 2 — Review form open:**
When "Leave a Review" is clicked, expand the card to show `<ReviewForm>`.

**State 3 — Review already submitted:**
Show a static "✓ Review submitted. Thank you!" note in place of the form trigger.

**Local state for the card:**
```js
const [showReviewForm, setShowReviewForm] = useState(false);
const [reviewDone, setReviewDone] = useState(appointment.reviewSubmitted);
```

**On review success:**
```js
const handleReviewSuccess = () => {
  setShowReviewForm(false);
  setReviewDone(true);
};
```

## Validation Checkpoints
- [ ] "Leave a Review" prompt appears on completed + paid appointments
- [ ] Prompt does NOT appear on confirmed, cancelled, or unpaid appointments
- [ ] Prompt does NOT appear on appointments where `reviewSubmitted === true`
- [ ] Star hover interaction works (stars fill on hover, stay filled on click)
- [ ] Submitting with rating 0 shows client-side error
- [ ] Submitting with comment under 10 characters shows client-side error
- [ ] Successful submission shows toast and updates card to "Review submitted" state
- [ ] After successful submission, "Leave a Review" button no longer appears
- [ ] Character counter updates as user types

## Common Mistakes to Avoid
- **Do NOT** hide the review form inside a modal — inline expansion on the card keeps it contextual
- **Do NOT** navigate away after review submission — update the card in-place
- **Do NOT** reset the entire appointment list on review submission — update local state only

## Interview Explanation Points
- "The review form is an inline expansion on the appointment card rather than a new page because contextual placement drives higher submission rates — the patient just had the appointment, this is the right moment."
- "I track the submitted state locally in the card component after submission without refetching the full appointment list. This keeps the UX fast and avoids an unnecessary network request."

---

# PROMPT 7.7 — Patient Review History Page

## Objective
Build the "My Reviews" page in the patient dashboard where patients can see all reviews they have submitted, which doctor they reviewed, and the rating and comment they left.

## Implementation Scope
- Create `client/src/pages/patient/MyReviews.jsx`
- Modify patient dashboard routing/navigation to link to this page

## MyReviews.jsx — Component Specification

**State:** `reviews`, `loading`

**On Mount:** Call `getMyReviews()` → set state

**UI Layout:**

```
My Reviews

[If loading] → 3 skeleton cards

[If empty]:
  "You haven't written any reviews yet."
  "After a completed appointment, you can share your experience."
  [Find a Doctor →] link

[For each review — card]:
┌──────────────────────────────────────────┐
│  Dr. {doctor.name}                       │
│  {doctor.specialization}                 │
│  [★★★★☆]  Your rating                   │
│  Appointment: {date}  ·  {startTime}     │
│                                          │
│  "{comment}"                             │
│                                          │
│  Reviewed on {createdAt}                 │
└──────────────────────────────────────────┘
```

**Comment display:** If comment exceeds 200 characters, truncate with "...read more" toggle.

## Navigation Update

Add to patient dashboard sidebar/navigation:
```
⭐ My Reviews → /patient/reviews
```

## Validation Checkpoints
- [ ] Page loads and shows submitted reviews
- [ ] Each card shows doctor name, specialization, rating stars, comment, and date
- [ ] Empty state shows with link to doctor discovery
- [ ] Long comments are truncated with "read more" toggle
- [ ] Navigation link works from patient dashboard

---

# PROMPT 7.8 — Doctor Reviews View (Doctor Dashboard)

## Objective
Add a reviews section to the doctor dashboard where doctors can read all reviews patients have left for them. Doctors cannot edit, delete, or respond to reviews in this phase — read-only visibility only.

## Architecture Reasoning
Doctors should be able to see patient feedback about their services. This visibility builds accountability and helps doctors understand their reputation on the platform. Keeping it read-only in Phase 7 is a deliberate scope boundary — review responses are a future feature. Making the doctor aware of their reviews now without giving them edit power is the correct MVP decision.

## Implementation Scope
- Create `client/src/pages/doctor/MyReviews.jsx`
- Modify doctor dashboard routing/navigation

## MyReviews.jsx (Doctor) — Component Specification

**State:** `reviews`, `loading`, `doctorStats` (averageRating, totalReviews from existing doctor profile API)

**On Mount:**
- Call `getDoctorReviews(doctorProfileId)` from `review.api.js`
- The doctor's `averageRating` and `totalReviews` are already available from the auth context or profile API

**UI Layout:**

```
Patient Reviews About You

[Rating Summary Card]:
┌──────────────────────────────────────────┐
│  Your Rating                             │
│  [★★★★☆]  4.3  ·  12 total reviews      │
│  "This is how patients see you on the    │
│   platform."                             │
└──────────────────────────────────────────┘

[If no reviews]:
  "No reviews yet. Complete appointments to receive patient feedback."

[For each review — simplified card]:
┌──────────────────────────────────────────┐
│  [Patient initial]  Patient Name         │
│  [★★★★☆]  ·  Month, Year                │
│  "Review comment text..."                │
└──────────────────────────────────────────┘
```

**Note text at top of section:**
```
"Reviews are submitted by patients after completed appointments.
 Contact support if you believe a review violates platform guidelines."
```

## Navigation Update

Add to doctor dashboard sidebar:
```
⭐ My Reviews → /doctor/reviews
```

## Validation Checkpoints
- [ ] Doctor can see all their visible reviews
- [ ] Rating summary shows correct average and count
- [ ] Empty state shows for doctors with no reviews yet
- [ ] No edit or delete controls visible to the doctor

---

# PROMPT 7.9 — Admin Review Moderation UI

## Objective
Add a review moderation section to the admin dashboard. Admin can see all reviews (including hidden ones), toggle their visibility, and monitor the overall reviews health of the platform.

## Implementation Scope
- Create `client/src/components/admin/ReviewsTable.jsx`
- Create `client/src/api/admin.review.api.js` (or extend `admin.api.js`)
- Modify `client/src/pages/admin/AdminDashboard.jsx` or create a dedicated admin reviews page

## API Additions

```js
// Add to admin API file
export const getAllReviewsAdmin = (page = 1, limit = 10) =>
  axiosInstance.get(`/reviews/admin/all?page=${page}&limit=${limit}`);

export const toggleReviewVisibility = (reviewId) =>
  axiosInstance.patch(`/reviews/${reviewId}/visibility`);
```

## ReviewsTable.jsx — Component Specification

**State:** `reviews`, `loading`, `currentPage`, `totalPages`, `toggling` (reviewId being toggled)

**Table Columns:**
```
Patient | Doctor | Rating | Comment (truncated) | Visible | Date | Action
```

**Visible Column:** Green "Visible" badge or Red "Hidden" badge based on `isVisible`.

**Action Column:** Toggle button — "Hide" if visible, "Unhide" if hidden.

**On Toggle:**
```js
1. Set toggling = reviewId
2. Call toggleReviewVisibility(reviewId)
3. On success: update review in local state (flip isVisible), show toast
4. Set toggling = null
```

**Comment Display:** Truncate to 80 characters with ellipsis.

**Table Layout:**

```
Platform Reviews

[Table header]
[Table rows with toggle actions]
[Pagination]
[Empty state if no reviews]
```

## Validation Checkpoints
- [ ] Admin sees all reviews including hidden ones
- [ ] Visible badge color is correct per `isVisible` state
- [ ] Toggle button updates review visibility and shows toast
- [ ] After hiding: review card on doctor profile page no longer shows the review
- [ ] After hiding: doctor's `averageRating` in Atlas reflects the removal
- [ ] Pagination works

## Common Mistakes to Avoid
- **Do NOT** reload the full table after a toggle — update the specific row in local state
- **Do NOT** use a hard delete on reviews from the admin panel — only visibility toggle

---

# PROMPT 7.10 — Rating Display on Doctor Cards (Discovery Page)

## Objective
Update the doctor listing cards on the discovery/search page to display the doctor's average rating and total review count. This is the final integration of the review system into the core marketplace loop — reviews now visibly influence doctor selection.

## Architecture Reasoning
The `averageRating` and `totalReviews` fields are already on the DoctorProfile documents from the denormalization in Prompt 7.1. The discovery page API from Phase 4 already returns DoctorProfile documents. This prompt requires only frontend changes — the data is already there, it just needs to be surfaced on the card.

## Implementation Scope
- Modify `client/src/components/doctors/DoctorCard.jsx` — add rating display
- Modify `client/src/pages/public/DoctorListingPage.jsx` — add rating sort option
- No backend changes needed

## DoctorCard.jsx Modification

Add rating display below the doctor's specialization line:

```jsx
{doctor.totalReviews > 0 ? (
  <div className="flex items-center gap-1 text-sm">
    <StarRating rating={doctor.averageRating} size="sm" />
    <span className="text-gray-600">
      {doctor.averageRating} ({doctor.totalReviews} review{doctor.totalReviews !== 1 ? 's' : ''})
    </span>
  </div>
) : (
  <span className="text-sm text-gray-400">No reviews yet</span>
)}
```

Import `StarRating` from the component created in Prompt 7.5.

## DoctorListingPage.jsx Modification

Add a "Sort by Rating" option to the existing sort/filter controls:

```jsx
// Add to sort options (alongside existing "Sort by Distance" if present):
<option value="rating">Highest Rated</option>
```

**Client-side sort logic:**
```js
// When sort === 'rating':
const sorted = [...doctors].sort((a, b) => b.averageRating - a.averageRating);
```

This sort is client-side because all doctors are already fetched. No backend query change needed for MVP.

## Validation Checkpoints
- [ ] Doctor cards on listing page show star rating and review count
- [ ] Doctors with no reviews show "No reviews yet"
- [ ] Rating count shows "1 review" (singular) vs "3 reviews" (plural) correctly
- [ ] "Sort by Rating" sorts the doctor list from highest to lowest rating
- [ ] `StarRating` component renders correctly at `size="sm"` on the card

## Common Mistakes to Avoid
- **Do NOT** make an additional API call to fetch ratings — they are already on the DoctorProfile object returned by the existing discovery API
- **Do NOT** show a rating of `0.0` for doctors with no reviews — check `totalReviews > 0` first

## Interview Explanation Points
- "The rating data is already on the DoctorProfile document — I denormalized it in the Review model's post-save hook specifically so that the discovery page can sort and display ratings without an additional aggregation query. This is the payoff of the architectural decision made when designing the Review schema."
- "Client-side sorting is sufficient here because the discovery page already has all doctor records loaded. A server-side sort parameter would only be needed if implementing cursor-based pagination in a future scale phase."

---

## Phase 7 Completion Gate

Before declaring the platform feature-complete for MVP demo, ALL of the following must be true:

```
✅ Review model created with post-save hook updating DoctorProfile rating
✅ DoctorProfile model has averageRating and totalReviews fields
✅ POST /api/reviews enforces all four eligibility gates
✅ Appointment.reviewSubmitted set to true after review creation
✅ GET /api/reviews/doctor/:doctorId returns visible reviews publicly
✅ GET /api/reviews/mine returns patient's review history
✅ GET /api/reviews/admin/all returns all reviews with pagination
✅ PATCH /api/reviews/:id/visibility toggles visibility and recalculates doctor rating
✅ Star rating component renders correctly for all values 1–5
✅ Doctor profile page shows reviews section with rating summary
✅ Review submission form appears on eligible appointment cards
✅ Interactive star selector works (hover + click)
✅ Submitted review updates appointment card state in-place
✅ Patient dashboard has My Reviews page showing submitted reviews
✅ Doctor dashboard has My Reviews page (read-only)
✅ Admin dashboard has reviews table with hide/unhide toggle
✅ Doctor listing cards show averageRating and totalReviews
✅ Doctor listing page has "Sort by Rating" option
✅ Hiding a review correctly reduces doctor's averageRating
✅ All loading states, empty states, and error states handled
```

**Phase 7 completes the core marketplace loop:**

```
Doctor registers → Admin verifies → Doctor sets availability
→ Patient discovers → Patient books → Patient pays
→ Appointment completed → Patient reviews → Rating visible on listing
```

Every phase feeds the next. The platform is now a functional, demonstrable SaaS MVP.

---

**All 7 phases are now complete. The full prompt library covers:**

| Phase | Focus | Prompts |
|-------|-------|---------|
| 1 | Foundation & Architecture | 1.1 – 1.x |
| 2 | Authentication & Role System | 2.1 – 2.x |
| 3 | Doctor Profiles & Admin Verification | 3.1 – 3.x |
| 4 | Discovery, Search & Proximity | 4.1 – 4.x |
| 5 | Availability Slots & Booking | 5.1 – 5.10 |
| 6 | Razorpay Payment Integration | 6.1 – 6.10 |
| 7 | Reviews & Ratings | 7.1 – 7.10 |