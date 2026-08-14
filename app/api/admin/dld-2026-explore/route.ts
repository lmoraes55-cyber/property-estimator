import { NextResponse } from "next/server";
import { ddaQuery } from "@/lib/dda-client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface DLDProjectRow {
  project_id: number;
  master_project_en: string | null;
  area_name_en: string | null;
  developer_name: string;
  project_status: string;
  percent_completed: number;
  completion_date: string | null;
  project_end_date: string | null;
  no_of_units: number;
}

export async function GET(request: Request) {
  const key = request.headers.get("x-admin-key");
  if (!process.env.ADMIN_ACCESS_KEY || key !== process.env.ADMIN_ACCESS_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const byEndDate = await ddaQuery<DLDProjectRow>({
    entity: "dld", dataset: "dld_projects-open-api",
    filters: { project_status: "ACTIVE" },
    likeFilters: { project_end_date: "2026%" },
    pageSize: 1000,
    columns: ["project_id", "master_project_en", "area_name_en", "developer_name", "project_status", "percent_completed", "completion_date", "project_end_date", "no_of_units"],
  });

  const byArea: Record<string, number> = {};
  for (const r of byEndDate.results) {
    const a = r.area_name_en ?? "Unknown";
    byArea[a] = (byArea[a] ?? 0) + 1;
  }

  return NextResponse.json({
    reportedTotal: byEndDate.total,
    actualRowCount: byEndDate.results.length,
    uniqueAreaCount: Object.keys(byArea).length,
    byArea,
    sample: byEndDate.results.slice(0, 10),
  });
}
