import { NextResponse } from "next/server";
import { fetchAirROIListingsSample, type AirROIMarket } from "@/lib/airroi-client";

// Internal-only operator discovery. Neither AirROI nor Airbtics exposes a
// "property managers" endpoint, so the operator table is DERIVED: paginate real
// listings and aggregate them by host. AirROI is used because it is the only one
// of the two returning a professional_management flag per listing, and because its
// listing search is sound even though its /markets/summary counts are not.
//
// Gated by ADMIN_ACCESS_KEY and never linked from the public site — each run costs
// real API credits, so it is manual rather than scheduled.
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const PILOT_MARKETS: Record<string, AirROIMarket> = {
  "Dubai Marina":   { locality: "Dubai Marina" },
  "Business Bay":   { locality: "Business Bay" },
  "Downtown Dubai": { locality: "Dubai", district: "Downtown Dubai" },
};

type Agg = {
  host: string; listings: number; professional: number;
  adrSum: number; adrN: number; occSum: number; occN: number;
  revSum: number; revN: number; areas: Set<string>;
};

export async function GET(request: Request) {
  const key = request.headers.get("x-admin-key");
  if (!process.env.ADMIN_ACCESS_KEY || key !== process.env.ADMIN_ACCESS_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requested = (searchParams.get("areas") || Object.keys(PILOT_MARKETS).join(","))
    .split(",").map(a => a.trim()).filter(Boolean);
  // Hard caps so a stray query cannot run away with API credits.
  const pageSize = Math.min(Number(searchParams.get("pageSize")) || 100, 100);
  const maxPages = Math.min(Number(searchParams.get("pages")) || 5, 15);

  const agg = new Map<string, Agg>();
  const coverage: Array<{ area: string; totalCount: number; pulled: number; pages: number; error?: string }> = [];
  let calls = 0;

  for (const area of requested) {
    const market = PILOT_MARKETS[area];
    if (!market) { coverage.push({ area, totalCount: 0, pulled: 0, pages: 0, error: "not a pilot market" }); continue; }
    let pulled = 0, pages = 0, totalCount = 0;
    try {
      for (let page = 1; page <= maxPages; page++) {
        const res = await fetchAirROIListingsSample(market, pageSize, page);
        calls++;
        if (!res) break;
        totalCount = res.totalCount || totalCount;
        pages = page;
        if (!res.listings.length) break;
        for (const l of res.listings) {
          pulled++;
          const raw = (l.hostName || "").trim();
          if (!raw) continue;                      // unattributed listing — excluded, never guessed
          const norm = raw.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
          if (!norm) continue;
          let a = agg.get(norm);
          if (!a) { a = { host: raw, listings: 0, professional: 0, adrSum: 0, adrN: 0, occSum: 0, occN: 0, revSum: 0, revN: 0, areas: new Set() }; agg.set(norm, a); }
          a.listings++;
          if (l.professionalManagement) a.professional++;
          if (l.ttmAvgRate != null)   { a.adrSum += l.ttmAvgRate; a.adrN++; }
          if (l.ttmOccupancy != null) { a.occSum += l.ttmOccupancy; a.occN++; }
          if (l.ttmRevenue != null)   { a.revSum += l.ttmRevenue; a.revN++; }
          a.areas.add(area);
        }
        if (res.listings.length < pageSize) break;  // reached the last page
      }
    } catch (e) {
      coverage.push({ area, totalCount, pulled, pages, error: (e as Error).message });
      continue;
    }
    coverage.push({ area, totalCount, pulled, pages });
  }

  const operators = [...agg.values()].map(a => ({
    host: a.host,
    listings: a.listings,
    professionallyManagedShare: a.listings ? Math.round((a.professional / a.listings) * 100) : 0,
    avgADR: a.adrN ? Math.round(a.adrSum / a.adrN) : null,
    avgOccupancy: a.occN ? Math.round((a.occSum / a.occN) * 100) : null,
    avgTtmRevenue: a.revN ? Math.round(a.revSum / a.revN) : null,
    areas: [...a.areas],
  })).sort((x, y) => y.listings - x.listings);

  return NextResponse.json({
    ok: true,
    scannedAt: new Date().toISOString(),
    apiCalls: calls,
    coverage,
    distinctHosts: operators.length,
    // Host names are Airbnb profile names, not registered companies — this needs an
    // alias map and manual review before any of it is shown publicly.
    operators: operators.slice(0, 60),
  });
}
