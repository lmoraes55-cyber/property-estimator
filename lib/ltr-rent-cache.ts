/**
 * SHARED CACHE FOR LIVE LTR LOOKUPS
 *
 * /api/ltr-rents also keeps a module-level Map, but that is per-instance and
 * Vercel serves from whichever instance is warm — measured 2026-09-01, a
 * repeat lookup for "Marina Gate 1" still took 23.5s because it landed cold.
 * This backs that with Postgres so the hit survives across instances.
 *
 * Failures here are never fatal. A cache is an optimisation: if Supabase is
 * unreachable or the table has not been migrated yet, every function degrades
 * to "miss" and the route does what it did before, just slower.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface CachedLookup {
  stat: unknown | null;
  recent: unknown[];
  matchLevel: string | null;
  masterUsed: string | null;
  windowDays: number;
}

let client: SupabaseClient | null = null;

function serviceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // Placeholder values are what `vercel env pull` writes for Secret vars, so
  // local dev would otherwise construct a client that fails on every call.
  if (!url || !key || /^\[.*\]$/.test(url) || /^\[.*\]$/.test(key)) return null;
  client ??= createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export async function readCache(key: string, ttlMs: number): Promise<CachedLookup | null> {
  const supabase = serviceClient();
  if (!supabase) return null;
  try {
    const cutoff = new Date(Date.now() - ttlMs).toISOString();
    const { data, error } = await supabase
      .from("ltr_rent_cache")
      .select("stat, recent, match_level, master_used, window_days")
      .eq("cache_key", key)
      .gte("created_at", cutoff)
      .maybeSingle();
    if (error || !data) return null;
    return {
      stat: data.stat ?? null,
      recent: Array.isArray(data.recent) ? data.recent : [],
      matchLevel: data.match_level ?? null,
      masterUsed: data.master_used ?? null,
      windowDays: data.window_days ?? 0,
    };
  } catch {
    return null;
  }
}

export async function writeCache(key: string, value: CachedLookup): Promise<void> {
  const supabase = serviceClient();
  if (!supabase) return;
  try {
    await supabase.from("ltr_rent_cache").upsert(
      {
        cache_key: key,
        stat: value.stat ?? null,
        recent: value.recent ?? [],
        match_level: value.matchLevel,
        master_used: value.masterUsed,
        window_days: value.windowDays,
        // Refresh the timestamp so an upsert restarts the TTL rather than
        // inheriting the original row's age.
        created_at: new Date().toISOString(),
      },
      { onConflict: "cache_key" }
    );
  } catch {
    // Losing a cache write costs one slow lookup later. Never fail the request.
  }
}
