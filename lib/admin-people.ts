import { createServiceClient } from "@/lib/supabase/service";

/**
 * Net income figure for a report_log row, if one was captured. Rental
 * Analyzer stores the full estimator output in result_snapshot
 * (annualNetToLandlord); STR Sub-Leasing stores the email summary in
 * params (strNetPerYear). Operator Match has no net-income concept.
 */
export function reportNetIncome(row: { params: unknown; result_snapshot: unknown }): number | null {
  const snapshot = row.result_snapshot as Record<string, unknown> | null;
  if (snapshot && typeof snapshot.annualNetToLandlord === "number") return snapshot.annualNetToLandlord;
  const params = row.params as Record<string, unknown> | null;
  if (params && typeof params.strNetPerYear === "string") {
    const n = Number(params.strNetPerYear.replace(/,/g, ""));
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

export interface PersonSummary {
  key: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  hasAccount: boolean;
  leadCount: number;
  reportCount: number;
  lastActivityAt: string;
}

/**
 * Grouping key for one contact: email if present (lowercased, trimmed),
 * else phone digits-only (so formatting differences like "+971 50 123"
 * vs "0501234567" collapse to the same key). Returns null if neither is
 * usable — those rows are excluded from grouping rather than merged
 * incorrectly.
 */
export function groupContactKey(email: string | null, phone: string | null): string | null {
  const e = (email ?? "").trim().toLowerCase();
  if (e) return `e:${e}`;
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits) return `p:${digits}`;
  return null;
}

export async function fetchPeople(): Promise<PersonSummary[]> {
  const supabase = createServiceClient();

  const [leadsRes, reportsRes, profilesRes] = await Promise.all([
    supabase.from("leads").select("name, email, phone, created_at"),
    supabase.from("report_log").select("name, email, phone, created_at"),
    supabase.from("profiles").select("email, first_name, last_name, phone, whatsapp"),
  ]);

  const byKey = new Map<string, PersonSummary>();

  function upsert(name: string | null, email: string | null, phone: string | null, createdAt: string, kind: "lead" | "report" | "account") {
    const key = groupContactKey(email, phone);
    if (!key) return;
    const existing = byKey.get(key);
    if (existing) {
      if (!existing.name && name) existing.name = name;
      if (!existing.phone && phone) existing.phone = phone;
      if (kind === "lead") existing.leadCount++;
      if (kind === "report") existing.reportCount++;
      if (kind === "account") existing.hasAccount = true;
      if (createdAt > existing.lastActivityAt) existing.lastActivityAt = createdAt;
    } else {
      byKey.set(key, {
        key, name, email, phone,
        hasAccount: kind === "account",
        leadCount: kind === "lead" ? 1 : 0,
        reportCount: kind === "report" ? 1 : 0,
        lastActivityAt: createdAt,
      });
    }
  }

  for (const row of leadsRes.data ?? []) upsert(row.name, row.email, row.phone, row.created_at, "lead");
  for (const row of reportsRes.data ?? []) upsert(row.name, row.email, row.phone, row.created_at, "report");
  for (const row of profilesRes.data ?? []) {
    const fullName = [row.first_name, row.last_name].filter(Boolean).join(" ") || null;
    upsert(fullName, row.email, row.phone || row.whatsapp, "1970-01-01T00:00:00Z", "account");
  }

  return [...byKey.values()].sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));
}
