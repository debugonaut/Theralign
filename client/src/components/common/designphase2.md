# PhysioConnect — Design Phase 2
## Landing Page Reimagination

---

## Design Intent

The landing page has one job performed in five seconds. A patient arriving in pain, a doctor considering joining, or an interviewer evaluating the product must immediately read: *this is a serious, trustworthy platform built by people who know what they are doing.*

This is not achieved through photography of smiling doctors or soft gradients. It is achieved through typographic authority, structural precision, and the deliberate absence of decoration. Every section below exists because it answers a specific question the visitor is silently asking. Remove any section and that question goes unanswered. Add any section not listed below and you are adding noise.

The overall tone is: **a well-funded healthcare infrastructure product that happens to have excellent design.** Not a wellness app. Not a medical directory. An operational platform with a public face.

---

## Navbar

The navbar is the first thing every visitor sees and the last thing they look at before making a decision. It must communicate authority without demanding attention.

Full white background. A single `4px` black bottom border acts as the ground line of the entire page — it is structural, not decorative. This border signals that what sits below it is organized, intentional, and precise. No drop shadow. No blur on scroll. No transparency.

The logo is the product name in uppercase Inter Black, tight tracking. It does not need an icon or a logomark at this stage. The name itself, in that weight and that case, is the brand signal.

Navigation links are sparse: `FIND DOCTORS`, `FOR PHYSIOTHERAPISTS`, and the two auth states. `LOG IN` is a ghost button — present but not primary. `GET STARTED` is a solid black primary button. The hierarchy is clear: the product wants visitors to start, not just log in.

The hover micro-interaction on navigation links is the vertical text slide specified in Phase 1 — the current text slides upward and a red version of the same text slides in from below at 150ms. This is the one moment of kinetic personality the navbar expresses. It is snappy, precise, and signals that the product is alive without being playful.

On scroll past 80px the navbar stays exactly as it is — same height, same border, same weight. It does not shrink, float, or blur. Stickiness is structural. The navbar does not perform.

**Why this works for trust:** A navbar that changes on scroll signals a product trying to be clever. A navbar that stays immovable signals a product that is confident. Patients making healthcare decisions respond to confidence.

---

## Hero Section

This is the highest-leverage piece of design in the entire product. Everything else on the landing page is supporting material. The hero is the argument.

The layout is asymmetric: a `7:5` column split. Left column carries the argument. Right column carries the proof.

### Left Column — The Argument

The headline occupies three lines in the largest type on the page. Inter Black, uppercase, negative letter-spacing so tight the words carry physical mass. The headline is not clever or abstract — it states directly what the platform does and who it is for. One word or phrase in the headline receives a red typographic treatment — an underline, or the word itself set in red — directing the eye to the core value proposition. This is the only decorative use of red on the entire page and it is not decorative at all. It is directional.

Below the headline: one sentence. Not a paragraph. One sentence in medium gray at reading size that tells the visitor why this platform is different. Every word is audited. If a word can be removed without losing meaning, it is removed.

Below that sentence: the AI symptom search input. This is the primary conversion mechanism on the page. It is introduced with a small uppercase red label — `DESCRIBE YOUR SYMPTOMS →` — that functions as a command, not a suggestion. The search input itself is full-width, rectangular, with a black button attached to its right edge that reads `FIND CARE`. On focus the input border thickens. This must feel like a terminal command interface, not a friendly search bar. The patient is not browsing — they are seeking specific help.

Below the search: two secondary CTAs side by side. `BROWSE DOCTORS →` as a secondary button for patients who want to look before describing symptoms. `JOIN AS A PHYSIOTHERAPIST →` as a ghost button for doctors considering the platform. Both uppercase, rectangular, tracked. Neither competes with the search input above them.

**Why the search is the primary CTA and not a booking button:**
The patient cannot book without finding a doctor. The search is the first step in every conversion. Making the search the most prominent interactive element on the page aligns the design with the actual user journey. A "Sign Up" CTA as the primary action assumes the visitor already wants to commit — premature and conversion-killing.

### Right Column — The Proof

No photography. No illustration. A geometric composition built entirely from styled HTML elements — rectangles, a circle, borders, background fills. This is the Bauhaus-inspired composition specified in the design system.

The composition includes one element that is recognizable as a doctor profile card — a bordered rectangle with an initial circle, a name in bold uppercase, a specialization label in small red uppercase, and a star rating as a number. This card communicates what the product does without a single photograph or icon set. It is the product demonstrating itself.

Other elements in the composition include a bordered rectangle with the grid pattern applied, a solid black rectangle acting as an architectural weight, and a bordered circle. None of these elements are decorative — they are compositional tools that give the right column visual mass equal to the text-heavy left column.

At the bottom of the right column, flush with the bottom of the left column's CTAs: three trust metrics in a horizontal row. Total verified doctors. Total appointments completed. A third metric (cities covered, average rating, or similar). Each metric is a large number in bold display size with a small uppercase gray label below it. Thin vertical lines separate them. These numbers make the abstract claim of the headline concrete.

The hero background has the grid pattern at barely perceptible opacity — felt more than seen. It communicates structure at a subliminal level.

**Why geometric composition instead of photography:**
Stock photography of doctors is immediately recognized as stock photography and triggers the same trust response as a stock photo — which is no trust response at all. A custom geometric composition that demonstrates the product's own UI is honest, distinctive, and impossible to mistake for a template.

---

## Trust Bar

A full-width band immediately below the hero. Black background, white text. A single horizontal row of trust signals: `VERIFIED SPECIALISTS` · `ONLINE BOOKING` · `SECURE PAYMENTS` · `REAL PATIENT REVIEWS`. Red bullet points separating each signal. Small uppercase tracked text.

This band is 80px tall and contains nothing else. Its purpose is to answer the four most common initial trust objections a healthcare marketplace visitor has — before they even think to ask them. The black background creates a hard visual break between the hero and the content below, resetting the visitor's attention before the detailed sections begin.

**Why black, not white or gray:**
A white or gray trust bar blends into the page flow. A black band stops the eye. The visitor reads it because it demands to be read. The trust signals inside it are too important to be glossed over.

---

## Specializations Section — `01. AREAS OF CARE`

The section header pattern: `01.` in red, `AREAS OF CARE` in display type, horizontal rule beneath.

Eight specialization cards in a `4×2` grid. Each card is a bordered rectangle on a gray surface with the dot matrix pattern. The specialization name is in bold uppercase. A single Lucide icon sits in a bordered square in the corner — not centered, not large, not decorative. It is a categorical identifier.

On hover: full color inversion. The card goes black. Everything inside — text, border, icon — goes white. This is the interactive card behavior from the design system. It is mechanical and immediate at 150ms.

Clicking any card navigates to the discovery page with that specialization pre-filtered. These are not decorative cards. They are the fastest path from landing page to conversion for a patient who already knows what kind of help they need.

**Why 8 specializations in a 4×2 grid:**
The specialization grid is a conversion shortcut. A patient with knee pain sees `SPORTS PHYSIOTHERAPY`, clicks it, and is immediately looking at relevant doctors. The grid layout at 4 columns keeps all 8 visible without scrolling — no carousel, no "see more." Everything visible. Nothing hidden.

---

## How It Works Section — `02. HOW IT WORKS`

Three steps. Not four, not five. Three.

The layout is a `1:1:1` three-column grid. Each column is a bordered card with a large step number in display size on the left, a step title in bold uppercase on the right of the number, and a short single-sentence description below. A thin vertical connector line runs between the cards to suggest progression.

The three steps must be written so that a visitor who reads only the step titles — not the descriptions — understands the complete flow. The descriptions add detail. The titles carry the message.

The gray surface background of the how-it-works section has the grid pattern applied — the same subliminal structure as the hero but now applied to a full section background rather than just the hero area. This creates visual consistency between the two most important narrative sections of the page.

**Why only three steps:**
Every step added beyond three reduces comprehension and increases perceived friction. Three steps is the maximum a visitor will process before deciding to scroll past. More than three steps suggests the product is complicated. This platform is not complicated — and the design must communicate that.

---

## Featured Doctors Section — `03. FEATURED SPECIALISTS`

Six doctor cards in a `3×2` grid. Each card is the same doctor card component used in the discovery page — bordered rectangle, profile image or initial circle, name in bold uppercase, specialization in small red uppercase, rating as a number, location, fee. The consistency between the landing page preview and the discovery page means the visitor is never surprised by the format they encounter after clicking through.

This section is titled `FEATURED SPECIALISTS` not `OUR DOCTORS` because the framing matters. `OUR DOCTORS` implies ownership and suggests a closed network. `FEATURED SPECIALISTS` implies curation and quality selection.

A `VIEW ALL SPECIALISTS →` button sits below the grid, secondary variant, centered. It is the only centered element on the page — and only because it is a section-closing action, not a primary navigation element.

**Why use the actual doctor card component:**
Using the real component from the discovery page means this section does not require separate design work and does not create visual inconsistency. The visitor clicking through to browse doctors sees exactly what they already saw — familiarity converts.

---

## Platform Statistics Section — `04. BY THE NUMBERS`

A full-width section, gray surface background. Four statistics in a `1×4` row. Each stat is a large number in display size, bold, black. Below each number: an uppercase gray label. Between each stat: a thin vertical line.

The numbers should be real if seeded data exists, or realistic placeholders if not. `500+`, `2,000+`, `50+`, `4.9/5` are examples. The specificity of the numbers matters — `2,000+` is more credible than `2K+` because it suggests an actual count rather than a marketing approximation.

No borders on individual stat blocks. No cards. The four stats float on the gray surface, separated only by the vertical lines. The restraint is intentional — the numbers are strong enough to carry the section without visual scaffolding.

---

## Patient Reviews Section — `05. PATIENT OUTCOMES`

Three review cards in a `1×3` row. The section title is deliberately `PATIENT OUTCOMES` not `TESTIMONIALS` — outcomes language is clinical, credible, and specific to healthcare. Testimonials is marketing language.

Each review card is a bordered rectangle. The review text is in mixed-case italic body type — the quotation marks are typographically large, set in display size and light weight, creating a visual anchor for the card. The patient name is in small bold uppercase below the quote. The doctor they saw is in small red uppercase below the name. The rating is shown as a number in a bordered square in the top-right corner.

On hover: the card lifts by 1px (the -1px translateY from the design system). The border increases to 4px. No color inversion — review cards are testimonial content, not navigation actions.

**Why `PATIENT OUTCOMES` matters for trust:**
Healthcare visitors are evaluating whether this platform will actually help them get better. Outcomes language signals clinical credibility. Testimonial language signals marketing. One builds trust, the other is filtered out.

---

## Verification Explanation Section — `06. HOW WE VERIFY`

This section exists to answer the most important trust question a patient has before booking: *how do I know this doctor is real and qualified?*

The layout is a `5:7` asymmetric split. The left `5` columns are a bordered card on a gray surface with the diagonal pattern — the pattern signals "process" and "documentation" without words. Inside this card: an ordered list of the verification steps the platform performs. Each step is a bordered row with a numbered label in red, a step name in bold uppercase, and a short description in regular mixed-case.

The right `7` columns contain the section header and explanatory copy. The body copy here is the only place on the landing page where two or three sentences are permitted rather than one. Verification is complex enough to deserve explanation. The copy ends with a single teal-colored badge: `ALL FEATURED DOCTORS ARE VERIFIED SPECIALISTS`. This is the only teal element on the landing page and its rarity makes it meaningful — teal means verified throughout the product, and its appearance here creates that association for the first time.

**Why this section exists:**
Healthcare marketplace trust depends entirely on patients believing the doctors are real and qualified. Every product that has solved healthcare marketplace trust — Zocdoc, Practo — has a verification explanation in a prominent position. Omitting it signals carelessness. Including it signals seriousness.

---

## CTA Banner — Final Conversion Moment

Full-width section. Black background. White headline in display type: the platform's value proposition restated as a command rather than a description. Below it: two buttons side by side — `GET STARTED →` in the accent red variant (the one moment on the page where the accent button is appropriate) and `FIND A DOCTOR →` in a white-border ghost variant on black.

No pattern on the black background. No texture. Pure black, white text, two buttons. The restraint of this section is what makes it powerful — after a page full of structure and content, the stark black section is a visual stop sign that demands a decision.

**Why restate the value proposition here:**
The visitor who reaches the bottom of the page has consumed all the evidence. They are the most qualified lead on the page. Restating the value proposition at this moment — when they are most ready to act — is the closing argument of the conversion. It must be direct, bold, and impossible to scroll past without noticing.

---

## Footer

Gray surface, `2px` black top border. Four-column layout. The left column carries the brand — `PHYSIOCONNECT` in bold uppercase, a one-sentence description in small gray below it, and nothing else. The next three columns carry link groups: `PLATFORM` links, `FOR DOCTORS` links, `COMPANY` links. Link group headers in uppercase tracked black. Individual links in small mixed-case gray. On hover: individual links shift to swiss-red.

A thin horizontal rule separates the link area from the copyright line. Copyright in small uppercase tracked gray. Legal links — Privacy Policy, Terms — as small gray text links on the right of the copyright line.

The footer does not have a newsletter signup, social media icons, an app download CTA, or any other element not listed above. Every element added to a footer reduces the legibility of every other element.

---

## Implementation Order for Phase 2

Work through the landing page in this exact sequence. Do not jump ahead or build sections out of order — each section informs the visual weight calibration of the next.

1. Navbar — with scroll behavior and slide micro-interaction
2. Hero — left column copy and search input
3. Hero — right geometric composition
4. Hero — trust metrics row
5. Trust bar — black band
6. Specializations grid — cards with hover inversion
7. How It Works — three-step layout
8. Featured Doctors — using real doctor card component
9. Platform Statistics — four-stat row
10. Patient Reviews — three review cards
11. Verification Explanation — asymmetric split with verification steps
12. CTA Banner — black section
13. Footer — four-column layout

---

## What Phase 2 Must Feel Like When Complete

Open the landing page cold, having never seen it before. Within five seconds you should think one of these things:

- *"This looks like a real startup."*
- *"This feels trustworthy."*
- *"I would book a doctor on this."*
- *"Whoever built this knows what they're doing."*

If the five-second reaction is instead *"this is nicely designed"* or *"interesting layout"* — the design has failed. Visual appreciation is not the goal. Trust and conversion are the goal.

---

Say **"Phase 3"** when ready for the Patient Experience direction.