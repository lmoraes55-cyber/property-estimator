"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { createClient } from "@/lib/supabase/client";
import { colors } from "@/lib/colors";

const DISPLAY = "var(--font-display), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-mono-ai), ui-monospace, monospace";

interface PropertyRow {
  id: string;
  building_name: string | null;
  area: string | null;
  unit_size: string | null;
  unit_type: string | null;
  floor: number | null;
  property_value: number | null;
  created_at: string;
}

interface ReportRow {
  id: string;
  building_name: string | null;
  unit_size: string | null;
  floor: number | null;
  recommendation: string | null;
  str_net_annual: number | null;
  ltr_annual: number | null;
  created_at: string;
}

interface RequestRow {
  id: string;
  service_type: string | null;
  status: string | null;
  created_at: string;
}

const fmtAED = (n: number) => `AED ${Math.round(n).toLocaleString("en-US")}`;
const fmtCompact = (n: number) =>
  n >= 1_000_000 ? `AED ${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000 ? `AED ${Math.round(n / 1000)}K`
  : `AED ${Math.round(n)}`;

/** The saved column is free text ("LTR", "Long-Term Rental", …) — match, don't equal. */
const isLTR = (rec: string | null) => /ltr|long/i.test(rec || "");

function relativeDate(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: colors.textLight, margin: "0 0 6px" }}>
      {children}
    </p>
  );
}

function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 22, padding: "24px 26px", ...style }}>
      {children}
    </section>
  );
}

/** Donut whose segments filter the report table. A legend row carries the
 *  count, because a slice angle alone answers "roughly how much", never
 *  "how many" — and these datasets are small enough that the count is
 *  the thing worth reading. */
function FilterDonut({
  title, data, active, onToggle, emptyNote,
}: {
  title: string;
  data: { id: string; label: string; value: number; color: string }[];
  active: string | null;
  onToggle: (key: string) => void;
  emptyNote: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <Section>
      <Eyebrow>{title}</Eyebrow>
      {total === 0 ? (
        <p style={{ fontSize: 13.5, color: colors.textMuted, margin: "10px 0 0" }}>{emptyNote}</p>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ width: 150, height: 150, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data} dataKey="value" nameKey="label"
                  innerRadius={44} outerRadius={70} paddingAngle={2} stroke="none"
                  // The slice payload types `key` as React's reserved Key, so the
                  // series carries `id` and the handler resolves it by index.
                  onClick={(_, index) => onToggle(data[index].id)}
                >
                  {data.map(d => (
                    <Cell
                      key={d.id}
                      fill={d.color}
                      opacity={active && active !== d.id ? 0.28 : 1}
                      style={{ cursor: "pointer", outline: "none" }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [`${v} of ${total}`, String(n)]}
                  contentStyle={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 12, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
            {data.map(d => {
              const on = active === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => onToggle(d.id)}
                  aria-pressed={on}
                  style={{
                    display: "grid", gridTemplateColumns: "10px 1fr auto auto", alignItems: "center", gap: 10,
                    padding: "6px 8px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                    background: on ? "rgba(27,94,74,0.06)" : "transparent",
                    border: `1px solid ${on ? "rgba(27,94,74,0.22)" : "transparent"}`,
                  }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
                  <span style={{ fontSize: 13, color: colors.textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12.5, color: colors.primary, fontVariantNumeric: "tabular-nums" }}>{d.value}</span>
                  <span style={{ fontSize: 11.5, color: colors.textLight, fontVariantNumeric: "tabular-nums", minWidth: 38, textAlign: "right" }}>
                    {Math.round((d.value / total) * 100)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Section>
  );
}

type SortKey = "date" | "delta" | "net";

export default function DashboardPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [verdictFilter, setVerdictFilter] = useState<string | null>(null);
  const [sizeFilter, setSizeFilter] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("date");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      if (cancelled) return;

      const fullName = user.user_metadata?.full_name || user.email || "";
      setFirstName(fullName.split(" ")[0] || "");

      const [profileRes, propsRes, reportsRes, reqRes] = await Promise.all([
        supabase.from("profiles").select("is_admin").eq("id", user.id).single(),
        supabase.from("properties").select("id, building_name, area, unit_size, unit_type, floor, property_value, created_at").order("created_at", { ascending: false }),
        supabase.from("saved_reports").select("id, building_name, unit_size, floor, recommendation, str_net_annual, ltr_annual, created_at").order("created_at", { ascending: false }),
        supabase.from("service_requests").select("id, service_type, status, created_at").order("created_at", { ascending: false }),
      ]);
      if (cancelled) return;

      setIsAdmin(!!profileRes.data?.is_admin);
      setProperties(propsRes.data || []);
      setReports(reportsRes.data || []);
      setRequests(reqRes.data || []);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [router]);

  const portfolioValue = properties.reduce((s, p) => s + (p.property_value || 0), 0);
  const openRequests = requests.filter(r => r.status !== "completed").length;

  // The headline figure follows each report's own verdict, so a portfolio of
  // mixed recommendations totals what it would actually earn if followed.
  const projectedNet = reports.reduce(
    (s, r) => s + ((isLTR(r.recommendation) ? r.ltr_annual : r.str_net_annual) || 0), 0
  );

  const verdictData = useMemo(() => {
    const str = reports.filter(r => !isLTR(r.recommendation)).length;
    const ltr = reports.length - str;
    return [
      { id: "str", label: "Short-term", value: str, color: colors.series[0] },
      { id: "ltr", label: "Long-term", value: ltr, color: colors.series[1] },
    ].filter(d => d.value > 0);
  }, [reports]);

  const sizeData = useMemo(() => {
    const counts = new Map<string, number>();
    reports.forEach(r => {
      const k = r.unit_size || "Unspecified";
      counts.set(k, (counts.get(k) || 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([k, v], i) => ({ id: k, label: k, value: v, color: colors.series[i % colors.series.length] }));
  }, [reports]);

  const visibleReports = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = reports.filter(r => {
      if (verdictFilter === "str" && isLTR(r.recommendation)) return false;
      if (verdictFilter === "ltr" && !isLTR(r.recommendation)) return false;
      if (sizeFilter && (r.unit_size || "Unspecified") !== sizeFilter) return false;
      if (q && !(r.building_name || "").toLowerCase().includes(q)) return false;
      return true;
    });
    const delta = (r: ReportRow) =>
      r.ltr_annual ? ((r.str_net_annual || 0) - r.ltr_annual) / r.ltr_annual : -Infinity;
    return [...rows].sort((a, b) =>
      sort === "date" ? +new Date(b.created_at) - +new Date(a.created_at)
      : sort === "net" ? ((b.str_net_annual || 0) - (a.str_net_annual || 0))
      : delta(b) - delta(a)
    );
  }, [reports, verdictFilter, sizeFilter, query, sort]);

  const activeFilters = [
    verdictFilter && { label: verdictFilter === "str" ? "Short-term" : "Long-term", clear: () => setVerdictFilter(null) },
    sizeFilter && { label: sizeFilter, clear: () => setSizeFilter(null) },
    query.trim() && { label: `“${query.trim()}”`, clear: () => setQuery("") },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const kpis = [
    { label: "Properties", value: loading ? "—" : String(properties.length) },
    { label: "Saved reports", value: loading ? "—" : String(reports.length) },
    { label: "Projected annual net", value: loading ? "—" : projectedNet > 0 ? fmtCompact(projectedNet) : "—", note: "Following each report's verdict" },
    { label: "Portfolio value", value: loading ? "—" : portfolioValue > 0 ? fmtCompact(portfolioValue) : "—" },
    { label: "Open requests", value: loading ? "—" : String(openRequests) },
  ];

  return (
    <div style={{ maxWidth: 1180, display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        .dash-kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 26px; }
        .dash-charts { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .dash-split { display: grid; grid-template-columns: 1.55fr 1fr; gap: 20px; align-items: start; }
        .dash-rrow { display: grid; grid-template-columns: minmax(0,1.6fr) 92px 1fr 1fr 96px 62px; gap: 12px; align-items: baseline; }
        .dash-rrow-h { color: ${colors.textLight}; }
        .dash-report-row { border-radius: 8px; }
        .dash-report-row:hover { background: rgba(27,94,74,0.035); }
        .dash-qa:hover { border-color: rgba(27,94,74,0.28) !important; }
        @media (max-width: 1000px) {
          .dash-kpis { grid-template-columns: repeat(3, 1fr); gap: 20px; }
          .dash-charts, .dash-split { grid-template-columns: 1fr; }
          .dash-rrow { grid-template-columns: minmax(0,1.4fr) 1fr 1fr 84px; }
          .dash-col-date, .dash-col-open { display: none; }
        }
        @media (max-width: 560px) {
          .dash-kpis { grid-template-columns: 1fr 1fr; }
          .dash-rrow { grid-template-columns: minmax(0,1fr) 1fr 78px; }
          .dash-col-ltr { display: none; }
        }
      `}</style>

      {/* ── Hero ── */}
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 22, background: `linear-gradient(135deg, ${colors.primary}, #0F3E33)`, padding: "28px 30px" }}>
        <svg aria-hidden="true" width="360" height="200" viewBox="0 0 360 200" style={{ position: "absolute", right: -30, top: "50%", transform: "translateY(-50%)", opacity: 0.09, pointerEvents: "none" }}>
          <g stroke="#D4A574" strokeWidth="0.9" fill="none">
            {[[40,30],[150,20],[260,55],[80,100],[200,120],[320,90],[120,170],[280,165]].map((p, i, arr) => (
              <g key={i}>
                <circle cx={p[0]} cy={p[1]} r="2.4" fill="#D4A574" stroke="none" />
                {arr.slice(i + 1).map((q, j) => {
                  const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
                  return d < 120 ? <line key={j} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} /> : null;
                })}
              </g>
            ))}
          </g>
        </svg>

        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#EAD2A0", margin: "0 0 8px" }}>Your portfolio</p>
            <h1 className="ai-title-grad-i" style={{ fontFamily: DISPLAY, fontSize: "clamp(24px, 2.6vw, 34px)", fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.15, color: "#FFFFFF", margin: "0 0 8px" }}>
              {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
            </h1>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.78)", lineHeight: 1.55, margin: 0, maxWidth: "56ch" }}>
              Every property, report and request you have with AssetIntel, in one place.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/estimator" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, padding: "10px 18px", borderRadius: 10, background: "#fff", color: colors.primary, textDecoration: "none" }}>
              New report
            </a>
            <a href="/dashboard/properties" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, padding: "10px 18px", borderRadius: 10, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.26)", color: "#fff", textDecoration: "none" }}>
              Add property
            </a>
            {isAdmin && (
              <Link href="/admin/people" style={{ display: "inline-flex", alignItems: "center", padding: "10px 14px", fontSize: 13, fontWeight: 500, color: "#EAD2A0", textDecoration: "none" }}>
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── KPIs ── */}
      <Section>
        <div className="dash-kpis">
          {kpis.map(k => (
            <div key={k.label}>
              <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.textLight, margin: "0 0 6px" }}>{k.label}</p>
              <p style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 500, color: colors.primary, fontVariantNumeric: "tabular-nums", lineHeight: 1.1, margin: 0 }}>{k.value}</p>
              {k.note && <p style={{ fontSize: 11, color: colors.textLight, margin: "4px 0 0", lineHeight: 1.4 }}>{k.note}</p>}
            </div>
          ))}
        </div>
      </Section>

      {/* ── Donuts ── */}
      <div className="dash-charts">
        <FilterDonut
          title="Recommendation mix"
          data={verdictData}
          active={verdictFilter}
          onToggle={k => setVerdictFilter(v => (v === k ? null : k))}
          emptyNote="Generate a report and the split between short- and long-term verdicts appears here."
        />
        <FilterDonut
          title="Reports by unit size"
          data={sizeData}
          active={sizeFilter}
          onToggle={k => setSizeFilter(v => (v === k ? null : k))}
          emptyNote="Unit sizes across your saved reports will appear here."
        />
      </div>

      {/* ── Saved reports ── */}
      <Section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          <div>
            <Eyebrow>Saved reports</Eyebrow>
            <h2 className="ai-title-grad" style={{ fontFamily: DISPLAY, fontSize: "clamp(19px, 2.1vw, 25px)", fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.2, margin: 0 }}>
              Every analysis you have run
            </h2>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search building…"
              style={{ fontSize: 12.5, padding: "7px 12px", borderRadius: 99, border: `1px solid ${colors.border}`, background: colors.bgMain, color: colors.textMain, minWidth: 170, outline: "none" }}
            />
            {([["date", "Newest"], ["delta", "Best vs LTR"], ["net", "Highest net"]] as [SortKey, string][]).map(([k, label]) => (
              <button key={k} onClick={() => setSort(k)} style={{
                fontSize: 11.5, fontWeight: 500, padding: "6px 12px", borderRadius: 99, cursor: "pointer",
                background: sort === k ? "rgba(27,94,74,0.06)" : "transparent",
                border: `1px solid ${sort === k ? "rgba(27,94,74,0.22)" : colors.border}`,
                color: sort === k ? colors.primary : colors.textMuted,
              }}>{label}</button>
            ))}
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {activeFilters.map(f => (
              <button key={f.label} onClick={f.clear} style={{
                display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11.5, padding: "5px 10px",
                borderRadius: 99, cursor: "pointer", background: "rgba(27,94,74,0.06)",
                border: "1px solid rgba(27,94,74,0.22)", color: colors.primary,
              }}>
                {f.label} <span aria-hidden="true" style={{ fontSize: 13, lineHeight: 1 }}>×</span>
              </button>
            ))}
            <span style={{ fontSize: 11.5, color: colors.textLight, alignSelf: "center" }}>
              {visibleReports.length} of {reports.length}
            </span>
          </div>
        )}

        {loading ? (
          <p style={{ fontSize: 13.5, color: colors.textMuted, margin: 0 }}>Loading…</p>
        ) : reports.length === 0 ? (
          <div style={{ padding: "28px 0" }}>
            <p style={{ fontSize: 13.5, color: colors.textMuted, margin: "0 0 14px" }}>No reports yet. Run an estimate and it is saved here automatically.</p>
            <a href="/estimator" style={{ display: "inline-block", fontSize: 12.5, fontWeight: 500, padding: "9px 18px", borderRadius: 99, background: colors.primary, color: "#fff", textDecoration: "none" }}>
              Generate your first report
            </a>
          </div>
        ) : visibleReports.length === 0 ? (
          <p style={{ fontSize: 13.5, color: colors.textMuted, margin: "12px 0" }}>No reports match these filters.</p>
        ) : (
          <>
            <div className="dash-rrow dash-rrow-h" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", paddingBottom: 8 }}>
              <span>Property</span>
              <span className="dash-col-date">Saved</span>
              <span style={{ textAlign: "right" }}>STR net</span>
              <span style={{ textAlign: "right" }} className="dash-col-ltr">LTR</span>
              <span style={{ textAlign: "right" }}>Verdict</span>
              <span style={{ textAlign: "right" }} className="dash-col-open" />
            </div>
            {visibleReports.map(r => {
              const ltr = isLTR(r.recommendation);
              const delta = r.ltr_annual ? Math.round((((r.str_net_annual || 0) - r.ltr_annual) / r.ltr_annual) * 100) : null;
              return (
                <div key={r.id} className="dash-rrow dash-report-row" style={{ padding: "12px 6px", borderTop: `1px solid ${colors.border}` }}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13.5, color: colors.textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.building_name || "Unnamed property"}
                    </span>
                    <span style={{ fontSize: 11.5, color: colors.textLight }}>
                      {[r.unit_size, r.floor != null ? `Floor ${r.floor}` : null].filter(Boolean).join(" · ") || "—"}
                    </span>
                  </span>
                  <span className="dash-col-date" style={{ fontSize: 12, color: colors.textLight }}>{relativeDate(r.created_at)}</span>
                  <span style={{ textAlign: "right", fontSize: 13, color: colors.primary, fontVariantNumeric: "tabular-nums" }}>
                    {r.str_net_annual ? fmtAED(r.str_net_annual) : "—"}
                  </span>
                  <span className="dash-col-ltr" style={{ textAlign: "right", fontSize: 13, color: colors.textMuted, fontVariantNumeric: "tabular-nums" }}>
                    {r.ltr_annual ? fmtAED(r.ltr_annual) : "—"}
                  </span>
                  <span style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 12, color: ltr ? colors.secondaryText : colors.primary }}>{ltr ? "Long-term" : "Short-term"}</span>
                    {delta !== null && (
                      <span style={{ display: "block", fontSize: 11, color: colors.textLight, fontVariantNumeric: "tabular-nums" }}>
                        {delta >= 0 ? "+" : ""}{delta}% vs LTR
                      </span>
                    )}
                  </span>
                  {/* savedId loads the frozen snapshot rather than recomputing. */}
                  <a className="dash-col-open" href={`/report?savedId=${r.id}`} style={{ textAlign: "right", fontSize: 12.5, color: colors.primary, textDecoration: "none", whiteSpace: "nowrap" }}>
                    Open →
                  </a>
                </div>
              );
            })}
          </>
        )}
      </Section>

      {/* ── Properties + activity ── */}
      <div className="dash-split">
        <Section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <Eyebrow>Your properties</Eyebrow>
            <a href="/dashboard/properties" style={{ fontSize: 12.5, color: colors.primary, textDecoration: "none" }}>Manage →</a>
          </div>
          {loading ? (
            <p style={{ fontSize: 13.5, color: colors.textMuted, margin: 0 }}>Loading…</p>
          ) : properties.length === 0 ? (
            <p style={{ fontSize: 13.5, color: colors.textMuted, margin: 0 }}>
              No properties saved yet. <a href="/dashboard/properties" style={{ color: colors.primary }}>Add your first</a>.
            </p>
          ) : (
            <div>
              {properties.slice(0, 5).map((p, i) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 14, padding: "11px 0", borderTop: i === 0 ? "none" : `1px solid ${colors.border}` }}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13.5, color: colors.textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.building_name || "Unnamed property"}
                    </span>
                    <span style={{ fontSize: 11.5, color: colors.textLight }}>
                      {[p.area, p.unit_size, p.unit_type].filter(Boolean).join(" · ") || "—"}
                    </span>
                  </span>
                  {p.property_value ? (
                    <span style={{ fontSize: 13, color: colors.primary, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmtCompact(p.property_value)}</span>
                  ) : null}
                </div>
              ))}
              {properties.length > 5 && (
                <p style={{ fontSize: 12, color: colors.textLight, margin: "12px 0 0" }}>+{properties.length - 5} more</p>
              )}
            </div>
          )}
        </Section>

        <Section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <Eyebrow>Service requests</Eyebrow>
            <a href="/dashboard/requests" style={{ fontSize: 12.5, color: colors.primary, textDecoration: "none" }}>All →</a>
          </div>
          {loading ? (
            <p style={{ fontSize: 13.5, color: colors.textMuted, margin: 0 }}>Loading…</p>
          ) : requests.length === 0 ? (
            <p style={{ fontSize: 13.5, color: colors.textMuted, margin: 0 }}>
              No requests yet. <a href="/dashboard/requests" style={{ color: colors.primary }}>Browse services</a>.
            </p>
          ) : (
            <div>
              {requests.slice(0, 5).map((r, i) => (
                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "11px 0", borderTop: i === 0 ? "none" : `1px solid ${colors.border}` }}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13.5, color: colors.textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.service_type || "Service request"}
                    </span>
                    <span style={{ fontSize: 11.5, color: colors.textLight }}>{relativeDate(r.created_at)}</span>
                  </span>
                  <span style={{ fontSize: 11.5, whiteSpace: "nowrap", color: r.status === "completed" ? colors.textLight : colors.primary }}>
                    {r.status || "submitted"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
