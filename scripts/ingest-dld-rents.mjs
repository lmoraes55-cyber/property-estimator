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
const COLLECT_WINDOW = Number(process.env.COLLECT_WINDOW ?? 24); // months of history to retain
// Below this sample size a p25/p75 spread is noise, not a range, so it is
// omitted entirely rather than published as if it meant something. Consumers
// treat a missing range as "no range to show".
const SPREAD_MIN_N = Number(process.env.SPREAD_MIN_N ?? 10);
// Refuse to replace a good dataset with a gutted one. The upstream endpoint is
// an undocumented portal internal: a schema change, a truncated pull, or a
// mis-set window would otherwise quietly commit a near-empty file to
// production. Override deliberately with FORCE=1 once you have looked at why.
const MAX_COVERAGE_DROP = Number(process.env.MAX_COVERAGE_DROP ?? 0.2);
const FORCE = process.env.FORCE === "1";
// Recency ladder: try the freshest window first; widen only if too few samples.
const LADDER = (process.env.LADDER ?? "3,6,12,18,24,36,48,60").split(",").map(Number);
const OUT_PATH = process.env.OUT_PATH || path.join(ROOT, "lib", "data", "building-ltr-rents.json");

// Anchor "recent" to the current calendar month.
const NOW = new Date();
const NOW_YM = NOW.getFullYear() * 12 + NOW.getMonth(); // months since year 0

// Accept one or many CSV part paths (or a single path via DLD_CSV).
const csvPaths = process.argv.slice(2).filter(Boolean);
if (csvPaths.length === 0 && process.env.DLD_CSV) csvPaths.push(process.env.DLD_CSV);
if (csvPaths.length === 0) {
  console.error("Usage: node scripts/ingest-dld-rents.mjs <part1.csv> [part2.csv] ...");
  console.error("   or: DLD_CSV=/path/to/rent_contracts.csv node scripts/ingest-dld-rents.mjs");
  console.error("   or: node --env-file=.env.dda scripts/pull-dda-bulk.mjs --since-months 24 --residential");
  console.error("       then: node scripts/ingest-dld-rents.mjs data/raw/dda_rent_contracts.ndjson");
  process.exit(1);
}
for (const p of csvPaths) {
  if (p === "-") continue; // stdin, nothing to stat
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
  w = w ?? null; // windowMonths is no longer used (replaced by RECENT_N approach)
  const amts = subset.map(e => e.amt).sort((a, b) => a - b);
  const latestYM = subset.reduce((m, e) => Math.max(m, e.ym), 0);

  // Rent per sqft (DLD actual_area is sqm; 1 sqm = 10.7639 sqft)
  const SQM_TO_SQFT = 10.7639;
  const psf = subset.filter(e => e.sqm > 10 && e.sqm < 5000).map(e => (e.amt / e.sqm) / SQM_TO_SQFT).sort((a, b) => a - b);
  const sqftSizes = subset.filter(e => e.sqm > 10 && e.sqm < 5000).map(e => e.sqm * SQM_TO_SQFT).sort((a, b) => a - b);

  const stat = {
    median: Math.round(median(amts)),
    n: amts.length,
    windowMonths: w,
    basis, // "new" = new lets only, "all" = new+renewals fallback
    asOf: `${Math.floor(latestYM / 12)}-${String((latestYM % 12) + 1).padStart(2, "0")}`,
  };
  if (amts.length >= SPREAD_MIN_N) {
    stat.p25 = Math.round(percentile(amts, 25));
    stat.p75 = Math.round(percentile(amts, 75));
  }
  if (psf.length >= 3) {
    stat.aedPerSqft = Math.round(median(psf));
    stat.medianSqft = Math.round(median(sqftSizes));
  }
  return stat;
}

// How many most-recent contracts feed a stat. 4 capped every published median
// at n=4, where one outlier moves it ~25%. Over a 24-month window 2,636
// building x bed groups reach n>=5 and 1,342 reach n>=20, so 12 buys real
// stability while staying recent.
const RECENT_N = Number(process.env.RECENT_N ?? 12);

// Take the N most-recent new lets; fall back to all contracts if not enough new ones.
function freshestStats(entries) {
  if (!entries.length) return null;

  // Sort descending by contract month
  const byDate = [...entries].sort((a, b) => b.ym - a.ym);

  // Pass 1 — most recent N new lets
  const newOnly = byDate.filter(e => e.isNew);
  if (newOnly.length >= MIN_SAMPLES) {
    const subset = newOnly.slice(0, RECENT_N);
    return statFromSubset(subset, null, "new");
  }

  // Pass 2 — most recent N of any contract (new + renewals)
  if (byDate.length >= MIN_SAMPLES) {
    const subset = byDate.slice(0, RECENT_N);
    return statFromSubset(subset, null, "all");
  }

  return null;
}

// Read a single CSV part into the shared groups. Returns per-file counters.
// Column list for NDJSON input. Rows come from the dld_rent_contracts dataset,
// whose schema matches the CSV export field-for-field; a key missing on any
// given row just reads as "". Hardcoded rather than derived from the first
// row's keys, because rows with null project/master fields omit them entirely.
const NDJSON_COLUMNS = [
  "contract_id", "contract_reg_type_id", "contract_reg_type_ar", "contract_reg_type_en",
  "contract_start_date", "contract_end_date", "contract_amount", "annual_amount",
  "no_of_prop", "line_number", "is_free_hold",
  "ejari_bus_property_type_id", "ejari_bus_property_type_ar", "ejari_bus_property_type_en",
  "ejari_property_type_id", "ejari_property_type_en", "ejari_property_type_ar",
  "ejari_property_sub_type_id", "ejari_property_sub_type_en", "ejari_property_sub_type_ar",
  "property_usage_en", "property_usage_ar",
  "project_number", "project_name_ar", "project_name_en",
  "master_project_ar", "master_project_en",
  "area_id", "area_name_ar", "area_name_en", "actual_area",
  "nearest_landmark_ar", "nearest_landmark_en", "nearest_metro_ar", "nearest_metro_en",
  "nearest_mall_ar", "nearest_mall_en",
  "tenant_type_id", "tenant_type_ar", "tenant_type_en", "load_timestamp",
];

function buildColMap(headers) {
  return {
    id: findCol(headers, ["contract_id", "ejari_contract_no", "contract_no", "contract_number", "id"]),
    project: findCol(headers, ["project_name_en", "project name", "project"]),
    area: findCol(headers, ["area_name_en", "area name", "area"]),
    bedrooms: findCol(headers, ["ejari_property_sub_type_en", "property_sub_type_en", "rooms_en", "rooms"]),
    propType: findCol(headers, ["ejari_property_type_en", "property_type_en", "property_type"]),
    usage: findCol(headers, ["property_usage_en", "usage_en", "usage"]),
    annual: findCol(headers, ["annual_amount", "annual amount", "amount"]),
    start: findCol(headers, ["contract_start_date", "start_date", "registration_date"]),
    end: findCol(headers, ["contract_end_date", "end_date", "expiry_date"]),
    areaSqm: findCol(headers, ["actual_area", "area_sqm", "actual area", "procedure_area"]),
    regType: findCol(headers, ["contract_reg_type_en", "reg_type_en", "contract_type"]),
    line: findCol(headers, ["line_number"]),
    noOfProp: findCol(headers, ["no_of_prop"]),
    projNum: findCol(headers, ["project_number"]),
    areaId: findCol(headers, ["area_id"]),
    master: findCol(headers, ["master_project_en"]),
  };
}

async function ingestFile(filePath, ctx) {
  const { buildingGroups, areaGroups, masterGroups, seenIds, minYM } = ctx;
  // "-" means NDJSON on stdin, so a pull can stream straight in without ever
  // writing ~13.5 GB to disk.
  const isStdin = filePath === "-";
  const rl = readline.createInterface({
    input: isStdin ? process.stdin : fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  let headers = null;
  let col = {};
  let sourceRows = 0;
  let usedRows = 0;
  let dupRows = 0;
  let multiPropRows = 0;

  const isNdjson = isStdin || /\.(ndjson|jsonl)$/i.test(filePath);

  for await (const line of rl) {
    if (!line.trim()) continue;

    let f;
    if (isNdjson) {
      let obj;
      try { obj = JSON.parse(line); } catch { continue; }
      if (!headers) {
        headers = NDJSON_COLUMNS;
        col = buildColMap(headers);
        console.log("NDJSON input — column mapping:", col);
      }
      f = headers.map(h => String(obj[h] ?? ""));
    } else {
      if (!headers) {
        headers = splitCSV(line);
        col = buildColMap(headers);
        if (col.project === -1 || col.area === -1 || col.annual === -1) {
          console.error(`Could not locate required columns in ${filePath}. Headers found:`);
          console.error(headers.join(" | "));
          process.exit(1);
        }
        console.log("Column mapping:", col);
        continue;
      }
      f = splitCSV(line);
    }

    sourceRows++;

    // De-dup across all parts (handles overlapping/cumulative snapshots).
    // Key MUST include line_number: one contract_id covers N properties as
    // separate lines (line_number 1..N), and keying on contract_id alone
    // silently discards every line after the first — 11.7% of rows measured.
    if (col.id !== -1) {
      const id = (f[col.id] || "").trim();
      if (id) {
        const dedupeKey = col.line !== -1 ? `${id}|${(f[col.line] || "").trim()}` : id;
        if (seenIds.has(dedupeKey)) { dupRows++; continue; }
        seenIds.add(dedupeKey);
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

    // Duration filter: annual LTR contracts only (330–400 days).
    // Short-term (3/6-month) contracts inflate the rent figure — exclude them.
    if (col.end !== -1 && col.start !== -1) {
      const startMs = new Date(f[col.start]).getTime();
      const endMs = new Date(f[col.end]).getTime();
      if (!isNaN(startMs) && !isNaN(endMs)) {
        const days = (endMs - startMs) / 86400000;
        if (days < 330 || days > 400) continue;
      }
    }

    // Multi-property contracts: annual_amount is the CONTRACT TOTAL across all
    // no_of_prop units, not a per-unit rent, and every line_number of the
    // contract repeats that same total. Measured on real data, the median
    // amount on a no_of_prop>=4 row is 23-44x the single-unit median for the
    // same bedroom bucket. A portfolio lease is not a comparable for one
    // unit's market rent, so drop these rather than trying to apportion a
    // total across units we cannot individually size.
    const noOfProp = col.noOfProp !== -1 ? Number(f[col.noOfProp]) || 1 : 1;
    if (noOfProp > 1) { multiPropRows++; continue; }

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
    // Only `area` is required. A contract with no project name still carries a
    // valid area and must feed the area tier — 77% of residential contracts are
    // untagged, and gating the area push on `norm` discarded all of them.
    if (!area) continue;

    usedRows++;

    // actual_area is in square metres in the DLD dataset
    const sqm = col.areaSqm !== -1 ? Number(String(f[col.areaSqm] || "").replace(/[^0-9.]/g, "")) : 0;
    // New vs Renew — new lets reflect today's market rate; renewals lag
    // (RERA-capped). contract_reg_type_en is exactly "New" or "Renew", so a
    // substring test for "new" matches BOTH ("Renew".includes("new") === true)
    // and silently labelled every renewal a new let. Compare exactly.
    const regType = col.regType !== -1 ? (f[col.regType] || "").trim().toLowerCase() : "";
    const isNew = regType === "new";

    // DLD's own stable project id — serialised as "181.00", so normalise
    // through parseFloat before using it as a key.
    const projNumRaw = col.projNum !== -1 ? (f[col.projNum] || "").trim() : "";
    const projNum = projNumRaw && !isNaN(parseFloat(projNumRaw)) ? String(parseFloat(projNumRaw)) : "";
    const areaId = col.areaId !== -1 ? (f[col.areaId] || "").trim() : "";
    const master = col.master !== -1 ? (f[col.master] || "").trim() : "";

    const entry = { ym, amt: annual, sqm, isNew };

    if (norm) {
      // Group on DLD's project_number, falling back to the normalized name
      // only when the row carries no number. Grouping on the name alone pooled
      // genuinely different projects that normalize alike: measured on real
      // data, 11 names covered 2 projects each — INDIGO TOWER exists in both
      // Wadi Al Safa 5 and Al Thanyah Fifth, BOTANICA in Marsa Dubai and Al
      // Barsha South Fourth — merging 7,786 contracts across 22 buildings.
      const groupId = projNum || norm;
      const bKey = `${groupId}||${bed}`;
      if (!buildingGroups.has(bKey)) {
        buildingGroups.set(bKey, { displayName: projectRaw.trim(), area, areaId, master, projNum, norm, entries: [] });
      }
      const g = buildingGroups.get(bKey);
      if (!g.projNum && projNum) g.projNum = projNum;
      if (!g.master && master) g.master = master;
      g.entries.push(entry);
    }

    // Master-project tier — sits between building and DLD area. Splits areas
    // that pool genuinely different markets (Marsa Dubai -> Dubai Marina / JBR
    // / Dubai Harbour / Bluewaters; Al Merkadh -> District One / Sobha Hartland).
    if (master) {
      const mKey = `${master}||${bed}`;
      if (!masterGroups.has(mKey)) masterGroups.set(mKey, { area, areaId, entries: [] });
      masterGroups.get(mKey).entries.push(entry);
    }

    const aKey = `${area}||${bed}`;
    if (!areaGroups.has(aKey)) areaGroups.set(aKey, { areaId, entries: [] });
    areaGroups.get(aKey).entries.push(entry);

    if (sourceRows % 200000 === 0) console.log(`  …processed ${sourceRows.toLocaleString()} rows (${path.basename(filePath)})`);
  }

  return { sourceRows, usedRows, dupRows, multiPropRows };
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  const minYM = NOW_YM - COLLECT_WINDOW;

  // group key -> dated entries (so we can prefer the freshest window later)
  const buildingGroups = new Map(); // `${norm}||${bed}` -> { displayName, area, entries:[{ym,amt}] }
  const areaGroups = new Map();     // `${area}||${bed}`  -> { areaId, entries }
  const masterGroups = new Map();   // `${master}||${bed}` -> { area, areaId, entries }
  const seenIds = new Set();        // contract_id|line_number de-dup across all parts
  const ctx = { buildingGroups, areaGroups, masterGroups, seenIds, minYM };

  let sourceRows = 0;
  let usedRows = 0;
  let dupRows = 0;
  let multiPropRows = 0;
  for (const filePath of csvPaths) {
    console.log(`\n── Ingesting ${filePath === "-" ? "stdin (NDJSON stream)" : path.basename(filePath)} ──`);
    const r = await ingestFile(filePath, ctx);
    sourceRows += r.sourceRows;
    usedRows += r.usedRows;
    dupRows += r.dupRows;
    multiPropRows += r.multiPropRows;
    console.log(`  ${path.basename(filePath)}: ${r.sourceRows.toLocaleString()} rows, ${r.usedRows.toLocaleString()} used, ${r.dupRows.toLocaleString()} dup`);
  }

  // Build output — each group uses its FRESHEST reliable window, new lets preferred.
  let basisNew = 0, basisAll = 0;

  // Which normalized names cover more than one project? Only those need a
  // disambiguated key; everything else keeps the plain name it has always had,
  // so existing dldKey values, autocomplete entries and saved report URLs keep
  // resolving.
  const normToGroups = new Map();
  for (const key of buildingGroups.keys()) {
    const groupId = key.slice(0, key.lastIndexOf("||"));
    const g = buildingGroups.get(key);
    const nk = g.norm || groupId;
    if (!normToGroups.has(nk)) normToGroups.set(nk, new Set());
    normToGroups.get(nk).add(groupId);
  }

  const buildings = {};
  const nameIndex = {}; // ambiguous normalized name -> [disambiguated keys]
  for (const [key, g] of buildingGroups) {
    const stat = freshestStats(g.entries);
    if (!stat) continue;
    if (stat.basis === "new") basisNew++; else basisAll++;
    const sep = key.lastIndexOf("||");
    const groupId = key.slice(0, sep);
    const bed = key.slice(sep + 2);
    const nk = g.norm || groupId;

    const ambiguous = (normToGroups.get(nk)?.size ?? 1) > 1;
    const outKey = ambiguous ? `${nk}#${g.projNum || groupId}` : nk;

    if (!buildings[outKey]) {
      buildings[outKey] = { displayName: g.displayName, area: g.area, beds: {} };
      if (g.projNum) buildings[outKey].projectNumber = g.projNum;
      if (g.areaId)  buildings[outKey].areaId = g.areaId;
      if (g.master)  buildings[outKey].master = g.master;
      if (ambiguous) (nameIndex[nk] ??= []).push(outKey);
    }
    buildings[outKey].beds[bed] = stat;
  }

  const areas = {};
  for (const [key, g] of areaGroups) {
    const stat = freshestStats(g.entries);
    if (!stat) continue;
    const [area, bed] = key.split("||");
    if (!areas[area]) areas[area] = { beds: {}, ...(g.areaId ? { areaId: g.areaId } : {}) };
    areas[area].beds[bed] = stat;
  }

  // Master-project tier.
  const masters = {};
  for (const [key, g] of masterGroups) {
    const stat = freshestStats(g.entries);
    if (!stat) continue;
    const [master, bed] = key.split("||");
    if (!masters[master]) masters[master] = { beds: {}, area: g.area, ...(g.areaId ? { areaId: g.areaId } : {}) };
    masters[master].beds[bed] = stat;
  }

  // Alias index derived from the contract data itself: DLD's own
  // project_name_en -> project_number. Measured 1,557 numbers over 1,553 names
  // with zero numbers mapping to multiple names, so this is authoritative and
  // free — no separate crawl needed. Ambiguous names (one name, several
  // numbers) are dropped rather than guessed.
  const nameToNums = new Map();
  for (const b of Object.values(buildings)) {
    if (!b.projectNumber) continue;
    const k = normalizeName(b.displayName);
    if (!k) continue;
    if (!nameToNums.has(k)) nameToNums.set(k, new Set());
    nameToNums.get(k).add(b.projectNumber);
  }
  // projectNumber -> the key that holds it, so an exact id resolves in one hop.
  const byProjectNumber = {};
  for (const [k, b] of Object.entries(buildings)) {
    if (b.projectNumber) byProjectNumber[b.projectNumber] = k;
  }
  const aliases = {};
  let ambiguousAliases = 0;
  for (const [k, nums] of nameToNums) {
    if (nums.size === 1) aliases[k] = [...nums][0];
    else ambiguousAliases++;
  }

  const out = {
    meta: {
      generatedAt: new Date().toISOString(),
      sourceFiles: csvPaths.map(p => path.basename(p)),
      sourceRows,
      usedRows,
      duplicateRowsSkipped: dupRows,
      multiPropertyRowsSkipped: multiPropRows,
      minSamples: MIN_SAMPLES,
      recentN: RECENT_N,
      spreadMinN: SPREAD_MIN_N,
      collectWindow: COLLECT_WINDOW,
      buildingsCovered: Object.keys(buildings).length,
      areasCovered: Object.keys(areas).length,
      mastersCovered: Object.keys(masters).length,
      aliasesCovered: Object.keys(aliases).length,
      ambiguousAliases,
      ambiguousNames: Object.keys(nameIndex).length,
      buildingBedsFromNewLets: basisNew,
      buildingBedsFromAllContracts: basisAll,
    },
    buildings,
    masters,
    areas,
    aliases,
    nameIndex,
    byProjectNumber,
  };

  // ── Coverage guardrail ────────────────────────────────────────────────
  if (fs.existsSync(OUT_PATH)) {
    let prev = null;
    try { prev = JSON.parse(fs.readFileSync(OUT_PATH, "utf8")).meta; } catch { /* unreadable — treat as no baseline */ }
    const prevN = Number(prev?.buildingsCovered) || 0;
    const newN = out.meta.buildingsCovered;
    if (prevN > 0) {
      const drop = (prevN - newN) / prevN;
      const pct = (drop * 100).toFixed(1);
      if (drop > MAX_COVERAGE_DROP) {
        console.error(
          `\n✗ REFUSING TO WRITE — building coverage would drop ${pct}% ` +
          `(${prevN.toLocaleString()} -> ${newN.toLocaleString()}), over the ` +
          `${(MAX_COVERAGE_DROP * 100).toFixed(0)}% limit.\n\n` +
          `  Existing file: ${prev.generatedAt} (window ${prev.collectWindow}mo, minSamples ${prev.minSamples}, recentN ${prev.recentN})\n` +
          `  This run:      window ${COLLECT_WINDOW}mo, minSamples ${MIN_SAMPLES}, recentN ${RECENT_N}\n\n` +
          `  A drop is EXPECTED when tightening the window or the sample floor,\n` +
          `  or after excluding renewals. If this run is the intended one:\n\n` +
          `      FORCE=1 ${process.argv.slice(1).map(a => path.basename(a)).join(" ")}\n`
        );
        if (!FORCE) process.exit(1);
        console.error("  FORCE=1 set — writing anyway.\n");
      } else if (newN < prevN) {
        console.log(`  note: coverage down ${pct}% (${prevN.toLocaleString()} -> ${newN.toLocaleString()}), within the ${(MAX_COVERAGE_DROP * 100).toFixed(0)}% limit`);
      }
    }
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log(`\n✓ Wrote ${OUT_PATH}`);
  console.log(`  files: ${csvPaths.length} | rows seen: ${sourceRows.toLocaleString()} | used: ${usedRows.toLocaleString()} | dup skipped: ${dupRows.toLocaleString()}`);
  console.log(`  buildings: ${out.meta.buildingsCovered} | masters: ${out.meta.mastersCovered} | areas: ${out.meta.areasCovered}`);
  console.log(`  aliases: ${out.meta.aliasesCovered} (${out.meta.ambiguousAliases} ambiguous names dropped)`);
  console.log(`  ambiguous names split by project_number: ${out.meta.ambiguousNames}`);
  console.log(`  basis — new lets: ${basisNew} | all contracts: ${basisAll}`);
}

main().catch(e => { console.error(e); process.exit(1); });
