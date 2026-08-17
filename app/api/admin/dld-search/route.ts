import { NextResponse } from "next/server";
import { ddaQuery } from "@/lib/dda-client";

// Temporary ad hoc DLD lookup tool — admin-gated, not linked publicly.
// Delete once it has served its purpose.
export const dynamic = "force-dynamic";

interface UnitRow {
  project_id: number;
  project_name_en: string | null;
  master_project_en: string | null;
  area_name_en: string | null;
}

export async function GET(request: Request) {
  const key = request.headers.get("x-admin-key");
  if (!process.env.ADMIN_ACCESS_KEY || key !== process.env.ADMIN_ACCESS_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || "";
  const projectId = searchParams.get("projectId");

  if (projectId) {
    const { results } = await ddaQuery({
      entity: "dld", dataset: "dld_projects-open-api",
      filters: { project_id: projectId },
      pageSize: 1,
    });
    return NextResponse.json({ results });
  }

  const { results } = await ddaQuery<UnitRow>({
    entity: "dld", dataset: "dld_units-open-api",
    likeFilters: { project_name_en: `%${name}%` },
    columns: ["project_id", "project_name_en", "master_project_en", "area_name_en"],
    pageSize: 1000,
  });

  const seen = new Set<number>();
  const unique = results.filter(r => {
    if (seen.has(r.project_id)) return false;
    seen.add(r.project_id);
    return true;
  });

  return NextResponse.json({ count: unique.length, results: unique });
}
