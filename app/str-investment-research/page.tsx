/*
  DIRECTION CONTRACT (Impeccable new-work, surface scope — see PRODUCT.md / DESIGN.md)
  THESIS: Answer the two questions every buy-to-STR investor actually asks — "what's the
    best area for my budget" and "which building in [area] is best for STR" — with live
    numbers, immediately, not a lead form promising an emailed report. Refuses the
    generic "submit your details, we'll get back to you" lead-gen page this shipped as.
  OWN-WORLD: The Chartered Estate (unchanged) — forest green/bronze on warm ivory,
    tabular figures, flat surfaces. Palette and type come from lib/colors.ts + globals.css.
  STORY: A buyer enters their budget, sees which Dubai areas give the best STR gross
    yield at that budget (real DLD sale prices + blended AirROI/Airbtics STR data), then
    optionally drills into one area (e.g. Dubai Marina) to see a directional shortlist of
    which buildings there suit STR — clearly marked as AssetIntel's own read, not measured
    per-building data we don't have. The lead form appears only after real value is shown,
    pre-filled with what they just told the calculator.
  FIRST VIEWPORT: Serif H1, budget input + goal pills as the primary object (not buried
    under paragraphs), instant scroll-to-results on submit.
  FORM: Candidate 5 of 7 grounded structures (budget-first calculator, area ranking with
    optional building drill-down) — assigned by concept-seed.mjs (key 219a76fd). No
    challenger fused; none fit a serious property-investment tool's identity.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the finish
    review, the verdict, and DESIGN.md.
*/
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import AssetIntelLogo from "@/components/AssetIntelLogo";
import DecorativeBackdrop from "@/components/DecorativeBackdrop";
import ConsultationBanner from "@/components/home/ConsultationBanner";
import AccessGate from "@/components/AccessGate";
import { colors } from "@/lib/colors";
import { getBuildingsByArea, type BuildingRecord } from "@/lib/buildings-data";
import type { AreaStatsRow } from "@/lib/str-market-data";

const serif = "var(--font-display), ui-sans-serif, system-ui, sans-serif";

// buildings-data.ts uses the long-form curated names; live area stats use the short ones.
const AREA_TO_BUILDINGS_KEY: Record<string, string> = {
  "JBR": "Jumeirah Beach Residence (JBR)",
  "JVC": "Jumeirah Village Circle (JVC)",
};

type Goal = "max" | "balanced" | "lowrisk";

const GOALS: { key: Goal; label: string; blurb: string }[] = [
  { key: "max", label: "Maximum STR Income", blurb: "Rank purely by projected gross yield." },
  { key: "balanced", label: "Balanced Income & Growth", blurb: "Yield, weighted toward established, liquid areas." },
  { key: "lowrisk", label: "Lower-Risk Income", blurb: "Prioritise areas with the highest data confidence." },
];

const BUDGET_PRESETS = [750_000, 1_200_000, 2_000_000, 3_500_000, 5_000_000];

function fmtAED(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return "—";
  return `AED ${Math.round(n).toLocaleString()}`;
}
function fmtBudgetShort(n: number): string {
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  return `AED ${Math.round(n / 1000)}K`;
}
function affordableSizeBand(sqft: number): string {
  if (sqft < 450) return "Studio";
  if (sqft < 750) return "1BR";
  if (sqft < 1150) return "2BR";
  if (sqft < 1700) return "3BR";
  return "3BR+ / Villa";
}
function tierLabel(t: BuildingRecord["tier"]): string {
  if (t === "ultra-luxury") return "Ultra-Luxury";
  if (t === "luxury") return "Luxury";
  if (t === "mid") return "Mid-Tier";
  return "Value";
}
function tierColor(t: BuildingRecord["tier"]) {
  if (t === "ultra-luxury") return colors.primary;
  if (t === "luxury") return colors.primaryLight;
  return colors.secondaryText;
}
const TIER_RANK: Record<BuildingRecord["tier"], number> = { "ultra-luxury": 0, "luxury": 1, "mid": 2, "low": 3 };
// Rough minimum viable unit size per tier — ultra-luxury/luxury buildings rarely sell sub-650sqft units.
const MIN_VIABLE_SQFT: Record<BuildingRecord["tier"], number> = { "ultra-luxury": 900, "luxury": 650, "mid": 450, "low": 350 };

interface AreaResult {
  row: AreaStatsRow;
  affordableSqft: number | null;
  grossAnnualRevenue: number | null;
  grossYieldPct: number | null;
}

function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.secondaryText, margin: 0 }}>{children}</p>;
}
function SourceChip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, background: "rgba(27,94,74,0.08)", color: colors.primary, border: "1px solid rgba(27,94,74,0.18)" }}>
      {children}
    </span>
  );
}

// ── LEAD FORM (kept, restyled, now pre-filled from the calculator) ─────────

interface FormState { name: string; email: string; phone: string; message: string }

function LeadFormModal({ onClose, budget, goal, area }: { onClose: () => void; budget: number | null; goal: Goal | null; area: string | null }) {
  const [form, setForm] = useState<FormState>({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim() || (!form.email.trim() && !form.phone.trim())) {
      setError("Please enter your name and at least one contact method.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const notes = [
        budget && `Budget: ${fmtAED(budget)}`,
        goal && `Goal: ${GOALS.find(g => g.key === goal)?.label}`,
        area && `Area of interest: ${area}`,
        form.message && `Notes: ${form.message}`,
      ].filter(Boolean).join(" | ");
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, targetType: "service", target: "STR Investment Research", notes, message: notes }),
      });
      if (!res.ok) throw new Error("Failed");
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again or contact us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "12px 15px", borderRadius: 12, border: `1.5px solid ${colors.border}`, background: colors.bgSection, color: colors.textMain, fontSize: 14, outline: "none" };
  const labelStyle: React.CSSProperties = { fontSize: 11.5, fontWeight: 700, color: colors.textMuted, marginBottom: 6, display: "block", letterSpacing: "0.03em" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(10,20,14,0.6)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "relative", zIndex: 1, background: colors.bgMain, borderRadius: 22, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.22)", border: `1px solid ${colors.border}` }}>
        <div style={{ padding: "26px 26px 18px", borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <EyebrowLabel>STR Investment Research</EyebrowLabel>
              <h3 style={{ fontSize: 21, fontWeight: 600, color: colors.textMain, margin: "8px 0 0", fontFamily: serif }}>Get Your Detailed Shortlist</h3>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: colors.textMuted, lineHeight: 1 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {done ? (
          <div style={{ padding: "44px 26px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(27,94,74,0.10)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <h4 style={{ fontSize: 19, fontWeight: 600, color: colors.textMain, margin: "0 0 10px", fontFamily: serif }}>Request Received</h4>
            <p style={{ fontSize: 13.5, color: colors.textMuted, lineHeight: 1.7, maxWidth: 360, margin: "0 auto 24px" }}>
              Thank you — AssetIntel will review your budget and goals and follow up with a detailed shortlist and next steps.
            </p>
            <button onClick={onClose} style={{ padding: "11px 26px", borderRadius: 12, background: colors.primary, color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}>Close</button>
          </div>
        ) : (
          <div style={{ padding: "20px 26px 26px" }}>
            {(budget || area) && (
              <div style={{ background: colors.bgSage, border: `1px solid ${colors.borderSage}`, borderRadius: 12, padding: "12px 14px", marginBottom: 18, fontSize: 12.5, color: colors.textMuted }}>
                Carried over from your calculator: {budget ? <strong style={{ color: colors.textMain }}>{fmtAED(budget)}</strong> : null}{budget && area ? " · " : ""}{area ? <strong style={{ color: colors.textMain }}>{area}</strong> : null}
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Full Name *</label>
              <input style={inputStyle} placeholder="Your full name" value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Email *</label>
                <input style={inputStyle} type="email" placeholder="your@email.com" value={form.email} onChange={e => set("email", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Phone / WhatsApp</label>
                <input style={inputStyle} placeholder="+971 50 000 0000" value={form.phone} onChange={e => set("phone", e.target.value)} />
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Anything else we should know?</label>
              <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 72 }} placeholder="Preferred unit size, timeline, off-plan interest…" value={form.message} onChange={e => set("message", e.target.value)} />
            </div>
            {error && <p style={{ fontSize: 13, color: colors.error, marginBottom: 12 }}>{error}</p>}
            <p style={{ fontSize: 11, color: colors.textLight, lineHeight: 1.6, marginBottom: 18 }}>
              AssetIntel provides STR-focused market research and advisory support. Property purchase/sourcing may be handled through trusted real estate partners where applicable.
            </p>
            <button onClick={submit} disabled={submitting} style={{ width: "100%", padding: "14px", borderRadius: 12, background: submitting ? colors.textLight : colors.primary, color: "#fff", fontSize: 14.5, fontWeight: 700, border: "none", cursor: submitting ? "default" : "pointer", boxShadow: submitting ? "none" : "0 4px 16px rgba(27,94,74,0.28)" }}>
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function STRInvestmentResearchPage() {
  const router = useRouter();
  const [areaStats, setAreaStats] = useState<AreaStatsRow[]>([]);
  const [budgetInput, setBudgetInput] = useState("");
  const [budget, setBudget] = useState<number | null>(null);
  const [goal, setGoal] = useState<Goal>("balanced");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    fetch("/api/str-market-data").then(r => r.json()).then(({ data }: { data: AreaStatsRow[] }) => setAreaStats(data)).catch(() => {});
  }, []);

  const results: AreaResult[] = useMemo(() => {
    if (budget == null) return [];
    return areaStats.map(row => {
      const affordableSqft = row.median_sale_price_per_sqft ? budget / row.median_sale_price_per_sqft : null;
      const grossAnnualRevenue = row.adr != null && row.occupancy != null ? row.adr * row.occupancy * 365 : null;
      const grossYieldPct = grossAnnualRevenue != null ? (grossAnnualRevenue / budget) * 100 : null;
      return { row, affordableSqft, grossAnnualRevenue, grossYieldPct };
    }).filter(r => r.grossYieldPct != null || r.affordableSqft != null);
  }, [areaStats, budget]);

  const rankedResults = useMemo(() => {
    const confScore = (c: string | null) => (c === "high" ? 3 : c === "medium" ? 2 : 1);
    const sorted = [...results].sort((a, b) => {
      if (goal === "lowrisk") {
        const cDiff = confScore(b.row.confidence) - confScore(a.row.confidence);
        if (cDiff !== 0) return cDiff;
      }
      return (b.grossYieldPct ?? -1) - (a.grossYieldPct ?? -1);
    });
    return sorted;
  }, [results, goal]);

  const areaDetail = selectedArea ? results.find(r => r.row.area === selectedArea) : null;
  const areaBuildings = useMemo(() => {
    if (!selectedArea) return [];
    const key = AREA_TO_BUILDINGS_KEY[selectedArea] ?? selectedArea;
    const all = getBuildingsByArea(key).sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier]);
    const sqft = areaDetail?.affordableSqft;
    if (sqft == null) return all.slice(0, 9);
    const affordable = all.filter(b => sqft >= MIN_VIABLE_SQFT[b.tier]);
    // If nothing at this budget qualifies, fall back to the lowest tier present so the list isn't empty.
    return (affordable.length > 0 ? affordable : all.filter(b => b.tier === "low" || b.tier === "mid")).slice(0, 9);
  }, [selectedArea, areaDetail]);
  const areaBuildingsBudgetLimited = areaDetail?.affordableSqft != null
    && getBuildingsByArea(AREA_TO_BUILDINGS_KEY[selectedArea ?? ""] ?? selectedArea ?? "").some(b => areaDetail.affordableSqft! < MIN_VIABLE_SQFT[b.tier])
    && areaBuildings.length > 0;

  function runCalculator() {
    const n = Number(budgetInput.replace(/[^\d]/g, ""));
    if (!n || n <= 0) {
      setBudgetError("Enter a budget in AED to see your best areas.");
      return;
    }
    setBudgetError(null);
    setBudget(n);
    setShowResults(true);
    setSelectedArea(null);
    requestAnimationFrame(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function pickArea(area: string) {
    setSelectedArea(area);
    requestAnimationFrame(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  const pad = "72px 24px";

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh", position: "relative" }}>
      <DecorativeBackdrop />
      <div style={{ position: "relative", zIndex: 1 }}>
        <SiteNav active="investment-research" />
        {formOpen && <LeadFormModal onClose={() => setFormOpen(false)} budget={budget} goal={goal} area={selectedArea} />}

        {/* ── HERO / CALCULATOR ── */}
        <section style={{ padding: "56px 24px 0" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
            <EyebrowLabel>STR Investment Research</EyebrowLabel>
            <h1 style={{ fontSize: "clamp(30px, 4.5vw, 46px)", fontFamily: serif, fontWeight: 600, color: colors.primary, margin: "12px 0 14px", lineHeight: 1.15 }}>
              What Will Your Budget Buy For STR?
            </h1>
            <p style={{ fontSize: 15.5, color: colors.textMuted, lineHeight: 1.7, maxWidth: 620, margin: "0 auto 36px" }}>
              Enter what you're looking to spend and AssetIntel ranks Dubai areas by projected short-term-rental yield at that budget — using live DLD sale prices and blended AirROI/Airbtics market data.
            </p>
          </div>

          {/* Calculator card */}
          <div style={{ maxWidth: 760, margin: "0 auto", background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 24, padding: "32px 32px", boxShadow: colors.shadowMd }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.textLight, marginBottom: 10 }}>Your Buying Budget (AED)</label>
            <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <input
                type="text"
                inputMode="numeric"
                placeholder="e.g. 1,500,000"
                value={budgetInput}
                onChange={e => {
                  const digits = e.target.value.replace(/[^\d]/g, "");
                  setBudgetInput(digits ? Number(digits).toLocaleString() : "");
                  if (budgetError) setBudgetError(null);
                }}
                onKeyDown={e => { if (e.key === "Enter") runCalculator(); }}
                style={{ flex: 1, minWidth: 200, padding: "15px 18px", borderRadius: 14, border: `1.5px solid ${budgetError ? colors.error : colors.border}`, background: colors.bgMain, fontSize: 22, fontFamily: serif, fontWeight: 600, color: colors.textMain, outline: "none" }}
              />
              <button
                onClick={runCalculator}
                style={{ padding: "15px 30px", borderRadius: 14, background: colors.primary, color: "#fff", fontSize: 14.5, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(27,94,74,0.28)", whiteSpace: "nowrap" }}
              >
                Find My Best Areas →
              </button>
            </div>
            {budgetError && <p style={{ fontSize: 12.5, color: colors.error, margin: "-8px 0 14px" }}>{budgetError}</p>}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
              {BUDGET_PRESETS.map(p => (
                <button key={p} onClick={() => { setBudgetInput(p.toLocaleString()); setBudgetError(null); }} style={{ padding: "7px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: `1px solid ${colors.border}`, background: "transparent", color: colors.textMuted }}>
                  {fmtBudgetShort(p)}
                </button>
              ))}
            </div>

            <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.textLight, marginBottom: 10 }}>Your Goal</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }} className="sir-goal-grid">
              {GOALS.map(g => (
                <button
                  key={g.key}
                  onClick={() => setGoal(g.key)}
                  style={{
                    textAlign: "left", padding: "13px 14px", borderRadius: 12, cursor: "pointer",
                    border: `1.5px solid ${goal === g.key ? colors.primary : colors.border}`,
                    background: goal === g.key ? "rgba(27,94,74,0.06)" : "transparent",
                  }}
                >
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: goal === g.key ? colors.primary : colors.textMain, margin: "0 0 3px" }}>{g.label}</p>
                  <p style={{ fontSize: 11, color: colors.textLight, margin: 0, lineHeight: 1.4 }}>{g.blurb}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── RESULTS ── */}
        {showResults && (
          <section id="results" style={{ padding: pad, scrollMarginTop: 24 }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <AccessGate source="str-investment-research" title="Unlock Your Area Rankings" subtitle="Free — enter your name and email to see which areas fit your budget and the building shortlist.">
              {!selectedArea ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
                    <div>
                      <EyebrowLabel>YOUR RESULTS</EyebrowLabel>
                      <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontFamily: serif, fontWeight: 600, color: colors.primary, margin: "10px 0 6px" }}>
                        Best Areas For {fmtAED(budget)}
                      </h2>
                      <p style={{ fontSize: 13.5, color: colors.textMuted, margin: 0 }}>Ranked by projected gross STR yield on this budget. Tap an area to see building options.</p>
                      <p style={{ fontSize: 11, color: colors.textLight, margin: "4px 0 0" }}>*Gross, before furnishing, fees, and vacancy — directional, not a guarantee.</p>
                    </div>
                  </div>

                  {rankedResults.length === 0 && <p style={{ fontSize: 13.5, color: colors.textMuted }}>Live market data is still syncing — check back shortly.</p>}

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {rankedResults.map((r, i) => (
                      <button
                        key={r.row.area}
                        onClick={() => pickArea(r.row.area)}
                        style={{
                          display: "grid", gridTemplateColumns: "28px 1.6fr 1fr 1fr 1fr auto", alignItems: "center", gap: 14,
                          textAlign: "left", padding: "16px 20px", borderRadius: 18, cursor: "pointer",
                          background: colors.bgSection, border: `1px solid ${colors.border}`, boxShadow: colors.shadowSm,
                        }}
                        className="sir-result-row"
                      >
                        <span style={{ fontSize: 13, fontWeight: 700, color: colors.textLight }}>{i + 1}</span>
                        <span style={{ fontSize: 17, fontWeight: 600, color: colors.textMain, fontFamily: serif }}>{r.row.area}</span>
                        <span className="sir-result-metric">
                          <span style={{ display: "block", fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: colors.textLight }}>Buys You</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: colors.textMain }}>{r.affordableSqft ? affordableSizeBand(r.affordableSqft) : "—"}</span>
                        </span>
                        <span className="sir-result-metric">
                          <span style={{ display: "block", fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: colors.textLight }}>Est. Annual STR</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: colors.textMain }}>{fmtAED(r.grossAnnualRevenue)}</span>
                        </span>
                        <span className="sir-result-metric">
                          <span style={{ display: "block", fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: colors.textLight }}>Gross Yield*</span>
                          <span style={{ fontSize: 18, fontWeight: 600, color: colors.primary, fontFamily: serif }}>{r.grossYieldPct != null ? `${r.grossYieldPct.toFixed(1)}%` : "—"}</span>
                        </span>
                        <span style={{ color: colors.secondaryText, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>Buildings →</span>
                      </button>
                    ))}
                  </div>

                  <p style={{ fontSize: 11.5, color: colors.textLight, marginTop: 18, lineHeight: 1.6, maxWidth: 720 }}>
                    Estimates use each area's live median DLD sale price per sqft and blended AirROI/Airbtics ADR and occupancy, averaged across unit sizes — not a size-specific projection. Directional, not a guarantee of purchase price or income.
                  </p>
                </>
              ) : (
                <>
                  <button onClick={() => setSelectedArea(null)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: colors.textMuted, fontSize: 13, fontWeight: 600, marginBottom: 18, padding: 0 }}>
                    ← Compare All Areas
                  </button>
                  <EyebrowLabel>AREA DETAIL</EyebrowLabel>
                  <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontFamily: serif, fontWeight: 600, color: colors.primary, margin: "10px 0 20px" }}>{selectedArea} At {fmtAED(budget)}</h2>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 8 }}>
                    {[
                      { label: "Buys You", value: areaDetail?.affordableSqft ? `${affordableSizeBand(areaDetail.affordableSqft)} (~${Math.round(areaDetail.affordableSqft).toLocaleString()} sqft)` : "—" },
                      { label: "Avg. ADR", value: fmtAED(areaDetail?.row.adr) },
                      { label: "Avg. Occupancy", value: areaDetail?.row.occupancy != null ? `${Math.round(areaDetail.row.occupancy * 100)}%` : "—" },
                      { label: "Est. Annual STR Revenue*", value: fmtAED(areaDetail?.grossAnnualRevenue) },
                      { label: "Gross Yield On Budget*", value: areaDetail?.grossYieldPct != null ? `${areaDetail.grossYieldPct.toFixed(1)}%` : "—" },
                    ].map(m => (
                      <div key={m.label} style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 16, padding: "16px 16px" }}>
                        <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: colors.textLight, margin: "0 0 6px" }}>{m.label}</p>
                        <p style={{ fontSize: 18, fontWeight: 600, color: colors.textMain, margin: 0, fontFamily: serif }}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: colors.textLight, margin: "0 0 28px" }}>*Gross, before furnishing, fees, and vacancy — directional, not a guarantee.</p>

                  {/* Building shortlist — editorial zone */}
                  <div style={{ background: colors.bgSage, border: `1px solid ${colors.borderSage}`, borderRadius: 20, padding: "24px 26px" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.secondaryText, margin: "0 0 4px" }}>AssetIntel View — Directional, Not Measured Data</p>
                    <h3 style={{ fontSize: 20, fontFamily: serif, fontWeight: 600, color: colors.textMain, margin: "8px 0 6px" }}>Buildings To Consider In {selectedArea}</h3>
                    <p style={{ fontSize: 12.5, color: colors.textMuted, lineHeight: 1.6, marginBottom: 18, maxWidth: 640 }}>
                      Ranked by AssetIntel's building-quality tier — a proxy for guest appeal, not a live per-building STR performance measurement. Verify actual asking price and unit availability before committing.
                      {areaBuildingsBudgetLimited && " Shown buildings are narrowed to tiers realistic at your budget's affordable unit size — higher-tier buildings in this area are likely out of reach at this price point."}
                    </p>
                    {areaBuildings.length === 0 ? (
                      <p style={{ fontSize: 13, color: colors.textMuted }}>No curated building shortlist for this area yet — we'll factor this into your detailed research request below.</p>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                        {areaBuildings.map(b => (
                          <div key={b.name} style={{ background: colors.bgMain, border: `1px solid ${colors.border}`, borderRadius: 12, padding: "13px 15px" }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: colors.textMain, margin: "0 0 6px" }}>{b.name}</p>
                            <span style={{ fontSize: 10, fontWeight: 700, color: tierColor(b.tier), background: `${tierColor(b.tier)}14`, padding: "2px 9px", borderRadius: 999 }}>{tierLabel(b.tier)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Lead capture — appears after real value is shown */}
              <div style={{ marginTop: 32, background: `linear-gradient(145deg, ${colors.primary} 0%, #0F3E33 100%)`, borderRadius: 22, padding: "28px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, boxShadow: "0 12px 36px rgba(27,94,74,0.24)" }}>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: "0 0 6px", fontFamily: serif }}>Want a detailed shortlist, not just an estimate?</p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", margin: 0, maxWidth: 480 }}>AssetIntel reviews furnishing cost, setup requirements, and risk — and can introduce a trusted real estate partner once you're ready.</p>
                </div>
                <button onClick={() => setFormOpen(true)} style={{ padding: "13px 26px", borderRadius: 12, background: colors.secondary, color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
                  Request Detailed Research →
                </button>
              </div>
            </AccessGate>
            </div>
          </section>
        )}

        {/* ── READY VS OFF-PLAN (kept — real informational value) ── */}
        <section style={{ padding: pad, background: colors.bgSection, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <EyebrowLabel>PROPERTY TYPE</EyebrowLabel>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontFamily: serif, fontWeight: 600, color: colors.primary, margin: "10px 0 8px" }}>Ready Or Off-Plan — Both Change The STR Calculation</h2>
            <p style={{ fontSize: 14.5, color: colors.textMuted, lineHeight: 1.65, marginBottom: 28, maxWidth: 640 }}>The numbers above are area-level. Whether the specific unit is ready or off-plan changes what you can verify before you commit.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="sir-comparison-grid">
              {[
                { title: "Ready Property", accent: colors.primary, points: ["Current building quality can be assessed directly", "Furnishing needs can be estimated sooner", "STR potential can be modelled against real comparables", "Faster path to rental income"] },
                { title: "Off-Plan Property", accent: colors.secondaryText, points: ["Handover timing and future supply must be considered", "Developer and building positioning affects guest appeal", "Projected STR demand should be treated as directional", "Best suited to a forward-looking STR strategy"] },
              ].map(col => (
                <div key={col.title} style={{ background: colors.bgMain, border: `1px solid ${colors.border}`, borderRadius: 20, padding: "26px 26px" }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: colors.textMain, fontFamily: serif, margin: "0 0 16px" }}>{col.title}</h3>
                  {col.points.map((pt, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 11 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: col.accent, marginTop: 6, flexShrink: 0 }} />
                      <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.55, margin: 0 }}>{pt}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY THIS MATTERS (kept — real informational value) ── */}
        <section style={{ padding: pad }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <EyebrowLabel>WHY IT MATTERS</EyebrowLabel>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontFamily: serif, fontWeight: 600, color: colors.primary, margin: "10px 0 20px" }}>The Best Purchase Isn't Always The Highest-Grossing Unit</h2>
            <div style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 20, padding: "26px 28px", maxWidth: 760 }}>
              {[
                "Net income matters more than headline revenue.",
                "Furnishing cost can change the true return.",
                "Low-season performance can expose weak investments.",
                "Building rules and guest access can affect STR suitability.",
                "Operator execution can impact occupancy, reviews, and owner returns.",
                "Off-plan potential should be reassessed closer to handover.",
              ].map((pt, i, arr) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < arr.length - 1 ? 13 : 0 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.secondary, marginTop: 7, flexShrink: 0 }} />
                  <p style={{ fontSize: 13.5, color: colors.textMain, lineHeight: 1.6, margin: 0 }}>{pt}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{ padding: pad, background: `linear-gradient(135deg, ${colors.primary} 0%, #0F3E33 100%)` }}>
          <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.secondaryOnDark, margin: "0 0 14px" }}>STR Investment Research</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontFamily: serif, fontWeight: 600, color: "#fff", margin: "0 0 14px" }}>Ready To Buy With STR In Mind?</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", maxWidth: 480, margin: "0 auto 28px", lineHeight: 1.65 }}>Run the calculator above with your real budget, or request a detailed shortlist from AssetIntel directly.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => { setFormOpen(true); }} style={{ padding: "14px 28px", borderRadius: 12, background: colors.secondary, color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 18px rgba(0,0,0,0.18)" }}>
                Request Detailed Research
              </button>
              <button onClick={() => router.push("/str-market-intel")} style={{ padding: "14px 28px", borderRadius: 12, background: "transparent", color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 700, border: "1.5px solid rgba(255,255,255,0.3)", cursor: "pointer" }}>
                View STR Market Intel
              </button>
            </div>
          </div>
        </section>

        <ConsultationBanner />

        <footer style={{ background: colors.primary, padding: "28px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ filter: "brightness(0) invert(1)", opacity: 0.9 }}><AssetIntelLogo size={22} /></div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>© {new Date().getFullYear()} AssetIntel. All rights reserved. · assetintel.ae</p>
          </div>
        </footer>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .sir-goal-grid { grid-template-columns: 1fr !important; }
          .sir-comparison-grid { grid-template-columns: 1fr !important; }
          .sir-result-row { grid-template-columns: 18px 1fr repeat(3, minmax(0, 58px)) auto !important; gap: 8px !important; padding: 14px 12px !important; }
          .sir-result-metric span:first-child { font-size: 7.5px !important; }
          .sir-result-metric span:last-child { font-size: 12px !important; }
        }
        @media (max-width: 420px) {
          .sir-result-row { grid-template-columns: 16px 1fr repeat(3, minmax(0, 46px)) auto !important; gap: 5px !important; }
        }
      `}</style>
    </div>
  );
}
