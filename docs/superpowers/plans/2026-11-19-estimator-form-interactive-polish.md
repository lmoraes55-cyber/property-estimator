# Estimator Form Interactive Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every interactive element on the property-details estimator form (pill selectors, inputs, submit button) a "Magnetic Glow" hover/press feel, with a bold solid-fill selected state — validated live in a browser-companion brainstorming session against two rejected alternatives.

**Architecture:** Pure CSS/interaction change in one file. React inline `style={{...}}` objects can't express `:hover`/`:active` pseudo-classes, so a single `<style>` block (the same pattern this file already uses for its loading-spinner `@keyframes`) defines three CSS classes — `.ai-glow-opt`, `.ai-glow-input`, `.ai-glow-submit` — applied via `className` alongside the existing inline styles. No new React state, no new components.

**Tech Stack:** Next.js (React, inline styles + a scoped `<style>` block), TypeScript. No test runner in this project — `npx tsc --noEmit -p .` plus manual browser verification is the house standard (used throughout this session).

## Global Constraints

- Single file: `app/estimator/EstimatorPageInner.tsx`. No new files, no new components, no new React state (confirmed in the design spec).
- No change to field order, labels, validation, the title-deed upload feature, page-level color palette/typography/spacing.
- `npx tsc --noEmit -p .` must stay clean.
- The glow values, verbatim from the approved spec (validated live by the user in the browser companion):
  - Hover: `box-shadow: 0 0 0 4px rgba(184,137,63,0.12)`, border tints toward bronze.
  - Active/press: `box-shadow: 0 0 0 6px rgba(184,137,63,0.18)`.
  - Selected (pills only): solid `#1B5E4A` background, white text, `box-shadow: 0 4px 14px rgba(27,94,74,0.35)`.
  - Transition: `all 0.2s cubic-bezier(.2,.8,.2,1)`.

---

### Task 1: Add the glow CSS classes and apply them to every interactive element

**Files:**
- Modify: `app/estimator/EstimatorPageInner.tsx`

**Interfaces:** None — this task is self-contained; nothing else in the codebase depends on these class names or style constants.

- [ ] **Step 1: Insert the shared `<style>` block**

Find this exact line (confirmed present in the current file):

```tsx
      {/* ── FORM SECTION ── */}
      <section style={{ position: "relative", zIndex: 3 }}>
```

Insert a new line immediately after the `<section ...>` opening tag, before the `<div style={{ maxWidth: "1152px"...` line that follows it:

```tsx
        <style>{`
          /* "Magnetic Glow" interaction feel — validated live in a browser
             brainstorming session against a tactile-press and a
             checkmark-confirm alternative. Hover shows intent, press widens
             the glow briefly, selected (pills only) flips to a solid fill —
             the boldest of the three states, so "selected" is unambiguous. */
          .ai-glow-opt, .ai-glow-input, .ai-glow-submit {
            transition: all 0.2s cubic-bezier(.2,.8,.2,1);
          }
          .ai-glow-opt:hover:not(.ai-glow-selected), .ai-glow-input:hover, .ai-glow-submit:hover:not(:disabled) {
            box-shadow: 0 0 0 4px rgba(184,137,63,0.12);
            border-color: rgba(184,137,63,0.45);
          }
          .ai-glow-opt:active:not(.ai-glow-selected), .ai-glow-input:active, .ai-glow-submit:active:not(:disabled) {
            box-shadow: 0 0 0 6px rgba(184,137,63,0.18);
          }
          .ai-glow-input:focus {
            box-shadow: 0 0 0 4px rgba(184,137,63,0.12);
            border-color: rgba(184,137,63,0.45);
          }
          .ai-glow-opt.ai-glow-selected {
            background: #1B5E4A !important;
            border-color: #1B5E4A !important;
            color: #FFFFFF !important;
            box-shadow: 0 4px 14px rgba(27,94,74,0.35);
          }
        `}</style>
```

- [ ] **Step 2: Apply `.ai-glow-input` to the five input/select elements**

Each of these five elements currently has `style={inputStyle(...)}` or `style={{ ...inputStyle(...), ... }}` with no `className` for styling purposes (ignore any pre-existing layout-only `className`, e.g. none exist on these five today — confirmed by reading the file). Add `className="ai-glow-input"` to each:

1. Building name input — find `style={inputStyle(!!form.buildingName)}` and add `className="ai-glow-input"` on the same JSX element.
2. Bedrooms `<select>` — find `...inputStyle(!!form.unitSize),` (inside a `style={{ ... }}` spread) on the `<select>` element and add `className="ai-glow-input"` to that same `<select>`.
3. Floor number input — find `style={inputStyle(!!form.floor && !floorExceeds && !floorSuspect)}` and add `className="ai-glow-input"` on the same element.
4. Size (sqm/sqft) input — find `style={inputStyle(!!form.sizeSqm)}` and add `className="ai-glow-input"` on the same element.
5. Property value input — find `style={{ ...inputStyle(!!form.propertyValue), paddingLeft: "56px" }}` and add `className="ai-glow-input"` on the same element.

- [ ] **Step 3: Apply `.ai-glow-opt` (+ conditional `.ai-glow-selected`) to the three pill-selector groups**

All three pill groups share this exact pattern today:

```tsx
                          <button key={v} onClick={() => set("view", v)}
                            className="px-4 py-3 rounded-[14px] transition-all text-left text-sm"
                            style={{ ...(sel ? OPT_SELECTED : OPT_UNSELECTED), fontWeight: sel ? 700 : 500, color: sel ? "#153F32" : colors.textMain, transform: sel ? "translateY(-1px)" : "none" }}>
```

(the furnishing and condition groups are the same shape minus the extra `fontWeight`/`color` props — find each via `OPT_SELECTED : OPT_UNSELECTED` in the file, there are exactly three occurrences). For each of the three, change the `className` string to append the two new classes, conditional on `sel`:

```tsx
                            className={`px-4 py-3 rounded-[14px] transition-all text-left text-sm ai-glow-opt${sel ? " ai-glow-selected" : ""}`}
```

Keep the existing `style={{ ... }}` prop on all three exactly as-is — the CSS classes added in Step 1 use `!important` specifically so the selected state's solid-fill look wins over the existing inline `OPT_SELECTED` gradient without requiring you to touch `OPT_SELECTED`/`OPT_UNSELECTED` themselves. Do not delete or modify the `OPT_SELECTED`/`OPT_UNSELECTED` constants — they still supply the border/shadow for the *unselected* resting state, which the new CSS classes don't otherwise set.

- [ ] **Step 4: Apply `.ai-glow-submit` to the "Generate My Report" button**

Find this exact block:

```tsx
                  <button
                    onClick={handleGenerate}
                    disabled={!canGenerate || calculating}
                    className="w-full py-4 rounded-2xl text-base font-bold transition-all disabled:opacity-30"
```

Change the `className` line to:

```tsx
                    className="w-full py-4 rounded-2xl text-base font-bold transition-all disabled:opacity-30 ai-glow-submit"
```

The `:not(:disabled)` in the Step 1 CSS already excludes the disabled state from getting a hover/press glow, matching the spec's "no glow on a button that can't be clicked yet" requirement — no extra JS needed here.

- [ ] **Step 5: Verify types**

Run: `npx tsc --noEmit -p .`
Expected: no errors.

- [ ] **Step 6: Manual verification**

Run `npm run dev`, visit `http://localhost:3000/estimator`, and check:
1. Hover over the building-name input, the bedrooms dropdown, and the floor/size/property-value inputs — each should show the bronze glow ring on hover and a tighter one on focus.
2. Hover and click through the View, Furnishing Status, and Property Condition pill groups — unselected pills show the hover glow; clicking one flips it to a solid forest-green fill with white text and the drop shadow; the *other* pills in that group return to their normal unselected look (no leftover glow class stuck on).
3. With required fields incomplete, hover the disabled "Generate My Report" button — confirm no glow appears (it's genuinely non-interactive). Fill in all required fields and hover again — confirm the glow now appears, and clicking shows the brief press-widen before whatever its normal click behavior does.
4. Confirm nothing else on the page visually regressed (page loads, existing animations/layout unchanged).

- [ ] **Step 7: Commit**

```bash
git add app/estimator/EstimatorPageInner.tsx
git commit -m "$(cat <<'EOF'
Add Magnetic Glow interaction feel to the estimator form

Hover shows a soft bronze glow ring, press widens it briefly, and
pill selectors flip to a solid forest-green fill when selected —
validated live in a browser-companion brainstorming session against
a tactile-press and a checkmark-confirm alternative. Applies to the
view/furnishing/condition pills, all five text/select inputs, and the
submit button. Pure CSS via one scoped <style> block (React inline
styles can't express :hover/:active); no new state or components.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Spec coverage check

- Hover/active/selected glow values exactly as validated in the browser companion — Task 1, Step 1.
- Applied to pill selectors (view, furnishing, condition) — Task 1, Step 3.
- Applied to text/select inputs (building, bedrooms, floor, size, property value) — Task 1, Step 2.
- Applied to the submit button, excluding its disabled state — Task 1, Step 4.
- No new components/state, no field/layout/copy changes, title-deed upload untouched — nothing in this plan touches those; confirmed by the plan's scope being one file and the global constraints.
- "No glow on a button that can't be clicked yet" — Task 1 Step 4's `:not(:disabled)` selector, verified in Step 6.3.
