import { NextResponse } from "next/server";
import { ddaQuery } from "@/lib/dda-client";

// TEMPORARY diagnostic route. Delete after use.
export async function GET(request: Request) {
  const key = request.headers.get("x-admin-key");
  if (!process.env.ADMIN_ACCESS_KEY || key !== process.env.ADMIN_ACCESS_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area") ?? "";
  if (!area) return NextResponse.json({ error: "Missing ?area=" }, { status: 400 });

  try {
    const { results } = await ddaQuery<Record<string, unknown>>({
      entity: "dld",
      dataset: "dld_units-open-api",
      filters: { area_name_en: area },
      pageSize: 100,
    });
    const names = Array.from(new Set((results ?? []).map(r => r.project_name_en))).sort();
    return NextResponse.json({ area, uniqueProjectCount: names.length, names });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Query failed" }, { status: 502 });
  }
}
