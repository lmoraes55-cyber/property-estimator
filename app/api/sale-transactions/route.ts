/**
 * GET /api/sale-transactions?project=<name>&bedrooms=<Studio|1BR|2BR|3BR>
 *
 * Returns live sale-price stats + 5 most recent transactions from DDA / DLD
 * (dld_transactions-open-api). No static fallback yet — DDA-only.
 *
 * Used by the Focus Panel on /investment-research/2026-handovers (Recent Resale
 * Activity) via a project's resolved project_name_en. Also available for a
 * future Sale Price Estimator use.
 */

import { NextResponse } from "next/server";
import {
  fetchSaleTransactions,
  computeSaleStats,
  dldRoomsBucket,
  type SaleStat,
  type DLDSaleTransaction,
} from "@/lib/dda-client";

export const dynamic = "force-dynamic";
export const preferredRegion = "dxb1";

export interface RecentSale {
  date: string;          // YYYY-MM-DD
  price: number;         // AED
  areaSqft: number;
  aedPerSqft: number;
  offPlan: boolean;
}

interface CacheEntry {
  stat: SaleStat | null;
  recent: RecentSale[];
  windowDays: number;
  ts: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function cacheKey(project: string, bedrooms: string, sizeSqft: number) {
  return `${project.toLowerCase().trim()}|${bedrooms}|${sizeSqft || ""}`;
}

const SIZE_BAND_PCT = 0.12;

function withinSizeBand(t: DLDSaleTransaction, sizeSqft: number): boolean {
  const areaSqft = t.procedure_area > 0 ? t.procedure_area * 10.764 : 0;
  if (!areaSqft) return false;
  return Math.abs(areaSqft - sizeSqft) <= sizeSqft * SIZE_BAND_PCT;
}

function fromCache(key: string): CacheEntry | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return undefined; }
  return entry;
}

function toRecentSales(transactions: DLDSaleTransaction[]): RecentSale[] {
  return transactions
    .filter(t => t.instance_date && t.actual_worth > 0)
    .sort((a, b) => b.instance_date.localeCompare(a.instance_date))
    .slice(0, 5)
    .map(t => {
      const areaSqft = t.procedure_area > 0 ? Math.round(t.procedure_area * 10.764) : 0;
      return {
        date: t.instance_date,
        price: Math.round(t.actual_worth),
        areaSqft,
        aedPerSqft: areaSqft > 0 ? Math.round(t.actual_worth / areaSqft) : 0,
        offPlan: t.reg_type_en === "Off-Plan Properties",
      };
    });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const project  = (searchParams.get("project")  ?? "").trim();
  const bedrooms = (searchParams.get("bedrooms") ?? "").trim();
  const sizeSqft = Number(searchParams.get("sizeSqft") ?? "") || 0;

  if (!project) {
    return NextResponse.json({ error: "project is required" }, { status: 400 });
  }

  const key = cacheKey(project, bedrooms, sizeSqft);
  const cached = fromCache(key);
  if (cached) {
    return NextResponse.json({
      stat: cached.stat,
      source: cached.stat ? "dda-live-cached" : "not-found",
      windowDays: cached.windowDays,
      recentTransactions: cached.recent,
    });
  }

  const ddaConfigured =
    process.env.DDA_BASE_URL &&
    process.env.DDA_CLIENT_ID &&
    process.env.DDA_CLIENT_SECRET &&
    process.env.DDA_APP_IDENTIFIER;

  if (!ddaConfigured) {
    return NextResponse.json({ stat: null, source: "not-configured", recentTransactions: [] });
  }

  try {
    const MIN_TXNS = 5;
    // Sales are lower-frequency than rent contracts — start wider, and widen further
    // than usual when we're also filtering by size band since that shrinks the pool.
    const WINDOWS = sizeSqft > 0 ? [180, 365, 730, 1095] : [180, 365, 730];

    let stat: SaleStat | null = null;
    let recent: RecentSale[] = [];
    let windowUsed = 0;
    let sizeFilterApplied = false;

    const bedroomFilter = (t: DLDSaleTransaction) =>
      bedrooms ? dldRoomsBucket(t.rooms_en) === bedrooms : true;

    // Pass 1: bedroom bucket + size band (if a size was given).
    if (sizeSqft > 0) {
      for (const daysBack of WINDOWS) {
        const transactions = await fetchSaleTransactions(project, { daysBack });
        const today = new Date().toISOString().slice(0, 10);
        const filtered = transactions.filter(
          t => bedroomFilter(t) && t.instance_date <= today && withinSizeBand(t, sizeSqft)
        );
        const sorted = [...filtered].sort((a, b) => b.instance_date.localeCompare(a.instance_date));

        if (sorted.length >= MIN_TXNS) {
          stat = computeSaleStats(sorted);
          recent = toRecentSales(sorted);
          windowUsed = daysBack;
          sizeFilterApplied = true;
          break;
        }
      }
    }

    // Pass 2: fall back to bedroom-bucket only (no size band) if pass 1 came up short.
    if (!stat) {
      for (const daysBack of WINDOWS) {
        const transactions = await fetchSaleTransactions(project, { daysBack });
        const today = new Date().toISOString().slice(0, 10);
        const filtered = transactions.filter(t => bedroomFilter(t) && t.instance_date <= today);
        const sorted = [...filtered].sort((a, b) => b.instance_date.localeCompare(a.instance_date));

        if (sorted.length >= MIN_TXNS || (sorted.length > 0 && daysBack === WINDOWS[WINDOWS.length - 1])) {
          stat = computeSaleStats(sorted);
          recent = toRecentSales(sorted);
          windowUsed = daysBack;
          break;
        }
      }
    }

    cache.set(key, { stat, recent, windowDays: windowUsed, ts: Date.now() });
    return NextResponse.json({
      stat,
      source: stat ? "dda-live" : "not-found",
      sizeFilterApplied,
      windowDays: windowUsed,
      recentTransactions: recent,
    });
  } catch (err) {
    console.error("[sale-transactions] DDA API error:", (err as Error).message);
    return NextResponse.json({ stat: null, source: "error", recentTransactions: [] });
  }
}
