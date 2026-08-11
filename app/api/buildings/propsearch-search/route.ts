import { NextResponse } from "next/server";
import locations from "@/lib/data/propsearch-locations.json";

// Server-only substring search over Propsearch's free locations lookup
// (12k+ Dubai buildings/communities, name + PSL code only — no phase/
// pricing metadata since that's gated behind their paid plan). Used as a
// third-tier fallback in the estimator's building search, below our own
// DLD-linked and curated building lists, purely so a real building name
// gets recognized instead of falling through to "+ Use anyway".
// Kept server-side (not imported into the client bundle) since the raw
// dataset is ~800KB.

interface PropsearchLocation {
  n: string; // name
  p: string; // psl_code
  pp: string | null; // parent_psl_code
}

const DATA = locations as PropsearchLocation[];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const results = DATA.filter(l => l.n.toLowerCase().includes(q)).slice(0, 8).map(l => l.n);
  return NextResponse.json({ results });
}
