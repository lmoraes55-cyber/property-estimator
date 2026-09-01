# DLD Long-Term Rent Data Pipeline

Turns the official **Dubai Land Department "Rent Contracts" (Ejari) dataset**
into the building-level rent benchmarks the estimator uses
(`lib/data/building-ltr-rents.json`).

## Quick start

```bash
npm run dld:refresh      # pull the last 24 months, then re-ingest
npm run dld:verify       # assert the regenerated dataset's invariants
```

`dld:refresh` needs `.env.dda` (see **Credentials**). Expect ~1.5 hours.

## 1. Source

Data comes from the **credentialed DDA API**, `dld_rent_contracts-open-api`,
via `scripts/pull-dda-bulk.mjs`. It is current to the same day.

Two sources that do **not** work, both tried and removed:

- **Dubai Pulse** (`dubaipulse.gov.ae/data/dld-registration/dld_rent_contracts-open`)
  — dead. Now 200s with HTML and redirects to `data.dubai`. The old
  `scripts/fetch-dld-rents.mjs` targeted it and appears never to have run.
- **The public data.dubai portal endpoint** (`/o/dda/data-services/dataset-metadata`)
  — unauthenticated but cannot serve a complete extract. A full run returned
  714,000 rows of which only 523,736 were distinct: it re-serves earlier pages
  from around page 19, and what it returns skews to 2010-2013.

**Access is restricted to within the UAE.** This cannot run on GitHub Actions
or any non-UAE CI. Run it locally, or from a Vercel function pinned to `dxb1`.

## 2. Credentials

`DDA_BASE_URL`, `DDA_APP_IDENTIFIER`, `DDA_CLIENT_ID`, `DDA_CLIENT_SECRET`.

These are marked **Secret** in Vercel, which is one-way — `vercel env pull`
writes `[SENSITIVE]` and the values can never be read back from the CLI or
dashboard. Keep a local copy in `.env.dda` (gitignored, chmod 600). The
originals came from the DDA access-grant email.

`DDA_BASE_URL` is `https://apis.data.dubai` for PROD (`https://stg-apis.data.dubai`
for staging). The token path the client appends is
`/secure/ssis/dubaiai/gatewaytoken/1.0.0/getAccessToken`.

## 3. Pulling

```bash
node --env-file=.env.dda scripts/pull-dda-bulk.mjs --since-months 24 --residential
node --env-file=.env.dda scripts/pull-dda-bulk.mjs --check      # 3 requests, verifies pagination
node --env-file=.env.dda scripts/pull-dda-bulk.mjs --after CRT…  # keyset resume
```

Things worth knowing about this API, all measured:

- **Responses are hard-capped at 1,000 rows** whatever `pageSize` asks for
  (2000/5000/10000 all return 1000; 20000 is a 422). A full unfiltered pull is
  ~10,000 requests, roughly 17 hours — hence `--since-months`, which cuts it
  by about 10x.
- **Filters must be ONE `filter` param joined with `AND`.** Repeating the param
  does not AND them: the API silently keeps only the LAST condition and drops
  the rest, returning 200 with plausible rows. `ddaQuery` in
  `lib/dda-client.ts` handles this; so does the puller.
- **Sorting is required for stable pagination.** With `order_by` the same page
  returns an identical row set on repeat fetches; without it, two fetches of
  the same page share zero rows.
- **Exact equality on a date times out** (`contract_start_date='2026-08-01'`
  → 408). `>=` on the same column is fine.
- **Offset paging degrades with depth** — ~19 pages/min at the start, 3/min by
  page 1,490. `--after <contract_id>` restarts at page 1 behind a cursor and
  restores full speed. Safe because rows come back ordered by `contract_id`
  ascending.
- **The gateway degrades independently of query shape.** When it does, every
  query 408s at a fixed 30.1s, including an unfiltered page-1 request. No
  pagination strategy avoids this; wait and resume with `--after`.

The puller checkpoints every page and de-dups on `contract_id|line_number`,
so it resumes without re-downloading or double-counting. It aborts at page 20
if duplicates exceed 5%, so a broken ordering assumption costs a minute rather
than the whole run.

## 4. Ingesting

```bash
node scripts/ingest-dld-rents.mjs data/raw/dda_rent_contracts.ndjson
```

Accepts NDJSON (from the puller), CSV (a manual export), `-` for stdin, or
several files at once. Tunables via env: `MIN_SAMPLES` (5), `COLLECT_WINDOW`
(24 months), `RECENT_N` (12), `SPREAD_MIN_N` (10), `OUT_PATH`,
`MAX_COVERAGE_DROP` (0.2), `FORCE`.

It **refuses to write** if building coverage would fall more than
`MAX_COVERAGE_DROP` against the existing file — that is what stops an upstream
schema change from quietly committing a gutted dataset. A drop is expected when
tightening the window or the sample floor; look at the numbers, then re-run
with `FORCE=1`.

Output shape:

```jsonc
{
  "meta":      { "generatedAt", "usedRows", "buildingsCovered", "mastersCovered", … },
  "buildings": { "<normalized name>": { "displayName", "area", "projectNumber", "master", "beds": { … } } },
  "masters":   { "<DLD master_project_en>": { "area", "beds": { … } } },
  "areas":     { "<DLD area_name_en>":      { "beds": { … } } },
  "aliases":   { "<normalized name>": "<project_number>" }
}
```

`p25`/`p75` are omitted below `SPREAD_MIN_N` contracts rather than published as
a range that means nothing.

## 5. How it is used

`lib/estimator.ts → getLTRMarketRent()` resolves in this order:

1. **Building** — exact key, then DLD `project_number` via `aliases`, then fuzzy.
2. **Master community** — `lib/building-rents.ts → lookupDLDMaster()`.
3. **DLD area**.
4. Internal table.

The master tier exists because several DLD areas pool different markets. Marsa
Dubai covers Dubai Marina, JBR, Dubai Harbour and Bluewaters; falling straight
to the area figure overstates JBR by roughly 49%.

`app/api/ltr-rents/route.ts` runs the same cascade against the live API and
reports which tier answered in `matchLevel`. A `master` or `area` result is
**pooled, not building-specific** — never present it as the requested building.

## 6. Known gaps

- Buildings are grouped by normalized name, not `project_number`, so distinct
  projects that normalize identically still merge (`"marina"` is
  `MARINA RESIDENCE` in Palm Jumeirah).
- Only ~23% of residential contracts carry a building tag at all — a source-side
  ceiling. In the core investor areas it is ~71%.
- A community label must be at least two tokens to resolve to a DLD master —
  single generic tokens are refused as too collision-prone. Use
  `"Jumeirah Village Triangle (JVT)"`, not `"JVT"`.
