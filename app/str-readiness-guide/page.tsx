"use client";

import React, { useState } from "react";
import SiteNav from "@/components/SiteNav";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  green:   "#1B5E4A",
  bronze:  "#B88A44",
  ivory:   "#F7F9F8",
  section: "#FFFFFF",
  white:   "#FFFFFF",
  sage:    "#EEF5F1",
  sageBdr: "rgba(27,94,74,0.10)",
  bronzeBdr: "rgba(184,138,68,0.16)",
  border:  "#E2E8E5",
  text:    "#0F1D18",
  muted:   "#4E5D56",
  light:   "#9A9A8A",
};
const serif = "var(--font-display), ui-sans-serif, system-ui, sans-serif";

// ── Small reusable pieces ─────────────────────────────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.bronze, marginBottom: 10 }}>
      {children}
    </p>
  );
}

function CheckItem({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "7px 0", cursor: "pointer", userSelect: "none" }}>
      <div style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${checked ? C.green : C.border}`, background: checked ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.14s" }}>
        {checked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </div>
      <span style={{ fontSize: 13, color: checked ? C.green : C.muted, lineHeight: 1.5, fontWeight: checked ? 600 : 400, transition: "color 0.14s", textDecoration: checked ? "none" : "none" }}>{label}</span>
    </div>
  );
}

function QuestionPanel({ q }: { q: string }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "11px 14px", background: "rgba(27,94,74,0.04)", borderRadius: 10, border: "1px solid rgba(27,94,74,0.09)", marginTop: 12 }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.sage, border: "1px solid rgba(27,94,74,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 0 }}>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke={C.green} strokeWidth="1.2" /><path d="M5 4.5c0-.8.8-1.4 1.5-.8.5.4.5 1.1 0 1.4L6 5.5V6.5" stroke={C.green} strokeWidth="1.2" strokeLinecap="round" /><circle cx="6" cy="8" r="0.6" fill={C.green} /></svg>
      </div>
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: C.light, marginBottom: 3 }}>Ask the operator</p>
        <p style={{ fontSize: 12.5, color: C.green, fontWeight: 600, lineHeight: 1.5, margin: 0 }}>{q}</p>
      </div>
    </div>
  );
}

function WhyNote({ text }: { text: string }) {
  return (
    <div style={{ padding: "10px 14px", background: "rgba(184,138,68,0.05)", borderRadius: 9, borderLeft: "2.5px solid rgba(184,138,68,0.35)", marginTop: 10 }}>
      <p style={{ fontSize: 11.5, color: "#9A7A3A", lineHeight: 1.55, margin: 0, fontStyle: "italic" }}>{text}</p>
    </div>
  );
}

// ── Lead form modal ───────────────────────────────────────────────────────────
function ReadinessModal({ onClose }: { onClose: () => void }) {
  const blank = { name: "", email: "", phone: "", property: "", unitSize: "", furnished: "", hasOperator: "", helpWith: "" };
  const [form, setForm] = useState(blank);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => { onClose(); setSubmitted(false); setForm(blank); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try { await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, source: "STR Readiness Review" }) }); } catch {}
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div onClick={() => { if (!submitting) reset(); }}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(20,30,25,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: C.section, borderRadius: 20, boxShadow: "0 32px 80px rgba(20,48,38,0.22)", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", padding: "36px 32px", position: "relative" }}>
        <button onClick={reset} style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 22, lineHeight: 1 }}>×</button>
        <div style={{ height: 3, background: `linear-gradient(90deg,${C.green},rgba(27,94,74,0.18))`, borderRadius: 2, marginBottom: 20 }} />
        {submitted ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.sage, border: "1.5px solid rgba(27,94,74,0.18)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: C.green, marginBottom: 8 }}>Request Received</p>
            <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>AssetIntel will review your details and contact you to discuss your STR readiness.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: 20, fontWeight: 600, color: C.green, marginBottom: 5, fontFamily: serif }}>STR Readiness Review</p>
            <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55, marginBottom: 20 }}>Tell us about your property and AssetIntel will help you review readiness, costs, and go-live preparation.</p>
            {[
              { label: "Full Name", key: "name", type: "text", placeholder: "Your full name", req: true },
              { label: "Email", key: "email", type: "email", placeholder: "your@email.com", req: true },
              { label: "Phone / WhatsApp", key: "phone", type: "tel", placeholder: "+971 50 000 0000", req: false },
              { label: "Building / Property Name", key: "property", type: "text", placeholder: "e.g. Marina Gate 2", req: false },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "#7A9A8A", marginBottom: 5 }}>{f.label}{f.req && <span style={{ color: C.bronze }}> *</span>}</label>
                <input type={f.type} required={f.req} placeholder={f.placeholder} value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "#FBF9F5", fontSize: 13.5, color: C.text, outline: "none", fontFamily: "inherit" }} />
              </div>
            ))}
            {[
              { label: "Unit Size", key: "unitSize", opts: ["Studio", "1 Bedroom", "2 Bedrooms", "3 Bedrooms", "4+ Bedrooms"] },
              { label: "Is the property furnished?", key: "furnished", opts: ["Yes — fully furnished", "Partially furnished", "No — unfurnished"] },
              { label: "Do you already have an operator?", key: "hasOperator", opts: ["Yes", "No — still deciding", "Considering a few options"] },
              { label: "What do you need help with?", key: "helpWith", opts: ["Operator onboarding costs", "Furnishing readiness", "Insurance guidance", "Maintenance condition", "Smart lock / access setup", "Inventory checklist", "Utility handling", "Full STR readiness review"] },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "#7A9A8A", marginBottom: 5 }}>{f.label}</label>
                <select value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "#FBF9F5", fontSize: 13.5, color: (form as any)[f.key] ? C.text : C.muted, outline: "none", fontFamily: "inherit", appearance: "none" }}>
                  <option value="" disabled>Select an option</option>
                  {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <button type="submit" disabled={submitting}
              style={{ width: "100%", marginTop: 8, padding: 13, borderRadius: 11, background: C.green, color: "#fff", fontSize: 14, fontWeight: 700, letterSpacing: "0.04em", border: "none", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Submitting..." : "Submit Readiness Review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Checklist data ────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    num: "01", title: "Guest Access & Amenity Readiness", color: "green" as const,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#1B5E4A" strokeWidth="1.5" /><path d="M7 11V7a5 5 0 0110 0v4" stroke="#1B5E4A" strokeWidth="1.5" strokeLinecap="round" /><circle cx="12" cy="16" r="1.5" fill="#1B5E4A" /></svg>,
    intro: "Make sure guests can access the property and all permitted amenities without friction.",
    items: ["Guest access cards are available", "Parking access is clear, if applicable", "Pool, gym, lobby, beach, or community access is allowed for guests", "Building security allows short-term rental guests", "Check-in process is clear", "Access instructions can be shared easily"],
    question: "How will guests access the building, parking, and amenities?",
    why: "Limited access can reduce guest satisfaction, lower reviews, and affect future booking performance.",
  },
  {
    num: "02", title: "Furnishing, Styling & Photo Appeal", color: "bronze" as const,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="8" width="20" height="12" rx="2" stroke="#B88A44" strokeWidth="1.5" /><path d="M7 8V6a2 2 0 014 0v2M13 8V6a2 2 0 014 0v2" stroke="#B88A44" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    intro: "Guests often book based on photos first, so the property needs to look STR-ready and visually appealing.",
    items: ["Hotel-style furniture quality", "Good lighting", "Wall art and decorative items", "Cushions, throws, rugs, mirrors, and soft touches", "Balcony setup, if applicable", "Proper bedding presentation", "Clutter-free but warm interior styling"],
    question: "Will the current furnishing and styling be strong enough for listing photos?",
    why: "A plain property may receive fewer clicks, weaker conversion, and lower ADR compared with a well-styled unit.",
  },
  {
    num: "03", title: "One-Time Setup Costs", color: "green" as const,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#1B5E4A" strokeWidth="1.5" /><path d="M12 7v5l3 3" stroke="#1B5E4A" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    intro: "Clarify all onboarding and go-live charges before signing.",
    items: ["DET holiday home permit", "Third-party liability insurance", "SIRA-certified smart lock", "Professional photography", "Linen and towel sets", "Guest supplies starter pack", "Inventory setup", "Property inspection or onboarding fee"],
    question: "Can you provide a written breakdown of all one-time setup costs before contract signing?",
    why: "Each operator has its own standards. Some include items, while others charge separately.",
  },
  {
    num: "04", title: "Linen, Towels & Operator Standards", color: "bronze" as const,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 11h18M3 16h12" stroke="#B88A44" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    intro: "Many operators require specific linen and towel standards to maintain guest experience.",
    items: ["Required linen and towel quality is confirmed", "Number of sets per bedroom is confirmed", "Replacement responsibility is clear", "Operator's brand/standard requirement is clear", "Charges are confirmed upfront"],
    question: "Are linen and towel sets included, or will they be charged separately?",
    why: "Poor linen quality can affect reviews, and operators may reject items that do not match their standards.",
  },
  {
    num: "05", title: "Smart Lock & Access Setup", color: "green" as const,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="5" y="8" width="14" height="13" rx="2" stroke="#1B5E4A" strokeWidth="1.5" /><path d="M8 8V6a4 4 0 018 0v2" stroke="#1B5E4A" strokeWidth="1.5" strokeLinecap="round" /><circle cx="12" cy="14" r="1.5" fill="#1B5E4A" /></svg>,
    intro: "Many STR operators require approved access systems for smooth self check-in.",
    items: ["Smart lock requirement is confirmed", "SIRA certification requirement is confirmed", "Installation responsibility is clear", "Building management approval is checked", "Backup key/access process is confirmed"],
    question: "Do you require a SIRA-certified smart lock, and who arranges installation?",
    why: "Access issues create guest complaints and operational delays.",
  },
  {
    num: "06", title: "Photography & Listing Readiness", color: "bronze" as const,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="#B88A44" strokeWidth="1.5" /><circle cx="12" cy="12" r="3" stroke="#B88A44" strokeWidth="1.5" /><path d="M9 5V3M15 5V3" stroke="#B88A44" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    intro: "Professional photos should be taken only after the unit is fully styled and ready.",
    items: ["Photography is included or cost is confirmed", "Styling is completed before the shoot", "Balcony, view, amenities, and key interiors will be captured", "Listing copy and title will be reviewed", "Photo ownership/reuse is clarified"],
    question: "Can I review the photos and listing before it goes live?",
    why: "Photography directly affects listing clicks, booking conversion, and perceived value.",
  },
  {
    num: "07", title: "Maintenance Condition & Handover Readiness", color: "green" as const,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="#1B5E4A" strokeWidth="1.5" strokeLinejoin="round" /><path d="M9 22V12h6v10" stroke="#1B5E4A" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    intro: "The property should be technically ready before guests begin staying.",
    items: ["AC is working properly", "Plumbing is in good condition", "Appliances are functional", "Furniture is not damaged", "Walls, flooring, doors, and cabinets are in good condition", "Balcony and windows are clean and safe", "Internet setup is ready", "Developer warranty / DLP status is understood"],
    question: "Will you inspect the property and share a maintenance readiness report before go-live?",
    why: "If issues are found before go-live, owners should know whether they fall under DLP/warranty or owner maintenance cost.",
  },
  {
    num: "08", title: "Inventory List Before Go-Live", color: "bronze" as const,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke="#B88A44" strokeWidth="1.5" /><path d="M8 8h8M8 12h8M8 16h4" stroke="#B88A44" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    intro: "A proper inventory protects the owner and operator by documenting what is inside the property.",
    items: ["Furniture items recorded", "Appliances recorded", "Kitchenware recorded", "Electronics recorded", "Linen and towels recorded", "Décor items recorded", "Access cards and keys recorded", "Remote controls recorded", "Guest supplies recorded"],
    question: "Will you provide a full inventory list before the property goes live?",
    why: "Inventory documentation helps avoid disputes after guest stays begin.",
  },
  {
    num: "09", title: "Utilities & Owner Deductions", color: "green" as const,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7z" stroke="#1B5E4A" strokeWidth="1.5" strokeLinejoin="round" /><path d="M13 2v7h7" stroke="#1B5E4A" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    intro: "Owners should know who pays utilities and how deductions appear in monthly statements.",
    items: ["DEWA payment process confirmed", "Chiller / AC charges confirmed", "Internet payment confirmed", "Gas payment confirmed, if applicable", "Monthly deduction process confirmed", "Owner statement transparency confirmed"],
    question: "Do you pay utilities and deduct them from rental income, or should I pay them directly?",
    why: "Utility handling affects owner net income and monthly reporting clarity. Some operators pay utilities and deduct them from rentals to make the process easier for owners.",
  },
  {
    num: "10", title: "Property Protection & All-Risks Insurance", color: "bronze" as const,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 4v5c0 4.4-3 7.9-7 9-4-1.1-7-4.6-7-9V7l7-4z" stroke="#B88A44" strokeWidth="1.5" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="#B88A44" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    intro: "Owners should consider suitable insurance to protect their asset while the property is used for short-term rental.",
    items: ["Property insurance is in place", "Policy covers short-term rental usage", "Furniture, appliances, and contents are covered", "Accidental damage coverage is checked", "Landlord liability is reviewed", "Third-party liability insurance is clarified", "Holiday home exclusions are checked", "Claim process is understood"],
    question: "What insurance is included, and what additional cover should I arrange as the owner?",
    why: "Short-term rentals have higher guest turnover than long-term rentals. Owners should protect the property, furniture, appliances, fixtures, fittings, and overall asset value before going live.",
    advisory: "AssetIntel can guide owners toward suitable insurance options and connect them with the right insurance provider if needed. Owners should always confirm policy coverage directly with the insurer and ensure the policy is suitable for short-term rental use.",
  },
];

const OPERATOR_QUESTIONS = [
  "What are the one-time onboarding costs?",
  "Is the DET permit included or charged separately?",
  "Is third-party liability insurance included?",
  "Are smart locks required?",
  "Are linens and towels included or charged separately?",
  "Is photography included?",
  "Who handles utility payments?",
  "Will I receive an inventory list before go-live?",
  "Who pays for maintenance before listing?",
  "How are guest damages handled?",
  "How often will I receive owner statements?",
  "Can I review the listing before it goes live?",
  "What happens if the property underperforms?",
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function STRReadinessGuidePage() {
  const [showModal, setShowModal] = useState(false);

  // Flat array of all checkbox states: 10 categories × up to 9 items
  const allItemCounts = CATEGORIES.map(c => c.items.length);
  const totalItems = allItemCounts.reduce((a, b) => a + b, 0);
  const [checked, setChecked] = useState<boolean[]>(() => Array(totalItems).fill(false));

  const getOffset = (catIdx: number) => allItemCounts.slice(0, catIdx).reduce((a, b) => a + b, 0);
  const toggle = (flat: number) => setChecked(prev => { const n = [...prev]; n[flat] = !n[flat]; return n; });

  const totalChecked = checked.filter(Boolean).length;

  return (
    <div style={{ background: C.ivory, minHeight: "100vh" }}>
      {showModal && <ReadinessModal onClose={() => setShowModal(false)} />}

      <SiteNav active="self-manage" />

      {/* ── HERO ── */}
      <section style={{ background: C.section, borderBottom: `1px solid ${C.border}`, padding: "72px 24px 80px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "row", gap: 56, alignItems: "center", flexWrap: "wrap" }}>
          {/* Left */}
          <div style={{ flex: "1 1 480px", minWidth: 0 }}>
            <Eyebrow>STR Readiness Guide</Eyebrow>
            <h1 style={{ fontSize: "clamp(30px,4vw,52px)", fontFamily: serif, fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 18, background: `linear-gradient(130deg,${C.green} 0%,#2A7A58 44%,${C.bronze} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", maxWidth: 640 }}>
              Your Owner Checklist Before Going Live With An STR Operator
            </h1>
            <p style={{ fontSize: 15.5, color: "#4A4A42", lineHeight: 1.7, maxWidth: 580, marginBottom: 28 }}>
              Use this guide during conversations with any short-term rental operator to understand setup costs, property readiness, guest access, insurance, maintenance, utilities, and go-live requirements before you sign.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => setShowModal(true)}
                style={{ padding: "13px 26px", background: `linear-gradient(135deg,${C.bronze} 0%,#A07838 100%)`, color: "#fff", borderRadius: 12, fontSize: 14.5, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 6px 20px rgba(184,138,68,0.28)", letterSpacing: "0.01em" }}>
                Request STR Readiness Review
              </button>
              <a href="#checklist"
                style={{ display: "inline-flex", alignItems: "center", padding: "13px 22px", background: C.sage, color: C.green, border: `1.5px solid rgba(27,94,74,0.18)`, borderRadius: 12, fontSize: 14.5, fontWeight: 600, textDecoration: "none" }}>
                Start Checklist ↓
              </a>
            </div>
          </div>

          {/* Right — preview card */}
          <div style={{ flex: "0 0 auto", width: "min(320px, 100%)" }}>
            <div style={{ background: C.white, borderRadius: 22, border: `1.5px solid ${C.bronzeBdr}`, boxShadow: "0 20px 56px rgba(20,40,30,0.10), 0 4px 14px rgba(184,138,68,0.09)", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px 14px", background: `linear-gradient(135deg,rgba(27,94,74,0.06) 0%,rgba(184,138,68,0.07) 100%)`, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(184,138,68,0.12)", border: "1px solid rgba(184,138,68,0.20)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="1.5" stroke={C.bronze} strokeWidth="1.3" /><path d="M5 8l2 2 4-4" stroke={C.bronze} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: C.bronze, letterSpacing: "0.13em", textTransform: "uppercase" }}>Owner Readiness Checklist</p>
                </div>
              </div>
              <div style={{ padding: "14px 20px 18px" }}>
                {[
                  "Guest access confirmed",
                  "Furnishing photo-ready",
                  "Setup costs clarified",
                  "Insurance reviewed",
                  "Inventory documented",
                ].map((item, i) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, background: C.sage, border: `1.5px solid rgba(27,94,74,0.18)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke={C.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <span style={{ fontSize: 12.5, color: C.text, fontWeight: 500 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT THIS COVERS ── */}
      <section style={{ padding: "52px 24px 0" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.bronze, marginBottom: 8, textAlign: "center" }}>What This Checklist Helps You Confirm</p>
          <style>{`.rg-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; } @media(max-width:900px){.rg-4{grid-template-columns:repeat(2,1fr);}} @media(max-width:560px){.rg-4{grid-template-columns:1fr;}}`}</style>
          <div className="rg-4" style={{ marginTop: 20 }}>
            {[
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke={C.green} strokeWidth="1.5" strokeLinejoin="round" /></svg>, title: "Property Readiness", body: "Guest access, furnishing, photos, maintenance, and inventory." },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={C.bronze} strokeWidth="1.5" /><path d="M12 7v5l3 3" stroke={C.bronze} strokeWidth="1.5" strokeLinecap="round" /></svg>, title: "Operator Costs", body: "DET permit, insurance, linen sets, smart locks, photography, and onboarding charges." },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 4v5c0 4.4-3 7.9-7 9-4-1.1-7-4.6-7-9V7l7-4z" stroke={C.green} strokeWidth="1.5" strokeLinejoin="round" /></svg>, title: "Owner Protection", body: "Insurance, inventory records, damage handling, and utility deductions." },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke={C.bronze} strokeWidth="1.5" /><path d="M8 8h8M8 12h8M8 16h4" stroke={C.bronze} strokeWidth="1.5" strokeLinecap="round" /></svg>, title: "Go-Live Confidence", body: "Clear questions to ask before signing or handing over keys." },
            ].map((c, i) => (
              <div key={c.title} style={{ background: C.white, borderRadius: 16, border: `1px solid ${i % 2 === 0 ? C.sageBdr : C.bronzeBdr}`, padding: "18px 18px 16px" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: i % 2 === 0 ? C.sage : "#FBF6EE", border: `1px solid ${i % 2 === 0 ? "rgba(27,94,74,0.12)" : "rgba(184,138,68,0.16)"}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  {c.icon}
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>{c.title}</p>
                <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, margin: 0 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN CHECKLIST ── */}
      <section id="checklist" style={{ padding: "56px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          {/* Header + progress */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
            <div>
              <Eyebrow>Owner STR Readiness Checklist</Eyebrow>
              <h2 style={{ fontSize: "clamp(22px,2.8vw,34px)", fontFamily: serif, fontWeight: 600, color: C.green, marginBottom: 6 }}>Use these checkpoints before going live</h2>
              <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>Tick each item as you review it. Use this during your operator call or before signing.</p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 31, fontWeight: 600, color: C.green, fontFamily: serif, lineHeight: 1 }}>{totalChecked}<span style={{ fontSize: 18, color: C.muted, fontWeight: 400 }}> / {totalItems}</span></div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>items confirmed</div>
              <div style={{ marginTop: 8, height: 6, width: 120, borderRadius: 3, background: C.border, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg,${C.green},#2A7A58)`, width: `${(totalChecked / totalItems) * 100}%`, transition: "width 0.2s" }} />
              </div>
            </div>
          </div>

          {/* Category cards */}
          <style>{`.rg-cats { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; } @media(max-width:760px){.rg-cats{grid-template-columns:1fr;}}`}</style>
          <div className="rg-cats">
            {CATEGORIES.map((cat, catIdx) => {
              const offset = getOffset(catIdx);
              const isGreen = cat.color === "green";
              const accent = isGreen ? C.green : C.bronze;
              const catChecked = cat.items.filter((_, i) => checked[offset + i]).length;
              const catDone = catChecked === cat.items.length;
              return (
                <div key={cat.num} style={{ background: C.white, borderRadius: 18, border: `1px solid ${catDone ? "rgba(27,94,74,0.18)" : isGreen ? C.sageBdr : C.bronzeBdr}`, boxShadow: catDone ? "0 0 0 1px rgba(27,94,74,0.08), 0 6px 20px rgba(27,94,74,0.06)" : "0 2px 8px rgba(0,0,0,0.03)", overflow: "hidden", transition: "box-shadow 0.18s, border-color 0.18s" }}>
                  {/* Category header */}
                  <div style={{ padding: "16px 18px 12px", background: isGreen ? "rgba(27,94,74,0.035)" : "rgba(184,138,68,0.04)", borderBottom: `1px solid ${isGreen ? "rgba(27,94,74,0.07)" : "rgba(184,138,68,0.10)"}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: isGreen ? C.sage : "#FBF6EE", border: `1px solid ${isGreen ? "rgba(27,94,74,0.14)" : "rgba(184,138,68,0.18)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {cat.icon}
                        </div>
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 1 }}>Category {cat.num}</p>
                          <p style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.3, margin: 0 }}>{cat.title}</p>
                        </div>
                      </div>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: catDone ? C.green : accent, background: catDone ? C.sage : isGreen ? "rgba(27,94,74,0.06)" : "rgba(184,138,68,0.08)", padding: "3px 10px", borderRadius: 20, flexShrink: 0 }}>
                        {catChecked}/{cat.items.length}
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, marginTop: 10, marginBottom: 0 }}>{cat.intro}</p>
                  </div>

                  {/* Checklist items */}
                  <div style={{ padding: "12px 18px 4px" }}>
                    {cat.items.map((item, i) => (
                      <div key={item} style={{ borderBottom: i < cat.items.length - 1 ? `1px solid rgba(226, 232, 229,0.5)` : "none" }}>
                        <CheckItem label={item} checked={checked[offset + i]} onToggle={() => toggle(offset + i)} />
                      </div>
                    ))}
                  </div>

                  {/* Ask / Why */}
                  <div style={{ padding: "4px 18px 16px" }}>
                    <QuestionPanel q={cat.question} />
                    <WhyNote text={cat.why} />
                    {(cat as any).advisory && (
                      <div style={{ marginTop: 8, padding: "10px 14px", background: "rgba(184,138,68,0.06)", borderRadius: 9, border: "1px solid rgba(184,138,68,0.14)" }}>
                        <p style={{ fontSize: 11.5, color: "#9A7A3A", lineHeight: 1.6, margin: 0 }}>{(cat as any).advisory}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── OPERATOR QUESTIONS ── */}
      <section style={{ background: C.section, borderTop: `1px solid ${C.border}`, padding: "56px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <Eyebrow>Before Signing With An Operator</Eyebrow>
            <h2 style={{ fontSize: "clamp(20px,2.6vw,30px)", fontFamily: serif, fontWeight: 600, color: C.green, marginBottom: 8 }}>Questions To Ask Before Signing</h2>
            <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.65 }}>Use these questions during your operator call or before signing the management agreement.</p>
          </div>
          <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.sageBdr}`, padding: "24px 26px" }}>
            <style>{`.rg-q2 { display:grid; grid-template-columns:repeat(2,1fr); gap:6px 28px; } @media(max-width:620px){.rg-q2{grid-template-columns:1fr;}}`}</style>
            <div className="rg-q2">
              {OPERATOR_QUESTIONS.map((q, i) => (
                <div key={q} style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "9px 0", borderBottom: `1px solid rgba(226, 232, 229,0.5)` }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="7" cy="7" r="6" stroke={C.green} strokeWidth="1.1" opacity="0.35" /><path d="M4.5 7L6.5 9L9.5 5" stroke={C.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.55 }}>{q}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: C.light, marginTop: 18, padding: "10px 14px", background: "rgba(27,94,74,0.03)", borderRadius: 8, border: `1px solid ${C.sageBdr}` }}>
              Ask for important cost items and responsibilities in writing before signing.
            </p>
          </div>
        </div>
      </section>

      {/* ── OWNER PROTECTION PANEL ── */}
      <section style={{ padding: "48px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ background: `linear-gradient(135deg,rgba(27,94,74,0.06) 0%,rgba(184,138,68,0.05) 100%)`, borderRadius: 22, border: `1px solid rgba(27,94,74,0.10)`, padding: "32px 32px 28px" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 22 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.sage, border: "1px solid rgba(27,94,74,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 4v5c0 4.4-3 7.9-7 9-4-1.1-7-4.6-7-9V7l7-4z" stroke={C.green} strokeWidth="1.5" strokeLinejoin="round" /></svg>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.green, marginBottom: 4 }}>Owner Protection</p>
                <h3 style={{ fontSize: "clamp(18px,2.2vw,24px)", fontFamily: serif, fontWeight: 600, color: C.green, lineHeight: 1.2 }}>Protect The Property Before You Chase Income</h3>
              </div>
            </div>
            <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, marginBottom: 22, maxWidth: 760 }}>
              Strong STR income depends on more than demand. Owners should protect the asset, clarify operator costs, confirm insurance, document inventory, and ensure the property is guest-ready before going live.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Protect your asset with proper insurance and inventory records",
                "Clarify all setup charges before signing",
                "Make the property photo-ready before listing",
              ].map(point => (
                <div key={point} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <span style={{ fontSize: 13.5, color: C.text, lineHeight: 1.55, fontWeight: 500 }}>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: C.section, borderTop: `1px solid ${C.border}`, padding: "64px 24px" }}>
        <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow>Get Started</Eyebrow>
          <h2 style={{ fontSize: "clamp(22px,3vw,34px)", fontFamily: serif, fontWeight: 600, color: C.green, marginBottom: 14, lineHeight: 1.25 }}>Need Help Reviewing Your STR Readiness?</h2>
          <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.7, marginBottom: 28 }}>
            AssetIntel can help you review operator requirements, setup costs, insurance options, furnishing readiness, maintenance condition, utilities handling, and go-live preparation before you commit.
          </p>
          <button onClick={() => setShowModal(true)}
            style={{ padding: "14px 32px", background: `linear-gradient(135deg,${C.bronze} 0%,#A07838 100%)`, color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 6px 20px rgba(184,138,68,0.28)" }}>
            Request STR Readiness Review →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: C.section, borderTop: `1px solid ${C.border}`, padding: "24px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: 13, color: C.muted }}>AssetIntel — Dubai Property Intelligence</span>
          <span style={{ fontSize: 12, color: C.light }}>© {new Date().getFullYear()} AssetIntel. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
