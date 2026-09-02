"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AssetIntelLogo from "@/components/AssetIntelLogo";
import SiteNav from "@/components/SiteNav";
import { useIsMobile } from "@/lib/useIsMobile";

const C = {
  primary: "#1B5E4A",
  secondary: "#B88A44",
  bgMain: "#F7F9F8",
  bgSection: "#FFFFFF",
  textMain: "#0F1D18",
  textMuted: "#4E5D56",
  border: "#E2E8E5",
  shadowSm: "0 1px 2px rgba(0,0,0,0.05)",
  shadowMd: "0 4px 12px rgba(0,0,0,0.09)",
};
const SF = "var(--font-display), ui-sans-serif, system-ui, sans-serif";
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
        <h2 style={{ fontSize: "25px", fontFamily: SF, fontWeight: 600, color: C.textMain, marginBottom: "8px" }}>Unlock Playbook</h2>
        <p style={{ fontSize: "14px", color: C.textMuted, marginBottom: "28px" }}>You are about to unlock access to the following:</p>
        <div style={{ background: C.bgMain, borderRadius: "12px", border: `1px solid ${C.border}`, padding: "20px 22px", marginBottom: "28px" }}>
          <div style={{ fontSize: "13px", color: C.textMuted, marginBottom: "6px" }}>Selected product</div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: C.textMain, marginBottom: "4px" }}>{product.name}</div>
          <div style={{ fontSize: "31px", fontWeight: 600, color: C.primary, fontFamily: SF }}>{product.price}</div>
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
          <h2 style={{ fontSize: isMobile ? "24px" : "28px", fontFamily: SF, fontWeight: 600, color: C.textMain, marginBottom: "8px", lineHeight: 1.25 }}>Self-Management Setup Enquiry</h2>
          <p style={{ fontSize: "14px", color: C.textMuted, lineHeight: 1.65 }}>Tell us what you need help with and our account manager will guide you on the right setup and pricing.</p>
        </div>
        {submitted ? (
          <div style={{ padding: isMobile ? "36px 24px" : "48px 40px", textAlign: "center" }}>
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ marginBottom: "20px" }}>
              <circle cx="26" cy="26" r="25" stroke={C.primary} strokeWidth="1.5" opacity="0.25" />
              <circle cx="26" cy="26" r="20" fill={`${C.primary}15`} />
              <path d="M16 26L23 33L36 19" stroke={C.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 style={{ fontSize: "22px", fontFamily: SF, fontWeight: 600, color: C.textMain, marginBottom: "12px" }}>Thank you — your enquiry has been received.</h3>
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
          <h2 style={{ fontSize: isMobile ? "24px" : "27px", fontFamily: SF, fontWeight: 600, color: C.textMain, marginBottom: "8px", lineHeight: 1.25 }}>Request STR Vendor Contacts</h2>
          <p style={{ fontSize: "14px", color: C.textMuted, lineHeight: 1.65 }}>Tell us what you need and we will share suitable STR vendor contact options where available.</p>
        </div>
        {submitted ? (
          <div style={{ padding: isMobile ? "36px 24px" : "48px 40px", textAlign: "center" }}>
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ marginBottom: "20px" }}>
              <circle cx="26" cy="26" r="25" stroke={C.primary} strokeWidth="1.5" opacity="0.25" />
              <circle cx="26" cy="26" r="20" fill={`${C.primary}15`} />
              <path d="M16 26L23 33L36 19" stroke={C.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 style={{ fontSize: "22px", fontFamily: SF, fontWeight: 600, color: C.textMain, marginBottom: "12px" }}>Thank you — request received.</h3>
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
      <h2 style={{ fontSize: "38px", fontFamily: SF, fontWeight: 600, marginBottom: "12px", background: `linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{title}</h2>
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
            <h2 style={{ fontSize: "25px", fontFamily: SF, fontWeight: 600, color: C.textMain, marginBottom: "4px" }}>{title}</h2>
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
    background: "#F7F9F8",
    borderRadius: "10px",
    border: "1px solid #E2E8E5",
    padding: "16px 18px",
    fontSize: "13.5px",
    color: "#0F1D18",
    lineHeight: 1.75,
    whiteSpace: "pre-wrap",
    fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif",
    maxHeight: "260px",
    overflowY: "auto",
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(10,26,20,0.65)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#FDFBF8", borderRadius: "24px", width: "100%", maxWidth: "660px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.24)", border: "1px solid #E2E8E5", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: isMobile ? "24px 22px 18px" : "30px 36px 22px", borderBottom: "1px solid #E2E8E5", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: "18px", right: "18px", background: "none", border: "none", cursor: "pointer", color: "#4E5D56", fontSize: "20px", lineHeight: 1, padding: "4px 8px" }}>×</button>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#B88A44", letterSpacing: "0.14em", marginBottom: "10px" }}>GUEST COMMUNICATION TEMPLATE</div>
          <h2 style={{ fontSize: isMobile ? "21px" : "25px", fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontWeight: 600, color: "#1B5E4A", marginBottom: "14px", paddingRight: "32px" }}>{template.title}</h2>
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
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#4E5D56", letterSpacing: "0.08em", marginBottom: "10px" }}>MESSAGE TEMPLATE</div>
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
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#4E5D56", letterSpacing: "0.08em", marginBottom: "10px" }}>{sec.label.toUpperCase()}</div>
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

          <button onClick={onClose} style={{ padding: "12px", background: "transparent", color: "#4E5D56", border: "1.5px solid #E2E8E5", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
}


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
            <h1 style={{ fontSize: isMobile ? "34px" : "52px", fontFamily: SF, fontWeight: 600, lineHeight: 1.15, marginBottom: "18px", background: `linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
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
              <button onClick={() => setShowLead(true)} style={{ padding: "14px 22px", background: "transparent", color: C.secondary, border: `2px solid ${C.secondary}`, borderRadius: "10px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>Speak To An Account Manager</button>
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

      {/* ─── SECTION 1: QUICK OVERVIEW ─── */}
      <section style={{ background: C.bgSection, borderBottom: `1px solid ${C.border}`, padding: secPad }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ marginBottom: "44px" }}>
            <div style={{ fontSize: "11px", color: C.secondary, fontWeight: 700, letterSpacing: "0.14em", marginBottom: "12px" }}>OWNER SETUP OVERVIEW</div>
            <h2 style={{ fontSize: isMobile ? "29px" : "38px", fontFamily: SF, fontWeight: 600, color: C.primary, marginBottom: "14px", lineHeight: 1.2 }}>What You Need To Self-Manage Successfully</h2>
            <p style={{ fontSize: "15px", color: C.textMuted, lineHeight: 1.65, maxWidth: "680px", margin: 0 }}>Self-managing a Dubai short-term rental means handling licensing, listings, software, pricing, housekeeping, maintenance, guest communication, and monthly performance tracking.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "16px" }}>
            {[
              { icon: <IconDET color={C.primary} />, title: "DET & Permit Setup", desc: "Register your holiday home and keep the annual permit active before going live." },
              { icon: <IconOTA color={C.secondary} />, title: "OTA Listings", desc: "Create and manage Airbnb, Booking.com, and other channel listings with accurate photos, pricing, and rules." },
              { icon: <IconPMS color={C.primary} />, title: "PMS / Channel Manager", desc: "Use tools like Guesty or Hostaway to manage reservations, calendars, messaging, reporting, and automation." },
              { icon: <IconTeam color={C.secondary} />, title: "Operations Vendors", desc: "Set up reliable housekeeping, maintenance, guest support, laundry, and access teams." },
              { icon: <IconPricing color={C.primary} />, title: "Dynamic Pricing", desc: "Use pricing tools like PriceLabs or PMS pricing features to adjust rates based on demand and seasonality." },
              { icon: <IconSOP color={C.secondary} />, title: "Guest Templates & SOPs", desc: "Use structured guest communication and operational SOPs to reduce mistakes and improve reviews." },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: C.bgMain, borderRadius: "16px", border: `1px solid ${C.border}`, borderTop: `3px solid ${C.secondary}`, padding: "22px 20px", boxShadow: C.shadowSm }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: `${C.primary}09`, border: `1px solid ${C.primary}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>{icon}</div>
                <h3 style={{ fontSize: "17px", fontFamily: SF, fontWeight: 600, color: C.primary, marginBottom: "7px" }}>{title}</h3>
                <p style={{ fontSize: "13.5px", color: C.textMuted, lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: SETUP PLAYBOOK ─── */}
      <section style={{ padding: secPad }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "11px", color: C.secondary, fontWeight: 700, letterSpacing: "0.14em", marginBottom: "12px" }}>SETUP PLAYBOOK</div>
            <h2 style={{ fontSize: isMobile ? "29px" : "38px", fontFamily: SF, fontWeight: 600, color: C.primary, marginBottom: "14px", lineHeight: 1.2 }}>The Self-Manage Setup Playbook</h2>
            <p style={{ fontSize: "15px", color: C.textMuted, lineHeight: 1.65, maxWidth: "620px", marginBottom: "24px" }}>Follow these core setup layers before listing your property as a short-term rental.</p>
            <div style={{ padding: "12px 18px", background: "#F5F1EA", borderRadius: "10px", border: "1px solid #DDD8CE", display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <div style={{ marginTop: "1px", flexShrink: 0 }}><IconInfo color={C.secondary} /></div>
              <p style={{ fontSize: "12.5px", color: "#5A4A30", margin: 0, lineHeight: 1.6 }}><strong style={{ color: C.secondary }}>Pricing note:</strong> All costs are approximate and may change. Verify current fees directly with DET, software providers, and vendors before committing.</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "36px" }}>

            {/* Step 1 */}
            <div id="step-1" style={{ background: C.bgSection, borderRadius: "18px", border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.primary}`, boxShadow: C.shadowSm, overflow: "hidden" }}>
              <div style={{ padding: isMobile ? "18px 20px" : "20px 28px", borderBottom: `1px solid ${C.border}`, background: `${C.primary}04`, display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: C.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, flexShrink: 0 }}>1</div>
                <div>
                  <h3 style={{ fontSize: isMobile ? "18px" : "20px", fontFamily: SF, fontWeight: 600, color: C.primary, margin: 0 }}>DET Portal & Holiday Home Permit</h3>
                  <p style={{ fontSize: "12.5px", color: C.textMuted, margin: "3px 0 0" }}>The legal foundation — required before listing on any platform.</p>
                </div>
              </div>
              <div style={{ padding: isMobile ? "20px" : "24px 28px" }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", marginBottom: "12px" }}>WHAT TO SET UP</div>
                    <CL items={["Register your account on the DET holiday homes portal", "Apply for a holiday home permit for each property", "Ensure permit is active before listing on any OTA", "Collect and manage required guest details as applicable", "Renew annually — set a reminder 45 days before expiry"]} />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", marginBottom: "12px" }}>APPROXIMATE DET COSTS</div>
                    <div style={{ background: C.bgMain, borderRadius: "10px", border: `1px solid ${C.border}`, overflow: "hidden" }}>
                      {[
                        { label: "Account / registration", price: "AED 1,520 approx." },
                        { label: "Studio / 1BR permit", price: "AED 370 / yr" },
                        { label: "2BR permit", price: "AED 670 / yr" },
                        { label: "3BR permit", price: "AED 970 / yr" },
                        { label: "4BR+ permit", price: "AED 1,270+ / yr" },
                      ].map((r, i, arr) => (
                        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                          <span style={{ fontSize: "12.5px", color: C.textMuted }}>{r.label}</span>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: C.secondary }}>{r.price}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: "12px", color: C.textMuted, lineHeight: 1.5, marginTop: "10px" }}>Approx. AED 300 / bedroom + AED 70 / unit. Verify directly with DET before applying.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ background: C.bgSection, borderRadius: "18px", border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.secondary}`, boxShadow: C.shadowSm, overflow: "hidden" }}>
              <div style={{ padding: isMobile ? "18px 20px" : "20px 28px", borderBottom: `1px solid ${C.border}`, background: `${C.secondary}04`, display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: C.secondary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, flexShrink: 0 }}>2</div>
                <div>
                  <h3 style={{ fontSize: isMobile ? "18px" : "20px", fontFamily: SF, fontWeight: 600, color: C.textMain, margin: 0 }}>OTA Listing Setup</h3>
                  <p style={{ fontSize: "12.5px", color: C.textMuted, margin: "3px 0 0" }}>Your listings are your storefront — set them up properly.</p>
                </div>
              </div>
              <div style={{ padding: isMobile ? "20px" : "24px 28px" }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", marginBottom: "12px" }}>LISTING ESSENTIALS</div>
                    <CL color={C.secondary} items={["Create host accounts on Airbnb and Booking.com", "Write a strong title, description, and house rules", "Upload professional photos — minimum 15–20 per unit", "Set accurate amenities list — do not overstate", "Configure cancellation policy and cleaning fee", "Set up guest communication and message automation"]} />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", marginBottom: "12px" }}>PLATFORM COST NOTE</div>
                    <div style={{ padding: "14px 16px", background: "#FFFBF5", borderRadius: "10px", border: "1px solid #E8D9BC", borderLeft: `3px solid ${C.secondary}` }}>
                      <p style={{ fontSize: "13px", color: "#7A5010", margin: 0, lineHeight: 1.65 }}>OTA platforms may charge host or service commissions depending on platform structure and booking model. Owners should verify charges directly with each platform before listing.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ background: C.bgSection, borderRadius: "18px", border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.primary}`, boxShadow: C.shadowSm, overflow: "hidden" }}>
              <div style={{ padding: isMobile ? "18px 20px" : "20px 28px", borderBottom: `1px solid ${C.border}`, background: `${C.primary}04`, display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: C.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, flexShrink: 0 }}>3</div>
                <div>
                  <h3 style={{ fontSize: isMobile ? "18px" : "20px", fontFamily: SF, fontWeight: 600, color: C.primary, margin: 0 }}>PMS / Channel Manager</h3>
                  <p style={{ fontSize: "12.5px", color: C.textMuted, margin: "3px 0 0" }}>Essential once you are on 2+ platforms or managing multiple units.</p>
                </div>
              </div>
              <div style={{ padding: isMobile ? "20px" : "24px 28px" }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", marginBottom: "12px" }}>WHAT A PMS HANDLES</div>
                    <CL items={["Calendar sync across all OTA channels", "Unified guest messaging inbox", "Automated pre-arrival, check-in, and review messages", "Housekeeping and task automation", "Owner reporting and financial summaries", "Team access controls for cleaners and VAs", "Pricing tool integrations (PriceLabs, Beyond)"]} />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", marginBottom: "12px" }}>PRICING GUIDANCE</div>
                    <div style={{ background: C.bgMain, borderRadius: "10px", border: `1px solid ${C.border}`, padding: "15px 16px", marginBottom: "12px" }}>
                      <div style={{ fontSize: "13.5px", fontWeight: 700, color: C.textMain, marginBottom: "5px" }}>Guesty / Hostaway</div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: C.secondary, marginBottom: "6px" }}>Usually quote-based or portfolio-based</div>
                      <div style={{ fontSize: "12.5px", color: C.textMuted, lineHeight: 1.5 }}>Pricing depends on number of listings, selected modules, onboarding support, and integrations. Request a direct quote from the provider.</div>
                    </div>
                    <div style={{ padding: "11px 14px", background: "#FFFBF5", borderRadius: "8px", border: "1px solid #E8D9BC" }}>
                      <p style={{ fontSize: "12px", color: "#7A5010", margin: 0, lineHeight: 1.6 }}>Some PMS platforms include pricing or revenue-management features depending on plan and setup.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div style={{ background: C.bgSection, borderRadius: "18px", border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.secondary}`, boxShadow: C.shadowSm, overflow: "hidden" }}>
              <div style={{ padding: isMobile ? "18px 20px" : "20px 28px", borderBottom: `1px solid ${C.border}`, background: `${C.secondary}04`, display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: C.secondary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, flexShrink: 0 }}>4</div>
                <div>
                  <h3 style={{ fontSize: isMobile ? "18px" : "20px", fontFamily: SF, fontWeight: 600, color: C.textMain, margin: 0 }}>Dynamic Pricing Setup</h3>
                  <p style={{ fontSize: "12.5px", color: C.textMuted, margin: "3px 0 0" }}>Pricing needs regular review — not a one-time decision.</p>
                </div>
              </div>
              <div style={{ padding: isMobile ? "20px" : "24px 28px" }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", marginBottom: "12px" }}>WHAT TO CONFIGURE</div>
                    <CL color={C.secondary} items={["Set base nightly rate using market research", "Apply seasonal pricing: peak (Nov–Mar) vs low (Jun–Aug)", "Configure event pricing for GITEX, Art Dubai, NYE, and Eid", "Set minimum stay rules by season", "Fill gap nights with targeted discounts", "Review pricing every 7–14 days"]} />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", marginBottom: "12px" }}>PRICING TOOL COST</div>
                    <div style={{ background: C.bgMain, borderRadius: "10px", border: `1px solid ${C.border}`, padding: "15px 16px", marginBottom: "12px" }}>
                      <div style={{ fontSize: "13.5px", fontWeight: 700, color: C.textMain, marginBottom: "5px" }}>PriceLabs — Dynamic Pricing</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: C.secondary, marginBottom: "4px" }}>From approx. USD 14.49 / listing / month</div>
                      <div style={{ fontSize: "12px", color: C.textMuted }}>Plus applicable taxes. Based on PriceLabs public pricing.</div>
                    </div>
                    <div style={{ padding: "11px 14px", background: "#FFFBF5", borderRadius: "8px", border: "1px solid #E8D9BC" }}>
                      <p style={{ fontSize: "12px", color: "#7A5010", margin: 0, lineHeight: 1.6 }}>Guesty and Hostaway may also include pricing or revenue-management features depending on plan and setup.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div style={{ background: C.bgSection, borderRadius: "18px", border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.primary}`, boxShadow: C.shadowSm, overflow: "hidden" }}>
              <div style={{ padding: isMobile ? "18px 20px" : "20px 28px", borderBottom: `1px solid ${C.border}`, background: `${C.primary}04`, display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: C.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, flexShrink: 0 }}>5</div>
                <div>
                  <h3 style={{ fontSize: isMobile ? "18px" : "20px", fontFamily: SF, fontWeight: 600, color: C.primary, margin: 0 }}>Operations & SOP Setup</h3>
                  <p style={{ fontSize: "12.5px", color: C.textMuted, margin: "3px 0 0" }}>Self-managing means controlling the system — not doing everything yourself.</p>
                </div>
              </div>
              <div style={{ padding: isMobile ? "20px" : "24px 28px" }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", marginBottom: "12px" }}>OPERATIONS TO ARRANGE</div>
                    <CL items={["Housekeeping team familiar with STR turnovers", "Maintenance contacts — handyman, AC, plumber", "Guest messaging or virtual assistant coverage", "Laundry and linen coordination", "Smart lock or building access setup", "Inspection and quality control process", "Issue escalation process for live problems", "Guest communication templates (see section below)"]} />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", marginBottom: "12px" }}>VENDOR INTRODUCTIONS</div>
                    <div style={{ background: `${C.primary}07`, borderRadius: "12px", border: `1px solid ${C.primary}18`, padding: "18px 18px 20px" }}>
                      <p style={{ fontSize: "13.5px", color: C.textMain, lineHeight: 1.6, margin: "0 0 14px" }}>AssetIntel can help connect owners with experienced third-party vendors already working in the Dubai STR space.</p>
                      <button
                        onClick={() => setShowVendor(true)}
                        style={{ padding: "11px 20px", background: `linear-gradient(135deg, ${C.primary} 0%, #0F3E33 100%)`, color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 10px rgba(27,94,74,0.22)", width: isMobile ? "100%" : "auto" }}
                      >
                        Request STR Vendor Contacts
                      </button>
                    </div>
                    <p style={{ fontSize: "12px", color: C.textMuted, lineHeight: 1.5, marginTop: "10px" }}>AssetIntel can introduce vendors but does not guarantee vendor pricing, availability, or service quality unless separately agreed.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 4: OPERATIONS VENDOR SUPPORT ─── */}
      <section style={{ padding: secPad }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ marginBottom: "40px" }}>
            <div style={{ fontSize: "11px", color: C.secondary, fontWeight: 700, letterSpacing: "0.14em", marginBottom: "12px" }}>OPERATIONS SUPPORT</div>
            <h2 style={{ fontSize: isMobile ? "29px" : "36px", fontFamily: SF, fontWeight: 600, color: C.primary, marginBottom: "14px", lineHeight: 1.2 }}>Need Reliable STR Vendors?</h2>
            <p style={{ fontSize: "15px", color: C.textMuted, lineHeight: 1.65, maxWidth: "660px", margin: 0 }}>Self-managing does not mean doing everything yourself. AssetIntel can help connect owners with experienced vendors already operating in Dubai short-term rentals.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
            {[
              { icon: <IconTeam color={C.primary} />, title: "Housekeeping", desc: "Cleaning teams familiar with STR turnovers, guest standards, and time-sensitive check-ins." },
              { icon: <IconPMS color={C.secondary} />, title: "Maintenance", desc: "Reliable support for callouts, repairs, minor fixes, and guest-reported issues." },
              { icon: <IconSOP color={C.primary} />, title: "Virtual Assistant / Guest Messaging", desc: "Guest communication support for check-in questions, issue handling, and review follow-ups." },
              { icon: <IconOTA color={C.secondary} />, title: "Laundry / Linen", desc: "Support for linen, towels, replacements, and operational standards depending on your setup." },
              { icon: <IconDET color={C.primary} />, title: "Smart Lock / Access", desc: "Guidance around access setup, key handling, smart locks, and building entry requirements." },
              { icon: <IconPricing color={C.secondary} />, title: "Full Setup Support", desc: "For owners who need help arranging multiple vendors before going live." },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: C.bgSection, borderRadius: "14px", border: `1px solid ${C.border}`, padding: "20px 18px", boxShadow: C.shadowSm }}>
                <div style={{ marginBottom: "12px" }}>{icon}</div>
                <h3 style={{ fontSize: "16px", fontFamily: SF, fontWeight: 600, color: C.textMain, marginBottom: "7px" }}>{title}</h3>
                <p style={{ fontSize: "13px", color: C.textMuted, lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setShowVendor(true)}
              style={{ padding: "14px 32px", background: `linear-gradient(135deg, ${C.primary} 0%, #0F3E33 100%)`, color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(27,94,74,0.22)" }}
            >
              Request STR Vendor Contacts
            </button>
            <p style={{ fontSize: "12px", color: C.textMuted, margin: 0, textAlign: "center", maxWidth: "480px", lineHeight: 1.6 }}>AssetIntel can introduce third-party vendors but does not guarantee vendor pricing, availability, or service quality unless separately agreed.</p>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: GUEST COMMUNICATION TEMPLATES ─── */}
      <section style={{ padding: secPad }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ background: C.bgSection, borderRadius: "18px", border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.secondary}`, boxShadow: C.shadowSm, overflow: "hidden" }}>

            {/* Step header — matches Steps 1–5 */}
            <div style={{ padding: isMobile ? "18px 20px" : "20px 28px", borderBottom: `1px solid ${C.border}`, background: `${C.secondary}04`, display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: C.secondary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, flexShrink: 0 }}>6</div>
              <div>
                <h2 style={{ fontSize: isMobile ? "18px" : "20px", fontFamily: SF, fontWeight: 600, color: C.textMain, margin: 0 }}>Guest Communication Templates</h2>
                <p style={{ fontSize: "12.5px", color: C.textMuted, margin: "3px 0 0" }}>Ready-to-use Airbnb-style templates for key guest moments.</p>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: isMobile ? "20px" : "24px 28px" }}>
              <p style={{ fontSize: "14px", color: C.textMuted, lineHeight: 1.65, marginBottom: "22px", maxWidth: "660px" }}>
                Covers booking confirmation, pre-arrival, check-in, checkout, review request, late checkout, noise complaints, maintenance, refunds, lost items, and damage claims.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
                {GUEST_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t)}
                    style={{ padding: "16px 18px", background: C.bgMain, borderRadius: "12px", border: `1px solid ${C.border}`, borderTop: `2px solid ${C.secondary}`, textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: "6px", boxShadow: C.shadowSm }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = C.primary; el.style.borderTopColor = C.primary; el.style.boxShadow = "0 4px 14px rgba(27,94,74,0.11)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = C.border; el.style.borderTopColor = C.secondary; el.style.boxShadow = C.shadowSm; }}
                  >
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: C.textMain, lineHeight: 1.3 }}>{t.title}</div>
                    <div style={{ fontSize: "12px", color: C.textMuted, lineHeight: 1.45 }}>{TEMPLATE_CARD_DESC[t.id]}</div>
                    <div style={{ marginTop: "4px", fontSize: "11.5px", fontWeight: 700, color: C.secondary, letterSpacing: "0.02em" }}>Open Template →</div>
                  </button>
                ))}
              </div>
              <div style={{ paddingTop: "20px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <p style={{ fontSize: "13px", color: C.textMuted, margin: 0, lineHeight: 1.5 }}>Need the full template pack sent to you directly?</p>
                <button
                  onClick={() => setShowLead(true)}
                  style={{ padding: "10px 22px", background: `linear-gradient(135deg, ${C.secondary} 0%, #8B6F3F 100%)`, color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 10px rgba(184,138,68,0.20)", flexShrink: 0 }}
                >
                  Request Template Pack
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: COST SNAPSHOT ─── */}
      <section style={{ padding: secPad, background: "#F5F1EA", borderTop: "1px solid #DDD8CE", borderBottom: "1px solid #DDD8CE" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ marginBottom: "36px" }}>
            <div style={{ fontSize: "11px", color: C.secondary, fontWeight: 700, letterSpacing: "0.14em", marginBottom: "12px" }}>COST OVERVIEW</div>
            <h2 style={{ fontSize: isMobile ? "29px" : "36px", fontFamily: SF, fontWeight: 600, color: C.primary, marginBottom: "12px", lineHeight: 1.2 }}>Approximate Self-Manage Cost Snapshot</h2>
            <p style={{ fontSize: "15px", color: C.textMuted, lineHeight: 1.65, maxWidth: "640px", margin: 0 }}>A practical view of the setup and software cost categories owners should understand before going live.</p>
          </div>
          <CostSnapshot isMobile={isMobile} onVendor={() => setShowVendor(true)} />
          <div style={{ marginTop: "16px", padding: "12px 18px", background: "#EDEAE3", borderRadius: "10px", border: "1px solid #D0CBB9", display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <div style={{ marginTop: "1px", flexShrink: 0 }}><IconInfo color={C.secondary} /></div>
            <p style={{ fontSize: "12.5px", color: "#5A4A30", margin: 0, lineHeight: 1.65 }}>This snapshot helps owners understand the cost categories involved in self-managing. Final pricing should be confirmed with DET, software providers, and service vendors.</p>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6 CTA: FINAL SETUP SUPPORT ─── */}
      <section style={{ padding: secPad }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #0F3E33 100%)`, borderRadius: "20px", padding: isMobile ? "40px 24px" : "56px 64px", textAlign: "center", boxShadow: "0 12px 40px rgba(27,94,74,0.20)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: `${C.secondary}CC`, letterSpacing: "0.14em", marginBottom: "16px" }}>ASSETINTEL SUPPORT</div>
            <h2 style={{ fontSize: isMobile ? "27px" : "36px", fontFamily: SF, fontWeight: 600, color: "#FFFFFF", marginBottom: "16px", lineHeight: 1.2 }}>Want AssetIntel To Help Handle The Setup?</h2>
            <p style={{ fontSize: "15px", color: "rgba(253,251,247,0.75)", lineHeight: 1.65, maxWidth: "540px", margin: "0 auto 36px" }}>
              AssetIntel can help you understand the setup layers, coordinate the right STR vendors, and guide the practical steps needed before going live.
            </p>
            <button
              onClick={() => setShowVendor(true)}
              style={{ padding: isMobile ? "16px 0" : "15px 40px", background: "#FFFFFF", color: C.primary, border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", width: isMobile ? "100%" : "auto" }}
            >
              Help AssetIntel Handle The Setup
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
