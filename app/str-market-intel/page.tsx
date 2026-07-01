"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import AssetIntelLogo from "@/components/AssetIntelLogo";

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────

const C = {
  green:       "#1B5E4A",
  greenDark:   "#133D30",
  greenLight:  "#2D7A5E",
  gold:        "#B88A44",
  ivory:       "#FDFBF7",
  bg:          "#F8F4EE",
  bgSage:      "#F2EFE9",
  border:      "#E6E1D8",
  borderLight: "#F0EDE8",
  text:        "#1B2A1F",
  muted:       "#6B6B6B",
  subtle:      "#999",
};

const gradStyle: React.CSSProperties = {
  background: `linear-gradient(90deg, ${C.green} 0%, ${C.gold} 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  display: "inline-block",
};

// ── DATA ──────────────────────────────────────────────────────────────────────

const strAreaOpportunityRanking = [
  {
    rank: 1,
    area: "Emaar Beachfront",
    score: 89,
    opportunityView: "Premium Selective",
    bestUnitType: "1BR / 2BR",
    confidence: "Medium",
    ownerNote: "Beachfront positioning, newer stock, and lifestyle appeal can support premium STR pricing. Performance should be checked carefully against low-season demand, furnishing cost, and view quality.",
  },
  {
    rank: 2,
    area: "Business Bay",
    score: 84,
    opportunityView: "Strong / Practical",
    bestUnitType: "Studio / 1BR",
    confidence: "Medium-High",
    ownerNote: "Strong business and tourist guest mix, broad apartment stock, and central positioning make Business Bay a practical STR market when building quality and pricing are aligned.",
  },
  {
    rank: 3,
    area: "Dubai Marina / JBR",
    score: 83,
    opportunityView: "Strong but Competitive",
    bestUnitType: "Studio / 1BR",
    confidence: "Medium",
    ownerNote: "Tourist demand, waterfront appeal, and operator coverage remain strong, but competition is high. View, furnishing, and photography can materially affect results.",
  },
  {
    rank: 4,
    area: "Downtown Dubai",
    score: 82,
    opportunityView: "Premium ADR Potential",
    bestUnitType: "1BR / 2BR",
    confidence: "Medium",
    ownerNote: "Burj Khalifa proximity, walkability, and premium tourist demand can support ADR, especially for well-furnished units with strong views.",
  },
  {
    rank: 5,
    area: "Palm Jumeirah",
    score: 78,
    opportunityView: "Luxury Selective",
    bestUnitType: "1BR / 2BR",
    confidence: "Medium",
    ownerNote: "High ADR potential, but guest expectations, setup cost, and low-season pricing risk are higher. Best suited for premium units with strong positioning.",
  },
  {
    rank: 6,
    area: "Dubai Hills",
    score: 70,
    opportunityView: "Emerging / Selective",
    bestUnitType: "1BR / 2BR",
    confidence: "Low-Medium",
    ownerNote: "Lifestyle and family appeal are improving, but STR performance should be reviewed building-by-building due to less tourist-driven demand than coastal or Downtown areas.",
  },
];

const strBuildingWatchlist = [
  {
    building: "Marina Gate",
    area: "Dubai Marina",
    assetIntelView: "Premium Marina Candidate",
    bestFit: "1BR / 2BR",
    confidence: "Medium",
    ownerInsight: "Premium tower appeal, Marina location, and high-floor/view upside can support STR demand. Furnishing quality remains critical.",
  },
  {
    building: "Address JBR",
    area: "JBR",
    assetIntelView: "Hotel-Style Premium",
    bestFit: "1BR / 2BR",
    confidence: "Medium",
    ownerInsight: "Beach access and hotel-style positioning can support premium guest expectations, but setup standards must be high.",
  },
  {
    building: "Burj Vista",
    area: "Downtown Dubai",
    assetIntelView: "View-Driven Premium",
    bestFit: "1BR / 2BR",
    confidence: "Medium",
    ownerInsight: "Burj Khalifa proximity and view potential can influence ADR. Strong furnishing and photography are important.",
  },
  {
    building: "Act One Act Two",
    area: "Downtown Dubai",
    assetIntelView: "Modern Downtown STR Candidate",
    bestFit: "1BR",
    confidence: "Medium",
    ownerInsight: "Modern building quality and Downtown location create strong guest appeal when pricing and presentation are aligned.",
  },
  {
    building: "Marina Vista",
    area: "Emaar Beachfront",
    assetIntelView: "Beachfront Lifestyle Candidate",
    bestFit: "1BR / 2BR",
    confidence: "Low-Medium",
    ownerInsight: "Beachfront positioning and lifestyle appeal are strong, but low-season pricing and guest expectations should be checked.",
  },
  {
    building: "Beach Vista",
    area: "Emaar Beachfront",
    assetIntelView: "Premium Beachfront Watchlist",
    bestFit: "1BR / 2BR",
    confidence: "Low-Medium",
    ownerInsight: "Best suited to units with view, strong furnishing, and premium presentation. Verify operating assumptions carefully.",
  },
  {
    building: "Forte",
    area: "Downtown Dubai",
    assetIntelView: "Downtown Tourist Access",
    bestFit: "1BR / 2BR",
    confidence: "Medium",
    ownerInsight: "Good Downtown positioning with tourist appeal. Furnishing and pricing strategy determine whether STR can outperform LTR.",
  },
  {
    building: "Select Business Bay Towers",
    area: "Business Bay",
    assetIntelView: "Practical STR Stock",
    bestFit: "Studio / 1BR",
    confidence: "Low-Medium",
    ownerInsight: "Can work when rent/value basis is right, but competition, building quality, and furnishing standards matter.",
  },
];

const marketSignals = [
  {
    title: "Tourism & Event Demand",
    text: "Dubai's tourism calendar, exhibitions, conferences, and winter travel season can materially affect STR demand across the city.",
  },
  {
    title: "Supply & Competition",
    text: "More holiday home listings in the same area can pressure occupancy and ADR, especially in low season.",
  },
  {
    title: "Furnishing & Photography",
    text: "Guest conversion is strongly influenced by presentation. Weak interiors can reduce STR upside even in strong areas.",
  },
  {
    title: "View, Floor & Layout",
    text: "View quality, higher floors, balcony usability, and practical layouts can create meaningful ADR differences between similar units.",
  },
  {
    title: "Operator Execution",
    text: "Pricing, response speed, review management, housekeeping, and owner reporting can all affect net performance.",
  },
  {
    title: "Low-Season Break-Even",
    text: "Owners should check whether the unit can still cover costs during softer summer months before committing to STR.",
  },
];

const strScoreMethodology = [
  { label: "Area Guest Demand",     weight: 20 },
  { label: "Building Guest Appeal", weight: 15 },
  { label: "ADR Potential",         weight: 15 },
  { label: "Occupancy Potential",   weight: 15 },
  { label: "Unit Type Suitability", weight: 10 },
  { label: "View & Floor Premium",  weight: 10 },
  { label: "Furnishing Impact",     weight:  5 },
  { label: "Operator Availability", weight:  5 },
  { label: "Low Season Risk",       weight:  5 },
];

const unitTypeInsights = [
  {
    type: "Studio",
    status: "Efficient STR Entry Point",
    insight: "Lower setup cost and easier occupancy in prime areas, but ADR upside depends heavily on building, design, and location.",
    highlight: false,
  },
  {
    type: "1BR",
    status: "Strongest All-Rounder",
    insight: "Often the best balance between ADR, occupancy, guest demand, furnishing cost, and owner risk.",
    highlight: true,
  },
  {
    type: "2BR",
    status: "Premium Upside",
    insight: "Can perform well in tourist-heavy or premium buildings, but setup cost and low-season exposure are higher.",
    highlight: false,
  },
  {
    type: "3BR+",
    status: "Highly Selective",
    insight: "Best suited to luxury, family, beachfront, villa-style, or group-stay demand. Requires strong furnishing and pricing strategy.",
    highlight: false,
  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 85) return C.green;
  if (score >= 75) return C.greenLight;
  if (score >= 65) return C.gold;
  return "#C0392B";
}
function scoreBg(score: number) {
  if (score >= 85) return "rgba(27,94,74,0.10)";
  if (score >= 75) return "rgba(45,122,94,0.10)";
  if (score >= 65) return "rgba(184,138,68,0.10)";
  return "rgba(192,57,43,0.08)";
}
function scoreLabel(score: number) {
  if (score >= 85) return "Premium";
  if (score >= 75) return "Strong";
  if (score >= 65) return "Selective";
  return "High Caution";
}

function confidenceColor(c: string) {
  if (c === "High") return C.green;
  if (c === "Medium-High") return C.greenLight;
  if (c === "Medium") return C.gold;
  return C.muted;
}
function confidenceBg(c: string) {
  if (c === "High") return "rgba(27,94,74,0.08)";
  if (c === "Medium-High") return "rgba(45,122,94,0.08)";
  if (c === "Medium") return "rgba(184,138,68,0.08)";
  return "rgba(150,150,150,0.08)";
}

function ScorePill({ score }: { score: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: scoreBg(score), borderRadius: 999, padding: "3px 10px" }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: scoreColor(score) }}>{score}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: scoreColor(score) }}>{scoreLabel(score)}</span>
    </span>
  );
}

function ConfidencePill({ label }: { label: string }) {
  return (
    <span style={{ display: "inline-block", background: confidenceBg(label), color: confidenceColor(label), fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999, letterSpacing: "0.04em" }}>
      {label}
    </span>
  );
}

function SectionHeading({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 36 }}>
      {eyebrow && (
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold, marginBottom: 10 }}>
          {eyebrow}
        </p>
      )}
      <h2 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: "0 0 10px", fontFamily: "'Georgia', serif" }}>
        <span style={gradStyle}>{title}</span>
      </h2>
      {sub && <p style={{ fontSize: 15, color: C.muted, maxWidth: 640, lineHeight: 1.65 }}>{sub}</p>}
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function STRMarketIntelPage() {
  const router = useRouter();

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <SiteNav active="str-market-intel" />

      {/* ── HERO (unified, full-width) ─────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: 520 }}>
        {/* Full-bleed background image */}
        <img
          src="/Locations/Marina.png"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 40%",
            display: "block",
          }}
        />

        {/* Dark overlay: base dim + left-heavy gradient for text readability */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(105deg, rgba(10,22,16,0.78) 0%, rgba(10,22,16,0.60) 45%, rgba(10,22,16,0.30) 100%)",
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1152, margin: "0 auto", padding: "72px 24px 0", display: "flex", flexDirection: "column", minHeight: 520 }}>

          {/* ── Main copy ── */}
          <div style={{ maxWidth: 600, flex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.gold, marginBottom: 18 }}>
              Dubai STR Market Intelligence
            </p>
            <h1 style={{ fontSize: "clamp(36px, 5vw, 58px)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 20px", fontFamily: "'Georgia', serif" }}>
              <span style={{
                background: `linear-gradient(90deg, #E8D5A3 0%, #B88A44 100%)`,
                WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", display: "inline-block",
              }}>Dubai STR</span>
              <br />
              <span style={{ color: "#F5F0E8" }}>Market Intel</span>
            </h1>
            <p style={{ fontSize: 16, color: "rgba(245,240,232,0.78)", lineHeight: 1.75, margin: 0, maxWidth: 500 }}>
              Track the areas, buildings, and unit types showing the strongest short-term rental potential — backed by AssetIntel scoring, public market signals, and owner-focused STR insight.
            </p>
          </div>

          {/* ── Research note panel — bottom of hero ── */}
          <div style={{ marginTop: 52, marginBottom: 0 }}>
            <div style={{
              display: "inline-flex", flexWrap: "wrap", gap: 0,
              background: "rgba(10,22,16,0.55)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderBottom: "none",
              borderRadius: "16px 16px 0 0",
              overflow: "hidden",
              maxWidth: "100%",
            }}>
              {/* Left cell: Last Updated */}
              <div style={{ padding: "16px 22px", borderRight: "1px solid rgba(255,255,255,0.09)" }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, marginBottom: 4 }}>Last Updated</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(245,240,232,0.90)" }}>June 2026</p>
              </div>

              {/* Middle cell: Research Scope */}
              <div style={{ padding: "16px 22px", borderRight: "1px solid rgba(255,255,255,0.09)", maxWidth: 420 }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, marginBottom: 4 }}>Research Scope</p>
                <p style={{ fontSize: 12, color: "rgba(245,240,232,0.72)", lineHeight: 1.5 }}>Dubai short-term rental market signals, tourism demand, public STR data, and AssetIntel owner-side scoring.</p>
              </div>

              {/* Right cell: Disclaimer */}
              <div style={{ padding: "16px 22px" }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(184,138,68,0.70)", marginBottom: 4 }}>Data Note</p>
                <p style={{ fontSize: 11, color: "rgba(245,240,232,0.50)", lineHeight: 1.55, maxWidth: 280 }}>Public STR datasets vary by provider, platform coverage, sample size, and reporting period. AssetIntel uses directional signals, not guaranteed projections.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 1: MARKET PULSE ───────────────────────────────────────── */}
      <section style={{ background: C.ivory, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "64px 24px" }}>
          <SectionHeading
            eyebrow="Market Overview"
            title="Dubai STR Market Pulse"
            sub="A focused view of the short-term rental signals owners and investors should watch before choosing a strategy."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
            {[
              { label: "Tourism Demand",    value: "Record High",      helper: "Dubai continues to benefit from strong international visitor demand, supporting the wider hospitality and STR market.", accent: C.green },
              { label: "Market View",       value: "Selective Growth",  helper: "STR can still outperform LTR in the right areas, but building quality, furnishing, pricing, and operator execution matter more than ever.", accent: C.green },
              { label: "Best Unit Profile", value: "Studio / 1BR",     helper: "Smaller units often carry lower setup risk and broader guest demand, especially in prime tourist and business locations.", accent: C.green },
              { label: "Key Revenue Driver",value: "Furnishing Quality",helper: "Well-styled units with strong photography can materially improve guest conversion and ADR potential.", accent: C.gold },
              { label: "Peak Season Signal",value: "Nov – Mar",        helper: "Winter months generally carry stronger guest demand across Dubai's STR and hospitality market.", accent: C.gold },
              { label: "Low Season Risk",   value: "May – Aug",        helper: "Summer months can soften occupancy and pricing, so owners should review low-season break-even carefully.", accent: C.muted },
            ].map(card => (
              <div key={card.label} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>{card.label}</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: card.accent, margin: "0 0 10px" }}>{card.value}</p>
                <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.55 }}>{card.helper}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: AREA OPPORTUNITY RANKING ───────────────────────────── */}
      <div id="str-rankings" />
      <section style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "64px 24px" }}>
          <SectionHeading
            eyebrow="Area Rankings"
            title="STR Area Opportunity Ranking"
            sub="Ranked using AssetIntel's directional STR opportunity model across guest demand, ADR potential, occupancy strength, seasonality, owner upside, and execution risk."
          />

          {/* Score legend */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
            {[
              { label: "85+ Premium Opportunity", color: C.green,      bg: "rgba(27,94,74,0.10)" },
              { label: "75–84 Strong",            color: C.greenLight, bg: "rgba(45,122,94,0.10)" },
              { label: "65–74 Selective",         color: C.gold,       bg: "rgba(184,138,68,0.10)" },
              { label: "Below 65 High Caution",   color: "#C0392B",    bg: "rgba(192,57,43,0.08)" },
            ].map(s => (
              <span key={s.label} style={{ fontSize: 11, fontWeight: 600, color: s.color, background: s.bg, padding: "3px 11px", borderRadius: 999 }}>{s.label}</span>
            ))}
          </div>

          {/* Rankings — desktop table */}
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 18, overflow: "hidden", background: C.ivory }} className="rankings-table">
            <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 100px 160px 110px 110px", padding: "11px 20px", background: C.bgSage, borderBottom: `1px solid ${C.border}` }} className="ranking-header">
              {["#", "Area", "Score", "Opportunity View", "Best Unit", "Confidence"].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>
              ))}
            </div>
            {strAreaOpportunityRanking.map((row, i) => (
              <div key={row.area} className="ranking-row" style={{
                display: "grid", gridTemplateColumns: "36px 1fr 100px 160px 110px 110px",
                padding: "16px 20px", alignItems: "start",
                borderBottom: i < strAreaOpportunityRanking.length - 1 ? `1px solid ${C.borderLight}` : "none",
                background: i % 2 === 0 ? C.ivory : "#FAFAF6",
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.muted, paddingTop: 2 }}>{row.rank}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{row.area}</p>
                  <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.55 }}>{row.ownerNote}</p>
                </div>
                <div style={{ paddingTop: 2 }}><ScorePill score={row.score} /></div>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.text, paddingTop: 4 }}>{row.opportunityView}</span>
                <span style={{ fontSize: 12, color: C.text, fontWeight: 600, paddingTop: 4 }}>{row.bestUnitType}</span>
                <div style={{ paddingTop: 2 }}><ConfidencePill label={row.confidence} /></div>
              </div>
            ))}
          </div>

          {/* Mobile stacked cards */}
          <div className="rankings-cards" style={{ display: "none", flexDirection: "column", gap: 12 }}>
            {strAreaOpportunityRanking.map(row => (
              <div key={row.area} style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 2 }}>{row.rank}. {row.area}</p>
                    <p style={{ fontSize: 12, color: C.gold, fontWeight: 600 }}>{row.opportunityView}</p>
                  </div>
                  <ScorePill score={row.score} />
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: C.muted }}>Best unit: <strong style={{ color: C.text }}>{row.bestUnitType}</strong></span>
                  <ConfidencePill label={row.confidence} />
                </div>
                <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{row.ownerNote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: BUILDING WATCHLIST ─────────────────────────────────── */}
      <section style={{ background: C.bgSage, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "64px 24px" }}>
          <SectionHeading
            eyebrow="Building Watchlist"
            title="STR Building Watchlist"
            sub="Buildings worth monitoring for STR potential based on location strength, guest appeal, furnishing upside, operator activity, and owner-side setup considerations."
          />
          <p style={{ fontSize: 12, color: C.subtle, marginBottom: 28, lineHeight: 1.6 }}>
            Building-level performance should always be verified through a property analysis before investment, onboarding, or furnishing decisions.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
            {strBuildingWatchlist.map(b => (
              <div key={b.building} style={{
                background: C.ivory, border: `1px solid ${C.border}`,
                borderRadius: 16, padding: "20px 20px 18px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                display: "flex", flexDirection: "column",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 2 }}>{b.building}</p>
                    <p style={{ fontSize: 11, color: C.gold, fontWeight: 600 }}>{b.area}</p>
                  </div>
                  <ConfidencePill label={b.confidence} />
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{b.assetIntelView}</p>
                <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, flex: 1, marginBottom: 14 }}>{b.ownerInsight}</p>
                <div style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 12, borderTop: `1px solid ${C.borderLight}` }}>
                  <span style={{ fontSize: 11, color: C.muted }}>Best fit:</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.green }}>{b.bestFit}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20 }}>
            <button
              onClick={() => router.push("/estimator")}
              style={{
                padding: "11px 22px", borderRadius: 11,
                background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`,
                color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
                boxShadow: "0 4px 14px rgba(27,94,74,0.22)",
              }}
            >
              Analyse a Specific Property
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: MARKET SIGNALS ─────────────────────────────────────── */}
      <section style={{ background: C.ivory, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "64px 24px" }}>
          <SectionHeading
            eyebrow="Signals To Watch"
            title="Market Signals To Watch"
            sub="STR performance is not only about location. Owners should review the signals that directly affect income, risk, and guest conversion."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            {marketSignals.map(s => (
              <div key={s.title} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(27,94,74,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: C.green, opacity: 0.7 }} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>{s.title}</p>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: SCORING METHODOLOGY ───────────────────────────────── */}
      <section style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "64px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }} className="methodology-grid">
            <div>
              <SectionHeading
                eyebrow="Scoring Methodology"
                title="How AssetIntel Scores STR Potential"
                sub="Our STR score combines market demand with practical owner-side factors that affect real net income."
              />
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 16 }}>
                AssetIntel does not rank properties only by headline revenue. We consider whether a unit can realistically perform after management fees, running costs, furnishing quality, seasonality, and operator execution.
              </p>
              <p style={{ fontSize: 13, color: C.subtle, lineHeight: 1.7 }}>
                Scores are directional and should be validated at unit level using building, unit size, floor, view, furnishing status, and cost assumptions.
              </p>
            </div>
            <div style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              {strScoreMethodology.map((item, i) => (
                <div key={item.label} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "13px 20px",
                  borderBottom: i < strScoreMethodology.length - 1 ? `1px solid ${C.borderLight}` : "none",
                }}>
                  <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{item.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 80, height: 4, background: C.bgSage, borderRadius: 99 }}>
                      <div style={{ width: `${(item.weight / 20) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.green} 0%, ${C.greenLight} 100%)`, borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.green, minWidth: 30, textAlign: "right" }}>{item.weight}%</span>
                  </div>
                </div>
              ))}
              <div style={{ padding: "11px 20px", background: C.bgSage, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Total</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.green }}>100%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: UNIT TYPE INSIGHTS ─────────────────────────────────── */}
      <section style={{ background: C.bgSage, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "64px 24px" }}>
          <SectionHeading
            eyebrow="Unit Type Performance"
            title="Unit Type Insights"
            sub="STR performance depends heavily on unit size, setup cost, guest demand, and how well the layout photographs."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {unitTypeInsights.map(u => (
              <div key={u.type} style={{
                background: u.highlight ? `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)` : C.ivory,
                border: u.highlight ? "none" : `1px solid ${C.border}`,
                borderRadius: 18, padding: "24px 20px",
                boxShadow: u.highlight ? "0 8px 28px rgba(27,94,74,0.25)" : "0 2px 8px rgba(0,0,0,0.04)",
              }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: u.highlight ? "#fff" : C.green, margin: "0 0 6px" }}>{u.type}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: u.highlight ? "rgba(255,255,255,0.75)" : C.gold, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{u.status}</p>
                <p style={{ fontSize: 13, color: u.highlight ? "rgba(255,255,255,0.72)" : C.muted, lineHeight: 1.6 }}>{u.insight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: RESEARCH SOURCES ───────────────────────────────────── */}
      <section style={{ background: C.ivory, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "64px 24px" }}>
          <SectionHeading
            eyebrow="Sources & Methodology"
            title="Research Sources & Methodology"
            sub="AssetIntel combines public market data, STR demand signals, and owner-side execution factors to create directional STR intelligence."
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }} className="sources-grid">
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: "24px 24px" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 16 }}>Sources Considered</p>
              {[
                "Dubai Department of Economy and Tourism performance data",
                "Public STR market datasets including AirDNA, AirROI, Airbtics, and similar providers",
                "Public holiday home and hospitality market reports",
                "Operator and owner-side market observations",
                "AssetIntel STR scoring assumptions",
                "Future: DLD API data once available",
              ].map((src, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, marginTop: 6, flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55 }}>{src}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: C.bgSage, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 20px" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>Why Data Varies</p>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
                  Public STR datasets can differ because each provider tracks different platforms, listing samples, filters, locations, and reporting periods. AssetIntel therefore uses ranges, confidence labels, and directional scoring instead of presenting unsupported exact income guarantees.
                </p>
              </div>
              <div style={{ background: C.bgSage, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 20px" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>Future Enhancement</p>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
                  Once official data and API integrations are available, AssetIntel rankings can be enhanced with deeper transaction, rental, and verified market evidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: OWNER NEXT STEPS ───────────────────────────────────── */}
      <section style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "64px 24px" }}>
          <SectionHeading
            eyebrow="Owner Next Steps"
            title="Owner Next Steps"
            sub="Use the STR market research as a starting point, then validate your exact unit before making a decision."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {[
              {
                num: "01",
                title: "Analyse Your Unit",
                text: "Check building, floor, view, unit size, furnishing status, expected STR numbers, and LTR comparison.",
                cta: "Run Rental Analyzer",
                href: "/estimator",
                primary: true,
              },
              {
                num: "02",
                title: "Review Furnishing Readiness",
                text: "STR performance depends heavily on presentation, photography, guest essentials, and setup quality.",
                cta: "View Furnishing Packages",
                href: "/furnishing",
                primary: false,
              },
              {
                num: "03",
                title: "Compare Operator Fit",
                text: "A strong operator can improve pricing execution, guest reviews, occupancy, reporting, and net owner outcome.",
                cta: "Start With Property Analysis",
                href: "/estimator",
                primary: false,
              },
            ].map(card => (
              <div key={card.num} style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 18, padding: "24px 20px 20px", display: "flex", flexDirection: "column", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                <span style={{ fontSize: 30, fontWeight: 900, color: C.borderLight, lineHeight: 1, marginBottom: 12 }}>{card.num}</span>
                <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0 0 10px" }}>{card.title}</p>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, flex: 1, marginBottom: 18 }}>{card.text}</p>
                <button
                  onClick={() => router.push(card.href)}
                  style={{
                    width: "100%", padding: "11px", borderRadius: 11,
                    background: card.primary ? `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)` : "transparent",
                    color: card.primary ? "#fff" : C.green,
                    border: card.primary ? "none" : `1.5px solid rgba(27,94,74,0.3)`,
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    boxShadow: card.primary ? "0 4px 14px rgba(27,94,74,0.22)" : "none",
                  }}
                >
                  {card.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 9: DISCLAIMER ─────────────────────────────────────────── */}
      <section style={{ background: C.bgSage }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 28px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>Important Research Note</p>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8, marginBottom: 12 }}>
              AssetIntel STR Market Intel combines public tourism data, public STR datasets, operator market signals, and AssetIntel's own owner-side scoring model. Public STR datasets can vary because each provider tracks different platforms, listings, filters, samples, and time periods. Rankings are directional and should be used as market research, not guaranteed income projections.
            </p>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8, marginBottom: 12 }}>
              Final STR suitability should be verified at property level using building, unit size, floor, view, furnishing condition, cost base, management fee, seasonality, and operator assumptions.
            </p>
            <p style={{ fontSize: 12, color: C.subtle, lineHeight: 1.7 }}>
              AssetIntel does not guarantee rental income or final STR performance.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer style={{ background: C.green, padding: "28px 24px" }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ filter: "brightness(0) invert(1)", opacity: 0.9 }}>
            <AssetIntelLogo size={22} />
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>
            © {new Date().getFullYear()} AssetIntel. All rights reserved. · assetintel.ae
          </p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .rankings-table { display: none !important; }
          .rankings-cards { display: flex !important; }
          .methodology-grid { grid-template-columns: 1fr !important; gap: 28px; }
          .sources-grid { grid-template-columns: 1fr !important; gap: 16px; }
        }
      `}</style>
    </div>
  );
}
