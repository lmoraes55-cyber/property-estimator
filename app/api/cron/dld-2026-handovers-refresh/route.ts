import { NextResponse } from "next/server";
import { ddaQuery } from "@/lib/dda-client";
import { getDLDAreaTier } from "@/lib/dld-area-tier";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Weekly refresh — the ONLY place in the app allowed to query DDA for 2026
// handover data. Pulls every ACTIVE or PENDING DLD project with a 2026
// project_end_date and upserts into dld_2026_handovers (FINISHED/CANCELLED/
// NOT_STARTED/CONDITIONAL_ACTIVATING excluded). Replaces the earlier
// hand-curated/Bayut-scraped static list (data/dubai-2026-handovers.ts) —
// confirmed 2026-08-14: DLD has ~250+ real projects vs. 38 scraped ones.
//
// project_end_date (not completion_date) is the reliable target-handover field —
// completion_date can carry a stale historical value unrelated to the current
// project timeline (confirmed on a live row: completion_date 2012 vs. a real
// project_end_date of 2026-06-30 for the same still-active project).
//
// DLD does not expose an English per-tower project name in this dataset, only
// Arabic (project_name) — master_project_en (the project/community cluster name)
// is the most specific English name actually available without an expensive
// per-project join to dld_units-open-api, so that's what's stored and displayed.
//
// ddaQuery's exact-match filter (project_status=ACTIVE) is NOT reliably honored
// by the DDA API when combined with a LIKE filter (project_end_date) in the same
// request — confirmed live: a query filtered to ACTIVE only still returned
// NOT_STARTED/PENDING/CONDITIONAL_ACTIVATING/FINISHED rows too. Re-filtered
// client-side below as a backstop; do not remove even if the upstream filter
// combination is later fixed.

interface DLDProjectRow {
  project_id: number;
  master_project_en: string | null;
  area_name_en: string | null;
  project_status: string;
  percent_completed: number | null;
  project_end_date: string | null;
  no_of_units: number | null;
  no_of_buildings: number | null;
}

interface DLDUnitProjectRow {
  project_id: number;
  project_name_en: string | null;
}

// TEMPORARY diagnostic — not the real refresh path. Confirms whether
// dld_units-open-api can resolve a real per-tower English name (project_name_en)
// per project_id, since dld_projects-open-api only exposes master_project_en
// (a community-level cluster name — e.g. 39 distinct Burj Khalifa-area 2026
// handovers all collapse to "DownTown Dubai"). Remove once the real fix lands.
async function probeUnitNames(projectRows: DLDProjectRow[]) {
  const sample = projectRows.slice(0, 15);
  const out = await Promise.all(sample.map(async (r) => {
    const started = Date.now();
    try {
      const { results } = await ddaQuery<DLDUnitProjectRow>({
        entity: "dld", dataset: "dld_units-open-api",
        filters: { project_id: String(r.project_id) },
        columns: ["project_id", "project_name_en"],
        pageSize: 1,
      });
      return {
        project_id: r.project_id,
        master_project_en: r.master_project_en,
        area_name_en: r.area_name_en,
        resolved_project_name_en: results[0]?.project_name_en ?? null,
        ms: Date.now() - started,
      };
    } catch (e) {
      return { project_id: r.project_id, error: (e as Error).message, ms: Date.now() - started };
    }
  }));
  return out;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { results } = await ddaQuery<DLDProjectRow>({
      entity: "dld", dataset: "dld_projects-open-api",
      filters: { project_status: "ACTIVE" },
      likeFilters: { project_end_date: "2026%" },
      pageSize: 1000,
      columns: ["project_id", "master_project_en", "area_name_en", "project_status", "percent_completed", "project_end_date", "no_of_units", "no_of_buildings"],
    });

    const url = new URL(request.url);
    if (url.searchParams.get("probe") === "1") {
      const validRows = results.filter(r => (r.project_status === "ACTIVE" || r.project_status === "PENDING") && r.area_name_en);
      const probe = await probeUnitNames(validRows);
      return NextResponse.json({ probe });
    }

    const rows = results
      .filter(r => r.project_status === "ACTIVE" || r.project_status === "PENDING") // DDA doesn't reliably honor the filters query for this combo — see comment above
      .filter(r => r.area_name_en) // area_name_en not null, per table constraint
      .map(r => ({
        project_id: r.project_id,
        master_project_en: r.master_project_en,
        area_name_en: r.area_name_en,
        project_status: r.project_status,
        percent_completed: r.percent_completed,
        project_end_date: r.project_end_date,
        no_of_units: r.no_of_units,
        no_of_buildings: r.no_of_buildings,
        str_area_tier: getDLDAreaTier(r.area_name_en),
        updated_at: new Date().toISOString(),
      }));

    const supabase = createServiceClient();
    // Full replace, not upsert-only: a project that no longer matches (status
    // changed, end_date slipped out of 2026) must disappear from the table too,
    // not linger forever from a prior run.
    const { error: delError } = await supabase.from("dld_2026_handovers").delete().gte("project_id", 0);
    if (delError) throw new Error(delError.message);
    const { error } = await supabase.from("dld_2026_handovers").insert(rows);
    if (error) throw new Error(error.message);

    return NextResponse.json({ status: "success", projectsUpserted: rows.length });
  } catch (e) {
    console.error("[DLD-2026-HANDOVERS-REFRESH]", (e as Error).message);
    return NextResponse.json({ status: "error", message: (e as Error).message }, { status: 500 });
  }
}
