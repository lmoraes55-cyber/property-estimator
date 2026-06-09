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
          minHeight: "600px",
          display: "flex",
          alignItems: "center",
          background: colors.bgMain,
        }}
      >
        {/* Marina background image - right side with fade */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "55%",
            height: "100%",
            backgroundImage: "url('/locations/Marina.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            zIndex: 1,
            maskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 0%)",
            WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 20%)",
          }}
        />

        {/* Fade overlay from image to background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "40%",
            height: "100%",
            background: `linear-gradient(to left, transparent 0%, ${colors.bgMain} 100%)`,
            zIndex: 2,
          }}
        />

        {/* Content container */}
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
          <div style={{ maxWidth: "600px", width: "100%" }}>
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

        {/* Floating Rental Forecast Card */}
        <div
          style={{
            position: "absolute",
            right: "80px",
            top: "120px",
            width: "360px",
            background: colors.bgSection,
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)",
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
              <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: colors.primary,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontSize: "20px",
                    fontWeight: "bold",
                    marginRight: "12px",
                  }}
                >
                  🏠
                </div>
                <div>
                  <div style={{ fontSize: "14px", color: colors.textMuted }}>Properties Analyzed</div>
                </div>
              </div>
              <div style={{ fontSize: "24px", fontWeight: "700", color: colors.textMain, marginBottom: "4px" }}>
                500+
              </div>
              <div style={{ fontSize: "13px", color: colors.textMuted }}>Data-backed insights</div>
            </div>

            {/* Trust Item 2 */}
            <div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: colors.secondary,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontSize: "20px",
                    fontWeight: "bold",
                    marginRight: "12px",
                  }}
                >
                  ↔️
                </div>
                <div>
                  <div style={{ fontSize: "14px", color: colors.textMuted }}>STR vs LTR Comparison</div>
                </div>
              </div>
              <div style={{ fontSize: "24px", fontWeight: "700", color: colors.textMain, marginBottom: "4px" }}>
                1000+
              </div>
              <div style={{ fontSize: "13px", color: colors.textMuted }}>Strategies evaluated</div>
            </div>

            {/* Trust Item 3 */}
            <div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: colors.primary,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontSize: "20px",
                    fontWeight: "bold",
                    marginRight: "12px",
                  }}
                >
                  📊
                </div>
                <div>
                  <div style={{ fontSize: "14px", color: colors.textMuted }}>Dubai Market Insights</div>
                </div>
              </div>
              <div style={{ fontSize: "24px", fontWeight: "700", color: colors.textMain, marginBottom: "4px" }}>
                Real-Time
              </div>
              <div style={{ fontSize: "13px", color: colors.textMuted }}>DLD, Bayut & more</div>
            </div>

            {/* Trust Item 4 */}
            <div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: colors.secondary,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontSize: "20px",
                    fontWeight: "bold",
                    marginRight: "12px",
                  }}
                >
                  👥
                </div>
                <div>
                  <div style={{ fontSize: "14px", color: colors.textMuted }}>Operator Recommendations</div>
                </div>
              </div>
              <div style={{ fontSize: "24px", fontWeight: "700", color: colors.textMain, marginBottom: "4px" }}>
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
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: colors.primary,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: "24px",
                  marginBottom: "20px",
                }}
              >
                📋
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
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: colors.secondary,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: "24px",
                  marginBottom: "20px",
                }}
              >
                📑
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
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: colors.primary,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: "24px",
                  marginBottom: "20px",
                }}
              >
                📊
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
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: colors.secondary,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: "24px",
                  marginBottom: "20px",
                }}
              >
                📍
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
