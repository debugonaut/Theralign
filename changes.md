Full document absorbed. I know exactly what this is doing — it is a calibrated temperature shift from Swiss clinical to professional warm SaaS — and I know precisely where to extend it. Here is the appended prompt in full.

---

# PhysioConnect — Humanization Prompt Extension
## The Professional DNA Layer: What the Base Prompt Leaves Incomplete

---

## Context for This Extension

The base humanization prompt does the essential work: it softens the body background, introduces surgical border-radius, warms the color palette, and shifts the product from a Swiss design exercise to a functioning healthcare marketplace. That work is correct and must be done first.

But there are gaps. After applying the base prompt, the product will feel warmer — but it will not yet feel alive. The structural confidence will be there. The approachability will be improved. What will still be missing is the layer that makes professional SaaS products feel effortless to use: the micro-detail layer that communicates care without announcing itself. The shadow hierarchy that creates genuine depth. The state communication that removes anxiety at every interaction point. The empty state personality that makes a blank page feel considered rather than forgotten.

This extension addresses each of those gaps directly. Apply it after the base prompt changes are complete and verified.

---

## Extension 1 — The Shadow System (Replacing the Border-Only Elevation Model)

The base prompt retains the Swiss principle of no drop shadows. This was correct for the Swiss phase. It must be partially revised in the humanized phase because border-only elevation flattens the visual hierarchy on pages with multiple layers of information.

The new shadow system has exactly three levels. No more. Using more than three levels of elevation in a single product creates a floating, disconnected UI. Three is the correct ceiling.

**Level 0 — No elevation.** Used for: page backgrounds, sidebar, navbar, table rows, the filter panel. These surfaces are the floor — nothing sits beneath them, they do not need to suggest depth.

**Level 1 — Resting elevation.** A shadow so subtle it is felt rather than seen. Used for: all cards in their default, non-hovered state — doctor cards, metric cards, appointment cards, review cards, booking panel, onboarding checklist cards. The shadow is: `0px 1px 3px rgba(11, 79, 108, 0.06), 0px 1px 2px rgba(11, 79, 108, 0.04)`. The shadow color uses the primary teal-navy color rather than black — colored shadows read as intentional brand depth rather than generic drop shadows. At this opacity they are invisible in screenshots but felt in the rendered product.

**Level 2 — Lifted elevation.** Used for: cards on hover, the sticky booking panel on the doctor profile page, dropdowns, the notification bell dropdown. The shadow is: `0px 4px 16px rgba(11, 79, 108, 0.10), 0px 2px 6px rgba(11, 79, 108, 0.07)`. This is the elevation change that communicates hover — not the border-weight increase or the background color change alone, but in addition to those. The patient experiences the card lifting toward them. The shadow is the physical metaphor for that lift.

**Level 3 — Modal elevation.** Used exclusively for modals. `0px 20px 60px rgba(11, 79, 108, 0.18), 0px 8px 24px rgba(11, 79, 108, 0.12)`. This shadow is the most visible in the system and that is correct — a modal sits above everything else and its shadow must communicate that unambiguously. The overlay beneath the modal stays as specified in the base prompt. The shadow supplements the overlay.

**Implementation note:** These shadows must be added as named tokens in `tailwind.config.js` — `shadow-level-1`, `shadow-level-2`, `shadow-level-3`. They are never written inline. Anywhere `shadow-none` currently appears on a card component, it is replaced with `shadow-level-1`. Anywhere a card hover state currently increases border-weight, the border increase stays and `shadow-level-2` is added. The two signals — border weight and shadow — work together.

**Why colored shadows:** A `rgba(0,0,0,0.1)` shadow is gray. It reads as a generic effect applied without thought. A `rgba(11,79,108,0.08)` shadow is teal-navy. It reads as a considered extension of the brand's color into its depth layer. The difference is invisible when described and immediately felt when seen. Every product that feels cohesive rather than assembled uses colored shadows.

---

## Extension 2 — The Focus State System (Completing the Anxiety Reduction)

The base prompt changes focus states from the sharp `4px` black border increase to a `2px` primary-colored border with a soft ring. This is correct. But it leaves unaddressed the question of what happens in the moments surrounding focus — before the patient has clicked, and after they have successfully completed a field.

**Pre-focus: placeholder text behavior.** The base prompt does not address placeholder text. Currently, placeholder text is uppercase and tracked — a Swiss system holdover. In the humanized system, placeholder text must become mixed-case and slightly more conversational within the context of what is being asked. `E.G. SPORTS PHYSIOTHERAPY` becomes `e.g. Sports Physiotherapy`. `DESCRIBE YOUR SYMPTOMS` becomes `Describe your symptoms — our AI will suggest the right specialist`. The placeholder is not an instruction shouted at the patient; it is a whispered suggestion. The casing change makes this true.

**Post-focus: success indication.** After a patient successfully completes a form field and moves to the next — on `blur` with a valid value — the input border transitions to a `1px` teal border at `rgba(10, 126, 110, 0.6)` opacity. Not bold. Not animated. Just a quiet confirmation that this field is done and correct. This is the single most anxiety-reducing micro-interaction available in a form context. A patient filling out a health-related form who receives quiet teal confirmation on each completed field is a patient who feels progressively safer as they progress. The absence of this confirmation — leaving every completed field looking identical to empty fields — creates uncertainty about whether entries have registered.

**Error state completeness.** The base prompt specifies that errors use the danger color `#C0392B` and appear below the field. This must be extended: the error message must be preceded by a specific symbol — `↑ ` — not an icon in a bordered square, but a simple upward-pointing character that directs the patient's eye back to the field above it. `↑ Please enter a valid date` is more helpful than `Please enter a valid date` because the arrow is a physical pointer. At small type sizes, icon-in-bordered-square is visually noisy. A character is cleaner, faster to render, and more accessible.

**Disabled fields.** The base prompt does not address disabled fields — fields that exist but cannot be edited, such as the email field on the doctor profile page or the consultation fee display in the booking modal. Disabled fields must be visually distinct without feeling broken. The specification: `background-color #F7F9FB`, `border-color #DDE3EA`, `text-color #6B7C93`, `cursor: default`. No strikethrough, no reduced opacity on the text — the content is still information the patient needs to read. Only the background and border signal non-editability.

---

## Extension 3 — The Loading State Philosophy (From Mechanical to Considered)

The base prompt specifies skeleton loading states as gray rectangles with opacity pulse animation. This is correct for the skeleton component itself. What is missing is the system-level philosophy of when and how loading states appear throughout the product.

**Skeleton duration gating.** Skeleton states must not appear for API calls that resolve in under `300ms`. Showing a skeleton that flickers in and immediately out is more disorienting than showing nothing at all — the patient sees a flash of gray rectangles and questions what happened. The implementation: skeleton components only render after a `300ms` delay from the start of the API call. If the call resolves before `300ms`, the skeleton never appears and the content renders directly. This is the standard adopted by Linear, Stripe, and every polished SaaS product. It is a `setTimeout` of `300ms` before the skeleton's `display` property becomes active.

**Staggered content appearance.** When data loads and replaces skeletons, individual cards do not all appear simultaneously. They appear in sequence with a `60ms` stagger per item. The first card appears at `0ms`, the second at `60ms`, the third at `120ms`. This stagger is so brief that it does not feel like animation — it feels like content naturally populating. The alternative — all cards appearing simultaneously — creates a jarring flash of content that feels mechanical rather than lived-in. The stagger is not a scroll animation. It is a render sequence. It fires once, on initial load, and never again unless the component fully remounts.

**Inline loading for actions.** When a patient clicks `CONFIRM & PAY`, the button must not only show a spinner. It must also communicate what is happening: the button label changes to `PROCESSING PAYMENT...` during the Razorpay order creation and `CONFIRMING BOOKING...` during the verification step. Two distinct loading messages for two distinct backend operations. The patient is not staring at a spinner while an opaque process runs — they are reading a live status. This is the difference between a payment flow that creates confidence and one that creates anxiety.

**Partial loading states.** On the doctor profile page, the left column (doctor information) and the right column (booking panel with slots) load independently. The left column data comes from the doctor API. The right column data comes from the availability API. Currently, a skeleton covers the entire page until both are ready. The humanized approach: render the left column as soon as the doctor API resolves, then render the right column's skeleton while the availability API is still pending. The patient can start reading about the doctor while the slots load. This is perceived as significantly faster even when the actual load time is identical, because the patient is already engaged with content.

---

## Extension 4 — The Empty State Voice (Adding Personality Without Losing Authority)

The base prompt specifies EmptyState components using the `00.` prefix, large uppercase title, and a single sentence description. The structure is correct. The voice is not yet complete.

Empty states in a healthcare product have two distinct registers depending on context:

**Action-oriented empty states** — where the patient or doctor can take a step to populate the page. These exist on: the doctor's availability management page (no slots yet), the patient's appointment history (no bookings yet), the doctor's earnings page (no completed appointments), the review submission form (no completed unreviewed appointments). These empty states must be both reassuring and directional. The description sentence is written in a way that acknowledges where the patient is and points them forward: not `No appointments found` but `You haven't booked an appointment yet. When you do, they'll all appear here.` Not `No earnings yet` but `Completed appointments will generate earnings. Your first session will appear here.` The sentences are mixed-case, first-person, and gentle. They do not shout. They speak.

**Informational empty states** — where the content genuinely does not exist yet and there is nothing the viewer can do to change that. These exist on: the doctor's reviews page for a new doctor (no reviews received), the patient's reviews page if they have not left any reviews, the admin's analytics charts for a newly launched platform. These empty states do not direct the user to take an action because there is no action available. The description sentence acknowledges this without sounding like a system error: not `No reviews available` but `Reviews from patients will appear here after your first completed appointments.` Not `No data to display` but `Analytics will populate as the platform receives its first bookings.`

The distinction between these two registers must be built into the EmptyState component as an optional `context` prop: `context="actionable"` or `context="informational"`. Actionable states include the action button. Informational states do not. The description text is written into the consuming component rather than the EmptyState primitive — the primitive provides structure, the consuming page provides voice.

---

## Extension 5 — The Transition Continuity System (Preventing Visual Whiplash)

The base prompt updates hover states and focus states individually. What is missing is the relationship between those states over time — the transitions that connect default → hover → active → disabled as a continuous experience rather than a series of discrete jumps.

**The transition inheritance rule.** Every interactive element in the product must have exactly one transition declaration that covers all transitioning properties simultaneously. The pattern is: `transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease, box-shadow 200ms ease`. The shadow transition is `200ms` — slightly longer than the color transitions — because shadows require a subtle additional moment to feel physical rather than electronic. All four properties share a single `transition` declaration rather than individual declarations per property. Cascaded individual declarations are fragile — adding a new interactive state that changes `transform` will not have a transition unless it is added to every element's declaration. A single comprehensive declaration is robust.

**The active state (press)** — missing entirely from the base prompt. When a patient clicks a button, there must be a `scale(0.97)` transform at `80ms` that resolves back to `scale(1.0)` by `200ms`. This is the physical press metaphor — the button yields slightly under the patient's click, confirming that input was registered. The scale change is small enough that it never looks like an animation. It is felt as tactile response. Without it, click events on buttons feel electronic and uncertain. With it, every button click feels confirmed. This is especially important on the `CONFIRM & PAY` button — the highest-stakes click in the product.

**Page transition.** Currently, navigating between pages is an instant swap — one content area is replaced by another with no visual continuity. This is correct for the application shell (the sidebar and navbar never change). But the main content area should fade in on route change: `opacity: 0` to `opacity: 1` over `200ms` ease. This is the one entrance animation that is justified — it eliminates the visual jarring of content snapping into place and replaces it with a content arrival that feels natural. This is not a scroll animation, not a slide, not a spring. A `200ms` opacity fade on the main content wrapper on each route change. Nothing else.

---

## Extension 6 — The Typography Micro-Refinements (Completing the Casing Calibration)

The base prompt changes navigation item casing from uppercase to title case. This is correct. There are additional casing and typography decisions it does not address that must be made explicitly to prevent inconsistency.

**Doctor names throughout the product.** Doctor names currently appear in uppercase — `DR. PRIYA SHARMA` — across cards, profile pages, appointment rows, and booking modals. In the humanized system, doctor names must be in title case: `Dr. Priya Sharma`. Names are personal identifiers — they belong to people. Rendering a person's name in uppercase is a signage convention, not a personal address. The distinction matters in healthcare: a patient seeing `Dr. Priya Sharma` on a card responds to a person. A patient seeing `DR. PRIYA SHARMA` responds to a label.

**Patient names in doctor-facing views.** Consistent with doctor names — patient names in appointment rows, expanded table rows, and the doctor's today-schedule view are rendered in title case. `Rahul Mehta`, not `RAHUL MEHTA`.

**The rule for what remains uppercase.** To prevent confusion about when uppercase is correct, the definitive rule is as follows. Uppercase is used for: section number prefixes (`01.`), page-level section header titles on marketing surfaces (`AREAS OF CARE`, `HOW IT WORKS`), table column headers, badge text, button labels, metadata labels in definition-list layouts (`CONSULTATION FEE`, `DATE`, `TIME`). Everything else — navigation items, dashboard sub-section headers, names, body text, descriptions, placeholder text, error messages, notification text, empty state descriptions — is title case or mixed-case respectively. The uppercase layer is the structural layer. The title-case and mixed-case layers are the human layer. Both must be present.

**Number formatting.** Financial numbers throughout the product must use Indian number formatting: `₹1,25,000` not `₹125,000`. The Indian comma convention is `[n],XX,XXX` for values above one lakh. A 40-year-old patient from Mumbai reading `₹1,25,000` reads a familiar number. Reading `₹125,000` — the international format — introduces a fraction of processing friction that is unnecessary. This applies everywhere a `₹` amount appears: metric cards, appointment rows, booking panels, earnings tables, payment history. The JavaScript `Intl.NumberFormat` with `locale: 'en-IN'` handles this automatically.

---

## Extension 7 — The Notification System Visual Completion

The base humanization prompt does not address the notification bell and notification center — it was written before that feature's visual specification was finalized. The notification system needs its humanized treatment documented explicitly.

**The bell icon.** The bell icon sits in the navbar at `24px`. Its unread badge is currently specified as a small red-bordered rectangle — the Swiss geometric convention. In the humanized system, the badge is a small circle (`12px` diameter, full border-radius) with the primary color fill `#0B4F6C` and white text. This is the one instance where a non-rectangular element is correct for a notification count — circular notification badges are so universally understood as count indicators that using a rectangle creates confusion, not consistency. The badge uses Inter 700 at `9px` — the minimum legible size. For counts above 9: `9+` rather than the two-digit number.

**Notification row visual hierarchy.** Each notification in the dropdown has three distinct information layers. Layer one: the notification category in the accent coral color `#F4845F` at `ui-xs` uppercase tracked — `BOOKING`, `PAYMENT`, `REVIEW`, `VERIFICATION`. This category label is the fastest reading the patient does — it tells them what kind of notification this is before they read a word of content. Layer two: the notification title in `ui-sm` bold, dark navy `#1C2B3A` — the sentence that summarizes the event. Layer three: the relative timestamp in `ui-xs` regular, neutral gray — `2 hours ago`, `Yesterday`. These three layers are consistently spaced: `4px` between category and title, `6px` between title and timestamp. No rule or border between them — the spacing is the separator.

**Unread vs read states.** Unread notifications have a `3px` left border in the accent coral color. This is a change from the base specification's `2px` black left border — coral communicates new activity, black communicates structure. The coral left border is a warm attention signal, not a structural divider. Read notifications have no left border. The visual difference between unread and read is the presence or absence of the coral stripe — clear, immediate, and not reliant on background color changes.

**Mark all read behavior.** A `Mark all read` text link sits in the header row of the notification dropdown, right-aligned, in `ui-xs` primary color. Clicking it removes all coral left borders simultaneously at `200ms` opacity fade — not an instant state change, a fade that communicates the reading action visually. The patient sees the notification list transition from active (coral borders) to read (no borders) as a single smooth event.

---

## Extension 8 — The Verification Flow Micro-Experience (Trust at the Most Critical Moment)

The humanization prompt does not address the doctor verification submission flow as a discrete experience. This is the moment of highest stakes for doctor acquisition — a physiotherapist who has filled out their profile and is uploading documents for verification is the most qualified doctor lead the platform has. The experience at this moment directly determines whether they complete the process or abandon it.

**Document upload states.** Currently, document upload areas likely exist as basic file inputs. In the humanized system each document upload area is a full bordered card with four distinct states: empty, uploading, uploaded, and error.

Empty state: a dashed `2px` border in `#DDE3EA`, a small upload icon in a bordered square centered in the card, and below it `Click to upload or drag and drop` in `ui-sm` mixed-case gray. The dashed border communicates invitation rather than requirement. The card is `160px` tall — tall enough to feel intentional as a target, not a thin input bar.

Uploading state: the dashed border becomes a solid `2px` primary border. A linear progress bar appears at the bottom of the card — a `4px` tall rectangle that fills left to right in the primary color. The file name appears in `ui-sm` bold inside the card. No percentage number — the progress bar is sufficient. Numbers during upload create anxiety rather than reducing it.

Uploaded state: the border becomes a solid `2px` teal. Inside the card: a small teal checkmark in a teal-bordered square, the file name in `ui-sm` bold, the file size in `ui-xs` gray. An `×` to remove sits in the top-right corner in small gray — it shifts to the danger color `#C0392B` on hover, communicating that removal is destructive.

Error state: the border becomes `2px` danger color. Inside: the file name with an error indicator, and below it the specific error in `ui-xs` danger color: `File too large (max 5MB)` or `Invalid format (PDF or JPG only)`.

**Verification status page.** After documents are submitted, the doctor sees a status page (or section on their dashboard) that communicates where they are in the review process. This is not a progress bar — it is a timeline. Four nodes connected by a vertical line: `SUBMITTED`, `UNDER REVIEW`, `APPROVED`, `ACTIVE`. The current active node has a filled primary-color circle. Completed nodes have filled teal circles. Future nodes have empty gray circles. The connecting line between completed and current nodes is solid teal. The connecting line between current and future nodes is dashed gray.

This timeline communicates: this is a process with defined stages, you are at a known point within it, the next stage is clearly visible. A physiotherapist looking at this timeline who is at `UNDER REVIEW` knows exactly what has happened and what comes next. They do not need to email support to ask where their application is. The timeline answers that question before it is asked. That transparency is what keeps doctors from abandoning during the verification wait period.

---

## Extension 9 — The Booking Panel Trust Architecture

The booking panel on the doctor profile page is the highest-conversion surface in the patient experience. The base humanization prompt does not explicitly address the emotional design of this panel — how it builds trust incrementally as the patient moves through the selection flow.

The booking panel must be designed as a four-stage trust sequence. Each stage adds a new piece of information that makes the commitment feel safer.

**Stage 1: Default (no date selected).** The panel shows: the consultation fee prominently, the availability heatmap, and the disabled `SELECT A TIME SLOT` button. At this stage the patient is evaluating — they are not committed. The panel communicates: here is what this costs and here is when it is possible. No pressure. No urgency. The fee is visible immediately because hiding it until later creates the most common drop-off point in any booking flow: the patient proceeds through selection only to discover a price they were not expecting. Front-loading the fee is a trust decision, not a design preference.

**Stage 2: Date selected.** The heatmap selection is confirmed with a visual treatment on the selected cell — the cell gains the shadow-level-1 treatment and a `2px` teal border. Not black — teal, communicating that a positive selection has been made. Below the heatmap: the date appears as a sub-label in `ui-sm` bold primary color: `Tuesday, 10 February`. This label is not in the heatmap — it is in the slot picker section, acting as a bridge between the selection made above and the options below. The patient reads: I selected a date, here is the date I selected, now here are the times for that date.

**Stage 3: Time slot selected.** The selected slot chip gains a teal background and white text — not black. Black communicates a completed/structural state. Teal communicates a confirmed-positive selection. This teal chip is the patient's booking intent made visible. The `CONFIRM & PAY` button activates. The button activation at this stage is itself a trust signal — it communicates that the system has recognized the selection and is ready to proceed.

**Stage 4: Confirmation.** The moment before payment — the booking confirmation modal. At this stage the patient needs absolute clarity. One addition to the base specification: a small secured payment indicator sits between the appointment summary and the payment button. This is not a badge — it is a single row containing a padlock icon in a `20px` bordered square in teal, and the text `Secured by Razorpay` in `ui-xs` gray. The padlock and teal together communicate security through the product's own trust color system. The Razorpay brand name provides external validation. Together they address the patient's primary remaining concern before clicking pay: is this safe?

---

## Extension 10 — The Admin Sidebar Completion (Extending the Base Prompt's Teal-Navy Direction)

The base prompt specifies the admin sidebar as a teal-navy colored sidebar — `#0B4F6C` background, white navigation text, `rgba` tint for hover and active states. This is a strong directional decision. The extension adds the micro-details that make this sidebar feel finished.

**Sidebar section grouping.** Admin navigation items should be grouped into three functional sections separated by light dividers (`1px rgba(255,255,255,0.15)` horizontal rules). Group one: `Overview`, `Analytics` — the monitoring section. Group two: `Doctors`, `Users`, `Reviews` — the management section. Group three: `Revenue`, `Payouts` — the financial section. Above each group: a tiny section label in `rgba(255,255,255,0.4)` at `9px` uppercase tracked. `MONITOR`, `MANAGE`, `FINANCE`. These labels are not navigation items — they are organizational headers. They cannot be clicked. They are `8px` above the first item in their group.

This grouping transforms the admin sidebar from a flat list of eight items into a structured navigation system with three clear operational zones. An admin looking for something financial does not scan all eight items — they look for the `FINANCE` section and scan two items. This is the information architecture improvement that makes the difference between an admin who navigates confidently and one who clicks the wrong item repeatedly.

**The active state left indicator.** The base prompt specifies the active state as `rgba(255,255,255,0.15)` background tint. This must be supplemented with a `3px` left white border on the active item. The background tint alone is too subtle on a dark sidebar — the active indicator must be unambiguous. The white `3px` left border against the teal-navy background is instantly readable as the active position indicator regardless of where the admin's eyes fall on the sidebar.

**The pending verification count.** The `Doctors` navigation item carries a count badge as specified in Phase 4. On the admin teal-navy sidebar, this badge is a small coral-filled circle — the accent color on the primary sidebar background creates maximum contrast and immediately draws the admin's attention to pending work. The base prompt specifies red for destructive actions. The coral accent used here is intentionally different — it signals work-needed rather than destruction.

---

## Final Verification Sequence

After all base prompt changes and all extension changes are applied, perform this sequence in order. Do not proceed to the next item until the current one passes.

Open the landing page on a `1440px` display. The first five seconds should feel: confident, warm, trustworthy, unmistakably healthcare. Not cold, not aggressive, not experimental. If it still feels cold: find the coldest element and apply the nearest relevant change. If it feels generic: find the most timid element and increase its typographic or color confidence.

Open the doctor discovery page. Apply ten filters in sequence. The filter application must feel responsive and non-jarring. The active filter chips above the results must feel like the patient is in control of their own search — not like the system is executing commands. If it feels mechanical: the issue is in the filter chip design or the filter removal interaction.

Open a doctor profile page. Scroll slowly from top to bottom without clicking anything. The information must arrive in the correct order: who is this person, are they qualified, what do others think of them, how much does it cost, when can I book. If the information order is wrong — fee appearing before credentials, reviews appearing before professional details — the design hierarchy is incorrect regardless of visual execution.

Complete a full booking flow from slot selection to payment confirmation. The four-stage trust sequence must be felt — each stage must feel like confirmation, not progression through a form. If any stage feels uncertain: the visual confirmation of that stage's selection state is missing.

Open the doctor dashboard. The first visible screen after login must answer three questions without scrolling: what is happening today, is my business growing, and is anything requiring my attention. If the answers require scrolling: the page hierarchy is wrong.

Open the admin overview. The first visible screen must communicate: platform health at a glance. Total users, total revenue, pending verifications, recent activity. If the admin cannot assess platform health in eight seconds: the metrics hierarchy is wrong.

Ask, finally: does every page feel like it was built by the same team, for the same users, with the same care? Consistency is the final test. Not beauty. Not cleverness. Consistency. A product that is consistently good feels more trustworthy than a product that is brilliant in places and ordinary in others.f

The codebase structure is clearly visible. Every file and folder is mapped. Now I know exactly where every design decision lands in the actual implementation. Here is the appended prompt.

---

# PhysioConnect — Structural Integrity & Universal Accessibility Prompt
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