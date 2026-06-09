"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { runEstimator, rankOperators, fmt, UnitSize, UnitType, OCCStrategy, ViewType, FurnishedStatus, Operator } from "@/lib/estimator";
import { UPCOMING_OPERATORS, UpcomingOperator } from "@/lib/furnishing";
import { filterOperatorsByLocation, filterOperatorsByTier, filterOperatorsByBedroomType, parseYearsInBusiness, parseCommission } from "@/lib/operators-data";
import { colors } from "@/lib/colors";
import GroundWorksLogo from "@/components/GroundWorksLogo";
import { FilterPanel, FilterState } from "@/components/FilterPanel";

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

// NEW: Tier Badge Component
function TierBadge({ tier }: { tier?: string }) {
  if (!tier) return null;

  let bgColor = colors.border;
  let textColor = colors.textMain;
  let displayText = "Tier 4";

  if (tier.includes("Tier 1") || tier.includes("Institutional")) {
    bgColor = "#1B5E4A";
    textColor = "#FFFFFF";
    displayText = "Tier 1: Institutional Leader";
  } else if (tier.includes("Tier 2") || tier.includes("Premium")) {
    bgColor = "#B88A44";
    textColor = "#FFFFFF";
    displayText = "Tier 2: Premium Partner";
  } else if (tier.includes("Tier 3") || tier.includes("Boutique")) {
    bgColor = "#4A7A68";
    textColor = "#FFFFFF";
    displayText = "Tier 3: Specialist";
  }

  return (
    <div style={{
      position: "absolute",
      top: "16px",
      right: "16px",
      background: bgColor,
      color: textColor,
      padding: "8px 16px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      boxShadow: `0 4px 12px rgba(0,0,0,0.1)`,
      zIndex: 10
    }}>
      {displayText}
    </div>
  );
}

// NEW: Portfolio Intelligence Component
function PortfolioIntelligence({ op }: { op: Operator }) {
  const portfolioValue = op.portfolioValue ? op.portfolioValue.replace(/^\D+/, "AED ").split("+")[0] + "+" : "N/A";
  const yearsInBusiness = op.yearsInBusiness || "5";
  const portfolio = op.portfolio;

  return (
    <div className="grid grid-cols-3 gap-4 p-4 rounded-xl" style={{ background: colors.bgMain, border: "1px solid " + colors.border }}>
      <div className="text-center">
        <div style={{ fontSize: "20px", marginBottom: "4px", color: colors.primary }}>📦</div>
        <p className="text-xs" style={{ color: colors.textMuted }}>Portfolio</p>
        <p className="text-sm font-bold mt-1" style={{ color: colors.textMain }}>{portfolio}+ Units</p>
      </div>
      <div className="text-center">
        <div style={{ fontSize: "20px", marginBottom: "4px", color: colors.secondary }}>💰</div>
        <p className="text-xs" style={{ color: colors.textMuted }}>Est. Value</p>
        <p className="text-sm font-bold mt-1" style={{ color: colors.textMain }}>{portfolioValue}</p>
      </div>
      <div className="text-center">
        <div style={{ fontSize: "20px", marginBottom: "4px", color: "#8B6F3F" }}>📅</div>
        <p className="text-xs" style={{ color: colors.textMuted }}>Experience</p>
        <p className="text-sm font-bold mt-1" style={{ color: colors.textMain }}>{yearsInBusiness} Yrs</p>
      </div>
    </div>
  );
}

// NEW: Strength Tags Component
function StrengthTags({ tags }: { tags?: string[] }) {
  if (!tags || tags.length === 0) return null;

  const displayTags = tags.slice(0, 5);
  const hasMore = tags.length > 5;

  return (
    <div>
      <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: colors.primary, letterSpacing: "0.1em" }}>Key Strengths</p>
      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag, idx) => (
          <span key={idx}
            className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:shadow-sm"
            style={{
              background: "rgba(27, 94, 74, 0.15)",
              color: colors.primary,
              border: "1px solid rgba(27, 94, 74, 0.3)",
              backdropFilter: "blur(10px)"
            }}>
            {tag}
          </span>
        ))}
        {hasMore && (
          <span className="text-xs px-3 py-1.5 rounded-full font-medium"
            style={{
              background: "rgba(107, 107, 107, 0.2)",
              color: colors.textMuted,
              border: "1px solid " + colors.border
            }}>
            +{tags.length - 5} more
          </span>
        )}
      </div>
    </div>
  );
}

// NEW: Expertise Markers Component
function ExpertiseMarkers({ op }: { op: Operator }) {
  const bedroomTypes = op.optimalBedroomTypes && op.optimalBedroomTypes.length > 0
    ? op.optimalBedroomTypes.slice(0, 3).join(", ")
    : "Studio, 1BR, 2BR";

  const locations = op.communities && op.communities.length > 0
    ? op.communities.slice(0, 2).join(", ")
    : "Dubai Marina, Downtown";

  const commissionRange = `${op.commission[0]}%–${op.commission[1]}%`;
  const payoutDay = op.payoutCycleDay || "15th of each month";

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: colors.primary, letterSpacing: "0.1em" }}>Expertise Markers</p>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span style={{ fontSize: "16px", flexShrink: 0 }}>🏠</span>
          <div>
            <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Specializes in</p>
            <p className="text-sm font-medium" style={{ color: colors.textMain }}>{bedroomTypes}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span style={{ fontSize: "16px", flexShrink: 0 }}>📍</span>
          <div>
            <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Preferred Locations</p>
            <p className="text-sm font-medium" style={{ color: colors.textMain }}>{locations}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span style={{ fontSize: "16px", flexShrink: 0 }}>💳</span>
          <div>
            <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Commission</p>
            <p className="text-sm font-medium" style={{ color: colors.textMain }}>{commissionRange}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span style={{ fontSize: "16px", flexShrink: 0 }}>📊</span>
          <div>
            <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Payout Cycle</p>
            <p className="text-sm font-medium" style={{ color: colors.textMain }}>{payoutDay}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// NEW: Credibility Signals Component
function CredibilitySignals({ op }: { op: Operator }) {
  const years = parseInt(op.yearsInBusiness?.match(/\d+/)?.[0] || "0") || (new Date().getFullYear() - op.founded);
  const yearsProgress = Math.min((years / 10) * 100, 100);

  // Determine portfolio size category
  let portfolioCategory = "S";
  if (op.portfolio >= 1000) portfolioCategory = "XL";
  else if (op.portfolio >= 500) portfolioCategory = "L";
  else if (op.portfolio >= 200) portfolioCategory = "M";

  // Calculate trust score
  const tierMultiplier = op.tier?.includes("Tier 1") ? 1 : op.tier?.includes("Tier 2") ? 0.9 : 0.8;
  const baseScore = 75;
  const yearsBonus = Math.min(years * 2, 15);
  const portfolioBonus = (op.portfolio / 100) * 0.5;
  const trustScore = Math.round((baseScore + yearsBonus + portfolioBonus) * tierMultiplier);

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: colors.primary, letterSpacing: "0.1em" }}>Credibility Signals</p>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Years Operating</p>
            <p className="text-xs font-bold" style={{ color: colors.textMain }}>{years}+ Years</p>
          </div>
          <div style={{
            width: "100%",
            height: "6px",
            background: colors.border,
            borderRadius: "3px",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${yearsProgress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #1B5E4A, #2F7D63)",
              transition: "width 0.3s ease"
            }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Portfolio Scale</p>
            <p className="text-xs font-bold" style={{ color: colors.secondary }}>Size {portfolioCategory}</p>
          </div>
          <div className="flex gap-2">
            {["S", "M", "L", "XL"].map(size => (
              <div key={size}
                style={{
                  flex: 1,
                  height: "8px",
                  background: portfolioCategory === size ? colors.secondary : colors.border,
                  borderRadius: "4px",
                  transition: "all 0.3s ease"
                }} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Trust Score</p>
            <p className="text-sm font-bold" style={{ color: colors.primary }}>{trustScore}/100</p>
          </div>
          <div style={{
            width: "100%",
            height: "6px",
            background: colors.border,
            borderRadius: "3px",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${trustScore}%`,
              height: "100%",
              background: "linear-gradient(90deg, #B88A44, #D4AF6A)",
              transition: "width 0.3s ease"
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Boutique Operator Card - Compact version for emerging operators
function BoutiqueOperatorCard({ op, rank }: { op: Operator & { matchScore: number; matchReasons: string[] }; rank: number }) {
  return (
    <div className="rounded-2xl overflow-hidden relative"
      style={{ background: colors.bgSection, border: "1px solid " + colors.border, boxShadow: colors.shadowSm }}>

      {/* Tier Badge - Top Right */}
      <TierBadge tier={op.tier} />

      {/* Compact Company Header */}
      <div className="p-6" style={{
        background: `linear-gradient(135deg, ${colors.bgMain} 0%, ${colors.bgSection} 100%)`,
        borderBottom: "1px solid " + colors.border,
      }}>
        {/* Logo & Name Together */}
        <div className="flex items-start gap-4 mb-4">
          <div style={{
            width: "60px",
            height: "60px",
            background: "#FFFFFF",
            borderRadius: "12px",
            border: "1px solid " + colors.border,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
          }}>
            <div style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: colors.primary,
            }}>
              {op.name.split(" ").map(w => w[0]).join("").substring(0, 2)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-bold" style={{ color: colors.textMain }}>{op.name}</h4>
            <p className="text-xs truncate" style={{ color: colors.textMuted }}>{op.tagline}</p>
            {op.website && (
              <a href={`https://${op.website}`} target="_blank" rel="noopener noreferrer"
                className="text-xs transition hover:opacity-80 inline-block mt-1"
                style={{ color: colors.primary }}>
                🌐 Website
              </a>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid " + colors.border }}>
          <span style={{ fontSize: "14px", fontWeight: "bold", color: colors.primary }}>{op.googleRating}</span>
          <Stars rating={op.googleRating} />
          <span className="text-xs" style={{ color: colors.textLight }}>({op.googleReviewCount})</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Compact Portfolio + Experience */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg p-3" style={{ background: colors.bgMain, border: "1px solid " + colors.border }}>
            <p className="text-xs mb-1" style={{ color: colors.textMuted }}>Portfolio</p>
            <p className="text-sm font-bold" style={{ color: colors.primary }}>{op.portfolio}+ Units</p>
          </div>
          <div className="rounded-lg p-3" style={{ background: colors.bgMain, border: "1px solid " + colors.border }}>
            <p className="text-xs mb-1" style={{ color: colors.textMuted }}>Experience</p>
            <p className="text-sm font-bold" style={{ color: colors.primary }}>{op.yearsInBusiness || "5"} Yrs</p>
          </div>
        </div>

        {/* Match Reasons - compact */}
        {op.matchReasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {op.matchReasons.map(r => (
              <span key={r} className="text-xs px-2.5 py-1 rounded-md font-medium"
                style={{ background: colors.bgMain, border: "1px solid " + colors.border, color: colors.primary }}>
                {r}
              </span>
            ))}
          </div>
        )}

        {/* Compact Expertise */}
        {op.strengthsTags && op.strengthsTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {op.strengthsTags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: "rgba(27, 94, 74, 0.15)",
                  color: colors.primary,
                  border: "1px solid rgba(27, 94, 74, 0.3)"
                }}>
                {tag}
              </span>
            ))}
            {op.strengthsTags.length > 3 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: "rgba(107, 107, 107, 0.2)", color: colors.textMuted }}>
                +{op.strengthsTags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Compact Contact */}
        <div className="space-y-2 pt-2 border-t" style={{ borderColor: colors.border }}>
          {op.phone && (
            <div className="flex items-center gap-2 text-xs">
              <span style={{ fontSize: "12px" }}>📱</span>
              <a href={`tel:${op.phone}`} className="transition hover:opacity-70" style={{ color: colors.textMain }}>
                {op.phone}
              </a>
            </div>
          )}
          {op.email && (
            <div className="flex items-center gap-2 text-xs">
              <span style={{ fontSize: "12px" }}>✉️</span>
              <a href={`mailto:${op.email}`} className="transition hover:opacity-70 truncate" style={{ color: colors.textMain }}>
                {op.email}
              </a>
            </div>
          )}
        </div>

        {/* Commission Info */}
        <div className="flex items-center justify-between pt-3 text-xs" style={{ borderTop: "1px solid " + colors.border, color: colors.textMuted }}>
          <span>Commission: {op.commission[0]}–{op.commission[1]}%</span>
          <span>Onboard: {op.onboardingWeeks}w</span>
        </div>

        {/* Connect CTA */}
        <button
          className="w-full py-2 rounded-lg text-xs font-bold transition-all hover:brightness-105"
          style={{
            background: "linear-gradient(135deg, " + colors.primary + ", #2F7D63)",
            color: "#FFFFFF",
            marginTop: "6px"
          }}>
          Connect with {op.name.split(" ")[0]} →
        </button>
      </div>
    </div>
  );
}

function OperatorCard({ op, rank }: { op: Operator & { matchScore: number; matchReasons: string[] }; rank: number }) {
  const isBest = rank <= 1;

  return (
    <div className="rounded-3xl overflow-hidden relative"
      style={{ background: colors.bgSection, border: "1px solid " + colors.border, boxShadow: `${colors.shadowSm}, ${colors.shadowMd}` }}>

      {/* ENHANCED: Tier Badge - Top Right */}
      <TierBadge tier={op.tier} />

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

        {/* ENHANCED: Portfolio Intelligence Section */}
        <PortfolioIntelligence op={op} />

        {/* ENHANCED: Strength Tags Section */}
        <StrengthTags tags={op.strengthsTags} />

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

        {/* ENHANCED: Expertise Markers Section */}
        <ExpertiseMarkers op={op} />

        {/* ENHANCED: Credibility Signals Section */}
        <CredibilitySignals op={op} />

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

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-16">

        {/* Hero */}
        <div className="rounded-2xl p-8" style={{ background: `linear-gradient(135deg, ${colors.bgSection} 0%, ${colors.bgSection} 100%)`, border: "1px solid " + colors.primary }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: colors.primary }}>Part 2 of 3 · Curated Operator Marketplace</p>
          <h1 className="text-4xl font-bold mb-3" style={{ color: colors.textMain }}>Your Operator Match</h1>
          <p className="text-sm mb-6 max-w-2xl" style={{ color: colors.textMuted }}>
            Handpicked operators for <span style={{ color: colors.textMain }}>{result.buildingInfo?.community ?? result.buildingName}</span> — {input.unitSize} {input.unitType} on Floor {input.floor}. Ranked by revenue potential, market reputation, and operational excellence.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="rounded-xl p-4" style={{ background: colors.bgMain, border: "1px solid " + colors.border }}>
              <p className="text-xs mb-1 font-medium" style={{ color: colors.textMuted }}>Your STR Net/Year</p>
              <p className="text-2xl font-bold" style={{ color: colors.primary }}>AED {fmt(result.annualNetToLandlord)}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: colors.bgMain, border: "1px solid " + colors.border }}>
              <p className="text-xs mb-1 font-medium" style={{ color: colors.textMuted }}>Avg Occupancy</p>
              <p className="text-2xl font-bold" style={{ color: colors.secondary }}>{(result.avgOccupancy * 100).toFixed(0)}%</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: colors.bgMain, border: "1px solid " + colors.border }}>
              <p className="text-xs mb-1 font-medium" style={{ color: colors.textMuted }}>Avg Daily Rate</p>
              <p className="text-2xl font-bold" style={{ color: colors.secondary }}>AED {fmt(result.avgADR)}</p>
            </div>
          </div>
        </div>

        {/* SECTION 1: TOP 5 RECOMMENDED OPERATORS */}
        <div>
          <div className="mb-8">
            <div className="flex items-baseline gap-3 mb-2">
              <h2 className="text-3xl font-bold" style={{ color: colors.textMain }}>Top 5 Recommended Operators</h2>
              <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: colors.primary + "15", color: colors.primary }}>Premium Selection</span>
            </div>
            <p className="text-sm max-w-2xl" style={{ color: colors.textMuted }}>
              Institutional leaders and premium operators with proven track records. These operators represent the strongest overall match based on estimated revenue, occupancy potential, market reputation, guest satisfaction, and operational capability.
            </p>
          </div>

          <div className="space-y-6">
            {ranked.slice(0, 5).map((op, i) => (
              <OperatorCard key={op.id} op={op} rank={i} />
            ))}
          </div>
        </div>

        {/* SECTION 2: EMERGING & BOUTIQUE OPERATORS */}
        {ranked.length > 5 && (
          <div>
            <div className="mb-8">
              <div className="flex items-baseline gap-3 mb-2">
                <h2 className="text-3xl font-bold" style={{ color: colors.textMain }}>Emerging & Boutique Operators</h2>
                <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: colors.secondary + "15", color: colors.secondary }}>Growing Market Presence</span>
              </div>
              <p className="text-sm max-w-2xl" style={{ color: colors.textMuted }}>
                Specialized operators with growing market presence, unique management approaches, and niche expertise. Often offering competitive rates and personalized service for property owners seeking differentiated solutions.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {ranked.slice(5).map((op, i) => (
                <BoutiqueOperatorCard key={op.id} op={op} rank={i + 5} />
              ))}
            </div>
          </div>
        )}

        {/* New & Upcoming Operators Section */}
        {UPCOMING_OPERATORS.length > 0 && (
          <>
            <div className="mt-8">
              <div className="mb-8">
                <div className="flex items-baseline gap-3 mb-2">
                  <h2 className="text-3xl font-bold" style={{ color: colors.textMain }}>Upcoming & New Entrants</h2>
                  <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: colors.primary + "22", color: colors.primary }}>Future Opportunities</span>
                </div>
                <p className="text-sm max-w-2xl" style={{ color: colors.textMuted }}>
                  Early-stage operators entering the Dubai market with innovative approaches and competitive positioning.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {UPCOMING_OPERATORS.map((op) => (
                <UpcomingOperatorCard key={op.id} op={op} />
              ))}
            </div>
          </>
        )}

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
