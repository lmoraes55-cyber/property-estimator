"use client";

import React, { useEffect, useState } from "react";
import { colors } from "@/lib/colors";
import { fmt } from "@/lib/estimator";
import type { AreaStatsRow } from "@/lib/str-market-data";

interface Props {
  area: string;
  propertyName: string;
  unitSize: string;
  avgADR: number;
  avgOccupancy: number;       // fraction 0-1
  annualRevenue: number;
  annualNetToLandlord: number;
  longTermRent: number;
  ltrRecommended: boolean;
}

// "STU" -> 0 bedrooms, "1BR" -> 1, "4BR APT"/"4BR VILLA" -> 4, etc. — matches
// how AirROI tags listing bedroom counts (studios as 0).
function bedroomsForUnitSize(unitSize: string): number | null {
  if (unitSize === "STU") return 0;
  const match = unitSize.match(/^(\d+)BR/);
  return match ? Number(match[1]) : null;
}

function TrendIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={colors.secondaryLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function Delta({ better }: { better: boolean | null }) {
  if (better === null) return null;
  return (
    <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 700, color: better ? colors.primary : colors.secondary }}>
      {better ? "▲" : "▼"}
    </span>
  );
}

const SEASONS: Record<string, string> = {
  Nov: "Peak", Dec: "Peak", Jan: "Peak", Feb: "Peak",
  Mar: "Shoulder", Apr: "Shoulder", Oct: "Shoulder",
  May: "Low", Jun: "Low", Jul: "Low", Aug: "Low", Sep: "Low",
};

function currentSeasonLabel() {
  const m = new Date().toLocaleDateString("en-US", { month: "short" });
  return SEASONS[m] ?? "Shoulder";
}

function confidenceFor(row: AreaStatsRow): number {
  if (row.confidence === "high") return 92;
  if (row.confidence === "medium") return 78;
  if (row.confidence === "low") return 65;
  const n = row.comparable_listing_count ?? 0;
  return n >= 30 ? 88 : n >= 10 ? 74 : 60;
}

function buildInsights(row: AreaStatsRow, area: string): string[] {
  const insights: string[] = [];
  if (row.occupancy != null && row.occupancy >= 0.7) insights.push(`Strong, consistent guest demand — average occupancy of ${Math.round(row.occupancy * 100)}% across ${area}.`);
  if (row.adr != null && row.adr >= 500) insights.push(`Premium average daily rates of AED ${fmt(row.adr)}, reflecting strong guest willingness to pay in this area.`);
  if (row.length_of_stay_days != null && row.length_of_stay_days >= 4) insights.push(`Longer average stays (${row.length_of_stay_days.toFixed(1)} nights) reduce turnover costs and support stable occupancy.`);
  if (row.active_listings != null && row.active_listings >= 50) insights.push(`A mature, liquid STR market with ${fmt(row.active_listings)} active listings — proven, established guest demand.`);
  if (row.estimated_str_revenue != null && row.estimated_str_revenue > 0) insights.push(`Area-wide average annual STR revenue of AED ${fmt(row.estimated_str_revenue)} supports a healthy return profile.`);
  insights.push(`${area} remains one of the more actively tracked short-term rental markets in AssetIntel's Dubai coverage.`);
  return insights.slice(0, 5);
}

export default function AreaIntelligence({ area, propertyName, unitSize, avgADR, avgOccupancy, annualRevenue, annualNetToLandlord, longTermRent, ltrRecommended }: Props) {
  const [row, setRow] = useState<AreaStatsRow | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/str-market-data")
      .then(r => r.json())
      .then((json: { data: AreaStatsRow[] }) => {
        if (cancelled) return;
        const match = (json.data || []).find(r => r.area === area) ?? null;
        setRow(match);
      })
      .catch(() => { if (!cancelled) setRow(null); });
    return () => { cancelled = true; };
  }, [area]);

  // Still loading, or nothing usable for this area — hide gracefully rather
  // than show an empty/broken section.
  if (row === undefined) return null;
  if (!row || (row.adr == null && row.occupancy == null && row.estimated_str_revenue == null)) return null;

  const snapshot = [
    { label: "Average Occupancy", value: row.occupancy != null ? `${Math.round(row.occupancy * 100)}%` : null, icon: "occ" },
    { label: "Average ADR", value: row.adr != null ? `AED ${fmt(row.adr)}` : null, icon: "adr" },
    { label: "RevPAR", value: row.revpar != null ? `AED ${fmt(row.revpar)}` : null, icon: "revpar" },
    { label: "Average Length of Stay", value: row.length_of_stay_days != null ? `${row.length_of_stay_days.toFixed(1)} nights` : null, icon: "los" },
    { label: "Average Booking Window", value: row.booking_window_days != null ? `${Math.round(row.booking_window_days)} days` : null, icon: "book" },
    { label: "Market Seasonality", value: `${currentSeasonLabel()} Season`, icon: "season" },
  ].filter(m => m.value != null);

  const comparisons = [
    { metric: "ADR", area: row.adr, yours: avgADR, format: (v: number) => `AED ${fmt(v)}`, higherIsBetter: true },
    { metric: "Occupancy", area: row.occupancy != null ? row.occupancy * 100 : null, yours: avgOccupancy * 100, format: (v: number) => `${Math.round(v)}%`, higherIsBetter: true },
    { metric: "Annual Revenue", area: row.estimated_str_revenue, yours: annualRevenue, format: (v: number) => `AED ${fmt(v)}`, higherIsBetter: true },
  ].filter(c => c.area != null);

  const insights = buildInsights(row, area);
  const confidence = confidenceFor(row);
  const targetBedrooms = bedroomsForUnitSize(unitSize);
  const listings = (row.sample_listings ?? [])
    .filter(l => l.name && ((l.ttmAvgRate != null && l.ttmAvgRate > 0) || (l.ttmOccupancy != null && l.ttmOccupancy > 0)))
    .filter(l => targetBedrooms == null || l.bedrooms === targetBedrooms)
    .slice(0, 5);

  const strVsLtrPct = longTermRent > 0 ? Math.round(((annualNetToLandlord - longTermRent) / longTermRent) * 100) : null;

  return (
    <div className="pdf-section" style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Header */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.secondary, marginBottom: 6 }}>Area Intelligence</p>
        <h2 style={{ fontSize: "clamp(19px, 2.2vw, 26px)", fontWeight: 700, fontFamily: "'Georgia', serif", color: colors.primary, lineHeight: 1.2, margin: "0 0 6px" }}>
          {area} Market Intelligence
        </h2>
        <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.6, maxWidth: 620 }}>
          Live STR market insights for the surrounding area, powered by AirROI market intelligence.
        </p>
      </div>

      {/* Area Market Snapshot */}
      <div style={{ borderRadius: 24, background: "#fff", border: `1px solid ${colors.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 10px 30px rgba(27,94,74,0.06)", padding: "22px 24px", breakInside: "avoid" as const }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: colors.textMain, marginBottom: 16 }}>Area Market Snapshot</p>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(snapshot.length, 3)}, 1fr)`, gap: 16 }} className="rpt-area-snapshot-grid">
          {snapshot.map(m => (
            <div key={m.label} style={{ padding: "14px 16px", borderRadius: 14, background: colors.bgSage, border: `1px solid ${colors.borderSage}` }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.textLight, marginBottom: 6 }}>{m.label}</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: colors.primary, fontFamily: "'Georgia', serif" }}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Your Property vs Area Average */}
      {comparisons.length > 0 && (
        <div style={{ borderRadius: 24, background: "#fff", border: `1px solid ${colors.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 10px 30px rgba(27,94,74,0.06)", padding: "22px 24px", breakInside: "avoid" as const }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: colors.textMain, marginBottom: 4 }}>Your Property vs Area Average</p>
          <p style={{ fontSize: 12, color: colors.textLight, marginBottom: 16 }}>{propertyName}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 12, padding: "0 4px" }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.textLight }}>Metric</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.textLight }}>Area Average</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.textLight }}>Your Property</span>
            </div>
            {comparisons.map(c => {
              const better = c.yours != null && c.area != null ? (c.higherIsBetter ? c.yours >= c.area : c.yours <= c.area) : null;
              return (
                <div key={c.metric} style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 12, alignItems: "center", padding: "10px 4px", borderTop: `1px solid ${colors.border}` }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: colors.textMain }}>{c.metric}</span>
                  <span style={{ fontSize: 13, color: colors.textMuted }}>{c.format(c.area as number)}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: colors.textMain, display: "flex", alignItems: "center" }}>
                    {c.format(c.yours)}
                    <Delta better={better} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Why This Area Performs Well */}
      <div style={{ borderRadius: 24, background: colors.bgSage, border: `1px solid ${colors.borderSage}`, padding: "22px 24px", breakInside: "avoid" as const }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: colors.textMain, marginBottom: 14 }}>Why This Area Performs Well</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {insights.map((text, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.primary, marginTop: 6, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: colors.textMain, lineHeight: 1.55, margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparable Buildings Nearby */}
      {listings.length > 0 && (
        <div style={{ borderRadius: 24, background: "#fff", border: `1px solid ${colors.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 10px 30px rgba(27,94,74,0.06)", padding: "22px 24px", breakInside: "avoid" as const }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: colors.textMain, marginBottom: 4 }}>Comparable Buildings Nearby</p>
          <p style={{ fontSize: 12, color: colors.textLight, marginBottom: 16 }}>Nearby {unitSize} STR inventory in {area}, from AirROI live listing data.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {listings.map((l, i) => (
              <div key={l.listingId || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 4px", borderTop: i > 0 ? `1px solid ${colors.border}` : "none", flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.textMain, maxWidth: 320 }}>{l.name}</span>
                <div style={{ display: "flex", gap: 18 }}>
                  {l.ttmOccupancy != null && l.ttmOccupancy > 0 && (
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 9.5, color: colors.textLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>Occupancy</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: colors.primary }}>{Math.round((l.ttmOccupancy as number) * 100)}%</p>
                    </div>
                  )}
                  {l.ttmAvgRate != null && l.ttmAvgRate > 0 && (
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 9.5, color: colors.textLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>ADR</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: colors.textMain }}>AED {fmt(l.ttmAvgRate as number)}</p>
                    </div>
                  )}
                  {l.ttmRevenue != null && l.ttmRevenue > 0 && (
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 9.5, color: colors.textLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>Revenue</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: colors.textMain }}>AED {fmt(l.ttmRevenue as number)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forecast Confidence — solid cream information card */}
      <div style={{ borderRadius: 24, background: colors.bgSection, border: "1px solid rgba(27,94,74,0.14)", boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 10px 30px rgba(27,94,74,0.06)", padding: "22px 24px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", breakInside: "avoid" as const }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff", border: `2px solid ${colors.primary}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: colors.primary, fontFamily: "'Georgia', serif" }}>{confidence}%</span>
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: colors.textMain, marginBottom: 4 }}>Forecast Confidence</p>
          <p style={{ fontSize: 12.5, color: colors.textMain, opacity: 0.75, lineHeight: 1.6, margin: 0 }}>
            Forecast generated using AirROI market performance, comparable buildings, seasonal demand, property characteristics, and historical market behaviour.
          </p>
        </div>
      </div>

      {/* AssetIntel Recommendation — executive decision card */}
      <div className="rpt-reco-card" style={{ position: "relative", overflow: "hidden", borderRadius: 24, background: `linear-gradient(135deg, ${colors.primary}, #0F3E33)`, padding: "26px 28px", color: "#fff", breakInside: "avoid" as const }}>
        {/* Faint decorative network pattern, far right edge, behind content */}
        <svg aria-hidden="true" width="260" height="260" viewBox="0 0 260 260" style={{ position: "absolute", right: "-40px", top: "50%", transform: "translateY(-50%)", opacity: 0.08, pointerEvents: "none", zIndex: 0 }}>
          <g stroke="#D4A574" strokeWidth="0.9" fill="none">
            {[[40,40],[120,20],[200,60],[70,120],[180,140],[30,190],[140,210],[220,180]].map((p, i, arr) => (
              <g key={i}>
                <circle cx={p[0]} cy={p[1]} r="2.4" fill="#D4A574" stroke="none" />
                {arr.slice(i + 1).map((q, j) => {
                  const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
                  return d < 110 ? <line key={j} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} /> : null;
                })}
              </g>
            ))}
          </g>
        </svg>

        <div className="rpt-reco-grid" style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1.5fr 1px 1fr", gap: 24, alignItems: "center" }}>
          {/* Left — recommendation */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#D4A574", marginBottom: 10 }}>AssetIntel Recommendation</p>
            <h3 style={{ fontFamily: "'Georgia', serif", fontSize: 21, fontWeight: 700, color: "#FFFFFF", marginBottom: 10, lineHeight: 1.2 }}>
              {ltrRecommended ? "Operate as a Long-Term Rental" : "Operate as a Short-Term Rental"}
            </h3>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.82)", lineHeight: 1.65, margin: 0 }}>
              {ltrRecommended
                ? <>Based on projected revenue, market demand, occupancy and comparable buildings in {area}, long-term leasing is expected to offer a more stable and lower-effort return for this property.</>
                : <>Based on projected revenue, market demand, occupancy and comparable buildings in {area}, short-term rental is expected to outperform long-term leasing for this property.</>}
            </p>
          </div>

          {/* Divider */}
          <div className="rpt-reco-divider" style={{ alignSelf: "stretch", background: "rgba(255,255,255,0.16)" }} />

          {/* Right — structured data */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <p style={{ fontSize: 10, color: "#D4A574", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Expected Net Income</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", fontFamily: "'Georgia', serif", lineHeight: 1.1 }}>AED {fmt(annualNetToLandlord)}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>net / year</p>
            </div>

            {strVsLtrPct !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "rgba(184,138,68,0.16)", border: "1px solid rgba(184,138,68,0.32)" }}>
                <TrendIcon />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#EAD2A0", lineHeight: 1.2 }}>
                    {strVsLtrPct >= 0 ? "+" : ""}{strVsLtrPct}% vs Long-Term Rental
                  </p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.62)", marginTop: 1 }}>
                    {strVsLtrPct >= 0 ? "Higher annual net income" : "Lower annual net income"}
                  </p>
                </div>
              </div>
            )}

            <div>
              <p style={{ fontSize: 10, color: "#D4A574", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Confidence Level</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", fontFamily: "'Georgia', serif", lineHeight: 1.1 }}>{confidence}%</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .rpt-area-snapshot-grid { grid-template-columns: 1fr 1fr !important; }
          .rpt-reco-grid { grid-template-columns: 1fr !important; }
          .rpt-reco-divider { display: none !important; }
        }
      `}</style>
    </div>
  );
}
