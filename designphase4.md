# Theralign — Design Phase 4
## Doctor Experience

---

## Design Intent

The doctor experience is a professional operations platform. The patient experience was built around trust and conversion — getting someone who is uncertain to make a decision. The doctor experience is built around efficiency and clarity — giving someone who is already committed the tools to run their practice without friction.

Doctors using this platform are professionals managing a real business. Every minute they spend navigating a confusing interface is a minute taken from patient care. The design must honor that. Information density increases here. Workflows are more complex. The interface must expose more capability without increasing cognitive load.

The closest reference products are Linear for its information density and workflow clarity, Stripe Dashboard for its financial data presentation, and Vercel for its deployment and settings management. All three share a common characteristic: they make complex operational data legible through structural discipline, not simplification. That is exactly the register the doctor experience must occupy.

The Swiss system applies here with more restraint than on the landing page and more density than on the patient experience. Sections breathe less. Tables are tighter. Actions are more prominent. The doctor does not need to be persuaded — they are already here. They need to work.

---

# PROMPT D4.1 — Doctor Dashboard Shell & Navigation

## Objective
Establish the doctor dashboard layout shell — the sidebar navigation, the main content container, and the persistent structural elements that appear on every doctor-facing page. This shell is a variation of the patient dashboard shell from D3.5, with a different navigation set and a denser information register.

## Why This Is Its Own Prompt

The doctor shell shares structural DNA with the patient shell — same sidebar width, same border, same product name at the top — but the navigation items, the operational density of the content area, and the information hierarchy are sufficiently different to warrant a dedicated specification. Building them as separate layout components also ensures that role-based access is structurally enforced at the layout level, not just at the route level.

## Sidebar Specification

The sidebar is `240px` wide with a `2px` right border. White background. No shadow. Its top contains the `KINETIQ` logotype in uppercase bold with `24px` vertical padding, followed by a thin horizontal rule. This is identical to the patient sidebar — the product name does not change based on role.

**Doctor Navigation Items:**

`OVERVIEW` — the dashboard home
`APPOINTMENTS` — the full appointment management surface
`AVAILABILITY` — slot creation and schedule management
`EARNINGS` — financial overview and transaction history
`MY PROFILE` — profile editing and document management
`MY REVIEWS` — patient reviews received

At the very bottom of the sidebar, separated from the navigation items by a horizontal rule: a small section containing the doctor's avatar circle, their name in small bold, and `VERIFIED SPECIALIST` in the teal badge if verified or `PENDING VERIFICATION` in the amber badge if not. This persistent verification status indicator at the bottom of every sidebar page means the doctor never loses sight of their platform standing.

**Active Navigation State** — identical to patient: `4px` left black border, black background fill, white text. The active state is emphatic because the doctor navigates between dense operational pages and must always know where they are.

**Pending Items Badge** — the `APPOINTMENTS` navigation item carries a count badge when there are appointments requiring action (newly booked, requiring confirmation, or requiring completion). This badge is a small bordered rectangle — rectangular, not circular, consistent with the geometry rules — positioned to the right of the label. Black border, black text, small. This is not a notification bubble; it is an operational indicator. It tells the doctor there is work to do without demanding immediate attention.

## Main Content Area

The main content area begins `64px` from the left edge of the sidebar (the sidebar's `240px` plus padding). All pages within the doctor dashboard use the same horizontal padding of `48px` left and right. This is slightly tighter than the public layout's `64px` — dashboard density requires more horizontal content space.

Every page in the doctor dashboard begins with its page-level `SectionHeader`. Doctor dashboard headers use no section number — these are functional destinations, not narrative sections. Size is `lg` (`display-md`, 48px). `ruled={true}`. This large header establishes the page context before any content begins — in a dense operational interface, the patient always knows which tool they are using.

---

# PROMPT D4.2 — Doctor Overview Page (Dashboard Home)

## Objective
Design the doctor's dashboard home page — the first screen they see after logging in. This page must communicate today's operational state in under three seconds of reading: what appointments are coming, how the business is performing, and whether any action is required.

## Why Three Seconds

A physiotherapist opening their dashboard before their first patient of the day is task-focused, time-constrained, and not interested in exploring. They need: what is happening today, is anything broken, and what do they need to do. The design must front-load all three answers before any scrolling is required.

## Page Header

Not the standard `SectionHeader` — a contextual greeting paired with an operational date. `GOOD MORNING, DR. [SURNAME].` in `display-sm` bold uppercase, negative tracking. Below it: `TUESDAY, 10 FEBRUARY 2025` in `ui-lg` mixed-case gray. Below that: the `4px` full-width rule.

Why the surname rather than the first name? Doctors are addressed professionally. `Good morning, Dr. Sharma.` is correct register. `Good morning, Priya.` is not wrong, but it does not match the operational tone of the interface. This is a product that respects the professional standing of its doctors.

## Verification Status Banner

If the doctor is not verified: a full-width bordered card immediately below the page header, before the metrics. Amber left border `4px`, white background. Inside: `PENDING VERIFICATION` in small amber uppercase as the label. Below it: `Your profile is awaiting admin review. Complete your profile to accelerate the process.` in `ui-md` mixed-case. To the right: `COMPLETE PROFILE →` as a secondary button.

This banner is the highest-priority information on the page when it exists. An unverified doctor cannot receive bookings — their operational focus must be on resolving verification. The amber border signals attention-needed without alarm. The action button makes the next step obvious.

If the doctor is verified: this banner does not exist. The page flows directly from the greeting to the metrics.

## Profile Completion Card

Immediately below the verification banner (or the header if verified): the profile completion card from Feature F8, redesigned in the Swiss system.

This card is a full-width bordered card, gray surface background. Inside: a `6:6` horizontal split. The left side contains the completion percentage in `display-md` bold black, the label `PROFILE COMPLETE` in small uppercase gray below it, and a pure horizontal progress bar below that — a rectangular track of gray-200 with a black fill rectangle advancing left to right. The black fill rectangle is not a gradient. It is a solid black rectangle. The percentage dictates its width.

The right side contains the missing item list as a stacked set of bordered rows. Each row: an empty bordered square on the left (the checkbox indicator), the item label in `ui-sm` uppercase, and the weight gain (`+20%`) in small red on the far right. Completed items show a black-filled square. The visual density of the checklist on the right balances the bold number on the left, creating a `6:6` split that feels intentional.

The card disappears entirely when the profile reaches 100%. It is not replaced by a congratulatory message — it simply ceases to exist. The absence of the card is itself the signal that everything is complete.

## Today's Schedule Section

`SectionHeader` with no number, title `TODAY'S SCHEDULE`, size `sm`, `ruled={true}`.

Below it: the layout is a `2:10` split — the left `2` columns hold the current date in vertical orientation, the right `10` columns hold the appointment timeline.

The date in the left column: the day name in small uppercase gray (`TUESDAY`), the date number in `display-lg` bold black (`10`), the month in small uppercase gray below (`FEBRUARY`). This vertical date stack is an architectural element — it grounds the timeline in a specific moment without using a calendar widget.

The right `10` columns contain appointment rows in chronological order. Each appointment row: the time in `ui-md` bold black on the far left, a thin vertical line separating time from the appointment card, then a bordered rectangle appointment card taking the remaining width. Inside the appointment card: the patient's name in bold uppercase, the appointment duration in small gray, the status badge, and action links on the far right (`MARK COMPLETE →` or `VIEW →`).

Appointment rows are separated by thin horizontal rules. The rows are dense — `56px` tall — because the doctor is reading a schedule, not browsing a catalog.

When today has no appointments: the schedule area contains a single mixed-case gray sentence: `No appointments scheduled for today.` followed by `MANAGE AVAILABILITY →` as a secondary button. This is not the EmptyState component — that is for list pages. This is an inline informational state within a specific section.

## Metric Cards Row

Four bordered metric cards in a `4×1` row. The metric card variant from Phase 1: white background, `2px` border, border-weight increase to `4px` on hover without color inversion. No hover inversion for metric cards — they contain data, not actions.

The four metrics, in this order: `TODAY'S APPOINTMENTS` (count), `THIS MONTH'S EARNINGS` (in `₹`), `TOTAL PATIENTS` (unique count), `YOUR RATING` (average as `4.8/5`).

The order is deliberate: today first (immediate operational context), earnings second (business health at a glance), patients third (platform engagement), rating last (reputation, important but not immediately actionable). The order communicates priority.

`THIS MONTH'S EARNINGS` metric card has one design difference: the number is preceded by `₹` at a slightly smaller size than the number itself. The currency symbol is not bold — only the number is bold. This typographic distinction — `₹` in regular weight, the number in black weight — draws the eye to the amount rather than the symbol.

## Recent Bookings Section

`SectionHeader` with no number, title `RECENT BOOKINGS`, size `sm`, `ruled={true}`.

The five most recent appointments as bordered table rows. Columns: date, patient name, time, status badge, action links. This is the same table pattern from Phase 3 — same column structure, same row height, same hover state. The consistent table pattern across all roles means the interface language is learnable. A doctor who also uses the platform as a patient does not need to re-learn the table behavior.

Below the five rows: `VIEW ALL APPOINTMENTS →` as a secondary button, left-aligned.

---

# PROMPT D4.3 — Appointments Management Page

## Objective
Design the doctor's appointments management page — the full operational view of all appointments across all statuses. This is the page the doctor uses to confirm what is coming, manage current sessions, and review history.

## Page Header

`SectionHeader` with no number, title `APPOINTMENTS`, size `lg`, `ruled={true}`.

## Filter and Control Row

Immediately below the header: a full-width control row with two elements. On the left: the status filter segmented control — `ALL`, `UPCOMING`, `COMPLETED`, `CANCELLED`. Bordered rectangles, active state black fill white text. This is the same pattern used in the patient appointments page — consistent across roles.

On the right: a date range selector. Two rectangular bordered inputs side by side with `—` between them, labeled `FROM` and `TO` in small uppercase gray above each. A `CLEAR` text link to the right of the range inputs. This date range filter is additional to the status filter — they can be combined. A doctor wanting to see all cancelled appointments in March uses both simultaneously.

## Appointments Table

Full-width, same table primitive from Phase 1.

**Column structure for the doctor view:**

`DATE` — `10 Feb` in small gray
`PATIENT` — patient name in bold `ui-md` with a small initial circle to the left. The circle is `24px` — smaller than the profile circles on cards — because it is a table context. It functions as a visual anchor for the row rather than an identity element.
`TIME` — `09:00 – 09:30` in small regular
`FEE` — `₹[amount]` right-aligned bold
`PAYMENT` — `PAID` in teal badge, `UNPAID` in amber badge
`STATUS` — appointment status badge in the appropriate state
`ACTIONS` — contextual action links depending on status

**Action links by appointment status:**

When `UPCOMING / CONFIRMED`: `MARK COMPLETE →` in black text link and `CANCEL →` in red text link. The `CANCEL` link is red — destructive table action, its permitted use.

When `COMPLETED`: `VIEW NOTES →` if session document exists, otherwise `UPLOAD NOTES →` text link. The upload link opens an inline file input within the expanded row rather than navigating away.

When `CANCELLED`: `VIEW →` text link only. No actions available on cancelled appointments.

**Inline Row Expansion** — clicking any row expands it exactly as in the patient appointments table: gray-surface indented area with `4px` left border. The doctor's expanded view contains: patient contact information (email only — no phone number in this context), the patient's notes from the booking (`PATIENT NOTES` in small red label, then the note text), the session document section (upload or download), and the cancellation reason if applicable.

The consistent inline expansion pattern across both patient and doctor table views means the underlying component is built once and receives different data depending on role context. This is an architectural efficiency that the design system enables.

---

# PROMPT D4.4 — Availability Management Page

## Objective
Design the availability management page — the tool doctors use to create, view, and manage their schedule. This is a high-frequency operational page — doctors who actively use the platform visit this page multiple times per week. The design must make common actions fast and rare actions accessible without clutter.

## Page Header

`SectionHeader` with no number, title `MANAGE AVAILABILITY`, size `lg`, `ruled={true}`.

Below the header: a single full-width note in `ui-sm` mixed-case gray explaining the slot system in one sentence: `Create time slots to allow patients to book appointments. Slots you add here appear on your public profile.` This orientation sentence exists because the concept of "adding slots" is not immediately obvious to all doctors. The sentence eliminates the need for a help modal or an onboarding overlay.

## Add Slot Form

The add slot form sits at the top of the page in a full-width bordered card, white background. This card is not on a gray surface — it is on white — because it is the primary action surface and must have maximum visual prominence. Gray surface cards are for information. White bordered cards with prominent CTAs are for action.

Inside the card: a single horizontal row of four inputs and one button. This one-row form is a deliberate density decision — doctors adding slots repeatedly benefit from horizontal scanning speed rather than vertical form flow.

From left to right: `DATE` input (rectangular bordered, `type="date"`, labeled above in small uppercase), `START TIME` input (rectangular bordered, `type="time"`, labeled above), `END TIME` input (same), a `REPEAT WEEKLY` toggle (a bordered rectangle button that inverts to black when active, then reveals a `FOR [ ] WEEKS` number input to its right), and the `ADD SLOT →` accent red button on the far right.

The accent red is used here because this is the primary CTA on the page — creating availability is the most important action a doctor takes on this page. Red is its permitted CTA use.

The form card has one validation behavior: if `START TIME` is greater than or equal to `END TIME`, the `ADD SLOT →` button immediately becomes disabled and the `END TIME` input border shifts to the amber status color — not red, because this is a validation warning, not an error. The amber border appears at `150ms` as soon as the condition is true. No error message below the input — the amber border and the disabled button together communicate the problem. The doctor understands without reading an error sentence.

## Monthly Calendar Overview

Below the add slot form: the four-week availability heatmap — the same component from D3.3, but rendered in a different configuration for the doctor's administrative perspective.

The doctor's heatmap shows additional information that the patient's version does not: the number of available slots per day appears as a small number inside each cell below the date number. `3` means 3 available slots. `0 / 4` means all 4 slots are booked. This slot count information transforms the heatmap from a date picker into a schedule density view — the doctor can see at a glance which days are full, which have openings, and which have no slots at all.

The cell states for the doctor's heatmap:
- Has available slots: white background, `2px` black border — available for booking
- All booked: gray-100 background, `2px` black border, slot count shows `0/[n]` in amber — no availability
- No slots created: white background, `1px` gray-200 border — this day is not on the schedule
- Selected: the cell the doctor clicks to filter the slot list below

Clicking a cell filters the slot list below to show only that day's slots. This direct heatmap-to-list interaction eliminates a date search input — the heatmap is the navigation mechanism for the slot list.

## Slot List

Below the heatmap: the slot list, filtered to the selected date or showing all upcoming slots if no date is selected.

Section label above the list: if a date is selected, the full date in bold uppercase (`TUESDAY, 10 FEBRUARY`). If no date is selected: `ALL UPCOMING SLOTS`.

Slots are displayed as bordered table rows — not cards. The table rows are tight: `48px` height, `24px` horizontal padding. Columns: `START TIME`, `END TIME`, `DURATION` (calculated and displayed, not input), `STATUS`, `DELETE`.

The `STATUS` column shows one of three states: `AVAILABLE` in regular gray text (no badge — available is the default non-state, requires no signaling), `BOOKED` in the teal badge (a confirmed booking is a positive signal), or `INACTIVE` in gray badge (if the slot has been soft-deactivated).

The `DELETE` column shows a `✕` icon in a bordered square. On hover: the bordered square border shifts to red and the icon becomes red. Clicking it shows an inline confirmation prompt: the row background shifts to the lightest red tint (the closest this system gets to a red background — `rgba(255, 48, 0, 0.04)`) and two inline buttons appear: `CONFIRM DELETE` in a small red-bordered text button and `CANCEL` in a ghost text button. If the slot is booked: the `✕` is replaced by a `—` in gray, non-interactive. Hovering it shows a tooltip: `CANNOT DELETE A BOOKED SLOT`. No error state triggered — the condition is clear before the doctor acts.

This inline delete confirmation is more efficient than a modal for a high-frequency action. The doctor stays on the page, sees the confirmation in context, and completes the action without a screen change.

---

# PROMPT D4.5 — Earnings Page

## Objective
Design the doctor earnings page — the financial overview of the doctor's income from the platform. This page handles two user states: a doctor with a history of completed appointments and payments, and a new doctor with no financial data yet. Both states must be handled with equal care.

## Page Header

`SectionHeader` with no number, title `EARNINGS`, size `lg`, `ruled={true}`.

## Top Metrics Row

Three bordered metric cards in a `3×1` row spanning the full width. The metric card variant — white background, `2px` border, border-weight increase on hover.

`TOTAL EARNINGS` — the cumulative sum of all `doctorEarnings` from completed paid appointments. The `₹` symbol in regular weight preceding the number in `display-sm` bold. Label below: `LIFETIME EARNINGS` in small uppercase gray.

`THIS MONTH` — the sum of `doctorEarnings` from the current calendar month. Same format. Label: `CURRENT MONTH` in small uppercase gray. Below the label: a secondary data point in the smallest text size: `+₹[amount] from last month` in green if positive, or `↓₹[amount] from last month` in amber if negative. This comparison context makes the monthly number meaningful rather than isolated. Green is introduced only in this one data comparison context — it is not a new token, it is expressed as the teal token at a slightly different hue. Actually: it uses the teal token. Down is expressed in amber. Both are already in the system.

`AVERAGE PER SESSION` — `doctorEarnings` divided by total completed sessions. Label: `PER SESSION AVG` in small uppercase gray.

These three numbers give the doctor their complete financial picture at a glance: lifetime health, current momentum, and per-session efficiency.

## Monthly Breakdown Table

`SectionHeader` with no number, title `MONTHLY BREAKDOWN`, size `sm`, `ruled={true}`.

A full-width table. **Column structure:**

`MONTH` — written as `February 2025` in `ui-md` regular. The most recent month is at the top — reverse chronological, because the doctor cares most about now.
`SESSIONS` — count in `ui-md` regular, center-aligned
`GROSS FEE` — total fees collected by patients that month, right-aligned bold
`PLATFORM FEE` — the `10%` platform commission. Right-aligned. The column header has `(10%)` in small gray after `PLATFORM FEE` — the percentage is embedded in the header itself so the doctor never needs to wonder how it is calculated. This transparency is important: doctors who understand the commission structure are less likely to feel the platform is hidden costs from them.
`YOUR EARNINGS` — the `90%` that reaches the doctor. Right-aligned in bold black — the most important column gets the most visual weight. The column header is slightly larger than the others at `ui-sm` instead of `ui-xs`.

The platform fee column header and values are in the standard black — they are not highlighted in red, which would make the commission feel punitive. Financial transparency, not apologetic design.

Row hover: gray-100 fill. The current month's row is distinguished by a `4px` left black border — a structural highlight that draws attention to the most recent data without color.

**Empty State** — for a new doctor with no earnings: the EmptyState component centered in the table area. Icon: a simple chart icon in a bordered square. Title: `NO EARNINGS YET`. Description: `Complete your first appointments to see your earnings here.` Action: `MANAGE AVAILABILITY →` as a secondary button — directing the doctor to the action that will generate earnings.

## Recent Transactions Section

`SectionHeader` with no number, title `RECENT TRANSACTIONS`, size `sm`, `ruled={true}`.

The 10 most recent individual payments as bordered table rows. **Column structure:**

`DATE` — `10 Feb` in small gray
`PATIENT` — patient first name and last initial only (`Priya S.`) — privacy is maintained in financial records. The doctor knows who their patients are; the record does not need the full name.
`SESSION FEE` — `₹[amount]` right-aligned regular
`PLATFORM FEE` — `₹[amount]` right-aligned gray. The gray weight communicates that this is deducted, not received.
`YOUR EARNING` — `₹[amount]` right-aligned bold black. The doctor's take is always the most visually prominent number in a financial row.
`STATUS` — `PAID` in teal badge.

Below the 10 rows: pagination with `← PREVIOUS` and `NEXT →` ghost buttons.

---

# PROMPT D4.6 — Profile Management Page

## Objective
Design the doctor profile management page — the form interface for editing professional information, updating the profile photo, managing clinic details, and setting the consultation fee. This page is visited infrequently but is operationally critical: an incomplete or inaccurate profile reduces booking conversion and can prevent verification.

## Page Header

`SectionHeader` with no number, title `MY PROFILE`, size `lg`, `ruled={true}`.

## Save Button Persistence

The `SAVE CHANGES →` primary button is fixed at the bottom of the viewport in a full-width white bar with a `2px` top border separating it from the page content. This bar persists as the doctor scrolls through the form sections.

Why persistent? A doctor editing multiple fields across multiple sections should not need to scroll to the bottom of the page to save. They should be able to make any edit and confirm it immediately. The persistent save bar solves the most common form usability problem: the disconnection between where the edit happens and where the confirmation lives.

The bar contains: `SAVE CHANGES →` as the primary black button on the right, and `DISCARD CHANGES` as a ghost button to its left. `DISCARD CHANGES` appears only when the form has unsaved changes — it is hidden otherwise. The appearance of `DISCARD CHANGES` is itself a signal to the doctor that changes are pending.

## Form Sections

The form is organized into clearly delineated sections using the `SectionHeader` component at `size='sm'` with `ruled={true}`. Each section is separated from the next by `48px` of vertical space — enough that sections read as distinct without requiring cards or containers.

**PERSONAL INFORMATION**

Two inputs side by side in a `6:6` split: `FULL NAME` and `EMAIL`. Email is read-only — displayed in a disabled input with a gray background and a `CANNOT BE CHANGED` label in tiny uppercase gray. Name is editable.

Below them: `PHONE` as a full-width input. The phone field has the country code `+91` as a fixed prefix inside the input — a non-editable element within the editable field, separated by a `1px` internal vertical line. The doctor cannot accidentally remove the country code.

**PROFESSIONAL DETAILS**

`SPECIALIZATION` as a full-width input. This is a text input, not a dropdown — doctors have specializations that may not be in a preset list, and a text input is more flexible. Placeholder (uppercase): `E.G. SPORTS PHYSIOTHERAPY`.

`YEARS OF EXPERIENCE` as a narrow input — `240px` wide, left-aligned. Numbers only. The narrow width communicates that a small value is expected — a field that is too wide for its expected input confuses users about scale.

`BIO` as a full-width textarea, `160px` minimum height. Label: `PROFESSIONAL BIO` in small uppercase. Character counter at bottom-right: `[n] / 1000`. Placeholder (mixed-case): `Describe your approach to physiotherapy, your specializations, and what patients can expect from a session with you.` — specific enough to be helpful, not prescriptive enough to limit expression.

**CLINIC DETAILS**

`CLINIC NAME` full-width input. `CITY` and `STATE` in a `6:6` split. `ADDRESS` as a full-width textarea, `80px` height.

**CONSULTATION FEE**

A single input, `240px` wide, with `₹` as a fixed prefix inside the input using the same prefix pattern as the phone field. Label above: `CONSULTATION FEE PER SESSION`. Below the input: a single mixed-case gray sentence: `This amount is shown to patients on your profile and at booking. You can update it at any time.` The transparency about fee visibility is important — doctors should know where their fee appears.

**PROFILE PHOTO**

The current photo (or initial circle if none) displayed in a `120px × 120px` bordered square — rectangular profile photo, consistent with the system geometry. Below the square: `UPLOAD PHOTO →` as a secondary button. Below the button: `JPG or PNG · Max 5MB` in small uppercase gray.

Why a bordered square and not a circle for the profile photo in the management context? The circle profile photo is a display element — it appears in contexts where the doctor is being shown to a patient. In the management context, the photo is being edited — the squared border communicates that this is an editable asset, consistent with the bordered square pattern used for all editable image/file elements across the product.

**VERIFICATION DOCUMENTS**

This section appears only for doctors who have not yet been verified. `VERIFICATION DOCUMENTS` as the section header. A bordered card on gray surface, diagonal pattern. Inside: the current document submission status as a simple list: `DEGREE CERTIFICATE — SUBMITTED ✓` or `DEGREE CERTIFICATE — NOT UPLOADED` for each required document. Each line has an `UPLOAD →` text link at the far right if not submitted.

The document list is purely informational and actionable — it is not a progress bar or a percentage. The doctor sees exactly which documents are submitted and which are missing. No ambiguity.

---

# PROMPT D4.7 — Doctor Reviews Page

## Objective
Design the doctor-facing reviews page — a read-only view of all patient reviews the doctor has received. Doctors cannot edit, delete, or respond to reviews in this phase. The page is a reputation monitoring surface.

## Page Header

`SectionHeader` with no number, title `MY REVIEWS`, size `lg`, `ruled={true}`.

## Rating Summary Card

A full-width bordered card, gray surface background, immediately below the header. Inside: a `4:8` horizontal split.

Left `4` columns: the overall rating in `display-lg` (64px) bold black — the largest number on any doctor-facing page. Below it: `OUT OF 5` in small uppercase gray. Below that: the total review count in `ui-md` gray: `Based on 23 reviews`.

Right `8` columns: a rating distribution breakdown. Five rows, one per rating level, from `5` down to `1`. Each row: the rating number in small bold on the left, then a horizontal bar (rectangular, gray-200 track, black fill proportional to count) spanning most of the remaining width, then the review count for that rating in small gray on the right. This distribution breakdown is more informative than an average alone — it tells the doctor whether their rating is genuinely strong or inflated by a few outliers.

Below the summary card: a single sentence in `ui-sm` mixed-case gray, centered: `Reviews are submitted by verified patients after completed, paid appointments. Contact support if a review violates platform guidelines.` This sentence exists for one reason: to pre-empt the doctor's question about review legitimacy and their recourse if something is wrong.

## Reviews List

`SectionHeader` with no number, title `PATIENT FEEDBACK`, size `sm`, `ruled={true}`.

Individual review cards stacked vertically, full-width. Each card is a bordered rectangle, white background. No hover state — reviews are not interactive for the doctor. A static surface for a read-only operation.

Inside each card: a `9:3` split. Left `9` columns: the review content — a large quotation mark in gray at `display-xs` light weight, the review text in italic mixed-case `ui-lg`, the patient identifier (first name + last initial only) in small bold uppercase below the text, the appointment date in small gray next to the patient name. Right `3` columns: the rating in a large bordered square at `display-xs` center-aligned. Below the rating square: the specialization treated in this appointment in small red uppercase — if different specializations are treated, this reminds the doctor which area of their practice the review reflects.

**Empty State** — when no reviews exist: the EmptyState component. Icon: quote icon in a bordered square. Title: `NO REVIEWS YET`. Description: `Patient reviews appear here after completed appointments. Focus on delivering excellent care.` No action button — there is no action available. The empty state for a read-only page does not offer actions because there is nothing to do. This is intentional: the absence of a button communicates that the doctor must wait, not act.

---

# PROMPT D4.8 — Doctor Onboarding State (First-Time Experience)

## Objective
Design the onboarding experience for a doctor who has just registered and is seeing their dashboard for the first time. This is the transition from account creation to productive platform use.

## Why a Dedicated Onboarding Design

New doctors face a specific challenge: they have created an account, but they cannot receive bookings until they complete their profile and pass verification. The period between account creation and first booking is high churn risk — if the doctor does not understand what they need to do, they lose momentum and abandon the platform.

The onboarding design must make the path to first booking completely unambiguous. Every step must be visible, every action must be one click away.

## Onboarding Card

A full-width bordered card that appears above all other dashboard content for new doctors. Gray surface background with the diagonal pattern — the diagonal pattern signals "process" and "staged workflow" throughout the product. The card has a `4px` top border in black — heavier than standard cards, indicating its primacy in the page hierarchy.

**Card Header:**

`GETTING STARTED` in small red uppercase as the card label. Below it: `Complete these steps to start receiving bookings.` in `ui-lg` mixed-case black. A horizontal rule separates the header from the checklist.

**Checklist:**

Four bordered rows inside the card. Each row: `56px` height. Inside each row from left to right: a bordered square checkbox (`24px`) that is black-filled when complete and empty when not, the step label in `ui-md` bold uppercase, a brief description in `ui-sm` mixed-case gray below the label (in a two-line cell), and a `→` action link on the far right.

The four steps:
1. `COMPLETE YOUR PROFILE` — `Fill in your bio, specialization, and clinic details.` → `MY PROFILE`
2. `UPLOAD VERIFICATION DOCUMENTS` — `Submit your degree certificate and registration proof.` → `MY PROFILE` (documents section)
3. `ADD AVAILABILITY SLOTS` — `Create time slots so patients can book appointments.` → `AVAILABILITY`
4. `AWAIT VERIFICATION` — `Our team reviews your profile within 2 business days.` → No action link — this step requires waiting. The `→` link is replaced by `IN REVIEW` in small amber uppercase. The amber communicates pending status without suggesting an action that does not exist.

Steps that are complete have the filled checkbox, the label in gray instead of black, and the action link replaced by a `✓ DONE` in small teal uppercase. The teal signals completion — its permitted use.

The card is dismissed programmatically when all four steps reach the complete state. It does not have a manual dismiss button — the doctor completes the steps to make the card go away, not clicks it away prematurely.

**Progress Line:**

Below the four checklist rows: a full-width horizontal progress bar inside the card. Gray-200 track, black fill. Below the bar: `2 of 4 STEPS COMPLETE` in small uppercase gray, left-aligned. This global progress line reinforces the checklist at a summary level — the doctor sees both the individual steps and their overall completion simultaneously.

---

## Phase 4 Completion Gate

Before Phase 5 (Admin Experience & Polish) begins, every item in this list must be verified:

```
✅ Doctor sidebar shows role-correct navigation items only
✅ APPOINTMENTS nav item shows pending count badge when applicable
✅ Verification status badge appears at bottom of sidebar (teal or amber)
✅ Overview page greeting uses DR. [SURNAME] — not first name
✅ Verification banner uses amber border — not red
✅ Profile completion card: progress bar is a solid black rectangle — no gradient
✅ Profile completion card disappears entirely at 100% — no congratulations state
✅ Today's schedule uses 2:10 column split with vertical date stack
✅ Schedule appointment rows are 56px tight — not card-format
✅ No-appointments-today state directs to MANAGE AVAILABILITY — not generic
✅ Metric card THIS MONTH shows month-over-month comparison in teal/amber
✅ Add slot form is a single horizontal row — not a stacked vertical form
✅ Slot form validation uses amber border on END TIME — not red
✅ Heatmap cells show slot count (e.g. 0/4) in doctor view — not in patient view
✅ Clicking a heatmap cell filters the slot list below — no separate date input
✅ Slot list delete uses inline confirmation — not a modal
✅ Booked slot delete icon is non-interactive — shows tooltip on hover
✅ Earnings table PLATFORM FEE column header shows (10%) inline
✅ YOUR EARNINGS column header is slightly larger than other column headers
✅ Current month row in earnings table has 4px left black border
✅ Recent transactions show patient first name + last initial only — not full name
✅ Profile save button is fixed at viewport bottom with 2px top border
✅ DISCARD CHANGES appears only when unsaved changes exist
✅ Profile photo is a 120px bordered square — not a circle — in edit context
✅ Phone field has non-editable +91 prefix inside the input
✅ Consultation fee field has non-editable ₹ prefix inside the input
✅ Verification documents section appears ONLY for unverified doctors
✅ Doctor reviews page shows rating distribution bars — not just average
✅ Review cards have no hover state — read-only surface has no interactivity
✅ Review empty state has NO action button — waiting state, not action state
✅ Onboarding card uses diagonal pattern on gray surface
✅ Step 4 (AWAIT VERIFICATION) has no action link — amber IN REVIEW instead
✅ Complete steps show teal ✓ DONE — teal's permitted confirmed use
✅ Onboarding card dismisses programmatically — no manual close button
✅ Zero new colors introduced — all colors from Phase 1 token system
✅ Zero border-radius except avatar circles
✅ Zero drop shadows anywhere
✅ All interactive elements have mechanical hover states — no opacity fades
```

**Phase 4 unlocks Phase 5 (Admin Experience & Polish) because:**
- The sidebar shell built in D4.1 is the third variation of the universal dashboard shell — patient (D3.5), doctor (D4.1), admin (D5.1) all share the same structural DNA and can be verified against each other in the consistency audit
- The table component is now proven across three contexts: patient appointments (D3.6), doctor appointments (D4.3), and earnings transactions (D4.5) — the Phase 5 admin tables inherit a battle-tested pattern
- The profile completion card (D4.2) and onboarding checklist (D4.8) establish the pattern for the admin verification queue's step-by-step workflow cards
- Every primitive from Phase 1 has been used in Phase 3 and Phase 4 — any gap in the primitive library surfaces here before Phase 5 where the admin experience demands the most components simultaneously

---

Say **"Phase 5"** when ready for the Admin Experience & Product Polish direction.