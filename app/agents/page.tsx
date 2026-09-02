"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { rankAgents, RealEstateAgent, BOUTIQUE_AGENTS } from "@/lib/agents";
import { BUILDING_DIRECTORY, getLTRMarketRent, fmt } from "@/lib/estimator";
import type { UnitSize, UnitType } from "@/lib/estimator";
import { colors } from "@/lib/colors";
import AssetIntelLogo from "@/components/AssetIntelLogo";
import LeadModal from "@/components/LeadModal";
import DecorativeBackdrop from "@/components/DecorativeBackdrop";

type RankedAgent = RealEstateAgent & { matchScore: number; matchReasons: string[] };

// Derive AssetIntel Landlord & Leasing scores from existing fields (display only — no logic change)
function agentScores(a: RealEstateAgent) {
  const landlord = Math.max(60, Math.min(99, Math.round((a.googleRating / 5) * 100 * 0.7 + (a.propertyFinderRating / 5) * 100 * 0.3)));
  const leasing = Math.max(60, Math.min(99, Math.round(98 - Math.max(0, a.avgDaysToLet - 12) * 1.4 + Math.min(a.transactionsLastYear / 400, 6))));
  return { landlord, leasing };
}

const initialsOf = (name: string) => name.split(" ").filter(w => w[0] && /[A-Za-z0-9]/.test(w[0])).map(w => w[0]).join("").slice(0, 2).toUpperCase();

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

  const [lead, setLead] = useState<string | null>(null);
  const propertyCtx = [community, unitSize].filter(Boolean).join(" · ");

  const ltrRangeStr = (ltr.rangeLow != null && ltr.rangeHigh != null)
    ? `AED ${fmt(ltr.rangeLow)} – ${fmt(ltr.rangeHigh)}`
    : `AED ${fmt(ltr.rent)}`;

  return (
    <div className="min-h-screen" style={{ background: colors.bgMain, position: "relative" }}>
      <DecorativeBackdrop />
      <style>{`
        .ai-agents-card { transition: transform 180ms cubic-bezier(0.16,1,0.3,1), box-shadow 180ms cubic-bezier(0.16,1,0.3,1), border-color 180ms ease; }
        .ai-agents-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(27,94,74,0.10); border-color: rgba(184,138,68,0.4) !important; }
        .ai-agents-contact:hover { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(27,94,74,0.32); }
        .ai-agents-contact { transition: transform 180ms cubic-bezier(0.16,1,0.3,1), box-shadow 180ms cubic-bezier(0.16,1,0.3,1), background 150ms ease; }
        .ai-agents-contact:focus-visible, .ai-agents-card:focus-visible { outline: 2px solid ${colors.primary}; outline-offset: 2px; }
      `}</style>
      <div style={{ position: "relative", zIndex: 1 }}>

      {/* Slim header */}
      <div style={{ position: "sticky", top: 0, zIndex: 200, padding: "12px 16px" }}>
        <div style={{
          maxWidth: 1152, margin: "0 auto",
          background: "rgba(253,251,247,0.92)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
          border: `1px solid ${colors.border}`, borderRadius: 24,
          boxShadow: "0 8px 28px rgba(27,94,74,0.09)",
          display: "flex", alignItems: "center", padding: "0 20px", height: 68, gap: 12,
        }}>
          <button onClick={() => router.push("/")} aria-label="AssetIntel home" style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }}>
            <AssetIntelLogo size={32} />
          </button>
          <span style={{ marginLeft: "auto", fontSize: 11, padding: "4px 12px", borderRadius: 999, fontWeight: 600, background: "rgba(27,94,74,0.08)", color: colors.primary, border: "1px solid rgba(27,94,74,0.16)" }}>
            Long-Term Rental
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">

        {/* 1. PROPERTY SUMMARY BAR */}
          <div className="rounded-3xl px-7 py-6" style={{
            background: colors.bgSection,
            border: `1px solid ${colors.border}`, boxShadow: "0 14px 36px rgba(27,94,74,0.07)",
          }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="lg:pr-6" style={{ borderRight: `1px solid ${colors.border}` }}>
                <p className="text-xs font-semibold mb-2" style={{ color: colors.secondaryText, letterSpacing: "0.1em" }}>PROPERTY</p>
                <p className="text-lg font-bold" style={{ color: colors.textMain, fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif" }}>{community || propertyName || "Your Property"}</p>
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{unitSize} • Floor {floor} • {view}</p>
              </div>
              <div className="lg:px-6" style={{ borderRight: `1px solid ${colors.border}` }}>
                <p className="text-xs font-semibold mb-2" style={{ color: colors.secondaryText, letterSpacing: "0.1em" }}>RENTAL STRATEGY</p>
                <p className="text-lg font-bold" style={{ color: colors.primary, fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif" }}>Long-Term Rental</p>
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Recommended for this property</p>
              </div>
              <div className="lg:px-6" style={{ borderRight: `1px solid ${colors.border}` }}>
                <p className="text-xs font-semibold mb-2" style={{ color: colors.secondaryText, letterSpacing: "0.1em" }}>ESTIMATED LTR RANGE</p>
                <p className="text-lg font-bold" style={{ color: colors.primary, fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif" }}>{ltrRangeStr}</p>
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>per year</p>
              </div>
              <div className="lg:pl-6">
                <p className="text-xs font-semibold mb-2" style={{ color: colors.secondaryText, letterSpacing: "0.1em" }}>PROPERTY DETAILS</p>
                <p className="text-sm font-semibold" style={{ color: colors.textMain }}>{furnished} • {unitType}</p>
                {mgmtPct != null && <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{mgmtPct}% STR management fee</p>}
              </div>
            </div>
          </div>

          {/* 2. TOP RECOMMENDED HEADING */}
          <div>
            <p className="text-[11px] font-bold mb-2" style={{ color: colors.secondaryText, letterSpacing: "0.14em" }}>LEASING AGENTS</p>
            <h2 style={{ fontSize: "clamp(24px, 3.4vw, 34px)", fontWeight: 600, fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", color: colors.textMain, lineHeight: 1.2 }}>
              Top Recommended Leasing Agents
            </h2>
            <p className="text-sm mt-2 max-w-xl" style={{ color: colors.textMuted, lineHeight: 1.65 }}>Two strongest matches based on area expertise, leasing performance, listing quality, and landlord support.</p>
          </div>

          {/* 3. TWO MAIN AGENT CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {main.map((a, i) => {
              const accent = i === 0 ? colors.primary : colors.secondary;
              const sc = agentScores(a);
              return (
                <div key={a.id} className="ai-agents-card rounded-3xl p-7 flex flex-col" style={{
                  background: colors.bgSection, border: `1px solid ${colors.border}`,
                  boxShadow: "0 16px 40px rgba(27,94,74,0.06)",
                }}>
                  {/* Badge */}
                  <span className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full text-xs font-bold mb-5"
                    style={{ background: `${accent}14`, color: accent, border: `1px solid ${accent}33`, letterSpacing: "0.04em" }}>
                    <span className="px-1.5 py-0.5 rounded" style={{ background: accent, color: "#fff" }}>#{i + 1}</span>
                    {i === 0 ? "BEST OVERALL MATCH" : "BEST ALTERNATIVE MATCH"}
                  </span>

                  {/* Identity row — always full width, so a wrapping name never disturbs anything beside it */}
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center flex-shrink-0" style={{
                      width: "56px", height: "56px", borderRadius: "16px", background: accent, color: "#fff",
                      fontWeight: 600, fontSize: "19px", fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif",
                    }}>{initialsOf(a.name)}</div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold" style={{ color: colors.textMain, fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", lineHeight: 1.25 }}>{a.name}</h3>
                      <p className="text-xs mt-1" style={{ color: colors.textMuted, lineHeight: 1.5 }}>{a.title}</p>
                    </div>
                  </div>

                  {/* Three equal-width stats — same shape regardless of name length above */}
                  <div className="grid grid-cols-3 gap-3 mt-5">
                    {[
                      { l: "LANDLORD", v: `${sc.landlord}`, sub: "/100" },
                      { l: "LEASING", v: `${sc.leasing}`, sub: "/100" },
                      { l: "FEE", v: "5%", sub: "standard" },
                    ].map(s => (
                      <div key={s.l} className="px-3 py-3 rounded-xl text-center" style={{ background: colors.bgMain, border: `1px solid ${colors.border}` }}>
                        <p className="text-[10px] font-semibold mb-1" style={{ color: colors.textMuted, letterSpacing: "0.06em" }}>{s.l}</p>
                        <p className="text-xl font-bold" style={{ color: colors.textMain, fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif" }}>{s.v}</p>
                        <p className="text-[10px] font-sans" style={{ color: colors.textLight }}>{s.sub}</p>
                        <div className="mt-1.5 mx-auto rounded-full" style={{ width: "24px", height: "2px", background: accent }} />
                      </div>
                    ))}
                  </div>

                  {/* Best for — full width, own row */}
                  <div className="mt-5 pt-5" style={{ borderTop: `1px solid ${colors.border}` }}>
                    <p className="text-[10px] font-semibold mb-1.5" style={{ color: colors.textMuted, letterSpacing: "0.06em" }}>BEST FOR</p>
                    <p className="text-sm" style={{ color: colors.textMain, lineHeight: 1.5 }}>{a.specialties.slice(0, 3).join(", ")}</p>
                  </div>

                  {/* Why this match */}
                  <div className="mt-5 pt-5" style={{ borderTop: `1px solid ${colors.border}` }}>
                    <p className="text-[10px] font-semibold mb-1.5" style={{ color: colors.textMuted, letterSpacing: "0.06em" }}>WHY THIS MATCH</p>
                    <p className="text-sm" style={{ color: colors.textMain, lineHeight: 1.6 }}>{a.matchReasons?.[0] ?? a.title}</p>
                  </div>

                  {/* Contact */}
                  <button onClick={() => setLead(a.name)}
                    className="ai-agents-contact w-full inline-flex items-center justify-center gap-2 mt-6 py-3 rounded-xl text-sm font-bold"
                    style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`, color: "#fff", boxShadow: `0 8px 20px rgba(27,94,74,0.25)` }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 5.5C4 4.7 4.7 4 5.5 4h2.6c.6 0 1.1.4 1.3 1l1 3.2c.1.5 0 1-.4 1.3l-1.6 1.3a12 12 0 0 0 5.4 5.4l1.3-1.6c.3-.4.8-.5 1.3-.4l3.2 1c.6.2 1 .7 1 1.3v2.6c0 .8-.7 1.5-1.5 1.5A15.5 15.5 0 0 1 4 5.5z" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round"/></svg>
                    Contact {a.name.split(" ")[0]}
                  </button>
                </div>
              );
            })}
        </div>

        {/* 4. OTHER AGENTS TO CONSIDER */}
        {others.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-5" style={{ color: colors.textMain, fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif" }}>Other Agents to Consider</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {others.map((a) => {
                const sc = agentScores(a);
                return (
                  <button key={a.id} onClick={() => setLead(a.name)} className="ai-agents-card rounded-2xl p-5 flex items-center gap-4 text-left w-full"
                    style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, boxShadow: colors.shadowSm }}>
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
                      <span className="text-xs font-semibold mt-1.5 inline-block" style={{ color: colors.secondaryText }}>Contact →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. NEW & BOUTIQUE LEASING SPECIALISTS */}
        {boutique.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-1" style={{ color: colors.textMain, fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif" }}>New &amp; Boutique Leasing Specialists</h3>
            <p className="text-sm mb-5" style={{ color: colors.textMuted }}>Promising leasing specialists and boutique agencies offering more personalized landlord support.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {boutique.map((a) => (
                <button key={a.id} onClick={() => setLead(a.name)} className="ai-agents-card rounded-2xl p-5 flex items-center gap-4 text-left w-full"
                  style={{ background: colors.bgSage, border: `1px solid ${colors.borderSage}`, boxShadow: colors.shadowSm }}>
                  <div className="flex items-center justify-center flex-shrink-0" style={{
                    width: "44px", height: "44px", borderRadius: "50%", background: `${colors.secondary}1A`, color: colors.secondaryText,
                    fontWeight: 700, fontSize: "13px", border: `1px solid ${colors.secondary}40`,
                  }}>{initialsOf(a.name)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate" style={{ color: colors.textMain }}>{a.name}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1" style={{ background: `${colors.secondary}1F`, color: colors.secondaryText }}>{a.badge}</span>
                    <p className="text-xs mt-1.5 truncate" style={{ color: colors.textMuted }}>{a.specialization}</p>
                    <span className="text-xs font-semibold mt-1.5 inline-block" style={{ color: colors.secondaryText }}>Contact →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 6. HOW ASSETINTEL RANKS AGENTS */}
        <div className="rounded-3xl px-7 py-7" style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, boxShadow: colors.shadowSm }}>
          <h3 className="text-lg font-bold mb-5" style={{ color: colors.textMain, fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif" }}>How AssetIntel Ranks Leasing Agents</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
            {[
              { t: "Landlord Score", d: "Communication, landlord support, transparency, tenant quality, and the leasing process." },
              { t: "Leasing Score", d: "Speed to lease, listing quality, market reach, inquiry handling, and closing performance." },
              { t: "Market Fit", d: "Alignment with your building, community, unit type, rental strategy, and expected tenant profile." },
            ].map((c, idx) => (
              <div key={c.t} className={idx > 0 ? "md:pl-8 md:border-l" : ""} style={{ borderColor: colors.border }}>
                <p className="text-sm font-bold mb-1" style={{ color: colors.textMain }}>{c.t}</p>
                <p className="text-xs" style={{ color: colors.textMuted, lineHeight: 1.6 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center pb-10 space-y-2">
          <div className="flex items-center justify-center gap-1">
            <span className="text-sm font-bold" style={{ color: colors.textLight }}>Asset</span>
            <span className="text-sm font-bold" style={{ color: colors.secondaryText }}>Intel</span>
          </div>
          <p className="text-xs max-w-2xl mx-auto" style={{ color: colors.textLight }}>
            Agent ratings sourced from Google, Property Finder and Bayut. Match scores based on community coverage, transaction volume, and review ratings. Data updated quarterly.
          </p>
        </div>
      </div>
      </div>

      <LeadModal open={!!lead} target={lead ?? ""} targetType="agent" property={propertyCtx}
        context={{
          recommendation: "LTR",
          building: buildingName,
          community,
          unitSize,
          floor,
          view,
          furnished,
          ltrPerYear: ltrRangeStr,
        }}
        onClose={() => setLead(null)} />
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
