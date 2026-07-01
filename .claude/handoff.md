# AssetIntel — Engineering Handoff

_Last updated: 2026-06-12 • Repo: lmoraes55-cyber/property-estimator • Local: /Users/leonmoraes/property-estimator • Live: assetintel.ae (Vercel)_

## 1. What AssetIntel is

A Dubai property rental consultancy app. An owner enters their property; the app tells them whether **Short-Term Rental (STR)** or **Long-Term Rental (LTR)** earns more, by how much, and then **matches them to a vetted operator (STR) or leasing agent (LTR)**. The free estimator is the lead magnet; money comes from success-only referral fees and direct paid services.

**Guiding principle:** always give owners *realistic, achievable* Dubai numbers — never inflated figures. Credibility is the product.

## 2. Tech stack & build gotchas

- **Next.js 16.2.7** (App Router) — ⚠️ NON-STANDARD. APIs differ from training data. Read `node_modules/next/dist/docs/` before writing Next code (see `AGENTS.md`). React 19, TypeScript, Tailwind, Recharts.
- Deployed on **Vercel Hobby** → builds are **serial**; a stuck build blocks the queue (cancel it).
- **Inline styles can't use CSS media queries** → use `lib/useIsMobile.ts` (`useIsMobile(768)`) or CSS Grid `repeat(auto-fit, minmax(...))` for responsive behavior. Mobile verified clean at 375px.
- Aesthetic: dark-gold premium (Leon's preference). See `DESIGN_SYSTEM.md`, `lib/colors.ts`.

## 3. Architecture map

### Pages (`app/`)
- `page.tsx` — homepage: hero, services, "Why AssetIntel" trust section, pricing hints.
- `estimator/` — input flow (Step 2 has optional **unit size in sqm** for rent-per-sqft refinement).
- `report/page.tsx` — the result: compact executive summary card, KPI cards as **confidence ranges**, Monthly Breakdown table (no TOTAL row), charts, LTR recommendation modal, two premium CTA cards → operators/agents.
- `operators/page.tsx` & `agents/page.tsx` — premium ranked-recommendation layout (property summary bar, 2 top picks, Other, New/Boutique, "How AssetIntel Ranks"). Contact buttons open `LeadModal`.
- `self-manage/page.tsx` — paid-services + `#pricing` section.
- `furnishing/` — furnishing flow.
- `api/lead/route.ts` — lead capture endpoint.

### Core logic (`lib/`)
- **`estimator.ts`** — the brain. `getLTRMarketRent(building, unitSize, sizeSqft?)` (building→area→table cascade, returns rent + source + range + asOf + basis). `getSTRDemand()` (prime / strong / value-monthly tiers). Occupancy: `OCC_BASE_SHAPE` seasonal curve (winter peak), **90% hard cap**, dynamic quality adj, per-bedroom floor (studios/1BR full upside, 2BR/3BR dampened). `MIN_STR_NET_ADVANTAGE = 0.18` (STR must beat LTR by ~15–20%).
- **`building-rents.ts`** — fuzzy/alias building matching (canon abbreviations, variant merge).
- **`buildings-data.ts`**, **`agents.ts`** (incl. `BOUTIQUE_AGENTS`), **`operators-data.ts`**, **`operator-profiles.ts`**, **`furnishing.ts`**, **`colors.ts`**, **`useIsMobile.ts`**.
- **`data/building-ltr-rents.json`** (~1.25 MB) — generated LTR ground-truth: 1,406 buildings / 3,694 building-beds, median/p25/p75 per bedroom, all on NEW-let basis.

### Data pipeline (`scripts/`)
- **`ingest-dld-rents.mjs`** — parses DLD Ejari rent-contracts CSV → `building-ltr-rents.json`. Filters residential, parses bedrooms (`ejari_property_sub_type_en`) + villa flag (`ejari_property_type_en`), recency-tiered windows, **prioritizes NEW contracts** over renewals (renewals are RERA-capped, lag the market). **Accepts multiple CSV part paths** and pools them into one dataset, **de-duplicating by `contract_id`** (safe for overlapping/cumulative split parts). Overwrites output. See `scripts/README-dld-rents.md`.
- `fetch-dld-rents.mjs` — fetch helper.

### Components
- `LeadModal.tsx` — captures name/phone/email; `targetType` = `operator` | `agent` | `service`.
- `AssetIntelLogo.tsx`, `FilterPanel.tsx`.

### Agreements (`docs/`)
- `partnership-agreement.md` (operators), `partnership-agreement-agent.md` (agents). Success-only, non-circumvention, PDPL/consent, Dubai law. **Templates — awaiting lawyer review before going live.**

## 4. Business logic & monetization

- **Free** estimator → STR-vs-LTR decision → operator/agent match.
- **Success-only referral fees** (charged ONLY on conversion): one-time fee per signed property/lease, OR a % of income (operators: % of gross rental income over first 12 mo; agents: % of leasing commission). No per-lead fee, nothing if unconverted.
- **Direct paid services** (one-time AED): Self-Manage (Setup AED 1,500 / Launch+Coaching AED 2,900); Operations Help (Essentials AED 3,500 / Premium AED 5,500). Ongoing management left to operator partners.

### Lead engine (live, verified end-to-end)
- `api/lead/route.ts` generates a `GW-YYMM-XXXX` ref, logs (`[GW-LEAD]` / `[GW-SERVICE-LEAD]`), forwards to a webhook.
- **Two Google Sheets** via Apps Script webhooks (Vercel env vars):
  - `LEAD_WEBHOOK_URL` → "AssetIntel Leads" (operator/agent intros, carry full property + analysis snapshot).
  - `LEAD_WEBHOOK_URL_SERVICES` → "AssetIntel Service Leads" (self-manage/operations).

## 5. What we need to build next

**Immediate (data refresh — in progress):**
1. Download the remaining DLD rent-contract CSV **parts** from Dubai Pulse (have part `_1`/05-20; need the `_2` parts: 05-22, 05-23, 05-27, 05-30, + scroll for more). They are split parts of ONE dataset.
2. Re-run ingest passing **all parts directly** (no manual merge needed — the script now pools multiple files and de-dups by `contract_id`):
   ```bash
   node scripts/ingest-dld-rents.mjs ~/Downloads/dld_parts/*.csv
   ```
3. Confirm the meta in `building-ltr-rents.json` looks sane (`sourceRows`, `duplicateRowsSkipped`, `buildingsCovered`), then commit the refreshed JSON.

**Accuracy / model:**
- Cross-check modeled STR outputs (ADR + occupancy) against **AirDNA** (Rentalizer/MarketMinder) or similar, then calibrate `estimator.ts` constants to observed reality. STR side is the part most needing external validation (LTR is already DLD ground-truth).

**Monetization / ops:**
- E-sign setup for partnership agreements (PandaDoc/Zoho Sign free tier).
- "New AssetIntel Lead" forward/notification message to partners.
- Lead Status → billing workflow in the sheets.
- Optional `/leads` admin view.
- Lawyer review of both agreements before going live.

**Cleanup:**
- Operators-page dead-code cleanup.

## 6. How to run / deploy

**Local dev:**
```bash
npm install
npm run dev          # next dev → http://localhost:3000
```
For browser verification use the `preview_*` tools (preview_start, preview_snapshot, preview_screenshot), not raw Bash/Chrome.

**Build & lint:**
```bash
npm run build        # next build (⚠ non-standard Next 16 — see AGENTS.md)
npm run lint         # eslint
```

**Deploy:** push to the repo's main branch → Vercel auto-builds (Hobby plan, **serial** builds). If a build hangs on "Initializing" it blocks the queue — cancel it in the Vercel dashboard, then redeploy. Commit/push only when Leon asks.

**Env vars (set in Vercel project settings):**
- `LEAD_WEBHOOK_URL` — Google Apps Script web-app URL for the "AssetIntel Leads" sheet.
- `LEAD_WEBHOOK_URL_SERVICES` — web-app URL for the "AssetIntel Service Leads" sheet.

**Refresh LTR data:**
```bash
# one or many DLD CSV parts; pooled + de-duped by contract_id
node scripts/ingest-dld-rents.mjs <part1.csv> [part2.csv] ...
# tuning knobs (env): MIN_SAMPLES, COLLECT_WINDOW, LADDER
```
Then commit the regenerated `lib/data/building-ltr-rents.json`.

## 7. Key constraints to respect (Leon's rules)
- STR numbers must be **achievable in Dubai**, never inflated.
- Occupancy **never above 90%**; per-bedroom values are a floor that can flex ±2–3%.
- STR-vs-LTR net advantage stays in the **15–20%** band (`MIN_STR_NET_ADVANTAGE = 0.18`).
- LTR from **real DLD data, NEW contracts prioritized**; STR is modeled.
- Service leads go to a **separate sheet** from operator/agent leads.
- Assume **Dubai context** by default.
