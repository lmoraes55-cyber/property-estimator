// Airbtics STR market-data client — SERVER-ONLY.
// This must only ever be called from the weekly refresh cron route
// (app/api/cron/str-market-refresh/route.ts), never from a page or client component.
// Confirmed API shape via live calls against Airbtics Public API (2026-08-11):
//   GET  https://crap0y5bx5.execute-api.us-east-2.amazonaws.com/prod/markets/search?query=...&country_code=AE
//   POST .../markets/summary            body: { market_id }
//   POST .../listings/search/market      body: { market_id, filters?, page? }
//   header: x-api-key
// Airbtics' market taxonomy is keyed to raw DLD cadastral area names (e.g.
// "BUSINESS BAY", "MARSA DUBAI", "BURJ KHALIFA") — the same names used in
// lib/dld-area-map.ts, which is how the market IDs below were resolved.
// Confirmed gap: Palm Jumeirah has no market in Airbtics under any searched
// term (not a query issue — AirROI's geo-radius workaround remains the only
// source for that area).

const AIRBTICS_BASE_URL = process.env.AIRBTICS_BASE_URL || "https://crap0y5bx5.execute-api.us-east-2.amazonaws.com/prod";
const AIRBTICS_API_KEY = process.env.AIRBTICS_API_KEY;

/** Resolved via /markets/search, cross-referenced against lib/dld-area-map.ts's raw DLD area names. */
export const AIRBTICS_MARKET_IDS: Record<string, number> = {
  "Downtown Dubai": 354947,        // BURJ KHALIFA
  "Business Bay": 354945,          // BUSINESS BAY
  "Dubai Marina": 354895,          // MARSA DUBAI
  "JBR": 354895,                   // MARSA DUBAI (same DLD area as Dubai Marina)
  "DIFC": 354924,                  // TRADE CENTER FIRST
  "Dubai Creek Harbour": 354798,   // AL KHEERAN FIRST
  "MBR City": 354998,              // AL MERKADH
  "JVC": 355013,                   // AL BARSHA SOUTH FOURTH
  "Al Furjan": 355017,             // JABAL ALI FIRST
  "Dubai Hills Estate": 355003,    // HADAEQ SHEIKH MOHAMMED BIN RASHID
  // "Palm Jumeirah" intentionally omitted — no Airbtics market found.
};

function headers() {
  if (!AIRBTICS_API_KEY) throw new Error("AIRBTICS_API_KEY is not set");
  return { "x-api-key": AIRBTICS_API_KEY, "Content-Type": "application/json" };
}

export interface AirbticsMarketSummary {
  adr: number | null;
  occupancy: number | null;        // fraction 0-1 (normalized from Airbtics' 0-100)
  revpar: number | null;           // derived: adr * occupancy
  estimatedRevenue: number | null;
  activeListings: number | null;
  marketGrade: string | null;
  regulations: string | null;
  raw: Record<string, unknown>;
}

/** Costs an Airbtics API call — only call this from the weekly cron job. */
export async function fetchAirbticsMarketSummary(marketId: number): Promise<AirbticsMarketSummary | null> {
  const res = await fetch(`${AIRBTICS_BASE_URL}/markets/summary`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ market_id: marketId }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Airbtics market summary failed for market_id ${marketId}: ${res.status} ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as { message?: Record<string, unknown> };
  const m = json.message;
  if (!m) return null;

  const occPct = typeof m.occupancy === "number" ? m.occupancy : null;
  const adr = typeof m.average_daily_rate === "number" ? m.average_daily_rate : null;
  const occupancy = occPct != null ? occPct / 100 : null;

  return {
    adr,
    occupancy,
    revpar: adr != null && occupancy != null ? Math.round(adr * occupancy * 100) / 100 : null,
    estimatedRevenue: typeof m.revenue === "number" ? m.revenue : null,
    activeListings: typeof m.active_listings_count === "number" ? m.active_listings_count : null,
    marketGrade: typeof m.market_grade === "string" ? m.market_grade : null,
    regulations: typeof m.regulations === "string" ? m.regulations : null,
    raw: m,
  };
}

export interface AirbticsSampleListing {
  listingId: string;
  name: string | null;
  hostName: string | null;
  bedrooms: number | null;
  rating: number | null;
  numReviews: number | null;
  coverPhotoUrl: string | null;
  hasLicense: boolean;
  ttmRevenue: number | null;
  ttmAvgRate: number | null;
  ttmOccupancy: number | null;     // fraction 0-1
}

export interface AirbticsListingsResult {
  totalCount: number;
  listings: AirbticsSampleListing[];
}

/**
 * Pull a small sample of real listings for a market — pooled with AirROI's
 * sample to strengthen "Comparable Listings". Costs an Airbtics API call —
 * cron-only.
 */
export async function fetchAirbticsListingsSample(
  marketId: number,
  bedrooms?: string,
  pageSize = 6,
): Promise<AirbticsListingsResult | null> {
  const res = await fetch(`${AIRBTICS_BASE_URL}/listings/search/market`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      market_id: marketId,
      page: 1,
      ...(bedrooms ? { filters: { bedrooms: [bedrooms] } } : {}),
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Airbtics listings search failed for market_id ${marketId}: ${res.status} ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as { message?: { listings?: string; total_count?: number } };
  const totalCount = json.message?.total_count ?? 0;

  // Double-encoded per Airbtics' documented legacy response shape.
  let rows: Array<Record<string, any>> = [];
  try {
    const inner = JSON.parse(json.message?.listings ?? "{}");
    rows = Array.isArray(inner.message) ? inner.message : [];
  } catch {
    rows = [];
  }

  const listings: AirbticsSampleListing[] = rows.slice(0, pageSize).map(r => ({
    listingId: String(r.listingID ?? ""),
    name: r.name ?? null,
    hostName: r.host_name ?? null,
    bedrooms: r.bedrooms != null ? Number(r.bedrooms) : null,
    rating: typeof r.reveiw_scores_rating === "number" ? r.reveiw_scores_rating : null,
    numReviews: typeof r.visible_review_count === "number" ? r.visible_review_count : null,
    coverPhotoUrl: r.thumbnail_url ?? null,
    hasLicense: r.has_license === "t" || r.has_license === true,
    ttmRevenue: typeof r.annual_revenue_ltm === "number" ? r.annual_revenue_ltm : null,
    ttmAvgRate: typeof r.avg_booked_daily_rate_ltm === "number" ? r.avg_booked_daily_rate_ltm : null,
    ttmOccupancy: typeof r.avg_occupancy_rate_ltm === "number" ? r.avg_occupancy_rate_ltm / 100 : null,
  }));

  return { totalCount, listings };
}
