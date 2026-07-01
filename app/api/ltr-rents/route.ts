/**
 * GET /api/ltr-rents?project=<name>&bedrooms=<Studio|1BR|2BR|3BR>&area=<name>
 *
 * Returns live LTR rent stats from the DDA / DLD Ejari dataset.
 * Falls back to the static building-ltr-rents.json if the API is unavailable.
 *
 * Response shape matches RentStat from lib/building-rents.ts so callers
 * can swap between live and static data transparently.
 */

import { NextResponse } from "next/server";
import {
  fetchProjectContracts,
  computeLTRStats,
  dldBedroomBucket,
  type LTRStat,
} from "@/lib/dda-client";
import {
  lookupDLDBuilding,
  lookupDLDArea,
  normalizeName,
} from "@/lib/building-rents";
import type { UnitSize } from "@/lib/estimator";

export const dynamic = "force-dynamic";

// ── In-process cache (24 h TTL) ───────────────────────────────────────────
interface CacheEntry { stat: LTRStat | null; ts: number }
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function cacheKey(project: string, bedrooms: string) {
  return `${normalizeName(project)}|${bedrooms}`;
}

function fromCache(key: string): LTRStat | null | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return undefined; }
  return entry.stat;
}

function toCache(key: string, stat: LTRStat | null) {
  cache.set(key, { stat, ts: Date.now() });
}

// ── Handler ───────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const project  = (searchParams.get("project")  ?? "").trim();
  const bedrooms = (searchParams.get("bedrooms") ?? "").trim();
  const area     = (searchParams.get("area")     ?? "").trim();

  if (!project || !bedrooms) {
    return NextResponse.json({ error: "project and bedrooms are required" }, { status: 400 });
  }

  const key = cacheKey(project, bedrooms);

  // ── 1. Check in-process cache ──────────────────────────────────────────
  const cached = fromCache(key);
  if (cached !== undefined) {
    return NextResponse.json({ stat: cached, source: cached ? "dda-live-cached" : "not-found" });
  }

  // ── 2. Try live DDA API ────────────────────────────────────────────────
  const ddaConfigured =
    process.env.DDA_BASE_URL &&
    process.env.DDA_CLIENT_ID &&
    process.env.DDA_CLIENT_SECRET &&
    process.env.DDA_APP_IDENTIFIER;

  if (ddaConfigured) {
    try {
      const contracts = await fetchProjectContracts(project, { monthsBack: 24 });

      // Group by bedroom type
      const grouped: Record<string, typeof contracts> = {};
      for (const c of contracts) {
        const bucket = dldBedroomBucket(c.ejari_property_sub_type_en, c.ejari_property_type_en);
        if (!bucket) continue;
        (grouped[bucket] ??= []).push(c);
      }

      const stat = computeLTRStats(grouped[bedrooms] ?? []) ?? null;
      toCache(key, stat);

      if (stat) {
        return NextResponse.json({ stat, source: "dda-live" });
      }
      // Fall through to static fallback if no contracts found for this bedroom type
    } catch (err) {
      console.error("[ltr-rents] DDA API error:", (err as Error).message);
      // Fall through to static fallback
    }
  }

  // ── 3. Static JSON fallback ────────────────────────────────────────────
  const staticStat =
    lookupDLDBuilding(project, bedrooms as UnitSize) ??
    (area ? lookupDLDArea(area, bedrooms as UnitSize) : null);

  if (staticStat) {
    return NextResponse.json({ stat: { ...staticStat, source: "static-json" }, source: "static-json" });
  }

  toCache(key, null);
  return NextResponse.json({ stat: null, source: "not-found" });
}
