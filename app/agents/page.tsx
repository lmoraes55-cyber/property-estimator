"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { rankAgents, RealEstateAgent } from "@/lib/agents";
import { BUILDING_DIRECTORY, getLTRMarketRent, fmt } from "@/lib/estimator";
import type { UnitSize, UnitType } from "@/lib/estimator";
import { colors } from "@/lib/colors";
import GroundWorksLogo from "@/components/GroundWorksLogo";

const SOURCE_COLORS: Record<string, string> = {
  "Google": "#4285F4",
  "Property Finder": "#E74C3C",
  "Bayut": "#F39C12",
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < Math.round(rating) ? colors.primary : colors.textLight, fontSize: "11px" }}>&#9733;</span>
      ))}
    </span>
  );
}

function AgentCard({ agent, rank }: { agent: RealEstateAgent & { matchScore: number; matchReasons: string[] }; rank: number }) {
  const isBest = rank <= 1;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>

      {/* Header */}
      <div className="p-6" style={{ borderBottom: "1px solid " + colors.primary }}>
        <div className="flex items-start justify-between mb-3">
          <div>
            {isBest && (
              <span className="inline-block text-xs px-2.5 py-1 rounded-full font-semibold mb-2"
                style={{ background: colors.bgMain, color: colors.primary, border: "1px solid " + colors.primary }}>
                {rank === 0 ? "Top Match for Your Area" : "Strong Match for Your Area"}
              </span>
            )}
            <h3 className="text-lg font-bold" style={{ color: colors.textMain }}>{agent.name}</h3>
            <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{agent.title}</p>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <div className="text-2xl font-bold" style={{ color: colors.primary }}>{agent.googleRating}</div>
            <Stars rating={agent.googleRating} />
            <p className="text-xs mt-0.5" style={{ color: colors.textLight }}>{agent.googleReviewCount.toLocaleString()} Google reviews</p>
          </div>
        </div>

        {/* Match reasons */}
        {agent.matchReasons.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {agent.matchReasons.map(r => (
              <span key={r} className="text-xs px-2.5 py-1 rounded-lg"
                style={{ background: colors.bgMain, border: "1px solid " + colors.primary, color: colors.primary }}>
                {r}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 space-y-5">

        {/* Key stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Experience", value: `${agent.experience} years` },
            { label: "Lets/Year", value: agent.transactionsLastYear.toLocaleString() },
            { label: "Avg Days to Let", value: `${agent.avgDaysToLet} days` },
            { label: "Rent Achieved", value: agent.avgAchievedRent },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center"
              style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
              <p className="text-xs mb-1" style={{ color: colors.textMuted }}>{s.label}</p>
              <p className="text-sm font-bold" style={{ color: colors.textMain }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Platform ratings */}
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase mb-3" style={{ color: colors.textLight }}>Platform Ratings</p>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
              <span style={{ color: SOURCE_COLORS["Google"] }}>Google</span>
              <span className="font-bold" style={{ color: colors.textMain }}>{agent.googleRating}</span>
              <span style={{ color: colors.textLight }}>({agent.googleReviewCount.toLocaleString()})</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
              <span style={{ color: SOURCE_COLORS["Property Finder"] }}>Property Finder</span>
              <span className="font-bold" style={{ color: colors.textMain }}>{agent.propertyFinderRating}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
              <span style={{ color: colors.textLight }}>Languages</span>
              <span style={{ color: colors.textMain }}>{agent.languages.join(" · ")}</span>
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase mb-2" style={{ color: colors.textLight }}>Specialties</p>
          <div className="flex flex-wrap gap-2">
            {agent.specialties.map(s => (
              <span key={s} className="text-xs px-2.5 py-1 rounded-lg"
                style={{ background: "#111", border: "1px solid #1E1E1E", color: colors.textLight }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Why choose them */}
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase mb-2" style={{ color: colors.textLight }}>Why This Agency</p>
          <ul className="space-y-1.5">
            {agent.pros.map(p => (
              <li key={p} className="flex items-start gap-2 text-xs" style={{ color: colors.textLight }}>
                <span style={{ color: colors.success, marginTop: "1px", flexShrink: 0 }}>+</span>{p}
              </li>
            ))}
          </ul>
        </div>

        {/* Recent reviews */}
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase mb-3" style={{ color: colors.textLight }}>Recent Landlord Reviews</p>
          <div className="space-y-3">
            {agent.recentReviews.map((r, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: colors.textMain }}>{r.author}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: colors.bgSection, color: SOURCE_COLORS[r.source] ?? colors.textMuted }}>
                      {r.source}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Stars rating={r.rating} />
                    <span className="text-xs" style={{ color: colors.textMuted }}>{r.date}</span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "#777" }}>&ldquo;{r.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button className="w-full py-3 rounded-xl text-sm font-bold transition-all"
          style={{
            background: isBest ? "linear-gradient(135deg, #5A9E5A, #7ABF50)" : colors.bgSection,
            color: isBest ? "#fff" : colors.textLight,
            border: isBest ? "none" : "1px solid #252525",
          }}>
          {isBest ? `${rank === 0 ? "Contact" : "Get in Touch"} ${agent.name} →` : `Learn More About ${agent.name}`}
        </button>
      </div>
    </div>
  );
}

function AgentsContent() {
  const params = useSearchParams();
  const router = useRouter();

  const buildingName = params.get("buildingName") ?? "";
  const unitSize = (params.get("unitSize") ?? "2BR") as UnitSize;
  const unitType = (params.get("unitType") ?? "Apartment") as UnitType;
  const propertyName = params.get("propertyName") ?? "";
  const floor = params.get("floor") ?? "1";

  const buildingInfo = BUILDING_DIRECTORY[buildingName];
  const community = buildingInfo?.community ?? buildingName;
  const { rent: ltrRent, source: ltrSource } = getLTRMarketRent(buildingName, unitSize);

  const ranked = rankAgents(community, unitType);

  const handleBack = () => {
    // Replace current entry to go back without creating new history entry
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

  return (
    <div className="min-h-screen" style={{ background: colors.bgMain }}>

      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
        style={{ background: colors.bgMain + "ee", borderBottom: "1px solid " + colors.primary, backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-4">
          <button onClick={handleBack}
            className="text-xs px-3 py-1.5 rounded-lg transition hover:bg-white/10 font-medium"
            style={{ background: colors.bgSection, border: "1px solid #1A4A1A33", color: colors.mutedGreen }}>
            ← Back to Report
          </button>
          <div className="flex items-center gap-2">
            <GroundWorksLogo size={40} />
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-base font-bold" style={{ color: colors.textMain }}>Ground</span>
                <span className="text-base font-bold" style={{ color: colors.primary }}>Works</span>
              </div>
              <span className="text-xs tracking-widest" style={{ color: colors.textLight, letterSpacing: "0.14em" }}>We work, You Decide</span>
            </div>
          </div>
          <div className="w-px h-4" style={{ background: colors.textLight }} />
          <div>
            <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Leasing Agent Match</p>
            <p className="text-sm font-semibold" style={{ color: colors.textMain }}>{propertyName}</p>
          </div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full font-medium"
          style={{ background: colors.bgMain, color: colors.primary, border: "1px solid " + colors.primary }}>
          Long-Term Rental
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Hero */}
        <div className="rounded-2xl p-8" style={{ background: `linear-gradient(135deg, ${colors.bgSection} 0%, ${colors.bgSection} 100%)`, border: "1px solid " + colors.primary }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: colors.mutedGreen }}>Part 2 of 2 · Agent Match</p>
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textMain }}>Your Top 5 Leasing Agents</h1>
          <p className="text-sm mb-6" style={{ color: colors.textLight }}>
            Based on your property in <span style={{ color: colors.textMain }}>{community}</span> — {unitSize} {unitType} on Floor {floor} — here are the best-matched agents ranked by area presence, speed, and landlord review scores.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs mb-1" style={{ color: colors.textMuted }}>Est. Annual LTR</p>
              <p className="text-xl font-bold" style={{ color: colors.mutedGreen }}>AED {fmt(ltrRent)}</p>
              <p className="text-xs mt-0.5" style={{ color: colors.textLight }}>Source: {ltrSource}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: colors.textMuted }}>Avg Days to Let</p>
              <p className="text-xl font-bold" style={{ color: colors.secondary }}>
                {Math.round(ranked.slice(0, 3).reduce((s, a) => s + a.avgDaysToLet, 0) / 3)} days
              </p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: colors.textMuted }}>Community</p>
              <p className="text-xl font-bold" style={{ color: colors.secondary }}>{community}</p>
            </div>
          </div>
        </div>

        {/* Agent cards */}
        {ranked.map((agent, i) => (
          <AgentCard key={agent.id} agent={agent} rank={i} />
        ))}

        {/* Footer */}
        <div className="text-center pb-10 space-y-2">
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm font-bold" style={{ color: colors.textLight }}>Ground</span>
              <span className="text-sm font-bold" style={{ color: "#C9A84C66" }}>Works</span>
            </div>
            <span className="text-xs tracking-widest" style={{ color: colors.textLight, letterSpacing: "0.14em" }}>We work, You Decide</span>
          </div>
          <p className="text-xs" style={{ color: colors.textLight }}>
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
            style={{ borderColor: colors.mutedGreen, borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: colors.textMuted }}>Finding your best leasing agents...</p>
        </div>
      </div>
    }>
      <AgentsContent />
    </Suspense>
  );
}
