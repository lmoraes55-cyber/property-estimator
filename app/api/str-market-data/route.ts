import { NextResponse } from "next/server";
import { getLatestAreaStats, getAreaHistory } from "@/lib/str-market-data";

// Public, read-only endpoint for the STR Market Intel page.
// Reads ONLY from our database (str_market_area_stats) — never calls AirROI or Airbtics.
// This is what keeps API costs low: both are only ever called by the weekly cron job.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area");

  const data = area
    ? await getAreaHistory(area, Number(searchParams.get("months")) || 12)
    : await getLatestAreaStats();

  return NextResponse.json(
    { data },
    {
      headers: {
        // Cache at the edge for an hour; the underlying data only changes on the weekly refresh anyway.
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
