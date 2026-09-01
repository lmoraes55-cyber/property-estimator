"use client";

import { useState, useRef, useEffect } from "react";
import SiteNav from "@/components/SiteNav";
import { colors } from "@/lib/colors";
import { BUILDING_DIRECTORY, CONDITION_PREMIUMS, type PropertyCondition } from "@/lib/estimator";
import { BUILDINGS_DATABASE } from "@/lib/buildings-data";
import { getDLDBuildingList, type DLDBuildingEntry } from "@/lib/building-rents";
import { DLD_AREA_TO_COMMUNITY } from "@/lib/dld-area-map";
import type { RecentContract } from "@/app/api/ltr-rents/route";
import type { BuildingAgeResult } from "@/lib/dda-client";
import ConsultationBanner from "@/components/home/ConsultationBanner";
import AccessGate from "@/components/AccessGate";

const C = colors;

const BEDROOMS = ["Studio", "1BR", "2BR", "3BR"] as const;
type Bedroom = (typeof BEDROOMS)[number];
const BEDROOM_DISPLAY: Record<Bedroom, string> = {
  Studio: "Studio",
  "1BR": "1 Bedroom",
  "2BR": "2 Bedroom",
  "3BR": "3 Bedroom",
};

const CONDITIONS: PropertyCondition[] = ["Standard", "Semi Upgraded", "Fully Upgraded"];
const FURNISHED_PREMIUM = 0.08; // manual assumption: furnished LTR commands ~8% premium over unfurnished

const DLD_BUILDINGS: DLDBuildingEntry[] = getDLDBuildingList();
const ALL_BUILDINGS = Array.from(
  new Set([...Object.keys(BUILDINGS_DATABASE), ...Object.keys(BUILDING_DIRECTORY)])
).sort();

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 46,
  padding: "0 14px",
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  fontSize: 14,
  color: C.textMain,
  background: C.bgSection,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: C.secondaryDark,
  marginBottom: 7,
};

interface Estimate {
  low: number;
  mid: number;
  high: number;
  monthly: number;
  aedPerSqft: number;
  comps: RecentContract[];
  n: number;
  source: string;
}

export default function RentEstimatorPage() {
  const [buildingSearch, setBuildingSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [buildingName, setBuildingName] = useState("");
  const [dldKey, setDldKey] = useState("");
  const [dldArea, setDldArea] = useState("");
  const buildingRef = useRef<HTMLDivElement>(null);

  const [bedrooms, setBedrooms] = useState<Bedroom>("1BR");
  const [sqft, setSqft] = useState("");
  const [furnished, setFurnished] = useState(false);
  const [condition, setCondition] = useState<PropertyCondition>("Standard");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [buildingAge, setBuildingAge] = useState<BuildingAgeResult | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (buildingRef.current && !buildingRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const q = buildingSearch.toLowerCase();
  const filteredDLD: DLDBuildingEntry[] = q.length >= 2
    ? DLD_BUILDINGS.filter(b => b.displayName.toLowerCase().includes(q)).slice(0, 8)
    : [];
  const filteredCurated = q.length >= 2
    ? ALL_BUILDINGS.filter(b => b.toLowerCase().includes(q) && !filteredDLD.some(d => d.displayName.toLowerCase() === b.toLowerCase())).slice(0, Math.max(0, 8 - filteredDLD.length))
    : [];

  function selectBuilding(name: string, key = "", area = "") {
    setBuildingName(name);
    setBuildingSearch("");
    setDldKey(key);
    setDldArea(area);
    setShowSuggestions(false);
  }

  async function handleEstimate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setEstimate(null);
    setBuildingAge(null);
    const sizeSqft = parseFloat(sqft);
    if (!buildingName) { setError("Please select a building."); return; }
    if (!sizeSqft || sizeSqft <= 0) { setError("Please enter a valid unit size in sqft."); return; }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        project: dldKey || buildingName,
        bedrooms,
        area: dldArea || BUILDING_DIRECTORY[buildingName]?.community || "",
      });
      const res = await fetch(`/api/ltr-rents?${params.toString()}`);
      const data = await res.json();

      if (!data.stat) {
        setError("No recent rental data found for this building and unit size. Try a nearby comparable building.");
        setLoading(false);
        return;
      }

      const stat = data.stat;
      // Size-based estimate: prefer AED/sqft from comps, scaled to the actual unit size.
      const perSqft: number = stat.aedPerSqft || Math.round(stat.median / (stat.medianSqft || sizeSqft));
      let annual = perSqft * sizeSqft;

      const conditionPremium = CONDITION_PREMIUMS[condition]?.ltr ?? 0;
      annual *= 1 + conditionPremium;
      if (furnished) annual *= 1 + FURNISHED_PREMIUM;

      setEstimate({
        low: Math.round(annual * 0.93),
        mid: Math.round(annual),
        high: Math.round(annual * 1.07),
        monthly: Math.round(annual / 12),
        aedPerSqft: Math.round(perSqft),
        comps: data.recentContracts || [],
        n: stat.n,
        source: data.source,
      });

      // Building age is a supplementary data point — fetch separately so a
      // miss/failure here never blocks or breaks the rent estimate itself.
      const ageParams = new URLSearchParams({ building: buildingName });
      if (dldKey) ageParams.set("dldKey", dldKey);
      fetch(`/api/building-age?${ageParams.toString()}`)
        .then(r => r.json())
        .then((age: BuildingAgeResult) => { if (age?.matched) setBuildingAge(age); })
        .catch(() => {});
    } catch {
      setError("Something went wrong fetching rental data. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bgMain, overflowX: "hidden" }}>
      <SiteNav active="ltr-estimator" />

      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", isolation: "isolate" }}>
        {/* Background image layer */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img
            src="/BURJ.png"
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center right", display: "block" }}
          />
          {/* Left-to-right ivory fade for text legibility */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, rgba(252,248,241,0.98) 0%, rgba(252,248,241,0.92) 28%, rgba(252,248,241,0.65) 48%, rgba(252,248,241,0.18) 70%, rgba(252,248,241,0.04) 100%)",
          }} />
          {/* Soft center warmth glow */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(circle at 35% 45%, rgba(255,255,255,0.55), rgba(255,255,255,0) 45%)",
          }} />
          {/* Bottom fade into next section */}
          <div style={{
            position: "absolute", left: 0, right: 0, bottom: 0, height: "140px",
            background: `linear-gradient(180deg, rgba(252,248,241,0) 55%, rgba(252,248,241,0.75) 82%, ${C.bgMain} 100%)`,
          }} />
        </div>

        <div style={{ position: "relative", zIndex: 2, maxWidth: 1152, margin: "0 auto", padding: "64px 24px 72px" }}>
          <div style={{ maxWidth: 760 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.secondary, marginBottom: 14 }}>
              Live DLD Rental Data
            </div>
            <h1 style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontSize: 40, color: C.primary, marginBottom: 16, lineHeight: 1.2, maxWidth: 620 }}>
              Long-Term Rental Estimator
            </h1>
            <p style={{ fontSize: 15.5, color: C.textMuted, maxWidth: 560, lineHeight: 1.7, marginBottom: 22 }}>
              Get an accurate LTR estimate using real, recent Ejari contracts for your exact building and unit size — direct from Dubai Land Department data.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 36 }}>
              {["Live DLD contracts", "Same-building comparables", "Furnishing adjustment"].map(label => (
                <div key={label}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, background: C.bgSection, border: `1px solid ${C.border}`, color: C.textMain }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke={C.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {label}
                </div>
              ))}
            </div>

            {/* ── Rental Details Card ── */}
            <form
              onSubmit={handleEstimate}
              style={{ background: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, boxShadow: C.shadowLg, maxWidth: 680 }}
            >
              {error && (
                <div style={{ background: "#FDF2F2", border: "1px solid #F3CACA", borderRadius: 8, padding: "10px 14px", color: C.error, fontSize: 13, marginBottom: 18 }}>
                  {error}
                </div>
              )}

          <div style={{ marginBottom: 18 }} ref={buildingRef}>
            <label style={labelStyle}>Building Name</label>
            <div style={{ position: "relative" }}>
              {buildingName ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ ...inputStyle, flex: 1, background: C.bgSage, color: C.primary, fontWeight: 600 }}>
                    {buildingName}
                  </div>
                  <button type="button" onClick={() => { setBuildingName(""); setDldKey(""); setDldArea(""); }}
                    style={{ padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, color: C.textMuted }}>
                    Change
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Search building name..."
                  value={buildingSearch}
                  onChange={e => { setBuildingSearch(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  style={inputStyle}
                  autoComplete="off"
                />
              )}
              {showSuggestions && buildingSearch.length >= 2 && (filteredDLD.length > 0 || filteredCurated.length > 0) && (
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 200, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.10)", maxHeight: 260, overflowY: "auto" }}>
                  {filteredDLD.length > 0 && (
                    <>
                      <div style={{ padding: "8px 14px 4px", fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>DLD Registered</div>
                      {filteredDLD.map(b => (
                        <div key={b.key} onMouseDown={() => selectBuilding(b.displayName, b.key, b.dldArea)}
                          style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, color: C.textMain, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#F0F7F3")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <span>{b.displayName}</span>
                          <span style={{ fontSize: 11, color: C.textMuted }}>{DLD_AREA_TO_COMMUNITY[b.dldArea] ?? b.dldArea}</span>
                        </div>
                      ))}
                    </>
                  )}
                  {filteredCurated.length > 0 && (
                    <>
                      <div style={{ padding: "8px 14px 4px", fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Buildings</div>
                      {filteredCurated.map(b => (
                        <div key={b} onMouseDown={() => selectBuilding(b)}
                          style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, color: C.textMain, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#F0F7F3")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <span>{b}</span>
                          <span style={{ fontSize: 11, color: C.textMuted }}>{BUILDING_DIRECTORY[b]?.community ?? BUILDINGS_DATABASE[b]?.area ?? ""}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Unit Size</label>
              <select value={bedrooms} onChange={e => setBedrooms(e.target.value as Bedroom)} style={inputStyle}>
                {BEDROOMS.map(b => <option key={b} value={b}>{BEDROOM_DISPLAY[b]}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Unit Size (sqft) <span style={{ color: C.secondary }}>*</span></label>
              <input
                type="number"
                required
                min={1}
                placeholder="e.g. 750"
                value={sqft}
                onChange={e => setSqft(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 22 }}>
            <div>
              <label style={labelStyle}>Furnishing</label>
              <select value={furnished ? "Furnished" : "Unfurnished"} onChange={e => setFurnished(e.target.value === "Furnished")} style={inputStyle}>
                <option>Unfurnished</option>
                <option>Furnished</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Property Condition</label>
              <select value={condition} onChange={e => setCondition(e.target.value as PropertyCondition)} style={inputStyle}>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              background: loading ? "#ccc" : `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryLight} 100%)`,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.01em",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 10px 28px rgba(27,94,74,0.28)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 14px 32px rgba(27,94,74,0.34)"; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = loading ? "none" : "0 10px 28px rgba(27,94,74,0.28)"; }}
          >
            {loading ? "Fetching live rental data…" : "Estimate My Rent"}
          </button>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 18, fontSize: 12, color: C.textLight }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" stroke={C.textLight} strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            100% DLD data · No personal information required · Private &amp; secure
          </div>
        </form>

        {estimate && (
          <AccessGate source="ltr-estimator" title="Unlock Your Rent Estimate" subtitle="Free — enter your name and email to see the full DLD-backed estimate.">
          <div style={{ marginTop: 24, maxWidth: 680, background: C.bgWhite, border: `1px solid ${C.borderSage}`, borderRadius: 16, padding: 28, boxShadow: C.shadowLg }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.mutedGreen, marginBottom: 10 }}>
              Estimated Annual Rent
            </div>
            <div style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontSize: 36, color: C.primary, marginBottom: 4 }}>
              AED {estimate.mid.toLocaleString()}
            </div>
            <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 20 }}>
              Range AED {estimate.low.toLocaleString()} – {estimate.high.toLocaleString()} · AED {estimate.monthly.toLocaleString()}/month
            </div>

            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 22, paddingBottom: 22, borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>AED / sqft</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.textMain }}>{estimate.aedPerSqft.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Comparable Contracts</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.textMain }}>{estimate.n}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Data Source</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.textMain }}>{estimate.source === "dda-live" ? "Live DLD" : "Market Data"}</div>
              </div>
              {buildingAge && (
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Building Age</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C.textMain }}>
                    {buildingAge.projectStatus === "FINISHED" && buildingAge.ageYears !== null
                      ? `${buildingAge.ageYears} yr${buildingAge.ageYears === 1 ? "" : "s"} (${buildingAge.completionYear})`
                      : buildingAge.completionYear
                        ? `Handover ${buildingAge.completionYear}`
                        : "—"}
                  </div>
                </div>
              )}
            </div>

            {estimate.comps.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.textMain, marginBottom: 10 }}>Recent Comparable Rentals</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {estimate.comps.map((c, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.textMuted, padding: "8px 12px", background: C.bgSection, borderRadius: 6 }}>
                      <span>{new Date(c.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
                      <span>{c.areaSqft ? `${c.areaSqft} sqft` : "—"}</span>
                      <span style={{ fontWeight: 600, color: C.textMain }}>AED {c.annualRent.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p style={{ fontSize: 12, color: C.textLight, marginTop: 18, lineHeight: 1.5 }}>
              Estimate based on the most recent comparable Ejari contracts in this building, scaled to your unit size, with a furnishing and condition adjustment applied. For guidance only — not a formal valuation.
            </p>
          </div>
          </AccessGate>
        )}
          </div>
        </div>
      </section>

      {/* ── HOW THE LTR ESTIMATE WORKS ── */}
      <section style={{ maxWidth: 1152, margin: "0 auto", padding: "64px 24px 96px" }}>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 44px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.secondary, marginBottom: 12 }}>
            Methodology
          </div>
          <h2 style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontSize: 30, color: C.primary, lineHeight: 1.3 }}>
            How The LTR Estimate Works
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {[
            {
              title: "Same-Building DLD Contracts",
              body: "We prioritise recent Ejari rental contracts from the same building where available.",
            },
            {
              title: "Unit Size Matching",
              body: "Your unit sqft is mandatory so the estimate can compare against similar-sized units.",
            },
            {
              title: "Furnishing Adjustment",
              body: "Furnished and upgraded premiums are applied as AssetIntel adjustments on top of DLD baseline data.",
            },
            {
              title: "Confidence Score",
              body: "The result shows how strong the comparable data is before you rely on the estimate.",
            },
          ].map((card, i) => (
            <div key={card.title}
              style={{ background: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: 14, padding: "26px 22px", boxShadow: C.shadowSm }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, marginBottom: 16,
                background: C.bgSage, display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontSize: 15, fontWeight: 500, color: C.primary,
              }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.textMain, marginBottom: 8 }}>{card.title}</div>
              <p style={{ fontSize: 13.5, color: C.textMuted, lineHeight: 1.6 }}>{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <ConsultationBanner />
    </div>
  );
}
