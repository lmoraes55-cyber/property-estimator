"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  UnitSize, UnitType, ViewType, BUILDING_DIRECTORY, VIEW_PREMIUMS,
} from "@/lib/estimator";
import { BUILDINGS_DATABASE } from "@/lib/buildings-data";
import { getDLDBuildingList, type DLDBuildingEntry } from "@/lib/building-rents";
import { colors } from "@/lib/colors";
import { trackEstimateRequested } from "@/lib/gtag";

const UNIT_SIZES: { label: UnitSize; type: UnitType; display: string }[] = [
  { label: "STU", type: "Apartment", display: "Studio" },
  { label: "1BR", type: "Apartment", display: "1 Bedroom" },
  { label: "2BR", type: "Apartment", display: "2 Bedroom" },
  { label: "3BR", type: "Apartment", display: "3 Bedroom" },
  { label: "4BR APT", type: "Apartment", display: "4 Bed Apartment" },
  { label: "4BR VILLA", type: "Villa", display: "4 Bed Villa" },
  { label: "5BR VILLA", type: "Villa", display: "5 Bed Villa" },
];

const VIEWS: ViewType[] = Object.keys(VIEW_PREMIUMS) as ViewType[];

const DLD_BUILDINGS: DLDBuildingEntry[] = getDLDBuildingList();
const ALL_BUILDINGS = Array.from(
  new Set([...Object.keys(BUILDINGS_DATABASE), ...Object.keys(BUILDING_DIRECTORY)])
).sort();

const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 12,
  border: `1.5px solid ${colors.border}`,
  background: colors.bgWhite,
  fontSize: 15,
  color: colors.textMain,
  outline: "none",
  boxSizing: "border-box",
};

function optStyle(selected: boolean): React.CSSProperties {
  return {
    padding: "10px 14px",
    borderRadius: 12,
    border: `1.5px solid ${selected ? colors.primary : colors.border}`,
    background: selected ? colors.bgSage : colors.bgWhite,
    color: selected ? colors.primary : colors.textMain,
    fontWeight: selected ? 700 : 500,
    fontSize: 13.5,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s",
  };
}

function GetStartedForm() {
  const router = useRouter();
  const buildingRef = useRef<HTMLDivElement>(null);

  const [buildingSearch, setBuildingSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dldKey, setDldKey] = useState("");
  const [dldArea, setDldArea] = useState("");

  const [form, setForm] = useState({
    buildingName: "",
    unitSize: "" as UnitSize | "",
    unitType: "" as UnitType | "",
    floor: "",
    view: "" as ViewType | "",
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (buildingRef.current && !buildingRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const q = buildingSearch.toLowerCase();
  const filteredDLD: DLDBuildingEntry[] = q.length >= 2
    ? DLD_BUILDINGS.filter(b => b.displayName.toLowerCase().includes(q)).slice(0, 6)
    : [];
  const filteredCurated = q.length >= 2
    ? ALL_BUILDINGS
        .filter(b => b.toLowerCase().includes(q) && !filteredDLD.some(d => d.displayName.toLowerCase() === b.toLowerCase()))
        .slice(0, Math.max(0, 6 - filteredDLD.length))
    : [];

  function selectBuilding(name: string, key = "", area = "") {
    setForm(f => ({ ...f, buildingName: name }));
    setBuildingSearch(name);
    setDldKey(key);
    setDldArea(area);
    setShowSuggestions(false);
  }

  const canGenerate = !!(form.buildingName && form.unitSize && form.unitType && form.floor && Number(form.floor) >= 1 && form.view);

  const [calculating, setCalculating] = useState(false);

  function handleGenerate() {
    if (!canGenerate) return;
    setCalculating(true);
    trackEstimateRequested({ building: form.buildingName, unit_size: form.unitSize });

    const params = new URLSearchParams({
      propertyName: `${form.buildingName} · ${form.unitSize} · Floor ${form.floor}`,
      buildingName: form.buildingName,
      unitSize: form.unitSize,
      unitType: form.unitType,
      floor: form.floor,
      view: form.view,
      furnished: "Furnished",
      managementFee: "0.20",
      ...(dldKey ? { dldKey } : {}),
      ...(dldArea ? { dldArea } : {}),
    });
    router.push(`/report?${params.toString()}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: colors.bgMain }}>
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "56px 20px 32px", maxWidth: 720, margin: "0 auto" }}>
        <img src="/brand/assetintel-favicon-128.png" alt="AssetIntel" width={44} height={44} style={{ margin: "0 auto 20px", borderRadius: 10 }} />
        <h1 style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontSize: "clamp(31px, 5vw, 45px)", color: colors.textMain, lineHeight: 1.15, marginBottom: 14 }}>
          What could your Dubai property really earn?
        </h1>
        <p style={{ fontSize: 16, color: colors.textMuted, lineHeight: 1.6, maxWidth: 520, margin: "0 auto" }}>
          Get a free, data-driven Short-Term vs. Long-Term rental income estimate for your building — powered by real Dubai Land Department data.
        </p>
      </div>

      {/* Form card */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px 64px" }}>
        <div style={{ background: colors.bgWhite, border: `1px solid ${colors.border}`, borderRadius: 20, padding: "28px 24px", boxShadow: colors.shadowLg }}>
          {/* Building */}
          <div style={{ marginBottom: 18 }} ref={buildingRef}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, letterSpacing: "0.03em", color: colors.textMuted, marginBottom: 7 }}>
              BUILDING NAME
            </label>
            <div style={{ position: "relative" }}>
              <input
                style={inputBase}
                placeholder="Start typing your building..."
                value={buildingSearch}
                onChange={e => { setBuildingSearch(e.target.value); setShowSuggestions(true); if (form.buildingName) setForm(f => ({ ...f, buildingName: "" })); }}
                onFocus={() => setShowSuggestions(true)}
              />
              {showSuggestions && (filteredDLD.length > 0 || filteredCurated.length > 0) && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: colors.bgWhite, border: `1px solid ${colors.border}`, borderRadius: 12, boxShadow: colors.shadowMd, zIndex: 20, maxHeight: 260, overflowY: "auto" }}>
                  {filteredDLD.map(b => (
                    <button key={b.key} onClick={() => selectBuilding(b.displayName, b.key, b.dldArea)}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: colors.textMain }}>
                      {b.displayName}
                    </button>
                  ))}
                  {filteredCurated.map(name => (
                    <button key={name} onClick={() => selectBuilding(name)}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: colors.textMain }}>
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Unit size */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, letterSpacing: "0.03em", color: colors.textMuted, marginBottom: 7 }}>
              UNIT SIZE
            </label>
            <div className="grid grid-cols-2 gap-2">
              {UNIT_SIZES.map(u => (
                <button key={u.label} onClick={() => setForm(f => ({ ...f, unitSize: u.label, unitType: u.type }))}
                  style={optStyle(form.unitSize === u.label)}>
                  {u.display}
                </button>
              ))}
            </div>
          </div>

          {/* Floor */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, letterSpacing: "0.03em", color: colors.textMuted, marginBottom: 7 }}>
              FLOOR
            </label>
            <input
              type="number" min={1} style={inputBase} placeholder="e.g. 12"
              value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))}
            />
          </div>

          {/* View */}
          <div style={{ marginBottom: 26 }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, letterSpacing: "0.03em", color: colors.textMuted, marginBottom: 7 }}>
              PROPERTY VIEW
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VIEWS.map(v => (
                <button key={v} onClick={() => setForm(f => ({ ...f, view: v }))} style={optStyle(form.view === v)}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!canGenerate || calculating}
            style={{
              width: "100%", padding: "15px", borderRadius: 14, border: "none",
              background: canGenerate ? colors.primary : colors.border,
              color: canGenerate ? "#fff" : colors.textLight,
              fontSize: 15.5, fontWeight: 700, cursor: canGenerate ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}
          >
            {calculating ? "Calculating..." : "Get My Free Estimate →"}
          </button>
          <p style={{ fontSize: 12, color: colors.textLight, textAlign: "center", marginTop: 12 }}>
            No sign-up required. Takes under 30 seconds.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GetStartedPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: colors.bgMain }} />}>
      <GetStartedForm />
    </Suspense>
  );
}
