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
  shadowMd: "0 4px 12px rgba(0,0,0,0.09)",
};
const serifHeading = "'Georgia', serif";
const sk = (c: string) => ({ stroke: c, strokeWidth: 1.4, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

// ─── Icons ───────────────────────────────────────────────────────────────────
const IconCheck = ({ color = colors.primary, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8.5" stroke={color} strokeWidth="1.2" opacity="0.35" /><path d="M6.5 10L9 12.5L13.5 7.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const IconWarning = ({ color = "#A37020", size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 3L22 20H2L12 3Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /><path d="M12 10V14" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><circle cx="12" cy="17.5" r="0.8" fill={color} /></svg>
);
const IconLock = ({ color = colors.secondary, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="4" y="10" width="16" height="12" rx="2.5" stroke={color} strokeWidth="1.5" /><path d="M8 10V7a4 4 0 018 0v3" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>
);
const IconTarget = ({ color = colors.primary, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" /><circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.5" /><circle cx="12" cy="12" r="1.5" fill={color} /></svg>
);
const IconDocument = ({ color = colors.secondary, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke={color} strokeWidth="1.5" /><path d="M8 7h8M8 11h8M8 15h5" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>
);
const IconTeam = ({ color = colors.primary, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke={color} strokeWidth="1.5" /><circle cx="17" cy="9" r="2.2" stroke={color} strokeWidth="1.5" /><path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><path d="M15 14c2.2 0 4 1.8 4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>
);
const IconSystem = ({ color = colors.secondary, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="14" rx="2" stroke={color} strokeWidth="1.5" /><path d="M8 18v2M16 18v2M6 20h12" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><path d="M7 10h4M13 10h4M7 13h2M11 13h2M15 13h2" stroke={color} strokeWidth="1.3" strokeLinecap="round" /></svg>
);
const IconShield = ({ color = colors.primary, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const IconBundle = ({ color = colors.secondary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><rect x="4" y="10" width="10" height="14" rx="1.5" {...sk(color)} /><rect x="18" y="10" width="10" height="14" rx="1.5" {...sk(color)} /><path d="M14 14H18" {...sk(color)} /><path d="M14 18H18" {...sk(color)} /></svg>
);
const IconEstimator = ({ color = colors.secondary, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="1.5" /><path d="M8 7h8M8 11h3M13 11h3M8 15h3M13 15h3" stroke={color} strokeWidth="1.3" strokeLinecap="round" /></svg>
);
const IconArrow = ({ color = colors.textMuted }) => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 4V16M10 16L6 12M10 16L14 12" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

// ─── Payment Modal ────────────────────────────────────────────────────────────
type Product = { name: string; price: string; amount: number };

function PaymentModal({ product, onClose, onCheckout }: { product: Product; onClose: () => void; onCheckout: (p: Product) => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "40px", maxWidth: "440px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.2)", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "18px", right: "18px", background: "none", border: "none", cursor: "pointer", color: colors.textMuted, fontSize: "22px", lineHeight: 1 }}>×</button>
        <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "14px" }}>ASSETINTEL</div>
        <h2 style={{ fontSize: "22px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "8px" }}>Unlock Playbook</h2>
        <p style={{ fontSize: "14px", color: colors.textMuted, marginBottom: "28px" }}>You are about to unlock access to the following:</p>
        <div style={{ background: colors.bgMain, borderRadius: "12px", border: `1px solid ${colors.border}`, padding: "20px 22px", marginBottom: "28px" }}>
          <div style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "6px" }}>Selected product</div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: colors.textMain, marginBottom: "4px" }}>{product.name}</div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: colors.secondary, fontFamily: serifHeading }}>{product.price}</div>
          <div style={{ fontSize: "12px", color: colors.textMuted }}>One-time access fee</div>
        </div>
        <div style={{ padding: "14px 16px", background: "#FFFBF5", borderRadius: "10px", border: "1px solid #E8D9BC", marginBottom: "24px" }}>
          <p style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.6, margin: 0 }}>Payment checkout will be connected here. Click continue to proceed when payment is available.</p>
        </div>
        <button onClick={() => onCheckout(product)} style={{ width: "100%", padding: "14px", background: colors.secondary, color: "#fff", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: "pointer", border: "none", marginBottom: "12px" }}>
          Continue to Checkout →
        </button>
        <button onClick={onClose} style={{ width: "100%", padding: "12px", background: "transparent", color: colors.textMuted, border: `1.5px solid ${colors.border}`, borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Readiness Score ──────────────────────────────────────────────────────────
const SUBLEASING_READINESS_ITEMS = [
  "I have identified a prime or strong STR area to target",
  "I understand and have modelled the break-even occupancy for my target unit",
  "I have a minimum 5-month cash buffer to cover rent and costs",
  "I have confirmed at least one target building permits holiday home operation",
  "I am prepared to approach landlords professionally with a written pitch",
  "I can commit to daily guest communication (sub-1 hour response time)",
  "I have identified a reliable holiday home cleaning team",
  "I understand Dubai's seasonal occupancy (winter peak / summer low)",
  "I have reviewed the legal requirements and can obtain a DET permit",
  "I have an exit plan (break clause or savings to absorb a loss period)",
];

function SubleasingReadinessScore() {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setChecked(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const score = checked.size;
  const label = score >= 9 ? "Ready to Proceed" : score >= 7 ? "Almost Ready" : score >= 5 ? "Needs More Preparation" : "Not Yet Ready";
  const labelColor = score >= 9 ? "#2D7A4F" : score >= 7 ? "#A37020" : score >= 5 ? "#C25A1A" : "#B83232";
  const labelBg = score >= 9 ? "#E8F5EE" : score >= 7 ? "#FEF3E2" : score >= 5 ? "#FEF0E8" : "#FDE8E8";
  return (
    <div style={{ background: colors.bgSection, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: "40px 48px" }}>
      <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "14px" }}>READINESS CHECK</div>
      <h2 style={{ fontSize: "28px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "8px" }}>Sub-Leasing Readiness Score</h2>
      <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.6, marginBottom: "24px" }}>Tick every item that applies to you today. Sub-leasing without these foundations in place is how operators lose money in the first year.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
        {SUBLEASING_READINESS_ITEMS.map((item, i) => {
          const active = checked.has(i);
          return (
            <div key={i} onClick={() => toggle(i)} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px", background: active ? "#FFFBF5" : colors.bgMain, borderRadius: "10px", border: `1.5px solid ${active ? colors.secondary : colors.border}`, cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ width: "22px", height: "22px", borderRadius: "6px", border: `2px solid ${active ? colors.secondary : colors.border}`, background: active ? colors.secondary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {active && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <span style={{ fontSize: "13.5px", color: active ? colors.textMain : colors.textMuted, fontWeight: active ? 600 : 400 }}>{item}</span>
            </div>
          );
        })}
      </div>
      <div style={{ padding: "24px", background: labelBg, borderRadius: "14px", border: `2px solid ${labelColor}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "4px" }}>Your readiness score</div>
          <div style={{ fontSize: "38px", fontWeight: 700, color: labelColor, fontFamily: serifHeading, lineHeight: 1 }}>{score} / 10</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "20px", fontWeight: 700, color: labelColor }}>{label}</div>
          <div style={{ fontSize: "12.5px", color: colors.textMuted, marginTop: "4px" }}>
            {score >= 9 ? "You have the foundations. Proceed to sourcing your first unit." :
             score >= 7 ? "Close — address the remaining gaps before signing a lease." :
             score >= 5 ? "Several critical foundations are missing. Build these first." :
             "Do not sign a lease until you can tick at least 8 of these."}
          </div>
        </div>
      </div>
    </div>
  );
}

const PRICE = "AED 299";
const BUNDLE_PRICE = "AED 399";
const PRODUCTS: Record<string, Product> = {
  subleasing: { name: "STR Sub-Leasing Playbook", price: PRICE, amount: 299 },
  bundle: { name: "Bundle — Both Playbooks", price: BUNDLE_PRICE, amount: 399 },
};

// ─── Shared sub-components ────────────────────────────────────────────────────
function PillarBadge({ num, color }: { num: string; color: string }) {
  return (
    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, flexShrink: 0, marginTop: "2px" }}>{num}</div>
  );
}

function IconBadge({ icon, color }: { icon: React.ReactNode; color: string }) {
  return (
    <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#F5F0E8", border: `1.5px solid ${color}30`, boxShadow: `0 2px 10px ${color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px", flexShrink: 0 }}>
      {icon}
    </div>
  );
}

function Divider({ color }: { color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: "16px" }}>
      <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, transparent, ${color}60, transparent)` }} />
      <div style={{ width: "5px", height: "5px", background: color, transform: "rotate(45deg)", margin: "0 8px", flexShrink: 0 }} />
      <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, transparent, ${color}60, transparent)` }} />
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>{text}</div>;
}

function SectionTitle({ children, size = "34px" }: { children: React.ReactNode; size?: string }) {
  return (
    <h2 style={{ fontSize: size, fontFamily: serifHeading, fontWeight: 700, marginBottom: "14px", background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
      {children}
    </h2>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function STRSubleasingPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [hasAccess, setHasAccess] = useState(true);
  const [modal, setModal] = useState<Product | null>(null);
  void setHasAccess;

  function openCheckout(key: keyof typeof PRODUCTS) { setModal(PRODUCTS[key]); }

  async function handleCheckout(product: Product) {
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pkg: product.name, origin: window.location.origin }) });
      const data = await res.json();
      if (data.ok && data.url) { window.location.href = data.url; }
      else { alert("Payment unavailable right now. Please try again shortly."); }
    } catch { alert("Payment unavailable right now. Please try again shortly."); }
    setModal(null);
  }

  const pad = isMobile ? "60px 20px" : "88px 40px";
  const padSm = isMobile ? "48px 20px" : "72px 40px";

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh" }}>
      {modal && <PaymentModal product={modal} onClose={() => setModal(null)} onCheckout={handleCheckout} />}

      {/* ─── HEADER ─── */}
      <SiteNav active="self-manage" />

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 1. RISK ESTIMATOR HERO                                                */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", overflow: "hidden", isolation: "isolate", background: "#FDFBF7", borderBottom: `1px solid ${colors.border}`, padding: isMobile ? "44px 20px 60px" : "80px 40px 88px" }}>

        {/* ── Decorative background layers ── */}
        {/* Top-right bronze radial glow */}
        <div style={{ position: "absolute", top: "-100px", right: "-120px", width: "640px", height: "640px", borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(184,138,68,0.08) 0%, transparent 68%)", pointerEvents: "none", zIndex: 0 }} />
        {/* Center-right sage radial glow (behind card) */}
        <div style={{ position: "absolute", top: "50%", right: "4%", width: "440px", height: "440px", borderRadius: "50%", transform: "translateY(-50%)", background: "radial-gradient(ellipse at center, rgba(27,94,74,0.055) 0%, transparent 68%)", pointerEvents: "none", zIndex: 0 }} />
        {/* Bottom fade into next section */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "140px", background: "linear-gradient(to bottom, transparent, #F8F4EE)", pointerEvents: "none", zIndex: 0 }} />
        {/* Left edge soft vignette */}
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "320px", background: "linear-gradient(to right, rgba(253,251,247,0.92), transparent)", pointerEvents: "none", zIndex: 0 }} />
        {/* Subtle top gold rule */}
        <div style={{ position: "absolute", top: "28px", left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent 0%, rgba(184,138,68,0.14) 40%, rgba(184,138,68,0.14) 60%, transparent 100%)", pointerEvents: "none", zIndex: 0 }} />
        {/* Dubai skyline silhouette — bottom-right, very faint */}
        <svg aria-hidden="true" style={{ position: "absolute", bottom: 0, right: 0, width: isMobile ? "280px" : "540px", height: "200px", opacity: 0.06, pointerEvents: "none", zIndex: 0 }} viewBox="0 0 540 200" fill="none" preserveAspectRatio="xMaxYMax meet">
          <rect x="0" y="130" width="38" height="70" fill="#1B5E4A"/>
          <rect x="7" y="112" width="24" height="20" fill="#1B5E4A"/>
          <rect x="46" y="88" width="30" height="112" fill="#1B5E4A"/>
          <rect x="52" y="74" width="18" height="16" fill="#1B5E4A"/>
          <rect x="56" y="62" width="10" height="14" fill="#1B5E4A"/>
          <rect x="58" y="52" width="6" height="12" fill="#1B5E4A"/>
          <rect x="60" y="40" width="2" height="14" fill="#1B5E4A"/>
          <rect x="84" y="142" width="26" height="58" fill="#1B5E4A"/>
          <rect x="90" y="128" width="14" height="16" fill="#1B5E4A"/>
          <rect x="118" y="72" width="48" height="128" fill="#1B5E4A"/>
          <rect x="126" y="58" width="32" height="16" fill="#1B5E4A"/>
          <rect x="132" y="44" width="20" height="16" fill="#1B5E4A"/>
          <rect x="138" y="32" width="8" height="14" fill="#1B5E4A"/>
          <rect x="140" y="20" width="4" height="14" fill="#1B5E4A"/>
          <rect x="174" y="122" width="34" height="78" fill="#1B5E4A"/>
          <rect x="180" y="108" width="22" height="16" fill="#1B5E4A"/>
          <rect x="216" y="102" width="42" height="98" fill="#1B5E4A"/>
          <rect x="222" y="86" width="30" height="18" fill="#1B5E4A"/>
          <rect x="228" y="72" width="18" height="16" fill="#1B5E4A"/>
          <rect x="234" y="58" width="6" height="16" fill="#1B5E4A"/>
          <rect x="266" y="136" width="28" height="64" fill="#1B5E4A"/>
          <rect x="272" y="122" width="16" height="16" fill="#1B5E4A"/>
          <rect x="302" y="92" width="54" height="108" fill="#1B5E4A"/>
          <rect x="310" y="78" width="38" height="16" fill="#1B5E4A"/>
          <rect x="318" y="64" width="22" height="16" fill="#1B5E4A"/>
          <rect x="324" y="50" width="10" height="16" fill="#1B5E4A"/>
          <rect x="328" y="36" width="2" height="16" fill="#1B5E4A"/>
          <rect x="364" y="122" width="30" height="78" fill="#1B5E4A"/>
          <rect x="370" y="108" width="18" height="16" fill="#1B5E4A"/>
          <rect x="402" y="108" width="38" height="92" fill="#1B5E4A"/>
          <rect x="408" y="94" width="26" height="16" fill="#1B5E4A"/>
          <rect x="414" y="80" width="14" height="16" fill="#1B5E4A"/>
          <rect x="448" y="132" width="28" height="68" fill="#1B5E4A"/>
          <rect x="454" y="118" width="16" height="16" fill="#1B5E4A"/>
          <rect x="484" y="148" width="28" height="52" fill="#1B5E4A"/>
          <rect x="490" y="134" width="16" height="16" fill="#1B5E4A"/>
          <rect x="514" y="158" width="26" height="42" fill="#1B5E4A"/>
          <rect x="0" y="198" width="540" height="2" fill="#1B5E4A"/>
        </svg>

        {/* ── Content ── */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "40px" : "60px", alignItems: "center" }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ flex: "0 0 58%", maxWidth: isMobile ? "100%" : "58%" }}>

            {/* Eyebrow pill */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px 6px 8px", background: "#FDFBF4", border: "1px solid rgba(184,138,68,0.28)", borderRadius: "999px", boxShadow: "0 2px 8px rgba(184,138,68,0.09)", marginBottom: "22px" }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(184,138,68,0.11)", border: "1px solid rgba(184,138,68,0.24)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke={colors.secondary} strokeWidth="1.3"/><circle cx="8" cy="8" r="2.5" stroke={colors.secondary} strokeWidth="1.2"/><circle cx="8" cy="8" r="0.8" fill={colors.secondary}/></svg>
              </div>
              <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: colors.secondary }}>STR Sub-Leasing Risk Estimator</span>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: isMobile ? "clamp(28px,9vw,40px)" : "clamp(36px,3.6vw,54px)", fontFamily: serifHeading, fontWeight: 700, lineHeight: isMobile ? 1.08 : 1.05, letterSpacing: isMobile ? "-0.02em" : "-0.03em", marginBottom: "16px", background: `linear-gradient(130deg, ${colors.primary} 0%, #2A7A58 42%, ${colors.secondary} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", maxWidth: "780px" }}>
              Check The Unit Before You Sign The Lease
            </h1>

            {/* Subheading */}
            <p style={{ fontSize: isMobile ? "14.5px" : "15.5px", color: "#4A4A42", lineHeight: 1.68, marginBottom: "26px", maxWidth: "560px" }}>
              AssetIntel helps you estimate whether a sub-leased unit can survive low season, cover fixed rent, and produce realistic profit — before you commit to the landlord.
            </p>

            {/* Premium checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "28px" }}>
              {[
                { label: "Break-even clarity", desc: "Know exactly what % occupancy you need to cover all costs" },
                { label: "Monthly cash-flow forecast", desc: "See which months are profitable and which are tight" },
                { label: "Risk level: Low to Very High", desc: "Instant risk score based on rent, floor, view, and area" },
                { label: "Minimum cash buffer guidance", desc: "How many months of reserves you need before signing" },
                { label: "Proceed / Negotiate / Avoid", desc: "Clear recommendation on whether this unit works" },
              ].map(({ label, desc }) => (
                <div key={label} style={{ display: "flex", gap: "11px", alignItems: "flex-start", padding: "9px 14px", background: "rgba(27,94,74,0.04)", borderRadius: "10px", border: "1px solid rgba(27,94,74,0.09)" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px", boxShadow: "0 2px 6px rgba(27,94,74,0.22)" }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div style={{ lineHeight: 1.5 }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: colors.textMain }}>{label}</span>
                    <span style={{ fontSize: "12.5px", color: colors.textMuted }}> — {desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
              <button
                onClick={() => router.push("/self-manage/str-subleasing/estimator")}
                style={{ padding: "13px 26px", background: `linear-gradient(135deg, ${colors.secondary} 0%, #A07838 50%, #8B6530 100%)`, color: "#fff", borderRadius: "12px", fontSize: "14.5px", fontWeight: 700, cursor: "pointer", border: "none", boxShadow: "0 6px 20px rgba(184,138,68,0.30), 0 2px 6px rgba(184,138,68,0.16)", letterSpacing: "0.01em", transition: "transform 0.18s, box-shadow 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(184,138,68,0.40), 0 4px 10px rgba(184,138,68,0.20)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(184,138,68,0.30), 0 2px 6px rgba(184,138,68,0.16)"; }}
              >
                Open Risk Estimator →
              </button>
              <a
                href="#financial-logic"
                style={{ display: "inline-flex", alignItems: "center", padding: "13px 22px", background: "#FDFBF5", color: colors.primary, border: `1.5px solid ${colors.primary}`, borderRadius: "12px", fontSize: "14.5px", fontWeight: 600, textDecoration: "none", letterSpacing: "0.01em" }}
              >
                Learn How The Model Works
              </a>
            </div>

            {/* Playbook unlocked pill */}
            {hasAccess && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "7px 16px", background: "#EEF6F1", borderRadius: "999px", border: "1px solid rgba(27,94,74,0.18)" }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: "12.5px", fontWeight: 600, color: colors.primary }}>Full playbook unlocked — all sections accessible</span>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN — Premium sample card ── */}
          <div style={{ flex: 1, width: "100%", maxWidth: isMobile ? "100%" : "370px", flexShrink: 0, position: "relative" }}>
            {/* Warm glow behind card */}
            <div style={{ position: "absolute", inset: "-30px", borderRadius: "50%", background: "radial-gradient(ellipse at 60% 50%, rgba(184,138,68,0.11) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "relative", zIndex: 1, background: "#FEFCF8", borderRadius: "24px", border: "1.5px solid rgba(184,138,68,0.28)", boxShadow: "0 20px 56px rgba(20,40,30,0.12), 0 6px 20px rgba(184,138,68,0.10), inset 0 1px 0 rgba(255,255,255,0.92)", overflow: "hidden" }}>

              {/* Card header */}
              <div style={{ padding: "16px 20px 14px", background: "linear-gradient(135deg, rgba(27,94,74,0.06) 0%, rgba(184,138,68,0.07) 100%)", borderBottom: "1px solid rgba(184,138,68,0.15)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: "rgba(184,138,68,0.12)", border: "1px solid rgba(184,138,68,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <IconEstimator color={colors.secondary} size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize: "9.5px", fontWeight: 700, color: colors.secondary, letterSpacing: "0.14em", textTransform: "uppercase" }}>Risk Estimator — Sample</div>
                    <div style={{ fontSize: "10.5px", color: colors.textMuted, marginTop: "1px" }}>Marina Gate 2 · 1BR · Floor 24</div>
                  </div>
                </div>
              </div>

              {/* Inputs section */}
              <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid rgba(230,225,216,0.65)" }}>
                <div style={{ fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9A8A", marginBottom: "10px" }}>Inputs</div>
                {[
                  { label: "Building", value: "Marina Gate 2" },
                  { label: "Unit size", value: "1 Bedroom" },
                  { label: "Floor", value: "Floor 24 (High)" },
                  { label: "View", value: "Marina View" },
                  { label: "Asking rent", value: "AED 9,500 / month" },
                ].map(({ label, value }, i, arr) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(230,225,216,0.55)" : "none" }}>
                    <span style={{ fontSize: "11.5px", color: colors.textMuted }}>{label}</span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: colors.textMain }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Outputs section */}
              <div style={{ padding: "14px 18px 18px" }}>
                <div style={{ fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9A8A", marginBottom: "10px" }}>Estimator Outputs</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#EEF6F1", borderRadius: "9px", border: "1px solid rgba(27,94,74,0.12)" }}>
                    <span style={{ fontSize: "11.5px", color: colors.textMuted }}>Break-even occupancy</span>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: colors.primary }}>58%</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#EEF6F1", borderRadius: "9px", border: "1px solid rgba(27,94,74,0.12)" }}>
                    <span style={{ fontSize: "11.5px", color: colors.textMuted }}>Risk level</span>
                    <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#2D7A4F", background: "#D0EED9", padding: "3px 12px", borderRadius: "20px" }}>Low</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#FEF5E8", borderRadius: "9px", border: "1px solid rgba(184,138,68,0.18)" }}>
                    <span style={{ fontSize: "11.5px", color: colors.textMuted }}>Est. net profit / yr</span>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: colors.secondary }}>AED 42,800</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#F8F4EE", borderRadius: "9px", border: `1px solid ${colors.border}` }}>
                    <span style={{ fontSize: "11.5px", color: colors.textMuted }}>Cash buffer required</span>
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: colors.textMain }}>AED 57,000</span>
                  </div>
                  {/* Recommendation row */}
                  <div style={{ padding: "10px 14px", background: "linear-gradient(135deg, rgba(27,94,74,0.08) 0%, rgba(184,138,68,0.07) 100%)", borderRadius: "9px", border: "1px solid rgba(27,94,74,0.14)", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 7px rgba(27,94,74,0.26)" }}>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l5.5 2.3v4.6c0 3.4-2.4 6.2-5.5 7.5C5.0 14.6 2.5 11.8 2.5 8.4V3.8L8 1.5z" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5.5 8l2 2 3-3.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: "9.5px", fontWeight: 700, color: colors.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>Recommendation</div>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: colors.primary }}>Proceed</div>
                    </div>
                  </div>
                </div>

                {/* Card CTA */}
                <button
                  onClick={() => router.push("/self-manage/str-subleasing/estimator")}
                  style={{ width: "100%", marginTop: "12px", padding: "12px", background: `linear-gradient(135deg, ${colors.secondary} 0%, #A07838 50%, #8B6530 100%)`, color: "#fff", borderRadius: "11px", fontSize: "13.5px", fontWeight: 700, cursor: "pointer", border: "none", boxShadow: "0 5px 16px rgba(184,138,68,0.28)", letterSpacing: "0.01em", transition: "transform 0.18s, box-shadow 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 22px rgba(184,138,68,0.38)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 5px 16px rgba(184,138,68,0.28)"; }}
                >
                  Run Your Own Estimate →
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 2. THE 4 PILLARS                                                       */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="pillars" style={{ padding: pad, background: colors.bgMain }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <SectionLabel text="FRAMEWORK" />
            <SectionTitle>The 4 Pillars of Safe STR Sub-Leasing</SectionTitle>
            <p style={{ fontSize: "16px", color: colors.textMuted, lineHeight: 1.7, maxWidth: "580px", margin: "0 auto" }}>
              Sub-leasing works only when the unit, licensing, operations, and systems are built correctly from day one.
            </p>
          </div>

          <style>{`
            .pillar-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 22px;
              align-items: stretch;
            }
            .pillar-card {
              background: #FDFBF8;
              border: 1px solid #E8E0D0;
              border-radius: 20px;
              padding: 32px 26px;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              box-shadow: 0 2px 10px rgba(0,0,0,0.04);
              transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
            }
            .pillar-card:hover {
              transform: translateY(-4px);
              box-shadow: 0 12px 32px rgba(0,0,0,0.08);
              border-color: #C9A86C;
            }
            .pillar-num {
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.12em;
              margin-bottom: 16px;
            }
            @media (max-width: 1000px) { .pillar-grid { grid-template-columns: repeat(2, 1fr); } }
            @media (max-width: 560px) { .pillar-grid { grid-template-columns: 1fr; } .pillar-card { padding: 28px 22px; } }
          `}</style>

          <div className="pillar-grid">
            {[
              { num: "01", icon: <IconTarget color={colors.primary} size={28} />, accentColor: colors.primary, label: "PROPERTY SELECTION", title: "Correct Property Selection", body: "Use the Risk Estimator to identify the safest areas, buildings, unit types, rent levels, and break-even points before signing any lease." },
              { num: "02", icon: <IconDocument color={colors.secondary} size={28} />, accentColor: colors.secondary, label: "LICENSING", title: "DET Portal & Licensing Setup", body: "Understand the required approval route, landlord permission, DET holiday home permit, documentation, and compliance steps." },
              { num: "03", icon: <IconTeam color={colors.primary} size={28} />, accentColor: colors.primary, label: "OPERATIONS", title: "Operational Setup", body: "Build the teams and workflows needed for cleaning, maintenance, guest relations, virtual assistants, check-in, and issue escalation." },
              { num: "04", icon: <IconSystem color={colors.secondary} size={28} />, accentColor: colors.secondary, label: "TECHNOLOGY", title: "PMS & Systems", body: "Set up the technology layer: PMS, channel manager, dynamic pricing, guest messaging, task management, smart access, and reporting." },
            ].map(({ num, icon, accentColor, label, title, body }) => (
              <div key={num} className="pillar-card">
                <div style={{ fontSize: "11px", fontWeight: 700, color: accentColor, letterSpacing: "0.12em", marginBottom: "14px" }}>PILLAR {num}</div>
                <IconBadge icon={icon} color={accentColor} />
                <Divider color={accentColor} />
                <div style={{ fontSize: "10px", fontWeight: 700, color: colors.textMuted, letterSpacing: "0.1em", marginBottom: "8px" }}>{label}</div>
                <h3 style={{ fontFamily: serifHeading, fontSize: "17px", fontWeight: 700, color: colors.textMain, marginBottom: "10px", lineHeight: 1.3 }}>{title}</h3>
                <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.7, flex: 1 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 3. PILLAR 1 — PROPERTY SELECTION                                       */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="pillar-1" style={{ padding: pad, background: colors.bgSection, borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px", background: `${colors.primary}10`, borderRadius: "20px", border: `1px solid ${colors.primary}25`, marginBottom: "20px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: colors.primary, letterSpacing: "0.1em" }}>PILLAR 1</span>
          </div>
          <SectionTitle size={isMobile ? "28px" : "36px"}>Select The Right Unit</SectionTitle>
          <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "40px", maxWidth: "660px" }}>
            The property selection decision is the biggest risk in STR sub-leasing. Rent is fixed while STR revenue is seasonal and uncertain — choosing the wrong unit is how operators lose money before they start.
          </p>

          {/* Key checks */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "36px" }}>
            {[
              "Is the building in a strong STR area?",
              "Is the asking rent leaving enough margin?",
              "Is the break-even occupancy realistic (below 65%)?",
              "Is the floor and view strong enough to command nightly rates?",
              "Is there existing STR activity in the building?",
              "Can the unit survive June–September low season?",
              "Is furnishing cost recoverable within a reasonable payback period?",
            ].map(q => (
              <div key={q} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px 18px", background: colors.bgMain, borderRadius: "10px", border: `1px solid ${colors.border}` }}>
                <div style={{ marginTop: "2px", flexShrink: 0 }}><IconCheck color={colors.primary} size={16} /></div>
                <span style={{ fontSize: "13.5px", color: colors.textMain, lineHeight: 1.6 }}>{q}</span>
              </div>
            ))}
          </div>

          {/* Unit Selection Framework */}
          <div style={{ marginBottom: "36px" }}>
            <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "16px" }}>UNIT SELECTION FRAMEWORK</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
              {[
                { title: "Location Criteria", pass: true, items: ["Prime STR area: Dubai Marina, JBR, Downtown, Palm Jumeirah, or Emaar Beachfront", "Walking distance to beach, marina, or major tourist attractions", "Strong Airbnb supply density — means proven demand, not risk", "Building listed on Airbnb and Booking.com by existing operators — proof of concept"] },
                { title: "Property Criteria", pass: true, items: ["Floor 15 or above — strongly preferred. Floor 10 minimum.", "Sea view, marina view, Burj Khalifa view, or city view — standard view units rarely justify the rent", "Studio or 1BR — smaller units have lower rent obligations, fill faster, and are easier to operate", "Building permits holiday home operation (confirm in writing before signing)"] },
                { title: "Financial Criteria", pass: true, items: ["Rent-to-revenue gap: projected annual STR revenue must exceed annual rent by at least 35%", "Break-even occupancy below 65% — use the Risk Estimator to check before committing", "Setup cost (furnishing) recoverable within 8 months of projected net profit", "Minimum 3-month cash buffer covering rent, utilities, and cleaning if bookings are zero"] },
                { title: "Red Flags — Walk Away", pass: false, items: ["Standard view or ground/podium floor — almost never viable", "Rent above AED 10,000/month for a studio or AED 14,000 for a 1BR in a non-prime area", "Landlord unwilling to give written STR permission", "Building management committee has blocked holiday home permits", "Area with LTR-recommended warning (Dubai South, Furjan, Arjan, DAMAC Hills 2)"] },
              ].map(({ title, items, pass }) => (
                <div key={title} style={{ padding: "22px", background: colors.bgMain, borderRadius: "14px", border: `1px solid ${pass ? colors.border : "#F5C5C5"}`, borderTop: `3px solid ${pass ? colors.primary : "#C75A5A"}` }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: pass ? colors.primary : "#B03030", marginBottom: "14px" }}>{title}</div>
                  {items.map(item => (
                    <div key={item} style={{ display: "flex", gap: "8px", marginBottom: "9px", alignItems: "flex-start" }}>
                      {pass ? <IconCheck color={colors.primary} size={15} /> : <IconWarning size={15} />}
                      <span style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.55 }}>{item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Area & Building Risk Scoring */}
          <div style={{ background: colors.bgMain, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: isMobile ? "28px 22px" : "36px 42px", marginBottom: "36px" }}>
            <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "12px" }}>AREA & BUILDING RISK SCORING</div>
            <h3 style={{ fontSize: "22px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "8px" }}>Score Any Unit Across 5 Dimensions</h3>
            <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.6, marginBottom: "22px" }}>Before signing any lease, score the unit. A score of 18+ is required to proceed.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              {[
                { dimension: "STR Demand Score", max: 5, desc: "Prime area (Marina/JBR/Downtown/Palm): 5 pts · Strong area (Business Bay/Creek/DIFC): 3 pts · Other: 1 pt" },
                { dimension: "View & Floor Score", max: 5, desc: "Floor 20+ with sea/marina/BK view: 5 pts · Floor 15–19 or city view: 3–4 pts · Below floor 10 or standard view: 1 pt" },
                { dimension: "Rent Pressure Score", max: 5, desc: "Break-even occupancy below 50%: 5 pts · 50–65%: 3 pts · 65–80%: 1 pt · Above 80%: 0 pts (do not proceed)" },
                { dimension: "Operational Ease Score", max: 3, desc: "Smart lock permitted + building reception cooperative: 3 pts · Key safe only: 2 pts · Difficult access: 0 pts" },
                { dimension: "Exit Flexibility Score", max: 2, desc: "1-month break clause: 2 pts · 3-month notice: 1 pt · No break clause: 0 pts" },
              ].map(({ dimension, max, desc }) => (
                <div key={dimension} style={{ padding: "14px 18px", background: colors.bgSection, borderRadius: "10px", border: `1px solid ${colors.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: colors.textMain }}>{dimension}</div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: colors.secondary, background: "#FEF3E2", padding: "3px 10px", borderRadius: "12px" }}>max {max} pts</span>
                  </div>
                  <div style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
              {[
                { range: "18–20 pts", label: "Proceed", color: "#2D7A4F", bg: "#E8F5EE" },
                { range: "13–17 pts", label: "Negotiate", color: "#A37020", bg: "#FEF3E2" },
                { range: "Below 13", label: "Avoid", color: "#B83232", bg: "#FDE8E8" },
              ].map(({ range, label, color, bg }) => (
                <div key={range} style={{ padding: "14px", background: bg, borderRadius: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color, fontFamily: serifHeading }}>{label}</div>
                  <div style={{ fontSize: "11.5px", color, marginTop: "4px", opacity: 0.8 }}>{range}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Run estimator CTA */}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => router.push("/self-manage/str-subleasing/estimator")}
              style={{ padding: "14px 36px", background: `linear-gradient(135deg, ${colors.secondary} 0%, #8B6F3F 100%)`, color: "#fff", borderRadius: "11px", fontSize: "15px", fontWeight: 700, cursor: "pointer", border: "none", boxShadow: "0 6px 20px rgba(184,138,68,0.28)" }}
            >
              Run The Risk Estimator →
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 4. PILLAR 2 — DET PORTAL & LICENSING                                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="pillar-2" style={{ padding: pad, background: colors.bgMain, borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px", background: `${colors.secondary}12`, borderRadius: "20px", border: `1px solid ${colors.secondary}30`, marginBottom: "20px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: colors.secondary, letterSpacing: "0.1em" }}>PILLAR 2</span>
          </div>
          <SectionTitle size={isMobile ? "28px" : "36px"}>DET Portal & Licensing Setup</SectionTitle>
          <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "40px", maxWidth: "660px" }}>
            Before operating, you must secure landlord permission in writing, complete DET registration, and have all documentation in order. Operating without either is illegal in Dubai.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "18px", marginBottom: "28px" }}>
            {[
              { title: "Landlord Approval", color: colors.primary, items: ["Written permission for STR / holiday home operation", "Contract clause or addendum specifying holiday home use", "Permission to apply for DET holiday home permit", "Clarity on guest access and building rules", "If landlord refuses in writing — walk away"] },
              { title: "DET Portal Setup", color: colors.secondary, items: ["Create or access DET holiday home portal account", "Prepare and upload all required documents", "Submit unit details and property photos", "Track approval status — budget 3–7 working days", "Display permit in the property at all times after approval"] },
              { title: "Required Documents", color: colors.primary, items: ["Tenancy contract (signed, registered)", "Landlord NOC or written approval letter", "Passport or Emirates ID of operator", "DEWA bill for the property", "Property photos to DET standard", "Company documents if operating as a business"] },
              { title: "Ongoing Compliance", color: colors.secondary, items: ["Permit must be active before listing on any platform", "Collect guest ID (passport or Emirates ID) on every check-in", "Maintain a guest register — retained for 5 years", "Annual permit renewal — set reminder 45 days before expiry", "Tourism Dirham process where applicable"] },
            ].map(({ title, color, items }) => (
              <div key={title} style={{ padding: "24px 26px", background: colors.bgSection, borderRadius: "16px", border: `1px solid ${colors.border}`, borderTop: `3px solid ${color}` }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color, marginBottom: "14px" }}>{title}</div>
                {items.map(item => (
                  <div key={item} style={{ display: "flex", gap: "8px", marginBottom: "9px", alignItems: "flex-start" }}>
                    <div style={{ marginTop: "2px", flexShrink: 0 }}><IconCheck color={color} size={15} /></div>
                    <span style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Landlord Negotiation */}
          <div style={{ background: colors.bgSection, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: isMobile ? "28px 22px" : "36px 42px", marginBottom: "22px" }}>
            <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "16px" }}>LANDLORD NEGOTIATION FRAMEWORK</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { step: "1", title: "Position yourself as a professional operator", body: "Never say 'I want to put it on Airbnb.' Say: 'I operate a registered holiday home management business and am looking for a property to manage as a licensed DET holiday home. I will maintain the property to a premium standard, provide monthly reports, and ensure full DET compliance.'" },
                { step: "2", title: "What to ask for in the contract", body: "Written STR permission clause, a 1-month break clause (or 3-month minimum), clarity on major vs minor maintenance, permission to install a smart lock, and agreement on how damage is handled beyond the security deposit." },
                { step: "3", title: "What to offer the landlord", body: "A premium above market rent (5–15% is typical for STR permission), guaranteed rent via post-dated cheques, a 2-month security deposit, monthly property condition reports, and a 1-year minimum term with renewal option. Landlords value certainty — offer it." },
                { step: "4", title: "Handle objections before they arise", body: "'What about building rules?' → Confirm building eligibility before approaching the landlord, so you can say 'I have already confirmed the building permits this activity.' 'Is this legal?' → Show them the DET permit process." },
                { step: "5", title: "Contract wording to include", body: "The lease should state: 'The tenant is permitted to operate the property as a holiday home registered with the Dubai Department of Economy and Tourism (DET). The tenant will maintain a valid DET permit at all times and comply with all applicable regulations.'" },
              ].map(({ step, title, body }) => (
                <div key={step} style={{ display: "flex", gap: "16px", padding: "18px", background: colors.bgMain, borderRadius: "12px", border: `1px solid ${colors.border}` }}>
                  <PillarBadge num={step} color={colors.secondary} />
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: colors.textMain, marginBottom: "6px" }}>{title}</div>
                    <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.65, margin: 0 }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: "16px 20px", background: "#FEF3E2", borderRadius: "10px", border: "1px solid #E8D9BC", borderLeft: `3px solid ${colors.secondary}` }}>
            <p style={{ fontSize: "13px", color: "#7A5010", margin: 0, lineHeight: 1.6 }}>
              This section is educational and not legal advice. Verify all licensing and approval requirements with the DET, building management, and a qualified advisor before signing any lease or operating a holiday home.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 5. PILLAR 3 — OPERATIONAL SETUP                                        */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="pillar-3" style={{ padding: pad, background: colors.bgSection, borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px", background: `${colors.primary}10`, borderRadius: "20px", border: `1px solid ${colors.primary}25`, marginBottom: "20px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: colors.primary, letterSpacing: "0.1em" }}>PILLAR 3</span>
          </div>
          <SectionTitle size={isMobile ? "28px" : "36px"}>Build The Operations Team</SectionTitle>
          <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "40px", maxWidth: "660px" }}>
            STR sub-leasing is an active business — not passive income. These are the non-negotiable teams and workflows you need before the first guest checks in.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "18px" }}>
            {[
              { title: "Maintenance Team", color: colors.primary, items: ["Handyman on call (24hr response)", "AC service contact for summer", "Appliance repair — fridge, washer, dryer", "Emergency response protocol", "Damage reporting and documentation process"] },
              { title: "Housekeeping Team", color: colors.secondary, items: ["Same-day turnover cleaning capability", "Linen handling and laundry coordination", "3 sets of linen per bed minimum", "Inventory checks post-turnover", "Inspection photos after every clean"] },
              { title: "Guest Relations", color: colors.primary, items: ["Sub-1 hour message response at all times", "Check-in support on arrival day", "Complaint handling and empathy protocol", "Review management and response process", "Escalation chain when issues arise"] },
              { title: "Virtual Assistants", color: colors.secondary, items: ["Message templates for common scenarios", "Booking inquiries and pre-arrival communication", "Calendar and availability coordination", "Task follow-up and team coordination", "Guest support coverage across time zones"] },
              { title: "Access & Check-In", color: colors.primary, items: ["Smart lock (primary entry method)", "Backup physical key protocol", "Building access card coordination", "Parking instructions and security", "Late arrival and early departure handling"] },
              { title: "Quality Control", color: colors.secondary, items: ["Post-checkout inspection checklist", "Damage reporting before next check-in", "Maintenance log with response tracking", "Monthly replacement reserve (10–15% of revenue)", "Quarterly deep-clean schedule"] },
            ].map(({ title, color, items }) => (
              <div key={title} style={{ padding: "24px", background: colors.bgMain, borderRadius: "16px", border: `1px solid ${colors.border}`, borderTop: `3px solid ${color}` }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color, marginBottom: "14px", paddingBottom: "10px", borderBottom: `1px solid ${colors.border}` }}>{title}</div>
                {items.map(item => (
                  <div key={item} style={{ display: "flex", gap: "8px", marginBottom: "9px", alignItems: "flex-start" }}>
                    <div style={{ marginTop: "2px", flexShrink: 0 }}><IconCheck color={color} size={14} /></div>
                    <span style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 6. PILLAR 4 — PMS & SYSTEMS                                           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="pillar-4" style={{ padding: pad, background: colors.bgMain, borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px", background: `${colors.secondary}12`, borderRadius: "20px", border: `1px solid ${colors.secondary}30`, marginBottom: "20px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: colors.secondary, letterSpacing: "0.1em" }}>PILLAR 4</span>
          </div>
          <SectionTitle size={isMobile ? "28px" : "36px"}>Set Up The Systems</SectionTitle>
          <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "40px", maxWidth: "660px" }}>
            Sub-leasing cannot be managed from WhatsApp and spreadsheets once bookings start. A proper system stack controls calendars, pricing, messages, tasks, and reporting.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "18px" }}>
            {[
              { title: "PMS / Channel Manager", examples: "Hostaway, Guesty, Hostfully", color: colors.secondary, purpose: "Sync calendars, manage bookings, avoid double bookings, centralise messages, and manage tasks across all platforms from one dashboard." },
              { title: "Dynamic Pricing", examples: "PriceLabs, Beyond, Wheelhouse", color: colors.primary, purpose: "Adjust nightly rates automatically by seasonality, demand signals, local events, and occupancy trends. Essential for maximising low-season revenue." },
              { title: "Guest Messaging", examples: "Hospitable, Host Tools, PMS automations", color: colors.secondary, purpose: "Automate confirmations, check-in instructions, checkout reminders, and review requests. Reduces manual work while maintaining response rates." },
              { title: "Task Management", examples: "Trello, ClickUp, Notion, PMS task tools", color: colors.primary, purpose: "Coordinate cleaners, maintenance vendors, inspections, and issue follow-ups. Every turnover and repair should be tracked and closed." },
              { title: "Smart Access", examples: "Yale, Nuki, TTLock", color: colors.secondary, purpose: "Secure self-check-in without key handover risk. Guests receive a unique code per booking. Change codes remotely after checkout." },
              { title: "Finance Tracking", examples: "Google Sheets, Xero, Zoho Books", color: colors.primary, purpose: "Track gross revenue, rent, utilities, cleaning, platform fees, maintenance, and monthly net profit. Monthly P&L review is non-negotiable." },
            ].map(({ title, examples, color, purpose }) => (
              <div key={title} style={{ background: colors.bgSection, borderRadius: "16px", border: `1px solid ${colors.border}`, padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${color}12`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                  <IconSystem color={color} size={20} />
                </div>
                <h3 style={{ fontSize: "15px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "6px" }}>{title}</h3>
                <div style={{ fontSize: "11.5px", color: color, fontWeight: 600, background: `${color}0E`, borderRadius: "6px", padding: "4px 10px", display: "inline-block", marginBottom: "12px" }}>{examples}</div>
                <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.65, margin: 0 }}>{purpose}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 7. SUB-LEASING FINANCIAL LOGIC                                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="financial-logic" style={{ padding: pad, background: colors.bgSection, borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <SectionLabel text="FINANCIAL MODEL" />
            <SectionTitle>The Numbers That Decide If A Unit Works</SectionTitle>
            <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.7, maxWidth: "560px", margin: "0 auto" }}>
              The entire sub-leasing model rests on one question: does STR revenue cover fixed rent plus all costs, with enough left over to make it worth your time?
            </p>
          </div>

          {/* Formula cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "36px" }}>
            {[
              { label: "Monthly Revenue", formula: "ADR × Occupied Nights", note: "Use the Risk Estimator for a realistic ADR projection. Do not use optimistic numbers." },
              { label: "Break-Even Occupancy", formula: "Monthly Fixed Costs ÷ ADR ÷ Days in Month", note: "Any unit with break-even above 65% is high risk. Above 80% is very high risk — avoid." },
              { label: "Monthly Profit", formula: "Gross Revenue − Rent − Platform Fees − Utilities − Cleaning − Maintenance Reserve − Furniture Amortisation", note: "Must be positive across the full year — including summer low-season months." },
              { label: "Minimum Cash Buffer", formula: "3 to 6 months of rent and operating costs", note: "Operators who undercapitalise fail in their first summer. Model a worst-case 45% occupancy month." },
            ].map(({ label, formula, note }) => (
              <div key={label} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "200px 1fr 1fr", gap: "16px", padding: "18px 22px", background: colors.bgMain, borderRadius: "12px", border: `1px solid ${colors.border}`, alignItems: "start" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: colors.textMain }}>{label}</div>
                <div style={{ fontSize: "13px", color: colors.secondary, fontFamily: "monospace", background: "#FEF3E2", padding: "6px 12px", borderRadius: "7px", lineHeight: 1.5 }}>{formula}</div>
                <div style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.6 }}>{note}</div>
              </div>
            ))}
          </div>

          {/* Cost breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
            {[
              { label: "Platform Fees", formula: "~18% of gross (Airbnb + Booking.com blended)", note: "Deducted automatically by platforms before payout." },
              { label: "Landlord Rent", formula: "Monthly rent × 12 — fixed, paid regardless of occupancy", note: "Your biggest cost. Does not flex with your revenue." },
              { label: "Utilities (DEWA, AC, Internet)", formula: "AED 600–1,200/month in summer, AED 400–700 in winter", note: "You pay these — the landlord does not. Factor into monthly cash flow." },
              { label: "Cleaning Costs", formula: "AED 150–350 per turn × estimated turns per month", note: "A 1BR with 70% occupancy averages 8–12 turns per month." },
              { label: "Furniture Amortisation", formula: "Setup cost (AED 30–55k for 1BR) ÷ 5 years ÷ 12", note: "Spread over 5 years. You own the furniture — recovery possible on exit." },
            ].map(({ label, formula, note }) => (
              <div key={label} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "200px 1fr 1fr", gap: "12px", padding: "14px 18px", background: colors.bgMain, borderRadius: "10px", border: `1px solid ${colors.border}`, alignItems: "start" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: colors.textMuted }}>{label}</div>
                <div style={{ fontSize: "12.5px", color: colors.secondary, fontFamily: "monospace", background: "#FEF3E2", padding: "4px 10px", borderRadius: "6px" }}>{formula}</div>
                <div style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.5 }}>{note}</div>
              </div>
            ))}
          </div>

          {/* Cash buffer */}
          <div style={{ padding: "28px 32px", background: "#F0F8F4", borderRadius: "16px", border: "1px solid rgba(27,94,74,0.15)" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: colors.primary, marginBottom: "12px" }}>Cash Buffer Requirement</div>
            <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "16px" }}>
              A unit is not safe just because the annual forecast is positive. It must survive low-season months. June–August occupancy in Dubai drops 30–50% — you still pay full rent.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "10px" }}>
              {[
                { label: "Minimum buffer", value: "3 months rent + utilities" },
                { label: "Recommended buffer", value: "5 months (covers full low season)" },
                { label: "Setup cost (1BR)", value: "AED 30,000–55,000 fully furnished" },
                { label: "Break-even target", value: "Occupancy below 65% at market ADR" },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: "14px", background: colors.bgSection, borderRadius: "10px", border: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: "11.5px", color: colors.textMuted, marginBottom: "5px" }}>{label}</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: colors.primary }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 8. WHAT ASSETINTEL CAN HELP WITH                                      */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: pad, background: colors.bgMain, borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <SectionLabel text="HOW WE HELP" />
            <SectionTitle>How AssetIntel Helps You Build This Safely</SectionTitle>
            <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.7, maxWidth: "560px", margin: "0 auto" }}>
              AssetIntel covers all four pillars — from risk estimation to operational structure and systems setup.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "20px" }}>
            {[
              { icon: <IconTarget color={colors.primary} size={24} />, pillar: "PILLAR 1", title: "Risk Estimator", color: colors.primary, body: "We help screen buildings, areas, rent levels, unit types, and break-even risk before you sign. Use the free Risk Estimator or request a detailed unit screening." },
              { icon: <IconDocument color={colors.secondary} size={24} />, pillar: "PILLAR 2", title: "Licensing Guidance", color: colors.secondary, body: "We help map the DET portal setup, documentation checklist, landlord approval route, and compliance steps so you operate legally from day one." },
              { icon: <IconTeam color={colors.primary} size={24} />, pillar: "PILLAR 3", title: "Operations Setup", color: colors.primary, body: "We help structure your maintenance, housekeeping, guest relations, virtual assistant workflows, and check-in systems into a reliable operational framework." },
              { icon: <IconSystem color={colors.secondary} size={24} />, pillar: "PILLAR 4", title: "PMS Setup", color: colors.secondary, body: "We help define the right tools, configure your PMS and pricing system, build guest messaging automations, set up task workflows, and structure reporting." },
            ].map(({ icon, pillar, title, color, body }) => (
              <div key={title} style={{ background: colors.bgSection, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: "28px 32px", display: "flex", gap: "20px", alignItems: "flex-start", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ width: "50px", height: "50px", borderRadius: "14px", background: `${color}10`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: color, letterSpacing: "0.1em", marginBottom: "4px" }}>{pillar}</div>
                  <h3 style={{ fontSize: "16px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "8px" }}>{title}</h3>
                  <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.65, margin: 0 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 9. READINESS SCORE + COMMON MISTAKES                                   */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {hasAccess && (
        <section style={{ padding: padSm, background: colors.bgSection, borderTop: `1px solid ${colors.border}` }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Common Mistakes */}
            <div style={{ background: colors.bgMain, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: isMobile ? "28px 22px" : "36px 42px" }}>
              <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "12px" }}>AVOID THESE</div>
              <h3 style={{ fontSize: "24px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "22px" }}>Common Mistakes & Red Flags</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { mistake: "Signing a lease without written STR permission", fix: "Verbal agreements are worthless in a dispute. Get written approval in the lease contract before signing anything." },
                  { mistake: "Choosing a low-floor or standard-view unit to save on rent", fix: "The rent saving is eaten by lower nightly rates and lower occupancy. High floor + premium view is not optional — it is the product." },
                  { mistake: "Underestimating summer cash flow pressure", fix: "June–August occupancy drops 30–50%. You still pay full rent. Model your P&L for a worst-case 45% occupancy month before committing." },
                  { mistake: "Operating without a DET permit", fix: "Fines up to AED 50,000 and permit blacklisting. Apply before furnishing. Never list until the permit is confirmed." },
                  { mistake: "Using optimistic ADR assumptions to make the numbers work", fix: "If the model only works with an ADR above what comparable listings in your building are achieving — the model does not work." },
                  { mistake: "No break clause in the lease", fix: "A 12-month lease with no break clause locks you into paying rent even if the unit is losing money. Always negotiate a 1–3 month break option." },
                  { mistake: "Scaling too fast before proving unit one", fix: "Prove the model on unit one for 3 months before signing a second lease. Many sub-lessees fail by over-committing too early." },
                ].map(({ mistake, fix }, i) => (
                  <div key={i} style={{ padding: "16px 20px", background: colors.bgSection, borderRadius: "12px", border: `1px solid ${colors.border}`, borderLeft: "3px solid #C75A5A" }}>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#B03030", marginBottom: "8px" }}>✕  {mistake}</div>
                    <div style={{ fontSize: "13px", color: colors.primary, lineHeight: 1.55, padding: "8px 12px", background: "#F0F8F4", borderRadius: "8px" }}><strong>Fix:</strong> {fix}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Readiness Score */}
            <SubleasingReadinessScore />

          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 10. PAID PLAYBOOK / SETUP SUPPORT CTA                                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: pad, background: colors.bgMain, borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <SectionLabel text="GET STARTED" />
            <SectionTitle>Want AssetIntel To Help You Build Your STR Sub-Leasing Setup?</SectionTitle>
            <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.7, maxWidth: "540px", margin: "0 auto" }}>
              Get the full sub-leasing playbook or request hands-on setup support from our account manager.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "22px" }}>
            {/* Playbook */}
            <div style={{ background: colors.bgSection, borderRadius: "20px", border: `1px solid ${colors.border}`, padding: "36px 30px", display: "flex", flexDirection: "column", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "11px", color: colors.textMuted, fontWeight: 700, letterSpacing: "0.1em", marginBottom: "12px" }}>STR SUB-LEASING PLAYBOOK</div>
              <h3 style={{ fontSize: "20px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "10px" }}>Full Playbook Access</h3>
              <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.65, marginBottom: "20px", flex: 1 }}>All frameworks, checklists, risk scoring, financial model, landlord negotiation guide, and readiness score. One-time access, yours to keep.</p>
              <div style={{ fontSize: "34px", fontWeight: 700, color: colors.textMain, fontFamily: serifHeading, marginBottom: "4px" }}>{PRICE}</div>
              <div style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "20px" }}>One-time access</div>
              {!hasAccess ? (
                <button onClick={() => openCheckout("subleasing")} style={{ padding: "13px", background: colors.secondary, color: "#fff", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", border: "none" }}>
                  Unlock Playbook →
                </button>
              ) : (
                <div style={{ padding: "12px", background: "#F0F8F4", borderRadius: "10px", fontSize: "14px", fontWeight: 600, color: colors.primary, textAlign: "center" }}>Access Active</div>
              )}
            </div>

            {/* Setup Support */}
            <div style={{ background: `linear-gradient(145deg, #1B5E4A 0%, #0F3E33 100%)`, borderRadius: "20px", padding: "36px 30px", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(27,94,74,0.22)" }}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "12px" }}>SETUP SUPPORT</div>
              <h3 style={{ fontSize: "20px", fontFamily: serifHeading, fontWeight: 700, color: "#FFFFFF", marginBottom: "10px" }}>STR Sub-Leasing Setup Support</h3>
              <p style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.75)", lineHeight: 1.65, marginBottom: "20px", flex: 1 }}>Hands-on help with unit screening, risk modelling, licensing guidance, operations structure, and systems setup. Guided implementation by our account manager.</p>
              <div style={{ fontSize: "34px", fontWeight: 700, color: "#FFFFFF", fontFamily: serifHeading, marginBottom: "4px" }}>AED 5,000</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "20px" }}>Starting from</div>
              <a href="/contact?service=subleasing-setup" style={{ display: "block", padding: "13px", background: colors.secondary, color: "#fff", borderRadius: "10px", fontSize: "14px", fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                Request Setup Support →
              </a>
            </div>

            {/* Bundle */}
            <div style={{ background: colors.bgSection, borderRadius: "20px", border: `1.5px solid ${colors.secondary}`, padding: "36px 30px", display: "flex", flexDirection: "column", boxShadow: "0 4px 20px rgba(184,138,68,0.10)" }}>
              <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.1em", marginBottom: "12px" }}>BEST VALUE</div>
              <h3 style={{ fontSize: "20px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "10px" }}>Both Playbooks Bundle</h3>
              <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.65, marginBottom: "20px", flex: 1 }}>Get both the Owner Self-Management Playbook and the STR Sub-Leasing Playbook. Useful if you are deciding between paths or plan to explore both.</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "4px" }}>
                <div style={{ fontSize: "34px", fontWeight: 700, color: colors.textMain, fontFamily: serifHeading }}>{BUNDLE_PRICE}</div>
                <div style={{ fontSize: "13px", color: colors.textMuted, textDecoration: "line-through" }}>AED 498</div>
              </div>
              <div style={{ fontSize: "12px", color: colors.secondary, fontWeight: 600, marginBottom: "20px" }}>Saves AED 99</div>
              <button onClick={() => openCheckout("bundle")} style={{ padding: "13px", background: colors.secondary, color: "#fff", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", border: "none" }}>
                Unlock Bundle →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 10. LEGAL DISCLAIMER                                                   */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? "32px 20px" : "40px 40px", background: colors.bgSection, borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", padding: "20px 24px", background: colors.bgMain, borderRadius: "14px", border: `1px solid ${colors.border}` }}>
            <div style={{ marginTop: "2px", flexShrink: 0 }}><IconShield color={colors.textMuted} size={20} /></div>
            <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.7, margin: 0 }}>
              STR sub-leasing involves fixed rent exposure, licensing requirements, landlord approval, and operational risk. AssetIntel provides research, frameworks, and advisory tools, but users should verify all legal and licensing requirements with the relevant authorities and qualified advisors before signing any lease or operating a holiday home.
            </p>
          </div>
        </div>
      </section>

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
