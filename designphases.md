Understood. No code. Pure design direction, strategy, and implementation prompts — structured exactly like the previous phase prompts.

---

# Theralign — Swiss-Inspired SaaS Redesign
## Complete Master Prompt: All 5 Phases

---

# PHASE 1 — Design System Foundation

## Design Philosophy

The raw Swiss International Style must be **calibrated for healthcare trust**. Pure Swiss is cold, editorial, and abstract. Kinetiq needs to feel precise and credible without feeling sterile or intimidating to patients who are in pain and looking for help. The adaptation is surgical: retain the structural discipline, the typographic authority, the rectangular geometry, and the functional use of red — but calibrate the temperature.

The single most important design decision in Phase 1 is this: **Kinetiq is not a design portfolio. It is an operations platform.** Every token, every spacing decision, every color choice must serve the workflow of patients booking care and doctors managing their practice. The Swiss system is the vehicle. Healthcare SaaS credibility is the destination.

The closest reference products are Linear, Stripe, and a cold-weather version of Airbnb — all running through a Swiss typography filter. When an interviewer or investor opens this product, their immediate visceral read should be: *"This was built by people who know what they're doing."*

---

## Token Decisions

**Color System — The Only Palette Permitted**

The core palette is near-monochrome with two functional signal colors. There is no room for additional colors. Every color decision in every subsequent phase must reference this list and nothing else.

The primary background is pure white. The primary text is a near-black — not pure `#000000` which reads as harsh on screen, but one step warmer that still reads as black while carrying slight warmth. This single degree of warmth is what separates a healthcare platform from a court document.

The muted surface color is a cool light gray used for card backgrounds, table rows, sidebar panels, and anywhere a secondary visual layer is needed without a border. It must never feel warm — it is a structural tool, not a decorative one.

The accent color is Swiss Red. It is used in exactly four contexts and no others: primary call-to-action buttons, active/selected navigation states, section number prefixes (`01.` `02.` `03.`), and critical system alerts. It is never used as a background fill on large surfaces, never used decoratively, never used to color text except on white backgrounds where contrast is confirmed. When it appears, it must feel like a signal — the same visual authority as a stop sign or an emergency indicator.

The trust color is a single deep teal. It is used in exactly three contexts: verified doctor badges, confirmed appointment status, and paid payment status. It communicates safety and confirmation. It does not appear anywhere else in the product. Its rarity is what makes it meaningful.

Status colors beyond red and teal are expressed through the black/gray/white system. Pending states use a dark amber. Cancelled states use mid-gray. These are never bright or attention-seeking — they are informational.

**Typography Scale**

The typeface is Inter at all weights. Nothing else. No display font, no serif, no mixed system. Inter is the closest available approximation to Helvetica Neue and Akzidenz-Grotesk — the canonical Swiss grotesque — and its variable weight axis means the same family communicates everything from a data table label to a hero headline.

The type scale has two tracks: a display track for marketing surfaces and section headers, and a UI track for interface elements. The display track is extreme — headlines at the largest size feel like architecture, not text. The contrast between the largest and smallest sizes on a single page is the core mechanism of visual hierarchy. Body text never competes with headlines. They live in completely different weight and size registers.

All headings are uppercase. All labels are uppercase. Body text and long-form content are mixed case for readability. This is not decoration — it is a structural rule that separates information layers.

Letter-spacing is tighter on large headlines (negative tracking creates mass and authority) and wider on small labels (positive tracking increases legibility at small sizes and communicates formality). The moment either rule is broken — a label with tight tracking, a headline with wide tracking — the system loses its authority.

**Geometry and Radius**

Zero border radius on every element except avatar initials and status dot indicators. There are no pill buttons, no rounded cards, no soft modals. Rectangularity is the structural metaphor of the Swiss system and the correct metaphor for a professional operations platform. It communicates precision, not friendliness.

The single exception — the full-radius circle used for avatar initials and status indicators — is purely functional. Circular shapes are universally understood as identity markers and status lights. They appear nowhere else in the UI.

**Borders**

Borders are structural, not decorative. They are visible, thick, and deliberate. The default card border is `2px` solid near-black. Where a heavier structural line is needed — section separators, table headers, active states — `4px` is used. No `1px` hairline borders exist in this system except for the lightest internal table row separators. The visibility of borders is what makes the grid tangible.

**Spacing**

The spacing system is based on an 8px base unit. Every space in the product — padding, margin, gap — is a multiple of 8. The page-level horizontal padding is generous: `64px` on large desktop, scaling down but never below `32px`. Section vertical rhythm is deep — sections breathe. Individual components are dense — data tables and appointment cards pack information efficiently. The contrast between section spaciousness and component density is intentional and creates the professional information-hierarchy feel of products like Linear and Stripe.

**Texture and Pattern**

Four CSS-generated patterns are available as utility classes. None are applied globally. They are applied deliberately to specific surfaces: the subtle 24px grid pattern on hero backgrounds and feature section muted panels, the dot matrix on section header sidebars, the diagonal lines on accent background areas, and the noise texture applied to the body background at near-invisible opacity to eliminate the flat coldness of pure white and simulate the warmth of quality paper. These patterns must never be stacked on the same surface or applied to black/red areas. They are depth tools, not decorative tools.

**Elevation**

There are no drop shadows in this system. Zero. Not small ones, not diffuse ones. Elevation is expressed through border contrast and background color shifts. A card that sits above its background does so because it has a border and a different fill color — not because it casts a shadow. This forces every layout decision to stand on its structural merits.

**Animation**

All transitions are `150ms` to `200ms` with a sharp ease-out. There is no bounce, no spring, no elastic. Movement is mechanical and immediate, like a precision instrument. The micro-interactions are: color inversion on hover (white becomes black, black becomes red), rotation for iconographic toggles (the plus icon rotates 45° to become a close icon), and a -1px vertical lift on testimonial cards and interactive rows. There is no parallax, no scroll-triggered animation, no entrance animations. The product is functional — it does not perform.

---

## Primitive Components to Define

Before any page is touched, the following primitive components must be built and agreed upon. They are the atoms of the entire system. Every page in Phases 2–5 is assembled exclusively from these atoms. No page introduces its own one-off styles.

**Button** — four variants: primary (black fill, white text, red hover), secondary (white fill, black border, black hover to invert), accent (red fill, white text, dark red hover), ghost (transparent, black border, gray fill hover). All uppercase, bold, tracked, rectangular. Loading and disabled states defined.

**Input** — rectangular border, black focus border, no glow. Uppercase placeholder text. Error state with red border and inline error message. Label above input, always uppercase, small tracked text.

**Card** — bordered rectangle, white or gray fill. Hover state is full color inversion to black. Internal padding is generous and consistent. No rounded corners, no shadow.

**Badge / Status Chip** — bordered rectangle, no fill. Text is color-matched to border. Four types: verified (teal), confirmed (teal), pending (amber), cancelled (gray). All uppercase, small, tracked. These are the only colored elements other than the accent red.

**Table** — no outer border, heavy top rule separating header from body, light internal row separators. Header text uppercase, tracked, small. Row hover is gray fill. No zebra striping.

**Modal** — full rectangular, heavy black border, white background. Header with thick black bottom rule. No overlay blur — semi-transparent black overlay only. No border radius. Close button is an X icon in the top-right corner.

**Toast** — appears at bottom-right, rectangular, heavy black border. Success: teal left border accent. Error: red left border accent. No icons other than a close X.

**Skeleton** — gray fill rectangles matching the shape of the content they represent. No rounded corners. Pulse animation using opacity oscillation, not movement.

**Empty State** — centered in its container. Section number label in red, large uppercase text, single sentence description in gray, one action button. No illustrations, no decorative icons — a single lucide icon in a bordered square if needed.

**Section Header Pattern** — every page section begins with: a section number label in red (`01.`), then the section title on the next line in display type, uppercase, black, left-aligned. A thick horizontal rule runs beneath. This pattern is inviolable across all pages.

---

## What Phase 1 Produces

At the end of Phase 1, the product has:
- A complete Tailwind configuration with all tokens defined as named design variables
- A global stylesheet with pattern utilities, typography utilities, and layout utilities
- A component library of primitives that every subsequent phase imports
- A documented list of what is and is not permitted in the system

No page looks different yet. The foundation exists. Phase 2 begins building on it.

---

## Implementation Order for Phase 1

1. Tailwind config — tokens first, nothing else
2. Global CSS — patterns, resets, utility classes
3. Button primitive — all variants and states
4. Input primitive — all variants and states
5. Badge/Status primitive
6. Card primitive
7. Table primitive
8. Modal primitive
9. Toast primitive
10. Skeleton primitive
11. Empty state primitive
12. Section header pattern

Do not proceed to Phase 2 until all 12 items are complete and visually verified in isolation.

---

# PHASE 2 — Landing Page Reimagination

## Design Philosophy

The landing page has one job: within five seconds of arrival, a visitor — whether a patient, a doctor considering joining, or an interviewer evaluating the product — must think *"this is a real startup."* Everything on this page is a conversion mechanism. Nothing is decorative.

The Swiss system gets its strongest expression here because this is the one surface in the product where typographic architecture and visual boldness serve the business goal directly. A patient who is impressed by the product's authority is more likely to trust it with their healthcare. An interviewer who is impressed by the design maturity is more likely to believe in the engineering quality.

The landing page is **not** a typical healthcare website with stock photos of smiling doctors. It is not soft, approachable, or friendly in the conventional sense. It is authoritative, precise, and credible — the way a well-designed hospital wayfinding system is authoritative, or the way a serious insurance company's interface feels trustworthy through its restraint.

---

## Section-by-Section Direction

### Navbar

The navbar is full-width, white background with a `4px` black bottom border that acts as a structural ground line for the page. No drop shadow. The logo is the product name `KINETIQ` set in uppercase Inter Black, tracking-tight, at a size that communicates authority without dominating. To the right: a sparse set of navigation links — `FIND DOCTORS`, `FOR PHYSIOTHERAPISTS`, and then the two auth CTAs: `LOG IN` as a ghost button and `GET STARTED` as the primary black-fill button.

Navigation links have a micro-interaction: on hover, the text slides up and is replaced from below by a red version of the same text. This is the Swiss navigation animation specified in the design system. It is snappy at `150ms` — not a fade, a mechanical vertical slide.

On scroll past `80px`, the navbar gets a solid white background with the same `4px` bottom border. It does not get smaller, blurrier, or more transparent. It stays exactly the same size and weight. Sticky, authoritative, immovable.

The mobile version collapses to a hamburger at `768px`. The expanded mobile menu is a full-width black panel with white text and the red CTA button at the bottom.

---

### Hero Section

This is the highest-leverage piece of design in the entire product. It must be exceptional.

The layout is asymmetric: a `7:5` column split. The left `7` columns contain the copy and CTAs. The right `5` columns contain a geometric composition.

The hero headline is the largest type on the page. It occupies three lines, uppercase, Inter Black, negative letter-spacing. The word structure is designed so the most meaningful word in the headline receives a red underline or a red typographic treatment — a single functional use of the accent color to direct the eye to the value proposition.

Below the headline: a single sentence in mixed case, gray, UI-medium size. Not a paragraph — one sentence. Every word must earn its place.

Below the body sentence: the AI symptom search box, introduced with a small uppercase red label `DESCRIBE YOUR SYMPTOMS →`. The search box itself is the primary conversion mechanism on the page. It is a full-width input with a black right-attached button that says `FIND CARE`. On focus, the input border shifts to black `4px`. This must feel like a command interface, not a friendly search bar.

Below the search: two secondary CTAs side by side. `BROWSE DOCTORS →` as a secondary button and `JOIN AS A PHYSIOTHERAPIST →` as a ghost button. Both uppercase, rectangular, tracked.

The right geometric composition is a Bauhaus-inspired arrangement of rectangles, circles, and lines built entirely from `div` elements with border and background properties — no images, no SVGs sourced externally. One element has the grid pattern. One has the dot matrix. The composition includes a representation of a doctor profile card rendered in the Swiss style (bordered rectangle, initial circle, name in bold uppercase, rating in red) to communicate what the product does without photography. This composition has no animation — it is architectural, static, structural.

Below the composition: three trust metrics in a horizontal row. Numbers in display size, black. Labels in small uppercase gray. Separated by thin vertical lines. This is the StatsBar from Phase 1 reimagined as a structural element of the hero, not an afterthought.

The hero background has the grid pattern applied at `3%` opacity. The grid lines are barely perceptible but create the subtle sense that the page is laid over a disciplined structure.

---

### Trust Bar

A full-width band, black background, white text. A single row of logos or text identifiers of trust signals — if real logos are unavailable, use text: `VERIFIED SPECIALISTS` · `ONLINE BOOKING` · `SECURE PAYMENTS` · `REAL PATIENT REVIEWS`. Each separated by a red bullet point (`·` in red). This band is `80px` tall with the pattern of diagonals barely visible at `2%` opacity on the black. Text is small uppercase tracked — the kind of bar you see on serious B2B and fintech products.

---

### Specializations Section

Section header pattern: `01.` in red, then `AREAS OF CARE` in display type, then a horizontal rule.

Eight specialization cards in a `4×2` grid. Each card is a bordered rectangle, gray background with the dot matrix pattern, specialty name in bold uppercase, and a single lucide icon enclosed in a bordered square. On hover: full color inversion — the card goes black, the text goes white, the icon inverts. This is the Swiss card hover specified in the design system.

Clicking a card navigates to the discovery page with the specialization filter pre-applied. The cards are not decorative — they are the fastest path from landing page to conversion.

---

### How It Works Section

Section header pattern: `02.` in red, then `HOW IT WORKS` in display type, then a horizontal rule.

Layout: four steps in a horizontal row separated by arrow indicators. Each step has: a large step number in near-black at display size (`01` `02` `03` `04`), a short uppercase label below it, and a single sentence description in small mixed-case gray. The steps are left-aligned. The arrows between them are simple `→` characters in red.

The background of this section is the muted gray surface with the fine-grid pattern — a deliberate contrast to the white of the hero and specializations sections, creating visual rhythm through surface alternation.

---

### Featured Doctors Section

Section header pattern: `03.` in red, then `TRUSTED SPECIALISTS` in display type, then a horizontal rule.

Three doctor cards in a horizontal row fetched from the top-rated verified doctors API. Each card uses the Kinetiq DoctorCard redesigned in the Swiss style: bordered rectangle, white background, doctor initial in a full-radius circle (the one permitted exception to rectangular geometry), name in bold uppercase, specialization in small red uppercase tracked text, rating shown as a number + `/5` rather than stars (more precise, more Swiss), and a consultation fee. No profile photography dependency — initials-based avatars are the default. If a profile image exists, it replaces the initial circle.

Below the three cards: a full-width secondary button `VIEW ALL DOCTORS →`, left-aligned.

---

### Platform Statistics Section

Section header: no number label here — this section is purely numbers, and the numbers are the statement.

Full-width black background. Four large statistics in a `1×4` grid. Each stat: the number in display-xl white text, the label in small uppercase gray-mid text below it, separated by a thin white vertical line from the next stat. The numbers are the largest type on the page after the hero headline. This section is the visual climax of the trust-building sequence. The background has the diagonal pattern at the lowest possible opacity — barely perceptible structure on black.

---

### Reviews / Testimonials Section

Section header pattern: `04.` in red, then `PATIENT OUTCOMES` in display type, then a horizontal rule.

Three testimonial cards in a row. Each card: bordered rectangle, white background, a large opening quote mark in red (`"`) at display-sm size, the review text in mixed-case body size, patient initial + name in bold uppercase below, and a star rating expressed as a number in small red text. On hover: `border-color` shifts from black to red, the quote mark intensifies, and the card lifts `-1px` vertically. This is the testimonial hover specified in the design system.

The section background is white. The cards create their own visual weight through borders and the quote mark red.

---

### Verification Explanation Section

Section header pattern: `05.` in red, then `ONLY VERIFIED SPECIALISTS` in display type, then a horizontal rule.

Layout: `5:7` asymmetric split. The left `5` columns contain a large geometric composition — a stack of bordered rectangles representing the verification steps as a visual process diagram. Each step is a numbered card: `01. DOCUMENT SUBMISSION` `02. ADMIN REVIEW` `03. VERIFICATION GRANTED` `04. LIVE ON PLATFORM`. The last card has a teal left border accent to signal the verified state. The right `7` columns contain the explanatory copy: three short paragraphs, each with an uppercase red label introducing it (`WHY IT MATTERS`) followed by mixed-case body text. Below the copy: the `JOIN AS A PHYSIOTHERAPIST →` accent button in red.

This section is critical for building patient trust and doctor acquisition simultaneously. The visual process diagram communicates that the platform has standards.

---

### CTA Banner Section

Full-width, black background. Asymmetric layout — left side: large display-type text `READY TO FEEL BETTER?` in white uppercase, then a single-sentence description in gray-mid below it. Right side: two buttons stacked — `FIND A DOCTOR →` in red (the most prominent CTA on the page) and `REGISTER AS A PHYSIOTHERAPIST →` in white outline below it. A thin white vertical line separates left and right content.

This is the final conversion moment. It must feel like a command, not an invitation.

---

### Footer

Full-width, gray surface, `2px` black top border. Four columns: brand + tagline in left column, three link groups in right columns. The brand column has the `KINETIQ` logotype in bold uppercase and a one-sentence platform description in small gray mixed-case below it. Link group headers are uppercase tracked black. Individual links are small mixed-case gray with red hover. Copyright line at the bottom, separated by a light horizontal rule, in small uppercase tracked gray.

---

## Implementation Order for Phase 2

1. Navbar — with scroll behavior and micro-interaction
2. Hero section — copy, search input, and geometric composition
3. Trust bar
4. Specializations grid
5. How It Works
6. Featured Doctors
7. Platform Statistics
8. Reviews
9. Verification Explanation
10. CTA Banner
11. Footer

---

# PHASE 3 — Patient Experience

## Design Philosophy

The patient experience is a conversion funnel. Every screen has one primary action that the design must make obvious, and one secondary action that the design must make accessible without competing. The Swiss system serves this perfectly — hierarchy is clear, distractions are eliminated, and the next step is always visually signaled.

The patient's emotional state must be considered at every screen: they are often in some degree of discomfort or concern. The design cannot be cold. It must be precise and warm simultaneously — precision through the Swiss structure, warmth through the generous spacing, large readable type, and the deliberate restraint of not overwhelming them with information. The design must communicate: *"This platform knows what it's doing. You are in capable hands."*

---

## Doctor Discovery Page

### Layout Architecture

The page is a two-panel layout: a narrow left sidebar for filters and a wide right main area for results. The sidebar is `280px` wide with a `2px` right border separating it from the results area. There is no card wrapping the sidebar — it is a structural column defined by its border, consistent with the grid-is-law principle.

The search bar sits above both panels in a full-width bar, visually separated from the results area by a `2px` bottom border. This search bar contains the main text input and the AI symptom trigger button side by side. The symptom search result — if active — shows as a bordered card above the results, with a section label `AI RECOMMENDATION` in red and the suggested specialization + confidence level displayed.

### Filter Sidebar

Each filter group has an uppercase red section label (`SPECIALIZATION`, `LOCATION`, `AVAILABILITY`, `FEE RANGE`), a thick black separator line beneath it, and the filter options below. Filter options use custom checkboxes — bordered squares that fill black on selection, not browser-default rounded checkboxes. Selected filters appear as small black-bordered chips above the results area with an × to remove them. There is no submit button — filters apply live as they are selected.

The fee range filter is a min/max dual input — two rectangular text inputs side by side with a `—` separator between them. No slider. Sliders are imprecise and decorative.

### Results Area

Results header: left-aligned count of results (`47 SPECIALISTS FOUND`) in bold uppercase, with sort controls on the right expressed as a segmented control — bordered rectangles that invert to black when active. Sort options: `RELEVANCE`, `RATING`, `FEE: LOW`, `FEE: HIGH`. These are typographic buttons, not a dropdown.

Doctor cards in the results are arranged in a `3-column` grid on large desktop, `2-column` on medium desktop. Each card is a bordered rectangle, white background, with the doctor's initial circle (or profile photo if available), name in bold uppercase, specialization in small red uppercase, a rating shown as a number, location in small gray, and a consultation fee in bold. On hover: the card border becomes `4px`, no background color change (unlike the specializations cards — this is a data card, not a categorical card). A `BOOK NOW →` CTA appears at the bottom of the card on hover, sliding in from the bottom with a mechanical `150ms` transition. The card does not change color — it gains a call to action.

Empty state: a bordered rectangle centered in the results area. A section number `00.` in red, large uppercase text `NO SPECIALISTS FOUND`, a smaller body sentence, and a `CLEAR FILTERS →` button.

Loading skeleton: three rows of three cards, each a gray rectangle matching the card proportions exactly, with the pulse animation.

### Smart Search Suggestions Dropdown

The autocomplete dropdown is a bordered rectangle directly below the search input, white background, no rounded corners. Each suggestion row has a category indicator on the left — a small bordered square containing the type icon — the suggestion text in bold uppercase on the right. On hover: the row inverts to gray. The selected suggestion inverts to black with white text.

---

## Doctor Profile Page

### Layout Architecture

A `7:5` asymmetric split. Left `7` columns: the primary doctor information and booking flow. Right `5` columns: the doctor's availability heatmap, slot picker, and CTA. These two columns are separated by a `2px` vertical border.

### Left Column — Doctor Information

The doctor's name is in `display-md` uppercase, left-aligned, black. Below it: specialization in small red uppercase tracked. Below that: a row of three key facts — years of experience, total appointments, and average rating — each expressed as a number in bold with a small uppercase label below, separated by thin vertical lines. Below that row: a `2px` full-width rule.

Then: the verified badge and any other status indicators. The verified badge is the teal bordered rectangle from Phase 1 — `VERIFIED SPECIALIST` with a thin teal border and teal text.

Then: the AI-generated summary in a bordered card with the gray surface background. The card has a small section label `AI SUMMARY` in red, and the summary text in mixed-case italic body size. A small gray attribution line at the bottom.

Then: the doctor's bio in regular body text, mixed case, full width of the left column. Preceded by the section header pattern: no number (this is not a numbered section), but a bold uppercase black label `ABOUT` with a rule beneath.

Then: the reviews section — section header pattern `PATIENT REVIEWS` + rule, then the review cards in a single column.

### Right Column — Booking Panel

This column is sticky on scroll — it stays in view while the left column scrolls. This is a significant UX improvement over a non-sticky booking panel.

At the top of the sticky panel: the consultation fee in `display-sm` size, black, left-aligned. Below it: a small uppercase gray label `PER SESSION`. Beneath a horizontal rule: the availability heatmap. The heatmap is the 4-week grid from Feature F6, built in the Swiss style — bordered cells, color-coded using the status badge colors (teal for available, amber for limited, gray for full), no rounded corners, a legend below using small bordered squares matching the cell colors.

Below the heatmap: the selected date's time slots as bordered rectangular chips. Unselected chips: white fill, black border. Selected chip: black fill, white text. The selected chip has a `2px` red border inside — a subtle signal without breaking the monochrome system.

The `CONFIRM & PAY →` button sits at the bottom of the booking panel, full-width, accent red, uppercase. When a slot is not yet selected, it reads `SELECT A TIME SLOT` and is disabled (40% opacity). This creates a clear visual progression: heatmap → date selection → time selection → CTA activation.

---

## Booking Confirmation Modal

The modal is a full rectangular bordered overlay on a black semi-transparent background. The header reads `CONFIRM BOOKING` in bold uppercase with a thick black bottom border. The content area lists the appointment details in a clean definition-list layout: label on the left in small uppercase gray, value on the right in bold black. Labels: `DOCTOR`, `DATE`, `TIME`, `CONSULTATION FEE`. The fee line is the visual emphasis point — the fee number is shown in `display-sm` black.

Below the details: a single mixed-case gray notice about payment. Below that: two buttons full-width — `CONFIRM & PAY →` in red and `CANCEL` in ghost style below it.

---

## Patient Dashboard

### Layout Architecture

A left sidebar navigation and a main content area, separated by a `2px` right border on the sidebar. The sidebar is `240px` wide. The layout is consistent with the doctor dashboard and admin dashboard — the same structural shell exists across all three roles, with different navigation items.

The sidebar contains: the `KINETIQ` logotype at the top, navigation items as full-width bordered rows (active state: black background, white text, red left border), and the user avatar + name at the very bottom.

Navigation items: `DASHBOARD`, `MY APPOINTMENTS`, `FIND DOCTORS`, `PAYMENT HISTORY`, `MY REVIEWS`.

### Main Content Area

The dashboard home opens with a section header: no number, just the label `GOOD MORNING, [NAME].` in `display-sm` uppercase black, and today's date in small gray below it.

Below: four metric cards in a `2×2` grid. Each metric card is a bordered rectangle, gray surface, with a large number in bold display size, an uppercase label in small gray below it, and a thin horizontal rule separating the number from a secondary piece of context (e.g., `+2 THIS MONTH`). On hover: card border becomes `4px`. No color inversion for metric cards — they contain data, not actions.

Below the metrics: an `UPCOMING APPOINTMENTS` section with its header pattern. Appointments are listed as bordered rows — not cards — in a table-like format: date column, doctor column, time column, status badge column, and a `VIEW →` action on the far right. This is denser and more professional than card-based appointment lists.

Below that: a `QUICK ACTIONS` section with two wide buttons: `FIND A DOCTOR →` in primary black and `VIEW ALL APPOINTMENTS →` in secondary.

---

## Appointment History Page

Full-width bordered table. Header row with `4px` bottom border separating it from the body. Columns: `DATE`, `DOCTOR`, `SPECIALIZATION`, `TIME`, `FEE`, `STATUS`, `ACTIONS`. The status column uses the badge components. The actions column has `VIEW` and `CANCEL` as text links in small uppercase, with the cancel link in red.

Filter tabs above the table: `ALL` `UPCOMING` `COMPLETED` `CANCELLED` — expressed as the bordered rectangular segmented control from the discovery page, consistent with the global pattern.

---

## Review Submission Flow

The review form appears inline on the appointment row — an expandable section that opens below the appointment with a smooth height transition. It does not navigate to a new page.

The star rating is replaced with a numbered rating selector — five bordered square buttons labeled `1` through `5`. The selected number inverts to black fill. The unselected numbers are white with black borders. This is more consistent with the Swiss system than star icons.

The comment textarea is a full rectangular bordered input with a character counter in small gray at the bottom right. The submit button is full-width primary black below the textarea.

---

## Implementation Order for Phase 3

1. Sidebar navigation shell (shared layout)
2. Doctor discovery page — search bar and filters
3. Doctor discovery page — results grid and card
4. Doctor profile page — left column
5. Doctor profile page — right sticky booking panel with heatmap
6. Booking confirmation modal
7. Patient dashboard — metrics and upcoming row
8. Appointment history table
9. Review submission inline form
10. Payment history page

---

# PHASE 4 — Doctor Experience

## Design Philosophy

Doctors are professional users. They use this platform to run their practice. The design for the doctor experience must communicate operational efficiency above everything else. A doctor opening their dashboard at 8am before their first patient should see exactly what they need — today's schedule, pending items, earnings status — without scanning or searching.

The Swiss system is ideally suited to professional workflows: high information density where data lives, generous breathing room where narrative or status lives, and an absolute absence of decorative elements that would waste a professional's time.

The doctor experience shares the same sidebar shell as the patient experience but has a distinct navigation set and denser information architecture.

---

## Doctor Dashboard

### Navigation Items

`OVERVIEW`, `MY APPOINTMENTS`, `AVAILABILITY`, `EARNINGS`, `MY PROFILE`, `MY REVIEWS`.

### Overview Page

Section header: `[DAY], [DATE].` in display-sm uppercase, with a verification status banner directly below it if not yet verified. The verification banner is a full-width amber-bordered row (using the pending status color) with the text `YOUR PROFILE IS PENDING VERIFICATION — COMPLETE YOUR PROFILE TO SPEED UP THE PROCESS →` in small uppercase. If verified, this banner does not exist.

Profile completion score: the bordered card from Feature F8, but redesigned in the Swiss style. A full-width bordered card, gray surface, with the completion percentage in `display-md` black on the left, a pure horizontal progress bar (a rectangle that fills left to right in black, on a gray track) below it, and the list of missing items as bordered rows on the right. Each missing item row: an empty bordered square checkbox on the left (black when complete), the item label in uppercase, and the weight percentage in small red on the far right.

Today's schedule: a `2:10` split — the date and day in display size on the left, and the appointment rows as a timeline list on the right. Each appointment row: time in monospace-style bold, patient initial circle, patient name, appointment status badge, and a `MARK COMPLETE →` link. Separated by thin horizontal rules.

Four metric cards below: `TODAY'S APPOINTMENTS`, `TOTAL PATIENTS`, `THIS MONTH'S EARNINGS`, `YOUR RATING`. Same pattern as patient metrics.

---

## Availability Management Page

### Section Header

`MANAGE AVAILABILITY` in display type with the standard section header pattern.

### Add Slot Form

A full-width bordered card, gray surface. The form is a single horizontal row of inputs: date input, start time, end time, and a `RECURRING` toggle. The toggle is a bordered rectangle that inverts to black when active, revealing the `REPEAT FOR` dropdown to its right. The `ADD SLOT →` button is on the far right of the row. This one-row form is far more efficient than the stacked form pattern — doctors adding many slots benefit from the horizontal scan.

### Slots Display

Slots displayed as a date-grouped table, not a card grid. Each date group has the date as a section subheader — `MONDAY, 3 FEBRUARY` in bold uppercase — with slots below it as bordered table rows: start time, end time, status badge, and a delete action. The `BOOKED` status uses the teal badge. The `AVAILABLE` status uses no colored badge — just the gray text `AVAILABLE`. Empty cells don't need a badge — the absence of the teal badge is signal enough.

The availability heatmap sits above the slot table as a monthly overview — the same component used in the patient-facing booking panel, but here showing the doctor's own schedule from their perspective.

---

## Earnings Page

### Section Header

`EARNINGS` in display type.

### Top Metrics Row

Three large metric cards side by side: `TOTAL EARNINGS`, `TOTAL SESSIONS`, `AVERAGE PER SESSION`. Numbers in display-md. Labels in small uppercase gray.

### Monthly Breakdown Table

A full-width table with months as rows. Columns: `MONTH`, `SESSIONS`, `GROSS FEE`, `PLATFORM FEE (10%)`, `YOUR EARNINGS`. The final column is visually emphasized — the number is in bold black, while the other numeric columns are in regular weight. The platform fee column uses a red accent on the `10%` label — a functional use of red to communicate the cost of the service.

### Recent Transactions List

Below the table: a `RECENT TRANSACTIONS` section with its header pattern. Each transaction is a bordered row: date on the left, patient first name only (privacy consideration), fee amount, and a `PAID` teal badge. This list goes back 10 items, with a `VIEW ALL →` link to a full payment history.

---

## Profile Management Page

### Section Header

`MY PROFILE` in display type.

### Form Layout

The form is sectioned into logical groups, each with its own section subheader and rule. Groups: `PERSONAL INFORMATION`, `PROFESSIONAL DETAILS`, `CLINIC LOCATION`, `CONSULTATION FEE`, `PROFILE PHOTO`.

Each input group uses full-width bordered inputs. Labels are always above inputs, never beside them, never as placeholders. The profile photo section shows the current photo (or initial circle) in a bordered square — not rounded. An `UPLOAD PHOTO →` button below it. File type and size requirements shown in small gray below the button.

The `SAVE CHANGES →` button is always visible at the bottom of the page — it does not scroll away. It is sticky at the bottom in a full-width white bar with a `2px` top border separating it from the form content.

---

## Doctor Onboarding (First-Time Experience)

When a doctor first completes registration and lands on their dashboard, they see an onboarding sequence — not a modal, but a persistent inline card that sits above all dashboard content. This card is a bordered rectangle with the diagonal pattern on its gray surface. It contains: a numbered checklist of `4` items (`COMPLETE YOUR PROFILE`, `UPLOAD VERIFICATION DOCUMENTS`, `ADD AVAILABILITY SLOTS`, `AWAIT VERIFICATION`), each as a bordered row with a square checkbox, uppercase label, and a `→` link. Completed items show a black-filled checkbox. The card dismisses when all four items are complete.

This is more useful than a progress bar alone — it is actionable and self-removing.

---

## Implementation Order for Phase 4

1. Doctor sidebar navigation (shared shell variation)
2. Doctor overview — today's schedule and metrics
3. Onboarding checklist card
4. Profile completion score card
5. Availability management — form and heatmap
6. Availability management — slot table
7. Earnings — metrics and monthly table
8. Profile management — form layout
9. Doctor reviews page

---

# PHASE 5 — Admin Experience & Product Polish

## Design Philosophy

The admin dashboard is an operations control center. The people who use it — platform admins — are power users who need maximum information density and maximum operational efficiency. The design serves data first. Every pixel is real estate for information.

The Swiss system's information-density capability is its strongest expression here. The admin experience looks closest to the Linear issue tracker and the Stripe dashboard — dense tables, precise status indicators, clear action hierarchies, and an analytics surface that communicates platform health at a glance.

---

## Admin Dashboard

### Navigation Items

`OVERVIEW`, `ANALYTICS`, `DOCTORS`, `USERS`, `APPOINTMENTS`, `REVENUE`, `AI TOOLS`, `REVIEWS`.

A pending verification count badge sits on the `DOCTORS` navigation item — a small red-bordered rectangle with the count in red, positioned to the right of the label. This is the one place in the sidebar where a counter badge is used. It is used because the verification queue is a time-sensitive operational action.

### Overview Page

The overview opens with a `2×4` metric card grid — eight platform metrics across two rows. The eight metrics: `TOTAL USERS`, `VERIFIED DOCTORS`, `PENDING VERIFICATION`, `TOTAL APPOINTMENTS`, `COMPLETED`, `CANCELLED`, `TOTAL REVENUE`, `PLATFORM COMMISSION`. The `PENDING VERIFICATION` card has an amber border instead of the standard black border — a functional visual alert that this metric requires action. The `TOTAL REVENUE` and `PLATFORM COMMISSION` cards have teal borders — positive financial metrics.

Below the metrics: two sections side by side in a `6:6` split. Left: the `REVENUE TREND` chart. Right: the `APPOINTMENT STATUS` breakdown. The chart is a simple line chart with no decorative styling — a black line on a white background with a gray muted surface card border. The y-axis and x-axis use small uppercase tracked labels. No chart decoration, no gradient fills under the line.

Below: `RECENT ACTIVITY` as a full-width bordered table — date, event type, actor, and detail in columns. Event types are expressed as small bordered chips. This is a live operational feed.

---

## Analytics Page

### Revenue Chart with Period Toggle

Full-width section. The period toggle (`DAILY` `WEEKLY` `MONTHLY`) is the bordered rectangular segmented control. The chart below it is a responsive line chart with a clean black line, no area fill. Hovering a data point shows a minimal tooltip — bordered rectangle, white fill, date and value in small uppercase. No rounded tooltip corners.

### Top Doctors Table

Full-width bordered table with metric sort toggles in the header. The header row has three active column headers that function as sort buttons: `BY EARNINGS`, `BY APPOINTMENTS`, `BY RATING`. The active sort column has a small red underline on its label. Doctor rows: initial circle, name, specialization, total earnings, total appointments, average rating (as a number), and a `VIEW PROFILE →` link.

### Specialization Breakdown

A `3:9` asymmetric split. The left `3` columns: a stack of specialization labels in bordered rows with their percentage in bold red on the right of each row. The right `9` columns: a horizontal bar chart where each bar is a solid black rectangle of proportional width on a gray track. No rounded ends on the bars. Labels above each bar in small uppercase gray.

---

## Doctors Management Page

### Header and Controls

Section header `DOCTORS` in display type. Below: a horizontal controls bar with a search input (full-width to the left), a status filter segmented control (`ALL` `VERIFIED` `PENDING` `SUSPENDED`), and an `EXPORT →` secondary button on the far right.

### Doctors Table

Columns: `DOCTOR`, `SPECIALIZATION`, `LOCATION`, `VERIFICATION STATUS`, `JOINED DATE`, `APPOINTMENTS`, `ACTIONS`. The verification status column uses the badge system. The actions column: `VIEW`, `VERIFY` (green → teal), `SUSPEND` (red). These actions are text links. The `SUSPEND` link is red — the only red text in a table, used as a functional signal for a destructive action.

The verification queue view (filtered to `PENDING`) shows an expanded row for each pending doctor — clicking the row reveals the submitted documents as bordered image/PDF thumbnails and an `APPROVE →` / `REJECT →` action pair.

---

## Revenue Page

### Layout

Section header `REVENUE` in display type. Below: three large metric cards — `TOTAL REVENUE`, `PLATFORM COMMISSION (10%)`, `DOCTOR PAYOUTS (90%)`. The three cards are in a `1×3` row with the same bordered card style. A thin horizontal rule separates them from the content below.

### Payments Table

A full-width bordered table. Columns: `DATE`, `PATIENT`, `DOCTOR`, `AMOUNT`, `COMMISSION`, `DOCTOR EARNINGS`, `STATUS`. The `PAID` status badge uses teal. The financial columns (`AMOUNT`, `COMMISSION`, `DOCTOR EARNINGS`) are right-aligned — always right-align numeric data in financial tables.

---

## Reviews Moderation Page

### Table

Columns: `PATIENT`, `DOCTOR`, `RATING`, `COMMENT` (truncated), `DATE`, `VISIBILITY`, `ACTION`. The rating column shows the number with a small bordered square background. The visibility column shows `VISIBLE` in teal badge or `HIDDEN` in gray badge. The action column: `HIDE` or `UNHIDE` as text links — the hide link in red.

---

## Notification Bell (Global)

The bell icon sits in the navbar to the left of the user menu. The unread count is a small red-bordered rectangle, not a circle — maintaining the rectangular geometry of the system. The notification dropdown is a bordered rectangle, white background, `280px` wide. Notification rows: a category label in small red uppercase, the notification title in bold, the message in small gray, and a relative timestamp in the smallest text size. Unread rows have a `2px` left black border acting as a read/unread indicator. Read rows have no border decoration.

---

## Product Polish Pass

After all five phases are implemented, a systematic audit addresses the following:

**Consistency Audit** — Every page opened side by side. Check: are all section headers using the number-label + display-title + rule pattern? Are all buttons using the defined variants? Are all tables using the same column header style? Are all badges using the defined badge system? Any deviation is corrected.

**Navigation Audit** — Every page in each role (patient, doctor, admin) is walked through. Check: is the active state consistent? Are all links uppercase and tracked? Is the sidebar border consistent? Are mobile breakpoints handled at the navbar level even though mobile is not the primary concern?

**Typography Audit** — Open each page and check: is any body text larger than the `ui-md` scale? Is any heading mixed-case when it should be uppercase? Is any label not tracked? Is any display text not at negative tracking? A single typographic inconsistency breaks the system's authority.

**Spacing Audit** — Check: are all spacings multiples of 8? Is any section using inconsistent vertical padding? Are all page containers using the same horizontal padding scale?

**Color Audit** — Check: is the red accent used anywhere other than its four permitted contexts? Is the teal used anywhere other than its three permitted contexts? Is any new color introduced that is not in the token system?

**Interaction Audit** — Check: does every interactive element have a hover state? Is every hover state a color inversion or the red shift? Is there any subtle opacity fade that should be replaced with a mechanical color change? Are all focus states showing the red ring?

**Empty State Audit** — Check: does every list view, table, and data section have a designed empty state? Is every empty state using the section-number label pattern?

**Loading State Audit** — Check: does every data-fetching component have a skeleton? Are all skeletons gray rectangles matching their content shapes?

---

## Implementation Order for Phase 5

1. Admin sidebar navigation shell
2. Admin overview — metrics grid and activity feed
3. Analytics page — chart and tables
4. Doctors management — table and verification queue
5. Revenue page — metrics and payments table
6. Reviews moderation table
7. Users management table
8. AI Tools section
9. Notification bell — global component
10. Consistency audit
11. Typography audit
12. Spacing audit
13. Color audit
14. Interaction audit
15. Empty state and loading state audit

---

## Cross-Phase Rules That Cannot Be Violated

These rules apply to every prompt in every phase. Any implementation that breaks them must be corrected before proceeding:

No backend file is touched. No API endpoint is modified. No schema field is changed. No business logic is altered. The redesign exists entirely in the `client/src` directory.

No new color is introduced that is not in the token system. If a new functional need arises that seems to require a new color, the answer is to use a combination of existing tokens — not to add a color.

No border radius is introduced except on avatar initials and status dots.

No drop shadows are introduced for elevation. Elevation is expressed through borders and background color.

No animation longer than `200ms`. No spring or elastic easing. No scroll-triggered animations.

Red is used in exactly four contexts: primary CTAs, active navigation states, section number prefixes, and critical destructive action links in tables.

Teal is used in exactly three contexts: verified badges, confirmed appointment status, and paid payment status.

Every page section uses the section-number-label + display-title + horizontal-rule header pattern without exception.

Every interactive element has a mechanical hover state — color inversion or red shift. No subtle fades.

The grid pattern is applied to exactly these surfaces: hero background, how-it-works section background, section sidebars in the verification explanation. Not globally, not randomly.