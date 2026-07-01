"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/lib/useIsMobile";
import { STATS } from "@/data/dubai-2026-handovers";
import SiteNav from "@/components/SiteNav";

const colors = {
  primary: "#1B5E4A",      // Forest green
  secondary: "#B88A44",    // Bronze/muted gold
  bgMain: "#F8F4EE",       // Warm off-white/cream
  bgSection: "#FDFBF7",    // White for cards
  textMain: "#1A1A1A",     // Deep black
  textMuted: "#6B6B6B",    // Muted gray
  border: "#E6E1D8",       // Soft border
  shadowSm: "0 1px 2px rgba(0, 0, 0, 0.05)",
  shadowMd: "0 4px 6px rgba(0, 0, 0, 0.1)",
  shadowLg: "0 20px 25px rgba(0, 0, 0, 0.15)",
};

// Premium SVG Icons
const IconHouse = ({ color = colors.primary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 16L16 4L28 16V28H4V16Z" stroke={color} strokeWidth="1.2" />
    <path d="M10 28V18H22V28" stroke={color} strokeWidth="1.2" />
  </svg>
);

const IconArrows = ({ color = colors.secondary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 12L14 18L8 24" stroke={color} strokeWidth="1.2" />
    <path d="M24 24L18 18L24 12" stroke={color} strokeWidth="1.2" />
  </svg>
);

const IconAnalytics = ({ color = colors.primary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 24H26" stroke={color} strokeWidth="1.2" />
    <path d="M10 24V14" stroke={color} strokeWidth="1.2" />
    <path d="M16 24V8" stroke={color} strokeWidth="1.2" />
    <path d="M22 24V16" stroke={color} strokeWidth="1.2" />
  </svg>
);

const IconUsers = ({ color = colors.secondary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 13C12.657 13 14 11.657 14 10C14 8.343 12.657 7 11 7C9.343 7 8 8.343 8 10C8 11.657 9.343 13 11 13Z" stroke={color} strokeWidth="1.2" />
    <path d="M21 13C22.657 13 24 11.657 24 10C24 8.343 22.657 7 21 7C19.343 7 18 8.343 18 10C18 11.657 19.343 13 21 13Z" stroke={color} strokeWidth="1.2" />
    <path d="M6 26C6 22.582 8.686 20 11 20C13.314 20 16 22.582 16 26" stroke={color} strokeWidth="1.2" />
    <path d="M16 26C16 22.582 18.686 20 21 20C23.314 20 26 22.582 26 26" stroke={color} strokeWidth="1.2" />
  </svg>
);

const IconCalculator = ({ color = colors.primary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="6" width="20" height="24" rx="1.5" stroke={color} strokeWidth="1.2" />
    <path d="M6 16H26" stroke={color} strokeWidth="1.2" />
    <path d="M12 26H20" stroke={color} strokeWidth="1.2" />
    <circle cx="10" cy="10" r="1.2" stroke={color} strokeWidth="1.2" />
    <circle cx="18" cy="10" r="1.2" stroke={color} strokeWidth="1.2" />
    <circle cx="26" cy="10" r="1.2" stroke={color} strokeWidth="1.2" />
  </svg>
);

const IconDocument = ({ color = colors.secondary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 6H20L26 12V28C26 28.796 25.469 29.5 24.75 29.5H8C7.281 29.5 6.75 28.796 6.75 28V8C6.75 7.204 7.281 6.5 8 6.5Z" stroke={color} strokeWidth="1.2" />
    <path d="M20 6V12H26" stroke={color} strokeWidth="1.2" />
    <path d="M11 18H21" stroke={color} strokeWidth="1.2" />
    <path d="M11 23H21" stroke={color} strokeWidth="1.2" />
  </svg>
);

const IconChart = ({ color = colors.primary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 26H26" stroke={color} strokeWidth="1.2" />
    <rect x="8" y="16" width="4" height="10" rx="0.8" stroke={color} strokeWidth="1.2" />
    <rect x="14" y="10" width="4" height="16" rx="0.8" stroke={color} strokeWidth="1.2" />
    <rect x="20" y="12" width="4" height="14" rx="0.8" stroke={color} strokeWidth="1.2" />
  </svg>
);

const IconLocation = ({ color = colors.secondary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 6C12.134 6 9 9.134 9 13C9 18.5 16 27 16 27C16 27 23 18.5 23 13C23 9.134 19.866 6 16 6Z" stroke={color} strokeWidth="1.2" />
    <circle cx="16" cy="13" r="2" stroke={color} strokeWidth="1.2" />
  </svg>
);

const IconTools = ({ color = colors.secondary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18.5 11.5L21 9C21.5 9.2 22 9.3 22.5 9.3C24.7 9.3 26.5 7.5 26.5 5.3C26.5 4.7 26.4 4.1 26.1 3.6L23.5 6.2L21 5.5L20.3 3L22.9 0.4C22.4 0.1 21.8 0 21.2 0C19 0 17.2 1.8 17.2 4C17.2 4.5 17.3 5 17.5 5.5L6 17C5.5 16.8 5 16.7 4.5 16.7C2.3 16.7 0.5 18.5 0.5 20.7C0.5 21.3 0.6 21.9 0.9 22.4L3.5 19.8L6 20.5L6.7 23L4.1 25.6C4.6 25.9 5.2 26 5.8 26C8 26 9.8 24.2 9.8 22C9.8 21.5 9.7 21 9.5 20.5L18.5 11.5Z" stroke={color} strokeWidth="1.2" transform="translate(2.5 3)" />
  </svg>
);

const IconWorkflow = ({ color = colors.primary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="5" width="8" height="8" rx="1.5" stroke={color} strokeWidth="1.2" />
    <rect x="19" y="5" width="8" height="8" rx="1.5" stroke={color} strokeWidth="1.2" />
    <rect x="12" y="19" width="8" height="8" rx="1.5" stroke={color} strokeWidth="1.2" />
    <path d="M9 13V16H23V13" stroke={color} strokeWidth="1.2" />
    <path d="M16 16V19" stroke={color} strokeWidth="1.2" />
  </svg>
);

const IconGrowth = ({ color = colors.secondary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 24H26" stroke={color} strokeWidth="1.2" />
    <path d="M6 24L12 17L17 21L26 10" stroke={color} strokeWidth="1.2" />
    <path d="M21 10H26V15" stroke={color} strokeWidth="1.2" />
  </svg>
);

export default function HomePage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [showOpsModal, setShowOpsModal] = useState(false);
  const [opsForm, setOpsForm] = useState({
    name: "", email: "", phone: "", company: "",
    portfolioSize: "", serviceNeeded: "", stage: "", message: "",
  });
  const [opsSubmitted, setOpsSubmitted] = useState(false);
  const [opsSubmitting, setOpsSubmitting] = useState(false);

  const handleAnalyzeClick = () => {
    router.push("/estimator");
  };

  const handleSelfManageClick = () => {
    router.push("/self-manage");
  };

  const handleOpsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpsSubmitting(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...opsForm, source: "Operational Setup Enquiry" }),
      });
    } catch {}
    setOpsSubmitting(false);
    setOpsSubmitted(true);
  };

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh" }}>
      <SiteNav active="home" />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* HERO SECTION - SIMPLIFIED STRUCTURE */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <section
        id="home"
        style={{
          position: "relative",
          minHeight: isMobile ? "auto" : "760px",
          background: `radial-gradient(ellipse 700px 500px at 15% 40%, rgba(27,94,74,0.06) 0%, transparent 65%), radial-gradient(ellipse 600px 400px at 80% 10%, rgba(184,138,68,0.07) 0%, transparent 60%), #F8F4EE`,
          overflow: "hidden",
        }}
      >
        {/* Left content container */}
        <div
          style={{
            position: "relative",
            width: isMobile ? "100%" : "50%",
            maxWidth: isMobile ? "100%" : "680px",
            zIndex: 3,
            padding: isMobile ? "48px 20px 56px 20px" : "155px 40px 100px 40px",
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <div style={{ width: "100%" }}>
            {/* Main headline with gradient */}
            <h1
              style={{
                fontSize: isMobile ? "34px" : "56px",
                fontFamily: "'Georgia', serif",
                fontWeight: "700",
                lineHeight: "1.2",
                marginBottom: "24px",
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Data-Driven Rental Insights for Smarter Property Decisions
            </h1>

            {/* Subheading */}
            <p
              style={{
                fontSize: "16px",
                color: colors.textMuted,
                lineHeight: "1.6",
                marginBottom: "32px",
              }}
            >
              Compare short-term and long-term rental performance, explore Dubai market insights, and make confident decisions before renting or investing.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: "14px", flexDirection: isMobile ? "column" : "row", marginBottom: "32px" }}>
              <button
                onClick={handleAnalyzeClick}
                style={{
                  padding: "15px 30px",
                  background: `linear-gradient(135deg, ${colors.primary} 0%, #0F3E33 100%)`,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(27,94,74,0.28)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(27,94,74,0.36)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(27,94,74,0.28)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Find My Best Rental Strategy →
              </button>
              <button
                onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
                style={{
                  padding: "15px 26px",
                  background: "transparent",
                  color: colors.primary,
                  border: `1.5px solid rgba(27,94,74,0.35)`,
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `rgba(27,94,74,0.06)`;
                  e.currentTarget.style.borderColor = `rgba(27,94,74,0.6)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = `rgba(27,94,74,0.35)`;
                }}
              >
                Explore Advisory Services
              </button>
            </div>

            {/* Hero trust chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {[
                "Dubai property intelligence",
                "STR vs LTR strategy",
                "Operator & setup advisory",
                "2026 handover insights",
              ].map(label => (
                <span key={label} style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  padding: "5px 12px",
                  background: "rgba(27,94,74,0.07)",
                  border: "1px solid rgba(27,94,74,0.18)",
                  borderRadius: "20px",
                  fontSize: "12px", fontWeight: 600, color: colors.primary,
                }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6.2L4.5 8.5L10 3.5" stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right image container - actual img element (hidden on mobile) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "58vw",
            zIndex: 1,
            display: isMobile ? "none" : "block",
          }}
        >
          <img
            src="/Locations/Marina.png"
            alt="Dubai Marina Skyline"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              // Wider, softer left-edge fade for a more blended, faded look.
              maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 15%, rgba(0,0,0,0.5) 32%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,1) 65%, rgba(0,0,0,1) 100%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 15%, rgba(0,0,0,0.5) 32%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,1) 65%, rgba(0,0,0,1) 100%)",
            }}
          />
        </div>

      </section>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* TRUST BAR */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <section style={{ padding: isMobile ? "32px 20px" : "48px 40px", background: "#F5F2EC" }}>
        <style>{`
          .gw-trust-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
          }
          .gw-trust-item { position: relative; }
          .gw-trust-item:not(:last-child)::after {
            content: "";
            position: absolute;
            top: 14%;
            right: 0;
            height: 72%;
            width: 1px;
            background: ${colors.border};
          }
          @media (max-width: 900px) {
            .gw-trust-grid { grid-template-columns: repeat(2, 1fr); row-gap: 36px; }
            .gw-trust-item:nth-child(2)::after { display: none; }
            .gw-trust-item:nth-child(odd)::after { display: block; }
          }
          @media (max-width: 560px) {
            .gw-trust-grid { grid-template-columns: 1fr; row-gap: 32px; }
            .gw-trust-item::after { display: none !important; }
          }
        `}</style>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div
            className="gw-trust-grid"
            style={{
              background: colors.bgMain,
              borderRadius: "22px",
              padding: "36px 28px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              border: `1px solid #E7DFD2`,
            }}
          >
            {[
              { icon: <IconHouse color={colors.primary} />, accent: colors.primary, label: "Properties Analyzed", value: "500+", desc: "Data-backed insights" },
              { icon: <IconArrows color={colors.secondary} />, accent: colors.secondary, label: "STR vs LTR Comparison", value: "1000+", desc: "Strategies evaluated" },
              { icon: <IconAnalytics color={colors.primary} />, accent: colors.primary, label: "Dubai Market Insights", value: "Real-Time", desc: "DLD, Bayut & more" },
              { icon: <IconUsers color={colors.secondary} />, accent: colors.secondary, label: "Operator Recommendations", value: "Curated", desc: "Top-performing partners" },
            ].map((item) => (
              <div
                key={item.label}
                className="gw-trust-item"
                style={{ display: "flex", alignItems: "center", gap: "16px", padding: "4px 28px" }}
              >
                {/* Icon badge */}
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: `${item.accent}14`,
                    border: `1px solid ${item.accent}26`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </div>
                {/* Text stack */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "12.5px", color: colors.textMuted, fontWeight: 600, marginBottom: "4px", letterSpacing: "0.01em" }}>
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: 800,
                      lineHeight: 1.1,
                      marginBottom: "4px",
                      fontFamily: "'Georgia', serif",
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${item.accent} 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {item.value}
                  </div>
                  <div style={{ fontSize: "12.5px", color: colors.textMuted }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* SERVICES SECTION */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <section id="services" style={{ padding: isMobile ? "60px 20px" : "96px 40px", background: "#F8F4EE" }}>
        <style>{`
          .svc-card {
            background: #FDFBF8;
            border-radius: 22px;
            border: 1px solid #E8E0D0;
            box-shadow: 0 2px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.04);
            padding: 40px 34px 36px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
            cursor: default;
          }
          .svc-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 16px 40px rgba(0,0,0,0.09), 0 4px 12px rgba(0,0,0,0.06);
            border-color: #C9A86C;
          }
          .svc-icon-badge {
            width: 82px;
            height: 82px;
            border-radius: 50%;
            background: #F5F0E8;
            border: 1.5px solid #C9A86C;
            box-shadow: 0 2px 12px rgba(184,138,68,0.13);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            flex-shrink: 0;
          }
          .svc-divider {
            display: flex;
            align-items: center;
            width: 100%;
            margin-bottom: 18px;
          }
          .svc-divider-line {
            flex: 1;
            height: 1px;
            background: linear-gradient(to right, transparent, #C9A86C, transparent);
          }
          .svc-divider-diamond {
            width: 6px;
            height: 6px;
            background: #C9A86C;
            transform: rotate(45deg);
            margin: 0 8px;
            flex-shrink: 0;
          }
          .svc-title {
            font-family: 'Georgia', serif;
            font-size: 19px;
            font-weight: 700;
            color: #1B5E4A;
            margin-bottom: 14px;
            line-height: 1.3;
          }
          .svc-body {
            font-size: 13.5px;
            color: #6B6B6B;
            line-height: 1.7;
            margin-bottom: 14px;
            text-align: center;
          }
          .svc-label {
            font-size: 12.5px;
            font-weight: 700;
            color: #1A1A1A;
            margin-bottom: 8px;
            text-align: center;
          }
          .svc-list {
            list-style: none;
            margin: 0 0 14px 0;
            padding: 0;
            text-align: center;
          }
          .svc-list li {
            font-size: 13px;
            color: #6B6B6B;
            line-height: 1.8;
            position: relative;
            padding-left: 0;
          }
          .svc-list li::before {
            content: '';
            display: inline-block;
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #B88A44;
            margin-right: 8px;
            vertical-align: middle;
            position: relative;
            top: -1px;
          }
          .svc-pricing {
            font-size: 13px;
            font-weight: 700;
            color: #1B5E4A;
            margin-bottom: 20px;
          }
          .svc-btn-green, .svc-btn-bronze {
            width: 100%;
            min-height: 56px;
            padding: 0 20px;
            border-radius: 11px;
            border: none;
            color: #FFFFFF;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            letter-spacing: 0.01em;
            transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
            margin-top: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            white-space: nowrap;
            flex-shrink: 0;
          }
          .svc-btn-green {
            background: linear-gradient(135deg, #1B5E4A 0%, #0F3E33 100%);
            box-shadow: 0 2px 8px rgba(27,94,74,0.25);
          }
          .svc-btn-green:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(27,94,74,0.32);
            background: linear-gradient(135deg, #0F3E33 0%, #0A2922 100%);
          }
          .svc-btn-bronze {
            background: linear-gradient(135deg, #B88A44 0%, #8B6F3F 100%);
            box-shadow: 0 2px 8px rgba(184,138,68,0.28);
          }
          .svc-btn-bronze:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(184,138,68,0.38);
            background: linear-gradient(135deg, #8B6F3F 0%, #6B5230 100%);
          }
          .svc-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 26px;
            align-items: stretch;
          }
          @media (max-width: 1100px) {
            .svc-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 640px) {
            .svc-grid { grid-template-columns: 1fr; }
            .svc-card { padding: 32px 24px 28px; }
          }
        `}</style>

        <div style={{ maxWidth: "1360px", margin: "0 auto" }}>
          {/* Section header */}
          <div style={{ marginBottom: "64px", textAlign: isMobile ? "center" : "left" }}>
            <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "14px" }}>
              OUR SERVICES
            </div>
            <h2
              style={{
                fontSize: isMobile ? "32px" : "44px",
                fontFamily: "'Georgia', serif",
                fontWeight: "700",
                marginBottom: "16px",
                lineHeight: 1.2,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Everything You Need for Smarter Rental Decisions
            </h2>
            <p style={{ fontSize: "16px", color: colors.textMuted, lineHeight: "1.65", maxWidth: "620px" }}>
              Powerful tools and expert insights to help you compare, analyze, and maximize your property's rental potential in Dubai.
            </p>
          </div>

          {/* Service cards grid — 4 cards */}
          <div className="svc-grid">

            {/* Card 1 — Rental Strategy Analyzer */}
            <div className="svc-card">
              <div className="svc-icon-badge">
                <IconCalculator color={colors.primary} />
              </div>
              <div className="svc-divider">
                <div className="svc-divider-line" />
                <div className="svc-divider-diamond" />
                <div className="svc-divider-line" />
              </div>
              <h3 className="svc-title">Rental Strategy Analyzer</h3>
              <div style={{ flex: 1, width: "100%" }}>
                <p className="svc-body">
                  For property owners and agents. Compare short-term and long-term rental performance and identify the most profitable strategy using real DLD data, yield analysis, and STR projections.
                </p>
                <div className="svc-label">Built for:</div>
                <ul className="svc-list">
                  <li>Property owners</li>
                  <li>Real estate agents</li>
                  <li>Investors & buyers</li>
                </ul>
              </div>
              <button className="svc-btn-green" onClick={handleAnalyzeClick}>
                Analyze My Property →
              </button>
            </div>

            {/* Card 2 — Self-Manage */}
            <div className="svc-card">
              <div className="svc-icon-badge">
                <IconTools color={colors.secondary} />
              </div>
              <div className="svc-divider">
                <div className="svc-divider-line" />
                <div className="svc-divider-diamond" />
                <div className="svc-divider-line" />
              </div>
              <h3 className="svc-title">Self-Manage Your Property</h3>
              <div style={{ flex: 1, width: "100%" }}>
                <p className="svc-body">
                  Run your own short-term rentals without paying a management company. We provide the playbook, tools, and setup support — whether you own a single unit or a growing portfolio.
                </p>
                <div className="svc-label">Two tracks available:</div>
                <ul className="svc-list">
                  <li>Up to 8 units — owner playbook</li>
                  <li>8+ units — portfolio systems & automation</li>
                </ul>
                <div className="svc-pricing">Free guides · setup from AED 1,500</div>
              </div>
              <button className="svc-btn-bronze" onClick={() => router.push("/self-manage/owners")}>
                View Self-Manage Playbook →
              </button>
            </div>

            {/* Card 3 — STR Sub-Leasing */}
            <div className="svc-card">
              <div className="svc-icon-badge">
                <IconGrowth color={colors.primary} />
              </div>
              <div className="svc-divider">
                <div className="svc-divider-line" />
                <div className="svc-divider-diamond" />
                <div className="svc-divider-line" />
              </div>
              <h3 className="svc-title">STR Sub-Leasing</h3>
              <div style={{ flex: 1, width: "100%" }}>
                <p className="svc-body">
                  For entrepreneurs leasing properties from landlords and operating them as short-term rentals. We model the risk, identify the right buildings, and give you the framework to sub-lease profitably and legally.
                </p>
                <div className="svc-label">What's included:</div>
                <ul className="svc-list">
                  <li>Break-even & risk modelling</li>
                  <li>Building & area selection</li>
                  <li>Landlord negotiation framework</li>
                </ul>
                <div className="svc-pricing">Free risk estimator · guidance from AED 1,500</div>
              </div>
              <button className="svc-btn-bronze" onClick={() => router.push("/self-manage/str-subleasing")}>
                View Sub-Leasing Guide →
              </button>
            </div>

            {/* Card 4 — Operational Setup */}
            <div className="svc-card">
              <div className="svc-icon-badge">
                <IconWorkflow color={colors.secondary} />
              </div>
              <div className="svc-divider">
                <div className="svc-divider-line" />
                <div className="svc-divider-diamond" />
                <div className="svc-divider-line" />
              </div>
              <h3 className="svc-title">Operational Setup</h3>
              <div style={{ flex: 1, width: "100%" }}>
                <p className="svc-body">
                  For small and mid-sized operators looking to streamline and scale their short-term rental operations using proven strategies, operational frameworks, automation tools, and best practices.
                </p>
                <div className="svc-label">Built for:</div>
                <ul className="svc-list">
                  <li>Holiday home operators</li>
                  <li>Boutique operators</li>
                  <li>Property managers</li>
                </ul>
                <div className="svc-pricing">Pricing discussed after reviewing your setup requirements</div>
              </div>
              <button className="svc-btn-green" onClick={() => setShowOpsModal(true)}>
                Contact Us →
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* 2026 HANDOVER INTELLIGENCE TEASER */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <section style={{ padding: isMobile ? "60px 20px" : "88px 40px", background: "#F5F2EC" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          {/* Eyebrow */}
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: colors.secondary, marginBottom: "14px", textAlign: "center" }}>
            2026 Handover Intelligence
          </p>

          {/* Headline */}
          <h2 style={{
            fontFamily: "'Georgia', serif",
            fontSize: isMobile ? "26px" : "38px",
            fontWeight: 700, lineHeight: 1.2,
            background: `linear-gradient(135deg, ${colors.primary} 0%, #4A8A6A 45%, ${colors.secondary} 100%)`,
            WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
            textAlign: "center", marginBottom: "14px",
          }}>
            Properties Handing Over in 2026 —{isMobile ? " " : <br />}
            Should You STR or LTR?
          </h2>

          <p style={{ fontSize: isMobile ? "14px" : "15px", color: "#666", lineHeight: 1.7, textAlign: "center", maxWidth: "560px", margin: "0 auto 36px" }}>
            AssetIntel tracks upcoming Dubai handovers and helps owners understand whether short-term rental, long-term rental, self-management, or operator management may be the stronger route.
          </p>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "16px", marginBottom: "36px" }}>
            {[
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
                value: `${STATS.total}+`,
                label: "2026 handover projects tracked",
                sub: "Across Dubai's key growth areas",
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>,
                value: "STR / LTR",
                label: "Strategy screening for each project",
                sub: "Based on area, tier, and demand profile",
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
                value: "Free",
                label: "Operator & setup guidance available",
                sub: "Request a handover strategy review",
              },
            ].map(card => (
              <div key={card.label} style={{
                background: "#FFFFFF",
                border: "1px solid #E0DDD8",
                borderRadius: "20px",
                padding: "24px 22px",
                boxShadow: "0 2px 8px rgba(27,94,74,0.05)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EEF5F1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {card.icon}
                </div>
                <p style={{ fontSize: "22px", fontWeight: 700, color: colors.primary }}>{card.value}</p>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#1A1A1A", marginBottom: "3px" }}>{card.label}</p>
                  <p style={{ fontSize: "12px", color: "#888" }}>{card.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => router.push("/investment-research/2026-handovers")}
              style={{
                padding: "13px 28px", borderRadius: "999px",
                background: `linear-gradient(135deg, ${colors.primary} 0%, #2D7A5E 100%)`,
                color: "#FFF", fontSize: "14px", fontWeight: 700,
                border: "none", cursor: "pointer",
                boxShadow: "0 8px 20px rgba(27,94,74,0.25)",
              }}
            >
              Explore 2026 Handovers
            </button>
            <button
              onClick={() => router.push("/estimator")}
              style={{
                padding: "13px 28px", borderRadius: "999px",
                background: "transparent",
                border: `1.5px solid rgba(27,94,74,0.3)`,
                color: colors.primary, fontSize: "14px", fontWeight: 700, cursor: "pointer",
              }}
            >
              Analyze My Property
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* WHY ASSETINTEL — TRUST / DIFFERENTIATION */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <section style={{ padding: isMobile ? "64px 20px" : "96px 40px", background: colors.bgSection }}>
        <style>{`
          .why-card {
            background: #FDFBF8;
            border: 1px solid #E8E0D0;
            border-radius: 22px;
            padding: 32px 28px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.04);
            display: flex;
            flex-direction: column;
            transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          }
          .why-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 14px 36px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.05);
            border-color: #C9A86C;
          }
          .why-icon-badge {
            width: 52px;
            height: 52px;
            border-radius: 14px;
            background: #F5F0E8;
            border: 1px solid #DDD0B8;
            box-shadow: 0 2px 8px rgba(184,138,68,0.10);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 18px;
            flex-shrink: 0;
          }
          .why-card-divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #D4BFA0, transparent);
            margin-bottom: 16px;
            width: 100%;
          }
          .why-card-title {
            font-family: 'Georgia', serif;
            font-size: 17px;
            font-weight: 700;
            color: #1B1B1B;
            margin-bottom: 10px;
            line-height: 1.3;
          }
          .why-card-body {
            font-size: 13.5px;
            color: #6B6B6B;
            line-height: 1.7;
          }
          .why-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 22px;
            margin-bottom: 52px;
            align-items: stretch;
          }
          .cmp-row {
            display: flex;
            gap: 10px;
            align-items: flex-start;
            padding: 11px 0;
            border-bottom: 1px solid rgba(0,0,0,0.055);
          }
          .cmp-row:last-child { border-bottom: none; }
          @media (max-width: 1100px) {
            .why-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 640px) {
            .why-grid { grid-template-columns: 1fr; }
            .why-card { padding: 26px 22px; }
          }
        `}</style>

        <div style={{ maxWidth: "1360px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "56px", maxWidth: "780px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.secondary, marginBottom: "16px" }}>
              Why AssetIntel
            </p>
            <h2 style={{
              fontFamily: "'Georgia', serif",
              fontSize: isMobile ? "30px" : "40px",
              lineHeight: 1.18,
              fontWeight: 700,
              marginBottom: "20px",
              background: `linear-gradient(135deg, ${colors.primary} 0%, #6B7A45 55%, ${colors.secondary} 100%)`,
              WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Real data and real connections — not a generic guess
            </h2>
            <p style={{ fontSize: "15.5px", color: colors.textMuted, lineHeight: 1.75, maxWidth: "680px" }}>
              Anyone can ask an AI &ldquo;what could my Dubai apartment earn?&rdquo; and get a confident-sounding number. AssetIntel gives you something an AI can&rsquo;t: figures grounded in millions of real registered contracts, a model tuned to how Dubai short-term rentals actually perform, and a direct line to vetted operators and leasing agents.
            </p>
          </div>

          {/* Differentiator cards */}
          <div className="why-grid">
            {[
              {
                title: "Grounded in real DLD data",
                body: "Built on 10M+ actual Dubai Land Department rent contracts — building-level, newest lets first. Every figure is real and traceable, not estimated.",
                icon: <path d="M4 19V5M4 19h16M8 16V9M12 16V6M16 16v-4M20 16v-8" stroke={colors.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
                accent: colors.primary,
              },
              {
                title: "STR-native modeling",
                body: "Occupancy, seasonality, fees, and prime-area demand calibrated to how Dubai short-term rentals truly perform — the part generic tools and AI miss entirely.",
                icon: <path d="M4 14l4-4 4 3 6-7M14 6h4v4" stroke={colors.secondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
                accent: colors.secondary,
              },
              {
                title: "Operator & agent network",
                body: "We don't just give an answer — we match you to vetted holiday-home operators and leasing agents, and make the introduction. A network, not a chatbot.",
                icon: <><circle cx="9" cy="8" r="3" stroke={colors.primary} strokeWidth="1.5" /><circle cx="17" cy="9" r="2.2" stroke={colors.primary} strokeWidth="1.5" /><path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5M15 14c2.2 0 4 1.8 4 4" stroke={colors.primary} strokeWidth="1.5" strokeLinecap="round" /></>,
                accent: colors.primary,
              },
              {
                title: "Neutral & on your side",
                body: "Most Dubai rental calculators are run by management companies steering you to STR. We compare STR vs LTR honestly and recommend whichever genuinely wins.",
                icon: <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3zM9 12l2 2 4-4" stroke={colors.secondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
                accent: colors.secondary,
              },
            ].map((c) => (
              <div key={c.title} className="why-card">
                <div className="why-icon-badge">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">{c.icon}</svg>
                </div>
                <div className="why-card-divider" />
                <h3 className="why-card-title">{c.title}</h3>
                <p className="why-card-body">{c.body}</p>
              </div>
            ))}
          </div>

          {/* Just-ask-AI comparison */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            border: "1px solid #E8E0D0",
            borderRadius: "24px",
            overflow: "hidden",
            background: "#FDFBF8",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
          }}>
            {/* Left — Just asking an AI */}
            <div style={{
              padding: isMobile ? "32px 24px" : "40px 36px",
              borderRight: isMobile ? "none" : "1px solid #E8E0D0",
              borderBottom: isMobile ? "1px solid #E8E0D0" : "none",
              background: "#F8F4EE",
            }}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: "#9A8A78", marginBottom: "24px" }}>
                Just asking an AI
              </p>
              {[
                "A plausible-sounding number it made up",
                "No real contracts behind it — can't be verified",
                "Different answer every time you ask",
                "No view on operators, agents, or next steps",
              ].map((t) => (
                <div key={t} className="cmp-row">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
                    <circle cx="12" cy="12" r="9.5" stroke="#C0B09A" strokeWidth="1.2" />
                    <path d="M8 8l8 8M16 8l-8 8" stroke="#C0B09A" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span style={{ fontSize: "14px", color: "#7A6E64", lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </div>

            {/* Right — With AssetIntel */}
            <div style={{
              padding: isMobile ? "32px 24px" : "40px 36px",
              background: "#FDFCFA",
            }}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: colors.primary, marginBottom: "24px" }}>
                With AssetIntel
              </p>
              {[
                "Figures from real registered Dubai contracts",
                "Traceable — see how many contracts back each number",
                "Consistent, defensible projections you can act on",
                "Matched operators & leasing agents, with an introduction",
              ].map((t) => (
                <div key={t} className="cmp-row">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
                    <circle cx="12" cy="12" r="9.5" stroke={colors.primary} strokeWidth="1.2" opacity="0.4" />
                    <path d="M7.5 12.3l2.8 2.8L16.5 9" stroke={colors.primary} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: "14px", color: colors.textMain, lineHeight: 1.6, fontWeight: 500 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* FOOTER */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <footer style={{ background: "#1B5E4A", color: "#fff" }}>
        {/* Independence note bar */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", padding: isMobile ? "20px 20px" : "20px 40px" }}>
          <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", alignItems: "center", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3zM9 12l2 2 4-4" stroke="rgba(255,255,255,0.65)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.65)", textAlign: "center" }}>
              AssetIntel is not a broker or operator. We provide data-led rental intelligence, strategy guidance, and setup advisory.
            </span>
          </div>
        </div>

        {/* Main footer */}
        <div style={{ maxWidth: "1360px", margin: "0 auto", padding: isMobile ? "48px 20px 36px" : "64px 40px 48px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr", gap: isMobile ? "40px" : "48px" }}>

          {/* Brand column */}
          <div>
            <div style={{ marginBottom: "18px" }}>
              <div style={{ fontSize: "20px", fontFamily: "'Georgia', serif", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>AssetIntel</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: "3px" }}>Property Intelligence. Smarter Decisions.</div>
            </div>
            <p style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.6)", lineHeight: 1.75, maxWidth: "320px" }}>
              AssetIntel helps Dubai property owners, investors, and operators make smarter rental, investment, and STR setup decisions through data-led intelligence and advisory support.
            </p>
            <a href="mailto:hello@assetintel.ae" style={{ display: "inline-flex", alignItems: "center", gap: "7px", marginTop: "20px", fontSize: "13px", color: "#B88A44", fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B88A44" strokeWidth="1.6" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 4l10 9 10-9"/></svg>
              hello@assetintel.ae
            </a>
          </div>

          {/* Services */}
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "18px" }}>Services</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Rental Strategy Analyzer", href: "/estimator" },
                { label: "Self-Manage Playbook", href: "/self-manage/owners" },
                { label: "STR Sub-Leasing", href: "/self-manage/str-subleasing" },
                { label: "STR Risk Estimator", href: "/self-manage/str-subleasing/estimator" },
                { label: "Operational Setup", href: "/#services" },
              ].map(({ label, href }) => (
                <a key={label} href={href} style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.65)", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
                >{label}</a>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "18px" }}>Insights</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "2026 Handover Watchlist", href: "/investment-research/2026-handovers" },
                { label: "Operator Recommendations", href: "/operators" },
                { label: "Agent Recommendations", href: "/agents" },
                { label: "Furnishing Calculator", href: "/furnishing" },
              ].map(({ label, href }) => (
                <a key={label} href={href} style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.65)", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
                >{label}</a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "18px" }}>Contact</div>
            <button
              onClick={handleAnalyzeClick}
              style={{ display: "block", width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", color: "#fff", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", textAlign: "center", marginBottom: "12px", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            >
              Analyze My Property
            </button>
            <button
              onClick={() => router.push("/self-manage")}
              style={{ display: "block", width: "100%", padding: "13px 16px", background: "#B88A44", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", textAlign: "center", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#9A7238")}
              onMouseLeave={e => (e.currentTarget.style.background = "#B88A44")}
            >
              Speak to an Advisor
            </button>
          </div>

        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: isMobile ? "20px 20px" : "20px 40px" }}>
          <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>© {new Date().getFullYear()} AssetIntel. All rights reserved. · assetintel.ae</span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>Dubai Property Intelligence & STR Advisory</span>
          </div>
        </div>
      </footer>

      {/* ── Operational Setup Enquiry Modal ── */}
      {showOpsModal && (
        <div
          onClick={() => { if (!opsSubmitting) { setShowOpsModal(false); setOpsSubmitted(false); setOpsForm({ name:"",email:"",phone:"",company:"",portfolioSize:"",serviceNeeded:"",stage:"",message:"" }); } }}
          style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(20,30,25,0.55)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background:"#FDFBF7", borderRadius:"20px", boxShadow:"0 32px 80px rgba(20,48,38,0.22), 0 8px 24px rgba(20,48,38,0.12)", width:"100%", maxWidth:"560px", maxHeight:"90vh", overflowY:"auto", padding: isMobile ? "28px 20px" : "40px 36px", position:"relative" }}
          >
            {/* Close */}
            <button
              onClick={() => { setShowOpsModal(false); setOpsSubmitted(false); setOpsForm({ name:"",email:"",phone:"",company:"",portfolioSize:"",serviceNeeded:"",stage:"",message:"" }); }}
              style={{ position:"absolute", top:"16px", right:"16px", background:"none", border:"none", cursor:"pointer", color:colors.textMuted, fontSize:"22px", lineHeight:1, padding:"4px 8px" }}
              aria-label="Close"
            >×</button>

            {/* Accent bar */}
            <div style={{ height:"3px", background:`linear-gradient(90deg,${colors.primary},rgba(27,94,74,0.18))`, borderRadius:"2px", marginBottom:"24px" }} />

            {opsSubmitted ? (
              <div style={{ textAlign:"center", padding:"20px 0 8px" }}>
                <div style={{ width:"52px", height:"52px", borderRadius:"50%", background:"#EEF5F1", border:`1.5px solid rgba(27,94,74,0.18)`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p style={{ fontSize:"17px", fontWeight:700, color:colors.primary, marginBottom:"10px" }}>Enquiry Received</p>
                <p style={{ fontSize:"14px", color:colors.textMuted, lineHeight:1.6 }}>
                  Thank you — your operational setup enquiry has been received. AssetIntel will review your details and contact you to discuss the right setup approach.
                </p>
              </div>
            ) : (
              <form onSubmit={handleOpsSubmit}>
                <p style={{ fontSize:"20px", fontWeight:800, color:colors.primary, marginBottom:"6px" }}>Operational Setup Enquiry</p>
                <p style={{ fontSize:"13px", color:colors.textMuted, lineHeight:1.55, marginBottom:"24px" }}>
                  Tell us about your STR operation and AssetIntel will review how we can support your setup, systems, team structure, and operational workflows.
                </p>

                {/* Field styles shared */}
                {[
                  { label:"Full Name", key:"name", type:"text", placeholder:"Your full name", required:true },
                  { label:"Email", key:"email", type:"email", placeholder:"your@email.com", required:true },
                  { label:"Phone / WhatsApp", key:"phone", type:"tel", placeholder:"+971 50 000 0000", required:false },
                  { label:"Company Name (if any)", key:"company", type:"text", placeholder:"Your company or brand", required:false },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom:"16px" }}>
                    <label style={{ display:"block", fontSize:"11px", fontWeight:700, letterSpacing:"0.10em", textTransform:"uppercase", color:"#7A9A8A", marginBottom:"6px" }}>{f.label}{f.required && <span style={{ color:colors.secondary }}> *</span>}</label>
                    <input
                      type={f.type}
                      required={f.required}
                      placeholder={f.placeholder}
                      value={(opsForm as any)[f.key]}
                      onChange={e => setOpsForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width:"100%", boxSizing:"border-box", padding:"10px 14px", borderRadius:"10px", border:`1.5px solid ${colors.border}`, background:"#FBF9F5", fontSize:"14px", color:colors.textMain, outline:"none", fontFamily:"inherit" }}
                    />
                  </div>
                ))}

                {[
                  { label:"Current Portfolio Size", key:"portfolioSize", required:true, options:["Not started yet","1–5 units","6–10 units","11–20 units","21+ units"] },
                  { label:"Service Needed", key:"serviceNeeded", required:true, options:["STR company setup","PMS and automation setup","Housekeeping / maintenance workflow setup","Guest communication setup","SOPs and team structure","Full operational setup","Not sure yet"] },
                  { label:"Current Stage", key:"stage", required:true, options:["Planning to start","Already operating","Scaling existing portfolio","Fixing operational issues"] },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom:"16px" }}>
                    <label style={{ display:"block", fontSize:"11px", fontWeight:700, letterSpacing:"0.10em", textTransform:"uppercase", color:"#7A9A8A", marginBottom:"6px" }}>{f.label}<span style={{ color:colors.secondary }}> *</span></label>
                    <select
                      required={f.required}
                      value={(opsForm as any)[f.key]}
                      onChange={e => setOpsForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width:"100%", boxSizing:"border-box", padding:"10px 14px", borderRadius:"10px", border:`1.5px solid ${colors.border}`, background:"#FBF9F5", fontSize:"14px", color:(opsForm as any)[f.key] ? colors.textMain : colors.textMuted, outline:"none", fontFamily:"inherit", appearance:"none" }}
                    >
                      <option value="" disabled>Select an option</option>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}

                <div style={{ marginBottom:"24px" }}>
                  <label style={{ display:"block", fontSize:"11px", fontWeight:700, letterSpacing:"0.10em", textTransform:"uppercase", color:"#7A9A8A", marginBottom:"6px" }}>Message / Notes</label>
                  <textarea
                    rows={4}
                    placeholder="Any additional context about your setup or what you need help with..."
                    value={opsForm.message}
                    onChange={e => setOpsForm(p => ({ ...p, message: e.target.value }))}
                    style={{ width:"100%", boxSizing:"border-box", padding:"10px 14px", borderRadius:"10px", border:`1.5px solid ${colors.border}`, background:"#FBF9F5", fontSize:"14px", color:colors.textMain, outline:"none", fontFamily:"inherit", resize:"vertical" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={opsSubmitting}
                  style={{ width:"100%", padding:"14px", borderRadius:"12px", background:colors.primary, color:"#fff", fontSize:"14px", fontWeight:700, letterSpacing:"0.06em", border:"none", cursor:opsSubmitting ? "not-allowed" : "pointer", opacity:opsSubmitting ? 0.7 : 1 }}
                >
                  {opsSubmitting ? "Submitting..." : "Submit Enquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
