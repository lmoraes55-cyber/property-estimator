# Estimator Form — Interactive Polish Design

## Goal

Make the property-details form (`app/estimator/EstimatorPageInner.tsx`) feel more premium and trustworthy through visual/interaction craft — not by restructuring it. The form's current single-page layout, field set, and flow all stay exactly as they are; only how interactive elements *feel* when hovered/pressed/selected changes.

## Scope

**In scope:** interaction polish on every interactive element in the form — the pill/choice selectors (view, furnishing status, property condition, unit size/type), text and select inputs, and the "Generate My Report" submit button.

**Explicitly out of scope** (considered and rejected during brainstorming):
- Restructuring into a multi-step wizard ("Guided One-at-a-Time" direction) — rejected, too big a change from today's single page for what's meant to be a polish pass.
- A live-updating preview panel alongside the form ("Live Preview Split" direction) — rejected as the highest-effort option; the user chose the lowest-structural-change direction instead.
- The "Editorial Ledger" numbered-section treatment — rejected in favor of keeping today's layout.

## Chosen direction: "Magnetic Glow"

Validated live in the browser companion against two alternatives (a tactile scale-press on click, and a checkmark-grows-in confirmation) — the user picked this one after actually hovering and clicking all three.

**The feel, concretely:**
- **Hover** (not yet selected): a soft bronze glow ring appears around the element (`box-shadow: 0 0 0 4px rgba(184,137,63,0.12)`), border tints toward bronze. Signals "this is clickable" before any commitment.
- **Active/press**: the glow ring widens slightly (`0 0 0 6px rgba(184,137,63,0.18)`) for an instant of tactile feedback on the click itself.
- **Selected**: flips to a solid filled state — forest green background (`#1B5E4A`), white text, a confident drop shadow (`0 4px 14px rgba(27,94,74,0.35)`). This is the boldest of the three states and makes "selected" visually unambiguous at a glance, not just a subtle border/weight change.
- All transitions use `all 0.2s cubic-bezier(.2,.8,.2,1)` — a quick, slightly springy ease, not a linear fade.

## Where it applies

### Pill/choice selectors (view, furnishing, condition, unit size/type)
Currently: `OPT_SELECTED`/`OPT_UNSELECTED` style objects (lines ~68-77) give selected state a bronze-tinted gradient + static shadow + 1px lift, but **unselected buttons have no hover state at all** — flat until clicked. Replace with the glow hover/active/selected states above. The existing `translateY(-1px)` lift on selected can stay alongside the new filled-green treatment, or be dropped in favor of the shadow alone — implementer's call during the finish pass, whichever reads cleaner against the solid green fill.

### Text/select inputs
Currently: `inputStyle(active)` (line ~97) already gives focused inputs a bronze ring (`boxShadow: 0 0 0 3px ${colors.secondary}15`) — this is already very close to the glow language, just at low opacity (`15` hex suffix ≈ 8% alpha) and a tighter radius (3px vs. the button demo's 4-6px). Harmonize: bring the focus-ring alpha and spread in line with the button hover/active values above so the same "glow" reads consistently whether it's a button or a text field. No structural change needed here, just value tuning for consistency.

### Submit button ("Generate My Report →")
Currently: static gradient background + fixed shadow when enabled, no hover or press feedback at all (lines ~830-845). Add: a stronger version of the glow on hover (larger ring, since this is the single most important click on the page) and the same press-widen on active. The disabled state (when required fields are missing) is unchanged — no glow on a button that can't be clicked yet.

## Non-goals / things that stay as they are

- Field order, labels, required/optional logic, validation — unchanged.
- The title-deed photo/PDF upload feature — unchanged.
- Color palette, typography, spacing rhythm at the page level — unchanged (this is interaction polish, not a redesign).

## Implementation notes

This is a CSS/interaction-only change confined to one file (`app/estimator/EstimatorPageInner.tsx`) — no new components, no new state, no backend/data changes. The existing `OPT_SELECTED`/`OPT_UNSELECTED` constants and `inputStyle()` function are the right places to make these edits; no architectural changes needed.
