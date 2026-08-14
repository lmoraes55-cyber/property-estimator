import { NextResponse } from "next/server";
import { ddaQuery } from "@/lib/dda-client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface DLDProjectRow {
  project_id: number;
  project_name: string;
  master_project_en: string | null;
  area_name_en: string | null;
  developer_name: string;
  project_status: string;
  percent_completed: number;
  completion_date: string | null;
  project_end_date: string | null;
  project_start_date: string | null;
  no_of_buildings: number;
  no_of_units: number;
}

export async function GET(request: Request) {
  const key = request.headers.get("x-admin-key");
  if (!process.env.ADMIN_ACCESS_KEY || key !== process.env.ADMIN_ACCESS_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // completion_date-based filter, small page to check true total
  const byCompletionDate = await ddaQuery<DLDProjectRow>({
    entity: "dld", dataset: "dld_projects-open-api",
    filters: { project_status: "ACTIVE" },
    likeFilters: { completion_date: "2026%" },
    pageSize: 5,
    columns: ["project_id", "master_project_en", "area_name_en", "developer_name", "project_status", "percent_completed", "completion_date", "project_end_date", "no_of_units"],
  });

  // project_end_date-based filter instead
  const byEndDate = await ddaQuery<DLDProjectRow>({
    entity: "dld", dataset: "dld_projects-open-api",
    filters: { project_status: "ACTIVE" },
    likeFilters: { project_end_date: "2026%" },
    pageSize: 5,
    columns: ["project_id", "master_project_en", "area_name_en", "developer_name", "project_status", "percent_completed", "completion_date", "project_end_date", "no_of_units"],
  });

  // how many ACTIVE projects total (no date filter) to sanity check the dataset size
  const activeTotal = await ddaQuery<DLDProjectRow>({
    entity: "dld", dataset: "dld_projects-open-api",
    filters: { project_status: "ACTIVE" },
    pageSize: 1,
  });

  return NextResponse.json({
    byCompletionDate: { total: byCompletionDate.total, sample: byCompletionDate.results },
    byEndDate: { total: byEndDate.total, sample: byEndDate.results },
    activeTotal: activeTotal.total,
  });
}
