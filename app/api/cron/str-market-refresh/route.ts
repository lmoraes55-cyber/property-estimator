import { NextResponse } from "next/server";
import { ddaQuery, computeSaleStats, computeLTRStats, type DLDSaleTransaction, type DLDRentContract } from "@/lib/dda-client";
import {
  fetchAirROIMarketSummary, fetchAirROIListingsSample, fetchAirROIListingsByRadius,
  aggregateListingsToSummary, type AirROIMarket, type AirROIGeoRadius,
} from "@/lib/airroi-client";
import { createServiceClient } from "@/lib/supabase/service";
import { DLD_AREA_TO_COMMUNITY } from "@/lib/dld-area-map";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Weekly refresh job — the ONLY place in the app allowed to call AirROI.
// Triggered by Vercel Cron (see vercel.json). Pulls AirROI + DLD data per Dubai
// community, aggregates, and upserts into str_market_area_stats — preserving
// history by keying on (area, reporting_month) rather than overwriting.

// Every area here gets DLD sales/rental data. Only areas with an entry in
// AIRROI_MARKET_MAP also get STR (ADR/occupancy/etc) data — verified live against
// AirROI's /markets/summary endpoint on 2026-08-05/06. AirROI's location taxonomy
// is inconsistent: some Dubai areas are "locality" values in their own right
// (Dubai Marina, Business Bay), others are "district" values under locality
// "Dubai" (Downtown Dubai, Dubai Hills, Ras Al Khor — the DLD/AirROI name for the
// Dubai Creek Harbour district). JBR, Palm Jumeirah, JVC, DIFC and Al Furjan all
// returned "No market data matches your search criteria" under every name variant
// tried, including AirROI's own /markets/search suggestions — "Jumeirah" resolves
// as a district, but that's the broader mainland villa area, not JBR's towers, so
// it's deliberately NOT used as a JBR proxy. Worth following up with AirROI
// support (admin@airroi.com) for the rest.
const AIRROI_MARKET_MAP: Record<string, AirROIMarket> = {
  "Downtown Dubai": { locality: "Dubai", district: "Downtown Dubai" },
  "Dubai Marina": { locality: "Dubai Marina" },
  "Business Bay": { locality: "Business Bay" },
  "Dubai Hills Estate": { locality: "Dubai", district: "Dubai Hills" },
  "Dubai Creek Harbour": { locality: "Dubai", district: "Ras Al Khor" },
  "MBR City": { locality: "Dubai", district: "MBR- Al Merkad" },
  // DIFC (Dubai International Financial Centre) sits within the Zabeel district —
  // AirROI doesn't tag DIFC separately, so Zabeel is the closest real match.
  "DIFC": { locality: "Dubai", district: "Zabeel" },
};

// Areas with no named-market match on /markets/summary (confirmed live 404 under
// every name variant tried) but that AirROI's own Atlas map clearly has listing
// data for via lat/lng viewport. Reached instead through /listings/search/radius,
// aggregating ADR/occupancy/revenue ourselves from the sample — see
// aggregateListingsToSummary(). Radii are sized to stay inside each area's own
// footprint and avoid bleeding into neighbors; approximate, not survey-precise.
const AIRROI_GEO_MAP: Record<string, AirROIGeoRadius> = {
  "Palm Jumeirah": { lat: 25.1150, lng: 55.1390, radiusKm: 3 },
  "JBR": { lat: 25.0787, lng: 55.1339, radiusKm: 1 },
  "JVC": { lat: 25.0550, lng: 55.2080, radiusKm: 2.5 },
  "Al Furjan": { lat: 25.0310, lng: 55.1480, radiusKm: 2 },
};

const TARGET_AREAS = [
  "Downtown Dubai",
  "Dubai Marina",
  "Business Bay",
  "JBR",
  "Palm Jumeirah",
  "JVC",
  "Dubai Hills Estate",
  "Dubai Creek Harbour",
  "DIFC",
  "Al Furjan",
  "MBR City",
] as const;

const SALE_COLUMNS: (keyof DLDSaleTransaction)[] = [
  "transaction_id", "instance_date", "trans_group_en", "procedure_name_en", "reg_type_en",
  "property_type_en", "property_sub_type_en", "area_name_en", "building_name_en",
  "project_name_en", "master_project_en", "rooms_en", "procedure_area", "actual_worth",
  "meter_sale_price",
];

const RENT_COLUMNS: (keyof DLDRentContract)[] = [
  "contract_id", "annual_amount", "actual_area",
  "project_name_en", "area_name_en",
  "ejari_property_type_en", "ejari_property_sub_type_en",
  "property_usage_en", "contract_start_date", "contract_end_date", "is_free_hold",
  "contract_reg_type_en",
];

// DLD doesn't tag JBR as its own cadastral area — JBR buildings' sales/rental
// transactions are recorded under area_name_en "Marsa Dubai", the same raw area
// as Dubai Marina (confirmed via live query; JBR only shows up in
// master_project_en, which isn't filterable through this dataset). So JBR's
// sales/rental figures in the Area Intelligence table are genuinely identical
// to Dubai Marina's — that's how DLD itself records them, not a bug.
const COMMUNITY_DLD_ALIAS: Record<string, string> = {
  JBR: "Dubai Marina",
};

/** Community display name → the raw DLD area_name_en values that roll up into it. */
function dldAreaNamesForCommunity(community: string): string[] {
  const target = COMMUNITY_DLD_ALIAS[community] ?? community;
  return Object.entries(DLD_AREA_TO_COMMUNITY)
    .filter(([, c]) => c === target)
    .map(([dldName]) => dldName);
}

function reportingMonthStart(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

// DLD's API silently drops all but one exact-match `filter` param when several
// are combined in one request (confirmed live: {area_name_en, trans_group_en}
// only honored trans_group_en, returning transactions from random areas).
// Workaround: filter server-side by area_name_en ALONE (the one that must be
// correct per-area), order by date descending, and apply every other condition
// (trans_group_en, recency window) client-side in JS.
const RECENT_DAYS = 90;

async function fetchDLDSalesForArea(dldNames: string[]): Promise<DLDSaleTransaction[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RECENT_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const all: DLDSaleTransaction[] = [];
  for (const name of dldNames) {
    const { results } = await ddaQuery<DLDSaleTransaction>({
      entity: "dld",
      dataset: "dld_transactions-open-api",
      columns: SALE_COLUMNS as string[],
      filters: { area_name_en: name },
      orderBy: "instance_date",
      orderDir: "desc",
      pageSize: 1000,
    });
    all.push(...results.filter(t => t.trans_group_en === "Sales" && t.instance_date >= cutoffStr));
  }
  return all;
}

async function fetchDLDRentsForArea(dldNames: string[]): Promise<DLDRentContract[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RECENT_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const all: DLDRentContract[] = [];
  for (const name of dldNames) {
    const { results } = await ddaQuery<DLDRentContract>({
      entity: "dld",
      dataset: "dld_rent_contracts-open-api",
      columns: RENT_COLUMNS as string[],
      filters: { area_name_en: name },
      orderBy: "contract_start_date",
      orderDir: "desc",
      pageSize: 1000,
    });
    all.push(...results.filter(c => c.contract_start_date >= cutoffStr));
  }
  return all;
}

export async function GET(request: Request) {
  // Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically when
  // CRON_SECRET is set as an env var — reject anything else so this can't be
  // triggered (and billed against our AirROI credits) by a random visitor.
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const reportingMonth = reportingMonthStart();
  const startedAt = new Date().toISOString();

  let recordsUpdated = 0;
  let airroiFailures = 0;
  let dldFailures = 0;
  const errors: string[] = [];

  for (const area of TARGET_AREAS) {
    const dldNames = dldAreaNamesForCommunity(area);
    const row: Record<string, unknown> = {
      area,
      reporting_month: reportingMonth,
      updated_at: new Date().toISOString(),
    };

    // DLD (sales + rentals) — safe to call live here, this route only runs weekly.
    try {
      const [sales, rents] = await Promise.all([
        fetchDLDSalesForArea(dldNames),
        fetchDLDRentsForArea(dldNames),
      ]);
      const saleStats = computeSaleStats(sales);
      const ltrStats = computeLTRStats(rents);

      row.sales_transactions = saleStats?.n ?? sales.length;
      row.median_sale_price = saleStats?.medianPrice ?? null;
      row.median_sale_price_per_sqft = saleStats?.medianAedPerSqft ?? null;
      row.rental_transactions = rents.length;
      row.median_annual_rent = ltrStats?.median ?? null;
      row.median_rent_price_per_sqft = ltrStats?.aedPerSqft ?? null;
      if (saleStats?.medianPrice && ltrStats?.median) {
        row.ltr_yield = Math.round((ltrStats.median / saleStats.medianPrice) * 10000) / 100;
      }
    } catch (e) {
      dldFailures++;
      errors.push(`DLD/${area}: ${(e as Error).message}`);
    }

    // AirROI (STR). Named-market areas use /markets/summary (AirROI's own
    // aggregation, more reliable). Geo-only areas fall back to a radius listings
    // search and we aggregate ourselves — see aggregateListingsToSummary().
    const airroiMarket = AIRROI_MARKET_MAP[area];
    const airroiGeo = AIRROI_GEO_MAP[area];
    try {
      if (airroiMarket) {
        const summary = await fetchAirROIMarketSummary(airroiMarket);
        if (summary) {
          row.adr = summary.adr;
          row.occupancy = summary.occupancy;
          row.revpar = summary.revpar;
          row.estimated_str_revenue = summary.estimatedRevenue;
          // AirROI returns these as period averages, which can be fractional (e.g. "2351.1")
          // even though our schema stores them as whole-number counts.
          row.active_listings = summary.activeListings != null ? Math.round(summary.activeListings) : null;
          row.booking_window_days = summary.bookingWindowDays;
          row.length_of_stay_days = summary.lengthOfStayDays;
          row.min_nights = summary.minNights;
        }

        // Real comparable listings + an accurate live count (pagination.total_count),
        // richer than anything /markets/summary returns.
        const listingsResult = await fetchAirROIListingsSample(airroiMarket, 6);
        if (listingsResult) {
          row.comparable_listing_count = listingsResult.totalCount;
          row.sample_listings = listingsResult.listings;
        }
      } else if (airroiGeo) {
        const listingsResult = await fetchAirROIListingsByRadius(airroiGeo, 50);
        if (listingsResult) {
          const summary = aggregateListingsToSummary(listingsResult);
          row.adr = summary.adr;
          row.occupancy = summary.occupancy;
          row.revpar = summary.revpar;
          row.estimated_str_revenue = summary.estimatedRevenue;
          row.active_listings = summary.activeListings;
          row.comparable_listing_count = listingsResult.totalCount;
          row.sample_listings = listingsResult.listings.slice(0, 6);
        }
      }
    } catch (e) {
      airroiFailures++;
      errors.push(`AirROI/${area}: ${(e as Error).message}`);
    }

    const salesN = (row.sales_transactions as number) ?? 0;
    const rentalsN = (row.rental_transactions as number) ?? 0;
    row.confidence = salesN + rentalsN >= 20 ? "high" : salesN + rentalsN >= 5 ? "medium" : "low";
    // Geo-radius STR figures are self-aggregated from a 50-listing sample around an
    // approximate center point, not AirROI's own named-market summary — cap confidence
    // so the UI can flag these as less precise regardless of how much DLD data exists.
    if (airroiGeo && row.confidence === "high") row.confidence = "medium";

    const { error: upsertError } = await supabase
      .from("str_market_area_stats")
      .upsert(row, { onConflict: "area,reporting_month" });

    if (upsertError) {
      errors.push(`Upsert/${area}: ${upsertError.message}`);
    } else {
      recordsUpdated++;
    }
  }

  const status = errors.length === 0 ? "success" : recordsUpdated > 0 ? "partial" : "failed";

  await supabase.from("data_sync_log").insert([
    { service: "dld", status: dldFailures === 0 ? "success" : "partial", records_updated: recordsUpdated, started_at: startedAt, completed_at: new Date().toISOString(), error: errors.filter(e => e.startsWith("DLD")).join("; ") || null },
    { service: "airroi", status: airroiFailures === 0 ? "success" : "partial", records_updated: recordsUpdated, started_at: startedAt, completed_at: new Date().toISOString(), error: errors.filter(e => e.startsWith("AirROI")).join("; ") || null },
  ]);

  return NextResponse.json({ status, recordsUpdated, areasProcessed: TARGET_AREAS.length, errors });
}
