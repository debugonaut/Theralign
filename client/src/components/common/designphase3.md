Let me read all three files carefully before generating anything.Full context absorbed. Phase 1 and Phase 2 are complete. I know exactly what the design system has established, what the landing page built, and what the guardrails demand. Now executing Phase 3 in full.

---

# Kinetiq — Design Phase 3
## Patient Experience

---

## Design Intent

The patient experience is a trust-to-transaction pipeline. Every screen in this phase exists to move a patient from "I need help" to "I have an appointment booked" with the least possible friction, the most possible confidence, and zero moments where they feel uncertain about what to do next.

The patient's emotional state matters here in a way it did not on the landing page. A landing page visitor is curious. A patient navigating the discovery page is often in discomfort, potentially anxious about their condition, and evaluating whether this platform is trustworthy enough to put their healthcare in its hands. Every design decision in Phase 3 must be filtered through that reality.

This means: clarity over cleverness. Obvious hierarchy over visual interest. Reassurance over boldness. The Swiss system does not get diluted here — its structural discipline is exactly what creates the clarity and professionalism that anxious patients respond to. But the bold typographic gestures of the landing page are replaced by dense, efficient, information-rich layouts that communicate operational maturity.

The reference products for the patient experience are Stripe's checkout flow (zero confusion about the next step), Linear's issue detail view (every piece of information in its correct place), and Zocdoc's doctor profile page (trust signals stacked at exactly the right moments in the decision journey).

---

# PROMPT D3.1 — Patient-Facing Layout Shell

## Objective
Establish the layout shell used by all public-facing patient pages: the doctor discovery page, doctor profile page, and any patient-accessible page that is not behind the dashboard. This shell uses the navbar from Phase 2 and a content container system. It is distinct from the dashboard shell built in Phase 4.

## Why This Exists
The patient experience spans two layout contexts: the public browsing experience (discovery, doctor profiles) and the authenticated dashboard experience (appointments, payments, reviews). Phase 3 covers the public browsing experience. These pages share a full-width layout — no sidebar — with the Navbar at the top. The shell defines the horizontal padding, the maximum content width, and the page-level vertical spacing that every public patient page inherits.

## Layout Specification

The public layout container is full-width up to a maximum of `1440px`, centered. Horizontal padding is `64px` on each side. There is no inner sidebar, no secondary navigation, no persistent panel. The navbar is the only persistent element.

Every public page begins immediately below the navbar with a page-specific header section. This header section uses the `SectionHeader` component from Phase 1 without a section number — public browsing pages are not numbered. They are functional destinations, not narrative sections. The page header sits directly on white background with `48px` of vertical space above it and `64px` below it before the main content begins.

Within the main content area, the layout switches between two column configurations depending on the page: single-column full-width for text-heavy pages, and two-column split for pages where a filter panel or booking panel runs alongside primary content.

## Patient Navigation Context

The Navbar from Phase 2 in its logged-out state shows `FIND DOCTORS` and the auth CTAs. In its logged-in patient state it adds `MY APPOINTMENTS` and the user avatar menu. No other navigation additions. The patient Navbar must not show doctor-specific or admin-specific links under any circumstances — the role guard on Navbar links must be verified as part of this phase.

---

# PROMPT D3.2 — Doctor Discovery Page

## Objective
Redesign the doctor discovery page — the primary browsing and search surface for patients. This is where a patient arrives after clicking a specialization card on the landing page, after submitting the AI symptom search, or after clicking `BROWSE DOCTORS`. It is the product's primary marketplace surface.

## Page Architecture

The page is a two-panel layout with a left filter panel and a right results area. The filter panel is `280px` wide with a `2px` right border separating it from the results. The results area takes the remaining width. Neither panel has a card wrapper or a shadow — their edges are defined by borders, consistent with the design system's structural principles.

There is no page header with a section number here. The page opens directly with the search bar at the very top — full-width, spanning both panels — because the first thing most visitors arriving from the landing page need to do is refine or change their search. Making them scroll past a header to reach the search bar is friction. The search bar is the page.

## Search Bar

Full-width, sitting directly below the navbar with `32px` of vertical space above and below it before the two-panel layout begins. The search bar is a rectangular bordered container — `2px` black border — that holds the text input and the `FIND CARE →` button as a flush-right attachment. The input takes the full width minus the button. The button is the primary black variant from Phase 1.

To the left of the text input: a small bordered square containing the search icon — not inside the input field, but as a structural element of the container. This creates visual clarity: the icon identifies the container type, the input receives the text, the button submits. Three distinct zones.

The AI symptom search sits below the main search bar as a secondary path: a smaller, lighter-bordered input with the label `OR DESCRIBE YOUR SYMPTOMS →` in small red uppercase to its left. This is contextually available but visually subordinate — it is for patients who do not know exactly what specialization to search for. Patients who do know go directly to the main search. The hierarchy of these two search mechanisms must be obvious at a glance.

When the AI symptom search returns a recommendation, it appears as a full-width bordered card in amber — the pending/attention color — with the label `AI RECOMMENDATION` in small uppercase and the suggested specialization + explanation. The amber color is its only appearance outside of status badges in this phase, and it is justified: the AI recommendation is information that needs attention before the patient proceeds. An amber-bordered informational card is the correct register.

Smart search suggestions from Feature F9 appear as a dropdown directly below the main search input. This dropdown is a bordered rectangle, white background, no border radius. Each suggestion row has a bordered square category indicator on the left (`🏥` for specialization, `📍` for city, `👨‍⚕️` for doctor name) — rendered as a Lucide icon inside a bordered square, not an emoji. The suggestion text in bold uppercase. On hover: the row background inverts to the gray surface color. On selection: the row inverts to black with white text for `150ms` before the dropdown closes. This mechanical flash confirms the selection without confusion.

## Filter Panel

The filter panel has no card wrapper, no background color. It is defined only by its right border. The panel's own sections are divided by thin horizontal rules — a visual hierarchy within the panel itself.

The panel header is a `SectionHeader` with no section number, title `FILTERS`, and no bottom rule — the panel's border performs that structural function.

Each filter group has an uppercase red label as its group header — not a `SectionHeader` component, but a raw label in the section-label utility class from Phase 1. This keeps filter groups visually subordinate to the page-level header while still being clearly identified.

**Specialization Filter** — checkboxes presented as bordered square indicators that fill black when checked. The default browser checkbox is replaced entirely. Each label is in mixed-case at `ui-md` size. The filter shows 6 specializations by default with a `+ SHOW MORE` text link below that expands the full list. Showing all specializations by default overwhelms the patient — 6 gives enough choice while maintaining panel density.

**Location Filter** — a single text input inside the panel. Rectangular, `2px` border, no placeholder icon. On focus: border becomes `4px` black. A `NEAR ME →` text link below the input uses the browser's geolocation to populate the field. This text link is in small uppercase with the `→` arrow — consistent with the system's directional language.

**Availability Filter** — three toggle buttons: `ANY TIME`, `TODAY`, `THIS WEEK`. These are bordered rectangles. The active state is black fill with white text. All inactive. Clicking one activates it and deactivates the others. This is a segmented control pattern — not radio buttons, not checkboxes — because these options are mutually exclusive and visual.

**Fee Range Filter** — two bordered rectangular number inputs side by side with a `—` separator between them. No slider. Min on the left, max on the right. Labels above each in small uppercase gray: `MIN ₹` and `MAX ₹`. The currency symbol is structural — it contextualizes the inputs without requiring explanation.

**Active Filter Chips** — selected filters appear as a row of chips directly above the results area, below the search bar. Each chip is a bordered rectangle with the filter value in small uppercase and an `×` to remove it. The active chips row is separated from the results by a thin horizontal rule. When no filters are active, this row does not exist — it appears only when filters are applied.

## Results Area

**Results Header Row** — a single horizontal bar sitting at the very top of the results panel, flush with the top of the filter panel. This bar contains: the result count on the left (`47 SPECIALISTS FOUND` in bold uppercase at `ui-lg` size), and the sort controls on the right. The sort controls are a segmented control — four bordered rectangular buttons: `RELEVANCE`, `RATING ↓`, `FEE ↑`, `FEE ↓`. The active sort button is black fill, white text. Inactive buttons are white fill, black border.

**Doctor Cards Grid** — three columns on large desktop (`1440px+`), two columns on standard desktop. Cards are bordered rectangles on white — not on gray surface. The gray surface is reserved for the filter panel and alternate-section backgrounds. Doctor cards on white have their borders carry the full visual weight.

Each doctor card contains, top to bottom:

The card header: a horizontal row with the doctor's initial circle on the left, and the doctor's name in `display-xs` size (24px) uppercase bold directly to its right. The name is the largest type on the card — it is the primary identifier. Below the name, on the same horizontal level as the bottom of the circle: the specialization in small red uppercase tracked — the only red text on a card in the entire product. This is its one permitted use: specialization as a categorical signal.

Below the header: a thin horizontal rule spanning the card width. This separates identity from data.

Below the rule: a data row showing location (city), years of experience, and consultation fee. These three pieces of information are the most common filter criteria patients apply mentally before clicking. They must be visible without interaction. The fee is shown with the `₹` symbol and is in bold — it is the piece of information most likely to affect the decision and receives visual emphasis accordingly.

Below the data row: the rating expressed as `4.8 / 5` in small bold with `(23 reviews)` in small gray immediately after. No star icons — stars are imprecise and visually noisy at small sizes. The number is more trustworthy and occupies less space.

Below the rating: a `BOOK NOW →` ghost button, full-width, that becomes visible on hover. In the card's default state it is not present — the card is an information object, not an action object, until the patient indicates interest by hovering. On hover: the card border thickens to `4px`, and the `BOOK NOW →` button slides in from the bottom of the card at `200ms`. This is a progressive disclosure — the action appears at the moment of intent.

The verified badge from Phase 1 appears in the top-right corner of the card as a small teal bordered rectangle reading `VERIFIED`. Its position is consistent across every card. Its presence — or absence — is immediately scannable across the grid.

**Loading State** — three rows of three skeleton cards matching the exact proportions of a doctor card. The skeleton uses the gray-100 fill with opacity pulse from Phase 1. There is no spinner, no loading text, no progress bar.

**Empty State** — when the filters produce no results: the EmptyState component from Phase 1, positioned in the center of the results area. Icon: search icon in a bordered square. Title: `NO SPECIALISTS FOUND`. Description: one sentence. Action: `CLEAR FILTERS →` as a secondary button.

---

# PROMPT D3.3 — Doctor Profile Page

## Objective
Redesign the doctor profile page — the decision-making surface where a patient evaluates a specific doctor and decides whether to book. This is the most information-dense patient-facing page in the product and the page where trust is either confirmed or lost.

## Why This Page Is Critical

Every patient who reaches the doctor profile page has already passed the initial trust gate of the landing page and the filtering gate of the discovery page. They are qualified and interested. The profile page is the closing argument — it must present every trust signal, every piece of relevant information, and the booking mechanism in a layout so clear that the patient can make a decision without uncertainty.

The two biggest failure modes of a doctor profile page are information overload (patient overwhelmed and leaves) and information scarcity (patient doesn't have enough to decide and leaves). The design must thread this needle precisely.

## Page Layout

A `7:5` asymmetric split. Left seven columns: doctor information, trust signals, biography, AI summary, and reviews. Right five columns: the booking panel — sticky on scroll. These two columns are separated by a `2px` vertical border.

The sticky booking panel is the single most important UX decision on this page. When a patient scrolls down reading the doctor's bio and reviews, the booking panel stays in view. The decision mechanism is always present. This eliminates the single most common drop-off point on marketplace profile pages: the patient reads, gets interested, scrolls all the way down, and then cannot find the booking button without scrolling back up.

## Left Column — Doctor Information

**Profile Header Section**

The doctor's name in `display-md` (48px) uppercase bold, negative tracked. Below the name: the specialization in small red uppercase tracked — this is the third use of red in the product (the others are CTAs and section prefixes). Below the specialization: a single horizontal rule.

Below the rule: a row of three key statistics separated by thin vertical lines. Years of experience (label: `YEARS EXPERIENCE`), total appointments completed (label: `SESSIONS COMPLETED`), and average rating as `4.8/5` (label: `PATIENT RATING`). Each statistic is a number in `display-xs` bold with its label in small uppercase gray below it. This row exists to answer the patient's immediate competence questions — how experienced are they, how many others have used them, how good are they — in three numbers with no narrative required.

Below the statistics row: the verified badge in its teal bordered rectangle form, reading `VERIFIED SPECIALIST`. If the doctor is not verified they should not appear in search results at all — this badge will always be present on profile pages. Below the badge: the clinic location in small mixed-case gray with a location icon in a bordered square.

**AI Summary Section**

A bordered card on the gray surface background with the diagonal pattern applied. The card is the only pattern-textured surface in the left column — it draws attention precisely because everything around it is pattern-free. The card header is the label `AI SUMMARY` in small red uppercase with a section header rule beneath it — but using the `size='sm'` variant with `ruled={true}`. The card content is the AI-generated summary text in regular mixed-case italic at `ui-lg` size. At the bottom of the card: a tiny attribution line in the smallest type size: `Generated from verified professional information`.

Why italic for the AI summary? It visually separates AI-generated content from the doctor's own words (which appear in the bio section below in regular weight). The patient can scan and know immediately: italic = AI synthesis, regular = doctor's own statement.

**About Section**

The `SectionHeader` component with no section number, title `ABOUT`, size `sm`, ruled `true`. Below it: the doctor's biography text in regular mixed-case at `ui-lg` size. This is the only long-form prose block on the page. Maximum two paragraphs are rendered — if the database content is longer, it is truncated at two paragraphs with a `READ MORE →` text link that expands inline.

**Reviews Section**

The `SectionHeader` component with no section number, title `PATIENT REVIEWS`, size `sm`, ruled `true`. The rating summary sits directly below the header — before the individual review cards. The summary is a single row: the average rating in `display-sm` (32px) bold on the left, then `out of 5` in small gray, then the review count in small gray, then a visual rating bar on the right — a full-width horizontal bar divided into five segments, each segment a bordered rectangle, filled black up to the rating point. No star icons.

Individual review cards below the summary are stacked vertically, full-width of the left column. Each card is a bordered rectangle, white background. Inside each card: a large opening quotation mark in red at `display-sm` weight-thin, the review text in mixed-case regular at `ui-lg`, the patient's first name + initial of last name in small bold uppercase, and the date in small gray. The rating for that specific review is shown as a bordered square number in the top-right corner of the card.

Reviews are shown with a maximum of three visible. If more exist: a `SHOW ALL REVIEWS →` secondary button centered below the three cards expands the full list inline.

## Right Column — Booking Panel (Sticky)

The booking panel is the most important functional element in the product. It is sticky — it scrolls with the patient as they read the left column. The panel is bounded by a `2px` left border on its left edge (the divider between columns), no other borders. Its internal contents are organized with light horizontal rules.

**Consultation Fee Header**

The fee in `display-sm` (32px) bold black at the very top of the panel. Below it: `PER SESSION` in small uppercase gray. A horizontal rule separates the fee from the availability section below it.

This fee placement is intentional. The most common reason a patient abandons a doctor profile is discovering the price too late — after they've already invested time reading. Showing the price first, prominently, at the top of the booking panel eliminates that abandonment moment. The patient knows the fee before they read anything else in the column.

**Availability Heatmap**

The four-week heatmap from Feature F6, rendered in the Swiss style. The heatmap is a `7×4` grid of bordered rectangle cells. Cell size is consistent — approximately `36px × 36px` with `4px` gaps. No rounded corners.

Cell states:
- Available: gray-100 background, black border, black date number — default, unselected state
- Selected: black background, no border (border becomes the background edge), white date number
- Limited: amber-tinted background using the status amber at very low opacity, amber border — 1–2 slots remaining
- Fully booked: gray-50 background, gray-200 border, gray-400 date number — not interactive
- Unavailable (no slots): white background, no border, gray-200 date number — not interactive

The day-of-week labels above the grid (`M T W T F S S`) are in small uppercase gray. Below the grid: a legend using bordered squares matching the cell states, with small uppercase gray labels: `AVAILABLE`, `LIMITED`, `FULL`.

**Time Slot Selector**

Appears below the heatmap when a date is selected. The selected date is shown as a subheader in `ui-sm` uppercase: `TUESDAY, 10 FEB — AVAILABLE TIMES`. Below it: a grid of time slot chips. Each chip is a bordered rectangle, `2px` black border, white fill, the time in small bold (`09:00 – 09:30`). Selected state: black fill, white text, no border. The chips are sized to fit 3 per row — not a horizontal scroll, a grid. Each row of chips represents a cluster of the day's slots.

When no date is selected: the time slot area shows the empty state label `SELECT A DATE TO SEE AVAILABLE TIMES →` in small uppercase gray. The arrow reinforces the action sequence: select date, then select time.

**CTA Button**

`CONFIRM & PAY →` as the full-width accent red button from Phase 1. When no slot is selected: the button reads `SELECT A TIME SLOT` and is disabled at 40% opacity — same button, same position, same size, changed label and state. This is better than hiding the button until a slot is selected, because the patient can see what is about to become available to them. It creates anticipation rather than confusion.

Below the button: a single line in the smallest text size, mixed-case gray: `Secure payment via Razorpay. Confirmation sent by email.` This line is not a CTA, not a link — it is a trust-completing sentence that removes the two remaining objections: security and confirmation.

---

# PROMPT D3.4 — Booking Confirmation Modal

## Objective
Redesign the booking confirmation modal that appears when a patient clicks `CONFIRM & PAY →`. This modal is the last moment before a financial transaction. It must inspire absolute confidence.

## Why This Modal Matters More Than It Seems

The booking confirmation modal has the highest stakes of any modal in the product. The patient is about to pay money for a healthcare service. Any moment of uncertainty — about what they're paying, who they're paying, when the appointment is — can cause abandonment. The modal must eliminate every uncertainty in a single screen.

## Modal Specification

The modal uses the Modal primitive from Phase 1: full rectangular, `2px` black border, white background, dark overlay. It is horizontally centered and vertically centered on the screen. Its width is fixed at `560px` — wide enough to contain the information without scrolling, narrow enough to feel focused rather than expansive.

**Modal Header**

`CONFIRM BOOKING` in `display-xs` (24px) uppercase bold. Below it: a `4px` bottom rule. The header is left-aligned, not centered. Swiss alignment is always left. The close button (×) sits in the top-right corner at the same vertical alignment as the header title.

**Appointment Summary**

A definition-list layout — the most information-efficient pattern for key-value pairs. Labels on the left in small uppercase tracked gray. Values on the right in `ui-md` regular black. The label-value pairs, in order:

`DOCTOR` — Dr. [Name] (the first and only time a title appears — patients expect `Dr.` before paying)
`SPECIALIZATION` — in red small uppercase (the one categorical identifier that appears in red)
`DATE` — written out fully: `Tuesday, 10 February 2025`
`TIME` — `09:00 – 09:30`
`DURATION` — `30 minutes`
`CONSULTATION FEE` — in `display-xs` bold black, right-aligned — the fee is the most important value and receives visual emphasis proportional to its importance

A `2px` horizontal rule separates the summary from the payment section below.

**Payment Section**

A gray-surface bordered card inside the modal. Inside: the fee again, now labeled `AMOUNT DUE` in `display-sm` bold — larger than in the summary above because this is the financial commitment moment. Below it: the payment method label `PAID VIA RAZORPAY` with a bordered square containing the Razorpay logo-placeholder or simply the text `RAZORPAY` in small tracked text.

**Notice Line**

Below the payment card: a single sentence in small mixed-case gray: `You will be redirected to complete payment. Your appointment is confirmed immediately upon successful payment.` This sentence answers the two questions every patient has at this moment.

**Action Buttons**

Two buttons stacked full-width:
1. `CONFIRM & PAY ₹[amount] →` — accent red, full-width. The fee appears in the button label itself. When the patient clicks, they know exactly what they're confirming. The specificity removes the last moment of doubt.
2. `CANCEL` — ghost variant, full-width, below the primary button with `8px` gap.

The two-button layout with the primary on top and the cancel below is deliberate: the eye flows top to bottom, and commitment (pay) precedes escape (cancel). This is the correct order for a payment confirmation flow.

---

# PROMPT D3.5 — Patient Dashboard

## Objective
Redesign the patient dashboard — the operational home for a logged-in patient. This is not a marketing surface. It is a functional workspace that a patient opens to check upcoming appointments, find new doctors, manage their history, and review their payments.

## Design Philosophy for This Page

The patient dashboard is used primarily in two moments: the days before an appointment (patient checking details) and the days after an appointment (patient reviewing, possibly leaving a review). It is not a daily tool — it is a periodic check-in surface. The design must communicate status clearly on first glance without requiring the patient to navigate.

## Dashboard Layout Shell

The patient dashboard uses a full left sidebar navigation, consistent with all dashboard pages across all roles. The sidebar is `240px` wide with a `2px` right border. The main content area takes the remaining width.

**Sidebar Contents, Top to Bottom:**

The product name `KINETIQ` in uppercase bold at the very top of the sidebar, with `24px` vertical padding above and below it. Below it: a thin horizontal rule.

Navigation items as full-width rows: `DASHBOARD`, `MY APPOINTMENTS`, `FIND DOCTORS`, `PAYMENT HISTORY`, `MY REVIEWS`, and at the very bottom separated by a rule: the user's name and avatar circle.

Each navigation row: `48px` height, `24px` horizontal padding, uppercase tracked text at `ui-sm` size. Default state: white background, black text. Active state: black left border `4px`, black background, white text. Hover state: gray-100 background, no border change. The active state black background is the only full-area inversion in the navigation — it is more emphatic than a simple border highlight because the patient needs to know clearly which section they are in.

## Dashboard Home — Overview

**Page Header**

Not a `SectionHeader` component — a greeting. `GOOD MORNING, [FIRST NAME].` in `display-sm` bold uppercase. Below it: today's date in `ui-lg` mixed-case gray. Below that: a `4px` full-width rule.

This personalized greeting does something specific: it contextualizes everything below. When a patient opens their dashboard and sees their name and today's date in large type, they are oriented in time and space. The dashboard is about now — not about the platform's general features.

**Upcoming Appointment Spotlight**

If the patient has an upcoming appointment within the next 7 days: a full-width bordered card, gray surface background, with the diagonal pattern applied. This card has higher visual priority than everything else on the page because an imminent appointment requires attention.

Inside the card: `YOUR NEXT APPOINTMENT` in small red uppercase as the card label. Below it: the doctor's name in `display-xs` bold uppercase. Below that: date and time in `ui-xl` bold — `Tuesday, 10 Feb · 09:00 – 09:30`. Below that: a row with the specialization in red small uppercase, the clinic location in small gray, and the fee in bold. Two action buttons at the bottom of the card, side by side: `VIEW DETAILS →` in secondary and `CANCEL →` in ghost. The cancel action link is not red here — red is reserved for destructive actions in tables. In this card context, ghost is the correct register.

If no upcoming appointment exists: the card is replaced by an `EmptyState`-style row — bordered rectangle, white background, the message `NO UPCOMING APPOINTMENTS` in small uppercase gray, and `FIND A DOCTOR →` as a primary black button. This converts the empty state into a conversion opportunity.

**Metric Cards Row**

Four bordered cards in a `4×1` row below the upcoming appointment section. Each card is the metric variant from Phase 1 — bordered rectangle, white background, border-weight increase on hover (not color inversion).

The four metrics: `TOTAL APPOINTMENTS` (count), `COMPLETED SESSIONS` (count), `DOCTORS SEEN` (unique doctor count), `REVIEWS GIVEN` (count). Numbers in `display-xs` bold. Labels in small uppercase gray. Each card occupies exactly one-quarter of the available width.

**Recent Activity**

`SectionHeader` with no section number, title `RECENT ACTIVITY`, size `sm`, `ruled={true}`.

Below it: the three most recent appointments rendered as bordered rows in a table-like format. Not cards — rows. Each row: date on the far left in small gray, doctor name in bold `ui-md`, specialization in small red uppercase, status badge in the appropriate state, and a `VIEW →` text link on the far right. Rows are separated by `1px` hairline rules.

Below the three rows: `VIEW ALL APPOINTMENTS →` as a secondary button, left-aligned. This pattern — three rows visible, full list accessible — appears consistently across all dashboards. It gives the patient immediate context without overwhelming them with data.

---

# PROMPT D3.6 — Appointment History Page

## Objective
Redesign the full appointment history page — the complete list of all patient appointments across all statuses. This is an operational reference page — the patient comes here to check details, find past doctors, or verify a booking.

## Page Header

`SectionHeader` with no number, title `MY APPOINTMENTS`, size `lg`, `ruled={true}`.

Immediately below the header: the filter tab row. `ALL APPOINTMENTS`, `UPCOMING`, `COMPLETED`, `CANCELLED` as a segmented control — bordered rectangles, the active tab in black fill with white text. Inactive tabs in white fill with black border. The tab row sits between the header and the table with `24px` vertical spacing on each side.

## Appointments Table

Full-width table using the Table primitive from Phase 1.

**Column structure:**

`DATE` — date written as `10 Feb` in `ui-sm` regular gray. Not full date — space is at a premium in a table column. Year is omitted except where ambiguity exists.
`DOCTOR` — name in `ui-md` bold black. Specialization in `ui-xs` red uppercase below the name — stacked two-line cell. This is the densest column and it justifies a two-line treatment because both pieces of information affect the patient's identification of the row.
`TIME` — `09:00 – 09:30` in `ui-sm` regular
`DURATION` — `30 MIN` in `ui-sm` uppercase gray — this column can be hidden on narrower desktop layouts
`FEE` — `₹[amount]` in `ui-sm` bold. Right-aligned — financial data is always right-aligned.
`PAYMENT` — payment status badge: `PAID` in teal, `UNPAID` in amber. Teal and amber are their permitted status uses.
`APPOINTMENT STATUS` — appointment status badge: `CONFIRMED` in teal, `COMPLETED` in teal, `CANCELLED` in gray, `PENDING` in amber.
`ACTIONS` — `VIEW` text link and `CANCEL` text link. The `CANCEL` link is in red — its one destructive table use. `CANCEL` only appears in rows where `status === 'confirmed'` and the date is in the future.

**Table Behavior:**

Row hover: gray-100 fill across the full row width — the standard table hover from Phase 1.

Clicking a row (anywhere except the action links) expands it inline to reveal appointment details: session notes PDF download link if present, cancellation reason if cancelled, review submission form if completed and unreviewed. The expanded row has a slightly indented gray surface background and a `4px` left border. This inline expansion pattern prevents navigation to a separate page for detail viewing — the table itself becomes the detail surface.

**Pagination**

Below the table: a pagination row left-aligned. `← PREVIOUS` and `NEXT →` as ghost buttons. Between them: `Page 2 of 7` in small uppercase gray. Pagination is explicit — the patient always knows where they are in the full list.

---

# PROMPT D3.7 — Review Submission (Inline)

## Objective
Redesign the review submission flow. Reviews are submitted inline within the expanded appointment row — not on a separate page, not in a modal. The contextual placement is deliberate: the patient is looking at the appointment record when the review prompt appears, which is the moment when the context of what they are reviewing is freshest.

## Eligibility Gate Visual

When an appointment row is expanded and the appointment is completed, paid, and unreviewed: a bordered card appears inside the expanded row. The card header: `LEAVE A REVIEW` in small red uppercase label, the doctor's name in bold uppercase below it, a `2px` rule beneath.

The presence of this card is the review prompt. There is no separate CTA button that opens a form. The form is the prompt.

## Rating Selector

Five bordered square buttons in a horizontal row, labeled `1` through `5`. Default state: white fill, `2px` black border, number in bold black. Hover state: gray-100 fill. Selected state: black fill, `2px` black border, number in white. Adjacent unselected buttons in a partially-selected state: no change — there is no fill progression. The patient selects a number. It inverts to black. The others remain white.

This numbered rating is more consistent with the Swiss system than star icons. Stars are a pattern borrowed from five-star hotel reviews and Amazon products. A numbered selector from 1–5 is more clinical, more precise, and more appropriate to a healthcare context where the patient is rating professional quality, not product satisfaction.

Below the rating buttons: a small label below each number, in the smallest text size, that appears only when the cursor is near: `1 = POOR`, `3 = GOOD`, `5 = EXCELLENT`. These labels are not always visible — they appear on proximity to prevent label clutter while still providing reference.

## Comment Input

A full rectangular bordered textarea below the rating selector. The label above it: `YOUR EXPERIENCE` in small uppercase tracked. Placeholder text: `Describe your session, the physiotherapist's approach, and your recovery progress.` — specific, healthcare-appropriate, mixed-case. A character counter at the bottom-right of the textarea: `142 / 1000` in small gray.

## Submit Button

`SUBMIT REVIEW →` as a full-width primary button below the textarea. Disabled state at 40% opacity when no rating is selected or comment is under 10 characters. The disabled state button reads `COMPLETE YOUR RATING ABOVE` rather than being simply greyed out — the label communicates what is missing rather than just blocking action.

## Post-Submission State

On successful submission: the review form is replaced by a confirmation card inside the same expanded row. The card reads: the patient's submitted rating in a bordered square, their review text in italic mixed-case, and below it: `REVIEW SUBMITTED — THANK YOU.` in small uppercase teal. The teal is its permitted use for a positive confirmed state. The form does not reappear. The row is now in a permanently reviewed state.

---

# PROMPT D3.8 — Payment History Page

## Objective
Redesign the patient payment history page. This page is a financial record — it is used primarily for reference and reassurance: did my payment go through? What did I pay for? When?

## Page Header

`SectionHeader` with no number, title `PAYMENT HISTORY`, size `lg`, `ruled={true}`.

Below the header: two metric cards in a `2×1` row. `TOTAL SPENT` (sum of all paid amounts) and `SESSIONS PAID` (count). Both use the metric card variant — white background, `2px` border, border-weight increase on hover. These two numbers give the patient immediate financial context before they see the full table.

## Payments Table

**Column structure:**

`DATE` — formatted as before
`APPOINTMENT` — doctor name bold + specialization in red small below, two-line cell
`AMOUNT` — `₹[amount]` in bold, right-aligned
`PAYMENT ID` — last 8 characters of the Razorpay payment ID, in `ui-xs` monospace-weight gray. The full ID is shown in a tooltip on hover. Monospace character spacing (applied via `font-variant-numeric: tabular-nums`) keeps the IDs visually aligned even when character counts differ.
`STATUS` — `PAID` in teal badge or `FAILED` in red badge (if applicable)
`ACTIONS` — `DOWNLOAD RECEIPT →` text link and `VIEW APPOINTMENT →` text link

**Why a Download Receipt link:**
Patients who need to submit medical expense claims to insurance or employers need a receipt. The link triggers the session document download if it exists (from Feature F3), or a browser-generated plain-text receipt if not. This transforms the payment history from a read-only record into a functional tool — an important distinction for a healthcare platform.

---

# PROMPT D3.9 — My Reviews Page

## Objective
Redesign the patient reviews page — the list of all reviews a patient has written. This is primarily a reference page with low usage frequency, but it must maintain design system consistency and provide a clear path back to action.

## Page Header

`SectionHeader` with no number, title `MY REVIEWS`, size `lg`, `ruled={true}`.

## Reviews List

If no reviews have been submitted: the EmptyState component. Icon: star icon in a bordered square. Title: `NO REVIEWS YET`. Description: `Reviews help other patients find the right physiotherapist. Share your experience after a completed session.` Action: `VIEW MY APPOINTMENTS →` — directing the patient to the appointments page where completed and unreviewed sessions have the review prompt.

If reviews exist: a single-column list of bordered cards. Each card contains:
- The doctor's name in bold uppercase at `ui-xl` size
- The specialization in red small uppercase
- The appointment date in small gray
- The submitted rating in a bordered square in the top-right corner of the card
- The review text in italic mixed-case at `ui-lg` size below the header
- The submission date in the smallest text size in gray at the bottom

The card is not interactive — there is no edit, no delete. Patient reviews are permanent records on the platform. Making them look editable would be misleading. The card is deliberately static — no hover state, no inversion, no action affordance.

---

# PROMPT D3.10 — Waitlist UI (Patient-Facing)

## Objective
Redesign the waitlist UI for Feature F10 — the experience a patient has when a doctor has no available slots and the patient joins the waitlist. This is a conversion-preservation surface: instead of a dead end, the patient gets a confirmed waiting state.

## Empty Slots State

When the booking panel in the doctor profile page shows no available slots: the heatmap is replaced by a full-width bordered card, gray surface, diagonal pattern. This card contains:

The label `NO AVAILABILITY` in small uppercase gray at the top. Below it: `DR. [NAME] HAS NO OPEN SLOTS CURRENTLY` in bold uppercase at `ui-xl` size. Below that: a single mixed-case sentence: `Join the waitlist and we'll notify you when new slots open.`

The `JOIN WAITLIST →` button is the full-width primary black variant — not red. Red is for CTAs that initiate a transaction. Joining a waitlist is not a transaction — it is a commitment of interest, which warrants a primary but not accent button.

## Waitlist Confirmed State

After joining: the card content changes without page reload. The button is replaced by a confirmation row: a teal `✓` checkmark in a bordered square (teal is its permitted confirmed-state use), the text `YOU'RE ON THE WAITLIST` in small teal uppercase, and below it: `We'll notify you when new slots are available.` in small gray mixed-case. A `LEAVE WAITLIST` text link appears below this in the smallest text size, no decoration — it is accessible but not prominent.

The teal confirmation is the correct register here. Joining a waitlist is a positive, confirmed outcome — not a payment, not a booking, but a successful action. Teal communicates: this worked, you are safe.

---

## Phase 3 Completion Gate

Before Phase 4 (Doctor Experience) begins, every item in this list must be verified:

```
✅ Public layout shell established — 64px horizontal padding, 1440px max-width
✅ Patient Navbar shows correct links for logged-in and logged-out states
✅ Doctor discovery search bar spans full width above two-panel layout
✅ AI recommendation card uses amber border, not red
✅ Smart search suggestions dropdown uses bordered rows, no border-radius
✅ Filter panel has no card wrapper — defined by its right border only
✅ Filter checkboxes are custom bordered squares — no browser defaults
✅ Location filter has NEAR ME → geolocation link
✅ Active filter chips appear above results when filters are active
✅ Results sort control is a segmented bordered control — not a dropdown
✅ Doctor cards show specialization in red, all other text in black/gray
✅ Doctor cards show BOOK NOW → only on hover (progressive disclosure)
✅ Verified badge is teal bordered rectangle, top-right of every card
✅ Doctor profile page has sticky right booking panel
✅ Consultation fee appears at the TOP of the booking panel — not after the heatmap
✅ Heatmap uses bordered rectangle cells — no rounded cells
✅ Time slot chips are bordered rectangles — no pill shapes
✅ CTA button reads SELECT A TIME SLOT when no slot is selected (disabled)
✅ Booking modal fee appears in the button label itself (CONFIRM & PAY ₹500 →)
✅ Patient dashboard greeting uses GOOD MORNING, [NAME] in display type
✅ Upcoming appointment spotlight uses diagonal pattern on gray surface
✅ No upcoming appointment state shows FIND A DOCTOR → CTA
✅ Appointment table has inline row expansion — no separate detail page
✅ CANCEL action in table is red text — its one destructive table use
✅ Review submission is inline in expanded appointment row — not a modal
✅ Rating selector is numbered 1–5 bordered squares — not star icons
✅ Disabled submit button label communicates what is missing, not just blocks
✅ Post-submission state shows teal confirmation — not a success toast
✅ Payment table financial columns are right-aligned
✅ Payment ID shows last 8 chars with full ID on hover tooltip
✅ Waitlist CTA is primary black — not accent red
✅ Waitlist confirmed state uses teal — its permitted confirmed use
✅ Zero new colors introduced — every color is from the Phase 1 token system
✅ Zero border-radius introduced except avatar circles
✅ Zero drop shadows introduced anywhere
✅ All hover states are mechanical — color inversions or border weight changes
```

**Phase 3 unlocks Phase 4 (Doctor Experience) because:**
- The sidebar navigation shell used in the patient dashboard is the same shell the doctor dashboard inherits — built once in D3.5, reused in Phase 4
- The appointment table component built in D3.6 is reused in the doctor appointments page — same table, different data, same visual system
- The review card component built in D3.9 is reused in the doctor's reviews page
- The availability heatmap built in D3.3 is the same component used in the doctor's availability management page — patient view and doctor view render the same component with different interaction states

---

Say **"Phase 4"** when ready for the Doctor Experience direction.