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
const stroke = (color: string) => ({
  stroke: color, strokeWidth: 1.4, fill: "none",
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
});

// ─── Icons ─────────────────────────────────────────────────────────────────
const IconBuilding = ({ color = colors.primary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M6 28V11L16 5L26 11V28" {...stroke(color)} /><rect x="12" y="19" width="8" height="9" rx="1" {...stroke(color)} /><rect x="9" y="14" width="4" height="4" rx="0.5" {...stroke(color)} /><rect x="19" y="14" width="4" height="4" rx="0.5" {...stroke(color)} /></svg>
);
const IconDoc = ({ color = colors.primary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M9 5H19L25 11V27H9V5Z" {...stroke(color)} /><path d="M19 5V11H25" {...stroke(color)} /><path d="M13 16H21" {...stroke(color)} /><path d="M13 20H18" {...stroke(color)} /></svg>
);
const IconPermit = ({ color = colors.primary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><rect x="6" y="5" width="20" height="24" rx="2" {...stroke(color)} /><path d="M11 12H21" {...stroke(color)} /><path d="M11 16H21" {...stroke(color)} /><path d="M11 20H16" {...stroke(color)} /><circle cx="22" cy="22" r="5" {...stroke(color)} fill="rgba(27,94,74,0.08)" /><path d="M20 22L21.5 23.5L24 21" {...stroke(color)} /></svg>
);
const IconFurnish = ({ color = colors.primary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><rect x="5" y="14" width="22" height="8" rx="2" {...stroke(color)} /><path d="M8 14V11C8 9.9 8.9 9 10 9H22C23.1 9 24 9.9 24 11V14" {...stroke(color)} /><path d="M8 22V25" {...stroke(color)} /><path d="M24 22V25" {...stroke(color)} /></svg>
);
const IconPricing = ({ color = colors.secondary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M16 6V26" {...stroke(color)} /><path d="M20.5 10C20.5 7.8 18.5 7 16 7C13.5 7 11.5 8.2 11.5 10C11.5 11.8 13.5 13 16 13C18.5 13 20.5 14.2 20.5 16C20.5 18.2 18.5 19 16 19C13.5 19 11.5 18 11.5 16" {...stroke(color)} /></svg>
);
const IconGuest = ({ color = colors.primary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M6 8C6 6.9 6.9 6 8 6H24C25.1 6 26 6.9 26 8V19C26 20.1 25.1 21 24 21H12L7 26V8Z" {...stroke(color)} /><path d="M11 12H21" {...stroke(color)} /><path d="M11 16H17" {...stroke(color)} /></svg>
);
const IconLaunch = ({ color = colors.primary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M16 27C16 27 7 18 7 12C7 7 11 4 16 4C21 4 25 7 25 12C25 18 16 27 16 27Z" {...stroke(color)} /><circle cx="16" cy="12" r="3" {...stroke(color)} /></svg>
);
const IconChart = ({ color = colors.secondary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M6 24L12 17L17 21L26 10" {...stroke(color)} /><path d="M21 10H26V15" {...stroke(color)} /><path d="M6 26H26" {...stroke(color)} /></svg>
);
const IconCleaning = ({ color = colors.primary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M18 6L22 10" {...stroke(color)} /><path d="M20 8L11 17L8 24L15 21L24 12L20 8Z" {...stroke(color)} /><path d="M11 17L15 21" {...stroke(color)} /></svg>
);
const IconMaintenance = ({ color = colors.secondary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M20 6C17.2 6 15 8.2 15 11C15 11.7 15.1 12.4 15.4 13L7 21L9 26L14 24L22 15.6C22.6 15.9 23.3 16 24 16C26.8 16 29 13.8 29 11C29 10.2 28.8 9.4 28.5 8.7L25 12.2L22 9.2L25.3 5.5C24.6 5.2 23.8 6 23 6H20Z" {...stroke(color)} /></svg>
);
const IconLock = ({ color = colors.primary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><rect x="8" y="14" width="16" height="12" rx="2" {...stroke(color)} /><path d="M11 14V11C11 8.2 13.2 6 16 6C18.8 6 21 8.2 21 11V14" {...stroke(color)} /><circle cx="16" cy="20" r="1.6" stroke={color} strokeWidth="1.4" fill={color} /></svg>
);
const IconStar = ({ color = colors.secondary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M16 5L19.5 12L27 13L21.5 18.4L22.9 26L16 22.3L9.1 26L10.5 18.4L5 13L12.5 12L16 5Z" {...stroke(color)} /></svg>
);
const IconPMS = ({ color = colors.primary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><rect x="6" y="6" width="8.5" height="8.5" rx="1.5" {...stroke(color)} /><rect x="17.5" y="6" width="8.5" height="8.5" rx="1.5" {...stroke(color)} /><rect x="6" y="17.5" width="8.5" height="8.5" rx="1.5" {...stroke(color)} /><rect x="17.5" y="17.5" width="8.5" height="8.5" rx="1.5" {...stroke(color)} /></svg>
);
const IconChannel = ({ color = colors.secondary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><circle cx="8" cy="16" r="3" {...stroke(color)} /><circle cx="24" cy="8" r="3" {...stroke(color)} /><circle cx="24" cy="24" r="3" {...stroke(color)} /><path d="M11 15L21 9" {...stroke(color)} /><path d="M11 17L21 23" {...stroke(color)} /></svg>
);
const IconDynamic = ({ color = colors.primary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M5 22L10 15L15 18L21 10L27 14" {...stroke(color)} /><path d="M22 10H27V15" {...stroke(color)} /></svg>
);
const IconAuto = ({ color = colors.secondary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M16 6C10.5 6 6 10.5 6 16C6 21.5 10.5 26 16 26" {...stroke(color)} /><path d="M22 18C22 21.3 19.3 24 16 24" {...stroke(color)} /><path d="M20 6L24 10L20 14" {...stroke(color)} /><path d="M24 10H16C13.2 10 11 12.2 11 15" {...stroke(color)} /></svg>
);
const IconAccounting = ({ color = colors.primary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><rect x="6" y="5" width="20" height="24" rx="2" {...stroke(color)} /><path d="M10 11H22" {...stroke(color)} /><path d="M10 15H22" {...stroke(color)} /><path d="M10 19H16" {...stroke(color)} /><path d="M19 19L22 22" {...stroke(color)} /><circle cx="20.5" cy="20.5" r="3" {...stroke(color)} /></svg>
);
const IconWarning = ({ color = "#A37020", size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 3L22 20H2L12 3Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /><path d="M12 10V14" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><circle cx="12" cy="17.5" r="0.8" fill={color} /></svg>
);
const IconCheck = ({ color = colors.primary, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8.5" stroke={color} strokeWidth="1.2" opacity="0.3" /><path d="M6.5 10L9 12.5L13.5 7.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

// ─── Section Heading ────────────────────────────────────────────────────────
function SectionHeading({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "52px", textAlign: "center" }}>
      <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "14px" }}>{label}</div>
      <h2 style={{
        fontSize: "38px", fontFamily: serifHeading, fontWeight: 700, marginBottom: "14px",
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
      }}>{title}</h2>
      {subtitle && <p style={{ fontSize: "16px", color: colors.textMuted, lineHeight: 1.65, maxWidth: "600px", margin: "0 auto" }}>{subtitle}</p>}
    </div>
  );
}

// ─── InfoCard ───────────────────────────────────────────────────────────────
function InfoCard({ icon, title, text, accentColor = colors.primary }: { icon: React.ReactNode; title: string; text: string; accentColor?: string }) {
  return (
    <div style={{
      background: colors.bgSection, borderRadius: "16px", border: `1px solid ${colors.border}`,
      borderTop: `3px solid ${accentColor}`, padding: "32px", boxShadow: colors.shadowSm,
    }}>
      <div style={{ marginBottom: "18px" }}>{icon}</div>
      <h3 style={{ fontSize: "17px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "10px" }}>{title}</h3>
      <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.65 }}>{text}</p>
    </div>
  );
}

// ─── Roadmap Step ──────────────────────────────────────────────────────────
function RoadmapStep({ number, title, description, isLast }: { number: number; title: string; description: string; isLast?: boolean }) {
  return (
    <div style={{ display: "flex", gap: "24px", marginBottom: isLast ? 0 : "0px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "50%", background: colors.primary,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "15px", fontWeight: 700, color: "#fff", fontFamily: serifHeading, flexShrink: 0,
        }}>{number}</div>
        {!isLast && <div style={{ width: "1.5px", flex: 1, background: colors.border, minHeight: "40px", marginTop: "8px" }} />}
      </div>
      <div style={{ paddingBottom: isLast ? 0 : "36px", flex: 1 }}>
        <h3 style={{ fontSize: "17px", fontWeight: 700, color: colors.textMain, marginBottom: "8px", marginTop: "10px" }}>{title}</h3>
        <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.65 }}>{description}</p>
      </div>
    </div>
  );
}

// ─── Tool Row ───────────────────────────────────────────────────────────────
function ToolRow({ icon, category, purpose }: { icon: React.ReactNode; category: string; purpose: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "20px", padding: "18px 24px",
      borderBottom: `1px solid ${colors.border}`,
    }}>
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "15px", fontWeight: 700, color: colors.textMain, marginBottom: "2px" }}>{category}</div>
        <div style={{ fontSize: "13px", color: colors.textMuted }}>{purpose}</div>
      </div>
    </div>
  );
}

// ─── Finance Item ──────────────────────────────────────────────────────────
function FinanceItem({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0" }}>
      <IconCheck />
      <span style={{ fontSize: "14px", color: colors.textMain }}>{label}</span>
    </div>
  );
}

// ─── Day Row ────────────────────────────────────────────────────────────────
function DayRow({ day, task }: { day: string; task: string }) {
  return (
    <div style={{ display: "flex", gap: "20px", padding: "14px 0", borderBottom: `1px solid ${colors.border}` }}>
      <div style={{ width: "90px", flexShrink: 0, fontSize: "13px", fontWeight: 700, color: colors.secondary, textTransform: "uppercase", letterSpacing: "0.05em", paddingTop: "1px" }}>{day}</div>
      <div style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.55 }}>{task}</div>
    </div>
  );
}

// ─── Mistake Card ──────────────────────────────────────────────────────────
function MistakeCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div style={{
      background: "#FFFBF5", borderRadius: "12px", border: "1px solid #E8D9BC",
      borderLeft: "3px solid #B88A44", padding: "20px 22px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "6px" }}>
        <IconWarning size={17} />
        <span style={{ fontSize: "14px", fontWeight: 700, color: colors.textMain }}>{title}</span>
      </div>
      <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.55, marginLeft: "27px" }}>{detail}</p>
    </div>
  );
}

// ─── Readiness Checklist ───────────────────────────────────────────────────
const READINESS_ITEMS = [
  "I can respond to guest messages quickly",
  "I have a reliable cleaning team",
  "I have maintenance support",
  "I can manage pricing weekly",
  "I can handle guest issues calmly",
  "I can monitor reviews and quality",
  "I understand permit/compliance basics",
  "I can track revenue and expenses monthly",
];

function getReadinessLabel(count: number) {
  if (count <= 3) return { label: "Better to use an operator", color: "#A14B3D", bg: "#FDF3F2", border: "#E8C3BF" };
  if (count <= 6) return { label: "Self-management possible with support", color: "#8A7020", bg: "#FFFBF0", border: "#E8D89A" };
  return { label: "Strong candidate for self-management", color: colors.primary, bg: "#F0F8F4", border: "#B3D4C8" };
}

export default function OwnersPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) => setChecked((prev) => {
    const next = new Set(prev);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });

  const count = checked.size;
  const result = getReadinessLabel(count);

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh" }}>

      {/* ─── HEADER ─── */}
      <header style={{ background: colors.bgSection, borderBottom: `1px solid ${colors.border}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{
          maxWidth: "1400px", margin: "0 auto", padding: isMobile ? "14px 20px" : "16px 40px",
          display: "flex", alignItems: "center", gap: isMobile ? "0" : "60px", justifyContent: isMobile ? "space-between" : "flex-start",
        }}>
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
              <a style={{ color: colors.primary, fontSize: "15px", fontWeight: 600 }}>Owner Guide</a>
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
            <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "18px" }}>SELF-MANAGE YOUR PROPERTY</div>
            <h1 style={{
              fontSize: isMobile ? "34px" : "52px", fontFamily: serifHeading, fontWeight: 700, lineHeight: 1.15, marginBottom: "22px",
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Manage Up To 8 Units Like a Professional Operator
            </h1>
            <p style={{ fontSize: "17px", color: colors.textMuted, lineHeight: 1.65, marginBottom: "36px", maxWidth: "560px" }}>
              A practical roadmap for Dubai property owners who want to operate short-term rentals independently, reduce management fees, and build professional systems from day one.
            </p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <a href="#roadmap" style={{ padding: "14px 28px", background: colors.primary, color: "#fff", borderRadius: "10px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}>
                Start With The Roadmap
              </a>
              <a href="#readiness" style={{ padding: "14px 28px", background: "transparent", color: colors.primary, border: `2px solid ${colors.primary}`, borderRadius: "10px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}>
                Check If This Fits You
              </a>
            </div>
          </div>
          {/* Dashboard card */}
          <div style={{ flexShrink: 0, width: isMobile ? "100%" : "320px" }}>
            <div style={{ background: colors.bgMain, borderRadius: "20px", border: `1px solid ${colors.border}`, padding: "28px", boxShadow: "0 8px 32px rgba(27,94,74,0.08)" }}>
              <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "20px" }}>OWNER-CONTROLLED OPERATIONS</div>
              {[
                { label: "Units Under Management", value: "1 – 8 Units" },
                { label: "Guest Communication", value: "Owner Direct" },
                { label: "Pricing Control", value: "Full" },
                { label: "Compliance", value: "DET Permit" },
                { label: "Cleaning & Turnover", value: "Owner Managed" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${colors.border}` }}>
                  <span style={{ fontSize: "13px", color: colors.textMuted }}>{row.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: colors.primary }}>{row.value}</span>
                </div>
              ))}
              <div style={{ marginTop: "20px", padding: "14px", background: "rgba(27,94,74,0.05)", borderRadius: "10px", border: `1px solid rgba(27,94,74,0.12)` }}>
                <div style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "4px" }}>Typical fee saving vs operator</div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: colors.primary, fontFamily: serifHeading }}>15 – 22%</div>
                <div style={{ fontSize: "11px", color: colors.textMuted }}>of gross revenue retained</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. WHO THIS IS FOR ─── */}
      <section style={{ padding: isMobile ? "52px 20px" : "80px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="BEFORE YOU START" title="Is Self-Management Right For You?" subtitle="Self-management can work very well for small portfolios, but only if the owner treats it like a system, not a side task." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
            <InfoCard
              icon={<IconCheck color={colors.primary} size={28} />}
              title="Best For"
              accentColor={colors.primary}
              text="Owners with 1–8 units who can dedicate time to guest communication, coordination, and quality control. Works best when the owner is hands-on and treats the property as a business."
            />
            <InfoCard
              icon={<IconWarning color="#A14B3D" size={28} />}
              title="Not Ideal For"
              accentColor="#A14B3D"
              text="Owners who want completely passive income, travel often, or cannot respond quickly to guest issues. Without availability and systems, self-management leads to poor reviews and lost revenue."
            />
            <InfoCard
              icon={<IconBuilding color={colors.secondary} size={28} />}
              title="GroundWorks View"
              accentColor={colors.secondary}
              text="Self-management can work very well for small portfolios, but only if the owner builds the right systems, uses the right tools, and approaches operations with professional discipline."
            />
          </div>
        </div>
      </section>

      {/* ─── 3. ROADMAP ─── */}
      <section id="roadmap" style={{ padding: isMobile ? "52px 20px" : "80px 40px", background: colors.bgSection, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="SETUP ROADMAP" title="Start From Zero: Your 8-Step Setup" subtitle="Follow this sequence to launch your short-term rental correctly the first time." />
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <RoadmapStep number={1} title="Confirm Building Eligibility" description="Check whether the building allows short-term rentals. Confirm any developer or community restrictions and review access rules for guests. Some buildings in Dubai explicitly prohibit STR." />
            <RoadmapStep number={2} title="Prepare Ownership Documents" description="Gather your title deed, Emirates ID or passport, DEWA bill, and any required authorisation documents. These are mandatory for the permit application." />
            <RoadmapStep number={3} title="Apply For Holiday Home Permit" description="Register the unit through the official Dubai holiday homes system via DET and obtain the required permit before listing on any platform. Operating without a permit is a compliance risk." />
            <RoadmapStep number={4} title="Furnish & Equip The Property" description="Prepare furniture, appliances, linen, kitchenware, safety items, guest amenities, and maintenance essentials. The property must meet DET's minimum furnishing and safety standards." />
            <RoadmapStep number={5} title="Build Your Pricing Strategy" description="Set base rates, seasonal rates, weekend premiums, event pricing, and minimum stay rules before going live. Starting without a pricing strategy means leaving significant revenue behind." />
            <RoadmapStep number={6} title="Set Up Guest Operations" description="Create check-in instructions, house rules, guest messaging templates, emergency contacts, and an issue escalation process. These prevent 80% of guest complaints before they occur." />
            <RoadmapStep number={7} title="Launch Listings" description="Create listings on Airbnb, Booking.com, and other relevant platforms with professional photos, optimised titles, accurate pricing, and complete descriptions. Photography is not optional." />
            <RoadmapStep number={8} title="Track Performance Weekly" description="Review occupancy, ADR, revenue, guest feedback, cleaning quality, maintenance issues, and pricing performance every week. You cannot improve what you do not measure." isLast />
          </div>
        </div>
      </section>

      {/* ─── 4. LEGAL & PERMIT ─── */}
      <section style={{ padding: isMobile ? "52px 20px" : "80px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="COMPLIANCE" title="Dubai Holiday Home Requirements" subtitle="What you need to have in place before listing your property as a short-term rental." />
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ background: colors.bgSection, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: isMobile ? "28px 20px" : "40px 44px", boxShadow: colors.shadowSm }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "32px", padding: "16px 18px", background: "#F0F8F4", borderRadius: "10px", border: `1px solid rgba(27,94,74,0.15)` }}>
                <IconPermit color={colors.primary} size={24} />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: colors.primary, marginBottom: "4px" }}>PERMIT REQUIRED BEFORE LISTING</div>
                  <div style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.55 }}>Each unit must be individually registered and permitted with DET before appearing on any booking platform.</div>
                </div>
              </div>
              {[
                "Register the unit with DET before listing on any platform",
                "Obtain a holiday home permit for each unit — not per owner",
                "Ensure the owner name matches the title deed where applicable",
                "Prepare title deed or approved ownership document",
                "Prepare Emirates ID or passport copy of the owner",
                "Prepare a recent DEWA bill for the property",
                "Prepare landlord/company documents if ownership is under a company",
                "Check if developer or community NOC is required",
                "Ensure the property meets guest-ready safety and furnishing standards",
                "Keep permit and listing details current and updated",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 0", borderBottom: `1px solid ${colors.border}` }}>
                  <div style={{ marginTop: "1px", flexShrink: 0 }}><IconCheck /></div>
                  <span style={{ fontSize: "14px", color: colors.textMain, lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
              <div style={{ marginTop: "24px", padding: "14px 16px", background: "#FFFBF5", borderRadius: "8px", border: "1px solid #E8D9BC" }}>
                <p style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.6, margin: 0 }}>
                  <strong style={{ color: "#8A6020" }}>Note:</strong> Requirements can change. Verify current permit requirements directly with DET or an approved holiday-home specialist before listing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. OPERATIONAL SETUP ─── */}
      <section style={{ padding: isMobile ? "52px 20px" : "80px 40px", background: colors.bgSection, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="OPERATIONS" title="Your Owner-Operator Setup" subtitle="The six operational pillars you must build before you can run professionally." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {[
              { icon: <IconGuest color={colors.primary} size={28} />, title: "Guest Communication", text: "Templates for inquiry response, pre-arrival instructions, check-in, check-out, review requests, and issue handling. Every message a guest receives should be prepared in advance.", accentColor: colors.primary },
              { icon: <IconCleaning color={colors.secondary} size={28} />, title: "Cleaning & Linen", text: "Cleaning schedule, linen stock levels, quality inspection checklist, inventory counts, and a same-day turnover process for back-to-back bookings.", accentColor: colors.secondary },
              { icon: <IconMaintenance color={colors.primary} size={28} />, title: "Maintenance", text: "Preferred handyman list with response SLAs, emergency response plan, appliance service schedules, AC servicing, and a damage reporting process for guest incidents.", accentColor: colors.primary },
              { icon: <IconPricing color={colors.secondary} size={28} />, title: "Pricing & Revenue", text: "Weekly rate reviews, seasonality adjustments, event pricing windows, competitor checks, and minimum stay rules. Pricing left static loses occupancy and revenue.", accentColor: colors.secondary },
              { icon: <IconLock color={colors.primary} size={28} />, title: "Access & Check-In", text: "Smart lock or key-safe setup, building access card handover process, parking instructions, elevator codes, and guest ID collection as required by DET.", accentColor: colors.primary },
              { icon: <IconStar color={colors.secondary} size={28} />, title: "Review Management", text: "Post-stay follow-up timing, complaint handling workflow, quality improvement from negative feedback, and a process for responding to all reviews professionally.", accentColor: colors.secondary },
            ].map((card) => (
              <InfoCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. TECHNOLOGY STACK ─── */}
      <section style={{ padding: isMobile ? "52px 20px" : "80px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="TOOLS" title="Minimum Tools You Need" subtitle="Six categories of software every self-managing owner should have in place. Specific products will vary — the categories are non-negotiable." />
          <div style={{ maxWidth: "800px", margin: "0 auto", background: colors.bgSection, borderRadius: "18px", border: `1px solid ${colors.border}`, overflow: "hidden", boxShadow: colors.shadowSm }}>
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${colors.border}`, background: "rgba(27,94,74,0.03)", display: "flex", gap: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: colors.textMuted, letterSpacing: "0.08em", width: "200px" }}>CATEGORY</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: colors.textMuted, letterSpacing: "0.08em" }}>PURPOSE</div>
            </div>
            <ToolRow icon={<IconPMS color={colors.primary} size={22} />} category="Property Management System" purpose="Centralise bookings, calendars, guest messages, and housekeeping tasks in one place." />
            <ToolRow icon={<IconDynamic color={colors.primary} size={22} />} category="Dynamic Pricing Tool" purpose="Automatically adjust nightly rates based on demand, seasonality, local events, and competitor data." />
            <ToolRow icon={<IconChannel color={colors.secondary} size={22} />} category="Channel Manager" purpose="Sync availability and rates across Airbnb, Booking.com, and direct booking channels without double-booking risk." />
            <ToolRow icon={<IconAuto color={colors.secondary} size={22} />} category="Guest Messaging Tool" purpose="Automate pre-arrival, check-in, check-out, and review request messages while keeping owner control." />
            <ToolRow icon={<IconLock color={colors.primary} size={22} />} category="Smart Access" purpose="Enable secure self-check-in, reduce key handover friction, and generate unique codes per stay." />
            <ToolRow icon={<IconAccounting color={colors.primary} size={22} />} category="Accounting Tracker" purpose="Track gross revenue, cleaning costs, platform fees, utilities, maintenance, and monthly net income per unit." />
          </div>
          <p style={{ textAlign: "center", fontSize: "13px", color: colors.textMuted, marginTop: "20px" }}>
            Tool selection depends on your portfolio size and budget. GroundWorks can advise on the right stack for your specific setup.
          </p>
        </div>
      </section>

      {/* ─── 7. FINANCIAL MODEL ─── */}
      <section style={{ padding: isMobile ? "52px 20px" : "80px 40px", background: colors.bgSection, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="FINANCIALS" title="What Owners Must Track Monthly" subtitle="Self-management only works if the owner tracks net income, not just gross revenue." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", maxWidth: "960px", margin: "0 auto" }}>
            <div style={{ background: colors.bgMain, borderRadius: "16px", border: `1px solid ${colors.border}`, padding: "28px 28px 24px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: colors.primary, letterSpacing: "0.12em", marginBottom: "18px" }}>REVENUE</div>
              <FinanceItem label="Gross booking revenue" />
              <FinanceItem label="Cleaning fees collected" />
              <FinanceItem label="Extra guest fees" />
              <FinanceItem label="Direct booking revenue" />
            </div>
            <div style={{ background: colors.bgMain, borderRadius: "16px", border: `1px solid ${colors.border}`, padding: "28px 28px 24px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#A14B3D", letterSpacing: "0.12em", marginBottom: "18px" }}>COSTS</div>
              <FinanceItem label="Platform commission" />
              <FinanceItem label="Cleaning cost" />
              <FinanceItem label="Laundry and linen" />
              <FinanceItem label="Utilities (DEWA + chiller)" />
              <FinanceItem label="Maintenance" />
              <FinanceItem label="Consumables and supplies" />
              <FinanceItem label="Permit and compliance" />
              <FinanceItem label="Software and tools" />
              <FinanceItem label="Payment processing fees" />
            </div>
            <div style={{ background: colors.bgMain, borderRadius: "16px", border: `1px solid ${colors.border}`, padding: "28px 28px 24px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: colors.secondary, letterSpacing: "0.12em", marginBottom: "18px" }}>PERFORMANCE</div>
              <FinanceItem label="Occupancy rate" />
              <FinanceItem label="Average Daily Rate (ADR)" />
              <FinanceItem label="RevPAR" />
              <FinanceItem label="Net income to owner" />
              <FinanceItem label="Average review score" />
              <FinanceItem label="Maintenance cost per month" />
            </div>
          </div>
          <div style={{ maxWidth: "700px", margin: "28px auto 0", padding: "18px 22px", background: "#F0F8F4", borderRadius: "10px", border: "1px solid rgba(27,94,74,0.15)", textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: colors.textMain, lineHeight: 1.6, margin: 0 }}>
              <strong style={{ color: colors.primary }}>Owners who track gross revenue only</strong> consistently underestimate costs and overestimate profitability. Net income per unit per month is the only number that matters.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 8. WEEKLY WORKFLOW ─── */}
      <section style={{ padding: isMobile ? "52px 20px" : "80px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="OPERATIONS" title="Weekly Owner Workflow" subtitle="A self-managing owner should spend 3–5 focused hours per unit per week. These are the tasks that protect your revenue and reputation." />
          <div style={{ maxWidth: "680px", margin: "0 auto", background: colors.bgSection, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: isMobile ? "24px 20px" : "36px 40px", boxShadow: colors.shadowSm }}>
            <DayRow day="Monday" task="Review last week's revenue, occupancy rate, guest reviews, and any complaints. Identify what needs addressing this week." />
            <DayRow day="Tuesday" task="Update pricing for the next 30–90 days. Check for events, school holidays, and low-demand gaps that need adjustment." />
            <DayRow day="Wednesday" task="Audit cleaning quality from recent turnover. Check linen stock levels and order consumables as needed." />
            <DayRow day="Thursday" task="Review upcoming arrivals. Confirm check-in instructions, access codes, and that the property is in the correct state." />
            <DayRow day="Friday" task="Prepare weekend guest communication. Confirm emergency contacts are available and escalation process is active." />
            <DayRow day="Sunday" task="Review competitor listings and pricing for your area. Adjust any upcoming low-demand dates before the week starts." />
          </div>
        </div>
      </section>

      {/* ─── 9. COMMON MISTAKES ─── */}
      <section style={{ padding: isMobile ? "52px 20px" : "80px 40px", background: colors.bgSection, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="AVOID THESE" title="Mistakes That Hurt Owner Returns" subtitle="Most self-management failures come from the same six patterns. Knowing them in advance is your first advantage." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px", maxWidth: "960px", margin: "0 auto" }}>
            <MistakeCard title="Pricing too high in low season" detail="Owners often anchor to peak ADR and refuse to drop in May–September. Occupancy collapses and the property earns less than a competitive low-season rate would." />
            <MistakeCard title="Not responding fast enough to guests" detail="On Airbnb, response time directly affects search ranking. Delays of more than an hour on booking inquiries lose both the guest and the ranking signal." />
            <MistakeCard title="Weak photography and listing copy" detail="Listings with amateur photos perform significantly below market ADR. Professional photography is one of the highest-return investments in STR." />
            <MistakeCard title="No cleaning quality control" detail="Allowing cleaners to self-inspect without owner oversight leads to recurring guest complaints, which compound into rating drops over time." />
            <MistakeCard title="Poor check-in instructions" detail="Guests who struggle to access the property generate immediate negative reviews. Instructions must be tested from a new guest's perspective, not written from memory." />
            <MistakeCard title="Tracking gross income instead of net" detail="An 80% occupied unit with high cleaning costs, platform fees, and utility overruns can net less than a 65% occupied unit run efficiently. Always model net first." />
          </div>
        </div>
      </section>

      {/* ─── 10. READINESS SCORE ─── */}
      <section id="readiness" style={{ padding: isMobile ? "52px 20px" : "80px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="SELF-ASSESSMENT" title="Are You Ready To Self-Manage?" subtitle="Check every item that applies to your current situation honestly." />
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            <div style={{ background: colors.bgSection, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: isMobile ? "24px 20px" : "40px", boxShadow: colors.shadowSm, marginBottom: "24px" }}>
              {READINESS_ITEMS.map((item, i) => (
                <div
                  key={i}
                  onClick={() => toggle(i)}
                  style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "14px 0", borderBottom: i < READINESS_ITEMS.length - 1 ? `1px solid ${colors.border}` : "none",
                    cursor: "pointer", userSelect: "none",
                  }}
                >
                  <div style={{
                    width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
                    border: `2px solid ${checked.has(i) ? colors.primary : colors.border}`,
                    background: checked.has(i) ? colors.primary : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s ease",
                  }}>
                    {checked.has(i) && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: "14px", color: checked.has(i) ? colors.textMain : colors.textMuted, lineHeight: 1.5, fontWeight: checked.has(i) ? 600 : 400 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Result */}
            <div style={{
              background: result.bg, borderRadius: "14px", border: `1.5px solid ${result.border}`,
              padding: "24px 28px", textAlign: "center",
            }}>
              <div style={{ fontSize: "28px", fontFamily: serifHeading, fontWeight: 700, color: result.color, marginBottom: "8px" }}>{count} / 8</div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: result.color, marginBottom: "16px" }}>{result.label}</div>
              {count >= 7 ? (
                <a href="#cta" style={{ display: "inline-block", padding: "12px 26px", background: colors.primary, color: "#fff", borderRadius: "9px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
                  Build My Self-Management Plan
                </a>
              ) : count >= 4 ? (
                <a href="#cta" style={{ display: "inline-block", padding: "12px 26px", background: colors.secondary, color: "#fff", borderRadius: "9px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
                  Get GroundWorks Support
                </a>
              ) : (
                <a onClick={() => router.push("/")} style={{ display: "inline-block", padding: "12px 26px", background: colors.primary, color: "#fff", borderRadius: "9px", fontSize: "14px", fontWeight: 600, textDecoration: "none", cursor: "pointer" }}>
                  Explore Managed Options
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 11. FINAL CTA ─── */}
      <section id="cta" style={{ padding: isMobile ? "52px 20px" : "80px 40px", background: colors.bgSection, borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.14em", marginBottom: "18px" }}>WANT PROFESSIONAL HELP?</div>
          <h2 style={{
            fontSize: isMobile ? "28px" : "40px", fontFamily: serifHeading, fontWeight: 700, marginBottom: "20px",
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Want GroundWorks To Build Your Self-Management Setup?
          </h2>
          <p style={{ fontSize: "17px", color: colors.textMuted, lineHeight: 1.65, marginBottom: "36px", maxWidth: "640px", margin: "0 auto 36px" }}>
            We can help you structure the systems, tools, pricing strategy, and workflows needed to operate professionally — without handing over full management control.
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <a onClick={() => router.push("/self-manage#pricing")} style={{
              cursor: "pointer", padding: "16px 32px", background: colors.primary, color: "#fff",
              borderRadius: "10px", fontSize: "15px", fontWeight: 600, textDecoration: "none",
              boxShadow: "0 8px 24px rgba(27,94,74,0.20)",
            }}>
              Request Self-Management Setup
            </a>
            <a onClick={() => router.push("/estimator")} style={{
              cursor: "pointer", padding: "16px 32px", background: "transparent", color: colors.primary,
              border: `2px solid ${colors.primary}`, borderRadius: "10px", fontSize: "15px", fontWeight: 600, textDecoration: "none",
            }}>
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
