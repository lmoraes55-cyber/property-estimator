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
  /** "body" is the market context; "recommendation" is the closing verdict card. */
  variant?: "body" | "recommendation";
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

const SEASONS: Record<string, string> = {
  Nov: "Peak", Dec: "Peak", Jan: "Peak", Feb: "Peak",
  Mar: "Shoulder", Apr: "Shoulder", Oct: "Shoulder",
  May: "Low", Jun: "Low", Jul: "Low", Aug: "Low", Sep: "Low",
};

function currentSeasonLabel() {
  const m = new Date().toLocaleDateString("en-US", { month: "short" });
  return SEASONS[m] ?? "Shoulder";
}

// Raw scraped titles carry promo spam ("50% DISCOUNT!!!", ALL CAPS) — clean before
// display. Mirrors str-market-intel / the sub-leasing report's sanitizeListingTitle.
function sanitizeListingTitle(raw: string | null | undefined): string {
  if (!raw) return "Untitled listing";
  let s = raw
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\d{1,3}\s?%\s?(off|discount)/gi, "")
    .replace(/\b(discount|deal|promo|special offer)\b/gi, "")
    .replace(/!{1,}/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!s) return "Untitled listing";
  const letters = s.replace(/[^a-zA-Z]/g, "");
  if (letters.length > 4 && letters === letters.toUpperCase()) {
    s = s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
  return s.length > 60 ? s.slice(0, 57).trim() + "…" : s;
}

function confidenceFor(row: AreaStatsRow): number {
  const dualSource = row.data_sources === "airbtics-primary";
  const bonus = dualSource ? 5 : 0;
  if (row.confidence === "high") return Math.min(97, 92 + bonus);
  if (row.confidence === "medium") return Math.min(97, 78 + bonus);
  if (row.confidence === "low") return Math.min(97, 65 + bonus);
  const n = row.comparable_listing_count ?? 0;
  return Math.min(97, (n >= 30 ? 88 : n >= 10 ? 74 : 60) + bonus);
}

function buildInsights(row: AreaStatsRow, area: string): string[] {
  const insights: string[] = [];
  if (row.occupancy != null && row.occupancy >= 0.7) insights.push(`Strong, consistent guest demand — average occupancy of ${Math.round(row.occupancy * 100)}% across ${area}.`);
  if (row.adr != null && row.adr >= 500) insights.push(`Premium average daily rates of AED ${fmt(row.adr)}, reflecting strong guest willingness to pay in this area.`);
  if (row.length_of_stay_days != null && row.length_of_stay_days >= 4) insights.push(`Longer average stays (${row.length_of_stay_days.toFixed(1)} nights) reduce turnover costs and support stable occupancy.`);
  if (row.active_listings != null && row.active_listings >= 50) insights.push(`A mature, liquid STR market with ${fmt(row.active_listings)} active listings — proven, established guest demand.`);
  if (row.estimated_str_revenue != null && row.estimated_str_revenue > 0) insights.push(`Area-wide average annual STR revenue is AED ${fmt(row.estimated_str_revenue)}, across all unit sizes and operating standards.`);
  insights.push(`${area} remains one of the more actively tracked short-term rental markets in AssetIntel's Dubai coverage.`);
  return insights.slice(0, 5);
}

export default function AreaIntelligence({ area, propertyName, unitSize, avgADR, avgOccupancy, annualRevenue, annualNetToLandlord, longTermRent, ltrRecommended, variant = "body" }: Props) {
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
    .slice(0, 6);

  const sourceLabel = row.data_sources === "airroi" ? "AirROI" : row.data_sources === "airroi+airbtics" ? "AirROI and Airbtics" : "Airbtics";

  const strVsLtrPct = longTermRent > 0 ? Math.round(((annualNetToLandlord - longTermRent) / longTermRent) * 100) : null;

  // The recommendation card closes the report, so it renders apart from
  // the market-context body above it.
  if (variant === "recommendation") {
    return (
      <div className="pdf-section">
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
              <h3 style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontSize: 24, fontWeight: 600, color: "#FFFFFF", marginBottom: 10, lineHeight: 1.2 }}>
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
                <p style={{ fontSize: 22, fontWeight: 600, color: "#FFFFFF", fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", lineHeight: 1.1 }}>AED {fmt(annualNetToLandlord)}</p>
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
                <p style={{ fontSize: 22, fontWeight: 600, color: "#FFFFFF", fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", lineHeight: 1.1 }}>{confidence}%</p>
              </div>
            </div>
          </div>
        </div>
        <style>{`
          @media (max-width: 700px) {
            .rpt-reco-grid { grid-template-columns: 1fr !important; }
            .rpt-reco-divider { display: none !important; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="pdf-section" style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Header */}
      <div>
        <p style={{ fontFamily: "var(--font-mono-ai), ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: colors.textLight, margin: "0 0 6px" }}>Area Intelligence</p>
        <h2 style={{ fontSize: "clamp(19px, 2.1vw, 25px)", fontWeight: 400, fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", letterSpacing: "-0.015em", color: colors.textMain, lineHeight: 1.2, margin: "0 0 6px" }}>
          {area} Market Intelligence
        </h2>
        <p style={{ fontSize: 13.5, color: colors.textMuted, lineHeight: 1.55, maxWidth: "62ch", margin: 0 }}>
          Live short-term rental activity across {area}, from {sourceLabel} market data.
        </p>
      </div>

      {/* Area Market Snapshot */}
      <div style={{ borderRadius: 22, background: colors.bgSection, border: `1px solid ${colors.border}`, padding: "24px 26px", breakInside: "avoid" as const }}>
        <p style={{ fontFamily: "var(--font-mono-ai), ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: colors.textLight, margin: "0 0 18px" }}>Area market snapshot</p>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(snapshot.length, 3)}, 1fr)`, gap: "22px 28px" }} className="rpt-area-snapshot-grid">
          {snapshot.map(m => (
            <div key={m.label}>
              <p style={{ fontFamily: "var(--font-mono-ai), ui-monospace, monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.textLight, margin: "0 0 6px" }}>{m.label}</p>
              <p style={{ fontSize: 22, fontWeight: 500, color: colors.textMain, fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontVariantNumeric: "tabular-nums", lineHeight: 1.1, margin: 0 }}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Your Property vs Area Average */}
      {comparisons.length > 0 && (
        <div style={{ borderRadius: 22, background: colors.bgSection, border: `1px solid ${colors.border}`, padding: "24px 26px", breakInside: "avoid" as const }}>
          <p style={{ fontFamily: "var(--font-mono-ai), ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: colors.textLight, margin: "0 0 6px" }}>This property vs the area</p>
          <p style={{ fontSize: 13.5, color: colors.textMuted, margin: "0 0 18px" }}>{propertyName}</p>

          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 84px", gap: 12, paddingBottom: 8 }}>
              {["Metric", "Area average", "This property", "Delta"].map((h, i) => (
                <span key={h} style={{ fontFamily: "var(--font-mono-ai), ui-monospace, monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.textLight, textAlign: i === 0 ? "left" : "right" }}>{h}</span>
              ))}
            </div>
            {comparisons.map(c => {
              const areaVal = c.area as number;
              // A bare ▲ said only "different", never by how much — and on a
              // 7x gap that is the whole story.
              const pct = areaVal > 0 && c.yours != null ? Math.round(((c.yours - areaVal) / areaVal) * 100) : null;
              const up = pct != null && (c.higherIsBetter ? pct >= 0 : pct <= 0);
              return (
                <div key={c.metric} style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 84px", gap: 12, alignItems: "baseline", padding: "12px 0", borderTop: `1px solid ${colors.border}` }}>
                  <span style={{ fontSize: 13.5, color: colors.textMain }}>{c.metric}</span>
                  <span style={{ fontSize: 13.5, color: colors.textMuted, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{c.format(areaVal)}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: colors.textMain, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{c.format(c.yours)}</span>
                  <span style={{ fontSize: 12.5, textAlign: "right", fontVariantNumeric: "tabular-nums", color: pct == null ? colors.textLight : up ? colors.primary : colors.secondaryText }}>
                    {pct == null ? "—" : `${pct >= 0 ? "+" : ""}${pct}%`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* What shapes this market */}
      <div style={{ borderRadius: 22, background: colors.bgSage, border: `1px solid ${colors.borderSage}`, padding: "24px 26px", breakInside: "avoid" as const }}>
        <p style={{ fontFamily: "var(--font-mono-ai), ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: colors.textLight, margin: "0 0 16px" }}>What shapes this market</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {insights.map((text, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontFamily: "var(--font-mono-ai), ui-monospace, monospace", fontSize: 11, color: colors.textLight, lineHeight: 1.7, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{String(i + 1).padStart(2, "0")}</span>
              <p style={{ fontSize: 13.5, color: colors.textMain, lineHeight: 1.6, margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparable Buildings Nearby */}
      {listings.length > 0 && (
        <div style={{ borderRadius: 24, background: "#fff", border: `1px solid ${colors.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 10px 30px rgba(27,94,74,0.06)", padding: "22px 24px", breakInside: "avoid" as const }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: colors.textMain, marginBottom: 4 }}>Comparable Buildings Nearby</p>
          <p style={{ fontSize: 12, color: colors.textLight, marginBottom: 16 }}>Nearby {unitSize} STR inventory in {area}, from {sourceLabel} live listing data.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            {listings.map((l, i) => {
              const stats = [
                l.ttmAvgRate != null && l.ttmAvgRate > 0 ? { label: "ADR", value: `AED ${fmt(l.ttmAvgRate)}`, color: colors.textMain } : null,
                l.ttmOccupancy != null && l.ttmOccupancy > 0 ? { label: "Occupancy", value: `${Math.round(l.ttmOccupancy * 100)}%`, color: colors.primary } : null,
                l.ttmRevenue != null && l.ttmRevenue > 0 ? { label: "Revenue", value: `AED ${fmt(l.ttmRevenue)}`, color: colors.textMain } : null,
              ].filter((s): s is { label: string; value: string; color: string } => s !== null);
              return (
                <div key={l.listingId || i} className="rpt-comp-card" style={{ borderRadius: 16, background: colors.bgSection, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
                  {l.coverPhotoUrl ? (
                    <img src={l.coverPhotoUrl} alt="" style={{ width: "100%", height: 128, objectFit: "cover", display: "block" }} />
                  ) : (
                    <div style={{ width: "100%", height: 128, background: colors.bgSage, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={colors.textLight} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                  )}
                  <div style={{ padding: "13px 15px" }}>
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMain, marginBottom: 10, lineHeight: 1.4, minHeight: "2.8em" }}>{sanitizeListingTitle(l.name)}</p>
                    {stats.length > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, paddingTop: 10, borderTop: `1px solid ${colors.border}` }}>
                        {stats.map(s => (
                          <div key={s.label}>
                            <p style={{ fontSize: 9, color: colors.textLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{s.label}</p>
                            <p style={{ fontSize: 12.5, fontWeight: 700, color: s.color }}>{s.value}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      <style>{`
        @media (max-width: 700px) {
          .rpt-area-snapshot-grid { grid-template-columns: 1fr 1fr !important; }
        }
        .rpt-comp-card { transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease; }
        .rpt-comp-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(27,94,74,0.10); border-color: rgba(184,138,68,0.35); }
        @media print {
          .rpt-comp-card:hover { transform: none; box-shadow: none; }
        }
      `}</style>
    </div>
  );
}
