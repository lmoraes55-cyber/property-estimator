"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import {
  runEstimator,
  fmt, UnitSize, UnitType, OCCStrategy, ViewType, FurnishedStatus, EstimatorOutput,
} from "@/lib/estimator";
import { colors } from "@/lib/colors";
import GroundWorksLogo from "@/components/GroundWorksLogo";

function StatCard({ label, value, sub, highlight, icon }: { label: string; value: string; sub?: string; highlight?: boolean; icon?: string }) {
  // Icon mapping with SVG line icons (minimal, professional)
  const iconSVGs: { [key: string]: React.ReactNode } = {
    revenue: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h18M3 6h18M3 18h18M6 9v6M10 9v6M14 9v6M18 9v6"/>
      </svg>
    ),
    user: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
      </svg>
    ),
    pie: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 2v10M12 12h10a10 10 0 0 0-10-10z"/>
      </svg>
    ),
    tools: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.4 14.4L9.6 9.6M18.9 4.9a2.828 2.828 0 1 0 4 4l-12 12a4 4 0 0 1-2 1l-3 .5.5-3a4 4 0 0 1 1-2l12-12z"/>
      </svg>
    ),
    coins: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m2.12 2.12l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m2.12-2.12l4.24-4.24M19.78 19.78l-4.24-4.24m-2.12-2.12l-4.24-4.24"/>
      </svg>
    ),
    percent: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M18 6l-12 12"/>
      </svg>
    ),
    trending: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
    calendar: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
    ),
  };

  const getIcon = () => {
    const iconMap: { [key: string]: string } = {
      "ANNUAL REVENUE (GROSS)": "revenue",
      "NET TO LANDLORD": "user",
      "MANAGEMENT FEES": "pie",
      "UTILITIES + MAINTENANCE": "tools",
      "GROSS YIELD": "coins",
      "NET YIELD": "percent",
      "STR vs LTR DELTA": "trending",
      "AVERAGE DAILY RATE": "calendar",
    };
    return iconMap[label] || "revenue";
  };

  return (
    <div className="group rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      style={{
        background: colors.bgSection,
        border: `1px solid ${colors.border}`,
        boxShadow: `${colors.shadowSm}, ${colors.shadowMd}, ${colors.shadowLg}`,
        backdropFilter: "blur(10px)"
      }}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-semibold tracking-widest" style={{ color: colors.textMuted, letterSpacing: "0.1em" }}>{label}</p>
        {/* Professional Icon Circle */}
        <div className="transition-transform duration-300 group-hover:scale-110"
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            background: "#E8F3EE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1B5E4A",
            flexShrink: 0
          }}>
          {iconSVGs[getIcon()]}
        </div>
      </div>
      <p className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: colors.textMuted }}>{sub}</p>}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 shadow-xl" style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
      <p className="text-xs font-semibold mb-2" style={{ color: colors.primary }}>{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <p key={p.name} className="text-xs" style={{ color: p.color }}>
          {p.name}: AED {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

// Premium luxury-advisory CTA card with decorative watermarks
function PremiumCTACard({
  theme, eyebrow, eyebrowColor, heading, description, buttonText, buttonGradient, buttonShadow, onClick,
}: {
  theme: "bronze" | "green";
  eyebrow: string;
  eyebrowColor: string;
  heading: string;
  description: React.ReactNode;
  buttonText: string;
  buttonGradient: string;
  buttonShadow: string;
  onClick: () => void;
}) {
  const isBronze = theme === "bronze";
  const accent = isBronze ? colors.secondary : colors.primary;
  const bg = isBronze
    ? `radial-gradient(ellipse 700px 400px at 50% 0%, ${colors.secondary}12 0%, transparent 70%), linear-gradient(135deg, #FCF8F1 0%, #FBF6EE 100%)`
    : `radial-gradient(ellipse 700px 400px at 50% 0%, ${colors.primary}0E 0%, transparent 70%), linear-gradient(135deg, #F7FAF8 0%, #FAFBF9 100%)`;

  return (
    <div
      className="relative overflow-hidden text-center"
      style={{
        borderRadius: "32px",
        padding: "64px 40px",
        background: bg,
        border: `1px solid ${accent}33`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 18px 50px rgba(0,0,0,0.06)",
      }}
    >
      {/* LEFT decorative watermark */}
      {isBronze ? (
        <img
          src="/locations/Downtown.png"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: "32%", height: "100%",
            objectFit: "cover", objectPosition: "left center", opacity: 0.08, pointerEvents: "none", zIndex: 0,
            filter: "grayscale(0.2)",
            maskImage: "linear-gradient(to right, rgba(0,0,0,1) 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,1) 0%, transparent 100%)",
          }}
        />
      ) : (
        // Palm leaf watermark (SVG)
        <svg aria-hidden="true" width="280" height="280" viewBox="0 0 200 200"
          style={{ position: "absolute", left: "-30px", bottom: "-40px", opacity: 0.07, pointerEvents: "none", zIndex: 0 }}>
          <g stroke={colors.primary} strokeWidth="1.4" fill="none" strokeLinecap="round">
            <path d="M30 180 C60 130 90 90 150 50" />
            {Array.from({ length: 11 }).map((_, i) => {
              const t = i / 10;
              const x = 30 + (120 * t);
              const y = 180 - (130 * t);
              const len = 26 * (1 - t * 0.4);
              return <path key={i} d={`M${x} ${y} q ${len * 0.5} ${-len * 0.9} ${len} ${-len * 0.4}`} />;
            })}
            {Array.from({ length: 11 }).map((_, i) => {
              const t = i / 10;
              const x = 30 + (120 * t);
              const y = 180 - (130 * t);
              const len = 26 * (1 - t * 0.4);
              return <path key={`b${i}`} d={`M${x} ${y} q ${len * 0.9} ${-len * 0.4} ${len} ${len * 0.2}`} />;
            })}
          </g>
        </svg>
      )}

      {/* RIGHT decorative pattern */}
      {isBronze ? (
        // Curved bronze line patterns
        <svg aria-hidden="true" width="320" height="320" viewBox="0 0 320 320"
          style={{ position: "absolute", right: "-60px", top: "50%", transform: "translateY(-50%)", opacity: 0.18, pointerEvents: "none", zIndex: 0 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <path key={i} d={`M${320} ${40 + i * 22} C ${200 - i * 10} ${80 + i * 18}, ${180 - i * 8} ${200 - i * 14}, ${300} ${300 - i * 6}`}
              stroke={colors.secondary} strokeWidth="1" fill="none" />
          ))}
        </svg>
      ) : (
        // Geometric network pattern
        <svg aria-hidden="true" width="300" height="300" viewBox="0 0 300 300"
          style={{ position: "absolute", right: "-30px", top: "50%", transform: "translateY(-50%)", opacity: 0.08, pointerEvents: "none", zIndex: 0 }}>
          <g stroke={colors.primary} strokeWidth="0.8" fill="none">
            {[[60,60],[160,40],[240,90],[110,140],[210,170],[70,210],[180,240],[260,210]].map((p, i, arr) => (
              <g key={i}>
                <circle cx={p[0]} cy={p[1]} r="3" fill={colors.primary} stroke="none" />
                {arr.slice(i + 1).map((q, j) => {
                  const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
                  return d < 130 ? <line key={j} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} /> : null;
                })}
              </g>
            ))}
          </g>
        </svg>
      )}

      {/* Content */}
      <div className="relative" style={{ zIndex: 1 }}>
        {/* Eyebrow + diamond divider */}
        <p className="text-xs font-bold uppercase mb-3" style={{ color: eyebrowColor, letterSpacing: "0.18em" }}>{eyebrow}</p>
        <div className="flex items-center justify-center gap-3 mb-7">
          <span style={{ width: "70px", height: "1px", background: `${accent}40` }} />
          <svg width="9" height="9" viewBox="0 0 9 9"><rect x="4.5" y="0" width="6.4" height="6.4" transform="rotate(45 4.5 0)" fill="none" stroke={accent} strokeWidth="1" /></svg>
          <span style={{ width: "70px", height: "1px", background: `${accent}40` }} />
        </div>

        {/* Heading with green→bronze gradient */}
        <h2 className="font-bold mb-4" style={{
          fontFamily: "'Georgia', serif",
          fontSize: "40px",
          lineHeight: 1.15,
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          {heading}
        </h2>

        <p className="text-sm mb-9 max-w-lg mx-auto" style={{ color: colors.textMuted, lineHeight: 1.7 }}>
          {description}
        </p>

        <button
          onClick={onClick}
          className="inline-flex items-center gap-2 font-bold text-sm transition-all hover:-translate-y-0.5 hover:brightness-105"
          style={{
            padding: "15px 36px",
            borderRadius: "999px",
            background: buttonGradient,
            color: "#FFF",
            boxShadow: buttonShadow,
            transitionDuration: "250ms",
          }}>
          {buttonText}
        </button>
      </div>
    </div>
  );
}

function ReportContent() {
  const params = useSearchParams();
  const router = useRouter();

  const ltrRecommended = params.get("ltrRecommended") === "true";

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
    // User enters size in sqm; convert to sqft for the rent-per-sqft refinement
    sizeSqft: params.get("sizeSqm") ? Number(params.get("sizeSqm")) * 10.7639 : undefined,
  };

  const result: EstimatorOutput = runEstimator(input);

  const chartData = result.months.map(m => ({
    month: m.month,
    "STR Net": Math.round(m.netToLandlord),
    "LTR Equivalent": Math.round(result.longTermRent / 12),
    Revenue: Math.round(m.revenue),
    Occupancy: Math.round(m.occupancy * 100),
  }));

  const strBetter = result.strVsLtrDelta > 0;

  // Get location-specific hero image (premium Dubai photos)
  const getLocationImage = (buildingName: string, buildingArea: string | undefined): string => {
    const areaLower = (buildingArea || "").toLowerCase();

    // Direct area-based mapping with exact area names from database
    if (areaLower.includes("marina")) return "/locations/Marina.png";
    if (areaLower.includes("downtown")) return "/locations/Downtown.png";
    if (areaLower.includes("burj")) return "/locations/Downtown.png";
    if (areaLower.includes("palm")) return "/locations/Palm.png";
    if (areaLower.includes("jbr") || areaLower.includes("jumeirah beach")) return "/locations/JBR.png";
    if (areaLower.includes("jumeirah") && !areaLower.includes("village")) return "/locations/JBR.png";
    if (areaLower.includes("business")) return "/locations/Downtown.png";
    if (areaLower.includes("creek")) return "/locations/Downtown.png";
    if (areaLower.includes("emaar")) return "/locations/Marina.png";
    if (areaLower.includes("beach")) return "/locations/Marina.png";

    // Fallback: Marina image as default
    return "/locations/Marina.png";
  };

  const heroImage = getLocationImage(input.buildingName, result.buildingInfo?.area);

  return (
    <div className="min-h-screen" style={{ background: `radial-gradient(ellipse 800px 600px at 50% 40%, rgba(201, 167, 125, 0.25) 0%, transparent 60%), linear-gradient(135deg, #FFFFFF 0%, ${colors.bgMain} 35%, ${colors.bgSection} 100%)` }}>
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
        style={{ background: colors.bgMain + "ee", borderBottom: "1px solid " + colors.primary, backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()}
            className="text-xs px-3 py-1.5 rounded-lg transition hover:bg-white/10 font-medium"
            style={{ background: colors.bgSection, border: "1px solid #333", color: colors.primary }}>
            ← Back
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
            <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Rental Report</p>
            <p className="text-sm font-semibold" style={{ color: colors.textMain }}>{result.propertyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: "#C9A84C22", color: colors.primary, border: "1px solid #C9A84C44" }}>
            {input.unitSize} · {input.unitType}
          </span>
          <button
            onClick={() => window.print()}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition"
            style={{ background: colors.primary, color: "#FFF" }}>
            Export PDF
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* Unfurnished notice */}
        {result.furnished === "Unfurnished" && (
          <div className="rounded-2xl p-5"
            style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
            <p className="text-sm font-semibold mb-1" style={{ color: colors.primary }}>
              Furnishing package required
            </p>
            <p className="text-xs leading-relaxed" style={{ color: colors.textMuted }}>
              Your property is currently unfurnished. A furnishing package is required before listing on any short-term rental platform.
              We will suggest curated packages tailored to your property size and community in the next section.
            </p>
          </div>
        )}

        {/* LTR recommendation banner */}
        {ltrRecommended && (
          <div className="rounded-2xl p-5"
            style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: colors.mutedGreen }}>
                Long-term rental recommended for this area
              </p>
              <p className="text-xs leading-relaxed" style={{ color: colors.textMuted }}>
                Based on your location, we recommend a long-term tenancy for stable, guaranteed income.
                The figures below show what a long-term rental analysis looks like for your property —
                consistent monthly cashflow with no vacancy or management overhead.
              </p>
            </div>
          </div>
        )}

        {/* Hero verdict with image - Premium Report Cover */}
        <div className="rounded-3xl p-10 relative overflow-hidden"
          style={{
            background: colors.bgSection,
            border: `1px solid ${colors.border}`,
            boxShadow: `${colors.shadowSm}, ${colors.shadowMd}, ${colors.shadowLg}`,
            backdropFilter: "blur(20px)"
          }}>
          {/* Subtle gradient background */}
          <div className="absolute inset-0 opacity-40"
            style={{ background: `radial-gradient(circle at 100% 100%, ${colors.secondary}08 0%, transparent 50%)` }} />

          <div className="relative flex gap-12">
            {/* Left side content */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: colors.primary, letterSpacing: "0.15em" }}>
                  12-Month Forecast · {new Date().toLocaleDateString("en-AE", { month: "long", year: "numeric" })}
                </span>
                {result.buildingInfo && (
                  <span className="text-xs px-3 py-1 rounded-full" style={{ background: `${colors.secondary}15`, color: colors.secondary, border: `1px solid ${colors.secondary}30` }}>
                    {result.buildingInfo.community} · {result.buildingInfo.tier}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {[
                  `Floor ${result.floor}`,
                  result.furnished,
                  result.view,
                  result.floorPremiumPct > 0 ? `+${Math.round(result.floorPremiumPct * 100)}% floor` : null,
                  result.viewPremium > 0 ? `+${Math.round(result.viewPremium * 100)}% view` : null,
                ].filter(Boolean).map(tag => (
                  <span key={tag!} className="text-xs px-3 py-1.5 rounded-lg font-medium"
                    style={{ background: `${colors.primary}08`, color: colors.primary, border: `1px solid ${colors.primary}20` }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Premium Headline */}
              <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight"
                style={{
                  color: colors.textMain,
                  background: `linear-gradient(135deg, ${colors.textMain} 0%, ${colors.primary} 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "system-ui, -apple-system, sans-serif"
                }}>
                {strBetter ? "Short-term rental outperforms" : "Long-term rental is competitive"}
              </h1>

              {/* Premium value difference highlight */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: colors.border }}>
                <p className="text-sm mb-3" style={{ color: colors.textMuted }}>Revenue advantage</p>
                <p className="text-3xl font-bold" style={{ color: colors.secondary }}>
                  AED {fmt(Math.abs(result.strVsLtrDelta))} {strBetter ? "more per year" : "difference"}
                </p>
              </div>

              {/* Premium Metric Strip */}
              <div className="grid grid-cols-2 gap-8">
                <div className="group">
                  <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: colors.textMuted, letterSpacing: "0.1em" }}>STR NET/YEAR</p>
                  <p className="text-4xl font-bold" style={{ color: colors.primary }}>AED {fmt(result.annualNetToLandlord)}</p>
                </div>
                <div className="group">
                  <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: colors.textMuted, letterSpacing: "0.1em" }}>LTR/YEAR</p>
                  <p className="text-4xl font-bold" style={{ color: colors.secondary }}>AED {fmt(result.longTermRent)}</p>
                  {result.ltrBasis === "dld-building" || result.ltrBasis === "dld-area" ? (
                    <div className="mt-2 space-y-1">
                      {result.ltrRangeLow != null && result.ltrRangeHigh != null && (
                        <p className="text-xs" style={{ color: colors.textMuted }}>
                          Typical range AED {fmt(result.ltrRangeLow)}–{fmt(result.ltrRangeHigh)}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold"
                        style={{ background: `${colors.primary}10`, color: colors.primary, border: `1px solid ${colors.primary}25` }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke={colors.primary} strokeWidth="1.4" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke={colors.primary} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        DLD-verified · {result.ltrSampleSize?.toLocaleString()} contracts{result.ltrAsOf ? ` · to ${result.ltrAsOf}` : ""}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs mt-2" style={{ color: colors.textMuted }}>Source: {result.ltrSource}</p>
                  )}
                </div>
                <div className="group">
                  <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: colors.textMuted, letterSpacing: "0.1em" }}>AVG OCCUPANCY</p>
                  <p className="text-4xl font-bold" style={{ color: colors.primary }}>{(result.avgOccupancy * 100).toFixed(0)}%</p>
                </div>
                <div className="group">
                  <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: colors.textMuted, letterSpacing: "0.1em" }}>AVG DAILY RATE</p>
                  <p className="text-4xl font-bold" style={{ color: colors.secondary }}>AED {fmt(result.avgADR)}</p>
                </div>
              </div>
            </div>

            {/* Right side premium image panel */}
            <div className="hidden lg:block flex-shrink-0 w-96">
              <div className="relative w-full h-96 rounded-3xl overflow-hidden group"
                style={{
                  boxShadow: `${colors.shadowSm}, ${colors.shadowMd}, ${colors.shadowLg}`,
                }}>
                {/* Location-Specific Dubai Skyline Image (Pexels CDN) */}
                <div className="absolute inset-0 w-full h-full"
                  style={{
                    backgroundImage: `url("${heroImage}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundColor: "#1B5E4A",
                    transition: "transform 0.6s ease",
                    filter: "brightness(1.05) contrast(1.1)"
                  }} />

                {/* Premium Brand Overlay - Green to Gold Gradient */}
                <div className="absolute inset-0"
                  style={{
                    background: `linear-gradient(180deg, rgba(27,94,74,0.08) 0%, rgba(184,138,68,0.08) 100%)`,
                    pointerEvents: "none"
                  }} />

                {/* Subtle Trend Line Accent */}
                <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.15, mixBlendMode: "screen" }}>
                  <polyline
                    points="10,300 50,280 100,260 150,240 200,220 250,200 300,190 350,180 390,170"
                    fill="none"
                    stroke={colors.secondary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Key metrics */}
        <div className="rounded-3xl p-10" style={{
          background: `linear-gradient(135deg, ${colors.bgSection} 0%, ${colors.bgWhite} 100%)`,
          border: "1px solid " + colors.border,
          boxShadow: `${colors.shadowSm}, ${colors.shadowMd}, ${colors.shadowLg}`,
          backdropFilter: "blur(20px)"
        }}>
          <h2 className="text-sm font-bold tracking-widest uppercase mb-8" style={{ color: colors.primary, letterSpacing: "0.15em" }}>Key Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="ANNUAL REVENUE (GROSS)" value={`AED ${fmt(result.annualRevenue)}`} icon="💼" />
            <StatCard label="NET TO LANDLORD" value={`AED ${fmt(result.annualNetToLandlord)}`} sub="After all deductions" icon="👤" />
            <StatCard label="MANAGEMENT FEES" value={`AED ${fmt(result.annualManagementFee)}`} sub={`${(input.managementFee * 100).toFixed(0)}% of revenue`} icon="⏰" />
            <StatCard label="UTILITIES + MAINTENANCE" value={`AED ${fmt(result.annualUtilities + result.annualMaintenance)}`} sub="DEWA, AC, DU, upkeep" icon="🔧" />
            {result.grossYield !== undefined && (
              <StatCard label="GROSS YIELD" value={`${result.grossYield.toFixed(2)}%`} sub="Based on property value" icon="💰" />
            )}
            {result.netYield !== undefined && (
              <StatCard label="NET YIELD" value={`${result.netYield.toFixed(2)}%`} sub="After all deductions" icon="📊" />
            )}
            <StatCard label="STR vs LTR DELTA" value={`${strBetter ? "+" : ""}AED ${fmt(result.strVsLtrDelta)}`}
              sub={strBetter ? "STR earns more" : "LTR earns more"} icon="📈" />
            <StatCard label="AVERAGE DAILY RATE" value={`AED ${fmt(result.avgADR)}`} sub="Blended across 12 months" icon="📅" />
          </div>
        </div>

        {/* STR vs LTR chart */}
        <div className="rounded-3xl p-8" style={{ background: colors.bgSection, border: "1px solid " + colors.border, boxShadow: `${colors.shadowSm}, ${colors.shadowMd}, ${colors.shadowLg}`, backdropFilter: "blur(20px)" }}>
          <h2 className="text-base font-semibold mb-1" style={{ color: colors.secondary }}>Monthly Net Income: STR vs LTR</h2>
          <p className="text-xs mb-6" style={{ color: colors.textMuted }}>Short-term rental net income compared to equivalent monthly long-term rent</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="strGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ltrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.textLight} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.textLight} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: colors.textMuted, fontSize: "12px" }} />
              <Area type="monotone" dataKey="STR Net" stroke={colors.primary} strokeWidth={2} fill="url(#strGrad)" />
              <Area type="monotone" dataKey="LTR Equivalent" stroke={colors.textLight} strokeWidth={2} fill="url(#ltrGrad)" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue & Occupancy - Premium Investor Intelligence Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Premium Revenue Chart */}
          <div className="rounded-3xl p-10" style={{ background: colors.bgSection, border: "1px solid " + colors.border, boxShadow: `${colors.shadowSm}, ${colors.shadowMd}, ${colors.shadowLg}`, backdropFilter: "blur(20px)" }}>
            <div className="mb-8">
              <h2 className="text-base font-semibold mb-1" style={{ color: colors.secondary }}>Monthly Gross Revenue</h2>
              <p className="text-xs" style={{ color: colors.textMuted }}>Seasonal demand patterns drive revenue distribution</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                <defs>
                  {/* Premium revenue gradient */}
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgba(27,94,74,0.35)" />
                    <stop offset="95%" stopColor="rgba(27,94,74,0.03)" />
                  </linearGradient>
                  {/* Seasonal context backgrounds */}
                  <linearGradient id="highSeasonGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(27,94,74,0.04)" />
                    <stop offset="100%" stopColor="rgba(27,94,74,0.02)" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`} width={40} />
                {/* Custom tooltip */}
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      const data = payload[0].payload;
                      const revenuePercent = ((data.Revenue / result.annualRevenue) * 100).toFixed(1);
                      return (
                        <div className="rounded-xl p-4 backdrop-blur-lg" style={{
                          background: "rgba(26, 26, 26, 0.95)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
                        }}>
                          <p className="text-xs font-semibold mb-2" style={{ color: colors.primary }}>{data.month}</p>
                          <p className="text-sm font-bold" style={{ color: "#FFF" }}>AED {fmt(data.Revenue)}</p>
                          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{revenuePercent}% of annual</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Premium area + line */}
                <Area
                  type="natural"
                  dataKey="Revenue"
                  stroke={colors.primary}
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                  dot={({ cx, cy, payload }) => {
                    const isHighest = payload.Revenue === Math.max(...chartData.map(d => d.Revenue));
                    const isLowest = payload.Revenue === Math.min(...chartData.map(d => d.Revenue));
                    const isSpecial = isHighest || isLowest;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSpecial ? 6 : 4}
                        fill={colors.primary}
                        stroke="#FFF"
                        strokeWidth={2}
                        style={{
                          filter: isSpecial ? `drop-shadow(0 0 6px ${colors.primary})` : "none",
                          transition: "all 300ms"
                        }}
                      />
                    );
                  }}
                  activeDot={{ r: 7, fill: colors.primary, stroke: "#FFF", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            {/* Peak/Low season labels */}
            <div className="flex justify-between mt-4 text-xs">
              <div style={{ color: colors.textLight }}>
                <span style={{ color: colors.primary, fontWeight: "600" }}>Peak:</span> Nov–Apr
              </div>
              <div style={{ color: colors.textLight }}>
                <span style={{ color: colors.primary, fontWeight: "600" }}>Low:</span> Jun–Aug
              </div>
            </div>
          </div>

          {/* Premium Occupancy Chart */}
          <div className="rounded-3xl p-10" style={{ background: colors.bgSection, border: "1px solid " + colors.border, boxShadow: `${colors.shadowSm}, ${colors.shadowMd}, ${colors.shadowLg}`, backdropFilter: "blur(20px)" }}>
            <div className="mb-8">
              <h2 className="text-base font-semibold mb-1" style={{ color: colors.secondary }}>Monthly Occupancy Rate</h2>
              <p className="text-xs" style={{ color: colors.textMuted }}>Track monthly occupancy against 75% benchmark</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                <defs>
                  {/* Subtle gold gradient for occupancy */}
                  <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgba(184,138,68,0.2)" />
                    <stop offset="95%" stopColor="rgba(184,138,68,0.02)" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: colors.textMuted, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${v}%`}
                  domain={[0, 100]}
                  width={40}
                />
                {/* 75% Occupancy Benchmark */}
                <ReferenceLine
                  y={75}
                  stroke={colors.secondary}
                  strokeDasharray="6 4"
                  label={{
                    value: "75% Benchmark",
                    position: "right",
                    fill: colors.secondary,
                    fontSize: 11,
                    offset: 10
                  }}
                />
                {/* Custom tooltip */}
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      const data = payload[0].payload;
                      const revenuePercent = ((data.Revenue / result.annualRevenue) * 100).toFixed(1);
                      return (
                        <div className="rounded-xl p-4 backdrop-blur-lg" style={{
                          background: "rgba(26, 26, 26, 0.95)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
                        }}>
                          <p className="text-xs font-semibold mb-2" style={{ color: colors.secondary }}>{data.month}</p>
                          <p className="text-sm font-bold" style={{ color: "#FFF" }}>{data.Occupancy}% Occupancy</p>
                          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>AED {fmt(data.Revenue)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Premium area + line */}
                <Area
                  type="natural"
                  dataKey="Occupancy"
                  stroke={colors.secondary}
                  strokeWidth={3}
                  fill="url(#occupancyGradient)"
                  dot={({ cx, cy, payload }) => {
                    const aboveBenchmark = payload.Occupancy >= 75;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={aboveBenchmark ? 5 : 4}
                        fill={colors.secondary}
                        stroke="#FFF"
                        strokeWidth={2}
                        style={{
                          filter: aboveBenchmark ? `drop-shadow(0 0 4px ${colors.secondary})` : "none",
                          transition: "all 300ms"
                        }}
                      />
                    );
                  }}
                  activeDot={{ r: 7, fill: colors.secondary, stroke: "#FFF", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            {/* Benchmark info */}
            <div className="mt-4 text-xs" style={{ color: colors.textMuted }}>
              <span style={{ color: colors.secondary, fontWeight: "600" }}>Strong Performance:</span> Occupancy above 75% threshold
            </div>
          </div>
        </div>

        {/* Monthly breakdown table - Premium investor-grade */}
        <div>
          {/* Section header */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase mb-2" style={{ color: colors.secondary, letterSpacing: "0.15em" }}>
              12-Month Rental Projection
            </p>
            <h2 className="text-2xl font-bold mb-1" style={{
              fontFamily: "'Georgia', serif",
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Monthly Breakdown
            </h2>
            <p className="text-xs" style={{ color: colors.textMuted }}>Full 12-month projection with all income and cost lines</p>
          </div>

          {/* KPI summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Annual Revenue", value: `AED ${fmt(result.annualRevenue)}`, accent: colors.primary },
              { label: "Average Occupancy", value: `${(result.avgOccupancy * 100).toFixed(0)}%`, accent: colors.secondary },
              { label: "Average ADR", value: `AED ${fmt(result.avgADR)}`, accent: colors.primary },
              { label: "Net to Landlord", value: `AED ${fmt(result.annualNetToLandlord)}`, accent: colors.secondary },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl px-5 py-4" style={{
                background: "#FFFFFF",
                border: `1px solid ${colors.border}`,
                boxShadow: colors.shadowSm,
              }}>
                <p className="text-xs font-semibold mb-2" style={{ color: colors.textMuted, letterSpacing: "0.04em" }}>{c.label}</p>
                <p className="text-xl font-bold" style={{ color: c.accent, fontFamily: "'Georgia', serif" }}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-3xl overflow-hidden" style={{ border: "1px solid " + colors.border, boxShadow: `${colors.shadowSm}, ${colors.shadowMd}` }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: colors.bgSection, borderBottom: "1px solid " + colors.border }}>
                  {["Month","Revenue","Occupancy","ADR","Mgmt Fee","Utilities","Maintenance","Net to Landlord"].map(h => (
                    <th key={h} className="px-6 py-4 text-left font-semibold" style={{ color: colors.textMuted, fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.months.map((m, i) => {
                  const revenuePercent = (m.revenue / result.annualRevenue * 100).toFixed(1);
                  const occupancyRate = m.occupancy * 100;
                  let occupancyColor = colors.textLight;
                  if (occupancyRate >= 75) occupancyColor = colors.primary;
                  else if (occupancyRate >= 67) occupancyColor = colors.secondary;
                  else occupancyColor = "#A0826D";
                  const barColor = occupancyRate >= 75 ? colors.primary : colors.secondary;

                  return (
                    <tr key={m.month} style={{
                      borderBottom: `1px solid ${colors.border}80`,
                      background: "#FFFFFF",
                      transition: "background-color 0.2s"
                    }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = `${colors.primary}06`)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#FFFFFF")}>
                      <td className="px-6 py-5 font-semibold" style={{ color: colors.textMain }}>{m.month}</td>

                      {/* Revenue Column with Percentage and Progress Bar */}
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium" style={{ color: colors.primary }}>AED {fmt(m.revenue)}</p>
                            <p className="text-xs" style={{ color: colors.textMuted }}>{revenuePercent}% of annual</p>
                          </div>
                          <div style={{ width: "100%", height: "5px", background: `${colors.border}99`, borderRadius: "99px", overflow: "hidden" }}>
                            <div style={{
                              width: `${revenuePercent}%`,
                              height: "100%",
                              background: colors.primary,
                              borderRadius: "99px",
                              transition: "width 0.3s"
                            }} />
                          </div>
                        </div>
                      </td>

                      {/* Occupancy Column with Progress Bar */}
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <p className="text-sm font-medium" style={{ color: occupancyColor }}>{occupancyRate.toFixed(0)}%</p>
                          <div style={{ width: "100%", height: "5px", background: `${colors.border}99`, borderRadius: "99px", overflow: "hidden" }}>
                            <div style={{
                              width: `${Math.min(occupancyRate, 100)}%`,
                              height: "100%",
                              background: barColor,
                              borderRadius: "99px",
                              transition: "background-color 0.3s, width 0.3s"
                            }} />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5" style={{ color: colors.textMain }}>
                        <p className="text-sm">AED {fmt(m.adr)}</p>
                      </td>

                      {/* Secondary Columns - Softer Emphasis */}
                      <td className="px-6 py-5" style={{ color: colors.textLight }}>
                        <p className="text-sm">AED {fmt(m.managementFee)}</p>
                      </td>
                      <td className="px-6 py-5" style={{ color: colors.textLight }}>
                        <p className="text-sm">AED {fmt(m.utilities)}</p>
                      </td>
                      <td className="px-6 py-5" style={{ color: colors.textLight }}>
                        <p className="text-sm">AED {fmt(m.maintenance)}</p>
                      </td>

                      {/* Net To Landlord - Subtle emphasis */}
                      <td className="px-6 py-5" style={{ background: `${colors.primary}06`, borderLeft: `2px solid ${colors.primary}40` }}>
                        <p className="text-sm font-bold" style={{ color: colors.primary, fontSize: "16px" }}>
                          AED {fmt(m.netToLandlord)}
                        </p>
                      </td>
                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>
          </div>
        </div>


        {/* Part 2 CTA — Operator or Agent depending on recommendation */}
        {ltrRecommended ? (
          <PremiumCTACard
            theme="bronze"
            eyebrow="Part 2 of 2"
            eyebrowColor={colors.secondary}
            heading="Find your leasing agent"
            description={<>Get your top 5 leasing agent matches for <span style={{ color: colors.primary, fontWeight: 600 }}>{result.buildingInfo?.community ?? result.buildingName}</span> — ranked by area expertise, days to let, and landlord review scores.</>}
            buttonText="Find a Leasing Agent →"
            buttonGradient="linear-gradient(135deg, #1B5E4A 0%, #2F7D63 100%)"
            buttonShadow="0 8px 20px rgba(27, 94, 74, 0.3)"
            onClick={() => { const p = new URLSearchParams(window.location.search); window.location.href = `/agents?${p.toString()}`; }}
          />
        ) : (
          <PremiumCTACard
            theme="bronze"
            eyebrow="Part 2 of 2"
            eyebrowColor={colors.secondary}
            heading="Now find your best operator"
            description={<>Get your top 5 operator matches — ranked by fit for your property, with full pros &amp; cons, OTA platform ratings, and recent guest reviews.</>}
            buttonText="Find My Best Operator →"
            buttonGradient="linear-gradient(135deg, #B88A44 0%, #D4AF6A 100%)"
            buttonShadow="0 8px 20px rgba(184, 138, 68, 0.3)"
            onClick={() => { const p = new URLSearchParams(window.location.search); window.location.href = `/operators?${p.toString()}`; }}
          />
        )}

        {/* Self Manage Alternative CTA */}
        <PremiumCTACard
          theme="green"
          eyebrow="Alternative Path"
          eyebrowColor={colors.primary}
          heading="Want to keep 100% of your income?"
          description={<>Learn how to manage your property yourself and handle all operations independently in Dubai.</>}
          buttonText="Find Out How to Self Manage →"
          buttonGradient="linear-gradient(135deg, #1B5E4A 0%, #2F7D63 100%)"
          buttonShadow="0 8px 20px rgba(27, 94, 74, 0.3)"
          onClick={() => { const p = new URLSearchParams(window.location.search); window.location.href = `/self-manage?${p.toString()}`; }}
        />

        {/* Disclaimer */}
        <div className="text-center pb-10 space-y-2">
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm font-bold" style={{ color: colors.textLight }}>Ground</span>
              <span className="text-sm font-bold" style={{ color: "#C9A84C66" }}>Works</span>
            </div>
            <span className="text-xs tracking-widest" style={{ color: colors.textLight, letterSpacing: "0.14em" }}>We work, You Decide</span>
          </div>
          <p className="text-xs" style={{ color: colors.textLight }}>
            This projection is based on Dubai market data and historical performance. Figures are indicative and may vary
            based on market conditions, property condition, and operator performance. Always verify with current market data.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.bgMain }}>
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: colors.primary, borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: colors.textMuted }}>Calculating your report...</p>
        </div>
      </div>
    }>
      <ReportContent />
    </Suspense>
  );
}
