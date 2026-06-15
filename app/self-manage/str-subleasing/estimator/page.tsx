"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  runEstimator,
  getLTRMarketRent,
  VIEW_PREMIUMS,
  BUILDING_DIRECTORY,
  type UnitSize,
  type ViewType,
  type FurnishedStatus,
} from "@/lib/estimator";
import { BUILDINGS_DATABASE } from "@/lib/buildings-data";
import { getDLDBuildingList, type DLDBuildingEntry } from "@/lib/building-rents";
import { DLD_AREA_TO_COMMUNITY } from "@/lib/dld-area-map";

// ─── Constants ───────────────────────────────────────────────────────────────

const C = {
  primary: "#1B5E4A",
  bronze: "#B88A44",
  bg: "#FAFAF8",
  surface: "#FFFFFF",
  border: "#E0DDD8",
  text: "#1A1A1A",
  muted: "#6B6B6B",
  risk: {
    low: "#2D7A4F",
    medium: "#A37020",
    high: "#C25A1A",
    vhigh: "#B83232",
  },
};

const serif = "'Georgia', serif";

const stk = (c: string, w = 1.4) => ({
  stroke: c, strokeWidth: w, fill: "none",
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
});

// ─── Subleasing-eligible unit sizes (apartments only, max 3BR) ───────────────

const SUBLEASING_SIZES: { label: UnitSize; display: string }[] = [
  { label: "STU", display: "Studio" },
  { label: "1BR", display: "1 Bedroom" },
  { label: "2BR", display: "2 Bedroom" },
  { label: "3BR", display: "3 Bedroom" },
];

const VIEWS: ViewType[] = [
  "Burj Khalifa View",
  "Sea View",
  "Full Marina View",
  "City View",
  "Pool View",
  "Garden / Park View",
  "Standard View",
];

// ─── Area classification for sub-leasing suitability ────────────────────────

const PRIME_AREAS = [
  "dubai marina", "marina", "jumeirah beach residence", "jbr",
  "downtown dubai", "downtown", "palm jumeirah", "palm",
  "bluewaters", "emaar beachfront", "dubai harbour",
];
const STRONG_AREAS = [
  "business bay", "dubai creek harbour", "creek harbour",
  "difc", "city walk", "dubai hills", "jumeirah village circle", "jvc",
];

function getAreaTier(building: string, community?: string): "prime" | "strong" | "other" {
  const hay = [building, community ?? ""].join(" ").toLowerCase();
  if (PRIME_AREAS.some(a => hay.includes(a))) return "prime";
  if (STRONG_AREAS.some(a => hay.includes(a))) return "strong";
  return "other";
}

function getViewTier(view: ViewType): "premium" | "good" | "weak" {
  if (["Sea View", "Burj Khalifa View", "Full Marina View"].includes(view)) return "premium";
  if (["City View", "Pool View"].includes(view)) return "good";
  return "weak";
}

function getFloorTier(floor: number): "high" | "mid" | "low" {
  if (floor >= 20) return "high";
  if (floor >= 10) return "mid";
  return "low";
}

// ─── Risk calculation ────────────────────────────────────────────────────────

type RiskLevel = "Low" | "Medium" | "High" | "Very High";

function getRiskLevel(breakEvenOcc: number): RiskLevel {
  if (breakEvenOcc < 0.50) return "Low";
  if (breakEvenOcc < 0.65) return "Medium";
  if (breakEvenOcc < 0.80) return "High";
  return "Very High";
}

const RISK_COLOR: Record<RiskLevel, string> = {
  "Low": C.risk.low,
  "Medium": C.risk.medium,
  "High": C.risk.high,
  "Very High": C.risk.vhigh,
};

const RISK_BG: Record<RiskLevel, string> = {
  "Low": "#E8F5EE",
  "Medium": "#FEF3E2",
  "High": "#FEF0E8",
  "Very High": "#FDE8E8",
};

const RISK_DESC: Record<RiskLevel, string> = {
  "Low": "Break-even is well within realistic occupancy. You have meaningful buffer for slow months.",
  "Medium": "Achievable but requires consistent performance. One or two weak months can be absorbed.",
  "High": "Leaves little room for error. Vacancy in low season can quickly turn the unit unprofitable.",
  "Very High": "The rent you pay the landlord consumes most of your STR upside. Avoid unless you have confirmed demand.",
};

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconCheck = ({ color = C.primary }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8.5" stroke={color} strokeWidth="1.2" opacity="0.3" />
    <path d="M6.5 10L9 12.5L13.5 7.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconWarn = ({ color = C.risk.high }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 3L22 20H2L12 3Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M12 10V14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="17.5" r="0.8" fill={color} />
  </svg>
);

const IconX = ({ color = C.risk.vhigh }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8.5" stroke={color} strokeWidth="1.2" opacity="0.3" />
    <path d="M7 7L13 13M13 7L7 13" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconFloor = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...stk(color)}>
    <rect x="4" y="3" width="16" height="18" rx="1.5" />
    <path d="M4 8h16M4 13h16M4 18h16" />
    <path d="M9 3v5M15 3v5" />
  </svg>
);

const IconView = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...stk(color)}>
    <path d="M12 5C7 5 3 12 3 12s4 7 9 7 9-7 9-7-4-7-9-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconArea = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...stk(color)}>
    <path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const IconUnit = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...stk(color)}>
    <rect x="6" y="3" width="12" height="18" rx="1" />
    <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
  </svg>
);

const IconRisk = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...stk(color)}>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
    <path d="M12 9v4M12 16.5v.5" />
  </svg>
);

const IconCalc = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...stk(color)}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 7h8M8 11h3M13 11h3M8 15h3M13 15h3M8 19h3M13 19h3" />
  </svg>
);

// ─── DLD buildings list ───────────────────────────────────────────────────────

const DLD_BUILDINGS: DLDBuildingEntry[] = getDLDBuildingList();
const ALL_BUILDINGS = Array.from(
  new Set([...Object.keys(BUILDINGS_DATABASE), ...Object.keys(BUILDING_DIRECTORY)])
).sort();

// ─── Form ────────────────────────────────────────────────────────────────────

interface SublForm {
  buildingName: string;
  dldKey: string;
  dldArea: string;
  unitSize: UnitSize | "";
  floor: string;
  view: ViewType | "";
  monthlyRent: string;         // AED/month paid to landlord
  managementFeeMode: "self" | "operator";
  managementFeeCustom: string; // % when operator selected
}

// ─── Result ──────────────────────────────────────────────────────────────────

interface SublResult {
  annualSTRRevenue: number;
  annualNetBeforeRent: number;   // after mgmt + utilities + maintenance + furniture
  annualLandlordRent: number;
  annualNetProfit: number;
  avgOccupancy: number;
  avgADR: number;
  breakEvenOcc: number;
  riskLevel: RiskLevel;
  annualUtilities: number;
  annualMaintenance: number;
  annualFurniture: number;
  annualMgmtFee: number;
  ltrMarketRent: number;
  ltrSource: string;
  community: string;
  // Eligibility
  floorTier: "high" | "mid" | "low";
  viewTier: "premium" | "good" | "weak";
  areaTier: "prime" | "strong" | "other";
  unitTier: "ideal" | "good" | "marginal";
  // Monthly breakdown
  months: { month: string; revenue: number; landlordRent: number; netProfit: number; occupancy: number; adr: number }[];
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function SubleasingEstimatorPage() {
  const router = useRouter();
  const buildingRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [buildingSearch, setBuildingSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [result, setResult] = useState<SublResult | null>(null);
  const [ltrHint, setLtrHint] = useState<{ rent: number; source: string } | null>(null);

  const [form, setForm] = useState<SublForm>({
    buildingName: "",
    dldKey: "",
    dldArea: "",
    unitSize: "",
    floor: "",
    view: "",
    monthlyRent: "",
    managementFeeMode: "operator",
    managementFeeCustom: "20",
  });

  const set = (k: keyof SublForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (buildingRef.current && !buildingRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Pre-fill monthly rent from LTR market data when building + size are set
  useEffect(() => {
    if (!form.buildingName || !form.unitSize) { setLtrHint(null); return; }
    const ltr = getLTRMarketRent(form.buildingName, form.unitSize as UnitSize, undefined, form.dldKey || undefined, form.dldArea || undefined);
    const monthly = Math.round(ltr.rent / 12);
    setLtrHint({ rent: monthly, source: ltr.source });
    if (!form.monthlyRent) {
      set("monthlyRent", String(monthly));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.buildingName, form.unitSize]);

  // Autocomplete
  const q = buildingSearch.toLowerCase();
  const filteredDLD: DLDBuildingEntry[] = q.length >= 2
    ? DLD_BUILDINGS.filter(b => b.displayName.toLowerCase().includes(q)).slice(0, 8)
    : [];
  const filteredCurated = q.length >= 2
    ? ALL_BUILDINGS.filter(b =>
        b.toLowerCase().includes(q) &&
        !filteredDLD.some(d => d.displayName.toLowerCase() === b.toLowerCase())
      ).slice(0, Math.max(0, 8 - filteredDLD.length))
    : [];

  const communityDisplay = (() => {
    const dir = BUILDING_DIRECTORY[form.buildingName];
    if (dir) return dir.community;
    if (form.dldArea) return DLD_AREA_TO_COMMUNITY[form.dldArea] ?? form.dldArea;
    const db = BUILDINGS_DATABASE[form.buildingName];
    if (db) return db.area;
    return "";
  })();

  const mgmtFee = form.managementFeeMode === "self" ? 0
    : (Number(form.managementFeeCustom) || 20) / 100;

  const canCalculate = form.buildingName && form.unitSize && form.floor &&
    Number(form.floor) >= 1 && form.view && form.monthlyRent && Number(form.monthlyRent) > 0;

  function handleCalculate() {
    if (!canCalculate) return;
    const floor = Number(form.floor);
    const unitSize = form.unitSize as UnitSize;
    const annualLandlordRent = Number(form.monthlyRent) * 12;

    const est = runEstimator({
      propertyName: `${form.buildingName} · ${unitSize}`,
      buildingName: form.buildingName,
      unitSize,
      unitType: "Apartment",
      floor,
      view: form.view as ViewType,
      furnished: "Unfurnished" as FurnishedStatus, // sub-lessor furnishes the unit
      managementFee: mgmtFee,
      occStrategy: "LOCCHP",
      dldKey: form.dldKey || undefined,
      dldArea: form.dldArea || undefined,
    });

    const annualNetBeforeRent = est.annualNetToLandlord;
    const annualNetProfit = annualNetBeforeRent - annualLandlordRent;

    // Break-even occupancy: the OCC at which subleasingNet = 0
    // Net(x) = (Revenue - MgmtFee) × (x/avgOcc) - FixedCosts = LandlordRent
    // x_be = avgOcc × (LandlordRent + FixedCosts) / (Revenue - MgmtFee)
    const annualFixedCosts = est.annualUtilities + est.annualMaintenance + est.annualFurnitureAmort;
    const annualNetMinusMgmt = est.annualRevenue - est.annualManagementFee; // revenue after mgmt fee
    const breakEvenOcc = est.avgOccupancy * (annualLandlordRent + annualFixedCosts) / annualNetMinusMgmt;

    const riskLevel = getRiskLevel(breakEvenOcc);

    const floorTier = getFloorTier(floor);
    const viewTier = getViewTier(form.view as ViewType);
    const areaTier = getAreaTier(form.buildingName, communityDisplay);
    const unitTier = unitSize === "STU" || unitSize === "1BR" ? "ideal"
      : unitSize === "2BR" ? "good"
      : "marginal";

    const ltrMarket = getLTRMarketRent(form.buildingName, unitSize, undefined, form.dldKey || undefined, form.dldArea || undefined);
    const monthlyRentNum = Number(form.monthlyRent);

    const months = est.months.map(m => ({
      month: m.month,
      revenue: m.revenue,
      landlordRent: monthlyRentNum,
      netProfit: m.netToLandlord - monthlyRentNum,
      occupancy: m.occupancy,
      adr: m.adr,
    }));

    setResult({
      annualSTRRevenue: est.annualRevenue,
      annualNetBeforeRent,
      annualLandlordRent,
      annualNetProfit,
      avgOccupancy: est.avgOccupancy,
      avgADR: est.avgADR,
      breakEvenOcc,
      riskLevel,
      annualUtilities: est.annualUtilities,
      annualMaintenance: est.annualMaintenance,
      annualFurniture: est.annualFurnitureAmort,
      annualMgmtFee: est.annualManagementFee,
      ltrMarketRent: ltrMarket.rent / 12,
      ltrSource: ltrMarket.source,
      community: communityDisplay,
      floorTier,
      viewTier,
      areaTier,
      unitTier,
      months,
    });

    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  const fmt = (n: number) => Math.round(n).toLocaleString();
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  return (
    <main style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui, sans-serif" }}>

      {/* Nav bar */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: C.surface, padding: "16px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={() => router.push("/self-manage/str-subleasing")}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: C.primary, fontSize: "13px", fontWeight: 600, padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" {...stk(C.primary)}>
            <path d="M19 12H5M5 12L12 19M5 12L12 5" />
          </svg>
          STR Sub-Leasing
        </button>
        <span style={{ color: C.border, fontSize: "14px" }}>›</span>
        <span style={{ fontSize: "13px", color: C.muted }}>Risk Estimator</span>
      </div>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.primary}08 0%, ${C.bronze}0A 100%)`, borderBottom: `1px solid ${C.border}`, padding: "48px 24px 40px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: C.bronze, marginBottom: "12px" }}>STR SUB-LEASING RISK ESTIMATOR</div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 700, color: C.text, marginBottom: "14px", lineHeight: 1.2 }}>
            Is This Unit Viable to Sub-Lease?
          </h1>
          <p style={{ fontSize: "15px", color: C.muted, lineHeight: 1.7, maxWidth: "580px", marginBottom: "24px" }}>
            Sub-leasing only works when your STR revenue meaningfully exceeds the rent you pay the landlord.
            Enter the unit details and negotiated rent to see your break-even, risk score, and projected profit.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[
              { label: "Apartments Only · STU–3BR", ok: true },
              { label: "Mid/High Floor Required", ok: true },
              { label: "Premium View Required", ok: true },
              { label: "Risk Score Included", ok: true },
            ].map(({ label, ok }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "20px", padding: "5px 12px" }}>
                {ok && <IconCheck color={C.primary} />}
                <span style={{ fontSize: "12px", fontWeight: 600, color: C.text }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "36px 24px" }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "20px", padding: "clamp(24px, 4vw, 40px)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>

          {/* Building */}
          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: C.text, letterSpacing: "0.06em", marginBottom: "8px" }}>
              BUILDING / DEVELOPMENT
            </label>
            <div ref={buildingRef} style={{ position: "relative" }}>
              <input
                value={buildingSearch}
                onChange={e => {
                  setBuildingSearch(e.target.value);
                  setShowSuggestions(true);
                  if (!e.target.value) { set("buildingName", ""); set("dldKey", ""); set("dldArea", ""); }
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search by building name…"
                style={{ width: "100%", padding: "13px 16px", border: `1.5px solid ${form.buildingName ? C.primary : C.border}`, borderRadius: "10px", fontSize: "14px", color: C.text, background: C.bg, outline: "none", boxSizing: "border-box" }}
              />
              {form.buildingName && (
                <div style={{ marginTop: "6px", fontSize: "12px", color: C.muted }}>
                  {communityDisplay && <span style={{ color: C.primary, fontWeight: 600 }}>{communityDisplay}</span>}
                  {ltrHint && <span style={{ marginLeft: communityDisplay ? "6px" : 0 }}>· LTR market: AED {fmt(ltrHint.rent)}/mo ({ltrHint.source})</span>}
                </div>
              )}
              {showSuggestions && (filteredDLD.length > 0 || filteredCurated.length > 0) && (
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 50, maxHeight: "260px", overflowY: "auto" }}>
                  {filteredDLD.length > 0 && (
                    <>
                      <div style={{ padding: "8px 14px 4px", fontSize: "10px", fontWeight: 700, color: C.muted, letterSpacing: "0.1em" }}>DLD VERIFIED</div>
                      {filteredDLD.map(b => (
                        <div key={b.key} onClick={() => { set("buildingName", b.displayName); set("dldKey", b.key); set("dldArea", b.dldArea); setBuildingSearch(b.displayName); setShowSuggestions(false); set("monthlyRent", ""); }}
                          style={{ padding: "10px 14px", cursor: "pointer", fontSize: "13px", color: C.text, borderBottom: `1px solid ${C.border}` }}
                          onMouseEnter={e => (e.currentTarget.style.background = C.bg)}
                          onMouseLeave={e => (e.currentTarget.style.background = C.surface)}>
                          <div style={{ fontWeight: 600 }}>{b.displayName}</div>
                          <div style={{ fontSize: "11px", color: C.muted }}>{DLD_AREA_TO_COMMUNITY[b.dldArea] ?? b.dldArea}</div>
                        </div>
                      ))}
                    </>
                  )}
                  {filteredCurated.map(b => (
                    <div key={b} onClick={() => { set("buildingName", b); set("dldKey", ""); set("dldArea", ""); setBuildingSearch(b); setShowSuggestions(false); set("monthlyRent", ""); }}
                      style={{ padding: "10px 14px", cursor: "pointer", fontSize: "13px", color: C.text, borderBottom: `1px solid ${C.border}` }}
                      onMouseEnter={e => (e.currentTarget.style.background = C.bg)}
                      onMouseLeave={e => (e.currentTarget.style.background = C.surface)}>
                      {b}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Unit size */}
          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: C.text, letterSpacing: "0.06em", marginBottom: "8px" }}>
              UNIT SIZE
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {SUBLEASING_SIZES.map(({ label, display }) => {
                const active = form.unitSize === label;
                return (
                  <button key={label} onClick={() => { set("unitSize", label); set("monthlyRent", ""); }}
                    style={{ padding: "11px 8px", borderRadius: "10px", border: `1.5px solid ${active ? C.primary : C.border}`, background: active ? `${C.primary}0F` : C.bg, color: active ? C.primary : C.text, fontSize: "13px", fontWeight: active ? 700 : 500, cursor: "pointer", transition: "all 0.15s" }}>
                    {display}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: "11.5px", color: C.muted, marginTop: "6px" }}>Sub-leasing works best with Studio and 1BR — smaller units are easier to fill and have lower rent obligations.</p>
          </div>

          {/* Floor + View row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "20px", marginBottom: "28px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: C.text, letterSpacing: "0.06em", marginBottom: "8px" }}>
                FLOOR NUMBER
              </label>
              <input
                type="number" min="1" max="120"
                value={form.floor}
                onChange={e => set("floor", e.target.value)}
                placeholder="e.g. 22"
                style={{ width: "100%", padding: "13px 14px", border: `1.5px solid ${form.floor ? (Number(form.floor) >= 10 ? C.primary : C.risk.high) : C.border}`, borderRadius: "10px", fontSize: "14px", color: C.text, background: C.bg, outline: "none", boxSizing: "border-box" }}
              />
              {form.floor && Number(form.floor) < 10 && (
                <p style={{ fontSize: "11.5px", color: C.risk.high, marginTop: "5px" }}>
                  Floor {form.floor} is below the recommended minimum of 10 for sub-leasing.
                </p>
              )}
              {form.floor && Number(form.floor) >= 10 && Number(form.floor) < 20 && (
                <p style={{ fontSize: "11.5px", color: C.risk.medium, marginTop: "5px" }}>Mid floor — acceptable. Floor 20+ is stronger.</p>
              )}
              {form.floor && Number(form.floor) >= 20 && (
                <p style={{ fontSize: "11.5px", color: C.risk.low, marginTop: "5px" }}>High floor — excellent for STR pricing.</p>
              )}
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: C.text, letterSpacing: "0.06em", marginBottom: "8px" }}>
                VIEW
              </label>
              <select
                value={form.view}
                onChange={e => set("view", e.target.value)}
                style={{ width: "100%", padding: "13px 14px", border: `1.5px solid ${form.view ? (getViewTier(form.view as ViewType) === "weak" ? C.risk.high : C.primary) : C.border}`, borderRadius: "10px", fontSize: "14px", color: form.view ? C.text : C.muted, background: C.bg, outline: "none", boxSizing: "border-box", cursor: "pointer" }}>
                <option value="">Select view…</option>
                {VIEWS.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              {form.view && getViewTier(form.view as ViewType) === "weak" && (
                <p style={{ fontSize: "11.5px", color: C.risk.high, marginTop: "5px" }}>
                  Standard/garden views significantly limit your achievable nightly rate.
                </p>
              )}
              {form.view && getViewTier(form.view as ViewType) === "premium" && (
                <p style={{ fontSize: "11.5px", color: C.risk.low, marginTop: "5px" }}>Premium view — commands a strong nightly rate premium.</p>
              )}
            </div>
          </div>

          {/* Monthly rent */}
          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: C.text, letterSpacing: "0.06em", marginBottom: "8px" }}>
              MONTHLY RENT TO LANDLORD (AED)
            </label>
            <input
              type="number"
              value={form.monthlyRent}
              onChange={e => set("monthlyRent", e.target.value)}
              placeholder="e.g. 8500"
              style={{ width: "100%", padding: "13px 16px", border: `1.5px solid ${form.monthlyRent ? C.primary : C.border}`, borderRadius: "10px", fontSize: "14px", color: C.text, background: C.bg, outline: "none", boxSizing: "border-box" }}
            />
            {ltrHint && (
              <div style={{ marginTop: "8px", padding: "10px 14px", background: "#F5F0E8", borderRadius: "8px", border: "1px solid #E8D9BC" }}>
                <p style={{ fontSize: "12px", color: C.muted, margin: 0 }}>
                  Market LTR: <strong style={{ color: C.text }}>AED {fmt(ltrHint.rent)}/mo</strong> · {ltrHint.source}.
                  {" "}Landlords sub-leasing for STR typically charge 5–15% above market. Adjust accordingly.
                </p>
              </div>
            )}
          </div>

          {/* Management model */}
          <div style={{ marginBottom: "32px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: C.text, letterSpacing: "0.06em", marginBottom: "8px" }}>
              MANAGEMENT MODEL
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { mode: "self" as const, label: "Self-Managed", sub: "You handle operations · 0% fee" },
                { mode: "operator" as const, label: "With Operator", sub: "15–25% management fee" },
              ].map(({ mode, label, sub }) => {
                const active = form.managementFeeMode === mode;
                return (
                  <button key={mode} onClick={() => set("managementFeeMode", mode)}
                    style={{ padding: "14px", borderRadius: "10px", border: `1.5px solid ${active ? C.primary : C.border}`, background: active ? `${C.primary}0F` : C.bg, textAlign: "left", cursor: "pointer" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: active ? C.primary : C.text, marginBottom: "3px" }}>{label}</div>
                    <div style={{ fontSize: "11.5px", color: C.muted }}>{sub}</div>
                  </button>
                );
              })}
            </div>
            {form.managementFeeMode === "operator" && (
              <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                <label style={{ fontSize: "12px", color: C.muted, whiteSpace: "nowrap" }}>Operator fee:</label>
                <input
                  type="number" min="10" max="30"
                  value={form.managementFeeCustom}
                  onChange={e => set("managementFeeCustom", e.target.value)}
                  style={{ width: "80px", padding: "8px 12px", border: `1.5px solid ${C.border}`, borderRadius: "8px", fontSize: "13px", color: C.text, background: C.bg, outline: "none" }}
                />
                <span style={{ fontSize: "12px", color: C.muted }}>% of revenue</span>
              </div>
            )}
          </div>

          {/* Calculate button */}
          <button
            onClick={handleCalculate}
            disabled={!canCalculate}
            style={{ width: "100%", padding: "16px", background: canCalculate ? C.primary : C.border, color: "#fff", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: canCalculate ? "pointer" : "not-allowed", border: "none", transition: "all 0.2s" }}>
            Calculate Risk &amp; Profit →
          </button>
        </div>

        {/* ─── Results ──────────────────────────────────────────────────────── */}
        {result && (
          <div ref={resultsRef} style={{ marginTop: "36px" }}>

            {/* Property Viability */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "20px", padding: "28px 32px", marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: C.bronze, marginBottom: "16px" }}>PROPERTY VIABILITY CHECK</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
                {[
                  {
                    Icon: IconFloor,
                    label: "Floor Level",
                    value: `Floor ${form.floor}`,
                    pass: result.floorTier === "high" ? "pass" : result.floorTier === "mid" ? "warn" : "fail",
                    note: result.floorTier === "high" ? "High floor — premium pricing" : result.floorTier === "mid" ? "Mid floor — acceptable" : "Low floor — avoid for sub-leasing",
                  },
                  {
                    Icon: IconView,
                    label: "View Quality",
                    value: form.view,
                    pass: result.viewTier === "premium" ? "pass" : result.viewTier === "good" ? "warn" : "fail",
                    note: result.viewTier === "premium" ? "Premium view — strong nightly rate" : result.viewTier === "good" ? "Good view — adequate" : "Weak view — limits STR rates",
                  },
                  {
                    Icon: IconArea,
                    label: "Area Demand",
                    value: result.community || form.buildingName,
                    pass: result.areaTier === "prime" ? "pass" : result.areaTier === "strong" ? "warn" : "fail",
                    note: result.areaTier === "prime" ? "Prime STR area — high demand" : result.areaTier === "strong" ? "Strong area — good demand" : "Weak area — low STR demand",
                  },
                  {
                    Icon: IconUnit,
                    label: "Unit Size",
                    value: form.unitSize,
                    pass: result.unitTier === "ideal" ? "pass" : result.unitTier === "good" ? "warn" : "fail",
                    note: result.unitTier === "ideal" ? "Ideal size for sub-leasing" : result.unitTier === "good" ? "Workable — good liquidity" : "Larger units are harder to fill",
                  },
                ].map(({ Icon, label, value, pass, note }) => {
                  const color = pass === "pass" ? C.risk.low : pass === "warn" ? C.risk.medium : C.risk.vhigh;
                  const bg = pass === "pass" ? "#E8F5EE" : pass === "warn" ? "#FEF3E2" : "#FDE8E8";
                  return (
                    <div key={label} style={{ background: bg, borderRadius: "12px", padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <Icon color={color} />
                        <span style={{ fontSize: "11px", fontWeight: 700, color, letterSpacing: "0.06em" }}>{label.toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: C.text, marginBottom: "4px", wordBreak: "break-word" }}>{value}</div>
                      <div style={{ fontSize: "11.5px", color: C.muted, lineHeight: 1.4 }}>{note}</div>
                      <div style={{ marginTop: "10px" }}>
                        {pass === "pass" ? <IconCheck color={color} /> : pass === "warn" ? <IconWarn color={color} /> : <IconX color={color} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risk Scorecard */}
            <div style={{ background: C.surface, border: `2px solid ${RISK_COLOR[result.riskLevel]}`, borderRadius: "20px", padding: "28px 32px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: C.bronze, marginBottom: "8px" }}>RISK ASSESSMENT</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <IconRisk color={RISK_COLOR[result.riskLevel]} />
                    <h2 style={{ fontFamily: serif, fontSize: "28px", fontWeight: 700, color: RISK_COLOR[result.riskLevel], margin: 0 }}>
                      {result.riskLevel} Risk
                    </h2>
                  </div>
                </div>
                <div style={{ background: RISK_BG[result.riskLevel], borderRadius: "14px", padding: "16px 22px", textAlign: "center", minWidth: "160px" }}>
                  <div style={{ fontSize: "11px", color: C.muted, fontWeight: 600, marginBottom: "4px" }}>BREAK-EVEN OCCUPANCY</div>
                  <div style={{ fontSize: "36px", fontWeight: 700, color: RISK_COLOR[result.riskLevel], fontFamily: serif }}>
                    {pct(result.breakEvenOcc)}
                  </div>
                  <div style={{ fontSize: "11px", color: C.muted }}>Realistic avg: {pct(result.avgOccupancy)}</div>
                </div>
              </div>

              {/* Break-even bar */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: C.muted, marginBottom: "6px" }}>
                  <span>0%</span>
                  <span>50%</span>
                  <span>65%</span>
                  <span>80%</span>
                  <span>100%</span>
                </div>
                <div style={{ position: "relative", height: "10px", background: C.border, borderRadius: "5px", overflow: "hidden" }}>
                  {/* Zone bands */}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #2D7A4F22 0%, #2D7A4F22 50%, #A3702022 50%, #A3702022 65%, #C25A1A22 65%, #C25A1A22 80%, #B8323222 80%, #B8323222 100%)" }} />
                  {/* Break-even marker */}
                  <div style={{ position: "absolute", top: 0, bottom: 0, left: `${Math.min(result.breakEvenOcc * 100, 100)}%`, width: "3px", background: RISK_COLOR[result.riskLevel], transform: "translateX(-50%)", borderRadius: "2px" }} />
                  {/* Realistic OCC marker */}
                  <div style={{ position: "absolute", top: "-2px", bottom: "-2px", left: `${Math.min(result.avgOccupancy * 100, 100)}%`, width: "3px", background: C.primary, transform: "translateX(-50%)", borderRadius: "2px" }} />
                </div>
                <div style={{ display: "flex", gap: "16px", marginTop: "8px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: C.muted }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: RISK_COLOR[result.riskLevel] }} />
                    Break-even at {pct(result.breakEvenOcc)}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: C.muted }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: C.primary }} />
                    Projected occupancy {pct(result.avgOccupancy)}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: "13.5px", color: C.text, lineHeight: 1.7, margin: 0, padding: "14px 18px", background: RISK_BG[result.riskLevel], borderRadius: "10px" }}>
                {RISK_DESC[result.riskLevel]}
              </p>
            </div>

            {/* P&L Summary */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "20px", padding: "28px 32px", marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: C.bronze, marginBottom: "20px" }}>ANNUAL P&amp;L FORECAST</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                {[
                  { label: "STR Gross Revenue", value: `AED ${fmt(result.annualSTRRevenue)}`, sub: `Avg ADR: AED ${fmt(result.avgADR)}/night`, color: C.primary },
                  { label: "Landlord Rent (annual)", value: `− AED ${fmt(result.annualLandlordRent)}`, sub: `AED ${fmt(result.annualLandlordRent / 12)}/month fixed`, color: C.risk.high },
                  { label: "Operator Fee", value: `− AED ${fmt(result.annualMgmtFee)}`, sub: form.managementFeeMode === "self" ? "Self-managed" : `${form.managementFeeCustom}% of revenue`, color: C.muted },
                  { label: "Utilities & Costs", value: `− AED ${fmt(result.annualUtilities + result.annualMaintenance + result.annualFurniture)}`, sub: "DEWA, AC, maintenance, furnishing", color: C.muted },
                ].map(({ label, value, sub, color }) => (
                  <div key={label} style={{ padding: "16px", background: C.bg, borderRadius: "12px", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: "11.5px", color: C.muted, marginBottom: "6px" }}>{label}</div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color, fontFamily: serif, marginBottom: "3px" }}>{value}</div>
                    <div style={{ fontSize: "11px", color: C.muted }}>{sub}</div>
                  </div>
                ))}
              </div>

              {/* Net profit */}
              <div style={{ borderTop: `2px solid ${result.annualNetProfit >= 0 ? C.risk.low : C.risk.vhigh}`, paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: C.muted, marginBottom: "4px" }}>Estimated Annual Net Profit</div>
                  <div style={{ fontFamily: serif, fontSize: "32px", fontWeight: 700, color: result.annualNetProfit >= 0 ? C.risk.low : C.risk.vhigh }}>
                    {result.annualNetProfit >= 0 ? "+" : ""}AED {fmt(result.annualNetProfit)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "12px", color: C.muted, marginBottom: "4px" }}>vs. Landlord Rent Paid</div>
                  <div style={{ fontFamily: serif, fontSize: "20px", fontWeight: 700, color: C.text }}>
                    {result.annualNetProfit >= 0
                      ? `+${Math.round((result.annualNetProfit / result.annualLandlordRent) * 100)}% margin`
                      : `${Math.round((result.annualNetProfit / result.annualLandlordRent) * 100)}% shortfall`}
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly table */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "20px", overflow: "hidden" }}>
              <div style={{ padding: "22px 28px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: C.bronze }}>MONTHLY CASH FLOW</div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: C.bg }}>
                      {["Month", "STR Revenue", "Landlord Rent", "Occupancy", "Avg Rate/Night", "Net Profit"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: h === "Month" ? "left" : "right", fontSize: "11px", fontWeight: 700, color: C.muted, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.months.map((m, i) => (
                      <tr key={m.month} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? C.surface : C.bg }}>
                        <td style={{ padding: "10px 16px", fontWeight: 600, color: C.text }}>{m.month}</td>
                        <td style={{ padding: "10px 16px", textAlign: "right", color: C.primary }}>AED {fmt(m.revenue)}</td>
                        <td style={{ padding: "10px 16px", textAlign: "right", color: C.risk.high }}>− AED {fmt(m.landlordRent)}</td>
                        <td style={{ padding: "10px 16px", textAlign: "right", color: C.text }}>{pct(m.occupancy)}</td>
                        <td style={{ padding: "10px 16px", textAlign: "right", color: C.text }}>AED {fmt(m.adr)}</td>
                        <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: 700, color: m.netProfit >= 0 ? C.risk.low : C.risk.vhigh }}>
                          {m.netProfit >= 0 ? "+" : ""}AED {fmt(m.netProfit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: "14px 28px", borderTop: `1px solid ${C.border}`, fontSize: "11.5px", color: C.muted, lineHeight: 1.6 }}>
                Monthly net profit is after landlord rent, management fee, DEWA, AC, internet, maintenance, and furniture amortisation.
                Revenue follows Dubai STR seasonal patterns (winter peak, summer low).
              </div>
            </div>

            {/* CTA */}
            <div style={{ marginTop: "28px", padding: "28px 32px", background: `linear-gradient(135deg, ${C.primary}0C 0%, ${C.bronze}0E 100%)`, border: `1px solid ${C.border}`, borderRadius: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ fontFamily: serif, fontSize: "18px", fontWeight: 700, color: C.text, marginBottom: "6px" }}>
                  Want a structured plan to execute?
                </div>
                <p style={{ fontSize: "13.5px", color: C.muted, margin: 0 }}>
                  The Sub-Leasing Playbook covers landlord negotiation, DET compliance, setup roadmap, and operating systems.
                </p>
              </div>
              <button onClick={() => router.push("/self-manage/str-subleasing")}
                style={{ padding: "13px 24px", background: C.bronze, color: "#fff", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", border: "none", whiteSpace: "nowrap" }}>
                View Playbook →
              </button>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
