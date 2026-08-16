---
target: "https://assetintel.ae/str-market-intel"
total_score: 29
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 2
timestamp: 2026-08-11T17-52-09Z
slug: assetintel-ae-str-market-intel
---
Method: dual-agent (A: a2a7a7618d939b845 · B: a95b9e2dbbb36477d)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | No indication of when the next weekly data refresh lands |
| 2 | Match System / Real World | 4 | Vocabulary (RevPAR, ADR, AED, DLD/AirROI) matches how owners actually talk |
| 3 | User Control and Freedom | 3 | No "collapse all"; reload always resets to rank #1, no URL/hash persistence |
| 4 | Consistency and Standards | 4 | Eyebrow labels, radii, warm shadows all match DESIGN.md faithfully |
| 5 | Error Prevention | 2 | Raw listing card bypasses fmtAED/fmtPct — `0` renders as if it were real data |
| 6 | Recognition Rather Than Recall | 4 | Metrics re-labeled at every level; no memory burden |
| 7 | Flexibility and Efficiency | 2 | No multi-area compare, no export, search doesn't use existing area aliases |
| 8 | Aesthetic and Minimalist Design | 4 | Restrained, no urgency banners, generous whitespace |
| 9 | Error Recovery | 3 | Good sync-fallback banner, but APPROX. disclaimer ignores active search filter |
| 10 | Help and Documentation | n/a | Self-explanatory data tool; inline methodology section covers it |
| **Total** | | **29/36** | **Good (81%)** |

## Design Specificity Verdict

**LLM assessment:** Genuinely committed, not a re-skin — verified live that the accordion is single-open (opening JBR correctly closed Palm Jumeirah), the row uses Georgia for area name and RevPAR, and the "AssetIntel View" editorial zone is a real sage-tinted enclosure, not a token label. The one seam: raw third-party comparable-listing titles render verbatim — "50% DISCOUNT GIVEN! Look at me, I sleep 6!" and "(Defunct)JLT 3 BR Luxury Apartment" sit inside a page that otherwise reads like a chartered surveyor's report. The visual system holds; the content momentarily breaks character.

**Deterministic scan:** 5 advisory findings (`design-system-font-size` ×4, `design-system-radius` ×1) — same class of intentional fluid-headline variance already triaged as acceptable on the other redesigned pages this session.

**Visual overlays:** Script injection onto the live page succeeded, but the live-server overlay itself failed — `live-server.mjs` appears built to manage a locally-served page it controls, not an arbitrary deployed production domain; the request hung and the CDP call timed out. No overlay is available in a `[Human]` tab from this run — a tooling limitation, not a site finding.

## Overall Impression

The accordion mechanic is correctly built and verified working live (single-open, smooth expand, editorial-vs-data separation holds). The real gap is data hygiene at the edges: unsanitized third-party listing titles and zero-as-real-data both quietly violate the product's own "never overstate certainty" principle in the one place that ingests raw external content without going through the page's own formatting helpers.

## What's Working

1. **Single-open accordion, confirmed live across two areas** — opening one row reliably closes the other.
2. **Source-separation discipline is real**: SourceChip vs. sage "AssetIntel View" zone is consistently applied at both KPI-strip and area-profile level.
3. **Responsive grids collapse cleanly** — KPI strip to 1-column, methodology grid to stacked, no breakage observed.

## Priority Issues

- **[P1] Raw/unfiltered comparable-listing titles break brand voice.** Promotional scraped titles ("50% DISCOUNT GIVEN!", "(Defunct)...") render verbatim in the comparable-listings card (`{l.name ?? "Untitled listing"}`). **Fix**: sanitize/truncate listing names, or fall back to a neutral generated label when the source name reads as promotional. **Suggested command**: `/impeccable harden`.
- **[P1] Zero-value ADR/Occupancy renders as real data, not missing data.** The comparable-listing card does its own inline formatting instead of routing through `fmtAED`/`fmtPct` (used everywhere else), so a real `0` looks identical to a genuine measured zero. **Fix**: route listing-card values through the same formatters, or treat `0` as null for these fields. **Suggested command**: `/impeccable harden`.
- **[P2] APPROX. disclaimer footnote ignores the active search filter.** The footnote condition checks unfiltered `areaStats` instead of `sortedAreas` — filtering to "marina" still shows an accuracy disclaimer that doesn't apply to the visible result. **Fix**: change the condition to check `sortedAreas`. **Suggested command**: direct fix (one-line).
- **[P2] No comparison path for a research tool.** Single-open accordion is right for focus but there's no way to hold two areas open, export, or persist `openArea` across a reload (always resets to rank #1). **Fix**: persist `openArea` in the URL hash at minimum. **Suggested command**: `/impeccable optimize`.
- **[P3] Mobile collapsed row drops ADR and Occupancy, keeps only RevPAR.** On the platform's most time-constrained surface, 2 of 3 headline numbers vanish until tap. **Fix**: show RevPAR + one secondary metric on narrow viewports rather than RevPAR alone. **Suggested command**: `/impeccable adapt`.

## Persona Red Flags

**Alex (power-user):** No multi-area comparison, no export, no "expand all." Evaluating 6 areas before a meeting means reopening the accordion 6 times, losing prior numbers each time.

**Sam (accessibility):** The chevron toggle button has no `aria-expanded` and no accessible name beyond its visual arrow. The sort-pill row communicates active state purely via background color, no `aria-pressed`.

**Casey (mobile):** Confirmed the tab-pill row wraps tightly under the H1; per the CSS breakpoint, ADR and Occupancy vanish from the collapsed row, leaving only rank/area/RevPAR until tap.

## Minor Observations

- The `APPROX.` badge uses a hard-edged rectangular tag, inconsistent with every other pill-shaped (999px radius) chip on the page.
- Palm Jumeirah ranks #1 by RevPAR despite an 18% occupancy figure that reads as a possible data-quality outlier — worth a row-level flag, not just buried inside the expanded profile.
- Rank numbers re-index against the filtered result set when searching — mildly misleading if a filtered view is shared without context.

## Questions to Consider

1. If "never overstate certainty" is the core principle, why does the one raw, unmoderated data source on the page (comparable listings) get zero sanitization while every DLD/AirROI number gets careful null-handling?
2. Does single-open actually match how an owner compares 3-4 shortlisted areas before a decision, or does it serve the page's storytelling more than the user's workflow?
3. Should the row itself surface something when occupancy looks statistically off (18% at Palm Jumeirah), rather than waiting for the user to open and notice?
