/**
 * GET /api/dld-developer?name=<developer name>
 *
 * Looks up a developer in the DLD (Dubai Land Department) official registry
 * via the DDA open API. Returns registration date, DLD number, and license type.
 *
 * Runs from Vercel UAE region to satisfy DDA geo-restriction.
 * Results are cached in-process for 24h (developer registrations are stable).
 */

import { NextResponse } from "next/server";
import { ddaQuery } from "@/lib/dda-client";

export const dynamic = "force-dynamic";
export const preferredRegion = "dxb1";

export interface DLDDeveloperResult {
  matched: boolean;
  developerNameDLD: string | null;
  developerNumber: number | null;
  registrationDate: string | null;        // YYYY-MM-DD
  registrationYear: number | null;
  licenseType: string | null;
  licenseSource: string | null;
}

interface DLDDeveloperRow {
  developer_number:  number;
  developer_name_en: string;
  registration_date: string;
  license_type_en:   string;
  license_source_en: string;
}

// In-process cache: normalized developer name → result
const cache = new Map<string, { result: DLDDeveloperResult; ts: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

function normName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}

function scoreMatch(query: string, candidate: string): number {
  const q = normName(query);
  const c = normName(candidate);
  if (c === q) return 1.0;
  if (c.startsWith(q)) return 0.9;
  const tokens = q.split(" ").filter(t => t.length > 2);
  const hits = tokens.filter(t => c.includes(t));
  return tokens.length ? hits.length / tokens.length : 0;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawName = (searchParams.get("name") ?? "").trim();

  if (!rawName) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const cacheKey = normName(rawName);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.result);
  }

  const notConfigured = !process.env.DDA_BASE_URL || !process.env.DDA_CLIENT_ID;
  if (notConfigured) {
    return NextResponse.json({ matched: false, developerNameDLD: null, developerNumber: null, registrationDate: null, registrationYear: null, licenseType: null, licenseSource: null } satisfies DLDDeveloperResult);
  }

  try {
    // Build search variants, broadest to most specific
    const upper = rawName.toUpperCase();
    const searchTerms = new Set<string>();
    searchTerms.add(upper);

    // Strip noise words DLD often omits
    const stripped = upper
      .replace(/\bDEVELOPERS?\b/g, "")
      .replace(/\bPROPERTIES\b/g, "")
      .replace(/\bDEVELOPMENTS?\b/g, "")
      .replace(/\bREALTY\b/g, "")
      .replace(/\bGROUP\b/g, "")
      .replace(/\bCITY\b/g, "")
      .replace(/\s+/g, " ").trim();
    if (stripped && stripped !== upper) searchTerms.add(stripped);

    // First keyword only (e.g. "SOBHA REALTY" → try "SOBHA")
    const firstWord = upper.split(/\s+/)[0];
    if (firstWord.length >= 4) searchTerms.add(firstWord);

    // First two words (e.g. "INVEST GROUP OVERSEAS" → "INVEST GROUP")
    const firstTwo = upper.split(/\s+/).slice(0, 2).join(" ");
    if (firstTwo !== upper && firstTwo.length >= 5) searchTerms.add(firstTwo);

    let bestRow: DLDDeveloperRow | null = null;
    let bestScore = 0;

    for (const term of [...searchTerms]) {
      const { results } = await ddaQuery<DLDDeveloperRow>({
        entity: "dld",
        dataset: "dld_developers-open-api",
        likeFilters: { developer_name_en: `${term}%` },
        columns: ["developer_number", "developer_name_en", "registration_date", "license_type_en", "license_source_en"],
        pageSize: 20,
        page: 1,
        orderBy: "registration_date",
        orderDir: "asc",
      });

      for (const row of results) {
        const score = scoreMatch(rawName, row.developer_name_en ?? "");
        if (score > bestScore) { bestScore = score; bestRow = row; }
      }
      if (bestScore >= 0.8) break;
    }

    const result: DLDDeveloperResult = bestRow && bestScore >= 0.5 ? {
      matched: true,
      developerNameDLD: bestRow.developer_name_en ?? null,
      developerNumber: bestRow.developer_number ?? null,
      registrationDate: bestRow.registration_date ?? null,
      registrationYear: bestRow.registration_date ? parseInt(bestRow.registration_date.slice(0, 4), 10) : null,
      licenseType: bestRow.license_type_en ?? null,
      licenseSource: bestRow.license_source_en ?? null,
    } : {
      matched: false,
      developerNameDLD: null,
      developerNumber: null,
      registrationDate: null,
      registrationYear: null,
      licenseType: null,
      licenseSource: null,
    };

    cache.set(cacheKey, { result, ts: Date.now() });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[dld-developer]", (err as Error).message);
    const fallback: DLDDeveloperResult = {
      matched: false, developerNameDLD: null, developerNumber: null,
      registrationDate: null, registrationYear: null, licenseType: null, licenseSource: null,
    };
    return NextResponse.json(fallback);
  }
}
