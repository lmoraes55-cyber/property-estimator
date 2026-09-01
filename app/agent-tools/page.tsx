"use client";

import React, { useState, useEffect, useRef } from "react";
import SiteNav from "@/components/SiteNav";
import { colors } from "@/lib/colors";
import { useIsMobile } from "@/lib/useIsMobile";
import ConsultationBanner from "@/components/home/ConsultationBanner";
import { createClient } from "@/lib/supabase/client";
import {
  runEstimator,
  VIEW_PREMIUMS,
  type EstimatorInput,
  type EstimatorOutput,
  type UnitSize,
  type UnitType,
  type ViewType,
  type PropertyCondition,
} from "@/lib/estimator";
import { BUILDINGS_DATABASE } from "@/lib/buildings-data";
import { getDLDBuildingList, type DLDBuildingEntry } from "@/lib/building-rents";
import { DLD_AREA_TO_COMMUNITY } from "@/lib/dld-area-map";

const serif = "var(--font-display), ui-sans-serif, system-ui, sans-serif";
const sans = "system-ui, -apple-system, sans-serif";

const UNIT_SIZES: UnitSize[] = [
  "STU", "1BR", "2BR", "3BR",
  "4BR APT", "5BR APT", "6BR APT",
  "4BR VILLA", "5BR VILLA", "6BR VILLA", "7BR VILLA", "8BR VILLA", "9BR VILLA",
];
const UNIT_TYPES: UnitType[] = ["Apartment", "Villa"];
const VIEWS: ViewType[] = Object.keys(VIEW_PREMIUMS) as ViewType[];
const CONDITIONS: PropertyCondition[] = ["Standard", "Semi Upgraded", "Fully Upgraded"];
type FurnishOption = "Unfurnished" | "Furnished" | "Premium Furnished";

const DLD_BUILDINGS: DLDBuildingEntry[] = getDLDBuildingList();
const ALL_BUILDINGS = Array.from(new Set(Object.keys(BUILDINGS_DATABASE))).sort();

type ReportTypeId = "full" | "sales" | "ltr" | "str" | "offplan";

interface ReportTypeDef {
  id: ReportTypeId;
  title: string;
  description: string;
  includes: string[];
  cta: string;
}

const REPORT_TYPES: ReportTypeDef[] = [
  {
    id: "full",
    title: "Full Investor Report",
    description: "A complete report combining recent DLD sales transactions, LTR rental benchmark, STR estimate, yield comparison, and investor recommendation.",
    includes: ["Recent DLD sales transactions", "Price/sqft benchmark", "LTR rent estimate", "STR income estimate", "STR vs LTR comparison", "Gross/net yield", "Downloadable PDF"],
    cta: "Create Full Report",
  },
  {
    id: "sales",
    title: "Recent Sales Transaction Report",
    description: "Use live DLD sales transaction data to show recent comparable sales and price per sqft evidence.",
    includes: ["Same-building transactions", "Area fallback comps", "Price per sqft", "Median sale value", "Asking price comparison"],
    cta: "Create Sales Report",
  },
  {
    id: "ltr",
    title: "LTR Rental Benchmark",
    description: "Estimate long-term rent using recent DLD/Ejari rental contracts and similar unit sizes.",
    includes: ["DLD rental comps", "Rent per sqft", "Furnished adjustment", "Data confidence score", "Asking rent guidance"],
    cta: "Create LTR Report",
  },
  {
    id: "str",
    title: "STR Income Report",
    description: "Estimate STR performance using AssetIntel STR assumptions, ADR, occupancy, seasonality, and operating costs.",
    includes: ["ADR estimate", "Occupancy estimate", "Annual gross revenue", "Net owner income", "STR suitability notes", "Seasonality view"],
    cta: "Create STR Report",
  },
  {
    id: "offplan",
    title: "Off-Plan STR Potential Report",
    description: "Screen an off-plan or upcoming handover project for STR potential before handover or resale.",
    includes: ["Area STR demand", "Building/project positioning", "Expected unit type suitability", "LTR/STR outlook", "Handover risk notes"],
    cta: "Create Off-Plan Report",
  },
];

const GENERAL_DISCLAIMER = "AssetIntel reports are generated using available DLD data, rental transaction data, STR assumptions, and user inputs. Reports are indicative and should not be treated as guaranteed investment, financial, legal, or valuation advice. Final purchase, rental, and investment decisions remain the responsibility of the buyer and should be verified with licensed professionals where required.";
const AGENT_DISCLAIMER = "Agent-provided notes and agency details are displayed for convenience. AssetIntel does not verify agent claims unless separately stated.";
const OPERATOR_DISCLAIMER = "AssetIntel operator matches are provided privately based on available information, property fit, owner priorities, and market assumptions. Operator fees, terms, availability, and performance should be verified directly with the operator before signing any agreement. AssetIntel does not guarantee operator performance or rental income.";
const BROKERAGE_DISCLAIMER = "Property purchase and brokerage services remain the responsibility of the licensed agent/brokerage. AssetIntel provides rental strategy, STR research, and operator matching support.";
const OFFPLAN_DISCLAIMER = "Off-plan STR projections are forward-looking and should be reviewed again closer to handover.";

function toBedroomBucket(unitSize: UnitSize): string {
  return unitSize.replace(/\s+(APT|VILLA)$/i, "");
}

const card: React.CSSProperties = {
  background: colors.bgWhite,
  border: `1px solid ${colors.border}`,
  borderRadius: 16,
  padding: 24,
  boxShadow: colors.shadowSm,
};

const grid4: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
  gap: 20,
};

const label: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 6, display: "block", letterSpacing: "0.02em" };
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${colors.border}`,
  fontSize: 14, color: colors.textMain, background: colors.bgWhite, fontFamily: sans, boxSizing: "border-box",
};

function Field({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: 16 }}>{children}</div>;
}

function PrimaryButton({ children, onClick, fullWidth, disabled }: { children: React.ReactNode; onClick?: () => void; fullWidth?: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "12px 24px",
        borderRadius: 999,
        background: disabled ? colors.border : `linear-gradient(135deg, ${colors.primary} 0%, #2D7A5E 100%)`,
        color: disabled ? colors.textMuted : "#FFF",
        fontSize: 14, fontWeight: 700, border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        width: fullWidth ? "100%" : undefined,
        boxShadow: disabled ? "none" : "0 4px 14px rgba(27,94,74,0.28)",
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, fullWidth }: { children: React.ReactNode; onClick?: () => void; fullWidth?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "12px 24px",
        borderRadius: 999,
        background: "transparent",
        color: colors.primary,
        fontSize: 14, fontWeight: 700,
        border: `1.5px solid ${colors.primary}`,
        cursor: "pointer",
        width: fullWidth ? "100%" : undefined,
      }}
    >
      {children}
    </button>
  );
}

function Disclaimer({ text }: { text: string }) {
  return <p style={{ fontSize: 11, color: colors.textLight, lineHeight: 1.6, margin: "8px 0" }}>{text}</p>;
}

// ── Sale/LTR API response shapes (subset used here) ──────────────────────
interface SaleStat {
  medianPrice: number; p25Price: number; p75Price: number;
  medianAedPerSqft: number; medianSqft: number; offPlanShare: number; n: number; asOf: string; source: string;
}
interface RecentSale { date: string; price: number; areaSqft: number; aedPerSqft: number; offPlan: boolean; }
interface LTRStat {
  median: number; p25: number; p75: number; n: number; aedPerSqft?: number; medianSqft?: number; asOf: string; source: string;
}
interface RecentContract { date: string; annualRent: number; areaSqft: number; aedPerSqft: number; }

export default function AgentToolsPage() {
  const isMobile = useIsMobile();
  const [reportType, setReportType] = useState<ReportTypeId>("full");

  // Property fields
  const [building, setBuilding] = useState("");
  const [dldKey, setDldKey] = useState("");
  const [area, setArea] = useState("");
  const [unitSize, setUnitSize] = useState<UnitSize>("1BR");
  const [unitAreaSqft, setUnitAreaSqft] = useState("");
  const [unitType, setUnitType] = useState<UnitType>("Apartment");
  const [floor, setFloor] = useState("5");
  const [view, setView] = useState<ViewType>("Standard View");
  const [furnished, setFurnished] = useState<FurnishOption>("Unfurnished");
  const [condition, setCondition] = useState<PropertyCondition>("Standard");
  const [askingPrice, setAskingPrice] = useState("");
  const [handoverDate, setHandoverDate] = useState("");

  // Building search
  const buildingRef = useRef<HTMLDivElement>(null);
  const [buildingSearch, setBuildingSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Output options
  const [downloadPdf, setDownloadPdf] = useState(true);
  const [saveToDashboard, setSaveToDashboard] = useState(false);
  const [emailToMyself, setEmailToMyself] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [generating, setGenerating] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  // Results
  const [saleStat, setSaleStat] = useState<SaleStat | null>(null);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [ltrStat, setLtrStat] = useState<LTRStat | null>(null);
  const [recentContracts, setRecentContracts] = useState<RecentContract[]>([]);
  const [strResult, setStrResult] = useState<EstimatorOutput | null>(null);
  const [hasResult, setHasResult] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
      setAccountEmail(user?.email ?? "");
    });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (buildingRef.current && !buildingRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const bq = buildingSearch.toLowerCase();
  const filteredDLD: DLDBuildingEntry[] = bq.length >= 2
    ? DLD_BUILDINGS.filter(b => b.displayName.toLowerCase().includes(bq)).slice(0, 8)
    : [];
  const filteredCurated = bq.length >= 2
    ? ALL_BUILDINGS
        .filter(b => b.toLowerCase().includes(bq) && !filteredDLD.some(d => d.displayName.toLowerCase() === b.toLowerCase()))
        .slice(0, Math.max(0, 8 - filteredDLD.length))
    : [];

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleGenerate() {
    setFormError(null);
    if (!unitAreaSqft || Number(unitAreaSqft) <= 0) {
      setFormError("Unit Area (sqft) is required.");
      return;
    }
    setGenerating(true);
    setHasResult(false);

    const bedroomBucket = toBedroomBucket(unitSize);
    let sStat: SaleStat | null = null;
    let sRecent: RecentSale[] = [];
    let lStat: LTRStat | null = null;
    let lRecent: RecentContract[] = [];

    const project = dldKey || building;
    const sizeSqftParam = Number(unitAreaSqft) > 0 ? `&sizeSqft=${encodeURIComponent(unitAreaSqft)}` : "";

    if (reportType === "full" || reportType === "sales") {
      try {
        const res = await fetch(`/api/sale-transactions?project=${encodeURIComponent(project)}&bedrooms=${encodeURIComponent(bedroomBucket)}${sizeSqftParam}`);
        if (res.ok) {
          const data = await res.json();
          sStat = data.stat ?? null;
          sRecent = data.recentTransactions ?? [];
        }
      } catch { /* degrade gracefully */ }
    }

    if (reportType === "full" || reportType === "ltr") {
      try {
        const res = await fetch(`/api/ltr-rents?project=${encodeURIComponent(project)}&bedrooms=${encodeURIComponent(bedroomBucket)}&area=${encodeURIComponent(area)}${sizeSqftParam}`);
        if (res.ok) {
          const data = await res.json();
          lStat = data.stat ?? null;
          lRecent = data.recentContracts ?? [];
        }
      } catch { /* degrade gracefully */ }
    }

    let str: EstimatorOutput | null = null;
    if (reportType === "full" || reportType === "str" || reportType === "offplan") {
      const input: EstimatorInput = {
        propertyName: building || "Agent Report Property",
        buildingName: building || "Unknown Building",
        unitSize,
        unitType,
        floor: Number(floor) || 0,
        view,
        furnished: furnished === "Unfurnished" ? "Unfurnished" : "Furnished",
        managementFee: 0.20,
        occStrategy: "LOCCHP",
        propertyValue: askingPrice ? Number(askingPrice) : undefined,
        sizeSqft: Number(unitAreaSqft),
        propertyCondition: condition,
      };
      try {
        str = runEstimator(input);
      } catch { /* estimator failure shouldn't block other sections */ }
    }

    setSaleStat(sStat);
    setRecentSales(sRecent);
    setLtrStat(lStat);
    setRecentContracts(lRecent);
    setStrResult(str);
    setHasResult(true);
    setGenerating(false);

    if (downloadPdf) {
      await buildAndDownloadPdf(sStat, sRecent, lStat, str);
    }
    if (emailToMyself && accountEmail) {
      await sendEmail(sStat, lStat, str);
    }
    if (saveToDashboard && isLoggedIn) {
      await saveLead(str, lStat);
    }

    setTimeout(() => scrollTo("report-results"), 100);
  }

  function reportTypeLabel() {
    return REPORT_TYPES.find(r => r.id === reportType)?.title ?? "Report";
  }

  async function buildAndDownloadPdf(sStat: SaleStat | null, sRecent: RecentSale[], lStat: LTRStat | null, str: EstimatorOutput | null) {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const ml = 40;
      let y = 50;

      const green: [number, number, number] = [27, 94, 74];
      const bronze: [number, number, number] = [184, 138, 68];
      const dark: [number, number, number] = [26, 26, 26];
      const muted: [number, number, number] = [107, 107, 107];

      function txt(s: string, x: number, yy: number, size = 10, bold = false, color: [number, number, number] = dark) {
        doc.setFontSize(size);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(s, x, yy);
      }
      function ensure(space: number) {
        if (y + space > 780) { doc.addPage(); y = 50; }
      }
      const money = (n: number) => "AED " + Math.round(n).toLocaleString();

      txt("ASSETINTEL", ml, y, 9, true, bronze);
      y += 18;
      txt("AssetIntel Agent Investor Report", ml, y, 18, true, green);
      y += 20;
      txt(reportTypeLabel(), ml, y, 11, true, muted);
      y += 16;
      txt(`Generated: ${new Date().toLocaleDateString()}`, ml, y, 9, false, muted);
      y += 24;

      txt(`Property: ${building || "-"}, ${area || "-"} · ${unitSize} · ${unitAreaSqft} sqft`, ml, y, 10, true, dark);
      y += 24;

      if ((reportType === "full" || reportType === "sales")) {
        ensure(60);
        txt("RECENT DLD SALES EVIDENCE", ml, y, 10, true, bronze); y += 16;
        if (sStat) {
          txt(`Median price: ${money(sStat.medianPrice)}  ·  AED/sqft: ${sStat.medianAedPerSqft}  ·  Sample size: ${sStat.n}`, ml, y, 9); y += 14;
          sRecent.slice(0, 5).forEach(t => {
            ensure(14);
            txt(`${t.date}  ${money(t.price)}  ${t.areaSqft} sqft  ${t.aedPerSqft} AED/sqft${t.offPlan ? " (off-plan)" : ""}`, ml, y, 8, false, muted);
            y += 12;
          });
        } else {
          txt("Limited data available for this building/bedroom mix.", ml, y, 9, false, muted); y += 14;
        }
        y += 12;
      }

      if (reportType === "full" || reportType === "ltr") {
        ensure(60);
        txt("LONG-TERM RENTAL BENCHMARK", ml, y, 10, true, bronze); y += 16;
        if (lStat) {
          txt(`Median rent: ${money(lStat.median)}/yr${lStat.p25 != null && lStat.p75 != null ? `  ·  Range: ${money(lStat.p25)} - ${money(lStat.p75)}` : ""}  ·  Sample size: ${lStat.n}`, ml, y, 9); y += 14;
        } else {
          txt("Limited data available for this building/bedroom mix.", ml, y, 9, false, muted); y += 14;
        }
        y += 12;
      }

      if (reportType === "full" || reportType === "str" || reportType === "offplan") {
        ensure(70);
        txt("SHORT-TERM RENTAL ESTIMATE", ml, y, 10, true, bronze); y += 16;
        if (str) {
          txt(`Annual gross revenue: ${money(str.annualRevenue)}  ·  Net to owner: ${money(str.annualNetToLandlord)}`, ml, y, 9); y += 14;
          txt(`Avg occupancy: ${(str.avgOccupancy * 100).toFixed(0)}%  ·  Avg ADR: ${money(str.avgADR)}`, ml, y, 9); y += 14;
          if (str.grossYield) { txt(`Gross yield: ${(str.grossYield * 100).toFixed(1)}%  ·  Net yield: ${((str.netYield ?? 0) * 100).toFixed(1)}%`, ml, y, 9); y += 14; }
        } else {
          txt("STR estimate unavailable.", ml, y, 9, false, muted); y += 14;
        }
        y += 12;
        if (reportType === "offplan") {
          ensure(24);
          txt(OFFPLAN_DISCLAIMER, ml, y, 8, false, muted); y += 24;
        }
      }

      if (reportType === "full" && str && lStat) {
        ensure(40);
        txt("YIELD COMPARISON", ml, y, 10, true, bronze); y += 16;
        const grossLtrYield = askingPrice ? (lStat.median / Number(askingPrice)) : 0;
        txt(`LTR gross yield: ${(grossLtrYield * 100).toFixed(1)}%  ·  STR net yield: ${((str.netYield ?? 0) * 100).toFixed(1)}%`, ml, y, 9); y += 20;
      }

      ensure(80);
      txt("DISCLAIMER", ml, y, 9, true, muted); y += 12;
      [GENERAL_DISCLAIMER, AGENT_DISCLAIMER].forEach(d => {
        const lines = doc.splitTextToSize(d, 500);
        lines.forEach((l: string) => { ensure(10); txt(l, ml, y, 7, false, muted); y += 10; });
        y += 6;
      });

      doc.save(`AssetIntel-Agent-Report-${(building || "property").replace(/\s+/g, "-")}.pdf`);
    } catch (e) {
      console.error("PDF generation failed", e);
    }
  }

  async function sendEmail(sStat: SaleStat | null, lStat: LTRStat | null, str: EstimatorOutput | null) {
    setEmailStatus("sending");
    const money = (n: number) => "AED " + Math.round(n).toLocaleString();
    const rows: string[] = [];
    rows.push(`<p style="font-size:13px;color:#0F1D18;"><strong>Property:</strong> ${building || "-"}, ${area || "-"} · ${unitSize} · ${unitAreaSqft} sqft</p>`);
    if (sStat) rows.push(`<p style="font-size:13px;color:#0F1D18;"><strong>Recent Sales:</strong> Median ${money(sStat.medianPrice)} · ${sStat.medianAedPerSqft} AED/sqft (n=${sStat.n})</p>`);
    if (lStat) rows.push(`<p style="font-size:13px;color:#0F1D18;"><strong>LTR Benchmark:</strong> Median ${money(lStat.median)}/yr (n=${lStat.n})</p>`);
    if (str) rows.push(`<p style="font-size:13px;color:#0F1D18;"><strong>STR Estimate:</strong> ${money(str.annualRevenue)}/yr gross, ${money(str.annualNetToLandlord)}/yr net, ${(str.avgOccupancy * 100).toFixed(0)}% occupancy</p>`);

    try {
      const res = await fetch("/api/send-agent-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: accountEmail,
          reportType: reportTypeLabel(),
          property: `${building || "-"}, ${area || "-"}`,
          summaryHtml: rows.join(""),
        }),
      });
      const data = await res.json();
      setEmailStatus(data.ok ? "sent" : "error");
    } catch {
      setEmailStatus("error");
    }
  }

  async function saveLead(str: EstimatorOutput | null, lStat: LTRStat | null) {
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Agent",
          email: accountEmail,
          target: building,
          targetType: "agent",
          property: `${building || "-"}, ${area || "-"}`,
          building,
          community: area,
          unitSize,
          floor,
          view,
          furnished,
          recommendation: str && str.strVsLtrDelta > 0 ? "STR" : "LTR",
          strNetPerYear: str ? String(Math.round(str.annualNetToLandlord)) : "",
          ltrPerYear: lStat ? String(Math.round(lStat.median)) : (str ? String(Math.round(str.longTermRent * 12)) : ""),
          occupancy: str ? String(str.avgOccupancy) : "",
          adr: str ? String(str.avgADR) : "",
          message: "",
        }),
      });
    } catch { /* best-effort */ }
  }

  // ─────────────────────────────────────────────────────────────────────
  // Post-sale operator match form
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [preferredContact, setPreferredContact] = useState<"owner" | "agent" | "both">("agent");
  const [pmBuilding, setPmBuilding] = useState("");
  const [pmArea, setPmArea] = useState("");
  const [pmUnitSize, setPmUnitSize] = useState<UnitSize>("1BR");
  const [pmUnitType, setPmUnitType] = useState<UnitType>("Apartment");
  const [pmFloor, setPmFloor] = useState("");
  const [pmView, setPmView] = useState<ViewType>("Standard View");
  const [pmFurnished, setPmFurnished] = useState<FurnishOption>("Unfurnished");
  const [pmCondition, setPmCondition] = useState<PropertyCondition>("Standard");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [handoverStatus, setHandoverStatus] = useState("Ready");
  const [goLiveTimeline, setGoLiveTimeline] = useState("Immediately");
  const [priorities, setPriorities] = useState<string[]>([]);
  const [pmNotes, setPmNotes] = useState("");
  const [pmAgentName, setPmAgentName] = useState("");
  const [pmAgencyName, setPmAgencyName] = useState("");
  const [pmAgentPhone, setPmAgentPhone] = useState("");
  const [pmAgentEmail, setPmAgentEmail] = useState("");
  const [pmReraNumber, setPmReraNumber] = useState("");
  const [pmSubmitting, setPmSubmitting] = useState(false);
  const [pmSubmitted, setPmSubmitted] = useState(false);
  const [pmError, setPmError] = useState<string | null>(null);

  const PRIORITY_OPTIONS = ["Highest possible income", "Premium operator", "Transparent reporting", "Fast onboarding", "Lower management fee", "Strong guest reviews", "Not sure yet"];

  function togglePriority(p: string) {
    setPriorities(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  async function submitOperatorMatch() {
    setPmError(null);
    if (!pmAgentName || !pmAgentEmail || !ownerName || !pmBuilding) {
      setPmError("Please fill in agent name/email, owner name, and building name.");
      return;
    }
    setPmSubmitting(true);
    try {
      const res = await fetch("/api/service-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_type: "post_sale_operator_match",
          property_id: null,
          full_name: pmAgentName,
          email: pmAgentEmail,
          whatsapp: pmAgentPhone,
          preferred_contact: preferredContact,
          notes: pmNotes,
          form_data: {
            agency: pmAgencyName,
            rera: pmReraNumber,
            owner: { name: ownerName, email: ownerEmail, phone: ownerPhone },
            property: {
              building: pmBuilding, area: pmArea, unitSize: pmUnitSize, unitType: pmUnitType,
              floor: pmFloor, view: pmView, furnished: pmFurnished, condition: pmCondition,
              purchasePrice: purchasePrice || null,
            },
            handoverStatus, goLiveTimeline, priorities,
          },
        }),
      });
      if (res.ok) {
        setPmSubmitted(true);
      } else {
        setPmError("Submission failed. Please try again.");
      }
    } catch {
      setPmError("Submission failed. Please try again.");
    } finally {
      setPmSubmitting(false);
    }
  }

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh", fontFamily: sans, color: colors.textMain }}>
      <SiteNav />

      {/* HERO */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: isMobile ? "auto" : "720px" }}>
        {/* Right image (desktop/tablet) */}
        {!isMobile && (
          <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "58%", zIndex: 0 }}>
            <img
              src="/images/agent-tools-hero.png"
              alt="Real estate agents reviewing an investor property report"
              style={{
                width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block",
                maskImage: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.08) 20%, rgba(0,0,0,0.35) 36%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,1) 65%, rgba(0,0,0,1) 100%)",
                WebkitMaskImage: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.08) 20%, rgba(0,0,0,0.35) 36%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,1) 65%, rgba(0,0,0,1) 100%)",
              }}
            />
            {/* Bottom fade into page background */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, rgba(248,244,238,0) 55%, rgba(248,244,238,0.75) 82%, rgba(248,244,238,1) 100%)",
            }} />
          </div>
        )}

        {/* Mobile full-bleed background image */}
        {isMobile && (
          <>
            <img
              src="/images/agent-tools-hero.png"
              alt="Real estate agents reviewing an investor property report"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "60% center" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "rgba(248,244,238,0.90)" }} />
          </>
        )}

        {/* Left ivory fade (desktop) */}
        {!isMobile && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 1,
            background: "linear-gradient(90deg, rgba(248,244,238,0.98) 0%, rgba(248,244,238,0.92) 28%, rgba(248,244,238,0.70) 48%, rgba(248,244,238,0.22) 70%, rgba(248,244,238,0) 100%)",
          }} />
        )}

        {/* Soft radial glow behind text */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "radial-gradient(circle at 30% 45%, rgba(255,255,255,0.65), rgba(255,255,255,0) 45%)",
        }} />

        {/* Text content */}
        <div style={{
          position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto",
          padding: isMobile ? "56px 20px 64px" : "120px 40px 100px",
          width: isMobile ? "100%" : "45%",
          textAlign: isMobile ? "center" : "left",
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: colors.secondary, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>
            Agent Intelligence Platform
          </p>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(34px, 4.2vw, 52px)", color: colors.primary, fontWeight: 600, lineHeight: 1.15, marginBottom: 20 }}>
            Data-Backed Property Reports For Dubai Agents
          </h1>
          <p style={{ fontSize: 17, color: colors.textMuted, lineHeight: 1.65, marginBottom: 10, maxWidth: isMobile ? "none" : 480 }}>
            Generate investor-ready reports using live DLD sales transactions, long-term rental benchmarks, and AssetIntel STR intelligence — helping your clients make smarter investment decisions.
          </p>
          <p style={{ fontSize: 15, color: colors.secondary, fontWeight: 600, marginBottom: 30 }}>
            Don&apos;t just send a listing. Send the investment case.
          </p>
          <div style={{ display: "flex", gap: 14, flexDirection: isMobile ? "column" : "row", justifyContent: isMobile ? "center" : "flex-start", flexWrap: "wrap" }}>
            <PrimaryButton fullWidth={isMobile} onClick={() => scrollTo("report-form")}>Create Agent Report</PrimaryButton>
            <SecondaryButton fullWidth={isMobile} onClick={() => scrollTo("report-form")}>Learn How It Works</SecondaryButton>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Report form */}
      <section id="report-form" style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ ...card, padding: 32 }}>
          <h2 style={{ fontFamily: serif, fontSize: 27, color: colors.primary, marginBottom: 24 }}>Create Agent Report</h2>

          {/* Report type */}
          <fieldset style={{ border: "none", padding: 0, marginBottom: 24 }}>
            <label style={label}>Report Type</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 10 }}>
              {REPORT_TYPES.map(r => (
                <button
                  key={r.id}
                  onClick={() => setReportType(r.id)}
                  style={{
                    padding: "10px 12px", borderRadius: 10, textAlign: "left", cursor: "pointer",
                    border: `1.5px solid ${reportType === r.id ? colors.primary : colors.border}`,
                    background: reportType === r.id ? colors.bgSage : colors.bgWhite,
                    fontSize: 13, fontWeight: 600, color: reportType === r.id ? colors.primary : colors.textMain,
                  }}
                >
                  {r.title}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Property details */}
          <fieldset style={{ border: "none", padding: 0, marginBottom: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: colors.secondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>Property Details</p>
            <div style={grid4}>
              <Field>
                <label style={label}>Building Name</label>
                <div ref={buildingRef} style={{ position: "relative" }}>
                  <input
                    style={inputStyle}
                    placeholder="Search by building name — e.g. Marina Gate, Forte…"
                    value={buildingSearch || building}
                    onChange={e => { setBuildingSearch(e.target.value); setBuilding(""); setDldKey(""); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                  />
                  {showSuggestions && buildingSearch.length >= 2 && (filteredDLD.length > 0 || filteredCurated.length > 0) && (
                    <div style={{
                      position: "absolute", zIndex: 20, width: "100%", marginTop: 4, borderRadius: 12,
                      overflow: "hidden", boxShadow: colors.shadowMd, background: colors.bgWhite, border: `1px solid ${colors.border}`,
                      maxHeight: 260, overflowY: "auto",
                    }}>
                      {filteredDLD.length > 0 && (
                        <div style={{ padding: "8px 14px 4px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.textMuted }}>DLD Verified</div>
                      )}
                      {filteredDLD.map(b => (
                        <button
                          key={b.key}
                          type="button"
                          style={{
                            width: "100%", textAlign: "left", padding: "10px 14px", fontSize: 13, color: colors.textMain,
                            background: "none", border: "none", borderBottom: `1px solid ${colors.border}`, cursor: "pointer",
                            display: "flex", justifyContent: "space-between", gap: 8,
                          }}
                          onMouseDown={() => {
                            setBuilding(b.displayName);
                            setDldKey(b.key);
                            setArea(DLD_AREA_TO_COMMUNITY[b.dldArea] ?? b.dldArea);
                            setBuildingSearch(""); setShowSuggestions(false);
                          }}
                        >
                          <span>{b.displayName}</span>
                          <span style={{ fontSize: 11, color: colors.primary, whiteSpace: "nowrap" }}>{DLD_AREA_TO_COMMUNITY[b.dldArea] ?? b.dldArea}</span>
                        </button>
                      ))}
                      {filteredCurated.map(b => (
                        <button
                          key={b}
                          type="button"
                          style={{
                            width: "100%", textAlign: "left", padding: "10px 14px", fontSize: 13, color: colors.textMain,
                            background: "none", border: "none", borderBottom: `1px solid ${colors.border}`, cursor: "pointer",
                          }}
                          onMouseDown={() => {
                            setBuilding(b);
                            setDldKey("");
                            setArea(BUILDINGS_DATABASE[b]?.area ?? "");
                            setBuildingSearch(""); setShowSuggestions(false);
                          }}
                        >
                          {b}
                        </button>
                      ))}
                      <button
                        type="button"
                        style={{ width: "100%", textAlign: "left", padding: "10px 14px", fontSize: 12, color: colors.textMuted, background: "none", border: "none", cursor: "pointer" }}
                        onMouseDown={() => { setBuilding(buildingSearch); setDldKey(""); setBuildingSearch(""); setShowSuggestions(false); }}
                      >
                        + Use &ldquo;{buildingSearch}&rdquo; anyway
                      </button>
                    </div>
                  )}
                </div>
              </Field>
              <Field><label style={label}>Area / Community</label><input style={inputStyle} value={area} onChange={e => setArea(e.target.value)} /></Field>
              <Field><label style={label}>Unit Size / Bedrooms</label>
                <select style={inputStyle} value={unitSize} onChange={e => setUnitSize(e.target.value as UnitSize)}>
                  {UNIT_SIZES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </Field>
              <Field><label style={label}>Unit Area (sqft) *</label><input type="number" style={inputStyle} value={unitAreaSqft} onChange={e => setUnitAreaSqft(e.target.value)} /></Field>
              <Field><label style={label}>Unit Type</label>
                <select style={inputStyle} value={unitType} onChange={e => setUnitType(e.target.value as UnitType)}>
                  {UNIT_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </Field>
              <Field><label style={label}>Floor</label><input type="number" style={inputStyle} value={floor} onChange={e => setFloor(e.target.value)} /></Field>
              <Field><label style={label}>View</label>
                <select style={inputStyle} value={view} onChange={e => setView(e.target.value as ViewType)}>
                  {VIEWS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </Field>
              <Field><label style={label}>Furnishing Status</label>
                <select style={inputStyle} value={furnished} onChange={e => setFurnished(e.target.value as FurnishOption)}>
                  <option>Unfurnished</option><option>Furnished</option><option>Premium Furnished</option>
                </select>
              </Field>
              <Field><label style={label}>Property Condition</label>
                <select style={inputStyle} value={condition} onChange={e => setCondition(e.target.value as PropertyCondition)}>
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field><label style={label}>Asking Price (AED, optional)</label><input type="number" style={inputStyle} value={askingPrice} onChange={e => setAskingPrice(e.target.value)} /></Field>
              {reportType === "offplan" && (
                <Field><label style={label}>Expected Handover Date</label><input type="date" style={inputStyle} value={handoverDate} onChange={e => setHandoverDate(e.target.value)} /></Field>
              )}
            </div>
          </fieldset>

          {/* Output options */}
          <fieldset style={{ border: "none", padding: 0, marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: colors.secondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>Output Options</p>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 10 }}>
              <input type="checkbox" checked={downloadPdf} onChange={e => setDownloadPdf(e.target.checked)} /> Download PDF
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 10, opacity: isLoggedIn ? 1 : 0.5 }} title={isLoggedIn ? "" : "Sign in to save reports"}>
              <input type="checkbox" checked={saveToDashboard} disabled={!isLoggedIn} onChange={e => setSaveToDashboard(e.target.checked)} />
              Save to Dashboard {!isLoggedIn && "(sign in to save reports)"}
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 10, opacity: isLoggedIn ? 1 : 0.5 }} title={isLoggedIn ? "" : "Sign in to email reports"}>
              <input type="checkbox" checked={emailToMyself} disabled={!isLoggedIn} onChange={e => setEmailToMyself(e.target.checked)} />
              Email to myself {!isLoggedIn && "(sign in to email reports)"}
            </label>
          </fieldset>

          {formError && <p style={{ color: colors.error, fontSize: 13, marginBottom: 12 }}>{formError}</p>}

          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <PrimaryButton onClick={handleGenerate} disabled={generating}>{generating ? "Generating..." : "Generate Agent Report"}</PrimaryButton>
            <span style={{ fontSize: 12, color: colors.secondary, fontWeight: 600 }}>Free during testing</span>
            {emailStatus === "sending" && <span style={{ fontSize: 12, color: colors.textMuted }}>Sending email...</span>}
            {emailStatus === "sent" && <span style={{ fontSize: 12, color: colors.success }}>Email sent.</span>}
            {emailStatus === "error" && <span style={{ fontSize: 12, color: colors.error }}>Email failed to send.</span>}
          </div>
        </div>

        {/* Results */}
        {hasResult && (
          <div id="report-results" style={{ ...card, padding: 32, marginTop: 24 }}>
            <h3 style={{ fontFamily: serif, fontSize: 25, color: colors.primary, marginBottom: 16 }}>{reportTypeLabel()}</h3>

            {reportType === "full" && strResult && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: colors.secondary, textTransform: "uppercase", marginBottom: 8 }}>Executive Investment Snapshot</p>
                <p style={{ fontSize: 14, color: colors.textMain, lineHeight: 1.7 }}>
                  {building || "This property"} in {area || "the selected area"}: estimated STR net income of AED {Math.round(strResult.annualNetToLandlord).toLocaleString()}/yr
                  at {(strResult.avgOccupancy * 100).toFixed(0)}% average occupancy, versus an LTR benchmark of {ltrStat ? `AED ${Math.round(ltrStat.median).toLocaleString()}/yr` : "limited market data"}.
                </p>
              </div>
            )}

            {(reportType === "full" || reportType === "sales") && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: colors.secondary, textTransform: "uppercase", marginBottom: 8 }}>Recent DLD Sales Evidence</p>
                {saleStat ? (
                  <>
                    <p style={{ fontSize: 13, color: colors.textMuted, marginBottom: 10 }}>
                      Median price AED {Math.round(saleStat.medianPrice).toLocaleString()} · {saleStat.medianAedPerSqft} AED/sqft · sample size {saleStat.n} · as of {saleStat.asOf}
                    </p>
                    <table style={{ width: "100%", fontSize: 12.5, borderCollapse: "collapse" }}>
                      <thead><tr style={{ color: colors.textMuted, textAlign: "left" }}><th>Date</th><th>Price</th><th>Sqft</th><th>AED/sqft</th></tr></thead>
                      <tbody>
                        {recentSales.map((t, i) => (
                          <tr key={i} style={{ borderTop: `1px solid ${colors.border}` }}>
                            <td style={{ padding: "6px 0" }}>{t.date}</td>
                            <td>AED {t.price.toLocaleString()}</td>
                            <td>{t.areaSqft}</td>
                            <td>{t.aedPerSqft}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : <p style={{ fontSize: 13, color: colors.textMuted }}>Limited data available for this building/bedroom mix — try expanding to the area level.</p>}
              </div>
            )}

            {(reportType === "full" || reportType === "ltr") && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: colors.secondary, textTransform: "uppercase", marginBottom: 8 }}>Long-Term Rental Benchmark</p>
                {ltrStat ? (
                  <p style={{ fontSize: 13, color: colors.textMuted }}>
                    Median rent AED {Math.round(ltrStat.median).toLocaleString()}/yr{ltrStat.p25 != null && ltrStat.p75 != null ? ` · range AED ${Math.round(ltrStat.p25).toLocaleString()} - ${Math.round(ltrStat.p75).toLocaleString()}` : ""} · sample size {ltrStat.n} · as of {ltrStat.asOf}
                  </p>
                ) : <p style={{ fontSize: 13, color: colors.textMuted }}>Limited data available — showing area-level guidance only.</p>}
              </div>
            )}

            {(reportType === "full" || reportType === "str" || reportType === "offplan") && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: colors.secondary, textTransform: "uppercase", marginBottom: 8 }}>Short-Term Rental Estimate</p>
                {strResult ? (
                  <p style={{ fontSize: 13, color: colors.textMuted }}>
                    Annual gross revenue AED {Math.round(strResult.annualRevenue).toLocaleString()} · net to owner AED {Math.round(strResult.annualNetToLandlord).toLocaleString()} ·
                    {" "}avg occupancy {(strResult.avgOccupancy * 100).toFixed(0)}% · avg ADR AED {Math.round(strResult.avgADR).toLocaleString()}
                  </p>
                ) : <p style={{ fontSize: 13, color: colors.textMuted }}>STR estimate unavailable for these inputs.</p>}
                {reportType === "offplan" && <Disclaimer text={OFFPLAN_DISCLAIMER} />}
              </div>
            )}

            {reportType === "full" && strResult && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: colors.secondary, textTransform: "uppercase", marginBottom: 8 }}>Yield Comparison</p>
                <p style={{ fontSize: 13, color: colors.textMuted }}>
                  LTR gross yield: {askingPrice && ltrStat ? ((ltrStat.median / Number(askingPrice)) * 100).toFixed(1) + "%" : "n/a"} ·
                  {" "}STR net yield: {strResult.netYield ? (strResult.netYield * 100).toFixed(1) + "%" : "n/a"}
                </p>
              </div>
            )}

            <Disclaimer text={GENERAL_DISCLAIMER} />
            <Disclaimer text={AGENT_DISCLAIMER} />
          </div>
        )}
      </section>

      {/* SECTION 4 — Post-sale STR support */}
      <section id="operator-match" style={{ background: colors.bgSage, padding: "56px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: colors.secondary, letterSpacing: "0.14em", textTransform: "uppercase", textAlign: "center", marginBottom: 12 }}>Post-Sale STR Support</p>
          <h2 style={{ fontFamily: serif, fontSize: 31, color: colors.primary, textAlign: "center", marginBottom: 14 }}>After The Deal Closes, Bring The Property Back To AssetIntel</h2>
          <p style={{ fontSize: 15, color: colors.textMuted, textAlign: "center", maxWidth: 720, margin: "0 auto 8px", lineHeight: 1.6 }}>
            Once your buyer completes the purchase, AssetIntel can help review the property again and privately match it with suitable STR operators based on the building, unit type, furnishing status, expected performance, and owner priorities.
          </p>
          <p style={{ fontSize: 14, color: colors.secondary, fontWeight: 600, textAlign: "center", marginBottom: 32 }}>
            Help your client move from purchase to STR onboarding with a clear next step.
          </p>

          <div style={grid4}>
            {[
              { title: "Submit The Purchased Property", body: "Add the final property details after transfer, including building, unit size, floor, view, furnishing status, and handover timeline." },
              { title: "AssetIntel Reviews Operator Fit", body: "We assess the property against operator service models, area coverage, commercial terms, furnishing readiness, and owner priorities." },
              { title: "Private Operator Match", body: "Suitable operator options are shared privately with the owner or agent, instead of being shown publicly on the website." },
              { title: "STR Onboarding Guidance", body: "AssetIntel can guide the owner on furnishing, permits, photography, handover, and readiness before going live." },
            ].map(c => (
              <div key={c.title} style={{ ...card }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: colors.textMain, marginBottom: 8 }}>{c.title}</h3>
                <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.6 }}>{c.body}</p>
              </div>
            ))}
          </div>

          <div style={{ maxWidth: 780, margin: "32px auto 0", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.6, marginBottom: 8 }}>
              AssetIntel helps agents support investor clients beyond the sale. Once the buyer has completed the purchase, the property can be submitted for STR operator matching and onboarding guidance so the owner has a clearer route to income generation.
            </p>
            <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.6, marginBottom: 24 }}>
              This helps agents provide a more complete investment journey — from property selection to rental strategy to STR setup.
            </p>
            <PrimaryButton onClick={() => scrollTo("operator-match-form")}>Submit Property For Operator Match</PrimaryButton>
          </div>

          {/* Post-sale form */}
          <div id="operator-match-form" style={{ ...card, padding: 32, marginTop: 40, maxWidth: 900, marginLeft: "auto", marginRight: "auto" }}>
            <h3 style={{ fontFamily: serif, fontSize: 25, color: colors.primary, marginBottom: 20 }}>Submit Property For Operator Match</h3>

            {pmSubmitted ? (
              <p style={{ fontSize: 14, color: colors.success, lineHeight: 1.7 }}>
                Thank you — the property has been submitted for private operator matching. AssetIntel will review the property profile and contact the selected contact person with next steps.
              </p>
            ) : (
              <>
                <p style={{ fontSize: 13, fontWeight: 700, color: colors.secondary, textTransform: "uppercase", marginBottom: 14 }}>Agent</p>
                <div style={grid4}>
                  <Field><label style={label}>Agent Name</label><input style={inputStyle} value={pmAgentName} onChange={e => setPmAgentName(e.target.value)} /></Field>
                  <Field><label style={label}>Agency Name</label><input style={inputStyle} value={pmAgencyName} onChange={e => setPmAgencyName(e.target.value)} /></Field>
                  <Field><label style={label}>Phone / WhatsApp</label><input style={inputStyle} value={pmAgentPhone} onChange={e => setPmAgentPhone(e.target.value)} /></Field>
                  <Field><label style={label}>Email</label><input type="email" style={inputStyle} value={pmAgentEmail} onChange={e => setPmAgentEmail(e.target.value)} /></Field>
                  <Field><label style={label}>RERA Number (optional)</label><input style={inputStyle} value={pmReraNumber} onChange={e => setPmReraNumber(e.target.value)} /></Field>
                </div>

                <p style={{ fontSize: 13, fontWeight: 700, color: colors.secondary, textTransform: "uppercase", margin: "18px 0 14px" }}>Owner</p>
                <div style={grid4}>
                  <Field><label style={label}>Owner Name</label><input style={inputStyle} value={ownerName} onChange={e => setOwnerName(e.target.value)} /></Field>
                  <Field><label style={label}>Owner Email</label><input type="email" style={inputStyle} value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} /></Field>
                  <Field><label style={label}>Owner Phone / WhatsApp</label><input style={inputStyle} value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)} /></Field>
                  <Field>
                    <label style={label}>Preferred Contact</label>
                    <select style={inputStyle} value={preferredContact} onChange={e => setPreferredContact(e.target.value as "owner" | "agent" | "both")}>
                      <option value="owner">Contact owner directly</option>
                      <option value="agent">Contact agent first</option>
                      <option value="both">Contact both</option>
                    </select>
                  </Field>
                </div>

                <p style={{ fontSize: 13, fontWeight: 700, color: colors.secondary, textTransform: "uppercase", margin: "18px 0 14px" }}>Property</p>
                <div style={grid4}>
                  <Field><label style={label}>Building Name</label><input style={inputStyle} value={pmBuilding} onChange={e => setPmBuilding(e.target.value)} /></Field>
                  <Field><label style={label}>Area / Community</label><input style={inputStyle} value={pmArea} onChange={e => setPmArea(e.target.value)} /></Field>
                  <Field><label style={label}>Unit Size</label>
                    <select style={inputStyle} value={pmUnitSize} onChange={e => setPmUnitSize(e.target.value as UnitSize)}>
                      {UNIT_SIZES.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </Field>
                  <Field><label style={label}>Unit Type</label>
                    <select style={inputStyle} value={pmUnitType} onChange={e => setPmUnitType(e.target.value as UnitType)}>
                      {UNIT_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </Field>
                  <Field><label style={label}>Floor</label><input type="number" style={inputStyle} value={pmFloor} onChange={e => setPmFloor(e.target.value)} /></Field>
                  <Field><label style={label}>View</label>
                    <select style={inputStyle} value={pmView} onChange={e => setPmView(e.target.value as ViewType)}>
                      {VIEWS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </Field>
                  <Field><label style={label}>Furnishing Status</label>
                    <select style={inputStyle} value={pmFurnished} onChange={e => setPmFurnished(e.target.value as FurnishOption)}>
                      <option>Unfurnished</option><option>Furnished</option><option>Premium Furnished</option>
                    </select>
                  </Field>
                  <Field><label style={label}>Property Condition</label>
                    <select style={inputStyle} value={pmCondition} onChange={e => setPmCondition(e.target.value as PropertyCondition)}>
                      {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field><label style={label}>Purchase Price (optional)</label><input type="number" style={inputStyle} value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} /></Field>
                  <Field><label style={label}>Handover Status</label>
                    <select style={inputStyle} value={handoverStatus} onChange={e => setHandoverStatus(e.target.value)}>
                      <option>Ready</option><option>Recently transferred</option><option>Upcoming handover</option><option>Tenant occupied</option><option>Needs furnishing</option>
                    </select>
                  </Field>
                  <Field><label style={label}>Target Go-Live Timeline</label>
                    <select style={inputStyle} value={goLiveTimeline} onChange={e => setGoLiveTimeline(e.target.value)}>
                      <option>Immediately</option><option>2-4 weeks</option><option>1-2 months</option><option>3+ months</option>
                    </select>
                  </Field>
                </div>

                <p style={{ fontSize: 13, fontWeight: 700, color: colors.secondary, textTransform: "uppercase", margin: "18px 0 12px" }}>Owner Priorities</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 8, marginBottom: 18 }}>
                  {PRIORITY_OPTIONS.map(p => (
                    <label key={p} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                      <input type="checkbox" checked={priorities.includes(p)} onChange={() => togglePriority(p)} /> {p}
                    </label>
                  ))}
                </div>

                <Field>
                  <label style={label}>Message / Notes</label>
                  <textarea style={{ ...inputStyle, minHeight: 90 }} value={pmNotes} onChange={e => setPmNotes(e.target.value)} />
                </Field>
                <p style={{ fontSize: 12, color: colors.textLight, marginBottom: 16 }}>Have documents to share? Reply to the confirmation email.</p>

                {pmError && <p style={{ color: colors.error, fontSize: 13, marginBottom: 12 }}>{pmError}</p>}

                <PrimaryButton onClick={submitOperatorMatch} disabled={pmSubmitting} fullWidth>
                  {pmSubmitting ? "Submitting..." : "Submit For Private Operator Match"}
                </PrimaryButton>
              </>
            )}

            <div style={{ marginTop: 20 }}>
              <Disclaimer text={OPERATOR_DISCLAIMER} />
              <Disclaimer text={BROKERAGE_DISCLAIMER} />
            </div>
          </div>
        </div>
      </section>

      {/* General disclaimer footer */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "24px 24px 64px" }}>
        <Disclaimer text={GENERAL_DISCLAIMER} />
      </section>

      <ConsultationBanner />
    </div>
  );
}
