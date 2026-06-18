# PhysioConnect — Humanization Addendum
## The Five Missing Parts

---

# Missing Part 1 — The Mobile Handoff Brief

## Why This Exists Now and Not Later

Every prompt in this series has deferred mobile with the phrase "desktop-first." That deferral is correct for the primary design effort. It is incorrect as a complete position. Three specific patient flows will be experienced on mobile regardless of what the team intends: the email booking confirmation contains a link the patient taps from their phone, the Razorpay payment modal is a mobile-native UI that appears inside the desktop browser session, and the appointment reminder email arrives 24 hours before the appointment — when the patient is not sitting at a desk. These three flows touch mobile whether the design team addresses mobile or not. The question is whether they touch it gracefully or catastrophically.

This brief defines exactly which pages need mobile-functional treatment now, what minimum viable mobile looks like for each, and what the full mobile roadmap looks like when the team addresses it properly.

---

## Tier 1 — Must Work on Mobile Now (Zero Exceptions)

These pages will receive mobile traffic before the product launches. They must be functional — not beautiful, not optimized, functional — on a `375px` viewport today.

**Login and Register pages** (`client/src/pages/public/Login.jsx`, `Register.jsx`)

A patient who receives an email invitation, a referral link, or a shared doctor profile link will tap it on their phone and land on login or register first. If these pages are broken on mobile the patient cannot enter the product at all.

The minimum viable mobile treatment: single column layout, full-width inputs, full-width buttons with `56px` height for touch targets, the form centered with `24px` horizontal padding on each side. The card wrapper for the form gets `border-radius: 12px` on mobile — slightly more rounded than the `8px` desktop treatment because mobile interfaces at this size read card edges more sharply. The Kinetiq logotype at the top of the form, `32px`, centered. Nothing else. No hero section, no marketing copy, no left-column illustration. The mobile login page is the form and nothing but the form.

**Booking confirmation modal** (`client/src/components/common/Modal.jsx`)

The booking confirmation modal is triggered from the desktop booking flow. But if the patient has the site open on their phone and taps a shared doctor profile link, they may complete the entire booking flow on mobile. The modal must not overflow the screen.

The minimum viable mobile treatment: the modal becomes full-screen on viewports below `640px`. Not a bottom sheet — full screen, with the navbar hidden behind it. The modal header stays fixed at the top. The action buttons stay fixed at the bottom. The appointment summary scrolls between them if it overflows. The fixed header and footer pattern is the correct native mobile modal pattern. The desktop centered-card modal is not adapted for small screens — it is replaced entirely on small screens with this full-screen variant.

**Post-payment confirmation page**

After Razorpay processes the payment and redirects back to the platform, the patient lands on a confirmation screen. This screen will frequently be seen on mobile — the patient paid on their phone, Razorpay redirects them back to the platform on their phone. This page must be mobile-functional.

The minimum viable mobile treatment: single column, the confirmation message in `display-sm` bold centered, the appointment details in a full-width card, a single `VIEW MY APPOINTMENTS →` button full-width below it. No sidebar, no navbar on mobile. Just the confirmation.

**Email template links** (`server/src/services/emailService.js`)

Every link in every email template — the booking confirmation email, the 24-hour reminder email, the cancellation notice — lands the tapping patient on a page that must work on mobile. The links in the base templates go to `/patient/appointments`. That page is a full dashboard page with a sidebar — not mobile-functional.

The resolution: email links that a patient taps should go to a dedicated lightweight appointment detail page — `/appointments/:id` — that shows only the appointment details without the sidebar shell. This is a new public-accessible (but auth-gated) route that renders the appointment card in a mobile-friendly single-column layout with the patient dashboard sidebar hidden. The appointment data is the same; the layout shell is different. This route does not require a new API endpoint — it uses the existing `GET /api/appointments/mine` and filters by ID client-side.

---

## Tier 2 — Must Not Break on Mobile (Functional Fallback Required)

These pages will receive occasional mobile traffic. They do not need to be optimized but they must not be visually broken — no horizontal overflow, no text cut off, no buttons unreachable.

**Landing page** (`client/src/pages/public/LandingPage.jsx`)

The desktop landing page uses multi-column asymmetric layouts that will stack and overflow on mobile. The minimum viable mobile treatment is not a redesign — it is a collapse. Every multi-column section becomes single-column with `24px` horizontal padding. The hero headline drops to `display-sm` size (`2.25rem`). The geometric composition in the hero right column is hidden on mobile — `hidden md:block`. The stats bar becomes a `2×2` grid. The specialization cards become a `2×2` grid. The how-it-works steps stack vertically. The featured doctors grid becomes a single-column list.

No new components. No new design decisions. Pure responsive Tailwind classes applied to existing section components. The desktop experience is unchanged. The mobile experience is a stacked version of the same content.

**Doctor listing page** (`client/src/pages/public/DoctorListingPage.jsx`)

The filter panel sidebar cannot work on mobile at `280px` in a `375px` viewport. The minimum viable mobile treatment: the filter panel is hidden by default on mobile behind a `FILTERS →` button that opens it as a full-screen overlay. The results grid becomes single column. The sort controls become a dropdown select instead of a segmented control. These are the three changes that make the page functional without addressing the full mobile experience.

**Doctor profile page** (`client/src/pages/public/DoctorProfile.jsx`)

The `7:5` column split collapses to single column on mobile. The sticky booking panel moves from the right column to a fixed bottom bar — `64px` tall, white background, `1px` top border, containing the fee on the left and `BOOK NOW →` button on the right. Tapping the button opens the full booking panel as a bottom sheet that covers the lower `75%` of the screen. This is the pattern used by Airbnb, Booking.com, and every mobile marketplace — the booking action is always reachable without scrolling.

---

## Tier 3 — Full Mobile Roadmap (Future Phase)

When the team decides to address mobile properly, the work happens in this order:

First: the patient booking flow in its entirety — discovery, profile, booking, confirmation, payment. This is the revenue path. Mobile optimization of the revenue path has the highest return.

Second: the patient dashboard — appointments, payment history, reviews. Patients checking their upcoming appointments from their phone is high-frequency behavior.

Third: the doctor dashboard — specifically the today's schedule view and the mark-complete action. Doctors may want to quickly check their schedule or mark a session complete from their phone between patients.

Last: the admin dashboard. Admin operations are inherently desktop workflows. Mobile admin is the lowest priority in the entire product.

---

# Missing Part 2 — The Dark Mode Position Statement

## The Question That Will Be Asked

At some point — during development, during a demo, during an interview, or during a user feedback session — someone will ask: does this support dark mode? The answer must be prepared, documented, and architecturally honest. An unprepared answer either commits the team to work they have not scoped, or dismisses a legitimate user need without reasoning.

## The Current Architecture's Dark Mode Readiness

The token system as specified in `tailwind.config.js` uses named color tokens — `swiss-black`, `swiss-surface`, `k-primary`, `k-teal`, `k-red`. These are named but they are not semantically abstracted. `swiss-black` always means `#1A1A1A`. It does not mean "the primary text color on whatever surface the user has selected." This is the distinction that matters for dark mode.

A dark mode-ready token system has two layers. The first layer is the raw color palette — the actual hex values. The second layer is semantic aliases that map to the palette: `text-primary`, `surface-background`, `surface-card`, `border-default`. In light mode, `text-primary` maps to `#1A1A1A`. In dark mode, `text-primary` maps to `#F2F2F2`. The components reference only semantic aliases — they never reference raw palette values directly.

The current system references raw palette values directly in components. Changing to dark mode would require changing color classes on every component individually. That is not dark mode support — that is a color audit.

## The Position

Dark mode is not supported in the current architecture and should not be promised until the token abstraction layer is added. Adding the abstraction layer is a one-time migration that touches `tailwind.config.js` and every component file — significant but finite work. The correct time to do it is before the product has more than `20` component files, not after.

The specific change needed: in `tailwind.config.js`, create semantic token aliases that reference the raw palette values. `text-primary` references `swiss-black`. `surface-bg` references the body warm off-white. `surface-card` references `swiss-surface`. `border-default` references `swiss-gray-mid`. All component class names are updated to use these semantic aliases instead of palette-direct names. Once this migration is complete, dark mode is a CSS variable swap — one configuration change, not a component audit.

## The Dark Mode Color Decisions (If and When Implemented)

These decisions are documented now so they inform the semantic token naming, even if implementation is deferred.

The dark mode background is not pure black. It is `#0F1117` — a very dark desaturated navy that reads as black but carries the same warmth relationship to the product's primary teal-navy color that the warm off-white carries in light mode. Pure black dark mode feels generic. A dark navy background makes the teal-navy primary color feel intentional rather than random when it appears in the dark sidebar.

The dark mode card surface is `#1A1F2E` — one step lighter than the background, enough to create visual separation between page and card without a border. In dark mode, borders for card separation are optional rather than mandatory because the background contrast does its own work.

The dark mode text primary is `#E8EDF2` — not pure white, for the same reason the light mode text is not pure black. A slightly warm off-white on a dark navy background reads as considered typography, not inverted-mode text.

The teal accent `#0A7E6E` does not change in dark mode — it is already dark enough to be invisible on dark backgrounds if used as a background. In dark mode it is used exclusively as a text and border color, never as a fill on dark surfaces.

The coral accent `#F4845F` brightens slightly in dark mode to `#F79B7A` to maintain the same perceptual contrast against a dark background that it has against the warm off-white background in light mode.

The danger color `#C0392B` brightens in dark mode to `#E05547` for the same perceptual contrast reason.

## The Statement for Interviews

When asked about dark mode: "The current system uses a warm off-white light mode optimized for healthcare readability. The token architecture is being abstracted to semantic aliases which will make dark mode implementation a single configuration change rather than a component audit. Dark mode is on the roadmap after the semantic token migration is complete."

This answer is honest, architecturally informed, and demonstrates product thinking. It is better than either "yes we support dark mode" (a lie) or "we don't support dark mode" (an incomplete answer).

---

# Missing Part 3 — The Component State Completeness Audit

## Why This Part Was Left Incomplete in the Previous Prompts

The previous prompts described each component's primary and hover states. What was never systematically documented is the complete state matrix — every possible state every component can be in, what it looks like in each state, and what transition connects the states. Without this matrix, the AI coding tools implementing these components will make independent decisions for the undocumented states, and those decisions will be inconsistent across components.

Every interactive component in `client/src/components/common/` must have all states defined.

---

## Button — Complete State Matrix

**Default:** Background and text as specified per variant. `2px` border where applicable. `box-shadow: none` for primary and accent. `shadow-level-1` considered but rejected for buttons — buttons are actions, not content surfaces, and elevation on actions creates visual competition with card elevation.

**Hover:** Color shift as specified per variant. Border becomes `3px` on secondary and ghost variants — the additional border weight communicates that the element is being approached. `shadow-level-2` on hover — the button lifts toward the user at the same moment the color shifts. Both signals together are stronger than either alone.

**Focus-visible:** `2px` solid primary color outline with `4px` offset. This is the keyboard navigation focus indicator. It must be visible on all backgrounds. On the accent red button where the primary color ring would be low-contrast: use white outline instead of primary color.

**Active (pressed):** `scale(0.97)` transform at `80ms`. Color slightly darker than hover state — the button is being compressed. The shadow drops back to `shadow-level-1` during the press — the button is being pushed down, not lifted. The combination of scale reduction, color darkening, and shadow reduction creates a physical press metaphor that every user age group understands instinctively.

**Loading:** The button maintains its exact dimensions. The label is replaced by the loading text with an inline spinner. The spinner is a `16px` circle with a `2px` stroke — the same stroke weight as the border. It rotates at `720ms` per revolution — fast enough to communicate activity, slow enough to not feel frantic. The button is disabled during loading but visually remains in its default color state rather than the disabled faded state — the loading state is active, not inactive. Fading to disabled during loading creates the incorrect impression that something has gone wrong.

**Disabled:** `opacity: 0.4`. `cursor: not-allowed`. The label changes to communicate what action would enable the button — not just a greyed-out version of the default label. No hover state triggers. No focus ring. The disabled button is outside the interaction model entirely.

**Destructive variant** (for the logout button and the cancel action in the confirmation modal): black border and black text by default. On hover: border and text shift to the danger color `#C0392B`. The destructive signal appears only on approach, not at rest. A button that is red by default communicates constant alarm. A button that reveals its destructive nature on hover communicates precision — this action is available but not urgently suggested.

---

## Card — Complete State Matrix

**Default:** White background `#FFFFFF`. `2px` solid border at `#DDE3EA` — the soft border color from the humanized system, not the stark black of the Swiss system. `8px` border-radius. `shadow-level-1`.

**Hover (interactive cards only):** Background shifts to `#F0F0ED` — the warm gray surface. Border weight increases to `3px`. Border color darkens to `#1A1A1A`. `shadow-level-2`. The transition is `200ms` ease for shadow and `150ms` ease for background and border. The shadow transition is longer because the elevation change needs to feel physical rather than electronic.

**Selected (applicable to doctor cards when a slot is being booked, specialization cards when a filter is active):** `2px` border in primary `#0B4F6C`. Background tints to `#E8F4F8` — a very light primary-tinted blue, the lightest expression of the primary color in the entire system. This selected state is distinct from the hover state: hover communicates approach, selected communicates commitment.

**Disabled (applicable to slot cards that are booked, availability cells that are full):** `opacity: 0.5`. `cursor: default`. No hover state. The border remains but at half opacity. The content within is readable but clearly unavailable.

**Loading (the card itself is loading):** Replaced entirely by the Skeleton component matching the card's exact dimensions and internal layout. The Skeleton renders after the `300ms` delay. The card renders in its default state when data arrives, with the stagger offset appropriate to its position in the list.

**Expanded (applicable to appointment rows in the table that expand inline):** The card or row extends vertically with a `200ms` height transition. The expanded area has a `4px` solid left border in primary color and a `#F7F9FB` background — slightly different from the card's default white to signal that this is an extended content area, not the primary card surface. The collapse transition is the same `200ms` — expansion and collapse are symmetric.

---

## Input — Complete State Matrix

**Default:** `2px` solid border at `#DDE3EA`. White background. `6px` border-radius. Placeholder text in mixed-case at `#A3A3A3`. Label above in small uppercase tracked `#6B7C93`.

**Focus:** Border becomes `2px` solid primary `#0B4F6C`. A soft ring appears: `box-shadow: 0 0 0 3px rgba(11, 79, 108, 0.12)`. The ring is the visual communication that this field has keyboard focus — it extends beyond the border, making the focus state visible without being aggressive. The transition from default to focus is `150ms` ease. The placeholder text does not animate or move — it stays in position and fades to `rgba(163,163,163,0.5)` while the input has focus and content is being entered.

**Filled (has content, not focused):** Border returns to `2px` solid `#DDE3EA` — the same as default. Background remains white. There is no visual difference between a filled unfocused input and an empty unfocused input in the default state. This is intentional: the content itself communicates the filled state. No additional visual treatment is needed.

**Valid (filled, blurred, passes validation):** Border becomes `1px` solid `rgba(10, 126, 110, 0.6)` — the teal signal at reduced opacity. This is the post-fill success confirmation from the extension prompt. The ring is absent — no shadow ring in the valid state. Just the quiet teal border that says: this is done and correct.

**Invalid (filled, blurred, fails validation):** Border becomes `2px` solid `#C0392B`. The ring shifts to `box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.12)` — the danger color ring. Below the input: the error message in `ui-xs` danger color with the `↑` prefix. The label above the input also shifts to danger color — the error is signaled at both the top and bottom of the field, catching the user's eye regardless of which direction they are reading.

**Disabled:** Background `#F7F9FB`. Border `1px` solid `#DDE3EA`. Text `#6B7C93`. `cursor: default`. No focus state. A small lock icon appears inside the input at the right edge for fields that are permanently non-editable (email, payment ID) — `12px`, in `#A3A3A3`. For fields that are temporarily disabled (a future date that cannot be selected yet), no lock icon — just the disabled visual state.

**Loading (when input value is being verified asynchronously — e.g., checking if an email is already registered):** A `12px` spinner appears at the right edge of the input, replacing the lock icon position. The border stays in its current state. The spinner runs for the duration of the async check and disappears when the check completes — the input transitions to either valid or invalid state. No button press required — the async check fires on `blur`.

---

## Badge — Complete State Matrix

Badges are not interactive in most contexts. Their states are purely visual status communications.

**Teal (verified, confirmed, paid, completed):** `2px` solid `#0A7E6E` border. Text `#0A7E6E`. Background `rgba(10, 126, 110, 0.06)` — a barely-there teal tint that helps the badge stand out from white card backgrounds without being a solid color fill. `4px` border-radius. Uppercase tracked `ui-xs`.

**Amber (pending, limited availability):** `2px` solid `#B45309` border. Text `#B45309`. Background `rgba(180, 83, 9, 0.06)`. Same structure.

**Gray (cancelled, inactive, unavailable):** `2px` solid `#9CA3AF` border. Text `#6B7280`. Background `rgba(156, 163, 175, 0.06)`.

**Coral (new notification indicator, count badge on admin sidebar):** `2px` solid `#F4845F` border. Text `#F4845F`. Background `rgba(244, 132, 95, 0.06)`. Used exclusively for count/notification contexts.

**Interactive badge (when a badge is clickable — e.g., a filter chip that can be removed):** Default state as above. Hover: background opacity increases from `0.06` to `0.12`. An `×` appears on the right side of the badge at `10px` in the badge's text color. The `×` does not exist in the default state — it appears on hover only, communicating that removal is available without cluttering the badge at rest.

---

## Table Row — Complete State Matrix

**Default:** White background. `1px` bottom border at `#F0F4F7` — barely visible, a structural separator rather than a design element. `56px` height. Text in primary dark navy `#1C2B3A` for primary columns, `#6B7C93` for secondary columns.

**Hover:** Background shifts to `#F7F9FB`. The bottom border remains. No border appears on the sides of the row — table rows do not get side borders on hover. The hover is a background shift only. No elevation. Tables are flat surfaces — elevation on table rows creates visual chaos.

**Selected (when a row is clicked and opens an expanded section below it):** Background shifts to `#EFF6FF` — a very light primary-tinted blue, the same selected state used for cards. The left edge of the row gets a `4px` solid primary color border — this is the visual anchor for the expanded content that appears below, indicating which row owns the expanded section.

**Expanded row section:** Appears below the selected row with a `200ms` height transition. Background `#F7F9FB`. `4px` left border primary. Internal padding `24px` on all sides. The expanded row section is not a card — it is a continuation of the table, differentiated by its background and left border.

**Danger row (a row flagged for a destructive state — e.g., a cancelled appointment):** Background `rgba(192, 57, 43, 0.03)` — a nearly invisible red tint. The status badge reads `CANCELLED` in gray, not red — the row tint is the signal, not the badge color. The tint is subliminal: the doctor or patient scanning the table perceives cancelled rows as subtly different without being able to articulate why. The functional information is in the badge; the emotional register is in the tint.

---

## Modal — Complete State Matrix

**Opening:** The overlay fades in from `opacity: 0` to `opacity: 0.6` over `200ms`. The modal card translates from `translateY(16px)` to `translateY(0)` simultaneously. The translation is small — the modal appears to rise slightly from below the center of the screen, not slide in from an edge. This is the most subtle entrance motion in the product. It is justified for modals because a modal is an interruption — a gentle entrance reduces the jarring quality of that interruption.

**Default open state:** As described in the component specification.

**Focus trap:** When the modal is open, focus is trapped within it. Tab navigation cycles only through the modal's interactive elements. The first interactive element receives focus automatically on open. This is not an accessibility nice-to-have — it is a requirement. A keyboard user who opens a modal and has their focus remain on the element behind it cannot interact with the modal at all.

**Closing:** The reverse of opening — `200ms` fade out of overlay, `translateY(0)` back to `translateY(8px)`. The close animation is slightly shorter and subtler than the open animation. The modal recedes rather than disappearing.

**Confirm state (for confirmation modals where the user has clicked the primary action):** The modal content area transitions to a confirmation state — the form or detail view is replaced by a simple success confirmation without closing and reopening the modal. `200ms` cross-fade between the form content and the confirmation content. The confirmation shows: a teal bordered square with a check icon, the confirmation message in `display-xs` bold, a single sentence description, and a `CLOSE` button. This transition within the modal eliminates the jarring pattern of a modal closing immediately after a critical action — the patient sees the confirmation before returning to the page.

---

# Missing Part 4 — The Content Tone & Copy System

## Why This Is a Design Document, Not a Copywriting Document

The previous prompts specified what text appears where — navigation labels, button labels, empty state descriptions, error messages. What was never specified is the system governing how that text is written — the rules that ensure every piece of text in the product, from a page title to a tooltip, sounds like it was written by the same person with the same values for the same user.

In a product serving users from age 14 to age 80, copy tone is not a stylistic preference — it is a usability decision. Text that is too formal alienates young users. Text that is too casual undermines trust with older users booking healthcare. The system must be precise enough to produce consistent output across dozens of components and pages.

---

## The Four Copy Registers

Every piece of text in the product belongs to one of four registers. The register determines the tone, the vocabulary, the length, and the casing.

**Register 1 — Structural Labels.** These are the architectural identifiers of the interface: column headers, badge text, section number prefixes, button labels, filter group headers, metadata keys in definition lists. They are always uppercase, always brief (one to three words), always direct. They do not use articles, prepositions, or verbs except where a verb is the action (`BOOK`, `CANCEL`, `UPLOAD`). They have no tone — they are the scaffolding of the interface, not the voice of the product. Examples: `CONSULTATION FEE`, `VERIFIED SPECIALIST`, `01. AREAS OF CARE`, `CONFIRM & PAY`, `DATE`, `STATUS`.

**Register 2 — Navigational Destinations.** These are the places the user goes: sidebar navigation items, tab labels, page titles in the browser tab. They are always title case, always phrased as destinations rather than commands. They use possessive language where appropriate — `My Appointments`, not `Appointments`. They never use verbs as labels — `My Appointments`, not `View Appointments`. The possessive phrasing is what creates the sense that the dashboard belongs to the user rather than being a system they are permitted to access. Examples: `My Appointments`, `Find Doctors`, `Payment History`, `Manage Availability`.

**Register 3 — Instructional and Contextual.** These are sentences the product speaks to the user: placeholder text, helper text below inputs, empty state descriptions, onboarding step descriptions, verification status messages, toast notifications, loading labels, error messages. They are always mixed-case. They are always written in the second person (`You`, `Your`). They are specific rather than generic — not `An error occurred` but `We couldn't process your payment. Please try again or use a different card.` They are reassuring in healthcare contexts — not alarming, not bureaucratic, not terse. They anticipate the user's next question and answer it in the same sentence. Maximum two sentences per instance. Examples: `Your appointment is confirmed. A reminder will be sent 24 hours before your session.` — `We couldn't find any physiotherapists matching your filters. Try removing the fee range filter to see more results.`

**Register 4 — Marketing and Editorial.** These are the sentences on the landing page, in the hero section, in the verification explanation, in the how-it-works section. They are the product's public voice — the voice that must convince a new patient or a new doctor that the platform is worth their trust. They use mixed case except where section headers call for uppercase. They are confident without being boastful, specific without being clinical, warm without being casual. They avoid superlatives (`the best`, `the most trusted`) because superlatives in healthcare contexts feel dishonest without evidence. They avoid passive voice entirely — every sentence has a subject and a verb and a direction. Examples: `Find a verified physiotherapist and book your first appointment in under five minutes.` — `Every specialist on Theralign has been individually reviewed and approved by our team.`

---

## Specific Copy Rules

**No exclamation marks anywhere in the product except marketing surfaces.** An exclamation mark in a dashboard interface — `Appointment booked!` — signals that the product is excited about something the user considers routine. The user is not excited that they successfully booked an appointment. They expect it to work. The product communicating excitement at basic functionality working correctly is slightly patronizing. On the landing page and CTA sections, a single exclamation mark is permitted in a headline — `Ready to feel better?` uses a question mark and is fine. `Ready to FEEL BETTER!` is not.

**No ellipsis in loading states.** `Loading...` communicates uncertainty. `Loading appointments` communicates a specific in-progress action. Every loading state uses a specific description of what is being loaded without ellipsis. The spinner communicates the in-progress state visually. The text communicates what specifically is happening. Together they are more reassuring than a spinning circle next to `Loading...`.

**No `Please` in error messages.** `Please enter a valid date` is grammatically polite but tonally bureaucratic. `Enter a date that is today or in the future` is direct and informative without being impolite. The absence of `Please` in error messages is consistent with how well-designed products communicate constraints — as facts, not requests. The `Please` makes the error message sound like the product is apologizing for having requirements. It does not.

**No `Sorry` anywhere in the product.** `Sorry, something went wrong` is the most common and most damaging copy failure in SaaS products. It communicates that the product is at fault, the problem is undefined, and the user has no recourse. Replace every instance of `Sorry` with a specific description of what happened and what the user can do: `We couldn't connect to the server. Check your internet connection and try again.`

**Doctor names always use their title.** Every instance of a doctor's name in the patient-facing product uses `Dr.` prefix: `Dr. Priya Sharma`. In the doctor's own dashboard, first name without title is acceptable in the greeting (`Good morning, Dr. Sharma` — the `Dr.` suffix with the surname is the correct professional address). In all patient-facing contexts — doctor cards, profile pages, booking modals, appointment history, email templates — the `Dr.` prefix is mandatory. A patient trusting their healthcare to a person needs to see that person presented as a professional. Displaying a doctor's name without the title in a medical context is a trust erosion.

**Fees are always presented with context.** Never display a fee as a bare number. Always pair it with its unit: `₹500 per session`, or `₹500 / session` in compact card contexts. A number without context forces the user to supply the context themselves — which introduces a moment of uncertainty that erodes confidence. The cost should always answer the implicit question: `500 of what, for what?`

---

## Email Copy System

The three email templates in `server/src/services/emailService.js` — booking confirmation, 24-hour reminder, cancellation notice — must follow the same four-register system and the specific rules above.

**Email subject lines** use title case and are always specific. Not `Appointment Confirmed` but `Your appointment with Dr. Priya Sharma is confirmed — Tuesday, 10 Feb at 9:00 AM`. The full detail in the subject line means the patient understands the email content before opening it. A patient who receives three appointment emails — one booking, one reminder, one for a different booking — can distinguish them in their inbox without opening each one. Specificity in subject lines is a user experience decision, not a marketing decision.

**Email salutation** is always `Hi [First Name],` — never `Dear [Full Name]`, never `Hello`, never `Hi there`. The first name salutation is warm and personal. The full name salutation is bureaucratic. `Hi there` is impersonal. `Hi [First Name],` is the correct register for a product that knows who it is talking to and treats that person as an individual.

**Email sign-off** is always `The Theralign Team` — not `Regards`, not `Sincerely`, not `Thanks`. The team sign-off is consistent with how modern SaaS products communicate. It implies a human team behind the automation without pretending the email was written by a specific person.

**Email footer** contains: the product name, the legal notice `This is an automated message — please do not reply to this email.`, and a support contact email. The support email is mandatory in every email. A patient who receives an automated email with no human contact path has no recourse if something is wrong. The support email is the minimum viable human escalation path.

---

# Missing Part 5 — The Performance & Perceived Performance Contract

## Why This Belongs in the Design System

Performance is typically treated as an engineering concern. In a product that serves a wide age range — including users on slower devices, users with poor connections, and users who are already anxious about a healthcare interaction — performance is a design concern. A slow interface in a healthcare context does not just frustrate users. It erodes trust. A patient who clicks `CONFIRM & PAY` and sees a spinner for four seconds is not confident their payment went through. A doctor who clicks `ADD SLOT` and waits two seconds does not know if the slot was created.

The design system must define what the product promises to users about performance — what they will see, when they will see it, and how the interface communicates the difference between "working" and "failed."

---

## The Response Time Contract

Every user interaction in the product belongs to one of three response time categories. The category determines the visual feedback contract.

**Instant (0–100ms).** Interactions where the response is visual only and requires no server communication: hover states, focus states, active press states, dropdown opens, tab switches, accordion expansions. These must respond at exactly the moment of input. A hover state that appears at `150ms` after the cursor arrives is a broken hover state. The `150ms` transition duration applies to how long the hover animation takes — not how long before it starts. It starts at `0ms`. It completes at `150ms`.

**Fast (100–1000ms).** Interactions where a server response is expected quickly: form submissions with simple validation, authentication, single-record fetches (appointment detail, doctor profile), slot booking. For interactions in this category: the button enters its loading state immediately on click (`0ms`). No skeleton appears — the user has just performed an action and the response is expected quickly enough that showing a skeleton would imply a longer wait than will actually occur. If the response takes longer than `600ms`, a subtle progress indicator appears — not a skeleton, not a spinner in the content area, but the button's own loading state communicating that the action is in progress. If the response takes longer than `1000ms`, the content area shows a skeleton.

**Slow (1000ms+).** Interactions where a longer server response is expected: large data loads (admin analytics, full appointment history), file uploads to Cloudinary, AI symptom analysis. For interactions in this category: the skeleton appears immediately — after the `300ms` gating delay specified in the extension prompt — because the user will be waiting and visual scaffolding reduces the perception of wait time. A subtle loading message appears below or near the skeleton: `Loading your appointments...`, `Analyzing your symptoms...`, `Uploading document...`. The message is in the instructional copy register — mixed-case, specific, reassuring.

---

## The Error Recovery Contract

Every failure state in the product must follow this structure without exception. The structure is derived from the copy rules above and the component state matrices above.

**What failed:** A specific description of the operation that did not complete. Not `Something went wrong`. `We couldn't load your appointments.`

**Why it failed (if known):** If the error response from the server contains a reason the user can act on, it must be surfaced. `Your session has expired.` `This slot was just booked by another patient.` `The file you uploaded is too large (max 5MB).` If the error reason is technical and the user cannot act on it, it is not displayed — the user does not benefit from an HTTP status code or a stack trace.

**What to do next:** A single specific action. `Try again →` as a link that retries the failed operation. `Go back →` as a link that returns the user to the previous state. `Refresh the page →` for errors where the client state may be stale. `Contact support →` as a last resort for errors that cannot be self-resolved. The action must be one step — not a list of troubleshooting options. One step. The user follows it and either succeeds or reaches support.

**The toast vs inline error decision:** Toast notifications are for transient information — a successful save, a deleted item, a sent email. They are self-dismissing because the information does not require action. Inline errors appear within the component where the failure occurred — below a form field, in place of a table, at the top of a card. They persist until the user resolves them because the information requires action. The rule: if the error requires the user to do something to resolve it, it is inline. If the error is informational and requires no action (a successful operation's confirmation), it is a toast.

---

## The Optimistic Update Contract

Three interactions in the product benefit from optimistic updates — showing the result of an action before the server confirms it, then rolling back if the server rejects it.

**Marking an appointment complete.** When a doctor clicks `MARK COMPLETE →` on an appointment row, the status badge changes to `COMPLETED` in teal immediately — before the `PATCH /api/appointments/:id/complete` response arrives. If the server responds with success (the common case), the optimistic state is confirmed. If the server responds with an error, the badge reverts to `CONFIRMED` and an inline error appears on the row. The probability of failure on this operation is very low — the optimistic update makes the experience feel instantaneous for the common case at the cost of a brief visual rollback in the rare case.

**Removing a filter chip.** When a patient clicks `×` on a filter chip, the chip disappears immediately and the results begin a skeleton loading state. The filter removal API call (if any — most filter state is client-side) fires simultaneously. The results update when new data arrives. If the operation is entirely client-side (re-filtering already-loaded results), the results update at the same moment the chip disappears — true instant response with no loading state at all.

**Joining or leaving a waitlist.** When a patient clicks `JOIN WAITLIST →`, the button immediately transitions to the `YOU'RE ON THE WAITLIST` confirmation state without waiting for the server response. If the server fails (duplicate entry, network error), the confirmation state reverts to the join button and an inline error appears. The optimistic update here is especially important because the patient has just made a commitment gesture — seeing the confirmation immediately reinforces that gesture and makes the interaction feel responsive.

---

## The Page Load Priority Contract

For pages that load multiple data sources simultaneously, the rendering priority is defined. This prevents the most disorienting pattern in multi-source pages: all content areas showing skeleton simultaneously, then all content snapping in simultaneously.

**Doctor profile page:** Left column data (doctor profile API) renders first. Right column (availability API) renders second. The patient begins reading about the doctor while the slots load. The perception of load time is reduced because the patient is engaged before the page is fully loaded.

**Patient dashboard:** The greeting and today's date render immediately — they require no API call. The upcoming appointment spotlight renders when the appointments API resolves. The metric cards and recent activity render when their respective queries complete. The page is never blank — the greeting is always visible while the data loads around it.

**Admin analytics page:** The metric cards render from the summary API (fast, simple aggregate). The charts render from the detailed analytics API (slower, more complex). The metric cards appear first, establishing the page's purpose and giving the admin something to read while the charts load beneath them.

**Doctor discovery page:** The results area shows skeletons immediately. The filter panel renders from static data (no API call — the filter options are hardcoded). The filter panel is therefore always visible and interactive before any results appear. A patient can begin applying filters before the first result loads — those filters will be applied when the results arrive.

---

## The Network Failure Contract

When the user's network connection is lost or the server is unreachable, every page in the product must communicate this state clearly and recover gracefully when the connection is restored.

The network failure state is a full-width banner at the top of the main content area — not the navbar, not a toast, but a persistent banner in the content area that cannot be dismissed. The banner is amber-bordered, white background, with the message: `You're currently offline. Some features may not be available. We'll reconnect automatically when your connection is restored.` The banner disappears automatically when the connection is restored — no user action required. No page refresh required.

API calls that fail due to network errors are not treated as server errors. The retry logic fires automatically after `3000ms`. If the retry succeeds, the content loads and the network failure banner disappears. If the retry fails, the banner remains and a `Try again →` link appears within it. The link manually triggers the retry without a page refresh. This pattern is especially important for the patient on a mobile connection who may have brief connectivity interruptions during the booking flow — the automatic retry means they do not lose their place in the flow due to a momentary network hiccup.

---

## Final Integration Note

These five missing parts are additive — they do not contradict or replace any specification in the base humanization prompt, the professional DNA extension, or the structural integrity and accessibility appendix. They complete the system.

The complete set of humanization documents in implementation order is:

First, the base humanization prompt — apply the visual surface changes.
Second, the professional DNA extension — apply the shadow system, state communication, and loading philosophy.
Third, the structural integrity and accessibility appendix — verify every file, apply age-range calibrations.
Fourth, this addendum — apply the mobile handoff tier decisions, verify dark mode token readiness, confirm component state matrices, implement copy register rules, implement performance contracts.

After all four documents are applied and verified, the product has a complete, coherent, production-ready design system that serves every user in its age range, works on its primary deployment targets, communicates clearly in every state, and degrades gracefully in every failure condition.