import { NextResponse } from "next/server";
import { ddaQuery } from "@/lib/dda-client";
import { getDLDAreaTier } from "@/lib/dld-area-tier";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Weekly refresh — the ONLY place in the app allowed to query DDA for 2026
// handover data. Pulls every ACTIVE DLD project with a 2026 project_end_date and
// upserts into dld_2026_handovers. Replaces the earlier hand-curated/Bayut-scraped
// static list (data/dubai-2026-handovers.ts) — confirmed 2026-08-14: 309 real
// projects vs. 38 scraped ones.
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

    const rows = results
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
    const { error } = await supabase.from("dld_2026_handovers").upsert(rows, { onConflict: "project_id" });
    if (error) throw new Error(error.message);

    return NextResponse.json({ status: "success", projectsUpserted: rows.length });
  } catch (e) {
    console.error("[DLD-2026-HANDOVERS-REFRESH]", (e as Error).message);
    return NextResponse.json({ status: "error", message: (e as Error).message }, { status: 500 });
  }
}
