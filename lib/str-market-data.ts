import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Read-only access to the locally-cached STR market data.
// This is the ONLY way pages/API routes should read market data — never call
// lib/airroi-client.ts directly from a request path, only from the weekly cron job.

export interface AirROISampleListingRow {
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

export interface AreaStatsRow {
  area: string;
  reporting_month: string;
  sales_transactions: number | null;
  median_sale_price: number | null;
  median_sale_price_per_sqft: number | null;
  rental_transactions: number | null;
  median_annual_rent: number | null;
  median_rent_price_per_sqft: number | null;
  ltr_yield: number | null;
  adr: number | null;
  occupancy: number | null;
  revpar: number | null;
  estimated_str_revenue: number | null;
  active_listings: number | null;
  booking_window_days: number | null;
  length_of_stay_days: number | null;
  demand_trend: string | null;
  comparable_listing_count: number | null;
  min_nights: number | null;
  sample_listings: AirROISampleListingRow[] | null;
  top_buildings: unknown;
  dld_source: string;
  airroi_source: string;
  confidence: string | null;
  updated_at: string;
  airbtics_adr: number | null;
  airbtics_occupancy: number | null;
  airbtics_revpar: number | null;
  airbtics_estimated_revenue: number | null;
  airbtics_active_listings: number | null;
  airbtics_comparable_listing_count: number | null;
  airbtics_market_grade: string | null;
  airbtics_regulations: string | null;
  data_sources: string | null;
}

function readOnlyClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** Latest reporting-period row per area — what the Area Intelligence table shows. */
export async function getLatestAreaStats(): Promise<AreaStatsRow[]> {
  const supabase = readOnlyClient();
  const { data, error } = await supabase
    .from("str_market_area_stats")
    .select("*")
    .order("reporting_month", { ascending: false });

  if (error || !data) return [];

  // Keep only the most recent reporting_month row per area.
  const seen = new Set<string>();
  const latest: AreaStatsRow[] = [];
  for (const row of data as AreaStatsRow[]) {
    if (seen.has(row.area)) continue;
    seen.add(row.area);
    latest.push(row);
  }
  return latest;
}

/** Full history for one area — powers the monthly trend charts. */
export async function getAreaHistory(area: string, months = 12): Promise<AreaStatsRow[]> {
  const supabase = readOnlyClient();
  const { data, error } = await supabase
    .from("str_market_area_stats")
    .select("*")
    .eq("area", area)
    .order("reporting_month", { ascending: true })
    .limit(months);

  if (error || !data) return [];
  return data as AreaStatsRow[];
}
