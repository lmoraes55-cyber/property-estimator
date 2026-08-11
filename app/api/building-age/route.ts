/**
 * GET /api/building-age?building=<name>&dldKey=<optional raw DLD project name>
 *
 * Looks up a building's completion/handover date via the DDA open API by
 * joining dld_units-open-api (project name → project_id) with
 * dld_projects-open-api (project_id → completion_date / status).
 *
 * Runs from Vercel UAE region to satisfy DDA geo-restriction.
 * Results are cached in-process for 24h (completion dates are stable).
 */

import { NextResponse } from "next/server";
import { fetchBuildingAge, resolveDLDName, type BuildingAgeResult } from "@/lib/dda-client";

export const dynamic = "force-dynamic";
export const preferredRegion = "dxb1";

const cache = new Map<string, { result: BuildingAgeResult; ts: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

const NOT_FOUND_LOCAL: BuildingAgeResult = {
  matched: false, projectNameDLD: null, projectStatus: null, completionDate: null,
  completionYear: null, ageYears: null, percentCompleted: null, projectStartDate: null,
};

function normKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}

/** Fraction of the query's significant tokens (len > 2) present in the candidate. */
function wordOverlap(query: string, candidate: string): number {
  const q = normKey(query);
  const c = normKey(candidate);
  const qTokens = q.split(" ").filter(t => t.length > 2);
  if (!qTokens.length) return 0;
  const hits = qTokens.filter(t => c.includes(t));
  return hits.length / qTokens.length;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const building = (searchParams.get("building") ?? "").trim();
  const dldKey   = (searchParams.get("dldKey")   ?? "").trim();

  if (!building && !dldKey) {
    return NextResponse.json({ error: "building or dldKey is required" }, { status: 400 });
  }

  const cacheKey = normKey(dldKey || building);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.result);
  }

  const notConfigured = !process.env.DDA_BASE_URL || !process.env.DDA_CLIENT_ID;
  if (notConfigured) {
    return NextResponse.json({
      matched: false, projectNameDLD: null, projectStatus: null, completionDate: null,
      completionYear: null, ageYears: null, percentCompleted: null, projectStartDate: null,
    } satisfies BuildingAgeResult);
  }

  try {
    // dldKey (from the DLD-sourced autocomplete) is already the exact official
    // project name — trust it as-is. Otherwise try the raw building name first
    // (many curated names already match DLD's naming), then fall back to the
    // curated name-map resolver. The resolver's progressive-shortening lookup
    // can over-match short/ambiguous names (e.g. "Marina Gate" → "Marina"),
    // so any resolved name is validated against the original query before use.
    let result: BuildingAgeResult = NOT_FOUND_LOCAL;
    if (dldKey) {
      result = await fetchBuildingAge(dldKey);
    } else {
      result = await fetchBuildingAge(building);
      if (!result.matched) {
        const resolved = resolveDLDName(building);
        if (resolved && wordOverlap(building, resolved) >= 0.6) {
          result = await fetchBuildingAge(resolved);
        }
      }
    }
    cache.set(cacheKey, { result, ts: Date.now() });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[building-age]", (err as Error).message);
    const fallback: BuildingAgeResult = {
      matched: false, projectNameDLD: null, projectStatus: null, completionDate: null,
      completionYear: null, ageYears: null, percentCompleted: null, projectStartDate: null,
    };
    return NextResponse.json(fallback);
  }
}
