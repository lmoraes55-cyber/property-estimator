"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { rankAgents, RealEstateAgent, BOUTIQUE_AGENTS } from "@/lib/agents";
import { BUILDING_DIRECTORY, getLTRMarketRent, fmt } from "@/lib/estimator";
import type { UnitSize, UnitType } from "@/lib/estimator";
import { colors } from "@/lib/colors";
import GroundWorksLogo from "@/components/GroundWorksLogo";

type RankedAgent = RealEstateAgent & { matchScore: number; matchReasons: string[] };

// Derive GW Landlord & Leasing scores from existing fields (display only — no logic change)
function agentScores(a: RealEstateAgent) {
  const landlord = Math.max(60, Math.min(99, Math.round((a.googleRating / 5) * 100 * 0.7 + (a.propertyFinderRating / 5) * 100 * 0.3)));
  const leasing = Math.max(60, Math.min(99, Math.round(98 - Math.max(0, a.avgDaysToLet - 12) * 1.4 + Math.min(a.transactionsLastYear / 400, 6))));
  return { landlord, leasing };
}

const initialsOf = (name: string) => name.split(" ").filter(w => w[0] && /[A-Za-z0-9]/.test(w[0])).map(w => w[0]).join("").slice(0, 2).toUpperCase();

// No agent profiles/contact records are stored — open a search for the real agency.
const contactAgent = (name: string) =>
  window.open(`https://www.google.com/search?q=${encodeURIComponent(name + " Dubai real estate contact")}`, "_blank", "noopener,noreferrer");

function AgentsContent() {
  const params = useSearchParams();
  const router = useRouter();

  const buildingName = params.get("buildingName") ?? "";
  const unitSize = (params.get("unitSize") ?? "2BR") as UnitSize;
  const unitType = (params.get("unitType") ?? "Apartment") as UnitType;
  const propertyName = params.get("propertyName") ?? "";
  const floor = params.get("floor") ?? "1";
  const view = params.get("view") ?? "Standard View";
  const furnished = params.get("furnished") ?? "Furnished";
  const mgmtRaw = params.get("managementFee");
  const mgmtPct = mgmtRaw ? (Number(mgmtRaw) > 1 ? Math.round(Number(mgmtRaw)) : Math.round(Number(mgmtRaw) * 100)) : null;

  const buildingInfo = BUILDING_DIRECTORY[buildingName];
  const community = buildingInfo?.community ?? buildingName;
  const ltr = getLTRMarketRent(buildingName, unitSize);

  const ranked = rankAgents(community, unitType) as RankedAgent[];

  const handleBack = () => {
    const reportParams = new URLSearchParams();
    reportParams.set("propertyName", params.get("propertyName") ?? "");
    reportParams.set("buildingName", params.get("buildingName") ?? "");
    reportParams.set("unitSize", params.get("unitSize") ?? "2BR");
    reportParams.set("unitType", params.get("unitType") ?? "Apartment");
    reportParams.set("floor", params.get("floor") ?? "1");
    reportParams.set("view", params.get("view") ?? "Standard View");
    reportParams.set("furnished", params.get("furnished") ?? "Furnished");
    reportParams.set("managementFee", params.get("managementFee") ?? "0.2");
    if (params.get("propertyValue")) reportParams.set("propertyValue", params.get("propertyValue") ?? "");
    reportParams.set("ltrRecommended", "true");
    router.replace(`/report?${reportParams.toString()}`);
  };

  const main = ranked.slice(0, 2);
  const others = ranked.slice(2, 5);
  const boutique = BOUTIQUE_AGENTS.slice(0, 3);

  const ltrRangeStr = (ltr.rangeLow != null && ltr.rangeHigh != null)
    ? `AED ${fmt(ltr.rangeLow)} – ${fmt(ltr.rangeHigh)}`
    : `AED ${fmt(ltr.rent)}`;

  const sectionTitle: React.CSSProperties = {
    fontSize: "30px", fontWeight: 700, fontFamily: "'Georgia', serif",
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
  };

  return (
    <div className="min-h-screen" style={{ background: colors.bgMain }}>

      {/* Slim header */}
      <header className="sticky top-0 z-50" style={{ background: colors.bgSection, borderBottom: `1px solid ${colors.border}` }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-5">
          <button onClick={handleBack}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition hover:opacity-80"
            style={{ background: colors.bgMain, border: `1px solid ${colors.border}`, color: colors.primary }}>
            ← Back to Report
          </button>
          <div className="flex items-center gap-2" style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
            <GroundWorksLogo size={32} />
            <span className="text-base font-bold" style={{ color: colors.textMain }}>Ground<span style={{ color: colors.primary }}>Works</span></span>
          </div>
          <span className="ml-auto text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: `${colors.primary}14`, color: colors.primary, border: `1px solid ${colors.primary}33` }}>
            Long-Term Rental
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-12">

        {/* 1. PROPERTY SUMMARY BAR */}
        <div className="rounded-3xl px-7 py-6" style={{
          background: `linear-gradient(135deg, #FFFFFF 0%, ${colors.bgSection} 100%)`,
          border: `1px solid ${colors.border}`, boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 14px 36px rgba(0,0,0,0.05)",
        }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:pr-6" style={{ borderRight: `1px solid ${colors.border}` }}>
              <p className="text-xs font-semibold mb-2" style={{ color: colors.secondary, letterSpacing: "0.1em" }}>PROPERTY</p>
              <p className="text-lg font-bold" style={{ color: colors.textMain, fontFamily: "'Georgia', serif" }}>{community || propertyName || "Your Property"}</p>
              <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{unitSize} • Floor {floor} • {view}</p>
            </div>
            <div className="lg:px-6" style={{ borderRight: `1px solid ${colors.border}` }}>
              <p className="text-xs font-semibold mb-2" style={{ color: colors.secondary, letterSpacing: "0.1em" }}>RENTAL STRATEGY</p>
              <p className="text-lg font-bold" style={{ color: colors.primary, fontFamily: "'Georgia', serif" }}>Long-Term Rental</p>
              <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Recommended for this property</p>
            </div>
            <div className="lg:px-6" style={{ borderRight: `1px solid ${colors.border}` }}>
              <p className="text-xs font-semibold mb-2" style={{ color: colors.secondary, letterSpacing: "0.1em" }}>ESTIMATED LTR RANGE</p>
              <p className="text-lg font-bold" style={{ color: colors.primary, fontFamily: "'Georgia', serif" }}>{ltrRangeStr}</p>
              <p className="text-xs mt-1" style={{ color: colors.textMuted }}>per year</p>
            </div>
            <div className="lg:pl-6">
              <p className="text-xs font-semibold mb-2" style={{ color: colors.secondary, letterSpacing: "0.1em" }}>PROPERTY DETAILS</p>
              <p className="text-sm font-semibold" style={{ color: colors.textMain }}>{furnished} • {unitType}</p>
              {mgmtPct != null && <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{mgmtPct}% STR management fee</p>}
            </div>
          </div>
        </div>

        {/* 2. TOP RECOMMENDED HEADING */}
        <div>
          <h2 style={sectionTitle}>Top Recommended Leasing Agents</h2>
          <p className="text-sm mt-2" style={{ color: colors.textMuted }}>Two strongest matches based on area expertise, leasing performance, listing quality, and landlord support.</p>
        </div>

        {/* 3. TWO MAIN AGENT CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {main.map((a, i) => {
            const accent = i === 0 ? colors.primary : colors.secondary;
            const sc = agentScores(a);
            return (
              <div key={a.id} className="rounded-3xl p-7 flex flex-col" style={{
                background: "#FFFFFF", border: `1px solid ${colors.border}`,
                boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 16px 40px rgba(0,0,0,0.06)",
              }}>
                {/* Badge */}
                <span className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full text-xs font-bold mb-5"
                  style={{ background: `${accent}14`, color: accent, border: `1px solid ${accent}33`, letterSpacing: "0.04em" }}>
                  <span className="px-1.5 py-0.5 rounded" style={{ background: accent, color: "#fff" }}>#{i + 1}</span>
                  {i === 0 ? "BEST OVERALL MATCH" : "BEST ALTERNATIVE MATCH"}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-5">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center flex-shrink-0" style={{
                      width: "60px", height: "60px", borderRadius: "16px", background: accent, color: "#fff",
                      fontWeight: 700, fontSize: "18px", fontFamily: "'Georgia', serif",
                    }}>{initialsOf(a.name)}</div>
                    <div>
                      <h3 className="text-2xl font-bold" style={{ color: colors.textMain, fontFamily: "'Georgia', serif" }}>{a.name}</h3>
                      <p className="text-xs mt-1" style={{ color: colors.textMuted, lineHeight: 1.5 }}>{a.title}</p>
                      <div className="flex gap-3 mt-4">
                        {[{ l: "LANDLORD SCORE", v: sc.landlord }, { l: "LEASING SCORE", v: sc.leasing }].map(s => (
                          <div key={s.l} className="px-4 py-3 rounded-xl text-center" style={{ background: colors.bgMain, border: `1px solid ${colors.border}` }}>
                            <p className="text-[10px] font-semibold mb-1" style={{ color: colors.textMuted, letterSpacing: "0.06em" }}>{s.l}</p>
                            <p className="text-xl font-bold" style={{ color: colors.textMain }}>{s.v}<span className="text-xs" style={{ color: colors.textLight }}> /100</span></p>
                            <div className="mt-1.5 mx-auto rounded-full" style={{ width: "28px", height: "2px", background: accent }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="sm:pl-5 sm:border-l" style={{ borderColor: colors.border }}>
                    <p className="text-[10px] font-semibold mb-1" style={{ color: colors.textMuted, letterSpacing: "0.06em" }}>LEASING FEE</p>
                    <p className="text-lg font-bold mb-4" style={{ color: colors.textMain }}>5%<span className="text-xs font-normal" style={{ color: colors.textMuted }}> market standard</span></p>
                    <p className="text-[10px] font-semibold mb-1" style={{ color: colors.textMuted, letterSpacing: "0.06em" }}>BEST FOR</p>
                    <p className="text-sm" style={{ color: colors.textMain, lineHeight: 1.5 }}>{a.specialties.slice(0, 3).join(", ")}</p>
                  </div>
                </div>

                {/* Why this match */}
                <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${colors.border}` }}>
                  <p className="text-[10px] font-semibold mb-1.5" style={{ color: colors.textMuted, letterSpacing: "0.06em" }}>WHY THIS MATCH</p>
                  <p className="text-sm" style={{ color: colors.textMain, lineHeight: 1.6 }}>{a.matchReasons?.[0] ?? a.title}</p>
                </div>

                {/* Contact */}
                <button onClick={() => contactAgent(a.name)}
                  className="w-full inline-flex items-center justify-center gap-2 mt-6 py-3 rounded-xl text-sm font-bold transition hover:brightness-105"
                  style={{ background: colors.primary, color: "#fff", boxShadow: `0 8px 20px ${colors.primary}33` }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 5.5C4 4.7 4.7 4 5.5 4h2.6c.6 0 1.1.4 1.3 1l1 3.2c.1.5 0 1-.4 1.3l-1.6 1.3a12 12 0 0 0 5.4 5.4l1.3-1.6c.3-.4.8-.5 1.3-.4l3.2 1c.6.2 1 .7 1 1.3v2.6c0 .8-.7 1.5-1.5 1.5A15.5 15.5 0 0 1 4 5.5z" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round"/></svg>
                  Contact Agent
                </button>
              </div>
            );
          })}
        </div>

        {/* 4. OTHER AGENTS TO CONSIDER */}
        {others.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-5" style={{ color: colors.textMain, fontFamily: "'Georgia', serif" }}>Other Agents to Consider</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {others.map((a) => {
                const sc = agentScores(a);
                return (
                  <div key={a.id} onClick={() => contactAgent(a.name)} className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition hover:-translate-y-0.5"
                    style={{ background: "#FFFFFF", border: `1px solid ${colors.border}`, boxShadow: colors.shadowSm }}>
                    <div className="flex items-center justify-center flex-shrink-0" style={{
                      width: "44px", height: "44px", borderRadius: "50%", background: colors.primary, color: "#fff",
                      fontWeight: 700, fontSize: "13px",
                    }}>{initialsOf(a.name)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate" style={{ color: colors.textMain }}>{a.name}</p>
                      <div className="flex gap-4 mt-1">
                        <span className="text-xs" style={{ color: colors.textMuted }}>Landlord <b style={{ color: colors.textMain }}>{sc.landlord}</b></span>
                        <span className="text-xs" style={{ color: colors.textMuted }}>Leasing <b style={{ color: colors.textMain }}>{sc.leasing}</b></span>
                      </div>
                      <span className="text-xs font-semibold mt-1.5 inline-block" style={{ color: colors.secondary }}>Contact →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. NEW & BOUTIQUE LEASING SPECIALISTS */}
        {boutique.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-1" style={{ color: colors.textMain, fontFamily: "'Georgia', serif" }}>New &amp; Boutique Leasing Specialists</h3>
            <p className="text-sm mb-5" style={{ color: colors.textMuted }}>Promising leasing specialists and boutique agencies offering more personalized landlord support.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {boutique.map((a) => (
                <div key={a.id} onClick={() => contactAgent(a.name)} className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition hover:-translate-y-0.5"
                  style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, boxShadow: colors.shadowSm }}>
                  <div className="flex items-center justify-center flex-shrink-0" style={{
                    width: "44px", height: "44px", borderRadius: "50%", background: `${colors.secondary}1A`, color: colors.secondary,
                    fontWeight: 700, fontSize: "13px", border: `1px solid ${colors.secondary}40`,
                  }}>{initialsOf(a.name)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate" style={{ color: colors.textMain }}>{a.name}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1" style={{ background: `${colors.secondary}14`, color: colors.secondary }}>{a.badge}</span>
                    <p className="text-xs mt-1.5 truncate" style={{ color: colors.textMuted }}>{a.specialization}</p>
                    <span className="text-xs font-semibold mt-1.5 inline-block" style={{ color: colors.secondary }}>Contact →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. HOW GROUNDWORKS RANKS AGENTS */}
        <div className="rounded-3xl px-7 py-7" style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, boxShadow: colors.shadowSm }}>
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_1fr] gap-6 items-start">
            <h3 className="text-lg font-bold md:pr-6 md:border-r" style={{ color: colors.textMain, fontFamily: "'Georgia', serif", borderColor: colors.border }}>How GroundWorks Ranks Leasing Agents</h3>
            {[
              { t: "Landlord Score", d: "Communication, landlord support, transparency, tenant quality, and the leasing process.", icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.2" stroke={colors.primary} strokeWidth="1.3"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" stroke={colors.primary} strokeWidth="1.3" strokeLinecap="round"/></svg>
              ) },
              { t: "Leasing Score", d: "Speed to lease, listing quality, market reach, inquiry handling, and closing performance.", icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 17l5-5 4 4 8-8" stroke={colors.secondary} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 8h4v4" stroke={colors.secondary} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) },
              { t: "Market Fit", d: "Alignment with your building, community, unit type, rental strategy, and expected tenant profile.", icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke={colors.primary} strokeWidth="1.3"/><circle cx="12" cy="12" r="4" stroke={colors.primary} strokeWidth="1.3"/><circle cx="12" cy="12" r="1.2" fill={colors.primary}/></svg>
              ) },
            ].map(c => (
              <div key={c.t} className="flex gap-3">
                <div className="flex items-center justify-center flex-shrink-0" style={{ width: "40px", height: "40px", borderRadius: "50%", background: colors.bgMain, border: `1px solid ${colors.border}` }}>{c.icon}</div>
                <div>
                  <p className="text-sm font-bold mb-1" style={{ color: colors.textMain }}>{c.t}</p>
                  <p className="text-xs" style={{ color: colors.textMuted, lineHeight: 1.5 }}>{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center pb-10 space-y-2">
          <div className="flex items-center justify-center gap-1">
            <span className="text-sm font-bold" style={{ color: colors.textLight }}>Ground</span>
            <span className="text-sm font-bold" style={{ color: "#C9A84C66" }}>Works</span>
          </div>
          <p className="text-xs max-w-2xl mx-auto" style={{ color: colors.textLight }}>
            Agent ratings sourced from Google, Property Finder and Bayut. Match scores based on community coverage, transaction volume, and review ratings. Data updated quarterly.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.bgMain }}>
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 animate-spin mx-auto mb-4"
            style={{ borderColor: colors.primary, borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: colors.textMuted }}>Finding your best leasing agents...</p>
        </div>
      </div>
    }>
      <AgentsContent />
    </Suspense>
  );
}
