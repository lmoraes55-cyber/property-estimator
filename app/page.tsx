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

// SVG Icons Component
const IconHouse = ({ color = colors.primary }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M8 20L20 8L32 20V32H8V20Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 32V22H26V32" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconArrows = ({ color = colors.secondary }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M10 12L18 20L10 28" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M30 28L22 20L30 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconChart = ({ color = colors.primary }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M8 28H32" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 28V14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M20 28V10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M28 28V18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconUsers = ({ color = colors.secondary }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M14 16C16.209 16 18 14.209 18 12C18 9.791 16.209 8 14 8C11.791 8 10 9.791 10 12C10 14.209 11.791 16 14 16Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M26 16C28.209 16 30 14.209 30 12C30 9.791 28.209 8 26 8C23.791 8 22 9.791 22 12C22 14.209 23.791 16 26 16Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 32C8 27.582 11.134 24 14 24C16.866 24 20 27.582 20 32" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 32C20 27.582 23.134 24 26 24C28.866 24 32 27.582 32 32" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCalculator = ({ color = colors.primary }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <rect x="8" y="8" width="24" height="28" rx="2" stroke={color} strokeWidth="1.5" />
    <path d="M8 20H32" stroke={color} strokeWidth="1.5" />
    <path d="M16 28H24" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 14H12.01" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M20 14H20.01" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M28 14H28.01" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconDocument = ({ color = colors.secondary }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M10 8H24L30 14V32C30 33.105 29.105 34 28 34H10C8.895 34 8 33.105 8 32V10C8 8.895 8.895 8 10 8Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24 8V14H30" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 22H26" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 27H26" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconBarChart = ({ color = colors.primary }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M10 30H30" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <rect x="8" y="20" width="6" height="10" rx="1" stroke={color} strokeWidth="1.5" />
    <rect x="17" y="12" width="6" height="18" rx="1" stroke={color} strokeWidth="1.5" />
    <rect x="26" y="16" width="6" height="14" rx="1" stroke={color} strokeWidth="1.5" />
  </svg>
);

const IconLocation = ({ color = colors.secondary }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M20 8C15.582 8 12 11.582 12 16C12 22.5 20 32 20 32C20 32 28 22.5 28 16C28 11.582 24.418 8 20 8Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 19C18.343 19 17 17.657 17 16C17 14.343 18.343 13 20 13C21.657 13 23 14.343 23 16C23 17.657 21.657 19 20 19Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function HomePage() {
  const router = useRouter();

  const handleAnalyzeClick = () => {
    router.push("/estimator");
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
            maxWidth: "1400px",
            margin: "0 auto",
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

          {/* Navigation - no right button */}
          <nav style={{ display: "flex", gap: "40px", flex: 1 }}>
            <a href="#home" style={{ textDecoration: "none", color: colors.textMain, fontSize: "15px", fontWeight: "500" }}>
              Home
            </a>
            <a href="#services" style={{ textDecoration: "none", color: colors.textMuted, fontSize: "15px", fontWeight: "500" }}>
              Services
            </a>
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
      {/* HERO SECTION */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <section
        id="home"
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: "700px",
          display: "flex",
          alignItems: "center",
          background: colors.bgMain,
        }}
      >
        {/* Marina background image - RIGHT 50% with fade */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "52%",
            height: "100%",
            backgroundImage: "url('/locations/Marina.png')",
            backgroundSize: "cover",
            backgroundPosition: "left center",
            backgroundRepeat: "no-repeat",
            zIndex: 1,
          }}
        />

        {/* Fade overlay from image to background - smooth gradient */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "40%",
            right: 0,
            height: "100%",
            background: `linear-gradient(to left, rgba(250,250,248,0) 0%, rgba(250,250,248,0.3) 30%, ${colors.bgMain} 100%)`,
            zIndex: 2,
          }}
        />

        {/* Content container - LEFT SIDE */}
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "80px 40px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            position: "relative",
            zIndex: 3,
          }}
        >
          <div style={{ maxWidth: "580px", width: "100%" }}>
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

        {/* Floating Rental Forecast Card - positioned on top of image */}
        <div
          style={{
            position: "absolute",
            right: "60px",
            top: "100px",
            width: "360px",
            background: colors.bgSection,
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            zIndex: 4,
          }}
        >
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: colors.textMain }}>
              Rental Forecast
            </div>
          </div>

          {/* STR & LTR Forecasts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>
            <div>
              <div style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "8px", fontWeight: "600" }}>
                STR Forecast
              </div>
              <div style={{ fontSize: "24px", fontWeight: "700", color: colors.primary }}>AED 54,000</div>
              <div style={{ fontSize: "12px", color: colors.textMuted, marginTop: "4px" }}>annual revenue</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "8px", fontWeight: "600" }}>
                LTR Forecast
              </div>
              <div style={{ fontSize: "24px", fontWeight: "700", color: colors.secondary }}>AED 42,000</div>
              <div style={{ fontSize: "12px", color: colors.textMuted, marginTop: "4px" }}>annual rental</div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: colors.border, marginBottom: "28px" }} />

          {/* Recommendation & Yield */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>
            <div>
              <div style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "8px", fontWeight: "600" }}>
                Recommendation
              </div>
              <div style={{ fontSize: "16px", fontWeight: "600", color: colors.textMain }}>Short-Term Rental</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "8px", fontWeight: "600" }}>
                Expected Yield
              </div>
              <div style={{ fontSize: "16px", fontWeight: "600", color: colors.secondary }}>10.8%</div>
            </div>
          </div>

          {/* Mini chart bars */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "60px" }}>
            {[0.6, 0.8, 0.5, 0.9, 0.7, 0.4, 0.85, 0.75].map((height, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${height * 60}px`,
                  background: i % 2 === 0 ? colors.primary : colors.secondary,
                  borderRadius: "3px",
                  opacity: 0.8,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* TRUST BAR */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "40px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div
            style={{
              background: colors.bgSection,
              borderRadius: "16px",
              padding: "40px",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "40px",
              boxShadow: colors.shadowSm,
              border: `1px solid ${colors.border}`,
            }}
          >
            {/* Trust Item 1 */}
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{ marginRight: "12px", marginTop: "2px" }}>
                  <IconHouse color={colors.primary} />
                </div>
                <div>
                  <div style={{ fontSize: "14px", color: colors.textMuted, fontWeight: "500" }}>Properties Analyzed</div>
                </div>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: colors.textMain, marginBottom: "4px" }}>
                500+
              </div>
              <div style={{ fontSize: "13px", color: colors.textMuted }}>Data-backed insights</div>
            </div>

            {/* Trust Item 2 */}
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{ marginRight: "12px", marginTop: "2px" }}>
                  <IconArrows color={colors.secondary} />
                </div>
                <div>
                  <div style={{ fontSize: "14px", color: colors.textMuted, fontWeight: "500" }}>STR vs LTR Comparison</div>
                </div>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: colors.textMain, marginBottom: "4px" }}>
                1000+
              </div>
              <div style={{ fontSize: "13px", color: colors.textMuted }}>Strategies evaluated</div>
            </div>

            {/* Trust Item 3 */}
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{ marginRight: "12px", marginTop: "2px" }}>
                  <IconChart color={colors.primary} />
                </div>
                <div>
                  <div style={{ fontSize: "14px", color: colors.textMuted, fontWeight: "500" }}>Dubai Market Insights</div>
                </div>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: colors.textMain, marginBottom: "4px" }}>
                Real-Time
              </div>
              <div style={{ fontSize: "13px", color: colors.textMuted }}>DLD, Bayut & more</div>
            </div>

            {/* Trust Item 4 */}
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{ marginRight: "12px", marginTop: "2px" }}>
                  <IconUsers color={colors.secondary} />
                </div>
                <div>
                  <div style={{ fontSize: "14px", color: colors.textMuted, fontWeight: "500" }}>Operator Recommendations</div>
                </div>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: colors.textMain, marginBottom: "4px" }}>
                Curated
              </div>
              <div style={{ fontSize: "13px", color: colors.textMuted }}>Top-performing partners</div>
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
            <div style={{ fontSize: "13px", color: colors.secondary, fontWeight: "700", letterSpacing: "0.1em", marginBottom: "12px" }}>
              OUR SERVICES
            </div>
            <h2
              style={{
                fontSize: "44px",
                fontFamily: "'Georgia', serif",
                fontWeight: "700",
                color: colors.textMain,
                marginBottom: "16px",
              }}
            >
              Everything You Need for Smarter Rental Decisions
            </h2>
            <p style={{ fontSize: "16px", color: colors.textMuted, lineHeight: "1.6" }}>
              Powerful tools and expert insights to help you compare, analyze, and maximize your property's rental potential in Dubai.
            </p>
          </div>

          {/* Service cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "28px" }}>
            {/* Service 1 */}
            <div
              style={{
                background: colors.bgSection,
                borderRadius: "12px",
                padding: "32px",
                border: `1px solid ${colors.border}`,
                boxShadow: colors.shadowSm,
                transition: "all 0.3s ease",
                cursor: "pointer",
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
              <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: "1.6", marginBottom: "24px" }}>
                Compare short-term and long-term rental returns and identify the most suitable strategy for your property.
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
                }}
              >
                Analyze My Property →
              </button>
            </div>

            {/* Service 2 */}
            <div
              style={{
                background: colors.bgSection,
                borderRadius: "12px",
                padding: "32px",
                border: `1px solid ${colors.border}`,
                boxShadow: colors.shadowSm,
                transition: "all 0.3s ease",
                cursor: "pointer",
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
                <IconDocument color={colors.secondary} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: colors.textMain, marginBottom: "12px" }}>
                Rental Valuation Reports
              </h3>
              <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: "1.6", marginBottom: "24px" }}>
                Understand what your property should realistically rent for using market-backed analysis.
              </p>
              <button
                style={{
                  color: colors.secondary,
                  background: "transparent",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Learn More →
              </button>
            </div>

            {/* Service 3 */}
            <div
              style={{
                background: colors.bgSection,
                borderRadius: "12px",
                padding: "32px",
                border: `1px solid ${colors.border}`,
                boxShadow: colors.shadowSm,
                transition: "all 0.3s ease",
                cursor: "pointer",
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
                <IconBarChart color={colors.primary} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: colors.textMain, marginBottom: "12px" }}>
                Market Comparables
              </h3>
              <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: "1.6", marginBottom: "24px" }}>
                Benchmark your property against similar listings, rental prices, and market activity.
              </p>
              <button
                style={{
                  color: colors.primary,
                  background: "transparent",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Learn More →
              </button>
            </div>

            {/* Service 4 */}
            <div
              style={{
                background: colors.bgSection,
                borderRadius: "12px",
                padding: "32px",
                border: `1px solid ${colors.border}`,
                boxShadow: colors.shadowSm,
                transition: "all 0.3s ease",
                cursor: "pointer",
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
                <IconLocation color={colors.secondary} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: colors.textMain, marginBottom: "12px" }}>
                Area Insights
              </h3>
              <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: "1.6", marginBottom: "24px" }}>
                Explore community-level rental demand, yields, and investment outlook across Dubai.
              </p>
              <button
                style={{
                  color: colors.secondary,
                  background: "transparent",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Learn More →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
