import { NextResponse } from "next/server";
import { ddaQuery } from "@/lib/dda-client";

// TEMPORARY diagnostic route. Delete after use.
export async function GET(request: Request) {
  const key = request.headers.get("x-admin-key");
  if (!process.env.ADMIN_ACCESS_KEY || key !== process.env.ADMIN_ACCESS_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const like = searchParams.get("like") ?? "";
  const dataset = searchParams.get("dataset") ?? "dld_units-open-api";
  if (!like) return NextResponse.json({ error: "Missing ?like=" }, { status: 400 });

  try {
    const { results } = await ddaQuery<Record<string, unknown>>({
      entity: "dld",
      dataset,
      likeFilters: { project_name_en: `%${like}%` },
      pageSize: 20,
    });
    return NextResponse.json({ like, dataset, count: results?.length ?? 0, results });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Query failed" }, { status: 502 });
  }
}
