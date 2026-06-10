"use client";

import React from "react";
import { useRouter } from "next/navigation";
import GroundWorksLogo from "@/components/GroundWorksLogo";

const colors = {
  primary: "#1B5E4A",      // Forest green
  secondary: "#B88A44",    // Bronze/muted gold
  bgMain: "#FAFAF8",       // Warm off-white/cream
  bgSection: "#FFFFFF",    // White for cards
  textMain: "#1A1A1A",     // Deep black
  textMuted: "#6B6B6B",    // Muted gray
  border: "#E0DDD8",       // Soft border
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
  const [servicesOpen, setServicesOpen] = React.useState(false);

  const handleAnalyzeClick = () => {
    router.push("/estimator");
  };

  const handleSelfManageClick = () => {
    router.push("/self-manage");
  };

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh" }}>
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* HEADER / NAVIGATION */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
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
            padding: "16px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "60px",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "fit-content" }}>
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

          {/* Navigation */}
          <nav style={{ display: "flex", gap: "40px", flex: 1 }}>
            <a href="#home" style={{ textDecoration: "none", color: colors.textMain, fontSize: "15px", fontWeight: "500" }}>
              Home
            </a>

            {/* Services dropdown */}
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <a
                href="#services"
                style={{
                  textDecoration: "none",
                  color: colors.textMuted,
                  fontSize: "15px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                Services
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginTop: "2px" }}>
                  <path d="M2 3.5L5 6.5L8 3.5" stroke={colors.textMuted} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              {servicesOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: "-16px",
                    paddingTop: "14px",
                    zIndex: 200,
                  }}
                >
                  <div
                    style={{
                      background: colors.bgSection,
                      borderRadius: "12px",
                      border: `1px solid ${colors.border}`,
                      boxShadow: colors.shadowLg,
                      padding: "8px",
                      minWidth: "240px",
                    }}
                  >
                    {[
                      { label: "Rental Strategy Analyzer", action: handleAnalyzeClick },
                      { label: "Self-Manage Your Property", action: handleSelfManageClick },
                      { label: "Operational Setup", action: () => router.push("/#services") },
                      { label: "Investment Research", action: () => router.push("/#services") },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          background: "transparent",
                          border: "none",
                          padding: "12px 14px",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: colors.textMain,
                          cursor: "pointer",
                          borderRadius: "8px",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.bgMain;
                          e.currentTarget.style.color = colors.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = colors.textMain;
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <a href="#sample" style={{ textDecoration: "none", color: colors.textMuted, fontSize: "15px", fontWeight: "500" }}>
              Sample Report
            </a>
            <a href="#insights" style={{ textDecoration: "none", color: colors.textMuted, fontSize: "15px", fontWeight: "500" }}>
              Insights
            </a>
            <a href="#contact" style={{ textDecoration: "none", color: colors.textMuted, fontSize: "15px", fontWeight: "500" }}>
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* HERO SECTION - SIMPLIFIED STRUCTURE */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <section
        id="home"
        style={{
          position: "relative",
          minHeight: "760px",
          background: colors.bgMain,
          overflow: "hidden",
        }}
      >
        {/* Left content container */}
        <div
          style={{
            position: "relative",
            width: "50%",
            maxWidth: "680px",
            zIndex: 3,
            padding: "155px 40px 100px 40px",
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <div style={{ width: "100%" }}>
            {/* Main headline with gradient */}
            <h1
              style={{
                fontSize: "56px",
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
            <div style={{ display: "flex", gap: "16px" }}>
              <button
                onClick={handleAnalyzeClick}
                style={{
                  padding: "14px 32px",
                  background: colors.primary,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = colors.shadowMd;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Analyze My Property
              </button>

              <button
                style={{
                  padding: "14px 32px",
                  background: "transparent",
                  color: colors.primary,
                  border: `2px solid ${colors.primary}`,
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primary;
                  e.currentTarget.style.color = "#FFFFFF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = colors.primary;
                }}
              >
                View Sample Report
              </button>
            </div>
          </div>
        </div>

        {/* Right image container - actual img element */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "58vw",
            zIndex: 1,
          }}
        >
          <img
            src="/locations/Marina.png"
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
      <section style={{ padding: "48px 40px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div
            style={{
              background: colors.bgSection,
              borderRadius: "16px",
              padding: "36px 40px",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "40px",
              boxShadow: colors.shadowSm,
              border: `1px solid ${colors.border}`,
            }}
          >
            {/* Trust Item 1 */}
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "14px", gap: "10px" }}>
                <div style={{ marginTop: "2px", flexShrink: 0 }}>
                  <IconHouse color={colors.primary} />
                </div>
                <div>
                  <div style={{ fontSize: "13px", color: colors.textMuted, fontWeight: "500" }}>Properties Analyzed</div>
                </div>
              </div>
              <div style={{ fontSize: "26px", fontWeight: "700", color: colors.textMain, marginBottom: "4px" }}>
                500+
              </div>
              <div style={{ fontSize: "12px", color: colors.textMuted }}>Data-backed insights</div>
            </div>

            {/* Trust Item 2 */}
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "14px", gap: "10px" }}>
                <div style={{ marginTop: "2px", flexShrink: 0 }}>
                  <IconArrows color={colors.secondary} />
                </div>
                <div>
                  <div style={{ fontSize: "13px", color: colors.textMuted, fontWeight: "500" }}>STR vs LTR Comparison</div>
                </div>
              </div>
              <div style={{ fontSize: "26px", fontWeight: "700", color: colors.textMain, marginBottom: "4px" }}>
                1000+
              </div>
              <div style={{ fontSize: "12px", color: colors.textMuted }}>Strategies evaluated</div>
            </div>

            {/* Trust Item 3 */}
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "14px", gap: "10px" }}>
                <div style={{ marginTop: "2px", flexShrink: 0 }}>
                  <IconAnalytics color={colors.primary} />
                </div>
                <div>
                  <div style={{ fontSize: "13px", color: colors.textMuted, fontWeight: "500" }}>Dubai Market Insights</div>
                </div>
              </div>
              <div style={{ fontSize: "26px", fontWeight: "700", color: colors.textMain, marginBottom: "4px" }}>
                Real-Time
              </div>
              <div style={{ fontSize: "12px", color: colors.textMuted }}>DLD, Bayut & more</div>
            </div>

            {/* Trust Item 4 */}
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "14px", gap: "10px" }}>
                <div style={{ marginTop: "2px", flexShrink: 0 }}>
                  <IconUsers color={colors.secondary} />
                </div>
                <div>
                  <div style={{ fontSize: "13px", color: colors.textMuted, fontWeight: "500" }}>Operator Recommendations</div>
                </div>
              </div>
              <div style={{ fontSize: "26px", fontWeight: "700", color: colors.textMain, marginBottom: "4px" }}>
                Curated
              </div>
              <div style={{ fontSize: "12px", color: colors.textMuted }}>Top-performing partners</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* SERVICES SECTION */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <section id="services" style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {/* Section header */}
          <div style={{ marginBottom: "64px" }}>
            <div style={{ fontSize: "12px", color: colors.secondary, fontWeight: "700", letterSpacing: "0.1em", marginBottom: "12px" }}>
              OUR SERVICES
            </div>
            <h2
              style={{
                fontSize: "44px",
                fontFamily: "'Georgia', serif",
                fontWeight: "700",
                marginBottom: "16px",
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Everything You Need for Smarter Rental Decisions
            </h2>
            <p style={{ fontSize: "16px", color: colors.textMuted, lineHeight: "1.6" }}>
              Powerful tools and expert insights to help you compare, analyze, and maximize your property's rental potential in Dubai.
            </p>
          </div>

          {/* Service cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "28px", alignItems: "stretch" }}>
            {/* Service 1 - Rental Strategy Analyzer */}
            <div
              style={{
                background: colors.bgSection,
                borderRadius: "12px",
                padding: "32px",
                border: `1px solid ${colors.border}`,
                boxShadow: colors.shadowSm,
                transition: "all 0.3s ease",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = colors.shadowMd;
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = colors.shadowSm;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ marginBottom: "20px" }}>
                <IconCalculator color={colors.primary} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: colors.textMain, marginBottom: "12px" }}>
                Rental Strategy Analyzer
              </h3>
              <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: "1.6", marginBottom: "24px", flex: 1 }}>
                Compare short-term and long-term rental performance and identify the most suitable strategy for your property using projected revenue, yield analysis, and market data.
              </p>
              <button
                onClick={handleAnalyzeClick}
                style={{
                  color: colors.primary,
                  background: "transparent",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "none",
                  textAlign: "left",
                }}
              >
                Analyze My Property →
              </button>
            </div>

            {/* Service 2 - Self-Manage Your Property */}
            <div
              style={{
                background: colors.bgSection,
                borderRadius: "12px",
                padding: "32px",
                border: `1px solid ${colors.border}`,
                boxShadow: colors.shadowSm,
                transition: "all 0.3s ease",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = colors.shadowMd;
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = colors.shadowSm;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ marginBottom: "20px" }}>
                <IconTools color={colors.secondary} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: colors.textMain, marginBottom: "12px" }}>
                Self-Manage Your Property
              </h3>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: "1.6", marginBottom: "16px" }}>
                  Built for owners managing up to 8 units who want to maximize profitability through self-management, automation, and proven short-term rental systems.
                </p>
                <div style={{ fontSize: "13px", color: colors.textMain, fontWeight: "600", marginBottom: "8px" }}>
                  Includes dedicated guidance for:
                </div>
                <ul style={{ fontSize: "13px", color: colors.textMuted, lineHeight: "1.7", margin: "0 0 16px 0", paddingLeft: "18px" }}>
                  <li>Self-Management</li>
                  <li>STR Sub-Leasing</li>
                </ul>
                <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: "1.6", marginBottom: "24px" }}>
                  Learn how to choose the safest and most profitable route to sub-leasing in short-term rentals through proper due diligence, risk management, and financial analysis.
                </p>
              </div>
              <button
                onClick={handleSelfManageClick}
                style={{
                  color: colors.secondary,
                  background: "transparent",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  padding: 0,
                  textAlign: "left",
                }}
              >
                Explore Self-Management →
              </button>
            </div>

            {/* Service 3 - Operational Setup */}
            <div
              style={{
                background: colors.bgSection,
                borderRadius: "12px",
                padding: "32px",
                border: `1px solid ${colors.border}`,
                boxShadow: colors.shadowSm,
                transition: "all 0.3s ease",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = colors.shadowMd;
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = colors.shadowSm;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ marginBottom: "20px" }}>
                <IconWorkflow color={colors.primary} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: colors.textMain, marginBottom: "12px" }}>
                Operational Setup
              </h3>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: "1.6", marginBottom: "16px" }}>
                  Built for small and mid-sized operators looking to streamline and scale their short-term rental operations using proven strategies, operational frameworks, automation tools, and best practices.
                </p>
                <div style={{ fontSize: "13px", color: colors.textMain, fontWeight: "600", marginBottom: "8px" }}>
                  Built for:
                </div>
                <ul style={{ fontSize: "13px", color: colors.textMuted, lineHeight: "1.7", margin: "0 0 24px 0", paddingLeft: "18px" }}>
                  <li>Holiday home operators</li>
                  <li>Boutique operators</li>
                  <li>Property managers</li>
                </ul>
              </div>
              <button
                style={{
                  color: colors.primary,
                  background: "transparent",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  padding: 0,
                  textAlign: "left",
                }}
              >
                Explore Operational Setup →
              </button>
            </div>

            {/* Service 4 - Investment Research */}
            <div
              style={{
                background: colors.bgSection,
                borderRadius: "12px",
                padding: "32px",
                border: `1px solid ${colors.border}`,
                boxShadow: colors.shadowSm,
                transition: "all 0.3s ease",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = colors.shadowMd;
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = colors.shadowSm;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ marginBottom: "20px" }}>
                <IconGrowth color={colors.secondary} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: colors.textMain, marginBottom: "12px" }}>
                Investment Research
              </h3>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: "1.6", marginBottom: "16px" }}>
                  Designed for property owners, investors, and real estate agents seeking reliable short-term and long-term rental estimates before purchasing a property.
                </p>
                <div style={{ fontSize: "13px", color: colors.textMain, fontWeight: "600", marginBottom: "8px" }}>
                  Focus areas:
                </div>
                <ul style={{ fontSize: "13px", color: colors.textMuted, lineHeight: "1.7", margin: "0 0 24px 0", paddingLeft: "18px" }}>
                  <li>STR projections</li>
                  <li>LTR projections</li>
                  <li>Yield analysis</li>
                  <li>Area intelligence</li>
                  <li>Investment feasibility</li>
                </ul>
              </div>
              <button
                style={{
                  color: colors.secondary,
                  background: "transparent",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  padding: 0,
                  textAlign: "left",
                }}
              >
                Explore Research →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
