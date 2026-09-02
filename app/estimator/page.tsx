"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  UnitSize, UnitType, ViewType, FurnishedStatus, PropertyCondition,
  BUILDING_DIRECTORY, getLTRWarning, LTRAreaWarning, VIEW_PREMIUMS,
} from "@/lib/estimator";
import { BUILDINGS_DATABASE } from "@/lib/buildings-data";
import { getDLDBuildingList, type DLDBuildingEntry } from "@/lib/building-rents";
import { DLD_AREA_TO_COMMUNITY } from "@/lib/dld-area-map";
import { colors } from "@/lib/colors";
import DecorativeBackdrop from "@/components/DecorativeBackdrop";
import AccessGate from "@/components/AccessGate";

// ── Data ─────────────────────────────────────────────────────────────────────

const UNIT_SIZES: { label: UnitSize; type: UnitType }[] = [
  { label: "STU",       type: "Apartment" },
  { label: "1BR",       type: "Apartment" },
  { label: "2BR",       type: "Apartment" },
  { label: "3BR",       type: "Apartment" },
  { label: "4BR APT",   type: "Apartment" },
  { label: "5BR APT",   type: "Apartment" },
  { label: "6BR APT",   type: "Apartment" },
  { label: "4BR VILLA", type: "Villa" },
  { label: "5BR VILLA", type: "Villa" },
  { label: "6BR VILLA", type: "Villa" },
  { label: "7BR VILLA", type: "Villa" },
  { label: "8BR VILLA", type: "Villa" },
  { label: "9BR VILLA", type: "Villa" },
];

const UNIT_DISPLAY: Record<string, string> = {
  "STU":       "Studio",
  "1BR":       "1 Bedroom",
  "2BR":       "2 Bedroom",
  "3BR":       "3 Bedroom",
  "4BR APT":   "4 Bed Apartment",
  "5BR APT":   "5 Bed Apartment",
  "6BR APT":   "6 Bed Apartment",
  "4BR VILLA": "4 Bed Villa",
  "5BR VILLA": "5 Bed Villa",
  "6BR VILLA": "6 Bed Villa",
  "7BR VILLA": "7 Bed Villa",
  "8BR VILLA": "8 Bed Villa",
  "9BR VILLA": "9 Bed Villa",
};

const VIEWS: ViewType[] = [
  "Burj / Downtown Skyline", "Marina / Waterfront", "Sea View",
  "Golf / Park View", "Community View", "Standard View",
];

const DLD_BUILDINGS: DLDBuildingEntry[] = getDLDBuildingList();
const ALL_BUILDINGS = Array.from(
  new Set([...Object.keys(BUILDINGS_DATABASE), ...Object.keys(BUILDING_DIRECTORY)])
).sort();

// ── Helpers ───────────────────────────────────────────────────────────────────

const stk = (c: string, w = 1.3) => ({
  stroke: c, strokeWidth: w, fill: "none",
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
});

const OPT_SELECTED = {
  background: "linear-gradient(135deg, rgba(184,137,63,0.18) 0%, rgba(198,154,74,0.12) 50%, rgba(252,248,241,0.90) 100%)",
  border: "1.5px solid rgba(184,137,63,0.50)",
  boxShadow: "0 2px 8px rgba(184,137,63,0.10), 0 8px 20px rgba(184,137,63,0.08)",
} as const;
const OPT_UNSELECTED = {
  background: "#FFFDF8",
  border: "1px solid rgba(31,74,58,0.12)",
  boxShadow: "none",
} as const;

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M5 13l4 4L19 7" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Field label ───────────────────────────────────────────────────────────────

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-xs font-semibold tracking-wider mb-2" style={{ color: colors.textMuted }}>
    {children}{required && <span style={{ color: "#DC2626" }}> *</span>}
  </label>
);

// ── Shared input style ────────────────────────────────────────────────────────

const inputStyle = (active: boolean): React.CSSProperties => ({
  width: "100%",
  borderRadius: "14px",
  padding: "12px 16px",
  fontSize: "14px",
  outline: "none",
  background: colors.bgMain,
  border: `1.5px solid ${active ? colors.secondary : colors.border}`,
  color: colors.textMain,
  boxShadow: active ? `0 0 0 3px ${colors.secondary}15` : "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  appearance: "none" as const,
  WebkitAppearance: "none" as const,
});

// ── Title Deed Smart Upload ───────────────────────────────────────────────────

interface TitleDeedExtract {
  projectName: string | null;
  floor: string | null;
  areaSqft: number | null;
  bedrooms: string | null;
  areaName: string | null;
  propertyType: string | null;
  transactionValue: number | null;
  confidence: "high" | "medium" | "low";
}

function TitleDeedUpload({ onExtract }: { onExtract: (data: TitleDeedExtract) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [confidence, setConfidence] = useState<"high" | "medium" | "low" | null>(null);

  const handleFile = async (file: File) => {
    setState("uploading");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/parse-title-deed", { method: "POST", body: fd });
      if (!res.ok) throw new Error("parse failed");
      const data: TitleDeedExtract = await res.json();
      setConfidence(data.confidence);
      onExtract(data);
      setState("done");
    } catch {
      setState("error");
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const confColor = confidence === "high" ? "#1B5E4A" : confidence === "medium" ? "#B88A44" : "#888";
  const confLabel = confidence === "high" ? "High confidence — fields pre-filled" : confidence === "medium" ? "Medium confidence — please review fields" : null;

  return (
    <div style={{ marginTop: 24, borderTop: `1px solid ${colors.border}`, paddingTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.secondary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          <path d="M9 13h6M9 17h4"/>
        </svg>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: colors.textMuted, textTransform: "uppercase" }}>
          Title Deed Smart Upload
        </span>
        <span style={{ fontSize: 10, color: colors.textLight, fontWeight: 500 }}>— auto-fills your property details</span>
      </div>

      {state === "idle" && (
        <div
          onClick={() => fileRef.current?.click()}
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          style={{
            border: `1.5px dashed ${colors.border}`,
            borderRadius: 14,
            padding: "16px 20px",
            display: "flex", alignItems: "center", gap: 14,
            cursor: "pointer",
            background: colors.bgSection,
            transition: "border-color 0.15s, background 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = colors.primary; (e.currentTarget as HTMLDivElement).style.background = "#F4F9F6"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = colors.border; (e.currentTarget as HTMLDivElement).style.background = colors.bgSection; }}
        >
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `${colors.secondary}15`, border: `1px solid ${colors.secondary}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.secondary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: colors.textMain, margin: 0 }}>Upload your title deed</p>
            <p style={{ fontSize: 11, color: colors.textLight, margin: "2px 0 0" }}>JPEG, PNG or PDF — AI extracts property, floor, size & bedrooms</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={onFileChange} />
        </div>
      )}

      {state === "uploading" && (
        <div style={{ border: `1.5px dashed ${colors.border}`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, background: colors.bgSection }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${colors.primary}30`, borderTopColor: colors.primary, animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: colors.textMuted, margin: 0 }}>Reading your title deed…</p>
        </div>
      )}

      {state === "done" && (
        <div style={{ border: `1.5px solid ${confColor}30`, borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, background: `${confColor}08` }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={confColor} strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: confColor, margin: 0 }}>{confLabel ?? "Fields pre-filled from deed"}</p>
            <p style={{ fontSize: 11, color: colors.textLight, margin: "2px 0 0" }}>Review the fields above and make any corrections before generating.</p>
          </div>
          <button onClick={() => { setState("idle"); setConfidence(null); }} style={{ fontSize: 11, color: colors.textLight, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Upload another</button>
        </div>
      )}

      {state === "error" && (
        <div style={{ border: `1.5px solid #D9534F30`, borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, background: "#FDF5F5" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p style={{ fontSize: 13, color: "#C0392B", margin: 0, flex: 1 }}>Could not read the deed — try a clearer image or fill in manually.</p>
          <button onClick={() => setState("idle")} style={{ fontSize: 11, color: colors.textLight, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Try again</button>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function EstimatorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buildingRef = useRef<HTMLDivElement>(null);
  const [ltrWarning, setLtrWarning] = useState<LTRAreaWarning | null>(null);
  const [buildingSearch, setBuildingSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [propsearchSuggestions, setPropsearchSuggestions] = useState<string[]>([]);

  const [form, setForm] = useState({
    buildingName: "",
    unitSize: "" as UnitSize | "",
    unitType: "" as UnitType | "",
    floor: "",
    view: "" as ViewType | "",
    furnished: "" as FurnishedStatus | "",
    managementFee: "20",
    propertyValue: "",
    propertyValueDisplay: "",
    sizeSqm: "",
    sizeUnit: "sqft" as "sqm" | "sqft",
    dldKey: "",
    dldArea: "",
    propertyCondition: "Standard" as PropertyCondition,
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (buildingRef.current && !buildingRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const building   = searchParams.get("building")?.trim();
    const type       = searchParams.get("type")?.trim();
    const floor      = searchParams.get("floor")?.trim();
    const sizeSqm    = searchParams.get("sizeSqm")?.trim();
    const dldArea    = searchParams.get("dldArea")?.trim();
    const viewParam  = searchParams.get("view")?.trim();
    const furnParam  = searchParams.get("furnished")?.trim();
    const unitTypeP  = searchParams.get("unitType")?.trim();
    if (!building) return;

    const propType = searchParams.get("propertyType")?.toLowerCase() ?? "";
    const isVilla  = propType.includes("villa") || propType.includes("townhouse") || unitTypeP?.toLowerCase() === "villa";
    const unitType: UnitType = isVilla ? "Villa" : "Apartment";

    const dldEntry = DLD_BUILDINGS.find(
      b => b.displayName.toLowerCase() === building.toLowerCase() || b.key === building.toLowerCase()
    );

    setForm(f => ({
      ...f,
      buildingName: dldEntry?.displayName ?? building,
      unitSize: (type as UnitSize) || f.unitSize,
      unitType: (type || unitTypeP) ? unitType : f.unitType,
      floor: floor ?? f.floor,
      sizeSqm: sizeSqm ?? f.sizeSqm,
      dldArea: dldEntry?.dldArea ?? dldArea ?? f.dldArea,
      dldKey: dldEntry?.key ?? f.dldKey,
      ...(viewParam ? { view: viewParam as typeof f.view } : {}),
      ...(furnParam ? { furnished: furnParam as typeof f.furnished } : {}),
    }));
    setBuildingSearch(dldEntry?.displayName ?? building);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = buildingSearch.toLowerCase();
  const filteredDLD: DLDBuildingEntry[] = q.length >= 2
    ? DLD_BUILDINGS.filter(b => b.displayName.toLowerCase().includes(q)).slice(0, 8)
    : [];
  const filteredCurated = q.length >= 2
    ? ALL_BUILDINGS
        .filter(b => b.toLowerCase().includes(q) && !filteredDLD.some(d => d.displayName.toLowerCase() === b.toLowerCase()))
        .slice(0, Math.max(0, 8 - filteredDLD.length))
    : [];

  // Third-tier fallback: Propsearch's free 12k-building name lookup, only
  // fetched when our own DLD/curated lists come up short — purely so a real
  // building name gets recognized instead of falling through to "+ Use
  // anyway". No pricing metadata attached (that's a paid Propsearch scope).
  useEffect(() => {
    if (buildingSearch.length < 2 || filteredDLD.length + filteredCurated.length >= 5) {
      setPropsearchSuggestions([]);
      return;
    }
    const handle = setTimeout(() => {
      fetch(`/api/buildings/propsearch-search?q=${encodeURIComponent(buildingSearch)}`)
        .then(r => r.json())
        .then(({ results }: { results: string[] }) => {
          const known = new Set([
            ...filteredDLD.map(b => b.displayName.toLowerCase()),
            ...filteredCurated.map(b => b.toLowerCase()),
          ]);
          setPropsearchSuggestions(results.filter(r => !known.has(r.toLowerCase())));
        })
        .catch(() => setPropsearchSuggestions([]));
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingSearch]);

  const buildingInfo = BUILDING_DIRECTORY[form.buildingName] ||
    (form.dldArea ? { community: DLD_AREA_TO_COMMUNITY[form.dldArea] ?? form.dldArea, area: form.dldArea, tier: "mid" as const } : undefined) ||
    (BUILDINGS_DATABASE[form.buildingName]
      ? { community: BUILDINGS_DATABASE[form.buildingName].area, area: BUILDINGS_DATABASE[form.buildingName].area, tier: "mid" as const }
      : undefined);

  const maxFloors = buildingInfo && "maxFloors" in buildingInfo ? (buildingInfo as { maxFloors?: number }).maxFloors : undefined;
  const floorNum  = Number(form.floor);
  const floorExceeds = !!maxFloors && floorNum > maxFloors;
  const floorSuspect = !maxFloors && floorNum > 80;

  const canGenerate = !!(
    form.buildingName && form.unitSize && form.unitType &&
    form.floor && floorNum >= 1 && !floorExceeds && !floorSuspect &&
    form.view && form.furnished
  );

  const buildParams = () => new URLSearchParams({
    propertyName: `${form.buildingName} · ${form.unitSize} · Floor ${form.floor}`,
    buildingName: form.buildingName,
    unitSize: form.unitSize,
    unitType: form.unitType,
    floor: form.floor,
    view: form.view,
    furnished: form.furnished,
    managementFee: String(Number(form.managementFee) / 100),
    ...(form.propertyValue ? { propertyValue: form.propertyValue } : {}),
    ...(form.sizeSqm ? {
      sizeSqm: form.sizeUnit === "sqft"
        ? String(Math.round(Number(form.sizeSqm) / 10.7639))
        : form.sizeSqm,
    } : {}),
    ...(form.dldKey  ? { dldKey:  form.dldKey  } : {}),
    ...(form.dldArea ? { dldArea: form.dldArea } : {}),
    ...(form.propertyCondition !== "Standard" ? { propertyCondition: form.propertyCondition } : {}),
  });

  const [calculating, setCalculating] = useState(false);

  const navigate = async (params: URLSearchParams) => {
    setCalculating(true);
    const project = form.dldKey || form.buildingName;
    const bedrooms = form.unitSize;
    try {
      const qs = new URLSearchParams({ project, bedrooms });
      if (form.dldArea) qs.set("area", form.dldArea);
      if (form.sizeSqm) {
        const sizeSqft = form.sizeUnit === "sqft"
          ? Number(form.sizeSqm)
          : Math.round(Number(form.sizeSqm) * 10.7639);
        if (sizeSqft > 0) qs.set("sizeSqft", String(sizeSqft));
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 28000);
      const res = await fetch(`/api/ltr-rents?${qs}`, { signal: controller.signal });
      clearTimeout(timeout);
      const data = await res.json();
      if (data?.stat?.median && (data.source === "dda-live" || data.source === "dda-live-cached")) {
        params.set("lr", String(data.stat.median));
      }
    } catch { /* timeout or error — proceed without lr */ }
    router.push(`/report?${params.toString()}`);
  };

  const handleGenerate = () => {
    if (!canGenerate) return;
    const warning = getLTRWarning(form.buildingName, form.unitSize as UnitSize, form.dldArea);
    if (warning) { setLtrWarning(warning); return; }
    navigate(buildParams());
  };

  const proceedWithSTR = () => navigate(buildParams());

  return (
    <main className="min-h-screen animate-fade-in" style={{ background: colors.bgMain, position: "relative" }}>
      <DecorativeBackdrop />
      <div style={{ position: "relative", zIndex: 1 }}>

      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", isolation: "isolate", paddingBottom: "60px", marginBottom: "-60px" }}>

        {/* Full-width background image with warm overlay */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, zIndex: 0,
        }}>
          <div
            style={{
              position: "absolute", inset: 0,
              maskImage: "linear-gradient(to bottom, black 0%, black 38%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0.4) 75%, transparent 96%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 38%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0.4) 75%, transparent 96%)",
            }}
          >
            <img
              src="/BURJ.png"
              alt=""
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                objectPosition: "center 40%", display: "block",
              }}
            />
            {/* Left panel: ivory for text legibility. Right panel: clear image */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to right, rgba(247, 249, 248,0.95) 0%, rgba(247, 249, 248,0.90) 35%, rgba(247, 249, 248,0.50) 52%, rgba(247, 249, 248,0.10) 65%, rgba(247, 249, 248,0.0) 100%)",
            }} />
          </div>
          {/* Faint wash matching the page tone, layered on top of the masked
              fade so any last hint of the photo dissolves into the same
              ivory tone as the section below rather than pure transparency. */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
            background: `linear-gradient(to bottom, transparent 0%, ${colors.bgMain}00 20%, ${colors.bgMain}66 55%, ${colors.bgMain}CC 82%, ${colors.bgMain}E8 100%)`,
          }} />
        </div>

        <div className="animate-slide-up" style={{ position: "relative", zIndex: 2, maxWidth: "1152px", margin: "0 auto", padding: "56px 24px 64px" }}>
          <button onClick={() => router.push("/")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg mb-6 transition hover:opacity-80"
            style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, color: colors.primary }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 11l8-7 8 7M6 10v9h5v-5h2v5h5v-9" stroke={colors.primary} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Home
          </button>

          <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: colors.secondary, letterSpacing: "0.15em" }}>
            Rental Strategy Analyzer
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 leading-tight"
            style={{
              fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", maxWidth: "560px",
              color: colors.primary,
            }}>
            Generate Your STR vs LTR Report
          </h1>

          <p className="text-base mb-7" style={{ color: colors.textMuted, lineHeight: "1.7", maxWidth: "520px" }}>
            Enter your property details once and AssetIntel will estimate your short-term rental potential, long-term rental benchmark, expected occupancy, ADR, annual net income, and recommended strategy.
          </p>

          <div className="flex flex-wrap gap-2.5">
            {["STR forecast", "LTR benchmark", "Yield comparison", "Downloadable report"].map(label => (
              <div key={label}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, color: colors.textMain }}>
                <IconCheck />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEAM BLUR — straddles the hero/form boundary and physically
          blurs + washes over the join, since two independently-rendered
          sections meeting at a straight edge will always show a faint line
          no matter how gradual each side's own fade is on its own. ── */}
      <div
        aria-hidden="true"
        style={{
          position: "relative", height: "150px", marginTop: "-110px", marginBottom: "-40px",
          zIndex: 10, pointerEvents: "none",
          backdropFilter: "blur(45px)", WebkitBackdropFilter: "blur(45px)",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)",
        }}
      >
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to bottom, transparent, ${colors.bgMain}70 35%, ${colors.bgMain}70 65%, transparent)`,
        }} />
      </div>

      {/* ── FORM SECTION ── */}
      <section style={{ position: "relative", zIndex: 3 }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "32px 24px 80px" }}>
        <AccessGate source="estimator" title="Unlock the Rental Analyzer" subtitle="Free — sign up or log in to generate your STR vs LTR report.">
          <div className="w-full flex flex-col lg:flex-row gap-6 items-start">

            {/* ── MAIN FORM CARD ── */}
            <div className="w-full lg:flex-1 animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <div className="rounded-3xl overflow-hidden" style={{
                background: colors.bgSection,
                border: `1px solid ${colors.border}`,
                boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 12px 32px rgba(0,0,0,.06), 0 24px 48px rgba(0,0,0,.04)",
              }}>
                {/* Gold accent bar */}
                <div style={{ height: "3px", background: "linear-gradient(90deg, #C9A84C00, #C9A84C, #C9A84C00)" }} />

                <div style={{ padding: "clamp(28px, 5vw, 44px)" }}>

                  {/* Card heading */}
                  <div style={{ marginBottom: "32px" }}>
                    <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: colors.secondary, letterSpacing: "0.13em" }}>
                      Property Details
                    </div>
                    <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", color: colors.primary }}>
                      Tell Us About Your Property
                    </h2>
                    <p className="text-sm mt-1.5" style={{ color: colors.textMuted }}>Takes less than 60 seconds · Market-backed estimate · Private report</p>
                  </div>

                  {/* ── Building Name ── */}
                  <div ref={buildingRef} className="relative" style={{ marginBottom: "24px" }}>
                    <FieldLabel required>BUILDING NAME</FieldLabel>
                    <input
                      className="w-full outline-none transition-all"
                      style={inputStyle(!!form.buildingName)}
                      placeholder="Search by building name — e.g. Marina Gate, Forte, Burj Khalifa…"
                      value={buildingSearch || form.buildingName}
                      onChange={e => { setBuildingSearch(e.target.value); set("buildingName", ""); setShowSuggestions(true); }}
                      onFocus={() => setShowSuggestions(true)}
                    />
                    {form.buildingName && (
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                          style={{ background: `${colors.secondary}15`, color: colors.primary, border: `1px solid ${colors.primary}30` }}>
                          {form.buildingName}
                        </span>
                        {buildingInfo && (
                          <span className="text-xs" style={{ color: colors.textMuted }}>
                            {buildingInfo.community}
                            {buildingInfo.tier ? ` · ${buildingInfo.tier}` : ""}
                          </span>
                        )}
                      </div>
                    )}
                    {showSuggestions && buildingSearch.length >= 2 && filteredDLD.length === 0 && filteredCurated.length === 0 && propsearchSuggestions.length === 0 && (
                      <div className="absolute z-20 w-full mt-1 rounded-2xl px-4 py-3 text-sm shadow-2xl"
                        style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, color: colors.textMuted }}>
                        Can't find your building? Email us at{" "}
                        <a href="mailto:hello@assetintel.ae" style={{ color: colors.primary, fontWeight: 600 }}>hello@assetintel.ae</a>
                        {" "}and we'll send you a personalised report.
                      </div>
                    )}
                    {showSuggestions && buildingSearch.length >= 2 && (filteredDLD.length > 0 || filteredCurated.length > 0 || propsearchSuggestions.length > 0) && (
                      <div className="absolute z-20 w-full mt-1 rounded-2xl overflow-hidden shadow-2xl"
                        style={{ background: colors.bgSection, border: `1px solid ${colors.border}` }}>
                        {filteredDLD.length > 0 && (
                          <>
                            <div className="px-4 pt-3 pb-1 text-xs font-bold tracking-widest uppercase" style={{ color: colors.textMuted }}>DLD Verified</div>
                            {filteredDLD.map(b => (
                              <button key={b.key}
                                className="w-full text-left px-4 py-3 text-sm transition flex items-center justify-between gap-2"
                                style={{ color: colors.textMain, borderBottom: `1px solid ${colors.border}` }}
                                onMouseDown={() => { setForm(f => ({ ...f, buildingName: b.displayName, dldKey: b.key, dldArea: b.dldArea })); setBuildingSearch(""); setShowSuggestions(false); }}>
                                <span className="truncate font-medium">{b.displayName}</span>
                                <span className="text-xs shrink-0 flex items-center gap-1" style={{ color: colors.primary }}>
                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke={colors.primary} strokeWidth="2" strokeLinejoin="round" />
                                    <path d="M9 12l2 2 4-4" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  {DLD_AREA_TO_COMMUNITY[b.dldArea] ?? b.dldArea}
                                </span>
                              </button>
                            ))}
                          </>
                        )}
                        {filteredCurated.map(b => (
                          <button key={b}
                            className="w-full text-left px-4 py-3 text-sm transition flex items-center justify-between gap-2"
                            style={{ color: colors.textMain, borderBottom: `1px solid ${colors.border}` }}
                            onMouseDown={() => { setForm(f => ({ ...f, buildingName: b, dldKey: "", dldArea: "" })); setBuildingSearch(""); setShowSuggestions(false); }}>
                            <span className="truncate">{b}</span>
                            {(BUILDING_DIRECTORY[b] || BUILDINGS_DATABASE[b]) && (
                              <span className="text-xs shrink-0" style={{ color: colors.textMuted }}>
                                {BUILDING_DIRECTORY[b]?.community || BUILDINGS_DATABASE[b]?.area}
                              </span>
                            )}
                          </button>
                        ))}
                        {propsearchSuggestions.length > 0 && (
                          <>
                            <div className="px-4 pt-3 pb-1 text-xs font-bold tracking-widest uppercase" style={{ color: colors.textMuted }}>Other Buildings</div>
                            {propsearchSuggestions.map(b => (
                              <button key={b}
                                className="w-full text-left px-4 py-3 text-sm transition"
                                style={{ color: colors.textMain, borderBottom: `1px solid ${colors.border}` }}
                                onMouseDown={() => { setForm(f => ({ ...f, buildingName: b, dldKey: "", dldArea: "" })); setBuildingSearch(""); setShowSuggestions(false); }}>
                                <span className="truncate">{b}</span>
                              </button>
                            ))}
                          </>
                        )}
                        <button className="w-full text-left px-4 py-3 text-xs transition" style={{ color: colors.textMuted }}
                          onMouseDown={() => { setForm(f => ({ ...f, buildingName: buildingSearch, dldKey: "", dldArea: "" })); setBuildingSearch(""); setShowSuggestions(false); }}>
                          + Use &ldquo;{buildingSearch}&rdquo; anyway
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ── Two-column row: Bedrooms + Floor ── */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginBottom: "24px" }}>

                    {/* Number of Bedrooms — dropdown */}
                    <div>
                      <FieldLabel required>NUMBER OF BEDROOMS</FieldLabel>
                      <div style={{ position: "relative" }}>
                        <select
                          value={form.unitSize}
                          onChange={e => {
                            const val = e.target.value as UnitSize | "";
                            const entry = UNIT_SIZES.find(u => u.label === val);
                            setForm(f => ({ ...f, unitSize: val, unitType: entry?.type ?? f.unitType }));
                          }}
                          style={{
                            ...inputStyle(!!form.unitSize),
                            cursor: "pointer",
                            paddingRight: "36px",
                          }}
                        >
                          <option value="" disabled>Select bedrooms…</option>
                          <optgroup label="Apartments">
                            {UNIT_SIZES.filter(u => u.type === "Apartment").map(u => (
                              <option key={u.label} value={u.label}>{UNIT_DISPLAY[u.label]}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Villas">
                            {UNIT_SIZES.filter(u => u.type === "Villa").map(u => (
                              <option key={u.label} value={u.label}>{UNIT_DISPLAY[u.label]}</option>
                            ))}
                          </optgroup>
                        </select>
                        {/* Custom caret */}
                        <svg
                          width="14" height="14" viewBox="0 0 24 24" fill="none"
                          style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                        >
                          <path d="M6 9l6 6 6-6" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      {form.unitType && (
                        <p className="text-xs mt-1.5" style={{ color: colors.textMuted }}>
                          Type: <span style={{ color: colors.primary, fontWeight: 600 }}>{form.unitType}</span>
                        </p>
                      )}
                    </div>

                    {/* Floor */}
                    <div>
                      <FieldLabel required>
                        {form.unitType === "Villa" ? "FLOOR / LEVEL" : "FLOOR NUMBER"}
                        {form.floor && !floorExceeds && !floorSuspect && floorNum >= 5 && (
                          <span className="ml-2 font-normal" style={{ color: colors.primary }}>
                            {floorNum >= 40 ? "+18% ADR" : floorNum >= 30 ? "+12% ADR" : floorNum >= 20 ? "+8% ADR" : floorNum >= 10 ? "+4% ADR" : "+2% ADR"}
                          </span>
                        )}
                        {maxFloors && <span className="ml-2 font-normal" style={{ color: colors.textMuted }}>(max {maxFloors})</span>}
                      </FieldLabel>
                      <input
                        type="number" min={1} max={maxFloors ?? 200}
                        className="w-full outline-none transition"
                        style={inputStyle(!!form.floor && !floorExceeds && !floorSuspect)}
                        placeholder={form.unitType === "Villa" ? "e.g. 1" : "e.g. 22"}
                        value={form.floor}
                        onChange={e => set("floor", e.target.value)}
                      />
                      {floorExceeds && <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>{form.buildingName} has {maxFloors} floors. Please enter a valid floor.</p>}
                      {floorSuspect && <p className="mt-1 text-xs" style={{ color: "#D97706" }}>Floor {floorNum} seems high — please double-check.</p>}
                    </div>
                  </div>

                  {/* ── View ── */}
                  <div style={{ marginBottom: "24px" }}>
                    <FieldLabel required>PROPERTY VIEW</FieldLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {VIEWS.map(v => {
                        const sel = form.view === v;
                        return (
                          <button key={v} onClick={() => set("view", v)}
                            className="px-4 py-3 rounded-[14px] transition-all text-left text-sm"
                            style={{ ...(sel ? OPT_SELECTED : OPT_UNSELECTED), fontWeight: sel ? 700 : 500, color: sel ? "#153F32" : colors.textMain, transform: sel ? "translateY(-1px)" : "none" }}>
                            {v}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: "1px", background: `linear-gradient(to right, transparent, ${colors.border}, transparent)`, margin: "8px 0 28px" }} />

                  {/* ── Furnishing Status ── */}
                  <div style={{ marginBottom: "24px" }}>
                    <FieldLabel required>FURNISHING STATUS</FieldLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {(["Furnished", "Unfurnished"] as FurnishedStatus[]).map(f => {
                        const sel = form.furnished === f;
                        return (
                          <button key={f} onClick={() => set("furnished", f)}
                            className="py-3.5 rounded-[14px] transition-all text-left px-4"
                            style={{ ...(sel ? OPT_SELECTED : OPT_UNSELECTED), transform: sel ? "translateY(-1px)" : "none" }}>
                            <p className="text-sm font-bold" style={{ color: sel ? "#153F32" : colors.textMain }}>{f}</p>
                            <p className="text-xs mt-0.5" style={{ color: sel ? "#6B8C7A" : colors.textLight }}>
                              {f === "Furnished" ? "Ready for short-term rental" : "Furnishing package required"}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                    {form.furnished === "Unfurnished" && (
                      <p className="text-xs mt-2 px-1" style={{ color: colors.primary }}>
                        We will suggest furnishing packages tailored to your property in the report.
                      </p>
                    )}
                  </div>

                  {/* ── Property Condition ── */}
                  <div style={{ marginBottom: "24px" }}>
                    <FieldLabel>PROPERTY CONDITION</FieldLabel>
                    <div className="grid grid-cols-3 gap-3">
                      {(["Standard", "Semi Upgraded", "Fully Upgraded"] as PropertyCondition[]).map(c => {
                        const desc: Record<PropertyCondition, string> = {
                          "Standard": "Original fit-out",
                          "Semi Upgraded": "Minor improvements",
                          "Fully Upgraded": "Full luxury finish",
                        };
                        const sel = form.propertyCondition === c;
                        return (
                          <button key={c} onClick={() => set("propertyCondition", c)}
                            className="py-3 rounded-[14px] transition-all text-left px-4"
                            style={{ ...(sel ? OPT_SELECTED : OPT_UNSELECTED), transform: sel ? "translateY(-1px)" : "none" }}>
                            <p className="text-sm font-bold" style={{ color: sel ? "#153F32" : colors.textMain }}>{c}</p>
                            <p className="text-xs mt-0.5" style={{ color: sel ? "#6B8C7A" : colors.textLight }}>{desc[c]}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Optional fields row ── */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginBottom: "32px" }}>

                    {/* Unit Size optional */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold tracking-wider" style={{ color: colors.textMuted }}>
                          UNIT SIZE <span className="font-normal" style={{ color: colors.textLight }}>— optional</span>
                        </label>
                        <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${colors.border}`, fontSize: 11 }}>
                          {(["sqft", "sqm"] as const).map(u => (
                            <button key={u} onClick={() => { set("sizeUnit", u); set("sizeSqm", ""); }}
                              style={{
                                padding: "3px 10px", border: "none", cursor: "pointer",
                                background: form.sizeUnit === u ? colors.secondary : "transparent",
                                color: form.sizeUnit === u ? "#fff" : colors.textMuted,
                                fontWeight: form.sizeUnit === u ? 600 : 400,
                              }}>{u}</button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="number" inputMode="numeric"
                        min={form.sizeUnit === "sqft" ? 100 : 10} max={form.sizeUnit === "sqft" ? 20000 : 2000}
                        className="w-full outline-none transition"
                        style={inputStyle(!!form.sizeSqm)}
                        placeholder={form.sizeUnit === "sqft" ? "e.g. 750" : "e.g. 70"}
                        value={form.sizeSqm}
                        onChange={e => set("sizeSqm", e.target.value.replace(/[^0-9.]/g, ""))}
                      />
                    </div>

                    {/* Property Value optional */}
                    <div>
                      <label className="block text-xs font-semibold tracking-wider mb-2" style={{ color: colors.textMuted }}>
                        PROPERTY VALUE <span className="font-normal" style={{ color: colors.textLight }}>— optional</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: colors.primary }}>AED</span>
                        <input
                          type="text" inputMode="numeric"
                          className="w-full outline-none transition"
                          style={{ ...inputStyle(!!form.propertyValue), paddingLeft: "56px" }}
                          placeholder="2,500,000"
                          value={form.propertyValueDisplay}
                          onChange={e => {
                            const raw = e.target.value.replace(/,/g, "").replace(/[^0-9]/g, "");
                            const display = raw ? Number(raw).toLocaleString("en-AE") : "";
                            setForm(f => ({ ...f, propertyValue: raw, propertyValueDisplay: display }));
                          }}
                        />
                      </div>
                      <p className="text-xs mt-1" style={{ color: colors.textLight }}>Unlocks gross &amp; net yield</p>
                    </div>
                  </div>

                  {/* ── CTA ── */}
                  <button
                    onClick={handleGenerate}
                    disabled={!canGenerate || calculating}
                    className="w-full py-4 rounded-2xl text-base font-bold transition-all disabled:opacity-30"
                    style={{
                      background: canGenerate
                        ? "linear-gradient(135deg, #1B5E4A 0%, #2F7D63 50%, #B88A44 100%)"
                        : colors.border,
                      color: "#FFF",
                      boxShadow: canGenerate ? "0 8px 24px rgba(27,94,74,0.28)" : "none",
                      letterSpacing: "0.04em",
                      cursor: canGenerate && !calculating ? "pointer" : "not-allowed",
                    }}>
                    {calculating
                      ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                          <span style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                          Fetching live rental data…
                          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </span>
                      : "Generate My Report →"}
                  </button>

                  {!canGenerate && (
                    <p className="text-xs text-center mt-3" style={{ color: colors.textLight }}>
                      Fill in all required fields above to generate your report.
                    </p>
                  )}

                  <div className="flex items-center justify-center gap-2 mt-4" style={{ opacity: 0.7 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24">
                      <rect x="5" y="11" width="14" height="9" rx="2" {...stk(colors.textLight)} />
                      <path d="M8 11V8a4 4 0 018 0v3" {...stk(colors.textLight)} />
                    </svg>
                    <span className="text-xs" style={{ color: colors.textLight }}>
                      Your information is used only to generate this analysis and is not shared publicly.
                    </span>
                  </div>

                  {/* ── Title Deed Smart Upload ── */}
                  <TitleDeedUpload onExtract={(data) => {
                    const q = (data.projectName ?? "").toLowerCase();
                    const match = q ? DLD_BUILDINGS.find(b =>
                      b.displayName.toLowerCase() === q ||
                      b.key === q ||
                      b.displayName.toLowerCase().includes(q) ||
                      q.includes(b.displayName.toLowerCase())
                    ) : undefined;
                    const displayName = match?.displayName ?? data.projectName ?? "";
                    if (displayName) setBuildingSearch(displayName);

                    const isVilla = data.propertyType?.toLowerCase().includes("villa");
                    // Map extracted bedrooms to estimator UnitSize (e.g. "3BR" → "3BR", "4BR" → "4BR APT"/"4BR VILLA")
                    let rawBr: string | null = data.bedrooms;
                    if (rawBr === "Studio") rawBr = "STU";
                    if (rawBr === "4BR") rawBr = isVilla ? "4BR VILLA" : "4BR APT";
                    if (rawBr === "5BR") rawBr = isVilla ? "5BR VILLA" : "5BR APT";
                    const unitSize = rawBr as UnitSize | null;

                    const propValue = data.transactionValue ? String(data.transactionValue) : undefined;
                    const propValueDisplay = data.transactionValue
                      ? data.transactionValue.toLocaleString("en-AE")
                      : undefined;

                    setForm(f => ({
                      ...f,
                      ...(displayName ? { buildingName: displayName } : {}),
                      dldKey:  match?.key     ?? f.dldKey,
                      dldArea: match?.dldArea ?? (data.areaName ?? f.dldArea),
                      floor:   data.floor     ?? f.floor,
                      sizeSqm: data.areaSqft  ? String(data.areaSqft) : f.sizeSqm,
                      sizeUnit: data.areaSqft ? "sqft" : f.sizeUnit,
                      ...(unitSize ? { unitSize, unitType: isVilla ? "Villa" : "Apartment" } : {}),
                      ...(propValue ? { propertyValue: propValue, propertyValueDisplay: propValueDisplay ?? "" } : {}),
                    }));
                  }} />

                </div>
              </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <aside className="w-full lg:w-80 lg:flex-shrink-0 animate-slide-up flex flex-col gap-4"
              style={{ animationDelay: "0.2s", position: "sticky", top: "24px" }}>

              {/* What You'll Get */}
              <div className="rounded-3xl" style={{
                background: colors.bgSection, border: `1px solid ${colors.border}`,
                boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 12px 32px rgba(0,0,0,.05)",
                padding: "28px 26px",
              }}>
                <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: colors.secondary, letterSpacing: "0.13em" }}>What You&apos;ll Get</div>
                <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", color: colors.primary }}>Your Indicative Rental Strategy Report</h3>
                <div className="space-y-3">
                  {[
                    "STR vs LTR income comparison",
                    "12-month revenue projection",
                    "Occupancy & ADR estimates",
                    "Cost & deduction breakdown",
                    "STR readiness guidance",
                    "Downloadable PDF report",
                  ].map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="flex items-center justify-center flex-shrink-0 rounded-full"
                        style={{ width: "22px", height: "22px", background: `${colors.primary}12`, border: `1px solid ${colors.primary}25` }}>
                        <IconCheck />
                      </span>
                      <span className="text-sm" style={{ color: colors.textMain }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assumptions */}
              <div className="rounded-3xl" style={{
                background: colors.bgSection, border: `1px solid ${colors.border}`,
                boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 12px 32px rgba(0,0,0,.05)",
                padding: "28px 26px",
              }}>
                <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: colors.secondary, letterSpacing: "0.13em" }}>Assumptions Used</div>
                <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", color: colors.primary }}>What We Assume In Your Report</h3>
                <div className="space-y-2.5">
                  {[
                    { label: "Management Fee", value: "20% incl. VAT" },
                    { label: "Platform Fees",  value: "Included" },
                    { label: "Data Source",    value: "Market + DLD" },
                    { label: "Currency",       value: "AED" },
                    { label: "Report Type",    value: "Indicative" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="flex items-center justify-center flex-shrink-0 rounded-full"
                        style={{ width: "22px", height: "22px", background: `${colors.primary}12`, border: `1px solid ${colors.primary}25` }}>
                        <IconCheck />
                      </span>
                      <span className="text-sm flex-1" style={{ color: colors.textMain }}>{label}</span>
                      <span className="text-sm font-semibold whitespace-nowrap" style={{ color: colors.primary }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Private analysis note */}
              <div className="rounded-2xl p-4 flex gap-3" style={{ background: `${colors.primary}08`, border: `1px solid ${colors.primary}20` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5" fill="none">
                  <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke={colors.primary} strokeWidth="1.4" strokeLinejoin="round" />
                  <path d="M12 9v4M12 15.5v.5" stroke={colors.primary} strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <div>
                  <p className="text-xs font-bold mb-1" style={{ color: colors.primary }}>Private Analysis</p>
                  <p className="text-xs leading-relaxed" style={{ color: colors.textMuted }}>
                    Your information is used only to generate this report and is not shared publicly.
                  </p>
                </div>
              </div>
            </aside>

          </div>

          <p className="mt-8 text-xs text-center" style={{ color: colors.textLight }}>
            Projections based on Dubai market data · indicative only
          </p>
        </AccessGate>
        </div>
      </section>

      {/* ── LTR Warning Interstitial ── */}
      {ltrWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 overflow-y-auto"
          style={{ background: "rgba(20,24,22,0.55)", backdropFilter: "blur(10px)" }}>
          <div className="relative w-full rounded-[30px] overflow-hidden my-auto"
            style={{
              maxWidth: "660px",
              background: `linear-gradient(180deg, #FEFCF8 0%, ${colors.bgSection} 100%)`,
              border: `1px solid ${colors.secondary}40`,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 30px 70px rgba(0,0,0,0.30)",
            }}>
            <div style={{ height: "3px", background: `linear-gradient(90deg, ${colors.secondary}00, ${colors.secondary}, ${colors.secondary}00)` }} />
            <div style={{ padding: "clamp(24px, 4vw, 40px)" }} className="space-y-6">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="flex items-center justify-center rounded-full"
                    style={{ width: "30px", height: "30px", background: `${colors.primary}12`, border: `1px solid ${colors.primary}30` }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2l2.4 5.6L20 8.2l-4 4.1.9 5.7L12 15.4 7.1 18l.9-5.7-4-4.1 5.6-.6L12 2z" stroke={colors.primary} strokeWidth="1.3" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-xs font-bold uppercase" style={{ color: colors.primary, letterSpacing: "0.16em" }}>Our Recommendation</span>
                </div>
                <h2 className="font-bold" style={{
                  fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif",
                  fontSize: "clamp(28px, 4.2vw, 42px)", lineHeight: 1.12,
                  background: `linear-gradient(135deg, ${colors.primary} 0%, #6B7A45 50%, ${colors.secondary} 100%)`,
                  WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                  Long-term rental may be the stronger option here
                </h2>
              </div>
              <div className="rounded-2xl p-5 flex gap-4" style={{ background: colors.bgMain, border: `1px solid ${colors.border}` }}>
                <span className="flex items-center justify-center flex-shrink-0 rounded-full"
                  style={{ width: "44px", height: "44px", background: "#FFFFFF", border: `1px solid ${colors.secondary}40` }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 11l9-7 9 7M5 10v9h5v-5h4v5h5v-9" stroke={colors.secondary} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>{ltrWarning.reason}</p>
                  <p className="text-sm mt-2.5 leading-relaxed" style={{ color: colors.textMuted }}>
                    In this area, short-term rental income is likely to <span className="font-semibold" style={{ color: colors.secondary }}>match — not significantly exceed</span> your long-term rent, after management fees and seasonal vacancy are factored in.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="flex-1" style={{ height: "1px", background: colors.border }} />
                <span className="text-xs font-bold uppercase" style={{ color: colors.textMuted, letterSpacing: "0.16em" }}>The Trade-off</span>
                <span className="flex-1" style={{ height: "1px", background: colors.border }} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-0">
                {[
                  { title: "Long-Term Rental", items: ["Guaranteed monthly income", "No vacancy risk", "Zero management hassle", "Lower operating costs"] },
                  { title: "Short-Term Rental", items: ["Full flexibility — use it anytime", "Similar net income in this area", "Option to switch operators", "No fixed tenant commitment"] },
                ].map((col, ci) => (
                  <div key={col.title} className={ci === 1 ? "sm:pl-6 sm:border-l" : "sm:pr-6"} style={ci === 1 ? { borderColor: colors.border } : undefined}>
                    <p className="text-sm font-bold mb-3" style={{ color: colors.primary }}>{col.title}</p>
                    <ul className="space-y-2">
                      {col.items.map(p => (
                        <li key={p} className="flex items-start gap-2 text-sm" style={{ color: colors.textMain }}>
                          <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="9.5" stroke={colors.primary} strokeWidth="1.2" opacity="0.35" />
                            <path d="M8 12.2l2.6 2.6L16 9.4" stroke={colors.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl p-5 flex items-center gap-4"
                style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #164A3A 100%)`, boxShadow: "0 10px 24px rgba(27,94,74,0.25)" }}>
                <span className="flex items-center justify-center flex-shrink-0 rounded-xl"
                  style={{ width: "42px", height: "42px", background: `${colors.secondary}22`, border: `1px solid ${colors.secondary}55` }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke="#E8D5A3" strokeWidth="1.3" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-bold mb-0.5" style={{ color: "#F4E9D0" }}>Would you still like to see the short-term projection?</p>
                  <p className="text-xs" style={{ color: "#FFFFFFCC" }}>You&apos;ll earn similar revenue but keep full flexibility over your property.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={proceedWithSTR}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #B88A44 0%, #D4AF6A 100%)", color: "#FFF", boxShadow: "0 8px 20px rgba(184,138,68,0.3)" }}>
                  Yes — show me the STR projection anyway →
                </button>
                <button
                  onClick={() => { setLtrWarning(null); router.push(`/agents?${buildParams().toString()}&ltrRecommended=true`); }}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #1B5E4A 0%, #2F7D63 100%)", color: "#FFF", boxShadow: "0 8px 20px rgba(27,94,74,0.3)" }}>
                  Find me a long-term leasing agent
                </button>
                <div className="flex items-center justify-center gap-3 pt-1">
                  <span className="flex-1" style={{ height: "1px", background: colors.border }} />
                  <button onClick={() => setLtrWarning(null)} className="text-xs transition-all hover:opacity-70 whitespace-nowrap" style={{ color: colors.textLight }}>
                    ← Go back and change my property
                  </button>
                  <span className="flex-1" style={{ height: "1px", background: colors.border }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense>
      <EstimatorPage />
    </Suspense>
  );
}
