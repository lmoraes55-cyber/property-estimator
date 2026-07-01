"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  runEstimator,
  getLTRMarketRent,
  type UnitSize,
  type ViewType,
  type FurnishedStatus,
} from "@/lib/estimator";
import {
  getSubleaseAreaSuitability,
  bumpRisk,
  getRecommendation,
  type AreaSuitability,
  type AreaSuitabilityResult,
  type Recommendation,
} from "@/lib/sublease-area-suitability";
import {
  getBuildingSTRProfile,
  getBuildingOccAdj,
  type BuildingSTRProfile,
} from "@/lib/sublease-str-demand";

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  primary: "#1B5E4A",
  bronze: "#B88A44",
  bg: "#F8F4EE",
  surface: "#FFFFFF",
  border: "#E6E1D8",
  text: "#1A1A1A",
  muted: "#6B6B6B",
  risk: { low: "#2D7A4F", medium: "#A37020", high: "#C25A1A", vhigh: "#B83232" },
};

const serif = "'Georgia', serif";
const stk = (c: string, w = 1.4) => ({ stroke: c, strokeWidth: w, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

// ─── Types ────────────────────────────────────────────────────────────────────

type FurnishingQuality = "Basic" | "Standard" | "Premium" | "Luxury";
type GuestAppealLevel = "Excellent" | "Good" | "Average" | "Weak";
type RiskLevel = "Low" | "Medium" | "High" | "Very High";

// ─── Config ───────────────────────────────────────────────────────────────────

const FURNISHING_CONFIG: Record<FurnishingQuality, { revMult: number; display: string; tier: "pass" | "warn" | "fail"; color: string; bg: string }> = {
  Basic:    { revMult: 0.82, display: "Basic",             tier: "fail", color: "#B83232", bg: "#FDE8E8" },
  Standard: { revMult: 0.93, display: "Standard",          tier: "warn", color: "#C25A1A", bg: "#FEF0E8" },
  Premium:  { revMult: 1.00, display: "Premium",           tier: "pass", color: "#2D7A4F", bg: "#E8F5EE" },
  Luxury:   { revMult: 1.10, display: "Luxury / Designer", tier: "pass", color: "#1B5E4A", bg: "#D0EDE0" },
};

const GUEST_APPEAL_CFG: Record<GuestAppealLevel, { color: string; bg: string; border: string }> = {
  Excellent: { color: "#1B5E4A", bg: "#D0EDE0", border: "#2D7A4F" },
  Good:      { color: "#2D7A4F", bg: "#E8F5EE", border: "#2D7A4F" },
  Average:   { color: "#A37020", bg: "#FEF3E2", border: "#A37020" },
  Weak:      { color: "#B83232", bg: "#FDE8E8", border: "#B83232" },
};

const RISK_COLOR: Record<RiskLevel, string> = { "Low": "#2D7A4F", "Medium": "#A37020", "High": "#C25A1A", "Very High": "#B83232" };
const RISK_BG:    Record<RiskLevel, string> = { "Low": "#E8F5EE", "Medium": "#FEF3E2", "High": "#FEF0E8", "Very High": "#FDE8E8" };
const RISK_DESC:  Record<RiskLevel, string> = {
  "Low": "Break-even is well within realistic occupancy. You have meaningful buffer for slow months.",
  "Medium": "Achievable but requires consistent performance. One or two weak months can be absorbed.",
  "High": "Leaves little room for error. Vacancy in low season can quickly turn the unit unprofitable.",
  "Very High": "The rent you pay the landlord consumes most of your STR upside. Avoid unless you have confirmed demand.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getViewTier(view: ViewType): "premium" | "good" | "weak" {
  if (["Sea View", "Burj Khalifa View", "Full Marina View"].includes(view)) return "premium";
  if (["City View", "Pool View"].includes(view)) return "good";
  return "weak";
}

function getFloorTier(floor: number): "high" | "mid" | "low" {
  return floor >= 20 ? "high" : floor >= 10 ? "mid" : "low";
}

function getAreaTier(building: string, community: string): "prime" | "strong" | "other" {
  const hay = [building, community].join(" ").toLowerCase();
  const prime = ["dubai marina", "marina", "jumeirah beach residence", "jbr", "downtown dubai", "downtown", "palm jumeirah", "palm", "bluewaters", "emaar beachfront", "dubai harbour"];
  const strong = ["business bay", "dubai creek harbour", "creek harbour", "difc", "city walk", "dubai hills", "jumeirah village circle", "jvc"];
  if (prime.some(a => hay.includes(a))) return "prime";
  if (strong.some(a => hay.includes(a))) return "strong";
  return "other";
}

function getRiskLevel(be: number): RiskLevel {
  if (be < 0.50) return "Low";
  if (be < 0.65) return "Medium";
  if (be < 0.80) return "High";
  return "Very High";
}

function getGuestAppeal(
  furnishing: FurnishingQuality,
  viewTier: "premium" | "good" | "weak",
  floorTier: "high" | "mid" | "low",
  buildingProfile: BuildingSTRProfile | null,
  unitSize: UnitSize,
): { level: GuestAppealLevel; score: number } {
  let score = 0;
  score += { Basic: 0, Standard: 1, Premium: 2, Luxury: 3 }[furnishing];
  score += { premium: 2, good: 1, weak: 0 }[viewTier];
  score += { high: 2, mid: 1, low: 0 }[floorTier];
  score += !buildingProfile ? 1 : buildingProfile.demandTier === "high" ? 2 : buildingProfile.demandTier === "moderate" ? 1 : 0;
  score += (unitSize === "STU" || unitSize === "1BR") ? 2 : unitSize === "2BR" ? 1 : 0;
  const level: GuestAppealLevel = score >= 9 ? "Excellent" : score >= 6 ? "Good" : score >= 4 ? "Average" : "Weak";
  return { level, score };
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconCheck = ({ color = C.primary, size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
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

// ─── Result types ─────────────────────────────────────────────────────────────

interface SublResult {
  annualSTRRevenue: number;
  annualNetBeforeRent: number;
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
  community: string;
  floorTier: "high" | "mid" | "low";
  viewTier: "premium" | "good" | "weak";
  areaTier: "prime" | "strong" | "other";
  unitTier: "ideal" | "good" | "marginal";
  months: { month: string; revenue: number; landlordRent: number; netProfit: number; occupancy: number; adr: number }[];
  areaSuitability: AreaSuitability;
  matchedArea: string;
  recommendation: Recommendation;
  buildingProfile: BuildingSTRProfile | null;
  furnishingQuality: FurnishingQuality;
  furnishingTier: "pass" | "warn" | "fail";
  guestAppeal: GuestAppealLevel;
  guestAppealScore: number;
  // echoed inputs
  buildingName: string;
  unitSize: UnitSize;
  floor: number;
  view: ViewType;
  monthlyRent: number;
  mgmtFeeMode: "self" | "operator";
  mgmtFeeCustom: number;
}

type Calc =
  | { type: "blocked"; blockResult: AreaSuitabilityResult }
  | { type: "result"; result: SublResult };

// ─── Core calculation ─────────────────────────────────────────────────────────

function computeResult(params: {
  buildingName: string; dldKey?: string; dldArea?: string;
  unitSize: UnitSize; floor: number; view: ViewType;
  furnishingQuality: FurnishingQuality; monthlyRent: number;
  mgmtFee: number; communityDisplay: string;
  mgmtFeeMode: "self" | "operator"; mgmtFeeCustom: number;
}): Calc {
  const { buildingName, dldKey, dldArea, unitSize, floor, view, furnishingQuality,
          monthlyRent, mgmtFee, communityDisplay, mgmtFeeMode, mgmtFeeCustom } = params;
  const annualLandlordRent = monthlyRent * 12;
  const furnishingCfg = FURNISHING_CONFIG[furnishingQuality];

  // Stage 1: Area gate
  const areaSuitabilityResult = getSubleaseAreaSuitability(buildingName, communityDisplay, dldArea);
  const { suitability: areaSuitability, matchedArea } = areaSuitabilityResult;
  if (areaSuitability === "avoid") return { type: "blocked", blockResult: areaSuitabilityResult };

  // Stage 2: Building profile
  const buildingProfile = getBuildingSTRProfile(buildingName);
  const buildingOccAdj = buildingProfile ? getBuildingOccAdj(buildingProfile) : 0;

  // Stage 3: Estimator
  const est = runEstimator({
    propertyName: `${buildingName} · ${unitSize}`,
    buildingName,
    unitSize,
    unitType: "Apartment",
    floor,
    view,
    furnished: "Unfurnished" as FurnishedStatus,
    managementFee: mgmtFee,
    occStrategy: "LOCCHP",
    dldKey,
    dldArea,
    mode: "SUBLEASE_RISK",
    buildingOccAdj,
    furnishingRevenueMult: furnishingCfg.revMult,
  });

  const annualNetBeforeRent = est.annualNetToLandlord;
  const annualNetProfit = annualNetBeforeRent - annualLandlordRent;
  const annualFixedCosts = est.annualUtilities + est.annualMaintenance + est.annualFurnitureAmort;
  const annualNetMinusMgmt = est.annualRevenue - est.annualManagementFee;
  const breakEvenOcc = est.avgOccupancy * (annualLandlordRent + annualFixedCosts) / annualNetMinusMgmt;

  const floorTier = getFloorTier(floor);
  const viewTier  = getViewTier(view);
  const areaTier  = getAreaTier(buildingName, communityDisplay);
  const unitTier  = unitSize === "STU" || unitSize === "1BR" ? "ideal" : unitSize === "2BR" ? "good" : "marginal";

  // Stage 4: Guest appeal
  const { level: guestAppeal, score: guestAppealScore } = getGuestAppeal(furnishingQuality, viewTier, floorTier, buildingProfile, unitSize);
  const furnishingTier = furnishingCfg.tier;

  // Stage 5: Risk
  let riskLevel = getRiskLevel(breakEvenOcc);
  if (areaSuitability === "not_recommended") {
    riskLevel = bumpRisk(riskLevel);
  } else if (areaSuitability === "caution") {
    const signals = viewTier === "weak" || unitSize === "2BR" || unitSize === "3BR" || breakEvenOcc > 0.65 || furnishingQuality === "Basic" || furnishingQuality === "Standard";
    if (signals) riskLevel = bumpRisk(riskLevel);
  }
  if (furnishingQuality === "Basic") riskLevel = bumpRisk(riskLevel);
  if (furnishingQuality === "Standard" && areaSuitability === "caution") riskLevel = bumpRisk(riskLevel);
  if (viewTier === "weak" && (furnishingQuality === "Basic" || furnishingQuality === "Standard")) riskLevel = bumpRisk(riskLevel);

  // Stage 6: Hard stops
  const isHardAvoid =
    (areaSuitability === "not_recommended" && breakEvenOcc > 0.65) ||
    (areaSuitability === "not_recommended" && (unitSize === "2BR" || unitSize === "3BR")) ||
    (furnishingQuality === "Basic" && viewTier === "weak") ||
    (furnishingQuality === "Basic" && areaSuitability === "not_recommended") ||
    (viewTier === "weak" && areaSuitability === "not_recommended") ||
    (viewTier === "weak" && (unitSize === "2BR" || unitSize === "3BR") && breakEvenOcc > 0.55);

  const furnishingCap: Recommendation | undefined = furnishingQuality === "Basic" ? "Negotiate" : undefined;
  const recommendation = getRecommendation(riskLevel, areaSuitability, isHardAvoid, furnishingCap);

  const ltrMarket = getLTRMarketRent(buildingName, unitSize, undefined, dldKey, dldArea);

  const months = est.months.map(m => ({
    month: m.month,
    revenue: m.revenue,
    landlordRent: monthlyRent,
    netProfit: m.netToLandlord - monthlyRent,
    occupancy: m.occupancy,
    adr: m.adr,
  }));

  return {
    type: "result",
    result: {
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
      community: communityDisplay,
      floorTier, viewTier, areaTier, unitTier,
      months,
      areaSuitability, matchedArea, recommendation,
      buildingProfile,
      furnishingQuality, furnishingTier,
      guestAppeal, guestAppealScore,
      buildingName, unitSize, floor, view,
      monthlyRent, mgmtFeeMode, mgmtFeeCustom,
    },
  };
}

// ─── Inner result page ────────────────────────────────────────────────────────

function ResultInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const buildingName    = searchParams.get("b") ?? "";
  const dldKey          = searchParams.get("dk") ?? undefined;
  const dldArea         = searchParams.get("da") ?? undefined;
  const unitSize        = (searchParams.get("sz") ?? "") as UnitSize;
  const floorStr        = searchParams.get("fl") ?? "";
  const view            = (searchParams.get("vw") ?? "") as ViewType;
  const fq              = (searchParams.get("fq") ?? "Premium") as FurnishingQuality;
  const monthlyRentStr  = searchParams.get("mr") ?? "";
  const mgmtMode        = (searchParams.get("mm") ?? "operator") as "self" | "operator";
  const mgmtFeeStr      = searchParams.get("mf") ?? "20";
  const community       = searchParams.get("cm") ?? "";

  const floor       = Number(floorStr);
  const monthlyRent = Number(monthlyRentStr);
  const mgmtFeeCustom = Number(mgmtFeeStr) || 20;
  const mgmtFee     = mgmtMode === "self" ? 0 : mgmtFeeCustom / 100;

  const hasRequiredParams = !!(buildingName && unitSize && floor >= 1 && view && monthlyRent > 0);

  const calc = useMemo<Calc | null>(() => {
    if (!hasRequiredParams) return null;
    try {
      return computeResult({ buildingName, dldKey, dldArea, unitSize, floor, view, furnishingQuality: fq, monthlyRent, mgmtFee, communityDisplay: community, mgmtFeeMode: mgmtMode, mgmtFeeCustom });
    } catch {
      return null;
    }
  }, [buildingName, dldKey, dldArea, unitSize, floor, view, fq, monthlyRent, mgmtFee, community, mgmtMode, mgmtFeeCustom, hasRequiredParams]);

  const fmt = (n: number) => Math.round(n).toLocaleString();
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  // URL to go back to estimator with form pre-filled
  const backParams = new URLSearchParams();
  if (buildingName) backParams.set("b", buildingName);
  if (dldKey) backParams.set("dk", dldKey);
  if (dldArea) backParams.set("da", dldArea);
  if (unitSize) backParams.set("sz", unitSize);
  if (floorStr) backParams.set("fl", floorStr);
  if (view) backParams.set("vw", view);
  backParams.set("fq", fq);
  if (monthlyRentStr) backParams.set("mr", monthlyRentStr);
  backParams.set("mm", mgmtMode);
  backParams.set("mf", mgmtFeeStr);
  if (community) backParams.set("cm", community);
  const editUrl = `/self-manage/str-subleasing/estimator?${backParams.toString()}`;

  // ── Empty / invalid state ──
  if (!hasRequiredParams || !calc) {
    return (
      <main style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: "420px", padding: "40px 24px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: `${C.primary}12`, border: `1px solid ${C.primary}30`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke={C.primary} strokeWidth="1.6" strokeLinejoin="round" /></svg>
          </div>
          <h1 style={{ fontFamily: serif, fontSize: "22px", fontWeight: 700, color: C.text, marginBottom: "10px" }}>No Analysis to Show</h1>
          <p style={{ fontSize: "14px", color: C.muted, lineHeight: 1.65, marginBottom: "24px" }}>Fill in all property details in the estimator to generate your STR sub-leasing risk report.</p>
          <button
            onClick={() => router.push("/self-manage/str-subleasing/estimator")}
            style={{ padding: "14px 28px", background: `linear-gradient(135deg, ${C.primary} 0%, #0F3E33 100%)`, color: "#fff", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", border: "none" }}>
            Start Estimator →
          </button>
        </div>
      </main>
    );
  }

  // ── Blocked area state ──
  if (calc.type === "blocked") {
    const { blockResult } = calc;
    return (
      <main style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px 80px" }}>

          <button onClick={() => router.push(editUrl)} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: C.surface, border: `1px solid ${C.border}`, color: C.primary, fontSize: "12px", fontWeight: 600, padding: "6px 14px", borderRadius: "8px", cursor: "pointer", marginBottom: "32px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={C.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Edit Inputs
          </button>

          {/* Hero — Avoid */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", color: C.bronze, marginBottom: "10px" }}>ASSETINTEL STR SUB-LEASING RISK REPORT</div>
            <h1 style={{ fontFamily: serif, fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 700, color: C.text, marginBottom: "16px", lineHeight: 1.15 }}>{buildingName}</h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
              {[community, unitSize, `Floor ${floor}`, view, fq + " Furnishing", `AED ${fmt(monthlyRent)}/mo`].filter(Boolean).map(chip => (
                <span key={chip} style={{ fontSize: "12px", fontWeight: 600, color: C.muted, background: C.surface, border: `1px solid ${C.border}`, padding: "4px 12px", borderRadius: "20px" }}>{chip}</span>
              ))}
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "#FDE8E8", border: `2px solid ${C.risk.vhigh}`, borderRadius: "14px", padding: "12px 20px" }}>
              <span style={{ fontSize: "20px", fontWeight: 700, color: C.risk.vhigh }}>✗</span>
              <span style={{ fontFamily: serif, fontSize: "22px", fontWeight: 700, color: C.risk.vhigh }}>Avoid</span>
            </div>
          </div>

          {/* Blocked card */}
          <div style={{ background: "#FDE8E8", border: `2px solid ${C.risk.vhigh}`, borderRadius: "24px", padding: "36px 40px", marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#F8C8C8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3L22 20H2L12 3Z" stroke={C.risk.vhigh} strokeWidth="1.6" strokeLinejoin="round" /><path d="M12 10V14" stroke={C.risk.vhigh} strokeWidth="1.6" strokeLinecap="round" /><circle cx="12" cy="17.5" r="0.9" fill={C.risk.vhigh} /></svg>
              </div>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: C.risk.vhigh, marginBottom: "4px" }}>AREA SUITABILITY GATE</div>
                <div style={{ fontFamily: serif, fontSize: "22px", fontWeight: 700, color: C.risk.vhigh }}>Not Suitable for STR Sub-Leasing</div>
              </div>
            </div>
            <p style={{ fontSize: "14px", color: "#5A1A1A", lineHeight: 1.7, marginBottom: "20px" }}>
              AssetIntel does not recommend running an STR sub-leasing calculation for <strong>{blockResult.matchedArea}</strong>. This area has weak STR guest demand, possible community restrictions, or a market profile that makes fixed-rent exposure too risky.
            </p>
            <div style={{ padding: "16px 20px", background: "#F8C8C8", borderRadius: "12px", fontSize: "13px", color: "#5A1A1A", lineHeight: 1.65 }}>
              Sub-leasing in this area means paying fixed rent every month regardless of occupancy. Without strong STR demand, you would likely cover rent in peak months but face losses in low season — with no way to exit without breaking the lease.
            </div>
          </div>

          {/* CTA */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button onClick={() => router.push(editUrl)} style={{ padding: "13px 24px", background: C.primary, color: "#fff", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", border: "none" }}>
              ← Try a Different Building or Area
            </button>
            <button onClick={() => router.push("/contact?service=str-subleasing-risk")} style={{ padding: "13px 24px", background: "transparent", border: `1.5px solid ${C.border}`, color: C.text, borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
              Speak to AssetIntel
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Full result ──
  const r = calc.result;

  const cashBuffer = r.months.reduce((sum, m) => sum + Math.abs(Math.min(0, m.netProfit)), 0);

  const negativeMonths = r.months.filter(m => m.netProfit < 0).length;

  // Negotiate target: what monthly rent would bring break-even to 49%
  const annualFixedCosts = r.annualUtilities + r.annualMaintenance + r.annualFurniture;
  const annualNetMinusMgmt = r.annualSTRRevenue - r.annualMgmtFee;
  const targetMonthlyRent = Math.round(((0.49 * annualNetMinusMgmt / r.avgOccupancy) - annualFixedCosts) / 12);
  const rentGap = r.monthlyRent - targetMonthlyRent;

  // Risk reasons
  const riskReasons: string[] = [];
  if (r.breakEvenOcc >= 0.65) riskReasons.push(`Break-even occupancy of ${pct(r.breakEvenOcc)} leaves little margin for slow months.`);
  if (r.viewTier === "weak") riskReasons.push("Standard or garden view limits nightly rate and booking conversion.");
  if (r.furnishingTier === "fail") riskReasons.push("Basic furnishing reduces ADR, reviews, and repeat bookings.");
  if (r.furnishingTier === "warn") riskReasons.push("Standard furnishing will cap ADR below hotel-grade peers.");
  if (r.areaSuitability === "not_recommended") riskReasons.push("The area has inconsistent STR demand — fixed rent creates high downside exposure.");
  if (r.areaSuitability === "caution") riskReasons.push("This area requires strong fundamentals — view, rent, and unit size all matter here.");
  if (negativeMonths >= 3) riskReasons.push(`${negativeMonths} months show negative cash flow — a cash buffer of AED ${fmt(cashBuffer)} is required.`);
  else if (negativeMonths > 0) riskReasons.push(`${negativeMonths} month(s) show negative cash flow during low season.`);
  if (r.unitTier === "marginal") riskReasons.push("3BR units are harder to fill consistently — risk is elevated for larger units.");

  const recCfg = {
    Proceed:   { bg: "#E8F5EE", border: C.risk.low,    color: C.risk.low,    icon: "✓", text: "Based on the numbers and area profile, this deal looks viable. Confirm approvals and negotiate rent before signing." },
    Negotiate: { bg: "#FEF3E2", border: C.risk.medium, color: C.risk.medium, icon: "↔", text: "This deal requires better fundamentals before proceeding. Negotiate the rent down or seek a stronger building/view before committing." },
    Avoid:     { bg: "#FDE8E8", border: C.risk.vhigh,  color: C.risk.vhigh,  icon: "✗", text: "AssetIntel recommends against this sub-lease based on the area, break-even occupancy, or risk profile. Fixed rent exposure is too high." },
  }[r.recommendation];

  return (
    <main style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Nav */}
        <button onClick={() => router.push(editUrl)} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: C.surface, border: `1px solid ${C.border}`, color: C.primary, fontSize: "12px", fontWeight: 600, padding: "6px 14px", borderRadius: "8px", cursor: "pointer", marginBottom: "36px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={C.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Edit Inputs
        </button>

        {/* ── Hero ── */}
        <div style={{ marginBottom: "36px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", color: C.bronze, marginBottom: "12px" }}>ASSETINTEL STR SUB-LEASING RISK REPORT</div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 700, color: C.text, marginBottom: "8px", lineHeight: 1.15 }}>{r.buildingName}</h1>
          {r.community && <p style={{ fontSize: "15px", color: C.muted, marginBottom: "18px" }}>{r.community}</p>}

          {/* Property chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
            {[r.unitSize, `Floor ${r.floor}`, r.view, FURNISHING_CONFIG[r.furnishingQuality].display + " Furnishing", `AED ${fmt(r.monthlyRent)}/mo rent`].map(chip => (
              <span key={chip} style={{ fontSize: "12px", fontWeight: 600, color: C.muted, background: C.surface, border: `1px solid ${C.border}`, padding: "4px 12px", borderRadius: "20px" }}>{chip}</span>
            ))}
          </div>

          {/* Recommendation badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", background: recCfg.bg, border: `2px solid ${recCfg.border}`, borderRadius: "16px", padding: "16px 24px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: recCfg.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", fontSize: "20px", fontWeight: 700 }}>{recCfg.icon}</div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: recCfg.color, marginBottom: "2px" }}>ASSETINTEL RECOMMENDATION</div>
              <div style={{ fontFamily: serif, fontSize: "26px", fontWeight: 700, color: recCfg.color, lineHeight: 1 }}>{r.recommendation}</div>
            </div>
            <div style={{ borderLeft: `1px solid ${recCfg.border}40`, paddingLeft: "16px", marginLeft: "4px" }}>
              <div style={{ fontSize: "10px", color: recCfg.color, fontWeight: 700, letterSpacing: "0.08em", marginBottom: "2px" }}>RISK</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: recCfg.color, fontFamily: serif }}>{r.riskLevel}</div>
            </div>
          </div>
        </div>

        {/* ── Key Metrics ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "28px" }}>
          {[
            {
              label: "Annual Net Profit",
              value: `${r.annualNetProfit >= 0 ? "+" : ""}AED ${fmt(r.annualNetProfit)}`,
              color: r.annualNetProfit >= 0 ? C.risk.low : C.risk.vhigh,
              note: r.annualNetProfit >= 0 ? `${Math.round((r.annualNetProfit / r.annualLandlordRent) * 100)}% margin on rent paid` : "Shortfall — deal needs renegotiation",
            },
            {
              label: "Break-even Occupancy",
              value: pct(r.breakEvenOcc),
              color: RISK_COLOR[r.riskLevel],
              note: `You need ${pct(r.breakEvenOcc)} occupancy to cover all costs`,
            },
            {
              label: "Avg Projected Occupancy",
              value: pct(r.avgOccupancy),
              color: C.primary,
              note: `Based on ${r.community || r.buildingName} seasonal demand`,
            },
            {
              label: "Cash Buffer Required",
              value: cashBuffer > 0 ? `AED ${fmt(cashBuffer)}` : "None",
              color: cashBuffer > 0 ? C.risk.medium : C.risk.low,
              note: cashBuffer > 0 ? `Sum of ${negativeMonths} loss month(s) in low season` : "All months cash-flow positive",
            },
          ].map(({ label, value, color, note }) => (
            <div key={label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "20px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", color: C.muted, marginBottom: "8px" }}>{label.toUpperCase()}</div>
              <div style={{ fontFamily: serif, fontSize: "24px", fontWeight: 700, color, marginBottom: "4px" }}>{value}</div>
              <div style={{ fontSize: "11px", color: C.muted, lineHeight: 1.4 }}>{note}</div>
            </div>
          ))}
        </div>

        {/* ── Area Suitability Card ── */}
        {(() => {
          const s = r.areaSuitability;
          const cfg = {
            eligible:        { label: "Prime STR Area",      badge: "ELIGIBLE",  body: "This area has stronger short-term rental demand, but the deal still depends on rent, building quality, and break-even occupancy.", bg: "#E8F5EE", border: C.risk.low,    color: C.risk.low,    badgeBg: "#C8E8D8" },
            caution:         { label: "Selective STR Area",  badge: "CAUTION",   body: "This area can work, but only when rent is well below expected STR revenue and the unit has strong guest appeal. Risk has been adjusted accordingly.", bg: "#FEF3E2", border: C.risk.medium, color: C.risk.medium, badgeBg: "#FCEACC" },
            not_recommended: { label: "Not Recommended",     badge: "WEAK AREA", body: "AssetIntel does not generally recommend STR sub-leasing in this area unless the rent is deeply discounted and approvals are fully confirmed. Risk has been increased.", bg: "#FEF0E8", border: C.risk.high,   color: C.risk.high,   badgeBg: "#FAD8C0" },
            avoid:           { label: "Avoid",               badge: "BLOCKED",   body: "This area/building is not suitable for STR sub-leasing based on AssetIntel risk rules.", bg: "#FDE8E8", border: C.risk.vhigh,  color: C.risk.vhigh,  badgeBg: "#F8C8C8" },
          }[s];
          return (
            <div style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}`, borderRadius: "20px", padding: "26px 30px", marginBottom: "20px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: cfg.color, marginBottom: "10px" }}>AREA SUITABILITY</div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <span style={{ fontSize: "20px", fontWeight: 700, color: cfg.color, fontFamily: serif }}>{cfg.label}</span>
                <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: cfg.color, background: cfg.badgeBg, padding: "3px 10px", borderRadius: "20px" }}>{cfg.badge}</span>
              </div>
              <p style={{ fontSize: "13.5px", color: C.text, lineHeight: 1.65, margin: r.buildingProfile ? "0 0 14px" : "0" }}>{cfg.body}</p>
              {r.buildingProfile && (() => {
                const bp = r.buildingProfile!;
                const tierCfg = {
                  high:     { label: "High STR Demand",     color: C.risk.low,    bg: "#C8E8D8" },
                  moderate: { label: "Moderate STR Demand", color: C.risk.medium, bg: "#FCEACC" },
                  low:      { label: "Low STR Demand",      color: C.risk.high,   bg: "#FAD8C0" },
                }[bp.demandTier];
                return (
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: tierCfg.color, background: tierCfg.bg, padding: "4px 12px", borderRadius: "20px" }}>{tierCfg.label}</span>
                    {bp.notes && <span style={{ fontSize: "12px", color: C.muted, fontStyle: "italic" }}>{bp.notes}</span>}
                  </div>
                );
              })()}
            </div>
          );
        })()}

        {/* ── Guest Appeal Check ── */}
        {(() => {
          const appealCfg = GUEST_APPEAL_CFG[r.guestAppeal];
          const rows: { label: string; tier: "pass" | "warn" | "fail"; note: string }[] = [
            {
              label: "Furnishing Quality",
              tier: r.furnishingTier,
              note: r.furnishingTier === "pass"
                ? `${r.furnishingQuality} — strong ADR and conversion potential`
                : r.furnishingTier === "warn"
                ? `${r.furnishingQuality} — upgrade key areas before launch`
                : `${r.furnishingQuality} — upgrade to Premium before signing this lease`,
            },
            {
              label: "View Quality",
              tier: r.viewTier === "premium" ? "pass" : r.viewTier === "good" ? "warn" : "fail",
              note: r.viewTier === "premium"
                ? `${r.view} — strong nightly rate premium`
                : r.viewTier === "good"
                ? `${r.view} — acceptable; rent must be controlled`
                : `${r.view} — limits ADR; rent must be lower to compensate`,
            },
            {
              label: "Floor Appeal",
              tier: r.floorTier === "high" ? "pass" : r.floorTier === "mid" ? "warn" : "fail",
              note: r.floorTier === "high" ? `Floor ${r.floor} — premium positioning` : r.floorTier === "mid" ? `Floor ${r.floor} — acceptable` : `Floor ${r.floor} — low floor reduces guest appeal and ADR`,
            },
            {
              label: "Building Demand",
              tier: r.buildingProfile?.demandTier === "high" ? "pass" : r.buildingProfile?.demandTier === "low" ? "fail" : "warn",
              note: r.buildingProfile
                ? r.buildingProfile.demandTier === "high" ? "High STR demand building" : r.buildingProfile.demandTier === "moderate" ? "Moderate STR demand building" : "Low STR demand building"
                : "No building-specific data — area-level demand used",
            },
          ];
          return (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "24px", padding: "32px 36px", marginBottom: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "22px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: C.bronze, marginBottom: "6px" }}>GUEST APPEAL CHECK</div>
                  <p style={{ fontSize: "12.5px", color: C.muted, maxWidth: "480px", lineHeight: 1.65, margin: 0 }}>
                    Guest appeal drives ADR, booking conversion, and occupancy — all critical when you carry fixed rent obligations.
                  </p>
                </div>
                <div style={{ background: appealCfg.bg, border: `1.5px solid ${appealCfg.border}`, borderRadius: "16px", padding: "14px 22px", textAlign: "center", minWidth: "140px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: appealCfg.color, marginBottom: "4px" }}>OVERALL APPEAL</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: appealCfg.color, fontFamily: serif }}>{r.guestAppeal}</div>
                  <div style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>{r.guestAppealScore} / 11</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: r.furnishingTier !== "pass" || r.viewTier === "weak" ? "20px" : "0" }}>
                {rows.map(({ label, tier, note }) => {
                  const tc = tier === "pass" ? C.risk.low : tier === "warn" ? C.risk.medium : C.risk.vhigh;
                  const tbg = tier === "pass" ? "#E8F5EE" : tier === "warn" ? "#FEF3E2" : "#FDE8E8";
                  return (
                    <div key={label} style={{ background: tbg, borderRadius: "12px", padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", color: tc }}>{label.toUpperCase()}</span>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: tc, background: tier === "pass" ? "#C8E8D8" : tier === "warn" ? "#FCEACC" : "#F8C8C8", padding: "2px 8px", borderRadius: "20px" }}>
                          {tier === "pass" ? "PASS" : tier === "warn" ? "WARN" : "FAIL"}
                        </span>
                      </div>
                      <p style={{ fontSize: "12px", color: C.text, margin: 0, lineHeight: 1.5 }}>{note}</p>
                    </div>
                  );
                })}
              </div>
              {(r.furnishingTier !== "pass" || r.viewTier === "weak") && (
                <div style={{ padding: "16px 20px", background: "#F5F0E8", borderRadius: "12px", border: "1px solid #E8D9BC" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: C.bronze, marginBottom: "10px" }}>IMPROVEMENT GUIDANCE</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {r.furnishingQuality === "Basic" && (
                      <div style={{ fontSize: "13px", color: C.text, lineHeight: 1.6 }}>
                        <strong>Furnishing:</strong> Upgrade to Premium STR furnishing before launch, or negotiate the rent significantly lower to compensate.
                      </div>
                    )}
                    {r.furnishingQuality === "Standard" && (
                      <div style={{ fontSize: "13px", color: C.text, lineHeight: 1.6 }}>
                        <strong>Furnishing:</strong> Improve key visual areas — living room, bedroom, lighting, artwork, linens, balcony, and listing photography — before launch.
                      </div>
                    )}
                    {r.viewTier === "weak" && (
                      <div style={{ fontSize: "13px", color: C.text, lineHeight: 1.6 }}>
                        <strong>View:</strong> The rent must be lower than market to compensate for the weaker ADR potential of a standard/garden view.
                      </div>
                    )}
                    {r.furnishingTier !== "pass" && r.viewTier === "weak" && (
                      <div style={{ fontSize: "13px", fontWeight: 600, color: C.risk.vhigh, lineHeight: 1.6 }}>
                        Weak furnishing combined with a weak view is a high-risk combination for sub-leasing. Avoid unless rent is significantly below market.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Property Viability Check ── */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "24px", padding: "32px 36px", marginBottom: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: C.bronze, marginBottom: "20px" }}>PROPERTY VIABILITY CHECK</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
            {[
              { Icon: IconFloor, label: "Floor Level",  value: `Floor ${r.floor}`,          pass: r.floorTier === "high" ? "pass" : r.floorTier === "mid" ? "warn" : "fail", note: r.floorTier === "high" ? "High floor — premium pricing" : r.floorTier === "mid" ? "Mid floor — acceptable" : "Low floor — avoid for sub-leasing" },
              { Icon: IconView,  label: "View Quality", value: r.view,                      pass: r.viewTier === "premium" ? "pass" : r.viewTier === "good" ? "warn" : "fail", note: r.viewTier === "premium" ? "Premium view — strong nightly rate" : r.viewTier === "good" ? "Good view — adequate" : "Weak view — limits STR rates" },
              { Icon: IconArea,  label: "Area Demand",  value: r.community || r.buildingName, pass: r.areaTier === "prime" ? "pass" : r.areaTier === "strong" ? "warn" : "fail", note: r.areaTier === "prime" ? "Prime STR area — high demand" : r.areaTier === "strong" ? "Strong area — good demand" : "Weaker area — lower STR demand" },
              { Icon: IconUnit,  label: "Unit Size",    value: r.unitSize,                  pass: r.unitTier === "ideal" ? "pass" : r.unitTier === "good" ? "warn" : "fail", note: r.unitTier === "ideal" ? "Ideal size for sub-leasing" : r.unitTier === "good" ? "Workable — good liquidity" : "Larger units are harder to fill" },
            ].map(({ Icon, label, value, pass, note }) => {
              const color = pass === "pass" ? C.risk.low : pass === "warn" ? C.risk.medium : C.risk.vhigh;
              const bg = pass === "pass" ? "#E8F5EE" : pass === "warn" ? "#FEF3E2" : "#FDE8E8";
              return (
                <div key={label} style={{ background: bg, borderRadius: "14px", padding: "18px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <Icon color={color} />
                    <span style={{ fontSize: "10px", fontWeight: 700, color, letterSpacing: "0.08em" }}>{label.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: C.text, marginBottom: "4px", wordBreak: "break-word" }}>{value}</div>
                  <div style={{ fontSize: "11.5px", color: C.muted, lineHeight: 1.45, marginBottom: "12px" }}>{note}</div>
                  {pass === "pass" ? <IconCheck color={color} /> : pass === "warn" ? <IconWarn color={color} /> : <IconX color={color} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Risk Assessment ── */}
        <div style={{ background: C.surface, border: `2px solid ${RISK_COLOR[r.riskLevel]}`, borderRadius: "24px", padding: "32px 36px", marginBottom: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: C.bronze, marginBottom: "10px" }}>RISK ASSESSMENT</div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <IconRisk color={RISK_COLOR[r.riskLevel]} />
                <h2 style={{ fontFamily: serif, fontSize: "30px", fontWeight: 700, color: RISK_COLOR[r.riskLevel], margin: 0 }}>{r.riskLevel} Risk</h2>
              </div>
            </div>
            <div style={{ background: RISK_BG[r.riskLevel], borderRadius: "16px", padding: "18px 24px", textAlign: "center", minWidth: "164px" }}>
              <div style={{ fontSize: "10px", color: C.muted, fontWeight: 700, letterSpacing: "0.1em", marginBottom: "6px" }}>BREAK-EVEN OCCUPANCY</div>
              <div style={{ fontSize: "40px", fontWeight: 700, color: RISK_COLOR[r.riskLevel], fontFamily: serif, lineHeight: 1 }}>{pct(r.breakEvenOcc)}</div>
              <div style={{ fontSize: "11px", color: C.muted, marginTop: "4px" }}>Realistic avg: {pct(r.avgOccupancy)}</div>
            </div>
          </div>

          {/* Break-even bar */}
          <div style={{ marginBottom: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: C.muted, marginBottom: "6px" }}>
              <span>0%</span><span>50%</span><span>65%</span><span>80%</span><span>100%</span>
            </div>
            <div style={{ position: "relative", height: "10px", background: C.border, borderRadius: "5px", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #2D7A4F22 0%, #2D7A4F22 50%, #A3702022 50%, #A3702022 65%, #C25A1A22 65%, #C25A1A22 80%, #B8323222 80%, #B8323222 100%)" }} />
              <div style={{ position: "absolute", top: 0, bottom: 0, left: `${Math.min(r.breakEvenOcc * 100, 100)}%`, width: "3px", background: RISK_COLOR[r.riskLevel], transform: "translateX(-50%)", borderRadius: "2px" }} />
              <div style={{ position: "absolute", top: "-2px", bottom: "-2px", left: `${Math.min(r.avgOccupancy * 100, 100)}%`, width: "3px", background: C.primary, transform: "translateX(-50%)", borderRadius: "2px" }} />
            </div>
            <div style={{ display: "flex", gap: "20px", marginTop: "8px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: C.muted }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: RISK_COLOR[r.riskLevel] }} />
                Break-even at {pct(r.breakEvenOcc)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: C.muted }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: C.primary }} />
                Projected occupancy {pct(r.avgOccupancy)}
              </div>
            </div>
          </div>

          <p style={{ fontSize: "13.5px", color: C.text, lineHeight: 1.7, margin: 0, padding: "16px 20px", background: RISK_BG[r.riskLevel], borderRadius: "12px" }}>
            {RISK_DESC[r.riskLevel]}
          </p>
        </div>

        {/* ── Risk Reasons ── */}
        {riskReasons.length > 0 && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "24px", padding: "32px 36px", marginBottom: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: C.bronze, marginBottom: "18px" }}>RISK FACTORS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {riskReasons.map((reason, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "12px 16px", background: RISK_BG[r.riskLevel], borderRadius: "10px" }}>
                  <div style={{ marginTop: "2px", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3L22 20H2L12 3Z" stroke={RISK_COLOR[r.riskLevel]} strokeWidth="1.5" strokeLinejoin="round" /><path d="M12 10V14" stroke={RISK_COLOR[r.riskLevel]} strokeWidth="1.5" strokeLinecap="round" /><circle cx="12" cy="17.5" r="0.7" fill={RISK_COLOR[r.riskLevel]} /></svg>
                  </div>
                  <span style={{ fontSize: "13px", color: C.text, lineHeight: 1.6 }}>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Negotiation Guidance ── */}
        {r.recommendation === "Negotiate" && targetMonthlyRent > 0 && rentGap > 0 && (
          <div style={{ background: `linear-gradient(135deg, ${C.bronze}08 0%, ${C.bronze}05 100%)`, border: `1.5px solid ${C.bronze}40`, borderRadius: "24px", padding: "32px 36px", marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: C.bronze, marginBottom: "18px" }}>NEGOTIATION GUIDANCE</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "flex-start", marginBottom: "20px" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ fontSize: "12px", color: C.muted, marginBottom: "4px" }}>Current Rent</div>
                <div style={{ fontFamily: serif, fontSize: "26px", fontWeight: 700, color: C.risk.high }}>AED {fmt(r.monthlyRent)}/mo</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", color: C.muted, fontSize: "20px", paddingTop: "18px" }}>→</div>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ fontSize: "12px", color: C.muted, marginBottom: "4px" }}>Target Rent for Low Risk</div>
                <div style={{ fontFamily: serif, fontSize: "26px", fontWeight: 700, color: C.risk.low }}>AED {fmt(targetMonthlyRent)}/mo</div>
              </div>
              <div style={{ flex: 1, minWidth: "200px", padding: "14px 18px", background: `${C.bronze}12`, borderRadius: "12px", border: `1px solid ${C.bronze}30` }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: C.bronze, letterSpacing: "0.08em", marginBottom: "4px" }}>REDUCTION NEEDED</div>
                <div style={{ fontFamily: serif, fontSize: "22px", fontWeight: 700, color: C.bronze }}>AED {fmt(rentGap)}/mo</div>
                <div style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>{Math.round((rentGap / r.monthlyRent) * 100)}% below asking</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                "Present the break-even analysis to the landlord as evidence — not an excuse.",
                r.viewTier === "weak" ? "Standard view limits your nightly rate — factor this into your negotiation ceiling." : null,
                r.furnishingTier !== "pass" ? "If you plan to upgrade furnishing, use the cost as leverage to negotiate rent lower at signing." : null,
                r.areaSuitability === "caution" ? "In selective areas, landlords have less competing interest — negotiate harder." : null,
                "Ask for a 6-month break or reduced rent in months 1–3 while you build reviews and occupancy.",
              ].filter(Boolean).map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "13px", color: C.text, lineHeight: 1.6 }}>
                  <span style={{ color: C.bronze, fontWeight: 700, flexShrink: 0 }}>·</span>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Annual P&L ── */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "24px", padding: "32px 36px", marginBottom: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: C.bronze, marginBottom: "22px" }}>ANNUAL P&amp;L FORECAST</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            {[
              { label: "STR Gross Revenue", value: `AED ${fmt(r.annualSTRRevenue)}`, sub: `Avg ADR: AED ${fmt(r.avgADR)}/night`, color: C.primary },
              { label: "Landlord Rent (annual)", value: `− AED ${fmt(r.annualLandlordRent)}`, sub: `AED ${fmt(r.monthlyRent)}/month fixed`, color: C.risk.high },
              { label: "Operator Fee", value: `− AED ${fmt(r.annualMgmtFee)}`, sub: r.mgmtFeeMode === "self" ? "Self-managed" : `${r.mgmtFeeCustom}% of revenue`, color: C.muted },
              { label: "Utilities & Costs", value: `− AED ${fmt(r.annualUtilities + r.annualMaintenance + r.annualFurniture)}`, sub: "DEWA, AC, maintenance, furnishing", color: C.muted },
            ].map(({ label, value, sub, color }) => (
              <div key={label} style={{ padding: "18px", background: C.bg, borderRadius: "14px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: "11.5px", color: C.muted, marginBottom: "8px" }}>{label}</div>
                <div style={{ fontSize: "19px", fontWeight: 700, color, fontFamily: serif, marginBottom: "4px" }}>{value}</div>
                <div style={{ fontSize: "11px", color: C.muted }}>{sub}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `2px solid ${r.annualNetProfit >= 0 ? C.risk.low : C.risk.vhigh}`, paddingTop: "22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "12px", color: C.muted, marginBottom: "4px" }}>Estimated Annual Net Profit</div>
              <div style={{ fontFamily: serif, fontSize: "34px", fontWeight: 700, color: r.annualNetProfit >= 0 ? C.risk.low : C.risk.vhigh }}>
                {r.annualNetProfit >= 0 ? "+" : ""}AED {fmt(r.annualNetProfit)}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: C.muted, marginBottom: "4px" }}>vs. Landlord Rent Paid</div>
              <div style={{ fontFamily: serif, fontSize: "20px", fontWeight: 700, color: C.text }}>
                {r.annualNetProfit >= 0
                  ? `+${Math.round((r.annualNetProfit / r.annualLandlordRent) * 100)}% margin`
                  : `${Math.round((r.annualNetProfit / r.annualLandlordRent) * 100)}% shortfall`}
              </div>
            </div>
          </div>
        </div>

        {/* ── Monthly Cash Flow ── */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "24px", overflow: "hidden", marginBottom: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "24px 32px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: C.bronze }}>MONTHLY CASH FLOW</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: C.bg }}>
                  {["Month", "STR Revenue", "Landlord Rent", "Occupancy", "Avg Rate/Night", "Net Profit"].map(h => (
                    <th key={h} style={{ padding: "11px 18px", textAlign: h === "Month" ? "left" : "right", fontSize: "10px", fontWeight: 700, color: C.muted, letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {r.months.map((m, i) => (
                  <tr key={m.month} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? C.surface : C.bg }}>
                    <td style={{ padding: "11px 18px", fontWeight: 600, color: C.text }}>{m.month}</td>
                    <td style={{ padding: "11px 18px", textAlign: "right", color: C.primary }}>AED {fmt(m.revenue)}</td>
                    <td style={{ padding: "11px 18px", textAlign: "right", color: C.risk.high }}>− AED {fmt(m.landlordRent)}</td>
                    <td style={{ padding: "11px 18px", textAlign: "right", color: C.text }}>{pct(m.occupancy)}</td>
                    <td style={{ padding: "11px 18px", textAlign: "right", color: C.text }}>AED {fmt(m.adr)}</td>
                    <td style={{ padding: "11px 18px", textAlign: "right", fontWeight: 700, color: m.netProfit >= 0 ? C.risk.low : C.risk.vhigh }}>
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

        {/* ── CTA ── */}
        <div style={{
          padding: "36px 40px",
          background: `linear-gradient(135deg, ${C.primary}08 0%, ${C.bronze}0A 100%)`,
          border: `1px solid ${C.border}`, borderRadius: "24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: C.bronze, marginBottom: "12px" }}>NEXT STEPS</div>
          <h2 style={{ fontFamily: serif, fontSize: "22px", fontWeight: 700, color: C.text, marginBottom: "8px" }}>
            {r.recommendation === "Proceed" ? "Ready to move forward?" : r.recommendation === "Negotiate" ? "Need help with the negotiation?" : "Not the right deal — but the right one is out there."}
          </h2>
          <p style={{ fontSize: "13.5px", color: C.muted, lineHeight: 1.65, marginBottom: "24px", maxWidth: "560px" }}>
            {r.recommendation === "Proceed"
              ? "AssetIntel can help you structure the sub-lease agreement, secure DET compliance, and set up operations from day one."
              : r.recommendation === "Negotiate"
              ? "AssetIntel can help you model a counter-offer, review the lease structure, and identify whether the deal is worth pursuing at a lower rent."
              : "AssetIntel can help you screen other buildings and find a sub-leasing opportunity that passes the numbers."}
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => router.push("/contact?service=str-subleasing-risk")}
              style={{ padding: "14px 28px", background: `linear-gradient(135deg, ${C.bronze} 0%, #8B6F3F 100%)`, color: "#fff", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", border: "none", boxShadow: "0 4px 14px rgba(184,138,68,0.28)" }}>
              Speak to AssetIntel →
            </button>
            <button
              onClick={() => router.push(editUrl)}
              style={{ padding: "14px 24px", background: "transparent", border: `1.5px solid ${C.border}`, color: C.text, borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
              Edit Inputs
            </button>
            <button
              onClick={() => router.push("/self-manage/str-subleasing")}
              style={{ padding: "14px 24px", background: "transparent", border: `1.5px solid ${C.border}`, color: C.text, borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
              View Playbook
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}

// ─── Export with Suspense ─────────────────────────────────────────────────────

export default function SubleasingResultPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#F8F4EE" }} />}>
      <ResultInner />
    </Suspense>
  );
}
