The codebase structure is clearly visible. Every file and folder is mapped. Now I know exactly where every design decision lands in the actual implementation. Here is the appended prompt.

---

# Theralign — Structural Integrity & Universal Accessibility Prompt
## Appended to the Humanization Extension

---

## Context for This Appendix

The base humanization prompt softens the Swiss system. The extension prompt adds depth, state communication, and professional DNA. This appendix addresses the third and final layer: ensuring that every design decision made across all previous prompts works for every person who might use this platform — a 17-year-old athlete with a sports injury, a 35-year-old professional booking on their lunch break, a 58-year-old recovering from knee surgery, a 72-year-old whose grandchild helped them open the website for the first time.

The codebase structure confirms exactly where each of these decisions lives. The structural mapping is not theoretical — it is file-specific. Every recommendation below names the exact directory or file it applies to.

---

## Part 1 — Codebase Structure Preservation Rules

Before any design change is applied to any file, this rule applies universally and without exception: the directory structure visible in the screenshot is the contract. Nothing moves. Nothing is renamed. Nothing is extracted into a new folder that does not already exist.

The reason this must be stated explicitly is that design system implementations frequently introduce structural drift — a `design-system/` folder here, a `tokens/` folder there, an extracted `primitives/` directory that did not exist before. Every one of these structural additions creates a new mental model for the engineering team and the AI tools executing the work. The existing structure is already correct. It already separates concerns cleanly.

**`client/src/components/common/`** — all primitive components live here and only here. Button, Card, Badge, Input, Modal, Toast, Skeleton, EmptyState, SectionHeader. No new subdirectories inside `common/`. If a new primitive is needed it is a file inside `common/` — not a folder inside `common/`.

**`client/src/components/layout/`** — PublicLayout, DashboardLayout, AdminLayout, Navbar, Sidebar, Footer. These are the structural shells. The humanization changes to Navbar border, sidebar color, and layout container padding all happen in these files. No new layout files are introduced. AdminLayout receives the teal-navy sidebar. DashboardLayout receives the patient and doctor sidebar variants. PublicLayout receives the updated navbar and footer.

**`client/src/pages/public/`** — Landing, Login, Register, Doctor listing. All landing page section changes from Phase 2 and the humanization prompt apply to files in this directory. The landing page's section components — HeroSection, SpecializationsSection, HowItWorksSection, etc. — live as sub-components imported into `LandingPage.jsx`. They do not get their own subdirectory. They are colocated with the page that uses them, or placed in `components/landing/` if the component is used in more than one page context.

**`client/src/pages/patient/`** — every patient dashboard page. The appointment history, payment history, reviews, and profile pages are all here. Design changes to patient-facing surfaces apply to files in this directory only.

**`client/src/pages/doctor/`** — every doctor dashboard page. Availability manager, earnings, appointments, profile, reviews. Same principle.

**`client/src/pages/admin/`** — every admin dashboard page. The admin overview, verification queue, revenue, users, analytics. The teal-navy sidebar treatment applies here.

**`client/src/styles/`** — `index.css` only. All global CSS changes — the body background `#F8F8F6`, the noise texture, the pattern utilities, the scrollbar styling, the focus ring — live here and only here. No additional CSS files are created. No CSS modules. No styled-components. The Tailwind utility approach is the established pattern and it stays.

**`client/tailwind.config.js`** — all design tokens. Color palette, typography scale, spacing, border-radius values, box-shadow levels, transition durations. Single source of truth. Any token value used in any component that is not in this file is a violation of the system.

**`server/`** — untouched. The humanization prompt and all its extensions exist entirely in `client/`. The server directory structure — `config/`, `middleware/`, `routes/`, `utils/`, `app.js`, `server.js` — is not referenced, not imported, not modified in any way by any design change.

---

## Part 2 — Universal Age-Range Accessibility Framework

The platform serves patients from approximately age 14 to age 80. This is not a narrow user base with predictable technical fluency. A 16-year-old with a sports injury has grown up on TikTok and Instagram and will be unforgiving of anything that feels dated or clumsy. A 68-year-old with chronic back pain may be opening a healthcare booking platform for the first time in their life and will be unforgiving of anything that is confusing or small. Both must succeed on the same interface without knowing the other exists.

The design decisions below address this range directly. They are not generic accessibility improvements — they are specific calibrations for the actual age range this product serves.

---

### Calibration for Young Adult Users (Age 14–28)

This group has the highest technical fluency and the lowest patience. They will identify a dated interaction pattern within seconds and associate it with a product that is not worth their trust. They respond to visual confidence, fast feedback, and interfaces that respect their intelligence by not over-explaining.

**What they need from this product:**

Every interactive element must respond immediately. `150ms` transitions are the correct ceiling. Any delay above `150ms` on a tap or hover reads as lag to a user whose baseline is native mobile apps. The button press scale transform (`scale(0.97)` at `80ms`) specified in the extension prompt is especially important for this group — they are accustomed to physical confirmation from touchscreens and a button that does not visually press feels broken.

The smart search autocomplete from Feature F9 must feel instant. The `300ms` debounce is correct but the dropdown must appear with zero additional delay after the debounce fires. A young user typing `knee` expects suggestions to appear by the time they finish typing. A dropdown that appears `500ms` after they stop typing feels like a broken search, not a deliberate feature.

Navigation between pages must feel fast. The `200ms` opacity fade on route change specified in the extension prompt is the maximum transition time. Any entrance animation longer than this reads as sluggish to users who navigate quickly. The opacity fade works precisely because it is short enough to feel responsive and long enough to eliminate the jarring content snap.

The AI symptom search is a feature this group will use instinctively — they are comfortable with AI interfaces and will expect it to behave like a good language model interaction: fast, specific, and not condescending. The recommendation card that appears after the AI processes their symptoms must use conversational language in the response. Not `ORTHOPEDIC PHYSIOTHERAPY RECOMMENDED` but `Based on your symptoms, a Sports Physiotherapist is likely the right fit. Here's why:` — followed by one sentence of reasoning. The reasoning matters to this group. They do not just want a recommendation; they want to understand it.

**What not to do for this group:**

Do not add onboarding tooltips, feature tours, or explainer overlays. This group will dismiss them without reading them. The interface must be self-explanatory. If it requires a tour, it has failed.

Do not add any interaction that requires two steps where one would do. The booking flow from slot selection to confirmation must be as few clicks as possible. The confirmation modal exists for payment safety — it is justified. Any additional confirmation step is not.

---

### Calibration for Working Professional Users (Age 28–50)

This is the largest patient segment. They are time-constrained, task-focused, and using the platform during specific intent moments — a lunch break, an evening after work, a moment between meetings. They are not browsing leisurely. They are executing a task.

**What they need from this product:**

The discovery page must surface the most relevant doctors with minimum filter interaction. The smart search autocomplete and the AI symptom search do this. But the default unfiltered state of the discovery page also matters — when a professional lands on the discovery page without having come from the symptom search, the default sort order must be by relevance (verified + highly rated + nearest location if location is available). They should not need to apply any filter to see a useful result set.

The booking confirmation modal must show everything they need to know on one screen without scrolling. The appointment summary — doctor, date, time, fee — must all be simultaneously visible with the pay button. If the modal requires scrolling to reach the pay button on a standard laptop screen, the modal height is wrong.

The patient dashboard must function as an operational summary, not a feature showcase. The greeting, the upcoming appointment spotlight, and the metric cards must all be simultaneously visible above the fold on a `1080p` laptop screen. If the metric cards are below the fold on the dashboard home, the hierarchy is wrong.

Email confirmation of bookings — from Feature F1 — is especially important for this group. They book and then return to their work day. The email is the artifact they refer back to. The email template from the humanization context must render correctly on Gmail mobile because this group reads their email on their phone even if they booked on desktop.

**What not to do for this group:**

Do not use marketing language in operational interfaces. The doctor dashboard greeting `GOOD MORNING, DR. SHARMA` is correct. `Let's see how your practice is growing today!` is not. This group responds to directness.

Do not hide information behind progressive disclosure in contexts where the information affects decisions. The consultation fee must be visible on the discovery page card — not revealed on the profile page. The fee is decision-relevant information and burying it increases friction for time-constrained users.

---

### Calibration for Older Adult Users (Age 50–70)

This group represents the highest volume of physiotherapy patients — they are the demographic with the highest incidence of the conditions physiotherapy treats. They are also the group most likely to abandon a digital booking flow if they encounter anything confusing. Getting this group right is not an accessibility checkbox — it is the core business case.

**What they need from this product:**

**Touch targets that work.** Every button, every link, every interactive element must have a minimum touch target of `44px × 44px`. This is not the visible size of the element — it is the interactive area. A `32px` tall button must have `6px` of invisible padding above and below it extending its touch target to `44px`. This prevents the most common frustration older users experience on digital interfaces: clicking something and not having it respond, then clicking it harder, then clicking the wrong thing. The `56px` height specified for appointment rows and navigation items in the dashboard is correct for this reason — it is already at the safe threshold.

**Type that does not require squinting.** The `ui-md` base size of `14px` is the minimum for body text. Anywhere that body text has been reduced below `14px` for design compactness — metadata labels, timestamps, secondary descriptions — must be audited. If the text is purely decorative (a pattern label, an abstract texture caption) it can remain small. If the text contains information a patient needs to make a decision — a slot time, a doctor's specialization, a fee — it must be at least `14px`. No exceptions for users in this age range.

**Color contrast that works in bright light.** Many users in this age range use their device in well-lit rooms or outdoors where screen glare reduces perceived contrast. The base prompt's shift from `#0F0F0F` to `#1A1A1A` for primary text is acceptable because the background is simultaneously shifting from `#FFFFFF` to `#F8F8F6` — the relative contrast remains high. But any text using the neutral gray tones — `#6B7C93` for secondary text, `#A3A3A3` for metadata — must be checked against the warm off-white background at the WCAG AA standard of 4.5:1 contrast ratio. If any gray text fails this check against `#F8F8F6`, it must be darkened until it passes. Design preference does not override legibility.

**Descriptive error messages, not technical ones.** When a form field fails validation, the error message that appears must be written in plain language. Not `Invalid date format`. `Please select a date that is today or in the future.` Not `Required field`. `Please enter your phone number so the clinic can reach you.` The reason behind the requirement must be in the message. Older users who encounter a technical error message without context will stop and ask someone for help rather than correct the field — both of which are failure states the design can prevent.

**Confirmation language that is explicit.** In the booking confirmation modal, the summary of what is about to happen must be written in complete sentences, not just key-value labels. Below the definition-list summary (which stays), a single sentence in `ui-sm` mixed-case black: `You are booking a 30-minute appointment with Dr. Priya Sharma on Tuesday, 10 February at 9:00 AM. ₹500 will be charged.` This redundant sentence is not redundant for an older user — it is the final check that everything is correct before they commit. The key-value labels above it are for scanning. The sentence is for confirming.

**What not to do for this group:**

Do not use icon-only actions without labels. The delete icon in the availability management slot table, the `×` in the filter chips, the close button in the modal — every icon-only interactive element must have either a visible label alongside it or a tooltip that appears on hover within `200ms`. `title` attribute tooltips are acceptable for desktop use — they are not acceptable for touch screens, but since this product is desktop-first for now, they are sufficient.

Do not change the interface state without communicating what changed. If the patient removes a filter chip and the results list updates, the update must be perceptible. The staggered content appearance specified in the extension prompt handles this — the cards re-render in sequence, which is perceptible as change. An instant results swap that replaces 12 cards with 8 different cards in the same positions without any visual transition is confusing to older users who cannot track the change.

---

### Calibration for Elderly Users (Age 70+)

This group will arrive on the platform because a family member or caregiver has pointed them toward it. They may have limited digital experience. They may use the platform only once — to book a single appointment — and the design must make that single interaction completeable without assistance.

**What they need from this product:**

**One obvious thing to do on each screen.** Every page must have a single primary visual hierarchy — one element that is more prominent than everything else. On the landing page: the symptom search box. On the discovery page: the first doctor card. On the doctor profile: the booking panel. On the booking confirmation modal: the `CONFIRM & PAY` button. If the page has two elements competing for visual primacy, an elderly user will not know where to look and will stop. The visual hierarchy must be unambiguous.

**Language they recognize.** The product name `KINETIQ` or `THERALIGN` — whatever the final brand name is — is meaningless to an elderly user without context. The landing page headline must establish what the product does in the first three words. `Find a Physiotherapist.` Not `Connected care for every body.` Not `The modern way to heal.` The benefit must be the headline, not the concept. Elderly users reading a headline are asking one question: is this for me? The headline must answer it directly.

**A path to human contact.** Somewhere on the platform — the footer, the contact section, the booking confirmation page — there must be a visible phone number or support email. Not buried in a privacy policy. Visible. An elderly user who gets confused at any point must know that a human is reachable. The absence of visible human contact information is the most common reason elderly users abandon digital services: they do not trust that anyone will help them if something goes wrong.

**What not to do for this group:**

Do not use hover-only states to reveal critical information. The `BOOK NOW →` button appearing only on hover on doctor cards — specified in the Swiss phase for progressive disclosure — is appropriate for younger users but must be reconsidered for this group. The resolution: the button appears on hover for mouse users as specified. But it also always appears as a visible secondary link below the card's visible area — `Book an appointment →` in small primary color — so that users who do not hover, or who use the tab key to navigate, still have access to the booking action. This is not a visual change for most users — it is a fallback for users who do not hover.

---

## Part 3 — Page-by-Page Coverage Matrix

Every file in the codebase structure receives explicit design guidance. No file is assumed to inherit correctly without verification.

**`client/src/pages/public/LandingPage.jsx`**
The marketing surface. Receives the full humanization treatment: updated navbar, hero with symptom search as primary CTA, trust bar in teal-navy, specialization cards with softened hover, how-it-works section, featured doctors, statistics, reviews, verification explanation, CTA banner in gradient, footer. The landing page has the highest design expression in the product. It receives all levels of elevation shadow, the staggered card appearance on featured doctors, and the most explicit typography hierarchy in the system.

**`client/src/pages/public/DoctorListingPage.jsx`**
The discovery surface. Receives the filter panel, smart search autocomplete dropdown, AI recommendation amber card, results grid with doctor cards, results header with sort controls, active filter chips, pagination. Every card in the results grid receives `shadow-level-1` at rest and `shadow-level-2` on hover. The `BOOK NOW` button appears on hover for mouse users and as a persistent small link for keyboard and non-hover users.

**`client/src/pages/public/DoctorProfile.jsx`**
The decision surface. Receives the `7:5` column split with sticky booking panel. The booking panel implements the four-stage trust sequence. The AI summary card receives the diagonal pattern. Reviews section shows distribution bars. Waitlist UI appears when no slots exist. This page has the most component density of any public page — every component from Phase 1 appears at least once.

**`client/src/pages/public/Login.jsx` and `Register.jsx`**
The entry surfaces. Form inputs receive `6px` border-radius, `2px` primary focus border with subtle ring, post-fill teal border on valid completion. Error messages use descriptive plain language with the `↑` directional prefix. The form is visually simple — no section headers, no numbered labels. These pages are not operational interfaces; they are doorways. The design must communicate only one thing: entering here is safe and easy.

**`client/src/pages/patient/PatientDashboard.jsx`**
Receives the personalized greeting, upcoming appointment spotlight with diagonal pattern, four metric cards, recent activity table. The greeting uses the patient's first name in title case. The upcoming appointment spotlight uses teal confirmation states. All content above the fold on a `1080p` laptop screen.

**`client/src/pages/patient/MyAppointments.jsx`**
Receives the full table with inline row expansion. Filter tabs as segmented control. Inline review submission form in expanded rows. The `CANCEL` action in red — its one destructive table use. Pagination with explicit page position indicator.

**`client/src/pages/patient/PaymentHistory.jsx`**
Receives two metric cards, the payment table with right-aligned financial columns, Indian number formatting throughout. Download receipt link. Payment ID shows last 8 characters with full ID on hover tooltip.

**`client/src/pages/patient/MyReviews.jsx`**
Receives the review cards in read-only static format — no hover state. Informational empty state with no action button.

**`client/src/pages/doctor/DoctorDashboard.jsx`**
Receives the professional greeting (`DR. SURNAME`), verification banner in amber if unverified, profile completion card with progress bar, today's schedule with `2:10` column split, four metric cards, recent bookings table.

**`client/src/pages/doctor/DoctorAppointments.jsx`**
Receives the appointments table with doctor-specific column structure, inline row expansion showing patient notes and session document upload, contextual action links per appointment status.

**`client/src/pages/doctor/AvailabilityManager.jsx`**
Receives the single-row add slot form, the doctor-facing heatmap with slot counts per cell, the slot list as a table with inline delete confirmation. Amber validation border on invalid time ranges.

**`client/src/pages/doctor/Earnings.jsx`**
Receives the three metric cards, monthly breakdown table with `4px` left border on current month, recent transactions with Indian number formatting, patient first-name-and-initial-only privacy treatment.

**`client/src/pages/doctor/DoctorProfile.jsx`** (the editing context)
Receives the form sections with persistent save bar, `6px` border-radius inputs, disabled email field with gray background, non-editable currency and country-code prefixes inside inputs, profile photo as bordered square, verification documents section for unverified doctors only.

**`client/src/pages/doctor/MyReviews.jsx`**
Receives the rating summary card with distribution bars, review cards with `9:3` split, informational empty state.

**`client/src/pages/admin/AdminDashboard.jsx`**
Receives the teal-navy sidebar with three grouped navigation sections, pending verification coral badge on Doctors item, metrics grid with amber border on pending verification card, teal border on revenue cards, recent activity feed, revenue and appointment charts.

**`client/src/components/common/Button.jsx`**
`6px` border-radius on all variants. `scale(0.97)` active press state. Descriptive loading labels (`PROCESSING PAYMENT...`, `CONFIRMING BOOKING...`). Disabled state communicates what is missing in the label itself. All four variants fully specified.

**`client/src/components/common/Card.jsx`**
`8px` border-radius. `shadow-level-1` at rest. `shadow-level-2` on hover. `3px` border on hover (from `2px`). Background shifts to `#F0F0ED` on hover — no full color inversion in operational contexts. Marketing surface variant retains inversion option as a prop.

**`client/src/components/common/Badge.jsx`**
`4px` border-radius. Four states: teal (verified/confirmed/paid), amber (pending), gray (cancelled), coral (new — for notification indicators only). All uppercase tracked text.

**`client/src/components/common/Input.jsx`**
`6px` border-radius. Post-fill teal border on valid completion at `blur`. Descriptive error messages with `↑` prefix. Disabled state with `#F7F9FB` background. Placeholder text in mixed-case. Internal non-editable prefixes for currency and phone country code.

**`client/src/components/common/Modal.jsx`**
No border-radius on modal container — structural. `shadow-level-3` on modal box. `200ms` opacity fade on open and close. Explicit confirmation sentence for payment modals. Padlock + `Secured by Razorpay` row before pay button.

**`client/src/components/common/Toast.jsx`**
`6px` border-radius. Teal left border for success. Danger color left border for errors. Success toasts auto-dismiss at 4 seconds. Error toasts require manual dismissal. Slide in from bottom-right.

**`client/src/components/common/Skeleton.jsx`**
`300ms` delay before rendering — never flickers for fast API calls. Opacity pulse animation. No border-radius. Exact shape matching for every content type it represents.

**`client/src/components/common/EmptyState.jsx`**
`actionable` and `informational` context variants. Plain language descriptions in first-person mixed-case. Action button only in actionable variant. No action button in informational variant.

**`client/src/components/common/SectionHeader.jsx`**
Section number prefix in coral accent `#F4845F`. Title uppercase for marketing and page-level headers. Title case for dashboard sub-section headers. Horizontal rule `1px solid #DDE3EA` — not `4px` black. Subtitle capped at `560px` width.

**`client/src/components/layout/Navbar.jsx`**
`64px` height, white background, `1px` soft border bottom. Navigation links in title case, `#6B7C93` default, `#0B4F6C` on hover, `150ms` color transition. No vertical slide animation. Auth buttons: ghost with primary color for Log In, filled primary for Get Started.

**`client/src/components/layout/PublicLayout.jsx`**
Contains Navbar and Footer. Main content area has the `200ms` opacity fade on route change. Horizontal padding `64px`. Max-width `1440px` centered.

**`client/src/components/layout/DashboardLayout.jsx`**
Contains patient/doctor sidebar. `240px` sidebar with `2px` right border. Navigation items `48px` height, `44px` minimum touch target. Active state: `4px` black left border, black background, white text. Sidebar bottom section with verification status badge.

**`client/src/components/layout/AdminLayout.jsx`**
Contains admin sidebar in teal-navy `#0B4F6C`. Three grouped navigation sections with `MONITOR`, `MANAGE`, `FINANCE` section labels. `3px` white left border on active item. Coral badge on Doctors item when pending count exists.

**`client/tailwind.config.js`**
Updated with all humanization tokens: `swiss-surface #FFFFFF`, `swiss-black #1A1A1A`, `swiss-gray-100 #F0F0ED`, `swiss-red #E8341A`, `swiss-teal #0A7E6E`, primary `#0B4F6C`, coral accent `#F4845F`, danger `#C0392B`, neutral scale. Shadow levels 1, 2, 3 with teal-navy colored shadow values. `border-radius: 8px` for cards, `6px` for inputs and buttons, `4px` for badges, `0px` for structural elements.

**`client/src/styles/index.css`**
Body background `#F8F8F6`. Noise texture at `1.5%` opacity. Pattern utilities: grid, dots, diagonal, noise. Scrollbar in system colors. Focus ring `2px` primary color with `4px` offset. Selection highlight in primary color. `prefers-reduced-motion` disables all transitions and animations.

---

## Part 4 — The Prefers-Reduced-Motion Contract

Every transition, every animation, every stagger, every shadow transition, every button press scale, every page fade defined across all prompts in this series must be wrapped in a `prefers-reduced-motion` check. When a user has enabled reduced motion in their operating system — a setting used heavily by users with vestibular disorders, migraine sensitivities, and certain elderly users — the product must behave as if no animations exist. Not shorter animations. No animations.

The implementation is a single rule in `client/src/styles/index.css` that sets `transition-duration: 0.01ms` and `animation-duration: 0.01ms` on all elements when `prefers-reduced-motion: reduce` is detected. This rule overrides every individual transition defined in every component. It is the final rule in the stylesheet — specificity ensures it wins.

This is not optional accessibility compliance. This is respect for the users who have explicitly told their operating system that motion makes them physically uncomfortable. A healthcare platform that ignores that signal is a healthcare platform that causes harm. That is the one outcome this entire design system exists to prevent.