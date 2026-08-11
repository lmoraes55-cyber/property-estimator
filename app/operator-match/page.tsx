"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  runEstimator, rankOperators,
  UnitSize, UnitType, ViewType,
  BUILDING_DIRECTORY,
} from "@/lib/estimator";
import { BUILDINGS_DATABASE } from "@/lib/buildings-data";
import { getDLDBuildingList, type DLDBuildingEntry } from "@/lib/building-rents";
import { colors } from "@/lib/colors";
import SiteNav from "@/components/SiteNav";
import DecorativeBackdrop from "@/components/DecorativeBackdrop";

const DLD_BUILDINGS: DLDBuildingEntry[] = getDLDBuildingList();
const ALL_BUILDINGS = new Set([...Object.keys(BUILDINGS_DATABASE), ...Object.keys(BUILDING_DIRECTORY)]);

const BEDROOM_OPTIONS: { label: string; value: UnitSize }[] = [
  { label: "Studio", value: "STU" },
  { label: "1 Bedroom", value: "1BR" },
  { label: "2 Bedrooms", value: "2BR" },
  { label: "3 Bedrooms", value: "3BR" },
  { label: "4+ Bedrooms", value: "4BR APT" },
];

const VIEW_OPTIONS: ViewType[] = [
  "Burj / Downtown Skyline", "Marina / Waterfront", "Sea View",
  "Golf / Park View", "Community View", "Standard View",
];

function OperatorMatchContent() {
  const router = useRouter();

  const [buildingSearch, setBuildingSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [buildingName, setBuildingName] = useState("");
  const [dldKey, setDldKey] = useState("");
  const [dldArea, setDldArea] = useState("");
  const [areaLabel, setAreaLabel] = useState("");
  const buildingRef = useRef<HTMLDivElement>(null);

  const [unitSize, setUnitSize] = useState<UnitSize>("2BR");
  const [view, setView] = useState<ViewType>("Standard View");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

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
    ? [...ALL_BUILDINGS]
        .filter(b => b.toLowerCase().includes(q) && !filteredDLD.some(d => d.displayName.toLowerCase() === b.toLowerCase()))
        .slice(0, Math.max(0, 6 - filteredDLD.length))
    : [];

  function selectBuilding(name: string, key = "", area = "") {
    setBuildingName(name);
    setBuildingSearch("");
    setDldKey(key);
    setDldArea(area);
    const directoryArea = BUILDING_DIRECTORY[name]?.area;
    setAreaLabel(directoryArea ?? area ?? "");
    setShowSuggestions(false);
  }

  const unitLabel = BEDROOM_OPTIONS.find(o => o.value === unitSize)?.label ?? unitSize;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!buildingName) { setError("Please select a building from the list."); return; }
    if (!email) { setError("Please enter your email address."); return; }

    setSubmitting(true);
    try {
      const result = runEstimator({
        propertyName: buildingName,
        buildingName,
        unitSize,
        unitType: "Apartment",
        floor: 10,
        view,
        furnished: "Furnished",
        managementFee: 0.20,
        occStrategy: "LOCCHP",
        dldKey: dldKey || undefined,
        dldArea: dldArea || undefined,
        propertyCondition: "Standard",
      });

      const res = await fetch("/api/send-operator-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, result }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error("send failed");

      try {
        await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "operator_match_no_estimate",
            email, phone,
            property: buildingName,
            unitSize,
            message: `Area: ${areaLabel || dldArea || "—"} | View: ${view}`,
          }),
        });
      } catch {}

      setSubmitted(true);
    } catch {
      setError("Something went wrong sending your matches. Please try again.");
    }
    setSubmitting(false);
  }

  function runFullEstimator() {
    const params = new URLSearchParams({
      building: buildingName,
      type: unitSize,
      view,
      ...(dldArea ? { dldArea } : {}),
    });
    router.push(`/estimator?${params.toString()}`);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "16px 16px", fontSize: 14.5, color: colors.textMain,
    background: "rgba(250,248,243,0.75)", border: "1px solid rgba(40,80,65,0.14)", borderRadius: 13,
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11.5, fontWeight: 600, color: colors.primary, letterSpacing: "0.01em", marginBottom: 7,
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.bgMain, position: "relative" }}>
      <DecorativeBackdrop />
      <div style={{ position: "relative", zIndex: 1 }}>
        <SiteNav active="services" />

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px 80px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.secondary, marginBottom: 12 }}>
              STR Operator Matching
            </p>
            <h1 style={{ fontFamily: "'Georgia', serif", fontSize: 32, fontWeight: 700, color: colors.primary, marginBottom: 14, lineHeight: 1.2 }}>
              Get Matched With the Right STR Operator
            </h1>
            <p style={{ fontSize: 14.5, color: colors.textMuted, lineHeight: 1.65, maxWidth: 520, margin: "0 auto" }}>
              Tell us a few basics about your property and we&apos;ll email you a shortlist of the top-matched Dubai STR operators — no full analysis required.
            </p>
          </div>

          {submitted ? (
            <div style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 20, padding: "44px 32px", textAlign: "center", boxShadow: colors.shadowMd }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#EEF5F1", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 20, fontWeight: 700, color: colors.primary, marginBottom: 10 }}>Your operator matches are on the way</h2>
              <p style={{ fontSize: 13.5, color: colors.textMuted, lineHeight: 1.65, marginBottom: 24 }}>
                We&apos;ve sent your top operator matches for {buildingName} to {email}. Want a full STR vs LTR income breakdown too?
              </p>
              <button onClick={runFullEstimator} style={{ padding: "13px 24px", background: colors.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Run the Full Rental Analyzer →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="opm-card" style={{
              position: "relative", overflow: "hidden",
              background: "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(250,248,242,0.94))",
              border: "1px solid rgba(182,139,61,0.20)", borderRadius: 24,
              boxShadow: "0 24px 60px rgba(32,60,48,0.10), 0 4px 14px rgba(32,60,48,0.04)",
              padding: "40px 36px 34px",
            }}>
              {/* Top signature accent */}
              <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, rgba(182,139,61,0.55), rgba(27,94,74,0.45), transparent)" }} />
              {/* Very subtle bronze glow, upper-right */}
              <div aria-hidden style={{ position: "absolute", top: -80, right: -80, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(182,139,61,0.10), transparent 70%)", pointerEvents: "none" }} />

              <div style={{ position: "relative" }}>
                {/* Internal card header */}
                <div style={{ marginBottom: 26 }}>
                  <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: colors.secondary, marginBottom: 10 }}>
                    Private Operator Match
                  </p>
                  <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 21, fontWeight: 700, color: colors.primary, marginBottom: 8, lineHeight: 1.25 }}>
                    Tell Us About Your Property
                  </h2>
                  <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.55 }}>
                    We&apos;ll use these details to identify suitable STR operators for your property.
                  </p>
                  <div style={{ height: 1, background: "rgba(40,80,65,0.10)", marginTop: 22 }} />
                </div>

                {/* Building search */}
                <div ref={buildingRef} style={{ position: "relative", marginBottom: 20 }}>
                  <label style={labelStyle}>Building Name</label>
                  <input
                    className="opm-field opm-field-building"
                    value={buildingName ? buildingName : buildingSearch}
                    onChange={e => { setBuildingName(""); setBuildingSearch(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Start typing your building name…"
                    style={{ ...inputStyle, fontSize: 15.5, fontWeight: 500 }}
                  />
                  {areaLabel && (
                    <p style={{ fontSize: 12, color: colors.primary, marginTop: 7, fontWeight: 600 }}>Area: {areaLabel}</p>
                  )}
                  {showSuggestions && (filteredDLD.length > 0 || filteredCurated.length > 0) && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 6, background: "#fff", border: `1px solid ${colors.border}`, borderRadius: 12, boxShadow: colors.shadowMd, zIndex: 20, maxHeight: 260, overflowY: "auto" }}>
                      {filteredDLD.map(b => (
                        <button type="button" key={b.key} onMouseDown={() => selectBuilding(b.displayName, b.key, b.dldArea)}
                          style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", background: "none", border: "none", borderBottom: `1px solid ${colors.border}`, cursor: "pointer", fontSize: 13.5, color: colors.textMain }}>
                          {b.displayName} <span style={{ color: colors.textMuted, fontSize: 11.5 }}>· {b.dldArea}</span>
                        </button>
                      ))}
                      {filteredCurated.map(b => (
                        <button type="button" key={b} onMouseDown={() => selectBuilding(b)}
                          style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", background: "none", border: "none", borderBottom: `1px solid ${colors.border}`, cursor: "pointer", fontSize: 13.5, color: colors.textMain }}>
                          {b}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bedrooms + View */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                  <div>
                    <label style={labelStyle}>Bedrooms</label>
                    <select className="opm-field" value={unitSize} onChange={e => setUnitSize(e.target.value as UnitSize)} style={{ ...inputStyle, appearance: "none" }}>
                      {BEDROOM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>View</label>
                    <select className="opm-field" value={view} onChange={e => setView(e.target.value as ViewType)} style={{ ...inputStyle, appearance: "none" }}>
                      {VIEW_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>

                {/* Contact */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 10 }}>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input className="opm-field" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone / WhatsApp (optional)</label>
                    <input className="opm-field" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+971 50 000 0000" style={inputStyle} />
                  </div>
                </div>

                {error && <p style={{ fontSize: 12.5, color: "#B3261E", marginBottom: 12 }}>{error}</p>}

                <button type="submit" disabled={submitting} className="opm-cta" style={{
                  width: "100%", marginTop: 16, padding: 16,
                  background: "linear-gradient(135deg, #C99A45 0%, #B47B27 55%, #9E6A20 100%)",
                  color: "#fff", border: "none", borderRadius: 13, fontSize: 14.5, fontWeight: 700,
                  cursor: submitting ? "wait" : "pointer",
                  boxShadow: "0 8px 22px rgba(166,112,34,0.18)",
                }}>
                  {submitting ? "Sending…" : "Send Me My Operator Matches →"}
                </button>

                {/* Trust microcopy */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 12 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7A8C82" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
                  <p style={{ fontSize: 11.5, color: "#7A8C82" }}>Private matching • Sent directly to your email</p>
                </div>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0 20px" }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(40,80,65,0.10)" }} />
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: colors.textMuted, background: colors.bgMain, border: `1px solid ${colors.border}`, borderRadius: 999, padding: "3px 11px", letterSpacing: "0.04em" }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(40,80,65,0.10)" }} />
                </div>

                <div style={{ background: "linear-gradient(135deg, rgba(232,242,236,0.75), rgba(248,246,239,0.85))", border: "1px solid rgba(31,105,80,0.15)", borderRadius: 16, padding: "20px 22px", textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 6 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                    <p style={{ fontSize: 13, color: colors.textMain, fontWeight: 600 }}>Want the full picture first?</p>
                  </div>
                  <p style={{ fontSize: 12.5, color: colors.textMuted, marginBottom: 15, lineHeight: 1.5 }}>
                    Run the Rental Analyzer to see your STR vs LTR income breakdown, then match with an operator straight from your report.
                  </p>
                  <button type="button" onClick={runFullEstimator} className="opm-secondary" style={{ padding: "11px 22px", background: "transparent", color: colors.primary, border: `1.5px solid ${colors.primary}`, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    Run the Rental Analyzer →
                  </button>
                </div>
              </div>
            </form>
          )}

          <style>{`
            .opm-field { transition: all 180ms ease; }
            .opm-field:hover { border-color: rgba(182,139,61,0.40) !important; }
            .opm-field:focus { border-color: #B68B3D !important; box-shadow: 0 0 0 3px rgba(182,139,61,0.08); background: #fff !important; }
            .opm-cta { transition: transform 180ms ease, box-shadow 180ms ease; }
            .opm-cta:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(166,112,34,0.26); }
            .opm-secondary { transition: background 180ms ease, transform 180ms ease; }
            .opm-secondary:hover:not(:disabled) { background: rgba(27,94,74,0.06) !important; }
          `}</style>
        </div>
      </div>
    </div>
  );
}

export default function OperatorMatchPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bgMain }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${colors.primary}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      </div>
    }>
      <OperatorMatchContent />
    </Suspense>
  );
}
