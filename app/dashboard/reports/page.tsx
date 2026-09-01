"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const C = {
  green: "#1B5E4A",
  greenLight: "#EDF3F0",
  bronze: "#B88A44",
  border: "#E2E8E5",
  text: "#2A2A2A",
  muted: "#4E5D56",
  card: "#fff",
};

interface Report {
  id: string;
  building_name: string;
  unit_size: string;
  floor: number;
  recommendation: string;
  str_net_annual: number;
  ltr_annual: number;
  report_params: Record<string, string>;
  created_at: string;
}

function formatAED(n: number) {
  return "AED " + Math.round(n).toLocaleString();
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("saved_reports")
        .select("*")
        .order("created_at", { ascending: false });
      setReports(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this report? This cannot be undone.")) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("saved_reports").delete().eq("id", id);
    setDeletingId(null);
    if (!error) setReports(prev => prev.filter(r => r.id !== id));
  }

  // Always link by savedId — this loads the exact frozen snapshot from when
  // the report was saved, instead of rebuilding the params and recomputing
  // (which could drift as underlying DLD data changes).
  function buildReportUrl(reportId: string, extra?: Record<string, string>) {
    const qs = new URLSearchParams({ savedId: reportId, ...extra }).toString();
    return `/report?${qs}`;
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7D6338", marginBottom: 10 }}>
        Saved Analysis
      </p>
      <h1 style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontSize: 26, color: C.green, marginBottom: 28 }}>
        Reports
      </h1>

      {loading ? (
        <p style={{ color: C.muted }}>Loading...</p>
      ) : reports.length === 0 ? (
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "48px 32px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(27,94,74,0.06)",
          }}
        >
          <p style={{ color: C.muted, fontSize: 15, marginBottom: 12 }}>No reports yet.</p>
          <a
            href="/estimator"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: C.green,
              color: "#fff",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Generate your first STR vs LTR report
          </a>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
            {reports.map((r) => (
              <div
                key={r.id}
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: "20px 24px",
                  boxShadow: "0 2px 8px rgba(27,94,74,0.06)",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontSize: 16, fontWeight: 600, color: C.text }}>
                      {r.building_name}
                    </span>
                    {r.recommendation && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 4,
                          background: r.recommendation === "STR" ? C.greenLight : "#FFF8EC",
                          color: r.recommendation === "STR" ? C.green : C.bronze,
                          border: `1px solid ${r.recommendation === "STR" ? C.green : C.bronze}`,
                        }}
                      >
                        {r.recommendation}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: C.muted, display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
                    {r.unit_size && <span>{r.unit_size}</span>}
                    {r.floor && <span>Floor {r.floor}</span>}
                    {r.str_net_annual > 0 && <span>STR Net: {formatAED(r.str_net_annual)} / yr</span>}
                    {r.ltr_annual > 0 && <span>LTR: {formatAED(r.ltr_annual)} / yr</span>}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {r.id && (
                    <>
                      <a
                        href={buildReportUrl(r.id)}
                        style={{
                          padding: "8px 14px",
                          background: C.green,
                          color: "#fff",
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 500,
                          textDecoration: "none",
                        }}
                      >
                        View Report
                      </a>
                      <a
                        href={buildReportUrl(r.id, { pdf: "1" })}
                        style={{
                          padding: "8px 14px",
                          background: "none",
                          color: C.green,
                          border: `1px solid ${C.border}`,
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 500,
                          textDecoration: "none",
                        }}
                      >
                        Download PDF
                      </a>
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        style={{
                          padding: "8px 14px",
                          background: "none",
                          color: "#B3261E",
                          border: `1px solid #E6C6C2`,
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: deletingId === r.id ? "default" : "pointer",
                          opacity: deletingId === r.id ? 0.6 : 1,
                        }}
                      >
                        {deletingId === r.id ? "Deleting…" : "Delete"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
            Reports are indicative and based on market data and assumptions. AssetIntel does not guarantee rental income or investment performance.
          </p>
        </>
      )}
    </div>
  );
}
