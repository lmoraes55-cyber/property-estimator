import { NextResponse } from "next/server";
import { ddaQuery } from "@/lib/dda-client";

// TEMPORARY diagnostic route — lists completed DLD projects in a given area.
// Gated by ADMIN_ACCESS_KEY. Delete after use.

export async function GET(request: Request) {
  const key = request.headers.get("x-admin-key");
  if (!process.env.ADMIN_ACCESS_KEY || key !== process.env.ADMIN_ACCESS_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area");
  if (!area) return NextResponse.json({ error: "Missing ?area=" }, { status: 400 });

  try {
    const { results } = await ddaQuery<Record<string, unknown>>({
      dataset: "dld_projects-open-api",
      filters: { area_name_en: area, project_status: "Completed" },
      limit: 20,
    });
    return NextResponse.json({ area, count: results?.length ?? 0, results });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Query failed" }, { status: 502 });
  }
}
