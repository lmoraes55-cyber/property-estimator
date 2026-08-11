"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import AssetIntelLogo from "@/components/AssetIntelLogo";
import ConsultationBanner from "@/components/home/ConsultationBanner";
import AreaMap from "@/components/str-market-intel/AreaMap";
import type { AreaStatsRow } from "@/lib/str-market-data";

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────

const C = {
  green:       "#1B5E4A",
  greenDark:   "#133D30",
  greenLight:  "#2D7A5E",
  gold:        "#B88A44",
  goldLight:   "#D4A574",
  ivory:       "#FDFBF7",
  bg:          "#F8F4EE",
  bgSage:      "#F2EFE9",
  border:      "#E6E1D8",
  borderLight: "#F0EDE8",
  text:        "#1B2A1F",
  muted:       "#6B6B6B",
  subtle:      "#999",
  sage:        "#EFF4F0",
  sageBorder:  "#C8DAD0",
  danger:      "#B4544A",
};

const SIDEBAR_W = 248;

// ── STATIC CONTENT (kept from prior page) ───────────────────────────────────

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

// Areas AirROI doesn't recognize as a named market — STR figures are estimated
// from a geo-radius listings sample instead of AirROI's own market summary.
const APPROX_STR_AREAS = new Set(["JBR", "Palm Jumeirah", "JVC", "Al Furjan"]);

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
function pctChange(cur: number | null | undefined, prev: number | null | undefined): number | null {
  if (cur == null || prev == null || prev === 0) return null;
  return ((cur - prev) / prev) * 100;
}

function confidenceColor(c: string | null) {
  if (c === "high") return C.green;
  if (c === "medium") return C.gold;
  return C.subtle;
}

type SortKey = "area" | "sales" | "rentals" | "sqft" | "yield" | "adr" | "occ" | "revpar";
type MapLayer = "sales" | "rentals" | "demand" | "adr" | "occ" | "revpar";

function SidebarLink({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "block", width: "100%", textAlign: "left",
        padding: "9px 14px", borderRadius: 9, border: "none", cursor: "pointer",
        background: active ? "rgba(27,94,74,0.10)" : "transparent",
        color: active ? C.green : C.muted,
        fontSize: 13, fontWeight: active ? 700 : 500,
        marginBottom: 2,
      }}
    >
      {label}
    </button>
  );
}

function SidebarSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.subtle, margin: "22px 14px 8px" }}>
      {children}
    </p>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function STRMarketIntelPage() {
  const router = useRouter();

  const [areaStats, setAreaStats] = useState<AreaStatsRow[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [trendHistory, setTrendHistory] = useState<AreaStatsRow[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("revpar");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [mapLayer, setMapLayer] = useState<MapLayer>("demand");
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const [trendMetric, setTrendMetric] = useState<"adr" | "occ" | "revpar" | "sales" | "rentals">("adr");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Overview");

  useEffect(() => {
    fetch("/api/str-market-data")
      .then(r => r.json())
      .then(({ data }: { data: AreaStatsRow[] }) => {
        setAreaStats(data);
        if (data.length > 0) setSelectedArea(data[0].area);
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedArea) return;
    fetch(`/api/str-market-data?area=${encodeURIComponent(selectedArea)}&months=12`)
      .then(r => r.json())
      .then(({ data }: { data: AreaStatsRow[] }) => setTrendHistory(data))
      .catch(() => {});
  }, [selectedArea]);

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
      sqftSum: acc.sqftSum + (a.median_sale_price_per_sqft ?? 0),
      sqftCount: acc.sqftCount + (a.median_sale_price_per_sqft != null ? 1 : 0),
      rentSum: acc.rentSum + (a.median_annual_rent ?? 0),
      rentCount: acc.rentCount + (a.median_annual_rent != null ? 1 : 0),
      adrSum: acc.adrSum + (a.adr ?? 0),
      adrCount: acc.adrCount + (a.adr != null ? 1 : 0),
      occSum: acc.occSum + (a.occupancy ?? 0),
      occCount: acc.occCount + (a.occupancy != null ? 1 : 0),
      revparSum: acc.revparSum + (a.revpar ?? 0),
      revparCount: acc.revparCount + (a.revpar != null ? 1 : 0),
      listings: acc.listings + (a.active_listings ?? 0),
    }),
    { sales: 0, rentals: 0, sqftSum: 0, sqftCount: 0, rentSum: 0, rentCount: 0, adrSum: 0, adrCount: 0, occSum: 0, occCount: 0, revparSum: 0, revparCount: 0, listings: 0 }
  );

  const kpiCards = [
    { label: "Sales Transactions", value: fmtNum(dubaiTotals.sales), source: "DLD" },
    { label: "Rental Transactions", value: fmtNum(dubaiTotals.rentals), source: "DLD" },
    { label: "Median Sale AED/sqft", value: dubaiTotals.sqftCount ? `AED ${Math.round(dubaiTotals.sqftSum / dubaiTotals.sqftCount)}` : "—", source: "DLD" },
    { label: "Median Annual Rent", value: dubaiTotals.rentCount ? fmtAED(dubaiTotals.rentSum / dubaiTotals.rentCount) : "—", source: "DLD" },
    { label: "Avg. ADR", value: dubaiTotals.adrCount ? fmtAED(dubaiTotals.adrSum / dubaiTotals.adrCount) : "—", source: "AirROI" },
    { label: "Avg. Occupancy", value: dubaiTotals.occCount ? fmtPct(dubaiTotals.occSum / dubaiTotals.occCount) : "—", source: "AirROI" },
    { label: "Avg. RevPAR", value: dubaiTotals.revparCount ? fmtAED(dubaiTotals.revparSum / dubaiTotals.revparCount) : "—", source: "AirROI" },
    { label: "Active Listings", value: fmtNum(dubaiTotals.listings), source: "AirROI" },
  ];

  const sortedAreas = useMemo(() => {
    const rows = [...areaStats];
    const val = (r: AreaStatsRow): number | string => {
      switch (sortKey) {
        case "area": return r.area;
        case "sales": return r.sales_transactions ?? -1;
        case "rentals": return r.rental_transactions ?? -1;
        case "sqft": return r.median_sale_price_per_sqft ?? -1;
        case "yield": return r.ltr_yield ?? -1;
        case "adr": return r.adr ?? -1;
        case "occ": return r.occupancy ?? -1;
        case "revpar": return r.revpar ?? -1;
        default: return 0;
      }
    };
    rows.sort((a, b) => {
      const va = val(a), vb = val(b);
      if (typeof va === "string" || typeof vb === "string") return sortDir * String(va).localeCompare(String(vb));
      return sortDir * ((va as number) - (vb as number));
    });
    return rows;
  }, [areaStats, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(-1); }
  }

  const selectedRow = areaStats.find(a => a.area === selectedArea) || null;

  const topBuildings = useMemo(() => {
    const rows: { building: string; area: string; adr: number; occ: number; revpar: number }[] = [];
    for (const w of strBuildingWatchlist) {
      const areaRow = areaStats.find(a => a.area === w.area || (w.area === "JBR" && a.area === "JBR") || (w.area === "Dubai Marina" && a.area === "Dubai Marina"));
      if (areaRow && areaRow.adr != null && areaRow.occupancy != null) {
        rows.push({ building: w.building, area: w.area, adr: areaRow.adr, occ: areaRow.occupancy, revpar: areaRow.revpar ?? areaRow.adr * areaRow.occupancy });
      }
    }
    return rows.sort((a, b) => b.revpar - a.revpar).slice(0, 5);
  }, [areaStats]);

  const highestYield = useMemo(() => [...areaStats].filter(r => r.ltr_yield != null).sort((a, b) => (b.ltr_yield ?? 0) - (a.ltr_yield ?? 0))[0], [areaStats]);
  const risingDemand = useMemo(() => [...areaStats].filter(r => r.revpar != null).sort((a, b) => (b.revpar ?? 0) - (a.revpar ?? 0))[0], [areaStats]);
  const undervalued = useMemo(() => [...areaStats].filter(r => r.median_sale_price_per_sqft != null && r.adr != null).sort((a, b) => (a.median_sale_price_per_sqft ?? 0) - (b.median_sale_price_per_sqft ?? 0))[0], [areaStats]);
  const emergingArea = useMemo(() => areaStats.find(r => APPROX_STR_AREAS.has(r.area)) ?? areaStats[areaStats.length - 1], [areaStats]);

  const NAV_ITEMS = ["Overview", "Dubai Areas", "Buildings", "Market Trends", "Building Watchlist", "Comparable Listings", "Investment Opportunities"];
  const TOOL_ITEMS: { label: string; href: string }[] = [
    { label: "Rental Analyzer", href: "/estimator" },
    { label: "LTR Estimator", href: "/ltr-estimator" },
    { label: "Investment Report", href: "/report" },
    { label: "Operator Match", href: "/agents" },
  ];

  function scrollToId(id: string, navLabel: string) {
    setActiveNav(navLabel);
    setSidebarOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const sidebarContent = (
    <>
      <div style={{ padding: "22px 16px 18px" }}>
        <AssetIntelLogo size={20} />
      </div>
      <SidebarSectionLabel>Market Intelligence</SidebarSectionLabel>
      <div style={{ padding: "0 8px" }}>
        <SidebarLink label="Overview" active={activeNav === "Overview"} onClick={() => scrollToId("mi-overview", "Overview")} />
        <SidebarLink label="Dubai Areas" active={activeNav === "Dubai Areas"} onClick={() => scrollToId("mi-areas", "Dubai Areas")} />
        <SidebarLink label="Buildings" active={activeNav === "Buildings"} onClick={() => scrollToId("mi-buildings", "Buildings")} />
        <SidebarLink label="Market Trends" active={activeNav === "Market Trends"} onClick={() => scrollToId("mi-trends", "Market Trends")} />
        <SidebarLink label="Building Watchlist" active={activeNav === "Building Watchlist"} onClick={() => scrollToId("mi-watchlist", "Building Watchlist")} />
        <SidebarLink label="Comparable Listings" active={activeNav === "Comparable Listings"} onClick={() => scrollToId("mi-listings", "Comparable Listings")} />
        <SidebarLink label="Investment Opportunities" active={activeNav === "Investment Opportunities"} onClick={() => scrollToId("mi-opportunities", "Investment Opportunities")} />
      </div>

      <SidebarSectionLabel>Quick Tools</SidebarSectionLabel>
      <div style={{ padding: "0 8px" }}>
        {TOOL_ITEMS.map(t => (
          <SidebarLink key={t.label} label={t.label} onClick={() => router.push(t.href)} />
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ margin: "20px 14px 22px", padding: "16px 16px", borderRadius: 14, background: C.sage, border: `1px solid ${C.sageBorder}` }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 3 }}>Need Expert Guidance?</p>
        <p style={{ fontSize: 11, color: C.muted, marginBottom: 12, lineHeight: 1.5 }}>20-min independent advisory call — AED 199</p>
        <button
          onClick={() => router.push("/consultation")}
          style={{ width: "100%", padding: "9px", borderRadius: 9, background: C.green, color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
        >
          Book Consultation
        </button>
      </div>
    </>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <SiteNav active="str-market-intel" />

      <div style={{ display: "flex", maxWidth: 1600, margin: "0 auto" }}>
        {/* ── SIDEBAR (desktop) ── */}
        <aside className="mi-sidebar" style={{
          width: SIDEBAR_W, flexShrink: 0, borderRight: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column", position: "sticky", top: 0,
          height: "100vh", background: C.ivory,
        }}>
          {sidebarContent}
        </aside>

        {/* ── Mobile drawer ── */}
        {sidebarOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "none" }} className="mi-drawer-overlay">
            <div style={{ position: "absolute", inset: 0, background: "rgba(10,22,16,0.5)" }} onClick={() => setSidebarOpen(false)} />
            <aside style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 260, background: C.ivory, display: "flex", flexDirection: "column", overflowY: "auto" }}>
              {sidebarContent}
            </aside>
          </div>
        )}

        {/* ── MAIN ── */}
        <main style={{ flex: 1, minWidth: 0, padding: "28px 28px 0" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
            <div>
              <button className="mi-drawer-btn" onClick={() => setSidebarOpen(true)} style={{ display: "none", marginBottom: 10, background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>☰ Menu</button>
              <h1 style={{ fontSize: 30, fontWeight: 800, color: C.text, margin: "0 0 6px", fontFamily: "'Georgia', serif" }}>
                Dubai STR Market Intelligence
              </h1>
              <p style={{ fontSize: 13.5, color: C.muted, maxWidth: 560, lineHeight: 1.6, margin: 0 }}>
                Live DLD transaction data combined with weekly refreshed AirROI market intelligence.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.subtle, marginBottom: 2 }}>Last Updated</p>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>
                  {lastUpdated ? new Date(lastUpdated).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "Syncing…"}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.subtle, marginBottom: 2 }}>Data Confidence</p>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: overallConfidence === "High" ? C.green : overallConfidence === "Medium" ? C.gold : C.subtle }}>
                  {overallConfidence ?? "—"}
                </p>
              </div>
              <button
                onClick={() => window.print()}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 10, background: C.green, color: "#fff", border: "none", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
              >
                ⬇ Export Report
              </button>
            </div>
          </div>

          {/* Filter bar */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 22 }}>
            {[
              { label: "Reporting Month", value: lastUpdated ? new Date(lastUpdated).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "Latest" },
              { label: "Area", value: "All Areas" },
              { label: "Building", value: "All Buildings" },
              { label: "Unit Size", value: "All Sizes" },
              { label: "Property Type", value: "All Types" },
              { label: "Ready / Off-Plan", value: "All" },
            ].map(f => (
              <div key={f.label} style={{ padding: "7px 13px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.bg, fontSize: 12, color: C.text, cursor: "default" }}>
                <span style={{ color: C.subtle, marginRight: 6 }}>{f.label}:</span>
                <span style={{ fontWeight: 600 }}>{f.value}</span>
              </div>
            ))}
            <div style={{ flex: 1 }} />
            <button style={{ padding: "7px 14px", borderRadius: 9, border: `1px solid ${C.border}`, background: "transparent", fontSize: 12, fontWeight: 600, color: C.muted, cursor: "pointer" }}>Reset</button>
          </div>

          {!hasLiveData && !dataLoading && (
            <div style={{ background: C.bgSage, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", marginBottom: 22, fontSize: 13, color: C.muted }}>
              Live market data is syncing — the weekly refresh has not yet populated this database. The dashboard below will populate automatically once the first sync completes.
            </div>
          )}

          {/* KPI cards */}
          <div id="mi-overview" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 26 }} className="mi-kpi-grid">
            {kpiCards.map(card => (
              <div key={card.label} style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 18px", boxShadow: "0 2px 10px rgba(27,94,74,0.05)" }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: C.subtle, marginBottom: 8 }}>{card.label}</p>
                <p style={{ fontSize: 21, fontWeight: 800, color: C.text, margin: "0 0 6px" }}>{card.value}</p>
                <p style={{ fontSize: 10.5, color: C.gold, fontWeight: 600 }}>Source: {card.source}</p>
              </div>
            ))}
          </div>

          {/* Two-column: table + map */}
          <div id="mi-areas" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 30, alignItems: "start" }} className="mi-split-grid">
            {/* LEFT — Area Performance table */}
            <div style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "16px 18px 12px", borderBottom: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: "0 0 2px", fontFamily: "'Georgia', serif" }}>Area Performance</p>
                <p style={{ fontSize: 11.5, color: C.muted }}>Compare key metrics across Dubai&apos;s top STR investment areas.</p>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: C.bgSage, textAlign: "left" }}>
                      {[
                        { k: "area" as SortKey, label: "Area" },
                        { k: "sales" as SortKey, label: "Sales" },
                        { k: "rentals" as SortKey, label: "Rentals" },
                        { k: "sqft" as SortKey, label: "AED/sqft" },
                        { k: "yield" as SortKey, label: "Yield" },
                        { k: "adr" as SortKey, label: "ADR" },
                        { k: "occ" as SortKey, label: "Occ" },
                        { k: "revpar" as SortKey, label: "RevPAR" },
                      ].map(h => (
                        <th
                          key={h.k}
                          onClick={() => toggleSort(h.k)}
                          style={{ padding: "10px 12px", fontWeight: 700, color: C.muted, whiteSpace: "nowrap", borderBottom: `1px solid ${C.border}`, cursor: "pointer", userSelect: "none" }}
                        >
                          {h.label}{sortKey === h.k ? (sortDir === 1 ? " ↑" : " ↓") : ""}
                        </th>
                      ))}
                      <th style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }} />
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAreas.map(row => {
                      const approx = APPROX_STR_AREAS.has(row.area);
                      return (
                        <tr
                          key={row.area}
                          onClick={() => setSelectedArea(row.area)}
                          onMouseEnter={() => setHoveredArea(row.area)}
                          onMouseLeave={() => setHoveredArea(null)}
                          style={{
                            borderBottom: `1px solid ${C.borderLight}`, cursor: "pointer",
                            background: selectedArea === row.area ? "rgba(27,94,74,0.06)" : "transparent",
                          }}
                        >
                          <td style={{ padding: "10px 12px", fontWeight: 700, color: C.text, whiteSpace: "nowrap" }}>
                            {row.area}
                            {approx && <span style={{ marginLeft: 5, fontSize: 8.5, fontWeight: 700, color: C.gold, border: `1px solid ${C.gold}`, borderRadius: 3, padding: "1px 4px" }}>APPROX.</span>}
                          </td>
                          <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>{fmtNum(row.sales_transactions)}</td>
                          <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>{fmtNum(row.rental_transactions)}</td>
                          <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>{row.median_sale_price_per_sqft != null ? Math.round(row.median_sale_price_per_sqft).toLocaleString() : "—"}</td>
                          <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>{row.ltr_yield != null ? `${row.ltr_yield.toFixed(1)}%` : "—"}</td>
                          <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>{fmtAED(row.adr)}</td>
                          <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>{fmtPct(row.occupancy)}</td>
                          <td style={{ padding: "10px 12px", whiteSpace: "nowrap", fontWeight: 700, color: C.green }}>{fmtAED(row.revpar)}</td>
                          <td style={{ padding: "10px 12px", whiteSpace: "nowrap", color: C.gold }}>→</td>
                        </tr>
                      );
                    })}
                    {sortedAreas.length === 0 && (
                      <tr><td colSpan={9} style={{ padding: "26px 14px", textAlign: "center", color: C.muted }}>{dataLoading ? "Loading market data…" : "No live data yet."}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT — Schematic map */}
            <div style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 18px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: 0, fontFamily: "'Georgia', serif" }}>Dubai Area Map</p>
                <select
                  value={mapLayer}
                  onChange={e => setMapLayer(e.target.value as MapLayer)}
                  style={{ fontSize: 11.5, fontWeight: 600, padding: "6px 10px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text }}
                >
                  <option value="demand">STR Demand</option>
                  <option value="sales">Sales Activity</option>
                  <option value="rentals">Rental Activity</option>
                  <option value="adr">ADR</option>
                  <option value="occ">Occupancy</option>
                  <option value="revpar">RevPAR</option>
                </select>
              </div>

              <div style={{ position: "relative", flex: 1, minHeight: 340, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}` }}>
                <AreaMap
                  areaStats={areaStats}
                  mapLayer={mapLayer}
                  selectedArea={selectedArea}
                  onSelectArea={setSelectedArea}
                />
              </div>

              <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 11, color: C.muted, flexWrap: "wrap" }}>
                <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: C.green, marginRight: 5 }} />High demand</span>
                <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: C.gold, marginRight: 5 }} />Moderate demand</span>
                <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: "#B5B0A3", marginRight: 5 }} />Lower demand</span>
                <span style={{ marginLeft: "auto", color: C.subtle }}>Source: AirROI &amp; DLD · schematic map, not to scale</span>
              </div>
            </div>
          </div>

          {/* ── Four bottom cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 30 }} className="mi-split-grid">

            {/* Building Watchlist */}
            <div id="mi-watchlist" style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: 0, fontFamily: "'Georgia', serif" }}>STR Building Watchlist</p>
                <button onClick={() => scrollToId("mi-watchlist-full", "Building Watchlist")} style={{ fontSize: 11.5, fontWeight: 700, color: C.gold, background: "none", border: "none", cursor: "pointer" }}>View All</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {strBuildingWatchlist.slice(0, 3).map(b => (
                  <div key={b.building} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 10px", borderRadius: 12, background: C.bg }}>
                    <div style={{ width: 52, height: 44, borderRadius: 9, background: `linear-gradient(135deg, ${C.green}, ${C.greenDark})`, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 700, color: C.text, margin: "0 0 2px" }}>{b.building}</p>
                      <p style={{ fontSize: 10.5, color: C.muted, margin: 0 }}>{b.area}</p>
                    </div>
                    <button style={{ background: "none", border: "none", fontSize: 15, color: C.gold, cursor: "pointer" }} title="Bookmark">☆</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Trends */}
            <div id="mi-trends" style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: 0, fontFamily: "'Georgia', serif" }}>Market Trends — {selectedArea}</p>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                {([["adr", "ADR"], ["occ", "Occupancy"], ["revpar", "RevPAR"], ["sales", "Sales"], ["rentals", "Rentals"]] as const).map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setTrendMetric(k as any)}
                    style={{
                      padding: "5px 11px", borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: "pointer",
                      border: `1px solid ${trendMetric === k ? C.green : C.border}`,
                      background: trendMetric === k ? C.green : "transparent",
                      color: trendMetric === k ? "#fff" : C.muted,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {trendHistory.length <= 1 ? (
                <p style={{ fontSize: 12, color: C.muted }}>Only one reporting period stored so far — the chart will populate as weekly refreshes accumulate history.</p>
              ) : (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 130 }}>
                  {trendHistory.map(row => {
                    const field = trendMetric === "adr" ? row.adr : trendMetric === "occ" ? row.occupancy : trendMetric === "revpar" ? row.revpar : trendMetric === "sales" ? row.sales_transactions : row.rental_transactions;
                    const maxV = Math.max(...trendHistory.map(r => {
                      const f = trendMetric === "adr" ? r.adr : trendMetric === "occ" ? r.occupancy : trendMetric === "revpar" ? r.revpar : trendMetric === "sales" ? r.sales_transactions : r.rental_transactions;
                      return f ?? 0;
                    }), 1);
                    const h = field ? Math.max(6, (field / maxV) * 110) : 4;
                    return (
                      <div key={row.reporting_month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                        <div style={{ width: "100%", height: h, background: C.green, borderRadius: "4px 4px 0 0", opacity: field ? 0.85 : 0.15 }} />
                        <span style={{ fontSize: 9, color: C.subtle, whiteSpace: "nowrap" }}>{new Date(row.reporting_month).toLocaleDateString(undefined, { month: "short" })}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Performing Buildings */}
            <div id="mi-buildings" style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 18px" }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: "0 0 14px", fontFamily: "'Georgia', serif" }}>Top Performing Buildings <span style={{ fontSize: 11, fontWeight: 500, color: C.subtle }}>(by area RevPAR)</span></p>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {topBuildings.length === 0 && <p style={{ fontSize: 12, color: C.muted }}>Populates once STR data is synced for watchlist areas.</p>}
                {topBuildings.map((b, i) => (
                  <div key={b.building} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < topBuildings.length - 1 ? `1px solid ${C.borderLight}` : "none" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: C.gold, width: 14 }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 700, color: C.text, margin: 0 }}>{b.building}</p>
                      <p style={{ fontSize: 10.5, color: C.subtle, margin: 0 }}>{b.area}</p>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: C.green, whiteSpace: "nowrap" }}>{fmtAED(b.revpar)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Investment Opportunities */}
            <div id="mi-opportunities" style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 18px" }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: "0 0 14px", fontFamily: "'Georgia', serif" }}>Investment Opportunities</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { title: "Highest Yield", sub: highestYield ? `${highestYield.area} · ${highestYield.ltr_yield?.toFixed(1)}% LTR yield` : "Awaiting data" },
                  { title: "Rising Demand", sub: risingDemand ? `${risingDemand.area} · RevPAR ${fmtAED(risingDemand.revpar)}` : "Awaiting data" },
                  { title: "Undervalued Buildings", sub: undervalued ? `${undervalued.area} · AED ${Math.round(undervalued.median_sale_price_per_sqft ?? 0)}/sqft` : "Awaiting data" },
                  { title: "New / Emerging Areas", sub: emergingArea ? emergingArea.area : "Awaiting data" },
                ].map(o => (
                  <button
                    key={o.title}
                    onClick={() => router.push("/investment-research")}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", padding: "11px 12px", borderRadius: 11, background: C.bg, border: `1px solid ${C.border}`, cursor: "pointer" }}
                  >
                    <div>
                      <p style={{ fontSize: 12.5, fontWeight: 700, color: C.text, margin: "0 0 2px" }}>{o.title}</p>
                      <p style={{ fontSize: 10.5, color: C.muted, margin: 0 }}>{o.sub}</p>
                    </div>
                    <span style={{ color: C.gold, fontSize: 15 }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comparable Listings */}
          {hasLiveData && (
            <div id="mi-listings" style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 20px", marginBottom: 30 }}>
              <p style={{ fontSize: 17, fontWeight: 800, color: C.text, margin: "0 0 4px", fontFamily: "'Georgia', serif" }}>Comparable Listings — {selectedArea}</p>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>A sample of active listings AirROI tracks in this area, refreshed weekly.</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                {areaStats.map(a => (
                  <button
                    key={a.area}
                    onClick={() => setSelectedArea(a.area)}
                    style={{
                      padding: "7px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      border: `1px solid ${selectedArea === a.area ? C.green : C.border}`,
                      background: selectedArea === a.area ? C.green : C.bg,
                      color: selectedArea === a.area ? "#fff" : C.text,
                    }}
                  >
                    {a.area}
                  </button>
                ))}
              </div>
              {(() => {
                const listings = selectedRow?.sample_listings ?? [];
                if (listings.length === 0) return <p style={{ fontSize: 13, color: C.muted }}>No comparable listings stored for this area yet.</p>;
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                    {listings.map(l => (
                      <div key={l.listingId} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
                        {l.coverPhotoUrl && <img src={l.coverPhotoUrl} alt="" style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }} />}
                        <div style={{ padding: "12px 14px" }}>
                          <p style={{ fontSize: 12.5, fontWeight: 700, color: C.text, marginBottom: 6, lineHeight: 1.35 }}>{l.name ?? "Untitled listing"}</p>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 10.5, color: C.muted, marginBottom: 8 }}>
                            {l.bedrooms != null && <span>{l.bedrooms} BR</span>}
                            {l.rating != null && <span>★ {l.rating.toFixed(2)} ({fmtNum(l.numReviews)})</span>}
                            {l.professionalManagement && <span style={{ color: C.green, fontWeight: 700 }}>Pro Managed</span>}
                            {l.superhost && <span style={{ color: C.gold, fontWeight: 700 }}>Superhost</span>}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.subtle, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
                            <span>ADR {l.ttmAvgRate != null ? `AED ${Math.round(l.ttmAvgRate)}` : "—"}</span>
                            <span>Occ {l.ttmOccupancy != null ? `${Math.round(l.ttmOccupancy * 100)}%` : "—"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {areaStats.some(r => APPROX_STR_AREAS.has(r.area)) && (
            <p style={{ fontSize: 11.5, color: C.subtle, marginBottom: 30, lineHeight: 1.6 }}>
              <span style={{ fontWeight: 700, color: C.gold }}>APPROX.</span> — AirROI doesn&apos;t recognize these areas as named markets, so their STR figures (ADR, occupancy, RevPAR) are estimated from a sample of nearby listings rather than AirROI&apos;s own market summary. Treat as directional, not precise.
            </p>
          )}
        </main>
      </div>

      {/* ── Full Building Watchlist ── */}
      <section id="mi-watchlist-full" style={{ background: C.bgSage, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "64px 24px" }}>
          <SectionHeading eyebrow="Building Watchlist" title="STR Building Watchlist" sub="Buildings worth monitoring for STR potential based on location strength, guest appeal, furnishing upside, operator activity, and owner-side setup considerations." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
            {strBuildingWatchlist.map(b => (
              <div key={b.building} style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 20px 18px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 2 }}>{b.building}</p>
                    <p style={{ fontSize: 11, color: C.gold, fontWeight: 600 }}>{b.area}</p>
                  </div>
                  <ConfidencePill label={b.confidence} />
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{b.assetIntelView}</p>
                <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, flex: 1, marginBottom: 14 }}>{b.ownerInsight}</p>
                <div style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 12, borderTop: `1px solid ${C.borderLight}` }}>
                  <span style={{ fontSize: 11, color: C.muted }}>Best fit:</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.green }}>{b.bestFit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Area Opportunity Ranking ── */}
      <section style={{ background: C.ivory, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "64px 24px" }}>
          <SectionHeading eyebrow="Area Rankings" title="STR Area Opportunity Ranking" sub="Ranked using AssetIntel's directional STR opportunity model across guest demand, ADR potential, occupancy strength, seasonality, owner upside, and execution risk." />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
            {[
              { label: "85+ Premium Opportunity", color: C.green, bg: "rgba(27,94,74,0.10)" },
              { label: "75–84 Strong", color: C.greenLight, bg: "rgba(45,122,94,0.10)" },
              { label: "65–74 Selective", color: C.gold, bg: "rgba(184,138,68,0.10)" },
              { label: "Below 65 High Caution", color: "#C0392B", bg: "rgba(192,57,43,0.08)" },
            ].map(s => (
              <span key={s.label} style={{ fontSize: 11, fontWeight: 600, color: s.color, background: s.bg, padding: "3px 11px", borderRadius: 999 }}>{s.label}</span>
            ))}
          </div>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 18, overflow: "hidden", background: C.bg }}>
            <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 100px 160px 110px 110px", padding: "11px 20px", background: C.bgSage, borderBottom: `1px solid ${C.border}` }}>
              {["#", "Area", "Score", "Opportunity View", "Best Unit", "Confidence"].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>
              ))}
            </div>
            {strAreaOpportunityRanking.map((row, i) => (
              <div key={row.area} style={{ display: "grid", gridTemplateColumns: "36px 1fr 100px 160px 110px 110px", padding: "16px 20px", alignItems: "start", borderBottom: i < strAreaOpportunityRanking.length - 1 ? `1px solid ${C.borderLight}` : "none", background: i % 2 === 0 ? C.bg : C.ivory }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.muted, paddingTop: 2 }}>{row.rank}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{row.area}</p>
                  <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.55 }}>{row.ownerNote}</p>
                </div>
                <div style={{ paddingTop: 2 }}><ScorePill score={row.score} /></div>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.text, paddingTop: 4 }}>{row.opportunityView}</span>
                <span style={{ fontSize: 12, color: C.text, fontWeight: 600, paddingTop: 4 }}>{row.bestUnitType}</span>
                <div style={{ paddingTop: 2 }}><ConfidencePill label={row.confidence} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Market Signals ── */}
      <section style={{ background: C.bgSage, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "64px 24px" }}>
          <SectionHeading eyebrow="Signals To Watch" title="Market Signals To Watch" sub="STR performance is not only about location. Owners should review the signals that directly affect income, risk, and guest conversion." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            {marketSignals.map(s => (
              <div key={s.title} style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(27,94,74,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: C.green, opacity: 0.7 }} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>{s.title}</p>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scoring Methodology ── */}
      <section style={{ background: C.ivory, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "64px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }} className="methodology-grid">
            <div>
              <SectionHeading eyebrow="Scoring Methodology" title="How AssetIntel Scores STR Potential" sub="Our STR score combines market demand with practical owner-side factors that affect real net income." />
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 16 }}>AssetIntel does not rank properties only by headline revenue. We consider whether a unit can realistically perform after management fees, running costs, furnishing quality, seasonality, and operator execution.</p>
              <p style={{ fontSize: 13, color: C.subtle, lineHeight: 1.7 }}>Scores are directional and should be validated at unit level using building, unit size, floor, view, furnishing status, and cost assumptions.</p>
            </div>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              {strScoreMethodology.map((item, i) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", borderBottom: i < strScoreMethodology.length - 1 ? `1px solid ${C.borderLight}` : "none" }}>
                  <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{item.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 80, height: 4, background: C.bgSage, borderRadius: 99 }}>
                      <div style={{ width: `${(item.weight / 20) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.green} 0%, ${C.greenLight} 100%)`, borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.green, minWidth: 30, textAlign: "right" }}>{item.weight}%</span>
                  </div>
                </div>
              ))}
              <div style={{ padding: "11px 20px", background: C.bgSage, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Total</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.green }}>100%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <section style={{ background: C.bgSage }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 28px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>Important Research Note</p>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8, marginBottom: 12 }}>
              AssetIntel STR Market Intel combines Dubai Land Department transaction data, AirROI market intelligence, operator market signals, and AssetIntel&apos;s own owner-side scoring model. Public STR datasets can vary because each provider tracks different platforms, listings, filters, samples, and time periods. Rankings are directional and should be used as market research, not guaranteed income projections.
            </p>
            <p style={{ fontSize: 12, color: C.subtle, lineHeight: 1.7 }}>AssetIntel does not guarantee rental income or final STR performance.</p>
          </div>
        </div>
      </section>

      <ConsultationBanner />

      <footer style={{ background: C.green, padding: "28px 24px" }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ filter: "brightness(0) invert(1)", opacity: 0.9 }}>
            <AssetIntelLogo size={22} />
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>© {new Date().getFullYear()} AssetIntel. All rights reserved. · assetintel.ae</p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 1024px) {
          .mi-sidebar { display: none !important; }
          .mi-drawer-btn { display: inline-block !important; }
          .mi-drawer-overlay { display: block !important; }
          .mi-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .mi-split-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .mi-kpi-grid { grid-template-columns: 1fr !important; }
          .methodology-grid { grid-template-columns: 1fr !important; gap: 28px; }
        }
      `}</style>
    </div>
  );
}

// ── SHARED SUB-COMPONENTS ────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 85) return C.green;
  if (score >= 75) return C.greenLight;
  if (score >= 65) return C.gold;
  return "#C0392B";
}
function scoreBg(score: number) {
  if (score >= 85) return "rgba(27,94,74,0.10)";
  if (score >= 75) return "rgba(45,122,94,0.10)";
  if (score >= 65) return "rgba(184,138,68,0.10)";
  return "rgba(192,57,43,0.08)";
}
function scoreLabel(score: number) {
  if (score >= 85) return "Premium";
  if (score >= 75) return "Strong";
  if (score >= 65) return "Selective";
  return "High Caution";
}
function ScorePill({ score }: { score: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: scoreBg(score), borderRadius: 999, padding: "3px 10px" }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: scoreColor(score) }}>{score}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: scoreColor(score) }}>{scoreLabel(score)}</span>
    </span>
  );
}
function confidencePillColor(c: string) {
  if (c === "High") return C.green;
  if (c === "Medium-High") return C.greenLight;
  if (c === "Medium") return C.gold;
  return C.muted;
}
function confidencePillBg(c: string) {
  if (c === "High") return "rgba(27,94,74,0.08)";
  if (c === "Medium-High") return "rgba(45,122,94,0.08)";
  if (c === "Medium") return "rgba(184,138,68,0.08)";
  return "rgba(150,150,150,0.08)";
}
function ConfidencePill({ label }: { label: string }) {
  return (
    <span style={{ display: "inline-block", background: confidencePillBg(label), color: confidencePillColor(label), fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999, letterSpacing: "0.04em" }}>
      {label}
    </span>
  );
}
function SectionHeading({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 36 }}>
      {eyebrow && <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold, marginBottom: 10 }}>{eyebrow}</p>}
      <h2 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: "0 0 10px", fontFamily: "'Georgia', serif" }}>
        <span style={{ background: `linear-gradient(90deg, ${C.green} 0%, ${C.gold} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", display: "inline-block" }}>{title}</span>
      </h2>
      {sub && <p style={{ fontSize: 15, color: C.muted, maxWidth: 640, lineHeight: 1.65 }}>{sub}</p>}
    </div>
  );
}
