"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AssetIntelLogo from "@/components/AssetIntelLogo";
import SiteNav from "@/components/SiteNav";
import { useIsMobile } from "@/lib/useIsMobile";

const colors = {
  primary: "#1B5E4A",
  secondary: "#B88A44",
  bgMain: "#F8F4EE",
  bgSection: "#FDFBF7",
  textMain: "#1A1A1A",
  textMuted: "#6B6B6B",
  border: "#E6E1D8",
  shadowSm: "0 1px 2px rgba(0,0,0,0.05)",
  shadowMd: "0 4px 6px rgba(0,0,0,0.1)",
};

const serifHeading = "'Georgia', serif";
const sk = (color: string) => ({ stroke: color, strokeWidth: 1.3, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

const IconOwner = ({ color = colors.primary }) => (
  <svg width="40" height="40" viewBox="0 0 40 40"><path d="M8 20L20 9L32 20V32H8V20Z" {...sk(color)} /><path d="M15 32V23H25V32" {...sk(color)} /></svg>
);
const IconSubLease = ({ color = colors.secondary }) => (
  <svg width="40" height="40" viewBox="0 0 40 40"><path d="M10 18L20 10L30 18" {...sk(color)} /><path d="M12 17V30H28V17" {...sk(color)} /><path d="M17 30V22H23V30" {...sk(color)} /></svg>
);
const IconLock = ({ color = colors.secondary, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="1.4" /><path d="M8 11V8a4 4 0 018 0v3" stroke={color} strokeWidth="1.4" strokeLinecap="round" /></svg>
);
const IconCheck = ({ color = colors.primary }) => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8.5" stroke={color} strokeWidth="1.2" opacity="0.35" /><path d="M6.5 10L9 12.5L13.5 7.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const IconBundle = ({ color = colors.secondary, size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><rect x="4" y="10" width="10" height="14" rx="1.5" {...sk(color)} /><rect x="18" y="10" width="10" height="14" rx="1.5" {...sk(color)} /><path d="M14 14H18" {...sk(color)} /><path d="M14 18H18" {...sk(color)} /></svg>
);

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
  "Full portfolio setup",
];

export default function SelfManagePage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [modalType, setModalType] = useState<"portfolio" | "setup" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", units: "",
    status: "", support: "", message: "",
  });

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
        body: JSON.stringify({
          source: modalType === "setup" ? "setup-support" : "growing-portfolio",
          targetType: "service",
          ...form,
        }),
      });
    } catch {
      // silent — show success regardless
    }
    setSubmitting(false);
    setSubmitted(true);
  }

  function openModal(type: "portfolio" | "setup") {
    setSubmitted(false);
    setForm({ name: "", email: "", phone: "", units: "", status: "", support: "", message: "" });
    setModalType(type);
  }

  function closeModal() { setModalType(null); }

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh" }}>

      {/* ─── HEADER ─── */}
      <SiteNav active="self-manage" />

      {/* ─── HERO ─── */}
      <section style={{ position: "relative", minHeight: isMobile ? "auto" : "520px", overflow: "hidden", background: colors.bgMain }}>
        <div style={{ position: "relative", width: isMobile ? "100%" : "52%", maxWidth: isMobile ? "100%" : "700px", zIndex: 3, padding: isMobile ? "48px 20px 40px" : "110px 40px 90px 40px" }}>
          <div style={{ fontSize: "12px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.1em", marginBottom: "16px" }}>SELF-MANAGEMENT HUB</div>
          <h1 style={{ fontSize: isMobile ? "32px" : "50px", fontFamily: serifHeading, fontWeight: 700, lineHeight: 1.2, marginBottom: "22px", background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Learn How To Self-Manage Like A Professional Operator
          </h1>
          <p style={{ fontSize: "16px", color: colors.textMuted, lineHeight: 1.65, marginBottom: "32px" }}>
            Structured playbooks for Dubai property owners and STR entrepreneurs. Build the right systems, reduce fees, and operate professionally.
          </p>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <a href="#paths" style={{ padding: "14px 28px", background: colors.primary, color: "#fff", borderRadius: "8px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}>Explore Playbooks</a>
            <a href="#pricing" style={{ padding: "14px 28px", background: "transparent", color: colors.secondary, border: `2px solid ${colors.secondary}`, borderRadius: "8px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}>View Pricing</a>
          </div>
        </div>
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "55vw", zIndex: 1 }}>
          <img src="/Locations/Downtown.png" alt="Dubai Property" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 15%, rgba(0,0,0,0.5) 32%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,1) 65%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 15%, rgba(0,0,0,0.5) 32%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,1) 65%)" }} />
        </div>
      </section>

      {/* ─── CHOOSE YOUR PATH ─── */}
      <section id="paths" style={{ padding: isMobile ? "52px 20px" : "80px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <SectionHeading label="GET STARTED" title="Choose Your Track" subtitle="Select the path that matches your portfolio size. Each playbook is a structured, practical guide built for Dubai property owners." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "28px" }}>
            <PlaybookCard
              icon={<IconOwner color={colors.primary} />}
              eyebrow="UP TO 8 UNITS"
              title="Self-Manage — Small Portfolio"
              description="For owners with 1–8 units who want to reduce management fees, maintain full control, and operate STR professionally from day one — without an agency."
              price="AED 199"
              accent={colors.primary}
              includes={["8-step setup roadmap", "DET permit requirements", "Operational systems", "Technology stack guide", "Financial tracking model", "Weekly workflow", "Common mistakes", "Readiness score"]}
              cta="View Small Portfolio Playbook"
              href="/self-manage/owners"
            />
            <GrowingPortfolioCard onContact={() => openModal("portfolio")} />
          </div>
        </div>
      </section>


      {/* ─── ENQUIRY MODAL ─── */}
      {modalType !== null && (() => {
        const isSetup = modalType === "setup";
        const eyebrow = isSetup ? "ACCOUNT MANAGER SETUP SUPPORT" : "GROWING PORTFOLIO";
        const title = isSetup ? "Request Setup Support" : "Get Guidance for Your Growing Portfolio";
        const subtitle = isSetup
          ? "Tell us which playbook you have and what you need help implementing. Our team will be in touch with next steps."
          : "Tell us about your portfolio and our team will guide you on the right setup, systems, and pricing.";
        return (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
            style={{ position: "fixed", inset: 0, background: "rgba(10,26,20,0.62)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
          >
            <div style={{ background: "#FDFBF8", borderRadius: "24px", width: "100%", maxWidth: "600px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.22)", border: `1px solid ${colors.border}` }}>
              <div style={{ padding: isMobile ? "28px 24px 20px" : "36px 40px 24px", borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: isSetup ? colors.primary : colors.secondary, letterSpacing: "0.12em", marginBottom: "10px" }}>{eyebrow}</div>
                <h2 style={{ fontSize: isMobile ? "22px" : "26px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "10px", lineHeight: 1.25 }}>{title}</h2>
                <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.65 }}>{subtitle}</p>
              </div>

              {submitted ? (
                <div style={{ padding: isMobile ? "36px 24px" : "48px 40px", textAlign: "center" }}>
                  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ marginBottom: "20px" }}>
                    <circle cx="26" cy="26" r="25" stroke={colors.primary} strokeWidth="1.5" opacity="0.25" />
                    <circle cx="26" cy="26" r="20" fill={`${colors.primary}15`} />
                    <path d="M16 26L23 33L36 19" stroke={colors.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h3 style={{ fontSize: "20px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "12px" }}>Thank you — your enquiry has been received.</h3>
                  <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.65, marginBottom: "28px" }}>AssetIntel will review your details and contact you with guidance on the right setup and pricing.</p>
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
                    <ModalField label="Number of Units">
                      <input type="number" min="1" value={form.units} onChange={(e) => setField("units", e.target.value)} placeholder={isSetup ? "e.g. 3" : "e.g. 12"} style={inputStyle} />
                    </ModalField>
                  </div>
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
                  <ModalField label="Message / Notes" style={{ marginBottom: "28px" }}>
                    <textarea value={form.message} onChange={(e) => setField("message", e.target.value)} placeholder="Any additional context about your portfolio or setup needs…" rows={4} style={{ ...inputStyle, resize: "vertical" as const }} />
                  </ModalField>
                  <div style={{ display: "flex", gap: "12px", flexDirection: isMobile ? "column-reverse" : "row" }}>
                    <button type="button" onClick={closeModal} style={{ flex: 1, padding: "14px", background: "transparent", color: colors.textMuted, border: `1.5px solid ${colors.border}`, borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                    <button type="submit" disabled={submitting} style={{ flex: 2, padding: "14px", background: isSetup ? `linear-gradient(135deg, ${colors.primary} 0%, #0F3E33 100%)` : `linear-gradient(135deg, ${colors.secondary} 0%, #8B6F3F 100%)`, color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: submitting ? "wait" : "pointer", boxShadow: isSetup ? "0 4px 16px rgba(27,94,74,0.28)" : "0 4px 16px rgba(184,138,68,0.28)" }}>
                      {submitting ? "Submitting…" : "Submit Enquiry"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        );
      })()}

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
  );
}

// ─── Shared styles ──────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", fontSize: "14px", color: colors.textMain,
  background: "#F8F4EE", border: `1.5px solid ${colors.border}`, borderRadius: "9px",
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};

// ─── Components ─────────────────────────────────────────────────────────────
function SectionHeading({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "52px", textAlign: "center" }}>
      <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "14px" }}>{label}</div>
      <h2 style={{ fontSize: "38px", fontFamily: serifHeading, fontWeight: 700, marginBottom: "14px", background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{title}</h2>
      {subtitle && <p style={{ fontSize: "16px", color: colors.textMuted, lineHeight: 1.65, maxWidth: "600px", margin: "0 auto" }}>{subtitle}</p>}
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

function GrowingPortfolioCard({ onContact }: { onContact: () => void }) {
  const accent = colors.secondary;
  const includes = ["Portfolio operations framework", "PMS & automation setup", "Team & process structure", "Multi-unit pricing strategy", "Financial reporting system", "Scaling roadmap", "Common scaling mistakes", "Portfolio readiness score"];
  return (
    <div style={{ background: colors.bgSection, borderRadius: "20px", border: `1px solid ${colors.border}`, padding: "40px", boxShadow: colors.shadowSm, display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: "20px" }}><IconSubLease color={accent} /></div>
      <div style={{ fontSize: "11px", fontWeight: 700, color: accent, letterSpacing: "0.12em", marginBottom: "10px" }}>8+ UNITS</div>
      <h3 style={{ fontSize: "22px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "12px" }}>Self-Manage — Growing Portfolio</h3>
      <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.65, marginBottom: "22px" }}>For owners scaling beyond 8 units who need professional systems, automation, and operational frameworks to manage a growing portfolio without the cost of a full management company.</p>
      <div style={{ marginBottom: "24px", flex: 1 }}>
        {includes.map((item) => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: "9px", padding: "6px 0" }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8.5" stroke={accent} strokeWidth="1.2" opacity="0.35" /><path d="M6.5 10L9 12.5L13.5 7.5" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span style={{ fontSize: "13.5px", color: colors.textMuted }}>{item}</span>
          </div>
        ))}
      </div>
      {/* Custom pricing bottom */}
      <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: "20px", marginBottom: "20px" }}>
        <div style={{ fontSize: "18px", fontWeight: 700, color: colors.textMain, fontFamily: serifHeading, marginBottom: "6px" }}>Custom guidance & pricing</div>
        <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6 }}>For owners with 8+ units, pricing depends on portfolio size, systems needed, and level of setup support.</p>
      </div>
      <button
        onClick={onContact}
        style={{ padding: "14px", background: `linear-gradient(135deg, ${accent} 0%, #8B6F3F 100%)`, color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", textAlign: "center", boxShadow: "0 2px 10px rgba(184,138,68,0.22)" }}
      >
        Contact AssetIntel for Guidance →
      </button>
    </div>
  );
}

function PlaybookCard({ icon, eyebrow, title, description, price, accent, includes, cta, href }: {
  icon: React.ReactNode; eyebrow: string; title: string; description: string;
  price: string; accent: string; includes: string[]; cta: string; href: string;
}) {
  return (
    <div style={{ background: colors.bgSection, borderRadius: "20px", border: `1px solid ${colors.border}`, padding: "40px", boxShadow: colors.shadowSm, display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: "20px" }}>{icon}</div>
      <div style={{ fontSize: "11px", fontWeight: 700, color: accent, letterSpacing: "0.12em", marginBottom: "10px" }}>{eyebrow}</div>
      <h3 style={{ fontSize: "22px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "12px" }}>{title}</h3>
      <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.65, marginBottom: "22px" }}>{description}</p>
      <div style={{ marginBottom: "24px", flex: 1 }}>
        {includes.map((item) => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: "9px", padding: "6px 0" }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8.5" stroke={accent} strokeWidth="1.2" opacity="0.35" /><path d="M6.5 10L9 12.5L13.5 7.5" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span style={{ fontSize: "13.5px", color: colors.textMuted }}>{item}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <span style={{ fontSize: "26px", fontWeight: 700, color: colors.textMain, fontFamily: serifHeading }}>{price}</span>
          <span style={{ fontSize: "12px", color: colors.textMuted, marginLeft: "8px" }}>one-time</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", background: `${accent}10`, borderRadius: "999px", border: `1px solid ${accent}30` }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke={accent} strokeWidth="1.5" /><path d="M8 11V8a4 4 0 018 0v3" stroke={accent} strokeWidth="1.5" strokeLinecap="round" /></svg>
          <span style={{ fontSize: "11px", fontWeight: 600, color: accent }}>Full access</span>
        </div>
      </div>
      <a href={href} style={{ padding: "14px", background: accent, color: "#fff", borderRadius: "10px", fontSize: "14px", fontWeight: 700, textDecoration: "none", textAlign: "center" }}>{cta} →</a>
    </div>
  );
}
