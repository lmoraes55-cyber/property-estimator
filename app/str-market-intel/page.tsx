/*
  DIRECTION CONTRACT (Impeccable new-work, surface scope — see PRODUCT.md / DESIGN.md)
  THESIS: One area, fully understood, before the next — not a dashboard-shell trying to
    show all of Dubai at once. Refuses the generic sidebar+grid analytics-tool default
    this page shipped with.
  OWN-WORLD: forest green/bronze on a cool near-white ground, geometric display face at light weight,
    serif numbers, restrained lift+shadow. No new palette, no new type, no new material.
  STORY: An owner scans ranked areas, opens the one they care about, and immediately sees
    which numbers are real (DLD/AirROI/Airbtics, sourced) versus AssetIntel's own directional
    read — never blended into one undifferentiated block of "fact."
  FIRST VIEWPORT: Serif H1 + eyebrow, Dubai-wide KPI strip, then the area accordion list
    (rank, area, live headline metrics) with the top area already expanded.
  FORM: Candidate 6 of 7 grounded structures (area-profile accordion, single-open, one
    area's full profile revealed in place) — assigned by concept-seed.mjs (key afe2d5aa).
    Raise: a declined challenger (sneaker-box world) donated its "row lifts, then hinges
    open" physicality to the accordion's open transition — motion only, no palette change.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the finish
    review, the verdict, and DESIGN.md.
*/
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import AssetIntelLogo from "@/components/AssetIntelLogo";
import DecorativeBackdrop from "@/components/DecorativeBackdrop";
import ConsultationBanner from "@/components/home/ConsultationBanner";
import AccessGate from "@/components/AccessGate";
import { colors } from "@/lib/colors";
import type { AreaStatsRow } from "@/lib/str-market-data";

const serif = "var(--font-display), ui-sans-serif, system-ui, sans-serif";

// ── STATIC EDITORIAL CONTENT (AssetIntel's own directional model — kept
// visually and textually distinct from live sourced data throughout) ──────

const strAreaOpportunityRanking = [
  { rank: 1, area: "Emaar Beachfront", score: 89, opportunityView: "Premium Selective", bestUnitType: "1BR / 2BR", confidence: "Medium", ownerNote: "Beachfront positioning, newer stock, and lifestyle appeal can support premium STR pricing. Performance should be checked carefully against low-season demand, furnishing cost, and view quality." },
  { rank: 2, area: "Business Bay", score: 84, opportunityView: "Strong / Practical", bestUnitType: "Studio / 1BR", confidence: "Medium-High", ownerNote: "Strong business and tourist guest mix, broad apartment stock, and central positioning make Business Bay a practical STR market when building quality and pricing are aligned." },
  { rank: 3, area: "Dubai Marina / JBR", score: 83, opportunityView: "Strong but Competitive", bestUnitType: "Studio / 1BR", confidence: "Medium", ownerNote: "Tourist demand, waterfront appeal, and operator coverage remain strong, but competition is high. View, furnishing, and photography can materially affect results." },
  { rank: 4, area: "Downtown Dubai", score: 82, opportunityView: "Premium ADR Potential", bestUnitType: "1BR / 2BR", confidence: "Medium", ownerNote: "Burj Khalifa proximity, walkability, and premium tourist demand can support ADR, especially for well-furnished units with strong views." },
  { rank: 5, area: "Palm Jumeirah", score: 78, opportunityView: "Luxury Selective", bestUnitType: "1BR / 2BR", confidence: "Medium", ownerNote: "High ADR potential, but guest expectations, setup cost, and low-season pricing risk are higher. Best suited for premium units with strong positioning." },
  { rank: 6, area: "Dubai Hills", score: 70, opportunityView: "Emerging / Selective", bestUnitType: "1BR / 2BR", confidence: "Low-Medium", ownerNote: "Lifestyle and family appeal are improving, but STR performance should be reviewed building-by-building due to less tourist-driven demand than coastal or Downtown areas." },
];

const strBuildingWatchlist = [
  { building: "Marina Gate", area: "Dubai Marina", assetIntelView: "Premium Marina Candidate", bestFit: "1BR / 2BR", confidence: "Medium", ownerInsight: "Premium tower appeal, Marina location, and high-floor/view upside can support STR demand. Furnishing quality remains critical." },
  { building: "Address JBR", area: "JBR", assetIntelView: "Hotel-Style Premium", bestFit: "1BR / 2BR", confidence: "Medium", ownerInsight: "Beach access and hotel-style positioning can support premium guest expectations, but setup standards must be high." },
  { building: "Burj Vista", area: "Downtown Dubai", assetIntelView: "View-Driven Premium", bestFit: "1BR / 2BR", confidence: "Medium", ownerInsight: "Burj Khalifa proximity and view potential can influence ADR. Strong furnishing and photography are important." },
  { building: "Act One Act Two", area: "Downtown Dubai", assetIntelView: "Modern Downtown STR Candidate", bestFit: "1BR", confidence: "Medium", ownerInsight: "Modern building quality and Downtown location create strong guest appeal when pricing and presentation are aligned." },
  { building: "Marina Vista", area: "Emaar Beachfront", assetIntelView: "Beachfront Lifestyle Candidate", bestFit: "1BR / 2BR", confidence: "Low-Medium", ownerInsight: "Beachfront positioning and lifestyle appeal are strong, but low-season pricing and guest expectations should be checked." },
  { building: "Beach Vista", area: "Emaar Beachfront", assetIntelView: "Premium Beachfront Watchlist", bestFit: "1BR / 2BR", confidence: "Low-Medium", ownerInsight: "Best suited to units with view, strong furnishing, and premium presentation. Verify operating assumptions carefully." },
  { building: "Forte", area: "Downtown Dubai", assetIntelView: "Downtown Tourist Access", bestFit: "1BR / 2BR", confidence: "Medium", ownerInsight: "Good Downtown positioning with tourist appeal. Furnishing and pricing strategy determine whether STR can outperform LTR." },
  { building: "Select Business Bay Towers", area: "Business Bay", assetIntelView: "Practical STR Stock", bestFit: "Studio / 1BR", confidence: "Low-Medium", ownerInsight: "Can work when rent/value basis is right, but competition, building quality, and furnishing standards matter." },
];

const marketSignals = [
  { title: "Tourism & Event Demand", text: "Dubai's tourism calendar, exhibitions, conferences, and winter travel season can materially affect STR demand across the city." },
  { title: "Supply & Competition", text: "More holiday home listings in the same area can pressure occupancy and ADR, especially in low season." },
  { title: "Furnishing & Photography", text: "Guest conversion is strongly influenced by presentation. Weak interiors can reduce STR upside even in strong areas." },
  { title: "View, Floor & Layout", text: "View quality, higher floors, balcony usability, and practical layouts can create meaningful ADR differences between similar units." },
  { title: "Operator Execution", text: "Pricing, response speed, review management, housekeeping, and owner reporting can all affect net performance." },
  { title: "Low-Season Break-Even", text: "Owners should check whether the unit can still cover costs during softer summer months before committing to STR." },
];

const strScoreMethodology = [
  { label: "Area Guest Demand", weight: 20 },
  { label: "Building Guest Appeal", weight: 15 },
  { label: "ADR Potential", weight: 15 },
  { label: "Occupancy Potential", weight: 15 },
  { label: "Unit Type Suitability", weight: 10 },
  { label: "View & Floor Premium", weight: 10 },
  { label: "Furnishing Impact", weight: 5 },
  { label: "Operator Availability", weight: 5 },
  { label: "Low Season Risk", weight: 5 },
];

// Areas AirROI/Airbtics don't recognize as a named market — STR figures are
// estimated from a geo-radius listings sample instead of a market summary.
const APPROX_STR_AREAS = new Set(["JBR", "Palm Jumeirah", "JVC", "Al Furjan"]);

function matchingRanking(area: string) {
  return strAreaOpportunityRanking.find(r => r.area.includes(area) || (area === "JBR" && r.area.includes("Dubai Marina")));
}
function matchingBuildings(area: string) {
  return strBuildingWatchlist.filter(b => b.area === area || (area === "JBR" && b.area === "Dubai Marina") || (area === "Dubai Marina" && b.area === "JBR"));
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function fmtAED(n: number | null | undefined): string {
  if (n == null) return "—";
  return `AED ${Math.round(n).toLocaleString()}`;
}
function fmtPct(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${(n <= 1 ? n * 100 : n).toFixed(0)}%`;
}
function fmtNum(n: number | null | undefined): string {
  if (n == null) return "—";
  return Math.round(n).toLocaleString();
}
// Raw scraped titles carry promo spam ("50% DISCOUNT!!!", ALL CAPS) — clean before display.
function sanitizeListingTitle(raw: string | null | undefined): string {
  if (!raw) return "Untitled listing";
  let s = raw
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "") // emoji
    .replace(/\d{1,3}\s?%\s?(off|discount)/gi, "")
    .replace(/\b(discount|deal|promo|special offer)\b/gi, "")
    .replace(/!{1,}/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!s) return "Untitled listing";
  // Mostly-caps titles read as shouting — normalize to title case.
  const letters = s.replace(/[^a-zA-Z]/g, "");
  if (letters.length > 4 && letters === letters.toUpperCase()) {
    s = s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
  return s.length > 60 ? s.slice(0, 57).trim() + "…" : s;
}
function dataSourceLabel(row: AreaStatsRow): string {
  if (row.data_sources === "airbtics-primary") return "Airbtics (primary)";
  if (row.data_sources === "airroi+airbtics") return "AirROI + Airbtics (blended)";
  if (row.data_sources === "airbtics") return "Airbtics";
  return "AirROI";
}

type SortKey = "revpar" | "adr" | "occ" | "yield" | "sales";
type TrendMetric = "adr" | "occ" | "revpar" | "sales" | "rentals";

function scoreColor(score: number) {
  if (score >= 85) return colors.primary;
  if (score >= 75) return colors.primaryLight;
  if (score >= 65) return colors.secondaryText;
  return colors.error;
}
function scoreBg(score: number) {
  if (score >= 85) return "rgba(27,94,74,0.10)";
  if (score >= 75) return "rgba(42,122,98,0.10)";
  if (score >= 65) return "rgba(184,138,68,0.10)";
  return "rgba(199,90,90,0.08)";
}
function scoreLabel(score: number) {
  if (score >= 85) return "Premium";
  if (score >= 75) return "Strong";
  if (score >= 65) return "Selective";
  return "High Caution";
}

function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.secondaryText, margin: 0 }}>{children}</p>;
}

function SourceChip({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "bronze" }) {
  const isGreen = tone === "green";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999,
      fontSize: 10.5, fontWeight: 700, letterSpacing: "0.02em",
      background: isGreen ? "rgba(27,94,74,0.08)" : "rgba(184,138,68,0.10)",
      color: isGreen ? colors.primary : colors.secondaryText,
      border: `1px solid ${isGreen ? "rgba(27,94,74,0.18)" : "rgba(184,138,68,0.25)"}`,
    }}>
      {children}
    </span>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function STRMarketIntelPage() {
  const router = useRouter();

  const [areaStats, setAreaStats] = useState<AreaStatsRow[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [openArea, setOpenArea] = useState<string | null>(null);
  const [openAreaFromUrl, setOpenAreaFromUrl] = useState(false);
  const [trendHistory, setTrendHistory] = useState<AreaStatsRow[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("revpar");
  const [areaSearch, setAreaSearch] = useState("");
  const [trendMetric, setTrendMetric] = useState<TrendMetric>("adr");
  const [compareAreas, setCompareAreas] = useState<string[]>([]);

  // Read ?area= on first load so an opened area's link is shareable.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("area");
    if (fromUrl) { setOpenArea(fromUrl); setOpenAreaFromUrl(true); }
  }, []);

  useEffect(() => {
    fetch("/api/str-market-data")
      .then(r => r.json())
      .then(({ data }: { data: AreaStatsRow[] }) => {
        setAreaStats(data);
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, []);

  useEffect(() => {
    if (!openArea) return;
    fetch(`/api/str-market-data?area=${encodeURIComponent(openArea)}&months=12`)
      .then(r => r.json())
      .then(({ data }: { data: AreaStatsRow[] }) => setTrendHistory(data))
      .catch(() => {});
  }, [openArea]);

  const hasLiveData = areaStats.length > 0;
  const lastUpdated = areaStats.reduce<string | null>((latest, r) => {
    if (!r.updated_at) return latest;
    if (!latest || new Date(r.updated_at) > new Date(latest)) return r.updated_at;
    return latest;
  }, null);

  const overallConfidence = useMemo(() => {
    if (!areaStats.length) return null;
    const scores = areaStats.map(r => (r.confidence === "high" ? 3 : r.confidence === "medium" ? 2 : 1));
    const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
    return avg >= 2.5 ? "High" : avg >= 1.7 ? "Medium" : "Low";
  }, [areaStats]);

  const dubaiTotals = areaStats.reduce(
    (acc, a) => ({
      sales: acc.sales + (a.sales_transactions ?? 0),
      rentals: acc.rentals + (a.rental_transactions ?? 0),
      adrSum: acc.adrSum + (a.adr ?? 0),
      adrCount: acc.adrCount + (a.adr != null ? 1 : 0),
      occSum: acc.occSum + (a.occupancy ?? 0),
      occCount: acc.occCount + (a.occupancy != null ? 1 : 0),
      revparSum: acc.revparSum + (a.revpar ?? 0),
      revparCount: acc.revparCount + (a.revpar != null ? 1 : 0),
      listings: acc.listings + (a.active_listings ?? 0),
    }),
    { sales: 0, rentals: 0, adrSum: 0, adrCount: 0, occSum: 0, occCount: 0, revparSum: 0, revparCount: 0, listings: 0 }
  );

  const kpiCards = [
    { label: "Sales Transactions", value: fmtNum(dubaiTotals.sales), source: "DLD" },
    { label: "Rental Transactions", value: fmtNum(dubaiTotals.rentals), source: "DLD" },
    { label: "Avg. ADR", value: dubaiTotals.adrCount ? fmtAED(dubaiTotals.adrSum / dubaiTotals.adrCount) : "—", source: "Airbtics · AirROI" },
    { label: "Avg. Occupancy", value: dubaiTotals.occCount ? fmtPct(dubaiTotals.occSum / dubaiTotals.occCount) : "—", source: "Airbtics · AirROI" },
    { label: "Avg. RevPAR", value: dubaiTotals.revparCount ? fmtAED(dubaiTotals.revparSum / dubaiTotals.revparCount) : "—", source: "Airbtics · AirROI" },
    { label: "Active Listings Tracked", value: fmtNum(dubaiTotals.listings), source: "Airbtics · AirROI" },
  ];

  const sortedAreas = useMemo(() => {
    const rows = [...areaStats].filter(r => r.area.toLowerCase().includes(areaSearch.toLowerCase()));
    const val = (r: AreaStatsRow): number => {
      switch (sortKey) {
        case "adr": return r.adr ?? -1;
        case "occ": return r.occupancy ?? -1;
        case "yield": return r.ltr_yield ?? -1;
        case "sales": return r.sales_transactions ?? -1;
        default: return r.revpar ?? -1;
      }
    };
    return rows.sort((a, b) => val(b) - val(a));
  }, [areaStats, sortKey, areaSearch]);

  useEffect(() => {
    if (!openArea && !openAreaFromUrl && sortedAreas.length > 0) setOpenArea(sortedAreas[0].area);
  }, [sortedAreas, openArea, openAreaFromUrl]);

  function toggleArea(area: string) {
    setOpenAreaFromUrl(false);
    setOpenArea(cur => {
      const next = cur === area ? null : area;
      const params = new URLSearchParams(window.location.search);
      if (next) params.set("area", next); else params.delete("area");
      const qs = params.toString();
      router.replace(qs ? `/str-market-intel?${qs}` : "/str-market-intel", { scroll: false });
      return next;
    });
  }

  function toggleCompare(area: string) {
    setCompareAreas(cur => cur.includes(area) ? cur.filter(a => a !== area) : cur.length >= 4 ? cur : [...cur, area]);
  }

  function exportCompareCsv() {
    const rows = areaStats.filter(r => compareAreas.includes(r.area));
    const cols: [string, (r: AreaStatsRow) => string | number][] = [
      ["Area", r => r.area],
      ["ADR (AED)", r => r.adr ?? ""],
      ["Occupancy (%)", r => r.occupancy != null ? Math.round((r.occupancy <= 1 ? r.occupancy * 100 : r.occupancy)) : ""],
      ["RevPAR (AED)", r => r.revpar ?? ""],
      ["LTR Yield (%)", r => r.ltr_yield ?? ""],
      ["Median AED/sqft", r => r.median_sale_price_per_sqft ?? ""],
      ["Sales Transactions", r => r.sales_transactions ?? ""],
      ["Rental Transactions", r => r.rental_transactions ?? ""],
      ["Active Listings", r => r.active_listings ?? ""],
    ];
    const csv = [cols.map(c => c[0]).join(",")].concat(
      rows.map(r => cols.map(c => `"${String(c[1](r)).replace(/"/g, '""')}"`).join(","))
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assetintel-str-area-comparison-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const pad = "72px 24px";
  const padSm = "56px 24px";

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh", position: "relative" }}>
      <DecorativeBackdrop />
      <div style={{ position: "relative", zIndex: 1 }}>
        <SiteNav active="str-market-intel" />

        {/* ── HEADER ── */}
        <section style={{ padding: "48px 24px 0", maxWidth: 1200, margin: "0 auto" }}>
          <EyebrowLabel>DUBAI'S PROPERTY INTELLIGENCE PLATFORM</EyebrowLabel>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginTop: 10, marginBottom: 8 }}>
            <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontFamily: serif, fontWeight: 600, color: colors.primary, margin: 0, lineHeight: 1.15, maxWidth: 640 }}>
              Dubai STR Market Intelligence
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.textLight, margin: "0 0 2px" }}>Last Updated</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: colors.textMain, margin: 0 }}>
                  {lastUpdated ? new Date(lastUpdated).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "Syncing…"}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.textLight, margin: "0 0 2px" }}>Data Confidence</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: overallConfidence === "High" ? colors.primary : overallConfidence === "Medium" ? colors.secondaryText : colors.textLight, margin: 0 }}>
                  {overallConfidence ?? "—"}
                </p>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 14.5, color: colors.textMuted, maxWidth: 640, lineHeight: 1.65, marginBottom: 28 }}>
            Live DLD transaction data blended with weekly refreshed AirROI and Airbtics market intelligence — cross-validated where both cover an area.
          </p>

          {/* In-page tab strip */}
          <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }} aria-label="Section navigation">
            {[
              ["mi-overview", "Overview"], ["mi-areas", "Areas"], ["mi-signals", "Market Signals"], ["mi-methodology", "Methodology"],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                style={{
                  padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, textDecoration: "none",
                  color: colors.primary, background: "rgba(27,94,74,0.06)", border: "1px solid rgba(27,94,74,0.14)",
                }}
              >
                {label}
              </a>
            ))}
          </nav>
        </section>

        {/* ── OVERVIEW: KPI STRIP ── */}
        <AccessGate source="str-market-intel" title="Unlock Live Market Data" subtitle="Free — enter your name and email to see live ADR, occupancy, RevPAR, and area rankings.">
        <section id="mi-overview" style={{ padding: padSm, maxWidth: 1200, margin: "0 auto" }}>
          {!hasLiveData && !dataLoading && (
            <div style={{ background: colors.bgSage, border: `1px solid ${colors.borderSage}`, borderRadius: 18, padding: "18px 22px", marginBottom: 22, fontSize: 13.5, color: colors.textMuted }}>
              Live market data is syncing — the weekly refresh has not yet populated this database. The dashboard below will populate automatically once the first sync completes.
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }} className="mi-kpi-grid">
            {kpiCards.map(card => (
              <div key={card.label} style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 22, padding: "20px 22px", boxShadow: colors.shadowSm }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.textLight, marginBottom: 10 }}>{card.label}</p>
                <p style={{ fontSize: 29, fontFamily: serif, fontWeight: 600, color: colors.textMain, margin: "0 0 8px" }}>{card.value}</p>
                <SourceChip>{card.source}</SourceChip>
              </div>
            ))}
          </div>
        </section>

        {/* ── AREAS: SEARCH + ACCORDION ── */}
        <section id="mi-areas" style={{ padding: pad, background: colors.bgSection, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <EyebrowLabel>DUBAI AREAS</EyebrowLabel>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontFamily: serif, fontWeight: 600, color: colors.primary, margin: "10px 0 8px" }}>Area Performance</h2>
            <p style={{ fontSize: 14.5, color: colors.textMuted, lineHeight: 1.65, marginBottom: 26, maxWidth: 640 }}>
              Ranked by RevPAR by default. Open any area for its full live profile — and AssetIntel's own directional read, kept visibly separate from sourced data.
            </p>

            {/* Controls */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
              <input
                type="text"
                placeholder="Search areas…"
                value={areaSearch}
                onChange={e => setAreaSearch(e.target.value)}
                style={{ padding: "11px 16px", borderRadius: 12, border: `1.5px solid ${colors.border}`, background: colors.bgMain, fontSize: 14, color: colors.textMain, outline: "none", minWidth: 220 }}
              />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {([["revpar", "RevPAR"], ["adr", "ADR"], ["occ", "Occupancy"], ["yield", "LTR Yield"], ["sales", "Sales Volume"]] as const).map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setSortKey(k)}
                    style={{
                      padding: "9px 15px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                      border: `1.5px solid ${sortKey === k ? colors.primary : colors.border}`,
                      background: sortKey === k ? colors.primary : "transparent",
                      color: sortKey === k ? "#fff" : colors.textMuted,
                    }}
                  >
                    Sort: {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Compare bar */}
            {compareAreas.length > 0 && (
              <div style={{ background: colors.bgSage, border: `1px solid ${colors.borderSage}`, borderRadius: 18, padding: "18px 20px", marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: compareAreas.length > 0 ? 14 : 0 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMain, margin: 0 }}>Comparing {compareAreas.length} area{compareAreas.length > 1 ? "s" : ""} {compareAreas.length >= 4 && <span style={{ color: colors.textLight, fontWeight: 500 }}>(max 4)</span>}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={exportCompareCsv} style={{ padding: "8px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${colors.primary}`, background: "transparent", color: colors.primary }}>
                      Export CSV
                    </button>
                    <button onClick={() => setCompareAreas([])} style={{ padding: "8px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${colors.border}`, background: "transparent", color: colors.textMuted }}>
                      Clear
                    </button>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 480 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "6px 10px 6px 0", color: colors.textLight, fontWeight: 700, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.05em" }}>Metric</th>
                        {compareAreas.map(a => (
                          <th key={a} style={{ textAlign: "left", padding: "6px 10px", color: colors.textMain, fontFamily: serif, fontWeight: 600, fontSize: 13.5 }}>{a}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {([
                        ["ADR", (r: AreaStatsRow) => fmtAED(r.adr)],
                        ["Occupancy", (r: AreaStatsRow) => fmtPct(r.occupancy)],
                        ["RevPAR", (r: AreaStatsRow) => fmtAED(r.revpar)],
                        ["LTR Yield", (r: AreaStatsRow) => r.ltr_yield != null ? `${r.ltr_yield.toFixed(1)}%` : "—"],
                        ["Median AED/sqft", (r: AreaStatsRow) => r.median_sale_price_per_sqft != null ? Math.round(r.median_sale_price_per_sqft).toLocaleString() : "—"],
                        ["Sales Transactions", (r: AreaStatsRow) => fmtNum(r.sales_transactions)],
                      ] as [string, (r: AreaStatsRow) => string][]).map(([label, fn]) => (
                        <tr key={label} style={{ borderTop: `1px solid ${colors.borderSage}` }}>
                          <td style={{ padding: "8px 10px 8px 0", color: colors.textLight, fontWeight: 600 }}>{label}</td>
                          {compareAreas.map(a => {
                            const r = areaStats.find(x => x.area === a);
                            return <td key={a} style={{ padding: "8px 10px", color: colors.textMain, fontWeight: 700 }}>{r ? fn(r) : "—"}</td>;
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Accordion list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sortedAreas.length === 0 && (
                <p style={{ fontSize: 13.5, color: colors.textMuted, padding: "24px 0" }}>{dataLoading ? "Loading market data…" : "No areas match your search."}</p>
              )}
              {sortedAreas.map((row, i) => {
                const isOpen = openArea === row.area;
                const approx = APPROX_STR_AREAS.has(row.area);
                const ranking = matchingRanking(row.area);
                const buildings = matchingBuildings(row.area);
                return (
                  <div
                    key={row.area}
                    style={{
                      background: colors.bgMain, border: `1px solid ${isOpen ? "rgba(184,138,68,0.35)" : colors.border}`,
                      borderRadius: 20, overflow: "hidden",
                      boxShadow: isOpen ? colors.shadowMd : colors.shadowSm,
                      transition: "box-shadow 220ms ease, border-color 220ms ease, transform 220ms ease",
                      transform: isOpen ? "translateY(-2px)" : "none",
                    }}
                  >
                    {/* Row header — always visible */}
                    <div style={{ display: "flex", alignItems: "stretch" }}>
                      <label
                        title={compareAreas.includes(row.area) ? "Remove from comparison" : "Add to comparison"}
                        style={{ display: "flex", alignItems: "center", padding: "0 0 0 18px", cursor: "pointer", flexShrink: 0 }}
                        onClick={e => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={compareAreas.includes(row.area)}
                          onChange={() => toggleCompare(row.area)}
                          disabled={!compareAreas.includes(row.area) && compareAreas.length >= 4}
                          style={{ width: 16, height: 16, accentColor: colors.primary, cursor: "pointer" }}
                        />
                      </label>
                      <button
                        onClick={() => toggleArea(row.area)}
                        style={{
                          width: "100%", display: "grid",
                          gridTemplateColumns: "28px 1.4fr 1fr 1fr 1fr auto",
                          alignItems: "center", gap: 14, padding: "16px 20px",
                          background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                        }}
                        className="mi-accordion-row"
                      >
                      <span style={{ fontSize: 13, fontWeight: 700, color: colors.textLight }}>{i + 1}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <span style={{ fontSize: 17, fontWeight: 600, color: colors.textMain, fontFamily: serif }}>{row.area}</span>
                        {approx && <span style={{ fontSize: 8.5, fontWeight: 700, color: colors.secondaryText, border: `1px solid ${colors.secondaryText}`, borderRadius: 4, padding: "1px 5px", flexShrink: 0 }}>APPROX.</span>}
                      </span>
                      <span className="mi-accordion-metric">
                        <span style={{ display: "block", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: colors.textLight }}>ADR</span>
                        <span style={{ fontSize: 17, fontWeight: 600, color: colors.textMain, fontFamily: serif }}>{fmtAED(row.adr)}</span>
                      </span>
                      <span className="mi-accordion-metric">
                        <span style={{ display: "block", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: colors.textLight }}>Occupancy</span>
                        <span style={{ fontSize: 17, fontWeight: 600, color: colors.textMain, fontFamily: serif }}>{fmtPct(row.occupancy)}</span>
                      </span>
                      <span className="mi-accordion-metric">
                        <span style={{ display: "block", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: colors.textLight }}>RevPAR</span>
                        <span style={{ fontSize: 17, fontWeight: 600, color: colors.primary, fontFamily: serif }}>{fmtAED(row.revpar)}</span>
                      </span>
                      <span style={{
                        width: 26, height: 26, borderRadius: "50%", background: "rgba(27,94,74,0.07)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 220ms ease",
                      }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke={colors.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                      </button>
                    </div>

                    {/* Expandable body — grid-rows technique for smooth auto-height */}
                    <div style={{ display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr", transition: "grid-template-rows 320ms ease" }}>
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ padding: "4px 20px 24px", borderTop: `1px solid ${colors.border}` }}>
                          <AreaProfile
                            row={row}
                            trendHistory={trendHistory}
                            trendMetric={trendMetric}
                            setTrendMetric={setTrendMetric}
                            ranking={ranking}
                            buildings={buildings}
                            sourceLabel={dataSourceLabel(row)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {sortedAreas.some(r => APPROX_STR_AREAS.has(r.area)) && (
              <p style={{ fontSize: 11.5, color: colors.textLight, marginTop: 20, lineHeight: 1.6 }}>
                <span style={{ fontWeight: 700, color: colors.secondaryText }}>APPROX.</span> — neither AirROI nor Airbtics recognizes these areas as a named market, so their STR figures are estimated from a sample of nearby listings rather than a market-level summary. Treat as directional, not precise.
              </p>
            )}
          </div>
        </section>
        </AccessGate>

        {/* ── MARKET SIGNALS ── */}
        <section id="mi-signals" style={{ padding: pad }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <EyebrowLabel>SIGNALS TO WATCH</EyebrowLabel>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontFamily: serif, fontWeight: 600, color: colors.primary, margin: "10px 0 8px" }}>Market Signals To Watch</h2>
            <p style={{ fontSize: 14.5, color: colors.textMuted, lineHeight: 1.65, marginBottom: 28, maxWidth: 640 }}>
              STR performance is not only about location. Owners should review the signals that directly affect income, risk, and guest conversion.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
              {marketSignals.map(s => (
                <div key={s.title} style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 18, padding: "22px 20px", boxShadow: colors.shadowSm }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(27,94,74,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: colors.primary, opacity: 0.75 }} />
                  </div>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: colors.textMain, marginBottom: 8 }}>{s.title}</p>
                  <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.6, margin: 0 }}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SCORING METHODOLOGY ── */}
        <section id="mi-methodology" style={{ padding: pad, background: colors.bgSage, borderTop: `1px solid ${colors.borderSage}`, borderBottom: `1px solid ${colors.borderSage}` }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }} className="mi-methodology-grid">
              <div>
                <EyebrowLabel>DIRECTIONAL MODEL — NOT MEASURED DATA</EyebrowLabel>
                <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontFamily: serif, fontWeight: 600, color: colors.primary, margin: "10px 0 14px" }}>How AssetIntel Scores STR Potential</h2>
                <p style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.75, marginBottom: 16 }}>
                  AssetIntel does not rank properties only by headline revenue. We consider whether a unit can realistically perform after management fees, running costs, furnishing quality, seasonality, and operator execution.
                </p>
                <p style={{ fontSize: 13, color: colors.textLight, lineHeight: 1.7, margin: 0 }}>
                  Scores are directional and should be validated at unit level using building, unit size, floor, view, furnishing status, and cost assumptions.
                </p>
              </div>
              <div style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 22, overflow: "hidden", boxShadow: colors.shadowSm }}>
                {strScoreMethodology.map((item, i) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderBottom: i < strScoreMethodology.length - 1 ? `1px solid ${colors.border}` : "none" }}>
                    <span style={{ fontSize: 13.5, color: colors.textMain, fontWeight: 500 }}>{item.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 80, height: 5, background: colors.bgSage, borderRadius: 99 }}>
                        <div style={{ width: `${(item.weight / 20) * 100}%`, height: "100%", background: colors.primary, borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: colors.primary, minWidth: 32, textAlign: "right" }}>{item.weight}%</span>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "12px 22px", background: colors.bgSage, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted }}>Total</span>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: colors.primary }}>100%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── DISCLAIMER ── */}
        <section style={{ padding: padSm }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 20, padding: "26px 28px" }}>
              <EyebrowLabel>IMPORTANT RESEARCH NOTE</EyebrowLabel>
              <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.8, margin: "12px 0" }}>
                AssetIntel STR Market Intel combines Dubai Land Department transaction data, AirROI and Airbtics market intelligence, and AssetIntel&apos;s own owner-side scoring model. Public STR datasets can vary because each provider tracks different platforms, listings, filters, samples, and time periods. Rankings are directional and should be used as market research, not guaranteed income projections.
              </p>
              <p style={{ fontSize: 12, color: colors.textLight, lineHeight: 1.7, margin: 0 }}>AssetIntel does not guarantee rental income or final STR performance.</p>
            </div>
          </div>
        </section>

        <ConsultationBanner />

        <footer style={{ background: colors.primary, padding: "28px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ filter: "brightness(0) invert(1)", opacity: 0.9 }}>
              <AssetIntelLogo size={22} />
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>© {new Date().getFullYear()} AssetIntel. All rights reserved. · assetintel.ae</p>
          </div>
        </footer>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .mi-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .mi-methodology-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
        @media (max-width: 760px) {
          .mi-kpi-grid { grid-template-columns: 1fr !important; }
          .mi-accordion-row { grid-template-columns: 18px 1fr repeat(3, minmax(0, 54px)) auto !important; gap: 8px !important; padding: 14px 12px !important; }
          .mi-accordion-metric span:first-child { font-size: 7.5px !important; }
          .mi-accordion-metric span:last-child { font-size: 12px !important; }
        }
        @media (max-width: 480px) {
          .mi-accordion-row { grid-template-columns: 16px 1fr repeat(3, minmax(0, 44px)) auto !important; gap: 5px !important; }
        }
      `}</style>
    </div>
  );
}

// ── AREA PROFILE (accordion body) ───────────────────────────────────────────

function AreaProfile({
  row, trendHistory, trendMetric, setTrendMetric, ranking, buildings, sourceLabel,
}: {
  row: AreaStatsRow;
  trendHistory: AreaStatsRow[];
  trendMetric: TrendMetric;
  setTrendMetric: (m: TrendMetric) => void;
  ranking?: { score: number; opportunityView: string; bestUnitType: string; confidence: string; ownerNote: string };
  buildings: { building: string; assetIntelView: string; bestFit: string; confidence: string; ownerInsight: string }[];
  sourceLabel: string;
}) {
  const listings = row.sample_listings ?? [];

  const snapshotMetrics = [
    { label: "Sales Transactions", value: fmtNum(row.sales_transactions) },
    { label: "Rental Transactions", value: fmtNum(row.rental_transactions) },
    { label: "Median AED/sqft", value: row.median_sale_price_per_sqft != null ? Math.round(row.median_sale_price_per_sqft).toLocaleString() : "—" },
    { label: "LTR Yield", value: row.ltr_yield != null ? `${row.ltr_yield.toFixed(1)}%` : "—" },
    { label: "Active Listings", value: fmtNum(row.active_listings) },
    { label: "Median Annual Rent", value: fmtAED(row.median_annual_rent) },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Live Market Snapshot */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: colors.textMain, margin: 0 }}>Live Market Snapshot</p>
          <SourceChip>{sourceLabel}</SourceChip>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
          {snapshotMetrics.map(m => (
            <div key={m.label} style={{ padding: "11px 13px", background: colors.bgSection, borderRadius: 12, border: `1px solid ${colors.border}` }}>
              <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: colors.textLight, margin: "0 0 4px" }}>{m.label}</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: colors.textMain, margin: 0, fontFamily: serif }}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trend */}
      <div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {([["adr", "ADR"], ["occ", "Occupancy"], ["revpar", "RevPAR"], ["sales", "Sales"], ["rentals", "Rentals"]] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTrendMetric(k)}
              style={{
                padding: "6px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, cursor: "pointer",
                border: `1px solid ${trendMetric === k ? colors.primary : colors.border}`,
                background: trendMetric === k ? colors.primary : "transparent",
                color: trendMetric === k ? "#fff" : colors.textMuted,
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {trendHistory.length <= 1 ? (
          <p style={{ fontSize: 12.5, color: colors.textLight }}>Only one reporting period stored so far — the chart will populate as weekly refreshes accumulate history.</p>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 110 }}>
            {trendHistory.map(r => {
              const field = trendMetric === "adr" ? r.adr : trendMetric === "occ" ? r.occupancy : trendMetric === "revpar" ? r.revpar : trendMetric === "sales" ? r.sales_transactions : r.rental_transactions;
              const maxV = Math.max(...trendHistory.map(h => {
                const f = trendMetric === "adr" ? h.adr : trendMetric === "occ" ? h.occupancy : trendMetric === "revpar" ? h.revpar : trendMetric === "sales" ? h.sales_transactions : h.rental_transactions;
                return f ?? 0;
              }), 1);
              const h = field ? Math.max(6, (field / maxV) * 90) : 4;
              return (
                <div key={r.reporting_month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <div style={{ width: "100%", height: h, background: colors.primary, borderRadius: "4px 4px 0 0", opacity: field ? 0.85 : 0.15 }} />
                  <span style={{ fontSize: 9, color: colors.textLight, whiteSpace: "nowrap" }}>{new Date(r.reporting_month).toLocaleDateString(undefined, { month: "short" })}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comparable Listings */}
      {listings.length > 0 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: colors.textMain, marginBottom: 12 }}>Comparable Listings</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {listings.slice(0, 12).map((l, idx) => (
              <div key={l.listingId || idx} style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 14, overflow: "hidden" }}>
                {l.coverPhotoUrl && <img src={l.coverPhotoUrl} alt="" style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }} />}
                <div style={{ padding: "11px 13px" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: colors.textMain, marginBottom: 6, lineHeight: 1.35 }}>{sanitizeListingTitle(l.name)}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: colors.textLight, borderTop: `1px solid ${colors.border}`, paddingTop: 7 }}>
                    <span>ADR {l.ttmAvgRate ? `AED ${Math.round(l.ttmAvgRate)}` : "—"}</span>
                    <span>Occ {l.ttmOccupancy ? `${Math.round(l.ttmOccupancy * 100)}%` : "—"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editorial zone — visually distinct from live data above */}
      {(ranking || buildings.length > 0) && (
        <div style={{ background: colors.bgSage, border: `1px solid ${colors.borderSage}`, borderRadius: 18, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.secondaryText, margin: 0 }}>AssetIntel View — Directional, Not Measured Data</p>
          </div>

          {ranking && (
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: buildings.length > 0 ? 18 : 0, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: scoreBg(ranking.score), borderRadius: 999, padding: "4px 12px", flexShrink: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: scoreColor(ranking.score) }}>{ranking.score}</span>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: scoreColor(ranking.score) }}>{scoreLabel(ranking.score)}</span>
              </span>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMain, margin: "0 0 4px" }}>{ranking.opportunityView} · Best fit: {ranking.bestUnitType}</p>
                <p style={{ fontSize: 12.5, color: colors.textMuted, lineHeight: 1.6, margin: 0 }}>{ranking.ownerNote}</p>
              </div>
            </div>
          )}

          {buildings.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              {buildings.map(b => (
                <div key={b.building} style={{ background: colors.bgMain, border: `1px solid ${colors.border}`, borderRadius: 12, padding: "12px 14px" }}>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMain, margin: "0 0 2px" }}>{b.building}</p>
                  <p style={{ fontSize: 10.5, fontWeight: 700, color: colors.primary, textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 6px" }}>{b.assetIntelView}</p>
                  <p style={{ fontSize: 11.5, color: colors.textMuted, lineHeight: 1.55, margin: 0 }}>{b.ownerInsight}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
