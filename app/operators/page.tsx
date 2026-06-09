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

// Grid Operator Card - 3-column layout for recommended operators
function GridOperatorCard({ op, rank }: { op: Operator & { matchScore: number; matchReasons: string[] }; rank: number }) {
  const isBestMatch = rank === 1;

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
        {/* Contact Button - Always visible */}
        {op.website ? (
          <a href={`https://${op.website}`} target="_blank" rel="noopener noreferrer"
            className="w-full block py-2 rounded-lg font-bold text-sm transition text-center hover:brightness-105 mb-2"
            style={{ background: isBestMatch ? colors.primary : colors.secondary, color: "#FFFFFF" }}>
            Contact Operator →
          </a>
        ) : op.email ? (
          <a href={`mailto:${op.email}`}
            className="w-full block py-2 rounded-lg font-bold text-sm transition text-center hover:brightness-105 mb-2"
            style={{ background: isBestMatch ? colors.primary : colors.secondary, color: "#FFFFFF" }}>
            Contact Operator →
          </a>
        ) : op.phone ? (
          <a href={`tel:${op.phone}`}
            className="w-full block py-2 rounded-lg font-bold text-sm transition text-center hover:brightness-105 mb-2"
            style={{ background: isBestMatch ? colors.primary : colors.secondary, color: "#FFFFFF" }}>
            Contact Operator →
          </a>
        ) : (
          <button
            className="w-full block py-2 rounded-lg font-bold text-sm transition text-center hover:brightness-105 mb-2 cursor-not-allowed opacity-70"
            style={{ background: colors.border, color: colors.textMuted }}>
            Contact Info Unavailable
          </button>
        )}

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
  return (
    <div className="rounded-2xl overflow-hidden relative group"
      style={{
        background: colors.bgSection,
        border: "1px solid " + colors.border,
        boxShadow: colors.shadowSm,
        transition: "all 0.3s ease",
        height: "620px", // FIXED HEIGHT
        display: "grid",
        gridTemplateRows: "110px 80px 80px 1fr 100px 70px", // FIXED VERTICAL ZONES
        gridTemplateColumns: "1fr"
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = colors.shadowLg)}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = colors.shadowSm)}>

      {/* Ranking Badge (for carousel) */}
      {rank && (
        <div className="absolute top-4 right-4 z-10">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ background: colors.secondary, color: "#FFFFFF" }}>
            {rank}
          </div>
        </div>
      )}

      {/* HEADER - GRID ROW 1 (110px) */}
      <div style={{ padding: "16px", borderBottom: "1px solid " + colors.border, overflow: "hidden" }}>
        <h3 className="text-lg font-bold mb-1 truncate" style={{ color: colors.textMain }}>{op.name}</h3>
        <p className="text-xs mb-2 truncate" style={{ color: colors.textMuted }}>{op.specialization}</p>
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium" style={{ color: colors.textMuted }}>
            {op.googleRating} ★ ({op.googleReviewCount} reviews)
          </span>
        </div>
      </div>

      {/* DESCRIPTION - GRID ROW 2 (80px) */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid " + colors.border, overflow: "hidden" }}>
        <p className="text-xs leading-relaxed" style={{ color: colors.textMuted, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {op.description}
        </p>
      </div>

      {/* METRICS - GRID ROW 3 (80px) */}
      <div style={{ padding: "12px 16px", background: colors.bgMain, borderBottom: "1px solid " + colors.border, overflow: "hidden" }}>
        <div className="grid grid-cols-3 gap-3 h-full">
          <div className="text-center flex flex-col justify-center">
            <p className="text-xs" style={{ color: colors.textMuted }}>Founded</p>
            <p className="text-sm font-bold mt-1" style={{ color: colors.primary }}>{op.founded}</p>
          </div>
          <div className="text-center flex flex-col justify-center">
            <p className="text-xs" style={{ color: colors.textMuted }}>Portfolio</p>
            <p className="text-sm font-bold mt-1" style={{ color: colors.primary }}>{op.portfolio}+</p>
          </div>
          <div className="text-center flex flex-col justify-center">
            <p className="text-xs" style={{ color: colors.textMuted }}>Areas</p>
            <p className="text-sm font-bold mt-1" style={{ color: colors.primary }}>{op.communities.length}</p>
          </div>
        </div>
      </div>

      {/* KEY STRENGTHS - GRID ROW 4 (1fr - flexible) */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid " + colors.border, overflow: "hidden" }}>
        <p className="text-xs font-semibold mb-2" style={{ color: colors.primary }}>KEY STRENGTHS</p>
        <div className="space-y-1">
          {op.pros?.slice(0, 3).map(p => (
            <div key={p} className="flex items-start gap-2">
              <span style={{ color: colors.primary, fontSize: "11px", fontWeight: "bold", flexShrink: 0, marginTop: "1px" }}>✓</span>
              <p className="text-xs" style={{ color: colors.textMuted, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {p}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER - CONTACT INFO - GRID ROW 5 (100px) */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid " + colors.border, overflow: "hidden" }}>
        <p className="text-xs font-semibold mb-2" style={{ color: colors.primary }}>CONTACT</p>
        <div className="space-y-1 text-xs">
          {op.website && (
            <div className="flex items-center gap-1">
              <span style={{ fontSize: "10px" }}>🌐</span>
              <a href={`https://${op.website}`} target="_blank" rel="noopener noreferrer" className="truncate transition hover:opacity-70" style={{ color: colors.textMain }}>
                {op.website}
              </a>
            </div>
          )}
          {op.email && (
            <div className="flex items-center gap-1">
              <span style={{ fontSize: "10px" }}>✉️</span>
              <a href={`mailto:${op.email}`} className="truncate transition hover:opacity-70" style={{ color: colors.textMain }}>
                {op.email}
              </a>
            </div>
          )}
          {op.phone && (
            <div className="flex items-center gap-1">
              <span style={{ fontSize: "10px" }}>📱</span>
              <a href={`tel:${op.phone}`} className="truncate transition hover:opacity-70" style={{ color: colors.textMain }}>
                {op.phone}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ACTION BUTTONS - GRID ROW 6 (70px) */}
      <div style={{ padding: "12px 16px", display: "flex", gap: "8px", alignItems: "center" }}>
        {op.website && (
          <a href={`https://${op.website}`} target="_blank" rel="noopener noreferrer"
            className="flex-1 py-2 rounded-lg font-bold text-xs transition text-center hover:brightness-105"
            style={{ background: "transparent", color: colors.primary, border: "1px solid " + colors.primary }}>
            Visit Website
          </a>
        )}
        <button
          className={`font-bold text-xs transition hover:brightness-105 py-2 rounded-lg text-center ${!op.website ? 'w-full' : 'flex-1'}`}
          style={{ background: colors.secondary, color: "#FFFFFF" }}>
          Contact Operator
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

      {/* COMPACT SCROLLING PROPERTY SUMMARY */}
      <div className="sticky top-0 z-40 backdrop-blur-md transition-all duration-300" style={{ background: colors.bgMain + "ee", borderBottom: "1px solid " + colors.border, paddingTop: "8px", paddingBottom: "8px" }}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-2 text-xs" style={{ color: colors.textMuted }}>
            <button onClick={handleBack} className="hover:opacity-70" style={{ color: colors.primary }}>Home</button>
            <span>›</span>
            <span>Operator Suggestions</span>
          </div>

          {/* Compact Property Summary Card */}
          <div className="rounded-xl p-3" style={{ background: colors.bgSection, border: "1px solid " + colors.border, boxShadow: colors.shadowSm }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Property Identity - Compact */}
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: colors.primary, letterSpacing: "0.05em" }}>PROPERTY</p>
                <p className="text-sm font-bold" style={{ color: colors.textMain }}>{result.buildingName}</p>
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                  {input.unitSize} • Floor {input.floor}
                </p>
              </div>

              {/* Revenue - Compact */}
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: colors.primary, letterSpacing: "0.05em" }}>REVENUE</p>
                <p className="text-sm font-bold" style={{ color: colors.primary }}>
                  AED {fmt(result.annualNetToLandlord * 0.9)}
                </p>
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>annual range</p>
              </div>

              {/* Occupancy - Compact */}
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: colors.primary, letterSpacing: "0.05em" }}>OCCUPANCY</p>
                <p className="text-sm font-bold" style={{ color: colors.secondary }}>{(result.avgOccupancy * 100).toFixed(0)}%</p>
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>estimated</p>
              </div>

              {/* Net to Owner - Compact */}
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: colors.primary, letterSpacing: "0.05em" }}>NET TO OWNER</p>
                <p className="text-sm font-bold" style={{ color: colors.secondary }}>
                  AED {fmt(result.annualNetToLandlord * 0.85)}
                </p>
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>annual net</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Hero Section */}
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: colors.textMain }}>Recommended Operators</h1>
          <p className="text-sm" style={{ color: colors.textMuted }}>Top performing holiday home operators analyzed for your property</p>
        </div>

        {/* Filter & Sort Bar */}
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition hover:brightness-95"
            style={{ background: colors.bgSection, border: "1px solid " + colors.border, color: colors.textMain }}>
            🔍 Filter Operators
          </button>
          <select className="px-4 py-2 rounded-lg font-medium text-sm transition"
            style={{ background: colors.bgSection, border: "1px solid " + colors.border, color: colors.textMain }}>
            <option>Sort by Recommended</option>
            <option>Highest Revenue</option>
            <option>Best Reviews</option>
            <option>Most Experience</option>
          </select>
        </div>

        {/* TOP 5 RECOMMENDED - LAYERED CARD STACK */}
        <div>
          {/* Premium Gradient Heading */}
          <div className="mb-8">
            <h2 className="text-5xl font-bold mb-2" style={{
              background: "linear-gradient(135deg, #1B5E4A 0%, #4D7A4E 33%, #8A8442 66%, #B88A44 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.5px"
            }}>Top Recommended Operators</h2>
            <p className="text-sm" style={{ color: colors.textMuted }}>Curated selection ranked by market performance and guest satisfaction</p>
          </div>

          {/* Premium Card Stack Layout - UNIFORM SIZES - INFINITE LOOP */}
          <div
            className="relative flex items-center justify-center mb-24 px-24"
            style={{ perspective: "1200px", height: "620px", cursor: "grab" }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            {/* BACK LAYER - 3 cards rotating - EXACT SAME 340px SIZE */}

            {/* Back Left Position */}
            <div className="absolute" style={{
              left: "8%",
              top: "25%",
              zIndex: 1,
              transition: "all 500ms ease-out",
              pointerEvents: "none",
              width: "340px",
              height: "620px",
              maxHeight: "620px",
              minHeight: "620px",
              overflow: "hidden",
              display: "flex",
              alignItems: "stretch"
            }}>
              {ranked[(recommendedIndex + 3) % 5] && (
                <div style={{ width: "100%", height: "620px", maxHeight: "620px", minHeight: "620px", opacity: 0.15, overflow: "hidden" }}>
                  <GridOperatorCard op={ranked[(recommendedIndex + 3) % 5]} rank={(recommendedIndex + 3) % 5 + 1} />
                </div>
              )}
            </div>

            {/* Back Center Position */}
            <div className="absolute" style={{
              left: "50%",
              top: "40%",
              zIndex: 2,
              transition: "all 500ms ease-out",
              pointerEvents: "none",
              width: "340px",
              height: "620px",
              maxHeight: "620px",
              minHeight: "620px",
              marginLeft: "-170px",
              overflow: "hidden",
              display: "flex",
              alignItems: "stretch"
            }}>
              {ranked[(recommendedIndex + 4) % 5] && (
                <div style={{ width: "100%", height: "620px", maxHeight: "620px", minHeight: "620px", opacity: 0.20, overflow: "hidden" }}>
                  <GridOperatorCard op={ranked[(recommendedIndex + 4) % 5]} rank={(recommendedIndex + 4) % 5 + 1} />
                </div>
              )}
            </div>

            {/* Back Right Position */}
            <div className="absolute" style={{
              right: "8%",
              top: "25%",
              zIndex: 1,
              transition: "all 500ms ease-out",
              pointerEvents: "none",
              width: "340px",
              height: "620px",
              maxHeight: "620px",
              minHeight: "620px",
              overflow: "hidden",
              display: "flex",
              alignItems: "stretch"
            }}>
              {ranked[(recommendedIndex + 2) % 5] && (
                <div style={{ width: "100%", height: "620px", maxHeight: "620px", minHeight: "620px", opacity: 0.15, overflow: "hidden" }}>
                  <GridOperatorCard op={ranked[(recommendedIndex + 2) % 5]} rank={(recommendedIndex + 2) % 5 + 1} />
                </div>
              )}
            </div>

            {/* FRONT LAYER - 2 prominent elevated cards - EXACT SAME 340px x 620px SIZE */}

            {/* Front Left Position */}
            <div className="absolute" style={{
              left: "20%",
              top: "-5%",
              zIndex: 3,
              transition: "all 500ms ease-out",
              filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))",
              pointerEvents: "none",
              width: "340px",
              height: "620px",
              maxHeight: "620px",
              minHeight: "620px",
              overflow: "hidden",
              display: "flex",
              alignItems: "stretch"
            }}>
              {ranked[recommendedIndex] && (
                <div style={{ width: "100%", height: "620px", maxHeight: "620px", minHeight: "620px", opacity: 1.0, overflow: "hidden" }}>
                  <GridOperatorCard op={ranked[recommendedIndex]} rank={recommendedIndex + 1} />
                </div>
              )}
            </div>

            {/* Front Right Position */}
            <div className="absolute" style={{
              right: "20%",
              top: "-5%",
              zIndex: 3,
              transition: "all 500ms ease-out",
              filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))",
              pointerEvents: "none",
              width: "340px",
              height: "620px",
              maxHeight: "620px",
              minHeight: "620px",
              overflow: "hidden",
              display: "flex",
              alignItems: "stretch"
            }}>
              {ranked[(recommendedIndex + 1) % 5] && (
                <div style={{ width: "100%", height: "620px", maxHeight: "620px", minHeight: "620px", opacity: 1.0, overflow: "hidden" }}>
                  <GridOperatorCard op={ranked[(recommendedIndex + 1) % 5]} rank={(recommendedIndex + 1) % 5 + 1} />
                </div>
              )}
            </div>

            {/* LEFT ARROW BUTTON - Positioned on left side */}
            <button
              onClick={() => setRecommendedIndex((recommendedIndex - 1 + 5) % 5)}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center transition-all hover:brightness-110 hover:scale-110 z-20"
              style={{
                background: colors.primary,
                color: "#FFFFFF",
                fontSize: "24px",
                fontWeight: "bold",
                boxShadow: colors.shadowMd
              }}
              title="Previous operator">
              ←
            </button>

            {/* RIGHT ARROW BUTTON - Positioned on right side */}
            <button
              onClick={() => setRecommendedIndex((recommendedIndex + 1) % 5)}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center transition-all hover:brightness-110 hover:scale-110 z-20"
              style={{
                background: colors.primary,
                color: "#FFFFFF",
                fontSize: "24px",
                fontWeight: "bold",
                boxShadow: colors.shadowMd
              }}
              title="Next operator">
              →
            </button>
          </div>

          {/* Indicator Dots - Below Cards */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: 5 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setRecommendedIndex(idx)}
                className="rounded-full transition-all hover:scale-125"
                style={{
                  width: recommendedIndex === idx ? "28px" : "10px",
                  height: "10px",
                  background: recommendedIndex === idx ? colors.primary : colors.border,
                  cursor: "pointer"
                }}
                title={`Go to operator ${idx + 1}`} />
            ))}
          </div>

        </div>

        {/* NEW & EMERGING OPERATORS - PREMIUM 3-COLUMN GRID */}
        {UPCOMING_OPERATORS.length > 0 && (
          <div className="mt-20 pt-16" style={{ borderTop: "1px solid " + colors.border }}>
            {/* Premium Gradient Heading - Same as Top Recommended */}
            <div className="mb-12">
              <h2 className="text-5xl font-bold mb-2" style={{
                background: "linear-gradient(135deg, #1B5E4A 0%, #4D7A4E 33%, #8A8442 66%, #B88A44 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.5px"
              }}>New & Emerging Operators</h2>
              <p className="text-sm" style={{ color: colors.textMuted }}>Growing market presence with innovative approaches and specialized expertise</p>
            </div>

            {/* Premium 3-Column Grid - Centered, Equal Importance - UNIFORM 340px x 500px SIZE */}
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {UPCOMING_OPERATORS.slice(0, 3).map((op, i) => (
                  <div key={op.id} style={{ perspective: "1000px", width: "340px", height: "500px", maxHeight: "500px", minHeight: "500px", overflow: "hidden", display: "flex", alignItems: "stretch" }}>
                    <UpcomingOperatorCard op={op} />
                  </div>
                ))}
              </div>
            </div>
          </div>
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
