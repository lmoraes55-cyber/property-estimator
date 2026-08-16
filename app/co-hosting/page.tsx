"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import AssetIntelLogo from "@/components/AssetIntelLogo";
import DecorativeBackdrop from "@/components/DecorativeBackdrop";
import ConsultationBanner from "@/components/home/ConsultationBanner";
import { colors } from "@/lib/colors";
import {
  runEstimator, BUILDING_DIRECTORY,
  type UnitSize, type ViewType, type FurnishedStatus,
} from "@/lib/estimator";
import { BUILDINGS_DATABASE } from "@/lib/buildings-data";

const serif = "'Georgia', serif";

const ALL_BUILDINGS = Array.from(
  new Set([...Object.keys(BUILDINGS_DATABASE), ...Object.keys(BUILDING_DIRECTORY)])
).sort();

const COMPARE_UNITS: UnitSize[] = ["STU", "1BR", "2BR", "3BR"];

// Fee midpoints of each tier's published range. Costs and market revenue are held
// identical across all three, so the only variable is who takes a cut — which makes
// the break-even lift a clean f/(1-f) and keeps the comparison apples-to-apples.
// An owner running their own listing typically earns below a professionally-run one:
// static pricing instead of dynamic, slower guest response (which Airbnb's ranking
// punishes), weaker listing optimisation and lower review velocity. Applied to
// self-manage only — a co-host is paid precisely to close that gap, which is why it
// carries no penalty despite also being Airbnb-only.
const SELF_PERF_GAP = 0.06;

const MODELS: {
  key: string; label: string; fee: number; time: string; channels: string;
  perfGap: number; quality: string;
  listing: string; exit: string; permit: string;
  multiChannel?: boolean; highlight?: boolean;
}[] = [
  {
    key: "self", label: "Self-Manage", fee: 0, time: "8–12 hrs/week", channels: "Airbnb only",
    perfGap: SELF_PERF_GAP, quality: `Owner-run (−${Math.round(SELF_PERF_GAP * 100)}%)`,
    listing: "Yours", exit: "Stop anytime", permit: "You",
  },
  {
    key: "cohost", label: "Co-Hosting", fee: 0.09, time: "~1 hr/week", channels: "Airbnb only",
    perfGap: 0, quality: "Professionally run",
    listing: "Yours", exit: "Stop anytime — revoke access", permit: "You", highlight: true,
  },
  {
    key: "operator", label: "Full Management", fee: 0.20, time: "Minimal", channels: "10–12 + direct",
    perfGap: 0, quality: "Professionally run",
    listing: "Operator's account", exit: "1–3 months' notice — some lock in 6", permit: "Usually the operator",
    multiChannel: true,
  },
];

// Operators distribute across 10-12 OTAs plus their own repeat-guest base; self-manage
// and co-hosting both run on the owner's single Airbnb listing. That distribution gap is
// the main lever that can offset a bigger fee — so it's an explicit, adjustable input
// rather than a number baked in. Default sits at the 20% operator's break-even (+25%),
// which is deliberately neutral: it neither flatters nor penalises the operator.
const UPLIFT_PRESETS = [0, 0.15, 0.25, 0.35, 0.5];

const aed = (n: number) => `AED ${Math.round(n).toLocaleString()}`;

function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.secondaryText, margin: "0 0 10px" }}>{children}</p>;
}

const SETUP_FEES: { unit: string; fee: number }[] = [
  { unit: "Studio / 1BR", fee: 700 },
  { unit: "2BR", fee: 800 },
  { unit: "3BR", fee: 900 },
  { unit: "4BR+", fee: 1000 },
];

const LADDER = [
  { title: "Self-Manage", fee: "Your time only", desc: "You run everything — guest comms, pricing, cleaning coordination, compliance. Full control, full effort.", href: "/self-manage" },
  { title: "Co-Hosting", fee: "8–10% of revenue", desc: "A partner co-host runs day-to-day guest communication and listing management. The listing, reviews and DET permit stay in your name — so you can stop or sell whenever you want.", highlight: true },
  { title: "Full Management", fee: "15–25% of revenue", desc: "A licensed operator takes over everything — pricing, cleaning, maintenance, compliance — for a larger cut, and usually lists the unit on their own account.", href: "/operator-match" },
];

const VETTING = [
  { title: "DET-licensed", desc: "Holds a current Dubai Holiday Home Operator licence — verified before we introduce anyone." },
  { title: "Insured", desc: "Carries guest-liability and property-damage cover, not just a trade licence." },
  { title: "Track record", desc: "Actively operating Dubai holiday homes with live listings and guest reviews we can check." },
  { title: "Transparent terms", desc: "Publishes its fee, notice period, and exit terms in writing before you sign anything." },
];

const INCLUDED = [
  "Guest messaging — inquiries, check-in instructions, check-out reminders",
  "Listing management on your existing Airbnb account",
  "Booking calendar coordination",
  "Review monitoring and response",
];
const NOT_INCLUDED = [
  "Cleaning and turnover coordination (your responsibility, or add separately)",
  "Dynamic pricing / revenue management",
  "DET permit and compliance filing — stays with you as the registered holder",
  "Furnishing, maintenance, or on-the-ground property visits",
];

function ComparisonCalculator() {
  const [search, setSearch] = useState("");
  const [building, setBuilding] = useState("");
  const [unitSize, setUnitSize] = useState<UnitSize>("1BR");
  const [showSug, setShowSug] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [uplift, setUplift] = useState(0.25);
  const [calc, setCalc] = useState<null | { gross: number; costs: number; live: boolean }>(null);

  const suggestions = search.trim().length >= 2 && showSug
    ? ALL_BUILDINGS.filter(b => b.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 7)
    : [];

  async function run() {
    if (!building) { setErr("Pick a building from the list to run the comparison."); return; }
    setLoading(true); setErr(null);

    const rec = BUILDINGS_DATABASE[building];
    let ltrOverride: number | undefined;
    // Live DLD Ejari baseline where we can get it; the estimator falls back to its
    // ingested snapshot if this times out, so a slow API degrades rather than fails.
    try {
      const qs = new URLSearchParams({ project: rec?.dldKey || building, bedrooms: unitSize });
      if (rec?.dldArea) qs.set("area", rec.dldArea);
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(`/api/ltr-rents?${qs}`, { signal: ctrl.signal });
      clearTimeout(timer);
      const data = await res.json();
      if (data?.stat?.median) ltrOverride = Math.round(data.stat.median);
    } catch { /* fall through to the estimator's own baseline */ }

    try {
      // managementFee: 0 deliberately — this yields the market revenue with no fee
      // grossed into it, so each model's cut below is applied to the same gross.
      const est = runEstimator({
        propertyName: `${building} · ${unitSize}`,
        buildingName: building,
        unitSize,
        unitType: "Apartment",
        floor: 15,
        view: "Community View" as ViewType,
        furnished: "Furnished" as FurnishedStatus,
        managementFee: 0,
        occStrategy: "LOCCHP",
        dldKey: rec?.dldKey,
        dldArea: rec?.dldArea,
        longTermRentOverride: ltrOverride,
      });
      setCalc({
        gross: est.annualRevenue,
        costs: est.annualUtilities + est.annualMaintenance + est.annualFurnitureAmort,
        live: !!ltrOverride,
      });
    } catch {
      setErr("Couldn't run the comparison for this building — try another.");
    }
    setLoading(false);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", border: `1.5px solid ${colors.border}`,
    borderRadius: 12, fontSize: 14, background: colors.bgMain, color: colors.textMain,
    outline: "none", boxSizing: "border-box",
  };

  return (
    <section style={{ padding: "72px 24px", background: colors.bgSection, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <EyebrowLabel>RUN THE NUMBERS</EyebrowLabel>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontFamily: serif, fontWeight: 700, color: colors.primary, margin: "0 0 10px" }}>
            What Each Model Actually Nets You
          </h2>
          <p style={{ fontSize: 14, color: colors.textMuted, maxWidth: 620, margin: "0 auto", lineHeight: 1.65 }}>
            Same property, same market revenue, same running costs — the only variable is who takes a cut. Enter your unit to see the real difference.
          </p>
        </div>

        {/* Inputs */}
        <div style={{ background: colors.bgMain, border: `1px solid ${colors.border}`, borderRadius: 20, padding: "24px 26px", marginBottom: 22 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 12, alignItems: "end" }} className="ch-calc-grid">
            <div style={{ position: "relative" }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: colors.textLight, display: "block", marginBottom: 6 }}>Building / Development</label>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setShowSug(true); setBuilding(""); }}
                placeholder="Start typing, e.g. Marina Gate"
                style={inputStyle}
              />
              {suggestions.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 6, background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 12, boxShadow: colors.shadowMd, zIndex: 20, maxHeight: 240, overflowY: "auto" }}>
                  {suggestions.map(b => (
                    <button
                      key={b}
                      onClick={() => { setBuilding(b); setSearch(b); setShowSug(false); setCalc(null); setErr(null); }}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 14px", background: "none", border: "none", borderBottom: `1px solid ${colors.border}`, cursor: "pointer", fontSize: 13.5, color: colors.textMain }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: colors.textLight, display: "block", marginBottom: 6 }}>Unit Size</label>
              <select value={unitSize} onChange={e => { setUnitSize(e.target.value as UnitSize); setCalc(null); }} style={inputStyle}>
                {COMPARE_UNITS.map(u => <option key={u} value={u}>{u === "STU" ? "Studio" : u}</option>)}
              </select>
            </div>
            <button
              onClick={run}
              disabled={loading}
              style={{ padding: "13px 24px", borderRadius: 12, background: loading ? colors.textLight : colors.primary, color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: loading ? "default" : "pointer", whiteSpace: "nowrap", boxShadow: loading ? "none" : "0 4px 16px rgba(27,94,74,0.28)" }}
            >
              {loading ? "Running…" : "Compare →"}
            </button>
          </div>
          {err && <p style={{ fontSize: 12.5, color: colors.error, margin: "12px 0 0" }}>{err}</p>}
        </div>

        {/* Results */}
        {calc && (() => {
          const grossFor = (m: typeof MODELS[number]) =>
            calc.gross * (1 - m.perfGap) * (1 + (m.multiChannel ? uplift : 0));
          const netFor = (m: typeof MODELS[number]) => grossFor(m) * (1 - m.fee) - calc.costs;
          const selfNet = netFor(MODELS[0]);
          const best = MODELS.reduce((a, b) => (netFor(b) > netFor(a) ? b : a));
          return (
          <>
            {/* Channel-uplift control — the single assumption that decides this comparison */}
            <div style={{ background: colors.bgSage, border: `1px solid ${colors.borderSage}`, borderRadius: 18, padding: "20px 22px", marginBottom: 20 }}>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMain, margin: "0 0 4px" }}>
                Multi-channel uplift assumed for a full operator
              </p>
              <p style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.6, margin: "0 0 14px", maxWidth: 620 }}>
                Self-managing and co-hosting both run on your single Airbnb listing. A licensed operator distributes across 10–12 OTAs plus their own repeat guests — the one advantage that can outweigh a bigger fee. Set how much extra revenue you think that&apos;s worth.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {UPLIFT_PRESETS.map(u => (
                  <button
                    key={u}
                    onClick={() => setUplift(u)}
                    style={{
                      padding: "8px 16px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                      border: `1.5px solid ${uplift === u ? colors.primary : colors.border}`,
                      background: uplift === u ? colors.primary : "transparent",
                      color: uplift === u ? "#fff" : colors.textMuted,
                    }}
                  >
                    +{Math.round(u * 100)}%
                  </button>
                ))}
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 580 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "10px 12px 10px 0" }}></th>
                    {MODELS.map(m => (
                      <th key={m.key} style={{ textAlign: "left", padding: "10px 12px", background: m.highlight ? "rgba(184,138,68,0.07)" : "transparent", borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                        <span style={{ display: "block", fontSize: 14.5, fontFamily: serif, fontWeight: 700, color: colors.textMain }}>{m.label}</span>
                        <span style={{ display: "block", fontSize: 11.5, color: m.highlight ? colors.secondaryText : colors.textMuted, fontWeight: 600, marginTop: 2 }}>
                          {m.fee === 0 ? "no fee" : `${Math.round(m.fee * 100)}% fee`}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Channels — the structural difference */}
                  <tr style={{ borderTop: `1px solid ${colors.border}` }}>
                    <td style={{ padding: "12px 12px 12px 0", fontSize: 12.5, color: colors.textMuted, fontWeight: 600 }}>Booking channels</td>
                    {MODELS.map(m => (
                      <td key={m.key} style={{ padding: "12px", fontSize: 13, fontWeight: m.multiChannel ? 700 : 400, color: m.multiChannel ? colors.primary : colors.textMain, background: m.highlight ? "rgba(184,138,68,0.07)" : "transparent" }}>{m.channels}</td>
                    ))}
                  </tr>
                  {/* Pricing/response quality — shown, not buried in the revenue line */}
                  <tr style={{ borderTop: `1px solid ${colors.border}` }}>
                    <td style={{ padding: "12px 12px 12px 0", fontSize: 12.5, color: colors.textMuted, fontWeight: 600 }}>
                      Pricing &amp; guest response
                      <span style={{ display: "block", fontSize: 11, color: colors.textLight, fontWeight: 400, marginTop: 2 }}>Dynamic pricing, response speed, review velocity</span>
                    </td>
                    {MODELS.map(m => (
                      <td key={m.key} style={{ padding: "12px", fontSize: 13, fontWeight: m.perfGap > 0 ? 700 : 400, color: m.perfGap > 0 ? colors.error : colors.textMain, background: m.highlight ? "rgba(184,138,68,0.07)" : "transparent" }}>{m.quality}</td>
                    ))}
                  </tr>
                  {[
                    { label: "Gross STR revenue", sub: undefined as string | undefined, get: (m: typeof MODELS[number]) => grossFor(m) },
                    { label: "Management fee", sub: undefined as string | undefined, get: (m: typeof MODELS[number]) => -(grossFor(m) * m.fee) },
                    { label: "Running costs", sub: "Utilities, maintenance, furniture amortisation", get: () => -calc.costs },
                  ].map(row => (
                    <tr key={row.label} style={{ borderTop: `1px solid ${colors.border}` }}>
                      <td style={{ padding: "12px 12px 12px 0", fontSize: 12.5, color: colors.textMuted, fontWeight: 600 }}>
                        {row.label}
                        {row.sub && <span style={{ display: "block", fontSize: 11, color: colors.textLight, fontWeight: 400, marginTop: 2 }}>{row.sub}</span>}
                      </td>
                      {MODELS.map(m => {
                        const v = row.get(m);
                        return (
                          <td key={m.key} style={{ padding: "12px", fontSize: 13.5, color: colors.textMain, background: m.highlight ? "rgba(184,138,68,0.07)" : "transparent" }}>
                            {v === 0 ? "—" : (v < 0 ? `− ${aed(Math.abs(v))}` : aed(v))}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Net */}
                  <tr style={{ borderTop: `2px solid ${colors.primary}` }}>
                    <td style={{ padding: "16px 12px 16px 0", fontSize: 13, color: colors.textMain, fontWeight: 700 }}>Net to you / year</td>
                    {MODELS.map(m => (
                      <td key={m.key} style={{ padding: "16px 12px", background: m.highlight ? "rgba(184,138,68,0.07)" : "transparent" }}>
                        <span style={{ fontSize: 19, fontFamily: serif, fontWeight: 700, color: m.highlight ? colors.secondaryText : colors.primary }}>
                          {aed(netFor(m))}
                        </span>
                      </td>
                    ))}
                  </tr>
                  {/* vs self-managing */}
                  <tr style={{ borderTop: `1px solid ${colors.border}`, background: colors.bgSage }}>
                    <td style={{ padding: "14px 12px 14px 0", fontSize: 12.5, color: colors.textMain, fontWeight: 700 }}>vs self-managing</td>
                    {MODELS.map(m => {
                      const d = netFor(m) - selfNet;
                      return (
                        <td key={m.key} style={{ padding: "14px 12px", fontSize: 14, fontFamily: serif, fontWeight: 700, color: m.fee === 0 ? colors.textLight : (d >= 0 ? colors.primary : colors.error) }}>
                          {m.fee === 0 ? "—" : `${d >= 0 ? "+" : "−"} ${aed(Math.abs(d))}`}
                        </td>
                      );
                    })}
                  </tr>
                  {/* Time */}
                  <tr style={{ borderTop: `1px solid ${colors.border}` }}>
                    <td style={{ padding: "14px 12px 14px 0", fontSize: 12.5, color: colors.textMuted, fontWeight: 600 }}>Your time</td>
                    {MODELS.map(m => (
                      <td key={m.key} style={{ padding: "14px 12px", fontSize: 13, color: colors.textMain, background: m.highlight ? "rgba(184,138,68,0.07)" : "transparent" }}>{m.time}</td>
                    ))}
                  </tr>

                  {/* ── Control & exit: the axis the cash columns can't show ── */}
                  <tr>
                    <td colSpan={MODELS.length + 1} style={{ padding: "22px 0 8px", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.secondaryText }}>
                      Control &amp; exit
                    </td>
                  </tr>
                  {([
                    { label: "Listing & guest reviews", sub: "Where your review history builds up", get: (m: typeof MODELS[number]) => m.listing },
                    { label: "Stopping or selling", sub: "How fast you can pull the unit off STR", get: (m: typeof MODELS[number]) => m.exit },
                    { label: "DET permit holder", sub: undefined as string | undefined, get: (m: typeof MODELS[number]) => m.permit },
                  ]).map(row => (
                    <tr key={row.label} style={{ borderTop: `1px solid ${colors.border}` }}>
                      <td style={{ padding: "14px 12px 14px 0", fontSize: 12.5, color: colors.textMuted, fontWeight: 600 }}>
                        {row.label}
                        {row.sub && <span style={{ display: "block", fontSize: 11, color: colors.textLight, fontWeight: 400, marginTop: 2 }}>{row.sub}</span>}
                      </td>
                      {MODELS.map(m => {
                        const v = row.get(m);
                        const ownerKeeps = m.key !== "operator";
                        return (
                          <td key={m.key} style={{ padding: "14px 12px", fontSize: 13, fontWeight: ownerKeeps ? 700 : 400, color: ownerKeeps ? colors.primary : colors.textMuted, background: m.highlight ? "rgba(184,138,68,0.07)" : "transparent" }}>
                            {v}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Verdict — cash only, and says so */}
            <div style={{ marginTop: 18, padding: "16px 20px", background: colors.bgMain, border: `1px solid ${colors.border}`, borderRadius: 14 }}>
              <p style={{ fontSize: 13.5, color: colors.textMain, lineHeight: 1.65, margin: 0 }}>
                <strong>On cash alone,</strong> at <strong>+{Math.round(uplift * 100)}%</strong> multi-channel uplift, <strong>{best.label}</strong> comes out ahead —{" "}
                {best.key === "self"
                  ? "the fees outweigh the extra distribution at this assumption."
                  : `${aed(netFor(best) - selfNet)} more per year than self-managing, without the ${MODELS[0].time.replace("/week", " a week")}.`}
                {" "}A 20% operator needs <strong>+25%</strong> just to break even; a 9% co-host needs <strong>+9.9%</strong>.
              </p>
            </div>

            {/* The axis the cash columns can't price */}
            <div style={{ marginTop: 12, padding: "18px 22px", background: colors.bgSage, border: `1px solid ${colors.borderSage}`, borderRadius: 14 }}>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMain, margin: "0 0 6px" }}>What the money columns don&apos;t price: optionality</p>
              <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.7, margin: 0 }}>
                Co-hosting rarely wins on net income — it carries a fee without the extra distribution. What it buys is <strong>the ability to change your mind</strong>. The listing, the review history and the DET permit all stay in your name, so you can stop short-term letting, switch to a long tenant, or put the unit on the market whenever you choose — no notice period, no waiting out someone else&apos;s forward bookings, no rebuilding a review score from zero on a new listing. Under full management the listing and its review history typically sit on the operator&apos;s account, so leaving means starting again. If you expect to hold and let for years, that flexibility is worth little. If you might sell, move in, or switch strategy, it can be worth more than the fee gap above.
              </p>
            </div>

            <p style={{ fontSize: 11.5, color: colors.textLight, lineHeight: 1.7, marginTop: 16 }}>
              Gross revenue is AssetIntel&apos;s modelled STR projection for this unit{calc.live ? ", built on live DLD Ejari rent data" : ""} — directional, not a guarantee. Fees are the midpoint of each tier&apos;s published range (co-hosting 8–10%, full management 15–25%); your actual rate is set by the provider. Running costs are held identical across all three. Self-managed revenue is modelled <strong>{Math.round(SELF_PERF_GAP * 100)}% below</strong> a professionally-run listing — static rather than dynamic pricing, slower guest response (which Airbnb&apos;s ranking penalises) and lower review velocity. That gap is AssetIntel&apos;s own estimate drawn from operator-side experience, not a measured figure, and a diligent self-manager using pricing tools can close much of it. The multi-channel uplift is <em>your</em> assumption, not a measured figure: published estimates run from roughly +26% (Airbnb-only vs four-plus channels) to +35–50% (10+ channels), but every one of those comes from an operator or channel-management vendor with an interest in the answer, and we have no Dubai-specific measurement of it. Treat it as a lever to test, not a promise. Time estimates are indicative.
            </p>
          </>
          );
        })()}
      </div>
    </section>
  );
}

export default function CoHostingPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", property: "", unitSize: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function submit() {
    if (!form.name.trim() || !form.email.trim()) {
      setError(true);
      return;
    }
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cohosting_referral",
          name: form.name,
          email: form.email,
          phone: form.phone,
          property: form.property,
          unitSize: form.unitSize,
          message: "Co-hosting partner referral request",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Request failed");
      setSubmitted(true);
    } catch {
      setError(true);
    }
    setSubmitting(false);
  }

  const pad = "72px 24px";

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh", position: "relative" }}>
      <DecorativeBackdrop />
      <div style={{ position: "relative", zIndex: 1 }}>
        <SiteNav active="co-hosting" />

        {/* ── HERO ── */}
        <section style={{ padding: "64px 24px 0" }}>
          <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
            <EyebrowLabel>PROPERTY SOLUTIONS · CO-HOSTING</EyebrowLabel>
            <h1 style={{ fontSize: "clamp(30px, 4.5vw, 46px)", fontFamily: serif, fontWeight: 700, color: colors.primary, margin: "0 0 16px", lineHeight: 1.15 }}>
              Keep Your Permit. Hand Off The Daily Guest Work.
            </h1>
            <p style={{ fontSize: 15.5, color: colors.textMuted, lineHeight: 1.7, maxWidth: 620, margin: "0 auto 32px" }}>
              AssetIntel refers you to an independent, vetted co-host partner who handles guest messaging and listing management for a flat percentage of revenue — while the listing, the reviews and the DET permit stay in your name. Oversee everything, and stop or sell whenever you choose.
            </p>
          </div>
        </section>

        {/* ── SERVICE LADDER ── */}
        <section style={{ padding: pad }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <EyebrowLabel>WHERE THIS FITS</EyebrowLabel>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontFamily: serif, fontWeight: 700, color: colors.primary, margin: 0 }}>Three Ways To Run Your STR</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="ch-ladder-grid">
              {LADDER.map(l => (
                <div key={l.title} style={{
                  background: l.highlight ? colors.bgSection : colors.bgSection,
                  border: l.highlight ? `1.5px solid ${colors.secondary}` : `1px solid ${colors.border}`,
                  boxShadow: l.highlight ? "0 8px 28px rgba(184,138,68,0.14)" : colors.shadowSm,
                  borderRadius: 20, padding: "26px 24px",
                }}>
                  <h3 style={{ fontSize: 17, fontFamily: serif, fontWeight: 700, color: colors.textMain, margin: "0 0 6px" }}>{l.title}</h3>
                  <p style={{ fontSize: 16, fontWeight: 700, color: l.highlight ? colors.secondaryText : colors.primary, fontFamily: serif, margin: "0 0 12px" }}>{l.fee}</p>
                  <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.6, margin: "0 0 14px" }}>{l.desc}</p>
                  {l.href && (
                    <a href={l.href} style={{ fontSize: 12.5, fontWeight: 700, color: colors.primary, textDecoration: "none" }}>Learn more →</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LIVE COMPARISON ── */}
        <ComparisonCalculator />

        {/* ── WHAT'S INCLUDED ── */}
        <section style={{ padding: pad, borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <EyebrowLabel>SCOPE</EyebrowLabel>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontFamily: serif, fontWeight: 700, color: colors.primary, margin: "0 0 10px" }}>What Co-Hosting Covers</h2>
              <p style={{ fontSize: 14, color: colors.textMuted, maxWidth: 620, margin: "0 auto", lineHeight: 1.65 }}>
                Co-hosting covers the guest-facing work. Compliance and pricing strategy stay with you by design — that&apos;s what keeps the fee at 8–10% instead of 15–25%.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="ch-scope-grid">
              <div style={{ background: colors.bgMain, border: `1px solid ${colors.border}`, borderRadius: 18, padding: "22px 24px" }}>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: colors.primary, margin: "0 0 14px" }}>Included</p>
                {INCLUDED.map(item => (
                  <div key={item} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 11 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.primary, marginTop: 6, flexShrink: 0 }} />
                    <p style={{ fontSize: 13, color: colors.textMain, lineHeight: 1.55, margin: 0 }}>{item}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: colors.bgMain, border: `1px solid ${colors.border}`, borderRadius: 18, padding: "22px 24px" }}>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: colors.textLight, margin: "0 0 14px" }}>Not Included (Stays With You)</p>
                {NOT_INCLUDED.map(item => (
                  <div key={item} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 11 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.textLight, marginTop: 6, flexShrink: 0 }} />
                    <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.55, margin: 0 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section style={{ padding: pad }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <EyebrowLabel>PRICING</EyebrowLabel>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontFamily: serif, fontWeight: 700, color: colors.primary, margin: "0 0 10px" }}>A Flat Percentage, Plus A One-Time Setup</h2>
              <p style={{ fontSize: 14, color: colors.textMuted, maxWidth: 560, margin: "0 auto", lineHeight: 1.65 }}>
                Set by the referred partner co-host, not AssetIntel. Figures below are indicative — your partner confirms exact terms before you commit to anything.
              </p>
            </div>

            <div style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 20, padding: "28px 30px", marginBottom: 20, textAlign: "center" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.textLight, margin: "0 0 8px" }}>Ongoing Co-Hosting Fee</p>
              <p style={{ fontSize: 34, fontFamily: serif, fontWeight: 700, color: colors.primary, margin: 0 }}>8–10%</p>
              <p style={{ fontSize: 12.5, color: colors.textMuted, margin: "6px 0 0" }}>of gross booking revenue</p>
              <p style={{ fontSize: 11.5, fontWeight: 600, color: colors.secondaryText, margin: "10px 0 0" }}>Charged on an ongoing basis, per booking</p>
            </div>

            <div style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 20, padding: "24px 28px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.textLight, margin: "0 0 4px" }}>One-Time Setup Fee — By Unit Size</p>
              <p style={{ fontSize: 11.5, fontWeight: 600, color: colors.secondaryText, margin: "0 0 16px" }}>Charged once, at signup — separate from and in addition to the 8–10%</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {SETUP_FEES.map(({ unit, fee }) => (
                  <div key={unit} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: colors.bgMain, borderRadius: 10, border: `1px solid ${colors.border}` }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: colors.textMain }}>{unit}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: colors.secondaryText, fontFamily: serif }}>AED {fee.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── COMPLIANCE NOTE ── */}
        <section style={{ padding: "0 24px 72px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 14, alignItems: "flex-start", padding: "20px 22px", background: colors.bgSage, borderRadius: 16, border: `1px solid ${colors.borderSage}` }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: colors.primary, lineHeight: 1.5, margin: "0 0 8px" }}>
                This is a referral, not an AssetIntel-operated service.
              </p>
              <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.7, margin: 0 }}>
                Managing another owner&apos;s property for a fee in Dubai requires a licensed DET Holiday Home Operator — an informal co-host arrangement is not sufficient. AssetIntel refers you to a partner that holds this license; you remain the DET property-permit holder for your own unit, and the co-hosting agreement is between you and the partner, not AssetIntel. Verify licensing and contract terms directly with the partner before committing.
              </p>
            </div>
          </div>
        </section>

        {/* ── VETTING CRITERIA — earns the word "vetted" before the contact ask ── */}
        <section style={{ padding: "0 24px 72px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <EyebrowLabel>OUR STANDARD</EyebrowLabel>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontFamily: serif, fontWeight: 700, color: colors.primary, margin: "0 0 10px" }}>What &ldquo;Vetted&rdquo; Actually Means</h2>
              <p style={{ fontSize: 14, color: colors.textMuted, maxWidth: 600, margin: "0 auto", lineHeight: 1.65 }}>
                AssetIntel earns nothing extra by steering you to any particular partner, so the bar is the only thing we&apos;re protecting. Every co-host we introduce must meet all four:
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="ch-vetting-grid">
              {VETTING.map(v => (
                <div key={v.title} style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 18, padding: "20px 20px" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: colors.textMain, margin: "0 0 7px" }}>{v.title}</p>
                  <p style={{ fontSize: 12.5, color: colors.textMuted, lineHeight: 1.6, margin: 0 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LEAD FORM ── */}
        <section id="request" style={{ padding: pad, background: colors.bgSection, borderTop: `1px solid ${colors.border}` }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <EyebrowLabel>GET STARTED</EyebrowLabel>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontFamily: serif, fontWeight: 700, color: colors.primary, margin: "0 0 10px" }}>Request A Co-Host Introduction</h2>
              <p style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.65 }}>Tell us about your property and we&apos;ll introduce you to our partner co-host.</p>
            </div>

            {!submitted ? (
              <div style={{ background: colors.bgMain, border: `1px solid ${colors.border}`, borderRadius: 20, padding: "28px 30px" }}>
                {[
                  { key: "name" as const, label: "Full Name", ph: "Your full name" },
                  { key: "email" as const, label: "Email", ph: "your@email.com" },
                  { key: "phone" as const, label: "Phone / WhatsApp (optional)", ph: "+971 50 000 0000" },
                  { key: "property" as const, label: "Building / Community (optional)", ph: "e.g. Marina Gate" },
                  { key: "unitSize" as const, label: "Unit Size (optional)", ph: "e.g. 2BR" },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: colors.textLight, display: "block", marginBottom: 6 }}>{f.label}</label>
                    <input
                      value={form[f.key]}
                      onChange={e => set(f.key, e.target.value)}
                      placeholder={f.ph}
                      style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${colors.border}`, borderRadius: 12, fontSize: 14, background: colors.bgSection, color: colors.textMain, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                ))}
                {error && <p style={{ fontSize: 12.5, color: colors.error, marginBottom: 12 }}>{!form.name.trim() || !form.email.trim() ? "Enter your name and email." : "Couldn't send your request — please check your connection and try again."}</p>}
                <button
                  onClick={submit}
                  disabled={submitting}
                  style={{ width: "100%", padding: 14, background: submitting ? colors.textLight : colors.primary, color: "#fff", border: "none", borderRadius: 12, fontSize: 14.5, fontWeight: 700, cursor: submitting ? "default" : "pointer", boxShadow: submitting ? "none" : "0 4px 16px rgba(27,94,74,0.28)" }}
                >
                  {submitting ? "Submitting…" : "Request Introduction →"}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: colors.bgSage, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h3 style={{ fontSize: 18, fontFamily: serif, fontWeight: 700, color: colors.primary, marginBottom: 8 }}>Request received</h3>
                <p style={{ fontSize: 13.5, color: colors.textMuted, lineHeight: 1.7 }}>AssetIntel will introduce you to our partner co-host directly — they&apos;ll follow up to confirm terms and next steps.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{ padding: pad }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ background: `linear-gradient(145deg, ${colors.primary} 0%, #0F3E33 100%)`, borderRadius: 22, padding: "48px 40px", textAlign: "center", boxShadow: "0 12px 40px rgba(27,94,74,0.24)" }}>
              <h2 style={{ fontSize: "clamp(22px, 3.5vw, 30px)", fontFamily: serif, fontWeight: 700, color: "#fff", margin: "0 0 12px" }}>Not Sure Which Option Fits?</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.78)", maxWidth: 480, margin: "0 auto 24px", lineHeight: 1.7 }}>
                Run your numbers first — the Sub-Leasing Risk Estimator and Self-Manage guide can help you decide before you commit to a co-host or full operator.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => router.push("/self-manage")} style={{ padding: "13px 26px", background: colors.secondary, color: "#fff", borderRadius: 12, fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}>
                  Explore Self-Manage
                </button>
                <a href="#request" style={{ padding: "13px 26px", background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                  Request Introduction
                </a>
              </div>
            </div>
          </div>
        </section>

        <ConsultationBanner />

        <footer style={{ background: colors.primary, padding: "28px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ filter: "brightness(0) invert(1)", opacity: 0.9 }}><AssetIntelLogo size={22} /></div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>© {new Date().getFullYear()} AssetIntel. All rights reserved. · assetintel.ae</p>
          </div>
        </footer>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .ch-vetting-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 760px) {
          .ch-ladder-grid { grid-template-columns: 1fr !important; }
          .ch-scope-grid { grid-template-columns: 1fr !important; }
          .ch-calc-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
