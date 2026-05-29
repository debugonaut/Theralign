Full context locked. Here is the complete Phase 10 prompt set.

---

# PhysioConnect — Phase 10 Complete Prompt Set
## Polish, Landing Page & Deployment

---

# PROMPT 10.1 — Landing Page: Hero Section & Core Layout

## Objective
Build the public landing page hero section — the first thing any visitor sees before they log in or browse doctors. This is the platform's primary conversion surface: it must communicate what PhysioConnect does, establish trust, and drive visitors toward two actions — booking a doctor or registering as a doctor.

## Architecture Reasoning
The landing page is architecturally simple but strategically important. Every other phase built the platform's operational machinery. This prompt makes it presentable to the outside world. The hero section must work without any API calls — it is a pure static marketing surface. The AI symptom search box built in Phase 8 (`SymptomSearchBox`) is embedded directly in the hero, making the AI feature the first interaction point for new visitors. This is deliberate: it differentiates PhysioConnect from a generic doctor listing site immediately on arrival.

## Implementation Scope
- Modify `client/src/pages/public/LandingPage.jsx` — replace stub with full implementation
- Create `client/src/components/landing/HeroSection.jsx`
- Create `client/src/components/landing/StatsBar.jsx`
- No backend changes needed for this prompt

## Existing Dependencies
- `SymptomSearchBox.jsx` — built in Phase 8
- `Button.jsx` common component — exists from Phase 1
- Tailwind design tokens — configured
- React Router `Link` — available

## HeroSection.jsx — Component Specification

**No props. No state. No API calls. Pure JSX.**

**Layout:**

```
──────────────────────────────────────────────────────────
[Navbar — already exists]
──────────────────────────────────────────────────────────

[Full-width hero — min-height 90vh, centered content]

  [Left column — 55% width on desktop, full on mobile]

    Eyebrow text (small caps, primary color):
    "India's Physiotherapy Marketplace"

    H1 (large, bold, dark):
    "Find the Right
     Physiotherapist,
     Near You."

    Subtext (gray, readable):
    "Connect with verified physiotherapy specialists for
     orthopedic, sports, neurological, and post-surgical
     care. Book online. Pay securely."

    [SymptomSearchBox component — embedded inline]
    Label above it: "Or describe your symptoms:"

    CTA row:
    [Browse All Doctors →]  [Register as a Doctor]
    Primary filled button   Ghost/outline button

  [Right column — 45% width, hidden on mobile]
    Decorative illustration or abstract gradient card
    (Use a CSS gradient blob / geometric pattern — no image dependency)

──────────────────────────────────────────────────────────
```

**Hero Background:**
Use a subtle light gradient rather than a flat white. Suggested:
```css
background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%);
```
This uses the existing Tailwind `sky-50`/`sky-100` range — no custom config needed.

**H1 Typography:**
```jsx
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary leading-tight">
  Find the Right<br />
  <span className="text-primary">Physiotherapist,</span><br />
  Near You.
</h1>
```
The `text-primary` accent on "Physiotherapist" creates visual hierarchy and reinforces the brand color.

**Mobile Responsiveness:**
- Stack columns vertically on mobile (`flex-col` → `md:flex-row`)
- Right column illustration hidden below `md` breakpoint
- H1 font scales down with responsive classes
- Full-width buttons on mobile

## StatsBar.jsx — Component Specification

Rendered directly below the hero. A horizontal bar with 4 trust metrics.

```
┌──────────────────────────────────────────────────────────────┐
│  500+              15+                4.8★              100%  │
│  Verified Doctors  Specializations    Avg. Rating       Secure│
└──────────────────────────────────────────────────────────────┘
```

**These are static marketing numbers — hardcoded, not fetched from API.**

```jsx
const stats = [
  { value: '500+',  label: 'Verified Doctors' },
  { value: '15+',   label: 'Specializations' },
  { value: '4.8★',  label: 'Average Rating' },
  { value: '100%',  label: 'Secure Payments' },
];
```

**Style:** White card with subtle shadow, `flex` row with dividers between items on desktop, `grid-cols-2` on mobile.

## LandingPage.jsx Assembly

```jsx
// LandingPage.jsx
import HeroSection from '../../components/landing/HeroSection'
import StatsBar from '../../components/landing/StatsBar'
// Additional sections imported in later prompts

const LandingPage = () => (
  <div>
    <HeroSection />
    <StatsBar />
    {/* SpecializationsSection — Prompt 10.2 */}
    {/* HowItWorksSection — Prompt 10.2 */}
    {/* FeaturedDoctorsSection — Prompt 10.2 */}
    {/* CTABannerSection — Prompt 10.2 */}
    {/* Footer — already exists */}
  </div>
)
```

## Validation Checkpoints
- [ ] Landing page renders without errors at `/`
- [ ] Hero text is readable and correctly sized on desktop and mobile
- [ ] `SymptomSearchBox` renders in the hero and functions correctly
- [ ] "Browse All Doctors" button navigates to `/doctors`
- [ ] "Register as a Doctor" button navigates to `/register`
- [ ] StatsBar renders below the hero with correct metrics
- [ ] Right column is hidden on mobile — no layout overflow
- [ ] Page loads with no API calls (purely static hero)

## Common Mistakes to Avoid
- **Do NOT** fetch any data in the hero section — it must load instantly
- **Do NOT** use external images or image dependencies — use CSS gradients and text
- **Do NOT** use `<a href>` for internal navigation — always `<Link to>`
- **Do NOT** hardcode auth state logic here — the Navbar already handles that

## Interview Explanation Points
- "The hero embeds the AI symptom search directly rather than making it a separate feature page. The AI is the differentiator — surfacing it immediately on the landing page makes that clear to visitors before they've read a single word of copy."
- "The stats bar uses static numbers rather than real-time API data because marketing numbers don't need to be exact — and loading the hero with a spinner while fetching user counts would hurt first impressions."

---

# PROMPT 10.2 — Landing Page: Supporting Sections

## Objective
Build the three supporting sections below the hero: a specializations grid, a how-it-works step flow, and a featured doctors row. Together these sections complete the landing page conversion funnel — trust, education, and social proof before the footer.

## Implementation Scope
- Create `client/src/components/landing/SpecializationsSection.jsx`
- Create `client/src/components/landing/HowItWorksSection.jsx`
- Create `client/src/components/landing/FeaturedDoctorsSection.jsx`
- Create `client/src/components/landing/CTABannerSection.jsx`
- Modify `LandingPage.jsx` to include all four sections

## Existing Dependencies
- `DoctorCard.jsx` — exists from Phase 4 (reused in FeaturedDoctors)
- `StarRating.jsx` — exists from Phase 7
- `axiosInstance.js` — for FeaturedDoctors API call
- Tailwind — configured

---

## SpecializationsSection.jsx

**Purpose:** Show the breadth of physiotherapy care available on the platform. Each specialization is a clickable card that navigates to the discovery page filtered by that specialization.

**No API call — data is static.**

```jsx
const specializations = [
  { name: 'Orthopedic',       icon: '🦴', query: 'Orthopedic Physiotherapy' },
  { name: 'Sports',           icon: '⚡', query: 'Sports Physiotherapy' },
  { name: 'Neurological',     icon: '🧠', query: 'Neurological Physiotherapy' },
  { name: 'Post-Surgical',    icon: '🏥', query: 'Post-Surgical Rehabilitation' },
  { name: 'Pediatric',        icon: '👶', query: 'Pediatric Physiotherapy' },
  { name: 'Geriatric',        icon: '🧓', query: 'Geriatric Physiotherapy' },
  { name: 'Spinal',           icon: '🔗', query: 'Postural & Spinal Rehabilitation' },
  { name: "Women's Health",   icon: '🌸', query: "Women's Health Physiotherapy" },
];
```

**Layout:**
```
Browse by Specialization
Find the exact care you need.

[Grid: 4 cols desktop, 2 cols mobile]
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│   🦴   │  │   ⚡   │  │   🧠   │  │   🏥   │
│Orthoped│  │ Sports │  │Neurolog│  │Post-Sur│
└────────┘  └────────┘  └────────┘  └────────┘
```

Each card: white background, rounded border, hover lifts with shadow, cursor pointer.

**On click:**
```jsx
<Link to={`/doctors?specialization=${encodeURIComponent(spec.query)}`}>
```
This uses the existing Phase 4 query string filtering — no backend changes needed.

---

## HowItWorksSection.jsx

**Purpose:** Educate new visitors on the 4-step booking process. Reduces hesitation. Pure static content.

```
How It Works
Book your physiotherapy appointment in minutes.

Step 1          Step 2          Step 3          Step 4
[🔍]            [👨‍⚕️]            [📅]            [✅]
Describe        Browse          Book a          Get Better
Symptoms    →   Doctors     →   Slot        →   Faster

Use our AI      Verified        Choose a        Attend your
symptom         specialists     time that       session and
search or       in your area    works for you   recover well
browse directly
```

**Layout:** Horizontal row with arrow connectors on desktop, vertical stack on mobile.

**Style:** Light gray section background (`bg-gray-50`), number badges on each step circle.

---

## FeaturedDoctorsSection.jsx

**Purpose:** Show real, top-rated verified doctors from the platform. This is the one section that makes an API call — it fetches the top 3 highest-rated doctors.

**State:** `doctors`, `loading`

**On Mount:**
```js
// Reuse existing doctor discovery API
GET /api/doctors?limit=3&sortBy=rating&verified=true
```

If the API does not currently support `sortBy=rating` as a query param, implement client-side sort after fetching: `doctors.sort((a,b) => b.averageRating - a.averageRating).slice(0, 3)`

**Layout:**
```
Meet Our Top Physiotherapists
Trusted by hundreds of patients across India.

[Grid: 3 cols desktop, 1 col mobile]
[DoctorCard] [DoctorCard] [DoctorCard]

[Browse All Doctors →] button centered below
```

**Reuse the existing `DoctorCard` component** from Phase 4 — no new card design needed.

**Fallback:** If API fails or returns empty, hide the section entirely (no error state visible to visitors).

---

## CTABannerSection.jsx

**Purpose:** Final conversion push before the footer. Two audiences: patients and doctors.

```
[Full-width banner, primary gradient background]

Ready to Feel Better?                  Are You a Physiotherapist?
Book your first appointment today.     Join our verified network.

[Find a Doctor →]                      [Register as a Doctor →]
```

**Layout:** Two-column split on desktop, stacked on mobile.
**Background:** `bg-gradient-to-r from-primary to-primary-dark` (use Tailwind custom tokens from Phase 1).
**Text:** White on the gradient background.

---

## LandingPage.jsx Final Assembly

```jsx
const LandingPage = () => (
  <div>
    <HeroSection />
    <StatsBar />
    <SpecializationsSection />
    <HowItWorksSection />
    <FeaturedDoctorsSection />
    <CTABannerSection />
    <Footer />
  </div>
)
```

## Validation Checkpoints
- [ ] Specialization cards render in 4-column grid on desktop
- [ ] Clicking a specialization card navigates to `/doctors?specialization=...`
- [ ] Discovery page filters correctly from the landing page link
- [ ] How It Works section renders correctly on mobile (vertical stack)
- [ ] Featured doctors section shows 3 real doctor cards from API
- [ ] Featured doctors section hides gracefully if API returns empty
- [ ] CTA banner renders with correct gradient and both buttons work
- [ ] Full landing page scrolls end-to-end without layout breaks

## Common Mistakes to Avoid
- **Do NOT** make multiple API calls from the landing page — only FeaturedDoctors fetches data, and it fails silently
- **Do NOT** add animations or scroll effects — keep the page fast and simple
- **Do NOT** create a new DoctorCard variant — reuse the existing one exactly

## Interview Explanation Points
- "The landing page makes exactly one API call — for featured doctors. Everything else is static. This keeps the initial page load fast and ensures the marketing copy is always visible regardless of backend state."
- "I reuse the existing DoctorCard component in the featured doctors section. The design system established in Phase 1 means components built for one context work in another without modification."

---

# PROMPT 10.3 — Navbar Polish & Responsive Navigation

## Objective
Polish the existing Navbar to its final production state. Add role-aware navigation links, a mobile hamburger menu, active route highlighting, and the correct CTA buttons for logged-in vs logged-out states. This is the global navigation — it appears on every page.

## Architecture Reasoning
The Navbar was created as a shell in Phase 1 and has been in use since Phase 2. By Phase 10, auth context, role-based routing, and all page routes are complete. Now the Navbar can be fully implemented without stubs or placeholders. A responsive mobile menu is essential because many patients will access the platform on mobile — the Navbar must not break on small screens.

## Implementation Scope
- Modify `client/src/components/layout/Navbar.jsx` — replace stub/partial with complete implementation
- No backend changes needed

## Existing Dependencies
- Auth context — provides `user`, `logout` function
- React Router `Link`, `useLocation`, `useNavigate` — available
- Tailwind — configured

## Navbar State

```js
const { user, logout } = useAuthContext()
const location = useLocation()
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
```

## Navigation Link Sets

```js
// Public links (always visible)
const publicLinks = [
  { label: 'Find Doctors', to: '/doctors' },
]

// Role-specific dashboard links (shown when logged in)
const roleLinks = {
  patient: [
    { label: 'Dashboard',    to: '/patient/dashboard' },
    { label: 'Appointments', to: '/patient/appointments' },
    { label: 'Payments',     to: '/patient/payments' },
  ],
  doctor: [
    { label: 'Dashboard',    to: '/doctor/dashboard' },
    { label: 'Availability', to: '/doctor/availability' },
    { label: 'Appointments', to: '/doctor/appointments' },
    { label: 'Earnings',     to: '/doctor/earnings' },
  ],
  admin: [
    { label: 'Admin Panel',  to: '/admin/dashboard' },
  ],
}
```

## Navbar Layout

**Desktop (md and above):**
```
[PhysioConnect Logo]    [Find Doctors]    [Dashboard links if logged in]    [Login / Register] or [User Menu ▾]
```

**Mobile (below md):**
```
[PhysioConnect Logo]                                    [☰ hamburger]
─────────────────────────────────────────── (dropdown when open)
  Find Doctors
  Dashboard
  Appointments
  [Login] or [Logout]
```

## Active Link Styling

```jsx
const isActive = (path) => location.pathname.startsWith(path)

// Active link class:
isActive(link.to)
  ? 'text-primary font-semibold border-b-2 border-primary'
  : 'text-gray-600 hover:text-primary'
```

## User Menu (Logged In State)

When `user` exists, replace the Login/Register buttons with:
```
[User avatar initial circle]  [user.name ▾]
  ↓ dropdown on click:
  My Profile
  ─────────
  Logout
```

Avatar circle:
```jsx
<div className="w-8 h-8 rounded-full bg-primary text-white
                flex items-center justify-center text-sm font-semibold">
  {user.name.charAt(0).toUpperCase()}
</div>
```

Dropdown closes when clicking outside — use a `useEffect` with a `mousedown` event listener on `document`.

## Logged Out State

```jsx
<Link to="/login">
  <Button variant="ghost">Log In</Button>
</Link>
<Link to="/register">
  <Button variant="primary">Get Started</Button>
</Link>
```

## Mobile Menu Implementation

```jsx
{mobileMenuOpen && (
  <div className="md:hidden border-t border-gray-100 py-4 px-4 space-y-3">
    {[...publicLinks, ...(user ? roleLinks[user.role] : [])].map(link => (
      <Link
        key={link.to}
        to={link.to}
        onClick={() => setMobileMenuOpen(false)}
        className="block text-gray-700 hover:text-primary py-2"
      >
        {link.label}
      </Link>
    ))}
    {user
      ? <button onClick={logout} className="text-red-500 py-2 block">Logout</button>
      : <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2">Login</Link>
    }
  </div>
)}
```

## Validation Checkpoints
- [ ] Navbar renders correctly on all pages
- [ ] Public links visible to all users
- [ ] Role-specific links appear after login with correct role
- [ ] Active page link shows highlight/underline styling
- [ ] User avatar and dropdown appear when logged in
- [ ] Logout from dropdown works and redirects to landing page
- [ ] Mobile hamburger menu opens and closes correctly
- [ ] Mobile menu links close the menu on click
- [ ] Navbar does not cause horizontal overflow on any screen width

## Common Mistakes to Avoid
- **Do NOT** fetch user data inside the Navbar — read from auth context only
- **Do NOT** render all role link sets and hide them with CSS — conditionally render the correct set
- **Do NOT** forget to close the mobile menu after navigation

## Interview Explanation Points
- "The Navbar reads from auth context rather than making API calls. Auth context is populated once at app load — the Navbar is always in sync with the current auth state without adding any network overhead."
- "Role-specific nav links are conditionally rendered based on the user's role — not hidden with CSS. Hidden elements can be revealed by browser dev tools; conditional rendering means the markup simply doesn't exist for links the user shouldn't access."

---

# PROMPT 10.4 — Global UI Polish Pass

## Objective
Apply a systematic polish pass across all existing pages and components. Fix inconsistent spacing, add missing loading skeletons, ensure empty states are present on all list views, standardize error handling patterns, and ensure every page has a proper title and meta structure. This prompt has no new features — only quality.

## Architecture Reasoning
The gap between a functioning MVP and a presentable SaaS demo is almost entirely polish. Interviewers and investors look at the details: does every button have a loading state? Does every list have an empty state? Does the spacing feel intentional? Phase 10 closes that gap systematically rather than hoping individual prompts handled it fully.

## Implementation Scope
Work through each area below. Each is a self-contained improvement pass.

---

### AREA 1: Loading Skeletons — Standardize Across All Pages

Create a reusable skeleton component if not already present:

```jsx
// client/src/components/common/Skeleton.jsx

// Usage:
// <Skeleton className="h-4 w-48" />        → text line
// <Skeleton className="h-32 w-full" />      → card placeholder
// <Skeleton className="h-10 w-10 rounded-full" /> → avatar

const Skeleton = ({ className = '' }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
)
```

**Pages that must use skeletons during loading (audit and fix):**
- Doctor listing page — skeleton doctor cards (3 rows of 3)
- Doctor profile page — skeleton for profile header and slot picker
- Patient appointments page — skeleton appointment cards
- Doctor appointments page — skeleton appointment cards
- Patient payment history — skeleton payment cards
- Admin appointments table — skeleton table rows
- Admin revenue page — skeleton metric cards

**Pattern for each:**
```jsx
if (loading) return <LoadingSkeleton />   // Show skeleton
if (error) return <ErrorState />          // Show error
if (data.length === 0) return <EmptyState /> // Show empty
return <ActualContent />                  // Show data
```

---

### AREA 2: Empty States — Ensure All List Views Have One

Every page that renders a list must have a designed empty state, not a blank white area.

**Standard empty state pattern:**
```jsx
// client/src/components/common/EmptyState.jsx

const EmptyState = ({ icon, title, description, actionLabel, actionTo }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm max-w-sm mb-6">{description}</p>
    {actionLabel && actionTo && (
      <Link to={actionTo}>
        <Button variant="primary">{actionLabel}</Button>
      </Link>
    )}
  </div>
)
```

**Audit list — ensure these empty states are correct:**

| Page | Empty State Icon | Title | Action |
|------|-----------------|-------|--------|
| Doctor listing | 🔍 | "No doctors found" | Clear filters |
| Patient appointments | 📅 | "No appointments yet" | Find a Doctor |
| Patient payments | 💳 | "No payments yet" | Find a Doctor |
| Patient reviews | ⭐ | "No reviews yet" | Find a Doctor |
| Doctor appointments | 📋 | "No appointments yet" | Manage Availability |
| Doctor availability | 🗓️ | "No slots added" | (form above) |
| Doctor reviews | ⭐ | "No reviews yet" | — |
| Admin appointments | 📋 | "No appointments on platform" | — |

---

### AREA 3: Button Loading States — Audit All Forms

Every form submit button must have a loading state. Audit all forms:

```
✅ Login form — "Logging in..." disabled state
✅ Register form — "Creating account..." disabled state
✅ Doctor profile edit — "Saving..." disabled state
✅ Add availability slot — "Adding..." disabled state
✅ Book appointment — "Booking..." disabled state
✅ Cancel appointment — "Cancelling..." disabled state
✅ Submit review — "Submitting..." disabled state
✅ Admin verify doctor — "Verifying..." disabled state
✅ Admin suspend doctor — "Suspending..." disabled state
```

For any that are missing, add:
```jsx
<Button disabled={submitting}>
  {submitting ? 'Processing...' : 'Submit'}
</Button>
```

---

### AREA 4: Toast Notification Audit

Ensure every user-triggered action has a toast. Audit for missing toasts:

```
Every successful API call → success toast (green)
Every failed API call → error toast (red)
Every warning/info action → neutral toast
```

Use `react-hot-toast` consistently throughout. Check that no page is silently swallowing errors in catch blocks without notifying the user.

---

### AREA 5: Form Validation — Client-Side Polish

Audit all forms for inline validation messages. Every required field should show a visible error message below the input when submitted empty, not just a browser default popup.

**Standard pattern:**
```jsx
{errors.fieldName && (
  <p className="text-red-500 text-xs mt-1">{errors.fieldName}</p>
)}
```

Priority forms to check:
- Login
- Register (patient and doctor paths)
- Doctor profile edit
- Add availability slot
- Review submission form

---

### AREA 6: Page Titles

Every page must set a `document.title` for browser tab clarity. Add to each page's `useEffect`:

```js
useEffect(() => { document.title = 'My Appointments — PhysioConnect' }, [])
```

Priority pages:
- Landing page: `'PhysioConnect — Find Your Physiotherapist'`
- Doctor listing: `'Find Doctors — PhysioConnect'`
- Doctor profile: `'Dr. {name} — PhysioConnect'`
- Patient dashboard: `'My Dashboard — PhysioConnect'`
- Doctor dashboard: `'Doctor Dashboard — PhysioConnect'`
- Admin dashboard: `'Admin Panel — PhysioConnect'`

---

### AREA 7: Consistent Section Spacing

Audit all dashboard pages for spacing consistency. Apply these standards:
- Page container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`
- Section gap: `space-y-8` between major page sections
- Card internal padding: `p-6` standard, `p-4` for compact cards
- Grid gaps: `gap-6` for card grids

---

## Validation Checkpoints
- [ ] All loading states use `Skeleton` component — no blank white screens
- [ ] All list pages have designed empty states with relevant icons and text
- [ ] All form submit buttons are disabled during API calls
- [ ] All API call results show a toast (success or error)
- [ ] Browser tab title updates correctly on each page
- [ ] No console errors on any page during normal usage
- [ ] Page container spacing is consistent across all dashboard pages

## Interview Explanation Points
- "A systematic polish pass at the end ensures the product feels intentional rather than assembled. Interviewers remember the 'feel' of using an app, not just its feature list."
- "The skeleton/empty/error/data pattern is applied consistently across all list views. This eliminates the janky blank-flash during loading that makes apps feel unfinished."

---

# PROMPT 10.5 — Footer Component

## Objective
Build a complete, professional footer component that replaces the Phase 1 stub. The footer appears on all public pages and provides navigation, legal text, and platform identity.

## Implementation Scope
- Modify `client/src/components/layout/Footer.jsx` — replace stub

## Footer Layout

```
──────────────────────────────────────────────────────────
[PhysioConnect logo + tagline]   [Platform]  [For Doctors]  [Support]
"Connecting patients with         Find Doctors  Register        About
verified physiotherapists         How It Works  Doctor Login    Contact
across India."                    All Specs.    Pricing         FAQ

──────────────────────────────────────────────────────────
© 2025 PhysioConnect. All rights reserved.  |  Privacy Policy  |  Terms of Service
──────────────────────────────────────────────────────────
```

**Column 1 (brand):** Logo + one-line brand description + social icons (placeholder links, no real accounts needed)

**Columns 2-4 (links):** Use `Link` for internal routes, `#` placeholder for legal pages not built.

**Bottom bar:** Copyright line + two legal placeholder links.

**Layout:** 4-column grid on desktop, 2-column on tablet, 1-column on mobile.
**Background:** Dark (`bg-gray-900`), light text (`text-gray-300`), white for column headers.

## Validation Checkpoints
- [ ] Footer renders on landing page, doctor listing, and doctor profile pages
- [ ] Footer does NOT appear on dashboard pages (patient/doctor/admin)
- [ ] All internal links navigate correctly
- [ ] Footer is responsive — no overflow on mobile

## Implementation Note on Dashboard Exclusion

The existing `AppRoutes.jsx` likely wraps public routes with a `PublicLayout` (Navbar + Footer) and dashboard routes with a `DashboardLayout` (sidebar + no footer). Ensure the Footer is only rendered inside `PublicLayout`. If this separation does not currently exist cleanly, add it now — it is a routing structure concern, not a Footer concern.

---

# PROMPT 10.6 — Error Pages & Route Guards Polish

## Objective
Build the 404 Not Found page and the 403 Unauthorized page. Polish the existing `ProtectedRoute` component to redirect cleanly with a return URL so users land back where they intended after logging in.

## Implementation Scope
- Create `client/src/pages/public/NotFoundPage.jsx`
- Create `client/src/pages/public/UnauthorizedPage.jsx`
- Modify `client/src/routes/ProtectedRoute.jsx` — add return URL redirect
- Modify `client/src/routes/AppRoutes.jsx` — wire 404 catch-all

## NotFoundPage.jsx

```
┌──────────────────────────────────────┐
│                                      │
│            404                       │
│    Oops! Page not found.             │
│                                      │
│  The page you're looking for doesn't │
│  exist or has been moved.            │
│                                      │
│  [← Back to Home]                    │
│                                      │
└──────────────────────────────────────┘
```

Large `404` in primary color, centered, clean. No images needed.

## UnauthorizedPage.jsx

```
┌──────────────────────────────────────┐
│            🔒                        │
│    Access Restricted                 │
│                                      │
│  You don't have permission to        │
│  view this page.                     │
│                                      │
│  [Go to Dashboard]  [Log Out]        │
└──────────────────────────────────────┘
```

## ProtectedRoute Return URL Enhancement

```jsx
// ProtectedRoute.jsx

import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuthContext()
  const location = useLocation()

  if (!user) {
    // Save the intended destination
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
```

## Login Page — Handle Return URL

```jsx
// After successful login:
const navigate = useNavigate()
const location = useLocation()

const from = location.state?.from || `/${user.role}/dashboard`
navigate(from, { replace: true })
```

This means: if a patient tries to access `/patient/appointments` while logged out, they are redirected to `/login`. After logging in, they land directly on `/patient/appointments` instead of the generic dashboard.

## AppRoutes.jsx — Wire 404

```jsx
// Catch-all route (must be last in route list)
<Route path="*" element={<NotFoundPage />} />
```

## Validation Checkpoints
- [ ] Navigating to `/nonexistent-route` shows the 404 page
- [ ] Accessing a protected route while logged out redirects to `/login`
- [ ] After login, user lands on the page they originally tried to access
- [ ] Accessing a role-restricted page with wrong role shows `/unauthorized`
- [ ] "Go to Dashboard" on unauthorized page routes to correct role dashboard

---

# PROMPT 10.7 — Performance & Code Quality Pass

## Objective
Apply targeted performance improvements that are visible at demo time: lazy-load route components to reduce initial bundle size, add `React.memo` to expensive list components, ensure no unnecessary re-renders on the discovery page, and clean up any `console.log` statements left in production code.

## Architecture Reasoning
Performance improvements at this stage are not about micro-optimization. They are about two things: (1) the initial page load time, which affects every visitor's first impression, and (2) the responsiveness of the discovery page, which is the most data-heavy page in the application. Both are directly observable during a demo.

## Implementation Scope
- Modify `client/src/routes/AppRoutes.jsx` — lazy load all page components
- Modify `client/src/components/doctors/DoctorCard.jsx` — wrap with `React.memo`
- Audit and remove all `console.log` statements from production code
- Add `loading="lazy"` to all images

---

### Route-Level Code Splitting

```jsx
// AppRoutes.jsx — Replace static imports with lazy imports

import { lazy, Suspense } from 'react'

// Replace:
// import LandingPage from '../pages/public/LandingPage'

// With:
const LandingPage = lazy(() => import('../pages/public/LandingPage'))
const DoctorListingPage = lazy(() => import('../pages/public/DoctorListingPage'))
const DoctorProfile = lazy(() => import('../pages/public/DoctorProfile'))
const PatientDashboard = lazy(() => import('../pages/patient/PatientDashboard'))
const DoctorDashboard = lazy(() => import('../pages/doctor/DoctorDashboard'))
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
// ... lazy-load all page components

// Wrap routes in Suspense:
<Suspense fallback={<PageLoadingSpinner />}>
  <Routes>
    {/* ... all routes */}
  </Routes>
</Suspense>
```

**Result:** The initial JS bundle only loads landing page code. Dashboard code is only downloaded when the user navigates there.

---

### DoctorCard Memoization

```jsx
// DoctorCard.jsx — wrap export

export default React.memo(DoctorCard)
```

The discovery page renders many DoctorCard instances. Without `memo`, every filter or sort interaction re-renders all visible cards. With `memo`, only cards whose `doctor` prop actually changed re-render.

---

### Image Lazy Loading

On all `<img>` tags across the app:
```jsx
<img src={doctor.profileImage} loading="lazy" alt={doctor.name} />
```

This defers off-screen images until the user scrolls near them — critical on the doctor listing page with many profile images.

---

### Console.log Cleanup

Search the entire `client/src` and `server/src` directories for `console.log` statements. Remove all that were added for debugging. Keep only intentional `console.error` and `console.warn` in error handlers.

```bash
# Find all console.log in client
grep -r "console.log" client/src --include="*.jsx" --include="*.js"

# Find all console.log in server
grep -r "console.log" server/src --include="*.js"
```

---

## Validation Checkpoints
- [ ] Browser Network tab shows code splitting working — dashboard chunks only load when navigated to
- [ ] DoctorCard is wrapped in `React.memo`
- [ ] All profile images have `loading="lazy"`
- [ ] No `console.log` statements in production code
- [ ] App loads without console errors on all major pages

---

# PROMPT 10.8 — Backend Production Hardening

## Objective
Apply production-level hardening to the Express backend: tighten CORS configuration for production domains, add request rate limiting, verify all environment variables are present at startup, add the health check endpoint used by Render's health monitoring, and ensure all unhandled promise rejections are caught.

## Architecture Reasoning
A development server is forgiving. A production server must fail loudly on misconfiguration and resist abuse. These hardening steps are not complex individually, but together they represent the difference between a server that is ready for real traffic and one that would crash silently or be trivially abused. Each step has a direct interview justification.

## Implementation Scope
- Modify `server/src/app.js` — CORS tightening, rate limiting, health check
- Modify `server/src/server.js` — startup env validation, unhandled rejection handling
- Install `express-rate-limit`

---

### Package Installation

```bash
npm install express-rate-limit
```

---

### CORS Tightening

```js
// app.js — Replace permissive CORS with environment-aware config

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.CLIENT_URL]           // e.g., https://physioconnect.vercel.app
  : ['http://localhost:5173', 'http://localhost:3000']

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS blocked: ${origin}`))
    }
  },
  credentials: true,
}))
```

Add to `server/.env`:
```
CLIENT_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

---

### Rate Limiting

```js
// app.js

import rateLimit from 'express-rate-limit'

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 100,                    // 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
})

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                     // 10 login attempts per 15 minutes
  message: { message: 'Too many login attempts. Please try again later.' },
})

app.use('/api', apiLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
```

---

### Startup Environment Validation

```js
// server.js — Validate required env vars on startup before connecting DB

const REQUIRED_ENV_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
]

const missingVars = REQUIRED_ENV_VARS.filter(key => !process.env[key])

if (missingVars.length > 0) {
  console.error(`STARTUP ERROR: Missing required environment variables:`)
  console.error(missingVars.join(', '))
  process.exit(1)   // Hard exit — do not start with missing config
}
```

Note: `OPENAI_API_KEY` is intentionally excluded from required vars because the AI service degrades gracefully without it (Phase 8 design decision).

---

### Health Check Endpoint

```js
// app.js — Add health check (must be before auth middleware)

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
})
```

Render uses this endpoint to determine if the server is healthy. Configure in Render dashboard: Health Check Path → `/health`.

---

### Unhandled Rejection Safety Net

```js
// server.js — Catch unhandled promise rejections

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason)
  // Do NOT crash the server in production — log and continue
  // In future: integrate with error tracking (Sentry)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)   // Uncaught exceptions are unrecoverable — exit and let Render restart
})
```

---

## Validation Checkpoints
- [ ] `GET /health` returns 200 with status JSON
- [ ] Starting server with a missing required env var prints clear error and exits
- [ ] CORS blocks requests from domains not in `allowedOrigins` in production
- [ ] Rate limiter returns 429 after 100 requests within 15 minutes
- [ ] Auth limiter returns 429 after 10 login attempts
- [ ] No unhandled promise rejection crashes the server silently

## Interview Explanation Points
- "I validate all required environment variables at startup rather than discovering missing config at runtime when a specific feature is used. Fail fast, fail loudly — much easier to debug than a silent feature failure."
- "The health check endpoint is a Render deployment requirement, but it also documents the contract between the infrastructure and the application: if this endpoint returns 200, the server is ready to accept traffic."
- "Rate limiting on auth endpoints specifically prevents brute-force credential attacks. The general API limiter prevents scraping and abuse. Both use in-memory state which is sufficient for a single-instance MVP deployment."

---

# PROMPT 10.9 — Vercel & Render Deployment Configuration

## Objective
Configure both deployment targets for production. Set up Vercel for the React frontend and Render for the Express backend with all required settings, environment variables, and build configurations. Verify the full deployment pipeline works end-to-end.

## Implementation Scope
- Create `client/vercel.json` — SPA routing configuration
- Create `render.yaml` — Render service definition (optional but recommended)
- Document all environment variables for both platforms
- Verify production deployment

---

### Vercel Configuration (Frontend)

Create `client/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

**Why the rewrite rule?**
React Router handles routing client-side. Without this rule, navigating directly to `/patient/dashboard` on Vercel returns a 404 because Vercel looks for a file at that path. The rewrite serves `index.html` for all paths, letting React Router take over. This is the single most common Vercel deployment mistake for SPAs.

**Vercel Environment Variables (set in Vercel dashboard):**
```
VITE_API_URL=https://your-render-app.onrender.com
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx  (or test key)
```

**Vercel Build Settings:**
- Framework Preset: Vite
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`

---

### Render Configuration (Backend)

Create `render.yaml` in the project root (optional — can also configure via Render dashboard):

```yaml
services:
  - type: web
    name: physioconnect-api
    env: node
    rootDir: server
    buildCommand: npm install
    startCommand: node src/server.js
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        sync: false      # Set manually in Render dashboard
      - key: JWT_SECRET
        sync: false
      - key: CLIENT_URL
        value: https://your-vercel-app.vercel.app
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
      - key: RAZORPAY_KEY_ID
        sync: false
      - key: RAZORPAY_KEY_SECRET
        sync: false
      - key: OPENAI_API_KEY
        sync: false      # Optional — AI degrades gracefully without it
```

**Render Environment Variables (set in Render dashboard under Environment):**
```
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=<long random string — generate with: openssl rand -base64 64>
CLIENT_URL=https://your-vercel-app.vercel.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
OPENAI_API_KEY=sk-proj-...
```

---

### MongoDB Atlas Production Configuration

1. In MongoDB Atlas → Network Access → Add IP Address → Allow from anywhere (`0.0.0.0/0`) OR add Render's static IP (preferred for security)
2. Ensure the database user has `readWrite` on the production database
3. Use a separate database name for production vs development:
   - Dev: `physioconnect-dev`
   - Prod: `physioconnect-prod`
   Update `MONGO_URI` accordingly.

---

### Razorpay Live Mode Checklist

Before switching from test to live keys:
```
□ Razorpay account KYC completed
□ Live API keys generated in Razorpay dashboard
□ Update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to live keys
□ Update VITE_RAZORPAY_KEY_ID to live key ID on Vercel
□ Test one live payment with a real card for ₹1
□ Verify Payment document is created in production MongoDB
```

Note: For an interview/portfolio demo, test keys are completely acceptable. Only switch to live keys when real patients are paying real money.

---

### Deployment Verification Checklist

Run through this after deployment:

```
□ https://your-app.vercel.app loads the landing page
□ https://your-api.onrender.com/health returns { status: 'ok' }
□ Registration creates a user (test via Postman or app UI)
□ Login returns JWT (verify network tab)
□ Doctor listing loads from production API
□ Doctor profile page loads with correct data
□ Booking flow completes end-to-end (use Razorpay test card)
□ Admin dashboard analytics load correctly
□ Images upload to Cloudinary (test profile image upload)
□ AI symptom search works (if OPENAI_API_KEY set)
□ No CORS errors in browser console
□ All pages accessible via direct URL (SPA routing working)
```

## Validation Checkpoints
- [ ] `vercel.json` exists in `client/` directory
- [ ] Direct URL navigation to `/patient/dashboard` works in production (not 404)
- [ ] All Vercel env vars set with `VITE_` prefix
- [ ] Render health check path set to `/health`
- [ ] All required env vars set in Render dashboard
- [ ] MongoDB Atlas network access allows Render's requests
- [ ] Production deployment passes the full verification checklist above

## Common Mistakes to Avoid
- **Do NOT** commit real API keys to git — always use environment variables
- **Do NOT** forget `vercel.json` rewrite rule — direct URL navigation will 404 without it
- **Do NOT** use development MongoDB URI in production — separate databases
- **Do NOT** set `NODE_ENV=development` on Render — it must be `production`

## Interview Explanation Points
- "The `vercel.json` rewrite is mandatory for any React Router SPA. Without it, refreshing the page or sharing a deep link returns a 404 from Vercel's CDN because the path doesn't correspond to a physical file."
- "I use separate MongoDB databases for development and production. This prevents seed data, test users, and development noise from appearing in production analytics."

---

# PROMPT 10.10 — Final Demo Preparation & README

## Objective
Prepare the project for presentation: write the final `README.md`, create a demo walkthrough sequence, verify all demo accounts are seeded, and run through the complete platform flow one final time. This prompt ensures the project is presentable to interviewers, collaborators, and the public.

## Implementation Scope
- Create `README.md` in the project root
- Final seed script verification
- Demo account credentials documentation
- Demo walkthrough script

---

### README.md Structure

```markdown
# PhysioConnect

A full-stack SaaS marketplace connecting patients with verified 
physiotherapy specialists across India.

## Live Demo
- Frontend: https://physioconnect.vercel.app
- API: https://physioconnect-api.onrender.com

## Demo Accounts
| Role    | Email                     | Password     |
|---------|---------------------------|--------------|
| Patient | patient@demo.com          | Demo@1234    |
| Doctor  | doctor@demo.com           | Demo@1234    |
| Admin   | admin@demo.com            | Demo@1234    |

## Tech Stack
[Full stack table — React/Vite/Tailwind, Node/Express, MongoDB Atlas,
JWT, Cloudinary, Razorpay, OpenAI gpt-4o-mini, Vercel, Render]

## Features
[Phase-by-phase feature list — 10 phases, complete feature set]

## Architecture
[Brief architecture diagram in ASCII or Mermaid]

## Local Development Setup
[Step-by-step: clone, install, env vars, seed, run]

## Environment Variables
[Complete list for both client and server with explanations]

## Phase Roadmap
[Table showing all 10 phases and their status]
```

---

### Demo Walkthrough Sequence

The recommended order for demonstrating the platform:

```
1. Landing Page (unauthenticated)
   → Show hero, AI symptom search, specializations grid
   → Enter symptoms: "knee pain after running" → see AI recommendation

2. Doctor Discovery
   → Click "Sports Physiotherapy" from AI recommendation
   → Browse filtered doctor listings with ratings
   → Open a doctor profile — see bio, AI summary, slots, reviews

3. Patient Journey (login as patient@demo.com)
   → Book an available slot
   → Complete Razorpay test payment (card: 4111 1111 1111 1111)
   → View confirmed appointment in dashboard

4. Doctor Journey (login as doctor@demo.com)
   → Show today's appointments on dashboard
   → Add availability slots for next week
   → View earnings page with monthly breakdown
   → View reviews about their profile

5. Admin Panel (login as admin@demo.com)
   → Show analytics dashboard — 8 metric cards, revenue chart
   → Show top doctors table
   → Show pending verification queue
   → Verify a new doctor
   → Show revenue page — total earnings, commission breakdown
   → Trigger AI batch summary generation

6. Review Flow (back to patient)
   → Find a completed appointment in history
   → Submit a star rating and review
   → Navigate to doctor profile — confirm review appears
```

---

### Final Seed Verification

Before the demo, run the seed script and verify:

```bash
cd server
node src/config/seed.js
```

Verify in MongoDB Atlas:
```
Users:          >= 20 (15 doctors, 3 patients, 1 admin, others)
DoctorProfiles: >= 15 (all verified, all with aiSummary)
Appointments:   >= 100 (30 days of historical data)
Payments:       >= 75 (completed and paid)
Reviews:        >= 30 (distributed across doctors)
AvailabilitySlots: >= 50 (next 7 days for all doctors)
```

---

### Pre-Demo Checklist

```
□ Production deployment live and accessible
□ All demo accounts work (login tested)
□ Seed data verified in MongoDB Atlas
□ Razorpay test payment completes successfully
□ AI symptom search returns a recommendation
□ Admin analytics charts render with data
□ No console errors on any page
□ Browser cache cleared before demo
□ README.md is accurate and complete
□ GitHub repository is public (if sharing)
□ .env files are NOT committed to git (.gitignore verified)
```

---

### .gitignore Verification

Ensure `server/.env` and `client/.env` are in `.gitignore`:

```
# In root .gitignore
server/.env
client/.env
node_modules/
dist/
.DS_Store
```

**This is non-negotiable.** API keys in public repositories are immediately harvested by bots and will result in unexpected charges on Razorpay, OpenAI, and Cloudinary accounts.

## Validation Checkpoints
- [ ] README.md exists at project root with all sections complete
- [ ] Live demo URLs are correct and accessible
- [ ] Demo accounts log in successfully in production
- [ ] Seed data matches the expected document counts above
- [ ] Pre-demo checklist items all checked off
- [ ] `.env` files confirmed absent from git history

## Interview Explanation Points
- "The README documents the entire project in under 5 minutes of reading — tech stack, live demo, setup instructions, and environment variables. A good README signals that you understand your audience is not just yourself."
- "I prepared a specific demo walkthrough sequence rather than improvising. Each step is chosen to showcase a different architectural decision — AI integration, payment flow, role-based access, real-time analytics."

---

## Phase 10 Completion Gate

```
✅ Landing page hero renders with AI symptom search embedded
✅ Stats bar shows platform trust metrics
✅ Specializations grid links to filtered discovery page
✅ How It Works section renders responsively
✅ Featured doctors section shows top 3 real doctors
✅ CTA banner renders with correct gradient and working links
✅ Navbar is fully responsive with mobile hamburger menu
✅ Role-specific nav links appear for correct roles after login
✅ Active route highlighting works on all nav links
✅ Skeleton component used consistently across all loading states
✅ EmptyState component used on all list-based pages
✅ All form submit buttons have loading/disabled states
✅ All user actions show appropriate toast notifications
✅ No console.log statements in production code
✅ Document titles set on all major pages
✅ Footer renders on all public pages, absent from dashboards
✅ 404 page renders for unmatched routes
✅ 403 page renders for unauthorized role access
✅ ProtectedRoute redirects to intended URL after login
✅ React.lazy() used for all page-level route components
✅ DoctorCard wrapped in React.memo
✅ All images have loading="lazy"
✅ Production CORS configured with CLIENT_URL env var
✅ Rate limiting active on all /api routes and auth routes specifically
✅ Startup env validation exits with clear error if vars are missing
✅ /health endpoint returns 200 and configured in Render
✅ vercel.json rewrite rule prevents SPA deep-link 404s
✅ Separate MongoDB databases for dev and production
✅ No API keys committed to git
✅ README.md complete with demo accounts and setup instructions
✅ Seed script produces verified document counts across all collections
✅ Pre-demo checklist completed and all items passing
✅ Full demo walkthrough tested end-to-end in production
```

---

## Complete Platform Summary — All 10 Phases

| Phase | Focus | Core Deliverable |
|-------|-------|-----------------|
| 1 | Foundation & Architecture | Monorepo, Express shell, React + Vite, Tailwind design system |
| 2 | Authentication & Role System | JWT auth, role-based guards, patient/doctor/admin sessions |
| 3 | Doctor Profiles & Admin Verification | Cloudinary uploads, verification workflow, profile management |
| 4 | Discovery, Search & Proximity | Geospatial queries, filters, doctor listing with sort |
| 5 | Availability Slots & Booking | Slot management, atomic booking lock, appointment lifecycle |
| 6 | Razorpay Payments | Order creation, signature verification, payment history |
| 7 | Reviews & Ratings | Star ratings, review gating, rating denormalization |
| 8 | AI Integration | Symptom search via GPT-4o-mini, doctor AI summaries |
| 9 | Admin Analytics | Aggregation service, revenue charts, platform operations |
| 10 | Polish, Landing Page & Deployment | Landing page, Navbar, production hardening, Vercel + Render |

**PhysioConnect is now a complete, production-deployed SaaS marketplace.**