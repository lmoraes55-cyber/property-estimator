---
target: "https://assetintel.ae/str-investment-research"
total_score: 31
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-11T17-52-09Z
slug: assetintel-ae-str-investment-research
---
Method: dual-agent (A: ae684b1da4879e85f · B: a58493014a7ba8623)

⚠️ Note: Assessment B's browser-evidence pass was disrupted by tab-management issues in this session (tabs closing mid-sequence, a viewport shift between screenshots) and could not complete the full calculator functional test or explicit desktop/mobile resize verification. Assessment A independently ran the calculator live (preset → results → Dubai Marina drill-down → lead-form pre-fill) and confirmed it works end-to-end, so the core functionality claim is verified — but B's independent confirmation of that same flow, and mobile-width verification specifically, are marked open below rather than treated as closed.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Invalid/zero budget submit is a silent no-op — no spinner, no error |
| 2 | Match System / Real World | 4 | Plain-language framing throughout ("Buys You: 1BR", real area names) |
| 3 | User Control and Freedom | 3 | No inline "change budget" once viewing area detail — must scroll back up |
| 4 | Consistency and Standards | 4 | Faithful to Chartered Estate — no drift |
| 5 | Error Prevention | 2 | No budget sanity bound; AED 1 computes a "yield" with no guard rail |
| 6 | Recognition Rather Than Recall | 3 | No in-context benchmark for whether a yield % is good or bad |
| 7 | Flexibility and Efficiency | 3 | Presets + free text + goal toggle cover common paths; no unit-size override |
| 8 | Aesthetic and Minimalist Design | 4 | Restrained, no urgency devices |
| 9 | Error Recovery | 2 | Lead-form error isn't tied to the offending field; calculator has no error state |
| 10 | Help and Documentation | 3 | Contextual disclaimers do real work; no "how we calculate this" affordance |
| **Total** | | **31/40** | **Good (78%)** |

## Design Specificity Verdict

**LLM assessment:** Specific and correctly executed — Georgia serif on every number that matters, bronze eyebrow labels, pill goal-selector with green-tint active state, 18-22px radius scale exactly per DESIGN.md. The direction contract's promise (instant ranked answer, not a lead form) is honestly delivered: Assessment A ran the calculator live end-to-end and confirmed real results, a working Dubai Marina drill-down, and a lead form that pre-fills with "Carried over from your calculator: AED 1,200,000 · Dubai Marina." The one real specificity failure: the building shortlist ignores the budget that drove everything else on the page (see P0 below) — a values leak, not a system leak.

**Deterministic scan:** 8 advisory findings (`design-system-color` ×3, `design-system-font-size` ×5) — same class of intentional variance (fluid headline endpoints, modal backdrop tints) already triaged as acceptable elsewhere this session.

**Visual overlays:** Script injection onto the live page succeeded, but the live-server detect.js overlay failed the same way it did on str-market-intel — a cross-origin request to `localhost:8400` from the deployed `https://assetintel.ae` page hung and timed out. No overlay available in a `[Human]` tab; a tooling limitation affecting both pages equally, not a finding about either site.

## Overall Impression

The core thesis is real and shipped, not aspirational — verified live. The most consequential gap is the building shortlist showing an unfiltered "Luxury" tier list regardless of what the entered budget can actually afford, directly beside a calculator whose entire point is budget-honesty. That's the one fix worth prioritizing above the others.

## What's Working

1. **The thesis is delivered, confirmed live**: budget in → real ranked areas with real yields, not a promise of a future email.
2. **Directional-vs-measured separation holds at the area-detail level** — sage "AssetIntel View" panel, its own eyebrow, explicit "not a live per-building measurement" caption.
3. **Lead-form pre-fill genuinely closes the loop** — confirmed live, no re-entry, no lost context between calculator and form.

## Priority Issues

- **[P0] Building shortlist ignores the user's budget entirely.** Drilling into Dubai Marina at AED 1.2M (a 1BR-affordability budget) returns 9 buildings, all tagged "Luxury" — `getBuildingsByArea` sorts by tier and slices top-9 with zero regard for what the entered budget can afford. A modest-budget buyer is handed a luxury-only shortlist for the exact area they were just told only buys them a small 1BR. **Fix**: filter/tag buildings against the affordable size band, or relabel the panel so it can't be misread as "these are your buyable options." **Suggested command**: direct fix, then `/impeccable clarify` for the label.
- **[P1] Calculator silently no-ops on invalid budget input.** `runCalculator()` returns early on `!n || n <= 0` with zero user-visible feedback — blank, "0", or garbage text produces nothing. **Fix**: inline error text the moment the click is rejected. **Suggested command**: `/impeccable harden`.
- **[P1] Yield numbers reveal with no adjacent reassurance, on a real-money decision.** The directional-data disclaimer lives once, in small gray text, below the entire 11-row list — not next to the number that actually drives the decision. **Fix**: attach a one-line qualifier directly under each Gross Yield figure and under the area-detail hero stat. **Suggested command**: `/impeccable clarify`.
- **[P2] Budget input isn't formatted after preset selection or typing.** Clicking "AED 1.2M" fills the raw string `1200000`, inconsistent with every other number on the page routed through `toLocaleString()`. **Fix**: format on blur/preset-select, parse on submit. **Suggested command**: direct fix.
- **[P3] Mobile result-row grid needs a manual check.** Code suggests a possible squeeze between the 3-track collapsed grid and a 4th visible element (Gross Yield) — flagged from source reading, not confirmed visually this run (browser tooling issue prevented mobile resize verification). **Suggested command**: `/impeccable adapt`, verify visually first.

## Persona Red Flags

**Jordan (first-timer):** The unfiltered "Luxury" building tags (P0) directly contradict what they just learned about their own budget one screen earlier — worst moment on the page for this persona.

**Riley (stress-tester):** AED 1 or AED 999,999,999,999 both run through the full ranking with no min/max bound, surfacing a nonsensical "yield" as if it were a real result.

**Sam (accessibility):** The result-row micro-labels ("Buys You," "Est. Annual STR," "Gross Yield") render at 9.5px in `#8E8E8E` on `#FDFBF7` — roughly 3.2:1 contrast, below WCAG AA's 4.5:1 for small text. The same class of issue DESIGN.md's own Bronze-Text Rule was written to catch elsewhere on the site — this new page's gray labels didn't get the same pass.

## Minor Observations

- The lead-form's "Carried over from your calculator" strip shows budget/area but not the selected Goal, even though it's captured and submitted.
- "Buildings →" as the row-end label is ambiguous before first use — reads like a nav link more than "click this whole row."
- `AREA_TO_BUILDINGS_KEY` only maps JBR and JVC — worth confirming no other area silently returns zero buildings from a naming mismatch.

## Questions to Consider

1. If the building shortlist can't respect budget yet, should it exist in this flow at all — or does showing luxury towers to a 1BR-budget buyer cost more trust than it's worth?
2. Every path still ends in the same generic lead form — would a budget-aware CTA ("See if AED 1.2M works in Dubai Marina") convert better than "Request Detailed Research"?
3. Should the Gross Yield figure ever render before its caveat is visible in the same viewport, given this is explicitly a real-money decision?
