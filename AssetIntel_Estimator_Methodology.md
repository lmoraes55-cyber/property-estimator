# AssetIntel Rental Estimator — Methodology for External Review

**Purpose of this document:** We are asking other AI models/analysts to stress-test the accuracy of our Dubai short-term-rental (STR) vs long-term-rental (LTR) estimator. Below is the full logic, data sources, and formulas as currently implemented. We want critical feedback on: (1) whether the assumptions are realistic for the current Dubai market, (2) where the model is likely over/under-stating revenue or risk, and (3) what additional data sources or checks would improve accuracy.

Context: Dubai STR/LTR market is currently softer than 2023–2024 due to regional conflict-driven tourism sensitivity and rising STR supply — we deliberately try to keep estimates conservative rather than promotional.

---

## 1. What the estimator does

Given a building, unit size, floor, view, furnishing status, and a management fee %, it outputs:
- A benchmark **long-term rent (LTR)** for that unit
- A projected **STR annual revenue, monthly seasonality curve, occupancy, ADR, and net-to-landlord** after costs
- A **STR vs LTR net comparison** to help an owner decide which strategy to pursue

## 2. LTR benchmark — data sources (in priority order)

1. **Exact DLD building match** — Dubai Land Department's public Ejari "Rent Contracts" dataset, ingested into a local JSON (`building-ltr-rents.json`) with median, p25/p75, sample size (n), and "as of" month per building + bedroom count. This is real registered-contract data, not an estimate.
2. **Fuzzy DLD building match** — same dataset, matched via name normalization/aliasing (e.g. "Marina Gate" merges "At Marina Gate 1"/"2" DLD project variants).
3. **DLD area-level median** — if no building-level data exists, falls back to the DLD area average for that bedroom count.
4. **Curated manual overrides** — a small table of buildings absent from Ejari (e.g. not separately registered), sourced from DXB Interact / Bayut / Property Finder listing medians, manually verified.
5. **Internal community-average benchmark table** — a hardcoded fallback table by community + bedroom count, used only if nothing else resolves.
6. **Dubai-wide average fallback** — last resort.

A unit's rent can be refined by rent-per-sqft (`aedPerSqft × sizeSqft`) when both are known, but the result is clamped to 0.7x–1.4x of the median to prevent a wild outlier from a bad sqft input.

**Known limitation:** tiers 4–6 (manual/hardcoded tables) have not been refreshed as rigorously as the DLD-driven tiers and represent the weakest part of the LTR side.

## 3. STR revenue model — core formula

```
targetRevenue = ( baseLTR × (1 + effectivePremium) / (1 − managementFee) ) × furnishingMult
```

Where `baseLTR` is the DLD/benchmark LTR rent (see §2), and `effectivePremium` is a composite premium (see §4) representing how much more a well-run STR should net an owner vs. renting long-term, before management fees.

This `targetRevenue` is then distributed across 12 months using a fixed **seasonality curve** (see §5), and per-month occupancy is applied to back out an implied ADR (`revenue ÷ (occupancy × days in month)`).

## 4. Premium stack (why STR should out-earn LTR)

`effectivePremium` is the sum of these components, each capped/floored individually and then the **total capped at 25%**:

| Component | Range | Basis |
|---|---|---|
| Base premium | 0–3% (0% in LTR-recommended areas) | Baseline uplift for offering flexibility/short stays |
| View premium | 0%–9% | Burj/Downtown skyline 9%, Sea 7.5%, Marina/Waterfront 5.5%, Community 2.5%, Golf/Park 1%, Standard 0% |
| Floor premium | 0%–3.5% | Rises in bands from floor 5 (0.4%) to floor 40+ (3.5%) |
| Building tier premium | building-specific | From a curated tier table (ultra-luxury/luxury/mid), 0–2% |
| STR location-demand premium | 0–4% | Prime tourist core (Marina/JBR/Downtown/Palm) +1.6%, strong secondary (Business Bay/DIFC/Creek Harbour/JVC) +0.6%, monthly-stay value areas (JVC/Arjan/Furjan/Sports City/Town Square studios & 1BR only) +2%, else 0%. One building-specific manual override exists (Sunrise Bay, +4%, based on observed performance).
| Property condition premium | 0–8% | Standard 0%, Semi Upgraded 4%, Fully Upgraded 8% (owner-estimator only) |

**Minimum net-advantage floor:** because the STR owner absorbs utilities/maintenance/furniture costs that an LTR tenant would normally pay, a flat revenue premium can still leave STR *net* income below LTR. So the model computes the premium required to guarantee STR net income is at least **9% above LTR** (26% for studios, since fixed costs eat a larger share of a small LTR base), and uses whichever is higher: the "natural" premium stack above, or this floor. This does not apply in areas flagged as LTR-recommended, nor in a special "sublease risk" mode used for a different product (STR sub-leasing risk estimator) that deliberately lets the deal fail if the numbers don't work.

## 5. Seasonality — occupancy & revenue distribution

Two separate 12-month shape curves exist for **apartments** vs **villas**, reflecting different guest behavior:

- **Apartments:** Summer (Jun–Aug) has *higher occupancy* (monthly-stay demand from residents/workers) but *much lower ADR* (monthly-rate pricing). December is peak (Dubai Shopping Festival + NYE, +30–50%). Oct–Feb is high season.
- **Villas:** Weaker summer occupancy (monthly stays less common/accessible), much sharper Dec/Jan peak driven by luxury family/staycation demand.

Annual occupancy targets range from 63% (studio/1BR, easiest to fill, most monthly-stay demand) down to 43–46% (larger villas, 7–9BR). These targets are then modulated per-unit by view/floor/tier/condition/location quality signals, with upside capped at 90% occupancy and downside floored at −3 percentage points from the base target.

**Source basis for these curves:** internally modeled from operator-reported performance and iteratively adjusted based on owner feedback — this is the least externally-verifiable part of the model and the part we'd most like scrutinized. It is not sourced from a live STR analytics API (e.g. AirDNA) — validating against AirDNA is on our roadmap but not yet done.

## 6. Cost model (subtracted to get net-to-landlord)

All costs below are STR-only (an LTR tenant would pay these themselves, not the landlord):

- **Management fee:** owner-input %, typically 15–25%
- **DEWA (utilities):** modeled monthly, AC-driven — highest Jun–Aug (45°C+), lowest Nov–Mar. Scaled by unit size (studio → 9BR villa).
- **AC/district cooling:** separate line item, same seasonal shape as DEWA.
- **Internet (DU):** flat AED 400/month (apartments) to AED 1,000/month (larger villas).
- **Maintenance:** flat monthly by unit size, AED 250 (studio) to AED 6,000 (9BR villa).
- **Furniture amortization:** two tiers — "full" (unit needs furnishing: 5-year amortized fit-out cost + annual refresh budget) vs "refresh only" (already furnished: ~30% of the full figure, ongoing refresh/replacement only).

**Source basis:** these are modeled/estimated cost assumptions, not pulled from a live utilities-billing API or a market survey of Dubai holiday-home operators' actual costs. This is another area we'd like external validation on — DEWA/AC costs in particular are a meaningful swing factor.

## 7. Areas flagged as LTR-recommended (STR de-emphasized)

A fixed list of communities (Dubai South, Al Furjan, Arjan, DAMAC Hills 2, Dubailand, International City, Discovery Gardens, Remraam, DAMAC Hills, Town Square) are flagged as having weak STR guest demand due to distance from tourist hubs / oversupply / mostly-residential character. In these areas the model:
- Zeroes out the base and location-demand premiums
- Applies a manually-estimated occupancy loss (18–26%, area-specific) vs. the standard curve
- Still allows STR as an option, just with reduced projected performance, and separately suggests LTR when the LTR rent is under AED 40,000/year in these areas

**Source basis:** these occupancy-loss percentages are internal estimates, not measured — flagged as a priority for validation.

## 8. Yield calculation (when property value is provided)

```
grossYield = annualRevenue / propertyValue × 100
netYield   = annualNetToLandlord / propertyValue × 100
```

## 9. What we specifically want feedback on

1. **Seasonality curves (§5):** Are the apartment/villa monthly occupancy and revenue-share shapes directionally correct for current Dubai STR patterns? Is our claimed "high summer occupancy, low ADR via monthly stays" dynamic overstated or understated?
2. **Premium stack (§4):** Is a 25% max combined premium (view+floor+tier+location+condition) realistic, or should it be tighter/looser given current market softening?
3. **Minimum net-advantage floor (§4):** Is guaranteeing STR nets ≥9% above LTR (26% for studios) a reasonable modeling choice, or does it artificially favor STR recommendations vs. what real operators are seeing today?
4. **Cost assumptions (§6):** Do our DEWA/AC/maintenance/furniture figures look right for 2025–2026 Dubai, or are we missing categories (e.g. platform fees, cleaning turnover cost, Tourism Dirham, insurance)?
5. **LTR-recommended area occupancy losses (§7):** Are 18–26% reasonable haircuts, and are we missing any additional communities that should be flagged, or flagging any that have since improved?
6. **Data source gaps:** We use DLD Ejari data for LTR (very solid) but have no equivalent authoritative real-time STR performance dataset (AirDNA, Key Data, or platform-level data) feeding occupancy/ADR — what's the most cost-effective way to validate/calibrate against real STR performance data for Dubai specifically?

---

*This document reflects the estimator logic in `lib/estimator.ts` as of 2026-08-09. Numeric constants (premiums, occupancy targets, cost tables) are illustrative of current values but may be tuned over time — the structure and methodology described here is the stable part we want reviewed.*
