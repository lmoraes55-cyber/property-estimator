/**
 * GET /api/ltr-rents?project=<name>&bedrooms=<Studio|1BR|2BR|3BR>&area=<name>
 *
 * Returns live LTR rent stats + 5 most recent contracts from DDA / DLD Ejari.
 * Falls back to the static building-ltr-rents.json if the API is unavailable.
 */

import { NextResponse } from "next/server";
import {
  fetchProjectContracts,
  fetchAreaContracts,
  computeLTRStats,
  dldBedroomBucket,
  type LTRStat,
  type DLDRentContract,
} from "@/lib/dda-client";
import {
  lookupDLDBuilding,
  lookupDLDArea,
  normalizeName,
} from "@/lib/building-rents";
import type { UnitSize } from "@/lib/estimator";

export const dynamic = "force-dynamic";
export const preferredRegion = "dxb1";

export interface RecentContract {
  date: string;          // YYYY-MM-DD
  annualRent: number;    // AED
  areaSqft: number;      // converted from sq.m.
  aedPerSqft: number;
}

// ── In-process cache (1 h TTL — short enough to stay fresh for 30-day window) ──
interface CacheEntry {
  stat: LTRStat | null;
  recent: RecentContract[];
  windowDays: number;
  ts: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function cacheKey(project: string, bedrooms: string, sizeSqft: number) {
  return `${normalizeName(project)}|${bedrooms}|${sizeSqft || ""}`;
}

const SIZE_BAND_PCT = 0.12;

function withinSizeBand(c: DLDRentContract, sizeSqft: number): boolean {
  const areaSqft = c.actual_area > 0 ? c.actual_area * 10.764 : 0;
  if (!areaSqft) return false;
  return Math.abs(areaSqft - sizeSqft) <= sizeSqft * SIZE_BAND_PCT;
}

function fromCache(key: string): CacheEntry | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return undefined; }
  return entry;
}

function toRecentContracts(contracts: DLDRentContract[]): RecentContract[] {
  return contracts
    .filter(c => c.contract_start_date && c.annual_amount > 0)
    .sort((a, b) => b.contract_start_date.localeCompare(a.contract_start_date))
    .slice(0, 5)
    .map(c => {
      // DLD stores actual_area in sq.m. despite name — convert to sqft
      const areaSqft = c.actual_area > 0 ? Math.round(c.actual_area * 10.764) : 0;
      return {
        date: c.contract_start_date,
        annualRent: Math.round(c.annual_amount),
        areaSqft,
        aedPerSqft: areaSqft > 0 ? Math.round(c.annual_amount / areaSqft) : 0,
      };
    });
}

// ── Handler ───────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const project  = (searchParams.get("project")  ?? "").trim();
  const bedrooms = (searchParams.get("bedrooms") ?? "").trim();
  const area     = (searchParams.get("area")     ?? "").trim();
  const sizeSqft = Number(searchParams.get("sizeSqft") ?? "") || 0;

  if (!project || !bedrooms) {
    return NextResponse.json({ error: "project and bedrooms are required" }, { status: 400 });
  }

  const key = cacheKey(project, bedrooms, sizeSqft);

  // ── 1. Check in-process cache ──────────────────────────────────────────
  const cached = fromCache(key);
  if (cached) {
    return NextResponse.json({
      stat: cached.stat,
      source: cached.stat ? "dda-live-cached" : "not-found",
      windowDays: cached.windowDays,
      recentContracts: cached.recent,
    });
  }

  // ── 2. Try live DDA API ────────────────────────────────────────────────
  const ddaConfigured =
    process.env.DDA_BASE_URL &&
    process.env.DDA_CLIENT_ID &&
    process.env.DDA_CLIENT_SECRET &&
    process.env.DDA_APP_IDENTIFIER;

  if (ddaConfigured) {
    try {
      const MIN_CONTRACTS = 5;
      // Start at 90 days — 30-day window is too narrow and misses contracts just outside the month.
      // 730-day tier handles buildings where the open API dataset lags several months.
      // When also matching by size, widen further since the band shrinks the pool.
      const WINDOWS = sizeSqft > 0 ? [90, 365, 730, 1095] : [90, 365, 730];

      const bedroomKey = bedrooms.replace(/\s+(APT|VILLA)$/i, "");

      const bedroomContractsFor = (contracts: DLDRentContract[]) => {
        const grouped: Record<string, typeof contracts> = {};
        for (const c of contracts) {
          const bucket = dldBedroomBucket(c.ejari_property_sub_type_en, c.ejari_property_type_en);
          if (!bucket) continue;
          (grouped[bucket] ??= []).push(c);
        }
        return grouped[bedroomKey] ?? grouped[bedrooms] ?? [];
      };

      let stat: ReturnType<typeof computeLTRStats> = null;
      let recent: RecentContract[] = [];
      let windowUsed = 0;
      let sizeFilterApplied = false;

      // Pass 1: bedroom bucket + size band (if a size was given).
      if (sizeSqft > 0) {
        for (const daysBack of WINDOWS) {
          const contracts = await fetchProjectContracts(project, { daysBack });
          const allBedroomContracts = bedroomContractsFor(contracts);
          const today = new Date().toISOString().slice(0, 10);
          const pastContracts = allBedroomContracts.filter(
            c => c.contract_start_date <= today && withinSizeBand(c, sizeSqft)
          );
          const sorted = [...pastContracts].sort(
            (a, b) => b.contract_start_date.localeCompare(a.contract_start_date)
          );

          if (sorted.length >= MIN_CONTRACTS) {
            stat = computeLTRStats(sorted.slice(0, Math.min(sorted.length, 8)));
            recent = toRecentContracts(sorted);
            windowUsed = daysBack;
            sizeFilterApplied = true;
            break;
          }
        }
      }

      // Pass 2: fall back to bedroom-bucket only (no size band) if pass 1 came up short.
      if (!stat) {
        for (const daysBack of WINDOWS) {
          const contracts = await fetchProjectContracts(project, { daysBack });
          const allBedroomContracts = bedroomContractsFor(contracts);
          const today = new Date().toISOString().slice(0, 10);
          const pastContracts = allBedroomContracts.filter(c => c.contract_start_date <= today);
          const sorted = [...pastContracts].sort(
            (a, b) => b.contract_start_date.localeCompare(a.contract_start_date)
          );

          if (sorted.length >= MIN_CONTRACTS || (sorted.length > 0 && daysBack === WINDOWS[WINDOWS.length - 1])) {
            stat = computeLTRStats(sorted.slice(0, Math.min(sorted.length, 6)));
            recent = toRecentContracts(sorted);
            windowUsed = daysBack;
            break;
          }
        }
      }

      // Pass 3: project name matched nothing at all (e.g. Motor City — a
      // community of independently-named buildings, not one DLD project) —
      // fall back to a live area-level lookup instead of jumping to static JSON.
      // Single 365-day window, not the full WINDOWS ladder: Pass 1/2 already
      // spent up to 6-7 sequential DDA calls exhausting the project-name
      // search space, and an area pools many buildings' contracts, so one
      // moderate window has plenty of volume without adding more round-trips
      // to an already-slow no-match path.
      if (!stat && area) {
        const contracts = await fetchAreaContracts(area, { daysBack: 365 });
        const allBedroomContracts = bedroomContractsFor(contracts);
        const today = new Date().toISOString().slice(0, 10);
        const pastContracts = allBedroomContracts.filter(c => c.contract_start_date <= today);
        const sorted = [...pastContracts].sort(
          (a, b) => b.contract_start_date.localeCompare(a.contract_start_date)
        );

        if (sorted.length > 0) {
          stat = computeLTRStats(sorted.slice(0, Math.min(sorted.length, 8)));
          recent = toRecentContracts(sorted);
          windowUsed = 365;
        }
      }

      if (stat) {
        cache.set(key, { stat, recent, windowDays: windowUsed, ts: Date.now() });
        return NextResponse.json({ stat, source: "dda-live", sizeFilterApplied, windowDays: windowUsed, recentContracts: recent });
      }
    } catch (err) {
      console.error("[ltr-rents] DDA API error:", (err as Error).message);
    }
  }

  // ── 3. Static JSON fallback ────────────────────────────────────────────
  const staticStat =
    lookupDLDBuilding(project, bedrooms as UnitSize) ??
    (area ? lookupDLDArea(area, bedrooms as UnitSize) : null);

  if (staticStat) {
    return NextResponse.json({ stat: { ...staticStat, source: "static-json" }, source: "static-json", recentContracts: [] });
  }

  cache.set(key, { stat: null, recent: [], windowDays: 0, ts: Date.now() });
  return NextResponse.json({ stat: null, source: "not-found", recentContracts: [] });
}
