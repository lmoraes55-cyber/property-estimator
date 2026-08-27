/**
 * BUILDING-LEVEL LTR RENT LOOKUP
 *
 * Reads the generated DLD rent-contracts dataset (lib/data/building-ltr-rents.json)
 * and exposes building-level and area-level actual long-term rent benchmarks.
 *
 * The JSON is produced by scripts/ingest-dld-rents.mjs from the official
 * Dubai Land Department "Rent Contracts" (Ejari) open dataset.
 *
 * Matching cascade for a building name:
 *   1. exact normalized key
 *   2. fuzzy/alias match — merges DLD project variants
 *      (e.g. "Marina Gate" → "At Marina Gate 1" + "At Marina Gate 2";
 *       "Address Boulevard" → "Address Blvd")
 *   3. caller falls back to area-level, then the internal table.
 */

import type { UnitSize } from "./estimator";
import dldData from "./data/building-ltr-rents.json";

export interface RentStat {
  median: number;
  /** Omitted when n < spreadMinN — too few contracts for the spread to mean anything. */
  p25?: number;
  p75?: number;
  n: number; // sample size (number of registered contracts)
  windowMonths?: number; // recency window the stat was computed over
  asOf?: string;         // latest contract month used (YYYY-MM)
  aedPerSqft?: number;   // median annual rent per sqft
  medianSqft?: number;   // median unit size (sqft)
  match?: "building" | "building-group" | "master" | "area"; // how it was resolved
}

interface BuildingEntry {
  displayName: string;
  area: string;
  beds: Partial<Record<string, RentStat>>;
  /** DLD's own stable project id — exact where present, unlike the name. */
  projectNumber?: string;
  areaId?: string;
  /** Master community (e.g. "Dubai Marina", "Jumeirah Beach Residence - JBR"). */
  master?: string;
}

interface MasterEntry {
  beds: Partial<Record<string, RentStat>>;
  area?: string;
  areaId?: string;
}

interface DLDData {
  meta: Record<string, unknown>;
  buildings: Record<string, BuildingEntry>;
  areas: Record<string, { beds: Partial<Record<string, RentStat>>; areaId?: string }>;
  /** Master-project tier — absent until the ingest is re-run. */
  masters?: Record<string, MasterEntry>;
  /** normalizeName(project_name_en) -> project_number. Absent until re-ingest. */
  aliases?: Record<string, string>;
}

const data = dldData as unknown as DLDData;

// Must mirror normalizeName() in scripts/ingest-dld-rents.mjs
export function normalizeName(name: string): string {
  return String(name || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(tower|towers|residence|residences|building|bldg|apartment|apartments|the)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Canonicalize abbreviations + filler so variants collide.
function canon(s: string): string {
  return s
    .replace(/\bblvd\b/g, "boulevard")
    .replace(/\bbld\b/g, "boulevard")
    .replace(/\bresidenc\b/g, "")
    .replace(/\b(at|by|jumeirah living|emaar|nshama|the)\b/g, "")
    .replace(/\b(\d+)(st|nd|rd|th)\b/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

// Precompute canonical index of building keys → original keys
const buildingKeys = Object.keys(data.buildings);
const canonIndex: Map<string, string[]> = new Map();
for (const k of buildingKeys) {
  const c = canon(k);
  if (!c) continue;
  const arr = canonIndex.get(c) ?? [];
  arr.push(k);
  canonIndex.set(c, arr);
}

// project_number -> building key. DLD's project_number is an exact identifier
// (measured: 1,557 distinct numbers over 1,553 names, zero numbers mapping to
// more than one name), so resolving through it skips fuzzy matching entirely.
const byProjectNumber = new Map<string, string>();
for (const [k, b] of Object.entries(data.buildings)) {
  if (b.projectNumber) byProjectNumber.set(b.projectNumber, k);
}

/** DLD project_number for a display name, via the ingest-derived alias index. */
export function resolveProjectNumber(name: string): string | null {
  const norm = normalizeName(name);
  if (!norm) return null;
  return data.aliases?.[norm] ?? null;
}

/** The master community a building belongs to, if the ingest recorded one. */
export function getMasterForBuilding(buildingName: string): string | null {
  const norm = normalizeName(buildingName);
  if (!norm) return null;
  const direct = data.buildings[norm]?.master;
  if (direct) return direct;
  const pn = data.aliases?.[norm];
  const key = pn ? byProjectNumber.get(pn) : undefined;
  return (key && data.buildings[key]?.master) || null;
}

// Merge several RentStat samples (sample-weighted median, widest range, summed n)
function mergeStats(stats: RentStat[]): RentStat | null {
  const valid = stats.filter(Boolean);
  if (!valid.length) return null;
  if (valid.length === 1) return valid[0];
  let wSum = 0, nSum = 0, windowMonths = 0;
  let p25 = Infinity, p75 = 0, sawSpread = false;
  let asOf = "";
  let psfSum = 0, psfN = 0, sqftSum = 0, sqftN = 0;
  for (const s of valid) {
    wSum += s.median * s.n;
    nSum += s.n;
    if (s.p25 != null && s.p75 != null) {
      p25 = Math.min(p25, s.p25);
      p75 = Math.max(p75, s.p75);
      sawSpread = true;
    }
    if (s.windowMonths) windowMonths = Math.max(windowMonths, s.windowMonths);
    if (s.asOf && s.asOf > asOf) asOf = s.asOf;
    if (s.aedPerSqft) { psfSum += s.aedPerSqft * s.n; psfN += s.n; }
    if (s.medianSqft) { sqftSum += s.medianSqft * s.n; sqftN += s.n; }
  }
  return {
    median: Math.round(wSum / nSum), n: nSum,
    ...(sawSpread ? { p25, p75 } : {}),
    windowMonths: windowMonths || undefined, asOf: asOf || undefined,
    aedPerSqft: psfN ? Math.round(psfSum / psfN) : undefined,
    medianSqft: sqftN ? Math.round(sqftSum / sqftN) : undefined,
  };
}

/** Building-level actual rent for a given building name + unit size. */
export function lookupDLDBuilding(buildingName: string, unitSize: UnitSize): RentStat | null {
  const norm = normalizeName(buildingName);
  if (!norm) return null;

  // 1. Exact normalized key
  const exact = data.buildings[norm]?.beds?.[unitSize];
  if (exact) return { ...exact, match: "building" };

  // 1b. Exact via DLD project_number. Catches the cases where our normalized
  // key and DLD's differ but both resolve to the same registered project —
  // an exact identity match, so it runs before anything fuzzy.
  const pn = data.aliases?.[norm];
  if (pn) {
    const key = byProjectNumber.get(pn);
    const s = key ? data.buildings[key]?.beds?.[unitSize] : undefined;
    if (s) return { ...s, match: "building" };
  }

  // 2. Fuzzy / alias match via canonical names
  const t = canon(norm);
  if (t.length < 4) return null;

  const matchedKeys = new Set<string>();

  // exact canonical hit (handles abbreviations like blvd↔boulevard)
  for (const k of canonIndex.get(t) ?? []) matchedKeys.add(k);

  // containment both directions, word-boundary safe
  if (!matchedKeys.size) {
    for (const [c, keys] of canonIndex) {
      if (c === t) { keys.forEach(k => matchedKeys.add(k)); continue; }
      // DLD variant contains our name: "marina gate" ⊂ "marina gate 1"
      if (c.startsWith(t + " ") || c.includes(" " + t + " ") || c.endsWith(" " + t)) keys.forEach(k => matchedKeys.add(k));
      // our name contains DLD variant (only if variant is reasonably specific)
      else if (c.length >= 6 && (t.startsWith(c + " ") || t.endsWith(" " + c))) keys.forEach(k => matchedKeys.add(k));
    }
  }

  if (!matchedKeys.size) return null;

  const stats: RentStat[] = [];
  for (const k of matchedKeys) {
    const s = data.buildings[k]?.beds?.[unitSize];
    if (s) stats.push(s);
  }
  const merged = mergeStats(stats);
  if (!merged) return null;
  return { ...merged, match: matchedKeys.size > 1 ? "building-group" : "building" };
}

// Master names have to be matched across two vocabularies that never agreed:
// ours ("Jumeirah Beach Residence (JBR)") and DLD's ("Jumeriah Beach Residence
//  - JBR" — their misspelling, their double space). Normalising both to a bare
// token string bridges them without a hand-maintained alias table.
function normalizeMaster(s: string): string {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    // DLD spells it "Jumeriah" throughout; ours is "Jumeirah".
    .replace(/jumeriah/g, "jumeirah")
    .replace(/s+/g, " ")
    .trim();
}

const masterIndex = new Map<string, string>();
for (const k of Object.keys(data.masters ?? {})) {
  const nk = normalizeMaster(k);
  if (nk) masterIndex.set(nk, k);
}

/**
 * Master-community rent — the tier between a single building and the DLD
 * administrative area. Worth having because several DLD areas pool genuinely
 * different markets: Marsa Dubai covers Dubai Marina, JBR, Dubai Harbour and
 * Bluewaters; Al Merkadh covers District One, Meydan One and Sobha Hartland.
 * Still NOT building-specific — callers must not present it as such.
 */
export function lookupDLDMaster(masterName: string, unitSize: UnitSize): RentStat | null {
  if (!masterName || !data.masters) return null;

  const direct = data.masters[masterName]?.beds?.[unitSize];
  if (direct) return { ...direct, match: "master" };

  const target = normalizeMaster(masterName);
  if (!target) return null;

  // Exact normalized hit.
  const key = masterIndex.get(target);
  if (key) {
    const s = data.masters[key]?.beds?.[unitSize];
    if (s) return { ...s, match: "master" };
  }

  // Token-subset: one side may carry extra qualifiers the other omits
  // ("Dubai Marina" vs "Marina", "... - JBR" vs "(JBR)"). Require every token
  // of the shorter name to appear in the longer, and at least two tokens, so
  // single generic words cannot collide.
  const tTokens = target.split(" ").filter(Boolean);
  if (tTokens.length < 2) return null;

  // Collect every subset match, then take the closest one — fewest extra
  // tokens. Without this, "Dubai Hills" would match whichever of
  // "DUBAI HILLS - MAPLE 1" / "Dubai Hills Estate" happened to be inserted
  // first, rather than the least-qualified name.
  let best: { orig: string; extra: number } | null = null;
  for (const [nk, orig] of masterIndex) {
    const kTokens = nk.split(" ").filter(Boolean);
    const [short, long] = tTokens.length <= kTokens.length ? [tTokens, kTokens] : [kTokens, tTokens];
    if (short.length < 2) continue;
    if (!short.every(t => long.includes(t))) continue;
    if (!data.masters[orig]?.beds?.[unitSize]) continue;
    const extra = Math.abs(kTokens.length - tTokens.length);
    if (!best || extra < best.extra) best = { orig, extra };
  }
  if (best) {
    const s = data.masters[best.orig]?.beds?.[unitSize];
    if (s) return { ...s, match: "master" };
  }
  return null;
}

/** Area-level actual rent (fallback when a specific building has too few contracts). */
export function lookupDLDArea(areaName: string, unitSize: UnitSize): RentStat | null {
  if (!areaName) return null;
  const direct = data.areas[areaName]?.beds?.[unitSize];
  if (direct) return { ...direct, match: "area" };
  const target = areaName.toLowerCase().trim();
  for (const [k, v] of Object.entries(data.areas)) {
    if (k.toLowerCase().trim() === target) {
      const s = v.beds?.[unitSize];
      return s ? { ...s, match: "area" } : null;
    }
  }
  return null;
}

export function hasDLDData(): boolean {
  return Object.keys(data.buildings).length > 0 || Object.keys(data.areas).length > 0;
}

export interface DLDBuildingEntry {
  key: string;          // normalized key used for exact lookup
  displayName: string;  // raw DLD project name (title-cased for display)
  dldArea: string;      // DLD administrative area
  beds: string[];       // available unit types e.g. ["1BR","2BR","3BR"]
  projectNumber?: string; // DLD's exact project id, when known
  master?: string;        // master community, when known
}

/** All 1,400+ buildings from the DLD dataset — used to power autocomplete. */
export function getDLDBuildingList(): DLDBuildingEntry[] {
  return Object.entries(data.buildings).map(([key, b]) => ({
    key,
    displayName: toTitleCase(b.displayName),
    dldArea: b.area,
    beds: Object.keys(b.beds),
    ...(b.projectNumber ? { projectNumber: b.projectNumber } : {}),
    ...(b.master ? { master: b.master } : {}),
  }));
}

/** Exact-key lookup — skips fuzzy matching entirely. */
export function lookupDLDByKey(key: string, unitSize: UnitSize): RentStat | null {
  const entry = data.buildings[key];
  if (!entry) return null;
  const s = entry.beds[unitSize];
  return s ? { ...s, match: "building" } : null;
}

function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\bAl\b/g, "Al")
    .replace(/\bBy\b/g, "by")
    .replace(/\bAt\b/g, "at")
    .replace(/\bThe\b/g, "the")
    .replace(/^(the|at|by) /i, m => m.toUpperCase());
}
