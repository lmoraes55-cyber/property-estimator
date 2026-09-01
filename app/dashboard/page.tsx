"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const C = {
  bg: "#F7F9F8",
  green: "#1B5E4A",
  greenDark: "#144538",
  greenLight: "#EDF3F0",
  greenMid: "#2D7A5E",
  bronze: "#B88A44",
  bronzeLight: "#FBF6EE",
  border: "#E2E8E5",
  borderLight: "#F0EBE2",
  text: "#2A2A2A",
  muted: "#4E5D56",
  card: "#FFFFFF",
  sage: "#EDF3F0",
};

interface Counts {
  properties: number;
  reports: number;
  requests: number;
  portfolioValue: number;
}

interface ActivityItem {
  type: "report" | "property" | "request";
  label: string;
  date: string;
  href: string;
}

interface PropertyCard {
  id: string;
  building_name: string;
  unit_size: string;
  unit_type: string;
  floor: number | null;
}

interface LatestReport {
  building_name: string;
  recommendation: string;
  str_net_annual: number;
  ltr_annual: number;
  created_at: string;
}

function PropertyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function ServiceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ValueIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function formatAED(n: number) {
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `AED ${Math.round(n / 1000)}K`;
  return `AED ${n}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [counts, setCounts] = useState<Counts>({ properties: 0, reports: 0, requests: 0, portfolioValue: 0 });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [properties, setProperties] = useState<PropertyCard[]>([]);
  const [latestReport, setLatestReport] = useState<LatestReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ is_admin: boolean } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const fullName = user.user_metadata?.full_name || user.email || "";
      setFirstName(fullName.split(" ")[0] || "");

      const { data: profileData } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
      setProfile(profileData);

      const [
        { count: pCount },
        { count: rCount },
        { count: reqCount },
        { data: allProps },
        { data: recentReports },
        { data: recentProps },
        { data: recentReqs },
      ] = await Promise.all([
        supabase.from("properties").select("*", { count: "exact", head: true }),
        supabase.from("saved_reports").select("*", { count: "exact", head: true }),
        supabase.from("service_requests").select("*", { count: "exact", head: true }).neq("status", "completed"),
        supabase.from("properties").select("id, building_name, unit_size, unit_type, floor, property_value").order("created_at", { ascending: false }).limit(3),
        supabase.from("saved_reports").select("id, building_name, recommendation, str_net_annual, ltr_annual, created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("properties").select("id, name, created_at").order("created_at", { ascending: false }).limit(2),
        supabase.from("service_requests").select("id, service_name, status, created_at").order("created_at", { ascending: false }).limit(2),
      ]);

      const portfolioValue = (allProps || []).reduce((sum: number, p: { property_value: number | null }) => sum + (p.property_value || 0), 0);
      setCounts({ properties: pCount || 0, reports: rCount || 0, requests: reqCount || 0, portfolioValue });
      setProperties(allProps || []);
      if (recentReports && recentReports.length > 0) setLatestReport(recentReports[0]);

      const items: ActivityItem[] = [];
      (recentReports || []).forEach((r: { building_name: string; created_at: string }) => {
        items.push({ type: "report", label: `${r.building_name || "Property"} report generated`, date: r.created_at, href: "/dashboard/reports" });
      });
      (recentProps || []).forEach((p: { name: string; created_at: string }) => {
        items.push({ type: "property", label: `${p.name || "Property"} added`, date: p.created_at, href: "/dashboard/properties" });
      });
      (recentReqs || []).forEach((r: { service_name: string; created_at: string }) => {
        items.push({ type: "request", label: `${r.service_name || "Service"} request submitted`, date: r.created_at, href: "/dashboard/requests" });
      });
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setActivity(items.slice(0, 4));

      setLoading(false);
    }
    load();
  }, [router]);

  const metrics = [
    { label: "Properties", value: loading ? "—" : counts.properties, icon: <PropertyIcon />, accent: C.green },
    { label: "Reports", value: loading ? "—" : counts.reports, icon: <ReportIcon />, accent: C.green },
    { label: "Requests", value: loading ? "—" : counts.requests, icon: <ServiceIcon />, accent: C.bronze },
    { label: "Portfolio Value", value: loading ? "—" : counts.portfolioValue > 0 ? formatAED(counts.portfolioValue) : "—", icon: <ValueIcon />, accent: C.bronze },
  ];

  const quickActions = [
    { label: "Add Property", desc: "Add a new Dubai property to your portfolio.", href: "/dashboard/properties", icon: <PropertyIcon /> },
    { label: "Generate Report", desc: "Compare STR vs LTR performance.", href: "/estimator", icon: <ReportIcon /> },
    { label: "Support & Services", desc: "Operator matching, furnishing and setup assistance.", href: "/dashboard/requests", icon: <ServiceIcon /> },
  ];

  const insightDelta = latestReport && latestReport.ltr_annual
    ? Math.round(((latestReport.str_net_annual - latestReport.ltr_annual) / latestReport.ltr_annual) * 1000) / 10
    : null;

  function relativeDate(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <style>{`
        .dash-metric-card { transition: box-shadow 0.18s, transform 0.18s; }
        .dash-metric-card:hover { box-shadow: 0 6px 22px rgba(27,94,74,0.10) !important; transform: translateY(-2px); }
        .dash-action-card { transition: box-shadow 0.18s, border-color 0.18s, transform 0.18s; cursor: pointer; }
        .dash-action-card:hover { box-shadow: 0 8px 24px rgba(27,94,74,0.10) !important; transform: translateY(-2px); border-color: rgba(184,138,68,0.32) !important; }
        .dash-action-card:hover .dash-arrow { transform: translateX(3px); }
        .dash-arrow { transition: transform 0.18s; }
        .dash-prop-card { transition: box-shadow 0.18s, border-color 0.18s; }
        .dash-prop-card:hover { box-shadow: 0 8px 24px rgba(27,94,74,0.09) !important; border-color: rgba(27,94,74,0.20) !important; }
        @media (max-width: 900px) {
          .dash-two-col { flex-direction: column !important; }
          .dash-two-col > * { width: 100% !important; }
        }
        @media (max-width: 768px) {
          .dash-metrics-grid { grid-template-columns: 1fr 1fr !important; }
          .dash-actions-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .dash-hero-flex { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
        }
      `}</style>

      {/* ── Hero ── */}
      <div style={{
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, #1B5E4A 0%, #2D7A5E 60%, #1B5E4A 100%)`,
        borderRadius: 20,
        padding: "26px 32px",
        marginBottom: 24,
        boxShadow: "0 4px 20px rgba(27,94,74,0.18)",
      }}>
        <svg aria-hidden="true" style={{ position: "absolute", right: 0, top: 0, bottom: 0, opacity: 0.07, pointerEvents: "none" }} width="380" height="120" viewBox="0 0 380 120">
          <g stroke="#fff" strokeWidth="0.8" fill="none">
            {[[60,20],[160,15],[280,35],[120,55],[240,60],[70,85],[200,90],[340,70],[380,30]].map((p, i, arr) => (
              <g key={i}>
                <circle cx={p[0]} cy={p[1]} r="2.2" fill="#fff" stroke="none" />
                {arr.slice(i + 1).map((q, j) => {
                  const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
                  return d < 110 ? <line key={j} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} /> : null;
                })}
              </g>
            ))}
          </g>
        </svg>

        <div className="dash-hero-flex" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, position: "relative", zIndex: 1 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontSize: 25, fontWeight: 600, color: "#fff", marginBottom: 6, lineHeight: 1.2 }}>
              {loading ? "Welcome back" : firstName ? `Welcome back, ${firstName}` : "Welcome back"}
            </h1>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.5, marginBottom: 18 }}>
              Everything related to your Dubai property in one place.
            </p>
            <a
              href="/dashboard/properties"
              className="dash-cta-primary"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontSize: 13, fontWeight: 700, padding: "10px 18px",
                borderRadius: 10, background: "#fff", color: C.green,
                textDecoration: "none", boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
              }}
            >
              Add Property <ArrowIcon />
            </a>
            {profile?.is_admin && (
              <a href="/admin/people" style={{ fontSize: 13, fontWeight: 600, color: "#B88A44", marginLeft: 14 }}>
                Admin
              </a>
            )}
          </div>

          <div style={{
            flexShrink: 0,
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 999,
            padding: "7px 14px",
          }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.10em", color: "#B88A44", textTransform: "uppercase" }}>Beta</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.4)" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>Free Access</span>
          </div>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="dash-metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {metrics.map((m) => (
          <div
            key={m.label}
            className="dash-metric-card"
            style={{
              background: C.card,
              border: `1px solid ${C.borderLight}`,
              borderRadius: 20,
              padding: "22px 22px",
              boxShadow: "0 2px 10px rgba(27,94,74,0.05)",
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: m.accent === C.green ? C.greenLight : C.bronzeLight,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: m.accent, marginBottom: 16,
            }}>
              {m.icon}
            </div>
            <div style={{ fontSize: 32, fontWeight: 500, color: C.text, fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", lineHeight: 1, marginBottom: 8 }}>
              {m.value}
            </div>
            <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.04em", color: C.muted }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontSize: 17, color: C.text, marginBottom: 12 }}>Quick Actions</h2>
        <div className="dash-actions-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {quickActions.map((a) => (
            <a
              key={a.label}
              href={a.href}
              className="dash-action-card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                background: C.card,
                border: `1px solid ${C.borderLight}`,
                borderRadius: 20,
                padding: "22px",
                textDecoration: "none",
                boxShadow: "0 2px 10px rgba(27,94,74,0.05)",
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10, background: C.greenLight,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: C.green,
              }}>
                {a.icon}
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: C.text, marginBottom: 4 }}>{a.label}</div>
                <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>{a.desc}</div>
              </div>
              <div className="dash-arrow" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: C.bronze, marginTop: 2 }}>
                <ArrowIcon />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Portfolio Insight ── */}
      {latestReport && insightDelta !== null && (
        <div style={{
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${C.greenLight} 0%, #fff 65%)`,
          border: `1px solid rgba(27,94,74,0.16)`,
          borderRadius: 20,
          padding: "24px 26px",
          marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: C.green }}>Portfolio Insight</span>
          </div>
          <p style={{ fontSize: 16, color: C.text, lineHeight: 1.55, maxWidth: 640, marginBottom: 14 }}>
            {latestReport.building_name || "Your property"} is currently estimated to generate{" "}
            <strong style={{ color: C.green }}>
              {insightDelta > 0 ? `${insightDelta}% higher` : `${Math.abs(insightDelta)}% lower`}
            </strong>{" "}
            returns on STR than LTR based on current Dubai market conditions.
          </p>
          <a href="/dashboard/reports" style={{ fontSize: 13, fontWeight: 700, color: C.green, textDecoration: "none" }}>
            View latest report →
          </a>
        </div>
      )}

      {/* ── Two-column: My Properties + Recent Activity ── */}
      <div className="dash-two-col" style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* My Properties */}
        <div style={{ flex: "0 0 58%", width: "58%" }}>
          <h2 style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontSize: 17, color: C.text, marginBottom: 12 }}>My Properties</h2>

          {loading ? (
            <div style={{ background: C.card, border: `1px solid ${C.borderLight}`, borderRadius: 20, padding: "32px", textAlign: "center", color: C.muted, fontSize: 13 }}>
              Loading…
            </div>
          ) : properties.length === 0 ? (
            <div style={{ background: C.card, border: `1px solid ${C.borderLight}`, borderRadius: 20, padding: "32px", textAlign: "center" }}>
              <p style={{ fontSize: 13.5, color: C.muted, marginBottom: 14 }}>No properties saved yet.</p>
              <a href="/dashboard/properties" style={{ fontSize: 12.5, fontWeight: 700, padding: "8px 16px", borderRadius: 999, background: C.green, color: "#fff", textDecoration: "none" }}>
                Add Your First Property
              </a>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {properties.map((p) => (
                <div
                  key={p.id}
                  className="dash-prop-card"
                  style={{
                    background: C.card,
                    border: `1px solid ${C.borderLight}`,
                    borderRadius: 20,
                    padding: "20px 22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                      {p.building_name || "Unnamed Property"}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[p.unit_size, p.unit_type, p.floor != null ? `Floor ${p.floor}` : null].filter(Boolean).map((tag) => (
                        <span key={tag} style={{ fontSize: 11, fontWeight: 600, color: C.muted, background: C.sage, padding: "3px 9px", borderRadius: 6 }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <a href="/dashboard/properties" style={{ flexShrink: 0, fontSize: 12.5, fontWeight: 700, color: C.green, textDecoration: "none", whiteSpace: "nowrap" }}>
                    View Details →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontSize: 17, color: C.text, marginBottom: 12 }}>Recent Activity</h2>

          <div style={{
            background: C.card,
            border: `1px solid ${C.borderLight}`,
            borderRadius: 20,
            padding: "22px 22px 20px",
          }}>
            {loading ? (
              <div style={{ textAlign: "center", color: C.muted, fontSize: 13, padding: "10px 0" }}>Loading…</div>
            ) : activity.length === 0 ? (
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                Once you generate reports or add properties, activity will appear here.
              </p>
            ) : (
              <div>
                {activity.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, paddingBottom: i < activity.length - 1 ? 16 : 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%", background: C.greenLight,
                        display: "flex", alignItems: "center", justifyContent: "center", color: C.green,
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      {i < activity.length - 1 && <div style={{ width: 1.5, flex: 1, background: C.borderLight, marginTop: 2, minHeight: 18 }} />}
                    </div>
                    <a href={item.href} style={{ textDecoration: "none", paddingTop: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.bronze, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 3 }}>
                        {relativeDate(item.date)}
                      </div>
                      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>{item.label}</div>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
