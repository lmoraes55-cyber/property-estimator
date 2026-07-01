"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SiteNav from "@/components/SiteNav";

const C = {
  green:       "#1B5E4A",
  greenHover:  "#0F3E33",
  greenLight:  "#2A7A62",
  bronze:      "#B88A44",
  bronzeDark:  "#8B6F3F",
  bg:          "#F8F4EE",
  bgSection:   "#FDFBF7",
  bgSage:      "#EFF4F0",
  text:        "#1A1A1A",
  textMuted:   "#6B6B6B",
  textLight:   "#8E8E8E",
  border:      "#E6E1D8",
  borderSage:  "#C8DAD0",
};

// ── Icons ──────────────────────────────────────────────────────────────────
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.bronze} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
    </svg>
  );
}

function IconTrend() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconCog() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

// ── Enquiry modal (lightweight inline version) ─────────────────────────────
function EnquiryModal({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "about-page-cta" }),
      });
    } catch { /* fail silently */ }
    setSent(true);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: C.bgSection, borderRadius: 24, padding: "36px 32px", width: "100%", maxWidth: 460, boxShadow: "0 24px 60px rgba(0,0,0,0.18)", border: `1px solid ${C.border}`, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: C.textLight, fontSize: 20, lineHeight: 1 }}>✕</button>
        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#EEF5F1", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Message received</h3>
            <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.6 }}>We'll be in touch shortly.</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.bronze, marginBottom: 8 }}>Speak To An Advisor</p>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 6, fontFamily: "'Georgia', serif" }}>Get in touch</h3>
            <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 24, lineHeight: 1.6 }}>Tell us about your property and what you're trying to decide. We'll respond with practical guidance.</p>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input required placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={{ padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.text, background: "#fff", outline: "none" }} />
              <input required type="email" placeholder="Email address" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={{ padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.text, background: "#fff", outline: "none" }} />
              <textarea required placeholder="Tell us about your property and what you need help with..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                rows={4} style={{ padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.text, background: "#fff", outline: "none", resize: "vertical", fontFamily: "inherit" }} />
              <button type="submit" style={{ padding: "13px", borderRadius: 12, background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenHover} 100%)`, color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", marginTop: 4 }}>
                Send Message
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const router = useRouter();
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const checkList = [
    "Property onboarding and owner expectations",
    "STR vs LTR decision-making",
    "Furnishing readiness and guest appeal",
    "OTA setup and listing performance",
    "PMS and channel manager workflows",
    "Pricing tools and revenue adjustments",
    "Housekeeping and maintenance coordination",
    "Guest communication and escalation",
    "Owner reporting and portfolio performance",
    "Operator selection and performance differences",
  ];

  const subLeasingChecklist = [
    "Choosing the right area and building",
    "Confirming landlord and building approvals",
    "Managing fixed rent exposure",
    "Understanding break-even occupancy",
    "Surviving low season",
    "Furnishing to STR standards",
    "Setting up PMS and pricing tools",
    "Building housekeeping and maintenance teams",
    "Creating guest communication workflows",
    "Tracking profit, cash flow, and risk",
  ];

  const services = [
    { title: "STR vs LTR Strategy", desc: "Compare short-term and long-term rental potential before choosing the rental route.", icon: <IconTrend /> },
    { title: "Operator Recommendations", desc: "Understand which operators may be a better fit based on property type, location, performance, and guest profile.", icon: <IconUsers /> },
    { title: "Self-Management Setup", desc: "Get guidance on how to set up PMS, OTAs, pricing, housekeeping, maintenance, and guest communication.", icon: <IconCog /> },
    { title: "STR Sub-Leasing Risk", desc: "Assess whether a unit should be signed, negotiated, or avoided before taking fixed rent exposure.", icon: <IconBuilding /> },
    { title: "2026 Handover Intelligence", desc: "Review upcoming handovers and decide whether to furnish, lease, self-manage, or appoint an operator.", icon: <IconStar /> },
    { title: "STR Operational Setup", desc: "Support for entrepreneurs and operators setting up short-term rental companies, systems, teams, SOPs, and workflows.", icon: <IconCog /> },
  ];

  const trustPoints = [
    { label: "Data-Led", desc: "We combine market data, rental assumptions, and operating logic to guide decisions." },
    { label: "Experience-Backed", desc: "Our recommendations are shaped by real Dubai STR, leasing, onboarding, and operations experience." },
    { label: "Practical", desc: "We focus on what actually affects performance: rent pressure, view, furnishing, approvals, pricing, operations, and guest experience." },
  ];

  return (
    <>
      <SiteNav active="about" />
      {enquiryOpen && <EnquiryModal onClose={() => setEnquiryOpen(false)} />}

      <main style={{ background: C.bg, color: C.text }}>

        {/* ── SECTION 1: HERO ──────────────────────────────────────────── */}
        <section style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #FCFAF5 0%, #F6F1E7 45%, #EEF7F2 100%)",
          padding: "80px 24px 72px",
        }}>
          {/* Background image — blended right side */}
          <div style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
          }}>
            {/* The image itself */}
            <div style={{
              position: "absolute",
              top: 0, right: 0, bottom: 0,
              width: "62%",
              backgroundImage: "url('/Locations/Downtown.png')",
              backgroundSize: "cover",
              backgroundPosition: "center right",
              opacity: 0.42,
            }} />
            {/* Left cream fade — keeps text area clean */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to right, #F6F1E7 0%, #F6F1E7 42%, rgba(246,241,231,0.92) 54%, rgba(246,241,231,0.50) 66%, rgba(246,241,231,0.12) 80%, transparent 92%)",
            }} />
            {/* Bottom fade */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, #F6F1E7 0%, transparent 18%, transparent 65%, rgba(246,241,231,0.7) 85%, #F6F1E7 100%)",
            }} />
            {/* Warm radial glow behind right card */}
            <div style={{
              position: "absolute",
              top: "10%", right: "4%",
              width: 480, height: 480,
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(184,138,68,0.07) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
          </div>

          <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 48, alignItems: "center" }} className="about-hero-grid">

              {/* Left: copy */}
              <div style={{ maxWidth: 600 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.bronze, marginBottom: 16 }}>About AssetIntel</p>
                <h1 style={{
                  fontSize: "clamp(28px, 4vw, 50px)",
                  fontWeight: 700,
                  fontFamily: "'Georgia', serif",
                  lineHeight: 1.15,
                  marginBottom: 20,
                  background: `linear-gradient(120deg, ${C.green} 0%, #2A7A62 45%, ${C.bronze} 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  Built From Real Dubai STR, Leasing &amp; Operations Experience
                </h1>
                <p style={{ fontSize: 17, color: C.textMuted, lineHeight: 1.7, marginBottom: 32, maxWidth: 540 }}>
                  AssetIntel was created to help Dubai property owners, investors, and operators make smarter decisions using real market knowledge, rental strategy, and hands-on short-term rental operating experience.
                </p>

                {/* Trust chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 36 }}>
                  {["6+ years in Dubai STR & real estate", "STR sub-leasing setup experience", "Small to large portfolio operations", "STR, LTR & operator advisory"].map(chip => (
                    <span key={chip} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, color: C.green, background: "rgba(255,255,255,0.82)", border: "1px solid rgba(27,94,74,0.20)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
                      <svg width="7" height="7" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill={C.green} /></svg>
                      {chip}
                    </span>
                  ))}
                </div>

                {/* CTAs */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <button onClick={() => router.push("/estimator")} style={{ padding: "13px 28px", borderRadius: 12, background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenHover} 100%)`, color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 18px rgba(27,94,74,0.28)" }}>
                    Analyze My Property
                  </button>
                  <button onClick={() => router.push("/#services")} style={{ padding: "12px 24px", borderRadius: 12, background: "rgba(255,255,255,0.75)", color: C.green, fontSize: 14, fontWeight: 600, border: `1.5px solid rgba(27,94,74,0.30)`, cursor: "pointer", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}>
                    Explore Services
                  </button>
                </div>
              </div>

              {/* Right: experience card — elevated against image */}
              <div style={{
                background: "rgba(253,251,247,0.96)",
                border: `1px solid ${C.border}`,
                borderRadius: 24,
                padding: "32px 28px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.03), 0 16px 48px rgba(27,94,74,0.12)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.bronze, marginBottom: 6 }}>Experience Behind The Intelligence</p>
                <div style={{ width: 40, height: 2, background: `linear-gradient(90deg, ${C.bronze}, transparent)`, marginBottom: 22, borderRadius: 2 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {["Short-term rental operations", "Long-term leasing strategy", "Property onboarding", "Owner advisory", "STR sub-leasing setup", "Portfolio systems & workflows"].map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#EEF5F1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 3px rgba(27,94,74,0.08)" }}>
                        <IconCheck />
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 2: EXPERIENCE SNAPSHOT CARDS ───────────────────── */}
        <section style={{ background: C.bgSection, padding: "64px 24px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.bronze, marginBottom: 12, textAlign: "center" }}>What We Bring</p>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, fontFamily: "'Georgia', serif", textAlign: "center", marginBottom: 48, background: `linear-gradient(135deg, ${C.green} 0%, ${C.bronze} 100%)`, backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Real Experience Across Dubai's Rental Market
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
              {[
                { stat: "6+ Years", label: "Dubai STR & Real Estate Experience", desc: "Hands-on experience across short-term rental, long-term leasing, property onboarding, owner relations, and rental strategy in Dubai." },
                { stat: "STR Company Setup", label: "Sub-leasing operations built from the ground up", desc: "Experience setting up STR sub-leasing businesses, including operations, teams, systems, pricing, and portfolio workflows." },
                { stat: "Up To 900 Properties", label: "Large-scale portfolio exposure", desc: "Operational and coordination experience across portfolios ranging from small owner-managed units to large Dubai STR portfolios." },
                { stat: "A–Z Operations", label: "From onboarding to guest experience", desc: "Understanding of the full STR journey, including onboarding, furnishing readiness, listings, PMS, housekeeping, maintenance, guest relations, and owner reporting." },
              ].map(card => (
                <div key={card.stat} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, padding: "28px 24px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.green} 0%, ${C.bronze} 100%)`, borderRadius: "20px 20px 0 0" }} />
                  <p style={{ fontSize: "clamp(20px, 2vw, 26px)", fontWeight: 700, color: C.green, fontFamily: "'Georgia', serif", marginBottom: 6, lineHeight: 1.2 }}>{card.stat}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10, lineHeight: 1.4 }}>{card.label}</p>
                  <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.65 }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 3: OUR STORY ─────────────────────────────────────── */}
        <section style={{ background: C.bgSage, padding: "72px 24px", borderTop: `1px solid ${C.borderSage}` }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.bronze, marginBottom: 12 }}>Our Background</p>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 700, fontFamily: "'Georgia', serif", color: C.text, marginBottom: 32, lineHeight: 1.2 }}>Why We Built AssetIntel</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.75 }}>
                AssetIntel was built after years of working inside Dubai's short-term rental and leasing market.
              </p>
              <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.75 }}>
                We saw that many owners were making major decisions without a clear view of the numbers, risks, operators, or operational requirements. Some owners were unsure whether to choose short-term or long-term rental. Some wanted to self-manage but did not know how to set up the systems. Others wanted to enter STR sub-leasing but underestimated the importance of rent pressure, approvals, furnishing quality, pricing, and low-season survival.
              </p>
              <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.75 }}>
                AssetIntel was created to bring this experience into one practical property intelligence platform.
              </p>
              <div style={{ background: C.bgSection, border: `1px solid ${C.borderSage}`, borderRadius: 16, padding: "20px 24px" }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: C.green, lineHeight: 1.65 }}>
                  Our goal is simple: help owners, investors, and operators make smarter rental, investment, and STR setup decisions before they commit money, time, or contracts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: REAL STR OPERATIONS ──────────────────────────── */}
        <section style={{ background: C.bgSection, padding: "72px 24px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.bronze, marginBottom: 12 }}>Operations Experience</p>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, fontFamily: "'Georgia', serif", color: C.text, marginBottom: 40, lineHeight: 1.2 }}>Built On Real Short-Term Rental Operating Knowledge</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, alignItems: "start" }}>

              {/* Left: copy */}
              <div>
                <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.75, marginBottom: 20 }}>
                  Our experience is not limited to theory or software. We have worked through the practical side of STR operations — from property onboarding and owner handover to day-to-day coordination, guest relations, housekeeping, maintenance, pricing, and reporting.
                </p>
                <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.75 }}>
                  This gives AssetIntel a grounded understanding of what the numbers mean in practice, and what it actually takes to run a profitable short-term rental unit in Dubai.
                </p>
              </div>

              {/* Right: checklist card */}
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, padding: "28px 24px" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.green, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>What We Understand</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {checkList.map(item => (
                    <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <IconCheck />
                      <p style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 5: PORTFOLIO SCALE ───────────────────────────────── */}
        <section style={{ background: C.bg, padding: "72px 24px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.bronze, marginBottom: 12 }}>Scale & Experience</p>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, fontFamily: "'Georgia', serif", color: C.text, marginBottom: 20, lineHeight: 1.2 }}>From Smaller Portfolios To Large-Scale STR Operations</h2>
            <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.75, maxWidth: 720, marginBottom: 16 }}>
              AssetIntel is built with experience across different portfolio sizes — from smaller STR portfolios where every unit matters, to large-scale operations managing hundreds of properties across Dubai.
            </p>
            <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.75, maxWidth: 720, marginBottom: 12 }}>
              This gives us a practical understanding of what changes as portfolios grow:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 48, paddingLeft: 4 }}>
              {["the systems needed", "the team structure required", "the operational risks", "the reporting standards", "the difference between managing a few units and scaling professionally"].map(point => (
                <div key={point} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.bronze, marginTop: 8, flexShrink: 0 }} />
                  <p style={{ fontSize: 15, color: C.textMuted }}>{point}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
              {[
                { label: "Small Portfolios", desc: "For owners managing 1–8 units who need simple systems, automation, and reliable support." },
                { label: "Growing Portfolios", desc: "For owners or entrepreneurs scaling beyond a few units who need PMS, pricing, operations teams, and SOPs." },
                { label: "Large Portfolios", desc: "Experience with large Dubai STR portfolios of up to around 900 properties, where process, coordination, standards, and reporting become critical." },
              ].map(card => (
                <div key={card.label} style={{ background: C.bgSection, border: `1px solid ${C.border}`, borderRadius: 18, padding: "24px 22px" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.green, marginBottom: 10 }}>{card.label}</p>
                  <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.65 }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 6: SUB-LEASING ───────────────────────────────────── */}
        <section style={{ background: C.bgSage, padding: "72px 24px", borderTop: `1px solid ${C.borderSage}` }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48, alignItems: "start" }}>

              {/* Left: copy */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.bronze, marginBottom: 12 }}>Sub-Leasing Knowledge</p>
                <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 700, fontFamily: "'Georgia', serif", color: C.text, marginBottom: 20, lineHeight: 1.2 }}>STR Sub-Leasing Setup Experience</h2>
                <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.75, marginBottom: 16 }}>
                  We have helped set up STR sub-leasing operations from the ground up, including businesses scaling to portfolios of around 20 units and 9 units.
                </p>
                <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.75, marginBottom: 28 }}>
                  This gives AssetIntel practical insight into what makes sub-leasing work — and what makes it risky.
                </p>
                <div style={{ background: C.bgSection, border: `1px solid ${C.borderSage}`, borderRadius: 14, padding: "16px 20px" }}>
                  <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.65, fontStyle: "italic" }}>
                    Sub-leasing can be profitable, but only when the unit, rent, approvals, and operating setup are right.
                  </p>
                </div>
              </div>

              {/* Right: checklist */}
              <div style={{ background: C.bgSection, border: `1px solid ${C.borderSage}`, borderRadius: 20, padding: "28px 24px" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.green, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>What Matters In STR Sub-Leasing</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {subLeasingChecklist.map(item => (
                    <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <IconCheck />
                      <p style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 7: WHAT ASSETINTEL HELPS WITH ───────────────────── */}
        <section style={{ background: C.bgSection, padding: "72px 24px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.bronze, marginBottom: 12, textAlign: "center" }}>Our Services</p>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, fontFamily: "'Georgia', serif", textAlign: "center", marginBottom: 48, color: C.text }}>What AssetIntel Helps You Decide</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
              {services.map(svc => (
                <div key={svc.title} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, padding: "26px 22px", transition: "transform 0.18s, box-shadow 0.18s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(27,94,74,0.10)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EEF5F1", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    {svc.icon}
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>{svc.title}</p>
                  <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.65 }}>{svc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 8: TRUST POSITIONING ────────────────────────────── */}
        <section style={{ background: C.green, padding: "72px 24px", borderTop: `1px solid rgba(255,255,255,0.08)` }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.bronze, marginBottom: 12 }}>Our Approach</p>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 700, fontFamily: "'Georgia', serif", color: "#fff", marginBottom: 16, lineHeight: 1.2 }}>Independent Guidance Before You Commit</h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.72)", lineHeight: 1.75, maxWidth: 620, margin: "0 auto 48px" }}>
              AssetIntel is designed to help users understand the opportunity and the risk before making a decision. We focus on rental intelligence, strategy, and setup advisory — not pushing one route blindly.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 40 }}>
              {trustPoints.map(tp => (
                <div key={tp.label} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: "26px 22px", textAlign: "left" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{tp.label}</p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>{tp.desc}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
              AssetIntel is not a real estate brokerage or holiday-home operator. We provide property intelligence, rental strategy, and STR setup advisory.
            </p>
          </div>
        </section>

        {/* ── SECTION 9: FINAL CTA ─────────────────────────────────────── */}
        <section style={{ background: C.bg, padding: "80px 24px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.bronze, marginBottom: 16 }}>Get Started</p>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 42px)", fontWeight: 700, fontFamily: "'Georgia', serif", color: C.text, marginBottom: 16, lineHeight: 1.2 }}>
              Make Your Next Property Decision With More Confidence
            </h2>
            <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.75, marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
              Whether you are choosing between STR and LTR, preparing for handover, comparing operators, setting up self-management, or exploring STR sub-leasing, AssetIntel helps you understand the numbers, risks, and setup requirements first.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
              <button onClick={() => router.push("/estimator")} style={{ padding: "14px 32px", borderRadius: 12, background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenHover} 100%)`, color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(27,94,74,0.28)" }}>
                Analyze My Property
              </button>
              <button onClick={() => setEnquiryOpen(true)} style={{ padding: "13px 28px", borderRadius: 12, background: "transparent", color: C.green, fontSize: 15, fontWeight: 600, border: `1.5px solid rgba(27,94,74,0.35)`, cursor: "pointer" }}>
                Speak To An Advisor
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Responsive grid overrides */}
      <style>{`
        @media (min-width: 768px) {
          .about-hero-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .about-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
