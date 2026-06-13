"use client";

import React from "react";
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
  shadowSm: "0 1px 2px rgba(0, 0, 0, 0.05)",
  shadowMd: "0 4px 6px rgba(0, 0, 0, 0.1)",
  shadowLg: "0 20px 25px rgba(0, 0, 0, 0.15)",
};

// ─── SVG Icons ────────────────────────────────────────────────────────────
const stroke = (color: string) => ({ stroke: color, strokeWidth: 1.2, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

const IconTech = ({ color = colors.primary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32">
    <rect x="5" y="7" width="22" height="14" rx="1.5" {...stroke(color)} />
    <path d="M11 26H21" {...stroke(color)} />
    <path d="M16 21V26" {...stroke(color)} />
  </svg>
);
const IconRevenue = ({ color = colors.primary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32">
    <path d="M6 24L12 17L17 21L26 10" {...stroke(color)} />
    <path d="M21 10H26V15" {...stroke(color)} />
    <path d="M6 26H26" {...stroke(color)} />
  </svg>
);
const IconChat = ({ color = colors.primary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32">
    <path d="M6 8C6 6.9 6.9 6 8 6H24C25.1 6 26 6.9 26 8V19C26 20.1 25.1 21 24 21H12L7 25V8Z" {...stroke(color)} />
    <path d="M11 12H21" {...stroke(color)} />
    <path d="M11 16H17" {...stroke(color)} />
  </svg>
);
const IconClean = ({ color = colors.primary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32">
    <path d="M18 6L22 10" {...stroke(color)} />
    <path d="M20 8L11 17L8 24L15 21L24 12L20 8Z" {...stroke(color)} />
    <path d="M11 17L15 21" {...stroke(color)} />
  </svg>
);
const IconReviews = ({ color = colors.primary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32">
    <path d="M16 5L19.4 11.9L27 13L21.5 18.4L22.8 26L16 22.4L9.2 26L10.5 18.4L5 13L12.6 11.9L16 5Z" {...stroke(color)} />
  </svg>
);
const IconScale = ({ color = colors.primary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32">
    <rect x="5" y="5" width="8" height="8" rx="1.5" {...stroke(color)} />
    <rect x="19" y="5" width="8" height="8" rx="1.5" {...stroke(color)} />
    <rect x="12" y="19" width="8" height="8" rx="1.5" {...stroke(color)} />
    <path d="M9 13V16H23V13" {...stroke(color)} />
    <path d="M16 16V19" {...stroke(color)} />
  </svg>
);
const IconOwner = ({ color = colors.primary }) => (
  <svg width="40" height="40" viewBox="0 0 40 40">
    <path d="M8 20L20 9L32 20V32H8V20Z" {...stroke(color)} />
    <path d="M15 32V23H25V32" {...stroke(color)} />
  </svg>
);
const IconSubLease = ({ color = colors.secondary }) => (
  <svg width="40" height="40" viewBox="0 0 40 40">
    <path d="M10 18L20 10L30 18" {...stroke(color)} />
    <path d="M12 17V30H28V17" {...stroke(color)} />
    <path d="M17 30V22H23V30" {...stroke(color)} />
  </svg>
);
const IconPMS = ({ color = colors.primary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32">
    <rect x="6" y="6" width="9" height="9" rx="1.5" {...stroke(color)} />
    <rect x="17" y="6" width="9" height="9" rx="1.5" {...stroke(color)} />
    <rect x="6" y="17" width="9" height="9" rx="1.5" {...stroke(color)} />
    <rect x="17" y="17" width="9" height="9" rx="1.5" {...stroke(color)} />
  </svg>
);
const IconPricing = ({ color = colors.secondary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32">
    <path d="M16 6V26" {...stroke(color)} />
    <path d="M20 10C20 8 18 7 16 7C14 7 12 8 12 10C12 12 14 13 16 13C18 13 20 14 20 16C20 18 18 19 16 19C14 19 12 18 12 16" {...stroke(color)} />
  </svg>
);
const IconAccess = ({ color = colors.secondary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32">
    <rect x="8" y="14" width="16" height="12" rx="2" {...stroke(color)} />
    <path d="M11 14V11C11 8.2 13.2 6 16 6C18.8 6 21 8.2 21 11V14" {...stroke(color)} />
    <circle cx="16" cy="20" r="1.6" {...stroke(color)} />
  </svg>
);
const IconCheck = ({ color = colors.primary }) => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="8" {...stroke(color)} />
    <path d="M6.5 10L9 12.5L13.5 7.5" {...stroke(color)} />
  </svg>
);
const IconDownload = ({ color = colors.primary }) => (
  <svg width="28" height="28" viewBox="0 0 28 28">
    <path d="M14 5V17" {...stroke(color)} />
    <path d="M9 12L14 17L19 12" {...stroke(color)} />
    <path d="M6 21H22" {...stroke(color)} />
  </svg>
);

const serifHeading = "'Georgia', serif";

interface Tier { name: string; price: string; note: string; features: string[]; cta: string; paid?: boolean; featured?: boolean }

function PriceCard({ t, onGet, loading }: { t: Tier; onGet: () => void; loading?: boolean }) {
  return (
    <div style={{
      background: colors.bgMain,
      border: `1px solid ${t.featured ? colors.primary : colors.border}`,
      borderRadius: "22px",
      padding: "28px 24px",
      boxShadow: t.featured ? "0 16px 40px rgba(27,94,74,0.10)" : colors.shadowSm,
      display: "flex", flexDirection: "column", position: "relative",
    }}>
      {t.featured && (
        <span style={{
          position: "absolute", top: "-11px", left: "24px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "#fff", background: colors.primary, padding: "3px 10px", borderRadius: "999px",
        }}>Most popular</span>
      )}
      <h3 style={{ fontSize: "17px", fontWeight: 700, color: colors.textMain, marginBottom: "8px" }}>{t.name}</h3>
      <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "4px" }}>
        <span style={{ fontSize: "28px", fontWeight: 700, color: colors.primary, fontFamily: "'Georgia', serif" }}>{t.price}</span>
        <span style={{ fontSize: "12px", color: colors.textMuted }}>{t.note}</span>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 22px", flex: 1 }}>
        {t.features.map((f) => (
          <li key={f} style={{ display: "flex", gap: "9px", alignItems: "flex-start", marginBottom: "9px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}><circle cx="12" cy="12" r="9.5" stroke={colors.primary} strokeWidth="1.2" opacity="0.35" /><path d="M8 12.2l2.6 2.6L16 9.4" stroke={colors.primary} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.5 }}>{f}</span>
          </li>
        ))}
      </ul>
      <button onClick={onGet} disabled={loading}
        style={{
          width: "100%", padding: "12px", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: loading ? "wait" : "pointer",
          transition: "all 0.2s ease", opacity: loading ? 0.7 : 1,
          background: t.paid ? colors.primary : "transparent",
          color: t.paid ? "#fff" : colors.primary,
          border: t.paid ? "none" : `1.5px solid ${colors.primary}`,
          boxShadow: t.paid ? "0 8px 20px rgba(27,94,74,0.25)" : "none",
        }}>
        {loading ? "Redirecting…" : `${t.cta} →`}
      </button>
    </div>
  );
}

export default function SelfManagePage() {
  const router = useRouter();
  const handleAnalyzeClick = () => router.push("/estimator");
  const [checkingOut, setCheckingOut] = React.useState<string | null>(null);
  const isMobile = useIsMobile();

  async function handleCheckout(pkgName: string) {
    setCheckingOut(pkgName);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pkg: pkgName, origin: window.location.origin }),
      });
      const data = await res.json();
      if (data.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert("Payment unavailable right now. Please try again shortly.");
      }
    } catch {
      alert("Payment unavailable right now. Please try again shortly.");
    } finally {
      setCheckingOut(null);
    }
  }

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh" }}>
      {/* ─── HEADER ─── */}
      <header
        style={{
          background: colors.bgSection,
          borderBottom: `1px solid ${colors.border}`,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: isMobile ? "14px 20px" : "16px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: isMobile ? "space-between" : "flex-start",
            gap: isMobile ? "12px" : "60px",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "fit-content", cursor: "pointer" }}
            onClick={() => router.push("/")}
          >
            <GroundWorksLogo size={40} />
            <div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: colors.textMain }}>
                Ground<span style={{ color: colors.primary }}>Works</span>
              </div>
              <div style={{ fontSize: "10px", color: colors.textMuted, letterSpacing: "0.1em" }}>
                RENTAL INTELLIGENCE
              </div>
            </div>
          </div>
          {isMobile && (
            <a href="#pricing" style={{ padding: "9px 16px", background: colors.primary, color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>Pricing</a>
          )}
          <nav style={{ display: isMobile ? "none" : "flex", gap: "40px", flex: 1 }}>
            <a onClick={() => router.push("/")} style={{ cursor: "pointer", color: colors.textMuted, fontSize: "15px", fontWeight: "500" }}>Home</a>
            <a onClick={() => router.push("/#services")} style={{ cursor: "pointer", color: colors.textMuted, fontSize: "15px", fontWeight: "500" }}>Services</a>
            <a style={{ color: colors.primary, fontSize: "15px", fontWeight: "600" }}>Self-Manage</a>
            <a href="#pricing" style={{ cursor: "pointer", color: colors.textMuted, fontSize: "15px", fontWeight: "500" }}>Pricing</a>
            <a onClick={handleAnalyzeClick} style={{ cursor: "pointer", color: colors.textMuted, fontSize: "15px", fontWeight: "500" }}>Analyzer</a>
          </nav>
        </div>
      </header>

      {/* ─── 1. HERO ─── */}
      <section style={{ position: "relative", minHeight: isMobile ? "auto" : "560px", overflow: "hidden", background: colors.bgMain }}>
        <div style={{ position: "relative", width: isMobile ? "100%" : "52%", maxWidth: isMobile ? "100%" : "700px", zIndex: 3, padding: isMobile ? "48px 20px 40px" : "120px 40px 100px 40px" }}>
          <div style={{ fontSize: "12px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.1em", marginBottom: "16px" }}>
            SELF-MANAGEMENT HUB
          </div>
          <h1
            style={{
              fontSize: isMobile ? "32px" : "52px",
              fontFamily: serifHeading,
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: "24px",
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Learn How To Self-Manage Like A Professional Operator
          </h1>
          <p style={{ fontSize: "16px", color: colors.textMuted, lineHeight: 1.6, marginBottom: "32px" }}>
            Built for owners managing up to 8 units and STR entrepreneurs looking to maximize profitability through proven systems, automation, operational frameworks, and industry best practices.
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <a href="#blueprint" style={{ padding: "14px 28px", background: colors.primary, color: "#fff", borderRadius: "8px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}>
              Explore Self-Management
            </a>
            <a href="#sublease" style={{ padding: "14px 28px", background: "transparent", color: colors.primary, border: `2px solid ${colors.primary}`, borderRadius: "8px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}>
              Explore STR Sub-Leasing
            </a>
            <a href="#pricing" style={{ padding: "14px 28px", background: "transparent", color: colors.secondary, border: `2px solid ${colors.secondary}`, borderRadius: "8px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}>
              View Pricing
            </a>
          </div>
        </div>
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "55vw", zIndex: 1 }}>
          <img
            src="/locations/Downtown.png"
            alt="Dubai Property"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 15%, rgba(0,0,0,0.5) 32%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,1) 65%, rgba(0,0,0,1) 100%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 15%, rgba(0,0,0,0.5) 32%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,1) 65%, rgba(0,0,0,1) 100%)",
            }}
          />
        </div>
      </section>

      {/* ─── 2. CHOOSE YOUR PATH ─── */}
      <section style={{ padding: isMobile ? "52px 20px" : "80px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="GET STARTED" title="Choose Your Path" subtitle="Select the route that best matches your goals." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "28px" }}>
            <PathCard
              icon={<IconOwner color={colors.primary} />}
              title="Property Owners"
              description="For owners managing up to 8 units who want to reduce management fees, maintain control, and operate their short-term rentals professionally."
              items={["Guest communication", "Occupancy improvement", "Automation systems", "Pricing strategy", "Cleaning workflows", "Review management"]}
              cta="Explore Self-Management"
              accent={colors.primary}
              href="#blueprint"
            />
            <PathCard
              icon={<IconSubLease color={colors.secondary} />}
              title="STR Sub-Leasing"
              description="For entrepreneurs who want to build a short-term rental business without owning property by learning how to choose the safest and most profitable route."
              items={["Unit sourcing", "Landlord negotiations", "Profitability checks", "Risk assessment", "Compliance considerations", "Scaling strategy"]}
              cta="Explore STR Sub-Leasing"
              accent={colors.secondary}
              href="#sublease"
            />
          </div>
        </div>
      </section>

      {/* ─── 3. BLUEPRINT ─── */}
      <section id="blueprint" style={{ padding: isMobile ? "52px 20px" : "80px 40px", background: colors.bgSection, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="THE FRAMEWORK" title="The Self-Management Blueprint" subtitle="Everything required to successfully manage and scale your short-term rental operation." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "28px" }}>
            <FeatureCard icon={<IconTech color={colors.primary} />} title="Technology Stack" text="Build the right software foundation with PMS tools, channel managers, dynamic pricing, and automation systems." />
            <FeatureCard icon={<IconRevenue color={colors.secondary} />} title="Revenue Management" text="Increase revenue through dynamic pricing, occupancy optimization, seasonality planning, and revenue forecasting." />
            <FeatureCard icon={<IconChat color={colors.primary} />} title="Guest Communication" text="Deliver consistent guest experiences with automated messaging, guest journey mapping, templates, and support workflows." />
            <FeatureCard icon={<IconClean color={colors.secondary} />} title="Cleaning Operations" text="Create reliable turnover systems with cleaning SOPs, vendor management, inspections, and quality control." />
            <FeatureCard icon={<IconReviews color={colors.primary} />} title="Reviews & Reputation" text="Improve rankings and trust through guest satisfaction, review generation, issue resolution, and listing performance." />
            <FeatureCard icon={<IconScale color={colors.secondary} />} title="Scaling Systems" text="Grow from one unit to multiple properties using team workflows, reporting systems, SOPs, and automation." />
          </div>
        </div>
      </section>

      {/* ─── 5. SUB-LEASING PLAYBOOK ─── */}
      <section id="sublease" style={{ padding: isMobile ? "52px 20px" : "80px 40px", background: colors.bgSection, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="SUB-LEASING" title="The STR Sub-Leasing Playbook" subtitle="Learn how to evaluate opportunities, reduce risk, and build a profitable sub-leasing business." />

          {/* Before You Sign + Financial Analysis */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "28px", marginBottom: "48px" }}>
            {/* Checklist */}
            <div style={{ background: colors.bgMain, borderRadius: "12px", border: `1px solid ${colors.border}`, padding: "36px", boxShadow: colors.shadowSm }}>
              <h3 style={{ fontSize: "20px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "24px" }}>Before You Sign A Lease</h3>
              {[
                "Building permits STR activity",
                "Landlord approval obtained",
                "Service charges evaluated",
                "Competition analyzed",
                "Market demand verified",
                "Occupancy assumptions validated",
                "Revenue projections completed",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <IconCheck color={colors.primary} />
                  <span style={{ fontSize: "14px", color: colors.textMain }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Financial Analysis card */}
            <div style={{ background: colors.bgMain, borderRadius: "12px", border: `1px solid ${colors.border}`, padding: "36px", boxShadow: colors.shadowSm }}>
              <h3 style={{ fontSize: "20px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "24px" }}>Financial Analysis Example</h3>
              {[
                { label: "Monthly Rent", value: "AED 6,000", color: colors.textMain },
                { label: "Annual Rent", value: "AED 72,000", color: colors.textMain },
                { label: "Expected STR Revenue", value: "AED 130,000", color: colors.primary },
                { label: "Estimated Operating Expenses", value: "AED 35,000", color: colors.textMain },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${colors.border}` }}>
                  <span style={{ fontSize: "13px", color: colors.textMuted }}>{row.label}</span>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: row.color }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0 6px 0" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: colors.textMain }}>Projected Annual Profit</span>
                <span style={{ fontSize: "22px", fontWeight: 700, color: colors.secondary }}>AED 23,000</span>
              </div>
              {/* Profit breakdown bar */}
              <div style={{ marginTop: "20px" }}>
                <div style={{ display: "flex", height: "14px", borderRadius: "7px", overflow: "hidden", border: `1px solid ${colors.border}` }}>
                  <div style={{ width: "55%", background: colors.primary }} title="Rent" />
                  <div style={{ width: "27%", background: "#C9A56B" }} title="Expenses" />
                  <div style={{ width: "18%", background: colors.secondary }} title="Profit" />
                </div>
                <div style={{ display: "flex", gap: "20px", marginTop: "12px", flexWrap: "wrap" }}>
                  <Legend color={colors.primary} label="Rent" />
                  <Legend color="#C9A56B" label="Expenses" />
                  <Legend color={colors.secondary} label="Profit" />
                </div>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <h3 style={{ fontSize: "24px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "8px", textAlign: "center" }}>Risk Assessment Framework</h3>
          <p style={{ fontSize: "15px", color: colors.textMuted, textAlign: "center", marginBottom: "36px" }}>Evaluate every opportunity before committing.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "28px" }}>
            <RiskCard level="Low Risk" color={colors.primary} text="Established STR communities with strong tourism demand and proven performance." />
            <RiskCard level="Medium Risk" color={colors.secondary} text="Emerging opportunities requiring additional due diligence." />
            <RiskCard level="High Risk" color="#A14B3D" text="Markets with uncertain demand, restrictive policies, or weak profitability." />
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" style={{ padding: isMobile ? "52px 20px" : "80px 40px", background: colors.bgSection, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px", maxWidth: "640px", marginLeft: "auto", marginRight: "auto" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: colors.secondary, marginBottom: "12px" }}>Pricing</p>
            <h2 style={{
              fontFamily: "'Georgia', serif", fontSize: "36px", lineHeight: 1.15, fontWeight: 700, marginBottom: "14px",
              background: `linear-gradient(135deg, ${colors.primary} 0%, #6B7A45 55%, ${colors.secondary} 100%)`,
              WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Self-Manage & Operations Help</h2>
            <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.6 }}>
              One-time fees. Whether you want to run it yourself or have us launch it for you — choose the level of support that fits.
            </p>
          </div>

          {/* Self-Manage tiers */}
          <p style={{ fontSize: "13px", fontWeight: 700, color: colors.textMain, marginBottom: "16px", letterSpacing: "0.02em" }}>Self-Manage Your Property</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "44px" }}>
            {[
              { name: "Free Playbook", price: "Free", note: "Guides, tools & checklists", features: ["Self-management blueprint", "Recommended tools & systems", "Sub-leasing playbook"], cta: "Explore Resources", paid: false },
              { name: "Setup Session", price: "AED 1,500", note: "one-time", features: ["1:1 onboarding call", "PMS + dynamic pricing setup", "OTA listing optimization", "DET licensing guidance"], cta: "Get Started", paid: true, featured: true },
              { name: "Launch + Coaching", price: "AED 2,900", note: "one-time", features: ["Everything in Setup Session", "60-day coaching", "Listing review", "Pricing & revenue check-in"], cta: "Get Started", paid: true },
            ].map((t) => (
              <PriceCard key={t.name} t={t}
                loading={checkingOut === `Self-Manage — ${t.name}`}
                onGet={() => t.paid ? handleCheckout(`Self-Manage — ${t.name}`) : router.push("#blueprint")} />
            ))}
          </div>

          {/* Operations Help tiers */}
          <p style={{ fontSize: "13px", fontWeight: 700, color: colors.textMain, marginBottom: "16px", letterSpacing: "0.02em" }}>Operations Help — Done-For-You Setup</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
            {[
              { name: "Essentials Launch", price: "AED 3,500", note: "one-time", features: ["DET / DTCM permit assistance", "Multi-OTA listing creation", "Dynamic pricing + channel manager setup", "Guest-comms templates"], cta: "Get Started", paid: true },
              { name: "Premium Launch", price: "AED 5,500", note: "one-time", features: ["Everything in Essentials", "Professional photography", "Listing copywriting", "Smart-lock / access setup guidance", "30-day post-launch support"], cta: "Get Started", paid: true, featured: true },
            ].map((t) => (
              <PriceCard key={t.name} t={t}
                loading={checkingOut === `Operations Help — ${t.name}`}
                onGet={() => handleCheckout(`Operations Help — ${t.name}`)} />
            ))}
          </div>

          <p style={{ fontSize: "12px", color: colors.textMuted, textAlign: "center", marginTop: "28px" }}>
            All prices in AED, one-time. Ongoing day-to-day management is handled by our vetted operator partners.
          </p>
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

// ─── Reusable Components ────────────────────────────────────────────────────
function SectionHeading({ label, title, subtitle }: { label: string; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: "48px", textAlign: "center" }}>
      <div style={{ fontSize: "12px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.1em", marginBottom: "12px" }}>{label}</div>
      <h2
        style={{
          fontSize: "40px",
          fontFamily: serifHeading,
          fontWeight: 700,
          marginBottom: "14px",
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {title}
      </h2>
      <p style={{ fontSize: "16px", color: colors.textMuted, lineHeight: 1.6, maxWidth: "620px", margin: "0 auto" }}>{subtitle}</p>
    </div>
  );
}

function PathCard({ icon, title, description, items, cta, accent, href }: { icon: React.ReactNode; title: string; description: string; items: string[]; cta: string; accent: string; href: string }) {
  return (
    <div
      style={{ background: colors.bgSection, borderRadius: "16px", border: `1px solid ${colors.border}`, padding: "40px", boxShadow: colors.shadowSm, display: "flex", flexDirection: "column", transition: "all 0.3s ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = colors.shadowMd; e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = colors.shadowSm; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ marginBottom: "20px" }}>{icon}</div>
      <h3 style={{ fontSize: "24px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "12px" }}>{title}</h3>
      <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.6, marginBottom: "24px" }}>{description}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px", marginBottom: "32px", flex: 1 }}>
        {items.map((item) => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: accent, flexShrink: 0 }} />
            <span style={{ fontSize: "13px", color: colors.textMain }}>{item}</span>
          </div>
        ))}
      </div>
      <a href={href} style={{ padding: "13px 24px", background: accent, color: "#fff", borderRadius: "8px", fontSize: "14px", fontWeight: 600, textDecoration: "none", textAlign: "center", alignSelf: "flex-start" }}>
        {cta}
      </a>
    </div>
  );
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div
      style={{ background: colors.bgMain, borderRadius: "12px", border: `1px solid ${colors.border}`, padding: "32px", boxShadow: colors.shadowSm, transition: "all 0.3s ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = colors.shadowMd; e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = colors.shadowSm; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ marginBottom: "20px" }}>{icon}</div>
      <h3 style={{ fontSize: "18px", fontWeight: 600, color: colors.textMain, marginBottom: "12px" }}>{title}</h3>
      <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}

function ToolCard({ icon, title, tools }: { icon: React.ReactNode; title: string; tools: string[] }) {
  return (
    <div style={{ background: colors.bgSection, borderRadius: "12px", border: `1px solid ${colors.border}`, padding: "32px", boxShadow: colors.shadowSm }}>
      <div style={{ marginBottom: "20px" }}>{icon}</div>
      <h3 style={{ fontSize: "16px", fontWeight: 600, color: colors.textMain, marginBottom: "16px" }}>{title}</h3>
      {tools.map((t) => (
        <div key={t} style={{ fontSize: "14px", color: colors.textMuted, padding: "6px 0", borderTop: `1px solid ${colors.border}` }}>{t}</div>
      ))}
    </div>
  );
}

function RiskCard({ level, color, text }: { level: string; color: string; text: string }) {
  return (
    <div style={{ background: colors.bgMain, borderRadius: "12px", border: `1px solid ${colors.border}`, borderTop: `4px solid ${color}`, padding: "32px", boxShadow: colors.shadowSm }}>
      <div style={{ fontSize: "18px", fontWeight: 700, color, marginBottom: "12px" }}>{level}</div>
      <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}

function ResourceCard({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ background: colors.bgSection, borderRadius: "12px", border: `1px solid ${colors.border}`, padding: "32px", boxShadow: colors.shadowSm, display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: "20px" }}><IconDownload color={colors.primary} /></div>
      <h3 style={{ fontSize: "16px", fontWeight: 600, color: colors.textMain, marginBottom: "10px" }}>{title}</h3>
      <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6, marginBottom: "24px", flex: 1 }}>{text}</p>
      <button style={{ padding: "10px 20px", background: "transparent", color: colors.primary, border: `1.5px solid ${colors.primary}`, borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", alignSelf: "flex-start" }}>
        Download
      </button>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: color }} />
      <span style={{ fontSize: "12px", color: colors.textMuted }}>{label}</span>
    </div>
  );
}
