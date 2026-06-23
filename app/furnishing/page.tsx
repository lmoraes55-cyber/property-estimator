"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import React from "react";
import { FURNISHING_COMPANIES, DET_INVENTORY_CHECKLIST } from "@/lib/furnishing";
import { colors } from "@/lib/colors";
import AssetIntelLogo from "@/components/AssetIntelLogo";

const C = {
  green: "#1B5E4A",
  greenDark: "#133D30",
  gold: "#B88A44",
  ivory: "#FDFBF7",
  bg: "#F8F4EE",
  border: "#E6E1D8",
  borderLight: "#F0EDE8",
  text: "#1B2A1F",
  muted: "#6B6B6B",
  subtle: "#888",
};

const gradStyle: React.CSSProperties = {
  background: `linear-gradient(90deg, #1B5E4A 0%, #B88A44 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

// Maps sidebar checklist names → DET_INVENTORY_CHECKLIST category substrings
const DET_MAP: Record<string, string> = {
  "Living Room": "Living Room",
  "Bedroom": "Bedroom",
  "Kitchen": "Kitchen",
  "Bathroom": "Bathroom",
  "Balcony": "Safety",         // reuse Safety & Comfort as a proxy
  "Guest Essentials": "Additional",
};

function FurnishingContent() {
  const params = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"self" | "3rdparty" | "operator">("self");
  const [openChecklist, setOpenChecklist] = useState<string | null>("Living Room");
  const [showModal, setShowModal] = useState(false);
  const [modalSubmitted, setModalSubmitted] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalForm, setModalForm] = useState({
    name: "", email: "", phone: "", property: "", budget: "", path: "", message: "",
  });

  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: "", email: "", phone: "", property: "", pkg: "", path: "", budget: "", message: "",
  });

  const propertyName = params.get("propertyName") ?? "";
  const buildingName = params.get("buildingName") ?? propertyName;
  const rawUnit = params.get("unitSize") ?? "2BR";
  const floor = params.get("floor") ?? "";

  const unitLabel =
    rawUnit === "STU" ? "Studio"
    : rawUnit === "1BR" ? "1BR"
    : rawUnit === "2BR" ? "2BR"
    : rawUnit === "3BR" ? "3BR"
    : rawUnit === "4BR" ? "4BR"
    : rawUnit;

  const displayName = buildingName || propertyName || "Your Property";

  const openGuidanceModal = () => {
    setModalForm(f => ({ ...f, property: displayName }));
    setShowModal(true);
  };

  const openQuoteModal = (pkgName: string) => {
    setQuoteForm(f => ({ ...f, property: displayName, pkg: pkgName }));
    setShowQuoteModal(true);
  };

  const handleQuoteSubmit = async () => {
    setQuoteSubmitting(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "furnishing_quote",
          name: quoteForm.name,
          email: quoteForm.email,
          phone: quoteForm.phone,
          property: quoteForm.property || displayName,
          unitSize: rawUnit,
          message: `Package: ${quoteForm.pkg} | Path: ${quoteForm.path} | Budget: ${quoteForm.budget}${quoteForm.message ? " | Notes: " + quoteForm.message : ""}`,
        }),
      });
    } catch { /* silent */ }
    setQuoteSubmitting(false);
    setQuoteSubmitted(true);
  };

  const handleModalSubmit = async () => {
    setModalSubmitting(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "furnishing_guidance",
          name: modalForm.name,
          email: modalForm.email,
          phone: modalForm.phone,
          property: modalForm.property || displayName,
          unitSize: rawUnit,
          message: `Budget: ${modalForm.budget} | Path: ${modalForm.path}${modalForm.message ? " | Notes: " + modalForm.message : ""}`,
        }),
      });
    } catch { /* silent */ }
    setModalSubmitting(false);
    setModalSubmitted(true);
  };

  // ── Tabs ────────────────────────────────────────────────
  const tabs = [
    {
      id: "self" as const, label: "Self Furnish (DIY)", sub: "Full control & best value",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2"/><path d="M2 9a2 2 0 0 1 2 2v2h16v-2a2 2 0 0 1 2-2"/><path d="M4 13v4h16v-4"/><path d="M6 17v2M18 17v2"/></svg>,
    },
    {
      id: "3rdparty" as const, label: "Interior Design Firms", sub: "Curated by our team",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
    },
    {
      id: "operator" as const, label: "Operator Furnished", sub: "Hands-off & hassle-free",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    },
  ];

  // ── Package cards ────────────────────────────────────────
  const COLLAGE = "/furnishing-collage.png";
  // object-position values to crop each room from the collage
  const packages = [
    { name: "ESSENTIAL", sub: "Clean. Comfortable. Guest-Ready.", price: "AED 12,900 – 15,900", tags: ["Modern", "Warm Neutral"], badge: null, img: COLLAGE, imgPos: "0% 15%", highlight: false },
    { name: "SIGNATURE", sub: "Stylish. Balanced. Standout.", price: "AED 17,900 – 22,900", tags: ["Contemporary", "Sage & Taupe"], badge: "Most Popular", img: "/furnishing-signature.png", imgPos: "center center", highlight: true },
    { name: "LUXE", sub: "Premium. Timeless. Unforgettable.", price: "AED 27,900 – 34,900", tags: ["Luxury", "Deep Neutrals"], badge: null, img: "/furnishing-premium.png", imgPos: "center center", highlight: false },
  ];

  // ── Sidebar checklist rows ───────────────────────────────
  const checklistRows = [
    { name: "Living Room", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2"/><path d="M2 9a2 2 0 0 1 2 2v2h16v-2a2 2 0 0 1 2-2"/><path d="M4 13v4h16v-4"/><path d="M6 17v2M18 17v2"/></svg> },
    { name: "Bedroom", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg> },
    { name: "Kitchen", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg> },
    { name: "Bathroom", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6 9.01 6"/><path d="M3 20h18v-2a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v2z"/><path d="M3 13v-2a2 2 0 0 1 2-2h1V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4h1a2 2 0 0 1 2 2v2"/></svg> },
    { name: "Balcony", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg> },
    { name: "Guest Essentials", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  ];

  // ── Owner education cards ────────────────────────────────
  const ownerCards = [
    { t: "DET Compliance", s: "What's required & why it matters", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
    { t: "Guest-Ready Essentials", s: "Small touches, big impact", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
    { t: "Linen Standards", s: "What guests expect", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { t: "Smart Lock Ready", s: "Seamless check-in experience", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
    { t: "Photography & Styling", s: "Boost bookings with better photos", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> },
    { t: "Maintenance Tips", s: "Keep your home 5-star ready", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> },
  ];

  // Inspiration strip: crop different rooms from the collage
  const inspirationImgs = [
    { src: COLLAGE, pos: "0% 15%", label: "Living Room" },
    { src: COLLAGE, pos: "85% 10%", label: "Bedroom" },
    { src: COLLAGE, pos: "85% 52%", label: "Kitchen" },
    { src: COLLAGE, pos: "0% 82%", label: "Bathroom" },
    { src: COLLAGE, pos: "47% 82%", label: "Balcony" },
    { src: COLLAGE, pos: "92% 82%", label: "Dining" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "inherit" }}>

      {/* ── GUIDANCE MODAL ──────────────────────────────── */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => { setShowModal(false); setModalSubmitted(false); }}
        >
          <div
            style={{ background: C.ivory, borderRadius: 24, padding: "32px 28px", maxWidth: 480, width: "100%", boxShadow: "0 24px 72px rgba(0,0,0,0.2)", position: "relative", maxHeight: "90vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => { setShowModal(false); setModalSubmitted(false); }} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.subtle, lineHeight: 1 }}>×</button>
            {!modalSubmitted ? (
              <>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: C.gold, textTransform: "uppercase", marginBottom: 6 }}>AssetIntel Advisory</p>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: C.green, marginBottom: 6, fontFamily: "'Georgia', serif" }}>Furnishing Guidance Request</h2>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>We'll match you with the right furnishing path for your property and budget.</p>
                {[
                  { label: "Full Name", key: "name", type: "text", ph: "Your full name" },
                  { label: "Email", key: "email", type: "email", ph: "your@email.com" },
                  { label: "Phone / WhatsApp", key: "phone", type: "tel", ph: "+971 50 000 0000" },
                  { label: "Building / Property", key: "property", type: "text", ph: displayName || "e.g. Marina Gate" },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>{f.label}</label>
                    <input
                      type={f.type}
                      value={modalForm[f.key as keyof typeof modalForm]}
                      onChange={e => setModalForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.ph}
                      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, background: C.ivory, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                ))}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Budget Range</label>
                  <select value={modalForm.budget} onChange={e => setModalForm(p => ({ ...p, budget: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, background: C.ivory, outline: "none" }}>
                    <option value="">Select budget</option>
                    {["AED 10k–15k", "AED 15k–25k", "AED 25k–40k", "AED 40k+", "Not sure yet"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Preferred Furnishing Path</label>
                  <select value={modalForm.path} onChange={e => setModalForm(p => ({ ...p, path: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, background: C.ivory, outline: "none" }}>
                    <option value="">Select path</option>
                    {["Self Furnish", "Interior Designer", "Operator Furnished", "Not sure yet"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <button onClick={handleModalSubmit} disabled={modalSubmitting}
                  style={{ width: "100%", padding: 13, background: C.green, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(27,94,74,0.25)" }}>
                  {modalSubmitting ? "Submitting…" : "Submit Request"}
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#EEF5F1", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.green, marginBottom: 8 }}>Request received</h3>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>Thank you — your furnishing guidance request has been received. AssetIntel will review your details and contact you with suitable next steps.</p>
                <button onClick={() => { setShowModal(false); setModalSubmitted(false); setModalForm({ name:"",email:"",phone:"",property:"",budget:"",path:"",message:"" }); }}
                  style={{ marginTop: 20, padding: "10px 28px", background: C.green, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── QUOTE MODAL ─────────────────────────────────── */}
      {showQuoteModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => { setShowQuoteModal(false); setQuoteSubmitted(false); }}
        >
          <div
            style={{ background: C.ivory, borderRadius: 24, padding: "32px 28px", maxWidth: 500, width: "100%", boxShadow: "0 24px 72px rgba(0,0,0,0.2)", position: "relative", maxHeight: "90vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => { setShowQuoteModal(false); setQuoteSubmitted(false); }} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.subtle, lineHeight: 1 }}>×</button>
            {!quoteSubmitted ? (
              <>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: C.gold, textTransform: "uppercase", marginBottom: 6 }}>AssetIntel · Furnishing</p>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, fontFamily: "'Georgia', serif", ...gradStyle }}>Furnishing Quote Request</h2>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>Tell us about your property and the furnishing package you are interested in. AssetIntel will review your requirements and guide you on the next step.</p>
                {[
                  { label: "Full Name", key: "name", type: "text", ph: "Your full name" },
                  { label: "Email", key: "email", type: "email", ph: "your@email.com" },
                  { label: "Phone / WhatsApp", key: "phone", type: "tel", ph: "+971 50 000 0000" },
                  { label: "Building / Property Name", key: "property", type: "text", ph: displayName || "e.g. Marina Gate" },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>{f.label}</label>
                    <input
                      type={f.type}
                      value={quoteForm[f.key as keyof typeof quoteForm]}
                      onChange={e => setQuoteForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.ph}
                      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, background: C.ivory, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Unit Size</label>
                    <input type="text" value={unitLabel} readOnly style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, background: "#F5F2ED", outline: "none", boxSizing: "border-box", color: C.muted }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Selected Package</label>
                    <select value={quoteForm.pkg} onChange={e => setQuoteForm(p => ({ ...p, pkg: e.target.value }))}
                      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, background: C.ivory, outline: "none" }}>
                      <option value="">Select package</option>
                      {["ESSENTIAL", "SIGNATURE", "LUXE"].map(o => <option key={o} value={o}>{o.charAt(0) + o.slice(1).toLowerCase()}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Preferred Furnishing Path</label>
                  <select value={quoteForm.path} onChange={e => setQuoteForm(p => ({ ...p, path: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, background: C.ivory, outline: "none" }}>
                    <option value="">Select path</option>
                    {["Self Furnish", "Interior Design Firm", "Operator Furnished", "Not sure yet"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Budget Range</label>
                  <select value={quoteForm.budget} onChange={e => setQuoteForm(p => ({ ...p, budget: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, background: C.ivory, outline: "none" }}>
                    <option value="">Select budget</option>
                    {["AED 10k–15k", "AED 15k–25k", "AED 25k–40k", "AED 40k+", "Not sure yet"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Message / Notes</label>
                  <textarea value={quoteForm.message} onChange={e => setQuoteForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Any specific requirements, timeline, or questions..."
                    rows={3}
                    style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, background: C.ivory, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                </div>
                <button onClick={handleQuoteSubmit} disabled={quoteSubmitting}
                  style={{ width: "100%", padding: 13, background: C.green, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(27,94,74,0.25)" }}>
                  {quoteSubmitting ? "Submitting…" : "Submit Quote Request"}
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#EEF5F1", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.green, marginBottom: 8 }}>Quote request received</h3>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>Thank you — your furnishing quote request has been received. AssetIntel will review your details and contact you with suitable furnishing options.</p>
                <button onClick={() => { setShowQuoteModal(false); setQuoteSubmitted(false); setQuoteForm({ name:"",email:"",phone:"",property:"",pkg:"",path:"",budget:"",message:"" }); }}
                  style={{ marginTop: 20, padding: "10px 28px", background: C.green, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TOP BAR ─────────────────────────────────────── */}
      <div style={{ position: "sticky", top: 0, zIndex: 200, padding: "12px 16px" }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          background: "rgba(250,250,247,0.94)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
          border: `1px solid ${C.border}`, borderRadius: 24,
          boxShadow: "0 2px 4px rgba(0,0,0,0.03), 0 8px 28px rgba(27,94,74,0.09)",
          display: "flex", alignItems: "center", padding: "0 20px", height: 68, gap: 14,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, cursor: "pointer" }} onClick={() => router.push("/")}>
            <AssetIntelLogo size={32} />
            <div style={{ lineHeight: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#2A2A2A", letterSpacing: "-0.01em", margin: 0 }}>Asset<span style={{ color: C.green }}>Intel</span></p>
              <p style={{ fontSize: 9, color: C.subtle, letterSpacing: "0.13em", textTransform: "uppercase", marginTop: 2, margin: 0 }}>Property Intelligence</p>
            </div>
          </div>
          <div style={{ width: 1, height: 24, background: C.border, flexShrink: 0 }} />
          {/* Back */}
          <button onClick={() => router.back()} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 10, border: `1px solid #D8D4CC`, background: "#FFF", color: C.green, cursor: "pointer", fontWeight: 600, flexShrink: 0, display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to property
          </button>
          <div style={{ width: 1, height: 24, background: C.border, flexShrink: 0 }} />
          {/* Property context */}
          <div style={{ flexShrink: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#2A2A2A", lineHeight: 1.2, margin: 0 }}>{displayName}</p>
            <p style={{ fontSize: 11, color: C.subtle, lineHeight: 1, margin: 0 }}>{unitLabel}{floor ? ` · Floor ${floor}` : ""}</p>
          </div>
          <div style={{ width: 1, height: 24, background: C.border, flexShrink: 0 }} />
          {/* Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFF8ED", border: "1px solid #C9A84C55", borderRadius: 20, padding: "5px 12px", flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: C.gold, textTransform: "uppercase" }}>Furnishing Packages</span>
          </div>
          <div style={{ flex: 1 }} />
          {/* Expert CTA */}
          <button onClick={openGuidanceModal} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 18px", background: C.green, color: "#fff",
            border: "none", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(27,94,74,0.22)", flexShrink: 0, whiteSpace: "nowrap",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 5.89 5.89l1.02-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z"/></svg>
            Talk to a Furnishing Expert
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* ── HERO ───────────────────────────────────────── */}
        <div style={{
          position: "relative", overflow: "hidden", isolation: "isolate",
          borderRadius: 28, marginBottom: 32,
          background: C.ivory, border: `1px solid ${C.border}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 12px 40px rgba(27,94,74,0.08)",
          minHeight: 400,
        }}>
          {/* Background image — full width so gradient has full range to blend */}
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0,
            backgroundImage: "url('/HeroFurnishing.png')",
            backgroundSize: "cover", backgroundPosition: "center right",
            pointerEvents: "none", zIndex: 0,
          }} />
          {/* Gradient overlay — solid ivory left, smooth dissolve through center */}
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
            background: `
              linear-gradient(to right, #FCFAF5 0%, #FCFAF5 28%, rgba(252,250,245,0.96) 36%, rgba(252,250,245,0.80) 46%, rgba(252,250,245,0.45) 58%, rgba(252,250,245,0.12) 72%, rgba(252,250,245,0.00) 88%),
              linear-gradient(to bottom, rgba(252,250,245,0.00) 0%, rgba(252,250,245,0.15) 70%, #FCFAF5 100%)
            `,
          }} />
          {/* Hero content */}
          <div style={{ position: "relative", zIndex: 2, padding: "52px 44px", maxWidth: "52%", minHeight: 400, display: "flex", flexDirection: "column", justifyContent: "center" }} className="fh-hero-content">
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: C.gold, textTransform: "uppercase", margin: "0 0 14px" }}>PART 3 OF 3</p>
            <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.08, fontFamily: "'Georgia', serif", margin: "0 0 16px", ...gradStyle }}>
              Furnishing<br />Your {unitLabel}
            </h1>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, maxWidth: 360, margin: "0 0 28px" }}>
              Choose how you&apos;d like to furnish your property. All options are DET-compliant, guest-ready, and designed to perform.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => document.getElementById("pkg-section")?.scrollIntoView({ behavior: "smooth" })}
                style={{ padding: "12px 22px", background: C.green, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(27,94,74,0.28)", display: "flex", alignItems: "center", gap: 8 }}>
                Explore Packages
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button onClick={openGuidanceModal}
                style={{ padding: "12px 22px", background: "transparent", color: C.green, border: `1.5px solid rgba(27,94,74,0.3)`, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Request Guidance
              </button>
            </div>
            {/* Badges — bottom-left of hero */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 36 }}>
              {[
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, t: "DET Compliant Standards" },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>, t: "Guest-Ready from Day One" },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, t: "Higher Reviews Better Returns" },
              ].map(b => (
                <div key={b.t} style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(27,94,74,0.09)", border: `1px solid rgba(27,94,74,0.18)`, borderRadius: 20, padding: "6px 12px", color: C.green }}>
                  {b.icon}
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{b.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT FLOW ─────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {/* Package type tabs */}
            <div id="pkg-section" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {tabs.map(tab => {
                const active = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="fh-tab"
                    style={{
                      flex: 1, minWidth: 160, padding: "15px 18px",
                      borderRadius: 18, border: active ? "none" : `1px solid ${C.border}`,
                      background: active ? C.green : C.ivory,
                      color: active ? "#fff" : C.text,
                      cursor: "pointer", textAlign: "left",
                      boxShadow: active ? "0 6px 22px rgba(27,94,74,0.25)" : "0 1px 4px rgba(0,0,0,0.04)",
                      transition: "all 0.18s",
                      display: "flex", alignItems: "center", gap: 14,
                    }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, background: active ? "rgba(255,255,255,0.14)" : "#EEF5F1", display: "flex", alignItems: "center", justifyContent: "center", color: active ? "#fff" : C.green }}>
                      {tab.icon}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>{tab.label}</p>
                      <p style={{ fontSize: 11, margin: "3px 0 0", opacity: active ? 0.76 : 0.52 }}>{tab.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ── DIY TAB ── */}
            {activeTab === "self" && (
              <>
                {/* Section header */}
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px", fontFamily: "'Georgia', serif", ...gradStyle }}>Curated DIY Packages by AssetIntel</h2>
                    <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Designer-curated furniture packages tailored for {unitLabel} homes in Dubai, built to help owners furnish with STR readiness, guest appeal, and DET compliance in mind.</p>
                  </div>
                  <button style={{ fontSize: 12, fontWeight: 600, color: C.gold, background: "none", border: "none", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    Compare Packages
                  </button>
                </div>

                {/* Package cards */}
                <div className="fh-cards" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                  {packages.map(pkg => (
                    <div key={pkg.name} style={{
                      background: C.ivory, borderRadius: 20, overflow: "hidden",
                      border: pkg.highlight ? `1.5px solid ${C.green}` : `1px solid ${C.border}`,
                      boxShadow: pkg.highlight ? "0 8px 28px rgba(27,94,74,0.14)" : "0 2px 10px rgba(0,0,0,0.04)",
                      display: "flex", flexDirection: "column",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}>
                      <div style={{ position: "relative", height: 160, overflow: "hidden", flexShrink: 0 }}>
                        <img src={pkg.img} alt={pkg.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pkg.imgPos }} />
                        {pkg.badge && (
                          <div style={{ position: "absolute", top: 10, right: 10, background: C.green, color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            {pkg.badge}
                          </div>
                        )}
                      </div>
                      <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: C.gold, textTransform: "uppercase", margin: "0 0 4px" }}>{pkg.name}</p>
                        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 10px", lineHeight: 1.45 }}>{pkg.sub}</p>
                        <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0 0 10px" }}>{pkg.price}</p>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                          {pkg.tags.map(t => (
                            <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: "#EEF5F1", color: C.green }}>{t}</span>
                          ))}
                        </div>
                        <button onClick={() => openQuoteModal(pkg.name)} style={{
                          marginTop: "auto", width: "100%", padding: "10px",
                          background: pkg.highlight ? C.green : "transparent",
                          color: pkg.highlight ? "#fff" : C.green,
                          border: pkg.highlight ? "none" : `1.5px solid ${C.green}`,
                          borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                          boxShadow: pkg.highlight ? "0 4px 12px rgba(27,94,74,0.2)" : "none",
                        }}>
                          Request a Quote →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Support strip */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderRadius: 14, background: C.ivory, border: `1px solid ${C.border}` }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>AssetIntel-curated packages can help owners save time, stay guest-ready, and understand the furnishing standard required before going live.</p>
                </div>

              </>
            )}

            {/* ── INTERIOR DESIGN FIRMS TAB ── */}
            {activeTab === "3rdparty" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 4px", fontFamily: "'Georgia', serif" }}>Interior Design Firms</h2>
                  <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Top firms specializing in DET-compliant holiday home furnishing. All handle end-to-end: design, sourcing, installation, and compliance handover.</p>
                </div>
                {FURNISHING_COMPANIES.map((company, idx) => (
                  <div key={company.id} style={{
                    background: C.ivory, borderRadius: 20, padding: 24,
                    border: `1px solid ${idx === 0 ? C.green + "44" : C.border}`,
                    boxShadow: idx === 0 ? "0 4px 20px rgba(27,94,74,0.10)" : "0 1px 4px rgba(0,0,0,0.04)",
                  }}>
                    {idx === 0 && (
                      <span style={{ display: "inline-block", fontSize: 10, padding: "4px 10px", borderRadius: 20, fontWeight: 700, marginBottom: 12, background: "#EEF5F1", color: C.green, border: `1px solid rgba(27,94,74,0.2)` }}>Top Rated</span>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                      <div>
                        <p style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 2px" }}>{company.name}</p>
                        <p style={{ fontSize: 12, color: C.subtle, margin: 0 }}>{company.projectsCompleted}+ projects since {company.founded}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 22, fontWeight: 700, color: C.gold, margin: "0 0 2px" }}>{company.googleRating}</p>
                        <p style={{ fontSize: 11, color: C.subtle, margin: 0 }}>{company.googleReviewCount} reviews</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                      {company.specialties.map(s => (
                        <span key={s} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "#EEF5F1", color: C.green }}>{s}</span>
                      ))}
                    </div>
                    <button onClick={openGuidanceModal} style={{
                      width: "100%", padding: 11, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      background: idx === 0 ? "linear-gradient(135deg, #B8893F, #C69A4A)" : "transparent",
                      color: idx === 0 ? "#fff" : C.green,
                      border: idx === 0 ? "none" : `1.5px solid ${C.green}`,
                      boxShadow: idx === 0 ? "0 4px 14px rgba(184,138,68,0.22)" : "none",
                    }}>
                      {idx === 0 ? `Contact ${company.name} for Quote` : `Enquire about ${company.name}`}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── OPERATOR FURNISHED TAB ── */}
            {activeTab === "operator" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 4px", fontFamily: "'Georgia', serif" }}>Operator-Provided Furnishing</h2>
                  <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Your chosen operator provides fully DET-compliant furnishing as part of their service. The easiest path — they handle everything from design to handover.</p>
                </div>
                <div style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 16 }}>How It Works</p>
                  {[
                    "Review the top operators from your report results",
                    "Contact 2–3 operators directly via their contact information",
                    "Request a furnishing quotation tailored to your property size",
                    "Operators provide: design options, DET compliance guarantee, timeline, and pricing",
                    "Choose the best fit and hand over furnishing before your property goes live",
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" }}>
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#EEF5F1", color: C.green, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                      <p style={{ fontSize: 13, color: "#555", lineHeight: 1.55, paddingTop: 3, margin: 0 }}>{step}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => router.back()} style={{ padding: "11px 22px", background: "transparent", color: C.green, border: `1.5px solid rgba(27,94,74,0.25)`, borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                    Back to Operators
                  </button>
                  <button onClick={openGuidanceModal} style={{ padding: "11px 22px", background: C.green, color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(27,94,74,0.22)" }}>
                    Ask a Furnishing Expert
                  </button>
                </div>
              </div>
            )}

          {/* ── DET COMPLIANCE CHECKLIST (full-width) ─────── */}
          <div style={{ background: "#FFFEFA", border: "1px solid rgba(35,93,72,0.10)", borderRadius: 24, overflow: "hidden", boxShadow: "0 8px 32px rgba(20,48,38,0.06), 0 2px 8px rgba(20,48,38,0.03)" }}>
            <div style={{ padding: "28px 32px 20px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: C.gold, textTransform: "uppercase", margin: "0 0 6px" }}>DET Compliance Checklist</p>
              <p style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", fontFamily: "'Georgia', serif", ...gradStyle }}>DIY Furnishing Checklist</p>
              <p style={{ fontSize: 13, color: C.subtle, margin: 0 }}>For owners who want to self-furnish, this checklist shows the key items usually required to make the property guest-ready and aligned with DET holiday home standards.</p>
            </div>
            <div className="fh-det-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: `1px solid ${C.borderLight}` }}>
              {[checklistRows.slice(0, 3), checklistRows.slice(3)].map((col, ci) => (
                <div key={ci} style={{ borderRight: ci === 0 ? `1px solid ${C.borderLight}` : "none" }}>
                  {col.map(row => {
                    const key = DET_MAP[row.name] ?? row.name;
                    const detSection = DET_INVENTORY_CHECKLIST.find(c => c.category.toLowerCase().includes(key.toLowerCase()));
                    const isOpen = openChecklist === row.name;
                    return (
                      <div key={row.name} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                        <button onClick={() => setOpenChecklist(isOpen ? null : row.name)}
                          style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 24px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                          <div style={{ width: 32, height: 32, borderRadius: 9, background: "#EEF5F1", display: "flex", alignItems: "center", justifyContent: "center", color: C.green, flexShrink: 0 }}>
                            {row.icon}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#2A2A2A", flex: 1 }}>{row.name}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#EEF5F1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.subtle} strokeWidth="2" strokeLinecap="round"
                              style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                              <polyline points="6 9 12 15 18 9"/>
                            </svg>
                          </div>
                        </button>
                        {isOpen && detSection && (
                          <div style={{ padding: "0 24px 16px 68px" }}>
                            {detSection.items.slice(0, 5).map(item => (
                              <div key={item} style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "flex-start" }}>
                                <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.gold, flexShrink: 0, marginTop: 7 }} />
                                <p style={{ fontSize: 12, color: "#666", lineHeight: 1.5, margin: 0 }}>{item}</p>
                              </div>
                            ))}
                            {detSection.items.length > 5 && (
                              <p style={{ fontSize: 11, color: C.gold, fontWeight: 600, margin: "4px 0 0" }}>+{detSection.items.length - 5} more items</p>
                            )}
                          </div>
                        )}
                        {isOpen && !detSection && (
                          <div style={{ padding: "0 24px 16px 68px" }}>
                            <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Outdoor seating, balcony accessories, and privacy screening as applicable.</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div style={{ padding: "14px 32px", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => {
                const p = new URLSearchParams();
                p.set("unitSize", rawUnit);
                if (propertyName) p.set("propertyName", propertyName);
                if (buildingName) p.set("buildingName", buildingName);
                window.open(`/furnishing/checklist?${p.toString()}`, "_blank");
              }} style={{ fontSize: 12, fontWeight: 600, color: C.gold, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                View Full Checklist
              </button>
            </div>
            <div style={{ padding: "0 32px 24px" }}>
              <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: 14 }}>
                <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, margin: 0 }}>
                  <span style={{ fontWeight: 700, color: C.text }}>Note: </span>
                  This checklist is a practical guide for self-furnishing. Final requirements may vary depending on the operator, building rules, DET requirements, and the guest-ready standard needed for your property. Operators may still request their own linen, towels, smart lock, photography, or guest supply standards.
                </p>
              </div>
            </div>
          </div>

          {/* ── WHAT EVERY OWNER SHOULD KNOW (full-width) ── */}
          <div style={{ background: "#FFFEFA", border: "1px solid rgba(35,93,72,0.10)", borderRadius: 24, padding: "28px 32px", boxShadow: "0 8px 32px rgba(20,48,38,0.06), 0 2px 8px rgba(20,48,38,0.03)" }}>
            <p style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px", fontFamily: "'Georgia', serif", ...gradStyle }}>What Every Owner Should Know</p>
            <p style={{ fontSize: 13, color: C.subtle, margin: "0 0 22px" }}>Key guidelines that protect your investment and your guests.</p>
            <div className="fh-owner-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {ownerCards.map(card => (
                <div key={card.t} style={{ padding: "18px 16px", borderRadius: 16, background: C.bg, border: "1px solid rgba(35,93,72,0.08)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF8ED", border: "1px solid rgba(184,138,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>{card.icon}</div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: "0 0 5px", lineHeight: 1.3 }}>{card.t}</p>
                  <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, margin: 0 }}>{card.s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── NEED HELP CTA (full-width banner) ─────────── */}
          <div style={{
            background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`,
            borderRadius: 24, padding: "40px 48px",
            boxShadow: "0 12px 40px rgba(20,48,38,0.18)",
            position: "relative", overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32,
          }} className="fh-cta-banner">
            <div style={{ position: "absolute", right: -60, top: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", right: 120, bottom: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 8px", fontFamily: "'Georgia', serif", lineHeight: 1.2 }}>Need help deciding?</p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", lineHeight: 1.65, margin: 0, maxWidth: 480 }}>Speak with our furnishing advisor for personalized recommendations tailored to your property size and budget.</p>
            </div>
            <button onClick={openGuidanceModal} style={{
              flexShrink: 0, display: "flex", alignItems: "center", gap: 10,
              padding: "14px 28px", background: "#fff", color: C.green,
              border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(0,0,0,0.16)", whiteSpace: "nowrap", position: "relative", zIndex: 1,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.27 6.27l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Talk to a Furnishing Expert
            </button>
          </div>

        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 960px) {
          .fh-hero-content { max-width: 70% !important; }
          .fh-det-cols { grid-template-columns: 1fr !important; }
          .fh-det-cols > div:first-child { border-right: none !important; border-bottom: 1px solid #F0EDE8; }
          .fh-owner-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .fh-cta-banner { flex-direction: column !important; align-items: flex-start !important; padding: 28px 28px !important; }
        }
        @media (max-width: 640px) {
          .fh-cards { grid-template-columns: 1fr !important; }
          .fh-tab { min-width: 100% !important; }
          .fh-hero-content { max-width: 100% !important; padding: 36px 28px !important; }
          .fh-det-cols { grid-template-columns: 1fr !important; }
          .fh-owner-grid { grid-template-columns: 1fr !important; }
          .fh-cta-banner { padding: 24px 24px !important; }
          .fh-cta-banner button { width: 100% !important; justify-content: center; }
        }
        @media (min-width: 641px) and (max-width: 960px) {
          .fh-cards { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </div>
  );
}

export default function FurnishingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8F4EE" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #1B5E4A", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      </div>
    }>
      <FurnishingContent />
    </Suspense>
  );
}
