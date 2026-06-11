Yes, I know the design DNA completely. Here is the universal prompt.

---

## Theralign — Universal Feature Design Prompt
### Apply this to every new feature going forward

---

Paste this at the top of every new feature prompt you give to Antigravity, then describe the specific feature below it.

---

You are building a new feature for Theralign — a physiotherapy marketplace SaaS. Before writing a single line of code for this feature, internalize the complete design language below. Every component, every screen, every interaction you build must feel like it was designed by the same person who designed the rest of the product. Do not deviate from this system. Do not introduce new colors, new font sizes, new border radii, or new interaction patterns that are not described here.

---

### The Product

Theralign is a healthcare marketplace connecting patients with verified physiotherapists. The emotional register of the product is Structured Warmth — it must feel simultaneously professional enough for a healthcare context and warm enough that a 45-year-old patient in pain feels comfortable using it. Every design decision must serve trust, clarity, and conversion in that order.

---

### Color System

The entire product uses exactly these colors and no others:

```
Primary:          #0B4F6C  — teal-navy. The dominant brand color.
Primary Dark:     #083A52  — hover state for primary elements
Primary Light:    #E8F4F8  — tinted background for primary highlights
Accent:           #F4845F  — coral. Used for high-stakes CTAs only.
Accent Dark:      #D96840  — hover state for accent elements
Accent Light:     #FDF0EB  — tinted background for accent highlights

Success:          #0A7E6E  — verified, confirmed, paid, available
Warning:          #B45309  — pending states, attention required
Danger:           #C0392B  — destructive actions, errors, rejection

Neutral 900:      #1C2B3A  — primary text
Neutral 700:      #3D5166  — secondary headings
Neutral 500:      #6B7C93  — secondary text, labels, metadata
Neutral 300:      #A8B8C8  — placeholder text, disabled states
Neutral 200:      #DDE3EA  — borders on inputs and structural elements
Neutral 100:      #F0F4F7  — muted surfaces, table headers, sidebar
Neutral 50:       #F7F9FB  — page background

Surface:          #FFFFFF  — cards, modals, panels
```

Status colors map exactly as follows and never deviate:
- Verified / Confirmed / Paid / Available → Success `#0A7E6E`
- Pending / Under Review / Awaiting → Warning `#B45309`
- Cancelled / Rejected / Inactive → Neutral 500 `#6B7C93`
- Suspended / Danger actions → Danger `#C0392B`
- Any primary action or brand signal → Primary `#0B4F6C`
- The one high-stakes CTA per screen → Accent `#F4845F`

If you find yourself reaching for any color not in this list, stop. Map your need to the closest semantic color above.

---

### Typography

Font: Inter only. No other font under any circumstances.

```
Weights in use:
  400 — body text, descriptions, secondary content
  500 — navigation items, labels, secondary emphasis
  600 — card titles, form labels, sub-headings
  700 — primary headings, button text, important values
  800 — large display numbers, hero emphasis
  900 — page-level hero headlines only, used sparingly

Size scale:
  10px — micro labels, badges, timestamps, legal text
  11px — small uppercase labels, secondary metadata
  12px — secondary body, captions, helper text
  13px — standard body text, table cell content
  14px — primary body text, form input values
  15px — card titles, emphasized body
  16px — section subheadings
  18px — page subheadings
  22px — page titles within dashboards
  28px — section display headers
  36px — page-level display headers
  48px — hero headlines on landing page
```

Casing rules — these are strict:
- Page-level hero headlines on landing page → UPPERCASE
- Section headers on landing page → UPPERCASE
- Dashboard page titles and greetings → Title Case
- Navigation items in sidebar → Title Case
- Button labels → Title Case (not uppercase)
- Badge text and status chips → UPPERCASE
- Table column headers → UPPERCASE
- Form field labels → Title Case
- Body text, descriptions, bio content → Sentence case
- Error messages → Sentence case

Negative letter-spacing on display sizes 28px and above: `-0.02em` minimum.
Positive letter-spacing on uppercase labels 11px and below: `0.06em` minimum.

---

### Border Radius

```
0px    — Navbar, sidebar shell, table rows. Never rounded.
4px    — Badges, status chips, small tags
6px    — Buttons, form inputs, textareas, select dropdowns
8px    — Segmented controls, tab bars, small cards
12px   — Standard cards, modals, dropdowns, panels
16px   — Large feature cards, booking panel, hero cards
9999px — Avatar circles and status indicator dots ONLY
```

If you are tempted to use a border radius not in this list, use the nearest value above or below. Never introduce an arbitrary value.

---

### Shadow System

Three levels only. Never use drop shadows outside these three:

```
Level 1 — Resting (all cards at default state):
  0px 1px 3px rgba(11, 79, 108, 0.06),
  0px 1px 2px rgba(11, 79, 108, 0.04)

Level 2 — Lifted (cards on hover, sticky panels, dropdowns):
  0px 4px 16px rgba(11, 79, 108, 0.10),
  0px 2px 6px rgba(11, 79, 108, 0.07)

Level 3 — Modal (modals and overlays only):
  0px 20px 60px rgba(11, 79, 108, 0.18),
  0px 8px 24px rgba(11, 79, 108, 0.12)
```

Shadow colors are tinted with the primary teal-navy — never use `rgba(0,0,0,x)` shadows. The tinted shadow is what makes the product feel cohesive rather than generic.

No borders on cards — cards are defined by their shadow and their white background against the `#F7F9FB` page background.

---

### Component Patterns

**Buttons:**
- Primary: `#0B4F6C` fill, white text, `border-radius: 6px`, hover → `#083A52`
- Accent: `#F4845F` fill, white text, `border-radius: 6px`, hover → `#D96840`. One per screen maximum.
- Secondary: transparent fill, `#0B4F6C` text and border `1.5px solid #0B4F6C`, hover → `#E8F4F8` background
- Ghost: transparent fill, `#1C2B3A` text and border `1.5px solid #DDE3EA`, hover → `#F0F4F7` background
- Danger: transparent fill, `#C0392B` text and border `1.5px solid #C0392B`, hover → `#FDF2F2` background. For destructive actions only.
- Height: `40px` standard, `34px` compact, `48px` large
- All buttons title case text, Inter 600, `13px`

**Inputs and Form Fields:**
- Border: `1.5px solid #DDE3EA`, `border-radius: 6px`, height `40px`, `padding: 0 12px`
- Focus: border becomes `2px solid #0B4F6C` with `box-shadow: 0 0 0 3px rgba(11,79,108,0.12)`
- Error: border `2px solid #C0392B` with `box-shadow: 0 0 0 3px rgba(192,57,43,0.10)`
- Success (post-fill on blur): border `1.5px solid rgba(10,126,110,0.6)` — quiet confirmation
- Labels above inputs always — never placeholder-as-label. Labels in Inter 600, `12px`, `#6B7C93`, title case.
- Error messages below field: Inter 500, `11px`, `#C0392B`, sentence case, prefixed with `↑`

**Badges and Status Chips:**
- `border-radius: 4px`, no border, padding `3px 10px`, Inter 700, `10px`, UPPERCASE, letter-spacing `0.08em`
- Success states: background `#E8F8F5`, text `#0A7E6E`
- Warning states: background `#FEF3E2`, text `#B45309`
- Danger states: background `#FDF2F2`, text `#C0392B`
- Neutral states: background `#F0F4F7`, text `#6B7C93`
- Primary states: background `#E8F4F8`, text `#0B4F6C`

**Cards:**
- Background `#FFFFFF`, shadow Level 1, `border-radius: 12px`, padding `24px`
- On hover if interactive: shadow Level 2, `transform: translateY(-2px)`, `transition: 200ms ease-out`
- No visible border on cards — shadow defines the edge
- Gray header zones inside cards: background `#FAFBFC`, border-bottom `1px solid #EEF2F6`

**Tables:**
- Header row: background `#F0F4F7`, border-bottom `1px solid #DDE3EA`, text `#6B7C93`, Inter 600, `11px`, UPPERCASE, letter-spacing `0.08em`
- Row height: `52px` single-line, `68px` two-line
- Row separator: `1px solid #F0F4F7` — hairline only
- Row hover: background `#F7F9FB`
- Numeric columns: right-aligned, `font-variant-numeric: tabular-nums`
- Action links in tables: Inter 600, `12px`, title case. Primary actions in `#0B4F6C`. Destructive actions in `#C0392B`.

**Section Headers inside dashboards:**
- Label above: Inter 700, `10px`, `#F4845F` coral, UPPERCASE, letter-spacing `0.1em` — e.g. `STEP 2 OF 5`
- Title: Inter 700, `22px`, `#1C2B3A`, title case
- Separator below: `1px solid #EEF2F6`

**Empty States:**
- Container: background `#FAFBFC`, border `1px dashed #DDE3EA`, `border-radius: 12px`, `padding: 48px 24px`, text-align center
- Lucide icon: `32px`, `#DDE3EA`
- Title: Inter 700, `18px`, `#1C2B3A`, title case
- Description: Inter 400, `13px`, `#6B7C93`, sentence case, max-width `400px`
- Action button if available: primary style, margin-top `24px`

**Toasts:**
- Position: bottom-right, `24px` from edges
- `border-radius: 8px`, shadow Level 2, padding `16px 20px`
- Left accent border `4px` — teal for success, coral for warning, danger for error
- Success auto-dismisses at `4000ms`. Errors require manual dismissal.

---

### Interaction Language

All transitions use `cubic-bezier(0.4, 0, 0.2, 1)` — never linear, never ease-in-bounce.

```
Hover color changes:     150ms
Card lift on hover:      200ms
Modal open/close:        200ms opacity fade
Page route transitions:  150ms opacity fade
Skeleton loading:        opacity pulse 1.2s ease-in-out infinite
Staggered list appear:   250ms per item, 60ms stagger, translateY(12px) → 0
```

Hover states are never subtle opacity fades. Every interactive element has a mechanical, clear hover state — color shift, shadow change, or transform. The user must always know something is clickable.

Active press state on buttons: `transform: scale(0.97)`, `150ms`.

Available status indicators use a pulsing dot animation — `8px` circle, success green, `animation: pulse 2s ease-out infinite`.

All animations respect `prefers-reduced-motion: reduce` — when detected, set all durations to `0.01ms`.

---

### Layout Rules

Page background: `#F7F9FB` — never pure white.
Content max-width: `1200px` on dashboard pages, `1280px` on public pages.
Sidebar width: `80px` icon + label style on doctor/patient, `240px` full nav on admin.
Standard content padding: `32px 40px`.
Card grid gap: `20px`.
Section gap within a page: `32px`.
Form field gap: `20px` between fields, `8px` between label and input.

The `#F7F9FB` page background with `#FFFFFF` white cards creates the elevation effect — cards feel like they float above the surface. Never set card background to `#F7F9FB` — that would eliminate the elevation effect.

---

### Innovation Rules

You have permission to be creative and innovative with new feature UI. However every innovation must:

1. Use only colors from the palette above
2. Use only border radii from the scale above
3. Use only shadows from the three-level system above
4. Use only Inter at the defined weights
5. Improve usability, trust, or clarity — not just aesthetics
6. Feel like it was built by the same designer who built the doctor card list, the booking confirmation card, the patient profile tabs, and the admin dashboard

Good innovation examples: a new data visualization using the primary and accent colors, a novel interaction pattern for a complex form, a creative empty state that uses the existing icon and typography system in an unexpected but coherent way.

Bad innovation: a new color introduced because it looks nice, a glassmorphism effect, a new font, a gradient, an animation longer than `300ms` on a functional UI element.

When in doubt: open any existing page in the product and ask — does my new feature look like it belongs on the same product? If the answer is no, revise until it does.

---

### File References for Design Tokens

The canonical source of truth for all design tokens is:
- `client/tailwind.config.js` — all color, spacing, shadow, and radius tokens
- `client/src/styles/global.css` — global resets, focus rings, scrollbar, body background
- `client/src/components/common/Button.jsx` — button variants
- `client/src/components/common/Badge.jsx` — status chip variants
- `client/src/components/common/Card.jsx` — card shell and hover behavior
- `client/src/components/common/Input.jsx` — input states and label pattern
- `client/src/components/common/Modal.jsx` — overlay and modal shell
- `client/src/components/common/Toast.jsx` — notification pattern
- `client/src/components/common/EmptyState.jsx` — empty state pattern
- `client/src/components/common/SectionHeader.jsx` — section header pattern

Before building any new component, read the relevant file above first. Extend existing components wherever possible. Create a new component only when the existing ones genuinely cannot serve the new need.

---

Paste this header before every new feature prompt. The specific feature description follows below this block.