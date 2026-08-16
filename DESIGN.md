---
name: AssetIntel
description: Dubai property intelligence platform — DLD-grounded rental estimates, area intelligence, and operator matching
colors:
  primary: "#1B5E4A"
  primary-hover: "#0F3E33"
  primary-light: "#2A7A62"
  secondary: "#B88A44"
  secondary-light: "#D4A574"
  secondary-dark: "#8B6F3F"
  secondary-text: "#7D6338"
  secondary-on-dark: "#E5C9AB"
  bg-main: "#F8F4EE"
  bg-section: "#FDFBF7"
  bg-sage: "#EFF4F0"
  bg-white: "#FFFFFF"
  text-main: "#1A1A1A"
  text-muted: "#6B6B6B"
  text-light: "#8E8E8E"
  border: "#E6E1D8"
  border-sage: "#C8DAD0"
  muted-green: "#4A7A68"
  success: "#4A7A68"
  warning: "#B88A44"
  error: "#C75A5A"
typography:
  display:
    fontFamily: "Georgia, serif"
    fontSize: "clamp(28px, 6vw, 56px)"
    fontWeight: 700
    lineHeight: 1.15
  headline:
    fontFamily: "Georgia, serif"
    fontSize: "clamp(22px, 4vw, 40px)"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    letterSpacing: "0.14em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "22px"
  pill: "20px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "14px 28px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "13px 24px"
  button-bronze:
    backgroundColor: "{colors.secondary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "13px 24px"
  card:
    backgroundColor: "{colors.bg-section}"
    rounded: "{rounded.xl}"
  card-sage:
    backgroundColor: "{colors.bg-sage}"
    rounded: "{rounded.lg}"
  chip:
    backgroundColor: "rgba(27,94,74,0.07)"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
  input:
    backgroundColor: "{colors.bg-section}"
    textColor: "{colors.text-main}"
    rounded: "{rounded.md}"
    padding: "13px 16px"
---

# Design System: AssetIntel

## Overview

**Creative North Star: "The Chartered Estate"**

AssetIntel reads like the private office of an old-money chartered surveyor: deep forest green and aged bronze on warm ivory paper, serif headlines that command a room without raising their voice, and every number backed by a registered record rather than a guess. The system trades in restraint — it earns trust by being quietly correct, not by performing luxury at volume.

The voice is warm concierge, not cold institutional: forest green and bronze carry the authority, but backgrounds stay soft and inviting (warm ivory, not stark white or navy), and copy speaks to an owner directly rather than through a dashboard. It never reaches for the generic SaaS dashboard look (flat blue/indigo, Inter, interchangeable rounded-xl cards), the flashy real-estate-agent look (loud gold gradients, stock skyline hero shots, urgency banners), or the crypto/trading-app look (neon, dark-mode-only, glowing numbers). Every accent is measured; the primary green and bronze are used deliberately, not smeared across every element.

**Key Characteristics:**
- Warm ivory/cream backgrounds throughout — never stark white, never dark mode
- Georgia serif for headlines and hero numbers; clean sans (Geist) for body and UI
- Forest green (institutional trust) + aged bronze (premium accent) as the only two brand colors — no third accent
- Flat surfaces at rest, a small deliberate lift (2–3px) plus a warm-tinted shadow on hover
- Pill-shaped chips and pill nav CTAs; generous corner radius (18–22px) on cards, 12px on buttons/inputs

## Colors

The palette is a two-color system on a warm-neutral base — no arbitrary third accent, ever.

### Primary
- **Deep Forest Green** (`#1B5E4A`): the institutional-trust color — primary CTAs, active nav state, section headers, "STR outperforms" positive states, brand mark.
  - Hover/pressed: **Forest Green Deep** (`#0F3E33`)
  - Tints/backgrounds: **Forest Green Light** (`#2A7A62`)

### Secondary
- **Aged Bronze** (`#B88A44`): the premium accent — secondary CTAs, eyebrow labels, highlight numbers (revenue, ADR), "book consultation" pill.
  - Tint: **Bronze Light** (`#D4A574`)
  - Shade/hover: **Bronze Dark** (`#8B6F3F`)
  - **Bronze Text** (`#7D6338`): AA-compliant (4.5:1+) variant for small/normal-weight bronze text (eyebrow labels, form labels) on light backgrounds — the base bronze (`#B88A44`) only passes contrast at large/bold sizes.
  - **Bronze On Dark** (`#E5C9AB`): AA-compliant variant for bronze text/links on the dark-green footer/CTA backgrounds.

### Neutral
- **Warm Ivory** (`#F8F4EE`): main page background. Never pure white.
- **Soft Warm White** (`#FDFBF7`): card and section background, sits one step lighter than the page.
- **Sage Tint** (`#EFF4F0`): advisory/trust section background — used to visually separate a "here's how we help" block from surrounding content.
- **Text Main** (`#1A1A1A`): primary copy.
- **Text Muted** (`#6B6B6B`): secondary copy, captions, table values.
- **Text Light** (`#8E8E8E`): tertiary/disabled-weight text.
- **Warm Border** (`#E6E1D8`): default card/input border.
- **Sage Border** (`#C8DAD0`): border for sage-tinted trust cards.

### Functional
- **Success/Positive** (`#4A7A68`): reuses the muted-green family, never a generic bright green.
- **Warning** (`#B88A44`): reuses bronze — the system does not introduce a separate amber.
- **Error** (`#C75A5A`): the one color outside the green/bronze family, reserved for destructive/negative states (e.g. "Avoid" risk verdicts).
  - **Error text on tint** (`#8B3A3A`): darker variant used for error copy sitting on a light error-tint background, where `#C75A5A` fails text contrast.

### Named Rules
**The Two-Color Rule.** Forest green and aged bronze are the only brand accents. A screen never introduces a third hue for decoration — functional states borrow the nearest existing color (success → green family, warning → bronze) rather than adding new ones.

**The No-White Rule.** Backgrounds are warm ivory or soft warm white, never `#FFFFFF` as a page background. Pure white appears only inside small elements (button text, icon fills) where it reads as contrast, not surface.

**The Bronze-Text Rule.** The base bronze (`#B88A44`) fails WCAG AA contrast (2.8–3.1:1) for normal-weight text on light backgrounds — use it for large/bold display numbers, button/chip backgrounds, and borders, never for small text. Small or normal-weight bronze text (eyebrow labels, form labels, footer links) uses **Bronze Text** (`#7D6338`) on light backgrounds or **Bronze On Dark** (`#E5C9AB`) on the dark-green footer/CTA panels.

## Typography

**Display Font:** Georgia, serif (with system serif fallback)
**Body Font:** Geist Sans (`--font-geist-sans`, system-ui fallback)

**Character:** the serif carries every number and headline that needs to feel authoritative and considered — hero stats, section titles, price figures. The sans carries everything functional — labels, body copy, table data, form fields. The pairing reads as "the report a private banker hands you," not "the dashboard a SaaS tool generates."

### Hierarchy
- **Display** (700, `clamp(28px, 6vw, 56px)`, 1.15 line-height, Georgia): hero headlines, the single biggest number on a page.
- **Headline** (700, `clamp(22px, 4vw, 40px)`, 1.2, Georgia): section titles.
- **Title** (700, 16px, 1.3, Geist Sans): card titles, component headers.
- **Body** (400, 14px, 1.65, Geist Sans): paragraph copy, table values. 1.65 line-height is deliberately generous — it's part of the "considered, unhurried" feel.
- **Label** (700, 11px, 0.14em letter-spacing, uppercase, Geist Sans, bronze): eyebrow labels above every section title (`"AREA INTELLIGENCE"`, `"FRAMEWORK"`, `"THE NUMBERS THAT MATTER"`).

### Named Rules
**The Serif-For-Numbers Rule.** Any figure meant to land with weight — annual net income, ADR, RevPAR, a hero stat — renders in Georgia, not the sans body font, even inside an otherwise all-sans card.

## Layout

Content sits in a centered container, typically `max-width: 1100–1200px`, with generous section padding (`72–88px` vertical on desktop, `44–60px` on mobile). Sections alternate background between warm ivory, soft warm white, and sage tint (`.ai-section-cream` / `.ai-section-white` / `.ai-section-sage`) to create rhythm without borders between them — the background shift *is* the section divider.

Grids collapse hard on mobile: 2/3/4-column grids (`.ai-grid-2/3/4`) drop to 1 column (or 2 for the 4-col case) below 640px, and full-width CTA buttons (`.ai-btn-full`) take over from inline button rows. Cards and metric grids favor `repeat(auto-fit, minmax(...))` where the count is data-driven (comparable listings, financial breakdown rows) rather than a fixed column count.

## Elevation & Depth

Flat at rest, with a small directional lift as the only elevation cue — never a resting shadow that fights the flat, paper-like base. All shadows are warm-tinted (`rgba(27,94,74,...)`), never neutral gray — even a shadow carries the brand's green undertone.

### Shadow Vocabulary
- **Ambient small** (`0 1px 2px rgba(27,94,74,0.04)`): resting card edge definition, barely perceptible.
- **Hover/raised** (`0 8px 28px rgba(27,94,74,0.08)`): card and button hover state.
- **Deep/CTA** (`0 20px 48px rgba(27,94,74,0.07)`): large feature cards, hero elements.

### Named Rules
**The Deliberate Lift Rule.** Interactive surfaces (cards, primary buttons) move up 2–3px on hover with a synchronized shadow deepen — never a shadow change alone, never a lift alone. It's a single, restrained gesture, not a flourish.

## Shapes

Corner radius scales with surface size, not randomly: 12px on buttons and inputs, 18px on smaller cards (sage/advisory cards), 22px on primary content cards, and fully pill-shaped (20px+ on a ~24–32px-tall element) on chips, tags, and nav CTA buttons. Borders are thin (1–1.5px) and warm-toned, never black or cool gray. Icon badges are circular, sitting in a soft tinted disc rather than a square container.

## Components

### Buttons
- **Shape:** 12px radius (`rounded: md`), never fully square or fully pill except nav CTAs.
- **Primary:** forest-green gradient (`135deg, #1B5E4A → #0F3E33`), white text, `14px 28px` padding, warm-tinted shadow (`0 4px 16px rgba(27,94,74,0.25)`).
- **Secondary/Ghost:** transparent background, forest-green text, 1.5px green border at 35% opacity; hover fills to a 6% green tint.
- **Bronze accent:** bronze gradient (`135deg, #B88A44 → #8B6F3F`), used for the "premium/upgrade" action distinct from the primary green CTA (e.g. "Book Consultation" vs "Analyze Property").
- **Hover/Focus:** 2px lift + shadow deepen (see Elevation), ~150–180ms ease transition on color/background/shadow/transform.

### Chips / Pills
- **Style:** pill radius, 5px/12px padding, 7% green tint background with 18% green border, green text (`.ai-chip`); a bronze variant swaps to bronze tint/border/text (`.ai-chip-bronze`).
- **Use:** trust badges, status tags, small metadata pills (e.g. area names, risk levels).

### Cards / Containers
- **Corner Style:** 22px for primary content cards (`.ai-card`), 18px for sage/advisory cards (`.ai-card-sage`).
- **Background:** soft warm white for standard cards, sage tint for advisory/trust cards.
- **Shadow Strategy:** ambient-small at rest, hover/raised on interaction (see Elevation).
- **Border:** 1px warm border at rest; on hover, primary cards shift border tint toward bronze at 40% opacity — a second, quieter hover cue alongside the lift.

### Inputs / Fields
- **Style:** soft warm white background, 1.5px warm border, 12px radius, 14px text.
- **Focus:** border shifts to 50%-opacity green plus a 3px soft green glow ring (`box-shadow: 0 0 0 3px rgba(27,94,74,0.08)`) — no harsh focus outline.

### Navigation
- **Style:** horizontal top nav, 14px Geist Sans links, muted-gray by default, full text-main weight-600 when active.
- **Active/hover state:** soft 8%-bronze-tint pill background plus a 2px bronze underline (`inset box-shadow`, not a real border, so it doesn't affect layout) — the underline is the primary "you are here" signal, the tint is secondary.
- **CTAs in nav:** two pill buttons on the right — a bronze-gradient "Book Consultation" and a green-gradient "Analyze Property" — mirroring the two-color button system.
- **Dropdowns:** mega-menu style panels for grouped sections ("Solutions", "Research"), each row showing an icon, title, and one-line description.
- **Mobile:** collapses to a slide-down expand pattern (`MobileExpand`) rather than an overlay drawer, preserving the same row/description structure.

### Eyebrow Label
A recurring signature: an 11px, 700-weight, uppercase, 0.14em-tracked bronze label sits above nearly every section heading (`"FRAMEWORK"`, `"AREA INTELLIGENCE"`, `"READINESS CHECK"`). It's the system's most consistent structural device — every major section is announced this way before its serif headline.

## Do's and Don'ts

### Do:
- **Do** use Georgia serif for any number or headline meant to carry weight (hero stats, prices, section titles).
- **Do** pair every section headline with an 11px uppercase bronze eyebrow label above it.
- **Do** use warm-tinted shadows (`rgba(27,94,74,...)`) for every elevation cue — never a neutral gray shadow.
- **Do** alternate section backgrounds (ivory / soft-white / sage) instead of adding borders between sections.
- **Do** keep chips and nav CTAs fully pill-shaped; keep cards and buttons on the 12–22px radius scale.

### Don't:
- **Don't** use a pure white (`#FFFFFF`) page background — warm ivory or soft warm white only.
- **Don't** introduce a third brand color. Functional states borrow from the green/bronze family; only destructive/error state uses the one outside color (`#C75A5A`).
- **Don't** use a resting shadow with no hover lift, or a lift with no shadow change — the two move together.
- **Don't** use Inter, system sans-only headlines, or flat rounded-xl SaaS-dashboard styling — headlines are always serif.
- **Don't** use stock skyline photography, urgency banners, or loud gold gradients — the "flashy real-estate-agent" look is an explicit anti-reference.
