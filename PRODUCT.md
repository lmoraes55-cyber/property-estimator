# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dubai property owners and investors deciding between short-term-rental (STR) and long-term-rental (LTR) strategies, plus STR operators and agents evaluating opportunities. They come to AssetIntel to replace guesswork with real registered market data before committing to a rental strategy, a building, or an operator.

## Product Purpose

AssetIntel is a Dubai property-intelligence platform: an LTR/STR rental estimator, area and building market intelligence, and operator/agent matching, all grounded in live Dubai Land Department (DLD) transaction data plus real STR market data (AirROI, Airbtics). It exists so an owner or investor can get a realistic, data-backed answer to "what will this property actually earn, and which strategy fits it" — not a generic listing-site estimate.

## Positioning

Independent and data-grounded: AssetIntel is not a broker or operator and earns no commission tied to steering a recommendation toward any specific building, area, or operator. Every estimate traces back to a real source — registered DLD contracts for LTR, live AirROI/Airbtics market data for STR — rather than assumptions or a sales-driven model.

## Operating Context

Core workflows: run a rental estimator (LTR vs STR) for a specific unit; browse Dubai-wide STR/LTR market intelligence by area and building; get matched with a vetted STR operator or leasing agent; generate and save/export a property report; STR sub-leasing risk assessment; self-management guidance for STR owners. Data refreshes weekly via a scheduled job pulling DLD, AirROI, and Airbtics.

## Capabilities and Constraints

- LTR rent benchmarks are sourced live from DLD's registered Ejari rent-contract data (building-level where available, area-level fallback), with a static ingested-snapshot fallback if the live call fails.
- STR market figures (ADR, occupancy, RevPAR, comparable listings) are blended from two independent sources (AirROI + Airbtics) where both cover an area; some areas are single-source or approximated via a geo-radius listings sample when neither provider recognizes the area as a named market — this must stay visibly distinguished, not blended silently into "real" figures.
- The STR revenue model applies a premium-and-cost stack (view, floor, building tier, location demand, condition) on top of the LTR baseline — this is a documented internal model, not a scraped STR-specific projection for every individual unit.
- No brokerage, no direct property listings/marketplace, no payment processing beyond a lead-capture/consultation-booking flow.

## Brand Commitments

The "Chartered Estate" visual system (see DESIGN.md) is an established, durable identity across the site — deep forest green + aged bronze on warm ivory, Georgia serif for headlines/numbers, restrained/quiet-authority tone. New surfaces inherit it rather than introducing a competing visual language.

## Evidence on Hand

Real live data: DLD Ejari rent contracts and sale transactions (via the DDA/DLD open-data API), AirROI and Airbtics STR market summaries and listing samples, refreshed weekly and stored in `str_market_area_stats`. Some page content (e.g. STR Building Watchlist scores, Area Opportunity Ranking, "AssetIntel View" commentary) is AssetIntel's own directional/editorial scoring model, not measured data — this distinction must stay visible to the user, never presented with the same authority as sourced figures.

## Product Principles

1. Never overstate certainty: modeled, directional, or approximated figures must be visually and textually distinguishable from verified DLD/AirROI/Airbtics data — real money and investment decisions ride on this distinction.
2. Independence over conversion: the product must not visually or editorially steer a user toward a specific paid outcome (operator, area, building) in a way that reads as unbiased fact.
3. Every number should be traceable to a source a skeptical owner could go verify themselves.
4. Restraint over volume: the Chartered Estate system earns trust by being quietly correct, not by performing confidence or urgency.

## Accessibility & Inclusion

No product-specific requirement established beyond general WCAG AA text-contrast compliance (see DESIGN.md's Bronze-Text Rule, added after a contrast audit).
