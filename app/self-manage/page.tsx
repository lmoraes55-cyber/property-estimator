"use client";

import React, { useState } from "react";
import AssetIntelLogo from "@/components/AssetIntelLogo";
import SiteNav from "@/components/SiteNav";
import DecorativeBackdrop from "@/components/DecorativeBackdrop";
import { useIsMobile } from "@/lib/useIsMobile";
import ConsultationBanner from "@/components/home/ConsultationBanner";

const colors = {
  primary: "#1B5E4A",
  primaryDeep: "#0F3E33",
  secondary: "#B88A44",
  bgMain: "#F7F9F8",
  bgSection: "#FFFFFF",
  bgSage: "#EDF3F0",
  textMain: "#0F1D18",
  textMuted: "#4E5D56",
  border: "#E2E8E5",
  shadowSm: "0 1px 2px rgba(27,94,74,0.05)",
  shadowMd: "0 8px 28px rgba(27,94,74,0.08)",
};

const serifHeading = "var(--font-display), ui-sans-serif, system-ui, sans-serif";

// ── Outline icons — 18-22px, single colour, consistent stroke ──
const ip = (color: string, size = 20) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

const Icons = {
  doc: (c: string, s?: number) => <svg {...ip(c, s)}><path d="M7 3h7l4 4v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" /><path d="M14 3v4h4" /></svg>,
  shield: (c: string, s?: number) => <svg {...ip(c, s)}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg>,
  lock: (c: string, s?: number) => <svg {...ip(c, s)}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>,
  laptop: (c: string, s?: number) => <svg {...ip(c, s)}><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M1 20h22" /></svg>,
  calendar: (c: string, s?: number) => <svg {...ip(c, s)}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>,
  message: (c: string, s?: number) => <svg {...ip(c, s)}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg>,
  broom: (c: string, s?: number) => <svg {...ip(c, s)}><path d="M3 21l6-6" /><path d="M13 3l8 8-9 9-8-8z" /><path d="M9.5 6.5l8 8" /></svg>,
  wrench: (c: string, s?: number) => <svg {...ip(c, s)}><path d="M14.7 6.3a4 4 0 10-5.4 5.4L2 19l3 3 7.3-7.3a4 4 0 005.4-5.4l-2.6 2.6-2-2 2.6-2.6z" /></svg>,
  headset: (c: string, s?: number) => <svg {...ip(c, s)}><path d="M3 14v-2a9 9 0 0118 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></svg>,
  trending: (c: string, s?: number) => <svg {...ip(c, s)}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  camera: (c: string, s?: number) => <svg {...ip(c, s)}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>,
  building: (c: string, s?: number) => <svg {...ip(c, s)}><rect x="4" y="2" width="16" height="20" rx="1" /><line x1="9" y1="7" x2="9" y2="7" /><line x1="15" y1="7" x2="15" y2="7" /><line x1="9" y1="12" x2="9" y2="12" /><line x1="15" y1="12" x2="15" y2="12" /><line x1="10" y1="22" x2="10" y2="18" /><line x1="14" y1="22" x2="14" y2="18" /></svg>,
  key: (c: string, s?: number) => <svg {...ip(c, s)}><circle cx="8" cy="15" r="4" /><path d="M10.5 12.5L20 3" /><path d="M16 7l3 3" /><path d="M13 4l3 3" /></svg>,
  wallet: (c: string, s?: number) => <svg {...ip(c, s)}><path d="M3 7a2 2 0 012-2h13a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /><path d="M16 12h3" /></svg>,
  home: (c: string, s?: number) => <svg {...ip(c, s)}><path d="M4 11.5L12 4l8 7.5V20a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-8.5z" /></svg>,
  check: (c: string, s?: number) => <svg {...ip(c, s)}><circle cx="12" cy="12" r="9.5" opacity="0.35" /><path d="M7.5 12.3l2.8 2.8L16.5 9" strokeWidth="1.9" /></svg>,
  arrowRight: (c: string, s?: number) => <svg {...ip(c, s ?? 14)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
};

// ── Data ──────────────────────────────────────────────────────────────────

type CostTiming = "one-time" | "annual" | "monthly" | "per-booking" | "per-turnover" | "per-callout" | "hourly" | "varies";
interface CostItem { category: string; item: string; cost: string; timing: CostTiming; note: string; note2?: string; note3?: string; icon: keyof typeof Icons; }

const TIMING_LABELS: Record<CostTiming, string> = {
  "one-time": "One-Time",
  "annual": "Annual",
  "monthly": "Monthly",
  "per-booking": "Per Booking",
  "per-turnover": "Per Turnover",
  "per-callout": "Per Call-Out",
  "hourly": "Per Hour",
  "varies": "Varies",
};

const COST_ITEMS: CostItem[] = [
  { category: "Legal & Permits", item: "DET registration", cost: "~AED 1,500 one-time", timing: "one-time", note: "Initial holiday-home operator registration — confirm current fee with DET", icon: "doc" },
  { category: "Legal & Permits", item: "DET property permit", cost: "From ~AED 370 / property / year", timing: "annual", note: "Permit cost varies by property / bedroom configuration", icon: "building" },
  { category: "Legal & Permits", item: "Holiday home insurance", cost: "~AED 350 / year", timing: "annual", note: "", icon: "shield" },
  { category: "Property", item: "Smart lock / access system", cost: "~AED 800–1,500 one-time", timing: "one-time", note: "", icon: "lock" },
  { category: "Property", item: "Professional photography", cost: "~AED 500–800 one-time", timing: "one-time", note: "Typically varies according to property size and photographer", icon: "camera" },
  { category: "Property", item: "Linen sets & initial inventory", cost: "~AED 600–1,200 one-time", timing: "one-time", note: "Depends on property size, linen quality and number of sets purchased", icon: "broom" },
  { category: "Technology", item: "PMS software — Guesty Lite", cost: "From ~AED 33/month + 1% of reservations", timing: "monthly", note: "For 1–3 listings · PriceOptimizer included in current LiteOptimizer offer", note2: "Other PMS platforms and larger portfolios may use different pricing models.", icon: "laptop" },
  { category: "Technology", item: "Dynamic pricing software", cost: "From ~AED 35+ / listing / month", timing: "monthly", note: "Software pricing varies by provider and portfolio size", icon: "trending" },
  { category: "Operations", item: "Virtual Assistant / guest support", cost: "~AED 50–100 / hour", timing: "hourly", note: "Can also be arranged on a per-booking or monthly-retainer basis", note2: "Covers guest messaging · OTA enquiries · check-in coordination · issue escalation", icon: "headset" },
  { category: "Operations", item: "Housekeeping", cost: "~AED 150–350 / turnover", timing: "per-turnover", note: "Cleaning and property turnover. Cost varies depending on property size.", note2: "Laundry: +~AED 50 / turnover", note3: "Estimated total: ~AED 200–400 / turnover", icon: "broom" },
  { category: "Operations", item: "Maintenance support", cost: "~AED 75–100 call-out", timing: "per-callout", note: "+ cost of parts, materials and repair work", note2: "Monthly maintenance packages may also be available", icon: "wrench" },
  { category: "Operations", item: "Guest relations / guided check-in", cost: "~AED 50–150 / check-in", timing: "per-booking", note: "Relevant for properties requiring physical guest check-in", icon: "key" },
  { category: "Operations", item: "Revenue management", cost: "Monthly fee or % of revenue", timing: "varies", note: "Optional professional pricing management — varies by provider", icon: "trending" },
];

const STAGE1_ITEMS = ["DET registration", "Holiday home permit", "Insurance", "Building requirements", "Guest access", "Smart lock", "Property preparation", "Photography"];
const STAGE2_ITEMS = ["PMS", "Airbnb / Booking.com", "Automated messaging", "Dynamic pricing", "Calendar sync", "Payment workflows", "Guest registration workflow"];

interface TeamCard { title: string; desc: string; cost: string; icon: keyof typeof Icons; }
const TEAM_CARDS: TeamCard[] = [
  { title: "Housekeeping", desc: "Cleaning, linen and turnover.", cost: "AED 80–150 per clean", icon: "broom" },
  { title: "Maintenance", desc: "Third-party maintenance support.", cost: "Pay-per-job / monthly package", icon: "wrench" },
  { title: "Virtual Assistant", desc: "Guest messaging, OTA enquiries, check-in instructions, coordination and issue escalation.", cost: "Monthly retainer — varies by provider", icon: "headset" },
  { title: "Guest Relations", desc: "Physical access / check-in where required.", cost: "Per check-in or monthly arrangement", icon: "key" },
  { title: "Revenue Management", desc: "Optional professional dynamic pricing support.", cost: "Monthly fee or % model", icon: "trending" },
];

interface WorkflowStage { number: string; title: string; items: string[]; icon: keyof typeof Icons; }
const WORKFLOW_STAGES: WorkflowStage[] = [
  { number: "01", title: "Win the Booking", icon: "calendar", items: ["Pricing & availability", "OTA calendar management", "Dynamic pricing"] },
  { number: "02", title: "Prepare the Guest", icon: "message", items: ["Booking confirmation", "VA guest communication", "DET guest registration", "Access instructions"] },
  { number: "03", title: "Manage the Stay", icon: "headset", items: ["Self check-in / Guest Relations", "Guest support", "Maintenance coordination", "Issue management"] },
  { number: "04", title: "Turnover & Get Paid", icon: "wallet", items: ["Checkout coordination", "Housekeeping & inspection", "Revenue reconciliation", "Owner payout"] },
];

interface SetupTier {
  range: string; title: string; badge: string; badgeStyle: "green" | "bronze" | "greenSolid";
  copy: string; supportingCopy: string; bestFor: string; cta: string; ctaHref?: string; ctaAction?: "setup";
}
const SETUP_TIERS: SetupTier[] = [
  {
    range: "1–3 Properties",
    title: "Operator Managed",
    badge: "AssetIntel Recommends",
    badgeStyle: "green",
    copy: "For most owners with 1–3 properties, using a professional STR operator is likely the simpler option.",
    supportingCopy: "At around 15% management fees, the convenience of having pricing, guest support, housekeeping coordination, maintenance and day-to-day operations handled for you can outweigh the savings from self-management.",
    bestFor: "Owners who want STR income without building their own operating infrastructure.",
    cta: "Find the Best Operator for My Property →",
    ctaAction: "setup",
  },
  {
    range: "4–5 Properties",
    title: "Compare Both Models",
    badge: "Depends On Your Goals",
    badgeStyle: "bronze",
    copy: "At this portfolio size, self-management can start becoming financially worthwhile — particularly for hands-on owners.",
    supportingCopy: "Compare your expected management fees against the cost of your own PMS, guest support, maintenance network, housekeeping coordination and pricing tools before deciding.",
    bestFor: "Owners who want more control and are comfortable managing vendors and systems.",
    cta: "Book a Guidance Call →",
    ctaHref: "/consultation",
  },
  {
    range: "6+ Properties",
    title: "Self-Management Setup",
    badge: "Self-Management Recommended",
    badgeStyle: "greenSolid",
    copy: "With 6+ properties, building your own operating infrastructure can become significantly more economical than paying a percentage management fee across the portfolio.",
    supportingCopy: "Centralise your PMS, guest support, pricing, housekeeping, maintenance and reporting while retaining control of the properties and rental income.",
    bestFor: "Multi-property owners building a professional internal STR operation.",
    cta: "Build My Self-Management Setup →",
    ctaHref: "#guide",
  },
];

interface ChecklistGroup { title: string; items: string[]; icon: keyof typeof Icons; }
const CHECKLIST_GROUPS: ChecklistGroup[] = [
  { title: "Legal", items: ["DET registration", "Permit", "Insurance"], icon: "doc" },
  { title: "Property", items: ["Furnishing", "Photography", "Inventory", "Smart access"], icon: "home" },
  { title: "Technology", items: ["PMS", "OTA accounts", "Pricing", "Automation"], icon: "laptop" },
  { title: "Operations", items: ["Housekeeping", "Laundry", "Maintenance", "Guest relations", "VA"], icon: "headset" },
  { title: "Finance", items: ["Revenue tracking", "Operating costs", "Owner accounting"], icon: "wallet" },
];

const GUIDANCE_CALL_INCLUDES = [
  "Review of the owner's property and requirements",
  "Introduction to the services and systems needed",
  "Recommended operating structure",
  "PMS and technology recommendations",
  "Operations/vendor requirements",
  "Guest-support requirements",
  "Approximate one-time setup costs",
  "Approximate recurring operating costs",
  "Tailored fixed-cost estimate based on the specific listing and requirements",
];

interface SetupGroup { title: string; items: string[]; icon: keyof typeof Icons; note?: string; }
const AZ_SETUP_GROUPS: SetupGroup[] = [
  { title: "Licensing & Property Setup", icon: "doc", items: ["DET setup guidance", "Holiday home permit process guidance", "Insurance requirements", "Property readiness requirements", "Guest-access planning"] },
  { title: "PMS & Technology Stack", icon: "laptop", items: ["PMS recommendation", "PMS setup guidance", "OTA/channel workflow", "Automated guest messaging setup", "Operational task workflow", "Recommended tools used by professional Dubai STR operators"] },
  { title: "Pricing & Revenue Management", icon: "trending", items: ["Dynamic pricing software recommendation", "Dubai-market-specific pricing setup guidance", "Seasonality considerations", "Booking-window strategy", "Occupancy and ADR optimisation framework"] },
  { title: "Virtual Assistant / Guest Support", icon: "headset", note: "Help source experienced third-party Virtual Assistants suitable for Dubai STR operations, including support for:", items: ["Airbnb messaging", "Booking.com messaging", "Guest enquiries", "Check-in instructions", "Issue escalation", "Operations coordination"] },
  { title: "Maintenance", icon: "wrench", note: "Help identify experienced third-party holiday-home maintenance providers for:", items: ["Guest maintenance requests", "Emergency support", "General repairs", "Preventive maintenance"] },
  { title: "Guest Relations", icon: "key", note: "Where required by the building or community, help source appropriate third-party guest-relations support for:", items: ["Physical check-ins", "Guest access", "Key handovers", "On-ground guest assistance"] },
];

const AZ_THIRD_PARTY_COSTS = ["DET/government fees", "Insurance", "Smart locks", "PMS subscription", "Pricing software", "Virtual assistants", "Housekeeping", "Maintenance", "Guest relations", "Photography", "Other vendors"];

const OPERATIONS_FLOW = ["Guest", "VA", "PMS", "Housekeeping", "Maintenance", "Guest Relations", "Owner"];

const PORTFOLIO_STATUS_OPTIONS = [
  "Already operating short-term rentals",
  "Planning to switch from long-term to short-term",
  "Using an operator but considering self-management",
  "Scaling a small portfolio",
  "Other",
];
const SUPPORT_OPTIONS = [
  "PMS & automation setup",
  "Operations team structure",
  "Pricing strategy",
  "Guest communication workflow",
  "Housekeeping / maintenance workflow",
  "Financial reporting system",
  "EMAAR guest access requirements",
  "Full portfolio setup",
];

export default function SelfManagePage() {
  const isMobile = useIsMobile();
  const [modalType, setModalType] = useState<"setup" | "emaar" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", units: "", status: "", support: "", message: "" });

  function setField(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: modalType === "emaar" ? "emaar-setup-requirements" : "self-manage-setup-support", targetType: "service", ...form }),
      });
    } catch {}
    setSubmitting(false);
    setSubmitted(true);
  }

  function openModal(type: "setup" | "emaar") {
    setSubmitted(false);
    setForm({ name: "", email: "", phone: "", units: "", status: "", support: "", message: "" });
    setModalType(type);
  }
  function closeModal() { setModalType(null); }

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh", position: "relative" }}>
      <DecorativeBackdrop />
      <div style={{ position: "relative", zIndex: 1 }}>

        <SiteNav active="self-manage" />

        {/* ─── HERO ─── */}
        <section style={{ padding: isMobile ? "40px 20px 44px" : "56px 48px 60px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: "11.5px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "16px" }}>
              Self-Manage Your STR
            </div>
            <h1 style={{ fontSize: isMobile ? "30px" : "44px", fontFamily: serifHeading, fontWeight: 500, lineHeight: 1.18, marginBottom: "18px", color: colors.primary, maxWidth: "820px", marginLeft: "auto", marginRight: "auto" }}>
              Everything You Need to Run Your Holiday Home Yourself
            </h1>
            <p style={{ fontSize: isMobile ? "14.5px" : "16px", color: colors.textMuted, lineHeight: 1.65, maxWidth: "680px", margin: "0 auto 30px" }}>
              A practical breakdown of the setup, systems, people and estimated costs required to professionally self-manage a Dubai short-term rental.
            </p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
              <a href="#costs" style={{ padding: "14px 28px", background: colors.primary, color: "#fff", borderRadius: "10px", fontSize: "14.5px", fontWeight: 700, textDecoration: "none", boxShadow: "0 10px 26px rgba(27,94,74,0.24)" }}>
                See My Setup Costs →
              </a>
              <a href="#guide" style={{ padding: "14px 28px", background: "transparent", color: colors.primary, border: `1.5px solid ${colors.primary}`, borderRadius: "10px", fontSize: "14.5px", fontWeight: 700, textDecoration: "none" }}>
                View Self-Manage Guide →
              </a>
            </div>
          </div>
        </section>

        {/* ─── WHAT DOES IT COST ─── */}
        <section id="costs" style={{ padding: isMobile ? "0 20px 52px" : "0 48px 76px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <SectionHeading label="Transparent Pricing" title="What Does It Cost to Self-Manage?" subtitle="A transparent breakdown of the typical setup and operating costs required to run a Dubai holiday home professionally." />

            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "16px", marginBottom: "36px" }}>
              <SummaryCard label="Estimated Initial Setup" value="AED 1,500 – 3,500+" sub="Insurance, smart lock, photography, permit" icon="doc" />
              <SummaryCard label="Estimated Monthly Overhead" value="AED 300 – 1,500+" sub="PMS, VA, housekeeping, maintenance" icon="wallet" />
              <SummaryCard label="Management Fee Saved" value="~15–20%" sub="of booking revenue, vs a full-service operator" icon="trending" />
              <SummaryCard label="Best For" value="Hands-On Owners" sub="Owners who want control and lower fees" icon="home" />
            </div>

            {/* Cost breakdown */}
            <div style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "24px", boxShadow: colors.shadowMd, overflow: "hidden" }}>
              {COST_ITEMS.map((c, i) => (
                <div key={c.item} style={{ display: "flex", alignItems: "center", gap: "16px", padding: isMobile ? "16px 18px" : "14px 26px", borderTop: i > 0 ? `1px solid ${colors.border}` : "none", flexWrap: isMobile ? "wrap" : "nowrap" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: colors.bgSage, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {Icons[c.icon](colors.primary, 17)}
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.secondary, marginBottom: "2px" }}>{c.category}</div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: colors.textMain }}>{c.item}</div>
                  </div>
                  <div style={{ textAlign: isMobile ? "left" : "right", flexShrink: 0, maxWidth: isMobile ? "100%" : "320px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: isMobile ? "flex-start" : "flex-end", marginBottom: "2px" }}>
                      <span style={{ fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: colors.secondary, background: "rgba(184,138,68,0.10)", border: "1px solid rgba(184,138,68,0.26)", borderRadius: "999px", padding: "2px 8px", whiteSpace: "nowrap" }}>
                        {TIMING_LABELS[c.timing]}
                      </span>
                      <div style={{ fontSize: "13.5px", fontWeight: 700, color: colors.textMain }}>{c.cost}</div>
                    </div>
                    {c.note && <div style={{ fontSize: "10.5px", color: colors.textMuted, lineHeight: 1.4, marginTop: "1px" }}>{c.note}</div>}
                    {c.note2 && <div style={{ fontSize: "10.5px", color: colors.textMuted, lineHeight: 1.4, marginTop: "1px" }}>{c.note2}</div>}
                    {c.note3 && <div style={{ fontSize: "10.5px", fontWeight: 700, color: colors.secondary, lineHeight: 1.4, marginTop: "3px" }}>{c.note3}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 01 — GET LEGAL & GUEST READY ─── */}
        <StageSection
          number="01"
          title="Get Legal & Guest Ready"
          items={STAGE1_ITEMS}
          isMobile={isMobile}
          footLabel="Estimated Setup Cost"
          footValue="AED 1,500 – 3,500+"
        />

        {/* ─── 02 — BUILD YOUR TECHNOLOGY ─── */}
        <StageSection
          number="02"
          title="Build Your Technology"
          items={STAGE2_ITEMS}
          isMobile={isMobile}
          footLabel="Estimated Technology Cost"
          footValue="AED 100 – 400+ / month"
        />

        {/* ─── 03 — BUILD YOUR OPERATIONS TEAM ─── */}
        <section style={{ padding: isMobile ? "0 20px 52px" : "0 48px 76px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "22px", boxShadow: colors.shadowSm, padding: isMobile ? "26px 22px" : "32px 36px" }}>
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.14em", marginBottom: "6px" }}>03</div>
                <h2 style={{ fontSize: isMobile ? "20px" : "24px", fontFamily: serifHeading, fontWeight: 500, color: colors.primary }}>Build Your Operations Team</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "14px" }}>
                {TEAM_CARDS.map(t => (
                  <div key={t.title} style={{ background: "#FFFFFF", border: `1px solid ${colors.border}`, borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: colors.bgSage, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "4px" }}>
                      {Icons[t.icon](colors.primary, 16)}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: colors.textMain }}>{t.title}</div>
                    <p style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.5, margin: 0 }}>{t.desc}</p>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: colors.secondary, marginTop: "auto", paddingTop: "6px" }}>{t.cost}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 04 — RUN THE PROPERTY ─── */}
        <section style={{ padding: isMobile ? "0 20px 52px" : "0 48px 76px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "26px", boxShadow: colors.shadowMd, padding: isMobile ? "32px 22px" : "44px 44px 40px" }}>

            <div style={{ marginBottom: isMobile ? "28px" : "36px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.14em", marginBottom: "8px" }}>04</div>
              <h2 style={{ fontSize: isMobile ? "22px" : "27px", fontFamily: serifHeading, fontWeight: 500, color: colors.primary, marginBottom: "10px" }}>Run Your Property Like an Operator</h2>
              <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.6, maxWidth: "560px", margin: "0 auto" }}>
                Once your property is live, these are the core systems that keep every booking, guest stay and payout running smoothly.
              </p>
            </div>

            {/* Workflow stages */}
            <div style={{ position: "relative" }}>
              {!isMobile && (
                <div aria-hidden style={{ position: "absolute", top: "13px", left: "12%", right: "12%", height: "1.5px", background: `linear-gradient(90deg, transparent, ${colors.secondary}88, ${colors.primary}55, ${colors.secondary}88, transparent)` }} />
              )}
              <div style={{ display: isMobile ? "flex" : "grid", flexDirection: isMobile ? "column" : undefined, gridTemplateColumns: isMobile ? undefined : "repeat(4, 1fr)", gap: isMobile ? "0" : "8px" }}>
                {WORKFLOW_STAGES.map((s, i) => (
                  <div key={s.title} style={{ position: "relative" }}>
                    {isMobile && i > 0 && (
                      <div style={{ display: "flex", justifyContent: "center", padding: "6px 0" }}>
                        <div style={{ width: "1.5px", height: "18px", background: `${colors.secondary}66` }} />
                      </div>
                    )}
                    <div style={{ textAlign: "center", padding: isMobile ? "0" : "0 10px" }}>
                      <span style={{
                        position: "relative", zIndex: 1, display: "inline-block", background: colors.bgSection,
                        padding: "0 10px", fontSize: "11px", fontWeight: 800, letterSpacing: "0.06em", color: colors.secondary,
                      }}>
                        {s.number}
                      </span>
                      <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: colors.bgSage, display: "flex", alignItems: "center", justifyContent: "center", margin: "12px auto 12px" }}>
                        {Icons[s.icon](colors.primary, 17)}
                      </div>
                      <div style={{ fontSize: "14.5px", fontWeight: 700, color: colors.primary, marginBottom: "10px" }}>{s.title}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        {s.items.map(item => (
                          <span key={item} style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.5 }}>{item}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insight strip */}
            <div style={{ marginTop: isMobile ? "30px" : "38px", background: colors.bgSage, border: `1px solid rgba(27,94,74,0.14)`, borderRadius: "16px", padding: isMobile ? "18px 20px" : "20px 28px", textAlign: "center" }}>
              <p style={{ fontSize: "14px", fontWeight: 500, color: colors.primary, marginBottom: "6px", fontFamily: serifHeading }}>
                The goal of self-management isn&apos;t to do everything yourself.
              </p>
              <p style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.6, maxWidth: "640px", margin: "0 auto" }}>
                Build the right systems and use specialist vendors for guest support, housekeeping, maintenance, pricing and technology — while you remain in control of the property and rental income.
              </p>
            </div>
          </div>
        </section>

        {/* ─── EMAAR PROPERTY NOTE ─── */}
        <section style={{ padding: isMobile ? "0 20px 52px" : "0 48px 76px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "18px", padding: isMobile ? "18px 20px" : "18px 24px", display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: colors.bgSage, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {Icons.building(colors.primary, 17)}
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: colors.primary, marginBottom: "3px" }}>Own an EMAAR Property?</div>
                <p style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.55, margin: 0 }}>
                  EMAAR properties require a guided guest check-in rather than standard self check-in. Your remaining self-management setup and operating structure stays largely the same.
                </p>
              </div>
              <div style={{ background: "rgba(184,138,68,0.08)", border: "1px solid rgba(184,138,68,0.24)", borderRadius: "12px", padding: "10px 18px", textAlign: isMobile ? "left" : "right", flexShrink: 0 }}>
                <div style={{ fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.secondary, marginBottom: "3px" }}>Additional Requirement</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: colors.textMain, marginBottom: "2px" }}>Guided Guest Check-In</div>
                <div style={{ fontSize: "11px", color: colors.textMuted }}>Via Guest Relations</div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CHOOSE YOUR SETUP ─── */}
        <section style={{ padding: isMobile ? "52px 20px" : "76px 48px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <SectionHeading label="Portfolio Guidance" title="Choose Your Setup" subtitle="AssetIntel's recommendation changes with portfolio size — we won't tell you to self-manage if the numbers don't support it." />
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "16px", alignItems: "stretch" }}>
              {SETUP_TIERS.map(t => {
                const isSolid = t.badgeStyle === "greenSolid";
                const cardBg = isSolid ? `linear-gradient(160deg, ${colors.primary}, ${colors.primaryDeep})` : colors.bgSection;
                const cardBorder = isSolid ? "none" : t.badgeStyle === "bronze" ? "1.5px solid rgba(184,138,68,0.32)" : "1.5px solid rgba(27,94,74,0.25)";
                const textColor = isSolid ? "#FFFFFF" : colors.textMain;
                const mutedColor = isSolid ? "rgba(255,255,255,0.8)" : colors.textMuted;
                const labelColor = isSolid ? "#D4A574" : t.badgeStyle === "bronze" ? colors.secondary : colors.primary;
                const badgeBg = isSolid ? "rgba(255,255,255,0.14)" : t.badgeStyle === "bronze" ? "rgba(184,138,68,0.12)" : "rgba(27,94,74,0.10)";
                const badgeBorder = isSolid ? "1px solid rgba(255,255,255,0.24)" : t.badgeStyle === "bronze" ? "1px solid rgba(184,138,68,0.3)" : "1px solid rgba(27,94,74,0.22)";
                const badgeText = isSolid ? "#FFFFFF" : t.badgeStyle === "bronze" ? colors.secondary : colors.primary;
                const ctaProps = t.ctaAction === "setup" ? { as: "button" as const, onClick: () => openModal("setup") } : { as: "a" as const, href: t.ctaHref };

                return (
                  <div key={t.range} style={{ display: "flex", flexDirection: "column", background: cardBg, border: cardBorder, borderRadius: "20px", padding: "26px 24px", boxShadow: colors.shadowSm }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", color: labelColor, textTransform: "uppercase", marginBottom: "10px" }}>{t.range}</div>
                    <div style={{ fontSize: "18px", fontWeight: 500, fontFamily: serifHeading, color: textColor, marginBottom: "12px" }}>{t.title}</div>

                    <span style={{ alignSelf: "flex-start", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: badgeText, background: badgeBg, border: badgeBorder, borderRadius: "999px", padding: "5px 12px", marginBottom: "14px" }}>
                      {t.badge}
                    </span>

                    <p style={{ fontSize: "13.5px", fontWeight: 600, color: textColor, lineHeight: 1.55, marginBottom: "10px" }}>{t.copy}</p>
                    <p style={{ fontSize: "12.5px", color: mutedColor, lineHeight: 1.6, marginBottom: "18px" }}>{t.supportingCopy}</p>

                    <div style={{ fontSize: "12px", color: mutedColor, lineHeight: 1.55, marginBottom: "18px", marginTop: "auto", paddingTop: "14px", borderTop: `1px solid ${isSolid ? "rgba(255,255,255,0.16)" : colors.border}` }}>
                      <strong style={{ color: textColor }}>Best for:</strong> {t.bestFor}
                    </div>

                    {ctaProps.as === "button" ? (
                      <button onClick={ctaProps.onClick} style={{ textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "13px", fontWeight: 700, color: isSolid ? "#FFFFFF" : t.badgeStyle === "bronze" ? colors.secondary : colors.primary }}>
                        {t.cta}
                      </button>
                    ) : (
                      <a href={t.ctaHref} style={{ fontSize: "13px", fontWeight: 700, color: isSolid ? "#FFFFFF" : t.badgeStyle === "bronze" ? colors.secondary : colors.primary, textDecoration: "none" }}>
                        {t.cta}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── SETUP CHECKLIST ─── */}
        <section id="checklist" style={{ padding: isMobile ? "0 20px 52px" : "0 48px 76px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "26px", boxShadow: colors.shadowMd, padding: isMobile ? "32px 22px" : "44px 40px" }}>
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.secondary, marginBottom: "10px" }}>Setup Checklist</div>
              <h2 style={{ fontSize: isMobile ? "22px" : "27px", fontFamily: serifHeading, fontWeight: 500, color: colors.primary }}>Your Self-Management Setup Checklist</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)", gap: "20px" }}>
              {CHECKLIST_GROUPS.map(g => (
                <div key={g.title}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: colors.bgSage, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {Icons[g.icon](colors.primary, 14)}
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: colors.textMain }}>{g.title}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {g.items.map(item => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {Icons.check(colors.primary, 12)}
                        <span style={{ fontSize: "12px", color: colors.textMuted }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── GUIDANCE CALL + A-Z SETUP ─── */}
        <section id="guide" style={{ padding: isMobile ? "0 20px 52px" : "0 48px 76px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <p style={{ fontSize: isMobile ? "15px" : "16.5px", color: colors.primary, fontFamily: serifHeading, lineHeight: 1.55, maxWidth: "760px", margin: "0 auto" }}>
                Build your self-managed STR using the systems, technology and operational structure used by professional Dubai holiday-home operators — without giving away a percentage of your rental revenue.
              </p>
            </div>

            {/* Option 1 — Guidance Call */}
            <div style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "24px", boxShadow: colors.shadowMd, padding: isMobile ? "28px 24px" : "36px 40px", marginBottom: "24px" }}>
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "22px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.secondary, marginBottom: "10px" }}>Option 1 — Not Sure What You Need?</div>
                  <h2 style={{ fontSize: isMobile ? "20px" : "24px", fontFamily: serifHeading, fontWeight: 500, color: colors.primary, marginBottom: "4px" }}>Self-Manage Guidance Call</h2>
                  <p style={{ fontSize: "13px", color: colors.textMuted }}>20-minute private session with AssetIntel</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "30px", fontWeight: 500, color: colors.primary, fontFamily: serifHeading, lineHeight: 1 }}>AED 199</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "8px 20px", marginBottom: "24px" }}>
                {GUIDANCE_CALL_INCLUDES.map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <div style={{ marginTop: "2px", flexShrink: 0 }}>{Icons.check(colors.primary, 13)}</div>
                    <span style={{ fontSize: "13px", color: colors.textMain, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
              <a href="/consultation" style={{ display: "inline-flex", alignItems: "center", padding: "14px 26px", background: colors.primary, color: "#fff", borderRadius: "10px", fontSize: "14px", fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 20px rgba(27,94,74,0.24)" }}>
                Book My Guidance Call — AED 199 →
              </a>
            </div>

            {/* Option 2 — Complete A-Z Setup */}
            <div style={{ background: `linear-gradient(160deg, ${colors.primary}, ${colors.primaryDeep})`, borderRadius: "24px", padding: isMobile ? "28px 24px" : "40px 44px", color: "#fff", position: "relative", overflow: "hidden" }}>
              <div aria-hidden style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(184,138,68,0.14)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>

                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
                  <div style={{ maxWidth: "560px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#D4A574", marginBottom: "10px" }}>Done-For-You Setup</div>
                    <h2 style={{ fontSize: isMobile ? "21px" : "26px", fontFamily: serifHeading, fontWeight: 500, color: "#FFFFFF", marginBottom: "10px", lineHeight: 1.2 }}>Complete A–Z Self-Manage Setup</h2>
                    <p style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.8)", lineHeight: 1.65 }}>
                      Want AssetIntel to help build the entire operating infrastructure for you? We can coordinate the setup required to get your property ready to operate professionally while you remain in control of the property and rental income.
                    </p>
                  </div>

                  <div style={{ textAlign: isMobile ? "left" : "right", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "10px", justifyContent: isMobile ? "flex-start" : "flex-end" }}>
                      <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.55)", textDecoration: "line-through" }}>AED 1,427</span>
                      <span style={{ fontSize: "36px", fontWeight: 500, color: "#fff", fontFamily: serifHeading, lineHeight: 1 }}>AED 999</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px", justifyContent: isMobile ? "flex-start" : "flex-end", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px", background: colors.secondary, color: "#fff" }}>30% OFF</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff" }}>Limited Launch Pricing</span>
                    </div>
                  </div>
                </div>

                {/* What's included */}
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "#D4A574", marginBottom: "14px", marginTop: "10px" }}>What the AED 999 Setup Includes</div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "14px", marginBottom: "24px" }}>
                  {AZ_SETUP_GROUPS.map(g => (
                    <div key={g.title} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "16px", padding: "18px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "10px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {Icons[g.icon]("#D4A574", 14)}
                        </div>
                        <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#fff" }}>{g.title}</span>
                      </div>
                      {g.note && <p style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.65)", lineHeight: 1.5, marginBottom: "8px" }}>{g.note}</p>}
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        {g.items.map(item => (
                          <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                            <div style={{ marginTop: "3px", flexShrink: 0 }}>{Icons.check("#D4A574", 11)}</div>
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Operations Structure */}
                  <div style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "16px", padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "10px" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {Icons.wallet("#D4A574", 14)}
                      </div>
                      <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#fff" }}>Operations Structure</span>
                    </div>
                    <p style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.65)", lineHeight: 1.5, marginBottom: "10px" }}>
                      Help establish the core operating workflow connecting:
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px" }}>
                      {OPERATIONS_FLOW.map((step, i) => (
                        <React.Fragment key={step}>
                          <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 9px", borderRadius: "999px", background: "rgba(255,255,255,0.12)", color: "#fff" }}>{step}</span>
                          {i < OPERATIONS_FLOW.length - 1 && <span style={{ opacity: 0.5 }}>{Icons.arrowRight("#D4A574", 11)}</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing clarification */}
                <div style={{ background: "rgba(0,0,0,0.16)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "16px", padding: "18px 20px", marginBottom: "26px" }}>
                  <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#D4A574", marginBottom: "8px" }}>Important Pricing Clarification</div>
                  <p style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.82)", lineHeight: 1.65, marginBottom: "10px" }}>
                    <strong style={{ color: "#fff" }}>AED 999</strong> is AssetIntel&apos;s A–Z setup and support fee. Third-party costs are paid separately by the owner and are <strong style={{ color: "#fff" }}>not included</strong> unless explicitly stated otherwise:
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                    {AZ_THIRD_PARTY_COSTS.map(item => (
                      <span key={item} style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.85)" }}>{item}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.65)", lineHeight: 1.6, margin: 0 }}>
                    The Guidance Call provides an estimated breakdown of these additional costs based on your specific property.
                  </p>
                </div>

                <button onClick={() => openModal("setup")} style={{ padding: "13px 24px", background: "transparent", border: `1.5px solid rgba(255,255,255,0.4)`, color: "#fff", borderRadius: "10px", fontSize: "13.5px", fontWeight: 700, cursor: "pointer" }}>
                  Get Complete Setup — AED 999 →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── ENQUIRY MODAL ─── */}
        {modalType !== null && (() => {
          const isEmaar = modalType === "emaar";
          const eyebrow = isEmaar ? "EMAAR SETUP REQUIREMENTS" : "SELF-MANAGE SETUP SUPPORT";
          const title = isEmaar ? "Check EMAAR Setup Requirements" : "Request Setup Support";
          const subtitle = isEmaar
            ? "Tell us your building and AssetIntel will confirm the guest-access and check-in requirements that apply."
            : "Tell us about your property and what you need help implementing. Our team will be in touch with next steps.";
          return (
            <div
              onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
              style={{ position: "fixed", inset: 0, background: "rgba(10,26,20,0.62)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
            >
              <div style={{ background: "#FDFBF8", borderRadius: "24px", width: "100%", maxWidth: "600px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.22)", border: `1px solid ${colors.border}` }}>
                <div style={{ padding: isMobile ? "28px 24px 20px" : "36px 40px 24px", borderBottom: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: colors.primary, letterSpacing: "0.12em", marginBottom: "10px" }}>{eyebrow}</div>
                  <h2 style={{ fontSize: isMobile ? "22px" : "26px", fontFamily: serifHeading, fontWeight: 500, color: colors.textMain, marginBottom: "10px", lineHeight: 1.25 }}>{title}</h2>
                  <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.65 }}>{subtitle}</p>
                </div>

                {submitted ? (
                  <div style={{ padding: isMobile ? "36px 24px" : "48px 40px", textAlign: "center" }}>
                    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ marginBottom: "20px" }}>
                      <circle cx="26" cy="26" r="25" stroke={colors.primary} strokeWidth="1.5" opacity="0.25" />
                      <circle cx="26" cy="26" r="20" fill={`${colors.primary}15`} />
                      <path d="M16 26L23 33L36 19" stroke={colors.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <h3 style={{ fontSize: "20px", fontFamily: serifHeading, fontWeight: 500, color: colors.textMain, marginBottom: "12px" }}>Thank you — your enquiry has been received.</h3>
                    <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.65, marginBottom: "28px" }}>AssetIntel will review your details and contact you with guidance on the right setup.</p>
                    <button onClick={closeModal} style={{ padding: "12px 28px", background: colors.primary, color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Close</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ padding: isMobile ? "24px 24px 32px" : "32px 40px 40px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                      <ModalField label="Full Name" required>
                        <input required value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Your full name" style={inputStyle} />
                      </ModalField>
                      <ModalField label="Email" required>
                        <input required type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="your@email.com" style={inputStyle} />
                      </ModalField>
                      <ModalField label="Phone / WhatsApp">
                        <input value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="+971 50 000 0000" style={inputStyle} />
                      </ModalField>
                      <ModalField label={isEmaar ? "Building Name" : "Number of Units"}>
                        <input value={form.units} onChange={(e) => setField("units", e.target.value)} placeholder={isEmaar ? "e.g. Address Beach Residences" : "e.g. 3"} style={inputStyle} />
                      </ModalField>
                    </div>
                    {!isEmaar && (
                      <>
                        <ModalField label="Current Portfolio Status" style={{ marginBottom: "16px" }}>
                          <select value={form.status} onChange={(e) => setField("status", e.target.value)} style={{ ...inputStyle, appearance: "none" as const }}>
                            <option value="">Select status…</option>
                            {PORTFOLIO_STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </ModalField>
                        <ModalField label="Main Support Needed" style={{ marginBottom: "16px" }}>
                          <select value={form.support} onChange={(e) => setField("support", e.target.value)} style={{ ...inputStyle, appearance: "none" as const }}>
                            <option value="">Select support area…</option>
                            {SUPPORT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </ModalField>
                      </>
                    )}
                    <ModalField label="Message / Notes" style={{ marginBottom: "28px" }}>
                      <textarea value={form.message} onChange={(e) => setField("message", e.target.value)} placeholder="Any additional context…" rows={4} style={{ ...inputStyle, resize: "vertical" as const }} />
                    </ModalField>
                    <div style={{ display: "flex", gap: "12px", flexDirection: isMobile ? "column-reverse" : "row" }}>
                      <button type="button" onClick={closeModal} style={{ flex: 1, padding: "14px", background: "transparent", color: colors.textMuted, border: `1.5px solid ${colors.border}`, borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                      <button type="submit" disabled={submitting} style={{ flex: 2, padding: "14px", background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDeep} 100%)`, color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: submitting ? "wait" : "pointer", boxShadow: "0 4px 16px rgba(27,94,74,0.28)" }}>
                        {submitting ? "Submitting…" : "Submit Enquiry"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          );
        })()}

        {/* ─── CONSULTATION CTA ─── */}
        <ConsultationBanner />

        {/* ─── FOOTER ─── */}
        <footer style={{ background: colors.bgSection, borderTop: `1px solid ${colors.border}`, padding: "40px" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <AssetIntelLogo size={32} />
              <span style={{ fontSize: "14px", color: colors.textMuted }}>AssetIntel — Dubai Property Intelligence</span>
            </div>
            <div style={{ fontSize: "13px", color: colors.textMuted }}>© {new Date().getFullYear()} AssetIntel. All rights reserved.</div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ─── Shared styles ──────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", fontSize: "14px", color: colors.textMain,
  background: "#F7F9F8", border: `1.5px solid ${colors.border}`, borderRadius: "9px",
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};

// ─── Components ─────────────────────────────────────────────────────────────
function SectionHeading({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "36px", textAlign: "center" }}>
      <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>{label}</div>
      <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontFamily: serifHeading, fontWeight: 500, marginBottom: subtitle ? "12px" : 0, color: colors.primary }}>{title}</h2>
      {subtitle && <p style={{ fontSize: "14.5px", color: colors.textMuted, lineHeight: 1.65, maxWidth: "600px", margin: "0 auto" }}>{subtitle}</p>}
    </div>
  );
}

function ModalField({ label, children, style, required }: { label: string; children: React.ReactNode; style?: React.CSSProperties; required?: boolean }) {
  return (
    <div style={style}>
      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: colors.textMain, marginBottom: "6px", letterSpacing: "0.02em" }}>
        {label}{required && <span style={{ color: colors.secondary, marginLeft: "3px" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function SummaryCard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: keyof typeof Icons }) {
  return (
    <div style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "16px", padding: "18px 18px 16px", boxShadow: colors.shadowSm }}>
      <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: colors.bgSage, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
        {Icons[icon](colors.primary, 16)}
      </div>
      <div style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: colors.textMuted, marginBottom: "6px" }}>{label}</div>
      <div style={{ fontSize: "17px", fontWeight: 500, color: colors.textMain, fontFamily: serifHeading, lineHeight: 1.15, marginBottom: "4px" }}>{value}</div>
      <div style={{ fontSize: "11px", color: colors.textMuted, lineHeight: 1.4 }}>{sub}</div>
    </div>
  );
}

function StageSection({ number, title, items, isMobile, footLabel, footValue }: {
  number: string; title: string; items: string[]; isMobile: boolean;
  footLabel: string; footValue: string;
}) {
  return (
    <section style={{ padding: isMobile ? "0 20px 52px" : "0 48px 76px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "22px", boxShadow: colors.shadowSm, padding: isMobile ? "26px 22px" : "32px 36px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px", flexWrap: "wrap", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.14em", marginBottom: "6px" }}>{number}</div>
              <h2 style={{ fontSize: isMobile ? "20px" : "24px", fontFamily: serifHeading, fontWeight: 500, color: colors.primary }}>{title}</h2>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: colors.textMuted, marginBottom: "3px" }}>{footLabel}</div>
              <div style={{ fontSize: "16px", fontWeight: 500, color: colors.textMain, fontFamily: serifHeading }}>{footValue}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "10px 16px" }}>
            {items.map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {Icons.check(colors.primary, 14)}
                <span style={{ fontSize: "13px", color: colors.textMain }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
