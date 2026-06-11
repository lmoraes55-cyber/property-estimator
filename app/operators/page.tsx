"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { runEstimator, rankOperators, fmt, UnitSize, UnitType, OCCStrategy, ViewType, FurnishedStatus } from "@/lib/estimator";
import { UPCOMING_OPERATORS } from "@/lib/furnishing";
import { filterOperatorsByLocation, filterOperatorsByTier, filterOperatorsByBedroomType, parseYearsInBusiness, parseCommission } from "@/lib/operators-data";
import { colors } from "@/lib/colors";
import { getOperatorProfile } from "@/lib/operator-profiles";
import GroundWorksLogo from "@/components/GroundWorksLogo";
import LeadModal from "@/components/LeadModal";
import { FilterPanel, FilterState } from "@/components/FilterPanel";

// Convert an operator name to a URL slug for its profile page
// e.g. "Deluxe Holiday Homes" -> "deluxe-holiday-homes"
function operatorSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function OperatorsContent() {
  const params = useSearchParams();
  const router = useRouter();

  // Filter state management
  const [filters, setFilters] = useState<FilterState>({
    tier: [],
    locations: [],
    bedroomTypes: [],
    commissionRange: [10, 35],
    yearsInBusiness: [],
  });

  const input = {
    propertyName: params.get("propertyName") ?? "",
    buildingName: params.get("buildingName") ?? "",
    unitSize: (params.get("unitSize") ?? "2BR") as UnitSize,
    unitType: (params.get("unitType") ?? "Apartment") as UnitType,
    floor: Number(params.get("floor") ?? 1),
    view: (params.get("view") ?? "Standard View") as ViewType,
    furnished: (params.get("furnished") ?? "Furnished") as FurnishedStatus,
    occStrategy: (params.get("occStrategy") ?? "LOCCHP") as OCCStrategy,
    managementFee: Number(params.get("managementFee") ?? 0.20),
    propertyValue: params.get("propertyValue") ? Number(params.get("propertyValue")) : undefined,
  };

  const result = runEstimator(input);
  let ranked = rankOperators(result);

  // Apply filters to ranked operators
  ranked = ranked.filter((op) => {
    // Tier filter
    if (filters.tier.length > 0) {
      const matchesTier = filters.tier.some((tier) => {
        if (tier === "Tier 1") return op.googleRating >= 4.7 && op.portfolio > 1000;
        if (tier === "Tier 2") return op.googleRating >= 4.5 && op.portfolio > 500;
        if (tier === "Tier 3") return op.googleRating >= 4.3 && op.portfolio > 200;
        if (tier === "Tier 4+") return op.portfolio <= 200;
        return false;
      });
      if (!matchesTier) return false;
    }

    // Location filter
    if (filters.locations.length > 0) {
      const matchesLocation = filters.locations.some((location) =>
        op.communities.some(
          (c) => c.toLowerCase().includes(location.toLowerCase()) ||
                 location.toLowerCase().includes(c.toLowerCase())
        )
      );
      if (!matchesLocation) return false;
    }

    // Bedroom type filter
    if (filters.bedroomTypes.length > 0) {
      const matchesBedroom = filters.bedroomTypes.some((type) =>
        op.bestFor.some(
          (b) => b.toLowerCase().includes(type.toLowerCase()) ||
                 type.toLowerCase().includes(b.toLowerCase())
        )
      );
      if (!matchesBedroom) return false;
    }

    // Commission range filter
    const opCommissionMin = op.commission[0];
    const opCommissionMax = op.commission[1];
    const commissionMatch =
      !(opCommissionMax < filters.commissionRange[0] ||
        opCommissionMin > filters.commissionRange[1]);
    if (!commissionMatch) return false;

    // Years in business filter
    if (filters.yearsInBusiness.length > 0) {
      const yearsFounded = new Date().getFullYear() - op.founded;
      const matchesYears = filters.yearsInBusiness.some((yearsRange) => {
        if (yearsRange === "10+") return yearsFounded >= 10;
        if (yearsRange === "5-9") return yearsFounded >= 5 && yearsFounded < 10;
        if (yearsRange === "<5") return yearsFounded < 5;
        return false;
      });
      if (!matchesYears) return false;
    }

    return true;
  });

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
    const ltrRec = params.get("ltrRecommended");
    if (ltrRec) reportParams.set("ltrRecommended", ltrRec);
    router.replace(`/report?${reportParams.toString()}`);
  };

  const handleGoToFurnishing = () => {
    // Navigate to furnishing page if property is unfurnished
    if (input.furnished === "Unfurnished") {
      const furnishParams = new URLSearchParams();
      furnishParams.set("propertyName", input.propertyName);
      furnishParams.set("unitSize", input.unitSize);
      furnishParams.set("buildingName", input.buildingName);
      router.push(`/furnishing?${furnishParams.toString()}`);
    }
  };

  // ── Display-only derivations (no logic/calculation changes) ──
  const us = input.unitSize as string;
  const isVilla = us.includes("VILLA");
  const beds = us === "STU" ? 0 : isVilla ? 4 : Math.min(4, parseInt(us, 10) || 4);
  const moneyBase = us === "STU" ? 2000 : beds === 1 ? 3000 : beds === 2 ? 4000 : 5000;
  const occBase = us === "STU" ? 2 : beds <= 2 ? 3 : 4;
  const rt = (v: number, s: number) => Math.round(v / s) * s;
  const moneyRange = (b: number) => `AED ${fmt(rt(b - moneyBase, 1000))} – ${fmt(rt(b + moneyBase, 1000))}`;
  const occPct = result.avgOccupancy * 100;
  const occRangeStr = `${Math.max(0, Math.round(occPct - occBase))}% – ${Math.min(100, Math.round(occPct + occBase))}%`;

  const scoreFor = (op: typeof ranked[number]) => {
    const prof = getOperatorProfile(operatorSlug(op.name));
    if (prof) return { owner: prof.ownerScore, guest: prof.guestScore };
    const guest = Math.max(60, Math.min(99, Math.round((op.googleRating / 5) * 100)));
    const feeAvg = (op.commission[0] + op.commission[1]) / 2;
    const owner = Math.max(60, Math.min(99, Math.round(guest - 2 + (20 - feeAvg) / 2)));
    return { owner, guest };
  };
  const feeStr = (c: [number, number]) => c[0] === c[1] ? `${c[0]}%` : `${c[0]}%–${c[1]}%`;
  const initialsOf = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const [lead, setLead] = useState<string | null>(null);
  const propertyCtx = [input.buildingName, input.unitSize].filter(Boolean).join(" · ");

  const main = [ranked[0], ranked[1]].filter(Boolean);
  const others = ranked.slice(2, 5);
  const emerging = UPCOMING_OPERATORS.slice(0, 3);

  const sectionTitle = (t: string): React.CSSProperties => ({
    fontSize: "30px", fontWeight: 700, fontFamily: "'Georgia', serif",
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
  });

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
            style={{ background: `${colors.secondary}18`, color: colors.secondary, border: `1px solid ${colors.secondary}33` }}>
            {input.unitSize} · {input.unitType}
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
              <p className="text-lg font-bold" style={{ color: colors.textMain, fontFamily: "'Georgia', serif" }}>{result.buildingName || "Your Property"}</p>
              <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{input.unitSize} • Floor {input.floor} • {input.view}</p>
            </div>
            <div className="lg:px-6" style={{ borderRight: `1px solid ${colors.border}` }}>
              <p className="text-xs font-semibold mb-2" style={{ color: colors.secondary, letterSpacing: "0.1em" }}>REVENUE RANGE</p>
              <p className="text-xl font-bold" style={{ color: colors.primary, fontFamily: "'Georgia', serif" }}>{moneyRange(result.annualRevenue)}</p>
            </div>
            <div className="lg:px-6" style={{ borderRight: `1px solid ${colors.border}` }}>
              <p className="text-xs font-semibold mb-2" style={{ color: colors.secondary, letterSpacing: "0.1em" }}>OCCUPANCY RANGE</p>
              <p className="text-xl font-bold" style={{ color: colors.primary, fontFamily: "'Georgia', serif" }}>{occRangeStr}</p>
            </div>
            <div className="lg:pl-6">
              <p className="text-xs font-semibold mb-2" style={{ color: colors.secondary, letterSpacing: "0.1em" }}>NET TO OWNER</p>
              <p className="text-xl font-bold" style={{ color: colors.secondary, fontFamily: "'Georgia', serif" }}>{moneyRange(result.annualNetToLandlord)}</p>
            </div>
          </div>
        </div>

        {/* 2. TOP RECOMMENDED HEADING */}
        <div>
          <h2 style={sectionTitle("")}>Top Recommended Operators</h2>
          <p className="text-sm mt-2" style={{ color: colors.textMuted }}>Two strongest matches based on property fit, owner experience, and guest performance.</p>
        </div>

        {/* 3. TWO MAIN RECOMMENDATION CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {main.map((op, i) => {
            const accent = i === 0 ? colors.primary : colors.secondary;
            const sc = scoreFor(op);
            const slug = operatorSlug(op.name);
            return (
              <div key={op.id} className="rounded-3xl p-7 flex flex-col" style={{
                background: "#FFFFFF", border: `1px solid ${colors.border}`,
                boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 16px 40px rgba(0,0,0,0.06)",
              }}>
                {/* Badge */}
                <span className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full text-xs font-bold mb-5"
                  style={{ background: `${accent}14`, color: accent, border: `1px solid ${accent}33`, letterSpacing: "0.04em" }}>
                  <span className="px-1.5 py-0.5 rounded" style={{ background: accent, color: "#fff" }}>#{i + 1}</span>
                  {i === 0 ? "BEST OVERALL MATCH" : "BEST ALTERNATIVE MATCH"}
                </span>

                {/* Header + details */}
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-5">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center flex-shrink-0" style={{
                      width: "60px", height: "60px", borderRadius: "16px", background: accent, color: "#fff",
                      fontWeight: 700, fontSize: "18px", fontFamily: "'Georgia', serif",
                    }}>{initialsOf(op.name)}</div>
                    <div>
                      <h3 className="text-2xl font-bold" style={{ color: colors.textMain, fontFamily: "'Georgia', serif" }}>{op.name}</h3>
                      <p className="text-xs mt-1" style={{ color: colors.textMuted, lineHeight: 1.5 }}>{op.tagline}</p>
                      {/* Score tiles */}
                      <div className="flex gap-3 mt-4">
                        {[{ l: "OWNER SCORE", v: sc.owner }, { l: "GUEST SCORE", v: sc.guest }].map(s => (
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
                    <p className="text-[10px] font-semibold mb-1" style={{ color: colors.textMuted, letterSpacing: "0.06em" }}>MANAGEMENT FEE</p>
                    <p className="text-lg font-bold mb-4" style={{ color: colors.textMain }}>{feeStr(op.commission)}</p>
                    <p className="text-[10px] font-semibold mb-1" style={{ color: colors.textMuted, letterSpacing: "0.06em" }}>BEST FOR</p>
                    <p className="text-sm" style={{ color: colors.textMain, lineHeight: 1.5 }}>{op.bestFor.slice(0, 3).join(", ")}</p>
                  </div>
                </div>

                {/* Why this match */}
                <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${colors.border}` }}>
                  <p className="text-[10px] font-semibold mb-1.5" style={{ color: colors.textMuted, letterSpacing: "0.06em" }}>WHY THIS MATCH</p>
                  <p className="text-sm" style={{ color: colors.textMain, lineHeight: 1.6 }}>{op.matchReasons?.[0] ?? op.tagline}</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <button onClick={() => router.push(`/operators/${slug}`)}
                    className="flex-1 py-3 rounded-xl text-sm font-bold transition hover:brightness-105"
                    style={{ background: colors.primary, color: "#fff", boxShadow: `0 8px 20px ${colors.primary}33` }}>
                    View Full Analysis
                  </button>
                  <button onClick={() => setLead(op.name)}
                    className="flex-1 py-3 rounded-xl text-sm font-bold transition hover:bg-black/[0.02]"
                    style={{ background: "transparent", color: colors.secondary, border: `1.5px solid ${colors.secondary}` }}>
                    Contact Operator
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. OTHER OPERATORS TO CONSIDER */}
        {others.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-5" style={{ color: colors.textMain, fontFamily: "'Georgia', serif" }}>Other Operators to Consider</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {others.map((op) => {
                const sc = scoreFor(op);
                return (
                  <div key={op.id} className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition hover:-translate-y-0.5"
                    style={{ background: "#FFFFFF", border: `1px solid ${colors.border}`, boxShadow: colors.shadowSm }}
                    onClick={() => router.push(`/operators/${operatorSlug(op.name)}`)}>
                    <div className="flex items-center justify-center flex-shrink-0" style={{
                      width: "44px", height: "44px", borderRadius: "50%", background: colors.primary, color: "#fff",
                      fontWeight: 700, fontSize: "13px",
                    }}>{initialsOf(op.name)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate" style={{ color: colors.textMain }}>{op.name}</p>
                      <div className="flex gap-4 mt-1">
                        <span className="text-xs" style={{ color: colors.textMuted }}>Owner <b style={{ color: colors.textMain }}>{sc.owner}</b></span>
                        <span className="text-xs" style={{ color: colors.textMuted }}>Guest <b style={{ color: colors.textMain }}>{sc.guest}</b></span>
                      </div>
                      <span className="text-xs font-semibold mt-1.5 inline-block" style={{ color: colors.secondary }}>View Analysis →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. NEW & EMERGING OPERATORS */}
        {emerging.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-1" style={{ color: colors.textMain, fontFamily: "'Georgia', serif" }}>New & Emerging Operators</h3>
            <p className="text-sm mb-5" style={{ color: colors.textMuted }}>Promising boutique operators making an impact in Dubai.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {emerging.map((op) => (
                <div key={op.id} className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition hover:-translate-y-0.5"
                  style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, boxShadow: colors.shadowSm }}
                  onClick={() => router.push(`/operators/${operatorSlug(op.name)}`)}>
                  <div className="flex items-center justify-center flex-shrink-0" style={{
                    width: "44px", height: "44px", borderRadius: "50%", background: `${colors.secondary}1A`, color: colors.secondary,
                    fontWeight: 700, fontSize: "13px", border: `1px solid ${colors.secondary}40`,
                  }}>{initialsOf(op.name)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold truncate" style={{ color: colors.textMain }}>{op.name}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1" style={{ background: `${colors.secondary}14`, color: colors.secondary }}>Emerging Operator</span>
                    <p className="text-xs mt-1.5 truncate" style={{ color: colors.textMuted }}>{op.specialization}</p>
                    <span className="text-xs font-semibold mt-1.5 inline-block" style={{ color: colors.secondary }}>View Analysis →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Step: Furnishing (if unfurnished) — preserved */}
        {input.furnished === "Unfurnished" && (
          <div className="rounded-3xl p-8" style={{ background: `linear-gradient(135deg, ${colors.bgSection}, ${colors.bgMain})`, border: `1px solid ${colors.border}` }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: colors.secondary }}>Next Step</p>
            <h3 className="text-2xl font-bold mb-2" style={{ color: colors.textMain, fontFamily: "'Georgia', serif" }}>Furnishing Packages</h3>
            <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
              Your property is unfurnished. Choose your furnishing path: DIY with DET compliance, professional interior design, or have your operator handle it.
            </p>
            <button onClick={handleGoToFurnishing}
              className="py-3 px-7 rounded-xl text-sm font-bold transition hover:brightness-105"
              style={{ background: colors.primary, color: "#fff", boxShadow: `0 8px 20px ${colors.primary}33` }}>
              Explore Furnishing Options →
            </button>
          </div>
        )}

        {/* 6. HOW GROUNDWORKS RANKS OPERATORS */}
        <div className="rounded-3xl px-7 py-7" style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, boxShadow: colors.shadowSm }}>
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_1fr] gap-6 items-start">
            <h3 className="text-lg font-bold md:pr-6 md:border-r" style={{ color: colors.textMain, fontFamily: "'Georgia', serif", borderColor: colors.border }}>How GroundWorks Ranks Operators</h3>
            {[
              { t: "Owner Score", d: "Measures potential revenue, fees, transparency, communication, and owner experience.", icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.2" stroke={colors.primary} strokeWidth="1.3"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" stroke={colors.primary} strokeWidth="1.3" strokeLinecap="round"/></svg>
              ) },
              { t: "Guest Score", d: "Measures guest satisfaction, reviews, quality, and service performance.", icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="2.6" stroke={colors.secondary} strokeWidth="1.3"/><circle cx="16.5" cy="10" r="2" stroke={colors.secondary} strokeWidth="1.3"/><path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke={colors.secondary} strokeWidth="1.3" strokeLinecap="round"/><path d="M15 14c2.2 0 4 1.8 4 4" stroke={colors.secondary} strokeWidth="1.3" strokeLinecap="round"/></svg>
              ) },
              { t: "Market Fit", d: "Assesses alignment with your property, location, and target guest profile.", icon: (
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
            Operator ratings and reviews sourced from Google, Airbnb, Booking.com, Vrbo and Trustpilot. Match scores are calculated based on property type, community, tier, and platform coverage. Data updated quarterly.
          </p>
        </div>
      </div>

      <LeadModal open={!!lead} target={lead ?? ""} targetType="operator" property={propertyCtx} onClose={() => setLead(null)} />
    </div>
  );
}

export default function OperatorsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.bgMain }}>
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 animate-spin mx-auto mb-4"
            style={{ borderColor: colors.primary, borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: colors.textMuted }}>Finding your best operator matches...</p>
        </div>
      </div>
    }>
      <OperatorsContent />
    </Suspense>
  );
}
