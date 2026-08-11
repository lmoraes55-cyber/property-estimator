/**
 * GET /api/valuations?area=<name>
 *
 * Returns live DLD property-valuation stats (dld_valuation-open-api) for an
 * area — this dataset only exposes area_name_en, not building/project name,
 * so results are keyed by area rather than building.
 *
 * Not wired into any page yet — prepared for future use (e.g. sanity-check
 * against our own estimator output, or a "DLD assessed value" trust signal).
 */

import { NextResponse } from "next/server";
import { fetchAreaValuations, computeValuationStats, type ValuationStat } from "@/lib/dda-client";

export const dynamic = "force-dynamic";
export const preferredRegion = "dxb1";

interface CacheEntry {
  stat: ValuationStat | null;
  windowDays: number;
  ts: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function fromCache(key: string): CacheEntry | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return undefined; }
  return entry;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const area = (searchParams.get("area") ?? "").trim();

  if (!area) {
    return NextResponse.json({ error: "area is required" }, { status: 400 });
  }

  const key = area.toLowerCase();
  const cached = fromCache(key);
  if (cached) {
    return NextResponse.json({
      stat: cached.stat,
      source: cached.stat ? "dda-live-cached" : "not-found",
      windowDays: cached.windowDays,
    });
  }

  const ddaConfigured =
    process.env.DDA_BASE_URL &&
    process.env.DDA_CLIENT_ID &&
    process.env.DDA_CLIENT_SECRET &&
    process.env.DDA_APP_IDENTIFIER;

  if (!ddaConfigured) {
    return NextResponse.json({ stat: null, source: "not-configured" });
  }

  try {
    const WINDOWS = [365, 730, 1460]; // valuations are infrequent — widen aggressively
    const MIN_VALUATIONS = 3;

    let stat: ValuationStat | null = null;
    let windowUsed = 0;

    for (const daysBack of WINDOWS) {
      const valuations = await fetchAreaValuations(area, { daysBack });
      if (valuations.length >= MIN_VALUATIONS) {
        stat = computeValuationStats(valuations);
        windowUsed = daysBack;
        if (stat) break;
      }
    }

    cache.set(key, { stat, windowDays: windowUsed, ts: Date.now() });
    return NextResponse.json({ stat, source: stat ? "dda-live" : "not-found", windowDays: windowUsed });
  } catch (err) {
    console.error("[valuations] DDA API error:", (err as Error).message);
    return NextResponse.json({ stat: null, source: "error" });
  }
}
