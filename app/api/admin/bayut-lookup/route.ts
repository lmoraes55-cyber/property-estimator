import { NextResponse } from "next/server";
import { searchBayutLocations } from "@/lib/bayut-autocomplete";

// Internal-only: cross-references an area name against Bayut's location
// hierarchy to help resolve DLD/AirROI naming mismatches. Gated by
// ADMIN_ACCESS_KEY, not exposed anywhere in the public site.

export async function GET(request: Request) {
  const key = request.headers.get("x-admin-key");
  if (!process.env.ADMIN_ACCESS_KEY || key !== process.env.ADMIN_ACCESS_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  if (!query) {
    return NextResponse.json({ error: "Missing ?query=" }, { status: 400 });
  }

  try {
    const locations = await searchBayutLocations(query);
    return NextResponse.json({ locations });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Lookup failed" }, { status: 502 });
  }
}
