Full document absorbed. I know exactly what this is doing — it is a calibrated temperature shift from Swiss clinical to professional warm SaaS — and I know precisely where to extend it. Here is the appended prompt in full.

---

# Theralign — Humanization Prompt Extension
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

Ask, finally: does every page feel like it was built by the same team, for the same users, with the same care? Consistency is the final test. Not beauty. Not cleverness. Consistency. A product that is consistently good feels more trustworthy than a product that is brilliant in places and ordinary in others.