"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getLTRMarketRent,
  BUILDING_DIRECTORY,
  type UnitSize,
  type ViewType,
} from "@/lib/estimator";
import { BUILDINGS_DATABASE } from "@/lib/buildings-data";
import { getDLDBuildingList, type DLDBuildingEntry } from "@/lib/building-rents";
import { DLD_AREA_TO_COMMUNITY } from "@/lib/dld-area-map";
import AccessGate from "@/components/AccessGate";

// ─── Constants ───────────────────────────────────────────────────────────────

const C = {
  primary: "#1B5E4A",
  bronze: "#B88A44",
  bg: "#F7F9F8",
  surface: "#FFFFFF",
  border: "#E2E8E5",
  text: "#0F1D18",
  muted: "#4E5D56",
  risk: {
    low: "#2D7A4F",
    medium: "#A37020",
    high: "#C25A1A",
    vhigh: "#B83232",
  },
};

const serif = "var(--font-display), ui-sans-serif, system-ui, sans-serif";

const stk = (c: string, w = 1.4) => ({
  stroke: c, strokeWidth: w, fill: "none",
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
});

// ─── Subleasing-eligible unit sizes ──────────────────────────────────────────

const SUBLEASING_SIZES: { label: UnitSize; display: string }[] = [
  { label: "STU", display: "Studio" },
  { label: "1BR", display: "1 Bedroom" },
  { label: "2BR", display: "2 Bedroom" },
  { label: "3BR", display: "3 Bedroom" },
];

const VIEWS: ViewType[] = [
  "Burj / Downtown Skyline",
  "Marina / Waterfront",
  "Sea View",
  "Golf / Park View",
  "Community View",
  "Standard View",
];

// ─── Furnishing quality ───────────────────────────────────────────────────────

type FurnishingQuality = "Basic" | "Standard" | "Premium" | "Luxury";

const FURNISHING_CONFIG: Record<FurnishingQuality, {
  revMult: number; display: string; tip: string;
  tier: "pass" | "warn" | "fail"; color: string; bg: string;
}> = {
  Basic:    { revMult: 0.82, display: "Basic",             tip: "Minimal or dated furniture — not hotel-grade", tier: "fail", color: "#B83232", bg: "#FDE8E8" },
  Standard: { revMult: 0.93, display: "Standard",          tip: "Decent but not styled to STR standard — needs improvement", tier: "warn", color: "#C25A1A", bg: "#FEF0E8" },
  Premium:  { revMult: 1.00, display: "Premium",           tip: "Hotel-style staging, quality linens, clean aesthetic", tier: "pass", color: "#2D7A4F", bg: "#E8F5EE" },
  Luxury:   { revMult: 1.10, display: "Luxury / Designer", tip: "Designer furniture, high-end finishes, strong listing photography", tier: "pass", color: "#1B5E4A", bg: "#D0EDE0" },
};

function getViewTier(view: ViewType): "premium" | "good" | "weak" {
  if (["Sea View", "Burj / Downtown Skyline", "Marina / Waterfront"].includes(view)) return "premium";
  if (["Community View"].includes(view)) return "good";
  return "weak";
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconBed = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" {...stk(color, 1.3)}>
    <path d="M3 17v-4a2 2 0 012-2h14a2 2 0 012 2v4" />
    <path d="M3 17v2M21 17v2M3 13h18" />
    <path d="M7 11V9a1 1 0 011-1h3v3" />
  </svg>
);

const IconSofa = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...stk(color)}>
    <rect x="3" y="10" width="18" height="7" rx="2" />
    <path d="M5 10V8a2 2 0 012-2h10a2 2 0 012 2v2" />
    <path d="M3 14v3M21 14v3M6 17v2M18 17v2" />
  </svg>
);

const IconShield = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" {...stk(color, 1.6)}>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
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
  furnishingQuality: FurnishingQuality;
  monthlyRent: string;
  managementFeeMode: "self" | "operator";
  managementFeeCustom: string;
}

// ─── Advisory panel items ─────────────────────────────────────────────────────

const ADVISORY_ITEMS = [
  { text: "Can the unit cover fixed rent every month?" },
  { text: "What occupancy is needed to break even?" },
  { text: "How much cash buffer is required for low season?" },
  { text: "Is the risk level acceptable before signing?" },
  { text: "Should you proceed, negotiate, or avoid?" },
];

// ─── Inner component (uses useSearchParams) ───────────────────────────────────

function SubleasingEstimatorInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buildingRef = useRef<HTMLDivElement>(null);

  const [buildingSearch, setBuildingSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [ltrHint, setLtrHint] = useState<{ rent: number; source: string } | null>(null);

  // Pre-populate from URL params (when returning from result via "Edit Inputs")
  const [form, setForm] = useState<SublForm>(() => {
    const b = searchParams.get("b") ?? "";
    const sz = (searchParams.get("sz") ?? "") as UnitSize | "";
    const fl = searchParams.get("fl") ?? "";
    const vw = (searchParams.get("vw") ?? "") as ViewType | "";
    const fq = (searchParams.get("fq") as FurnishingQuality) ?? "Premium";
    const mr = searchParams.get("mr") ?? "";
    const mm = (searchParams.get("mm") ?? "operator") as "self" | "operator";
    const mf = searchParams.get("mf") ?? "20";
    return {
      buildingName: b,
      dldKey: searchParams.get("dk") ?? "",
      dldArea: searchParams.get("da") ?? "",
      unitSize: sz,
      floor: fl,
      view: vw,
      furnishingQuality: fq,
      monthlyRent: mr,
      managementFeeMode: mm,
      managementFeeCustom: mf,
    };
  });

  // Restore building search field when pre-populated
  useEffect(() => {
    if (form.buildingName && !buildingSearch) {
      setBuildingSearch(form.buildingName);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k: keyof SublForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (buildingRef.current && !buildingRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
  void mgmtFee;

  const canCalculate = !!(form.buildingName && form.unitSize && form.floor &&
    Number(form.floor) >= 1 && form.view && form.monthlyRent && Number(form.monthlyRent) > 0);

  async function handleCalculate() {
    if (!canCalculate || calculating) return;
    setCalculating(true);
    const params = new URLSearchParams({
      b: form.buildingName,
      sz: form.unitSize,
      fl: form.floor,
      vw: form.view,
      fq: form.furnishingQuality,
      mr: form.monthlyRent,
      mm: form.managementFeeMode,
      mf: form.managementFeeCustom,
      cm: communityDisplay,
    });
    if (form.dldKey) params.set("dk", form.dldKey);
    if (form.dldArea) params.set("da", form.dldArea);

    // Pre-fetch live DLD LTR rent — wait up to 1s so the result page can show
    // live data immediately without any static-then-live flash.
    try {
      const project = form.dldKey || form.buildingName;
      const qs = new URLSearchParams({ project, bedrooms: form.unitSize });
      if (form.dldArea) qs.set("area", form.dldArea);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1000);
      const res = await fetch(`/api/ltr-rents?${qs}`, { signal: controller.signal });
      clearTimeout(timer);
      const data = await res.json();
      if (data?.stat?.median && (data.source === "dda-live" || data.source === "dda-live-cached")) {
        params.set("lr", String(Math.round(data.stat.median)));
      }
    } catch { /* timeout or network — result page spinner handles it */ }

    router.push(`/self-manage/str-subleasing/estimator/result?${params.toString()}`);
  }

  const fmt = (n: number) => Math.round(n).toLocaleString();

  // Section completion for progress
  const sec1Done = !!(form.buildingName && form.unitSize);
  const sec2Done = !!(form.floor && Number(form.floor) >= 1 && form.view);
  const sec3Done = !!(form.monthlyRent && Number(form.monthlyRent) > 0);
  const completedSections = [sec1Done, sec2Done, sec3Done].filter(Boolean).length;
  const progressPct = (completedSections / 3) * 100;

  return (
    <main style={{
      minHeight: "100vh",
      fontFamily: "system-ui, sans-serif",
      background: C.bg,
    }}>

      {/* ─── HERO SECTION (image contained here only) ─── */}
      <div style={{ position: "relative", overflow: "hidden", isolation: "isolate" }}>

        {/* Dubai skyline watermark — scoped inside hero */}
        <img
          src="/Locations/Marina.png"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute", top: 0, right: 0,
            width: "60%", height: "100%",
            objectFit: "cover", objectPosition: "center top",
            opacity: 0.22,
            filter: "contrast(1.04) saturate(0.85)",
            pointerEvents: "none", zIndex: 0,
          }}
        />
        {/* Overlay: left fade + bottom fade blended as a single cream gradient layer */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: `
            linear-gradient(to right, ${C.bg} 0%, ${C.bg} 35%, rgba(250,250,248,0.85) 52%, rgba(250,250,248,0.3) 68%, transparent 82%),
            linear-gradient(to bottom, transparent 0%, transparent 50%, rgba(250,250,248,0.6) 78%, ${C.bg} 100%)
          `,
        }} />

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 2, maxWidth: "1280px", margin: "0 auto", padding: "52px 24px 52px" }}>
          <button
            onClick={() => router.push("/self-manage/str-subleasing")}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: C.surface, border: `1px solid ${C.border}`, color: C.primary, fontSize: "12px", fontWeight: 600, padding: "6px 14px", borderRadius: "8px", cursor: "pointer", marginBottom: "28px" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={C.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            STR Sub-Leasing
          </button>

          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", color: C.bronze, marginBottom: "14px" }}>
            STR SUB-LEASING RISK ESTIMATOR
          </div>
          <h1 style={{
            fontFamily: serif,
            fontSize: "clamp(30px, 5vw, 48px)",
            fontWeight: 700,
            lineHeight: 1.12,
            marginBottom: "16px",
            maxWidth: "620px",
            background: `linear-gradient(135deg, ${C.primary} 0%, ${C.bronze} 100%)`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Check The Unit Before You Sign The Lease
          </h1>
          <p style={{ fontSize: "15px", color: C.muted, lineHeight: 1.7, maxWidth: "560px", marginBottom: "28px" }}>
            Estimate whether a sub-leased unit can cover fixed rent, survive low season, and produce realistic profit before committing to the landlord.
          </p>

          {/* Trust chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[
              { label: "Break-even occupancy", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 18l5-5 4 3 7-8" stroke={C.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg> },
              { label: "Risk score included", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke={C.bronze} strokeWidth="1.8" strokeLinejoin="round" /></svg> },
              { label: "Apartments only", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="6" y="3" width="12" height="18" rx="1" stroke={C.primary} strokeWidth="1.6" /></svg> },
              { label: "Studio to 3BR", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 17v-4a2 2 0 012-2h14a2 2 0 012 2v4" stroke={C.primary} strokeWidth="1.6" strokeLinecap="round" /><path d="M3 13h18" stroke={C.primary} strokeWidth="1.4" strokeLinecap="round" /></svg> },
            ].map(({ label, icon }) => (
              <div key={label} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "20px", padding: "5px 12px 5px 10px" }}>
                {icon}
                <span style={{ fontSize: "12px", fontWeight: 600, color: C.text }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* ─── END HERO — image does not extend past this point ─── */}

      {/* ─── ESTIMATOR CONTENT SECTION — clean background, no image ─── */}
      <div style={{ background: C.bg, position: "relative", zIndex: 3 }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px 80px" }}>
        <AccessGate source="str-subleasing-estimator-form" title="Unlock The Risk Estimator" subtitle="Free — sign up or log in to check whether a sub-leased unit can cover rent.">

        {/* ─── Two-column layout ─── */}
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

          {/* ─── Form card ─── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "28px",
              boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 12px 32px rgba(0,0,0,.07), 0 24px 48px rgba(0,0,0,.04)",
              overflow: "hidden",
            }}>

              {/* Progress bar */}
              <div style={{ height: "3px", background: C.border }}>
                <div style={{ height: "100%", width: `${progressPct}%`, background: `linear-gradient(90deg, ${C.primary}, ${C.bronze})`, transition: "width 0.5s ease" }} />
              </div>

              <div style={{ padding: "clamp(28px, 5vw, 44px)" }}>

                {/* ── SECTION 1: Property Details ── */}
                <div style={{ marginBottom: "36px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: sec1Done ? C.primary : C.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {sec1Done
                        ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.2L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : <span style={{ fontSize: "10px", fontWeight: 700, color: C.surface }}>1</span>}
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: C.primary, marginBottom: "1px" }}>SECTION 1 OF 3</div>
                      <div style={{ fontSize: "18px", fontWeight: 500, color: C.bronze, fontFamily: serif }}>Property Details</div>
                    </div>
                  </div>

                  {/* Building autocomplete */}
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.09em", color: C.muted, marginBottom: "8px" }}>BUILDING / DEVELOPMENT</label>
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
                        style={{
                          width: "100%", padding: "14px 18px",
                          border: `1.5px solid ${form.buildingName ? C.bronze : C.border}`,
                          borderRadius: "14px", fontSize: "14px", color: C.text,
                          background: C.bg, outline: "none", boxSizing: "border-box",
                          boxShadow: form.buildingName ? `0 0 0 3px ${C.bronze}18` : "none",
                          transition: "all 0.15s",
                        }}
                      />
                      {form.buildingName && (
                        <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "12px", fontWeight: 600, color: C.primary, padding: "3px 10px", background: `${C.primary}0D`, borderRadius: "20px", border: `1px solid ${C.primary}30` }}>
                            {form.buildingName}
                          </span>
                          {communityDisplay && <span style={{ fontSize: "12px", color: C.muted }}>{communityDisplay}</span>}
                          {ltrHint && <span style={{ fontSize: "12px", color: C.muted }}>· LTR market: AED {fmt(ltrHint.rent)}/mo</span>}
                        </div>
                      )}
                      {showSuggestions && (filteredDLD.length > 0 || filteredCurated.length > 0) && (
                        <div style={{
                          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                          background: C.surface, border: `1px solid ${C.border}`, borderRadius: "16px",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.14)", zIndex: 50, maxHeight: "280px", overflowY: "auto",
                        }}>
                          {filteredDLD.length > 0 && (
                            <>
                              <div style={{ padding: "10px 16px 4px", fontSize: "10px", fontWeight: 700, color: C.muted, letterSpacing: "0.1em" }}>DLD VERIFIED</div>
                              {filteredDLD.map(b => (
                                <div key={b.key}
                                  onClick={() => { set("buildingName", b.displayName); set("dldKey", b.key); set("dldArea", b.dldArea); setBuildingSearch(b.displayName); setShowSuggestions(false); set("monthlyRent", ""); }}
                                  style={{ padding: "11px 16px", cursor: "pointer", borderBottom: `1px solid ${C.border}` }}
                                  onMouseEnter={e => (e.currentTarget.style.background = C.bg)}
                                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                  <div style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>{b.displayName}</div>
                                  <div style={{ fontSize: "11px", color: C.muted }}>{DLD_AREA_TO_COMMUNITY[b.dldArea] ?? b.dldArea}</div>
                                </div>
                              ))}
                            </>
                          )}
                          {filteredCurated.map(b => (
                            <div key={b}
                              onClick={() => { const rec = BUILDINGS_DATABASE[b]; set("buildingName", b); set("dldKey", rec?.dldKey ?? ""); set("dldArea", rec?.dldArea ?? ""); setBuildingSearch(b); setShowSuggestions(false); set("monthlyRent", ""); }}
                              style={{ padding: "11px 16px", cursor: "pointer", fontSize: "13px", color: C.text, borderBottom: `1px solid ${C.border}` }}
                              onMouseEnter={e => (e.currentTarget.style.background = C.bg)}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                              {b}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Unit size — premium cards */}
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.09em", color: C.muted, marginBottom: "10px" }}>UNIT SIZE</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "10px" }}>
                      {SUBLEASING_SIZES.map(({ label, display }) => {
                        const active = form.unitSize === label;
                        return (
                          <button key={label}
                            onClick={() => { set("unitSize", label); set("monthlyRent", ""); }}
                            style={{
                              position: "relative", padding: "14px 8px 12px",
                              borderRadius: "14px",
                              border: `1.5px solid ${active ? C.primary : C.border}`,
                              background: active ? `${C.primary}0D` : C.bg,
                              cursor: "pointer", textAlign: "center",
                              boxShadow: active ? `0 4px 14px ${C.primary}1A` : "none",
                              transition: "all 0.15s",
                            }}>
                            {active && (
                              <span style={{ position: "absolute", top: "7px", right: "7px", width: "16px", height: "16px", borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.2L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              </span>
                            )}
                            <div style={{ marginBottom: "6px", display: "flex", justifyContent: "center" }}>
                              <IconBed color={active ? C.primary : C.muted} />
                            </div>
                            <div style={{ fontSize: "12px", fontWeight: active ? 700 : 500, color: active ? C.primary : C.text, lineHeight: 1.3 }}>{display}</div>
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: "10px", padding: "10px 14px", background: `${C.primary}08`, borderRadius: "10px", border: `1px solid ${C.primary}18` }}>
                      <p style={{ fontSize: "12px", color: C.primary, margin: 0, lineHeight: 1.55 }}>
                        Studio and 1BR are optimal for sub-leasing — lower rent obligations, faster to fill, simpler to operate.
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ height: "1px", background: `linear-gradient(to right, transparent, ${C.border}, transparent)`, marginBottom: "36px" }} />

                {/* ── SECTION 2: Location & Unit Quality ── */}
                <div style={{ marginBottom: "36px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: sec2Done ? C.primary : C.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {sec2Done
                        ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.2L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : <span style={{ fontSize: "10px", fontWeight: 700, color: C.surface }}>2</span>}
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: C.primary, marginBottom: "1px" }}>SECTION 2 OF 3</div>
                      <div style={{ fontSize: "18px", fontWeight: 500, color: C.bronze, fontFamily: serif }}>Location & Unit Quality</div>
                    </div>
                  </div>

                  {/* Floor */}
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, letterSpacing: "0.09em", color: C.muted, marginBottom: "8px" }}>
                      <span>FLOOR NUMBER</span>
                      {form.floor && (
                        <span style={{ fontSize: "11px", fontWeight: 600, color: Number(form.floor) >= 20 ? C.risk.low : Number(form.floor) >= 10 ? C.risk.medium : C.risk.high }}>
                          {Number(form.floor) >= 20 ? "High floor — excellent" : Number(form.floor) >= 10 ? "Mid floor — acceptable" : "Low floor — risky"}
                        </span>
                      )}
                    </label>
                    <input
                      type="number" min="1" max="120"
                      value={form.floor}
                      onChange={e => set("floor", e.target.value)}
                      placeholder="e.g. 22"
                      style={{
                        width: "100%", padding: "14px 18px",
                        border: `1.5px solid ${form.floor ? (Number(form.floor) >= 10 ? `${C.bronze}88` : C.risk.high) : C.border}`,
                        borderRadius: "14px", fontSize: "14px", color: C.text,
                        background: C.bg, outline: "none", boxSizing: "border-box",
                        boxShadow: form.floor && Number(form.floor) >= 10 ? `0 0 0 3px ${C.bronze}14` : "none",
                        transition: "all 0.15s",
                      }}
                    />
                    {form.floor && Number(form.floor) < 10 && (
                      <p style={{ fontSize: "12px", color: C.risk.high, marginTop: "6px", padding: "8px 12px", background: "#FEF0E8", borderRadius: "8px" }}>
                        Floor {form.floor} is below the recommended minimum of 10 for sub-leasing.
                      </p>
                    )}
                  </div>

                  {/* View */}
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.09em", color: C.muted, marginBottom: "10px" }}>PROPERTY VIEW</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      {VIEWS.map(v => {
                        const active = form.view === v;
                        const tier = getViewTier(v as ViewType);
                        return (
                          <button key={v}
                            onClick={() => set("view", v)}
                            style={{
                              padding: "12px 16px",
                              borderRadius: "18px",
                              cursor: "pointer",
                              textAlign: "left",
                              fontSize: "13px",
                              transition: "all 0.15s",
                              fontWeight: active ? 700 : 400,
                              color: active && tier !== "weak" ? "#FFF" : active ? C.text : C.muted,
                              ...(active && tier !== "weak"
                                ? { background: "linear-gradient(135deg, #B8893F 0%, #C69A4A 45%, #A9782F 100%)", border: "1px solid rgba(151,104,43,0.45)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 4px 14px rgba(120,80,30,0.18)" }
                                : active
                                ? { background: "#FEF0E8", border: `1.5px solid ${C.risk.high}`, boxShadow: "none" }
                                : { background: "rgba(255,254,250,0.9)", border: "1px solid rgba(35,93,72,0.12)", boxShadow: "none" }),
                            }}>
                            {v}
                          </button>
                        );
                      })}
                    </div>
                    {form.view && getViewTier(form.view as ViewType) === "weak" && (
                      <div style={{ marginTop: "8px", padding: "8px 12px", background: "#FEF0E8", borderRadius: "8px", border: "1px solid #F0C5A0", fontSize: "12px", color: C.risk.high }}>
                        Standard/garden views significantly limit your achievable nightly rate.
                      </div>
                    )}
                    {form.view && getViewTier(form.view as ViewType) === "premium" && (
                      <div style={{ marginTop: "8px", padding: "8px 12px", background: "#E8F5EE", borderRadius: "8px", border: "1px solid #B8DEC8", fontSize: "12px", color: C.risk.low }}>
                        Premium view — commands a strong nightly rate premium.
                      </div>
                    )}
                  </div>

                  {/* Furnishing Quality */}
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.09em", color: C.muted, marginBottom: "6px" }}>FURNISHING QUALITY</label>
                    <p style={{ fontSize: "12px", color: C.muted, marginBottom: "12px", lineHeight: 1.5 }}>
                      STR sub-leasing works best when the unit is furnished to a hotel-style standard. Weak furnishing reduces ADR, booking conversion, and reviews.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      {(["Basic", "Standard", "Premium", "Luxury"] as FurnishingQuality[]).map(q => {
                        const cfg = FURNISHING_CONFIG[q];
                        const active = form.furnishingQuality === q;
                        const accent = cfg.tier === "fail" ? C.risk.vhigh : cfg.tier === "warn" ? C.risk.high : C.primary;
                        return (
                          <button key={q}
                            onClick={() => set("furnishingQuality", q)}
                            style={{
                              padding: "14px 14px 12px",
                              borderRadius: "14px",
                              border: `1.5px solid ${active ? accent : C.border}`,
                              background: active ? cfg.bg : C.bg,
                              textAlign: "left", cursor: "pointer",
                              boxShadow: active ? `0 4px 14px ${accent}18` : "none",
                              transition: "all 0.15s",
                            }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                              <IconSofa color={active ? accent : C.muted} />
                              <span style={{ fontSize: "13px", fontWeight: 700, color: active ? accent : C.text }}>{cfg.display}</span>
                            </div>
                            <div style={{ fontSize: "11px", color: C.muted, lineHeight: 1.4 }}>{cfg.tip}</div>
                            {active && (
                              <div style={{ marginTop: "8px", display: "inline-block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em",
                                color: cfg.tier === "pass" ? C.risk.low : cfg.tier === "warn" ? C.risk.medium : C.risk.vhigh,
                                background: cfg.tier === "pass" ? "#E8F5EE" : cfg.tier === "warn" ? "#FEF0E8" : "#FDE8E8",
                                padding: "3px 8px", borderRadius: "20px" }}>
                                {cfg.tier === "pass" ? "PASS" : cfg.tier === "warn" ? "WARN" : "FAIL"}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {form.furnishingQuality === "Basic" && (
                      <div style={{ marginTop: "10px", padding: "10px 14px", background: "#FDE8E8", borderRadius: "10px", border: "1px solid #F0C0C0", fontSize: "12px", color: C.risk.vhigh, lineHeight: 1.55 }}>
                        Basic furnishing will significantly reduce ADR and cap the final recommendation at Negotiate. Upgrade furnishing or negotiate the rent lower before signing.
                      </div>
                    )}
                    {form.furnishingQuality === "Standard" && (
                      <div style={{ marginTop: "10px", padding: "10px 14px", background: "#FEF0E8", borderRadius: "10px", border: "1px solid #F0C5A0", fontSize: "12px", color: C.risk.high, lineHeight: 1.55 }}>
                        Standard furnishing reduces ADR. Upgrade key areas — living room, bedroom, lighting, linens, photography — before launch.
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ height: "1px", background: `linear-gradient(to right, transparent, ${C.border}, transparent)`, marginBottom: "36px" }} />

                {/* ── SECTION 3: Lease & Cost Assumptions ── */}
                <div style={{ marginBottom: "36px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: sec3Done ? C.primary : C.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {sec3Done
                        ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.2L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : <span style={{ fontSize: "10px", fontWeight: 700, color: C.surface }}>3</span>}
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: C.primary, marginBottom: "1px" }}>SECTION 3 OF 3</div>
                      <div style={{ fontSize: "18px", fontWeight: 500, color: C.bronze, fontFamily: serif }}>Lease & Cost Assumptions</div>
                    </div>
                  </div>

                  {/* Monthly rent */}
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.09em", color: C.muted, marginBottom: "8px" }}>
                      MONTHLY RENT TO LANDLORD (AED)
                    </label>
                    <input
                      type="number"
                      value={form.monthlyRent}
                      onChange={e => set("monthlyRent", e.target.value)}
                      placeholder="e.g. 8,500"
                      style={{
                        width: "100%", padding: "14px 18px",
                        border: `1.5px solid ${form.monthlyRent ? `${C.bronze}88` : C.border}`,
                        borderRadius: "14px", fontSize: "14px", color: C.text,
                        background: C.bg, outline: "none", boxSizing: "border-box",
                        boxShadow: form.monthlyRent ? `0 0 0 3px ${C.bronze}14` : "none",
                        transition: "all 0.15s",
                      }}
                    />
                    {ltrHint && (
                      <div style={{ marginTop: "10px", padding: "12px 16px", background: "#F5F0E8", borderRadius: "10px", border: "1px solid #E8D9BC" }}>
                        <p style={{ fontSize: "12.5px", color: C.muted, margin: 0 }}>
                          Market LTR: <strong style={{ color: C.text }}>AED {fmt(ltrHint.rent)}/mo</strong> · {ltrHint.source}.{" "}
                          Landlords charging for STR use typically ask 5–15% above LTR. Adjust accordingly.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Management model */}
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.09em", color: C.muted, marginBottom: "10px" }}>
                      MANAGEMENT MODEL
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      {[
                        { mode: "self" as const, label: "Self-Managed", sub: "You handle operations", fee: "0% fee", accent: C.primary },
                        { mode: "operator" as const, label: "With Operator", sub: "15–25% management fee", fee: "Paid operator", accent: C.bronze },
                      ].map(({ mode, label, sub, fee, accent }) => {
                        const active = form.managementFeeMode === mode;
                        return (
                          <button key={mode}
                            onClick={() => set("managementFeeMode", mode)}
                            style={{
                              padding: "18px 16px",
                              borderRadius: "14px",
                              border: `1.5px solid ${active ? accent : C.border}`,
                              background: active ? `${accent}0D` : C.bg,
                              textAlign: "left", cursor: "pointer",
                              boxShadow: active ? `0 4px 14px ${accent}18` : "none",
                              transition: "all 0.15s",
                            }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: active ? accent : C.border, marginBottom: "10px" }} />
                            <div style={{ fontSize: "14px", fontWeight: 700, color: active ? accent : C.text, marginBottom: "3px" }}>{label}</div>
                            <div style={{ fontSize: "12px", color: C.muted, marginBottom: "2px" }}>{sub}</div>
                            <div style={{ fontSize: "11px", fontWeight: 600, color: active ? accent : C.muted }}>{fee}</div>
                          </button>
                        );
                      })}
                    </div>
                    {form.managementFeeMode === "operator" && (
                      <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: `${C.bronze}08`, borderRadius: "10px", border: `1px solid ${C.bronze}25` }}>
                        <label style={{ fontSize: "12px", color: C.muted, whiteSpace: "nowrap", fontWeight: 600 }}>Operator fee:</label>
                        <input
                          type="number" min="10" max="30"
                          value={form.managementFeeCustom}
                          onChange={e => set("managementFeeCustom", e.target.value)}
                          style={{ width: "70px", padding: "8px 12px", border: `1.5px solid ${C.border}`, borderRadius: "8px", fontSize: "14px", fontWeight: 700, color: C.text, background: C.surface, outline: "none", textAlign: "center" }}
                        />
                        <span style={{ fontSize: "13px", color: C.muted }}>% of revenue</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── CTA ── */}
                <button
                  onClick={handleCalculate}
                  disabled={!canCalculate || calculating}
                  style={{
                    width: "100%", padding: "18px",
                    background: canCalculate && !calculating
                      ? `linear-gradient(135deg, ${C.primary} 0%, #0F3E33 100%)`
                      : C.border,
                    color: "#fff",
                    borderRadius: "14px", fontSize: "16px", fontWeight: 700,
                    cursor: canCalculate && !calculating ? "pointer" : "not-allowed",
                    border: "none",
                    boxShadow: canCalculate && !calculating ? `0 6px 22px ${C.primary}30` : "none",
                    transition: "all 0.2s",
                    letterSpacing: "0.02em",
                  }}>
                  {calculating
                    ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                        <span style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                        Fetching live rental data…
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                      </span>
                    : "Calculate Risk & Profit →"}
                </button>

                {/* Advisory note */}
                <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <IconShield color={C.muted} />
                  <span style={{ fontSize: "12px", color: C.muted }}>Your data is used only to calculate this sub-leasing risk estimate.</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Right advisory panel ─── */}
          <div style={{
            width: "300px", flexShrink: 0,
            display: "flex", flexDirection: "column", gap: "16px",
            position: "sticky", top: "24px",
          }} className="estimator-panel-lg">

            <style>{`
              @media (max-width: 900px) { .estimator-panel-lg { display: none !important; } }
            `}</style>

            <div style={{
              background: `linear-gradient(160deg, ${C.primary}08 0%, ${C.bronze}0A 100%)`,
              border: `1px solid ${C.primary}20`,
              borderRadius: "20px",
              padding: "28px 26px",
            }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: C.bronze, marginBottom: "12px" }}>RISK ESTIMATOR</div>
              <h3 style={{ fontFamily: serif, fontSize: "17px", fontWeight: 500, color: C.text, marginBottom: "10px", lineHeight: 1.35 }}>What This Estimator Checks</h3>
              <p style={{ fontSize: "13px", color: C.muted, lineHeight: 1.65, marginBottom: "20px" }}>
                Before signing a lease, AssetIntel analyses whether the unit&apos;s economics work in your favour.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {ADVISORY_ITEMS.map(({ text }) => (
                  <div key={text} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{ marginTop: "2px", flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="8.5" stroke={C.primary} strokeWidth="1.2" opacity="0.3" />
                        <path d="M6.5 10L9 12.5L13.5 7.5" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span style={{ fontSize: "13px", color: C.text, lineHeight: 1.55 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "20px", padding: "24px 22px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: C.muted, marginBottom: "12px" }}>KEY THRESHOLDS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { label: "Low risk", range: "Break-even below 50%", color: C.risk.low, bg: "#E8F5EE" },
                  { label: "Medium risk", range: "Break-even 50–65%", color: C.risk.medium, bg: "#FEF3E2" },
                  { label: "High risk", range: "Break-even 65–80%", color: C.risk.high, bg: "#FEF0E8" },
                  { label: "Very High risk", range: "Break-even above 80%", color: C.risk.vhigh, bg: "#FDE8E8" },
                ].map(({ label, range, color, bg }) => (
                  <div key={label} style={{ padding: "10px 12px", background: bg, borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color }}>{label}</span>
                    <span style={{ fontSize: "11px", color: C.muted, textAlign: "right" }}>{range}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "20px", padding: "20px 22px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: C.muted, marginBottom: "10px" }}>NEED HELP?</div>
              <p style={{ fontSize: "12.5px", color: C.muted, lineHeight: 1.6, marginBottom: "14px" }}>
                Not sure which unit to run? The sub-leasing playbook covers area selection and unit screening.
              </p>
              <button
                onClick={() => router.push("/self-manage/str-subleasing")}
                style={{ width: "100%", padding: "10px", background: "transparent", border: `1.5px solid ${C.primary}`, color: C.primary, borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                View STR Playbook →
              </button>
            </div>
          </div>
        </div>

        {/* ─── Why This Matters section ─── */}
        <div style={{ marginTop: "52px", maxWidth: "860px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.13em", color: C.bronze, marginBottom: "12px" }}>CONTEXT</div>
          <h2 style={{ fontFamily: serif, fontSize: "26px", fontWeight: 500, color: C.text, marginBottom: "28px" }}>Why This Matters Before Signing</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            {[
              { title: "Fixed Rent Risk", body: "Your rent is fixed every month even when STR demand drops in summer or during slower booking periods." },
              { title: "Low Season Survival", body: "The unit must survive June–August when occupancy falls 30–50%. You still pay full landlord rent regardless." },
              { title: "Proceed / Negotiate / Avoid", body: "AssetIntel gives you a clear recommendation based on your break-even occupancy and risk score." },
            ].map(({ title, body }) => (
              <div key={title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "22px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.bronze, marginBottom: "12px" }} />
                <h3 style={{ fontFamily: serif, fontSize: "15px", fontWeight: 500, color: C.text, marginBottom: "8px" }}>{title}</h3>
                <p style={{ fontSize: "13px", color: C.muted, lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>

        </AccessGate>
        </div>{/* end inner max-width container */}
      </div>{/* end ESTIMATOR CONTENT SECTION */}
    </main>
  );
}

// ─── Main page export with Suspense boundary ──────────────────────────────────

export default function SubleasingEstimatorPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#F7F9F8" }} />}>
      <SubleasingEstimatorInner />
    </Suspense>
  );
}
