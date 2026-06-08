"use client";

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

function StatCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl p-5" style={{ background: colors.bgSection, border: `1px solid ${highlight ? "#C9A84C55" : colors.primary}` }}>
      <p className="text-xs font-medium mb-1 tracking-wider" style={{ color: colors.textMuted }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color: highlight ? colors.primary : colors.textMain }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{sub}</p>}
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

        {/* Hero verdict */}
        <div className="rounded-2xl p-8 relative overflow-hidden"
          style={{ background: ltrRecommended ? `linear-gradient(135deg, ${colors.bgSection} 0%, ${colors.bgSection} 100%)` : `linear-gradient(135deg, ${colors.bgSection} 0%, ${colors.bgSection} 100%)`, border: `1px solid ${colors.primary}` }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5"
            style={{ background: ltrRecommended ? colors.mutedGreen : colors.primary, filter: "blur(80px)", transform: "translate(30%, -30%)" }} />
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: colors.primary }}>
              12-Month Forecast · {new Date().toLocaleDateString("en-AE", { month: "long", year: "numeric" })}
            </span>
            {result.buildingInfo && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#C9A84C22", color: "#C9A84C88" }}>
                {result.buildingInfo.community} · {result.buildingInfo.tier}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              `Floor ${result.floor}`,
              result.furnished,
              result.view,
              result.floorPremiumPct > 0 ? `+${Math.round(result.floorPremiumPct * 100)}% floor` : null,
              result.viewPremium > 0 ? `+${Math.round(result.viewPremium * 100)}% view` : null,
            ].filter(Boolean).map(tag => (
              <span key={tag!} className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: "#FFFFFF0A", color: colors.textLight, border: "1px solid #2A2A2A" }}>
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: colors.secondary }}>
            {strBetter ? "Short-term rental outperforms" : "Long-term rental is competitive"}
          </h1>
          <p className="text-base mb-6" style={{ color: colors.textLight }}>
            {strBetter
              ? `Your property could earn AED ${fmt(result.strVsLtrDelta)} more per year on short-term vs long-term rental.`
              : `Long-term rental offers more stability. STR net is AED ${fmt(Math.abs(result.strVsLtrDelta))} less than LTR this year.`}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs mb-1" style={{ color: colors.textMuted }}>STR Net/Year</p>
              <p className="text-xl font-bold" style={{ color: colors.primary }}>AED {fmt(result.annualNetToLandlord)}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: colors.textMuted }}>LTR/Year</p>
              <p className="text-xl font-bold" style={{ color: colors.secondary }}>AED {fmt(result.longTermRent)}</p>
              <p className="text-xs mt-0.5" style={{ color: colors.textLight }}>Source: {result.ltrSource}</p>
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

        {/* Key metrics */}
        <div className="rounded-2xl p-6" style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
          <h2 className="text-sm font-semibold tracking-wider uppercase mb-4" style={{ color: colors.textMuted }}>Key Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="ANNUAL REVENUE (GROSS)" value={`AED ${fmt(result.annualRevenue)}`} highlight />
            <StatCard label="NET TO LANDLORD" value={`AED ${fmt(result.annualNetToLandlord)}`} sub="After all deductions" />
            <StatCard label="MANAGEMENT FEES" value={`AED ${fmt(result.annualManagementFee)}`} sub={`${(input.managementFee * 100).toFixed(0)}% of revenue`} />
            <StatCard label="UTILITIES + MAINTENANCE" value={`AED ${fmt(result.annualUtilities + result.annualMaintenance)}`} sub="DEWA, AC, DU, upkeep" />
            {result.grossYield !== undefined && (
              <StatCard label="GROSS YIELD" value={`${result.grossYield.toFixed(2)}%`} highlight sub="Based on property value" />
            )}
            {result.netYield !== undefined && (
              <StatCard label="NET YIELD" value={`${result.netYield.toFixed(2)}%`} sub="After all deductions" />
            )}
            <StatCard label="STR vs LTR DELTA" value={`${strBetter ? "+" : ""}AED ${fmt(result.strVsLtrDelta)}`}
              sub={strBetter ? "STR earns more" : "LTR earns more"} />
            <StatCard label="AVERAGE DAILY RATE" value={`AED ${fmt(result.avgADR)}`} sub="Blended across 12 months" />
          </div>
        </div>

        {/* STR vs LTR chart */}
        <div className="rounded-2xl p-6" style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
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
              <CartesianGrid strokeDasharray="3 3" stroke={colors.primary} />
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

        {/* Revenue & Occupancy */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl p-6" style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
            <h2 className="text-base font-semibold mb-1" style={{ color: colors.secondary }}>Monthly Gross Revenue</h2>
            <p className="text-xs mb-6" style={{ color: colors.textMuted }}>Seasonal demand patterns drive revenue distribution</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.primary} />
                <XAxis dataKey="month" tick={{ fill: colors.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: colors.textMuted, fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Revenue" fill={colors.primary} radius={[4, 4, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl p-6" style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
            <h2 className="text-base font-semibold mb-1" style={{ color: colors.secondary }}>Monthly Occupancy Rate</h2>
            <p className="text-xs mb-6" style={{ color: colors.textMuted }}>Dubai peak season: Nov–Mar; low season: Jun–Aug</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.primary} />
                <XAxis dataKey="month" tick={{ fill: colors.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: colors.textMuted, fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}%`} domain={[0, 100]} />
                <Tooltip formatter={(v) => [`${v}%`, "Occupancy"]} />
                <ReferenceLine y={60} stroke={colors.primary + "44"} strokeDasharray="4 4" />
                <Bar dataKey="Occupancy" fill={colors.secondary} radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly breakdown table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid " + colors.primary }}>
          <div className="px-6 py-4" style={{ background: colors.bgSection, borderBottom: "1px solid " + colors.primary }}>
            <h2 className="text-base font-semibold" style={{ color: colors.textMain }}>Monthly Breakdown</h2>
            <p className="text-xs" style={{ color: colors.textMuted }}>Full 12-month projection with all income and cost lines</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: colors.bgSection, borderBottom: "1px solid " + colors.primary }}>
                  {["Month","Revenue","Occupancy","ADR","Mgmt Fee","Utilities","Maintenance","Net to Landlord"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: colors.textMuted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.months.map((m, i) => (
                  <tr key={m.month} style={{ borderBottom: "1px solid " + colors.primary, background: i % 2 === 0 ? colors.bgMain : colors.bgSection }}>
                    <td className="px-4 py-3 font-medium" style={{ color: colors.textMain }}>{m.month}</td>
                    <td className="px-4 py-3" style={{ color: colors.primary }}>AED {fmt(m.revenue)}</td>
                    <td className="px-4 py-3" style={{ color: colors.textMain }}>{(m.occupancy * 100).toFixed(0)}%</td>
                    <td className="px-4 py-3" style={{ color: colors.textMain }}>AED {fmt(m.adr)}</td>
                    <td className="px-4 py-3" style={{ color: colors.textLight }}>AED {fmt(m.managementFee)}</td>
                    <td className="px-4 py-3" style={{ color: colors.textLight }}>AED {fmt(m.utilities)}</td>
                    <td className="px-4 py-3" style={{ color: colors.textLight }}>AED {fmt(m.maintenance)}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: colors.textMain }}>AED {fmt(m.netToLandlord)}</td>
                  </tr>
                ))}
                <tr style={{ background: colors.bgSection, borderTop: "1px solid " + colors.primary }}>
                  <td className="px-4 py-3 font-bold" style={{ color: colors.primary }}>TOTAL</td>
                  <td className="px-4 py-3 font-bold" style={{ color: colors.primary }}>AED {fmt(result.annualRevenue)}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: colors.textMain }}>{(result.avgOccupancy * 100).toFixed(0)}% avg</td>
                  <td className="px-4 py-3 font-bold" style={{ color: colors.textMain }}>AED {fmt(result.avgADR)} avg</td>
                  <td className="px-4 py-3 font-bold" style={{ color: colors.textLight }}>AED {fmt(result.annualManagementFee)}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: colors.textLight }}>AED {fmt(result.annualUtilities)}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: colors.textLight }}>AED {fmt(result.annualMaintenance)}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: colors.primary }}>AED {fmt(result.annualNetToLandlord)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>


        {/* Part 2 CTA — Operator or Agent depending on recommendation */}
        {ltrRecommended ? (
          <div className="rounded-2xl p-8 text-center"
            style={{ background: "linear-gradient(135deg, #0A1400 0%, #081000 100%)", border: "1px solid " + colors.primary }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: colors.mutedGreen }}>Part 2 of 2</p>
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.secondary }}>Find your leasing agent</h2>
            <p className="text-sm mb-6" style={{ color: colors.textLight }}>
              Get your top 5 leasing agent matches for <span style={{ color: colors.secondary }}>{result.buildingInfo?.community ?? result.buildingName}</span> — ranked by area expertise, days to let, and landlord review scores.
            </p>
            <button
              onClick={() => {
                const p = new URLSearchParams(window.location.search);
                window.location.href = `/agents?${p.toString()}`;
              }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-all"
              style={{ background: "linear-gradient(135deg, #4A8A4A, #7ABF7A)", color: "#000" }}>
              Find a Leasing Agent →
            </button>
          </div>
        ) : (
          <div className="rounded-2xl p-8 text-center"
            style={{ background: `linear-gradient(135deg, ${colors.bgSection} 0%, ${colors.bgSection} 100%)`, border: "1px solid " + colors.primary }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: colors.primary }}>Part 2 of 2</p>
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.textMain }}>Now find your best operator</h2>
            <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
              Get your top 5 operator matches — ranked by fit for your property, with full pros & cons,
              OTA platform ratings, and recent guest reviews.
            </p>
            <button
              onClick={() => {
                const p = new URLSearchParams(window.location.search);
                window.location.href = `/operators?${p.toString()}`;
              }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-all"
              style={{ background: "linear-gradient(135deg, #C9A84C, #E8D5A3)", color: "#000" }}>
              Find My Best Operator →
            </button>
          </div>
        )}

        {/* Self Manage Alternative CTA */}
        <div className="rounded-2xl p-8 text-center" style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: colors.primary }}>Alternative Path</p>
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.textMain }}>Want to keep 100% of your income?</h2>
          <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
            Learn how to manage your property yourself and handle all operations independently in Dubai.
          </p>
          <button
            onClick={() => {
              const p = new URLSearchParams(window.location.search);
              window.location.href = `/self-manage?${p.toString()}`;
            }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-all"
            style={{ background: colors.primary, color: "#FFF" }}>
            Find Out How to Self Manage →
          </button>
        </div>

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
