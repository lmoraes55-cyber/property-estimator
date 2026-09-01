"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import React from "react";
import { FURNISHING_COMPANIES, DET_INVENTORY_CHECKLIST } from "@/lib/furnishing";
import SiteNav from "@/components/SiteNav";
import DecorativeBackdrop from "@/components/DecorativeBackdrop";
import { createClient } from "@/lib/supabase/client";

const C = {
  green: "#1B5E4A",
  greenDark: "#133D30",
  gold: "#B88A44",
  // AA-compliant (5.47:1 on ivory) bronze for small/normal-weight text — raw
  // `gold` fails WCAG AA (2.8-3.1:1) below ~18px bold. Use this for eyebrows,
  // captions, and links; reserve `gold` for large/bold text, fills, and borders.
  goldText: "#7D6338",
  ivory: "#FFFFFF",
  bg: "#F7F9F8",
  border: "#E2E8E5",
  borderLight: "#F0EDE8",
  text: "#1B2A1F",
  muted: "#4E5D56",
  subtle: "#888",
};

const gradStyle: React.CSSProperties = {
  background: `linear-gradient(90deg, #1B5E4A 0%, #B88A44 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

function getSetupFee(raw: string): number {
  const u = (raw ?? "").toUpperCase().replace(/\s+/g, "");
  if (u === "STU" || u.includes("STUDIO")) return 1500;
  if (u.startsWith("1") || u === "1BED" || u === "1BEDROOM") return 2000;
  if (u.startsWith("2") || u === "2BED" || u === "2BEDROOM") return 2500;
  if (u.startsWith("3") || u === "3BED" || u === "3BEDROOM") return 3000;
  if (u.startsWith("4") || u === "4BED" || u === "4BEDROOM") return 4000;
  if (!isNaN(parseInt(u.replace(/\D/g, ""))) && parseInt(u.replace(/\D/g, "")) >= 5) return 5000;
  return 2000;
}

const PKG_PRICES: Record<string, { lo: number; hi: number }> = {
  ESSENTIAL: { lo: 12900, hi: 15900 },
  SIGNATURE: { lo: 17900, hi: 22900 },
  LUXE: { lo: 27900, hi: 34900 },
};

const fmt = (n: number) => `AED ${n.toLocaleString()}`;

const DET_MAP: Record<string, string> = {
  "Living Room": "Living Room",
  "Bedroom": "Bedroom",
  "Kitchen": "Kitchen",
  "Bathroom": "Bathroom",
  "Balcony": "Safety",
  "Guest Essentials": "Additional",
};

function FurnishingGuideContent() {
  const params = useSearchParams();

  const propertyName = params.get("propertyName") ?? "";
  const buildingName = params.get("buildingName") ?? propertyName;
  const rawUnit = params.get("unitSize") ?? "2BR";

  const [activeTab, setActiveTab] = useState<"self" | "3rdparty">("self");
  const [selectedUnit, setSelectedUnit] = useState(rawUnit);
  const [openChecklist, setOpenChecklist] = useState<string | null>("Living Room");
  const [showModal, setShowModal] = useState(false);
  const [modalSubmitted, setModalSubmitted] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState(false);
  const [modalForm, setModalForm] = useState({
    name: "", email: "", phone: "", property: "", budget: "", path: "", message: "",
  });

  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteError, setQuoteError] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: "", email: "", phone: "", property: "", pkg: "", path: "", budget: "", message: "",
  });

  // Signed-in profile — lets us email a quote straight away instead of asking for a form.
  const [account, setAccount] = useState<{ email: string; name: string; phone: string } | null>(null);
  const [accountLoaded, setAccountLoaded] = useState(false);
  const [emailStatus, setEmailStatus] = useState<Record<string, "idle" | "sending" | "sent" | "error">>({});

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) { setAccountLoaded(true); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name,last_name,phone,whatsapp")
        .eq("id", user.id)
        .single();
      const name = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : "";
      setAccount({ email: user.email, name, phone: profile?.phone || profile?.whatsapp || "" });
      setAccountLoaded(true);
    }
    load();
  }, []);

  const unitLabel = selectedUnit === "STU" ? "Studio" : selectedUnit;
  const displayName = buildingName || propertyName || "";

  const emailQuote = async (pkgName: string) => {
    if (!account) return;
    setEmailStatus(s => ({ ...s, [pkgName]: "sending" }));
    try {
      const res = await fetch("/api/send-furnishing-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: account.email, name: account.name, phone: account.phone,
          property: displayName, unitSize: selectedUnit, pkg: pkgName,
        }),
      });
      const json = await res.json();
      setEmailStatus(s => ({ ...s, [pkgName]: json.ok ? "sent" : "error" }));
    } catch {
      setEmailStatus(s => ({ ...s, [pkgName]: "error" }));
    }
  };

  const openGuidanceModal = () => {
    setModalForm(f => ({ ...f, property: displayName }));
    setShowModal(true);
  };

  const openQuoteModal = (pkgName: string, prefillPath?: string) => {
    setQuoteForm(f => ({ ...f, property: displayName, pkg: pkgName, ...(prefillPath ? { path: prefillPath } : {}) }));
    setShowQuoteModal(true);
  };

  const handleQuoteSubmit = async () => {
    setQuoteSubmitting(true);
    setQuoteError(false);
    const pkgPrices = PKG_PRICES[quoteForm.pkg];
    const setupFee = getSetupFee(rawUnit);
    const totalLo = pkgPrices ? pkgPrices.lo + setupFee : null;
    const totalHi = pkgPrices ? pkgPrices.hi + setupFee : null;
    const quoteSummary = quoteForm.pkg
      ? `Package: ${quoteForm.pkg} (${fmt(pkgPrices!.lo)}–${fmt(pkgPrices!.hi)}) | Setup Fee: ${fmt(setupFee)} | Total: ${fmt(totalLo!)}–${fmt(totalHi!)} | Path: ${quoteForm.path}${quoteForm.message ? " | Notes: " + quoteForm.message : ""}`
      : `Path: ${quoteForm.path}${quoteForm.message ? " | Notes: " + quoteForm.message : ""}`;
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "furnishing_quote",
          name: quoteForm.name,
          email: quoteForm.email,
          phone: quoteForm.phone,
          property: quoteForm.property || displayName,
          unitSize: rawUnit,
          message: quoteSummary,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Request failed");
      setQuoteSubmitted(true);
    } catch {
      setQuoteError(true);
    }
    setQuoteSubmitting(false);
  };

  const handleModalSubmit = async () => {
    setModalSubmitting(true);
    setModalError(false);
    try {
      const res = await fetch("/api/lead", {
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
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Request failed");
      setModalSubmitted(true);
    } catch {
      setModalError(true);
    }
    setModalSubmitting(false);
  };

  // Two tabs only — no Operator Furnished
  const tabs = [
    {
      id: "self" as const, label: "AssetIntel Furnishing", sub: "We design, source & set up everything",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2"/><path d="M2 9a2 2 0 0 1 2 2v2h16v-2a2 2 0 0 1 2-2"/><path d="M4 13v4h16v-4"/><path d="M6 17v2M18 17v2"/></svg>,
    },
    {
      id: "3rdparty" as const, label: "Interior Design Firms", sub: "Curated by our team",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
    },
  ];

  const COLLAGE = "/furnishing-collage.png";
  const setupFee = getSetupFee(selectedUnit);
  const packages = [
    { name: "ESSENTIAL", sub: "Clean. Comfortable. Guest-Ready.", tags: ["Modern", "Warm Neutral"], badge: null, img: COLLAGE, imgPos: "0% 15%", highlight: false },
    { name: "SIGNATURE", sub: "Stylish. Balanced. Standout.", tags: ["Contemporary", "Sage & Taupe"], badge: "Most Popular", img: "/furnishing-signature.png", imgPos: "center center", highlight: true },
    { name: "LUXE", sub: "Premium. Timeless. Unforgettable.", tags: ["Luxury", "Deep Neutrals"], badge: null, img: "/furnishing-premium.png", imgPos: "center center", highlight: false },
  ];

  const checklistRows = [
    { name: "Living Room", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2"/><path d="M2 9a2 2 0 0 1 2 2v2h16v-2a2 2 0 0 1 2-2"/><path d="M4 13v4h16v-4"/><path d="M6 17v2M18 17v2"/></svg> },
    { name: "Bedroom", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg> },
    { name: "Kitchen", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg> },
    { name: "Bathroom", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6 9.01 6"/><path d="M3 20h18v-2a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v2z"/><path d="M3 13v-2a2 2 0 0 1 2-2h1V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4h1a2 2 0 0 1 2 2v2"/></svg> },
    { name: "Balcony", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg> },
    { name: "Guest Essentials", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  ];

  const ownerCards = [
    { t: "DET Compliance", s: "What's required & why it matters", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
    { t: "Guest-Ready Essentials", s: "Small touches, big impact", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
    { t: "Linen Standards", s: "What guests expect", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { t: "Smart Lock Ready", s: "Seamless check-in experience", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
    { t: "Photography & Styling", s: "Boost bookings with better photos", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> },
    { t: "Maintenance Tips", s: "Keep your home 5-star ready", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> },
  ];

  const quotePkgPrices = PKG_PRICES[quoteForm.pkg];
  const quoteSetupFee = getSetupFee(selectedUnit);
  const quoteTotalLo = quotePkgPrices ? quotePkgPrices.lo + quoteSetupFee : null;
  const quoteTotalHi = quotePkgPrices ? quotePkgPrices.hi + quoteSetupFee : null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "inherit", position: "relative" }}>
      <DecorativeBackdrop />
      <div style={{ position: "relative", zIndex: 1 }}>

      <SiteNav active="services" />

      {/* ── GUIDANCE MODAL ──────────────────────────────── */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => { setShowModal(false); setModalSubmitted(false); setModalError(false); }}
        >
          <div
            style={{ background: C.ivory, borderRadius: 24, padding: "32px 28px", maxWidth: 480, width: "100%", boxShadow: "0 24px 72px rgba(0,0,0,0.2)", position: "relative", maxHeight: "90vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => { setShowModal(false); setModalSubmitted(false); setModalError(false); }} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.subtle, lineHeight: 1 }}>×</button>
            {!modalSubmitted ? (
              <>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: C.goldText, textTransform: "uppercase", marginBottom: 6 }}>AssetIntel Advisory</p>
                <h2 style={{ fontSize: 20, fontWeight: 500, color: C.green, marginBottom: 6, fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif" }}>Furnishing Guidance Request</h2>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>We&apos;ll match you with the right furnishing path for your property and budget.</p>
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
                    {["AssetIntel Furnishing", "Interior Designer", "Not sure yet"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                {modalError && (
                  <p style={{ fontSize: 12.5, color: "#B03030", marginBottom: 10 }}>Couldn't send your request — please check your connection and try again.</p>
                )}
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
          onClick={() => { setShowQuoteModal(false); setQuoteSubmitted(false); setQuoteError(false); }}
        >
          <div
            style={{ background: C.ivory, borderRadius: 24, padding: "32px 28px", maxWidth: 500, width: "100%", boxShadow: "0 24px 72px rgba(0,0,0,0.2)", position: "relative", maxHeight: "90vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => { setShowQuoteModal(false); setQuoteSubmitted(false); setQuoteError(false); }} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.subtle, lineHeight: 1 }}>×</button>
            {!quoteSubmitted ? (
              <>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: C.goldText, textTransform: "uppercase", marginBottom: 6 }}>AssetIntel · Furnishing</p>
                <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 16, fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", ...gradStyle }}>Furnishing Quote Request</h2>

                <div style={{ background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`, borderRadius: 16, padding: "20px 20px 16px", marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px" }}>Furniture Package</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0 }}>
                        {quotePkgPrices ? `${fmt(quotePkgPrices.lo)} – ${fmt(quotePkgPrices.hi)}` : "Select a package below"}
                      </p>
                    </div>
                    {quoteForm.pkg && (
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: C.goldText, background: "rgba(184,138,68,0.18)", border: "1px solid rgba(184,138,68,0.35)", borderRadius: 20, padding: "3px 10px" }}>
                        {quoteForm.pkg}
                      </span>
                    )}
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 10, marginBottom: 10 }}>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px" }}>AssetIntel Setup & Coordination Fee</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0 }}>{fmt(quoteSetupFee)}</p>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", margin: 0 }}>Based on {unitLabel} unit size</p>
                    </div>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.18)", paddingTop: 12 }}>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>Estimated Total</p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.01em" }}>
                      {quoteTotalLo && quoteTotalHi ? `${fmt(quoteTotalLo)} – ${fmt(quoteTotalHi)}` : "—"}
                    </p>
                  </div>
                </div>

                <div style={{ background: "#F2EFE9", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>What AssetIntel Coordinates</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 12px" }}>
                    {["Furniture package guidance", "Delivery coordination", "Building move-in permit guidance", "Supplier coordination", "STR design & styling support", "Setup planning with STR designer", "Guest-ready checklist review", "DET readiness guidance"].map(item => (
                      <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="20 6 9 17 4 12"/></svg>
                        <span style={{ fontSize: 11, color: "#555", lineHeight: 1.45 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: 16, marginBottom: 14 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: "0 0 12px" }}>Your details</p>
                  {[
                    { label: "Full Name", key: "name", type: "text", ph: "Your full name" },
                    { label: "Email", key: "email", type: "email", ph: "your@email.com" },
                    { label: "Phone / WhatsApp", key: "phone", type: "tel", ph: "+971 50 000 0000" },
                    { label: "Building / Property Name", key: "property", type: "text", ph: displayName || "e.g. Marina Gate" },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom: 10 }}>
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
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Unit Size</label>
                      <select value={selectedUnit} onChange={e => setSelectedUnit(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, background: C.ivory, outline: "none" }}>
                        {["STU","1BR","2BR","3BR","4BR","5BR+"].map(o => <option key={o} value={o}>{o === "STU" ? "Studio" : o}</option>)}
                      </select>
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
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Preferred Furnishing Path</label>
                    <select value={quoteForm.path} onChange={e => setQuoteForm(p => ({ ...p, path: e.target.value }))}
                      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, background: C.ivory, outline: "none" }}>
                      <option value="">Select path</option>
                      {["AssetIntel Furnishing", "Interior Design Firm", "Not sure yet"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Message / Notes</label>
                    <textarea value={quoteForm.message} onChange={e => setQuoteForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="Any specific requirements, timeline, or questions..."
                      rows={2}
                      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, background: C.ivory, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                    />
                  </div>
                </div>

                {quoteError && (
                  <p style={{ fontSize: 12.5, color: "#B03030", marginBottom: 10 }}>Couldn't send your request — please check your connection and try again.</p>
                )}
                <button onClick={handleQuoteSubmit} disabled={quoteSubmitting}
                  style={{ width: "100%", padding: 13, background: C.green, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(27,94,74,0.25)", marginBottom: 12 }}>
                  {quoteSubmitting ? "Submitting…" : "Submit Quote Request"}
                </button>
                <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.6, margin: 0, textAlign: "center" }}>
                  Estimated quote only. Final pricing may vary based on property size, building rules, and supplier availability.
                </p>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#EEF5F1", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.green, marginBottom: 8 }}>Quote request received</h3>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>Thank you — AssetIntel will review your details and contact you with suitable furnishing options.</p>
                <button onClick={() => { setShowQuoteModal(false); setQuoteSubmitted(false); setQuoteForm({ name:"",email:"",phone:"",property:"",pkg:"",path:"",budget:"",message:"" }); }}
                  style={{ marginTop: 20, padding: "10px 28px", background: C.green, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* ── HERO ───────────────────────────────────────── */}
        <div style={{
          position: "relative", overflow: "hidden", isolation: "isolate",
          borderRadius: 28, marginBottom: 32,
          background: C.ivory, border: `1px solid ${C.border}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 12px 40px rgba(27,94,74,0.08)",
          minHeight: 400,
        }}>
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0,
            backgroundImage: "url('/HeroFurnishing.png')",
            backgroundSize: "cover", backgroundPosition: "center right",
            pointerEvents: "none", zIndex: 0,
          }} />
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
            background: `
              linear-gradient(to right, #FCFAF5 0%, #FCFAF5 28%, rgba(252,250,245,0.96) 36%, rgba(252,250,245,0.80) 46%, rgba(252,250,245,0.45) 58%, rgba(252,250,245,0.12) 72%, rgba(252,250,245,0.00) 88%),
              linear-gradient(to bottom, rgba(252,250,245,0.00) 0%, rgba(252,250,245,0.15) 70%, #FCFAF5 100%)
            `,
          }} />
          <div style={{ position: "relative", zIndex: 2, padding: "52px 44px", maxWidth: "52%", minHeight: 400, display: "flex", flexDirection: "column", justifyContent: "center" }} className="fhg-hero-content">
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: C.goldText, textTransform: "uppercase", margin: "0 0 14px" }}>AssetIntel Service</p>
            <h1 style={{ fontSize: 44, fontWeight: 500, lineHeight: 1.08, fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", margin: "0 0 16px", ...gradStyle }}>
              Furnishing &<br />STR Setup
            </h1>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, maxWidth: 360, margin: "0 0 28px" }}>
              From an empty property to guest-ready. AssetIntel can design, source, coordinate and set up your property for short-term rental — backed by experience furnishing 100+ holiday home units in Dubai.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 36 }}>
              {[
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, t: "100+ Units Furnished" },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>, t: "STR-Focused Design" },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, t: "Guest-Ready Setup" },
              ].map(b => (
                <div key={b.t} style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(27,94,74,0.09)", border: `1px solid rgba(27,94,74,0.18)`, borderRadius: 20, padding: "6px 12px", color: C.green }}>
                  {b.icon}
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{b.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ─────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Tabs */}
          <div id="pkg-section" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {tabs.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="fhg-tab"
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
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 6px", fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", ...gradStyle }}>Furnishing Packages by AssetIntel</h2>
                  <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Choose your furnishing level and unit size. Our team handles the sourcing, coordination and setup to get your property STR-ready.</p>
                </div>
                {/* Bedroom selector */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, whiteSpace: "nowrap" }}>Unit size:</label>
                  <select
                    value={selectedUnit}
                    onChange={e => setSelectedUnit(e.target.value)}
                    style={{
                      padding: "7px 28px 7px 12px",
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.green,
                      background: `${C.ivory} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%231B5E4A' stroke-width='1.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 10px center`,
                      appearance: "none",
                      WebkitAppearance: "none",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    {["STU","1BR","2BR","3BR","4BR","5BR+"].map(o => (
                      <option key={o} value={o}>{o === "STU" ? "Studio" : o}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="fhg-cards" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                {packages.map(pkg => {
                  const p = PKG_PRICES[pkg.name];
                  const totalLo = p.lo + setupFee;
                  const totalHi = p.hi + setupFee;
                  return (
                  <div key={pkg.name} style={{
                    background: C.ivory, borderRadius: 20, overflow: "hidden",
                    border: pkg.highlight ? `1.5px solid ${C.green}` : `1px solid ${C.border}`,
                    boxShadow: pkg.highlight ? "0 8px 28px rgba(27,94,74,0.14)" : "0 2px 10px rgba(0,0,0,0.04)",
                    display: "flex", flexDirection: "column",
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
                      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: C.goldText, textTransform: "uppercase", margin: "0 0 4px" }}>{pkg.name}</p>
                      <p style={{ fontSize: 12, color: C.muted, margin: "0 0 10px", lineHeight: 1.45 }}>{pkg.sub}</p>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 7, margin: "0 0 2px", flexWrap: "wrap" }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>{fmt(totalLo)} – {fmt(totalHi)}</p>
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.goldText, background: "rgba(184,138,68,0.12)", border: "1px solid rgba(184,138,68,0.3)", borderRadius: 20, padding: "2px 7px" }}>Estimated</span>
                      </div>
                      <p style={{ fontSize: 11, color: C.muted, margin: "0 0 10px" }}>Furniture + setup · {unitLabel} · final price confirmed on quote</p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                        {pkg.tags.map(t => (
                          <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: "#EEF5F1", color: C.green }}>{t}</span>
                        ))}
                      </div>
                      {(() => {
                        const status = emailStatus[pkg.name] ?? "idle";
                        const canEmail = accountLoaded && !!account;
                        if (!accountLoaded) {
                          return (
                            <button disabled style={{
                              marginTop: "auto", width: "100%", padding: "10px",
                              background: "transparent", color: C.muted, border: `1.5px solid ${C.border}`,
                              borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "default",
                            }}>
                              Loading…
                            </button>
                          );
                        }
                        if (canEmail) {
                          return (
                            <button
                              onClick={() => status !== "sending" && emailQuote(pkg.name)}
                              disabled={status === "sending"}
                              style={{
                                marginTop: "auto", width: "100%", padding: "10px",
                                background: status === "sent" ? "#EEF5F1" : pkg.highlight ? C.green : "transparent",
                                color: status === "sent" ? C.green : pkg.highlight ? "#fff" : C.green,
                                border: status === "sent" ? `1.5px solid ${C.green}` : pkg.highlight ? "none" : `1.5px solid ${C.green}`,
                                borderRadius: 10, fontSize: 13, fontWeight: 600,
                                cursor: status === "sending" ? "default" : "pointer",
                                boxShadow: pkg.highlight && status !== "sent" ? "0 4px 12px rgba(27,94,74,0.2)" : "none",
                                opacity: status === "sending" ? 0.7 : 1,
                              }}
                            >
                              {status === "sending" ? "Sending…" : status === "sent" ? "✓ Sent to " + account!.email : status === "error" ? "Couldn't send — try again" : "Get This Furnishing Package →"}
                            </button>
                          );
                        }
                        return (
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
                        );
                      })()}
                    </div>
                  </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderRadius: 14, background: C.ivory, border: `1px solid ${C.border}` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>AssetIntel-curated packages help owners save time, stay guest-ready, and understand the furnishing standard required before going live.</p>
              </div>

              {/* ── PROCESS STRIP ── */}
              <div style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 20, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 4px", fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", ...gradStyle }}>From Empty Unit to Guest-Ready</p>
                  <p style={{ fontSize: 12.5, color: C.muted, margin: 0 }}>AssetIntel handles the furnishing process from start to finish.</p>
                </div>
                <div className="fhg-process-row" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 4 }}>
                  {[
                    { n: "01", t: "DESIGN", s: "STR-focused furniture plan" },
                    { n: "02", t: "SOURCE", s: "Furniture, décor & essentials" },
                    { n: "03", t: "PERMITS", s: "Building access & delivery coordination" },
                    { n: "04", t: "DELIVER & INSTALL", s: "Delivery, assembly & placement" },
                    { n: "05", t: "STR SETUP", s: "Final guest-ready preparation" },
                  ].map((step, i, arr) => (
                    <React.Fragment key={step.n}>
                      <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#EEF5F1", color: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, margin: "0 auto 8px" }}>{step.n}</div>
                        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: C.text, margin: "0 0 4px" }}>{step.t}</p>
                        <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.4, margin: 0 }}>{step.s}</p>
                      </div>
                      {i < arr.length - 1 && (
                        <div style={{ flexShrink: 0, paddingTop: 6, color: C.gold, opacity: 0.6 }} className="fhg-process-arrow">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${C.borderLight}`, textAlign: "center" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: "0 0 6px" }}>One team. One point of contact.</p>
                  <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, margin: "0 0 8px", maxWidth: 620, marginLeft: "auto", marginRight: "auto" }}>
                    AssetIntel coordinates the furnishing design, furniture sourcing, building delivery permits, supplier deliveries, installation and final STR setup.
                  </p>
                  <p style={{ fontSize: 11, color: C.subtle, margin: 0 }}>
                    Target setup can be completed in as little as 7 days, subject to stock availability and building approvals.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ── INTERIOR DESIGN FIRMS TAB ── */}
          {activeTab === "3rdparty" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 6px", fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", ...gradStyle }}>Interior Design Support</h2>
                  <p style={{ fontSize: 13, color: C.muted, margin: 0, maxWidth: 560 }}>Work with selected interior design firms to create a guest-ready furnishing plan tailored to your property, budget, and STR positioning.</p>
                </div>
                <button onClick={() => openQuoteModal("", "Interior Design Firm")} style={{
                  flexShrink: 0, display: "flex", alignItems: "center", gap: 8,
                  padding: "11px 20px", background: C.green, color: "#fff",
                  border: "none", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(27,94,74,0.22)", whiteSpace: "nowrap",
                }}>
                  Request Interior Design Quote →
                </button>
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

          {/* ── DET CHECKLIST (DIY only) ── */}
          {activeTab === "self" && (
            <div style={{ background: "#FFFEFA", border: "1px solid rgba(35,93,72,0.10)", borderRadius: 24, overflow: "hidden", boxShadow: "0 8px 32px rgba(20,48,38,0.06), 0 2px 8px rgba(20,48,38,0.03)" }}>
              <div style={{ padding: "28px 32px 20px" }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: C.goldText, textTransform: "uppercase", margin: "0 0 6px" }}>DET Compliance Checklist</p>
                <p style={{ fontSize: 18, fontWeight: 500, margin: "0 0 8px", fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", ...gradStyle }}>STR Furnishing Checklist</p>
                <p style={{ fontSize: 13, color: C.subtle, margin: 0 }}>Key items required to make the property guest-ready and aligned with DET holiday home standards.</p>
              </div>
              <div className="fhg-det-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: `1px solid ${C.borderLight}` }}>
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
                                <p style={{ fontSize: 11, color: C.goldText, fontWeight: 600, margin: "4px 0 0" }}>+{detSection.items.length - 5} more items</p>
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
                <button onClick={() => window.open("/furnishing/checklist", "_blank")} style={{ fontSize: 12, fontWeight: 600, color: C.goldText, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  View Full Checklist
                </button>
              </div>
              <div style={{ padding: "0 32px 24px" }}>
                <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: 14 }}>
                  <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, margin: 0 }}>
                    <span style={{ fontWeight: 700, color: C.text }}>Note: </span>
                    This checklist highlights practical requirements considered when preparing a property for short-term rental. Final requirements may vary depending on the operator, building rules and DET requirements.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── WHAT EVERY OWNER SHOULD KNOW ── */}
          <div style={{ background: "#FFFEFA", border: "1px solid rgba(35,93,72,0.10)", borderRadius: 24, padding: "28px 32px", boxShadow: "0 8px 32px rgba(20,48,38,0.06), 0 2px 8px rgba(20,48,38,0.03)" }}>
            <p style={{ fontSize: 18, fontWeight: 500, margin: "0 0 4px", fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", ...gradStyle }}>What Every Owner Should Know</p>
            <p style={{ fontSize: 13, color: C.subtle, margin: "0 0 22px" }}>Key guidelines that protect your investment and your guests.</p>
            <div className="fhg-owner-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {ownerCards.map(card => (
                <div key={card.t} style={{ padding: "18px 16px", borderRadius: 16, background: C.bg, border: "1px solid rgba(35,93,72,0.08)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF8ED", border: "1px solid rgba(184,138,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>{card.icon}</div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: "0 0 5px", lineHeight: 1.3 }}>{card.t}</p>
                  <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, margin: 0 }}>{card.s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA BANNER ── */}
          <div style={{
            background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`,
            borderRadius: 24, padding: "40px 48px",
            boxShadow: "0 12px 40px rgba(20,48,38,0.18)",
            position: "relative", overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32,
          }} className="fhg-cta-banner">
            <div style={{ position: "absolute", right: -60, top: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <p style={{ fontSize: 22, fontWeight: 500, color: "#fff", margin: "0 0 8px", fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", lineHeight: 1.2 }}>Let AssetIntel Furnish Your Property</p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", lineHeight: 1.65, margin: 0, maxWidth: 480 }}>Tell us your property size and budget. Our team can recommend the right furnishing package and handle the setup from design to guest-ready.</p>
            </div>
            <button onClick={openGuidanceModal} style={{
              flexShrink: 0, display: "flex", alignItems: "center", gap: 10,
              padding: "14px 28px", background: "#fff", color: C.green,
              border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(0,0,0,0.16)", whiteSpace: "nowrap", position: "relative", zIndex: 1,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.27 6.27l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Get My Furnishing Plan →
            </button>
          </div>

        </div>
      </div>

      </div>

      <style>{`
        @media (max-width: 960px) {
          .fhg-hero-content { max-width: 70% !important; }
          .fhg-det-cols { grid-template-columns: 1fr !important; }
          .fhg-det-cols > div:first-child { border-right: none !important; border-bottom: 1px solid #F0EDE8; }
          .fhg-owner-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .fhg-cta-banner { flex-direction: column !important; align-items: flex-start !important; padding: 28px 28px !important; }
        }
        @media (max-width: 640px) {
          .fhg-cards { grid-template-columns: 1fr !important; }
          .fhg-tab { min-width: 100% !important; }
          .fhg-hero-content { max-width: 100% !important; padding: 36px 28px !important; }
          .fhg-det-cols { grid-template-columns: 1fr !important; }
          .fhg-owner-grid { grid-template-columns: 1fr !important; }
          .fhg-cta-banner { padding: 24px 24px !important; }
          .fhg-cta-banner button { width: 100% !important; justify-content: center; }
          .fhg-process-row { flex-direction: column !important; align-items: stretch !important; }
          .fhg-process-arrow { transform: rotate(90deg); padding: 4px 0 !important; align-self: center; }
        }
        @media (min-width: 641px) and (max-width: 960px) {
          .fhg-cards { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </div>
  );
}

export default function FurnishingGuidePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F9F8" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #1B5E4A", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      </div>
    }>
      <FurnishingGuideContent />
    </Suspense>
  );
}
