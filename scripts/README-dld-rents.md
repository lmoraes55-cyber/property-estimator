# DLD Long-Term Rent Data Pipeline

Turns the official **Dubai Land Department "Rent Contracts" (Ejari) open dataset**
into building-level actual long-term rent benchmarks used by the estimator.

## 1. Get the data

The dataset lives on Dubai Pulse:
https://www.dubaipulse.gov.ae/data/dld-registration/dld_rent_contracts-open

The anonymous CSV download is **gated behind the `data.dubai` portal**. You need to either:

**Option A — Manual CSV (fastest to start)**
1. Register / log in on Dubai Pulse.
2. Open the "Rent Contracts" dataset and download `rent_contracts.csv`.
3. Save it locally (it is large — hundreds of MB).

**Option B — API (for automated refresh)**
1. Request access to the dataset → you receive an **API Key** and **API Secret** by email.
2. Get a bearer token:
   ```
   POST https://api.dubaipulse.gov.ae/oauth/client_credential/accesstoken?grant_type=client_credentials
   body: client_id={API Key}&client_secret={API Secret}
   ```
3. Call the dataset API with header `Authorization: Bearer {token}`.

> Store credentials in `.env.local` (never commit them):
> `DLD_API_KEY=...` / `DLD_API_SECRET=...`

## 2. Build the building-level dataset

```bash
node scripts/ingest-dld-rents.mjs /path/to/rent_contracts.csv
# or
DLD_CSV=/path/to/rent_contracts.csv node scripts/ingest-dld-rents.mjs
```

Tunables (env vars):
- `MIN_SAMPLES` (default 5) — minimum registered contracts for a building×bedroom group to be published.
- `MONTHS_WINDOW` (default 18) — only include contracts started within this many months.

Output: `lib/data/building-ltr-rents.json`
```jsonc
{
  "meta": { "generatedAt", "sourceRows", "usedRows", "buildingsCovered", "areasCovered" },
  "buildings": { "<normalized name>": { "displayName", "area", "beds": { "1BR": { "median","p25","p75","n" } } } },
  "areas":     { "<area name>":       { "beds": { "1BR": { "median","p25","p75","n" } } } }
}
```

## 3. How it's used

`lib/estimator.ts → getLTRMarketRent()` now resolves rent in this order:
1. **Building-level** actual median from DLD (`lib/building-rents.ts`).
2. **Area-level** actual median from DLD.
3. **Internal community-average** table (existing fallback) — used until the dataset is ingested.

The `source` string surfaced in the report reflects which tier was used, e.g.
`"47 registered DLD contracts · Marina Gate"`.

## Notes
- The committed JSON is a **placeholder** (empty) so the app builds; lookups fall back to the internal table until you run the ingest.
- Building-name matching uses a normalized key; DLD project names are messy, so coverage improves as we refine `normalizeName()` and the `BUILDING_DIRECTORY` mapping.
