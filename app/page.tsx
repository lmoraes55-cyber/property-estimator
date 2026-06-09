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
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
          <nav style={{ display: "flex", gap: "32px", flex: 1, marginLeft: "48px" }}>
            <a href="#home" style={{ textDecoration: "none", color: colors.textMain, fontSize: "14px", fontWeight: "500" }}>
              Home
            </a>
            <a href="#services" style={{ textDecoration: "none", color: colors.textMuted, fontSize: "14px", fontWeight: "500" }}>
              Services
            </a>
            <a href="#sample" style={{ textDecoration: "none", color: colors.textMuted, fontSize: "14px", fontWeight: "500" }}>
              Sample Report
            </a>
            <a href="#insights" style={{ textDecoration: "none", color: colors.textMuted, fontSize: "14px", fontWeight: "500" }}>
              Insights
            </a>
            <a href="#contact" style={{ textDecoration: "none", color: colors.textMuted, fontSize: "14px", fontWeight: "500" }}>
              Contact
            </a>
          </nav>

          {/* CTA Button */}
          <button
            onClick={handleAnalyzeClick}
            style={{
              padding: "12px 24px",
              background: colors.primary,
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
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
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* HERO SECTION */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <section id="home" style={{ padding: "80px 24px", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
          {/* Left Content */}
          <div>
            <h1
              style={{
                fontSize: "56px",
                fontWeight: "700",
                lineHeight: "1.2",
                marginBottom: "24px",
                color: colors.textMain,
                fontFamily: '"Georgia", serif',
              }}
            >
              Data-Driven Rental Insights for Smarter Property Decisions
            </h1>
            <p
              style={{
                fontSize: "18px",
                lineHeight: "1.6",
                color: colors.textMuted,
                marginBottom: "40px",
                fontWeight: "400",
              }}
            >
              Compare short-term and long-term rental performance, explore Dubai market insights, and make confident decisions
              before renting or investing.
            </p>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "16px" }}>
              <button
                onClick={handleAnalyzeClick}
                style={{
                  padding: "16px 32px",
                  background: colors.primary,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: colors.shadowMd,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = colors.shadowLg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = colors.shadowMd;
                }}
              >
                Analyze My Property
              </button>
              <button
                style={{
                  padding: "16px 32px",
                  background: colors.bgSection,
                  color: colors.primary,
                  border: `1px solid ${colors.primary}`,
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${colors.primary}08`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.bgSection;
                }}
              >
                View Sample Report
              </button>
            </div>
          </div>

          {/* Right Dashboard Preview */}
          <div
            style={{
              background: colors.bgSection,
              border: `1px solid ${colors.border}`,
              borderRadius: "20px",
              padding: "40px",
              boxShadow: colors.shadowMd,
              backgroundImage: `url('/locations/Marina.png')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              minHeight: "400px",
            }}
          >
            {/* Dark overlay for text readability */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, rgba(27,94,74,0.9) 0%, rgba(27,94,74,0.7) 100%)",
                borderRadius: "20px",
              }}
            ></div>

            {/* Content */}
            <div style={{ position: "relative", zIndex: 2 }}>
              <div style={{ marginBottom: "32px" }}>
                <div style={{ fontSize: "12px", color: "#FFFFFF", opacity: 0.8, letterSpacing: "0.1em", marginBottom: "4px" }}>
                  RENTAL FORECAST
                </div>
                <div style={{ fontSize: "14px", color: "#FFFFFF", opacity: 0.9 }}>Dubai Marina Studio</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#FFFFFF", opacity: 0.8, marginBottom: "8px" }}>STR FORECAST</div>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: "#FFFFFF" }}>AED 54,000</div>
                  <div style={{ fontSize: "12px", color: "#FFFFFF", opacity: 0.7, marginTop: "4px" }}>annual revenue</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#FFFFFF", opacity: 0.8, marginBottom: "8px" }}>LTR FORECAST</div>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: "#B88A44" }}>AED 42,000</div>
                  <div style={{ fontSize: "12px", color: "#FFFFFF", opacity: 0.7, marginTop: "4px" }}>annual rental</div>
                </div>
              </div>

              <div style={{ borderTop: `1px solid rgba(255,255,255,0.2)`, paddingTop: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "#FFFFFF", opacity: 0.8, marginBottom: "8px" }}>RECOMMENDATION</div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#FFFFFF" }}>Short-Term Rental</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#FFFFFF", opacity: 0.8, marginBottom: "8px" }}>EXPECTED YIELD</div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#B88A44" }}>10.8%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* TRUST BAR */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: colors.bgSection,
          borderTop: `1px solid ${colors.border}`,
          borderBottom: `1px solid ${colors.border}`,
          padding: "48px 24px",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "48px", textAlign: "center" }}>
            <div>
              <div style={{ fontSize: "32px", fontWeight: "700", color: colors.primary, marginBottom: "8px" }}>600+</div>
              <div style={{ fontSize: "14px", color: colors.textMuted }}>Properties Analyzed</div>
            </div>
            <div>
              <div style={{ fontSize: "32px", fontWeight: "700", color: colors.primary, marginBottom: "8px" }}>STR vs LTR</div>
              <div style={{ fontSize: "14px", color: colors.textMuted }}>Comparison Engine</div>
            </div>
            <div>
              <div style={{ fontSize: "32px", fontWeight: "700", color: colors.primary, marginBottom: "8px" }}>Real-Time</div>
              <div style={{ fontSize: "14px", color: colors.textMuted }}>Dubai Market Data</div>
            </div>
            <div>
              <div style={{ fontSize: "32px", fontWeight: "700", color: colors.primary, marginBottom: "8px" }}>Expert</div>
              <div style={{ fontSize: "14px", color: colors.textMuted }}>Operator Insights</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* SERVICES SECTION */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <section id="services" style={{ padding: "80px 24px", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ marginBottom: "60px", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "42px",
              fontWeight: "700",
              marginBottom: "16px",
              color: colors.textMain,
              fontFamily: '"Georgia", serif',
            }}
          >
            Our Services
          </h2>
          <p style={{ fontSize: "18px", color: colors.textMuted, maxWidth: "600px", margin: "0 auto" }}>
            Everything you need to make confident rental decisions across Dubai.
          </p>
        </div>

        {/* Service Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "32px" }}>
          {/* Card 1: Rental Strategy Analyzer */}
          <ServiceCard
            title="Rental Strategy Analyzer"
            description="Compare short-term and long-term rental returns and identify the most suitable strategy for your property."
            features={["STR vs LTR comparison", "Revenue forecast", "Yield estimate", "Operator recommendations"]}
            buttonText="Analyze My Property"
            onClick={handleAnalyzeClick}
            isPrimary
          />

          {/* Card 2: Rental Valuation Reports */}
          <ServiceCard
            title="Rental Valuation Reports"
            description="Understand what your property should realistically rent for using market-backed analysis."
            features={["Market-based pricing", "Seasonal adjustments", "Competitive benchmarking", "Professional appraisal"]}
            buttonText="Learn More"
          />

          {/* Card 3: Market Comparables */}
          <ServiceCard
            title="Market Comparables"
            description="Benchmark your property against similar listings, rental prices, and market activity."
            features={["Peer comparison", "Price analytics", "Listing trends", "Market position"]}
            buttonText="Learn More"
          />

          {/* Card 4: Area Insights */}
          <ServiceCard
            title="Area Insights"
            description="Explore community-level rental demand, yields, and investment outlook across Dubai."
            features={["Demand analysis", "Yield overview", "Growth trends", "Investment outlook"]}
            buttonText="Learn More"
          />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* FEATURED ANALYZER SECTION */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: colors.bgSection,
          padding: "80px 24px",
          borderTop: `1px solid ${colors.border}`,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
            {/* Left Content */}
            <div>
              <h2
                style={{
                  fontSize: "42px",
                  fontWeight: "700",
                  marginBottom: "24px",
                  color: colors.textMain,
                  fontFamily: '"Georgia", serif',
                }}
              >
                Not Sure Whether STR or LTR Is Right for You?
              </h2>
              <p style={{ fontSize: "16px", lineHeight: "1.6", color: colors.textMuted, marginBottom: "32px" }}>
                Our Rental Strategy Analyzer compares both options and helps you understand which rental model may perform
                better for your property. Get a detailed forecast with revenue estimates, yield projections, and expert
                recommendations.
              </p>
              <button
                onClick={handleAnalyzeClick}
                style={{
                  padding: "16px 32px",
                  background: colors.primary,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: colors.shadowMd,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = colors.shadowLg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = colors.shadowMd;
                }}
              >
                Launch Rental Strategy Analyzer
              </button>
            </div>

            {/* Right Result Card */}
            <div
              style={{
                background: colors.bgSection,
                border: `1px solid ${colors.border}`,
                borderRadius: "20px",
                padding: "40px",
                boxShadow: colors.shadowMd,
              }}
            >
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "12px", color: colors.textMuted, letterSpacing: "0.1em", marginBottom: "8px" }}>
                  SAMPLE ANALYSIS
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: colors.textMain }}>Dubai Marina</div>
                  <div style={{ fontSize: "14px", color: colors.textMuted }}>Studio Apartment</div>
                </div>
              </div>

              <div style={{ display: "grid", gap: "20px" }}>
                <div style={{ paddingBottom: "16px", borderBottom: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "6px" }}>SHORT-TERM RENTAL FORECAST</div>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: colors.primary }}>AED 54,000</div>
                  <div style={{ fontSize: "12px", color: colors.textMuted, marginTop: "4px" }}>annual revenue potential</div>
                </div>

                <div style={{ paddingBottom: "16px", borderBottom: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "6px" }}>LONG-TERM RENTAL FORECAST</div>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: colors.secondary }}>AED 42,000</div>
                  <div style={{ fontSize: "12px", color: colors.textMuted, marginTop: "4px" }}>annual rental income</div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "6px" }}>RECOMMENDED STRATEGY</div>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "8px 16px",
                      background: `${colors.primary}15`,
                      color: colors.primary,
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    Short-Term Rental
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* DUBAI MARKET COVERAGE */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <section id="insights" style={{ padding: "80px 24px", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ marginBottom: "60px", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "42px",
              fontWeight: "700",
              marginBottom: "16px",
              color: colors.textMain,
              fontFamily: '"Georgia", serif',
            }}
          >
            Dubai Market Coverage
          </h2>
          <p style={{ fontSize: "18px", color: colors.textMuted }}>
            Premium insights across Dubai's most sought-after neighborhoods.
          </p>
        </div>

        {/* Image Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "32px" }}>
          <LocationCard image="/locations/Marina.png" title="Dubai Marina" subtitle="View market insights" />
          <LocationCard image="/locations/Downtown.png" title="Downtown Dubai" subtitle="View market insights" />
          <LocationCard image="/locations/JBR.png" title="Jumeirah Beach Residence" subtitle="View market insights" />
          <LocationCard image="/locations/Palm.png" title="Palm Jumeirah" subtitle="View market insights" />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* SELF-MANAGEMENT SECTION */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: colors.bgSection,
          padding: "80px 24px",
          borderTop: `1px solid ${colors.border}`,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "42px",
              fontWeight: "700",
              marginBottom: "24px",
              color: colors.textMain,
              fontFamily: '"Georgia", serif',
            }}
          >
            Prefer to Manage Your Property Yourself?
          </h2>
          <p style={{ fontSize: "18px", color: colors.textMuted, maxWidth: "700px", margin: "0 auto 40px" }}>
            Ground Works also helps owners understand the fundamentals of self-managing a short-term rental, from pricing
            and guest experience to cleaning coordination and listing performance.
          </p>
          <button
            style={{
              padding: "16px 32px",
              background: colors.bgMain,
              color: colors.primary,
              border: `1px solid ${colors.primary}`,
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${colors.primary}08`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.bgMain;
            }}
          >
            Explore Self-Management Resources
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* SAMPLE REPORT SECTION */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <section id="sample" style={{ padding: "80px 24px", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ marginBottom: "60px", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "42px",
              fontWeight: "700",
              marginBottom: "16px",
              color: colors.textMain,
              fontFamily: '"Georgia", serif',
            }}
          >
            See What a Rental Insight Report Includes
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
          {/* Checklist */}
          <div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gap: "20px",
              }}
            >
              {[
                "STR and LTR revenue comparison",
                "Rental valuation estimate",
                "Yield and ROI overview",
                "Area-level market insights",
                "Recommended rental strategy",
              ].map((item, idx) => (
                <li key={idx} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: colors.primary,
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "700",
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </div>
                  <span style={{ fontSize: "16px", color: colors.textMain, fontWeight: "500" }}>{item}</span>
                </li>
              ))}
            </ul>

            <button
              style={{
                marginTop: "40px",
                padding: "16px 32px",
                background: colors.primary,
                color: "#FFFFFF",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: colors.shadowMd,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = colors.shadowLg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = colors.shadowMd;
              }}
            >
              View Sample Report
            </button>
          </div>

          {/* Right Image - Report Preview */}
          <div
            style={{
              background: colors.bgSection,
              border: `1px solid ${colors.border}`,
              borderRadius: "20px",
              padding: "40px",
              boxShadow: colors.shadowMd,
              backgroundImage: `url('/locations/Downtown.png')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: "500px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, rgba(27,94,74,0.85) 0%, rgba(27,94,74,0.65) 100%)",
                borderRadius: "20px",
              }}
            ></div>
            <div style={{ position: "relative", zIndex: 2, color: "#FFFFFF" }}>
              <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "32px" }}>SAMPLE REPORT</div>
              <div style={{ fontSize: "24px", fontWeight: "700", marginBottom: "32px" }}>Downtown Dubai Studio</div>
              <div
                style={{
                  display: "grid",
                  gap: "24px",
                  padding: "24px 0",
                  borderTop: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>ANNUAL NET REVENUE</div>
                  <div style={{ fontSize: "32px", fontWeight: "700", marginTop: "8px" }}>AED 148,000</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>EXPECTED YIELD</div>
                  <div style={{ fontSize: "28px", fontWeight: "700", marginTop: "8px", color: "#B88A44" }}>10.8%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* FINAL CTA SECTION */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: colors.bgSection,
          padding: "80px 24px",
          borderTop: `1px solid ${colors.border}`,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "48px",
              fontWeight: "700",
              marginBottom: "24px",
              color: colors.textMain,
              fontFamily: '"Georgia", serif',
            }}
          >
            Ready to Discover Your Best Rental Strategy?
          </h2>
          <p style={{ fontSize: "18px", color: colors.textMuted, maxWidth: "700px", margin: "0 auto 40px" }}>
            Start with a quick property analysis and see whether short-term or long-term rental is the better option for your
            Dubai property.
          </p>
          <button
            onClick={handleAnalyzeClick}
            style={{
              padding: "18px 48px",
              background: colors.primary,
              color: "#FFFFFF",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: colors.shadowMd,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = colors.shadowLg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = colors.shadowMd;
            }}
          >
            Analyze My Property
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* FOOTER */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <footer
        style={{
          background: colors.bgSection,
          borderTop: `1px solid ${colors.border}`,
          padding: "60px 24px",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "40px", marginBottom: "40px" }}>
            {/* Brand */}
            <div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: colors.textMain, marginBottom: "12px" }}>
                Ground<span style={{ color: colors.primary }}>Works</span>
              </div>
              <p style={{ fontSize: "14px", color: colors.textMuted }}>Dubai's premium rental intelligence platform.</p>
            </div>

            {/* Links */}
            <div>
              <div style={{ fontSize: "12px", fontWeight: "700", color: colors.textMuted, marginBottom: "16px", letterSpacing: "0.1em" }}>
                PRODUCT
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "12px" }}>
                <li>
                  <a href="#services" style={{ fontSize: "14px", color: colors.textMuted, textDecoration: "none" }}>
                    Services
                  </a>
                </li>
                <li>
                  <a href="#sample" style={{ fontSize: "14px", color: colors.textMuted, textDecoration: "none" }}>
                    Sample Report
                  </a>
                </li>
                <li>
                  <a href="#insights" style={{ fontSize: "14px", color: colors.textMuted, textDecoration: "none" }}>
                    Insights
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <div style={{ fontSize: "12px", fontWeight: "700", color: colors.textMuted, marginBottom: "16px", letterSpacing: "0.1em" }}>
                COMPANY
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "12px" }}>
                <li>
                  <a href="#" style={{ fontSize: "14px", color: colors.textMuted, textDecoration: "none" }}>
                    About
                  </a>
                </li>
                <li>
                  <a href="#" style={{ fontSize: "14px", color: colors.textMuted, textDecoration: "none" }}>
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#contact" style={{ fontSize: "14px", color: colors.textMuted, textDecoration: "none" }}>
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <div style={{ fontSize: "12px", fontWeight: "700", color: colors.textMuted, marginBottom: "16px", letterSpacing: "0.1em" }}>
                LOCATION
              </div>
              <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: "1.6" }}>
                Dubai, UAE
                <br />
                Premium Property Advisory
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: "24px", marginTop: "40px" }}>
            <p style={{ fontSize: "12px", color: colors.textMuted, textAlign: "center" }}>
              © {new Date().getFullYear()} Ground Works. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── */
/* REUSABLE SERVICE CARD COMPONENT */
/* ──────────────────────────────────────────────────────────────────────────── */
function ServiceCard({
  title,
  description,
  features,
  buttonText,
  onClick,
  isPrimary = false,
}: {
  title: string;
  description: string;
  features: string[];
  buttonText: string;
  onClick?: () => void;
  isPrimary?: boolean;
}) {
  const colors = {
    primary: "#1B5E4A",
    secondary: "#B88A44",
    bgSection: "#FFFFFF",
    textMain: "#1A1A1A",
    textMuted: "#6B6B6B",
    border: "#E0DDD8",
    shadowMd: "0 4px 6px rgba(0, 0, 0, 0.1)",
    shadowLg: "0 20px 25px rgba(0, 0, 0, 0.15)",
  };

  return (
    <div
      style={{
        background: colors.bgSection,
        border: isPrimary ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
        borderRadius: "16px",
        padding: "40px",
        boxShadow: isPrimary ? colors.shadowMd : "0 2px 4px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        if (!isPrimary) {
          e.currentTarget.style.boxShadow = colors.shadowMd;
          e.currentTarget.style.transform = "translateY(-4px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isPrimary) {
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      <h3 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "16px", color: colors.textMain }}>{title}</h3>
      <p style={{ fontSize: "16px", color: colors.textMuted, marginBottom: "24px", lineHeight: "1.6" }}>{description}</p>

      {/* Features */}
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", display: "grid", gap: "12px", flex: 1 }}>
        {features.map((feature, idx) => (
          <li key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: colors.textMuted }}>
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: colors.primary,
                flexShrink: 0,
              }}
            ></div>
            {feature}
          </li>
        ))}
      </ul>

      {/* Button */}
      <button
        onClick={onClick}
        style={{
          padding: "14px 24px",
          background: isPrimary ? colors.primary : colors.bgSection,
          color: isPrimary ? "#FFFFFF" : colors.primary,
          border: isPrimary ? "none" : `1px solid ${colors.primary}`,
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
          transition: "all 0.3s ease",
          width: "100%",
        }}
        onMouseEnter={(e) => {
          if (isPrimary) {
            e.currentTarget.style.boxShadow = colors.shadowMd;
            e.currentTarget.style.transform = "translateY(-2px)";
          } else {
            e.currentTarget.style.background = `${colors.primary}08`;
          }
        }}
        onMouseLeave={(e) => {
          if (isPrimary) {
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translateY(0)";
          } else {
            e.currentTarget.style.background = colors.bgSection;
          }
        }}
      >
        {buttonText}
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── */
/* LOCATION CARD COMPONENT */
/* ──────────────────────────────────────────────────────────────────────────── */
function LocationCard({ image, title, subtitle }: { image: string; title: string; subtitle: string }) {
  const colors = {
    primary: "#1B5E4A",
    border: "#E0DDD8",
    shadowMd: "0 4px 6px rgba(0, 0, 0, 0.1)",
  };

  return (
    <div
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: colors.shadowMd,
        cursor: "pointer",
        position: "relative",
        minHeight: "300px",
        backgroundImage: `url('${image}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.02)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(27,94,74,0.4) 0%, rgba(27,94,74,0.7) 100%)",
        }}
      ></div>

      {/* Content */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "32px",
          color: "#FFFFFF",
        }}
      >
        <h3 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>{title}</h3>
        <p style={{ fontSize: "14px", opacity: 0.9 }}>{subtitle}</p>
      </div>
    </div>
  );
}
