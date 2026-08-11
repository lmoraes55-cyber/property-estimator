// Bayut location autocomplete — SERVER-ONLY, internal use only.
// Sourced via the "UAE Real Estate" RapidAPI listing (publisher: happyendpoint),
// which scrapes Bayut. Never call this from a public page or surface its data
// on the site — it exists purely as a third independent naming/hierarchy
// reference to help resolve area-name mismatches between DLD and AirROI
// during backend investigation (see AIRROI_MARKET_MAP / AIRROI_GEO_MAP in
// app/api/cron/str-market-refresh/route.ts for the kind of mismatch this helps with).

const RAPIDAPI_HOST = "uae-real-estate3.p.rapidapi.com";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

export interface BayutLocation {
  id: number;
  externalID: string;
  name: string | null;
  slug: string | null;
  level: number; // 0=country, 1=city, 2=neighbourhood, 3+=building/sub-area
  type: string;
  lat: number | null;
  lng: number | null;
  path: string;
  adCount: number | null;
}

export async function searchBayutLocations(query: string): Promise<BayutLocation[]> {
  if (!RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY is not set");
  }

  const res = await fetch(
    `https://${RAPIDAPI_HOST}/autocomplete?query=${encodeURIComponent(query)}&page=1&langs=en`,
    {
      headers: {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
      signal: AbortSignal.timeout(15_000),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Bayut autocomplete failed for "${query}": ${res.status} ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    success?: boolean;
    data?: { locations?: Array<Record<string, any>> };
  };

  return (json.data?.locations ?? []).map(l => ({
    id: l.id,
    externalID: l.externalID,
    name: l.name?.en ?? null,
    slug: l.slug?.en ?? null,
    level: l.level,
    type: l.type,
    lat: l.geography?.lat ?? null,
    lng: l.geography?.lng ?? null,
    path: l.path ?? "",
    adCount: l.adCount ?? null,
  }));
}
