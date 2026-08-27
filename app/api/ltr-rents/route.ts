/**
 * GET /api/ltr-rents?project=<name>&bedrooms=<Studio|1BR|2BR|3BR>&area=<name>
 *
 * Returns live LTR rent stats (median of the 3 most recent transactions)
 * + those 3 most recent contracts from DDA / DLD Ejari.
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
  lookupDLDMaster,
  lookupDLDArea,
  getMasterForBuilding,
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
// Which pass actually produced the result — surfaced in the response so a
// mismatch (e.g. a well-known building silently falling to an area-wide
// average) is visible and debuggable, not hidden behind a plausible-looking
// number. "area" means the figure is pooled across the whole community, not
// specific to the requested building — never present that as building-level.
type MatchLevel = "building-sized" | "building" | "area" | null;

interface CacheEntry {
  stat: LTRStat | null;
  recent: RecentContract[];
  windowDays: number;
  matchLevel: MatchLevel;
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
      matchLevel: cached.matchLevel,
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
      // Always price off exactly the 3 most recent transactions, not a
      // median pooled across a wide trailing window — a stale Jan contract
      // sitting next to fresh Aug ones drags the "current" rent below what
      // the market actually asks today, especially for low-volume buildings.
      // One generously wide fetch (730 days) maximizes the chance of
      // finding 3 comparables; recency comes from always slicing to the
      // newest ones after sorting, not from a narrower window.
      const RECENT_N = 3;
      const MIN_FOR_STAT = 3; // computeLTRStats' own floor
      const FETCH_WINDOW_DAYS = 730;

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

      const mostRecent = (contracts: DLDRentContract[]) => {
        const today = new Date().toISOString().slice(0, 10);
        return [...contracts]
          .filter(c => c.contract_start_date <= today)
          .sort((a, b) => b.contract_start_date.localeCompare(a.contract_start_date))
          .slice(0, RECENT_N);
      };

      let stat: ReturnType<typeof computeLTRStats> = null;
      let recent: RecentContract[] = [];
      let windowUsed = 0;
      let sizeFilterApplied = false;
      let matchLevel: MatchLevel = null;

      // Pass 1: bedroom bucket + size band (if a size was given).
      if (sizeSqft > 0) {
        const contracts = await fetchProjectContracts(project, { daysBack: FETCH_WINDOW_DAYS });
        const sized = bedroomContractsFor(contracts).filter(c => withinSizeBand(c, sizeSqft));
        const sorted = mostRecent(sized);
        if (sorted.length >= MIN_FOR_STAT) {
          stat = computeLTRStats(sorted);
          recent = toRecentContracts(sorted);
          windowUsed = FETCH_WINDOW_DAYS;
          sizeFilterApplied = true;
          matchLevel = "building-sized";
        }
      }

      // Pass 2: fall back to bedroom-bucket only (no size band) if pass 1 came up short.
      // Always attempted, even when `project` doesn't resolve via our offline
      // name-map — that map is an incomplete crawl (~1,200 of DLD's real
      // project catalog), not proof the name doesn't exist live. "Burj
      // Crown" is a concrete example: absent from the map, but DLD has it
      // under mixed-case "Burj Crown" with real contracts, findable only by
      // fetchProjectContracts' own live variant search (which tries the
      // name as-typed before falling to uppercase).
      if (!stat) {
        const contracts = await fetchProjectContracts(project, { daysBack: FETCH_WINDOW_DAYS });
        const sorted = mostRecent(bedroomContractsFor(contracts));
        if (sorted.length >= MIN_FOR_STAT) {
          stat = computeLTRStats(sorted);
          recent = toRecentContracts(sorted);
          windowUsed = FETCH_WINDOW_DAYS;
          matchLevel = "building";
        }
      }

      // Pass 3: project name matched nothing at all (e.g. Motor City — a
      // community of independently-named buildings, not one DLD project) —
      // fall back to a live area-level lookup instead of jumping to static JSON.
      // This is NOT building-specific — it's pooled across every building in
      // the DLD administrative area — so matchLevel must say so; never let a
      // caller present this as if it were the requested building's own data.
      if (!stat && area) {
        const contracts = await fetchAreaContracts(area, { daysBack: FETCH_WINDOW_DAYS });
        const sorted = mostRecent(bedroomContractsFor(contracts));
        if (sorted.length >= MIN_FOR_STAT) {
          stat = computeLTRStats(sorted);
          recent = toRecentContracts(sorted);
          windowUsed = FETCH_WINDOW_DAYS;
          matchLevel = "area";
        }
      }

      if (stat) {
        cache.set(key, { stat, recent, windowDays: windowUsed, matchLevel, ts: Date.now() });
        return NextResponse.json({ stat, source: "dda-live", sizeFilterApplied, windowDays: windowUsed, matchLevel, recentContracts: recent });
      }
    } catch (err) {
      console.error("[ltr-rents] DDA API error:", (err as Error).message);
    }
  }

  // ── 3. Static JSON fallback ────────────────────────────────────────────
  // Same cascade as the estimator: building -> master community -> DLD area.
  const master = getMasterForBuilding(project);
  const staticStat =
    lookupDLDBuilding(project, bedrooms as UnitSize) ??
    (master ? lookupDLDMaster(master, bedrooms as UnitSize) : null) ??
    (area ? lookupDLDArea(area, bedrooms as UnitSize) : null);

  if (staticStat) {
    return NextResponse.json({ stat: { ...staticStat, source: "static-json" }, source: "static-json", recentContracts: [] });
  }

  cache.set(key, { stat: null, recent: [], windowDays: 0, matchLevel: null, ts: Date.now() });
  return NextResponse.json({ stat: null, source: "not-found", recentContracts: [] });
}
