Looking at your screenshot first — the design system is clearly working. The sidebar, the uppercase navigation, the structural borders, the logout button in red. That's the Swiss system landing correctly.

Now, the patient profile page. This is actually one of the most important trust surfaces in the product that gets underbuilt in most MVPs. A patient's profile is not just personal data storage — it is the information a physiotherapist sees before treating someone. It has clinical weight.

---

## Backend First

**Model additions to the User schema or a separate `PatientProfile` model:**

Go with a separate `PatientProfile` model linked to the User by reference — same architectural decision made for `DoctorProfile`. Keeps the User model clean.

**Fields to include:**

Personal Info — full name (already in User), date of birth, gender, blood group, phone number, profile picture (Cloudinary URL).

Physical Stats — height in cm, weight in kg. These are relevant for physiotherapy assessments. A physio treating a 90kg patient for knee pain has different considerations than a 60kg patient.

Medical History — an array of conditions. Each condition entry: condition name, diagnosed year, and a notes field. Keep it as a flexible array, not a rigid enum. Patients know their conditions, you should not force them to match a dropdown.

Current Medications — array of strings. Simple. Name of medication only. Not doses — this is not a clinical system, it is context for the physiotherapist.

Allergies — array of strings. Same simple approach.

Past Surgeries — array of objects: surgery name, year, and brief description. Highly relevant for physiotherapy — a patient with a prior knee replacement needs different treatment.

Emergency Contacts — array of objects: name, relationship, phone number. Maximum two contacts. Each contact: name in uppercase label, relationship as a string, phone as a string.

Lifestyle Info — occupation (relevant for postural issues), activity level as an enum (sedentary, light, moderate, active, very active), smoking status boolean, alcohol consumption boolean. These are standard physiotherapy intake form fields.

Insurance — insurance provider name, policy number, both optional strings. Not validated or integrated — just stored for reference.

Profile completion percentage — computed virtual, not stored. Calculated based on how many of the major sections are filled.

**API Endpoints:**

```
GET  /api/patients/profile/me       → fetch own profile
POST /api/patients/profile          → create profile (first time)
PUT  /api/patients/profile/me       → update profile
POST /api/patients/profile/avatar   → upload profile picture via Cloudinary
```

All four routes: `requireAuth + requireRole('patient')`.

The `PUT` endpoint accepts partial updates — patient updates one section at a time, not the whole form at once. Use `$set` in Mongoose so untouched sections are never cleared.

**Validation rules:**
- Date of birth: must be in the past, patient must be at least 5 years old
- Phone: 10 digits, Indian format
- Height: 50–250 cm
- Weight: 10–300 kg
- Emergency contact phone: 10 digits
- Blood group: enum — A+, A−, B+, B−, AB+, AB−, O+, O−

---

## Frontend Structure

**Page Layout:**

Two-column layout. Left column `280px` — the profile card. Right column — the tabbed content area. This mirrors the discovery page's filter-plus-results layout and is consistent with the overall two-panel pattern in the product.

**Left Column — Profile Card:**

Profile picture: a `120px` bordered square (not a circle — same rule as the doctor profile edit). Below it: an upload button in ghost variant. Below that: the patient's full name in bold uppercase at `ui-xl`. Below that: `PATIENT PORTAL` in the teal badge — the one consistent label for the patient role. Below that: member since date in small gray uppercase.

A profile completion bar fills the bottom of the left card. Gray-100 track, solid black fill rectangle. Percentage label above in small uppercase gray. This creates a persistent incentive to complete the profile without using gamification language.

**Right Column — Tabbed Sections:**

Five tabs as bordered segmented control at the top of the right column. Not pill tabs, not underline tabs — bordered rectangles, active state is black fill white text, inactive is white fill black text. Exactly the segmented control pattern from the design system.

The five tabs:

**`BASIC INFO`** — Full name (pre-filled from User model, editable here), date of birth, gender, blood group, phone. A single save button at the bottom of the section, primary black variant.

**`MEDICAL HISTORY`** — This tab has the most complexity. Three sub-sections stacked vertically, each with its own section header in small red uppercase:

`CONDITIONS` — an add-form inline at the top: condition name input, year input, notes textarea, `ADD CONDITION →` ghost button. Below: the existing conditions as bordered rows. Each row: condition name in bold uppercase, year in small gray, notes in small mixed-case italic, and a `REMOVE` red text link on the far right. No confirmation modal for remove — conditions list is low-stakes, instant removal is fine.

`MEDICATIONS` — same pattern but simpler: a single text input and `ADD →` button. Medications list as bordered rows with remove links.

`PAST SURGERIES` — same pattern as conditions: name, year, brief description, add form at top, bordered rows below.

**`LIFESTYLE`** — occupation input, activity level as a segmented bordered control (five options: `SEDENTARY` / `LIGHT` / `MODERATE` / `ACTIVE` / `VERY ACTIVE`), smoking and alcohol as two toggle bordered buttons (`YES` / `NO` for each). Save button at bottom.

**`EMERGENCY CONTACTS`** — maximum two contacts. Each contact is a bordered card. Inside: three inputs in a horizontal row — name, relationship, phone — and a `REMOVE` red text link at the far right. A `+ ADD EMERGENCY CONTACT →` ghost button below the last card. The button disappears when two contacts exist. Save button at bottom.

**`INSURANCE`** — the simplest tab. Two inputs: insurance provider, policy number. A note in small gray below: `This information is shared with your physiotherapist before your appointment.` Save button at bottom.

**Editing Pattern:**

Each tab has its own independent save button. Do not use a single global save for the whole profile — a patient updating their emergency contact should not accidentally overwrite unsaved changes in the medical history tab. Section-level saves are safer and feel more deliberate.

When a save is in flight: the button label changes to `SAVING...` with the rectangular spinner. On success: a teal bordered inline confirmation replaces the button briefly — `✓ SAVED` in teal uppercase for `2000ms`, then the button returns. This inline confirmation is the correct pattern — the same teal confirmation language used for appointment confirmations and waitlist confirmations.

On error: the button turns red-bordered with `SAVE FAILED — TRY AGAIN` in red uppercase. This is the error signal, consistent with the system.

**What the Page Must Feel Like:**

A physiotherapy intake form that has been designed rather than assembled. Dense enough to collect meaningful clinical context. Structured enough that a physiotherapist reading the exported profile before a session understands the patient completely. Clean enough that a patient filling it in does not feel overwhelmed.

The page should feel like checking into a private clinic — thorough, professional, and respectful of the fact that the information being collected matters.

Looking at your screenshot — the sidebar shell is solid, the structure is working. Now the frontend for the patient profile page.

---

## Page Layout

Two-column layout sitting inside the existing patient dashboard shell. The left column is `280px` fixed width with a `2px` right border separating it from the right content area. The right column takes all remaining width. No card wrappers, no shadows — edges defined by borders only, consistent with the rest of the dashboard.

---

## Left Column — Profile Identity Card

At the top: the profile picture. A `120px` bordered square, centered in the column. Not a circle — the bordered square is consistent with the doctor profile edit treatment established in Phase 4. If no picture is uploaded, the square shows the patient's initials in `display-sm` bold black on a `swiss-gray-100` background. A small `UPLOAD PHOTO →` ghost button sits directly below the square. Clicking it triggers the hidden file input. After selection, the image previews immediately inside the square before the upload API call is made — the patient sees the result before committing.

Below the photo section, separated by a thin horizontal rule:

Patient name in `ui-xl` bold uppercase. Below it: the `PATIENT PORTAL` teal badge — the role identifier consistent with the system. Below that: `MEMBER SINCE` in `ui-xs` uppercase gray followed by the formatted join date.

Below another thin rule: the profile completion section. Label `PROFILE COMPLETE` in `ui-xs` uppercase gray. The percentage in `display-xs` bold black directly below. Below that: the progress bar — a full-width gray-100 track, solid black fill rectangle, no rounded ends, no gradient. The percentage dictates the fill width. No animation on the bar — it is data, not a performance.

Below the bar: a small note in `ui-xs` gray mixed-case — `Complete your profile so physiotherapists can prepare for your session.` This sentence has a job: it explains why completion matters without pressuring. It is the only explanatory copy on this page.

At the very bottom of the left column, flush with the bottom border, matching the sidebar pattern: nothing additional. The left column ends after the completion section. It is not a navigation surface — it is an identity surface.

---

## Right Column — Tabbed Content Area

**Tab Bar:**

Five tabs rendered as a bordered segmented control spanning the full width of the right column. The control sits at the very top of the right column with `32px` padding above it.

The five tabs: `BASIC INFO` · `MEDICAL HISTORY` · `LIFESTYLE` · `EMERGENCY CONTACTS` · `INSURANCE`

Each tab is a bordered rectangle. Active state: black fill, white uppercase text. Inactive state: white fill, black uppercase text. Clicking a tab switches the content below instantly — no loading, no transition animation. The content area below the tab bar stays the same height regardless of which tab is active — if a tab's content is shorter, the remaining space is white. If longer, the right column scrolls.

A `4px` black horizontal rule sits immediately below the tab bar, separating it from the tab content. This is the same section-rule weight used throughout the product. The tab bar and the rule together form the page's internal header — the tab bar is navigation, the rule is structure.

---

## Tab 1 — `BASIC INFO`

Section opens with a `2×2` grid of input fields. Each input uses the Input primitive from Phase 1 — label above in uppercase, rectangular bordered field, focus thickens to `4px`.

Row 1: `FULL NAME` on the left, `DATE OF BIRTH` on the right.
Row 2: `PHONE NUMBER` on the left, `GENDER` on the right.

Below the `2×2` grid: a `2×1` row. `BLOOD GROUP` as a segmented bordered control spanning half the width — eight options: `A+` `A−` `B+` `B−` `AB+` `AB−` `O+` `O−`. Each option is a bordered rectangle. Active: black fill white text. Inactive: white fill black text. This is more efficient than a dropdown for eight fixed options — all choices visible simultaneously, one click to select.

Below the blood group control: a `32px` top-bordered area containing the save button. The border creates the section footer — same treatment as the profile save button in the doctor profile edit page. `SAVE BASIC INFO →` in the primary black button variant, left-aligned. Not centered. Left-aligned is consistent with the Swiss system's flush-left principle.

Save state behavior: button label → `SAVING...` with rectangular spinner → on success, button is replaced for `2000ms` by a teal bordered inline row reading `✓ BASIC INFO SAVED` in small teal uppercase → button returns. On error: button border turns red, label reads `SAVE FAILED — TRY AGAIN` in red uppercase.

---

## Tab 2 — `MEDICAL HISTORY`

Three sub-sections stacked vertically. Each sub-section has its own internal section header in small red uppercase — the `swiss-section-number` utility class — followed by a `2px` horizontal rule. The red label and rule together identify the sub-section without using a full `SectionHeader` component, keeping the visual weight appropriate for a sub-section rather than a page-level section.

**`CONDITIONS`**

Add form at the top. A horizontal row of three inputs: `CONDITION NAME` taking `50%` width, `YEAR DIAGNOSED` taking `20%` width, `NOTES` taking the remaining `30%`. All inline, all bordered. An `ADD CONDITION →` ghost button flush right below the row.

Why inline form rather than a modal? The patient is building a list — they may add three or four conditions. Opening a modal for each addition creates excessive friction. Inline forms for list-building are faster and keep context visible.

Below the add form, after a thin rule: the conditions list. Each condition is a single bordered row, `64px` tall. Inside: condition name in `ui-md` bold uppercase taking `50%`, year in `ui-sm` gray taking `15%`, notes in `ui-sm` italic gray taking `30%`, and `REMOVE` in `ui-xs` red uppercase as a text link taking the remaining `5%`. The row does not expand — if notes are long they truncate with `...`. A hover tooltip shows the full notes text. No hover state on the row itself — it is data, not an action.

Empty state for conditions: `EmptyState` component with `00.` in red, title `NO CONDITIONS ADDED`, description `Add any existing conditions so your physiotherapist can prepare.` No action button — the add form above the list is the action.

**`MEDICATIONS`**

Simpler. A single full-width text input with `MEDICATION NAME` label and an `ADD →` ghost button to its right. Below: medications as bordered rows. Each row: medication name in `ui-md` uppercase taking full width minus the remove link, `REMOVE` red text link on the right. Row height `48px`. Clean and fast.

**`PAST SURGERIES`**

Same structure as conditions — three-input inline form: `SURGERY NAME`, `YEAR`, `BRIEF DESCRIPTION`. List below as bordered rows. Row height `64px`. Same remove pattern.

At the very bottom of this tab after all three sub-sections: a single `SAVE MEDICAL HISTORY →` primary black button. One save for the whole tab — medical history is edited as a whole, the patient reviews all three sub-sections before confirming.

---

## Tab 3 — `LIFESTYLE`

A cleaner, less dense tab. Four sections.

`OCCUPATION` — a single full-width text input. Label: `CURRENT OCCUPATION`. This field exists because physiotherapy treatment for a desk worker differs from treatment for a construction worker. The physiotherapist needs this context.

`ACTIVITY LEVEL` — a five-option segmented bordered control spanning full width. The five options: `SEDENTARY` · `LIGHT` · `MODERATE` · `ACTIVE` · `VERY ACTIVE`. One active at a time. Black fill for active. This is the widest segmented control in the product — five options across full column width means each option is narrow. Keep the label text at `ui-xs` to fit comfortably.

`SMOKING` and `ALCOHOL` — two rows, each a `6:6` split. Left `6`: the field label in `ui-md` bold uppercase. Right `6`: a two-option segmented control — `YES` · `NO`. Simple, direct, no judgment in the design.

`SAVE LIFESTYLE →` primary black button at the bottom, same treatment as the other tabs.

---

## Tab 4 — `EMERGENCY CONTACTS`

This tab's content is a small set of bordered cards — maximum two, minimum zero.

Each contact card is a bordered rectangle with `32px` padding. A `4px` top border in black — the heavier top border distinguishes it as a card of primary importance, same as the onboarding card and verification banner treatment. Inside the card:

A card header row: `EMERGENCY CONTACT` in small red uppercase on the left, `REMOVE` in small red uppercase as a text link on the right. A thin horizontal rule below the header.

Below the rule: three inputs in a horizontal row. `CONTACT NAME` taking `40%`, `RELATIONSHIP` taking `25%`, `PHONE NUMBER` taking `35%`. All bordered rectangles, labels above.

Between the two contact cards: `24px` of vertical space. No visual separator — the cards are self-contained.

When zero contacts exist: the `EmptyState` component with title `NO EMERGENCY CONTACTS` and description `Add a contact who can be reached in case of an emergency during your session.` No action button — a prominent `+ ADD EMERGENCY CONTACT →` ghost button sits below the empty state.

When one contact exists: the second slot shows as a dashed-border rectangle with `+ ADD SECOND CONTACT →` centered inside it in small uppercase gray. The dashed border signals an available slot. This is a deliberate affordance — the patient can see there is room for one more contact without reading any instruction.

When two contacts exist: the dashed slot disappears. The `+ ADD` button disappears. Maximum is communicated through absence.

`SAVE EMERGENCY CONTACTS →` primary black button at the bottom.

---

## Tab 5 — `INSURANCE`

The simplest tab. Two inputs stacked vertically, each full width.

`INSURANCE PROVIDER` — text input.
`POLICY NUMBER` — text input.

Below both inputs: a bordered information row — gray-100 background, `2px` black border, `16px` padding. Inside: a small information icon (Lucide `Info`, stroke-width 1.5) in a bordered square on the left, and the note text on the right: `This information is shared with your physiotherapist before your appointment. It is never shared publicly.` in `ui-sm` mixed-case gray.

This note is not a legal disclaimer. It is a trust signal. Patients hesitate to enter insurance information without understanding who sees it. One sentence removes that hesitation.

`SAVE INSURANCE →` primary black button at the bottom.

---

## Shared Behaviors Across All Tabs

**Unsaved changes detection.** When a patient modifies any field without saving and clicks a different tab, a confirmation appears inline below the tab bar — not a browser dialog, not a modal. A `2px` amber-bordered row spanning full width: `UNSAVED CHANGES IN [TAB NAME] — ` followed by two text links: `SAVE NOW` in black and `DISCARD` in red. This amber row communicates attention-required without blocking. The patient can choose. The amber border is consistent — amber means attention needed throughout the product.

**Field-level validation.** Validation runs on blur — when the patient leaves a field, not on every keystroke. Showing errors while typing is aggressive. On blur, an invalid field immediately shows the red border and the `ERROR: [message]` below it. Valid fields on blur show nothing — no green checkmark, no confirmation. Green checkmarks are positive reinforcement patterns that belong in onboarding flows, not in a clinical profile form.

**Profile completion recalculation.** After every successful save, the completion percentage in the left column updates without a page reload. The progress bar fill rectangle animates over `200ms` — the only animation in the entire page, and it is structural rather than decorative. The patient sees their completion score go up immediately after saving.

**Avatar upload flow.** File input is hidden. The bordered square and the `UPLOAD PHOTO →` button both trigger it. On file selection: immediate preview inside the bordered square with a `UPLOADING...` text below the square in small uppercase gray. On success: the preview becomes permanent, the `UPLOADING...` text disappears. On failure: the preview reverts to the initials placeholder, a red bordered row appears below the square: `ERROR: UPLOAD FAILED. TRY AGAIN.`

---

## What This Page Must Feel Like

A patient completing this profile should feel like they are filling in a thoughtful intake form at a private clinic — one that was designed by people who understand what a physiotherapist actually needs to know before treating someone. Not a generic "complete your profile" checklist. Not a data harvesting form. A clinical intake form that happens to have excellent design.

When complete, looking at the left column, the patient should see `100% PROFILE COMPLETE` and the full progress bar in black, and feel that they have done something meaningful — not just filled in form fields.