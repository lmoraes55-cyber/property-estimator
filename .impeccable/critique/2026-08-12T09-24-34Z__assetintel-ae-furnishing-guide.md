---
target: "https://assetintel.ae/furnishing/guide"
total_score: 23
max_score: 32
na_heuristics: 7,10
p0_count: 2
p1_count: 1
timestamp: 2026-08-12T09-24-34Z
slug: assetintel-ae-furnishing-guide
---
Method: dual-agent (A: design-review · B: detector/browser-evidence)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Package button states clear; no error state on lead-submission failure |
| 2 | Match System / Real World | 4 | Vocabulary matches Dubai STR owner mental model precisely |
| 3 | User Control and Freedom | 3 | Modals close cleanly; no undo needed for a lead form |
| 4 | Consistency and Standards | 2 | Two overlapping lead-capture flows (guidance vs. quote modal) with different density/copy for the same endpoint |
| 5 | Error Prevention | 2 | No client-side field validation surfaced; required vs. optional unclear |
| 6 | Recognition Rather Than Recall | 4 | Unit-size selection persists and price recalculates live |
| 7 | Flexibility and Efficiency | n/a | Persuade/informational page — not applicable |
| 8 | Aesthetic and Minimalist Design | 3 | Clean overall; quote modal is dense (8 inputs + 8-item list, one scroll) |
| 9 | Error Recovery | 2 | Lead-submit fetch failures are silently swallowed and shown as success |
| 10 | Help and Documentation | n/a | Not applicable to this surface |
| **Total** | | **23/32** | **Good (72%)** |

## Design Specificity Verdict

**LLM assessment**: Passes, mostly. This is not a generic furnishing blog — the hero photography, "100+ Units Furnished" badge, DET compliance checklist, live unit-size-linked pricing, and the two-path structure (AssetIntel DIY vs. Interior Design Firms) are all clearly authored for AssetIntel's specific STR-furnishing business. Georgia-serif gradient headlines and bronze eyebrows read as "Chartered Estate." It does not feel like a stock template — but execution-level contrast/token errors undermine the polish (below).

**Deterministic scan**: `detect.mjs` returned exit code 2, 24 findings, all rule `design-system-color` (advisory) — undocumented literal color values not in DESIGN.md's token list: `#555` repeated 9x (an undocumented gray that probably wants a real token), `#2A2A2A`, `#F0EDE8`, `#C69A4A`, `#FFF8ED`, plus several `rgba(0,0,0,...)` and `rgba(35,93,72,...)` shadow/overlay values. None are blocking; they're a tokenization gap, not confirmed visual defects.

**Visual overlays**: Not applicable — the target is a remote production URL with no local dev server to inject the live-server.mjs overlay into. No user-visible overlay was generated; browser evidence below was gathered via direct computed-style inspection instead.

## Overall Impression

The page is structurally the most product-specific thing you could build here — live pricing tied to real unit selection, a DET compliance section that models the "never overstate certainty" principle correctly. But it's undercut by two real defects that both assessments converged on independently: a systemic bronze-text contrast failure (the exact bug class fixed on other pages, recurring here in full because this page never got the `secondaryText` token), and lead-capture forms that report success even when the underlying request fails. The single biggest opportunity is making the DET checklist's honest "this is an estimate" treatment the template for the pricing cards too, instead of the one place that gets it right being surrounded by places that don't.

## What's Working

1. **Hero section** — strong photography treatment, correct serif/bronze/green usage, restrained copy that doesn't oversell.
2. **DET Compliance Checklist** — explicit "Note:" disclaimer, progressive disclosure via accordion, correctly distinguishes AssetIntel's guidance from a hard requirement. This is the page's best execution of the product's own certainty principle.
3. **Live price recalculation** tied to unit size — a genuinely useful, non-generic interaction, not boilerplate.

## Priority Issues

**[P0] Bronze text fails WCAG AA contrast, systemically (~10 instances)**
- Why it matters: `#B88A44` on ivory/warm-bg measures 2.84–3.08:1 (browser-confirmed) against a 4.5:1 requirement for normal text. Every eyebrow label, small caption, and link in bronze on this page — "AssetIntel Advisory," "AssetIntel · Furnishing," "AssetIntel Service," package labels, "DET Compliance Checklist," "View Full Checklist" — is affected. This page never imports or defines the `secondaryText` (`#7D6338`) token that fixed this exact issue elsewhere; its local `C` palette only has raw `gold: "#B88A44"`.
- Fix: add `secondaryText: "#7D6338"` to the page's color object and swap it into every small/normal-weight bronze text use; reserve raw `#B88A44` for large/bold text (18px+), backgrounds, borders, and icons only.
- Suggested command: `/impeccable polish`

**[P0] Lead-submission failures are silently shown as success**
- Why it matters: `handleModalSubmit`/`handleQuoteSubmit` catch fetch errors with an empty `catch {}` and still flip to a "submitted"/success state unconditionally. A user whose `/api/lead` request fails on a bad connection sees "Request received" regardless — a false confirmation on a real-money decision, and AssetIntel loses the lead with zero signal it happened.
- Fix: branch on response `ok`/JSON `ok` field, show a genuine error state (matching the pattern already used correctly for `emailStatus`'s "Couldn't send — try again").
- Suggested command: `/impeccable harden`

**[P1] Pricing estimates aren't visually distinguished from confident data**
- Why it matters: Package totals (e.g. "AED 14,900 – AED 17,900") render in the same bold black, full-confidence styling as the rest of the page's copy. The one disclaimer that these are estimates sits at 11px, muted, only inside the quote modal — absent entirely from the package cards where the number is first seen and most likely to anchor a decision. This directly contradicts the product principle that modeled/directional figures must look visually distinct from verified data — a principle the DET checklist section on this same page honors correctly two sections later.
- Fix: add a small "Estimated" tag or lighter/italic treatment directly on the price line in the package cards, matching the DET section's explicit "Note:" pattern.
- Suggested command: `/impeccable clarify`

**[P2] Duplicated, inconsistent lead-capture flows**
- Why it matters: Two separate modals (a lighter "guidance" modal and a heavier "quote" modal) collect overlapping fields and feed the same `/api/lead` endpoint, with no obvious rationale for which tab funnels to which. Users get inconsistent friction for what is functionally the same ask.
- Fix: consolidate into one form with progressive disclosure, or make the density difference intentional and explain it.
- Suggested command: `/impeccable distill`

**[P3] Quote modal cognitive overload**
- Why it matters: An 8-item "what we coordinate" list plus 8 form inputs (4 text fields, 2 selects, 1 path select, 1 textarea) sit in one unbroken scroll, above a pricing summary already shown. Exceeds the ≤4-items-per-group and ≤4-visible-choices guidelines twice over in one component.
- Fix: collapse the coordination list to a 3-4 item summary with a "see all" toggle, or split the form into two steps.
- Suggested command: `/impeccable layout`

## Persona Red Flags

**Jordan (First-Timer)**: Arrives with a `?buildingName=X&unitSize=2BR` query param — implying they came from the property estimator — but the page never explains why they're here or connects back to the number they just saw. No breadcrumb or context bar referencing their property. Jordan also has no anchor for whether AED 14,900–17,900 is cheap or expensive relative to self-furnishing or hiring an interior designer directly — no comparison framing.

**Riley (Stress Tester)**: Will switch unit size inside the quote modal while a package is already selected, checking whether the top-of-page card total and the modal's independently-computed total can desync (they read the same state but compute separately). Riley will also submit the form on a dead connection and get the false "success" screen documented in the P0 above — an easy first find for anyone testing edge cases.

## Minor Observations

- The same shield icon represents both "DET Compliance" and "Guest Essentials" in different sections — same icon, two different meanings, no visual differentiation.
- "Get This Furnishing Package →" arrow-suffix CTA pattern repeats 4+ times across the page (banner, cards, design-firm CTA) — consistent, but diluted through overuse.
- Interior-design-firm cards render a raw Google star rating at 22px bold serif-adjacent gold — the single largest, boldest number on that tab, visually outranking AssetIntel's own package prices. Given the certainty principle applies to how confidently *any* number is presented on this product, an unverified third-party rating probably shouldn't out-weigh AssetIntel's own pricing.
- 4 images all load correctly; alt text is generic ("ESSENTIAL"/"SIGNATURE"/"LUXE") rather than descriptive — minor.
- Heading structure is flat: only one H1 and one H2 exist on the entire page; "AssetIntel Advisory," "Interior Design Firms," "DET Compliance Checklist," and room-category buttons are all non-heading elements — thin structure for a long guide page.
- Mobile hero: the "STR Setup" line of the H1 sits in an olive/gold tone over a busy photographic background with partial masking, reducing legibility versus the desktop version's solid ivory panel behind the text.
- Mobile touch targets: most CTAs comfortably clear 44px (primary CTA 310×50, room buttons 356×60), but "View Full Checklist" measures 128×19px — well under the 44px guideline — and one "Request a Quote →" instance measures 323×41px, 1px under.

## Questions to Consider

1. Should an unverified third-party Google rating ever visually out-weigh AssetIntel's own pricing, given the product's certainty principle is really about AssetIntel's own claims — does an external number deserve the same restraint?
2. If a lead submission silently fails today, is there any monitoring on `/api/lead` failures, or does this page currently have zero signal when its own conversion mechanism breaks?
3. Is the guidance/quote modal split load-bearing for the business, or accidental duplication that could collapse into one smarter form?
