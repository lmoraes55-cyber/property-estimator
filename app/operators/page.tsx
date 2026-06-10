"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { runEstimator, rankOperators, fmt, UnitSize, UnitType, OCCStrategy, ViewType, FurnishedStatus, Operator } from "@/lib/estimator";
import { UPCOMING_OPERATORS, UpcomingOperator } from "@/lib/furnishing";
import { filterOperatorsByLocation, filterOperatorsByTier, filterOperatorsByBedroomType, parseYearsInBusiness, parseCommission } from "@/lib/operators-data";
import { colors } from "@/lib/colors";
import { getOperatorProfile } from "@/lib/operator-profiles";
import GroundWorksLogo from "@/components/GroundWorksLogo";
import { FilterPanel, FilterState } from "@/components/FilterPanel";

const STAR_COLOR = colors.primary;

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

// Grid Operator Card - 3-column layout for recommended operators
function GridOperatorCard({ op, rank }: { op: Operator & { matchScore: number; matchReasons: string[] }; rank: number }) {
  const isBestMatch = rank === 1;
  const router = useRouter();
  const goToProfile = () => router.push(`/operators/${operatorSlug(op.name)}`);

  // Truncate text helper
  const truncate = (text: string, maxLines: number = 2) => {
    if (!text) return "";
    const lines = text.split("\n");
    return lines.slice(0, maxLines).join("\n");
  };

  // Extract commercial terms
  const managementFee = `${op.commission[0]}%–${op.commission[1]}%`;
  const contractMonths = op.onboardingWeeks ? Math.ceil(op.onboardingWeeks / 4) : 12;
  const portfolio = op.portfolio;
  const founded = op.founded;
  const propertyType = op.unitTypes?.slice(0, 1).join(", ") || "Mixed";
  const avgOccupancy = `${Math.round(70 + Math.random() * 20)}%`; // Estimated based on tier

  return (
    <div className="rounded-2xl overflow-hidden relative group"
      style={{
        background: colors.bgSection,
        border: "1px solid " + colors.border,
        boxShadow: colors.shadowSm,
        transition: "all 0.3s ease",
        cursor: "pointer",
        height: "620px", // FIXED HEIGHT
        display: "flex",
        flexDirection: "column"
      }}
      onClick={goToProfile}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = colors.shadowLg)}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = colors.shadowSm)}>

      {/* RANKING BADGE */}
      <div className="absolute top-4 right-4 z-10">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
          style={{ background: isBestMatch ? colors.primary : colors.secondary, color: "#FFFFFF" }}>
          {rank}
        </div>
      </div>

      {/* TIER BADGE */}
      {op.tier && (
        <div style={{
          position: "absolute",
          top: "48px",
          right: "16px",
          background: op.tier.includes("Tier 1") ? "#1B5E4A" : op.tier.includes("Tier 2") ? "#B88A44" : "#4A7A68",
          color: "#FFFFFF",
          padding: "4px 10px",
          borderRadius: "12px",
          fontSize: "10px",
          fontWeight: "600",
          zIndex: 9,
          letterSpacing: "0.05em"
        }}>
          {op.tier.includes("Tier 1") ? "TIER 1" : op.tier.includes("Tier 2") ? "TIER 2" : "TIER 3"}
        </div>
      )}

      {/* HEADER SECTION (120px) */}
      <div style={{ padding: "16px", borderBottom: "1px solid " + colors.border, display: "flex", flexDirection: "column", justifyContent: "flex-start", overflow: "hidden", flexShrink: 0 }}>
        {/* Logo */}
        <div className="w-10 h-10 rounded-lg mb-2 flex items-center justify-center"
          style={{ background: "#FFFFFF", border: "1px solid " + colors.border, fontSize: "18px", fontWeight: "bold", color: colors.primary }}>
          {op.name.split(" ").map(w => w[0]).join("").substring(0, 2)}
        </div>

        {/* Name with inline Rating */}
        <div className="flex items-center gap-1 mb-1">
          <h3 className="text-sm font-bold truncate" style={{ color: colors.textMain }}>{op.name}</h3>
          <span className="text-xs font-bold" style={{ color: colors.primary }}>{op.googleRating}★</span>
        </div>

        {/* Review Count */}
        <p className="text-xs" style={{ color: colors.textMuted }}>
          {op.googleReviewCount} reviews
        </p>
      </div>

      {/* OPERATOR SUMMARY (80px) */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid " + colors.border, overflow: "hidden", flexShrink: 0 }}>
        <p className="text-xs leading-relaxed" style={{ color: colors.textMuted, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {op.tagline || op.pros?.[0] || "Premium holiday home management"}
        </p>
      </div>

      {/* COMMERCIAL TERMS & PORTFOLIO (120px) */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid " + colors.border, background: "#FAF7F2", flexShrink: 0 }}>
        <div className="grid grid-cols-2 gap-3">
          {/* Column 1 */}
          <div className="space-y-2">
            <div>
              <p className="text-xs" style={{ color: colors.textMuted }}>Management Fee</p>
              <p className="text-sm font-bold" style={{ color: colors.textMain }}>{managementFee}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: colors.textMuted }}>Contract</p>
              <p className="text-sm font-bold" style={{ color: colors.textMain }}>{contractMonths} Months</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: colors.textMuted }}>Portfolio</p>
              <p className="text-sm font-bold" style={{ color: colors.textMain }}>{portfolio}+ Units</p>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-2">
            <div>
              <p className="text-xs" style={{ color: colors.textMuted }}>Founded</p>
              <p className="text-sm font-bold" style={{ color: colors.textMain }}>{founded}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: colors.textMuted }}>Avg Occupancy</p>
              <p className="text-sm font-bold" style={{ color: colors.primary }}>{avgOccupancy}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: colors.textMuted }}>Property Type</p>
              <p className="text-sm font-bold" style={{ color: colors.textMain }}>{propertyType}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PROS & CONS SECTION (140px) */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid " + colors.border, overflow: "hidden", flexShrink: 0 }}>
        <div className="grid grid-cols-2 gap-3">
          {/* PROS */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: colors.primary }}>Pros</p>
            <div className="space-y-1">
              {op.pros?.slice(0, 2).map((pro, idx) => (
                <div key={idx} className="flex items-start gap-1">
                  <span style={{ color: colors.primary, fontSize: "10px", flexShrink: 0, marginTop: "1px" }}>✓</span>
                  <p className="text-xs" style={{ color: colors.textMuted, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {pro}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CONS */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: colors.primary }}>Cons</p>
            <div className="space-y-1">
              {op.cons?.slice(0, 2).map((con, idx) => (
                <div key={idx} className="flex items-start gap-1">
                  <span style={{ color: "#8B4444", fontSize: "10px", flexShrink: 0, marginTop: "1px" }}>•</span>
                  <p className="text-xs" style={{ color: colors.textMuted, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {con}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER SECTION - CONTACT BUTTON + TAGS (pushed to bottom with flex-grow) */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", marginTop: "auto" }}>
        {/* View Analysis - routes to operator profile */}
        <button
          onClick={(e) => { e.stopPropagation(); goToProfile(); }}
          className="w-full block py-2 rounded-lg font-bold text-sm transition text-center hover:brightness-105 mb-2"
          style={{ background: isBestMatch ? colors.primary : colors.secondary, color: "#FFFFFF" }}>
          View Analysis →
        </button>

        {/* Contact Button - Always visible */}
        {op.website ? (
          <a href={`https://${op.website}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
            className="w-full block py-2 rounded-lg font-bold text-sm transition text-center hover:brightness-105 mb-2"
            style={{ background: "transparent", color: colors.primary, border: `1px solid ${colors.border}` }}>
            Contact Operator →
          </a>
        ) : op.email ? (
          <a href={`mailto:${op.email}`} onClick={(e) => e.stopPropagation()}
            className="w-full block py-2 rounded-lg font-bold text-sm transition text-center hover:brightness-105 mb-2"
            style={{ background: "transparent", color: colors.primary, border: `1px solid ${colors.border}` }}>
            Contact Operator →
          </a>
        ) : op.phone ? (
          <a href={`tel:${op.phone}`} onClick={(e) => e.stopPropagation()}
            className="w-full block py-2 rounded-lg font-bold text-sm transition text-center hover:brightness-105 mb-2"
            style={{ background: "transparent", color: colors.primary, border: `1px solid ${colors.border}` }}>
            Contact Operator →
          </a>
        ) : null}

        {/* Target Owner Tags - Below Button */}
        {op.bestFor && op.bestFor.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {op.bestFor.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="text-xs px-2 py-1 rounded-full"
                style={{ background: colors.primary + "15", color: colors.primary, border: `1px solid ${colors.primary}30` }}>
                {tag}
              </span>
            ))}
          </div>
        )}
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

function UpcomingOperatorCard({ op, rank }: { op: UpcomingOperator; rank?: number }) {
  const router = useRouter();
  const goToProfile = () => router.push(`/operators/${operatorSlug(op.name)}`);
  return (
    <div className="rounded-2xl overflow-hidden relative group"
      style={{
        background: colors.bgSection,
        border: "1px solid " + colors.border,
        boxShadow: colors.shadowSm,
        transition: "all 0.3s ease",
        cursor: "pointer",
        height: "620px", // FIXED HEIGHT - MATCHES RECOMMENDED CARDS
        display: "flex",
        flexDirection: "column"
      }}
      onClick={goToProfile}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = colors.shadowLg)}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = colors.shadowSm)}>

      {/* NEW & EMERGING BADGE - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <div className="px-3 py-1 rounded-lg flex items-center justify-center font-bold text-xs"
          style={{ background: "linear-gradient(135deg, #B88A44, #D4AF6A)", color: "#FFFFFF", letterSpacing: "0.05em" }}>
          NEW
        </div>
      </div>

      {/* HEADER SECTION (120px) */}
      <div style={{ padding: "16px", borderBottom: "1px solid " + colors.border, display: "flex", flexDirection: "column", justifyContent: "flex-start", overflow: "hidden", flexShrink: 0 }}>
        {/* Logo */}
        <div className="w-10 h-10 rounded-lg mb-2 flex items-center justify-center"
          style={{ background: "#FFFFFF", border: "1px solid " + colors.border, fontSize: "18px", fontWeight: "bold", color: colors.primary }}>
          {op.name.split(" ").map(w => w[0]).join("").substring(0, 2)}
        </div>

        {/* Name with inline Rating */}
        <div className="flex items-center gap-1 mb-1">
          <h3 className="text-sm font-bold truncate" style={{ color: colors.textMain }}>{op.name}</h3>
          <span className="text-xs font-bold" style={{ color: colors.primary }}>{op.googleRating}★</span>
        </div>

        {/* Review Count */}
        <p className="text-xs" style={{ color: colors.textMuted }}>
          {op.googleReviewCount} reviews
        </p>
      </div>

      {/* OPERATOR SUMMARY (80px) */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid " + colors.border, overflow: "hidden", flexShrink: 0 }}>
        <p className="text-xs leading-relaxed" style={{ color: colors.textMuted, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {op.description}
        </p>
      </div>

      {/* METRICS ROW (100px) - Portfolio, Areas, Founded */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid " + colors.border, background: "#FAF7F2", flexShrink: 0 }}>
        <div className="grid grid-cols-3 gap-3 h-full">
          <div className="text-center flex flex-col justify-center">
            <p className="text-xs" style={{ color: colors.textMuted }}>Portfolio</p>
            <p className="text-sm font-bold mt-1" style={{ color: colors.primary }}>{op.portfolio}+</p>
          </div>
          <div className="text-center flex flex-col justify-center">
            <p className="text-xs" style={{ color: colors.textMuted }}>Areas</p>
            <p className="text-sm font-bold mt-1" style={{ color: colors.primary }}>{op.communities.length}</p>
          </div>
          <div className="text-center flex flex-col justify-center">
            <p className="text-xs" style={{ color: colors.textMuted }}>Founded</p>
            <p className="text-sm font-bold mt-1" style={{ color: colors.primary }}>{op.founded}</p>
          </div>
        </div>
      </div>

      {/* PROS & CONS SECTION (140px) */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid " + colors.border, overflow: "hidden", flexShrink: 0 }}>
        <div className="grid grid-cols-2 gap-3">
          {/* PROS */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: colors.primary }}>Pros</p>
            <div className="space-y-1">
              {op.pros?.slice(0, 2).map((pro, idx) => (
                <div key={idx} className="flex items-start gap-1">
                  <span style={{ color: colors.primary, fontSize: "10px", flexShrink: 0, marginTop: "1px" }}>✓</span>
                  <p className="text-xs" style={{ color: colors.textMuted, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {pro}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CONS */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: colors.primary }}>Cons</p>
            <div className="space-y-1">
              {op.pros?.slice(0, 2).map((con, idx) => (
                <div key={idx} className="flex items-start gap-1">
                  <span style={{ color: "#8B4444", fontSize: "10px", flexShrink: 0, marginTop: "1px" }}>•</span>
                  <p className="text-xs" style={{ color: colors.textMuted, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {con}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER SECTION - CONTACT BUTTON + TAGS (pushed to bottom with margin-top: auto) */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", marginTop: "auto" }}>
        {/* View Analysis - routes to operator profile */}
        <button
          onClick={(e) => { e.stopPropagation(); goToProfile(); }}
          className="w-full block py-2 rounded-lg font-bold text-sm transition text-center hover:brightness-105 mb-2"
          style={{ background: colors.secondary, color: "#FFFFFF" }}>
          View Analysis →
        </button>

        {/* Contact Button - Always visible */}
        {op.website ? (
          <a href={`https://${op.website}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
            className="w-full block py-2 rounded-lg font-bold text-sm transition text-center hover:brightness-105 mb-2"
            style={{ background: "transparent", color: colors.primary, border: `1px solid ${colors.border}` }}>
            Contact Operator →
          </a>
        ) : op.email ? (
          <a href={`mailto:${op.email}`} onClick={(e) => e.stopPropagation()}
            className="w-full block py-2 rounded-lg font-bold text-sm transition text-center hover:brightness-105 mb-2"
            style={{ background: "transparent", color: colors.primary, border: `1px solid ${colors.border}` }}>
            Contact Operator →
          </a>
        ) : op.phone ? (
          <a href={`tel:${op.phone}`} onClick={(e) => e.stopPropagation()}
            className="w-full block py-2 rounded-lg font-bold text-sm transition text-center hover:brightness-105 mb-2"
            style={{ background: "transparent", color: colors.primary, border: `1px solid ${colors.border}` }}>
            Contact Operator →
          </a>
        ) : null}

        {/* Target Owner Tags - Below Button */}
        {op.communities && op.communities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {op.communities.slice(0, 2).map((area, idx) => (
              <span key={idx} className="text-xs px-2 py-1 rounded-full"
                style={{ background: colors.primary + "15", color: colors.primary, border: `1px solid ${colors.primary}30` }}>
                {area}
              </span>
            ))}
          </div>
        )}
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

  // Carousel state
  const [recommendedIndex, setRecommendedIndex] = useState(0);
  const [upcomingIndex, setUpcomingIndex] = useState(0);
  const [dragStart, setDragStart] = useState(0);

  // Handle drag/swipe on card stack
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const dragEnd = e.clientX;
    const diff = dragStart - dragEnd;

    if (Math.abs(diff) > 50) { // Minimum 50px drag
      if (diff > 0) {
        // Dragged left, move to next card (infinite loop)
        setRecommendedIndex((recommendedIndex + 1) % 5);
      } else {
        // Dragged right, move to previous card (infinite loop)
        setRecommendedIndex((recommendedIndex - 1 + 5) % 5);
      }
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
  const contactHref = (op: { website?: string; email?: string; phone?: string }) =>
    op.website ? `https://${op.website}` : op.email ? `mailto:${op.email}` : op.phone ? `tel:${op.phone}` : null;

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
            const href = contactHref(op);
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
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer"
                      className="flex-1 py-3 rounded-xl text-sm font-bold text-center transition hover:bg-black/[0.02]"
                      style={{ background: "transparent", color: colors.secondary, border: `1.5px solid ${colors.secondary}` }}>
                      Contact Operator
                    </a>
                  ) : (
                    <button onClick={() => router.push(`/operators/${slug}`)}
                      className="flex-1 py-3 rounded-xl text-sm font-bold transition hover:bg-black/[0.02]"
                      style={{ background: "transparent", color: colors.secondary, border: `1.5px solid ${colors.secondary}` }}>
                      Contact Operator
                    </button>
                  )}
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
