
---

# Theralign phase 14 — UI Redesign Prompt

## What to redesign and why

The agent-generated UI for `SessionRecordForm.jsx` and `PatientCareTimeline.jsx` is functionally correct but visually incorrect. It uses generic web form aesthetics — thin dashed borders, flat white accordion cards with no shadow definition, arbitrary orange for the `EDITING MODE` badge, and section headers that look like plain `<p>` tags. None of this matches the Theralign design language used everywhere else in the product. Every rule below is derived from the existing design system in `MASTER_CONTEXT.md`. Do not deviate from any of them.

---

## Global rules that apply to every change below

**Colors:** The only permitted colors are the exact hex values in MASTER_CONTEXT.md. No new colors. No opacity variations. No orange — `#F4845F` is coral and used only for the one accent CTA per screen.

**Typography:** Inter only. The scale is fixed — 10px, 11px, 12px, 13px, 14px, 15px, 16px, 18px, 22px, 28px. No intermediate sizes. Weights: 400, 500, 600, 700, 800. No 300, no 900 outside hero context.

**Casing:** Dashboard titles are Title Case. Section headers are UPPERCASE. Form labels are Title Case. Badges are UPPERCASE. Body/description text is sentence case. Buttons are Title Case. Do not mix these up — the current implementation uses UPPERCASE for section headers which is correct but Title Case for form labels which is also correct. The wrong part is buttons saying `SAVE SESSION RECORD` and `CANCEL` — they must be `Save Session Record` and `Cancel`.

**Shadows:** Only three levels permitted. Level 1 for resting cards: `0px 1px 3px rgba(11,79,108,0.06), 0px 1px 2px rgba(11,79,108,0.04)`. Level 2 for hover: `0px 4px 16px rgba(11,79,108,0.10), 0px 2px 6px rgba(11,79,108,0.07)`. Level 3 for modals. Never black shadows. Every card must have Level 1 shadow — the generated cards have none.

**Border radius:** 0px for navbar/sidebar/table rows. 4px for badges. 6px for buttons and inputs. 8px for segmented controls. 12px for cards and modals. 16px for large feature cards. 9999px for avatar circles only. The generated accordion cards currently have `border-radius: 4px` (visually near-zero) — they need `12px`.

**Icons:** Lucide icons only. No emoji anywhere. Not in the "1 exercise prescribed" label, not in the follow-up chip, not anywhere.

**Animations:** All transitions use `cubic-bezier(0.4, 0, 0.2, 1)`. Hover color changes 150ms. Card lift 200ms. Button press `scale(0.97)` at 150ms. Accordion expand/collapse on `max-height` at 300ms. All animations must respect `prefers-reduced-motion: reduce` by setting duration to `0.01ms`.

**Page background:** `#F7F9FB` always. Cards float on it at `#FFFFFF`. Never use white as a page background.

---

## File 1 — `SessionRecordForm.jsx`

### Page title area

**Current:** `SESSION NOTES` in Inter 900 bold, identical weight and size to the landing page hero. This is wrong — dashboard page titles use 22px Inter 700 Title Case.

**Fix:** Change to `Session Notes` — Inter 700, 22px, `#1C2B3A`. Subtitle stays as-is: Inter 400, 13px, `#6B7C93`, sentence case.

---

### Appointment context bar

**Current:** A plain flat rectangle with no visual separation from the page background. The patient avatar, name, metadata dots, and fee all sit on `#FFFFFF` but the card has no shadow and no defined border. The `EDITING MODE` badge is orange — a custom color that does not exist in the design system. It looks like a browser warning badge.

**Fix the card:** `background: #FFFFFF`, `border-radius: 12px`, shadow Level 1, `padding: 16px 24px`. The card must visually float above the `#F7F9FB` page background via the shadow — no visible border needed.

**Fix the badge:** Replace the orange `EDITING MODE` badge with the correct badge spec. Edit mode = warning state. Use `background: #FEF3E2`, `color: #B45309`, `border-radius: 4px`, Inter 700, 10px, UPPERCASE, `letter-spacing: 0.08em`, `padding: 3px 10px`. The text says `Editing Mode`.

**Fix metadata typography:** Patient name is Inter 600, 15px, `#1C2B3A`. All separator dots and metadata (date, time) are Inter 500, 13px, `#6B7C93`. Fee `₹1000` is Inter 600, 13px, `#0B4F6C` — it should be the primary teal color to signal it's a financial figure, not the same gray as the date.

---

### Accordion section cards

**Current state — every problem catalogued:**

1. The accordion cards have near-zero border radius — looks like old HTML boxes.
2. No shadow — the cards sit flat on the page, indistinguishable from the background.
3. Section header text (`Clinical Assessment`, `Exercise Prescription`, etc.) is Inter 400 — body weight. Section card headers must be Inter 600.
4. The right-side status text (`NO CHANGE`, `1 EXERCISE ADDED`) is teal-colored plain text. This needs to be a proper badge.
5. The chevron icon is plain and has no hover state.
6. Section header has no bottom border separating it from form content — the form fields bleed directly from the header with no visual marker.

**Fix every accordion card:**

Each section card: `background: #FFFFFF`, `border-radius: 12px`, shadow Level 1, `margin-bottom: 16px`, `overflow: hidden`.

Section header row: `padding: 16px 24px`, `background: #FAFBFC`, `border-bottom: 1px solid #EEF2F6` (always visible, not just when expanded), cursor pointer. On hover: `background: #F0F4F7`, transition 150ms.

Section header left: section title Inter 600, 15px, `#1C2B3A`. Not 400, not 500 — 600.

Section header right: the status badge + chevron. The status text must be a proper neutral badge: `background: #F0F4F7`, `color: #6B7C93`, `border-radius: 4px`, Inter 700, 10px, UPPERCASE, `padding: 3px 10px`. When it reflects a meaningful state (e.g. a progress rating is selected), switch it to the relevant semantic badge color. For example if progress rating is `NO CHANGE`, the badge becomes `background: #FEF3E2`, `color: #B45309`. If `RESOLVED`, use `background: #E8F8F5`, `color: #0A7E6E`.

Chevron: Lucide `ChevronDown`, 16px, `#6B7C93`. Rotates 180° when section is open — `transform: rotate(180deg)`, transition `200ms cubic-bezier(0.4,0,0.2,1)`.

Section body padding: `24px` on all sides, `gap: 20px` between fields.

---

### Form inputs and textareas

**Current:** `border: 1px solid` with default browser styling. Incorrect border weight, radius, and focus state.

**Fix every input and textarea in the form:**

Resting state: `border: 1.5px solid #DDE3EA`, `border-radius: 6px`, `padding: 10px 12px`, Inter 400, 14px, `#1C2B3A`. Height 40px for single-line inputs.

Focus state: `border: 2px solid #0B4F6C`, `box-shadow: 0 0 0 3px rgba(11,79,108,0.12)`, `outline: none`.

Error state: `border: 2px solid #C0392B`, `box-shadow: 0 0 0 3px rgba(192,57,43,0.10)`.

All form labels: Inter 600, 12px, `#6B7C93`, Title Case, displayed above the input with `margin-bottom: 8px`. Required asterisk `*` in `#C0392B`.

Error messages below inputs: Inter 500, 11px, `#C0392B`, sentence case, prefixed with the `↑` character.

Character counters: bottom-right inside the textarea, Inter 400, 11px, `#A8B8C8`. When within 20% of the limit, change to `#B45309`.

---

### Progress Rating segmented control

**Current:** One flat bordered rectangle with five segments. The selected segment background uses an inconsistent color (shown as orange/coral for `NO CHANGE` which is wrong — that should be the warning amber since it's a neutral-negative state). The unselected segments have no hover state. The text is UPPERCASE which is correct.

**Fix the entire segmented control:**

Container: `border: 1.5px solid #DDE3EA`, `border-radius: 6px`, height 44px, `overflow: hidden`. No gap between segments — they share borders.

Each segment: `padding: 0 16px`, `cursor: pointer`, `font: Inter 600, 13px`, UPPERCASE, transition `background 150ms, color 150ms`. Unselected state: `background: #FFFFFF`, `color: #6B7C93`. Hover: `background: #F0F4F7`, `color: #3D5166`.

Selected state by value — each value has its own color:
- `WORSE` selected: `background: #C0392B`, `color: #FFFFFF`
- `NO CHANGE` selected: `background: #B45309`, `color: #FFFFFF`
- `SLIGHT IMPROVEMENT` selected: `background: #0B4F6C`, `color: #FFFFFF`
- `SIGNIFICANT IMPROVEMENT` selected: `background: #0A7E6E`, `color: #FFFFFF`
- `RESOLVED` selected: `background: #0A7E6E`, `color: #FFFFFF` — and the Lucide `CheckCircle` icon 14px appears before the text

The divider between segments: `border-right: 1.5px solid #DDE3EA` on each segment except the last.

---

### Pain score inputs

**Current:** Two small number spinners connected by a plain `→` arrow. The delta pill `↓ 3 BETTER` uses a teal border with teal text — this is correct semantically but the border thickness and radius are wrong.

**Fix:**

The two inputs are `width: 80px`, `height: 48px`, `text-align: center`, Inter 700, 18px, `#1C2B3A`, `border: 1.5px solid #DDE3EA`, `border-radius: 6px`. No spinners — use `type="number"` but hide the native spinner arrows via CSS: `input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none }`.

The arrow between them: Lucide `ArrowRight` icon, 16px, `#A8B8C8`.

The delta badge: `border-radius: 4px`, Inter 700, 10px, UPPERCASE, `padding: 3px 10px`, `letter-spacing: 0.08em`. Improved: `background: #E8F8F5`, `color: #0A7E6E`. Worsened: `background: #FDF2F2`, `color: #C0392B`. No change: `background: #F0F4F7`, `color: #6B7C93`. Include the Lucide `TrendingDown` / `TrendingUp` / `Minus` icon 12px before the number.

---

### Exercise Prescription section

**Current problems:** The exercise item card uses `border: 1.5px dashed` in teal. The `+ADD EXERCISE` button also uses dashed teal border. The trash icon is correct but uses raw red without the proper danger color. The four-column input row (Sets, Reps, Frequency, Duration) has inconsistent label styling.

**Fix the exercise item card:** Each exercise row: `background: #FFFFFF`, `border: 1px solid #EEF2F6`, `border-radius: 8px`, `padding: 16px 20px`, `margin-bottom: 8px`. No dashes — solid border only.

The four-column input row: equal column widths using CSS grid `repeat(4, 1fr)`, `gap: 12px`. All inputs follow the standard input spec above.

Trash icon: Lucide `Trash2`, 16px, `#C0392B`. On hover: `background: #FDF2F2` behind a 6px radius container, transition 150ms.

The empty state (no exercises yet): `background: #FAFBFC`, `border: 1px dashed #DDE3EA`, `border-radius: 8px`, `padding: 40px 24px`, `text-align: center`. Lucide `Dumbbell` icon 28px `#DDE3EA` centered. Title: Inter 700, 14px, `#1C2B3A`, Title Case. Description: Inter 400, 12px, `#6B7C93`, sentence case.

`Add Exercise` button: primary button style — `background: #0B4F6C`, `color: #FFFFFF`, `border-radius: 6px`, height 36px, Inter 600, 13px, Title Case. Lucide `Plus` icon 14px on the left. No dashed border — that is not a Theralign button pattern.

---

### Follow-Up interval selector

**Current:** The 8-segment grid (1 Week, 2 Weeks, etc.) uses the same rounded-rect button style as the progress rating — but applies `#0B4F6C` background for selected. This is nearly identical to the progress rating control visually. It needs to be differentiated.

**Fix:** These interval options are pill-shaped selection chips, not a segmented control. Each chip: `border: 1.5px solid #DDE3EA`, `border-radius: 9999px`, `padding: 6px 16px`, Inter 500, 12px, Title Case. Unselected: `background: #FFFFFF`, `color: #6B7C93`. Selected: `background: #E8F4F8`, `border-color: #0B4F6C`, `color: #0B4F6C`. Hover: `background: #F0F4F7`. Transition 150ms. Arrange in a `flex-wrap: wrap`, `gap: 8px` row — not a rigid grid.

---

### Toggle switches

**Current:** The toggles are standard browser-looking toggles. They need to match the rest of the design.

**Fix:** Both `Recommend Follow-Up Session` and `Share With Patient` toggle rows use this layout:

Left side: label Inter 600, 14px, `#1C2B3A` on top, sub-description Inter 400, 12px, `#6B7C93` sentence case below. Right side: the toggle switch. The toggle track: `width: 44px`, `height: 24px`, `border-radius: 9999px`. Off state: `background: #DDE3EA`. On state: `background: #0B4F6C`. Thumb: `width: 20px`, `height: 20px`, `border-radius: 9999px`, `background: #FFFFFF`, positioned with `transform: translateX(0)` when off and `translateX(20px)` when on. Transition `200ms cubic-bezier(0.4,0,0.2,1)`.

The entire toggle row has `padding: 16px 0`, `border-top: 1px solid #F0F4F7`.

---

### Form footer (sticky save bar)

**Current:** `Cancel` and `SAVE SESSION RECORD` sit as two separate plain buttons at the bottom. The save button text is UPPERCASE which violates the button casing rule. The footer has no visual separation from the form content above it.

**Fix:** Footer has `border-top: 1px solid #EEF2F6`, `padding: 20px 40px`, `background: #FFFFFF`. It is sticky-bottom to the page, not the viewport.

`Cancel` button: `background: transparent`, `border: 1.5px solid #DDE3EA`, `color: #1C2B3A`, `border-radius: 6px`, height 40px, Inter 600, 13px. Hover: `border-color: #A8B8C8`, `background: #F7F9FB`.

`Save Session Record` button: `background: #0B4F6C`, `color: #FFFFFF`, `border-radius: 6px`, height 40px, Inter 600, 13px, Title Case. Hover: `background: #083A52`. Active: `transform: scale(0.97)`, 150ms. Loading state: Lucide `Loader2` icon spinning (CSS `@keyframes spin`) replacing the icon, text changes to `Saving…`.

**Important:** The button text is `Save Session Record`, not `SAVE SESSION RECORD`.

---

## File 2 — `PatientCareTimeline.jsx`

### Summary metric cards

**Current:** Three cards in a row. They all have `border: 1px solid` visible borders, no shadow, and the label + value + sub-label stacking is inconsistent across the three. The `LATEST PROGRESS` card shows the badge directly inside the card body with no consistent height between cards.

**Fix all three metric cards:**

Each card: `background: #FFFFFF`, `border-radius: 12px`, shadow Level 1, `padding: 20px 24px`. No visible border — shadow defines the edge. All three cards have identical height — set `min-height: 100px`.

Label row (top): Inter 600, 11px, `#6B7C93`, UPPERCASE, `letter-spacing: 0.08em`. Examples: `TOTAL SESSIONS`, `DOCTORS SEEN`, `LATEST PROGRESS`.

Sub-label below: Inter 400, 11px, `#A8B8C8`, sentence case. Examples: `Completed appointments`, `Unique physiotherapists`, `Last reported condition`.

Value: Inter 800, 28px, `#1C2B3A`. For the `Latest Progress` card, the value is a badge not a number — use the same semantic badge colors defined in the segmented control spec above.

Grid: `display: grid`, `grid-template-columns: repeat(3, 1fr)`, `gap: 20px`.

---

### Filter bar

**Current:** Three plain HTML inputs (`select`, `date`, `date`) sit as bare form elements in a white card. The `FILTER BY DOCTOR`, `FROM DATE`, `TO DATE` labels are in UPPERCASE teal which is correctly styled but the inputs underneath them look like default browser inputs.

**Fix:** The filter card: `background: #FFFFFF`, `border-radius: 12px`, shadow Level 1, `padding: 16px 24px`, `margin-bottom: 24px`.

All inputs inside follow the standard input spec. The doctor filter `select` gets the same height, border, radius, and focus ring as all other inputs.

The `Clear Filters` ghost button (visible only when filters are active): `background: transparent`, `border: 1.5px solid #DDE3EA`, `color: #6B7C93`, `border-radius: 6px`, height 40px, Inter 600, 12px, Title Case. Lucide `X` icon 14px on the left.

---

### Timeline item cards

**Current — exhaustive list of problems:**

1. The left teal zone is correct in concept but the doctor avatar inside it is too large (looks like 64px+), throwing off proportions.
2. The right zone of the card has no breathing room — content starts immediately from the card edge.
3. The `NO CHANGE` badge uses coral/orange — it should use the warning amber.
4. The `PAIN: 5/10 → 2/10` text is raw teal text with no badge or styling structure.
5. The `1 EXERCISE PRESCRIBED` text uses a paperclip emoji — replace with Lucide icon.
6. The follow-up chip has correct concept but incorrect radius (sharp box, needs `border-radius: 8px`) and uses the wrong icon (calendar emoji instead of Lucide `Calendar`).
7. `BOOK NOW →` is teal text — it should be coral `#F4845F` since it's the primary action, the one accent CTA on the card.
8. `COLLAPSE ↑` and `VIEW FULL RECORD →` are raw links in teal with no hover treatment.
9. The expanded section below the card has no visual separation from the summary area.

**Fix the timeline card:**

Overall card: `border-radius: 12px`, shadow Level 1, `overflow: hidden`, `margin-bottom: 16px`. No visible outer border — shadow only.

**Left zone:** `width: 200px`, `flex-shrink: 0`, `background: #0B4F6C`, `border-radius: 12px 0 0 12px`, `padding: 20px`, flex-column, `gap: 8px`, `justify-content: center`.

Doctor avatar: `width: 44px`, `height: 44px`, `border-radius: 9999px`. If `profileImage` exists — render as `<img>`. If not — initials circle: `background: rgba(255,255,255,0.15)`, white Inter 700 18px initials text. Never larger than 44px.

Doctor name: `Dr. Firstname Lastname` — white, Inter 700, 14px, no wrapping (`white-space: nowrap`, `overflow: hidden`, `text-overflow: ellipsis`).

Specialization: Inter 500, 11px, `rgba(255,255,255,0.7)`.

Date: Inter 400, 11px, `rgba(255,255,255,0.55)`, formatted DD/MM/YYYY per ADR-005.

**Right zone:** `flex: 1`, `background: #FFFFFF`, `border-radius: 0 12px 12px 0`, `padding: 20px 24px`, flex-column, `gap: 10px`.

Row 1 — Progress badge + pain scores:
Progress badge: standard badge spec, semantic color matching the rating value. UPPERCASE, Inter 700, 10px.
Pain scores (right-aligned): `Pain: 5/10` Lucide `ArrowRight` icon 12px `2/10` — Inter 500, 12px, `#6B7C93`. The arrow color reflects direction: `#0A7E6E` if improved, `#C0392B` if worsened.

Row 2 — Treatment summary:
`treatmentProvided` text, `-webkit-line-clamp: 2`, Inter 400, 13px, `#3D5166`.

Row 3 — Exercise and medication metadata (only if data exists):
Lucide `Activity` icon 14px `#0B4F6C` + `{count} exercise{s} prescribed` — Inter 500, 12px, `#0B4F6C`.
Lucide `Pill` icon 14px `#6B7C93` + medication names — Inter 400, 12px, `#6B7C93`. Truncate after 2 names with `+{n} more`.

Row 4 — Follow-up chip (only if recommended):
Chip: `border: 1px solid #B3D5E4`, `background: #E8F4F8`, `border-radius: 8px`, `padding: 6px 12px`, `display: inline-flex`, `align-items: center`, `gap: 8px`.
Lucide `Calendar` icon 14px `#0B4F6C` + `Follow-up: {DD/MM/YYYY}` Inter 500, 12px, `#0B4F6C`.
Separator: `·` in `#A8B8C8`.
`Book Now →`: Inter 600, 12px, `#F4845F`. On hover: `#D96840`. This is the one accent CTA on the card — use coral only here.

Bottom action row: `display: flex`, `justify-content: flex-end`, `align-items: center`.
`View Full Record →`: Inter 600, 12px, `#0B4F6C`. On hover: `#083A52`. Lucide `ChevronDown` icon 14px after the text, rotates 180° when expanded.

---

### Expanded record view

**Current:** When the card expands, the additional content appears directly below the summary row with no clear visual separator — it looks like broken card layout rather than an intentional expansion.

**Fix the expansion:** The expanded content sits below a `border-top: 1px solid #F0F4F7`, `padding: 20px 24px`. Background remains `#FFFFFF` — it is part of the same card.

Section labels inside the expansion: Inter 600, 11px, UPPERCASE, `#6B7C93`, `letter-spacing: 0.06em`, `margin-bottom: 4px`.

Content text: Inter 400, 13px, `#1C2B3A`.

**Exercise table inside expansion:**
Table: `width: 100%`, `border-collapse: collapse`, `border-radius: 8px`, `overflow: hidden`.
Header row: `background: #F0F4F7`. Header cells: Inter 600, 11px, UPPERCASE, `#6B7C93`, `padding: 10px 12px`.
Body rows: `border-bottom: 1px solid #F0F4F7`, height 48px. Cells: Inter 400, 13px, `#1C2B3A`, `padding: 12px`.
Hover row: `background: #F7F9FB`.

`Download Exercise Plan` button: `background: transparent`, `border: 1.5px solid #DDE3EA`, `color: #1C2B3A`, `border-radius: 6px`, height 36px, Inter 600, 12px, Title Case. Lucide `Download` icon 14px on the left. Positioned right-aligned above the table.

Record metadata footer (bottom of expansion): `border-top: 1px solid #F0F4F7`, `padding-top: 12px`, `margin-top: 12px`. Inter 400, 11px, `#A8B8C8`. Text: `Signed by Dr. {name} on {DD MMMM YYYY} at {HH:MM}`.

`Collapse ↑` link: Inter 600, 12px, `#6B7C93`. Lucide `ChevronUp` 14px. Positioned right-aligned at the very bottom of the expanded content. On hover: `color: #3D5166`.

---

### Empty state

**Current:** The empty state shows plain centered text with no structured layout.

**Fix:**
Container: `background: #FAFBFC`, `border: 1px dashed #DDE3EA`, `border-radius: 12px`, `padding: 48px 24px`, `text-align: center`.
Icon: Lucide `ClipboardList`, 32px, `#DDE3EA`, `margin-bottom: 16px`.
Title: Inter 700, 18px, `#1C2B3A`, Title Case: `No Care Records Yet`.
Description: Inter 400, 13px, `#6B7C93`, sentence case: `Your session records will appear here after your physiotherapist completes their notes following each appointment.`

---

## Do not change

The backend logic, API calls, state management, routing, localStorage draft logic, notification triggers, and all service/controller/model files. This prompt is purely visual — JSX structure and CSS/Tailwind classes only.

Do not change the `DashboardLayout`, navbar, or sidebar — those are correct.

Do not change any text content, placeholder text, or form labels — only their styling.

Do not introduce any new colors, font sizes, or weights not listed in this prompt.