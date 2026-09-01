"use client";

import React, { useState } from "react";
import AssetIntelLogo from "@/components/AssetIntelLogo";
import SiteNav from "@/components/SiteNav";
import DecorativeBackdrop from "@/components/DecorativeBackdrop";
import { useIsMobile } from "@/lib/useIsMobile";

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

const ip = (color: string, size = 20) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

const Icons = {
  laptop: (c: string, s?: number) => <svg {...ip(c, s)}><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M1 20h22" /></svg>,
  headset: (c: string, s?: number) => <svg {...ip(c, s)}><path d="M3 14v-2a9 9 0 0118 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></svg>,
  wrench: (c: string, s?: number) => <svg {...ip(c, s)}><path d="M14.7 6.3a4 4 0 10-5.4 5.4L2 19l3 3 7.3-7.3a4 4 0 005.4-5.4l-2.6 2.6-2-2 2.6-2.6z" /></svg>,
  trending: (c: string, s?: number) => <svg {...ip(c, s)}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  calendar: (c: string, s?: number) => <svg {...ip(c, s)}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>,
  wallet: (c: string, s?: number) => <svg {...ip(c, s)}><path d="M3 7a2 2 0 012-2h13a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /><path d="M16 12h3" /></svg>,
  phone: (c: string, s?: number) => <svg {...ip(c, s)}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>,
  compass: (c: string, s?: number) => <svg {...ip(c, s)}><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
  layers: (c: string, s?: number) => <svg {...ip(c, s)}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
};

interface BuildCard { number: string; title: string; icon: keyof typeof Icons; items: string[]; }
const BUILD_CARDS: BuildCard[] = [
  { number: "01", title: "PMS & Technology", icon: "laptop", items: ["PMS selection and implementation", "OTA/channel setup", "Calendar synchronisation", "Automated guest messaging", "Operational task automation"] },
  { number: "02", title: "Guest Support", icon: "headset", items: ["Virtual Assistant structure", "Guest messaging workflows", "Check-in coordination", "Escalation procedures", "Guest relations structure"] },
  { number: "03", title: "Housekeeping & Maintenance", icon: "wrench", items: ["Housekeeping workflows", "Turnover procedures", "Maintenance support structure", "Issue escalation", "Vendor coordination"] },
  { number: "04", title: "Revenue Management", icon: "trending", items: ["Dynamic pricing technology", "Pricing workflows", "Dubai-market recommendations", "Revenue-management structure"] },
  { number: "05", title: "Operational Workflows", icon: "compass", items: ["Booking → check-in → stay → checkout workflow", "Team responsibilities", "SOP structure", "Automation opportunities", "Quality-control processes"] },
  { number: "06", title: "Reporting & Controls", icon: "wallet", items: ["Owner reporting structure", "Expense tracking", "Revenue reporting", "Operational oversight", "Portfolio-level processes"] },
];

const PROCESS_STEPS = [
  { number: "1", title: "Discovery Call", desc: "An AssetIntel Account Manager understands the operator's portfolio, current setup, pain points and requirements.", icon: "phone" as const },
  { number: "2", title: "Recommended Setup", desc: "AssetIntel identifies the systems, technology, workflows, automation and operational support required.", icon: "layers" as const },
  { number: "3", title: "Tailored Quotation", desc: "The operator receives a clearly defined scope of work and quotation based only on the services required.", icon: "wallet" as const },
];

const PORTFOLIO_SIZE_OPTIONS = ["Not started yet", "1–5 units", "6–10 units", "11–20 units", "21+ units"];
const STAGE_OPTIONS = ["Planning to start", "Already operating", "Scaling existing portfolio", "Fixing operational issues"];

export default function OperationsSetupPage() {
  const isMobile = useIsMobile();
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", portfolioSize: "", stage: "", message: "" });

  function setField(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function openModal() {
    setSubmitted(false);
    setForm({ name: "", email: "", phone: "", company: "", portfolioSize: "", stage: "", message: "" });
    setShowModal(true);
  }
  function closeModal() { setShowModal(false); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "operations-setup-account-manager", targetType: "service", ...form }),
      });
    } catch {}
    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh", position: "relative" }}>
      <DecorativeBackdrop />
      <div style={{ position: "relative", zIndex: 1 }}>

        <SiteNav active="services" />

        {/* ─── HERO ─── */}
        <section style={{ padding: isMobile ? "44px 20px 40px" : "60px 48px 56px" }}>
          <div style={{ maxWidth: "820px", margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: "11.5px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "16px" }}>
              Operations Setup
            </div>
            <h1 style={{ fontSize: isMobile ? "28px" : "40px", fontFamily: serifHeading, fontWeight: 500, lineHeight: 1.2, marginBottom: "18px", color: colors.primary }}>
              Build Your Holiday Home Operations the Right Way
            </h1>
            <p style={{ fontSize: isMobile ? "14.5px" : "16px", color: colors.textMuted, lineHeight: 1.65, maxWidth: "640px", margin: "0 auto 30px" }}>
              For new and growing Dubai holiday-home operators who need proven systems, automation, technology and operational support to run their portfolio professionally.
            </p>
            <button onClick={openModal} style={{ padding: "14px 28px", background: colors.primary, color: "#fff", border: "none", borderRadius: "10px", fontSize: "14.5px", fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 26px rgba(27,94,74,0.24)" }}>
              Speak to an Account Manager →
            </button>
          </div>
        </section>

        {/* ─── WHAT ASSETINTEL CAN HELP BUILD ─── */}
        <section style={{ padding: isMobile ? "0 20px 52px" : "0 48px 72px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: isMobile ? "28px" : "40px" }}>
              <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "10px" }}>What AssetIntel Can Help Build</div>
              <h2 style={{ fontSize: isMobile ? "22px" : "27px", fontFamily: serifHeading, fontWeight: 500, color: colors.primary }}>A Professional Operating Infrastructure</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "14px" }}>
              {BUILD_CARDS.map(c => (
                <div key={c.title} style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "16px", padding: "22px 20px", boxShadow: colors.shadowSm }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                    <span style={{ fontSize: "10.5px", fontWeight: 800, color: colors.secondary, letterSpacing: "0.06em" }}>{c.number}</span>
                    <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: colors.bgSage, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {Icons[c.icon](colors.primary, 15)}
                    </div>
                  </div>
                  <div style={{ fontSize: "14.5px", fontWeight: 700, color: colors.textMain, marginBottom: "10px" }}>{c.title}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {c.items.map(item => (
                      <span key={item} style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.5 }}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CONSULTATION / PROCESS ─── */}
        <section style={{ padding: isMobile ? "0 20px 56px" : "0 48px 80px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ background: `linear-gradient(160deg, ${colors.primary}, ${colors.primaryDeep})`, borderRadius: "26px", padding: isMobile ? "34px 24px" : "48px 48px", color: "#fff", position: "relative", overflow: "hidden", textAlign: "center" }}>
              <div aria-hidden style={{ position: "absolute", top: "-60px", right: "-60px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(184,138,68,0.14)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#D4A574", marginBottom: "12px" }}>Built Around Your Operation</div>
                <h2 style={{ fontSize: isMobile ? "22px" : "28px", fontFamily: serifHeading, fontWeight: 500, color: "#FFFFFF", marginBottom: "14px", maxWidth: "680px", marginLeft: "auto", marginRight: "auto" }}>
                  Your Setup Starts With Understanding What You Actually Need
                </h2>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.82)", lineHeight: 1.65, maxWidth: "620px", margin: "0 auto 36px" }}>
                  Every holiday-home operator is different. Your requirements depend on portfolio size, existing systems, team structure, level of automation and the services you already have in place.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "18px", marginBottom: "36px", textAlign: "left" }}>
                  {PROCESS_STEPS.map(s => (
                    <div key={s.title} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: "16px", padding: "22px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 500, color: "#D4A574", fontFamily: serifHeading }}>
                          {s.number}
                        </div>
                        {Icons[s.icon]("#D4A574", 16)}
                      </div>
                      <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>{s.title}</div>
                      <p style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.75)", lineHeight: 1.55, margin: 0 }}>{s.desc}</p>
                    </div>
                  ))}
                </div>

                <button onClick={openModal} style={{ padding: "14px 28px", background: colors.secondary, color: "#fff", border: "none", borderRadius: "10px", fontSize: "14.5px", fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 20px rgba(184,138,68,0.3)" }}>
                  Speak to an Account Manager →
                </button>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "14px" }}>
                  No fixed packages. Your quotation is based on your actual operational requirements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── ENQUIRY MODAL ─── */}
        {showModal && (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
            style={{ position: "fixed", inset: 0, background: "rgba(10,26,20,0.62)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
          >
            <div style={{ background: "#FDFBF8", borderRadius: "24px", width: "100%", maxWidth: "600px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.22)", border: `1px solid ${colors.border}` }}>
              <div style={{ padding: isMobile ? "28px 24px 20px" : "36px 40px 24px", borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: colors.primary, letterSpacing: "0.12em", marginBottom: "10px" }}>OPERATIONS SETUP</div>
                <h2 style={{ fontSize: isMobile ? "22px" : "26px", fontFamily: serifHeading, fontWeight: 500, color: colors.textMain, marginBottom: "10px", lineHeight: 1.25 }}>Speak to an Account Manager</h2>
                <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.65 }}>Tell us about your portfolio and an AssetIntel Account Manager will reach out to scope your setup and quotation.</p>
              </div>

              {submitted ? (
                <div style={{ padding: isMobile ? "36px 24px" : "48px 40px", textAlign: "center" }}>
                  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ marginBottom: "20px" }}>
                    <circle cx="26" cy="26" r="25" stroke={colors.primary} strokeWidth="1.5" opacity="0.25" />
                    <circle cx="26" cy="26" r="20" fill={`${colors.primary}15`} />
                    <path d="M16 26L23 33L36 19" stroke={colors.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h3 style={{ fontSize: "20px", fontFamily: serifHeading, fontWeight: 500, color: colors.textMain, marginBottom: "12px" }}>Thank you — your enquiry has been received.</h3>
                  <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.65, marginBottom: "28px" }}>An AssetIntel Account Manager will review your details and be in touch to schedule your discovery call.</p>
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
                    <ModalField label="Company Name (if any)">
                      <input value={form.company} onChange={(e) => setField("company", e.target.value)} placeholder="Your company or brand" style={inputStyle} />
                    </ModalField>
                  </div>
                  <ModalField label="Current Portfolio Size" style={{ marginBottom: "16px" }}>
                    <select value={form.portfolioSize} onChange={(e) => setField("portfolioSize", e.target.value)} style={{ ...inputStyle, appearance: "none" as const }}>
                      <option value="">Select portfolio size…</option>
                      {PORTFOLIO_SIZE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </ModalField>
                  <ModalField label="Current Stage" style={{ marginBottom: "16px" }}>
                    <select value={form.stage} onChange={(e) => setField("stage", e.target.value)} style={{ ...inputStyle, appearance: "none" as const }}>
                      <option value="">Select current stage…</option>
                      {STAGE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </ModalField>
                  <ModalField label="Message / Notes" style={{ marginBottom: "28px" }}>
                    <textarea value={form.message} onChange={(e) => setField("message", e.target.value)} placeholder="Tell us about your current setup or what you need help with…" rows={4} style={{ ...inputStyle, resize: "vertical" as const }} />
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
        )}

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

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", fontSize: "14px", color: colors.textMain,
  background: "#F7F9F8", border: `1.5px solid ${colors.border}`, borderRadius: "9px",
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};

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
