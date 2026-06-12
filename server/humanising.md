# Theralign — Humanization Prompt
## Subtle Design Overhaul for Patient Accessibility

---

Give this prompt directly to your AI coding tool.

---

## The Brief

You are performing a targeted humanization pass on an existing Theralign codebase. The design system is Swiss Minimalist — structured, typographically disciplined, grid-based. That foundation stays completely intact. You are NOT redesigning the product. You are adjusting the tone of the existing design so it feels approachable to patients in their 30s–50s who are not designers or tech workers, without losing the professionalism and structural clarity already built.

Think of this as the difference between a government hospital and a private clinic. Same level of professionalism. Completely different emotional register.

**Do not touch:**
- The overall layout structure
- The sidebar and navbar architecture
- The typography scale or font family
- The spacing system
- The grid system
- Any backend code
- Any routing or authentication logic
- The component architecture

**Only touch:**
- Visual surface properties: border-radius, colors, hover states, border weights
- Text casing in specific contexts
- Background colors
- Interaction feedback patterns

---

## Change 1 — Background Color

**Current:** Pure white `#FFFFFF` body background.

**Change to:** `#F8F8F6` — a barely warm off-white. Not gray, not cream. Just one degree of warmth removed from clinical white.

**Where:** The `body` background in the global CSS only. Do not change card backgrounds or sidebar backgrounds. Just the page body. Every surface that was white before now sits on a surface that is very slightly warmer, making the white cards feel elevated rather than flat.

**Why:** Pure white on a screen reads as a hospital wall. `#F8F8F6` reads as a private clinic. The difference is imperceptible when described but immediately felt when seen.

---

## Change 2 — Border Radius

**Current:** `border-radius: 0` everywhere except avatar circles.

**Apply the following surgical exceptions:**

Cards — all card components get `border-radius: 8px`. This means the Card primitive, doctor cards on the discovery page, metric cards on dashboards, appointment cards, review cards, and booking panel. Not modals. Not dropdowns. Not the sidebar. Just cards.

Form inputs and textareas — `border-radius: 6px`. The label stays sharp, the input field itself gets the slight rounding. This single change makes every form in the product — patient profile, doctor onboarding, booking flow, login — feel immediately less intimidating.

Buttons — `border-radius: 6px` on all button variants. Not pill-shaped. Not aggressively round. Just enough to remove the sharpness that reads as harsh on a healthcare platform.

Badges and status chips — `border-radius: 4px`. A very small rounding that removes the hard-stamped feel without making them look like pills.

**Keep at zero radius:** The sidebar, the navbar, the table rows, the modal container, the toast notification, the tab bar controls, the filter panel. These structural elements retain their sharpness because they are architectural, not interactive content.

**Why cards and inputs specifically:** Cards are where patients read information about doctors and appointments — trust surfaces. Inputs are where patients enter personal health information — anxiety surfaces. Rounded corners on both signal safety and approachability at exactly the moments the patient needs reassurance most.

---

## Change 3 — Color Palette Adjustments

Make these exact token changes in `tailwind.config.js`:

**Swiss Black — soften slightly:**
Current: `#0F0F0F`
Change to: `#1A1A1A`
This removes the last trace of harshness from the primary text color without reducing legibility. Still reads as black. Feels marginally warmer.

**Swiss Gray 100 — the muted surface:**
Current: `#F2F2F2`
Change to: `#F0F0ED`
A barely warm gray for card backgrounds, sidebar, and muted surfaces. The warmth is subliminal — nobody identifies it, everybody responds to it.

**Swiss Red — the CTA and signal color:**
Current: `#FF3000`
Change to: `#E8341A`
The original red is a Swiss design reference — pure, aggressive, uncompromising. For a healthcare product it reads as alarm. `#E8341A` is still unmistakably red, still high contrast, still a strong CTA signal. But it is a considered red rather than a warning-sign red. Every primary button, every destructive action, every section number prefix becomes fractionally less aggressive.

**Swiss Teal — the confirmed/verified color:**
Current: `#0D7377`
Change to: `#0A7E6E`
Shift slightly toward green. The existing teal is correct but slightly cold. This version reads as healthy, positive, and natural — more appropriate for a healthcare confirmation signal.

**Add one new token — Surface Warm:**
`swiss-surface: #FFFFFF`
Use this for card backgrounds and modal backgrounds specifically. Cards are now white sitting on the `#F8F8F6` body — they feel elevated and clean. This is the private clinic effect: white surfaces on a warm background read as intentional and premium.

---

## Change 4 — Navigation Text Casing

**Current:** All navigation items in uppercase. `DASHBOARD`, `MY APPOINTMENTS`, `FIND DOCTORS`, `PAYMENT HISTORY`, `MY REVIEWS`.

**Change to:** Title case. `Dashboard`, `My Appointments`, `Find Doctors`, `Payment History`, `My Reviews`.

**Keep uppercase:** Section headers on pages, badge text, table column headers, button labels, the product name `Theralign`, section number prefixes like `01.`.

**The rule going forward:** Uppercase for structural identifiers and labels. Title case for navigation items and page titles that a user reads as destinations rather than labels. This distinction is the difference between a form that shouts at you and a product that speaks to you.

**Why this specific change matters:** A 50-year-old patient reading `MY APPOINTMENTS` in uppercase bold processes it as a formal instruction. The same patient reading `My Appointments` processes it as a personal destination. Healthcare platforms need the second register. The visual weight of the typography does not change — only the casing.

---

## Change 5 — Hover State Softening

**Current:** Interactive cards invert fully to black background with white text on hover.

**Change to:** On hover, cards get a `#F0F0ED` background fill and their border increases from `2px` to `3px` solid `#1A1A1A`. No color inversion. No text color change.

**Apply to:** Doctor cards on discovery page, specialization cards on landing page, feature cards, any card with an `onClick` handler.

**Keep full inversion on:** The specialization cards on the landing page ONLY. These are marketing surfaces where bold interaction is appropriate. Every other card in the product — the operational surfaces patients and doctors use daily — gets the softer hover.

**Why:** A card that suddenly turns black when a patient moves their mouse toward it is startling. In a product where the patient is already anxious about their health, startling interactions erode trust. A card that responds with a subtle background shift and a slightly heavier border communicates interactivity without aggression. The patient feels the interface respond — they do not feel attacked by it.

---

## Change 6 — Button Softening

**Primary button:**
Current: Black background, white text, sharp edges, hover turns red.
Change: Add `border-radius: 6px`. Hover behavior stays — the red shift is a strong CTA signal that should be kept. Just round the corners slightly.

**Accent button (Confirm & Pay):**
Current: `#FF3000` red, sharp edges.
Change: Update to `#E8341A` with `border-radius: 6px`. The accent button is the highest-stakes button in the product — a patient clicking it is committing money to a booking. It must feel considered and safe, not alarming.

**Secondary and Ghost buttons:**
Change: `border-radius: 6px`. Hover states stay identical.

**Logout button specifically** — looking at your screenshot, the logout button has a red border and red text. This is visually correct for a destructive action but the full red border reads as alarming in a sidebar. Change to: black border, black text, `LOGOUT` label, `border-radius: 6px`. On hover: border becomes `#E8341A`, text becomes `#E8341A`. The destructive signal appears on hover — not by default. A patient should not feel like logging out is a dangerous action every time they glance at the sidebar.

---

## Change 7 — Form Field Improvements

**Input focus state:**
Current: Border increases from `2px` to `4px` black — purely structural.
Change: Border increases from `2px` to `3px` and border color shifts to `#0A7E6E` (the warm teal). The teal focus ring communicates "active and safe" rather than "active and emphasized." In a form where a patient is entering their medical history or personal information, a teal focus state is reassuring. A thickening black border is demanding.

**Input placeholder text:**
Current: `swiss-gray-400`.
Change: Same color, but ensure placeholder text is always in mixed case, never uppercase. `Enter your full name` not `ENTER YOUR FULL NAME`. Placeholder text is a whisper, not an instruction.

**Error state:**
Keep exactly as is. Red border, red error text below. Error states must be unambiguous and the current treatment is correct.

---

## Change 8 — Sidebar Adjustments

**Navigation item active state:**
Current: Black background fill, white text, `4px` left border.
Change: Keep the `4px` left border in `#E8341A` (the adjusted red). Change the background from full black to `#1A1A1A` at `8%` opacity — a very dark transparent tint rather than a solid black fill. Text stays black (not white) because the background is now very light. This active state communicates selection through the left border (structural, precise) and a very subtle tint — not through a full color inversion that makes the sidebar feel like it is switching modes.

**Sidebar background:**
If the patient sidebar is currently white — change to `#FAFAFA`. One degree cooler than the body background `#F8F8F6` so the sidebar recedes slightly from the content area. The content area is the primary surface, the sidebar is navigation infrastructure.

**User info at the bottom of the sidebar:**
The name in bold uppercase and the role label below — change name to title case. `Aadesh Khande` not `AADESH KHANDE`. A patient's own name in uppercase bold in their own product feels like a database record, not a personal account.

---

## Change 9 — Dashboard Greeting

**Current:** `GOOD MORNING, [NAME].` in display uppercase.

**Change to:** `Good morning, [First Name].` in display size, title case, same weight.

Keep the display size. Keep the bold weight. Keep the negative letter-spacing. Change only the casing and use the first name only. `Good morning, Aadesh.` is how a private clinic receptionist greets a patient. `GOOD MORNING, AADESH KHANDE.` is how a government database identifies a record. Both are professional. Only one is warm.

---

## Change 10 — Toast Notifications

**Current:** Rectangular bordered toast, sliding in from right, teal or red left border.

**Change:** Add `border-radius: 8px` to the toast container. Keep all other properties — the left border accent, the slide-in animation, the close button. The rounded toast sits in the bottom-right corner and reads as a notification rather than a system alert. This is the one place where rounded corners are universally expected by all user demographics — even non-design-literate users associate rounded toasts with friendly system feedback.

---

## What To Verify After All Changes

Open the product in a browser. Perform this gut-check:

Open the landing page. Does it still feel structured and professional? It should. Does it feel slightly warmer than before? It should.

Open the doctor discovery page. Hover over a doctor card. Does it respond without startling you? It should shift background and border — not invert to black.

Open the booking flow. Click into the time slot input. Does the teal focus ring feel safe rather than demanding? It should.

Open the patient dashboard. Read the sidebar navigation. Does `My Appointments` feel like a destination you belong in? It should.

Open any form. Does the input with `border-radius: 6px` feel approachable? Does the rounded button feel considered rather than aggressive?

If all five of these feel correct — the humanization pass is complete. The product now serves both audiences: it impresses an interviewer with its structural discipline and it welcomes a patient with its emotional warmth.

The Swiss bones are still there. The patient can feel them as professionalism without being intimidated by them.


Both prompts are connected — the humanization prompt runs first and establishes the surgical fixes. This new prompt runs second and completes the transformation. Give them to your AI coding tool in sequence, not simultaneously.

---

# Theralign — Complete Design Transformation Prompt
## From Swiss Minimalist to Structured Warmth

---

## Context For The Coding Tool

You are working on Theralign — a physiotherapy marketplace SaaS product. A humanization pass has already been applied to this codebase in a previous prompt. That pass made surgical fixes: added `border-radius: 6px` to cards and inputs, softened hover states, changed navigation casing to title case, adjusted the body background to `#F8F8F6`, and changed the logout button behavior.

This prompt goes further. You are now completing a full palette and visual language transformation. The layout stays completely identical. The component architecture stays completely identical. The spacing system stays completely identical. You are changing the color system, the typography weight philosophy, the border radius scale, the interaction language, and the overall emotional register of the product.

The goal is a design language called Structured Warmth — modern, professional, trustworthy, and approachable for patients in their 30s to 50s who are not tech-native. The structural discipline of the existing system is an asset. The coldness and aggression of the black-and-red execution is what you are replacing.

---

## Step 1 — Replace The Tailwind Color Tokens Completely

Open `tailwind.config.js`. Replace the entire color system with this:

```javascript
colors: {
  // Primary — deep teal-navy. The dominant brand color.
  primary: {
    DEFAULT: '#0B4F6C',
    light:   '#E8F4F8',
    dark:    '#083A52',
  },

  // Accent — warm coral. CTAs, highlights, active states.
  accent: {
    DEFAULT: '#F4845F',
    light:   '#FDF0EB',
    dark:    '#D96840',
  },

  // Neutral — the text and surface system
  neutral: {
    900: '#1C2B3A',   // Primary text — dark navy-black
    700: '#3D5166',   // Secondary headings
    500: '#6B7C93',   // Secondary text, metadata, timestamps
    300: '#A8B8C8',   // Placeholder text, disabled states
    200: '#DDE3EA',   // Borders — soft blue-gray
    100: '#F0F4F7',   // Muted surfaces — sidebar, table headers
    50:  '#F7F9FB',   // Page background
  },

  // Semantic — status signals
  success: '#0A7E6E',   // Verified, confirmed, paid — keep existing teal
  warning: '#B45309',   // Pending — keep existing amber
  danger:  '#C0392B',   // Destructive actions only — a considered red, not alarm red

  // Surface
  white: '#FFFFFF',     // Cards, panels, modals sit on this
}
```

After replacing, do a global search across the entire codebase for every old color reference — `swiss-black`, `swiss-red`, `swiss-white`, `swiss-gray`, `swiss-teal`, `swiss-amber` — and replace with the new token names. Do not leave any old token reference in any file.

The mapping is:

```
swiss-black     → neutral-900
swiss-red       → accent-DEFAULT (for CTAs) or danger (for destructive)
swiss-white     → white
swiss-gray-50   → neutral-50
swiss-gray-100  → neutral-100
swiss-gray-200  → neutral-200
swiss-gray-400  → neutral-500
swiss-gray-600  → neutral-700
swiss-gray-900  → neutral-900
swiss-teal      → success
swiss-amber     → warning
```

The distinction between `accent` and `danger` for the old `swiss-red`:
- Every primary CTA button, every active state, every section accent → `accent`
- Every destructive action (cancel, suspend, hide, remove) → `danger`
- Section number prefixes (`01.`) → `accent`
- Error states → `danger`

This distinction did not exist in the Swiss system — red did everything. Now there are two separate signals. Accent is warm and positive. Danger is serious and consequential. Patients no longer see the same color on a "Book Now" button and a "Cancel Appointment" link.

---

## Step 2 — Update The Global CSS

Open `global.css`. Make these changes:

**Body background:**
```css
html, body {
  background-color: #F7F9FB;
  color: #1C2B3A;
}
```

**Replace the noise texture overlay:**
The existing fractal noise overlay at `opacity: 0.015` — remove it entirely. The warmth in this new system comes from color, not texture. The noise overlay was appropriate for the Swiss system's pure white surfaces. On `#F7F9FB` it adds nothing and slightly muddies the background.

**Replace the body::before pseudo-element with nothing.** Delete it completely.

**Update the scrollbar:**
```css
::-webkit-scrollbar-thumb {
  background: #A8B8C8;
}
::-webkit-scrollbar-thumb:hover {
  background: #6B7C93;
}
::-webkit-scrollbar-track {
  background: #F0F4F7;
}
```

**Update the selection color:**
```css
::selection {
  background-color: #E8F4F8;
  color: #0B4F6C;
}
```
Primary light background, primary dark text. Feels like the product rather than a generic inversion.

**Update the focus ring:**
```css
:focus-visible {
  outline: 2px solid #0B4F6C;
  outline-offset: 2px;
}
```
Primary color focus ring. Teal-navy on a light background is highly visible and immediately reads as "this product's active color" rather than a browser default or an alarm signal.

**Update the nav slide micro-interaction:**
The `.swiss-nav-link` hover replacement text was red. Update the hover color:
```css
.swiss-nav-link .nav-text-hover {
  color: #0B4F6C;  /* primary instead of red */
}
```

**Remove all pattern utility classes:**
Delete `.swiss-grid-pattern`, `.swiss-dot-matrix`, `.swiss-diagonal` from the CSS. In the new system, depth is created through color and elevation, not through background patterns. Background patterns were a Swiss Minimalist device that compensated for the flatness of a black-and-white palette. With a warm multi-tone palette, patterns add noise rather than depth.

**Add one new utility:**
```css
.card-elevated {
  background: #FFFFFF;
  box-shadow: 0 1px 3px rgba(11, 79, 108, 0.06),
              0 4px 12px rgba(11, 79, 108, 0.08);
}
```
This is the one shadow in the entire system. It is permitted specifically for cards because the new system uses elevation — white cards on a `#F7F9FB` background — rather than borders alone to create depth. The shadow is tinted with the primary color rather than black, so it reads as warm rather than dark.

---

## Step 3 — Update The Border Radius Scale

In `tailwind.config.js`, update `borderRadius`:

```javascript
borderRadius: {
  'none':  '0px',      // Navbar, sidebar, table rows — structural elements
  'sm':    '4px',      // Badges, status chips, tags
  'md':    '8px',      // Buttons, inputs, textareas
  'lg':    '12px',     // Cards, panels, modals, dropdowns
  'xl':    '16px',     // The booking panel, large feature cards
  'full':  '9999px',   // Avatar circles and status dots only
}
```

Apply these systematically:

```
All card components        → rounded-lg (12px)
All buttons                → rounded-md (8px)
All inputs and textareas   → rounded-md (8px)
All badges and chips       → rounded-sm (4px)
All modals                 → rounded-lg (12px)
All dropdowns              → rounded-lg (12px)
All toasts                 → rounded-lg (12px)
Navbar                     → rounded-none (0px)
Sidebar                    → rounded-none (0px)
Table rows                 → rounded-none (0px)
Tab bar controls           → rounded-md (8px) on the container, rounded-sm on individual tabs
Avatar circles             → rounded-full
```

---

## Step 4 — Update The Shadow System

Add to `tailwind.config.js` `boxShadow`:

```javascript
boxShadow: {
  'none':  'none',
  'card':  '0 1px 3px rgba(11, 79, 108, 0.06), 0 4px 12px rgba(11, 79, 108, 0.08)',
  'elevated': '0 4px 16px rgba(11, 79, 108, 0.12), 0 1px 4px rgba(11, 79, 108, 0.06)',
  'dropdown': '0 8px 24px rgba(11, 79, 108, 0.12)',
}
```

Apply:
```
All card components        → shadow-card
Cards on hover             → shadow-elevated
Dropdowns and modals       → shadow-dropdown
Everything else            → shadow-none
```

Remove all `2px solid black` borders from card components entirely. In the new system, cards are defined by their shadow and their white background on the warm page background — not by a visible border. The border-based card system was a Swiss device. The shadow-based card system is the modern SaaS standard that Notion, Linear, and Stripe's consumer pages all use.

**Keep borders on:** Inputs, textareas, the sidebar right edge, the navbar bottom edge, table row separators, badges. Borders remain structural elements. They are removed only from cards.

---

## Step 5 — Update The Button Components

**Primary button — the most important change:**
```
Background:    #0B4F6C  (primary, not black)
Text:          #FFFFFF
Border:        none
Border-radius: 8px
Hover:         #083A52  (primary-dark) — a darkening, not a color change
Active:        scale(0.98)
Shadow:        0 2px 8px rgba(11, 79, 108, 0.25) — subtle depth under the button
```

The primary button is now teal-navy. This is the brand color. Every primary action in the product — Book Appointment, Save Profile, Complete Onboarding — is now the brand's primary color rather than a generic black. Patients associate the color with actions they take. It builds color-action muscle memory across the product.

**Accent button — Confirm & Pay and high-stakes CTAs:**
```
Background:    #F4845F  (accent coral)
Text:          #FFFFFF
Border:        none
Border-radius: 8px
Hover:         #D96840  (accent-dark)
Shadow:        0 2px 8px rgba(244, 132, 95, 0.30)
```

The coral accent button is used exclusively for the highest-stakes single action on any given screen: `Confirm & Pay`, `Get Started` on the landing page CTA banner, `Submit for Verification` on doctor onboarding. Only one of these should exist on any screen at any time.

**Secondary button:**
```
Background:    transparent
Text:          #0B4F6C
Border:        1.5px solid #0B4F6C
Border-radius: 8px
Hover:         #E8F4F8 background (primary-light)
```

**Ghost button:**
```
Background:    transparent
Text:          #1C2B3A
Border:        1.5px solid #DDE3EA
Border-radius: 8px
Hover:         #F0F4F7 background
```

**Danger button — destructive actions only:**
```
Background:    transparent
Text:          #C0392B
Border:        1.5px solid #C0392B
Border-radius: 8px
Hover:         background tints to a very light red (#FDF2F2)
```

Destructive actions never use a filled danger background by default — only on hover. A row of actions in a table where `Cancel` has a filled red background creates visual alarm across the entire table. Outlined danger with red fill on hover is far less aggressive while still clearly communicating consequence.

**Remove uppercase from button labels:**
Button text should be in title case — `Book Appointment`, `Save Changes`, `Find Doctors`, `Confirm & Pay`. Not `BOOK APPOINTMENT`. Uppercase button labels are a Swiss system convention that is not a universal standard. Title case buttons read as modern SaaS. Uppercase buttons read as shouting.

---

## Step 6 — Update The Input Components

```
Border:        1.5px solid #DDE3EA  (neutral-200, the soft blue-gray)
Border-radius: 8px
Background:    #FFFFFF
Text:          #1C2B3A
Placeholder:   #A8B8C8 (neutral-300)
Label:         #3D5166 (neutral-700), 12px, semibold, title case (not uppercase)
               Example: "Full Name" not "FULL NAME"

Focus state:
  Border:      2px solid #0B4F6C (primary)
  Shadow:      0 0 0 3px rgba(11, 79, 108, 0.12)
  This creates a soft glow around the focused input — the standard
  modern SaaS focus ring that every user recognizes as "this field is active"

Error state:
  Border:      2px solid #C0392B
  Shadow:      0 0 0 3px rgba(192, 57, 43, 0.10)
  Error text:  #C0392B, 11px, below the input, sentence case
               Example: "Please enter a valid email address"
               Not: "ERROR: INVALID EMAIL FORMAT"
```

**Change label casing across all forms from uppercase to title case.** Labels are identifiers, not structural headers. `Date of Birth` not `DATE OF BIRTH`. `Consultation Fee` not `CONSULTATION FEE`. The field itself and its label should feel like a conversation, not a form to fill out under institutional pressure.

---

## Step 7 — Update The Badge and Status Chip System

The badge system keeps its semantic color logic but updates its visual treatment:

```
verified / confirmed / paid:
  Background:  #E8F4F8  (primary-light tint)
  Text:        #0B4F6C  (primary)
  Border:      none
  Border-radius: 4px

pending:
  Background:  #FEF3E2
  Text:        #B45309
  Border:      none
  Border-radius: 4px

cancelled / rejected:
  Background:  #F0F4F7  (neutral-100)
  Text:        #6B7C93  (neutral-500)
  Border:      none
  Border-radius: 4px

suspended:
  Background:  #FDF2F2
  Text:        #C0392B
  Border:      none
  Border-radius: 4px

completed:
  Background:  #E8F8F5
  Text:        #0A7E6E
  Border:      none
  Border-radius: 4px
```

Filled tinted backgrounds replace the bordered white-fill badges. This is the modern SaaS badge standard — Notion, Linear, GitHub all use tinted filled badges. The tint communicates the status signal more immediately than a white badge with a colored border, because the color fills the entire badge rather than just its outline.

Badge text changes from uppercase to title case: `Verified` not `VERIFIED`, `Pending` not `PENDING`. The semantic meaning is carried by the color, not the casing.

---

## Step 8 — Update The Sidebar

**Patient and Doctor sidebar:**
```
Background:    #FFFFFF  (white — the sidebar is a primary surface now)
Right border:  1px solid #DDE3EA  (neutral-200, soft blue-gray)
Width:         256px (slight increase from 240px for breathing room)
```

**Navigation item default:**
```
Text:          #6B7C93  (neutral-500)
Font:          Inter 500 (medium weight)
Padding:       10px 16px
Border-radius: 8px (on the item itself, with 8px horizontal margin)
```

**Navigation item hover:**
```
Background:    #F0F4F7  (neutral-100)
Text:          #1C2B3A  (neutral-900)
```

**Navigation item active:**
```
Background:    #E8F4F8  (primary-light)
Text:          #0B4F6C  (primary)
Font:          Inter 600 (semibold)
Left border:   3px solid #0B4F6C
Border-radius: 8px
```

The active navigation item is now the primary color — teal-navy background tint, teal-navy text, teal-navy left accent. This is how Linear, Notion, and Vercel handle active sidebar states. It is immediately readable and reinforces the brand color as the navigation signal.

**Remove the 4px full-black active border** that was the Swiss active state. Replace with the 3px primary-colored left border and the tinted background. The combination is softer than the Swiss treatment but equally clear.

**Product name at top of sidebar:**
```
Text:          #0B4F6C  (primary)
Font:          Inter 700, 16px
Case:          Theralign stays uppercase — this is a brand identifier
```

**User info at bottom of sidebar:**
```
Name:          #1C2B3A, Inter 600, title case — "Aadesh Khande"
Role label:    Use the verified/role badge in the new tinted badge style
Background:    #F7F9FB — very slightly set off from the sidebar white
Border-top:    1px solid #DDE3EA
```

**Admin sidebar:**
```
Background:    #0B4F6C  (primary — the admin sidebar is the primary color)
Navigation items default text:  rgba(255,255,255,0.65)
Navigation items hover:         rgba(255,255,255,0.85) background tint
Navigation items active:        #FFFFFF text, rgba(255,255,255,0.15) background
Product name:                   #FFFFFF
User info text:                  rgba(255,255,255,0.75)
```

The admin sidebar in primary teal-navy is the clearest possible visual signal that the admin experience is a different operational context. It is not a dark mode sidebar — it is a colored sidebar that communicates authority and administrative privilege. Every admin user immediately knows they are in a privileged context the moment they see the sidebar color.

---

## Step 9 — Update The Navbar

```
Background:    #FFFFFF
Bottom border: 1px solid #DDE3EA  (soft, not the 4px black rule)
Height:        64px
```

The `4px` black bottom border was the Swiss system's structural ground line. In the new system the navbar separation comes from a `1px` soft border-color rule and the shadow of the page content below it. Softer but still clearly defined.

**Navigation links:**
```
Text:          #6B7C93 default, #0B4F6C on hover
Font:          Inter 500, 14px, title case
Transition:    color 150ms ease
```

Remove the vertical text slide micro-interaction entirely. Replace it with a simple color transition — gray to primary on hover. The slide interaction was a Swiss Minimalist signature move. In the new system it reads as a design trick in a product that should feel functional rather than clever.

**Auth buttons in navbar:**
```
Log In:        ghost button style, primary color text and border
Get Started:   primary button style — teal-navy fill, white text
```

---

## Step 10 — Update The Table System

Tables keep their structural discipline but update their visual treatment:

**Table header row:**
```
Background:    #F0F4F7  (neutral-100)
Border-bottom: 1px solid #DDE3EA
Text:          #6B7C93 (neutral-500), Inter 600, 11px, uppercase, tracked
               Column headers stay uppercase — this is one of the places
               where uppercase is correct: it differentiates headers from data
```

**Table row:**
```
Background:    #FFFFFF
Border-bottom: 1px solid #F0F4F7  (very subtle row separator)
Hover:         #F7F9FB background
Text:          #1C2B3A primary, #6B7C93 secondary
Height:        56px
```

**Table action links:**
```
Default:       #0B4F6C (primary), Inter 500, 13px, title case
Hover:         underline
Destructive:   #C0392B (danger), same sizing
```

The table header is the one place in the product where uppercase stays. Column headers in uppercase differentiate them from row data — this is a valid typographic hierarchy decision even in the humanized system.

---

## Step 11 — Update The Section Header Component

The `SectionHeader` component needs one update:

**Section number prefix:**
Change color from `swiss-red (#FF3000)` to `accent (#F4845F)`.

The coral accent is the new signal color. Section numbers are accent-colored labels. `01.` in coral reads as a warm organizational marker rather than a warning flag.

**Title:**
Keep uppercase for section headers on the landing page and the main page-level headers. These are architectural identifiers — `AREAS OF CARE`, `HOW IT WORKS`, `FEATURED SPECIALISTS`. Uppercase is correct here.

Change to title case for all sub-section headers inside dashboards — `Today's Schedule`, `Profile Complete`, `Recent Activity`. Dashboard sub-sections are operational labels, not architectural identifiers.

**Horizontal rule:**
Change from `4px solid #0F0F0F` to `1px solid #DDE3EA`. The heavy black rule was the Swiss system's most aggressive element — it divided the page like a newspaper column. In the new system a `1px` soft border is sufficient to create section separation. The typographic weight of the heading already creates the hierarchy. The rule is support, not the primary signal.

---

## Step 12 — Update The Landing Page Specifically

The landing page is the one place where boldness is still appropriate. But boldness in the new system means typographic scale and color confidence, not Swiss aggression.

**Hero headline:**
Keep the large display size. Keep Inter Black (900 weight) for this one moment. Change color from black to `#1C2B3A` — the dark navy-black. Keep the negative tracking. Change the accented word or phrase from red to `#0B4F6C` primary — a color underline or a primary-colored word reads as brand emphasis rather than a warning signal.

**Trust bar below hero:**
Change background from pure black to `#0B4F6C` (primary). White text stays. Red bullet separators change to `rgba(255,255,255,0.4)` — subtle white dividers. The trust bar is now brand-colored rather than generic black. It reads as intentional brand architecture rather than a hard visual break.

**Specialization cards:**
Remove the full black inversion on hover. Replace with: `shadow-elevated`, border color shifts to `#0B4F6C`, a subtle `#E8F4F8` background tint. The card responds to hover with the brand's color family rather than an inversion.

**CTA banner at bottom:**
Change background from pure black to a deep gradient: `linear-gradient(135deg, #0B4F6C 0%, #083A52 100%)`. The gradient adds warmth and depth to what was a flat black rectangle. White text stays. The `Get Started` button changes to the coral accent variant — the one moment on the page where coral is appropriate as a CTA against a dark background.

---

## Step 13 — Verify The Emotional Register

After all changes are applied, perform this check on every major page:

Ask: does this page feel like a private clinic or a government form?

It should feel like a private clinic. Structured, professional, trustworthy, but warm. If any page still feels cold or aggressive — identify the specific element causing it and apply the nearest relevant change from this prompt.

Ask: does this page feel modern?

It should. The teal-navy primary, coral accent, soft shadows, and rounded-lg cards are the visual language of modern SaaS products in 2025. Not trendy. Not experimental. Confidently current.

Ask: would a 45-year-old patient feel comfortable booking a doctor on this?

That is the final test. Not "does this impress a designer" — that question has been answered by the structural discipline already in the codebase. The question is: does this welcome a patient? After this prompt, it should.

---

## What Does Not Change

Reiterated explicitly so the coding tool does not accidentally touch these:

The layout system — sidebar width, content area padding, page max-width, grid columns — stays completely identical.

The component architecture — how components are composed, what props they accept, how they are named — stays completely identical.

The spacing scale — all padding and margin values — stays completely identical.

The typography scale — font sizes, line heights, letter spacing — stays completely identical.

The backend — every API, every model, every service — is completely untouched.

The routing and authentication — completely untouched.

Only the visual surface of the product changes. The bones, the architecture, and the engineering effort already invested remain exactly as built.