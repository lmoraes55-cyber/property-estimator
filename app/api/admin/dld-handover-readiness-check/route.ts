import { NextResponse } from "next/server";
import { ddaQuery } from "@/lib/dda-client";

// Temporary ad hoc audit tool — admin-gated, not linked publicly. Checks every
// tracked 2026-handover project (dld_2026_handovers) that has a resolved
// project_name_en against real DLD rent-contract activity, to find projects
// our data still shows as incomplete/under-construction but that already have
// real, recent Ejari leases (i.e. genuinely ready, same pattern found for
// "Century"). Delete once it has served its purpose.
export const dynamic = "force-dynamic";
export const maxDuration = 280;

interface HandoverRow {
  project_id: number;
  project_name_en: string | null;
  master_project_en: string | null;
  area_name_en: string;
  project_status: string;
  percent_completed: number | null;
}

interface ContractRow {
  contract_start_date: string;
  contract_reg_type_en: string | null;
  property_usage_en: string | null;
}

const CONCURRENCY = 10;
const CALLS_PER_WINDOW = 50;
const WINDOW_MS = 65_000;
const MAX_ELAPSED_MS = 250_000;
const RECENT_DAYS = 180;

async function checkOne(name: string): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RECENT_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  try {
    const { results } = await ddaQuery<ContractRow>({
      entity: "dld", dataset: "dld_rent_contracts-open-api",
      likeFilters: { project_name_en: `${name}%` },
      columns: ["contract_start_date", "contract_reg_type_en", "property_usage_en"],
      pageSize: 50,
      orderBy: "contract_start_date", orderDir: "desc",
    });
    return results.filter(r =>
      r.contract_start_date >= cutoffStr &&
      (r.contract_reg_type_en ?? "New") === "New" &&
      (r.property_usage_en ?? "Residential").toLowerCase().includes("resid")
    ).length;
  } catch {
    return -1; // error, distinct from a real zero
  }
}

export async function GET(request: Request) {
  const key = request.headers.get("x-admin-key");
  if (!process.env.ADMIN_ACCESS_KEY || key !== process.env.ADMIN_ACCESS_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const offset = Number(searchParams.get("offset") ?? "0") || 0;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const res = await fetch(`${supabaseUrl}/rest/v1/dld_2026_handovers?select=project_id,project_name_en,master_project_en,area_name_en,project_status,percent_completed`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
  });
  const rows: HandoverRow[] = await res.json();
  const named = rows.filter(r => r.project_name_en).slice(offset);

  const startedAt = Date.now();
  const findings: { project_id: number; name: string; area: string; percent_completed: number | null; recentContracts: number }[] = [];
  let attempted = 0;

  for (let i = 0; i < named.length; i += CALLS_PER_WINDOW) {
    if (Date.now() - startedAt > MAX_ELAPSED_MS) break;
    const windowStart = Date.now();
    const window = named.slice(i, i + CALLS_PER_WINDOW);

    for (let j = 0; j < window.length; j += CONCURRENCY) {
      const sub = window.slice(j, j + CONCURRENCY);
      attempted += sub.length;
      const counts = await Promise.all(sub.map(r => checkOne(r.project_name_en!)));
      sub.forEach((r, idx) => {
        const n = counts[idx];
        if (n > 0) {
          findings.push({
            project_id: r.project_id, name: r.project_name_en!, area: r.area_name_en,
            percent_completed: r.percent_completed, recentContracts: n,
          });
        }
      });
    }

    if (i + CALLS_PER_WINDOW < named.length) {
      const elapsed = Date.now() - windowStart;
      const waitMs = Math.max(0, WINDOW_MS - elapsed);
      if (waitMs > 0) await new Promise(r => setTimeout(r, waitMs));
    }
  }

  findings.sort((a, b) => b.recentContracts - a.recentContracts);
  return NextResponse.json({
    offset,
    totalNamedProjects: rows.filter(r => r.project_name_en).length,
    attempted,
    remaining: named.length - attempted,
    findingsCount: findings.length,
    findings,
  });
}
