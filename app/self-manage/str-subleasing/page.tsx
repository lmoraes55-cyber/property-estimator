"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import GroundWorksLogo from "@/components/GroundWorksLogo";
import { useIsMobile } from "@/lib/useIsMobile";

const colors = {
  primary: "#1B5E4A",
  secondary: "#B88A44",
  bgMain: "#FAFAF8",
  bgSection: "#FFFFFF",
  textMain: "#1A1A1A",
  textMuted: "#6B6B6B",
  border: "#E0DDD8",
  shadowSm: "0 1px 2px rgba(0,0,0,0.05)",
  shadowMd: "0 4px 12px rgba(0,0,0,0.09)",
};

const serifHeading = "'Georgia', serif";
const S = (color: string) => ({
  stroke: color, strokeWidth: 1.4, fill: "none",
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
});

// ─── Icons ─────────────────────────────────────────────────────────────────
const IconKey = ({ color = colors.secondary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><circle cx="12" cy="14" r="6" {...S(color)} /><path d="M16.5 17.5L26 27" {...S(color)} /><path d="M22 24L24 26" {...S(color)} /></svg>
);
const IconHandshake = ({ color = colors.primary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M4 16L10 10H16L20 14L26 10" {...S(color)} /><path d="M26 10L28 12L22 18L18 14" {...S(color)} /><path d="M4 16L6 18L14 26L16 24" {...S(color)} /><path d="M14 26L16 24L20 20" {...S(color)} /></svg>
);
const IconChart = ({ color = colors.secondary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M6 24L12 17L17 21L26 10" {...S(color)} /><path d="M21 10H26V15" {...S(color)} /><path d="M6 26H26" {...S(color)} /></svg>
);
const IconRisk = ({ color = colors.primary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M16 5L27 25H5L16 5Z" {...S(color)} /><path d="M16 13V19" {...S(color)} /><circle cx="16" cy="22" r="1" fill={color} strokeWidth="0" /></svg>
);
const IconBuilding = ({ color = colors.primary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M6 28V11L16 5L26 11V28" {...S(color)} /><rect x="12" y="19" width="8" height="9" rx="1" {...S(color)} /><rect x="9" y="14" width="4" height="4" rx="0.5" {...S(color)} /><rect x="19" y="14" width="4" height="4" rx="0.5" {...S(color)} /></svg>
);
const IconDoc = ({ color = colors.primary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M9 5H19L25 11V27H9V5Z" {...S(color)} /><path d="M19 5V11H25" {...S(color)} /><path d="M13 16H21" {...S(color)} /><path d="M13 20H18" {...S(color)} /></svg>
);
const IconMoney = ({ color = colors.secondary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><rect x="4" y="9" width="24" height="15" rx="2" {...S(color)} /><circle cx="16" cy="16.5" r="4" {...S(color)} /><path d="M8 13h0.1M24 20h0.1" {...S(color)} /></svg>
);
const IconGuest = ({ color = colors.primary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M6 8C6 6.9 6.9 6 8 6H24C25.1 6 26 6.9 26 8V19C26 20.1 25.1 21 24 21H12L7 26V8Z" {...S(color)} /><path d="M11 12H21" {...S(color)} /><path d="M11 16H17" {...S(color)} /></svg>
);
const IconClean = ({ color = colors.secondary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M18 6L22 10" {...S(color)} /><path d="M20 8L11 17L8 24L15 21L24 12L20 8Z" {...S(color)} /><path d="M11 17L15 21" {...S(color)} /></svg>
);
const IconTool = ({ color = colors.primary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M20 6C17.2 6 15 8.2 15 11C15 11.7 15.1 12.4 15.4 13L7 21L9 26L14 24L22 15.6C22.6 15.9 23.3 16 24 16C26.8 16 29 13.8 29 11C29 10.2 28.8 9.4 28.5 8.7L25 12.2L22 9.2L25.3 5.5C24.6 5.2 23.8 6 23 6H20Z" {...S(color)} /></svg>
);
const IconPricing = ({ color = colors.secondary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M16 6V26" {...S(color)} /><path d="M20.5 10C20.5 7.8 18.5 7 16 7C13.5 7 11.5 8.2 11.5 10C11.5 11.8 13.5 13 16 13C18.5 13 20.5 14.2 20.5 16C20.5 18.2 18.5 19 16 19C13.5 19 11.5 18 11.5 16" {...S(color)} /></svg>
);
const IconLock = ({ color = colors.primary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><rect x="8" y="14" width="16" height="12" rx="2" {...S(color)} /><path d="M11 14V11C11 8.2 13.2 6 16 6C18.8 6 21 8.2 21 11V14" {...S(color)} /><circle cx="16" cy="20" r="1.6" fill={color} strokeWidth="0" /></svg>
);
const IconCash = ({ color = colors.secondary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M6 10H26V22H6V10Z" {...S(color)} /><path d="M10 16H22" {...S(color)} /><path d="M16 13V19" {...S(color)} /></svg>
);
const IconCheck = ({ color = colors.primary, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8.5" stroke={color} strokeWidth="1.2" opacity="0.3" /><path d="M6.5 10L9 12.5L13.5 7.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const IconWarning = ({ color = "#A37020", size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 3L22 20H2L12 3Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /><path d="M12 10V14" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><circle cx="12" cy="17.5" r="0.8" fill={color} /></svg>
);
const IconArrow = ({ color = colors.textMuted, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"><path d="M10 4V16M10 16L6 12M10 16L14 12" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

// ─── Shared Components ─────────────────────────────────────────────────────
function SectionHeading({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "52px", textAlign: "center" }}>
      <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "14px" }}>{label}</div>
      <h2 style={{
        fontSize: "38px", fontFamily: serifHeading, fontWeight: 700, marginBottom: "14px",
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
      }}>{title}</h2>
      {subtitle && <p style={{ fontSize: "16px", color: colors.textMuted, lineHeight: 1.65, maxWidth: "620px", margin: "0 auto" }}>{subtitle}</p>}
    </div>
  );
}

function InfoCard({ icon, title, text, accentColor = colors.primary }: { icon: React.ReactNode; title: string; text: string; accentColor?: string }) {
  return (
    <div style={{ background: colors.bgSection, borderRadius: "16px", border: `1px solid ${colors.border}`, borderTop: `3px solid ${accentColor}`, padding: "30px", boxShadow: colors.shadowSm }}>
      <div style={{ marginBottom: "16px" }}>{icon}</div>
      <h3 style={{ fontSize: "17px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "10px" }}>{title}</h3>
      <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.65 }}>{text}</p>
    </div>
  );
}

function MistakeCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div style={{ background: "#FFFBF5", borderRadius: "12px", border: "1px solid #E8D9BC", borderLeft: "3px solid #B88A44", padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "5px" }}>
        <div style={{ marginTop: "1px", flexShrink: 0 }}><IconWarning /></div>
        <span style={{ fontSize: "14px", fontWeight: 700, color: colors.textMain }}>{detail ? title : title}</span>
      </div>
      {detail && <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.55, marginLeft: "28px" }}>{detail}</p>}
    </div>
  );
}

function RoadmapStep({ number, title, description, isLast }: { number: number; title: string; description: string; isLast?: boolean }) {
  return (
    <div style={{ display: "flex", gap: "22px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: colors.secondary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 700, color: "#fff", fontFamily: serifHeading, flexShrink: 0 }}>{number}</div>
        {!isLast && <div style={{ width: "1.5px", flex: 1, background: colors.border, minHeight: "36px", marginTop: "8px" }} />}
      </div>
      <div style={{ paddingBottom: isLast ? 0 : "32px", flex: 1 }}>
        <h3 style={{ fontSize: "17px", fontWeight: 700, color: colors.textMain, marginBottom: "7px", marginTop: "10px" }}>{title}</h3>
        <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.65 }}>{description}</p>
      </div>
    </div>
  );
}

const READINESS_ITEMS = [
  "I understand landlord approval requirements",
  "I can negotiate written STR permission",
  "I can calculate break-even occupancy",
  "I have capital to cover setup costs",
  "I have 3–6 months of rent as cash buffer",
  "I can manage guest communication quickly",
  "I have cleaning and maintenance partners",
  "I can review and adjust pricing weekly",
  "I understand DET permit requirements",
  "I can track monthly profit and loss",
];

function getReadiness(n: number) {
  if (n <= 3) return { label: "Not ready yet", color: "#A14B3D", bg: "#FDF3F2", border: "#E8C3BF" };
  if (n <= 7) return { label: "Possible, but needs structure", color: "#8A7020", bg: "#FFFBF0", border: "#E8D89A" };
  return { label: "Strong candidate for sub-leasing", color: colors.primary, bg: "#F0F8F4", border: "#B3D4C8" };
}

export default function STRSubleasingPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setChecked((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const count = checked.size;
  const result = getReadiness(count);

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh" }}>

      {/* ─── HEADER ─── */}
      <header style={{ background: colors.bgSection, borderBottom: `1px solid ${colors.border}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: isMobile ? "14px 20px" : "16px 40px", display: "flex", alignItems: "center", gap: isMobile ? "0" : "60px", justifyContent: isMobile ? "space-between" : "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => router.push("/")}>
            <GroundWorksLogo size={40} />
            <div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: colors.textMain }}>Ground<span style={{ color: colors.primary }}>Works</span></div>
              <div style={{ fontSize: "10px", color: colors.textMuted, letterSpacing: "0.1em" }}>RENTAL INTELLIGENCE</div>
            </div>
          </div>
          {!isMobile && (
            <nav style={{ display: "flex", gap: "40px" }}>
              <a onClick={() => router.push("/")} style={{ cursor: "pointer", color: colors.textMuted, fontSize: "15px", fontWeight: 500 }}>Home</a>
              <a onClick={() => router.push("/self-manage")} style={{ cursor: "pointer", color: colors.textMuted, fontSize: "15px", fontWeight: 500 }}>Self-Manage</a>
              <a style={{ color: colors.secondary, fontSize: "15px", fontWeight: 600 }}>STR Sub-Leasing</a>
              <a onClick={() => router.push("/estimator")} style={{ cursor: "pointer", color: colors.textMuted, fontSize: "15px", fontWeight: 500 }}>Analyzer</a>
            </nav>
          )}
          {isMobile && (
            <a onClick={() => router.push("/self-manage")} style={{ cursor: "pointer", fontSize: "13px", color: colors.primary, fontWeight: 600 }}>← Back</a>
          )}
        </div>
      </header>

      {/* ─── 1. HERO ─── */}
      <section style={{ background: colors.bgSection, borderBottom: `1px solid ${colors.border}`, padding: isMobile ? "52px 20px 48px" : "96px 40px 80px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", gap: isMobile ? "48px" : "80px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "18px" }}>STR SUB-LEASING MODEL</div>
            <h1 style={{ fontSize: isMobile ? "34px" : "52px", fontFamily: serifHeading, fontWeight: 700, lineHeight: 1.15, marginBottom: "22px", background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Build a Short-Term Rental Business Without Owning Property
            </h1>
            <p style={{ fontSize: "17px", color: colors.textMuted, lineHeight: 1.65, marginBottom: "36px", maxWidth: "560px" }}>
              A practical roadmap for entrepreneurs who want to source the right units, secure landlord approvals, calculate profitability, reduce risk, and operate short-term rentals professionally in Dubai.
            </p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <a href="#roadmap" style={{ padding: "14px 28px", background: colors.secondary, color: "#fff", borderRadius: "10px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}>Start With The Framework</a>
              <a href="#risk" style={{ padding: "14px 28px", background: "transparent", color: colors.secondary, border: `2px solid ${colors.secondary}`, borderRadius: "10px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}>Check Minimum-Risk Areas</a>
            </div>
          </div>
          {/* Dashboard card */}
          <div style={{ flexShrink: 0, width: isMobile ? "100%" : "300px" }}>
            <div style={{ background: colors.bgMain, borderRadius: "20px", border: `1px solid ${colors.border}`, padding: "28px", boxShadow: "0 8px 32px rgba(184,138,68,0.08)" }}>
              <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "20px" }}>SUB-LEASING CHECKLIST</div>
              {[
                { label: "Unit Sourcing", value: "Area + Demand" },
                { label: "Landlord Approval", value: "Written Required" },
                { label: "Break-Even Check", value: "Before Signing" },
                { label: "Area Risk Score", value: "Low / Med / High" },
                { label: "STR Profitability", value: "Net, Not Gross" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${colors.border}` }}>
                  <span style={{ fontSize: "13px", color: colors.textMuted }}>{row.label}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: colors.secondary }}>{row.value}</span>
                </div>
              ))}
              <div style={{ marginTop: "20px", padding: "14px", background: "rgba(184,138,68,0.06)", borderRadius: "10px", border: `1px solid rgba(184,138,68,0.18)` }}>
                <div style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "4px" }}>Minimum cash buffer needed</div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: colors.secondary, fontFamily: serifHeading }}>3 – 6 Months</div>
                <div style={{ fontSize: "11px", color: colors.textMuted }}>of rent and operating costs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. WHAT IS SUB-LEASING ─── */}
      <section style={{ padding: isMobile ? "52px 20px" : "80px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="THE MODEL" title="What Is STR Sub-Leasing?" subtitle="Understanding the structure before making any commitment." />
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "48px", alignItems: "flex-start" }}>
            {/* Flow diagram */}
            <div style={{ flexShrink: 0, width: isMobile ? "100%" : "260px" }}>
              <div style={{ background: colors.bgSection, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: "32px 24px", boxShadow: colors.shadowSm }}>
                {[
                  { label: "Landlord", sub: "Owns the property", color: colors.primary },
                  null,
                  { label: "STR Operator", sub: "Rents & operates", color: colors.secondary },
                  null,
                  { label: "Holiday Home Permit", sub: "DET registration", color: colors.primary },
                  null,
                  { label: "Guest Bookings", sub: "Airbnb / Booking.com", color: colors.secondary },
                  null,
                  { label: "Monthly Profit / Loss", sub: "Revenue minus all costs", color: colors.primary },
                ].map((item, i) =>
                  item === null ? (
                    <div key={i} style={{ display: "flex", justifyContent: "center", padding: "6px 0" }}><IconArrow size={16} /></div>
                  ) : (
                    <div key={i} style={{ textAlign: "center", padding: "12px 16px", background: `${item.color}0D`, borderRadius: "10px", border: `1px solid ${item.color}22` }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: item.color }}>{item.label}</div>
                      <div style={{ fontSize: "11px", color: colors.textMuted, marginTop: "2px" }}>{item.sub}</div>
                    </div>
                  )
                )}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "16px", color: colors.textMain, lineHeight: 1.7, marginBottom: "24px" }}>
                STR sub-leasing is when an entrepreneur rents a property from a landlord and, with proper written approval and the required permits, operates it as a short-term holiday home generating nightly revenue from guests.
              </p>
              <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "28px" }}>
                The operator pays a fixed monthly rent regardless of how many guests book. Revenue from guest stays must cover that rent, all operating costs, setup cost recovery, and produce net profit. The gap between fixed rent and variable STR income is the central risk of this model.
              </p>
              <div style={{ padding: "22px 24px", background: "#F0F8F4", borderRadius: "12px", border: "1px solid rgba(27,94,74,0.15)", borderLeft: `3px solid ${colors.primary}` }}>
                <p style={{ fontSize: "14px", color: colors.textMain, lineHeight: 1.65, margin: 0 }}>
                  <strong style={{ color: colors.primary }}>Key principle:</strong> This model can work, but only when the unit is selected carefully, landlord approval is secured in writing, the cost structure is controlled, and the expected STR revenue comfortably exceeds fixed rent in both high and low season.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. IS THIS RIGHT FOR YOU ─── */}
      <section style={{ padding: isMobile ? "52px 20px" : "80px 40px", background: colors.bgSection, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="SUITABILITY" title="Is STR Sub-Leasing Right For You?" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
            <InfoCard icon={<IconCheck color={colors.primary} size={28} />} title="Best For" accentColor={colors.primary} text="Entrepreneurs who can handle operations, guest communication, pricing, cleaning coordination, maintenance oversight, and monthly cash-flow risk without a guaranteed income floor." />
            <InfoCard icon={<IconWarning color="#A14B3D" size={28} />} title="Not Ideal For" accentColor="#A14B3D" text="Anyone looking for passive income, people with limited or no cash buffer, or anyone unwilling to manage guests and operational issues seven days a week." />
            <InfoCard icon={<IconBuilding color={colors.secondary} size={28} />} title="GroundWorks View" accentColor={colors.secondary} text="Sub-leasing can scale faster than ownership, but risk is structurally higher because rent is fixed while STR income is seasonal, variable, and platform-dependent." />
          </div>
        </div>
      </section>

      {/* ─── 4. ESTIMATOR PREVIEW ─── */}
      <section id="risk" style={{ padding: isMobile ? "52px 20px" : "80px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="COMING SOON" title="Minimum-Risk Unit & Area Estimator" subtitle="GroundWorks will help identify which areas, buildings, and unit types are more suitable for STR sub-leasing based on rent levels, demand, revenue potential, and break-even risk." />
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ background: colors.bgSection, borderRadius: "20px", border: `1px solid ${colors.border}`, overflow: "hidden", boxShadow: "0 8px 32px rgba(27,94,74,0.07)" }}>
              {/* Header bar */}
              <div style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #145040 100%)`, padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", marginBottom: "4px" }}>GROUNDWORKS</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff", fontFamily: serifHeading }}>Sub-Leasing Estimator</div>
                </div>
                <div style={{ padding: "7px 16px", background: "rgba(255,255,255,0.12)", borderRadius: "999px", fontSize: "12px", color: "rgba(255,255,255,0.9)", fontWeight: 600, border: "1px solid rgba(255,255,255,0.2)" }}>Coming Soon</div>
              </div>
              {/* Input fields preview */}
              <div style={{ padding: isMobile ? "24px 20px" : "32px 36px" }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
                  {[
                    { label: "Area / Community", placeholder: "e.g. JVC, Dubai Marina" },
                    { label: "Building Name", placeholder: "Optional" },
                    { label: "Unit Size", placeholder: "Studio / 1BR / 2BR" },
                    { label: "Asking Monthly Rent", placeholder: "AED" },
                    { label: "Furnishing Budget", placeholder: "AED" },
                    { label: "Expected Occupancy", placeholder: "e.g. 70%" },
                  ].map((field) => (
                    <div key={field.label}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: colors.textMuted, letterSpacing: "0.08em", marginBottom: "6px" }}>{field.label.toUpperCase()}</div>
                      <div style={{ padding: "11px 14px", background: colors.bgMain, borderRadius: "8px", border: `1px solid ${colors.border}`, fontSize: "13px", color: colors.textMuted, opacity: 0.7 }}>{field.placeholder}</div>
                    </div>
                  ))}
                </div>
                {/* Output preview */}
                <div style={{ padding: "24px", background: colors.bgMain, borderRadius: "14px", border: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: colors.secondary, letterSpacing: "0.12em", marginBottom: "20px" }}>ESTIMATED OUTPUT</div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)", gap: "16px" }}>
                    {[
                      { label: "STR Revenue Range", value: "—" },
                      { label: "Break-Even Occupancy", value: "—" },
                      { label: "Net Profit Range", value: "—" },
                      { label: "Risk Level", value: "—" },
                      { label: "Recommendation", value: "—" },
                    ].map((out) => (
                      <div key={out.label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "22px", fontWeight: 700, color: colors.textMuted, fontFamily: serifHeading, marginBottom: "4px" }}>{out.value}</div>
                        <div style={{ fontSize: "11px", color: colors.textMuted, lineHeight: 1.4 }}>{out.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: "12.5px", color: colors.textMuted, textAlign: "center", marginTop: "16px", lineHeight: 1.6 }}>
                  This estimator is in development. Use the GroundWorks Property Analyzer for current STR and LTR data while this tool is being built.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. UNIT SELECTION FRAMEWORK ─── */}
      <section style={{ padding: isMobile ? "52px 20px" : "80px 40px", background: colors.bgSection, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="UNIT SELECTION" title="The Safe Unit Selection Framework" subtitle="Not every cheap rental is a good STR sub-leasing opportunity. These six criteria separate viable units from expensive mistakes." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "22px" }}>
            {[
              { icon: <IconChart size={26} />, title: "Rent-to-Revenue Gap", text: "STR revenue must comfortably exceed annual rent, operating costs, furnishing recovery, platform fees, utilities, and vacancy — not just in peak season, but at 60% occupancy.", accentColor: colors.secondary },
              { icon: <IconBuilding size={26} />, title: "Building Demand", text: "Prioritise buildings with tourist or business demand, easy access, good guest appeal, and verifiable existing STR activity. Avoid buildings where STR has no proven track record.", accentColor: colors.primary },
              { icon: <IconKey color={colors.primary} size={26} />, title: "Unit Type", text: "Studios and 1BR units are typically lower risk due to smaller setup cost, simpler pricing, faster occupancy recovery, and lower break-even threshold.", accentColor: colors.primary },
              { icon: <IconLock size={26} />, title: "Access & Guest Experience", text: "Buildings with simple self-check-in, parking cooperation, security access, and guest-friendly rules reduce daily operational friction and negative review risk.", accentColor: colors.secondary },
              { icon: <IconMoney color={colors.secondary} size={26} />, title: "Furnishing Cost", text: "Avoid units that require heavy investment unless the rent is deeply discounted and STR revenue upside is well-supported by data. Setup cost must recover within 6–12 months.", accentColor: colors.secondary },
              { icon: <IconDoc size={26} />, title: "Exit Flexibility", text: "Prefer lease agreements that include reasonable early termination terms if the unit underperforms. A locked-in 12-month lease on a weak unit creates significant downside exposure.", accentColor: colors.primary },
            ].map((card) => (
              <InfoCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. AREA & BUILDING RISK SCORING ─── */}
      <section style={{ padding: isMobile ? "52px 20px" : "80px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="AREA SCORING" title="How GroundWorks Scores Areas & Buildings" subtitle="The six dimensions GroundWorks uses to evaluate whether an area and building are suitable for STR sub-leasing." />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "20px", marginBottom: "40px" }}>
            {[
              { num: "01", title: "STR Demand Score", text: "Tourist volume, business travel, event access, walkability, proximity to attractions, and platform listing density in the area." },
              { num: "02", title: "Rent Pressure Score", text: "Whether the long-term rent level leaves sufficient margin after costs for STR profit. High LTR areas compress sub-leasing margin significantly." },
              { num: "03", title: "Occupancy Stability Score", text: "How consistent guest demand is across high and low season. Areas with extreme seasonality carry higher cash-flow risk in Q2–Q3." },
              { num: "04", title: "Guest Appeal Score", text: "View, building quality, shared amenities, access ease, furnishing potential, and how the neighbourhood is perceived by international guests." },
              { num: "05", title: "Operational Ease Score", text: "Self-check-in compatibility, parking availability, building security cooperation, maintenance access, and community rules for rotating guests." },
              { num: "06", title: "Downside Risk Score", text: "Break-even occupancy required, fixed rent exposure, low-season vacancy risk, setup cost relative to revenue, and difficulty of exit." },
            ].map((item) => (
              <div key={item.num} style={{ background: colors.bgSection, borderRadius: "14px", border: `1px solid ${colors.border}`, padding: "26px", boxShadow: colors.shadowSm }}>
                <div style={{ fontSize: "28px", fontFamily: serifHeading, fontWeight: 700, color: `${colors.secondary}40`, marginBottom: "12px" }}>{item.num}</div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: colors.textMain, marginBottom: "8px" }}>{item.title}</h3>
                <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.65 }}>{item.text}</p>
              </div>
            ))}
          </div>
          {/* Risk level output */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", maxWidth: "880px", margin: "0 auto" }}>
            <div style={{ background: "#F0F8F4", borderRadius: "14px", border: "1px solid #B3D4C8", borderTop: `4px solid ${colors.primary}`, padding: "24px" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: colors.primary, marginBottom: "10px" }}>Low Risk</div>
              <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.65 }}>Strong STR demand, reasonable rent, low setup cost, clear approval route, and stable occupancy across all seasons.</p>
            </div>
            <div style={{ background: "#FFFBF0", borderRadius: "14px", border: "1px solid #E8D89A", borderTop: `4px solid #C9A020`, padding: "24px" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#8A7020", marginBottom: "10px" }}>Medium Risk</div>
              <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.65 }}>Good revenue potential but higher rent pressure, seasonal demand swings, or operational complexity requiring stronger management.</p>
            </div>
            <div style={{ background: "#FDF3F2", borderRadius: "14px", border: "1px solid #E8C3BF", borderTop: `4px solid #A14B3D`, padding: "24px" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#A14B3D", marginBottom: "10px" }}>High Risk</div>
              <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.65 }}>High fixed rent, weak tourist demand, difficult approval route, poor access, or uncertain guest appeal that makes break-even unreliable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. LEGAL & APPROVAL ─── */}
      <section style={{ padding: isMobile ? "52px 20px" : "80px 40px", background: colors.bgSection, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="COMPLIANCE" title="Legal & Approval Requirements" />
          <div style={{ maxWidth: "820px", margin: "0 auto" }}>
            <div style={{ marginBottom: "24px", padding: "18px 22px", background: "#FDF3F2", borderRadius: "12px", border: "1.5px solid #E8C3BF", display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <div style={{ marginTop: "2px", flexShrink: 0 }}><IconWarning color="#A14B3D" size={20} /></div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#A14B3D", marginBottom: "4px" }}>DO NOT OPERATE WITHOUT THIS</div>
                <p style={{ fontSize: "13px", color: "#7A3530", lineHeight: 1.6, margin: 0 }}>Do not operate a sub-leased STR unit without written landlord approval and the required DET holiday home permit. Operating without these creates legal, financial, and eviction risk.</p>
              </div>
            </div>
            <div style={{ background: colors.bgSection, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: isMobile ? "24px 20px" : "38px 44px", boxShadow: colors.shadowSm }}>
              {[
                "Written landlord approval for sub-leasing and short-term rental use",
                "Tenancy contract that clearly permits the intended holiday-home use",
                "Ejari registration where applicable",
                "DET holiday home permit obtained before listing on any platform",
                "Landlord's required documents provided to DET application",
                "Operator/tenant's Emirates ID or passport",
                "DEWA bill and unit documentation",
                "Developer or building management NOC if required",
                "Confirmation of building rules for guest access and rotating occupancy",
                "Tourism Dirham registration and collection process where applicable",
                "Trade licence if operating commercially as a business entity",
                "Insurance that covers guest damage and liability",
                "Clear written agreement on maintenance responsibility",
                "Clear written agreement on utilities responsibility",
                "Clear and enforceable exit clause in the tenancy agreement",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "11px 0", borderBottom: `1px solid ${colors.border}` }}>
                  <div style={{ marginTop: "1px", flexShrink: 0 }}><IconCheck /></div>
                  <span style={{ fontSize: "14px", color: colors.textMain, lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
              <div style={{ marginTop: "22px", padding: "14px 16px", background: "#FFFBF5", borderRadius: "8px", border: "1px solid #E8D9BC" }}>
                <p style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.6, margin: 0 }}>
                  <strong style={{ color: "#8A6020" }}>Disclaimer:</strong> This section is educational and not legal advice. Requirements can change. Verify current rules directly with DET, your landlord, building management, and a licensed advisor before operating.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. FINANCIAL MODEL ─── */}
      <section style={{ padding: isMobile ? "52px 20px" : "80px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="FINANCIALS" title="The Numbers You Must Check Before Signing" subtitle="A unit is not safe just because projected annual profit looks positive. It must survive low season." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "22px", marginBottom: "36px" }}>
            {[
              { label: "REVENUE", color: colors.primary, items: ["Expected nightly rate (ADR)", "Expected occupancy %", "Monthly gross revenue", "Seasonal revenue range (high vs low)", "Cleaning fee income if applicable"] },
              { label: "FIXED COSTS", color: "#A14B3D", items: ["Monthly rent", "DEWA / utilities", "Internet", "Chiller if applicable", "Software tools", "Permit / compliance annual cost", "Insurance"] },
              { label: "VARIABLE COSTS", color: colors.secondary, items: ["Cleaning per turnover", "Laundry and linen", "Consumables", "Platform commission (typically 15–18%)", "Payment processing", "Guest compensation / credits", "Repair calls"] },
              { label: "SETUP COSTS", color: "#5A5A5A", items: ["Furniture package", "Appliances", "Linen and towels", "Kitchenware", "Smart lock / access", "Professional photography", "Initial deep clean", "Deposit and agency fee"] },
            ].map((col) => (
              <div key={col.label} style={{ background: colors.bgSection, borderRadius: "14px", border: `1px solid ${colors.border}`, padding: "24px", boxShadow: colors.shadowSm }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: col.color, letterSpacing: "0.12em", marginBottom: "16px" }}>{col.label}</div>
                {col.items.map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "9px", padding: "7px 0", borderBottom: `1px solid ${colors.border}` }}>
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: col.color, flexShrink: 0, marginTop: "6px" }} />
                    <span style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {/* Key formulas */}
          <div style={{ maxWidth: "820px", margin: "0 auto" }}>
            <div style={{ background: colors.bgSection, borderRadius: "16px", border: `1px solid ${colors.border}`, padding: isMobile ? "24px 20px" : "36px 40px", boxShadow: colors.shadowSm }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: colors.secondary, letterSpacing: "0.12em", marginBottom: "24px" }}>KEY FORMULAS</div>
              {[
                { title: "Monthly Break-Even Revenue", formula: "Rent + Utilities + Fixed Costs + Variable Cost Buffer" },
                { title: "Break-Even Occupancy", formula: "Monthly Break-Even Revenue ÷ Expected ADR ÷ Days in Month" },
                { title: "Setup Cost Payback Period", formula: "Total Setup Cost ÷ Expected Monthly Net Profit" },
                { title: "Minimum Cash Buffer", formula: "3 to 6 months of rent and all operating costs" },
              ].map((f, i, arr) => (
                <div key={f.title} style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "6px" : "24px", padding: "16px 0", borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : "none" }}>
                  <div style={{ width: isMobile ? "100%" : "240px", flexShrink: 0, fontSize: "13px", fontWeight: 700, color: colors.textMain }}>{f.title}</div>
                  <div style={{ fontSize: "13px", color: colors.primary, fontFamily: "monospace", background: "rgba(27,94,74,0.05)", padding: "8px 14px", borderRadius: "6px", flex: 1 }}>{f.formula}</div>
                </div>
              ))}
              <div style={{ marginTop: "22px", padding: "16px 18px", background: "#FFFBF5", borderRadius: "10px", border: "1px solid #E8D9BC" }}>
                <p style={{ fontSize: "13.5px", color: colors.textMain, lineHeight: 1.65, margin: 0 }}>
                  <strong style={{ color: "#8A6020" }}>Critical check:</strong> Run your break-even calculation at 55–60% occupancy, not projected peak occupancy. If the unit does not survive low season, the annual profit projection is misleading.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. LANDLORD NEGOTIATION ─── */}
      <section style={{ padding: isMobile ? "52px 20px" : "80px 40px", background: colors.bgSection, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="NEGOTIATION" title="Landlord Negotiation Checklist" subtitle="Secure every item on this list in writing before spending money on the unit." />
          <div style={{ maxWidth: "780px", margin: "0 auto" }}>
            <div style={{ background: colors.bgMain, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: isMobile ? "24px 20px" : "38px 44px", boxShadow: colors.shadowSm }}>
              {[
                "Written permission for short-term rental and sub-leasing use",
                "Permission to apply for a DET holiday home permit",
                "Permission for guest stays and rotating occupants",
                "Permission to install a smart lock or key-safe system",
                "Clear written maintenance responsibilities (who pays, who arranges)",
                "Clear furniture ownership terms if furnished",
                "Clear DEWA and utilities responsibility during STR operation",
                "Clear early termination clause with acceptable conditions",
                "Clear renewal terms and rent review conditions",
                "STR and sub-leasing use stated explicitly in the contract or addendum",
                "Clear process for inspection, handover, and deposit return",
                "No ambiguity around commercial or business use of the unit",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "11px 0", borderBottom: `1px solid ${colors.border}` }}>
                  <div style={{ marginTop: "1px", flexShrink: 0 }}><IconCheck /></div>
                  <span style={{ fontSize: "14px", color: colors.textMain, lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
              <div style={{ marginTop: "22px", padding: "16px 18px", background: "#F0F8F4", borderRadius: "10px", border: "1px solid rgba(27,94,74,0.15)", borderLeft: `3px solid ${colors.primary}` }}>
                <p style={{ fontSize: "13.5px", color: colors.textMain, lineHeight: 1.65, margin: 0 }}>
                  <strong style={{ color: colors.primary }}>Non-negotiable principle:</strong> If the landlord is unclear, hesitant, or unwilling to confirm any of these points in writing, do not proceed. Verbal approvals are not enforceable and frequently lead to disputes, eviction, or permit rejection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 10. SETUP ROADMAP ─── */}
      <section id="roadmap" style={{ padding: isMobile ? "52px 20px" : "80px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="SETUP ROADMAP" title="Start From Zero: 10-Step Sub-Leasing Roadmap" subtitle="Follow this sequence before committing capital to any unit." />
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <RoadmapStep number={1} title="Pick Target Areas" description="Shortlist areas with strong STR demand and rental entry costs that leave sufficient margin. Cross-check LTR asking rents against expected STR revenue using available data." />
            <RoadmapStep number={2} title="Source Units" description="Look for units with good layout, natural light, access, view, amenities, and rent levels that support a viable business case. Eliminate units where rent leaves no room for profit." />
            <RoadmapStep number={3} title="Run Break-Even Check" description="Before contacting the landlord, calculate whether the unit covers rent, utilities, cleaning, platform fees, and a maintenance reserve at 60% occupancy in low season." />
            <RoadmapStep number={4} title="Negotiate Landlord Approval" description="Approach the landlord with a clear, professional proposal. Secure written permission before spending any money. This is a hard gate — do not skip or defer it." />
            <RoadmapStep number={5} title="Confirm Building Rules" description="Speak with building management to confirm guest access procedures, parking availability, security cooperation, and whether any developer-level NOC is required." />
            <RoadmapStep number={6} title="Budget Setup Cost" description="Calculate furniture, appliances, linen, photography, access system, permits, agency fee, deposit, and a contingency buffer. Include payback period in the unit assessment." />
            <RoadmapStep number={7} title="Apply For Permit" description="Prepare all required DET documents and obtain the holiday home permit before creating any listing. Operating before permit approval is a compliance and eviction risk." />
            <RoadmapStep number={8} title="Furnish & Photograph" description="Design the unit for guest conversion, durability, and strong photography. Use a professional photographer. Listings with amateur photos underperform the market significantly." />
            <RoadmapStep number={9} title="Launch Listings" description="Create Airbnb, Booking.com, and other listings with optimised titles, accurate pricing, clear house rules, and complete descriptions. Set minimum stay rules before opening calendar." />
            <RoadmapStep number={10} title="Monitor Weekly Performance" description="Track occupancy, ADR, guest reviews, cleaning quality, maintenance issues, cash flow, and pricing effectiveness every week. Do not operate on autopilot." isLast />
          </div>
        </div>
      </section>

      {/* ─── 11. OPERATING REQUIREMENTS ─── */}
      <section style={{ padding: isMobile ? "52px 20px" : "80px 40px", background: colors.bgSection, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="OPERATIONS" title="What You Need To Operate Properly" subtitle="Running an STR unit as a sub-leasing business requires the same operational discipline as any professional property manager." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "22px" }}>
            {[
              { icon: <IconGuest size={26} />, title: "Guest Communication", text: "Fast inquiry replies, pre-arrival instructions, smooth check-in, mid-stay check-ins, issue handling, check-out reminders, and review request timing.", accentColor: colors.primary },
              { icon: <IconClean size={26} />, title: "Cleaning & Linen", text: "Reliable cleaning team with photo proof, linen rotation inventory, consumables restocking schedule, and a quality checklist after every turnover.", accentColor: colors.secondary },
              { icon: <IconTool size={26} />, title: "Maintenance Support", text: "Preferred handyman with fast response SLA, AC servicing schedule, appliance support contacts, emergency escalation process, and landlord damage reporting.", accentColor: colors.primary },
              { icon: <IconPricing size={26} />, title: "Pricing Management", text: "Weekly rate reviews, seasonal adjustments, event-driven premium pricing, competitor checks, and minimum-stay rules updated before demand windows open.", accentColor: colors.secondary },
              { icon: <IconLock size={26} />, title: "Access Management", text: "Smart lock with unique guest codes, building access card handover process, parking instructions, lift and lobby access briefing, and a backup key plan.", accentColor: colors.primary },
              { icon: <IconCash size={26} />, title: "Cash-Flow Tracking", text: "Track rent, utilities, cleaning, platform commissions, repairs, and consumables monthly. Net income per unit per month is the only metric that matters.", accentColor: colors.secondary },
            ].map((card) => (
              <InfoCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 12. COMMON MISTAKES ─── */}
      <section style={{ padding: isMobile ? "52px 20px" : "80px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="AVOID THESE" title="Mistakes That Make Sub-Leasing Risky" subtitle="Most sub-leasing failures come from the same set of avoidable decisions. Knowing them before you start is a structural advantage." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", maxWidth: "980px", margin: "0 auto" }}>
            {[
              { title: "Signing without written landlord approval", detail: "Verbal agreements are not enforceable. A landlord who changes their mind after you have furnished the unit creates immediate and unrecoverable financial loss." },
              { title: "Choosing a unit only because rent is cheap", detail: "Low rent means nothing if the building has no STR demand, poor guest appeal, or impossible guest access. Revenue potential drives the selection, not rent alone." },
              { title: "Ignoring low-season occupancy", detail: "Projecting from peak performance only is the single most common sub-leasing mistake. Build your entire case around the worst three months of the year." },
              { title: "Underestimating furnishing and setup cost", detail: "Operators consistently spend 20–40% more than initial estimates when permits, photography, access systems, and contingencies are included properly." },
              { title: "No cash buffer before operating", detail: "The first 30–60 days after launch are typically below full occupancy. Without a cash buffer covering rent and costs, operators face payment pressure before revenue stabilises." },
              { title: "Weak or missing check-in process", detail: "Guest access issues generate immediate negative reviews. Every step of the check-in must be tested from a first-time guest perspective before the listing goes live." },
              { title: "Poor cleaning quality control", detail: "Allowing cleaners to self-report without photo verification leads to recurring quality failures, which compound into rating drops and ranking losses." },
              { title: "No written exit clause in the lease", detail: "Operating a unit that underperforms without an exit option traps you in a fixed cost with no STR revenue to cover it. Always negotiate exit terms before signing." },
              { title: "High fixed rent with weak STR demand", detail: "If the rent-to-revenue gap is too narrow at market occupancy, there is no operational improvement that fixes the underlying unit economics. Avoid these units entirely." },
              { title: "ADR projections based only on peak season", detail: "Annual revenue models built on peak ADR without seasonal discounting always overstate annual income. Use full-year blended ADR and realistic low-season occupancy." },
            ].map((m) => (
              <MistakeCard key={m.title} title={m.title} detail={m.detail} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 13. READINESS SCORE ─── */}
      <section id="readiness" style={{ padding: isMobile ? "52px 20px" : "80px 40px", background: colors.bgSection, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="SELF-ASSESSMENT" title="Are You Ready To Start STR Sub-Leasing?" subtitle="Check every item that honestly applies to your current situation." />
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            <div style={{ background: colors.bgMain, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: isMobile ? "24px 20px" : "40px", boxShadow: colors.shadowSm, marginBottom: "24px" }}>
              {READINESS_ITEMS.map((item, i) => (
                <div key={i} onClick={() => toggle(i)} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: i < READINESS_ITEMS.length - 1 ? `1px solid ${colors.border}` : "none", cursor: "pointer", userSelect: "none" }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0, border: `2px solid ${checked.has(i) ? colors.secondary : colors.border}`, background: checked.has(i) ? colors.secondary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s ease" }}>
                    {checked.has(i) && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    )}
                  </div>
                  <span style={{ fontSize: "14px", color: checked.has(i) ? colors.textMain : colors.textMuted, lineHeight: 1.5, fontWeight: checked.has(i) ? 600 : 400 }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ background: result.bg, borderRadius: "14px", border: `1.5px solid ${result.border}`, padding: "24px 28px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontFamily: serifHeading, fontWeight: 700, color: result.color, marginBottom: "8px" }}>{count} / 10</div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: result.color, marginBottom: "16px" }}>{result.label}</div>
              {count >= 8 ? (
                <a href="#cta" style={{ display: "inline-block", padding: "12px 26px", background: colors.secondary, color: "#fff", borderRadius: "9px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>Build My Sub-Leasing Plan</a>
              ) : count >= 4 ? (
                <a href="#cta" style={{ display: "inline-block", padding: "12px 26px", background: colors.primary, color: "#fff", borderRadius: "9px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>Get GroundWorks Support</a>
              ) : (
                <a href="#cta" style={{ display: "inline-block", padding: "12px 26px", background: colors.textMuted, color: "#fff", borderRadius: "9px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>Learn More First</a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 14. FINAL CTA ─── */}
      <section id="cta" style={{ padding: isMobile ? "52px 20px" : "80px 40px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.14em", marginBottom: "18px" }}>WANT PROFESSIONAL GUIDANCE?</div>
          <h2 style={{ fontSize: isMobile ? "28px" : "40px", fontFamily: serifHeading, fontWeight: 700, marginBottom: "20px", background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Want GroundWorks To Help You Find Lower-Risk Units?
          </h2>
          <p style={{ fontSize: "17px", color: colors.textMuted, lineHeight: 1.65, maxWidth: "640px", margin: "0 auto 36px" }}>
            Our upcoming Sub-Leasing Estimator will identify areas, buildings, and unit types with stronger STR demand, better rent-to-revenue margins, and lower downside risk before you commit.
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#risk" style={{ padding: "16px 32px", background: colors.secondary, color: "#fff", borderRadius: "10px", fontSize: "15px", fontWeight: 600, textDecoration: "none", boxShadow: "0 8px 24px rgba(184,138,68,0.22)" }}>
              Check Minimum-Risk Units
            </a>
            <a onClick={() => router.push("/estimator")} style={{ cursor: "pointer", padding: "16px 32px", background: "transparent", color: colors.primary, border: `2px solid ${colors.primary}`, borderRadius: "10px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}>
              Compare STR vs LTR First
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: colors.bgSection, borderTop: `1px solid ${colors.border}`, padding: "40px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <GroundWorksLogo size={32} />
            <span style={{ fontSize: "14px", color: colors.textMuted }}>GroundWorks — Dubai Rental Intelligence</span>
          </div>
          <div style={{ fontSize: "13px", color: colors.textMuted }}>© {new Date().getFullYear()} GroundWorks. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
