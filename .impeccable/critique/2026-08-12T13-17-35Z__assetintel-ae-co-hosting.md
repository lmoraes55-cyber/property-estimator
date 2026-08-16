---
target: "https://assetintel.ae/co-hosting"
total_score: 25
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 1
timestamp: 2026-08-12T13-17-35Z
slug: assetintel-ae-co-hosting
---
Method: dual-agent (A: design-review · B: detector/browser-evidence)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Submit shows "Submitting…"; success/error states clear but not field-specific |
| 2 | Match System / Real World | 4 | Ladder framing matches how Dubai owners actually think about this decision |
| 3 | User Control and Freedom | 3 | Cross-links exist to self-manage/operator-match; no side-by-side compare view |
| 4 | Consistency and Standards | 4 | Full token/component reuse with sibling pages, no drift |
| 5 | Error Prevention | 2 | Only name+email validated; phone/property optional but not labeled as such |
| 6 | Recognition Rather Than Recall | 4 | Ladder stays in view; no cross-section memory burden |
| 7 | Flexibility and Efficiency | n/a | Persuade-mode page |
| 8 | Aesthetic and Minimalist Design | 3 | Clean overall; pricing section stacks two fee mechanics with no visual separation |
| 9 | Error Recovery | 2 | Generic error copy, no field-level highlighting |
| 10 | Help and Documentation | n/a | Not applicable |
| **Total** | | **25/32** | **Good (78%)** |

## Design Specificity Verdict

**LLM assessment**: Authored for AssetIntel, not generic — correct token/component reuse (SiteNav, DecorativeBackdrop, ConsultationBanner, EyebrowLabel, Georgia serif, pill/12px radii), and mirrors the established page rhythm (hero → context → scope → pricing → compliance → lead form → cross-sell). Notably, the bronze-contrast bug that hit the furnishing-guide and sub-leasing pages does not recur here — this page used secondaryText correctly from the start.

**Deterministic scan**: detect.mjs — exit 2, 6 findings, all design-system-font-size (advisory): section-heading clamps using 30px/46px endpoints not on DESIGN.md's documented type ramp. Same pattern repeated 6x (once per section heading) — a tokenization gap, not 6 separate bugs.

**Visual overlays**: Not applicable — remote production URL, no local dev server to inject into. Contrast/layout evidence gathered via direct computed-style inspection instead.

## Overall Impression

Structurally and technically the cleanest new page shipped this session — zero console errors, real semantic heading hierarchy, correct contrast discipline, no layout overflow at any width, working lead form. The gap isn't craft, it's trust design: this page asks someone to hand off guest communications on their own property to a partner it never names, backed by the word "vetted" used once with no elaboration — the single highest-stakes ask on the page, arriving with the least visual support.

## What's Working

1. Correct, disciplined design-system reuse — the bronze-contrast bug that recurred on two other pages this session was avoided here entirely (verified: 5.16-5.47:1 contrast on all bronze text, sampled 10 instances).
2. Honest, concrete tier differentiation — the Self-Manage/Co-Hosting/Full-Management ladder states real percentages and a clear ownership split (who holds DET compliance, who controls pricing) instead of vague marketing language.
3. Consistent "never overstate certainty" hedging — "indicative," "set by the referred partner, not AssetIntel," "verify directly with the partner" appears repeatedly and correctly, matching the product's core principle.

## Priority Issues

**[P0] No trust-building before the identity-handoff ask.** The page asks for name/email/phone/property to introduce the owner to an unnamed partner who'll handle guest-facing communication — with "vetted" as the only credibility signal, never explained. For a first-of-its-kind, unbranded service asking someone to hand off guest access, this is under-supported.
Fix: add a short "How we vet co-host partners" block (criteria — DET-licensed, insured, experience — even if generic) between the compliance section and the form, or be explicit that you're "actively selecting our partner — you'll know exactly who before you commit to anything."
Suggested command: /impeccable clarify

**[P1] Compliance disclaimer is visually under-weighted relative to its importance.** The paragraph doing the actual legal disambiguation (AssetIntel is a referrer, not the operator) is 12.5px body text, the same weight as a footnote, easy to skim past.
Fix: promote to the same visual weight as the Included/Not-Included cards, or lead with a bold sentence: "This is a referral, not an AssetIntel service."
Suggested command: /impeccable typeset

**[P2] Pricing section conflates two fee mechanics with no visual separation.** The 8-10% ongoing card and the tiered one-time setup fee sit back-to-back in identical serif-number styling with no bridge sentence — a first-timer could misread 8-10% as inclusive of setup.
Fix: add a one-line micro-header per card ("charged monthly, ongoing" / "charged once, at signup").
Suggested command: /impeccable clarify

**[P3] "Not Included" list lands right after "Included" with no bridge**, risking a "so what am I paying for" read.
Fix: one bridging sentence above the two-column grid.
Suggested command: /impeccable clarify

**[P3] Font-size tokenization gap (detector-confirmed).** 6 section headings use clamp() endpoints (30px, 46px) not on DESIGN.md's documented type ramp — same style repeated across sections, not independent bugs.
Fix: either add these sizes to the ramp (if intentional) or standardize onto existing documented sizes.
Suggested command: /impeccable extract

## Persona Red Flags

**Jordan (First-Timer)**: Reads the ladder but the page never says which tier fits their situation — no simple decision cue like "choose this if you want to keep DET responsibility but skip daily guest messages." Risk of bouncing between /self-manage, /co-hosting, /operator-match without a clear starting point.

**Skeptical/Trust-Sensitive Owner**: Stops at "independent, vetted co-host partner" and wants to know vetted by whom, on what criteria, with what recourse. The disclaimer's "the agreement is between you and the partner, not AssetIntel" — while accurate and necessary — reads as AssetIntel distancing itself from accountability when it's the only sentence carrying that weight, with nothing of equal visual weight reassuring the user about AssetIntel's own referral standard.

## Minor Observations

- Browser tab title stays "AssetIntel | Dubai Property Intelligence…" (homepage default) rather than a page-specific title — metadata gap, not a routing bug.
- Name-only submission (no email) shows a single generic red message below the button rather than highlighting the email field itself — functional, not broken, but slower to parse on mobile where the button can sit near the fold.
- Phone/property/unit-size fields are functionally optional (validation only checks name+email) but aren't labeled "optional" anywhere.
- Error-red (#C75A5A) is used as text only, never as an input border state.

## Questions to Consider

1. If "vetted" carries no visible criteria anywhere on the page, is it functioning as a trust signal or just a marketing adjective?
2. The compliance block protects AssetIntel legally — does the page do anything of equal visual weight to protect the user's confidence in the same handoff?
3. With no partner named yet, is shipping the lead-capture form now the right call, or would an "email us when live" waitlist framing set better expectations?
