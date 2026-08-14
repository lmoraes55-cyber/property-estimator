import { NextResponse } from "next/server";
import { ddaQuery } from "@/lib/dda-client";
import { getDLDAreaTier } from "@/lib/dld-area-tier";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const maxDuration = 280;

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
// dld_projects-open-api only exposes master_project_en, a community/cluster-
// level English name -- confirmed live 2026-08-15 that this makes most rows
// indistinguishable (e.g. 39 distinct Burj Khalifa-area 2026 handovers all
// showed "DownTown Dubai"). project_name_en (the real per-tower name) only
// exists in dld_units-open-api, keyed by project_id, so it's resolved with one
// extra query per project below (~3s each upstream; run concurrently in
// batches). Not every project has registered units yet, so this can come back
// null -- the UI falls back to master_project_en/area_name_en when it does.
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

const NAME_RESOLVE_CONCURRENCY = 20;

async function resolveProjectNames(projectIds: number[]): Promise<{ resolved: Map<number, string | null>; errors: Record<string, number>; emptyCount: number }> {
  const resolved = new Map<number, string | null>();
  const errors: Record<string, number> = {};
  let emptyCount = 0;
  for (let i = 0; i < projectIds.length; i += NAME_RESOLVE_CONCURRENCY) {
    const batch = projectIds.slice(i, i + NAME_RESOLVE_CONCURRENCY);
    const results = await Promise.all(batch.map(async (id) => {
      try {
        const { results } = await ddaQuery<DLDUnitProjectRow>({
          entity: "dld", dataset: "dld_units-open-api",
          filters: { project_id: String(id) },
          columns: ["project_id", "project_name_en"],
          pageSize: 1,
        });
        if (!results.length) return { id, name: null, empty: true };
        return { id, name: results[0]?.project_name_en?.trim() || null, empty: false };
      } catch (e) {
        return { id, name: null, error: (e as Error).message };
      }
    }));
    for (const r of results) {
      resolved.set(r.id, r.name);
      if (r.error) errors[r.error] = (errors[r.error] ?? 0) + 1;
      if (r.empty) emptyCount++;
    }
  }
  return { resolved, errors, emptyCount };
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

    const validRows = results
      .filter(r => r.project_status === "ACTIVE" || r.project_status === "PENDING") // DDA doesn't reliably honor the filters query for this combo — see comment above
      .filter(r => r.area_name_en); // area_name_en not null, per table constraint

    const { resolved: projectNames, errors: nameErrors, emptyCount } = await resolveProjectNames(validRows.map(r => r.project_id));

    const rows = validRows.map(r => ({
      project_id: r.project_id,
      project_name_en: projectNames.get(r.project_id) ?? null,
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

    return NextResponse.json({
      status: "success",
      projectsUpserted: rows.length,
      resolvedNames: rows.filter(r => r.project_name_en).length,
      nameResolutionEmptyCount: emptyCount, // no matching unit row found (not necessarily an error)
      nameResolutionErrors: nameErrors,     // thrown exceptions, grouped by message
    });
  } catch (e) {
    console.error("[DLD-2026-HANDOVERS-REFRESH]", (e as Error).message);
    return NextResponse.json({ status: "error", message: (e as Error).message }, { status: 500 });
  }
}
