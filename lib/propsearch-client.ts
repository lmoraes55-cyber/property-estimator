// Propsearch Vista API client — SERVER-ONLY.
// Docs: https://propsearch.ae/api/docs
// Auth: Authorization: Bearer <token>. Free "locations:lookup" and
// "locations:smart-match" scopes confirmed on our token; information,
// valuations, and transactions may require a paid plan — check response
// for a 403 "Invalid ability provided" before assuming a bug.

const BASE_URL = "https://propsearch.ae/api/vista";
const TOKEN = process.env.PROPSEARCH_API_TOKEN;

function authHeaders() {
  if (!TOKEN) throw new Error("PROPSEARCH_API_TOKEN is not set");
  return {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function get<T>(path: string, params: Record<string, string | number | undefined>): Promise<T> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) qs.set(k, String(v));
  }
  const url = `${BASE_URL}${path}${qs.toString() ? `?${qs}` : ""}`;
  const res = await fetch(url, { headers: authHeaders(), signal: AbortSignal.timeout(20_000) });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Propsearch ${path} failed: ${res.status} ${body.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

export interface PropsearchLocation {
  name: string;
  psl_code: string;
  parent_psl_code: string | null;
}

export interface PropsearchLocationEnhanced extends PropsearchLocation {
  coordinates: string; // "lat,lng"
  weight: string;
  aka?: string;
}

/** Full locations lookup (basic). Cached ~12h upstream; can take up to 50s on a cache miss. */
export async function fetchLocationsLookup(): Promise<PropsearchLocation[]> {
  return get<PropsearchLocation[]>("/lookup", {});
}

/** Full locations lookup with coordinates/weight/aka. Cached ~12h upstream. */
export async function fetchLocationsLookupEnhanced(): Promise<PropsearchLocationEnhanced[]> {
  return get<PropsearchLocationEnhanced[]>("/lookup-enhanced", {});
}

export interface SmartMatchResult {
  status_code: "match_found" | "no_match" | "city_invalid" | "address_invalid" | "service_offline";
  status_description: string;
  match_psl_code?: string;
  match_name?: string;
  match_address?: string;
  match_resolution?: "High" | "Medium" | "Low";
  input_address: string;
  address_coverage?: "Full" | "Wide" | "Narrow";
  returned_at: string;
}

/** Resolve a free-text address (widest-to-narrowest CSV) to a PSL code. */
export async function smartMatchAddress(addressCsv: string): Promise<SmartMatchResult> {
  return get<SmartMatchResult>("/smart-match", { address: addressCsv });
}

export interface LocationInformation {
  location_name: string;
  address: string;
  category: string;
  phase: "Planned" | "Under Development" | "Complete";
  developer: string | null;
  completion_date: string | null;
  estimated_completion_date: string | null;
  nearest_metro: { name: string; distance_metres: number } | null;
  nearest_mall: { name: string; distance_metres: number } | null;
  nearest_school: { name: string; distance_metres: number } | null;
  nearest_grocery_shop: { name: string; distance_metres: number } | null;
}

/** Building/community details — type, developer, completion, nearby amenities. */
export async function fetchLocationInformation(pslCode: string): Promise<LocationInformation> {
  return get<LocationInformation>("/information", { psl_code: pslCode });
}

/** Segment codes used by /valuations and /transactions. */
export type PropsearchSegment = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface ValuationResponse {
  estimate: {
    input: Record<string, unknown>;
    location_data: Record<string, unknown>;
    sale: Record<string, unknown>;
    rent: Record<string, unknown>;
  };
}

/** DLD-transaction-backed price estimate (sale + rent) for a location. */
export async function fetchLocationValuation(
  pslCode: string,
  segment: PropsearchSegment,
  sizeSqm: number,
  bedrooms?: number
): Promise<ValuationResponse> {
  return get<ValuationResponse>("/valuations", { psl_code: pslCode, segment, size_sqm: sizeSqm, bedrooms });
}

export interface TransactionsResponse {
  location_name: string;
  address: string;
  segment: string;
  bedrooms: string;
  sale_transactions: Array<Record<string, unknown>>;
  rent_transactions: Array<Record<string, unknown>>;
}

/** Up to 25 latest DLD sale + Ejari rent transaction records for a location. */
export async function fetchLocationTransactions(
  pslCode: string,
  segment: PropsearchSegment,
  bedrooms?: number
): Promise<TransactionsResponse> {
  return get<TransactionsResponse>("/transactions", { psl_code: pslCode, segment, bedrooms });
}
