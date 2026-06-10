/**
 * BUILDING-LEVEL LTR RENT LOOKUP
 *
 * Reads the generated DLD rent-contracts dataset (lib/data/building-ltr-rents.json)
 * and exposes building-level and area-level actual long-term rent benchmarks.
 *
 * The JSON is produced by scripts/ingest-dld-rents.mjs from the official
 * Dubai Land Department "Rent Contracts" (Ejari) open dataset.
 *
 * When the dataset is empty (placeholder), all lookups return null and the
 * caller falls back to the existing community-average table — so behaviour is
 * unchanged until real data is ingested.
 */

import type { UnitSize } from "./estimator";
import dldData from "./data/building-ltr-rents.json";

export interface RentStat {
  median: number;
  p25: number;
  p75: number;
  n: number; // sample size (number of registered contracts)
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

/** Building-level actual rent for a given building name + unit size. */
export function lookupDLDBuilding(buildingName: string, unitSize: UnitSize): RentStat | null {
  const norm = normalizeName(buildingName);
  if (!norm) return null;
  const entry = data.buildings[norm];
  return entry?.beds?.[unitSize] ?? null;
}

/** Area-level actual rent (fallback when a specific building has too few contracts). */
export function lookupDLDArea(areaName: string, unitSize: UnitSize): RentStat | null {
  if (!areaName) return null;
  const direct = data.areas[areaName]?.beds?.[unitSize];
  if (direct) return direct;
  // Tolerant match on normalized area string
  const target = areaName.toLowerCase().trim();
  for (const [k, v] of Object.entries(data.areas)) {
    if (k.toLowerCase().trim() === target) return v.beds?.[unitSize] ?? null;
  }
  return null;
}

export function hasDLDData(): boolean {
  return Object.keys(data.buildings).length > 0 || Object.keys(data.areas).length > 0;
}
