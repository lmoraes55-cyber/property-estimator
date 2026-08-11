"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import AssetIntelLogo from "@/components/AssetIntelLogo";
import ConsultationBanner from "@/components/home/ConsultationBanner";

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────

const C = {
  green:       "#1B5E4A",
  greenDark:   "#133D30",
  greenLight:  "#2D7A5E",
  gold:        "#B88A44",
  ivory:       "#FDFBF7",
  bg:          "#F8F4EE",
  bgSage:      "#F2EFE9",
  border:      "#E6E1D8",
  borderLight: "#F0EDE8",
  text:        "#1B2A1F",
  muted:       "#6B6B6B",
  subtle:      "#999",
};

const gradStyle: React.CSSProperties = {
  background: `linear-gradient(90deg, ${C.green} 0%, ${C.gold} 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  display: "inline-block",
};

// ── LEAD FORM TYPES ───────────────────────────────────────────────────────────

interface FormState {
  name: string;
  email: string;
  phone: string;
  budget: string;
  purchaseType: string;
  preferredAreas: string;
  unitSize: string;
  investmentGoal: string;
  timeline: string;
  wantsPartner: string;
  message: string;
}

const BLANK: FormState = {
  name: "",
  email: "",
  phone: "",
  budget: "",
  purchaseType: "",
  preferredAreas: "",
  unitSize: "",
  investmentGoal: "",
  timeline: "",
  wantsPartner: "",
  message: "",
};

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function SectionHeading({ eyebrow, title, sub, light }: { eyebrow?: string; title: string; sub?: string; light?: boolean }) {
  return (
    <div style={{ marginBottom: 40 }}>
      {eyebrow && (
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold, marginBottom: 10 }}>
          {eyebrow}
        </p>
      )}
      <h2 style={{ fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 700, color: light ? C.ivory : C.text, margin: "0 0 12px", fontFamily: "'Georgia', serif" }}>
        <span style={light ? { color: C.ivory } : gradStyle}>{title}</span>
      </h2>
      {sub && <p style={{ fontSize: 15, color: light ? "rgba(253,251,247,0.72)" : C.muted, maxWidth: 680, lineHeight: 1.7 }}>{sub}</p>}
    </div>
  );
}

function IconDot() {
  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(27,94,74,0.09)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 14 }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.green, opacity: 0.7 }} />
    </div>
  );
}

// ── LEAD FORM MODAL ────────────────────────────────────────────────────────────

function LeadFormModal({ onClose, defaultPartner }: { onClose: () => void; defaultPartner?: boolean }) {
  const [form, setForm] = useState<FormState>({ ...BLANK, wantsPartner: defaultPartner ? "Yes" : "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim() || (!form.email.trim() && !form.phone.trim())) {
      setError("Please enter your name and at least one contact method.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const notes = [
        form.budget && `Budget: ${form.budget}`,
        form.purchaseType && `Purchase type: ${form.purchaseType}`,
        form.preferredAreas && `Preferred areas: ${form.preferredAreas}`,
        form.unitSize && `Unit size: ${form.unitSize}`,
        form.investmentGoal && `Investment goal: ${form.investmentGoal}`,
        form.timeline && `Timeline: ${form.timeline}`,
        form.wantsPartner && `Real estate partner introduction: ${form.wantsPartner}`,
        form.message && `Notes: ${form.message}`,
      ].filter(Boolean).join(" | ");

      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          targetType: "service",
          target: "STR Investment Research",
          notes,
          message: notes,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again or contact us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    padding: "10px 14px", borderRadius: 10,
    border: `1px solid ${C.border}`,
    background: C.ivory, color: C.text,
    fontSize: 14, outline: "none",
    fontFamily: "Arial, sans-serif",
  };
  const selectStyle: React.CSSProperties = { ...inputStyle, appearance: "none", WebkitAppearance: "none", cursor: "pointer" };
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, display: "block", letterSpacing: "0.02em" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(10,20,14,0.6)", backdropFilter: "blur(4px)" }} />

      {/* Panel */}
      <div style={{
        position: "relative", zIndex: 1, background: C.bg,
        borderRadius: 24, width: "100%", maxWidth: 560,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
        border: `1px solid ${C.border}`,
      }}>
        {/* Header */}
        <div style={{ padding: "28px 28px 20px", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: C.bg, zIndex: 2, borderRadius: "24px 24px 0 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, marginBottom: 6 }}>STR Investment Research</p>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0, fontFamily: "'Georgia', serif" }}>Request STR Investment Research</h3>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: C.muted, lineHeight: 1 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {done ? (
          <div style={{ padding: "48px 28px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(27,94,74,0.10)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h4 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: "0 0 10px", fontFamily: "'Georgia', serif" }}>Request Received</h4>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, maxWidth: 380, margin: "0 auto 28px" }}>
              Thank you — your STR investment research request has been received. AssetIntel will review your buying goals and contact you with next steps.
            </p>
            <button onClick={onClose} style={{ padding: "11px 28px", borderRadius: 12, background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`, color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}>
              Close
            </button>
          </div>
        ) : (
          <div style={{ padding: "24px 28px 28px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {/* Full Name */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Full Name *</label>
                <input style={inputStyle} placeholder="Your full name" value={form.name} onChange={e => set("name", e.target.value)} />
              </div>
              {/* Email */}
              <div>
                <label style={labelStyle}>Email *</label>
                <input style={inputStyle} type="email" placeholder="your@email.com" value={form.email} onChange={e => set("email", e.target.value)} />
              </div>
              {/* Phone */}
              <div>
                <label style={labelStyle}>Phone / WhatsApp</label>
                <input style={inputStyle} placeholder="+971 50 000 0000" value={form.phone} onChange={e => set("phone", e.target.value)} />
              </div>
              {/* Budget */}
              <div>
                <label style={labelStyle}>Budget Range</label>
                <select style={selectStyle} value={form.budget} onChange={e => set("budget", e.target.value)}>
                  <option value="">Select budget</option>
                  <option>Under AED 750K</option>
                  <option>AED 750K – 1.2M</option>
                  <option>AED 1.2M – 2M</option>
                  <option>AED 2M – 3.5M</option>
                  <option>AED 3.5M+</option>
                </select>
              </div>
              {/* Purchase Type */}
              <div>
                <label style={labelStyle}>Purchase Type</label>
                <select style={selectStyle} value={form.purchaseType} onChange={e => set("purchaseType", e.target.value)}>
                  <option value="">Select type</option>
                  <option>Ready Property</option>
                  <option>Off-Plan Property</option>
                  <option>Open to Both</option>
                </select>
              </div>
              {/* Preferred Areas */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Preferred Areas</label>
                <input style={inputStyle} placeholder="e.g. Dubai Marina, Business Bay, Downtown, Emaar Beachfront" value={form.preferredAreas} onChange={e => set("preferredAreas", e.target.value)} />
              </div>
              {/* Unit Size */}
              <div>
                <label style={labelStyle}>Preferred Unit Size</label>
                <select style={selectStyle} value={form.unitSize} onChange={e => set("unitSize", e.target.value)}>
                  <option value="">Select size</option>
                  <option>Studio</option>
                  <option>1BR</option>
                  <option>2BR</option>
                  <option>3BR+</option>
                  <option>Not sure yet</option>
                </select>
              </div>
              {/* Investment Goal */}
              <div>
                <label style={labelStyle}>Investment Goal</label>
                <select style={selectStyle} value={form.investmentGoal} onChange={e => set("investmentGoal", e.target.value)}>
                  <option value="">Select goal</option>
                  <option>Maximum STR income</option>
                  <option>Balanced STR income and capital growth</option>
                  <option>Lower-risk rental income</option>
                  <option>Off-plan STR potential</option>
                  <option>Not sure yet</option>
                </select>
              </div>
              {/* Timeline */}
              <div>
                <label style={labelStyle}>Buying Timeline</label>
                <select style={selectStyle} value={form.timeline} onChange={e => set("timeline", e.target.value)}>
                  <option value="">Select timeline</option>
                  <option>Immediately</option>
                  <option>1–3 months</option>
                  <option>3–6 months</option>
                  <option>6+ months</option>
                </select>
              </div>
              {/* Partner intro */}
              <div>
                <label style={labelStyle}>Real estate partner introduction?</label>
                <select style={selectStyle} value={form.wantsPartner} onChange={e => set("wantsPartner", e.target.value)}>
                  <option value="">Select</option>
                  <option>Yes</option>
                  <option>Not yet</option>
                </select>
              </div>
              {/* Notes */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Additional Notes</label>
                <textarea
                  style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
                  placeholder="Any other details about your buying goals, timeline, or current situation..."
                  value={form.message}
                  onChange={e => set("message", e.target.value)}
                />
              </div>
            </div>

            {error && <p style={{ fontSize: 13, color: "#C0392B", marginTop: 8 }}>{error}</p>}

            <p style={{ fontSize: 11, color: C.subtle, lineHeight: 1.6, margin: "16px 0 20px" }}>
              AssetIntel provides STR-focused market research and advisory support. Property purchase/sourcing may be handled through trusted real estate partners where applicable. Final investment decisions remain the responsibility of the buyer.
            </p>

            <button
              onClick={submit}
              disabled={submitting}
              style={{
                width: "100%", padding: "14px", borderRadius: 12,
                background: submitting ? C.muted : `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`,
                color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: submitting ? "default" : "pointer",
                boxShadow: submitting ? "none" : "0 4px 16px rgba(27,94,74,0.28)",
              }}
            >
              {submitting ? "Submitting..." : "Submit Research Request"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function STRInvestmentResearchPage() {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [defaultPartner, setDefaultPartner] = useState(false);

  const openForm = (partner = false) => {
    setDefaultPartner(partner);
    setFormOpen(true);
  };

  const PrimaryBtn = ({ label, partner }: { label: string; partner?: boolean }) => (
    <button
      onClick={() => openForm(!!partner)}
      style={{
        padding: "13px 26px", borderRadius: 12,
        background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`,
        color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer",
        boxShadow: "0 4px 16px rgba(27,94,74,0.28)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );

  const SecondaryBtn = ({ label, href }: { label: string; href: string }) => (
    <button
      onClick={() => router.push(href)}
      style={{
        padding: "13px 26px", borderRadius: 12, border: `1.5px solid rgba(27,94,74,0.30)`,
        background: "transparent", color: C.green, fontSize: 14, fontWeight: 700, cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <SiteNav active="investment-research" />
      {formOpen && <LeadFormModal onClose={() => setFormOpen(false)} defaultPartner={defaultPartner} />}

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{ background: C.ivory, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "64px 24px 72px", display: "grid", gridTemplateColumns: "1fr 420px", gap: 56, alignItems: "center" }} className="hero-grid">
          {/* Left */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.gold, marginBottom: 18 }}>
              STR Investment Research
            </p>
            <h1 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 20px", fontFamily: "'Georgia', serif" }}>
              <span style={gradStyle}>Buy For STR</span>
              <br />
              <span style={{ color: C.text }}>With Data Behind</span>
              <br />
              <span style={{ color: C.text }}>The Decision</span>
            </h1>
            <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.75, margin: "0 0 16px", maxWidth: 520 }}>
              Before committing to a ready or off-plan property, AssetIntel helps investors screen Dubai areas, buildings, and unit types through a short-term rental lens — using market signals, performance assumptions, furnishing requirements, setup costs, and owner-side return logic.
            </p>
            <p style={{ fontSize: 14, color: C.green, fontWeight: 600, margin: "0 0 32px" }}>
              We help investors decide what to buy before they speak to the market.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <PrimaryBtn label="Request STR Investment Research" />
              <SecondaryBtn label="Explore STR Market Intel" href="/str-market-intel" />
            </div>
          </div>

          {/* Right: research preview card */}
          <div style={{
            background: `linear-gradient(145deg, ${C.green} 0%, ${C.greenDark} 100%)`,
            borderRadius: 24, padding: "32px 28px",
            boxShadow: "0 16px 48px rgba(27,94,74,0.28)",
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(184,138,68,0.90)", marginBottom: 20 }}>
              Research-Led Buying Strategy
            </p>
            {[
              "Area and building screening",
              "STR income assumptions",
              "Furnishing and setup cost review",
              "Risk and seasonality check",
              "Partner introduction when ready",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L3.8 7.5L8.5 2.5" stroke="#B88A44" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p style={{ fontSize: 14, color: "rgba(253,251,247,0.82)", lineHeight: 1.5 }}>{item}</p>
              </div>
            ))}
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.10)" }}>
              <p style={{ fontSize: 11, color: "rgba(253,251,247,0.45)", lineHeight: 1.6 }}>
                Research-first advisory. No pressure to commit before you are ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 1: WHO THIS IS FOR ────────────────────────────────────── */}
      <section style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "72px 24px" }}>
          <SectionHeading
            eyebrow="Who This Is For"
            title="Who This Is For"
            sub="Designed for buyers who want to understand STR potential before committing capital."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            {[
              {
                title: "First-Time Dubai Investors",
                text: "You want to buy a unit but need clarity on which areas, buildings, and unit types make sense for STR.",
              },
              {
                title: "Existing Owners Expanding Portfolio",
                text: "You already own property and want to identify your next STR-friendly purchase.",
              },
              {
                title: "Off-Plan Buyers",
                text: "You are considering a future handover and want to understand whether the project has STR potential.",
              },
              {
                title: "Agents With Investor Clients",
                text: "You want research-backed STR guidance before recommending properties to clients.",
              },
            ].map(card => (
              <div key={card.title} style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 18, padding: "26px 22px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                <IconDot />
                <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10 }}>{card.title}</p>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: WHAT ASSETINTEL ANALYSES ──────────────────────────── */}
      <section style={{ background: C.ivory, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "72px 24px" }}>
          <SectionHeading
            eyebrow="Our Analysis"
            title="What AssetIntel Reviews"
            sub="We screen the property opportunity through a short-term rental lens before you buy."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            {[
              { title: "Area STR Demand",           text: "We assess whether the location has strong tourist, business, leisure, or lifestyle-driven short-term rental demand." },
              { title: "Building Guest Appeal",     text: "We review building quality, guest perception, amenities, access, walkability, and STR suitability." },
              { title: "Unit Type Suitability",     text: "We compare Studio, 1BR, 2BR, and larger units based on setup cost, ADR potential, occupancy, and guest profile." },
              { title: "Expected STR Income",       text: "We estimate potential ADR, occupancy, gross revenue, running costs, management fees, and net owner outcome." },
              { title: "Furnishing & Setup Cost",   text: "We consider furnishing package requirements, guest-ready setup, photography, access, operator onboarding, and initial costs." },
              { title: "Low-Season Risk",           text: "We assess whether the property can realistically perform during softer months after costs and operator fees." },
              { title: "STR vs LTR Context",        text: "Where useful, we compare STR potential against long-term rental stability to understand the real upside." },
              { title: "Partner Sourcing Readiness",text: "Once the research direction is clear, we can introduce trusted real estate partners to help source suitable options." },
            ].map((item, i) => (
              <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(27,94,74,0.09)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: C.green }}>{i + 1}</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>{item.title}</p>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: READY VS OFF-PLAN ──────────────────────────────────── */}
      <section style={{ background: C.bgSage, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "72px 24px" }}>
          <SectionHeading
            eyebrow="Property Type"
            title="Ready or Off-Plan — We Screen Both"
            sub="The STR decision changes depending on whether the property is already completed or still under development."
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="comparison-grid">
            {/* Ready */}
            <div style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 22, padding: "32px 28px", boxShadow: "0 4px 18px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 22 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(27,94,74,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, fontFamily: "'Georgia', serif" }}>Ready Property</h3>
              </div>
              {[
                "Current building quality can be assessed",
                "Furnishing needs can be estimated sooner",
                "STR potential can be modelled faster",
                "Operator fit can be checked earlier",
                "Existing market and rent context may be clearer",
                "Faster path to rental income",
              ].map((pt, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, marginTop: 6, flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55 }}>{pt}</p>
                </div>
              ))}
            </div>

            {/* Off-Plan */}
            <div style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 22, padding: "32px 28px", boxShadow: "0 4px 18px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 22 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(184,138,68,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, fontFamily: "'Georgia', serif" }}>Off-Plan Property</h3>
              </div>
              {[
                "Handover timing matters",
                "Future supply and competition must be considered",
                "Developer and building positioning affects guest appeal",
                "Floor plan and unit type become more important",
                "Projected STR demand must be treated carefully",
                "Best used for forward-looking STR strategy",
              ].map((pt, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, marginTop: 6, flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55 }}>{pt}</p>
                </div>
              ))}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.borderLight}` }}>
                <p style={{ fontSize: 11, color: C.subtle, lineHeight: 1.6, fontStyle: "italic" }}>
                  Off-plan projections are directional and should be reviewed again closer to handover.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: WHAT YOU RECEIVE ───────────────────────────────────── */}
      <section style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "72px 24px" }}>
          <SectionHeading
            eyebrow="Deliverables"
            title="What You Receive"
            sub="A focused STR investment shortlist that helps you understand where to look, what to avoid, and what to verify before buying."
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }} className="deliverables-grid">
            {/* Deliverables list */}
            <div style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 22, padding: "32px 28px", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 22 }}>Research Output Includes</p>
              {[
                "Recommended STR-friendly areas",
                "Suggested building profiles",
                "Best-fit unit types",
                "Expected STR performance range",
                "STR vs LTR context where relevant",
                "Furnishing and setup cost guidance",
                "Risk level and market notes",
                "Low-season considerations",
                "Owner action plan",
                "Real estate partner introduction if required",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(27,94,74,0.09)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L3.8 7.5L8.5 2.5" stroke={C.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <p style={{ fontSize: 14, color: C.text, lineHeight: 1.55 }}>{item}</p>
                </div>
              ))}
            </div>

            {/* Sample report card */}
            <div>
              <div style={{
                background: `linear-gradient(145deg, ${C.greenDark} 0%, #0D2B1E 100%)`,
                borderRadius: 22, padding: "28px 24px",
                boxShadow: "0 12px 40px rgba(19,61,48,0.32)",
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(184,138,68,0.80)", marginBottom: 18 }}>
                  Sample Research Output
                </p>
                {[
                  { label: "Budget",          value: "AED 1.2M – 2M" },
                  { label: "Target",          value: "STR income + capital growth" },
                  { label: "Suggested Focus", value: "1BR in prime tourist / business areas" },
                  { label: "Risk View",       value: "Medium" },
                  { label: "Next Step",       value: "Shortlist ready and near-handover options" },
                ].map(row => (
                  <div key={row.label} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(253,251,247,0.40)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{row.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(253,251,247,0.88)" }}>{row.value}</p>
                  </div>
                ))}
                <p style={{ fontSize: 11, color: "rgba(253,251,247,0.28)", marginTop: 6, lineHeight: 1.5, fontStyle: "italic" }}>
                  For illustration only. Output is tailored to each client's specific buying goals.
                </p>
              </div>
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={() => openForm()}
                  style={{
                    width: "100%", padding: "14px", borderRadius: 14,
                    background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`,
                    color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(27,94,74,0.28)",
                  }}
                >
                  Request Your Research
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: ADVISORY FLOW ───────────────────────────────────────── */}
      <section style={{ background: C.ivory, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "72px 24px" }}>
          <SectionHeading
            eyebrow="How It Works"
            title="How The Advisory Flow Works"
            sub="A simple research-first process before you commit to a property."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 }}>
            {[
              {
                num: "01",
                title: "Tell Us Your Budget & Goal",
                text: "Share your budget, preferred areas, ready/off-plan preference, timeline, unit size, and STR income goal.",
              },
              {
                num: "02",
                title: "We Screen The Market",
                text: "AssetIntel reviews STR demand, area trends, building suitability, unit profile, expected performance, setup cost, and risk.",
              },
              {
                num: "03",
                title: "Receive Your STR Shortlist",
                text: "You receive a focused shortlist of areas, buildings, and unit types that align with your STR strategy.",
              },
              {
                num: "04",
                title: "Connect With A Property Partner",
                text: "Once the strategy is clear, AssetIntel can introduce you to a trusted real estate partner to help source suitable ready or off-plan options.",
              },
            ].map((step, i) => (
              <div key={i} style={{ position: "relative" }}>
                {/* connector line on desktop */}
                {i < 3 && (
                  <div style={{ position: "absolute", top: 18, left: "calc(100% + 7px)", width: "calc(100% - 14px)", height: 1, background: C.borderLight, zIndex: 0 }} className="step-connector" />
                )}
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 18, padding: "26px 22px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", position: "relative", zIndex: 1 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: C.borderLight, lineHeight: 1, display: "block", marginBottom: 14 }}>{step.num}</span>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>{step.title}</p>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: WHY THIS MATTERS ───────────────────────────────────── */}
      <section style={{ background: C.bgSage, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "72px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }} className="why-grid">
            <div>
              <SectionHeading
                eyebrow="Why It Matters"
                title="Why Buy-Side STR Research Matters"
                sub="A property can look attractive on price, location, or developer branding — but still underperform as a short-term rental."
              />
              <button
                onClick={() => openForm()}
                style={{
                  padding: "13px 26px", borderRadius: 12,
                  background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`,
                  color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(27,94,74,0.28)",
                }}
              >
                Request STR Investment Research
              </button>
            </div>
            <div style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 20, padding: "28px 24px", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
              {[
                "The best purchase is not always the highest-grossing STR unit.",
                "Net income matters more than headline revenue.",
                "Furnishing cost can change the true return.",
                "Low-season performance can expose weak investments.",
                "Building rules and guest access can affect STR suitability.",
                "Operator execution can impact occupancy, reviews, and owner returns.",
                "Off-plan potential should be reassessed closer to handover.",
              ].map((pt, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < 6 ? 14 : 0 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, marginTop: 7, flexShrink: 0 }} />
                  <p style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>{pt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: PARTNER INTRODUCTION ───────────────────────────────── */}
      <section style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "72px 24px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            <SectionHeading
              eyebrow="Partner Sourcing"
              title="Research First. Partner Sourcing Second."
              sub="AssetIntel helps define the STR strategy first. Once the buying direction is clear, we can connect clients with trusted real estate partners to help source suitable options."
            />
            <div style={{ background: C.bgSage, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 24px", marginBottom: 28, textAlign: "left" }}>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.75 }}>
                AssetIntel provides STR-focused market research and advisory support. Property purchase, viewing, negotiation, and brokerage services may be handled through trusted real estate partners where applicable.
              </p>
            </div>
            <button
              onClick={() => openForm(true)}
              style={{
                padding: "13px 28px", borderRadius: 12,
                background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`,
                color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer",
                boxShadow: "0 4px 16px rgba(27,94,74,0.28)",
              }}
            >
              Request Partner Introduction
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: FINAL CTA ──────────────────────────────────────────── */}
      <section style={{ background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)` }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "72px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(184,138,68,0.85)", marginBottom: 16 }}>
            STR Investment Research
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: C.ivory, margin: "0 0 16px", fontFamily: "'Georgia', serif" }}>
            Ready To Buy With STR In Mind?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(253,251,247,0.70)", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.7 }}>
            Tell us your investment budget and target strategy. AssetIntel will help screen Dubai property opportunities before you commit.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => openForm()}
              style={{
                padding: "14px 28px", borderRadius: 12,
                background: C.ivory, color: C.green,
                fontSize: 14, fontWeight: 800, border: "none", cursor: "pointer",
                boxShadow: "0 4px 18px rgba(0,0,0,0.18)",
              }}
            >
              Request STR Investment Research
            </button>
            <button
              onClick={() => router.push("/str-market-intel")}
              style={{
                padding: "14px 28px", borderRadius: 12,
                background: "transparent", color: "rgba(253,251,247,0.80)",
                fontSize: 14, fontWeight: 700, border: "1.5px solid rgba(253,251,247,0.25)", cursor: "pointer",
              }}
            >
              View STR Market Intel
            </button>
          </div>
          <p style={{ fontSize: 11, color: "rgba(253,251,247,0.35)", marginTop: 28, maxWidth: 560, margin: "28px auto 0", lineHeight: 1.6 }}>
            AssetIntel provides STR-focused market research and advisory support. Property purchase/sourcing may be handled through trusted real estate partners where applicable. Final investment decisions remain the responsibility of the buyer.
          </p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <ConsultationBanner />

      <footer style={{ background: C.green, padding: "28px 24px" }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ filter: "brightness(0) invert(1)", opacity: 0.9 }}>
            <AssetIntelLogo size={22} />
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>
            © {new Date().getFullYear()} AssetIntel. All rights reserved. · assetintel.ae
          </p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .comparison-grid { grid-template-columns: 1fr !important; }
          .deliverables-grid { grid-template-columns: 1fr !important; }
          .why-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .step-connector { display: none !important; }
        }
        @media (max-width: 600px) {
          .hero-grid button { width: 100%; }
        }
      `}</style>
    </div>
  );
}
