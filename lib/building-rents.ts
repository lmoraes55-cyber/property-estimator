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
  p25: number;
  p75: number;
  n: number; // sample size (number of registered contracts)
  windowMonths?: number; // recency window the stat was computed over
  asOf?: string;         // latest contract month used (YYYY-MM)
  aedPerSqft?: number;   // median annual rent per sqft
  medianSqft?: number;   // median unit size (sqft)
  match?: "building" | "building-group" | "area"; // how it was resolved
}

interface BuildingEntry {
  displayName: string;
  area: string;
  beds: Partial<Record<string, RentStat>>;
}

interface DLDData {
  meta: Record<string, unknown>;
  buildings: Record<string, BuildingEntry>;
  areas: Record<string, { beds: Partial<Record<string, RentStat>> }>;
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

// Merge several RentStat samples (sample-weighted median, widest range, summed n)
function mergeStats(stats: RentStat[]): RentStat | null {
  const valid = stats.filter(Boolean);
  if (!valid.length) return null;
  if (valid.length === 1) return valid[0];
  let wSum = 0, nSum = 0, p25 = Infinity, p75 = 0, windowMonths = 0;
  let asOf = "";
  let psfSum = 0, psfN = 0, sqftSum = 0, sqftN = 0;
  for (const s of valid) {
    wSum += s.median * s.n;
    nSum += s.n;
    p25 = Math.min(p25, s.p25);
    p75 = Math.max(p75, s.p75);
    if (s.windowMonths) windowMonths = Math.max(windowMonths, s.windowMonths);
    if (s.asOf && s.asOf > asOf) asOf = s.asOf;
    if (s.aedPerSqft) { psfSum += s.aedPerSqft * s.n; psfN += s.n; }
    if (s.medianSqft) { sqftSum += s.medianSqft * s.n; sqftN += s.n; }
  }
  return {
    median: Math.round(wSum / nSum), p25, p75, n: nSum,
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
