"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine, ComposedChart, Line,
} from "recharts";
import {
  runEstimator,
  fmt, UnitSize, UnitType, OCCStrategy, ViewType, FurnishedStatus, EstimatorOutput, PropertyCondition,
  BUILDING_DIRECTORY, getBuildingInfo,
} from "@/lib/estimator";
import { DLD_AREA_TO_COMMUNITY } from "@/lib/dld-area-map";
import { checkSTRViability } from "@/lib/str-viability";
import { colors } from "@/lib/colors";
import AssetIntelLogo from "@/components/AssetIntelLogo";
import DecorativeBackdrop from "@/components/DecorativeBackdrop";
import AreaIntelligence from "@/components/report/AreaIntelligence";
import AccessGate from "@/components/AccessGate";
import RecentTransactions from "@/components/report/RecentTransactions";
import { createClient } from "@/lib/supabase/client";
import { PRIORITY_OPTIONS, Priority } from "@/lib/operator-match";

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
        borderRadius: "28px",
        padding: "34px 32px",
        background: bg,
        border: `1px solid ${accent}33`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 14px 40px rgba(0,0,0,0.06)",
      }}
    >
      {/* LEFT decorative watermark */}
      {isBronze ? (
        <img
          src="/Locations/Downtown.png"
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
        <p className="text-xs font-bold uppercase mb-2" style={{ color: eyebrowColor, letterSpacing: "0.18em" }}>{eyebrow}</p>
        <div className="flex items-center justify-center gap-3 mb-4">
          <span style={{ width: "60px", height: "1px", background: `${accent}40` }} />
          <svg width="9" height="9" viewBox="0 0 9 9"><rect x="4.5" y="0" width="6.4" height="6.4" transform="rotate(45 4.5 0)" fill="none" stroke={accent} strokeWidth="1" /></svg>
          <span style={{ width: "60px", height: "1px", background: `${accent}40` }} />
        </div>

        {/* Heading with green→bronze gradient */}
        <h2 className="font-bold mb-2" style={{
          fontFamily: "'Georgia', serif",
          fontSize: "26px",
          lineHeight: 1.18,
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          {heading}
        </h2>

        <p className="text-sm mb-5 max-w-lg mx-auto" style={{ color: colors.textMuted, lineHeight: 1.6 }}>
          {description}
        </p>

        <button
          onClick={onClick}
          className="inline-flex items-center gap-2 font-bold text-sm transition-all hover:-translate-y-0.5 hover:brightness-105"
          style={{
            padding: "11px 26px",
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

function ReportContent({ overrideParams, snapshotResult, snapshotId }: {
  overrideParams?: URLSearchParams;
  snapshotResult?: EstimatorOutput;
  snapshotId?: string;
}) {
  const searchParams = useSearchParams();
  const params = overrideParams ?? searchParams;
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
    sizeSqft: params.get("sizeSqm") ? Number(params.get("sizeSqm")) * 10.7639 : undefined,
    dldKey: params.get("dldKey") ?? undefined,
    dldArea: params.get("dldArea") ?? undefined,
    propertyCondition: (params.get("propertyCondition") ?? "Standard") as PropertyCondition,
  };

  const lrOverride = Number(params.get("lr")) || 0;

  // A saved report is a frozen snapshot — use it as-is, never recompute.
  const staticResult: EstimatorOutput = snapshotResult ?? runEstimator(
    lrOverride > 0 ? { ...input, longTermRentOverride: lrOverride } : input
  );
  const [result, setResult] = useState<EstimatorOutput>(staticResult);
  const [ltrSource, setLtrSource] = useState<"static" | "dda-live">(
    snapshotResult ? "dda-live" : (lrOverride > 0 ? "dda-live" : "static")
  );
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [saved, setSaved] = useState(!!snapshotId);
  const [saving, setSaving] = useState(false);
  const [operatorSent, setOperatorSent] = useState(false);
  const [operatorSending, setOperatorSending] = useState(false);
  const [showOperatorPriorities, setShowOperatorPriorities] = useState(false);
  const [operatorPriorities, setOperatorPriorities] = useState<Priority[]>([]);
  const [savedReportId, setSavedReportId] = useState<string | null>(snapshotId ?? null);
  const reportLoggedRef = useRef(false);

  async function handleSave() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login?next=" + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }
    setSaving(true);
    const reportParams: Record<string, string> = {};
    params.forEach((v, k) => { reportParams[k] = v; });
    const { data } = await supabase.from("saved_reports").insert({
      user_id: user.id,
      building_name: input.buildingName || input.propertyName,
      unit_size: input.unitSize,
      floor: input.floor,
      recommendation: result.strVsLtrDelta > 0 ? "STR" : "LTR",
      str_net_annual: Math.round(result.annualNetToLandlord),
      ltr_annual: Math.round(result.longTermRent),
      report_params: reportParams,
      // Freeze the exact computed output + which LTR source/value was used, so
      // reopening this report later renders this snapshot instead of
      // re-running the estimator against whatever DLD data looks like then.
      result_snapshot: result,
      lr_used: lrOverride > 0 ? lrOverride : null,
    }).select("id").single();
    setSaving(false);
    setSaved(true);
    if (data?.id) setSavedReportId(data.id);
  }

  // Log every report generation for the admin panel — independent of whether
  // the visitor clicks "Save". Fires once per page view.
  useEffect(() => {
    if (reportLoggedRef.current || snapshotId) return;
    reportLoggedRef.current = true;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      try {
        await fetch("/api/report-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reportType: "rental_analyzer",
            userId: user?.id,
            name: user?.user_metadata?.full_name || null,
            email: user?.email || null,
            phone: user?.user_metadata?.whatsapp || null,
            buildingName: input.buildingName || input.propertyName,
            unitSize: input.unitSize,
            params: Object.fromEntries(params.entries()),
            resultSnapshot: result,
          }),
        });
      } catch {
        // Non-fatal — the report itself already rendered successfully.
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleOperatorMatch(priorities: Priority[]) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email;
    if (!email) {
      router.push("/login?next=" + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }
    const name = user.user_metadata?.full_name || "";
    setOperatorSending(true);
    await fetch("/api/send-operator-match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email, priorities,
        name: name || undefined,
        buildingName: input.buildingName || result.buildingName || result.propertyName || undefined,
      }),
    });
    setOperatorSending(false);
    setOperatorSent(true);
  }

  async function generatePDF() {
    setPdfGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const W  = doc.internal.pageSize.getWidth();
      const H  = doc.internal.pageSize.getHeight();
      const ml = 38, mr = 38;
      const cw = W - ml - mr;
      const footerH = 30;

      // ── Design tokens (AssetIntel "Chartered Estate") ──────────────
      type RGB = [number, number, number];
      const GREEN: RGB      = [27, 94, 74];
      const GREEN_DK: RGB   = [15, 62, 51];
      const BRONZE: RGB     = [184, 138, 68];
      const BRONZE_TX: RGB  = [125, 99, 56];
      const IVORY: RGB      = [248, 244, 238];
      const CARD: RGB       = [253, 251, 247];
      const SAGE: RGB       = [239, 244, 240];
      const SAGE_BD: RGB    = [200, 218, 208];
      const BORDER: RGB     = [230, 225, 216];
      const TEXT: RGB       = [26, 26, 26];
      const MUTED: RGB      = [107, 107, 107];
      const LIGHT: RGB      = [142, 142, 142];
      const RED: RGB        = [168, 76, 76];
      const WHITE: RGB      = [255, 255, 255];

      const SERIF = "times", SANS = "helvetica";

      const strBetter = result.strVsLtrDelta > 0;
      const money = (n: number) => "AED " + Math.round(n).toLocaleString();
      const pct   = (n: number) => (n * 100).toFixed(0) + "%";
      const dateStr = new Date().toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" });

      function txt(
        s: string, x: number, y: number,
        o?: { size?: number; bold?: boolean; color?: RGB; align?: "left"|"right"|"center"; serif?: boolean; spacing?: number }
      ) {
        const { size = 8, bold = false, color = TEXT, align = "left", serif = false, spacing = 0 } = o ?? {};
        doc.setCharSpace(spacing);
        doc.setFontSize(size);
        doc.setFont(serif ? SERIF : SANS, bold ? "bold" : "normal");
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(s, x, y, { align });
        doc.setCharSpace(0);
      }

      // Patterned AssetIntel background — ivory base, faint dot grid, soft contours.
      function paintBackground() {
        doc.setFillColor(...IVORY);
        doc.rect(0, 0, W, H, "F");
        doc.setFillColor(238, 233, 224);
        for (let x = 16; x < W; x += 17) {
          for (let y = 16; y < H; y += 17) doc.circle(x, y, 0.5, "F");
        }
        doc.setLineWidth(1.1);
        doc.setDrawColor(236, 229, 217);
        doc.circle(W * 0.94, H * 0.12, 165, "S");
        doc.circle(W * 0.06, H * 0.80, 200, "S");
        doc.setDrawColor(233, 238, 233);
        doc.circle(W * 0.98, H * 0.58, 130, "S");
        doc.circle(W * 0.02, H * 0.30, 110, "S");
      }

      function card(x: number, y: number, w: number, h: number, o?: { fill?: RGB; border?: RGB; r?: number }) {
        const { fill = CARD, border = BORDER, r = 9 } = o ?? {};
        doc.setFillColor(...fill);
        doc.setDrawColor(...border);
        doc.setLineWidth(0.7);
        doc.roundedRect(x, y, w, h, r, r, "FD");
      }

      function eyebrow(label: string, x: number, y: number, color: RGB = BRONZE_TX) {
        txt(label, x, y, { size: 6.6, bold: true, color, spacing: 1.1 });
      }

      // ── Assets ────────────────────────────────────────────────────
      // Source art is far higher resolution than the small areas it occupies here;
      // embedding it raw produced a ~9MB file. Downscale (and JPEG the photo) so the
      // report stays light enough to email onward.
      async function loadImg(path: string, maxW: number, asJpeg = false): Promise<string | null> {
        try {
          const blob = await fetch(path).then(r => r.ok ? r.blob() : Promise.reject());
          const raw = await new Promise<string>((res, rej) => {
            const fr = new FileReader();
            fr.onload = () => res(fr.result as string);
            fr.onerror = rej;
            fr.readAsDataURL(blob);
          });
          return await new Promise<string>(res => {
            const im = new window.Image();
            im.onload = () => {
              const scale = Math.min(1, maxW / (im.width || maxW));
              const c = document.createElement("canvas");
              c.width = Math.max(1, Math.round(im.width * scale));
              c.height = Math.max(1, Math.round(im.height * scale));
              const ctx = c.getContext("2d");
              if (!ctx) return res(raw);
              if (asJpeg) { ctx.fillStyle = "#F8F4EE"; ctx.fillRect(0, 0, c.width, c.height); }
              ctx.drawImage(im, 0, 0, c.width, c.height);
              try { res(c.toDataURL(asJpeg ? "image/jpeg" : "image/png", asJpeg ? 0.82 : 1)); }
              catch { res(raw); }
            };
            im.onerror = () => res(raw);
            im.src = raw;
          });
        } catch { return null; }
      }
      const [logoImg, heroImg] = await Promise.all([
        loadImg("/brand/assetintel-icon.png", 96),
        loadImg("/BURJ.png", 720, true),
      ]);

      // ── Area market data — DB only, never a live AirROI/Airbtics call ──
      const areaName: string | undefined =
        result.buildingInfo?.area
        || getBuildingInfo(result.buildingName)?.area
        || (input.dldArea ? (DLD_AREA_TO_COMMUNITY[input.dldArea] ?? input.dldArea) : undefined);

      type AreaRow = {
        area: string; reporting_month: string; updated_at: string;
        sales_transactions: number | null; median_sale_price_per_sqft: number | null;
        rental_transactions: number | null; median_annual_rent: number | null; ltr_yield: number | null;
        adr: number | null; occupancy: number | null; revpar: number | null;
        active_listings: number | null; estimated_str_revenue: number | null;
        demand_trend: string | null; confidence: string | null; data_sources: string | null;
        airbtics_adr: number | null; airbtics_occupancy: number | null; airbtics_revpar: number | null;
        airbtics_active_listings: number | null;
      };
      let area: AreaRow | null = null;
      try {
        const r = await fetch("/api/str-market-data");
        const { data } = await r.json();
        area = (data as AreaRow[]).find(d => d.area === areaName) ?? null;
      } catch { /* page 2 degrades to an unavailable notice */ }

      // Airbtics is the primary STR source; AirROI only supplies areas Airbtics
      // has no market for. Label whichever actually produced the stored figures.
      // "airroi+airbtics" is legacy data written before Airbtics became primary; it is
      // still genuinely blended, so it must keep saying so until the cron rewrites the row.
      const strSource = area?.data_sources === "airroi" ? "AirROI"
        : area?.data_sources === "airroi+airbtics" ? "AirROI + Airbtics (blended)"
        : "Airbtics";
      const strChip = area?.data_sources === "airroi" ? "AIRROI"
        : area?.data_sources === "airroi+airbtics" ? "BLENDED" : "AIRBTICS";

      const unitLabel = input.unitSize === "STU" ? "Studio"
        : /^\d/.test(input.unitSize) ? input.unitSize.replace(/^(\d+)BR\s*/, "$1 Bedroom ").trim()
        : input.unitSize;
      // Building name alone — propertyName already repeats unit/floor shown on line two.
      const propLine1 = input.buildingName || result.buildingName || result.propertyName || "Property";
      const propLine2 = [
        areaName,
        [unitLabel, input.unitType].filter(Boolean).join(" "),
        input.floor ? "Floor " + input.floor : null,
        input.view, input.furnished,
        input.propertyCondition ? input.propertyCondition + " condition" : null,
      ].filter(Boolean).join("  ·  ");

      // ── Shared header on EVERY page ───────────────────────────────
      function header(title: string, tall = false): number {
        const h = tall ? 136 : 86;
        if (tall && heroImg) {
          // Imagery occupies the right ~34% of the header band only.
          const iw = W * 0.34;
          doc.addImage(heroImg, "JPEG", W - iw, 0, iw, h, "aiHero", "FAST");
          // Soft ivory fade back into the page from the left edge of the photo.
          const steps = 18, fw = iw * 0.55;
          for (let i = 0; i < steps; i++) {
            const t = i / steps;
            doc.setFillColor(...IVORY);
            doc.setGState(new (doc as any).GState({ opacity: 1 - t }));
            doc.rect(W - iw + (fw * t), 0, fw / steps + 1.2, h, "F");
          }
          doc.setGState(new (doc as any).GState({ opacity: 1 }));
          doc.setFillColor(...IVORY);
          doc.rect(0, 0, W - iw, h, "F");
        }
        // Alias keeps a single copy of the mark in the file across all pages.
        if (logoImg) doc.addImage(logoImg, "PNG", ml, tall ? 22 : 16, 22, 22, "aiLogo", "FAST");
        txt("AssetIntel", ml + 28, tall ? 38 : 32, { size: 12, bold: true, color: GREEN, serif: true });
        txt(dateStr, W - mr, tall ? 36 : 30, { size: 7, color: LIGHT, align: "right" });
        txt(title, ml, tall ? 72 : 54, { size: tall ? 15 : 10.5, bold: true, color: GREEN, serif: true });
        txt(propLine1, ml, tall ? 92 : 66, { size: tall ? 10 : 8, bold: true, color: TEXT });
        // Wrap rather than hard-truncating, and never leave a dangling separator.
        const maxW = cw - (tall ? W * 0.36 : 0);
        const wrapped = (doc.splitTextToSize(propLine2, maxW) as string[]).slice(0, tall ? 2 : 1);
        wrapped.forEach((ln, i) => {
          txt(ln.replace(/\s*·\s*$/, ""), ml, (tall ? 104 : 76) + i * 9.5,
            { size: tall ? 7.8 : 6.8, color: MUTED });
        });
        doc.setFillColor(...BRONZE);
        doc.rect(ml, h - 8, cw, 1.4, "F");
        return h + (tall ? 14 : 12);
      }

      // ══════════════════════════════════════════════════════════════
      // PAGE 1 — PROPERTY RENTAL STRATEGY
      // ══════════════════════════════════════════════════════════════
      paintBackground();
      eyebrow("ASSETINTEL PROPERTY INTELLIGENCE", ml, 16);
      let y = header("Property Rental Strategy", true);

      // ── Recommendation card ───────────────────────────────────────
      const recH = 70;
      card(ml, y, cw, recH, { fill: strBetter ? SAGE : [250, 246, 238], border: strBetter ? SAGE_BD : [225, 210, 185] });
      doc.setFillColor(...(strBetter ? GREEN : BRONZE));
      doc.roundedRect(ml, y, 5, recH, 3, 3, "F");
      eyebrow("ASSETINTEL RECOMMENDATION", ml + 18, y + 18);
      const recTitle = strBetter ? "Short-Term Rental Recommended" : "Long-Term Rental Recommended";
      txt(recTitle, ml + 18, y + 40, { size: 15, bold: true, color: strBetter ? GREEN : BRONZE_TX, serif: true });
      const advLabel = strBetter ? "Projected STR advantage" : "Projected LTR advantage";
      txt(advLabel + ":", ml + 18, y + 57, { size: 7.5, color: MUTED });
      txt(money(Math.abs(result.strVsLtrDelta)) + " annually",
        ml + 18 + doc.getTextWidth(advLabel + ": ") + 4, y + 57, { size: 8.5, bold: true, color: TEXT });
      y += recH + 14;

      // ── Four KPI cards (recommended strategy visually stronger) ────
      const kpiH = 56, kgap = 10, kw = (cw - kgap) / 2;
      function kpi(x: number, yy: number, w: number, label: string, value: string, sub: string, strong: boolean) {
        card(x, yy, w, kpiH, {
          fill: strong ? SAGE : CARD,
          border: strong ? SAGE_BD : BORDER,
        });
        doc.setFillColor(...(strong ? GREEN : BRONZE));
        doc.roundedRect(x, yy, 3.5, kpiH, 2, 2, "F");
        txt(label, x + 14, yy + 16, { size: 6.4, bold: true, color: LIGHT, spacing: 0.9 });
        txt(value, x + 14, yy + 36, { size: 15, bold: true, color: strong ? GREEN : TEXT, serif: true });
        if (sub) txt(sub, x + 14, yy + 48, { size: 6.2, color: LIGHT });
      }
      const ltrSub = result.ltrBasis === "dld-building" ? "DLD Ejari · building level"
        : result.ltrBasis === "dld-master" ? "DLD Ejari · community level"
        : result.ltrBasis === "dld-area" ? "DLD Ejari · area level" : "AssetIntel market estimate";
      kpi(ml,            y, kw, "STR NET / YEAR",    money(result.annualNetToLandlord), "After all deductions", strBetter);
      kpi(ml + kw+kgap,  y, kw, "LTR / YEAR",        money(result.longTermRent),        ltrSub,                 !strBetter);
      y += kpiH + kgap;
      kpi(ml,            y, kw, "AVG STR OCCUPANCY", pct(result.avgOccupancy),          "Annual average",       false);
      kpi(ml + kw+kgap,  y, kw, "AVG STR ADR",       money(result.avgADR),              "Per night · annual avg", false);
      y += kpiH + 16;

      // ── STR revenue → owner flow ──────────────────────────────────
      eyebrow("STR REVENUE TO OWNER", ml, y);
      y += 10;
      const flowRows: Array<{ l: string; v: number; note: string; kind: "top"|"ded"|"net" }> = [
        { l: "Gross STR Revenue",   v: result.annualRevenue,                 note: "Projected annual gross", kind: "top" },
        { l: "Management Fee",      v: -result.annualManagementFee,          note: (input.managementFee * 100).toFixed(0) + "% of gross", kind: "ded" },
        { l: "Utilities",           v: -(result.annualUtilities ?? 0),       note: "DEWA, cooling, internet", kind: "ded" },
        { l: "Maintenance",         v: -(result.annualMaintenance ?? 0),     note: "Upkeep and minor repairs", kind: "ded" },
        { l: "Furniture Amortisation", v: -(result.annualFurnitureAmort ?? 0), note: "Annual depreciation", kind: "ded" },
        { l: "Projected Net To Owner", v: result.annualNetToLandlord,        note: "After all deductions", kind: "net" },
      ];
      flowRows.forEach(r => {
        const rh = r.kind === "net" ? 30 : 21;
        if (r.kind === "net") {
          doc.setFillColor(...GREEN);
          doc.roundedRect(ml, y, cw, rh, 6, 6, "F");
          txt(r.l, ml + 14, y + 19, { size: 8.5, bold: true, color: WHITE });
          txt(money(r.v), ml + cw - 14, y + 19, { size: 11, bold: true, color: [230, 201, 171], align: "right", serif: true });
        } else if (r.kind === "top") {
          card(ml, y, cw, rh, { r: 6 });
          txt(r.l, ml + 14, y + 13.5, { size: 7.8, bold: true, color: GREEN });
          txt(r.note, ml + 14 + doc.getTextWidth(r.l) + 8, y + 13.5, { size: 6, color: LIGHT });
          txt(money(r.v), ml + cw - 14, y + 13.5, { size: 9, bold: true, color: GREEN, align: "right", serif: true });
        } else {
          doc.setFillColor(250, 247, 242);
          doc.setDrawColor(...BORDER);
          doc.setLineWidth(0.6);
          doc.roundedRect(ml + 16, y, cw - 32, rh, 5, 5, "FD");
          txt(r.l, ml + 30, y + 13.5, { size: 7.4, color: TEXT });
          txt(r.note, ml + 30 + doc.getTextWidth(r.l) + 8, y + 13.5, { size: 6, color: LIGHT });
          txt("- " + money(Math.abs(r.v)), ml + cw - 30, y + 13.5, { size: 7.8, bold: true, color: RED, align: "right" });
        }
        y += rh + 4;
      });
      y += 10;

      // ── Monthly net snapshot ──────────────────────────────────────
      const peak  = result.months.reduce((a, b) => (b.netToLandlord > a.netToLandlord ? b : a));
      const trough = result.months.reduce((a, b) => (b.netToLandlord < a.netToLandlord ? b : a));
      if (result.months.length === 12) {
        eyebrow("12-MONTH NET INCOME", ml, y);
        y += 12;
        const chH = 92;
        card(ml, y, cw, chH + 26, { r: 8 });
        const inner = cw - 28;
        const barW = (inner - 11 * 4) / 12;
        const maxNet = Math.max(...result.months.map(m => Math.abs(m.netToLandlord)), 1);
        result.months.forEach((m, i) => {
          const bx = ml + 14 + i * (barW + 4);
          const bh = Math.max(2.5, (Math.abs(m.netToLandlord) / maxNet) * (chH - 30));
          const by = y + 14 + (chH - 30) - bh;
          const isPeak = m.month === peak.month, isLow = m.month === trough.month;
          doc.setFillColor(...(isPeak ? GREEN : isLow ? ([206, 186, 152] as RGB) : ([166, 197, 182] as RGB)));
          doc.roundedRect(bx, by, barW, bh, 2, 2, "F");
          txt(m.month.slice(0, 3), bx + barW / 2, y + chH - 4, { size: 5.6, color: MUTED, align: "center" });
          const k = Math.abs(m.netToLandlord) >= 1000
            ? (m.netToLandlord / 1000).toFixed(0) + "k" : Math.round(m.netToLandlord).toString();
          txt(k, bx + barW / 2, by - 3.5, { size: 5.4, bold: isPeak || isLow, color: isPeak ? GREEN : LIGHT, align: "center" });
        });
        // Peak / lowest callouts
        const cy2 = y + chH + 4;
        doc.setFillColor(...SAGE);
        doc.roundedRect(ml + 14, cy2, (inner - 10) / 2, 17, 4, 4, "F");
        txt("PEAK MONTH", ml + 24, cy2 + 11, { size: 5.8, bold: true, color: GREEN, spacing: 0.7 });
        txt(peak.month + " · " + money(peak.netToLandlord), ml + 14 + (inner - 10) / 2 - 10, cy2 + 11,
          { size: 7, bold: true, color: GREEN, align: "right" });
        doc.setFillColor(250, 246, 238);
        doc.roundedRect(ml + 24 + (inner - 10) / 2, cy2, (inner - 10) / 2, 17, 4, 4, "F");
        txt("LOWEST MONTH", ml + 34 + (inner - 10) / 2, cy2 + 11, { size: 5.8, bold: true, color: BRONZE_TX, spacing: 0.7 });
        txt(trough.month + " · " + money(trough.netToLandlord), ml + 14 + inner, cy2 + 11,
          { size: 7, bold: true, color: BRONZE_TX, align: "right" });
      }

      // ══════════════════════════════════════════════════════════════
      // PAGE 2 — AREA MARKET INTELLIGENCE
      // ══════════════════════════════════════════════════════════════
      doc.addPage();
      paintBackground();
      y = header("Area Market Intelligence");

      if (!area) {
        card(ml, y, cw, 70);
        txt("Area market data unavailable", ml + 16, y + 28, { size: 11, bold: true, color: MUTED, serif: true });
        txt(areaName
          ? "No stored market record for " + areaName + " at the time this report was generated."
          : "This property's area could not be matched to a tracked AssetIntel market.",
          ml + 16, y + 46, { size: 7.5, color: LIGHT });
        y += 84;
      } else {
        const refreshed = new Date(area.updated_at).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" });
        txt("Current property and STR market signals for " + area.area + ".", ml, y, { size: 9, color: MUTED });
        y += 13;
        txt("Data refreshed: " + refreshed + "     Sources: DLD · AirROI · Airbtics · AssetIntel", ml, y, { size: 6.6, color: LIGHT });
        y += 14;

        // ── Area KPI grid, 4 + 4 ────────────────────────────────────
        const akH = 46, akGap = 8, akW = (cw - akGap * 3) / 4;
        function areaKpi(col: number, row: number, label: string, value: string, src: string, srcColor: RGB) {
          const x = ml + col * (akW + akGap);
          const yy = y + row * (akH + akGap);
          card(x, yy, akW, akH);
          txt(label, x + 10, yy + 13, { size: 5.5, bold: true, color: LIGHT, spacing: 0.6 });
          txt(value, x + 10, yy + 30, { size: 11.5, bold: true, color: TEXT, serif: true });
          txt(src, x + 10, yy + 40, { size: 5.2, bold: true, color: srcColor, spacing: 0.5 });
        }
        const DLDC: RGB = GREEN, STRC: RGB = BRONZE_TX;
        const na = "Data unavailable";
        areaKpi(0, 0, "SALES TRANSACTIONS", area.sales_transactions != null ? area.sales_transactions.toLocaleString() : na, "DLD", DLDC);
        // The ingestion query pages at 1000, so an exact 1000 is a floor, not a count.
        const rentTx = area.rental_transactions;
        areaKpi(1, 0, "RENTAL TRANSACTIONS",
          rentTx == null ? na : rentTx >= 1000 ? "1,000+" : rentTx.toLocaleString(), "DLD", DLDC);
        areaKpi(2, 0, "MEDIAN SALE AED/SQFT", area.median_sale_price_per_sqft != null ? Math.round(area.median_sale_price_per_sqft).toLocaleString() : na, "DLD", DLDC);
        areaKpi(3, 0, "MEDIAN ANNUAL RENT", area.median_annual_rent != null ? money(area.median_annual_rent) : na, "DLD", DLDC);
        areaKpi(0, 1, "AREA LTR YIELD", area.ltr_yield != null ? area.ltr_yield.toFixed(1) + "%" : na, "DLD · ASSETINTEL", DLDC);
        areaKpi(1, 1, "STR ADR", area.adr != null ? money(area.adr) : na, strChip, STRC);
        areaKpi(2, 1, "STR OCCUPANCY", area.occupancy != null ? pct(area.occupancy) : na, strChip, STRC);
        areaKpi(3, 1, "STR REVPAR", area.revpar != null ? money(area.revpar) : na, strChip, STRC);
        y += akH * 2 + akGap + 16;

        // ── STR market benchmark ────────────────────────────────────
        eyebrow("STR MARKET BENCHMARK", ml, y);
        y += 10;
        const bH = 92;
        card(ml, y, cw, bH, { fill: SAGE, border: SAGE_BD });
        txt("Source: " + strSource, ml + cw - 14, y + 17, { size: 6.5, bold: true, color: BRONZE_TX, align: "right", spacing: 0.5 });
        const benchRows: Array<{ label: string; v: number | null; fmt: (n: number) => string }> = [
          { label: "ADR",       v: area.adr,       fmt: money },
          { label: "Occupancy", v: area.occupancy, fmt: pct },
          { label: "RevPAR",    v: area.revpar,    fmt: money },
        ];
        const bcW = (cw - 28) / 3;
        benchRows.forEach((r, i) => {
          const x = ml + 14 + i * bcW;
          txt(r.label.toUpperCase(), x, y + 34, { size: 5.8, bold: true, color: LIGHT, spacing: 0.7 });
          txt(r.v != null ? r.fmt(r.v) : "Data unavailable",
            x, y + 52, { size: 13, bold: true, color: GREEN, serif: true });
        });
        const listingsTxt = area.active_listings != null
          ? "Active listings  ·  " + area.active_listings.toLocaleString() + " (" + strSource + ")"
          : "Active listings  ·  data unavailable";
        txt(listingsTxt, ml + 14, y + bH - 20, { size: 6.4, color: MUTED });
        const conf = area.confidence ? area.confidence.charAt(0).toUpperCase() + area.confidence.slice(1) : "Not stated";
        txt("Data confidence: " + conf + (area.demand_trend ? "     Demand trend: " + area.demand_trend : ""),
          ml + 14, y + bH - 9, { size: 6.4, color: MUTED });
        y += bH + 16;

        // ── Property vs area benchmark ──────────────────────────────
        eyebrow("YOUR PROPERTY VS AREA BENCHMARK", ml, y);
        y += 10;
        const pvH = 76;
        card(ml, y, cw, pvH);
        const cmp: Array<{ label: string; prop: number | null; areaV: number | null; fmt: (n: number) => string }> = [
          { label: "ADR",       prop: result.avgADR,       areaV: area.adr,       fmt: money },
          { label: "Occupancy", prop: result.avgOccupancy, areaV: area.occupancy, fmt: pct },
        ];
        const cW2 = cw / cmp.length;
        cmp.forEach((c, i) => {
          const x = ml + i * cW2 + 16;
          txt(c.label.toUpperCase(), x, y + 16, { size: 5.8, bold: true, color: LIGHT, spacing: 0.7 });
          txt("Your property", x, y + 32, { size: 6.6, color: MUTED });
          txt(c.prop != null ? c.fmt(c.prop) : "n/a", x + 74, y + 32, { size: 8.4, bold: true, color: GREEN, serif: true });
          txt("Area benchmark", x, y + 46, { size: 6.6, color: MUTED });
          txt(c.areaV != null ? c.fmt(c.areaV) : "Data unavailable", x + 74, y + 46, { size: 8.4, bold: true, color: TEXT, serif: true });
          if (c.prop != null && c.areaV != null && c.areaV !== 0) {
            const d = (c.prop - c.areaV) / c.areaV;
            const status = d > 0.05 ? "Above area benchmark" : d < -0.05 ? "Below area benchmark" : "In line with area";
            const sc: RGB = d > 0.05 ? GREEN : d < -0.05 ? RED : MUTED;
            txt(status, x, y + 62, { size: 6.6, bold: true, color: sc });
          }
        });
        y += pvH + 16;

        // ── AssetIntel interpretation, generated only from present data ──
        const bits: string[] = [];
        if (area.sales_transactions != null && area.rental_transactions != null) {
          bits.push(area.area + " recorded " + area.sales_transactions.toLocaleString() + " sales and "
            + (area.rental_transactions >= 1000 ? "1,000+" : area.rental_transactions.toLocaleString()) + " rental transactions in the latest reporting month, indicating "
            + (area.sales_transactions + area.rental_transactions > 800 ? "high" : "moderate") + " transaction liquidity.");
        }
        if (area.adr != null && area.occupancy != null) {
          bits.push("STR benchmarks sit at " + money(area.adr) + " ADR and " + pct(area.occupancy) + " occupancy.");
        }
        if (result.avgADR && area.adr) {
          const d = (result.avgADR - area.adr) / area.adr;
          bits.push("This unit is modelled " + (Math.abs(d) < 0.05 ? "in line with" : d > 0 ? "above" : "below")
            + " the area ADR benchmark, so building quality, view and furnishing remain the decisive drivers of the achieved rate.");
        }
        bits.push("STR figures are sourced from " + strSource + "; AssetIntel does not merge providers, so the origin of every market number stays traceable.");
        const interp = bits.slice(0, 4).join(" ");
        if (interp) {
          eyebrow("WHAT THIS AREA DATA MEANS", ml, y);
          y += 10;
          const iLines = doc.splitTextToSize(interp, cw - 32);
          const iH = 16 + iLines.length * 10;
          card(ml, y, cw, iH, { fill: [250, 247, 241], border: [228, 218, 200] });
          doc.setFillColor(...BRONZE);
          doc.roundedRect(ml, y, 4, iH, 2, 2, "F");
          doc.setFontSize(7.4); doc.setFont(SANS, "normal"); doc.setTextColor(...TEXT);
          doc.text(iLines, ml + 16, y + 16);
          y += iH + 12;
        }
        // Single-period honesty note — no month-over-month or trend chart is possible yet.
        txt("Month-over-month change and 12-month trend charts are omitted: only one reporting period is currently stored for this area.",
          ml, y + 4, { size: 6.2, color: LIGHT });
      }

      // ══════════════════════════════════════════════════════════════
      // PAGE 3 — 12-MONTH FINANCIAL PROJECTION
      // ══════════════════════════════════════════════════════════════
      doc.addPage();
      paintBackground();
      y = header("12-Month Financial Projection");

      const tH2 = ["Month", "Revenue", "Occupancy", "ADR", "Total Costs", "Net To Owner"];
      const tW2 = [58, 88, 62, 78, 84, 91];
      const tTot = tW2.reduce((a, b) => a + b, 0);
      const tX = ml + (cw - tTot) / 2;
      const rowH2 = 17;

      doc.setFillColor(...GREEN);
      doc.roundedRect(tX, y, tTot, rowH2 + 3, 5, 5, "F");
      let cx = tX;
      tH2.forEach((h, i) => {
        txt(h, i === 0 ? cx + 8 : cx + tW2[i] - 6, y + 12.5,
          { size: 6.8, bold: true, color: WHITE, align: i === 0 ? "left" : "right" });
        cx += tW2[i];
      });
      y += rowH2 + 3;

      result.months.forEach((m, idx) => {
        const totalCosts = m.managementFee + m.utilities + m.maintenance + m.furnitureAmort;
        doc.setFillColor(...(idx % 2 === 0 ? CARD : ([249, 246, 240] as RGB)));
        doc.rect(tX, y, tTot, rowH2, "F");
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.3);
        doc.line(tX, y + rowH2, tX + tTot, y + rowH2);
        doc.setFillColor(...GREEN);
        doc.rect(tX, y, 2.2, rowH2, "F");
        const cells: Array<{ t: string; c: RGB; b?: boolean; s?: boolean }> = [
          { t: m.month,                c: GREEN, b: true },
          { t: money(m.revenue),       c: TEXT },
          { t: pct(m.occupancy),       c: MUTED },
          { t: money(m.adr),           c: BRONZE_TX },
          { t: money(totalCosts),      c: MUTED },
          { t: money(m.netToLandlord), c: m.netToLandlord >= 0 ? GREEN : RED, b: true, s: true },
        ];
        cx = tX;
        cells.forEach((c, i) => {
          txt(c.t, i === 0 ? cx + 9 : cx + tW2[i] - 6, y + 11.5,
            { size: 6.8, bold: c.b ?? false, color: c.c, align: i === 0 ? "left" : "right", serif: c.s });
          cx += tW2[i];
        });
        y += rowH2;
      });
      y += 16;

      // ── Seasonality at a glance ───────────────────────────────────
      eyebrow("SEASONALITY AT A GLANCE", ml, y);
      y += 10;
      const sH = 50, sGap = 10, sW = (cw - sGap * 2) / 3;
      // Derived from the month itself — result.months starts at Jun, so an index-based
      // mapping labelled December "Summer period".
      const pkm = peak.month.slice(0, 3);
      const season = ["Nov","Dec","Jan","Feb","Mar"].includes(pkm) ? "Winter high season"
        : ["Jun","Jul","Aug","Sep"].includes(pkm) ? "Summer low season" : "Shoulder season";
      ([
        { l: "PEAK PERIOD",       v: season,                          s: peak.month + " strongest" , strong: true },
        { l: "PEAK NET MONTH",    v: money(peak.netToLandlord),       s: peak.month,                strong: true },
        { l: "SOFTEST NET MONTH", v: money(trough.netToLandlord),     s: trough.month,              strong: false },
      ] as const).forEach((c, i) => {
        const x = ml + i * (sW + sGap);
        card(x, y, sW, sH, { fill: c.strong ? SAGE : [250, 246, 238], border: c.strong ? SAGE_BD : [228, 216, 196] });
        txt(c.l, x + 12, y + 15, { size: 5.8, bold: true, color: LIGHT, spacing: 0.7 });
        txt(c.v, x + 12, y + 32, { size: 10.5, bold: true, color: c.strong ? GREEN : BRONZE_TX, serif: true });
        txt(c.s, x + 12, y + 43, { size: 6.2, color: MUTED });
      });
      y += sH + 16;

      // ── Owner insight ─────────────────────────────────────────────
      eyebrow("ASSETINTEL OWNER INSIGHT", ml, y);
      y += 10;
      const advantage = Math.abs(result.strVsLtrDelta);
      const relAdv = result.longTermRent > 0 ? advantage / result.longTermRent : 0;
      const magnitude = relAdv > 0.30 ? "a substantial" : relAdv > 0.12 ? "a meaningful" : "a relatively modest";
      const interpretation = strBetter
        ? "STR is projected to outperform LTR by " + magnitude + " margin, driven largely by high-season performance. "
          + (relAdv <= 0.12
            ? "Because the annual advantage is narrow, management execution and cost control will materially influence whether it is realised."
            : "Sustaining it depends on consistent occupancy, pricing discipline and furnishing quality.")
        : "LTR is projected to outperform STR on a net basis, with no vacancy exposure and materially lower operating involvement. "
          + "STR would need stronger occupancy or nightly rates than currently modelled to close the gap.";
      const oLines = doc.splitTextToSize(interpretation, cw - 32);
      const oH = 58 + oLines.length * 10;
      card(ml, y, cw, oH, { fill: CARD });
      doc.setFillColor(...(strBetter ? GREEN : BRONZE));
      doc.roundedRect(ml, y, 4, oH, 2, 2, "F");
      const facts: Array<[string, string]> = [
        ["Recommended strategy", strBetter ? "Short-Term Rental" : "Long-Term Rental"],
        ["Annual STR net", money(result.annualNetToLandlord)],
        ["Annual LTR", money(result.longTermRent)],
        ["Projected difference", money(advantage)],
      ];
      const fW = (cw - 32) / 4;
      facts.forEach(([l, v], i) => {
        const x = ml + 16 + i * fW;
        txt(l.toUpperCase(), x, y + 17, { size: 5.5, bold: true, color: LIGHT, spacing: 0.6 });
        txt(v, x, y + 33, { size: 9, bold: true, color: i === 0 ? (strBetter ? GREEN : BRONZE_TX) : TEXT, serif: true });
      });
      doc.setFontSize(7.3); doc.setFont(SANS, "normal"); doc.setTextColor(...TEXT);
      doc.text(oLines, ml + 16, y + 52);
      y += oH + 14;

      // ── Next step ─────────────────────────────────────────────────
      eyebrow("WHAT'S YOUR NEXT STEP?", ml, y);
      y += 10;
      const nSteps: Array<[string, string]> = strBetter
        ? [["Private Operator Match", "Find suitable STR operators for this property."],
           ["Furnishing & STR Setup", "Get the property professionally guest-ready."],
           ["Independent Advisory", "20-minute unbiased guidance, AED 199."]]
        : [["Independent Advisory", "20-minute unbiased guidance, AED 199."],
           ["Leasing Support", "Position the unit for a strong long-term tenant."],
           ["Furnishing & STR Setup", "Revisit if you later reconsider short-term."]];
      const nW = (cw - 20) / 3, nH = 44;
      nSteps.forEach(([t, d], i) => {
        const x = ml + i * (nW + 10);
        card(x, y, nW, nH, { fill: [250, 247, 241], border: [228, 218, 200], r: 7 });
        txt(t, x + 11, y + 17, { size: 7.6, bold: true, color: GREEN, serif: true });
        const dl = doc.splitTextToSize(d, nW - 22);
        doc.setFontSize(6.1); doc.setFont(SANS, "normal"); doc.setTextColor(...MUTED);
        doc.text(dl, x + 11, y + 29);
      });
      txt("assetintel.ae", ml + cw, y + nH + 11, { size: 6.6, bold: true, color: BRONZE_TX, align: "right" });
      y += nH + 20;

      // ── Data provenance ───────────────────────────────────────────
      const provH = 52;
      card(ml, y, cw, provH, { fill: [246, 243, 236], border: BORDER, r: 7 });
      eyebrow("DATA SOURCES", ml + 14, y + 14);
      const provs: Array<[string, string]> = [
        ["Dubai Land Department", "Sales & rental transactions"],
        ["AirROI", "STR market intelligence"],
        ["Airbtics", "STR market intelligence"],
        ["AssetIntel", "Calculations & interpretation"],
      ];
      const pW = (cw - 28) / 4;
      provs.forEach(([n, d], i) => {
        const x = ml + 14 + i * pW;
        txt(n, x, y + 29, { size: 6.8, bold: true, color: GREEN });
        txt(d, x, y + 38, { size: 5.8, color: MUTED });
      });
      const refreshedTxt = area ? new Date(area.updated_at).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" }) : "unavailable";
      txt("Market data last refreshed: " + refreshedTxt + "     Report generated: " + dateStr,
        ml + 14, y + provH - 6, { size: 5.9, color: LIGHT });
      y += provH + 12;

      // ── Disclaimer ────────────────────────────────────────────────
      eyebrow("IMPORTANT INFORMATION", ml, y);
      y += 9;
      const disc = "This report is generated by AssetIntel for indicative purposes only. Figures are projections based on available market data, third-party STR datasets, user inputs and AssetIntel modelling. Actual performance may vary depending on pricing, management quality, property condition, seasonality, booking-platform performance, market conditions and regulatory requirements. This report does not constitute financial, investment, legal or valuation advice.";
      const dLines = doc.splitTextToSize(disc, cw - 4);
      doc.setFontSize(6.2); doc.setFont(SANS, "normal"); doc.setTextColor(155, 150, 141);
      doc.text(dLines, ml, y + 6);

      // ── Consistent footer on every page ───────────────────────────
      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFillColor(...BRONZE);
        doc.rect(ml, H - footerH - 6, cw, 0.9, "F");
        txt("AssetIntel", ml, H - footerH + 10, { size: 8, bold: true, color: GREEN, serif: true });
        txt("Property Intelligence. Smarter Decisions.", W / 2, H - footerH + 10, { size: 6.6, color: MUTED, align: "center" });
        txt("Page " + p + " of " + totalPages, W - mr, H - footerH + 10, { size: 6.6, color: LIGHT, align: "right" });
      }

      const filename = "AssetIntel-Report-" +
        (result.propertyName || input.buildingName || "property").replace(/[^a-z0-9]/gi, "-") + ".pdf";
      doc.save(filename);
    } catch (e) {
      console.error("PDF generation failed:", e);
    } finally {
      setPdfGenerating(false);
    }
  }

  // LTR data is fetched by ReportGate before this component mounts — no background update needed.

  const community = result.buildingInfo?.community ?? input.buildingName;
  const strViability = checkSTRViability(input.buildingName, community);

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
    if (areaLower.includes("marina")) return "/Locations/Marina.png";
    if (areaLower.includes("downtown")) return "/Locations/Downtown.png";
    if (areaLower.includes("burj")) return "/Locations/Downtown.png";
    if (areaLower.includes("palm")) return "/Locations/Palm.png";
    if (areaLower.includes("jbr") || areaLower.includes("jumeirah beach")) return "/Locations/JBR.png";
    if (areaLower.includes("jumeirah") && !areaLower.includes("village")) return "/Locations/JBR.png";
    if (areaLower.includes("business")) return "/Locations/Downtown.png";
    if (areaLower.includes("creek")) return "/Locations/Downtown.png";
    if (areaLower.includes("emaar")) return "/Locations/Marina.png";
    if (areaLower.includes("beach")) return "/Locations/Marina.png";

    // Fallback: Marina image as default
    return "/Locations/Marina.png";
  };

  const heroImage = getLocationImage(input.buildingName, result.buildingInfo?.area);

  return (
    <div className="min-h-screen" style={{ position: "relative", background: `radial-gradient(ellipse 800px 600px at 50% 40%, rgba(201, 167, 125, 0.25) 0%, transparent 60%), linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(248,244,238,0.9) 35%, rgba(253,251,247,0.94) 100%)` }}>
      <DecorativeBackdrop />
      <div style={{ position: "relative", zIndex: 1 }}>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 14mm 16mm;
          }
          body {
            background: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .decorative-backdrop-no-print {
            display: none !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          #pdf-header {
            display: flex !important;
            flex-direction: column !important;
          }
          #pdf-report-content {
            max-width: 100% !important;
            padding: 0 !important;
          }
        }
        /* Summary card responsive */
        @media (min-width: 768px) {
          .rpt-summary-wrap {
            flex-direction: row !important;
          }
          .rpt-verdict {
            width: 42% !important;
            flex-shrink: 0 !important;
            margin-right: 20px !important;
          }
          .rpt-delta-panel {
            grid-column: span 1 !important;
          }
        }
        @media (max-width: 639px) {
          .rpt-metrics-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .rpt-metric-cards {
            grid-template-columns: 1fr 1fr !important;
          }
          .rpt-delta-panel {
            grid-column: span 2 !important;
          }
        }
        @media (max-width: 400px) {
          .rpt-metrics-grid {
            grid-template-columns: 1fr !important;
          }
        }
        /* Table desktop/mobile toggle */
        .rpt-table-desktop { display: block; }
        .rpt-table-mobile  { display: none; }
        @media (max-width: 639px) {
          .rpt-table-desktop { display: none; }
          .rpt-table-mobile  { display: block; }
        }
        /* Waterfall responsive */
        .rpt-waterfall {
          grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
        }
        @media (max-width: 767px) {
          .rpt-waterfall {
            grid-template-columns: 1fr !important;
          }
          .rpt-waterfall > div:nth-child(even) {
            display: none !important;
          }
        }
        /* Chart insight strip — 2-col on mobile */
        @media (max-width: 639px) {
          .rpt-insight-strip {
            grid-template-columns: 1fr 1fr !important;
          }
          .rpt-insight-strip > div {
            border-right: none !important;
            border-bottom: 1px solid var(--border, #E0DBD2);
          }
          .rpt-insight-strip > div:nth-child(odd) {
            border-right: 1px solid var(--border, #E0DBD2) !important;
          }
          .rpt-insight-strip > div:nth-last-child(-n+2) {
            border-bottom: none;
          }
        }
        @media print {
          .rpt-delta-panel {
            grid-column: span 1 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          * {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
          .rounded-3xl, .rounded-2xl, .rounded-xl {
            border-radius: 8px !important;
          }
          .group:hover {
            transform: none !important;
          }
          .pdf-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .page-break-before {
            break-before: page;
            page-break-before: always;
          }
          /* Keep backgrounds for cards */
          [style*="background"] {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        /* ── Shared Report Card Design System ───────────────────────── */
        .rc {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: #FFFFFF;
          border: 1px solid rgba(35,93,72,0.10);
          border-radius: 22px;
          padding: 22px 20px 20px;
          box-shadow: 0 18px 45px rgba(20,48,38,0.07), 0 4px 14px rgba(20,48,38,0.035);
          min-height: 150px;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .rc-accent-green  { border-color: rgba(27,94,74,0.12); }
        .rc-accent-bronze { border-color: rgba(184,138,68,0.16); }
        .rc-accent-result { background: rgba(27,94,74,0.055); border: 1.5px solid rgba(27,94,74,0.18); box-shadow: 0 2px 12px rgba(27,94,74,0.10), inset 0 1px 0 rgba(255,255,255,0.7); }
        .rc-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          border-radius: 0;
        }
        .rc-bar-green  { background: linear-gradient(90deg, rgba(27,94,74,0.70), rgba(27,94,74,0.18)); }
        .rc-bar-bronze { background: linear-gradient(90deg, rgba(184,138,68,0.70), rgba(184,138,68,0.18)); }
        .rc-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          margin-top: 4px;
          flex-shrink: 0;
        }
        .rc-icon-green  { background: #EEF5F1; border: 1px solid rgba(27,94,74,0.12); color: #1B5E4A; }
        .rc-icon-bronze { background: #FBF6EE; border: 1px solid rgba(184,138,68,0.18); color: #B88A44; }
        .rc-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 8px;
          line-height: 1.2;
        }
        .rc-label-green  { color: #7A9A8A; }
        .rc-label-bronze { color: #9A8A6A; }
        .rc-label-result { color: #1B5E4A; }
        .rc-value {
          font-size: clamp(18px, 1.9vw, 24px);
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 6px;
          word-break: break-word;
        }
        .rc-value-green  { color: #1B5E4A; }
        .rc-value-bronze { color: #B88A44; }
        .rc-helper {
          font-size: 12px;
          line-height: 1.45;
          margin-top: auto;
        }
        .rc-helper-muted  { color: #9A9A8A; }
        .rc-helper-green  { color: #6A9A82; }
        /* Glassy variant — exec summary 2×2 */
        .rc-glassy {
          background: rgba(255,254,250,0.90);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 22px 55px rgba(20,48,38,0.08), 0 6px 18px rgba(20,48,38,0.04), inset 0 1px 0 rgba(255,255,255,0.80);
          border-radius: 26px;
          padding: 26px 22px 22px;
        }
        .rc-glassy .rc-value { font-size: clamp(20px, 2.2vw, 28px); }
        /* Waterfall variant — slightly compact */
        .rc-wf {
          border-radius: 16px;
          min-height: 0;
          padding: 20px 18px 18px;
        }
        .rc-wf .rc-icon { width: 36px; height: 36px; border-radius: 10px; margin-bottom: 10px; }
        .rc-wf .rc-value { font-size: clamp(17px, 1.7vw, 21px); }
        /* Grid gap standard */
        .rc-grid { display: grid; gap: 20px; }
        @media (max-width: 767px) { .rc-grid { gap: 16px; } }
        @media (max-width: 479px) { .rc-grid { gap: 14px; } }
        /* ── End shared card system ─────────────────────────────────── */
        .print-only {
          display: none;
        }
      `}</style>
      {/* Top bar */}
      <div className="no-print" style={{ position: "sticky", top: 0, zIndex: 200, padding: "12px 16px" }}>
        <div style={{
          maxWidth: 1152, margin: "0 auto",
          background: "#FAFAF7F2", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
          border: "1px solid #E3DED6", borderRadius: 24,
          boxShadow: "0 2px 4px rgba(0,0,0,0.03), 0 8px 28px rgba(27,94,74,0.09)",
          display: "flex", alignItems: "center", padding: "0 20px", height: 68, gap: 12,
        }}>
          <div className="flex items-center gap-2 min-w-0" style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
            <AssetIntelLogo size={32} />
          </div>
          <div className="hidden md:block" style={{ width: 1, height: 24, background: "#E6E1D8", flexShrink: 0 }} />
          <div className="hidden md:block min-w-0">
            <p style={{ fontSize: 10, fontWeight: 600, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase" }}>Rental Report</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#2A2A2A" }} className="truncate">{result.propertyName}</p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span className="hidden sm:inline" style={{ fontSize: 11, padding: "4px 12px", borderRadius: 999, fontWeight: 500, background: "rgba(184,138,68,0.10)", color: "#1B5E4A", border: "1px solid rgba(184,138,68,0.22)" }}>
              {input.unitSize} · {input.unitType}
            </span>
            <button onClick={handleSave} disabled={saving || saved}
              style={{ fontSize: 12, padding: "7px 16px", borderRadius: 999, background: saved ? "#EFF4F0" : "#fff", color: saved ? "#1B5E4A" : "#1B5E4A", border: "1.5px solid #1B5E4A", cursor: (saving || saved) ? "default" : "pointer", fontWeight: 600, transition: "all 0.2s" }}>
              {saved ? "✓ Saved" : saving ? "Saving…" : "Save to Dashboard"}
            </button>
            <button onClick={generatePDF} disabled={pdfGenerating}
              style={{ fontSize: 12, padding: "7px 16px", borderRadius: 999, background: pdfGenerating ? "#6B6B6B" : "linear-gradient(135deg, #1B5E4A 0%, #2D7A5E 100%)", color: "#FFF", border: "none", cursor: pdfGenerating ? "not-allowed" : "pointer", fontWeight: 700, boxShadow: "0 4px 12px rgba(27,94,74,0.25)", transition: "background 0.2s" }}>
              {pdfGenerating ? "Generating…" : "Download PDF"}
            </button>
          </div>
        </div>
      </div>

      {/* PDF-only header — hidden on screen, visible in print */}
      <div className="print-only" id="pdf-header" style={{ display: "none", padding: "0 0 28px 0", borderBottom: "2px solid #1B5E4A", marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#1B5E4A", letterSpacing: "-0.01em", fontFamily: "'Georgia', serif" }}>AssetIntel</p>
            <p style={{ fontSize: 10, color: "#B88A44", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2 }}>Property Intelligence. Smarter Decisions.</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A" }}>STR vs LTR Rental Strategy Report</p>
            <p style={{ fontSize: 12, color: "#6B6B6B", marginTop: 3 }}>{result.propertyName} · {input.unitSize} · {input.unitType}</p>
            <p style={{ fontSize: 11, color: "#8E8E8E", marginTop: 2 }}>Generated {new Date().toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </div>
      </div>

      <div id="pdf-report-content" className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <AccessGate source="report" title="Unlock Your Full Report" subtitle="Free — enter your name and email to see your rental analysis, comparables, and recommendation.">

        {/* Unfurnished notice */}
        {result.furnished === "Unfurnished" && (
          <div style={{
            background: "#FAFAF6",
            border: "1px solid #C9A84C40",
            borderLeft: "3px solid #B88A44",
            borderRadius: 18,
            padding: "18px 22px",
            boxShadow: "0 2px 12px rgba(27,94,74,0.06)",
            display: "flex",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap",
          }}>
            {/* Icon + text row */}
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flex: 1, minWidth: 220 }}>
              {/* Icon badge */}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "#EEF5F1",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B5E4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 9V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2" />
                  <path d="M2 9a2 2 0 0 1 2 2v2h16v-2a2 2 0 0 1 2-2" />
                  <path d="M4 13v4h16v-4" />
                  <path d="M6 17v2M18 17v2" />
                </svg>
              </div>
              {/* Text */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: "#B88A44", textTransform: "uppercase", marginBottom: 3 }}>
                  Furnishing Status
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1B5E4A", marginBottom: 4, lineHeight: 1.3 }}>
                  Furnishing package required
                </p>
                <p style={{ fontSize: 12, color: "#6B6B6B", lineHeight: 1.6, margin: 0 }}>
                  Your property is <span style={{ fontWeight: 600, color: "#3D3D3D" }}>currently unfurnished</span>. A <span style={{ fontWeight: 600, color: "#3D3D3D" }}>furnishing package is required</span> before listing on any short-term rental platform.
                </p>
              </div>
            </div>
            {/* CTA — hidden in PDF */}
            <button
              className="no-print"
              onClick={() => {
                const p = new URLSearchParams();
                p.set("propertyName", input.propertyName);
                p.set("unitSize", input.unitSize);
                p.set("buildingName", input.buildingName);
                router.push(`/furnishing?${p.toString()}`);
              }}
              style={{
                flexShrink: 0,
                padding: "10px 18px",
                background: colors.primary,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 14px rgba(27,94,74,0.22)",
              }}
            >
              Explore Furnishing Packages →
            </button>
          </div>
        )}

        {/* STR viability warning */}
        {!strViability.viable && (
          <div className="rounded-2xl p-5" style={{ background: "#FFF8EC", border: "1.5px solid #C9A84C" }}>
            <div className="flex gap-3 items-start">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M10 2L18 17H2L10 2Z" stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M10 8V11" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="10" cy="14" r="0.75" fill="#C9A84C"/>
              </svg>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#8B6914" }}>
                  {strViability.type === "area" ? "Area not typically viable for STR" : "Building may underperform for STR"}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "#7A5C10" }}>
                  {strViability.reason} The numbers below are shown for reference, but we recommend considering a long-term tenancy for this property.
                </p>
              </div>
            </div>
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

        {/* Interior Upgrade Adjustment card */}
        {result.propertyCondition !== "Standard" && (
          <div style={{
            background: "#FBF6EE",
            border: "1px solid rgba(184,138,68,0.30)",
            borderLeft: "3px solid #B88A44",
            borderRadius: 18,
            padding: "18px 22px",
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "#F5ECD9",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B88A44" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: "#B88A44", textTransform: "uppercase", marginBottom: 3 }}>
                Interior Upgrade Adjustment · {result.propertyCondition}
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1B5E4A", marginBottom: 4, lineHeight: 1.3 }}>
                A modest uplift has been applied for your upgraded interior
              </p>
              <p style={{ fontSize: 12, color: "#6B6B6B", lineHeight: 1.6, margin: 0 }}>
                Interior upgrades improve marketability, but actual performance still depends on building, area, view, furnishing quality, pricing, reviews, and operator execution.
              </p>
            </div>
          </div>
        )}

        {/* ── EXECUTIVE SUMMARY ─────────────────────────────────────────── */}
        <div className="pdf-section" style={{ position: "relative", overflow: "hidden", borderRadius: 28, border: "1px solid #D8D4CC", boxShadow: "0 2px 6px rgba(0,0,0,0.03), 0 12px 40px rgba(27,94,74,0.09)", background: "#FAFAF6" }}>

          {/* Background image — blended right side */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
            <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "58%", backgroundImage: `url("${heroImage}")`, backgroundSize: "cover", backgroundPosition: "center right", opacity: 0.72 }} />
            {/* Left ivory fade */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #FAFAF6 0%, #FAFAF6 32%, rgba(250,250,246,0.85) 46%, rgba(250,250,246,0.3) 62%, transparent 80%)" }} />
            {/* Bottom fade */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(250,250,246,0.5) 80%, #FAFAF6 100%)" }} />
            {/* Warm glow centre-right */}
            <div style={{ position: "absolute", top: "-20%", right: "10%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(184,138,68,0.06) 0%, transparent 70%)" }} />
          </div>

          {/* Content */}
          <div style={{ position: "relative", zIndex: 1, padding: "28px 28px 24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="rpt-summary-wrap">

              {/* ── Left verdict panel ── */}
              <div style={{ borderRadius: 22, background: "rgba(27,94,74,0.045)", border: "1px solid rgba(27,94,74,0.10)", padding: "22px 24px", display: "flex", flexDirection: "column", gap: 0 }} className="rpt-verdict">

                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.primary, opacity: 0.65, marginBottom: 10 }}>
                  12-Month Forecast · {new Date().toLocaleDateString("en-AE", { month: "long", year: "numeric" })}
                </span>

                <h1 style={{ fontSize: "clamp(22px, 2.2vw, 32px)", fontWeight: 700, fontFamily: "'Georgia', serif", lineHeight: 1.15, marginBottom: 6, background: `linear-gradient(120deg, ${colors.primary} 0%, #2A7A62 40%, ${colors.secondary} 100%)`, backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {strBetter ? "Short-term rental outperforms" : "Long-term rental is competitive"}
                </h1>

                <div style={{ height: 1, background: `linear-gradient(90deg, ${colors.secondary}50, transparent)`, marginBottom: 12 }} />

                {/* Delta with icon */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: strBetter ? "rgba(27,94,74,0.10)" : "rgba(184,138,68,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={strBetter ? colors.primary : colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {strBetter
                        ? <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>
                        : <><line x1="12" y1="20" x2="12" y2="4"/><polyline points="6 10 12 4 18 10"/></>
                      }
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 20, fontWeight: 800, color: colors.secondary, lineHeight: 1 }}>
                      AED {fmt(Math.abs(result.strVsLtrDelta))}
                    </p>
                    <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{strBetter ? "more per year with STR" : "difference vs LTR"}</p>
                  </div>
                </div>

                {/* Property chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: colors.primary, background: "#fff", border: "1px solid rgba(27,94,74,0.16)", borderRadius: 20, padding: "4px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                    Floor {result.floor}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: colors.primary, background: "#fff", border: "1px solid rgba(27,94,74,0.16)", borderRadius: 20, padding: "4px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2"/><path d="M2 9a2 2 0 0 1 2 2v2h16v-2a2 2 0 0 1 2-2"/><path d="M4 13v4h16v-4"/></svg>
                    {result.furnished}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: colors.primary, background: "#fff", border: "1px solid rgba(27,94,74,0.16)", borderRadius: 20, padding: "4px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
                    {result.view}
                  </span>
                  {result.propertyCondition !== "Standard" && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: colors.secondary, background: "#FBF6EE", border: "1px solid rgba(184,138,68,0.25)", borderRadius: 20, padding: "4px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                      {result.propertyCondition}
                    </span>
                  )}
                  {(() => {
                    const bInfo = result.buildingInfo ?? BUILDING_DIRECTORY[input.buildingName];
                    const cy = bInfo?.completionYear;
                    const sc = bInfo?.serviceChargePsf;
                    return (<>
                      {cy && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: colors.primary, background: "#fff", border: "1px solid rgba(27,94,74,0.16)", borderRadius: 20, padding: "4px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          Built {cy} · {2026 - cy} yrs
                        </span>
                      )}
                      {sc && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: colors.primary, background: "#fff", border: "1px solid rgba(27,94,74,0.16)", borderRadius: 20, padding: "4px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                          SC AED {sc}/sqft
                        </span>
                      )}
                    </>);
                  })()}
                </div>
              </div>

              {/* ── Right 2×2 metrics ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="rpt-metrics-grid">

                {/* STR Net / Year */}
                <div className="rc rc-glassy rc-accent-green">
                  <span className="rc-bar rc-bar-green" />
                  <svg aria-hidden="true" style={{ position: "absolute", bottom: -18, right: -18, opacity: 0.11, pointerEvents: "none" }} width="100" height="80" viewBox="0 0 100 80"><path d="M0 80 Q50 0 100 40" stroke="#1B5E4A" strokeWidth="1.4" fill="none"/></svg>
                  <p className="rc-label rc-label-green">STR Net / Year</p>
                  <p className="rc-value rc-value-green">AED {fmt(result.annualNetToLandlord)}</p>
                </div>

                {/* LTR / Year */}
                <div className="rc rc-glassy rc-accent-bronze">
                  <span className="rc-bar rc-bar-bronze" />
                  <svg aria-hidden="true" style={{ position: "absolute", bottom: -18, right: -18, opacity: 0.11, pointerEvents: "none" }} width="100" height="80" viewBox="0 0 100 80"><path d="M0 80 Q50 0 100 40" stroke="#B88A44" strokeWidth="1.4" fill="none"/></svg>
                  <p className="rc-label rc-label-bronze">LTR / Year</p>
                  <p className="rc-value rc-value-bronze" style={{ marginBottom: 8 }}>AED {fmt(result.longTermRent)}</p>
                  {ltrSource === "dda-live" ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: colors.primary, background: "rgba(27,94,74,0.07)", border: "1px solid rgba(27,94,74,0.14)", borderRadius: 20, padding: "2px 8px" }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke={colors.primary} strokeWidth="2" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Live DLD · building
                    </span>
                  ) : result.ltrBasis === "dld-building" ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: colors.primary, background: "rgba(27,94,74,0.07)", border: "1px solid rgba(27,94,74,0.14)", borderRadius: 20, padding: "2px 8px" }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke={colors.primary} strokeWidth="2" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {result.ltrSampleSize?.toLocaleString()} DLD · building{result.ltrAsOf ? ` · ${result.ltrAsOf}` : ""}
                    </span>
                  ) : result.ltrBasis === "dld-master" ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: colors.secondary, background: "rgba(184,138,68,0.07)", border: "1px solid rgba(184,138,68,0.18)", borderRadius: 20, padding: "2px 8px" }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke={colors.secondary} strokeWidth="2" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {result.ltrSampleSize?.toLocaleString()} DLD · community avg{result.ltrAsOf ? ` · ${result.ltrAsOf}` : ""}
                    </span>
                  ) : result.ltrBasis === "dld-area" ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: colors.secondary, background: "rgba(184,138,68,0.07)", border: "1px solid rgba(184,138,68,0.18)", borderRadius: 20, padding: "2px 8px" }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke={colors.secondary} strokeWidth="2" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {result.ltrSampleSize?.toLocaleString()} DLD · area avg{result.ltrAsOf ? ` · ${result.ltrAsOf}` : ""}
                    </span>
                  ) : (
                    <span style={{ fontSize: 10, color: "#9A9A9A" }}>Estimated · {result.ltrSource}</span>
                  )}
                </div>

                {/* Avg Occupancy */}
                <div className="rc rc-glassy rc-accent-green">
                  <span className="rc-bar rc-bar-green" />
                  <svg aria-hidden="true" style={{ position: "absolute", bottom: -18, right: -18, opacity: 0.11, pointerEvents: "none" }} width="100" height="80" viewBox="0 0 100 80"><path d="M0 80 Q50 0 100 40" stroke="#1B5E4A" strokeWidth="1.4" fill="none"/></svg>
                  <p className="rc-label rc-label-green">Avg Occupancy</p>
                  <p className="rc-value rc-value-green">{(result.avgOccupancy * 100).toFixed(0)}%</p>
                </div>

                {/* Avg Daily Rate */}
                <div className="rc rc-glassy rc-accent-bronze">
                  <span className="rc-bar rc-bar-bronze" />
                  <svg aria-hidden="true" style={{ position: "absolute", bottom: -18, right: -18, opacity: 0.11, pointerEvents: "none" }} width="100" height="80" viewBox="0 0 100 80"><path d="M0 80 Q50 0 100 40" stroke="#B88A44" strokeWidth="1.4" fill="none"/></svg>
                  <p className="rc-label rc-label-bronze">Avg Daily Rate</p>
                  <p className="rc-value rc-value-bronze">AED {fmt(result.avgADR)}</p>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* ── COST & DEDUCTION SNAPSHOT ─────────────────────────── */}
        <div className="pdf-section" style={{ background: colors.bgSection, border: "1px solid " + colors.border, borderRadius: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 12px 36px rgba(27,94,74,0.07)", padding: "28px 28px 24px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: colors.secondary, marginBottom: 6 }}>Financial Breakdown</p>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.primary, marginBottom: 4, fontFamily: "'Georgia', serif" }}>Cost & Deduction Snapshot</h2>
          <p style={{ fontSize: 12, color: colors.textMuted, marginBottom: 24 }}>How gross STR revenue converts into estimated owner net income.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr", gap: 0, alignItems: "stretch" }} className="rpt-waterfall">

            {/* Gross Revenue */}
            <div className="rc rc-wf rc-accent-green">
              <span className="rc-bar rc-bar-green" />
              <div className="rc-icon rc-icon-green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 1 18"/><polyline points="16 7 22 7 22 13"/></svg>
              </div>
              <p className="rc-label rc-label-green">Gross Revenue</p>
              <p className="rc-value rc-value-green">AED {fmt(result.annualRevenue)}</p>
              <p className="rc-helper rc-helper-muted">Total STR gross income</p>
            </div>

            {/* Arrow divider */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 10px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ width: 1, flex: 1, background: colors.border, minHeight: 20 }} />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textLight} strokeWidth="1.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                <p style={{ fontSize: 9, color: colors.textLight, fontWeight: 600, letterSpacing: "0.06em" }}>minus</p>
                <div style={{ width: 1, flex: 1, background: colors.border, minHeight: 20 }} />
              </div>
            </div>

            {/* Mgmt Fees */}
            <div className="rc rc-wf rc-accent-bronze">
              <span className="rc-bar rc-bar-bronze" />
              <div className="rc-icon rc-icon-bronze">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              </div>
              <p className="rc-label rc-label-bronze">Management Fees</p>
              <p className="rc-value rc-value-bronze">AED {fmt(result.annualManagementFee)}</p>
              <p className="rc-helper rc-helper-muted">{(input.managementFee * 100).toFixed(0)}% of gross revenue</p>
            </div>

            {/* Arrow divider */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 10px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ width: 1, flex: 1, background: colors.border, minHeight: 20 }} />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textLight} strokeWidth="1.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                <p style={{ fontSize: 9, color: colors.textLight, fontWeight: 600, letterSpacing: "0.06em" }}>minus</p>
                <div style={{ width: 1, flex: 1, background: colors.border, minHeight: 20 }} />
              </div>
            </div>

            {/* Running Costs */}
            <div className="rc rc-wf rc-accent-bronze">
              <span className="rc-bar rc-bar-bronze" />
              <div className="rc-icon rc-icon-bronze">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4L9.6 9.6M18.9 4.9a2.828 2.828 0 1 0 4 4l-12 12a4 4 0 0 1-2 1l-3 .5.5-3a4 4 0 0 1 1-2l12-12z"/></svg>
              </div>
              <p className="rc-label rc-label-bronze">Running Costs</p>
              <p className="rc-value rc-value-bronze">AED {fmt(result.annualUtilities + result.annualMaintenance + result.annualFurnitureAmort)}</p>
              <p className="rc-helper rc-helper-muted">DEWA, upkeep, furniture</p>
            </div>

            {/* Arrow divider */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 10px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ width: 1, flex: 1, background: colors.border, minHeight: 20 }} />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="1.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                <p style={{ fontSize: 9, color: colors.primary, fontWeight: 700, letterSpacing: "0.06em" }}>equals</p>
                <div style={{ width: 1, flex: 1, background: colors.border, minHeight: 20 }} />
              </div>
            </div>

            {/* Net to Owner — result cell */}
            <div className="rc rc-wf rc-accent-result">
              <span className="rc-bar rc-bar-green" />
              <div className="rc-icon rc-icon-green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <p className="rc-label rc-label-result">Net to Owner</p>
              <p className="rc-value rc-value-green">AED {fmt(result.annualNetToLandlord)}</p>
              <p className="rc-helper rc-helper-green">After all deductions</p>
            </div>
          </div>

          {/* Yield row — only if property value was entered */}
          {(result.grossYield !== undefined || result.netYield !== undefined) && (
            <div style={{ display: "flex", gap: 14, marginTop: 16, flexWrap: "wrap" }}>
              {result.grossYield !== undefined && (
                <div style={{ flex: "1 1 140px", background: "#fff", border: `1px solid ${colors.border}`, borderRadius: 14, padding: "14px 16px" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: colors.textMuted, marginBottom: 4 }}>Gross Yield</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: colors.primary }}>{result.grossYield.toFixed(2)}%</p>
                  <p style={{ fontSize: 11, color: colors.textLight }}>Based on property value</p>
                </div>
              )}
              {result.netYield !== undefined && (
                <div style={{ flex: "1 1 140px", background: "#fff", border: `1px solid ${colors.border}`, borderRadius: 14, padding: "14px 16px" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: colors.textMuted, marginBottom: 4 }}>Net Yield</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: colors.primary }}>{result.netYield.toFixed(2)}%</p>
                  <p style={{ fontSize: 11, color: colors.textLight }}>After all deductions</p>
                </div>
              )}
            </div>
          )}
        </div>

                {/* Monthly breakdown table - Premium investor-grade */}
        <div>
          {/* KPI summary cards with premium container */}
          {(() => {
            const us = result.unitSize as string;
            const isVilla = us.includes("VILLA");
            const beds = us === "STU" ? 0 : isVilla ? 4 : Math.min(4, parseInt(us, 10) || 4);

            const moneyBase = us === "STU" ? 2000 : beds === 1 ? 3000 : beds === 2 ? 4000 : 5000;
            const occBase = us === "STU" ? 2 : beds <= 2 ? 3 : 4;
            const adrBase = us === "STU" ? 15 : beds === 1 ? 25 : beds === 2 ? 35 : 50;

            const confFactor = result.ltrBasis === "dld-building" ? 0.75
              : result.ltrBasis === "dld-master" ? 0.9
              : result.ltrBasis === "dld-area" ? 1.0 : 1.25;
            const moneyOffset = Math.min(5000, Math.round(moneyBase * confFactor));

            const roundTo = (v: number, step: number) => Math.round(v / step) * step;
            const moneyRange = (base: number) => `AED ${fmt(roundTo(base - moneyOffset, 1000))}–${fmt(roundTo(base + moneyOffset, 1000))}`;
            const occRange = (pct: number) => `${Math.max(0, Math.round(pct - occBase))}%–${Math.min(100, Math.round(pct + occBase))}%`;
            const adrRange = (adr: number) => `AED ${fmt(roundTo(adr - adrBase, 5))}–${fmt(roundTo(adr + adrBase, 5))}`;

            const cards = [
              { label: "Net to Landlord", value: moneyRange(result.annualNetToLandlord), helper: "After all deductions", accent: colors.secondary, isGreen: false,
                icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
              { label: "Annual Revenue", value: moneyRange(result.annualRevenue), helper: "Gross projected revenue", accent: colors.primary, isGreen: true,
                icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
              { label: "Average Occupancy", value: occRange(result.avgOccupancy * 100), helper: "Expected occupancy range", accent: colors.primary, isGreen: true,
                icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v10M12 12h10a10 10 0 0 0-10-10z"/></svg> },
              { label: "Average ADR", value: adrRange(result.avgADR), helper: "Average daily rate", accent: colors.secondary, isGreen: false,
                icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> },
            ];

            return (
              <div className="mb-8 pdf-section" style={{ position: "relative", overflow: "hidden", borderRadius: 28, background: "#FAFAF6", border: "1px solid #E0DBD2", boxShadow: "0 2px 6px rgba(0,0,0,0.03), 0 12px 36px rgba(27,94,74,0.07)", padding: "28px 26px 24px" }}>

                {/* Faint background image */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                  <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "48%", backgroundImage: `url("${heroImage}")`, backgroundSize: "cover", backgroundPosition: "center right", opacity: 0.10 }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #FAFAF6 0%, #FAFAF6 35%, rgba(250,250,246,0.95) 52%, rgba(250,250,246,0.60) 72%, rgba(250,250,246,0.15) 90%)" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(250,250,246,0.5) 75%, #FAFAF6 100%)" }} />
                </div>

                {/* Header */}
                <div style={{ position: "relative", zIndex: 1, marginBottom: 20 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: colors.secondary, marginBottom: 6 }}>12-Month Rental Projection</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                    <h2 style={{ fontSize: "clamp(20px, 2.2vw, 26px)", fontWeight: 700, fontFamily: "'Georgia', serif", background: `linear-gradient(120deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2, margin: 0 }}>
                      Monthly Breakdown
                    </h2>
                    <p style={{ fontSize: 12, color: colors.textMuted, margin: 0 }}>Full 12-month projection with all income and cost lines</p>
                  </div>
                </div>

                {/* Cards */}
                <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 12, marginBottom: 16 }}>
                  {cards.map((c) => (
                    <div key={c.label} className={`rc ${c.isGreen ? "rc-accent-green" : "rc-accent-bronze"}`} style={{ backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", background: "rgba(255,254,250,0.92)", boxShadow: "0 18px 45px rgba(20,48,38,0.07), 0 4px 14px rgba(20,48,38,0.035), inset 0 1px 0 rgba(255,255,255,0.80)" }}>
                      <span className={`rc-bar ${c.isGreen ? "rc-bar-green" : "rc-bar-bronze"}`} />
                      <div className={`rc-icon ${c.isGreen ? "rc-icon-green" : "rc-icon-bronze"}`} style={{ borderRadius: "50%", width: 38, height: 38 }}>
                        {c.icon}
                      </div>
                      <p className={`rc-label ${c.isGreen ? "rc-label-green" : "rc-label-bronze"}`}>{c.label}</p>
                      <p className={`rc-value ${c.isGreen ? "rc-value-green" : "rc-value-bronze"}`} style={{ fontSize: "clamp(14px, 1.6vw, 19px)" }}>{c.value}</p>
                      <p className="rc-helper rc-helper-muted">{c.helper}</p>
                    </div>
                  ))}
                </div>

                {/* Info note */}
                <div style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "flex-start", gap: 8, background: "rgba(239,244,240,0.70)", border: "1px solid rgba(200,218,208,0.80)", borderRadius: 10, padding: "9px 13px" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.55 }}>
                    Forecast ranges reflect expected variation based on property type, building demand, and short-term rental market conditions.
                  </p>
                </div>

              </div>
            );
          })()}

          {/* Table — compact premium */}
          <div style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${colors.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 8px 24px rgba(27,94,74,0.06)", marginTop: 0 }}>
            {/* Desktop table */}
            <div className="rpt-table-desktop" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F5F2ED", borderBottom: `1px solid ${colors.border}` }}>
                    {["Month", "Revenue", "Occupancy", "ADR", "Total Costs", "Net to Landlord"].map(h => (
                      <th key={h} style={{
                        padding: "11px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap",
                        letterSpacing: h === "Net to Landlord" ? "0.13em" : "0.10em",
                        color: h === "Net to Landlord" ? colors.primary : colors.textMuted,
                        background: h === "Net to Landlord" ? "rgba(27,94,74,0.07)" : undefined,
                        borderLeft: h === "Net to Landlord" ? `2px solid rgba(27,94,74,0.18)` : undefined,
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.months.map((m, i) => {
                    const occupancyRate = m.occupancy * 100;
                    const occupancyColor = occupancyRate >= 75 ? colors.primary : occupancyRate >= 67 ? colors.secondary : "#A0826D";
                    const barColor = occupancyRate >= 75 ? colors.primary : colors.secondary;
                    const totalCosts = m.managementFee + m.utilities + m.maintenance + m.furnitureAmort;

                    return (
                      <tr key={m.month}
                        style={{ borderBottom: i < result.months.length - 1 ? `1px solid ${colors.border}60` : "none", background: "#FFFFFF", transition: "background 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = `${colors.primary}05`)}
                        onMouseLeave={e => (e.currentTarget.style.background = "#FFFFFF")}>

                        {/* Month */}
                        <td style={{ padding: "13px 16px", fontWeight: 700, fontSize: 13, color: colors.primary, whiteSpace: "nowrap" }}>{m.month}</td>

                        {/* Revenue — clean, no % bar */}
                        <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: colors.primary }}>AED {fmt(m.revenue)}</p>
                        </td>

                        {/* Occupancy + compact bar */}
                        <td style={{ padding: "13px 16px", minWidth: 90 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: occupancyColor, marginBottom: 4 }}>{occupancyRate.toFixed(0)}%</p>
                          <div style={{ width: "100%", height: 3, background: `${colors.border}99`, borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(occupancyRate, 100)}%`, height: "100%", background: barColor, borderRadius: 99 }} />
                          </div>
                        </td>

                        {/* ADR */}
                        <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                          <p style={{ fontSize: 13, color: colors.secondary, fontWeight: 500 }}>AED {fmt(m.adr)}</p>
                        </td>

                        {/* Total Costs — grouped inline */}
                        <td style={{ padding: "13px 16px" }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted, marginBottom: 3 }}>AED {fmt(totalCosts)}</p>
                          <p style={{ fontSize: 10, color: colors.textLight, lineHeight: 1.5 }}>
                            Mgmt {fmt(m.managementFee)} · Util {fmt(m.utilities)} · Maint {fmt(m.maintenance)} · Furn {fmt(m.furnitureAmort)}
                          </p>
                        </td>

                        {/* Net to Landlord — highlighted */}
                        <td style={{ padding: "13px 18px", background: "rgba(27,94,74,0.055)", borderLeft: `2px solid rgba(27,94,74,0.20)`, boxShadow: "inset 2px 0 8px rgba(27,94,74,0.04)" }}>
                          <p style={{ fontSize: 15, fontWeight: 800, color: colors.primary, whiteSpace: "nowrap", letterSpacing: "0.01em" }}>AED {fmt(m.netToLandlord)}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards — shown below 640px, hidden above */}
            <div className="rpt-table-mobile">
              {result.months.map((m, i) => {
                const occupancyRate = m.occupancy * 100;
                const totalCosts = m.managementFee + m.utilities + m.maintenance + m.furnitureAmort;
                return (
                  <div key={m.month} style={{ borderBottom: i < result.months.length - 1 ? `1px solid ${colors.border}60` : "none", padding: "14px 16px", background: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: colors.primary }}>{m.month}</p>
                      <p style={{ fontSize: 15, fontWeight: 800, color: colors.primary }}>AED {fmt(m.netToLandlord)}</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
                      <p style={{ fontSize: 11, color: colors.textMuted }}>Revenue <span style={{ fontWeight: 600, color: colors.primary }}>AED {fmt(m.revenue)}</span></p>
                      <p style={{ fontSize: 11, color: colors.textMuted }}>Occupancy <span style={{ fontWeight: 600 }}>{occupancyRate.toFixed(0)}%</span></p>
                      <p style={{ fontSize: 11, color: colors.textMuted }}>ADR <span style={{ fontWeight: 600, color: colors.secondary }}>AED {fmt(m.adr)}</span></p>
                      <p style={{ fontSize: 11, color: colors.textMuted }}>Costs <span style={{ fontWeight: 600 }}>AED {fmt(totalCosts)}</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer note */}
          <p style={{ fontSize: 11, color: colors.textLight, marginTop: 10, textAlign: "center" }}>
            All amounts in AED · Figures are projections and subject to change
          </p>

        </div>

        {/* 12-Month STR Performance Overview — unified premium chart */}
        {(() => {
          const [activeTab, setActiveTab] = React.useState<"net"|"revenue"|"occupancy">("net");
          const [showLTR, setShowLTR] = React.useState(true);
          const [showBenchmark, setShowBenchmark] = React.useState(true);

          const annualLTR = result.longTermRent;
          const annualSTRNet = result.annualNetToLandlord;
          const outperf = annualLTR > 0 ? Math.round(((annualSTRNet - annualLTR) / annualLTR) * 100) : 0;

          const bestMonth = chartData.reduce((best, m) => m["STR Net"] > best["STR Net"] ? m : best, chartData[0]);

          const seasons: Record<string, string> = {
            Nov:"Peak", Dec:"Peak", Jan:"Peak", Feb:"Peak",
            Mar:"Shoulder", Apr:"Shoulder", Oct:"Shoulder",
            May:"Low", Jun:"Low", Jul:"Low", Aug:"Low", Sep:"Low",
          };

          const PremiumTooltip = ({ active, payload, label }: any) => {
            if (!active || !payload?.length) return null;
            const d = payload[0]?.payload;
            const season = seasons[label] ?? "Shoulder";
            const seasonColor = season === "Peak" ? colors.primary : season === "Low" ? "#A0826D" : colors.secondary;
            return (
              <div style={{ background: "#FDFCF9", border: `1px solid ${colors.border}`, borderRadius: 14, padding: "14px 16px", boxShadow: "0 8px 28px rgba(20,48,38,0.13)", minWidth: 170 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: colors.textMain }}>{label}</p>
                  <span style={{ fontSize: 10, fontWeight: 700, background: seasonColor + "18", color: seasonColor, borderRadius: 99, padding: "2px 8px", letterSpacing: "0.08em" }}>{season}</span>
                </div>
                {d["STR Net"] !== undefined && <div style={{ display:"flex", justifyContent:"space-between", gap:16, marginBottom:4 }}><span style={{ fontSize:11, color:colors.textMuted }}>STR Net</span><span style={{ fontSize:12, fontWeight:700, color:colors.primary }}>AED {fmt(d["STR Net"])}</span></div>}
                {showLTR && d["LTR Equivalent"] !== undefined && <div style={{ display:"flex", justifyContent:"space-between", gap:16, marginBottom:4 }}><span style={{ fontSize:11, color:colors.textMuted }}>LTR Equiv.</span><span style={{ fontSize:12, fontWeight:600, color:colors.secondary }}>AED {fmt(d["LTR Equivalent"])}</span></div>}
                {d.Occupancy !== undefined && <div style={{ display:"flex", justifyContent:"space-between", gap:16, marginBottom:4 }}><span style={{ fontSize:11, color:colors.textMuted }}>Occupancy</span><span style={{ fontSize:12, fontWeight:600, color:"#4A7A6A" }}>{d.Occupancy}%</span></div>}
                {d.Revenue !== undefined && <div style={{ display:"flex", justifyContent:"space-between", gap:16 }}><span style={{ fontSize:11, color:colors.textMuted }}>Revenue</span><span style={{ fontSize:12, fontWeight:600, color:colors.primary }}>AED {fmt(d.Revenue)}</span></div>}
              </div>
            );
          };

          const tabs = [
            { id: "net" as const, label: "Net Income" },
            { id: "revenue" as const, label: "Revenue" },
            { id: "occupancy" as const, label: "Occupancy" },
          ];

          const filters = ["12M View", "vs LTR", "Benchmark", "Seasonality"];

          return (
            <div className="pdf-section" style={{ position: "relative", borderRadius: 30, background: "linear-gradient(145deg, #FAFAF6 0%, #F5F2EE 100%)", border: `1px solid ${colors.border}`, boxShadow: "0 2px 6px rgba(0,0,0,0.03), 0 16px 48px rgba(27,94,74,0.08)", padding: "28px 28px 24px", breakInside: "avoid" as const }}>

              {/* Header row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  {/* Icon badge */}
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#EEF5F1", border: `1px solid rgba(27,94,74,0.14)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.secondary, marginBottom: 4 }}>12-Month Rental Projection</p>
                    <h2 style={{ fontSize: "clamp(17px, 2vw, 22px)", fontWeight: 700, fontFamily: "'Georgia', serif", background: `linear-gradient(120deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2, margin: 0 }}>
                      12-Month STR Performance Overview
                    </h2>
                    <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 3 }}>Compare monthly STR net performance vs. long-term rental equivalent</p>
                  </div>
                </div>

                {/* Metric tabs */}
                <div style={{ display: "flex", gap: 4, background: "#EDEAE4", borderRadius: 12, padding: 4 }} className="no-print">
                  {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "7px 14px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.2s",
                      background: activeTab === t.id ? colors.primary : "transparent",
                      color: activeTab === t.id ? "#fff" : colors.textMuted,
                      boxShadow: activeTab === t.id ? "0 2px 8px rgba(27,94,74,0.22)" : "none",
                    }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter pill row */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }} className="no-print">
                {filters.map(f => {
                  const isToggle = f === "vs LTR" || f === "Benchmark";
                  const isActive = f === "12M View" || (f === "vs LTR" && showLTR) || (f === "Benchmark" && showBenchmark);
                  return (
                    <button key={f} onClick={() => { if (f === "vs LTR") setShowLTR(v => !v); if (f === "Benchmark") setShowBenchmark(v => !v); }} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                      background: isActive ? "rgba(27,94,74,0.08)" : "#fff",
                      border: isActive ? `1px solid rgba(27,94,74,0.22)` : `1px solid ${colors.border}`,
                      color: isActive ? colors.primary : colors.textMuted,
                    }}>
                      {f}
                    </button>
                  );
                })}

                {/* Top-right KPI */}
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 10, color: colors.textLight, marginBottom: 1 }}>Annual STR Net</p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: colors.primary, lineHeight: 1 }}>AED {fmt(annualSTRNet)}</p>
                  </div>
                  {outperf !== 0 && (
                    <span style={{ fontSize: 11, fontWeight: 700, background: outperf > 0 ? "#EEF5F1" : "#FBF0EE", color: outperf > 0 ? colors.primary : "#A05030", border: `1px solid ${outperf > 0 ? "rgba(27,94,74,0.18)" : "rgba(160,80,48,0.18)"}`, borderRadius: 99, padding: "4px 10px" }}>
                      {outperf > 0 ? "+" : ""}{outperf}% vs LTR
                    </span>
                  )}
                </div>
              </div>

              {/* Chart */}
              <ResponsiveContainer width="100%" height={420}>
                {activeTab === "net" ? (
                  <ComposedChart data={chartData} margin={{ top: 10, right: 50, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="strAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.primary} stopOpacity={0.22} />
                        <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="aed" tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} width={40} />
                    <YAxis yAxisId="pct" orientation="right" tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0,100]} width={38} />
                    <Tooltip content={<PremiumTooltip />} cursor={{ stroke: colors.primary, strokeWidth: 1, strokeDasharray: "4 3", opacity: 0.4 }} />
                    <Area yAxisId="aed" type="monotone" dataKey="STR Net" stroke={colors.primary} strokeWidth={2.5} fill="url(#strAreaGrad)" dot={false} activeDot={{ r: 5, fill: colors.primary, stroke: "#fff", strokeWidth: 2 }} />
                    {showLTR && <Line yAxisId="aed" type="monotone" dataKey="LTR Equivalent" stroke={colors.secondary} strokeWidth={1.8} strokeDasharray="6 4" dot={false} activeDot={{ r: 4, fill: colors.secondary, stroke: "#fff", strokeWidth: 2 }} />}
                    {showBenchmark && <Line yAxisId="pct" type="monotone" dataKey="Occupancy" stroke="#7EB09A" strokeWidth={1.6} dot={{ r: 3, fill: "#7EB09A", stroke: "#fff", strokeWidth: 1.5 }} activeDot={{ r: 5 }} />}
                  </ComposedChart>
                ) : activeTab === "revenue" ? (
                  <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.primary} stopOpacity={0.20} />
                        <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="aed" tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} width={40} />
                    <YAxis yAxisId="pct" orientation="right" tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0,100]} width={38} />
                    <Tooltip content={<PremiumTooltip />} cursor={{ stroke: colors.primary, strokeWidth: 1, strokeDasharray: "4 3", opacity: 0.4 }} />
                    <Area yAxisId="aed" type="monotone" dataKey="Revenue" stroke={colors.primary} strokeWidth={2.5} fill="url(#revAreaGrad)" dot={false} activeDot={{ r: 5, fill: colors.primary, stroke: "#fff", strokeWidth: 2 }} />
                    {showBenchmark && <Line yAxisId="pct" type="monotone" dataKey="Occupancy" stroke="#7EB09A" strokeWidth={1.6} dot={{ r: 3, fill: "#7EB09A", stroke: "#fff", strokeWidth: 1.5 }} activeDot={{ r: 5 }} />}
                  </ComposedChart>
                ) : (
                  <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="pct" tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0,100]} width={40} />
                    <Tooltip content={<PremiumTooltip />} cursor={{ stroke: colors.secondary, strokeWidth: 1, strokeDasharray: "4 3", opacity: 0.4 }} />
                    {showBenchmark && <ReferenceLine yAxisId="pct" y={75} stroke={colors.secondary} strokeDasharray="6 4" label={{ value: "75% target", position: "right", fill: colors.secondary, fontSize: 10 }} />}
                    <Line yAxisId="pct" type="monotone" dataKey="Occupancy" stroke={colors.secondary} strokeWidth={2.5} dot={{ r: 4, fill: colors.secondary, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                )}
              </ResponsiveContainer>

              {/* Legend */}
              <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginTop: 14, marginBottom: 20 }}>
                {activeTab !== "occupancy" && <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:20, height:2.5, background: colors.primary, borderRadius:2 }}/><span style={{ fontSize:11, color:colors.textMuted }}>STR Net Income</span></div>}
                {activeTab === "revenue" && <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:20, height:2.5, background: colors.primary, borderRadius:2 }}/><span style={{ fontSize:11, color:colors.textMuted }}>Gross Revenue</span></div>}
                {activeTab === "net" && showLTR && <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:20, height:0, borderTop:`2px dashed ${colors.secondary}` }}/><span style={{ fontSize:11, color:colors.textMuted }}>LTR Equivalent</span></div>}
                {(activeTab === "net" || activeTab === "revenue") && showBenchmark && <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:8, height:8, borderRadius:"50%", background:"#7EB09A" }}/><span style={{ fontSize:11, color:colors.textMuted }}>Occupancy %</span></div>}
                {activeTab === "occupancy" && <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:8, height:8, borderRadius:"50%", background: colors.secondary }}/><span style={{ fontSize:11, color:colors.textMuted }}>Occupancy Rate</span></div>}
                {activeTab === "occupancy" && showBenchmark && <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:20, height:0, borderTop:`2px dashed ${colors.secondary}` }}/><span style={{ fontSize:11, color:colors.textMuted }}>75% Benchmark</span></div>}
              </div>

              {/* Bottom insight strip */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, background: "#fff", borderRadius: 16, border: `1px solid ${colors.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }} className="rpt-insight-strip">
                {[
                  { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6l4-4 4 4"/><path d="M12 2v10.5"/><path d="M20 17.5A8 8 0 0 1 4 17.5"/></svg>, label: "Peak Season", value: "Nov – Feb", sub: "Highest demand & yields", accent: colors.primary },
                  { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>, label: "Outperformance", value: `${outperf > 0 ? "+" : ""}${outperf}%`, sub: "vs LTR annual net", accent: colors.primary },
                  { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={colors.secondary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: "Expense Buffer", value: "Well Covered", sub: "Operating costs buffer", accent: colors.secondary },
                  { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={colors.secondary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>, label: "Best Month", value: bestMonth.month, sub: `AED ${fmt(bestMonth["STR Net"])} net`, accent: colors.secondary },
                ].map((item, i, arr) => (
                  <div key={item.label} style={{ padding: "14px 16px", borderRight: i < arr.length - 1 ? `1px solid ${colors.border}` : "none", display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: item.accent + "14", border: `1px solid ${item.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                      {item.icon}
                    </div>
                    <p style={{ fontSize: 10, color: colors.textLight, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 600 }}>{item.label}</p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: item.accent, lineHeight: 1.1 }}>{item.value}</p>
                    <p style={{ fontSize: 10, color: colors.textLight, lineHeight: 1.4 }}>{item.sub}</p>
                  </div>
                ))}
              </div>

            </div>
          );
        })()}

        {/* ── AREA INTELLIGENCE — market context powered by AirROI ── */}
        {(() => {
          const resolvedArea =
            result.buildingInfo?.area
            || getBuildingInfo(result.buildingName)?.area
            || (input.dldArea ? (DLD_AREA_TO_COMMUNITY[input.dldArea] ?? input.dldArea) : undefined);
          if (!resolvedArea) return null;
          return (
          <AreaIntelligence
            area={resolvedArea}
            propertyName={result.buildingName || result.propertyName}
            unitSize={result.unitSize}
            avgADR={result.avgADR}
            avgOccupancy={result.avgOccupancy}
            annualRevenue={result.annualRevenue}
            annualNetToLandlord={result.annualNetToLandlord}
            longTermRent={result.longTermRent}
            ltrRecommended={ltrRecommended}
          />
          );
        })()}

        {/* ── RECENT LTR TRANSACTIONS — live DLD Ejari data for this building ── */}
        <RecentTransactions
          buildingName={result.buildingName || result.propertyName}
          dldKey={input.dldKey}
          dldArea={input.dldArea}
          unitSize={result.unitSize}
        />

        {/* Part 2 CTA — Operator or Agent depending on recommendation */}
        <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: 28, marginTop: 4 }}>
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
        ) : showOperatorPriorities && !operatorSent ? (
          <div
            className="relative overflow-hidden text-left"
            style={{
              borderRadius: "28px", padding: "32px 32px",
              background: `radial-gradient(ellipse 700px 400px at 50% 0%, ${colors.secondary}12 0%, transparent 70%), linear-gradient(135deg, #FCF8F1 0%, #FBF6EE 100%)`,
              border: `1px solid ${colors.secondary}33`,
              boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 14px 40px rgba(0,0,0,0.06)",
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.secondary, marginBottom: 10 }}>
              Part 2 of 2
            </p>
            <h3 style={{ fontFamily: "'Georgia', serif", fontSize: 22, fontWeight: 700, color: colors.primary, marginBottom: 8 }}>
              What matters most to you?
            </h3>
            <p style={{ fontSize: 13.5, color: colors.textMuted, marginBottom: 20, lineHeight: 1.55 }}>
              Select all that apply — we&apos;ll rank operators by what you actually care about, not a fixed &quot;top 3&quot; list.
            </p>
            <div style={{ display: "grid", gap: 8, marginBottom: 22 }}>
              {PRIORITY_OPTIONS.map(opt => {
                const active = operatorPriorities.includes(opt.value);
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setOperatorPriorities(prev => prev.includes(opt.value) ? prev.filter(p => p !== opt.value) : [...prev, opt.value])}
                    style={{
                      textAlign: "left", padding: "12px 14px", borderRadius: 12,
                      border: active ? `1.5px solid ${colors.primary}` : "1px solid rgba(40,80,65,0.14)",
                      background: active ? "rgba(27,94,74,0.06)" : "rgba(255,255,255,0.6)",
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: active ? colors.primary : colors.textMain }}>
                      {active ? "✓ " : ""}{opt.label}
                    </p>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: colors.textMuted, lineHeight: 1.4 }}>{opt.description}</p>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              disabled={operatorPriorities.length === 0 || operatorSending}
              onClick={() => handleOperatorMatch(operatorPriorities)}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: operatorPriorities.length === 0 ? "rgba(184,138,68,0.35)" : "linear-gradient(135deg, #B88A44 0%, #D4AF6A 100%)",
                color: "#fff", fontSize: 14.5, fontWeight: 700,
                cursor: operatorPriorities.length === 0 || operatorSending ? "not-allowed" : "pointer",
                boxShadow: operatorPriorities.length === 0 ? "none" : "0 8px 20px rgba(184, 138, 68, 0.3)",
              }}
            >
              {operatorSending ? "Sending…" : "Send Me My Operator Matches →"}
            </button>
          </div>
        ) : (
          <PremiumCTACard
            theme="bronze"
            eyebrow="Part 2 of 2"
            eyebrowColor={colors.secondary}
            heading="Get matched with the right operator"
            description={<>We&apos;ll send you a personalised shortlist of the top Dubai STR operators for your property, ranked by what matters most to you — with their fees, strengths, and track record.</>}
            buttonText={operatorSent ? "✓ Sent to your email" : "Get Matched With an Operator →"}
            buttonGradient="linear-gradient(135deg, #B88A44 0%, #D4AF6A 100%)"
            buttonShadow="0 8px 20px rgba(184, 138, 68, 0.3)"
            onClick={() => { if (!operatorSent) setShowOperatorPriorities(true); }}
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
        </div>

        {/* Disclaimer */}
        <div className="text-center pb-10 space-y-2">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-sm font-bold" style={{ color: colors.textLight }}>AssetIntel</span>
            <span className="text-xs tracking-widest" style={{ color: colors.textLight, letterSpacing: "0.14em" }}>Property Intelligence. Smarter Decisions.</span>
          </div>
          <p className="text-xs" style={{ color: colors.textLight }}>
            This projection is based on Dubai market data and historical performance. Figures are indicative and may vary
            based on market conditions, property condition, furnishing quality, pricing, and operator performance. Always verify with current market data before making rental or investment decisions.
          </p>
        </div>

        {/* PDF-only footer — hidden on screen, visible in print */}
        <div className="print-only" style={{ display: "none", borderTop: "1.5px solid #E6E1D8", paddingTop: 20, marginTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1B5E4A" }}>AssetIntel</p>
              <p style={{ fontSize: 10, color: "#B88A44", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>Property Intelligence. Smarter Decisions.</p>
              <p style={{ fontSize: 10, color: "#8E8E8E", marginTop: 4 }}>assetintel.ae</p>
            </div>
            <p style={{ fontSize: 9, color: "#8E8E8E", maxWidth: 360, textAlign: "right", lineHeight: 1.6 }}>
              This projection is based on Dubai market data and historical performance. Figures are indicative and may vary based on market conditions, property condition, furnishing quality, pricing, and operator performance. Always verify with current market data before making rental or investment decisions.
            </p>
          </div>
        </div>
      </AccessGate>
      </div>
      </div>
    </div>
  );
}

// ── Shared branded loading screen — used while live DLD data is being
// fetched (can take several seconds on a cold cache) and while a saved
// report snapshot is loading. Cycles through status copy + shows a
// skeleton of the report layout so the wait doesn't read as a blank hang. ──
function ReportLoadingScreen({
  steps,
  subtitle,
}: {
  steps: string[];
  subtitle?: string;
}) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (steps.length <= 1) return;
    const id = setInterval(() => {
      setStepIndex(i => Math.min(i + 1, steps.length - 1));
    }, 3200);
    return () => clearInterval(id);
  }, [steps.length]);

  const progressPct = Math.round(((stepIndex + 1) / steps.length) * 92);

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EE" }}>
      <style>{`
        @keyframes ai-spin { to { transform: rotate(360deg); } }
        @keyframes ai-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        @keyframes ai-pulse { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
        .ai-skel {
          background: linear-gradient(90deg, #EFEAE0 25%, #F5F1E8 37%, #EFEAE0 63%);
          background-size: 800px 100%;
          animation: ai-shimmer 1.6s linear infinite;
          border-radius: 8px;
        }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <AssetIntelLogo />

        <div
          style={{
            marginTop: 28,
            width: "100%",
            maxWidth: 460,
            background: "#fff",
            border: "1px solid #E6E1D8",
            borderRadius: 16,
            padding: "28px 28px 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04), 0 12px 32px rgba(27,94,74,0.06)",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <div style={{ position: "relative", width: 44, height: 44 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid rgba(27,94,74,0.12)" }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#1B5E4A", animation: "ai-spin 0.9s linear infinite" }} />
            </div>
          </div>

          <p
            key={stepIndex}
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#2A2A2A",
              fontFamily: "'Georgia', serif",
              marginBottom: 6,
              animation: "ai-pulse 1.6s ease-in-out infinite",
            }}
          >
            {steps[stepIndex]}
          </p>
          {subtitle && (
            <p style={{ fontSize: 12.5, color: "#8E8E8E", marginBottom: 18 }}>{subtitle}</p>
          )}

          <div style={{ height: 6, borderRadius: 999, background: "#EFEAE0", overflow: "hidden", marginTop: subtitle ? 0 : 18 }}>
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                borderRadius: 999,
                background: "linear-gradient(90deg, #1B5E4A 0%, #B88A44 100%)",
                transition: "width 0.6s ease",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: i <= stepIndex ? "#1B5E4A" : "#E6E1D8",
                  transition: "background 0.4s ease",
                }}
              />
            ))}
          </div>
        </div>

        {/* Skeleton preview of the report layout taking shape underneath */}
        <div style={{ width: "100%", maxWidth: 620, marginTop: 32, opacity: 0.85 }}>
          <div className="ai-skel" style={{ height: 18, width: "45%", marginBottom: 18 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 18 }}>
            <div className="ai-skel" style={{ height: 84 }} />
            <div className="ai-skel" style={{ height: 84 }} />
            <div className="ai-skel" style={{ height: 84 }} />
          </div>
          <div className="ai-skel" style={{ height: 140, marginBottom: 14 }} />
          <div className="ai-skel" style={{ height: 60 }} />
        </div>
      </div>
    </div>
  );
}

// ── Gate: loads a previously saved report's frozen snapshot as-is — no
// recomputation, no live DLD/LTR refetch, so the client sees exactly what
// was saved. ──
function SavedReportGate({ savedId }: { savedId: string }) {
  const [state, setState] = useState<
    { status: "loading" }
    | { status: "ready"; result: EstimatorOutput; params: URLSearchParams }
    | { status: "not-found" }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("saved_reports")
        .select("result_snapshot, report_params")
        .eq("id", savedId)
        .single();

      if (cancelled) return;
      if (!data?.result_snapshot) { setState({ status: "not-found" }); return; }

      const params = new URLSearchParams(
        (data.report_params ?? {}) as Record<string, string>
      );
      setState({ status: "ready", result: data.result_snapshot as EstimatorOutput, params });
    })();
    return () => { cancelled = true; };
  }, [savedId]);

  if (state.status === "loading") return (
    <ReportLoadingScreen steps={["Loading your saved report…", "Restoring your exact figures…"]} />
  );

  if (state.status === "not-found") return (
    <div style={{ minHeight: "100vh", background: "#F8F4EE", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
      <p style={{ fontSize: "15px", color: "#6B6B6B", fontFamily: "'Georgia', serif" }}>This saved report could not be found.</p>
    </div>
  );

  return <ReportContent overrideParams={state.params} snapshotResult={state.result} snapshotId={savedId} />;
}

// ── Gate: pre-fetches live LTR before rendering report, so content renders with correct data ──
function ReportGate() {
  const params = useSearchParams();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [lrParam, setLrParam] = useState("");

  useEffect(() => {
    const existingLr = Number(params.get("lr")) || 0;
    if (existingLr > 0) { setLrParam(String(existingLr)); setReady(true); return; }

    const buildingName = params.get("buildingName") ?? "";
    const dldKey = params.get("dldKey") ?? "";
    const dldArea = params.get("dldArea") ?? "";
    const unitSize = params.get("unitSize") ?? "";
    const project = dldKey || buildingName;

    if (!project || !unitSize) { setReady(true); return; }

    const qs = new URLSearchParams({ project, bedrooms: unitSize });
    if (dldArea) qs.set("area", dldArea);

    const controller = new AbortController();
    // Cold lookups on rarely-viewed building/bedroom combos widen across
    // several DLD name-variant and date-window attempts server-side and can
    // take well over 12s — that was cutting off the live fetch and silently
    // falling back to static data even when live comps existed.
    const timeout = setTimeout(() => { controller.abort(); }, 28000);

    fetch(`/api/ltr-rents?${qs}`, { signal: controller.signal })
      .then(r => r.json())
      .then((data: { stat: { median: number } | null; source: string }) => {
        clearTimeout(timeout);
        const median = data?.stat?.median;
        const isLive = data?.source === "dda-live" || data?.source === "dda-live-cached";
        // Batch both state updates together so ReportContent sees lrParam on first render
        if (median && isLive) {
          setLrParam(String(median));
        }
        setReady(true);
      })
      .catch(() => { clearTimeout(timeout); setReady(true); });

    return () => { controller.abort(); clearTimeout(timeout); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    const buildingLabel = params.get("buildingName") || params.get("propertyName");
    return (
      <ReportLoadingScreen
        steps={[
          "Connecting to Dubai Land Department…",
          "Pulling recent rental contracts…",
          "Matching comparable units…",
          "Calculating live market rent…",
          "Finalising your report…",
        ]}
        subtitle={buildingLabel ? `Analysing ${buildingLabel}` : undefined}
      />
    );
  }

  // Inject lr into search params so ReportContent initialises with live value
  const fullParams = new URLSearchParams(params.toString());
  if (lrParam) fullParams.set("lr", lrParam);

  return <ReportContent overrideParams={fullParams} />;
}

function ReportEntry() {
  const params = useSearchParams();
  const savedId = params.get("savedId");
  return savedId ? <SavedReportGate savedId={savedId} /> : <ReportGate />;
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
      <ReportEntry />
    </Suspense>
  );
}
