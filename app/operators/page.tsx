"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { runEstimator, rankOperators, fmt, UnitSize, UnitType, OCCStrategy, ViewType, FurnishedStatus, Operator } from "@/lib/estimator";
import { UPCOMING_OPERATORS, UpcomingOperator } from "@/lib/furnishing";
import { filterOperatorsByLocation, filterOperatorsByTier } from "@/lib/operators-data";
import { colors } from "@/lib/colors";
import GroundWorksLogo from "@/components/GroundWorksLogo";

const STAR_COLOR = colors.primary;

function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ color: i < Math.round(rating) ? STAR_COLOR : colors.textLight, fontSize: "11px" }}>&#9733;</span>
      ))}
    </span>
  );
}

function OperatorCard({ op, rank }: { op: Operator & { matchScore: number; matchReasons: string[] }; rank: number }) {
  const isBest = rank <= 1;

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{ background: colors.bgSection, border: "1px solid " + colors.border, boxShadow: `${colors.shadowSm}, ${colors.shadowMd}` }}>

      {/* Premium Company Logo Section */}
      <div className="p-8" style={{
        background: `linear-gradient(135deg, ${colors.bgMain} 0%, ${colors.bgSection} 100%)`,
        borderBottom: "1px solid " + colors.border,
        textAlign: "center"
      }}>
        {/* Logo Container */}
        <div className="flex items-center justify-center mb-6">
          <div style={{
            width: "120px",
            height: "120px",
            background: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid " + colors.border,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
          }}>
            {/* Company Logo Placeholder - Using brand color initials */}
            <div style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: colors.primary,
              textAlign: "center"
            }}>
              {op.name.split(" ").map(w => w[0]).join("").substring(0, 2)}
            </div>
          </div>
        </div>

        {/* Company Name & Tagline */}
        <h3 className="text-2xl font-bold mb-2" style={{ color: colors.textMain }}>{op.name}</h3>
        <p className="text-sm mb-4" style={{ color: colors.textMuted }}>{op.tagline}</p>

        {/* Website Link */}
        {op.website && (
          <a href={`https://${op.website}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium transition-all hover:opacity-80"
            style={{ color: colors.primary }}>
            🌐 {op.website}
          </a>
        )}

        {/* Trust Indicators */}
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {op.founded && (
            <span className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: colors.primary + "15", color: colors.primary }}>
              Established {op.founded}
            </span>
          )}
          <span className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: colors.primary + "15", color: colors.primary }}>
            Licensed Operator
          </span>
          <span className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: colors.primary + "15", color: colors.primary }}>
            Dubai-Based
          </span>
        </div>

        {/* Ratings */}
        <div className="flex items-center justify-center gap-3 mt-6 pt-6" style={{ borderTop: "1px solid " + colors.border }}>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: colors.primary }}>{op.googleRating}</div>
            <Stars rating={op.googleRating} />
            <p className="text-xs mt-1" style={{ color: colors.textLight }}>{op.googleReviewCount} Google reviews</p>
          </div>
        </div>

        {/* Match Reasons */}
        {op.matchReasons.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 justify-center">
            {op.matchReasons.map(r => (
              <span key={r} className="text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ background: isBest ? "#C9A84C22" : colors.bgSection, border: "1px solid " + colors.border, color: isBest ? colors.secondary : colors.primary }}>
                {r}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="p-8 space-y-8">

        {/* Contact Information */}
        <div className="rounded-2xl p-6" style={{ background: colors.bgMain, border: "1px solid " + colors.border }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: colors.primary, letterSpacing: "0.1em" }}>Contact Information</p>
          <div className="space-y-3">
            {op.phone && (
              <div className="flex items-center gap-3">
                <span style={{ color: colors.primary, fontSize: "16px" }}>📱</span>
                <a href={`tel:${op.phone}`} className="text-sm transition hover:opacity-80" style={{ color: colors.textMain }}>
                  {op.phone}
                </a>
              </div>
            )}
            {op.email && (
              <div className="flex items-center gap-3">
                <span style={{ color: colors.primary, fontSize: "16px" }}>✉️</span>
                <a href={`mailto:${op.email}`} className="text-sm transition hover:opacity-80" style={{ color: colors.textMain }}>
                  {op.email}
                </a>
              </div>
            )}
            {op.website && (
              <div className="flex items-center gap-3">
                <span style={{ color: colors.primary, fontSize: "16px" }}>🌐</span>
                <a href={`https://${op.website}`} target="_blank" rel="noopener noreferrer" className="text-sm transition hover:opacity-80" style={{ color: colors.textMain }}>
                  {op.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Commission", value: `${op.commission[0]}–${op.commission[1]}%` },
            { label: "Onboarding", value: `${op.onboardingWeeks} week${op.onboardingWeeks > 1 ? "s" : ""}` },
            { label: "Portfolio", value: `${op.portfolio}+ units` },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 text-center"
              style={{ background: colors.bgMain, border: "1px solid " + colors.border }}>
              <p className="text-xs mb-1" style={{ color: colors.textMuted }}>{s.label}</p>
              <p className="text-sm font-bold" style={{ color: colors.textMain }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* OTA presence */}
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: colors.primary, letterSpacing: "0.1em" }}>OTA Platform Coverage</p>
          <div className="flex flex-wrap gap-2">
            {op.ota.map(o => (
              <div key={o.platform}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: o.listed ? colors.primary + "15" : colors.bgMain,
                  border: `1px solid ${o.listed ? colors.primary : colors.border}`,
                  color: o.listed ? colors.primary : colors.textLight,
                }}>
                <span>{o.platform}</span>
                {o.listed && o.rating && (
                  <span style={{ color: STAR_COLOR, fontWeight: 600 }}>★{o.rating}</span>
                )}
                {!o.listed && <span style={{ fontSize: "11px" }}>Not listed</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase mb-2" style={{ color: colors.textLight }}>Pros</p>
            <ul className="space-y-1.5">
              {op.pros.map(p => (
                <li key={p} className="flex items-start gap-2 text-xs" style={{ color: colors.textLight }}>
                  <span style={{ color: colors.success, marginTop: "1px", flexShrink: 0 }}>+</span>{p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase mb-2" style={{ color: colors.textLight }}>Cons</p>
            <ul className="space-y-1.5">
              {op.cons.map(c => (
                <li key={c} className="flex items-start gap-2 text-xs" style={{ color: colors.textMuted }}>
                  <span style={{ color: "#884444", marginTop: "1px", flexShrink: 0 }}>−</span>{c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent reviews */}
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase mb-3" style={{ color: colors.textLight }}>Recent Reviews</p>
          <div className="space-y-3">
            {op.recentReviews.map((r, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: colors.textMain }}>{r.author}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: colors.bgSection, color: colors.textMuted }}>{r.source}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Stars rating={r.rating} max={r.source === "Booking.com" ? 10 : 5} />
                    <span className="text-xs" style={{ color: colors.textMuted }}>{r.date}</span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: colors.textMuted }}>&ldquo;{r.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop: "1px solid " + colors.border }}>
          {op.website && (
            <a href={`https://${op.website}`} target="_blank" rel="noopener noreferrer"
              className="py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 text-center"
              style={{
                background: "transparent",
                color: colors.primary,
                border: "1px solid " + colors.primary,
                transitionDuration: "250ms"
              }}>
              Visit Website →
            </a>
          )}
          <button className={`py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 hover:brightness-103 ${!op.website ? 'col-span-2' : ''}`}
            style={{
              background: isBest ? "linear-gradient(135deg, #B88A44 0%, #D4AF6A 100%)" : "linear-gradient(135deg, #1B5E4A 0%, #2F7D63 100%)",
              color: "#FFF",
              border: "none",
              transitionDuration: "250ms",
              boxShadow: isBest ? `0 8px 20px rgba(184, 138, 68, 0.3)` : `0 8px 20px rgba(27, 94, 74, 0.3)`
            }}>
            {isBest ? `${rank === 0 ? "Contact" : "Get Quote"} →` : "Learn More →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UpcomingOperatorCard({ op }: { op: UpcomingOperator }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>

      {/* Header */}
      <div className="p-6" style={{ borderBottom: "1px solid " + colors.primary }}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="inline-block text-xs px-2.5 py-1 rounded-full font-semibold mb-2"
              style={{ background: colors.bgMain, color: colors.primary, border: "1px solid " + colors.primary }}>
              New & Emerging
            </span>
            <h3 className="text-lg font-bold" style={{ color: colors.textMain }}>{op.name}</h3>
            <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{op.specialization}</p>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <div className="text-2xl font-bold" style={{ color: colors.primary }}>{op.googleRating}</div>
            <Stars rating={op.googleRating} />
            <p className="text-xs mt-0.5" style={{ color: colors.textLight }}>{op.googleReviewCount} Google reviews</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">

        {/* Description */}
        <div>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            {op.description}
          </p>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Founded", value: op.founded },
            { label: "Portfolio", value: `${op.portfolio}+ units` },
            { label: "Coverage", value: op.communities.length + " areas" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center"
              style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
              <p className="text-xs mb-1" style={{ color: colors.textMuted }}>{s.label}</p>
              <p className="text-sm font-bold" style={{ color: colors.textMain }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Key Strengths */}
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase mb-3" style={{ color: colors.textLight }}>Key Strengths</p>
          <ul className="space-y-1.5">
            {op.pros.map(p => (
              <li key={p} className="flex items-start gap-2 text-xs" style={{ color: colors.textLight }}>
                <span style={{ color: colors.success, marginTop: "1px", flexShrink: 0 }}>+</span>{p}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <button className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 hover:brightness-103"
          style={{
            background: "transparent",
            color: colors.primary,
            border: "1px solid " + colors.primary,
            transitionDuration: "250ms"
          }}>
          Learn More About {op.name} →
        </button>
      </div>
    </div>
  );
}

function OperatorsContent() {
  const params = useSearchParams();
  const router = useRouter();

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
  const ranked = rankOperators(result);

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

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, #FFFFFF 0%, ${colors.bgMain} 35%, ${colors.bgSection} 100%)` }}>

      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
        style={{ background: colors.bgMain + "ee", borderBottom: "1px solid " + colors.primary, backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-4">
          <button onClick={handleBack}
            className="text-xs px-3 py-1.5 rounded-lg transition hover:bg-white/10 font-medium"
            style={{ background: colors.bgSection, border: "1px solid #333", color: colors.primary }}>
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
            <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Operator Match</p>
            <p className="text-sm font-semibold" style={{ color: colors.textMain }}>{result.propertyName}</p>
          </div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full font-medium"
          style={{ background: "#C9A84C22", color: colors.primary, border: "1px solid #C9A84C44" }}>
          {input.unitSize} · {input.unitType}
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Hero */}
        <div className="rounded-2xl p-8" style={{ background: `linear-gradient(135deg, ${colors.bgSection} 0%, ${colors.bgSection} 100%)`, border: "1px solid " + colors.primary }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: colors.primary }}>Part 2 of 3 · Operator Match</p>
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textMain }}>Your Top 5 Operator Matches</h1>
          <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
            Based on your property in <span style={{ color: colors.textMain }}>{result.buildingInfo?.community ?? result.buildingName}</span> — {input.unitSize} {input.unitType} on Floor {input.floor} — here are the best operators ranked by fit, reviews, and market presence.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs mb-1" style={{ color: colors.textMuted }}>Your STR Net/Year</p>
              <p className="text-xl font-bold" style={{ color: colors.primary }}>AED {fmt(result.annualNetToLandlord)}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: colors.textMuted }}>Avg Occupancy</p>
              <p className="text-xl font-bold" style={{ color: colors.secondary }}>{(result.avgOccupancy * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: colors.textMuted }}>Avg Daily Rate</p>
              <p className="text-xl font-bold" style={{ color: colors.secondary }}>AED {fmt(result.avgADR)}</p>
            </div>
          </div>
        </div>

        {/* Operator cards */}
        {ranked.map((op, i) => (
          <OperatorCard key={op.id} op={op} rank={i} />
        ))}

        {/* New & Upcoming Operators Section */}
        <div className="rounded-2xl p-8 mt-12" style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: colors.primary }}>Alternative Options</p>
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.secondary }}>New & Upcoming Operators</h2>
          <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
            Consider these emerging operators with smaller portfolios but growing presence and specialized expertise. They often offer competitive rates and personalized service.
          </p>
        </div>

        <div className="space-y-6">
          {UPCOMING_OPERATORS.map((op) => (
            <UpcomingOperatorCard key={op.id} op={op} />
          ))}
        </div>

        {/* Next Step: Furnishing (if unfurnished) */}
        {input.furnished === "Unfurnished" && (
          <div className="rounded-2xl p-8" style={{ background: "linear-gradient(135deg, " + colors.bgSection + ", " + colors.bgMain + ")", border: "1px solid " + colors.primary }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: colors.primary }}>Next Step</p>
            <h3 className="text-2xl font-bold mb-2" style={{ color: colors.secondary }}>Furnishing Packages</h3>
            <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
              Your property is unfurnished. Choose your furnishing path: DIY with DET compliance, professional interior design, or have your operator handle it.
            </p>
            <button
              onClick={handleGoToFurnishing}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 hover:brightness-103"
              style={{
                background: "linear-gradient(135deg, #B88A44 0%, #D4AF6A 100%)",
                color: "#FFF",
                transitionDuration: "250ms",
                boxShadow: `0 8px 20px rgba(184, 138, 68, 0.3)`
              }}
            >
              Explore Furnishing Options →
            </button>
          </div>
        )}

        {/* Footer note */}
        <div className="text-center pb-10 space-y-2">
          <div className="flex items-center justify-center gap-1">
            <span className="text-sm font-bold" style={{ color: colors.textLight }}>Ground</span>
            <span className="text-sm font-bold" style={{ color: "#C9A84C66" }}>Works</span>
          </div>
          <p className="text-xs" style={{ color: colors.textLight }}>
            Operator ratings and reviews sourced from Google, Airbnb, Booking.com, Vrbo and Trustpilot. Match scores are calculated based on property type, community, tier, and platform coverage. Data updated quarterly.
          </p>
        </div>
      </div>
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
