Let me read both files to understand what's already been designed and built before generating Phase 5.Full context absorbed. Phases 1 through 4 are completely internalized. Now executing Phase 5.

---

# PhysioConnect — Design Phase 5
## Admin Experience & Product Polish

---

## Design Intent

The admin dashboard is an operations control center, not a product surface. Nobody lands on the admin dashboard by accident. The people who use it are platform administrators with specific operational goals: verify doctors, monitor revenue, resolve issues, maintain platform health. They are power users. They are not being persuaded or converted. They are working.

This distinction changes everything about how the design operates here. The landing page communicated through typographic boldness. The patient experience communicated through clarity and reassurance. The doctor experience communicated through operational efficiency. The admin experience communicates through **information density, operational precision, and unambiguous action hierarchy.**

The closest reference products are Linear's issue management, Stripe's payments dashboard, and a Bloomberg terminal filtered through Swiss design discipline. Dense, data-heavy, zero tolerance for decoration that wastes space, and immediately legible to someone who opens it under pressure.

The Swiss system reaches its most natural expression in the admin experience because the Swiss system was originally designed for exactly this kind of problem — complex information organized with maximum clarity and minimum noise. There are no metaphors to establish, no emotional states to manage, no conversion journeys to navigate. There is only data, status, and action.

---

## Admin Layout Shell — `D5.1`

### Why The Admin Shell Is Distinct

All three dashboard shells — patient, doctor, admin — share the same structural DNA: `240px` sidebar, `2px` right border, product name at top, user info at bottom. The admin shell differs in two specific ways that reflect the operational difference of the role.

First, the sidebar background is not white — it is `swiss-gray-100` (`#F2F2F2`). This single change creates immediate visual distinction. When a user opens any dashboard page, they know within one glance whether they are in an admin context or a user context. In a platform where role confusion has real consequences — an admin accidentally thinking they are viewing patient data rather than platform data — this structural signal matters.

Second, the admin sidebar carries more navigation items than either the patient or doctor sidebar. Eight items against five or six. At this density, the sidebar must be efficient — navigation items are tighter, the vertical spacing between items is `8px` not `12px`, and the text is `ui-sm` not `ui-md`. The admin navigates frequently. The sidebar must not be a scroll target.

### Navigation Items and Their Order

The order of navigation items is not alphabetical and not arbitrary. It reflects operational priority — the most time-sensitive items are at the top.

`OVERVIEW` is first because it is the health check. Every admin session begins here.

`DOCTORS` is second with the pending verification count badge. Pending verifications are time-sensitive — doctors waiting for verification cannot work, and every day they wait is a day of potential churn. The badge on this item is the product screaming: *there is work here right now.*

`APPOINTMENTS` is third because appointment issues (disputed bookings, cancellations requiring action) are the most common operational interruption.

`REVENUE` is fourth — financial visibility is important but rarely urgent.

`USERS` is fifth — user management is a maintenance task, not an operational one.

`ANALYTICS` is sixth — a planning surface, not an operations surface.

`AI TOOLS` is seventh — infrequently accessed, correctly deprioritized.

`REVIEWS` is eighth — moderation is periodic, not continuous.

This order communicates what the product considers operationally important. It is a product decision embedded in the navigation hierarchy.

### The Pending Verification Badge

This badge is the only counter badge in the entire sidebar across all three roles. Its presence is justified by the operational stakes — pending doctor verifications are the highest-priority time-sensitive action on the platform.

The badge is a small bordered rectangle — not a circle, consistent with the geometry rules. Black border, black number inside, positioned to the right of the `DOCTORS` label. When the pending count is zero the badge disappears entirely — it does not show `0`. An empty badge is noise. An absent badge means no action is required.

---

## Admin Overview Page — `D5.2`

### Design Intent for the Overview

The admin overview is a platform health dashboard. In under ten seconds of reading, an admin opening this page should know: how the platform is performing financially, whether there are operational issues requiring immediate attention, and what happened recently. The design must sequence this information in exactly that order.

### Metric Cards Grid

Eight metric cards in a `2×4` layout — two rows of four. This is the densest metric display in the product. The cards use the `metric` variant from Phase 1 — bordered rectangles, gray surface, large number, uppercase label, secondary context line below a thin rule.

The eight metrics and their visual treatment are not all equal. Three cards receive border color variations that communicate urgency:

`PENDING VERIFICATION` has an amber border instead of the standard black border. This is a functional signal — amber throughout the product means "attention required." An admin opening the overview sees the amber border before reading the label and knows: there is something here that needs action. The number inside confirms how many.

`TOTAL REVENUE` and `PLATFORM COMMISSION` have teal borders. These are the positive financial metrics — teal means confirmed, paid, positive throughout the product. The teal borders signal: these are the numbers that mean the platform is working.

All other cards have standard black borders.

Why this differentiation matters: in a `2×4` grid of eight cards, without visual differentiation, the admin's eye has no starting point. The amber and teal borders create a reading hierarchy within the grid — attention goes first to the amber card, then to the teal cards, then to the rest. The design does the prioritization work so the admin does not have to.

### Revenue Trend and Appointment Status — Side by Side

Below the metric grid: a `6:6` split. Left: the revenue trend chart. Right: the appointment status breakdown.

The revenue trend chart is a line chart. One black line on a white surface inside a bordered card. The y-axis is right-aligned numbers in small uppercase gray. The x-axis is dates in small uppercase gray. No area fill under the line. No gradient. No background color change. A single black line communicates revenue trend with more precision than any decorated chart because it forces the eye to read the line itself, not the fill color.

The period toggle (`DAILY` / `WEEKLY` / `MONTHLY`) sits at the top-right of the chart card, expressed as the segmented bordered control — the same pattern used in the discovery page sort controls. Switching the period re-renders the chart data without reloading the page.

Hovering a data point on the chart shows a minimal tooltip — a bordered rectangle, white background, the date and value in small uppercase, no border-radius, no shadow. The tooltip appears at `150ms` and disappears at `150ms`. It is informational, not decorative.

The appointment status breakdown on the right side is a donut chart with one specific constraint: the center of the donut shows the total appointment count in display size. This center number is the most important datum — it contextualizes all the proportional slices around it. An admin who sees `847 total` with a mostly-black completed slice reads the platform health faster than one who must sum the individual numbers.

Each slice of the donut is a solid color from the token system: black for completed, gray for cancelled, amber for pending, teal for confirmed. The legend below the chart uses bordered squares matching the slice colors — the same bordered square treatment used for checkboxes and filter chips throughout the product. Visual consistency across different component types.

### Recent Activity Feed

Below the two charts: a full-width bordered table titled `RECENT ACTIVITY`. This is an operational feed — everything that has happened on the platform in the last 24-48 hours, in reverse chronological order.

The table has four columns: `TIME`, `EVENT TYPE`, `ACTOR`, `DETAIL`.

The `TIME` column shows relative time — `2m ago`, `1h ago`, `3h ago` — in small gray monospace. Relative time is more operationally useful than absolute timestamps for a recent activity feed.

The `EVENT TYPE` column shows small bordered chips — the neutral `Badge` variant from Phase 1 — with labels like `BOOKING`, `REGISTRATION`, `PAYMENT`, `VERIFICATION`. These chips allow an admin to scan the event type column before reading the detail column. Event type is categorical; detail is specific.

The `ACTOR` column shows the user who performed the action — patient name for bookings, doctor name for registrations and verifications. First name and last initial only — not full names in an administrative table, consistent with the privacy approach established in the doctor earnings page.

The `DETAIL` column is the most verbose — a short sentence describing the event. Truncated at one line with `...` if longer, full text on row hover.

---

## Analytics Page — `D5.3`

### Design Intent

The analytics page is where the admin makes planning decisions, not operational ones. It answers the questions: which specializations are growing, which doctors are performing best, where is revenue coming from, and how is the platform trending over time. These are weekly or monthly questions, not daily ones.

The page opens with the section header `ANALYTICS` at display size. Below it: the revenue chart with period controls. Below that: the top doctors table. Below that: the specialization breakdown.

### Revenue Chart — Full Width

On the analytics page the revenue chart is full-width — wider than the half-width version on the overview. More horizontal space means more data points visible simultaneously. The same chart component, different container width. This is one of the design system's core benefits: the chart component does not need to know how wide it will be.

Below the chart: a row of three secondary metrics — `AVERAGE DAILY REVENUE`, `HIGHEST SINGLE DAY`, `LOWEST SINGLE DAY` — in the metric card format but smaller. These contextualize the chart without requiring the admin to read precise values from the line.

### Top Doctors Table

A bordered table titled `TOP DOCTORS` with a metric sort control in the header. Three sort options expressed as text links with underlines in the header: `BY EARNINGS`, `BY APPOINTMENTS`, `BY RATING`. The active sort option has a red underline. Clicking a different option re-sorts the table at `150ms` — no loading state required, the data is already loaded and sorted client-side.

Doctor rows: initial circle on the far left, doctor name in bold uppercase, specialization in small red uppercase, total earnings right-aligned with rupee symbol, appointment count right-aligned, rating as a number in a bordered square (the same bordered square used for review ratings in Phase 3).

A `VIEW PROFILE →` link on the far right of each row navigates to the doctor's full admin detail view. This link appears only on row hover — progressive disclosure. The row does not have a full color inversion on hover because it contains data, not a categorical navigation action. Instead: the row background shifts to `swiss-gray-50`. The `VIEW PROFILE →` link appears. That is the entirety of the row hover state.

### Specialization Breakdown

A `3:9` asymmetric layout. The left `3` columns stack specialization names as bordered rows. Each row: the specialization name in small uppercase and the percentage in bold red on the right edge. The red percentage is a functional use of red — it is the most meaningful number in each row, the signal the admin looks for first.

The right `9` columns are a horizontal bar chart. Each bar is a solid black rectangle on a gray-100 track. The bar width is proportional to the percentage. No rounded ends. No gradient. No animation. The bars are static — they are data, not a performance.

The label above each bar: the appointment count in small uppercase. The label below: the specialization name in small uppercase gray. The admin reads: specialization name → appointment count → bar proportion → percentage. Four data points per row, no clicks required.

---

## Doctors Management Page — `D5.4`

### Design Intent

The doctors management page is the most operationally sensitive page in the admin experience. It combines two distinct workflows that have different urgency levels: the verification queue (urgent — new applications waiting for review) and the full doctor directory (non-urgent — browsing and management).

These two workflows must not compete for attention. The verification queue is always surfaced first because it contains time-sensitive actions. The full directory is accessible but secondary.

### Page Header and Controls

Section header: `DOCTORS` in display size. Below it: a horizontal controls bar that spans the full content width.

The controls bar contains from left to right: a search input that filters the table in real-time, a status segmented control (`ALL` / `VERIFIED` / `PENDING` / `SUSPENDED`), and an `EXPORT →` secondary button on the far right. The search and filter controls are left-weighted. The export is right-weighted. This left-to-right hierarchy matches the operational flow — first narrow the scope (search and filter), then act on the result (export).

### Verification Queue — Surfaced Prominently

When there are pending verifications, a section appears above the main table titled `PENDING REVIEW` with the count in small amber uppercase to the right of the title. This section is a bordered card with an amber top border — the same amber treatment as the metric card on the overview page. The amber is consistent: this is a site that requires attention.

Inside the card: the pending doctors as expanded rows. Each row is taller than a standard table row — `80px` instead of `56px` — because it needs to show more contextual information. Doctor name, specialization, date of application, and documents submitted status all visible without clicking into a detail view.

Clicking a pending row expands it inline to reveal: the submitted verification documents as bordered image thumbnails (with `CLICK TO VIEW` text on hover that opens in a new tab), the doctor's bio in gray mixed-case, and two action buttons: `APPROVE →` in the secondary button style (not red — approval is a positive action) and `REJECT →` in a ghost button style with a red label. The `REJECT →` button opens the rejection note inline directly in the expanded row — not a modal. The rejection note input appears with a `REASON FOR REJECTION` label above it and a `SUBMIT REJECTION →` button below. This inline approach keeps the admin in context without a modal interrupting the table flow.

Why inline rejection instead of a modal? Modals create a hard context switch. The admin reviewing a pending doctor needs to keep the doctor's information visible while writing the rejection reason. An inline expansion keeps both visible simultaneously.

### Main Doctors Table

Below the verification queue: the full doctors table. Columns: `DOCTOR`, `SPECIALIZATION`, `STATUS`, `JOINED`, `APPOINTMENTS`, `EARNINGS`, `ACTIONS`.

The `DOCTOR` column shows the initial circle and the doctor name. Not the profile photo — photos vary in quality and dimensions and create visual inconsistency at the table level. Initial circles are uniform.

The `STATUS` column uses the badge system — teal for verified, amber for pending, black for suspended.

The `EARNINGS` column is right-aligned with tabular numeric rendering — consistent with every financial column across the product.

The `ACTIONS` column: `VIEW` as a text link, and `SUSPEND` as a red text link. The `SUSPEND` link is the only red text link in this table — consistent with the rule that red text in table action columns signals a destructive action.

Clicking `VIEW` navigates to the full admin doctor detail page — not an inline expansion, because the amount of information in a full doctor detail (all profile fields, all documents, full appointment history, earnings breakdown) exceeds what inline expansion can accommodate.

### Doctor Detail Page

A dedicated page accessed from the table `VIEW` action. Not a modal — the information volume requires a full page.

The page uses the same `7:5` asymmetric split used on the public doctor profile page. The admin is seeing a privileged version of the same page structure the patient sees — this consistency is intentional. It communicates that what the admin sees is what the patient sees, with additional administrative data overlaid.

Left `7` columns: all the information from the public profile — name, specialization, bio, qualifications, clinic information, reviews — plus admin-only sections: the submitted verification documents with full-resolution viewing links, the account creation date, the suspension history if any, and the full earnings breakdown.

Right `5` columns: operational controls. `VERIFY DOCTOR →` in secondary button style (green teal text, black border), `SUSPEND ACCOUNT →` in ghost button with red text, `SEND NOTIFICATION →` in ghost style. These action buttons are in the right column exactly where the booking panel sits on the patient-facing profile — the admin's actions occupy the same structural position as the patient's primary action. The architectural symmetry is intentional.

---

## Revenue Page — `D5.5`

### Design Intent

The revenue page answers one primary question: how much money is the platform making and how is it distributed? It is a financial reporting surface, not an analytics surface. The distinction matters — analytics is about trends and patterns, revenue is about specific numbers and their accuracy.

Financial data has strict presentation rules. Numbers are always right-aligned. Currency symbols are always present. The commission calculation (`10%`) is always visible so the admin can verify the arithmetic. Every row must be auditable by inspection.

### Page Layout

Section header: `REVENUE` in display size.

Three metric cards in a `1×3` row immediately below the header. `TOTAL REVENUE`, `PLATFORM COMMISSION (10%)`, `DOCTOR PAYOUTS (90%)`. The `(10%)` and `(90%)` in the card labels are informational — they tell the admin the calculation basis without requiring a separate explanation.

A thin horizontal rule separates the metric row from the table below.

### Payments Table

Full-width bordered table. Columns: `DATE`, `PATIENT`, `DOCTOR`, `AMOUNT`, `COMMISSION`, `DOCTOR EARNINGS`, `PAYMENT ID`, `STATUS`.

The three financial columns (`AMOUNT`, `COMMISSION`, `DOCTOR EARNINGS`) are right-aligned with tabular numeric rendering. This is non-negotiable for financial tables — right-alignment allows decimal points to stack vertically, making comparison across rows possible by eye.

The `STATUS` column uses `PAID` in the teal badge variant — teal is the paid-status signal. Any payment that is not `PAID` (created or failed) uses the neutral gray badge.

The `PAYMENT ID` column shows the last 8 characters of the Razorpay ID with an ellipsis prefix — `…abc12345`. On hover: a tooltip shows the full ID. This keeps the column narrow while keeping the full ID accessible.

A filter bar above the table: date range inputs (two bordered rectangular inputs with a `—` separator, same as the fee range filter in the discovery page), and a status segmented control. Filtering by date range is the primary operation — admins reviewing monthly revenue need to scope the table to a specific period.

---

## Users Management Page — `D5.6`

### Design Intent

The users management page is a maintenance surface. Admins visit it to handle specific issues: deactivate a problematic account, look up a specific user, verify registration data. It is not a page admins visit on every session — it is a page they visit when something has gone wrong or when they need to verify specific information.

The design reflects this: clean, functional, fast. No elaboration, no additional information beyond what is operationally necessary.

### Table Structure

Section header: `USERS` in display size. Search input spanning full width below it. Below the search: a status filter segmented control (`ALL` / `ACTIVE` / `INACTIVE`) and a role filter (`ALL` / `PATIENTS` / `DOCTORS`).

Table columns: `USER`, `EMAIL`, `ROLE`, `JOINED`, `STATUS`, `ACTIONS`.

The `USER` column: initial circle and name.

The `ROLE` column: the neutral badge variant with the role as the label — `PATIENT` or `DOCTOR`. The neutral badge is the correct choice here because role is categorical, not status-indicating. Teal, amber, and red carry specific meanings in the badge system. A role is not a status — it should not be colored.

The `STATUS` column: `ACTIVE` in the black bordered badge or `INACTIVE` in the gray bordered badge.

The `ACTIONS` column: `DEACTIVATE` for active users (gray text, not red — deactivation is administrative, not destructive in the same sense as suspension), `REACTIVATE` for inactive users (black text). Admin accounts show no action link — the row simply has no action column content. This is enforced in the component, not just in the API.

---

## AI Tools Page — `D5.7`

### Design Intent

The AI tools page is a low-frequency administrative utility. It is the one page in the admin experience where the admin is interacting with a non-deterministic system — the AI. The design must communicate this clearly: the admin is triggering a process, not executing a transaction. The outcome is probabilistic, not guaranteed.

### Page Layout

Section header: `AI TOOLS` in display size.

One section on this page for the MVP: `DOCTOR PROFILE SUMMARIES`. Section subheader pattern below the page header.

A bordered card, gray surface, diagonal pattern — the diagonal pattern appears throughout the product on surfaces that communicate staged processes (onboarding card, verification explanation). The AI generation process is staged — it runs across multiple doctors sequentially. The diagonal pattern is the correct contextual signal.

Inside the card: two columns. Left: a description of what the batch generation does — `GENERATE AI SUMMARIES` in small red uppercase as the label, then `Automatically generate professional summaries for all verified doctors who do not yet have one. Processes up to 50 doctors per batch.` in `ui-md` mixed-case. Below the description: the `GENERATE SUMMARIES →` button in the primary black variant.

Right: the results panel. Empty by default — no content when the process has not been run. After triggering: a bordered row showing `PROCESSED: X` / `SUCCESSFUL: X` / `FAILED: X` in three adjacent bordered cells. The numbers fill in as the process runs if real-time feedback is available, or appear together when the process completes.

The `FAILED` number uses the red text — it is the only number that is functionally meaningful as a signal. If failed is zero, it is black. If failed is non-zero, it is red. This is a conditional functional use of red consistent with the system rules.

---

## Reviews Moderation Page — `D5.8`

### Design Intent

Review moderation is a periodic task. Admins are not in this page continuously — they visit when a review has been flagged or when doing periodic quality checks. The design is lean and efficient.

### Table Structure

Section header: `REVIEWS` in display size.

Table columns: `PATIENT`, `DOCTOR`, `RATING`, `COMMENT`, `DATE`, `VISIBILITY`, `ACTION`.

The `RATING` column: the rating number in a bordered square — the same bordered square treatment established in the Phase 3 review cards and Phase 5 analytics table. Consistent visual treatment for ratings across all contexts.

The `COMMENT` column: truncated at one line with `...`. Full text on row hover in a tooltip — the same pattern used for the payment ID. Consistent truncation behavior across the product.

The `VISIBILITY` column: `VISIBLE` in the teal badge or `HIDDEN` in the gray badge. Teal is the visible/active/confirmed signal throughout the product — its use here is consistent.

The `ACTION` column: `HIDE` as a red text link for visible reviews. `UNHIDE` as a black text link for hidden reviews. The red `HIDE` link is the correct treatment — hiding a review is a consequential action that warrants the functional red signal.

No confirmation modal for hide/unhide. Inline state change with instant feedback. Toggling review visibility is a low-stakes reversible action — a modal would add unnecessary friction to a frequent moderation task.

---

## Notification Bell — `D5.9`

### Design Intent

The notification bell is a global component that appears in the navbar across all three roles. It is the one persistent real-time communication surface in the product. Its design must be unobtrusive when there are no notifications and immediately visible when there are.

### Bell Position and Badge

The bell icon (Lucide `Bell`, stroke-width 1.5) sits in the navbar to the left of the user avatar menu. When unread notifications exist: a small bordered rectangle positioned at the top-right corner of the bell icon shows the unread count. Bordered rectangle, not a circle — consistent with geometry rules. Black border, black text, white fill. The count disappears when all notifications are read.

Why a rectangle badge on the bell? Throughout the product, circular shapes are reserved for avatar initials and status dots. A circular badge on a bell icon would introduce a new circular element with a different purpose. The bordered rectangle maintains geometric consistency while achieving the same functional goal.

### Notification Dropdown

Clicking the bell opens a dropdown — a bordered rectangle, white background, `280px` wide, positioned below and right-aligned to the bell icon. The dropdown is a standard bordered rectangle — no border-radius, no shadow, no blur. `2px` black border.

The dropdown header: `NOTIFICATIONS` in small uppercase tracked black, with a `MARK ALL READ` text link right-aligned in small uppercase red. Red is used here because mark-all-read is an action that changes state — it is functionally significant, not decorative.

Notification rows are `72px` tall. Each row contains: a category label in small red uppercase at the top-left (`NEW BOOKING`, `VERIFICATION UPDATE`, `PAYMENT RECEIVED`), the notification title in `ui-md` bold black below it, and a relative timestamp in the smallest text size gray at the bottom-right.

Unread rows have a `2px` left black border — the same left-border treatment used for active navigation items. This visual language carries across contexts: a left black border means "this is the active/unread state." Read rows have no left border.

On row hover: the row background shifts to `swiss-gray-50`. No color inversion — notification rows contain information, not navigation actions. The hover state signals interactivity without implying that clicking the row will take a destructive action.

Clicking a notification row marks it as read, removes the left border, and navigates to the relevant page — a booking notification navigates to the appointment detail, a verification update navigates to the doctor profile.

---

## Product Polish Pass — `D5.10`

### Why This Exists as a Dedicated Phase Step

Every multi-phase design project accumulates inconsistencies. A border-width that drifts from `2px` to `1px` on a specific page. A section that skips the number prefix. A table that uses `rounded-sm` on its action links. These inconsistencies are individually small and collectively catastrophic — they communicate that the product was assembled by multiple people working in isolation, not designed as a unified system.

The polish pass is a systematic audit of every screen against every rule. It is not optional and it is not a final step that can be skipped if time is short. It is the step that separates a portfolio project from a product.

### Consistency Audit

Every page is opened side by side with its adjacent pages. Check: do all section headers use the number-label + display-title + rule pattern where required? Are all section numbers in the exact same red? Are all rules the same 4px weight? Are all buttons uppercase? Are all badges using white fill? If any element deviates, correct it before the audit continues.

### Color Audit

Open every page. Visually inspect: does any color appear that is not in the token system? Red appears in exactly four contexts: primary CTAs, active navigation, section number prefixes, destructive table actions. Teal appears in exactly three contexts: verified badges, confirmed appointment status, paid payment status. Amber appears in exactly two contexts: pending status badges, the verification/attention bordered cards. If red appears anywhere else, it must be corrected. If teal appears anywhere else, it must be corrected.

### Typography Audit

Every heading on every page must be uppercase. Every label must be uppercase. Every badge must be uppercase. Every table column header must be uppercase. Mixed-case appears only in: body text, form field values, doctor bios, review content, notification messages. If a heading is mixed-case anywhere in the product, correct it.

Large display type must have negative letter-spacing. Small labels must have positive letter-spacing. If any display-size text has the default zero tracking, correct it — it will look loose and unintentional.

### Border Audit

No border-radius anywhere except avatar initials and status dots. This audit is specific — open browser DevTools on every page and visually inspect any element that appears rounded. Buttons, cards, inputs, badges, modals, dropdowns, tables, chips — all must be rectangles. The one exception is the initial circle and the teal dot on the notification. No other exceptions.

### Interaction Audit

Every interactive element has a hover state. Every hover state is mechanical — a color inversion, a border weight change, or a red shift. No element has an opacity fade as its only hover state. Open every page and hover every clickable element. If any element's hover state is a subtle fade rather than a structural change, replace it.

### Empty State Audit

Every list view, table, and data section has a designed empty state using the `EmptyState` component from Phase 1. No empty state uses a browser-default "no data" message. No empty state is a blank white area. No empty state uses an illustration or complex SVG. Every empty state uses the `00.` red prefix, a large uppercase title, a single descriptive sentence, and one action button where an action is available.

### Loading State Audit

Every data-fetching component has a skeleton using the `Skeleton` component from Phase 1. Skeletons match the exact shape of their content — a doctor card skeleton has three gray rectangles in the proportions of the card's name, specialization, and detail rows. A table skeleton has gray rectangles for each cell in the correct column widths. Generic gray boxes are not acceptable.

---

## Implementation Order for Phase 5

Strictly follow this order. The admin shell must exist before any admin page is built. The overview must be built before the analytics page because overview components (charts, activity feed) are the same components used at different sizes on the analytics page.

1. Admin sidebar navigation shell
2. Admin overview — metric cards grid
3. Admin overview — revenue chart and appointment donut
4. Admin overview — recent activity feed
5. Analytics page — full-width chart with period toggle
6. Analytics page — top doctors table with sort controls
7. Analytics page — specialization breakdown
8. Doctors management — table and controls bar
9. Doctors management — verification queue section
10. Doctors management — inline expand and reject flow
11. Doctor detail page
12. Revenue page — metrics and payments table
13. Users management — table and controls
14. AI Tools page
15. Reviews moderation table
16. Notification bell — global component
17. Consistency audit
18. Color audit
19. Typography audit
20. Border audit
21. Interaction audit
22. Empty state audit
23. Loading state audit

---

## What Phase 5 Must Feel Like When Complete

Open the admin dashboard cold. You should think: *"This is a serious operations tool."*

Navigate to the doctors page and see pending verifications. You should think: *"I know exactly what to do here."*

Open the revenue page and scan the payments table. You should think: *"I can audit this data by eye."*

Navigate between pages five times quickly. You should think: *"Every page is the same system."*

If any page breaks this pattern — feels out of place, has a different visual register, uses a component that does not appear elsewhere — that page has not been built to the system. It needs to be corrected before the product is complete.

---

## Cross-Phase Polish — What Must Be True Across All 5 Phases

These are the rules that apply not just to Phase 5 but to the product as a whole. Verifying them is the final act of the design process.

The product name `PHYSIOCONNECT` must appear in uppercase bold in the same typographic treatment in the navbar, in all three sidebars, and in the footer. It must look identical in all five locations.

The teal badge must look identical whether it appears on a doctor card in the discovery page, a booking confirmation in the patient appointments table, a payment row in the doctor earnings page, or a payment row in the admin revenue table. One component, no variations.

The section header pattern must look identical on the landing page (`01. AREAS OF CARE`), the patient dashboard (`MY APPOINTMENTS`), the doctor dashboard (`TODAY'S SCHEDULE`), and the admin dashboard (`DOCTORS`). One component, no variations.

The table component must look identical whether it appears in the patient appointments page, the doctor earnings page, the admin doctors page, or the admin revenue page. Column proportions vary. The structural treatment does not.

The empty state component must look identical whether it appears in an empty appointments table, an empty reviews list, an empty payments page, or an empty admin activity feed. One component, no variations.

When all five phases are complete and all audits pass, the product looks like it was designed by one person at one desk on one day. That coherence is the final deliverable.