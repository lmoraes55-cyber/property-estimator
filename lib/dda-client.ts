/**
 * DDA (Dubai Data Authority) API client — server-side only.
 * Manages OAuth2 token caching and provides a typed fetch helper
 * for the data.dubai open API.
 */

// ── Token cache (process-level, survives hot-reload in dev) ───────────────
let cachedToken: string | null = null;
let tokenExpiresAt = 0; // epoch ms

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const base   = (process.env.DDA_BASE_URL        ?? "").trim();
  const appId  = (process.env.DDA_APP_IDENTIFIER  ?? "").trim();
  const cid    = (process.env.DDA_CLIENT_ID       ?? "").trim();
  const secret = (process.env.DDA_CLIENT_SECRET   ?? "").trim();

  if (!base || !appId || !cid || !secret) throw new Error("DDA env vars not configured");

  const res = await fetch(
    `${base}/secure/ssis/dubaiai/gatewaytoken/1.0.0/getAccessToken`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-DDA-SecurityApplicationIdentifier": appId,
      },
      body: new URLSearchParams({ grant_type: "client_credentials", client_id: cid, client_secret: secret }).toString(),
      signal: AbortSignal.timeout(15_000),
    }
  );

  if (!res.ok) throw new Error(`DDA token fetch failed: ${res.status}`);
  const data = await res.json();
  if (!data.access_token) throw new Error("DDA token response missing access_token");

  cachedToken = data.access_token;
  // Refresh 5 minutes before actual expiry (expires_in is in seconds, default 3600)
  tokenExpiresAt = Date.now() + ((data.expires_in ?? 3600) - 300) * 1000;
  return cachedToken!;
}

// ── Raw query ──────────────────────────────────────────────────────────────

export interface DDAQueryOptions {
  entity: string;
  dataset: string;
  page?: number;
  pageSize?: number;
  /** column=value pairs sent as individual query params (most reliable filter method) */
  filters?: Record<string, string>;
  columns?: string[];
  orderBy?: string;
  orderDir?: "asc" | "desc";
}

export async function ddaQuery<T = Record<string, unknown>>(
  opts: DDAQueryOptions
): Promise<{ results: T[]; total: number }> {
  const base  = (process.env.DDA_BASE_URL ?? "").trim();
  const token = await getToken();

  const url = new URL(`${base}/open/${opts.entity}/${opts.dataset}`);
  if (opts.page)     url.searchParams.set("page",     String(opts.page));
  if (opts.pageSize) url.searchParams.set("pageSize", String(opts.pageSize));
  if (opts.columns?.length) url.searchParams.set("column", opts.columns.join(","));
  if (opts.orderBy)  url.searchParams.set("order_by",  opts.orderBy);
  if (opts.orderDir) url.searchParams.set("order_dir", opts.orderDir);

  // Append each filter as `filter=column_name=value` (DDA syntax)
  if (opts.filters) {
    for (const [col, val] of Object.entries(opts.filters)) {
      url.searchParams.append("filter", `${col}=${val}`);
    }
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(25_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`DDA query failed: ${res.status} ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  const results: T[] = json.results ?? json.data ?? json.records ?? [];
  const total: number = json.total ?? json.count ?? results.length;
  return { results, total };
}

// ── DLD Rent Contract record (key fields only) ─────────────────────────────

export interface DLDRentContract {
  contract_id: string;
  annual_amount: number;
  actual_area: number;
  project_name_en: string;
  area_name_en: string;
  ejari_property_type_en: string;
  ejari_property_sub_type_en: string;  // e.g. "Studio", "1 bed room+hall"
  property_usage_en: string;            // "Residential", "Commercial" …
  contract_start_date: string;          // "YYYY-MM-DD"
  contract_end_date: string;
  is_free_hold: number;
}

// ── Bedroom type normaliser (matches ingest-dld-rents.mjs logic) ──────────

/** Map DLD ejari_property_sub_type_en → our UnitSize bucket */
export function dldBedroomBucket(subType: string, propType?: string): string | null {
  const r = String(subType ?? "").toLowerCase();
  const t = String(propType ?? "").toLowerCase();
  if (r.includes("studio")) return "Studio";
  const m = r.match(/(\d+)\s*bed/);
  const beds = m ? parseInt(m[1], 10) : null;
  if (beds === null) return null;
  const isVilla = t.includes("villa") || t.includes("townhouse");
  if (!isVilla) {
    if (beds <= 1) return "1BR";
    if (beds === 2) return "2BR";
    if (beds === 3) return "3BR";
    return beds + "BR";
  }
  return null; // skip villas for residential LTR benchmarking
}

// ── Stats helpers ──────────────────────────────────────────────────────────

function median(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function percentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo));
}

export interface LTRStat {
  median: number;
  p25: number;
  p75: number;
  n: number;
  aedPerSqft?: number;
  medianSqft?: number;
  asOf: string;
  source: "dda-live";
}

/** Compute LTR stats from an array of rent contract records. */
export function computeLTRStats(contracts: DLDRentContract[]): LTRStat | null {
  const rents = contracts
    .map(c => c.annual_amount)
    .filter(v => v > 5_000 && v < 5_000_000) // sanity bounds
    .sort((a, b) => a - b);

  if (rents.length < 3) return null;

  const areas  = contracts.map(c => c.actual_area).filter(v => v > 50 && v < 50_000);
  const latestDate = contracts
    .map(c => c.contract_start_date)
    .filter(Boolean)
    .sort()
    .at(-1)
    ?.slice(0, 7) ?? "";

  const medianRent = median(rents);
  const medianArea = areas.length ? median([...areas].sort((a, b) => a - b)) : undefined;

  return {
    median: medianRent,
    p25:    percentile(rents, 25),
    p75:    percentile(rents, 75),
    n:      rents.length,
    aedPerSqft: medianArea ? Math.round(medianRent / medianArea) : undefined,
    medianSqft: medianArea,
    asOf:   latestDate,
    source: "dda-live",
  };
}

/** Fetch all rent contracts for a project name, optionally filtered by date window. */
export async function fetchProjectContracts(
  projectName: string,
  options: { monthsBack?: number; maxRecords?: number } = {}
): Promise<DLDRentContract[]> {
  const { monthsBack = 24, maxRecords = 2000 } = options;

  // Cut-off date: contracts starting within the last N months
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - monthsBack);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const columns: (keyof DLDRentContract)[] = [
    "contract_id", "annual_amount", "actual_area",
    "project_name_en", "area_name_en",
    "ejari_property_type_en", "ejari_property_sub_type_en",
    "property_usage_en", "contract_start_date", "contract_end_date", "is_free_hold",
  ];

  const allContracts: DLDRentContract[] = [];
  const pageSize = 1000;
  let page = 1;

  while (allContracts.length < maxRecords) {
    const { results } = await ddaQuery<DLDRentContract>({
      entity:   "dld",
      dataset:  "dld_rent_contracts-open-api",
      page,
      pageSize,
      columns:  columns as string[],
      filters:  { project_name_en: projectName },
      orderBy:  "contract_start_date",
      orderDir: "desc",
    });

    if (!results.length) break;

    // Filter recency and residential usage client-side
    const recent = results.filter(c =>
      c.contract_start_date >= cutoffStr &&
      (c.property_usage_en?.toLowerCase().includes("resid") ?? true)
    );

    allContracts.push(...recent);

    // If we got a full page, there may be more — but stop at maxRecords
    if (results.length < pageSize) break;
    page++;
  }

  return allContracts;
}
