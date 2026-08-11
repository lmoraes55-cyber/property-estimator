// AirROI STR market-data client — SERVER-ONLY.
// This must only ever be called from the weekly refresh cron route
// (app/api/cron/str-market-refresh/route.ts), never from a page or client component.
// Confirmed API shape via AirROI's public docs (airroi.com/api/documentation):
//   POST https://api.airroi.com/markets/summary
//   header: X-API-KEY
//   body: { market: { country, region, locality, district? }, currency?, num_months? }
// AirROI does not offer building-level market data — only country/region/locality/district.

const AIRROI_BASE_URL = process.env.AIRROI_BASE_URL || "https://api.airroi.com";
const AIRROI_API_KEY = process.env.AIRROI_API_KEY;

export interface AirROIMarketSummary {
  adr: number | null;
  occupancy: number | null;              // fraction 0-1
  revpar: number | null;
  estimatedRevenue: number | null;
  activeListings: number | null;
  bookingWindowDays: number | null;
  lengthOfStayDays: number | null;
  comparableListingCount: number | null;
  minNights: number | null;
  raw: Record<string, unknown>;
}

/** Loosely reads a numeric value out of one of several possible key names. */
function pickNumber(obj: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "object" && v !== null && "value" in (v as Record<string, unknown>)) {
      const inner = (v as Record<string, unknown>).value;
      if (typeof inner === "number") return inner;
    }
  }
  return null;
}

export interface AirROIMarket {
  /** AirROI's "locality" — confirmed via /markets/search that some Dubai areas
   *  (e.g. "Dubai Marina", "Business Bay") are localities in their own right,
   *  not districts under locality "Dubai". */
  locality: string;
  /** Optional district under the locality (e.g. locality "Dubai", district "Downtown Dubai"). */
  district?: string;
}

/**
 * Fetch aggregated STR market metrics for a resolved AirROI market descriptor.
 * Costs an AirROI API call — only call this from the weekly cron job.
 */
export async function fetchAirROIMarketSummary(market: AirROIMarket): Promise<AirROIMarketSummary | null> {
  if (!AIRROI_API_KEY) {
    throw new Error("AIRROI_API_KEY is not set");
  }

  const res = await fetch(`${AIRROI_BASE_URL}/markets/summary`, {
    method: "POST",
    headers: {
      "X-API-KEY": AIRROI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      market: {
        country: "United Arab Emirates",
        region: "Dubai",
        locality: market.locality,
        ...(market.district ? { district: market.district } : {}),
      },
      currency: "usd",
      num_months: 1,
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`AirROI market summary failed for "${market.district ?? market.locality}": ${res.status} ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as Record<string, unknown>;

  return {
    adr: pickNumber(json, ["adr", "average_daily_rate", "avg_daily_rate"]),
    occupancy: pickNumber(json, ["occupancy", "occupancy_rate"]),
    revpar: pickNumber(json, ["revpar", "rev_par"]),
    estimatedRevenue: pickNumber(json, ["revenue", "estimated_revenue", "annual_revenue"]),
    activeListings: pickNumber(json, ["active_listings", "active_listings_count", "listing_count"]),
    bookingWindowDays: pickNumber(json, ["booking_lead_time", "booking_window", "booking_window_days"]),
    lengthOfStayDays: pickNumber(json, ["length_of_stay", "length_of_stay_days", "avg_length_of_stay"]),
    comparableListingCount: pickNumber(json, ["comparable_listings", "comparable_listing_count"]),
    minNights: pickNumber(json, ["min_nights", "min_stay"]),
    raw: json,
  };
}

export interface AirROISampleListing {
  listingId: number;
  name: string | null;
  hostName: string | null;
  professionalManagement: boolean;
  superhost: boolean;
  bedrooms: number | null;
  rating: number | null;
  numReviews: number | null;
  coverPhotoUrl: string | null;
  ttmRevenue: number | null;
  ttmAvgRate: number | null;
  ttmOccupancy: number | null;
}

export interface AirROIListingsResult {
  totalCount: number;
  listings: AirROISampleListing[];
}

/**
 * Pull a small sample of real listings for a market — used to populate the
 * "Comparable Listings" section and to get an accurate live listing count
 * (pagination.total_count is a more precise "comparable listings" figure than
 * anything /markets/summary returns). Costs an AirROI API call — cron-only.
 */
export async function fetchAirROIListingsSample(market: AirROIMarket, pageSize = 6): Promise<AirROIListingsResult | null> {
  if (!AIRROI_API_KEY) {
    throw new Error("AIRROI_API_KEY is not set");
  }

  const res = await fetch(`${AIRROI_BASE_URL}/listings/search/market`, {
    method: "POST",
    headers: {
      "X-API-KEY": AIRROI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      market: {
        country: "United Arab Emirates",
        region: "Dubai",
        locality: market.locality,
        ...(market.district ? { district: market.district } : {}),
      },
      page: 1,
      page_size: pageSize,
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`AirROI listings search failed for "${market.district ?? market.locality}": ${res.status} ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    pagination?: { total_count?: number };
    results?: Array<Record<string, any>>;
  };

  return {
    totalCount: json.pagination?.total_count ?? 0,
    listings: parseListingResults(json.results),
  };
}

function parseListingResults(results?: Array<Record<string, any>>): AirROISampleListing[] {
  return (results ?? []).map(r => ({
    listingId: r.listing_info?.listing_id ?? 0,
    name: r.listing_info?.listing_name ?? null,
    hostName: r.host_info?.host_name || null,
    professionalManagement: !!r.host_info?.professional_management,
    superhost: !!r.host_info?.superhost,
    bedrooms: r.property_details?.bedrooms ?? null,
    rating: r.ratings?.rating_overall ?? null,
    numReviews: r.ratings?.num_reviews ?? null,
    coverPhotoUrl: r.listing_info?.cover_photo_url ?? null,
    ttmRevenue: r.performance_metrics?.ttm_revenue ?? null,
    ttmAvgRate: r.performance_metrics?.ttm_avg_rate ?? null,
    ttmOccupancy: r.performance_metrics?.ttm_occupancy ?? null,
  }));
}

export interface AirROIGeoRadius {
  lat: number;
  lng: number;
  radiusKm: number;
}

/**
 * Fallback for areas AirROI doesn't recognize by locality/district name (confirmed
 * live: Palm Jumeirah, JBR, JVC, Al Furjan all 404 on /markets/summary despite
 * having real listings — their own Atlas map view reaches them via a lat/lng
 * viewport, not a named market). Pulls listings within a radius and lets the
 * caller compute area-level aggregates from performance_metrics directly, since
 * there's no equivalent "summary" endpoint for geo-bounded queries.
 * Costs an AirROI API call — cron-only.
 */
export async function fetchAirROIListingsByRadius(geo: AirROIGeoRadius, pageSize = 50): Promise<AirROIListingsResult | null> {
  if (!AIRROI_API_KEY) {
    throw new Error("AIRROI_API_KEY is not set");
  }

  const res = await fetch(`${AIRROI_BASE_URL}/listings/search/radius`, {
    method: "POST",
    headers: {
      "X-API-KEY": AIRROI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      latitude: geo.lat,
      longitude: geo.lng,
      radius_km: geo.radiusKm,
      page: 1,
      page_size: pageSize,
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`AirROI radius search failed for (${geo.lat},${geo.lng}): ${res.status} ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    pagination?: { total_count?: number };
    results?: Array<Record<string, any>>;
  };

  return {
    totalCount: json.pagination?.total_count ?? 0,
    listings: parseListingResults(json.results),
  };
}

/**
 * Aggregate a listings sample into the same summary shape /markets/summary
 * returns, for areas we can only reach via geo-radius search. Excludes zero
 * values from averages — AirROI returns 0 (not null) for listings with no
 * bookings in the TTM window, which would otherwise drag the average down
 * artificially for a market that's actually performing fine.
 */
export function aggregateListingsToSummary(result: AirROIListingsResult): AirROIMarketSummary {
  const withRevenue = result.listings.filter(l => l.ttmAvgRate != null && l.ttmAvgRate > 0);
  const withOcc = result.listings.filter(l => l.ttmOccupancy != null && l.ttmOccupancy > 0);
  const mean = (arr: number[]) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null);

  const adr = mean(withRevenue.map(l => l.ttmAvgRate as number));
  const occupancy = mean(withOcc.map(l => l.ttmOccupancy as number));

  return {
    adr,
    occupancy,
    revpar: adr != null && occupancy != null ? adr * occupancy : null,
    estimatedRevenue: mean(result.listings.filter(l => l.ttmRevenue != null && l.ttmRevenue > 0).map(l => l.ttmRevenue as number)),
    activeListings: result.totalCount,
    bookingWindowDays: null,
    lengthOfStayDays: null,
    comparableListingCount: result.totalCount,
    minNights: null,
    raw: { source: "listings/search/radius aggregate", sampleSize: result.listings.length },
  };
}
