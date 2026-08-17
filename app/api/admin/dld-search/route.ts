import { NextResponse } from "next/server";
import { ddaQuery } from "@/lib/dda-client";

// Temporary ad hoc DLD lookup tool — admin-gated, not linked publicly.
// Delete once it has served its purpose.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const key = request.headers.get("x-admin-key");
  if (!process.env.ADMIN_ACCESS_KEY || key !== process.env.ADMIN_ACCESS_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || "Century";

  const { results, total } = await ddaQuery({
    entity: "dld", dataset: "dld_rent_contracts-open-api",
    likeFilters: { project_name_en: `${name}%` },
    pageSize: 1000,
    orderBy: "contract_start_date",
    orderDir: "desc",
  });

  return NextResponse.json({ total, count: results.length, results });
}
