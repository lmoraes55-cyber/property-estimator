"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AssetIntelLogo from "@/components/AssetIntelLogo";
import SiteNav from "@/components/SiteNav";
import { useIsMobile } from "@/lib/useIsMobile";

const C = {
  primary: "#1B5E4A",
  secondary: "#B88A44",
  bgMain: "#F8F4EE",
  bgSection: "#FDFBF7",
  textMain: "#1A1A1A",
  textMuted: "#6B6B6B",
  border: "#E6E1D8",
  shadowSm: "0 1px 2px rgba(0,0,0,0.05)",
  shadowMd: "0 4px 12px rgba(0,0,0,0.09)",
};
const SF = "'Georgia', serif";
const sk = (c: string) => ({ stroke: c, strokeWidth: 1.4, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

// ─── Icons ───────────────────────────────────────────────────────────────────
const IconCheck = ({ color = C.primary, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8.5" stroke={color} strokeWidth="1.2" opacity="0.3" /><path d="M6.5 10L9 12.5L13.5 7.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const IconChevron = ({ open }: { open: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}><path d="M5 7.5L10 12.5L15 7.5" stroke={C.textMuted} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const IconDET = ({ color = C.primary }) => (
  <svg width="28" height="28" viewBox="0 0 32 32" {...sk(color)}><rect x="6" y="4" width="20" height="24" rx="2" /><path d="M10 10h12M10 14h12M10 18h8" /></svg>
);
const IconOTA = ({ color = C.secondary }) => (
  <svg width="28" height="28" viewBox="0 0 32 32" {...sk(color)}><circle cx="16" cy="16" r="11" /><path d="M16 5C16 5 11 11 11 16C11 21 16 27 16 27" /><path d="M16 5C16 5 21 11 21 16C21 21 16 27 16 27" /><path d="M5 16h22" /></svg>
);
const IconPMS = ({ color = C.primary }) => (
  <svg width="28" height="28" viewBox="0 0 32 32" {...sk(color)}><rect x="4" y="6" width="24" height="16" rx="2" /><path d="M10 26h12M16 22v4" /><path d="M9 13l3 3 7-7" /></svg>
);
const IconTeam = ({ color = C.secondary }) => (
  <svg width="28" height="28" viewBox="0 0 32 32" {...sk(color)}><circle cx="12" cy="10" r="4" /><path d="M4 26c0-4.4 3.6-8 8-8" /><circle cx="22" cy="10" r="4" /><path d="M20 18c4.4 0 8 3.6 8 8" /></svg>
);
const IconPricing = ({ color = C.primary }) => (
  <svg width="28" height="28" viewBox="0 0 32 32" {...sk(color)}><path d="M8 22L24 10" /><circle cx="10" cy="12" r="3" /><circle cx="22" cy="20" r="3" /></svg>
);
const IconSOP = ({ color = C.secondary }) => (
  <svg width="28" height="28" viewBox="0 0 32 32" {...sk(color)}><path d="M8 8h16M8 13h16M8 18h10" /><path d="M4 4h24v24H4z" rx="2" /></svg>
);
const IconShield = ({ color = C.primary }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3L4 7v5c0 5 3.6 9.5 8 10.5C16.4 21.5 20 17 20 12V7L12 3Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" /></svg>
);
const IconSupport = ({ color = C.primary }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" {...sk(color)}><circle cx="16" cy="16" r="12" /><path d="M12 13c0-2.2 1.8-4 4-4s4 1.8 4 4c0 2-1.4 3.5-3 4v2" /><circle cx="16" cy="23" r="1" fill={color} stroke="none" /></svg>
);
const IconInfo = ({ color = C.secondary }) => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8.5" stroke={color} strokeWidth="1.4" /><path d="M10 9v5" stroke={color} strokeWidth="1.6" strokeLinecap="round" /><circle cx="10" cy="6.5" r="0.8" fill={color} /></svg>
);

// ─── Payment Modal (preserve backend logic) ──────────────────────────────────
type Product = { name: string; price: string; amount: number };
const PRICE = "AED 199";
const BUNDLE_PRICE = "AED 399";
const PRODUCTS: Record<string, Product> = {
  owner: { name: "Owner Self-Management Playbook", price: PRICE, amount: 199 },
  bundle: { name: "Bundle — Both Playbooks", price: BUNDLE_PRICE, amount: 399 },
};

function PaymentModal({ product, onClose, onCheckout }: { product: Product; onClose: () => void; onCheckout: (p: Product) => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "40px", maxWidth: "440px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.2)", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "18px", right: "18px", background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontSize: "22px", lineHeight: 1 }}>×</button>
        <div style={{ fontSize: "11px", color: C.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "14px" }}>ASSETINTEL</div>
        <h2 style={{ fontSize: "22px", fontFamily: SF, fontWeight: 700, color: C.textMain, marginBottom: "8px" }}>Unlock Playbook</h2>
        <p style={{ fontSize: "14px", color: C.textMuted, marginBottom: "28px" }}>You are about to unlock access to the following:</p>
        <div style={{ background: C.bgMain, borderRadius: "12px", border: `1px solid ${C.border}`, padding: "20px 22px", marginBottom: "28px" }}>
          <div style={{ fontSize: "13px", color: C.textMuted, marginBottom: "6px" }}>Selected product</div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: C.textMain, marginBottom: "4px" }}>{product.name}</div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: C.primary, fontFamily: SF }}>{product.price}</div>
          <div style={{ fontSize: "12px", color: C.textMuted }}>One-time access fee</div>
        </div>
        <div style={{ padding: "14px 16px", background: "#FFFBF5", borderRadius: "10px", border: "1px solid #E8D9BC", marginBottom: "24px" }}>
          <p style={{ fontSize: "12.5px", color: C.textMuted, lineHeight: 1.6, margin: 0 }}>Payment checkout will be connected here. Click continue to proceed when payment is available.</p>
        </div>
        <button onClick={() => onCheckout(product)} style={{ width: "100%", padding: "14px", background: C.primary, color: "#fff", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: "pointer", border: "none", marginBottom: "12px" }}>Continue to Checkout →</button>
        <button onClick={onClose} style={{ width: "100%", padding: "12px", background: "transparent", color: C.textMuted, border: `1.5px solid ${C.border}`, borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Lead Modal ──────────────────────────────────────────────────────────────
const CURRENT_STATUS_OPTS = ["Not listed yet", "Already listed on Airbnb", "Already listed on Booking.com", "Using an operator now", "Switching from long-term rental", "Other"];
const HELP_ITEMS = ["DET portal setup", "Holiday home permit guidance", "OTA account setup", "PMS selection/setup", "Hostaway setup", "Guesty setup", "Housekeeping team setup", "Maintenance team setup", "Guest relations / VA setup", "Pricing tool setup", "PriceLabs setup", "SOPs and templates", "Full self-management setup", "Not sure yet"];

const inputSt: React.CSSProperties = { width: "100%", padding: "11px 14px", fontSize: "14px", color: C.textMain, background: C.bgMain, border: `1.5px solid ${C.border}`, borderRadius: "9px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

function LeadModal({ isMobile, onClose }: { isMobile: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", properties: "", status: "", helpItems: [] as string[], message: "" });
  function setF(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }
  function toggleHelp(item: string) {
    setForm(f => ({ ...f, helpItems: f.helpItems.includes(item) ? f.helpItems.filter(x => x !== item) : [...f.helpItems, item] }));
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "owner-setup-support", targetType: "service", ...form, support: form.helpItems.join(", "), units: form.properties }),
      });
    } catch { /* silent */ }
    setSubmitting(false);
    setSubmitted(true);
  }
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(10,26,20,0.62)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#FDFBF8", borderRadius: "24px", width: "100%", maxWidth: "620px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.22)", border: `1px solid ${C.border}` }}>
        <div style={{ padding: isMobile ? "28px 24px 20px" : "36px 40px 24px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: C.secondary, letterSpacing: "0.12em", marginBottom: "10px" }}>OWNER SELF-MANAGEMENT</div>
          <h2 style={{ fontSize: isMobile ? "21px" : "25px", fontFamily: SF, fontWeight: 700, color: C.textMain, marginBottom: "8px", lineHeight: 1.25 }}>Self-Management Setup Enquiry</h2>
          <p style={{ fontSize: "14px", color: C.textMuted, lineHeight: 1.65 }}>Tell us what you need help with and our account manager will guide you on the right setup and pricing.</p>
        </div>
        {submitted ? (
          <div style={{ padding: isMobile ? "36px 24px" : "48px 40px", textAlign: "center" }}>
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ marginBottom: "20px" }}>
              <circle cx="26" cy="26" r="25" stroke={C.primary} strokeWidth="1.5" opacity="0.25" />
              <circle cx="26" cy="26" r="20" fill={`${C.primary}15`} />
              <path d="M16 26L23 33L36 19" stroke={C.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 style={{ fontSize: "20px", fontFamily: SF, fontWeight: 700, color: C.textMain, marginBottom: "12px" }}>Thank you — your enquiry has been received.</h3>
            <p style={{ fontSize: "14px", color: C.textMuted, lineHeight: 1.65, marginBottom: "28px" }}>An AssetIntel account manager will review your details and contact you with guidance on the right setup and pricing.</p>
            <button onClick={onClose} style={{ padding: "12px 28px", background: C.primary, color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Close</button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ padding: isMobile ? "24px 24px 32px" : "32px 40px 40px" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <LF label="Full Name" required><input required value={form.name} onChange={e => setF("name", e.target.value)} placeholder="Your full name" style={inputSt} /></LF>
              <LF label="Email" required><input required type="email" value={form.email} onChange={e => setF("email", e.target.value)} placeholder="your@email.com" style={inputSt} /></LF>
              <LF label="Phone / WhatsApp"><input value={form.phone} onChange={e => setF("phone", e.target.value)} placeholder="+971 50 000 0000" style={inputSt} /></LF>
              <LF label="Number of Properties"><input type="number" min="1" value={form.properties} onChange={e => setF("properties", e.target.value)} placeholder="e.g. 2" style={inputSt} /></LF>
            </div>
            <LF label="Current Status" style={{ marginBottom: "16px" }}>
              <select value={form.status} onChange={e => setF("status", e.target.value)} style={{ ...inputSt, appearance: "none" as const }}>
                <option value="">Select status…</option>
                {CURRENT_STATUS_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </LF>
            <LF label="What do you need help with?" style={{ marginBottom: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "8px", marginTop: "4px" }}>
                {HELP_ITEMS.map(item => {
                  const active = form.helpItems.includes(item);
                  return (
                    <div key={item} onClick={() => toggleHelp(item)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", background: active ? "#F0F8F4" : C.bgMain, borderRadius: "8px", border: `1.5px solid ${active ? C.primary : C.border}`, cursor: "pointer" }}>
                      <div style={{ width: "16px", height: "16px", borderRadius: "4px", border: `2px solid ${active ? C.primary : C.border}`, background: active ? C.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {active && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      <span style={{ fontSize: "12.5px", color: active ? C.textMain : C.textMuted, fontWeight: active ? 600 : 400 }}>{item}</span>
                    </div>
                  );
                })}
              </div>
            </LF>
            <LF label="Message / Notes" style={{ marginBottom: "28px" }}>
              <textarea value={form.message} onChange={e => setF("message", e.target.value)} placeholder="Any additional context about your setup needs…" rows={3} style={{ ...inputSt, resize: "vertical" as const }} />
            </LF>
            <div style={{ display: "flex", gap: "12px", flexDirection: isMobile ? "column-reverse" : "row" }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: "14px", background: "transparent", color: C.textMuted, border: `1.5px solid ${C.border}`, borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button type="submit" disabled={submitting} style={{ flex: 2, padding: "14px", background: `linear-gradient(135deg, ${C.primary} 0%, #0F3E33 100%)`, color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: submitting ? "wait" : "pointer", boxShadow: "0 4px 16px rgba(27,94,74,0.28)" }}>
                {submitting ? "Submitting…" : "Submit Enquiry"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Vendor Contact Modal ─────────────────────────────────────────────────────
const VENDOR_SERVICES = ["Housekeeping", "Maintenance", "Virtual Assistant / Guest Messaging", "Laundry / Linen", "Smart Lock / Access", "Full Setup Support"];
const UNIT_SIZE_OPTS = ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom", "4+ Bedroom"];

function VendorModal({ isMobile, onClose }: { isMobile: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", building: "", unitSize: "", services: [] as string[], notes: "" });
  function setF(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }
  function toggleService(s: string) {
    setForm(f => ({ ...f, services: f.services.includes(s) ? f.services.filter(x => x !== s) : [...f.services, s] }));
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "vendor-contacts-request",
          targetType: "service",
          target: "STR Vendor Contacts",
          name: form.name,
          email: form.email,
          phone: form.phone,
          notes: `Building: ${form.building} | Unit: ${form.unitSize} | Services: ${form.services.join(", ")} | Notes: ${form.notes}`,
        }),
      });
    } catch { /* silent */ }
    setSubmitting(false);
    setSubmitted(true);
  }
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(10,26,20,0.62)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#FDFBF8", borderRadius: "24px", width: "100%", maxWidth: "580px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.22)", border: `1px solid ${C.border}` }}>
        <div style={{ padding: isMobile ? "28px 24px 20px" : "36px 40px 24px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: C.secondary, letterSpacing: "0.12em", marginBottom: "10px" }}>STR OPERATIONS</div>
          <h2 style={{ fontSize: isMobile ? "21px" : "24px", fontFamily: SF, fontWeight: 700, color: C.textMain, marginBottom: "8px", lineHeight: 1.25 }}>Request STR Vendor Contacts</h2>
          <p style={{ fontSize: "14px", color: C.textMuted, lineHeight: 1.65 }}>Tell us what you need and we will share suitable STR vendor contact options where available.</p>
        </div>
        {submitted ? (
          <div style={{ padding: isMobile ? "36px 24px" : "48px 40px", textAlign: "center" }}>
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ marginBottom: "20px" }}>
              <circle cx="26" cy="26" r="25" stroke={C.primary} strokeWidth="1.5" opacity="0.25" />
              <circle cx="26" cy="26" r="20" fill={`${C.primary}15`} />
              <path d="M16 26L23 33L36 19" stroke={C.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 style={{ fontSize: "20px", fontFamily: SF, fontWeight: 700, color: C.textMain, marginBottom: "12px" }}>Thank you — request received.</h3>
            <p style={{ fontSize: "14px", color: C.textMuted, lineHeight: 1.65, marginBottom: "28px" }}>AssetIntel will review your request and share suitable STR vendor contact options where available.</p>
            <button onClick={onClose} style={{ padding: "12px 28px", background: C.primary, color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Close</button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ padding: isMobile ? "24px 24px 32px" : "32px 40px 40px" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <LF label="Full Name" required><input required value={form.name} onChange={e => setF("name", e.target.value)} placeholder="Your full name" style={inputSt} /></LF>
              <LF label="Email" required><input required type="email" value={form.email} onChange={e => setF("email", e.target.value)} placeholder="your@email.com" style={inputSt} /></LF>
              <LF label="Phone / WhatsApp"><input value={form.phone} onChange={e => setF("phone", e.target.value)} placeholder="+971 50 000 0000" style={inputSt} /></LF>
              <LF label="Unit Size">
                <select value={form.unitSize} onChange={e => setF("unitSize", e.target.value)} style={{ ...inputSt, appearance: "none" as const }}>
                  <option value="">Select unit size…</option>
                  {UNIT_SIZE_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </LF>
            </div>
            <LF label="Building / Property Name" style={{ marginBottom: "16px" }}>
              <input value={form.building} onChange={e => setF("building", e.target.value)} placeholder="e.g. Marina Gate 1, JBR" style={inputSt} />
            </LF>
            <LF label="Services Needed" style={{ marginBottom: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "8px", marginTop: "4px" }}>
                {VENDOR_SERVICES.map(s => {
                  const active = form.services.includes(s);
                  return (
                    <div key={s} onClick={() => toggleService(s)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", background: active ? "#F0F8F4" : C.bgMain, borderRadius: "8px", border: `1.5px solid ${active ? C.primary : C.border}`, cursor: "pointer" }}>
                      <div style={{ width: "16px", height: "16px", borderRadius: "4px", border: `2px solid ${active ? C.primary : C.border}`, background: active ? C.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {active && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      <span style={{ fontSize: "12.5px", color: active ? C.textMain : C.textMuted, fontWeight: active ? 600 : 400 }}>{s}</span>
                    </div>
                  );
                })}
              </div>
            </LF>
            <LF label="Message / Notes" style={{ marginBottom: "16px" }}>
              <textarea value={form.notes} onChange={e => setF("notes", e.target.value)} placeholder="Any additional context…" rows={3} style={{ ...inputSt, resize: "vertical" as const }} />
            </LF>
            <div style={{ padding: "12px 16px", background: "#FFFBF5", borderRadius: "8px", border: "1px solid #E8D9BC", marginBottom: "24px" }}>
              <p style={{ fontSize: "12px", color: "#7A5010", margin: 0, lineHeight: 1.6 }}>AssetIntel can introduce third-party vendors but does not guarantee vendor pricing, availability, or service quality unless separately agreed.</p>
            </div>
            <div style={{ display: "flex", gap: "12px", flexDirection: isMobile ? "column-reverse" : "row" }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: "14px", background: "transparent", color: C.textMuted, border: `1.5px solid ${C.border}`, borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button type="submit" disabled={submitting} style={{ flex: 2, padding: "14px", background: `linear-gradient(135deg, ${C.primary} 0%, #0F3E33 100%)`, color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: submitting ? "wait" : "pointer", boxShadow: "0 4px 16px rgba(27,94,74,0.28)" }}>
                {submitting ? "Submitting…" : "Submit Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function LF({ label, children, style, required }: { label: string; children: React.ReactNode; style?: React.CSSProperties; required?: boolean }) {
  return (
    <div style={style}>
      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: C.textMain, marginBottom: "6px", letterSpacing: "0.02em" }}>
        {label}{required && <span style={{ color: C.secondary, marginLeft: "3px" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Accordion ───────────────────────────────────────────────────────────────
function Accordion({ id, title, open, onToggle, children }: { id: string; title: string; open: boolean; onToggle: (id: string) => void; children: React.ReactNode }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden", background: C.bgMain }}>
      <button onClick={() => onToggle(id)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontSize: "14px", fontWeight: 700, color: C.textMain }}>{title}</span>
        <IconChevron open={open} />
      </button>
      {open && <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}` }}>{children}</div>}
    </div>
  );
}

// ─── Section heading ─────────────────────────────────────────────────────────
function SH({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "40px", textAlign: "center" }}>
      <div style={{ fontSize: "11px", color: C.secondary, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>{label}</div>
      <h2 style={{ fontSize: "34px", fontFamily: SF, fontWeight: 700, marginBottom: "12px", background: `linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{title}</h2>
      {subtitle && <p style={{ fontSize: "15px", color: C.textMuted, lineHeight: 1.65, maxWidth: "600px", margin: "0 auto" }}>{subtitle}</p>}
    </div>
  );
}

// ─── Step section wrapper ─────────────────────────────────────────────────────
function StepSection({ id, num, icon, title, subtitle, intro, children }: { id: string; num: number; icon: React.ReactNode; title: string; subtitle: string; intro: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ padding: "0 0 24px" }}>
      <div style={{ background: C.bgSection, borderRadius: "20px", border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: C.shadowSm }}>
        <div style={{ padding: "32px 36px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: "20px", alignItems: "flex-start" }}>
          <div style={{ flexShrink: 0, width: "52px", height: "52px", borderRadius: "14px", background: `${C.primary}0A`, border: `1px solid ${C.primary}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.secondary, letterSpacing: "0.12em", marginBottom: "6px" }}>STEP {num} OF 6</div>
            <h2 style={{ fontSize: "22px", fontFamily: SF, fontWeight: 700, color: C.textMain, marginBottom: "4px" }}>{title}</h2>
            <p style={{ fontSize: "14px", color: C.secondary, fontWeight: 600, marginBottom: "12px" }}>{subtitle}</p>
            <p style={{ fontSize: "14px", color: C.textMuted, lineHeight: 1.65, maxWidth: "680px" }}>{intro}</p>
          </div>
        </div>
        <div style={{ padding: "24px 36px 32px", display: "flex", flexDirection: "column", gap: "10px" }}>{children}</div>
      </div>
    </section>
  );
}

// ─── Checklist row ────────────────────────────────────────────────────────────
function CL({ items, color = C.primary }: { items: string[]; color?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginTop: "12px" }}>
      {items.map(item => (
        <div key={item} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
          <div style={{ marginTop: "2px" }}><IconCheck color={color} size={14} /></div>
          <span style={{ fontSize: "13.5px", color: C.textMuted, lineHeight: 1.55 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Note card ───────────────────────────────────────────────────────────────
function Note({ children, color = C.secondary }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ padding: "14px 18px", background: "#FFFBF5", borderRadius: "10px", border: `1px solid #E8D9BC`, borderLeft: `3px solid ${color}` }}>
      <p style={{ fontSize: "13px", color: "#7A5010", margin: 0, lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}

// ─── DET Pricing Card ─────────────────────────────────────────────────────────
function DETPricingCard({ isMobile }: { isMobile: boolean }) {
  const rows = [
    { label: "New account / registration", price: "AED 1,520 approx.", note: "One-time or setup-related; verify with DET" },
    { label: "Annual permit — Studio / 1BR", price: "AED 370 / yr", note: "" },
    { label: "Annual permit — 2 Bedroom", price: "AED 670 / yr", note: "" },
    { label: "Annual permit — 3 Bedroom", price: "AED 970 / yr", note: "" },
    { label: "Annual permit — 4BR and above", price: "AED 1,270+ / yr", note: "" },
  ];
  return (
    <div style={{ background: C.bgMain, borderRadius: "14px", border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: C.shadowSm }}>
      <div style={{ padding: "14px 20px", background: `${C.primary}08`, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: C.primary, letterSpacing: "0.08em" }}>APPROXIMATE DET COSTS</div>
      </div>
      <div>
        {rows.map((r, i) => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "12px 20px", borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "160px" }}>
              <span style={{ fontSize: "13px", color: C.textMuted, lineHeight: 1.5 }}>{r.label}</span>
              {r.note && <div style={{ fontSize: "11.5px", color: C.textMuted, opacity: 0.7, marginTop: "2px" }}>{r.note}</div>}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.secondary, flexShrink: 0 }}>{r.price}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "12px 20px", background: "#FFFBF5", borderTop: `1px solid #E8D9BC` }}>
        <p style={{ fontSize: "12px", color: "#7A5010", margin: 0, lineHeight: 1.6 }}>
          The common permit calculation is approximately AED 300 per bedroom plus AED 70 per unit. Fees may change and should be verified directly with DET. Tourism Dirham and any other applicable charges should be handled as per Dubai holiday home requirements.
        </p>
      </div>
    </div>
  );
}

// ─── Cost Snapshot Table ──────────────────────────────────────────────────────
function CostSnapshot({ isMobile, onVendor }: { isMobile: boolean; onVendor: () => void }) {
  const rows = [
    { item: "DET account / registration", cost: "AED 1,520 approx.", notes: "One-time or setup-related cost; verify with DET." },
    { item: "Annual DET permit", cost: "AED 370 – 1,270+ / yr", notes: "Depends on bedroom count." },
    { item: "PMS / channel manager", cost: "Quote-based", notes: "Guesty / Hostaway pricing depends on portfolio size and features." },
    { item: "Dynamic pricing software", cost: "From approx. USD 14.49 / listing / month", notes: "Based on PriceLabs public dynamic pricing plan; taxes may apply." },
    { item: "Housekeeping", cost: "Vendor quote required", notes: "Depends on unit size, cleaning frequency, linen model, and standards." },
    { item: "Maintenance", cost: "Vendor quote required", notes: "Depends on callouts, retainers, emergency support, and scope." },
    { item: "Virtual assistant / guest support", cost: "Vendor quote required", notes: "Depends on coverage hours, languages, channels, and service level." },
    { item: "Photography / listing setup", cost: "Vendor quote required", notes: "Depends on photographer, styling, and number of rooms." },
    { item: "Smart lock / access setup", cost: "Vendor quote required", notes: "Depends on building rules, lock type, and access requirements." },
  ];

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {rows.map(r => (
          <div key={r.item} style={{ background: C.bgMain, borderRadius: "12px", border: `1px solid ${C.border}`, padding: "16px 18px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.textMain, marginBottom: "6px" }}>{r.item}</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.secondary, marginBottom: "4px" }}>{r.cost}</div>
            <div style={{ fontSize: "12px", color: C.textMuted, lineHeight: 1.5 }}>{r.notes}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ background: C.bgMain, borderRadius: "14px", border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1.6fr 2.2fr", background: `${C.primary}08`, borderBottom: `1px solid ${C.border}` }}>
        {["Cost Item", "Approximate Cost", "Notes"].map(h => (
          <div key={h} style={{ padding: "12px 18px", fontSize: "11px", fontWeight: 700, color: C.primary, letterSpacing: "0.08em" }}>{h}</div>
        ))}
      </div>
      {rows.map((r, i) => (
        <div key={r.item} style={{ display: "grid", gridTemplateColumns: "2fr 1.6fr 2.2fr", borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}>
          <div style={{ padding: "13px 18px", fontSize: "13px", color: C.textMain, fontWeight: 500, lineHeight: 1.4 }}>{r.item}</div>
          <div style={{ padding: "13px 18px", fontSize: "13px", fontWeight: 700, color: C.secondary }}>{r.cost}</div>
          <div style={{ padding: "13px 18px", fontSize: "12.5px", color: C.textMuted, lineHeight: 1.5 }}>{r.notes}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Guest Communication Templates data ──────────────────────────────────────
interface GuestTemplate {
  id: string;
  title: string;
  purpose: string;
  bestUsedFor: string;
  tone: string;
  message?: string;
  sections?: { label: string; message: string }[];
  keyPoints: string[];
}

const GUEST_TEMPLATES: GuestTemplate[] = [
  {
    id: "booking-confirmation",
    title: "Booking Confirmation",
    purpose: "Reassure the guest that the booking is confirmed and let them know more details will follow.",
    bestUsedFor: "Immediately after a booking is confirmed.",
    tone: "Warm, confident, welcoming.",
    message: `Hi {guest_name},

Thank you for booking {property_name}. We're happy to confirm your stay from {check_in_date} to {check_out_date}.

We're looking forward to hosting you and will share the full arrival and check-in details closer to your stay. If you have any questions before then, feel free to message us anytime.

Your check-in is currently scheduled from {check_in_time}, and checkout is by {check_out_time}.

See you soon,
{host_name}`,
    keyPoints: ["Confirms the booking", "Confirms dates", "Sets expectation that arrival details will follow", "Offers support before arrival"],
  },
  {
    id: "pre-arrival",
    title: "Pre-arrival Message",
    purpose: "Prepare the guest before arrival and reduce last-minute questions.",
    bestUsedFor: "1–3 days before guest arrival.",
    tone: "Helpful, organized, proactive.",
    message: `Hi {guest_name},

We're looking forward to welcoming you to {property_name} on {check_in_date}.

To help us prepare for a smooth arrival, please confirm your expected arrival time when possible. If guest details or ID/passport information are required for building or holiday home registration, kindly share them before check-in so we can complete the process on time.

We'll send your full check-in instructions, location details, and access steps before your arrival.

If you need anything before your stay, you can reach us here or on {support_number}.

Kind regards,
{host_name}`,
    keyPoints: ["Confirms upcoming arrival", "Requests arrival time", "Requests guest details if needed", "Sets expectation for check-in instructions", "Shares support contact"],
  },
  {
    id: "check-in-instructions",
    title: "Check-in Instructions",
    purpose: "Make the arrival and self-check-in process smooth.",
    bestUsedFor: "Day before arrival or morning of arrival.",
    tone: "Clear, operational, easy to follow.",
    message: `Hi {guest_name},

Your check-in details for {property_name} are below.

Property:
{property_name}
{building_name}

Location:
{location_pin}

Check-in time:
From {check_in_time}

Access instructions:
1. Arrive at {building_name}.
2. Inform reception/security that you are checking in to the apartment.
3. Follow the access instructions provided for the key/card/smart lock.
4. Once inside, please check that everything is in order and message us if you need any help.

Wi-Fi:
Network: {wifi_name}
Password: {wifi_password}

Support:
If you face any issue during arrival, please contact us immediately on {support_number}.

We hope you have a comfortable stay.

Kind regards,
{host_name}`,
    keyPoints: ["Property and building details", "Location pin", "Check-in time", "Step-by-step access", "Wi-Fi information", "Support contact"],
  },
  {
    id: "mid-stay",
    title: "Mid-stay Check-in",
    purpose: "Show hospitality and identify issues early.",
    bestUsedFor: "After the first night or midway through the stay.",
    tone: "Warm, caring, attentive.",
    message: `Hi {guest_name},

I hope you're enjoying your stay at {property_name}.

Just checking in to make sure everything is comfortable and going smoothly. If there's anything you need help with, please let us know and we'll be happy to assist.

Wishing you a lovely stay,
{host_name}`,
    keyPoints: ["Shows care", "Gives guest chance to report issues", "Keeps message short", "Improves guest satisfaction"],
  },
  {
    id: "checkout-reminder",
    title: "Checkout Reminder",
    purpose: "Help guests check out smoothly and avoid confusion.",
    bestUsedFor: "Evening before checkout or morning of checkout.",
    tone: "Polite, clear, efficient.",
    message: `Hi {guest_name},

Just a quick reminder that checkout from {property_name} is by {check_out_time} on {check_out_date}.

Before leaving, kindly:
1. Check that you have all personal belongings.
2. Turn off lights and AC where possible.
3. Leave the property in a reasonable condition.
4. Return the key/access card as per the checkout instructions.

If you need any help before leaving, please message us on {support_number}.

Thank you for staying with us. We hope you had a comfortable visit.

Kind regards,
{host_name}`,
    keyPoints: ["Confirms checkout time", "Reminds guest about belongings", "Gives basic departure steps", "Keeps tone polite and calm"],
  },
  {
    id: "review-request",
    title: "Review Request",
    purpose: "Encourage positive reviews and feedback.",
    bestUsedFor: "After checkout once the stay ended positively.",
    tone: "Grateful, natural, non-pushy.",
    message: `Hi {guest_name},

Thank you again for staying at {property_name}. We hope you had a comfortable and enjoyable visit.

If you have a moment, we'd really appreciate your review on {booking_platform}. Reviews help future guests understand what to expect and help us continue improving the experience.

It was a pleasure hosting you, and we'd be happy to welcome you again anytime.

Kind regards,
{host_name}`,
    keyPoints: ["Thanks the guest", "Requests review naturally", "Avoids sounding pushy", "Ends positively"],
  },
  {
    id: "late-checkout",
    title: "Late Checkout Response",
    purpose: "Respond clearly to late checkout requests.",
    bestUsedFor: "When a guest asks to check out later.",
    tone: "Courteous, professional, flexible where possible.",
    sections: [
      {
        label: "Approved Version",
        message: `Hi {guest_name},

We're happy to confirm that late checkout has been approved for {property_name}.

Your new checkout time is {late_checkout_time}.

Please note that this is subject to housekeeping and operations timing. If an additional late checkout fee applies, the amount will be {approved_late_checkout_fee}.

Thank you, and we hope this helps you enjoy a more relaxed departure.

Kind regards,
{host_name}`,
      },
      {
        label: "Declined Version",
        message: `Hi {guest_name},

Thank you for checking with us.

Unfortunately, we're unable to offer late checkout for {property_name} this time due to our housekeeping schedule and/or an incoming guest arrival.

Checkout will remain at {check_out_time}. We kindly ask that the property is vacated on time so our team can prepare it properly for the next guest.

Thank you for understanding.

Kind regards,
{host_name}`,
      },
    ],
    keyPoints: ["Gives approved and declined versions", "Keeps tone polite", "Protects housekeeping schedule", "Sets clear expectations"],
  },
  {
    id: "noise-complaint",
    title: "Noise Complaint Response",
    purpose: "De-escalate quickly while protecting the property and building rules.",
    bestUsedFor: "When building, security, or neighbours report noise.",
    tone: "Firm, calm, professional.",
    message: `Hi {guest_name},

We've received a notice regarding noise from the property.

As this is a residential building, all guests must respect the building rules and keep noise to a reasonable level, especially during quiet hours.

Please reduce the noise immediately and avoid any disturbance to neighbours or building security. Continued complaints may result in further action through the building management or booking platform.

Thank you for your cooperation and understanding.

Kind regards,
{host_name}`,
    keyPoints: ["Addresses issue directly", "Mentions residential building rules", "Requests immediate action", "Notes possible consequences calmly"],
  },
  {
    id: "maintenance-issue",
    title: "Maintenance Issue Response",
    purpose: "Acknowledge the issue and confirm next steps.",
    bestUsedFor: "When a guest reports a maintenance issue.",
    tone: "Empathetic, solution-focused, reassuring.",
    message: `Hi {guest_name},

Thank you for letting us know about {issue_description}. We're sorry for the inconvenience.

Our team is reviewing this and will arrange support as soon as possible. The current estimated response time is {maintenance_eta}.

We'll keep you updated and do our best to resolve this with minimal disruption to your stay.

Thank you for your patience,
{host_name}`,
    keyPoints: ["Acknowledges the problem", "Apologizes professionally", "Gives response timing", "Reassures guest", "Avoids overpromising"],
  },
  {
    id: "refund-compensation",
    title: "Refund / Compensation Response",
    purpose: "Respond without overpromising and explain that the matter will be reviewed.",
    bestUsedFor: "When a guest requests compensation or complains about an issue.",
    tone: "Professional, fair, calm.",
    message: `Hi {guest_name},

Thank you for sharing your concern with us.

We're sorry to hear that this affected your experience at {property_name}. We take guest feedback seriously and will review the details of the situation carefully.

Our team will check what happened, including the timing, impact, and any supporting information. Once reviewed, we'll update you on the next steps and whether any adjustment or compensation is applicable.

Thank you for your patience while we look into this properly.

Kind regards,
{host_name}`,
    keyPoints: ["Acknowledges concern", "Shows professionalism", "Does not overpromise", "Explains review process", "Keeps tone calm"],
  },
  {
    id: "lost-item",
    title: "Lost Item Response",
    purpose: "Help the guest while setting realistic expectations.",
    bestUsedFor: "When a guest says they left something behind.",
    tone: "Helpful, efficient, supportive.",
    message: `Hi {guest_name},

Thank you for letting us know.

We'll ask our team to check {property_name} for the following item:

{item_description}

Once the property has been checked, we'll update you as soon as possible. If the item is found, we can help arrange collection or courier delivery where available. Courier or delivery costs would be payable by the guest.

We'll keep you posted.

Kind regards,
{host_name}`,
    keyPoints: ["Confirms item details", "Explains team will check", "Sets expectation for update", "Mentions courier at guest cost", "Keeps tone helpful"],
  },
  {
    id: "damage-claim",
    title: "Damage Claim Message",
    purpose: "Notify the guest clearly and start the damage resolution process.",
    bestUsedFor: "When damage is found after or during a stay.",
    tone: "Professional, factual, non-emotional.",
    message: `Hi {guest_name},

We hope you are well.

Following the inspection of {property_name}, our team noted the following issue:

{damage_description}

We are currently reviewing the details and any available supporting evidence. If required, the matter may be handled through the {booking_platform} resolution process in line with the booking terms.

We kindly ask for your cooperation while this is reviewed. We'll share the next steps once the assessment is complete.

Kind regards,
{host_name}`,
    keyPoints: ["States issue factually", "Avoids aggressive language", "Mentions evidence/review", "References platform process", "Requests cooperation"],
  },
];

// ─── Template purposes (one-liner shown on card) ──────────────────────────────
const TEMPLATE_CARD_DESC: Record<string, string> = {
  "booking-confirmation": "Send immediately after booking is confirmed",
  "pre-arrival": "Send 1–3 days before guest arrival",
  "check-in-instructions": "Send on day before or morning of arrival",
  "mid-stay": "Send after first night or midway through stay",
  "checkout-reminder": "Send evening before or morning of checkout",
  "review-request": "Send after a positive checkout",
  "late-checkout": "Use when guest requests late checkout",
  "noise-complaint": "Use when noise complaint is reported",
  "maintenance-issue": "Use when guest reports a maintenance issue",
  "refund-compensation": "Use when guest requests compensation",
  "lost-item": "Use when guest reports a lost item",
  "damage-claim": "Use when damage is found after stay",
};

// ─── Template Modal ───────────────────────────────────────────────────────────
function TemplateModal({ template, isMobile, onClose }: { template: GuestTemplate; isMobile: boolean; onClose: () => void }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  const msgBoxStyle: React.CSSProperties = {
    background: "#F8F4EE",
    borderRadius: "10px",
    border: "1px solid #E6E1D8",
    padding: "16px 18px",
    fontSize: "13.5px",
    color: "#1A1A1A",
    lineHeight: 1.75,
    whiteSpace: "pre-wrap",
    fontFamily: "'Georgia', serif",
    maxHeight: "260px",
    overflowY: "auto",
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(10,26,20,0.65)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#FDFBF8", borderRadius: "24px", width: "100%", maxWidth: "660px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.24)", border: "1px solid #E6E1D8", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: isMobile ? "24px 22px 18px" : "30px 36px 22px", borderBottom: "1px solid #E6E1D8", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: "18px", right: "18px", background: "none", border: "none", cursor: "pointer", color: "#6B6B6B", fontSize: "20px", lineHeight: 1, padding: "4px 8px" }}>×</button>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#B88A44", letterSpacing: "0.14em", marginBottom: "10px" }}>GUEST COMMUNICATION TEMPLATE</div>
          <h2 style={{ fontSize: isMobile ? "19px" : "22px", fontFamily: "'Georgia', serif", fontWeight: 700, color: "#1A1A1A", marginBottom: "14px", paddingRight: "32px" }}>{template.title}</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", background: "#F0F8F4", borderRadius: "999px", border: "1px solid #1B5E4A20" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#1B5E4A", letterSpacing: "0.08em" }}>BEST USED FOR</span>
              <span style={{ fontSize: "12px", color: "#1B5E4A" }}>{template.bestUsedFor}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", background: "#FFFBF5", borderRadius: "999px", border: "1px solid #B88A4420" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#B88A44", letterSpacing: "0.08em" }}>TONE</span>
              <span style={{ fontSize: "12px", color: "#7A5010" }}>{template.tone}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: isMobile ? "20px 22px 28px" : "26px 36px 36px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Single message */}
          {template.message && (
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#6B6B6B", letterSpacing: "0.08em", marginBottom: "10px" }}>MESSAGE TEMPLATE</div>
              <div style={msgBoxStyle}>{template.message}</div>
              <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                <button onClick={() => copyText(template.message!, "main")} style={{ padding: "9px 20px", background: copiedId === "main" ? "#1B5E4A" : `linear-gradient(135deg, #B88A44 0%, #8B6F3F 100%)`, color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "background 0.2s", minWidth: "130px" }}>
                  {copiedId === "main" ? "Copied" : "Copy Template"}
                </button>
              </div>
            </div>
          )}

          {/* Multi-section messages (late checkout) */}
          {template.sections && template.sections.map((sec, idx) => (
            <div key={idx}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#6B6B6B", letterSpacing: "0.08em", marginBottom: "10px" }}>{sec.label.toUpperCase()}</div>
              <div style={msgBoxStyle}>{sec.message}</div>
              <div style={{ marginTop: "10px" }}>
                <button onClick={() => copyText(sec.message, `sec-${idx}`)} style={{ padding: "9px 20px", background: copiedId === `sec-${idx}` ? "#1B5E4A" : `linear-gradient(135deg, #B88A44 0%, #8B6F3F 100%)`, color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "background 0.2s", minWidth: "130px" }}>
                  {copiedId === `sec-${idx}` ? "Copied" : `Copy ${sec.label}`}
                </button>
              </div>
            </div>
          ))}

          {/* Key points */}
          <div style={{ background: "#F5F1EA", borderRadius: "10px", border: "1px solid #DDD8CE", padding: "16px 18px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#B88A44", letterSpacing: "0.08em", marginBottom: "10px" }}>KEY POINTS COVERED</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {template.keyPoints.map(pt => (
                <div key={pt} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{ marginTop: "2px", flexShrink: 0 }}><circle cx="10" cy="10" r="8.5" stroke="#1B5E4A" strokeWidth="1.2" opacity="0.3" /><path d="M6.5 10L9 12.5L13.5 7.5" stroke="#1B5E4A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span style={{ fontSize: "13px", color: "#5A4A30", lineHeight: 1.5 }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={onClose} style={{ padding: "12px", background: "transparent", color: "#6B6B6B", border: "1.5px solid #E6E1D8", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Readiness items ──────────────────────────────────────────────────────────
const READINESS = [
  "I can register and manage DET permit requirements",
  "I can set up OTA listings correctly",
  "I can manage or connect a PMS",
  "I have a reliable cleaning team",
  "I have maintenance support",
  "I can manage guest communication quickly",
  "I can review pricing weekly",
  "I have SOPs and templates ready",
  "I can track revenue, costs, and net income monthly",
  "I can handle guest issues and escalations",
];

// ─── Main page ────────────────────────────────────────────────────────────────
export default function OwnersPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  // Payment (preserve backend logic)
  const [hasAccess] = useState(true);
  const [modal, setModal] = useState<Product | null>(null);
  // Lead modal
  const [showLead, setShowLead] = useState(false);
  // Vendor modal
  const [showVendor, setShowVendor] = useState(false);
  // Template modal
  const [selectedTemplate, setSelectedTemplate] = useState<GuestTemplate | null>(null);
  // Accordions — keyed by section+id string
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setOpen(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  // Readiness checklist
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const toggleCheck = (i: number) => setChecked(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const score = checked.size;

  async function handleCheckout(product: Product) {
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pkg: product.name, origin: window.location.origin }) });
      const data = await res.json();
      if (data.ok && data.url) { window.location.href = data.url; } else { alert("Payment unavailable right now."); }
    } catch { alert("Payment unavailable right now."); }
    setModal(null);
  }

  const padH = isMobile ? "0 20px" : "0 40px";
  const secPad = isMobile ? "52px 20px" : "72px 40px";

  return (
    <div style={{ background: C.bgMain, minHeight: "100vh" }}>
      {modal && <PaymentModal product={modal} onClose={() => setModal(null)} onCheckout={handleCheckout} />}
      {showLead && <LeadModal isMobile={isMobile} onClose={() => setShowLead(false)} />}
      {showVendor && <VendorModal isMobile={isMobile} onClose={() => setShowVendor(false)} />}
      {selectedTemplate && <TemplateModal template={selectedTemplate} isMobile={isMobile} onClose={() => setSelectedTemplate(null)} />}

      {/* ─── HEADER ─── */}
      <SiteNav active="self-manage" />

      {/* ─── HERO ─── */}
      <section style={{ background: C.bgSection, borderBottom: `1px solid ${C.border}`, padding: isMobile ? "48px 20px" : "80px 40px", position: "relative", overflow: "hidden" }}>
        {!isMobile && (
          <>
            <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
              <img
                src="/Locations/Marina.png"
                alt=""
                aria-hidden="true"
                style={{ position: "absolute", right: 0, top: 0, width: "58%", height: "100%", objectFit: "cover", objectPosition: "center top", opacity: 0.13 }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #FFFFFF 0%, #FFFFFF 22%, rgba(255,255,255,0.75) 42%, rgba(255,255,255,0) 65%)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #FFFFFF 0%, rgba(255,255,255,0) 25%)" }} />
            </div>
            <div style={{ position: "absolute", top: "-40px", right: "-60px", width: "540px", height: "540px", borderRadius: "50%", background: `radial-gradient(ellipse at center, ${C.secondary}16 0%, transparent 68%)`, zIndex: 0, pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "0", right: "0", width: "360px", height: "260px", background: `radial-gradient(ellipse at bottom right, ${C.primary}0E 0%, transparent 70%)`, zIndex: 0, pointerEvents: "none" }} />
          </>
        )}
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "40px" : "72px", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "11px", color: C.secondary, fontWeight: 700, letterSpacing: "0.14em", marginBottom: "14px" }}>OWNER SELF-MANAGEMENT PLAYBOOK</div>
            <h1 style={{ fontSize: isMobile ? "30px" : "46px", fontFamily: SF, fontWeight: 700, lineHeight: 1.15, marginBottom: "18px", background: `linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Set Up Your Short-Term Rental Like a Professional Operator
            </h1>
            <p style={{ fontSize: "16px", color: C.textMuted, lineHeight: 1.65, marginBottom: "28px", maxWidth: "520px" }}>
              A practical 6-step setup framework for Dubai owners managing 1–8 units who want to reduce management fees, maintain control, and operate professionally.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", background: "#F0F8F4", borderRadius: "999px", border: `1px solid ${C.primary}30`, marginBottom: "28px" }}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8.5" stroke={C.primary} strokeWidth="1.2" opacity="0.4" /><path d="M6.5 10L9 12.5L13.5 7.5" stroke={C.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span style={{ fontSize: "12.5px", fontWeight: 600, color: C.primary }}>Free access for now</span>
            </div>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <a href="#step-1" style={{ padding: "14px 28px", background: C.primary, color: "#fff", borderRadius: "10px", fontSize: "15px", fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 20px rgba(27,94,74,0.22)" }}>Start The 6-Step Setup</a>
              <a href="#account-manager" style={{ padding: "14px 22px", background: "transparent", color: C.secondary, border: `2px solid ${C.secondary}`, borderRadius: "10px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}>Speak To An Account Manager</a>
            </div>
          </div>
          {/* Hero summary card */}
          <div style={{ flexShrink: 0, width: isMobile ? "100%" : "260px" }}>
            <div style={{ background: C.bgMain, borderRadius: "18px", border: `1.5px solid ${C.border}`, padding: "26px", boxShadow: "0 8px 32px rgba(27,94,74,0.07)" }}>
              <div style={{ fontSize: "11px", color: C.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "18px" }}>THE 6 SYSTEMS YOU NEED</div>
              {[
                { n: 1, label: "DET Portal", icon: <IconDET color={C.primary} /> },
                { n: 2, label: "OTA Accounts", icon: <IconOTA color={C.secondary} /> },
                { n: 3, label: "PMS", icon: <IconPMS color={C.primary} /> },
                { n: 4, label: "Operations Team", icon: <IconTeam color={C.secondary} /> },
                { n: 5, label: "Pricing", icon: <IconPricing color={C.primary} /> },
                { n: 6, label: "SOPs", icon: <IconSOP color={C.secondary} /> },
              ].map(({ n, label, icon }) => (
                <a key={n} href={`#step-${n}`} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: `1px solid ${C.border}`, textDecoration: "none" }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>{n}</div>
                  <span style={{ fontSize: "13.5px", color: C.textMain, fontWeight: 500 }}>{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6-STEP OVERVIEW ─── */}
      <section style={{ padding: secPad }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <SH label="THE FRAMEWORK" title="The 6-Step Self-Management System" subtitle="Self-management works only when compliance, listings, systems, teams, pricing, and standards are properly set up." />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "18px" }}>
            {[
              { n: 1, icon: <IconDET color={C.primary} />, title: "DET Portal Setup", desc: "Register with DET, apply for permits, and manage guest check-in/check-out obligations.", href: "#step-1" },
              { n: 2, icon: <IconOTA color={C.secondary} />, title: "OTA Account Setup", desc: "Create and optimise your accounts across Airbnb, Booking.com, Vrbo, and other relevant platforms.", href: "#step-2" },
              { n: 3, icon: <IconPMS color={C.primary} />, title: "PMS Setup", desc: "Connect OTAs into one system to manage calendars, messaging, tasks, and reporting from one place.", href: "#step-3" },
              { n: 4, icon: <IconTeam color={C.secondary} />, title: "Operations Team Setup", desc: "Set up third-party housekeeping, maintenance, guest relations, and virtual assistant support.", href: "#step-4" },
              { n: 5, icon: <IconPricing color={C.primary} />, title: "Pricing Setup", desc: "Use dynamic pricing tools and adjust rates based on market demand, season, and events.", href: "#step-5" },
              { n: 6, icon: <IconSOP color={C.secondary} />, title: "SOPs & Templates", desc: "Create repeatable standards for cleaning, maintenance, guest messages, inspections, and escalation.", href: "#step-6" },
            ].map(({ n, icon, title, desc, href }) => (
              <div key={n} style={{ background: C.bgSection, borderRadius: "16px", border: `1px solid ${C.border}`, padding: "24px", boxShadow: C.shadowSm, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${C.primary}0A`, border: `1px solid ${C.primary}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#fff" }}>{n}</div>
                </div>
                <h3 style={{ fontSize: "15px", fontFamily: SF, fontWeight: 700, color: C.textMain, marginBottom: "8px" }}>{title}</h3>
                <p style={{ fontSize: "13px", color: C.textMuted, lineHeight: 1.6, flex: 1, marginBottom: "16px" }}>{desc}</p>
                <a href={href} style={{ fontSize: "13px", fontWeight: 700, color: C.primary, textDecoration: "none" }}>View step →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING DISCLAIMER STRIP ─── */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: isMobile ? "0 20px 32px" : "0 40px 32px" }}>
        <div style={{ background: "#F5F1EA", borderRadius: "12px", border: `1px solid #DDD8CE`, padding: "14px 20px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <div style={{ marginTop: "1px", flexShrink: 0 }}><IconInfo color={C.secondary} /></div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: C.secondary, letterSpacing: "0.1em", marginRight: "8px" }}>PRICING NOTE</span>
            <span style={{ fontSize: "13px", color: "#5A4A30", lineHeight: 1.6 }}>
              The costs below are approximate and may vary based on DET updates, software plans, portfolio size, selected vendors, building requirements, and operator setup preferences. Owners should verify final pricing directly with DET, software providers, and service vendors before proceeding.
            </span>
          </div>
        </div>
      </div>

      {/* ─── STEPS ─── */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", paddingLeft: isMobile ? "20px" : "40px", paddingRight: isMobile ? "20px" : "40px", paddingTop: 0, paddingBottom: "8px" }}>

        {/* STEP 1 — DET */}
        <StepSection id="step-1" num={1} icon={<IconDET color={C.primary} />}
          title="DET Portal & Holiday Home Permit"
          subtitle="The legal foundation. You cannot operate without this."
          intro="Owners who self-manage must register their holiday home through the DET holiday homes system and obtain a permit before listing the property. The portal is used to apply for holiday home permits for each unit and manage compliance obligations such as guest check-in/check-out records.">
          <DETPricingCard isMobile={isMobile} />
          <Accordion id="s1a" title="A — Owner Registration" open={open.has("s1a")} onToggle={toggle}>
            <p style={{ fontSize: "13.5px", color: C.textMuted, lineHeight: 1.65, marginTop: "12px" }}>Create your account on the DET portal and complete your owner profile with accurate personal and contact details. Overseas owners can register — you do not need to be a UAE resident.</p>
          </Accordion>
          <Accordion id="s1b" title="B — Property Permit Setup" open={open.has("s1b")} onToggle={toggle}>
            <p style={{ fontSize: "13.5px", color: C.textMuted, lineHeight: 1.65, marginTop: "12px" }}>Each property requires its own holiday home permit before it can be listed on any OTA. A permit is not transferable between units. Processing typically takes 3–7 working days. The permit is valid for one year and must be renewed annually.</p>
          </Accordion>
          <Accordion id="s1c" title="C — Documents To Prepare" open={open.has("s1c")} onToggle={toggle}>
            <CL items={["Title deed or approved ownership document", "Owner passport / Emirates ID", "DEWA bill", "Property details (floor, size, unit number)", "Developer / building NOC if required", "Property photos if required"]} />
          </Accordion>
          <Accordion id="s1d" title="D — Guest Check-In / Check-Out Process" open={open.has("s1d")} onToggle={toggle}>
            <p style={{ fontSize: "13.5px", color: C.textMuted, lineHeight: 1.65, marginTop: "12px" }}>Owners are required to maintain guest records for each stay. Build a consistent process to collect guest passport or Emirates ID details and update these through the DET holiday homes system. Retain guest records for 5 years.</p>
          </Accordion>
          <Accordion id="s1e" title="E — Renewal & Compliance Tracking" open={open.has("s1e")} onToggle={toggle}>
            <CL items={["Track permit expiry date per unit", "Set renewal reminder 45 days before expiry", "Keep guest ID collection consistent across all stays", "Ensure permit is displayed inside the property", "Stay updated on any DET requirement changes"]} />
          </Accordion>
          <Note>Requirements can change. Owners should verify current DET requirements and building / community rules before listing or operating. Some buildings in master communities (Emaar, Nakheel, Damac) may require a developer NOC, which can take 5–15 working days and cost AED 500–2,000.</Note>
        </StepSection>

        {/* STEP 2 — OTA */}
        <StepSection id="step-2" num={2} icon={<IconOTA color={C.secondary} />}
          title="OTA Account Setup"
          subtitle="Your OTA accounts are your storefront. Poor setup means lower visibility and lower revenue."
          intro="Owners usually need to create and manage accounts and listings across platforms such as Airbnb, Booking.com, and other relevant channels. Your listing is your first impression — weak setup directly reduces bookings.">
          <div style={{ padding: "14px 18px", background: "#FFFBF5", borderRadius: "10px", border: `1px solid #E8D9BC`, borderLeft: `3px solid ${C.secondary}`, marginBottom: "4px" }}>
            <p style={{ fontSize: "13px", color: "#7A5010", margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: C.secondary }}>OTA Platform Costs:</strong> OTA platforms may charge host or service commissions, or guest service fees, depending on platform structure and booking model. Final charges should be checked directly with each OTA before listing.
            </p>
          </div>
          <Accordion id="s2a" title="A — Account Creation" open={open.has("s2a")} onToggle={toggle}>
            <CL color={C.secondary} items={["Create owner/host account on each platform", "Complete your profile fully — photo, bio, response rate", "Verify identity where required (government ID)", "Add payout details and bank information", "Set notification preferences — push notifications are essential"]} />
          </Accordion>
          <Accordion id="s2b" title="B — Listing Setup" open={open.has("s2b")} onToggle={toggle}>
            <CL color={C.secondary} items={["Professional photos — minimum 15–25 images per unit", "Clear listing title including community, view, and unit type", "Strong description covering layout, location benefits, and unique features", "Accurate amenities list — do not overstate", "House rules clearly stated", "Check-in instructions and access method", "Cancellation policy appropriate for your risk tolerance", "Cleaning fee set to cover your actual cleaning cost", "Security deposit or damage policy where platform allows"]} />
          </Accordion>
          <Accordion id="s2c" title="C — Calendar & Availability" open={open.has("s2c")} onToggle={toggle}>
            <CL color={C.secondary} items={["Keep calendar updated at all times to avoid double-bookings", "Use a PMS or channel manager once live on 2+ platforms", "Set minimum night requirements appropriate to season", "Block maintenance days in advance", "Manage owner stays with owner-blocked dates"]} />
          </Accordion>
          <Accordion id="s2d" title="D — Review Strategy" open={open.has("s2d")} onToggle={toggle}>
            <CL color={C.secondary} items={["Respond to guest messages within 1 hour", "Smooth check-in experience is the #1 factor in first reviews", "Clean, well-presented property on arrival", "Send review request template after checkout", "Respond professionally and briefly to negative reviews — future guests read your responses"]} />
          </Accordion>
          <Accordion id="s2e" title="E — OTA Risk Controls" open={open.has("s2e")} onToggle={toggle}>
            <CL color={C.secondary} items={["Do not overstate amenities — guests flag inaccurate listings", "Keep photos accurate — outdated photos cause expectation mismatches", "Avoid manual calendar mistakes that lead to double-bookings", "Monitor platform messages daily — algorithms track response times", "Read platform policy updates — rules change, especially on Airbnb"]} />
          </Accordion>
        </StepSection>

        {/* STEP 3 — PMS */}
        <StepSection id="step-3" num={3} icon={<IconPMS color={C.primary} />}
          title="PMS / Channel Manager"
          subtitle="A PMS becomes essential once you are on multiple OTAs or managing more than one unit."
          intro="A PMS helps owners manage calendars, reservations, guest messages, channel sync, owner reporting, and team tasks across platforms. Common STR PMS options include Guesty and Hostaway.">
          {/* PMS Pricing Guidance */}
          <div style={{ background: C.bgMain, borderRadius: "14px", border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", background: `${C.primary}08`, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.primary, letterSpacing: "0.08em" }}>PMS PRICING GUIDANCE — GUESTY & HOSTAWAY</div>
            </div>
            <div style={{ padding: "18px 20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.06em", marginBottom: "8px" }}>PRICING MODEL</div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: C.secondary }}>Usually quote-based or portfolio-based</div>
                  <p style={{ fontSize: "13px", color: C.textMuted, lineHeight: 1.6, marginTop: "6px" }}>Guesty and Hostaway pricing often depends on portfolio size, selected modules, onboarding, and feature requirements. Owners should request direct quotes from the provider.</p>
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.06em", marginBottom: "8px" }}>TYPICAL COST FACTORS</div>
                  <CL items={["Number of listings", "Channel manager requirements", "Guest messaging and automation", "Owner portal and reporting", "Payment tools", "Onboarding support", "Integrations"]} />
                </div>
              </div>
              <div style={{ padding: "12px 16px", background: "#FFFBF5", borderRadius: "8px", border: "1px solid #E8D9BC" }}>
                <p style={{ fontSize: "12.5px", color: "#7A5010", margin: 0, lineHeight: 1.6 }}>Some PMS platforms also include pricing or revenue management features, but owners may still choose a dedicated pricing tool depending on their strategy.</p>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
            {[
              { title: "OTA Calendar Sync", desc: "Connect Airbnb, Booking.com, Vrbo, and others to reduce double-booking risk." },
              { title: "Unified Inbox", desc: "Manage guest messages from all platforms in one place." },
              { title: "Automated Guest Messaging", desc: "Automate booking confirmations, pre-arrival, check-in instructions, checkout reminders, and review requests." },
              { title: "Task Management", desc: "Create cleaning, maintenance, inspection, and follow-up tasks automatically on new bookings." },
              { title: "Team Access", desc: "Give limited access to cleaners, VAs, or team members without handing over full control." },
              { title: "Channel Manager", desc: "Sync rates, availability, restrictions, and reservations across platforms simultaneously." },
              { title: "Direct Booking Website", desc: "Some PMS tools allow a direct booking site to reduce platform dependency over time." },
              { title: "Owner / Financial Reporting", desc: "Track revenue, bookings, payouts, expenses, and monthly performance from one dashboard." },
              { title: "Pricing Tool Integration", desc: "Connect with PriceLabs, Beyond, or Wheelhouse where supported for automated rate adjustments." },
              { title: "Guest Verification / Forms", desc: "Collect guest information, ID, and arrival details through automated forms where available." },
            ].map(({ title, desc }) => (
              <div key={title} style={{ padding: "14px 16px", background: C.bgMain, borderRadius: "10px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: C.textMain, marginBottom: "4px" }}>{title}</div>
                <div style={{ fontSize: "12.5px", color: C.textMuted, lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginTop: "8px" }}>
            <div style={{ padding: "18px 20px", background: C.bgMain, borderRadius: "12px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", marginBottom: "10px" }}>WHEN PMS IS OPTIONAL</div>
              <CL items={["Single unit only", "Single OTA platform", "Owner managing messaging personally and has time"]} />
            </div>
            <div style={{ padding: "18px 20px", background: "#F0F8F4", borderRadius: "12px", border: `1px solid ${C.primary}20` }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.primary, letterSpacing: "0.08em", marginBottom: "10px" }}>WHEN PMS BECOMES NECESSARY</div>
              <CL items={["2+ units", "Multiple OTAs", "Same-day turnovers", "Outsourced housekeeping", "Guest messages handled by VA or team", "Need cleaner and task automation"]} />
            </div>
          </div>
        </StepSection>

        {/* STEP 4 — TEAM */}
        <StepSection id="step-4" num={4} icon={<IconTeam color={C.secondary} />}
          title="Operations Team Setup"
          subtitle="Self-management means you control the system — not that you do everything yourself."
          intro="Self-managing owners still need reliable STR operations support for housekeeping, maintenance, guest support, inspections, and issue handling. AssetIntel can help connect owners with experienced third-party vendors already working in the Dubai STR space.">
          {/* Vendor categories */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
            {[
              { title: "Housekeeping Teams", items: ["STR cleaning experience and same-day turnover ability", "Linen handling and laundry coordination", "Inspection photos submitted after each clean", "Replenishment checks for toiletries and consumables", "Cleaning checklist sign-off per stay"] },
              { title: "Maintenance Providers", items: ["Handyman for general repairs", "AC technician for the most common Dubai issue", "Plumber, electrician, and locksmith contacts", "Appliance repair contact", "Emergency response process defined in advance"] },
              { title: "Virtual Assistant / Guest Messaging Teams", items: ["Answering OTA messages using templates", "Coordinating check-ins and cleaner scheduling", "Updating task boards and tracking guest issues", "Escalating emergencies to the owner or team", "Following up on review requests"] },
              { title: "Guest Relations Support", items: ["Guest issue handling and complaint escalation", "Review protection — fast resolution prevents bad reviews", "Check-in support for late arrivals or access issues", "Post-stay follow-up and review requests", "Especially important in buildings with strict access procedures"] },
              { title: "Laundry / Linen Support", items: ["Linen collection and return per turnover", "Linen quality checks and replacement tracking", "Coordination with housekeeping team schedules", "Towel and bedding par levels per unit size"] },
              { title: "Smart Lock / Access Support", items: ["Access card process per building", "Parking instructions and guest access codes", "Security desk check-in procedure", "Guest ID submission process where required", "Backup key or access backup process"] },
            ].map(({ title, items }) => (
              <div key={title} style={{ padding: "18px 20px", background: C.bgMain, borderRadius: "12px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: C.textMain, marginBottom: "10px", paddingBottom: "8px", borderBottom: `1px solid ${C.border}` }}>{title}</div>
                <CL items={items} color={C.secondary} />
              </div>
            ))}
          </div>
          {/* Vendor CTA */}
          <div style={{ background: `linear-gradient(135deg, ${C.primary}08 0%, ${C.secondary}06 100%)`, borderRadius: "16px", border: `1px solid ${C.primary}20`, padding: isMobile ? "24px 20px" : "28px 32px", display: "flex", flexDirection: isMobile ? "column" : "row", gap: "20px", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: C.secondary, letterSpacing: "0.1em", marginBottom: "8px" }}>VENDOR INTRODUCTIONS</div>
              <h3 style={{ fontSize: "17px", fontFamily: SF, fontWeight: 700, color: C.textMain, marginBottom: "6px" }}>Need STR Operations Vendor Contacts?</h3>
              <p style={{ fontSize: "13.5px", color: C.textMuted, lineHeight: 1.6, margin: 0 }}>AssetIntel can introduce owners to experienced third-party vendors already working in the Dubai STR space. Vendor quotes, availability, and service quality should be confirmed directly.</p>
            </div>
            <div style={{ flexShrink: 0 }}>
              <button onClick={() => setShowVendor(true)} style={{ padding: "13px 26px", background: `linear-gradient(135deg, ${C.primary} 0%, #0F3E33 100%)`, color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(27,94,74,0.22)", whiteSpace: "nowrap" }}>
                Get STR Vendor Contacts
              </button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
            <div style={{ padding: "18px 20px", background: C.bgMain, borderRadius: "12px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", marginBottom: "10px" }}>MINIMUM TEAM — 1–2 UNITS</div>
              <CL items={["One STR cleaning team", "One handyman contact", "One AC technician contact", "One VA or owner-managed inbox", "One guest escalation contact"]} />
            </div>
            <div style={{ padding: "18px 20px", background: "#F0F8F4", borderRadius: "12px", border: `1px solid ${C.primary}20` }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.primary, letterSpacing: "0.08em", marginBottom: "10px" }}>SCALED TEAM — 3–8 UNITS</div>
              <CL items={["Dedicated housekeeping partner", "Maintenance escalation list per issue type", "VA coverage across platforms", "Guest relations support contact", "PMS task workflows per cleaning team"]} />
            </div>
          </div>
        </StepSection>

        {/* STEP 5 — PRICING */}
        <StepSection id="step-5" num={5} icon={<IconPricing color={C.primary} />}
          title="Dynamic Pricing Setup"
          subtitle="Pricing is not a one-time decision. It needs weekly review and seasonal adjustment."
          intro="Dynamic pricing tools help adjust nightly rates and minimum stays based on demand, seasonality, market data, and listing performance. PriceLabs is commonly used for STR dynamic pricing. Guesty and Hostaway may also offer pricing or revenue-management features depending on plan and setup — owners should confirm whether these features are included or require additional configuration.">
          {/* PriceLabs pricing card */}
          <div style={{ background: C.bgMain, borderRadius: "14px", border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", background: `${C.primary}08`, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.primary, letterSpacing: "0.08em" }}>DYNAMIC PRICING SOFTWARE — APPROXIMATE COSTS</div>
            </div>
            <div style={{ padding: "16px 20px 20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", marginBottom: "14px" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: C.textMain, marginBottom: "4px" }}>PriceLabs — Dynamic Pricing</div>
                  <div style={{ fontSize: "12.5px", color: C.textMuted, lineHeight: 1.5 }}>Based on PriceLabs publicly listed pricing</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: C.secondary }}>From approx. USD 14.49 / listing / month</div>
                  <div style={{ fontSize: "12px", color: C.textMuted }}>Plus applicable taxes</div>
                </div>
              </div>
              <div style={{ padding: "12px 16px", background: "#FFFBF5", borderRadius: "8px", border: "1px solid #E8D9BC" }}>
                <p style={{ fontSize: "12.5px", color: "#7A5010", margin: 0, lineHeight: 1.6 }}>Even with pricing software, owners should review settings regularly — especially during peak season, low season, public holidays, major events, and early listing launch periods. Software automates rate adjustments, but owner oversight improves performance.</p>
              </div>
            </div>
          </div>
          <Accordion id="s5a" title="A — Base Price" open={open.has("s5a")} onToggle={toggle}>
            <p style={{ fontSize: "13.5px", color: C.textMuted, lineHeight: 1.65, marginTop: "12px" }}>Set a realistic starting nightly rate based on your building, unit type, view, furnishing level, and comparable listings in the same community. Research 8–12 comparable listings to establish your market position before launching.</p>
          </Accordion>
          <Accordion id="s5b" title="B — Seasonality" open={open.has("s5b")} onToggle={toggle}>
            <CL items={["Dubai peak season: November to March — highest demand and rates", "Summer low season: June to August — occupancy and rates drop 30–45%", "Shoulder periods: April–May and September–October", "Price according to the season, not a flat annual rate"]} />
          </Accordion>
          <Accordion id="s5c" title="C — Event Pricing" open={open.has("s5c")} onToggle={toggle}>
            <CL items={["Adjust pricing for major events: Art Dubai, GITEX, World Cup qualifiers, concerts, NYE", "Dubai Shopping Festival and Eid holidays increase demand significantly", "Conference season (Oct–Nov) drives weekday corporate demand", "Track the Dubai events calendar and adjust pricing 60–90 days ahead"]} />
          </Accordion>
          <Accordion id="s5d" title="D — Minimum Stay Rules" open={open.has("s5d")} onToggle={toggle}>
            <CL items={["Peak season: 2–3 night minimum to protect against expensive same-day turnovers", "Low season: reduce to 1–2 nights to maximise occupancy", "Events and holidays: consider 3–5 night minimum", "Review minimum stay rules monthly — too high kills occupancy, too low increases costs"]} />
          </Accordion>
          <Accordion id="s5e" title="E — Gap Night Strategy" open={open.has("s5e")} onToggle={toggle}>
            <p style={{ fontSize: "13.5px", color: C.textMuted, lineHeight: 1.65, marginTop: "12px" }}>Isolated 1–2 night gaps between bookings are missed revenue. Discount gap nights by 10–20% to fill them. Most dynamic pricing tools can automate this. A filled gap night at a lower rate is better than an empty night at a premium rate.</p>
          </Accordion>
          <Accordion id="s5f" title="F — Weekly Pricing Review" open={open.has("s5f")} onToggle={toggle}>
            <CL items={["Review next 7, 30, and 90 days every week", "Check occupancy pace — are you ahead or behind expected bookings?", "Compare competitor prices in your building and community", "Identify high-demand dates and make sure rates reflect them", "Identify underperforming gaps and reduce price to fill them"]} />
          </Accordion>
          <Accordion id="s5g" title="G — Pricing Guardrails" open={open.has("s5g")} onToggle={toggle}>
            <CL items={["Set a minimum rate (floor) — never go below your break-even nightly rate", "Set a maximum rate (ceiling) for event peaks to stay competitive", "Set a low-season floor that still covers operating costs", "Set last-minute discount rules — e.g. 10% off 3 days before if still unbooked"]} />
          </Accordion>
          <Note>Do not rely on a flat rate for the full year. Dubai demand varies significantly across months, events, and property type. A flat rate will underperform both in peak season (leaving money on the table) and in low season (blocking bookings entirely).</Note>
        </StepSection>

        {/* STEP 6 — SOPs */}
        <StepSection id="step-6" num={6} icon={<IconSOP color={C.secondary} />}
          title="SOPs & Guest Communication Templates"
          subtitle="SOPs keep your standards consistent across all properties, teams, and guest situations."
          intro="Before launching, you need ready-made operating procedures and message templates for every common scenario. These are what separate professional operations from reactive, inconsistent hosting.">
          <Accordion id="s6a" title="A — Pre-Arrival SOP" open={open.has("s6a")} onToggle={toggle}>
            <CL color={C.secondary} items={["Request guest ID 48 hours before arrival", "Send check-in instructions 24 hours before arrival", "Include: building name, unit number, access code, parking details, WiFi", "Confirm check-in time and contact number", "House rules summary included in message"]} />
          </Accordion>
          <Accordion id="s6b" title="B — Check-In SOP" open={open.has("s6b")} onToggle={toggle}>
            <CL color={C.secondary} items={["Access code or key delivery confirmed working before arrival", "First check-in message sent within 30 minutes of arrival", "Emergency contact provided", "Issue escalation path clear (VA → owner)", "Building amenities briefed in welcome message"]} />
          </Accordion>
          <Accordion id="s6c" title="C — Checkout SOP" open={open.has("s6c")} onToggle={toggle}>
            <CL color={C.secondary} items={["Checkout reminder sent night before — time and instructions", "Key return process clearly communicated", "Damage check within 1 hour of checkout", "Cleaner notified and slot confirmed", "Review request sent within 2 hours of checkout"]} />
          </Accordion>
          <Accordion id="s6d" title="D — Housekeeping SOP" open={open.has("s6d")} onToggle={toggle}>
            <CL color={C.secondary} items={["Cleaning checklist by room — every item listed", "Linen count per bed and towel standard per guest", "Amenities restock checklist (soap, shampoo, coffee, tea)", "Photo proof submitted after cleaning complete", "Any maintenance issues flagged to owner immediately"]} />
          </Accordion>
          <Accordion id="s6e" title="E — Maintenance SOP" open={open.has("s6e")} onToggle={toggle}>
            <CL color={C.secondary} items={["Issue reported via WhatsApp message to designated contact", "Emergency vs non-emergency classification defined in advance", "Approval process for jobs above AED 300 (requires owner sign-off)", "Vendor coordination handled by VA or owner", "Guest compensation rules defined in advance (free night vs partial refund)"]} />
          </Accordion>
          <Accordion id="s6f" title="F — Review SOP" open={open.has("s6f")} onToggle={toggle}>
            <CL color={C.secondary} items={["Review request sent within 2 hours of checkout (automated or manual)", "Negative review response drafted within 24 hours — calm, professional, brief", "Issue follow-up internally to prevent recurrence", "Quality improvement log updated with any recurring feedback"]} />
          </Accordion>
          <div style={{ background: C.bgMain, borderRadius: "16px", border: `1px solid ${C.border}`, padding: isMobile ? "20px 16px" : "26px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: C.textMain, letterSpacing: "0.08em" }}>GUEST COMMUNICATION TEMPLATES</div>
                <div style={{ fontSize: "12.5px", color: C.textMuted, marginTop: "4px" }}>Click any template to view the full message and copy it.</div>
              </div>
              <div style={{ fontSize: "11px", color: C.secondary, fontWeight: 700, padding: "4px 12px", background: "#FFFBF5", borderRadius: "999px", border: "1px solid #E8D9BC" }}>12 templates</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "10px" }}>
              {GUEST_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  style={{
                    padding: "14px 16px",
                    background: C.bgSection,
                    borderRadius: "10px",
                    border: `1px solid ${C.border}`,
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    transition: "box-shadow 0.15s, border-color 0.15s",
                    boxShadow: C.shadowSm,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.primary; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(27,94,74,0.10)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.boxShadow = C.shadowSm; }}
                >
                  <div style={{ fontSize: "13px", fontWeight: 700, color: C.textMain, lineHeight: 1.3 }}>{t.title}</div>
                  <div style={{ fontSize: "12px", color: C.textMuted, lineHeight: 1.4 }}>{TEMPLATE_CARD_DESC[t.id]}</div>
                  <div style={{ marginTop: "4px", fontSize: "11.5px", fontWeight: 600, color: C.primary }}>View template →</div>
                </button>
              ))}
            </div>
          </div>
        </StepSection>

      </div>

      {/* ─── APPROXIMATE COST SNAPSHOT ─── */}
      <section style={{ padding: secPad }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <SH label="COST OVERVIEW" title="Approximate Self-Manage Cost Snapshot" subtitle="A summary of the main cost categories involved in self-managing a Dubai STR. Designed to help owners understand cost layers — not confirmed final pricing." />
          <CostSnapshot isMobile={isMobile} onVendor={() => setShowVendor(true)} />
          <div style={{ marginTop: "16px", padding: "13px 18px", background: "#F5F1EA", borderRadius: "10px", border: `1px solid #DDD8CE`, display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <div style={{ marginTop: "1px", flexShrink: 0 }}><IconInfo color={C.secondary} /></div>
            <p style={{ fontSize: "12.5px", color: "#5A4A30", margin: 0, lineHeight: 1.65 }}>
              This snapshot is designed to help owners understand cost categories, not final confirmed pricing. All costs should be verified directly with DET, software providers, and service vendors before committing to a setup.
            </p>
          </div>
        </div>
      </section>

      {/* ─── ASSETINTEL SETUP CTA ─── */}
      <section style={{ padding: isMobile ? "0 20px 52px" : "0 40px 72px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #0F3E33 100%)`, borderRadius: "20px", padding: isMobile ? "36px 24px" : "52px 60px", textAlign: "center", boxShadow: "0 12px 40px rgba(27,94,74,0.20)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: `${C.secondary}CC`, letterSpacing: "0.14em", marginBottom: "16px" }}>ASSETINTEL SUPPORT</div>
            <h2 style={{ fontSize: isMobile ? "26px" : "34px", fontFamily: SF, fontWeight: 700, color: "#FDFBF7", marginBottom: "16px", lineHeight: 1.2 }}>Need Help Setting Up Your STR Stack?</h2>
            <p style={{ fontSize: "15px", color: "rgba(253,251,247,0.75)", lineHeight: 1.65, marginBottom: "36px", maxWidth: "560px", margin: "0 auto 36px" }}>
              AssetIntel can guide owners through the practical setup layers — DET, PMS, pricing tools, housekeeping, maintenance, guest support, and vendor contacts.
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => setShowLead(true)} style={{ padding: "14px 30px", background: "#FDFBF7", color: C.primary, border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
                Speak To AssetIntel
              </button>
              <button onClick={() => setShowVendor(true)} style={{ padding: "14px 26px", background: "transparent", color: "#FDFBF7", border: "2px solid rgba(253,251,247,0.35)", borderRadius: "10px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
                Request STR Vendor Contacts
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── READINESS CHECKLIST ─── */}
      <section style={{ padding: secPad }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <SH label="SELF-ASSESSMENT" title="Are You Ready To Self-Manage?" />
          <div style={{ background: C.bgSection, borderRadius: "18px", border: `1px solid ${C.border}`, padding: isMobile ? "28px 22px" : "40px 48px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
              {READINESS.map((item, i) => {
                const active = checked.has(i);
                return (
                  <div key={i} onClick={() => toggleCheck(i)} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "13px 16px", background: active ? "#F0F8F4" : C.bgMain, borderRadius: "10px", border: `1.5px solid ${active ? C.primary : C.border}`, cursor: "pointer", transition: "all 0.15s" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "5px", border: `2px solid ${active ? C.primary : C.border}`, background: active ? C.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {active && <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5L4.5 8L9 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <span style={{ fontSize: "13.5px", color: active ? C.textMain : C.textMuted, fontWeight: active ? 600 : 400 }}>{item}</span>
                  </div>
                );
              })}
            </div>
            {(() => {
              const label = score >= 8 ? "Strong candidate for self-management." : score >= 4 ? "Self-management is possible, but setup gaps need to be fixed." : "Use an operator or request setup support before going live.";
              const color = score >= 8 ? "#2D7A4F" : score >= 4 ? "#A37020" : "#B03030";
              const bg = score >= 8 ? "#E8F5EE" : score >= 4 ? "#FEF3E2" : "#FDE8E8";
              return (
                <div style={{ padding: "22px 26px", background: bg, borderRadius: "14px", border: `2px solid ${color}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                  <div style={{ fontSize: "38px", fontWeight: 700, color, fontFamily: SF }}>{score} / 10</div>
                  <div style={{ fontSize: "14px", color, fontWeight: 600, maxWidth: "340px" }}>{label}</div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* ─── ACCOUNT MANAGER CTA ─── */}
      <section id="account-manager" style={{ padding: secPad, background: C.bgSection, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}><IconSupport color={C.primary} /></div>
          <div style={{ fontSize: "11px", color: C.secondary, fontWeight: 700, letterSpacing: "0.14em", marginBottom: "14px" }}>ACCOUNT MANAGER SETUP SUPPORT</div>
          <h2 style={{ fontSize: isMobile ? "26px" : "34px", fontFamily: SF, fontWeight: 700, color: C.textMain, marginBottom: "16px", lineHeight: 1.2 }}>Want AssetIntel To Help Set This Up?</h2>
          <p style={{ fontSize: "15px", color: C.textMuted, lineHeight: 1.65, marginBottom: "12px", maxWidth: "560px", margin: "0 auto 12px" }}>
            Our account manager can help with the full setup or only the parts you need — from DET portal and OTA listings to PMS, operations teams, pricing tools, and SOP templates.
          </p>
          <p style={{ fontSize: "14px", color: C.textMuted, marginBottom: "32px" }}>Custom guidance and setup pricing discussed with an account manager.</p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setShowLead(true)} style={{ padding: "14px 30px", background: `linear-gradient(135deg, ${C.primary} 0%, #0F3E33 100%)`, color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(27,94,74,0.22)" }}>
              Speak To An Account Manager
            </button>
            <button onClick={() => setShowLead(true)} style={{ padding: "14px 26px", background: "transparent", color: C.secondary, border: `2px solid ${C.secondary}`, borderRadius: "10px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
              Request Partial Setup Support
            </button>
          </div>
        </div>
      </section>

      {/* ─── DISCLAIMER ─── */}
      <section style={{ padding: isMobile ? "32px 20px" : "40px 40px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div style={{ background: C.bgSection, borderRadius: "14px", border: `1px solid ${C.border}`, padding: "20px 24px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{ marginTop: "2px", flexShrink: 0 }}><IconShield color={C.textMuted} /></div>
            <p style={{ fontSize: "12.5px", color: C.textMuted, lineHeight: 1.7, margin: 0 }}>
              AssetIntel provides rental intelligence, frameworks, and setup guidance. Requirements, platform rules, permit fees, software pricing, and building policies can change. Owners should verify current DET, building, platform, and software pricing requirements before listing or operating a short-term rental. Nothing in this playbook constitutes legal or financial advice.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: C.bgSection, borderTop: `1px solid ${C.border}`, padding: "40px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <AssetIntelLogo size={32} />
            <span style={{ fontSize: "14px", color: C.textMuted }}>AssetIntel — Dubai Property Intelligence</span>
          </div>
          <div style={{ fontSize: "13px", color: C.textMuted }}>© {new Date().getFullYear()} AssetIntel. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
