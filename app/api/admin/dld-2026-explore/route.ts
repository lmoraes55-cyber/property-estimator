import { NextResponse } from "next/server";
import { ddaQuery } from "@/lib/dda-client";

// Exploratory-only: check what dld_projects-open-api actually returns for 2026
// handovers before committing to a full live-data build. Gated by
// ADMIN_ACCESS_KEY, never linked from the public site, delete once the real
// build lands or this has served its purpose.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface DLDProjectRow {
  project_id: number;
  project_status: string;
  percent_completed: number;
  completion_date: string | null;
  project_start_date: string | null;
  no_of_buildings: number;
  no_of_units: number;
}

export async function GET(request: Request) {
  const key = request.headers.get("x-admin-key");
  if (!process.env.ADMIN_ACCESS_KEY || key !== process.env.ADMIN_ACCESS_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // First: a small unfiltered sample so we can see the dataset's real column names/shape.
  const sample = await ddaQuery<Record<string, unknown>>({
    entity: "dld", dataset: "dld_projects-open-api", pageSize: 3,
  });

  // Then: try to filter for a 2026 completion date on ACTIVE projects.
  const filtered2026 = await ddaQuery<DLDProjectRow>({
    entity: "dld", dataset: "dld_projects-open-api",
    filters: { project_status: "ACTIVE" },
    likeFilters: { completion_date: "2026%" },
    pageSize: 50,
  });

  return NextResponse.json({
    sample,
    filtered2026: { total: filtered2026.total, count: filtered2026.results.length, results: filtered2026.results.slice(0, 20) },
  });
}
