#!/usr/bin/env node
/**
 * DLD RENT CONTRACTS — INGESTION PIPELINE
 * =======================================
 * Turns the raw Dubai Land Department "Rent Contracts" (Ejari) open dataset
 * into clean, building-level long-term rent benchmarks for GroundWorks.
 *
 * SOURCE
 *   Dubai Pulse → DLD → dld_rent_contracts-open
 *   Dataset page: https://www.dubaipulse.gov.ae/data/dld-registration/dld_rent_contracts-open
 *   CSV (auth required): rent_contracts.csv
 *
 *   The anonymous download is gated behind the data.dubai portal. You must:
 *     1. Register on Dubai Pulse / data.dubai
 *     2. Request access to the "Rent Contracts" dataset
 *     3. Either download the CSV while logged in, OR use the API key/secret
 *        to pull it (see scripts/fetch-dld-rents.mjs once credentials exist).
 *
 * USAGE
 *   node scripts/ingest-dld-rents.mjs <part1.csv> [part2.csv] [part3.csv] ...
 *   # or a single file:
 *   node scripts/ingest-dld-rents.mjs <path-to-rent_contracts.csv>
 *   # or set DLD_CSV=/path/to/rent_contracts.csv (single file)
 *
 *   Multiple files are treated as PARTS of one split dataset — they are read
 *   in sequence into a single pool. Rows are de-duplicated by contract_id, so
 *   overlapping / cumulative snapshot parts won't double-count a contract.
 *
 * OUTPUT
 *   lib/data/building-ltr-rents.json
 *     {
 *       meta: { generatedAt, sourceRows, usedRows, minSamples, monthsWindow },
 *       buildings: { "<normName>": { displayName, area, beds: { "1BR": {median,p25,p75,n} } } },
 *       areas:     { "<area>":     { beds: { "1BR": {median,p25,p75,n} } } }
 *     }
 *
 * NOTE: This script does NOT modify any app logic. It only produces a data file.
 */

import fs from "node:fs";
import readline from "node:readline";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── Config ───────────────────────────────────────────────────────────────
const MIN_SAMPLES = Number(process.env.MIN_SAMPLES ?? 5);     // min contracts for a reliable group
const COLLECT_WINDOW = Number(process.env.COLLECT_WINDOW ?? 60); // months of history to retain
// Recency ladder: try the freshest window first; widen only if too few samples.
const LADDER = (process.env.LADDER ?? "3,6,12,18,24,36,48,60").split(",").map(Number);
const OUT_PATH = path.join(ROOT, "lib", "data", "building-ltr-rents.json");

// Anchor "recent" to the current calendar month.
const NOW = new Date();
const NOW_YM = NOW.getFullYear() * 12 + NOW.getMonth(); // months since year 0

// Accept one or many CSV part paths (or a single path via DLD_CSV).
const csvPaths = process.argv.slice(2).filter(Boolean);
if (csvPaths.length === 0 && process.env.DLD_CSV) csvPaths.push(process.env.DLD_CSV);
if (csvPaths.length === 0) {
  console.error("Usage: node scripts/ingest-dld-rents.mjs <part1.csv> [part2.csv] ...");
  console.error("   or: DLD_CSV=/path/to/rent_contracts.csv node scripts/ingest-dld-rents.mjs");
  process.exit(1);
}
for (const p of csvPaths) {
  if (!fs.existsSync(p)) {
    console.error(`File not found: ${p}`);
    process.exit(1);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────

// Minimal CSV line splitter that respects double-quoted fields.
function splitCSV(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { out.push(cur); cur = ""; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

// Normalize a building / project name to a stable key.
function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(tower|towers|residence|residences|building|bldg|apartment|apartments|the)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Map DLD bedroom text + property type to our UnitSize buckets.
//   bedroomText e.g. "Studio", "1 bed room+hall", "4 bed rooms+hall"  (ejari_property_sub_type_en)
//   propTypeText e.g. "Villa", "Unit"                                  (ejari_property_type_en)
function toBedBucket(bedroomText, propTypeText) {
  const r = String(bedroomText || "").toLowerCase();
  const isVilla = String(propTypeText || "").toLowerCase().includes("villa") || r.includes("villa");
  if (r.includes("studio")) return "STU";
  const m = r.match(/(\d+)\s*bed/) || r.match(/(\d+)\s*b\b/) || r.match(/(\d+)\s*b/);
  const beds = m ? parseInt(m[1], 10) : null;
  if (beds === null) return null;
  if (!isVilla) {
    if (beds <= 1) return "1BR";
    if (beds === 2) return "2BR";
    if (beds === 3) return "3BR";
    if (beds === 4) return "4BR APT";
    if (beds === 5) return "5BR APT";
    return "6BR APT";
  } else {
    if (beds <= 4) return "4BR VILLA";
    if (beds === 5) return "5BR VILLA";
    if (beds === 6) return "6BR VILLA";
    if (beds === 7) return "7BR VILLA";
    if (beds === 8) return "8BR VILLA";
    return "9BR VILLA";
  }
}

// Fuzzy-find a column index by candidate header names (case-insensitive, partial).
function findCol(headers, candidates) {
  const lower = headers.map(h => h.toLowerCase().trim());
  for (const cand of candidates) {
    const exact = lower.indexOf(cand);
    if (exact !== -1) return exact;
  }
  for (const cand of candidates) {
    const idx = lower.findIndex(h => h.includes(cand));
    if (idx !== -1) return idx;
  }
  return -1;
}

function median(sorted) { const n = sorted.length; return n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2; }
function percentile(sorted, p) { const idx = Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1)))); return sorted[idx]; }

// Parse a date string to a year-month integer (year*12 + month-1). Null if invalid.
function toYM(s) {
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d.getFullYear() * 12 + d.getMonth();
}

// Compute the stat object from a chosen subset of contracts.
function statFromSubset(subset, w, basis) {
  const amts = subset.map(e => e.amt).sort((a, b) => a - b);
  const latestYM = subset.reduce((m, e) => Math.max(m, e.ym), 0);

  // Rent per sqft (DLD actual_area is sqm; 1 sqm = 10.7639 sqft)
  const SQM_TO_SQFT = 10.7639;
  const psf = subset.filter(e => e.sqm > 10 && e.sqm < 5000).map(e => (e.amt / e.sqm) / SQM_TO_SQFT).sort((a, b) => a - b);
  const sqftSizes = subset.filter(e => e.sqm > 10 && e.sqm < 5000).map(e => e.sqm * SQM_TO_SQFT).sort((a, b) => a - b);

  const stat = {
    median: Math.round(median(amts)),
    p25: Math.round(percentile(amts, 25)),
    p75: Math.round(percentile(amts, 75)),
    n: amts.length,
    windowMonths: w,
    basis, // "new" = new lets only, "all" = new+renewals fallback
    asOf: `${Math.floor(latestYM / 12)}-${String((latestYM % 12) + 1).padStart(2, "0")}`,
  };
  if (psf.length >= 3) {
    stat.aedPerSqft = Math.round(median(psf));
    stat.medianSqft = Math.round(median(sqftSizes));
  }
  return stat;
}

// Prefer NEW contracts (today's market rate) over renewals (RERA-capped, lagging).
// 1st pass: freshest window with >= MIN_SAMPLES *new* lets → use new-only.
// 2nd pass (fallback): freshest window with >= MIN_SAMPLES of any contract → use all.
function freshestStats(entries) {
  if (entries.length < MIN_SAMPLES) return null;

  // Pass 1 — new lets only
  for (const w of LADDER) {
    const minYM = NOW_YM - w;
    const subset = entries.filter(e => e.isNew && e.ym >= minYM);
    if (subset.length >= MIN_SAMPLES) return statFromSubset(subset, w, "new");
  }
  // Pass 2 — all contracts (new + renewals)
  for (const w of LADDER) {
    const minYM = NOW_YM - w;
    const subset = entries.filter(e => e.ym >= minYM);
    if (subset.length >= MIN_SAMPLES) return statFromSubset(subset, w, "all");
  }
  return null; // not enough data even in the widest window
}

// Read a single CSV part into the shared groups. Returns per-file counters.
async function ingestFile(filePath, ctx) {
  const { buildingGroups, areaGroups, seenIds, minYM } = ctx;
  const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity });

  let headers = null;
  let col = {};
  let sourceRows = 0;
  let usedRows = 0;
  let dupRows = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    if (!headers) {
      headers = splitCSV(line);
      col = {
        id: findCol(headers, ["contract_id", "ejari_contract_no", "contract_no", "contract_number", "id"]),
        project: findCol(headers, ["project_name_en", "project name", "project"]),
        area: findCol(headers, ["area_name_en", "area name", "area"]),
        bedrooms: findCol(headers, ["ejari_property_sub_type_en", "property_sub_type_en", "rooms_en", "rooms"]),
        propType: findCol(headers, ["ejari_property_type_en", "property_type_en", "property_type"]),
        usage: findCol(headers, ["property_usage_en", "usage_en", "usage"]),
        annual: findCol(headers, ["annual_amount", "annual amount", "amount"]),
        start: findCol(headers, ["contract_start_date", "start_date", "registration_date"]),
        areaSqm: findCol(headers, ["actual_area", "area_sqm", "actual area", "procedure_area"]),
        regType: findCol(headers, ["contract_reg_type_en", "reg_type_en", "contract_type"]),
      };
      if (col.project === -1 || col.area === -1 || col.annual === -1) {
        console.error(`Could not locate required columns in ${filePath}. Headers found:`);
        console.error(headers.join(" | "));
        process.exit(1);
      }
      if (col.id === -1) {
        console.warn("  ⚠ No contract_id column found — cross-part de-duplication disabled for this file.");
      }
      console.log("Column mapping:", col);
      continue;
    }

    sourceRows++;
    const f = splitCSV(line);

    // De-dup by contract_id across all parts (handles overlapping/cumulative snapshots).
    if (col.id !== -1) {
      const id = (f[col.id] || "").trim();
      if (id) {
        if (seenIds.has(id)) { dupRows++; continue; }
        seenIds.add(id);
      }
    }

    // Residential only
    if (col.usage !== -1) {
      const u = (f[col.usage] || "").toLowerCase();
      if (u && !u.includes("residential")) continue;
    }

    // Recency: keep only contracts within the collection window, drop future-dated.
    const ym = col.start !== -1 ? toYM(f[col.start]) : null;
    if (ym === null || ym > NOW_YM || ym < minYM) continue;

    const annual = Number(String(f[col.annual] || "").replace(/[^0-9.]/g, ""));
    if (!annual || annual < 5000 || annual > 20000000) continue; // sanity bounds

    const bed = toBedBucket(
      col.bedrooms !== -1 ? f[col.bedrooms] : "",
      col.propType !== -1 ? f[col.propType] : ""
    );
    if (!bed) continue;

    const projectRaw = f[col.project] || "";
    const area = (f[col.area] || "").trim();
    const norm = normalizeName(projectRaw);
    if (!norm || !area) continue;

    usedRows++;

    // actual_area is in square metres in the DLD dataset
    const sqm = col.areaSqm !== -1 ? Number(String(f[col.areaSqm] || "").replace(/[^0-9.]/g, "")) : 0;
    // New vs Renew — new lets reflect today's market rate; renewals lag (RERA-capped)
    const isNew = col.regType !== -1 ? (f[col.regType] || "").toLowerCase().includes("new") : false;

    const bKey = `${norm}||${bed}`;
    if (!buildingGroups.has(bKey)) buildingGroups.set(bKey, { displayName: projectRaw.trim(), area, entries: [] });
    buildingGroups.get(bKey).entries.push({ ym, amt: annual, sqm, isNew });

    const aKey = `${area}||${bed}`;
    if (!areaGroups.has(aKey)) areaGroups.set(aKey, []);
    areaGroups.get(aKey).push({ ym, amt: annual, sqm, isNew });

    if (sourceRows % 200000 === 0) console.log(`  …processed ${sourceRows.toLocaleString()} rows (${path.basename(filePath)})`);
  }

  return { sourceRows, usedRows, dupRows };
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  const minYM = NOW_YM - COLLECT_WINDOW;

  // group key -> dated entries (so we can prefer the freshest window later)
  const buildingGroups = new Map(); // `${norm}||${bed}` -> { displayName, area, entries:[{ym,amt}] }
  const areaGroups = new Map();     // `${area}||${bed}`  -> entries:[{ym,amt}]
  const seenIds = new Set();        // contract_id de-dup across all parts
  const ctx = { buildingGroups, areaGroups, seenIds, minYM };

  let sourceRows = 0;
  let usedRows = 0;
  let dupRows = 0;
  for (const filePath of csvPaths) {
    console.log(`\n── Ingesting ${path.basename(filePath)} ──`);
    const r = await ingestFile(filePath, ctx);
    sourceRows += r.sourceRows;
    usedRows += r.usedRows;
    dupRows += r.dupRows;
    console.log(`  ${path.basename(filePath)}: ${r.sourceRows.toLocaleString()} rows, ${r.usedRows.toLocaleString()} used, ${r.dupRows.toLocaleString()} dup`);
  }

  // Build output — each group uses its FRESHEST reliable window, new lets preferred.
  let basisNew = 0, basisAll = 0;
  const buildings = {};
  for (const [key, g] of buildingGroups) {
    const stat = freshestStats(g.entries);
    if (!stat) continue;
    if (stat.basis === "new") basisNew++; else basisAll++;
    const [norm, bed] = key.split("||");
    if (!buildings[norm]) buildings[norm] = { displayName: g.displayName, area: g.area, beds: {} };
    buildings[norm].beds[bed] = stat;
  }

  const areas = {};
  for (const [key, entries] of areaGroups) {
    const stat = freshestStats(entries);
    if (!stat) continue;
    const [area, bed] = key.split("||");
    if (!areas[area]) areas[area] = { beds: {} };
    areas[area].beds[bed] = stat;
  }

  const out = {
    meta: {
      generatedAt: new Date().toISOString(),
      sourceFiles: csvPaths.map(p => path.basename(p)),
      sourceRows,
      usedRows,
      duplicateRowsSkipped: dupRows,
      minSamples: MIN_SAMPLES,
      collectWindow: COLLECT_WINDOW,
      ladder: LADDER,
      buildingsCovered: Object.keys(buildings).length,
      areasCovered: Object.keys(areas).length,
      buildingBedsFromNewLets: basisNew,
      buildingBedsFromAllContracts: basisAll,
    },
    buildings,
    areas,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log(`\n✓ Wrote ${OUT_PATH}`);
  console.log(`  files: ${csvPaths.length} | rows seen: ${sourceRows.toLocaleString()} | used: ${usedRows.toLocaleString()} | dup skipped: ${dupRows.toLocaleString()}`);
  console.log(`  buildings: ${out.meta.buildingsCovered} | areas: ${out.meta.areasCovered}`);
}

main().catch(e => { console.error(e); process.exit(1); });
