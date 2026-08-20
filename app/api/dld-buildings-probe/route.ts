/**
 * GET /api/dld-buildings-probe?startPage=<n>&maxPages=<n>
 *
 * One-off data-generation utility for scripts/build-dld-name-map.mjs — pages
 * through dld_rent_contracts-open-api and returns the distinct project_name_en
 * values seen in that page range, so the script can build a full list of
 * every real DLD project name without loading all ~700k contract rows at once.
 * Not used by the live app; safe to call repeatedly, read-only.
 */
import { NextResponse } from "next/server";
import { ddaQuery } from "@/lib/dda-client";

export const dynamic = "force-dynamic";

interface Row {
  project_name_en: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startPage = parseInt(searchParams.get("startPage") ?? "1", 10);
  const maxPages  = parseInt(searchParams.get("maxPages") ?? "8", 10);
  const pageSize  = 1000;

  const names = new Set<string>();
  let page = startPage;
  let done = false;
  let pagesFetched = 0;

  try {
    for (; pagesFetched < maxPages; pagesFetched++, page++) {
      const { results } = await ddaQuery<Row>({
        entity: "dld",
        dataset: "dld_rent_contracts-open-api",
        page,
        pageSize,
        columns: ["project_name_en"],
      });
      if (!results.length) { done = true; break; }
      for (const r of results) {
        if (r.project_name_en) names.add(r.project_name_en.trim());
      }
      if (results.length < pageSize) { done = true; break; }
    }
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message, names: [...names], nextStart: done ? null : page, done },
      { status: 502 }
    );
  }

  return NextResponse.json({ names: [...names], nextStart: done ? null : page, done });
}
