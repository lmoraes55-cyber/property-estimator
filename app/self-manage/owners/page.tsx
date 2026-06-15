"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import GroundWorksLogo from "@/components/GroundWorksLogo";
import { useIsMobile } from "@/lib/useIsMobile";

const colors = {
  primary: "#1B5E4A",
  secondary: "#B88A44",
  bgMain: "#FAFAF8",
  bgSection: "#FFFFFF",
  textMain: "#1A1A1A",
  textMuted: "#6B6B6B",
  border: "#E0DDD8",
  shadowSm: "0 1px 2px rgba(0,0,0,0.05)",
  shadowMd: "0 4px 12px rgba(0,0,0,0.09)",
};
const serifHeading = "'Georgia', serif";
const sk = (c: string) => ({ stroke: c, strokeWidth: 1.4, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

// ─── Icons ──────────────────────────────────────────────────────────────────
const IconLock = ({ color = colors.secondary, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="4" y="10" width="16" height="12" rx="2.5" stroke={color} strokeWidth="1.5" /><path d="M8 10V7a4 4 0 018 0v3" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>
);
const IconCheck = ({ color = colors.primary, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8.5" stroke={color} strokeWidth="1.2" opacity="0.35" /><path d="M6.5 10L9 12.5L13.5 7.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const IconBuilding = ({ color = colors.primary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M6 28V11L16 5L26 11V28" {...sk(color)} /><rect x="12" y="19" width="8" height="9" rx="1" {...sk(color)} /><rect x="9" y="14" width="4" height="4" rx="0.5" {...sk(color)} /><rect x="19" y="14" width="4" height="4" rx="0.5" {...sk(color)} /></svg>
);
const IconWarning = ({ color = "#A37020", size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 3L22 20H2L12 3Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /><path d="M12 10V14" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><circle cx="12" cy="17.5" r="0.8" fill={color} /></svg>
);
const IconBundle = ({ color = colors.secondary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><rect x="4" y="10" width="10" height="14" rx="1.5" {...sk(color)} /><rect x="18" y="10" width="10" height="14" rx="1.5" {...sk(color)} /><path d="M14 14H18" {...sk(color)} /><path d="M14 18H18" {...sk(color)} /></svg>
);
const IconPerson = ({ color = colors.primary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><circle cx="16" cy="10" r="5" {...sk(color)} /><path d="M6 27C6 21.5 10.5 17 16 17C21.5 17 26 21.5 26 27" {...sk(color)} /></svg>
);

// ─── Payment Modal ──────────────────────────────────────────────────────────
type Product = { name: string; price: string; amount: number };

function PaymentModal({ product, onClose, onCheckout }: { product: Product; onClose: () => void; onCheckout: (p: Product) => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "40px", maxWidth: "440px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.2)", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "18px", right: "18px", background: "none", border: "none", cursor: "pointer", color: colors.textMuted, fontSize: "22px", lineHeight: 1 }}>×</button>
        <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "14px" }}>GROUNDWORKS</div>
        <h2 style={{ fontSize: "22px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "8px" }}>Unlock Playbook</h2>
        <p style={{ fontSize: "14px", color: colors.textMuted, marginBottom: "28px" }}>You are about to unlock access to the following:</p>
        <div style={{ background: colors.bgMain, borderRadius: "12px", border: `1px solid ${colors.border}`, padding: "20px 22px", marginBottom: "28px" }}>
          <div style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "6px" }}>Selected product</div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: colors.textMain, marginBottom: "4px" }}>{product.name}</div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: colors.primary, fontFamily: serifHeading }}>{product.price}</div>
          <div style={{ fontSize: "12px", color: colors.textMuted }}>One-time access fee</div>
        </div>
        <div style={{ padding: "14px 16px", background: "#FFFBF5", borderRadius: "10px", border: "1px solid #E8D9BC", marginBottom: "24px" }}>
          <p style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.6, margin: 0 }}>Payment checkout will be connected here. Click continue to proceed when payment is available.</p>
        </div>
        <button
          onClick={() => onCheckout(product)}
          style={{ width: "100%", padding: "14px", background: colors.primary, color: "#fff", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: "pointer", border: "none", marginBottom: "12px" }}
        >
          Continue to Checkout →
        </button>
        <button onClick={onClose} style={{ width: "100%", padding: "12px", background: "transparent", color: colors.textMuted, border: `1.5px solid ${colors.border}`, borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Locked Section ──────────────────────────────────────────────────────────
function LockedSection({ title, contents, price, onUnlock }: { title: string; contents: string[]; price: string; onUnlock: () => void }) {
  return (
    <div style={{ background: colors.bgSection, borderRadius: "16px", border: `1px solid ${colors.border}`, overflow: "hidden", boxShadow: colors.shadowSm }}>
      {/* Blurred preview rows */}
      <div style={{ padding: "24px 28px", borderBottom: `1px solid ${colors.border}`, filter: "blur(4px)", pointerEvents: "none", userSelect: "none", opacity: 0.55 }}>
        {contents.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: i < contents.length - 1 ? `1px solid ${colors.border}` : "none" }}>
            <IconCheck />
            <span style={{ fontSize: "14px", color: colors.textMain }}>{c}</span>
          </div>
        ))}
      </div>
      {/* Lock overlay */}
      <div style={{ padding: "28px", background: "linear-gradient(to bottom, rgba(250,250,248,0.0) 0%, rgba(250,250,248,1) 100%)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "14px", marginTop: "-40px", paddingTop: "0" }}>
        <div style={{ background: "#fff", borderRadius: "16px", border: `1px solid ${colors.border}`, padding: "28px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.09)", maxWidth: "380px", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}><IconLock size={28} /></div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: colors.secondary, letterSpacing: "0.1em", marginBottom: "8px" }}>LOCKED SECTION</div>
          <p style={{ fontSize: "14px", color: colors.textMain, fontWeight: 600, marginBottom: "6px" }}>{title}</p>
          <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "18px", lineHeight: 1.5 }}>Unlock the full Owner Self-Management Playbook to access this section.</p>
          <button onClick={onUnlock} style={{ width: "100%", padding: "12px", background: colors.primary, color: "#fff", borderRadius: "9px", fontSize: "14px", fontWeight: 700, cursor: "pointer", border: "none" }}>
            Unlock for {price}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Section Heading ─────────────────────────────────────────────────────────
function SectionHeading({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "44px", textAlign: "center" }}>
      <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>{label}</div>
      <h2 style={{ fontSize: "34px", fontFamily: serifHeading, fontWeight: 700, marginBottom: "12px", background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{title}</h2>
      {subtitle && <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.65, maxWidth: "580px", margin: "0 auto" }}>{subtitle}</p>}
    </div>
  );
}

const PRICE = "AED 199";
const BUNDLE_PRICE = "AED 399";

// ─── Readiness Score Component ───────────────────────────────────────────────

const READINESS_ITEMS = [
  "I have confirmed my building allows short-term rentals",
  "I have or can obtain a Developer NOC",
  "I have the Title Deed ready",
  "I can respond to guest messages within 1 hour daily",
  "I have identified a reliable cleaning team",
  "I have a budget of AED 30,000+ for furnishing (or am already furnished)",
  "I understand Dubai's seasonal occupancy pattern (winter peak, summer low)",
  "I am comfortable with dynamic pricing tools",
  "I have a maintenance contact list ready",
  "I can commit 4–8 hours per week to managing the property",
];

function ReadinessScore({ isMobile, colors, serifHeading }: { isMobile: boolean; colors: Record<string, string>; serifHeading: string }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setChecked(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const score = checked.size;
  const label = score >= 9 ? "Ready to Launch" : score >= 7 ? "Almost Ready" : score >= 5 ? "Needs Preparation" : "Not Yet Ready";
  const labelColor = score >= 9 ? "#2D7A4F" : score >= 7 ? "#A37020" : score >= 5 ? "#C25A1A" : "#B83232";
  const labelBg = score >= 9 ? "#E8F5EE" : score >= 7 ? "#FEF3E2" : score >= 5 ? "#FEF0E8" : "#FDE8E8";
  return (
    <div style={{ background: colors.bgSection, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: isMobile ? "28px 22px" : "40px 48px" }}>
      <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "14px" }}>READINESS CHECK</div>
      <h2 style={{ fontSize: isMobile ? "22px" : "28px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "8px" }}>Self-Manage Readiness Score</h2>
      <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.6, marginBottom: "24px" }}>Tick every item that currently applies to you. Your score tells you where you stand before you commit.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
        {READINESS_ITEMS.map((item, i) => {
          const active = checked.has(i);
          return (
            <div key={i} onClick={() => toggle(i)} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px", background: active ? "#F0F8F4" : colors.bgMain, borderRadius: "10px", border: `1.5px solid ${active ? colors.primary : colors.border}`, cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ width: "22px", height: "22px", borderRadius: "6px", border: `2px solid ${active ? colors.primary : colors.border}`, background: active ? colors.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
            {score >= 9 ? "You have the foundations in place. Launch with confidence." :
             score >= 7 ? "Address the remaining gaps before going live." :
             score >= 5 ? "Work through the missing items before launching." :
             "Build your foundation before committing to self-management."}
          </div>
        </div>
      </div>
    </div>
  );
}

const PRODUCTS: Record<string, Product> = {
  owner: { name: "Owner Self-Management Playbook", price: PRICE, amount: 199 },
  bundle: { name: "Bundle — Both Playbooks", price: BUNDLE_PRICE, amount: 399 },
};

export default function OwnersPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [hasAccess, setHasAccess] = useState(true);
  const [modal, setModal] = useState<Product | null>(null);

  function openCheckout(key: keyof typeof PRODUCTS) {
    setModal(PRODUCTS[key]);
  }

  async function handleCheckout(product: Product) {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pkg: product.name, origin: window.location.origin }),
      });
      const data = await res.json();
      if (data.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert("Payment unavailable right now. Please try again shortly.");
      }
    } catch {
      alert("Payment unavailable right now. Please try again shortly.");
    }
    setModal(null);
  }

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh" }}>
      {modal && <PaymentModal product={modal} onClose={() => setModal(null)} onCheckout={handleCheckout} />}

      {/* ─── HEADER ─── */}
      <header style={{ background: colors.bgSection, borderBottom: `1px solid ${colors.border}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: isMobile ? "14px 20px" : "16px 40px", display: "flex", alignItems: "center", gap: isMobile ? "0" : "60px", justifyContent: isMobile ? "space-between" : "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => router.push("/")}>
            <GroundWorksLogo size={40} />
            <div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: colors.textMain }}>Ground<span style={{ color: colors.primary }}>Works</span></div>
              <div style={{ fontSize: "10px", color: colors.textMuted, letterSpacing: "0.1em" }}>RENTAL INTELLIGENCE</div>
            </div>
          </div>
          {!isMobile && (
            <nav style={{ display: "flex", gap: "40px" }}>
              <a onClick={() => router.push("/")} style={{ cursor: "pointer", color: colors.textMuted, fontSize: "15px", fontWeight: 500 }}>Home</a>
              <a onClick={() => router.push("/self-manage")} style={{ cursor: "pointer", color: colors.textMuted, fontSize: "15px", fontWeight: 500 }}>Self-Manage</a>
              <a style={{ color: colors.primary, fontSize: "15px", fontWeight: 600 }}>Owner Playbook</a>
              <a onClick={() => router.push("/estimator")} style={{ cursor: "pointer", color: colors.textMuted, fontSize: "15px", fontWeight: 500 }}>Analyzer</a>
            </nav>
          )}
          {isMobile && (
            <a onClick={() => router.push("/self-manage")} style={{ cursor: "pointer", fontSize: "13px", color: colors.primary, fontWeight: 600 }}>← Back</a>
          )}
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section style={{ background: colors.bgSection, borderBottom: `1px solid ${colors.border}`, padding: isMobile ? "48px 20px" : "80px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "40px" : "80px", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.14em", marginBottom: "16px" }}>OWNER SELF-MANAGEMENT PLAYBOOK</div>
            <h1 style={{ fontSize: isMobile ? "32px" : "48px", fontFamily: serifHeading, fontWeight: 700, lineHeight: 1.15, marginBottom: "20px", background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Manage Up To 8 Units Like a Professional Operator
            </h1>
            <p style={{ fontSize: "16px", color: colors.textMuted, lineHeight: 1.65, marginBottom: "32px", maxWidth: "520px" }}>
              A practical roadmap for Dubai property owners who want to reduce management fees, maintain full control, and operate short-term rentals professionally.
            </p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              {!hasAccess && (
                <button onClick={() => openCheckout("owner")} style={{ padding: "14px 28px", background: colors.primary, color: "#fff", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: "pointer", border: "none", boxShadow: "0 6px 20px rgba(27,94,74,0.22)" }}>
                  Unlock Owner Playbook — {PRICE}
                </button>
              )}
              <a href="#contents" style={{ padding: "14px 24px", background: "transparent", color: colors.primary, border: `2px solid ${colors.primary}`, borderRadius: "10px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}>
                View What&apos;s Included
              </a>
            </div>
            {hasAccess && (
              <div style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "#F0F8F4", borderRadius: "999px", border: "1px solid rgba(27,94,74,0.2)" }}>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8.5" stroke={colors.primary} strokeWidth="1.2" opacity="0.4" /><path d="M6.5 10L9 12.5L13.5 7.5" stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span style={{ fontSize: "13px", fontWeight: 600, color: colors.primary }}>Playbook unlocked — full access active</span>
              </div>
            )}
          </div>

          {/* Price card */}
          <div style={{ flexShrink: 0, width: isMobile ? "100%" : "280px" }}>
            <div id="contents" style={{ background: colors.bgMain, borderRadius: "18px", border: `1.5px solid ${colors.border}`, padding: "28px", boxShadow: "0 8px 32px rgba(27,94,74,0.07)" }}>
              <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "16px" }}>WHAT&apos;S INCLUDED</div>
              {[
                "8-step setup roadmap (full)",
                "DET permit & compliance checklist",
                "Operational setup framework",
                "Technology stack guide",
                "Financial tracking model",
                "Weekly operating workflow",
                "Common mistakes to avoid",
                "Self-manage readiness score",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: `1px solid ${colors.border}` }}>
                  <IconCheck color={colors.primary} />
                  <span style={{ fontSize: "13px", color: colors.textMuted }}>{item}</span>
                </div>
              ))}
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <div style={{ fontSize: "34px", fontWeight: 700, color: colors.textMain, fontFamily: serifHeading }}>{PRICE}</div>
                <div style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "16px" }}>One-time access</div>
                {!hasAccess ? (
                  <button onClick={() => openCheckout("owner")} style={{ width: "100%", padding: "13px", background: colors.primary, color: "#fff", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", border: "none" }}>
                    Unlock Owner Playbook
                  </button>
                ) : (
                  <div style={{ padding: "12px", background: "#F0F8F4", borderRadius: "10px", fontSize: "14px", fontWeight: 600, color: colors.primary }}>Access Active</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FREE: WHO THIS IS FOR ─── */}
      <section style={{ padding: isMobile ? "52px 20px" : "72px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <SectionHeading label="BEFORE YOU START" title="Is Self-Management Right For You?" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "22px" }}>
            {[
              { icon: <IconCheck color={colors.primary} size={22} />, title: "Best For", text: "Owners with 1–8 units who can dedicate time to guest communication, coordination, and quality control. Works best when the owner treats the property as a business.", accent: colors.primary },
              { icon: <IconWarning size={22} />, title: "Not Ideal For", text: "Owners who want completely passive income, travel often, or cannot respond quickly to guest issues. Without systems and availability, self-management leads to poor reviews.", accent: "#A14B3D" },
              { icon: <IconBuilding size={22} />, title: "GroundWorks View", text: "Self-management can work very well for small portfolios, but only when the owner builds the right systems and treats operations with professional discipline.", accent: colors.secondary },
            ].map((card) => (
              <div key={card.title} style={{ background: colors.bgSection, borderRadius: "16px", border: `1px solid ${colors.border}`, borderTop: `3px solid ${card.accent}`, padding: "28px" }}>
                <div style={{ marginBottom: "14px" }}>{card.icon}</div>
                <h3 style={{ fontSize: "17px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "10px" }}>{card.title}</h3>
                <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.65 }}>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FREE: WHAT SELF-MANAGEMENT MEANS ─── */}
      <section style={{ padding: isMobile ? "0 20px 52px" : "0 40px 72px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ background: colors.bgSection, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: isMobile ? "28px 22px" : "40px 48px" }}>
            <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "14px" }}>WHAT THIS MEANS IN PRACTICE</div>
            <h2 style={{ fontSize: isMobile ? "24px" : "30px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "18px" }}>Self-management means operating your STR as a business.</h2>
            <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "16px" }}>
              You handle guest communication, pricing reviews, cleaning coordination, maintenance, permit compliance, and performance tracking — not a third-party operator. The upside is retaining the management fee (typically 15–22% of gross revenue). The tradeoff is time, availability, and operational discipline.
            </p>
            <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.7 }}>
              This playbook gives you a structured system to do it correctly — so you are not learning by trial and error with real guests, real reviews, and real revenue on the line.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FREE: ROADMAP OVERVIEW ─── */}
      <section style={{ padding: isMobile ? "0 20px 52px" : "0 40px 72px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ background: colors.bgSection, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: isMobile ? "28px 22px" : "40px 48px" }}>
            <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "14px" }}>8-STEP SETUP ROADMAP (OVERVIEW)</div>
            <h2 style={{ fontSize: isMobile ? "22px" : "28px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "22px" }}>From zero to operating — eight structured steps.</h2>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "12px" }}>
              {[
                "Confirm building eligibility",
                "Prepare ownership documents",
                "Apply for holiday home permit",
                "Furnish and equip the property",
                "Build your pricing strategy",
                "Set up guest operations",
                "Launch listings",
                "Track performance weekly",
              ].map((step, i) => (
                <div key={step} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", background: colors.bgMain, borderRadius: "10px", border: `1px solid ${colors.border}` }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: "14px", color: colors.textMain, fontWeight: 500 }}>{step}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "22px", padding: "14px 18px", background: "#FFFBF5", borderRadius: "10px", border: "1px solid #E8D9BC", display: "flex", alignItems: "center", gap: "12px" }}>
              <IconLock size={18} />
              <p style={{ fontSize: "13px", color: "#8A6020", margin: 0 }}>Full step-by-step guidance with detailed instructions, checklists, and frameworks is included in the paid playbook.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LOCKED SECTIONS ─── */}
      {!hasAccess && (
        <section style={{ padding: isMobile ? "0 20px 72px" : "0 40px 80px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ textAlign: "center", marginBottom: "8px" }}>
              <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.14em", marginBottom: "10px" }}>FULL PLAYBOOK CONTENT</div>
              <h2 style={{ fontSize: isMobile ? "26px" : "32px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "10px" }}>Unlock the Complete Framework</h2>
              <p style={{ fontSize: "15px", color: colors.textMuted, maxWidth: "520px", margin: "0 auto" }}>The following sections are included in the full Owner Self-Management Playbook.</p>
            </div>
            <LockedSection title="Start From Zero — Full Roadmap" price={PRICE} onUnlock={() => openCheckout("owner")} contents={["Building eligibility check process", "Permit application walkthrough", "Document preparation checklist", "Furnishing standards guide", "Pre-launch compliance steps"]} />
            <LockedSection title="Dubai Holiday Home Requirements" price={PRICE} onUnlock={() => openCheckout("owner")} contents={["DET registration steps", "Permit requirements per unit", "Required document list", "Developer NOC guidance", "Compliance maintenance"]} />
            <LockedSection title="Operational Setup" price={PRICE} onUnlock={() => openCheckout("owner")} contents={["Guest communication templates", "Cleaning & linen system", "Maintenance escalation process", "Access & check-in setup", "Review management workflow"]} />
            <LockedSection title="Technology Stack & Tools" price={PRICE} onUnlock={() => openCheckout("owner")} contents={["PMS selection guide", "Dynamic pricing tool setup", "Channel manager configuration", "Smart access systems", "Accounting tracker setup"]} />
            <LockedSection title="Financial Model" price={PRICE} onUnlock={() => openCheckout("owner")} contents={["Revenue tracking framework", "Cost breakdown template", "Monthly net income formula", "RevPAR and ADR tracking", "Break-even occupancy check"]} />
            <LockedSection title="Weekly Operating Workflow" price={PRICE} onUnlock={() => openCheckout("owner")} contents={["Day-by-day task schedule", "Pricing review cadence", "Quality audit checklist", "Guest prep sequence", "Weekly performance review"]} />
            <LockedSection title="Common Mistakes & How to Avoid Them" price={PRICE} onUnlock={() => openCheckout("owner")} contents={["Low-season pricing errors", "Listing quality failures", "Communication delays", "Cleaning quality gaps", "Financial tracking mistakes"]} />
            <LockedSection title="Self-Manage Readiness Score" price={PRICE} onUnlock={() => openCheckout("owner")} contents={["Interactive readiness checklist", "Score interpretation guide", "Personalised next-step guidance", "When to use an operator instead"]} />

            {/* Unlock CTA */}
            <div style={{ background: colors.bgSection, borderRadius: "18px", border: `1.5px solid ${colors.primary}`, padding: isMobile ? "28px 22px" : "40px", textAlign: "center", boxShadow: "0 8px 32px rgba(27,94,74,0.08)" }}>
              <IconLock color={colors.primary} size={32} />
              <h3 style={{ fontSize: "24px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, margin: "16px 0 10px" }}>Unlock the Full Owner Self-Management Playbook</h3>
              <p style={{ fontSize: "15px", color: colors.textMuted, marginBottom: "28px", maxWidth: "480px", margin: "0 auto 28px" }}>One-time access. All sections, checklists, frameworks, and the readiness score included.</p>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <span style={{ fontSize: "38px", fontWeight: 700, color: colors.textMain, fontFamily: serifHeading }}>{PRICE}</span>
                <span style={{ fontSize: "14px", color: colors.textMuted }}>one-time</span>
              </div>
              <button onClick={() => openCheckout("owner")} style={{ padding: "16px 40px", background: colors.primary, color: "#fff", borderRadius: "10px", fontSize: "16px", fontWeight: 700, cursor: "pointer", border: "none", boxShadow: "0 8px 24px rgba(27,94,74,0.22)" }}>
                Unlock Owner Playbook →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ─── FULL CONTENT (when access granted) ─── */}
      {hasAccess && (
        <section style={{ padding: isMobile ? "0 20px 72px" : "0 40px 80px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>

            {/* 1. Full 8-Step Roadmap */}
            <div style={{ background: colors.bgSection, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: isMobile ? "28px 22px" : "40px 48px" }}>
              <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "14px" }}>8-STEP SETUP ROADMAP</div>
              <h2 style={{ fontSize: isMobile ? "22px" : "28px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "24px" }}>From zero to operating — the full sequence.</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { n: 1, title: "Confirm building eligibility", body: "Not all buildings permit short-term rentals. Check with your building management or developer — some master community rules or developer agreements explicitly ban holiday home use. Get written confirmation before spending anything. Buildings in master communities (EMAAR, Nakheel, Damac) often have specific rules." },
                  { n: 2, title: "Prepare ownership documents", body: "You will need: Title Deed (original), owner passport copy, owner Emirates ID (if UAE resident), and a No Objection Certificate (NOC) from the developer if required. Some developers charge for the NOC (AED 500–2,000). Check your developer's process — it can take 5–15 working days." },
                  { n: 3, title: "Apply for the DET Holiday Home Permit", body: "Submit your application through the Dubai Department of Economy and Tourism (DET) portal. You will need: Title Deed, owner ID, building eligibility confirmation, and property photos. The permit costs AED 370–520 per unit depending on size. Processing typically takes 3–7 working days. The permit is valid for one year and must be renewed annually." },
                  { n: 4, title: "Furnish and equip to holiday home standard", body: "Dubai guests expect quality. Minimum requirement: fully equipped kitchen, quality linen, towels, reliable WiFi (100 Mbps+), functioning AC, TV, and a clean, professionally presented space. Typical setup cost: AED 30,000–65,000 for a 1BR–2BR. Avoid cutting corners on photography — the listing photos are your first impression." },
                  { n: 5, title: "Build your pricing strategy", body: "Research comparable listings on Airbnb and Booking.com in your building and community. Set your base nightly rate slightly below peak comps to build early reviews. Use a dynamic pricing tool (Pricelabs or Beyond) to adjust rates automatically for demand, seasonality, and events. Dubai peak season is November–March; summer rates drop 30–45%." },
                  { n: 6, title: "Set up guest operations systems", body: "Create message templates for: booking confirmation, pre-arrival instructions, check-in guide, mid-stay check-in, and checkout reminder. Set up a reliable check-in method (key safe, smart lock, or building concierge). Identify and contract a cleaning team who can turn units on the same day. Build a maintenance contact list for common issues." },
                  { n: 7, title: "Launch on all major platforms", body: "List on Airbnb, Booking.com, and Vrbo as a minimum. Ensure your listing title includes the community name, key view or feature, and unit type. Upload 15–25 high-quality photos. Complete all sections of the listing — incomplete profiles rank lower. Enable Instant Book on Airbnb after you have your first verified review." },
                  { n: 8, title: "Track performance weekly", body: "Review occupancy, ADR (average daily rate), and revenue weekly. Use the GroundWorks Analyzer to benchmark your performance. Monitor review scores — a single 3-star review can drop your ranking significantly. Adjust pricing monthly based on forward demand. Re-photograph the property every 12–18 months." },
                ].map(({ n, title, body }) => (
                  <div key={n} style={{ display: "flex", gap: "18px", padding: "20px", background: colors.bgMain, borderRadius: "12px", border: `1px solid ${colors.border}` }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: colors.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, flexShrink: 0, marginTop: "2px" }}>{n}</div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: colors.textMain, marginBottom: "6px" }}>{title}</div>
                      <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.65, margin: 0 }}>{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Dubai Holiday Home Requirements */}
            <div style={{ background: colors.bgSection, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: isMobile ? "28px 22px" : "40px 48px" }}>
              <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "14px" }}>DET COMPLIANCE</div>
              <h2 style={{ fontSize: isMobile ? "22px" : "28px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "8px" }}>Dubai Holiday Home Requirements</h2>
              <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.6, marginBottom: "24px" }}>Operating a holiday home in Dubai without a valid DET permit is illegal and carries fines of up to AED 50,000. This section covers everything you need to stay compliant.</p>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                {[
                  { title: "Permit Types", items: ["Holiday Home — Entire Unit: for owners renting full property to guests", "Holiday Home — Room: for renting individual rooms (less common)", "Renewal is annual — set a calendar reminder 30 days before expiry", "A separate permit is required per unit — not per owner"] },
                  { title: "Required Documents", items: ["Original Title Deed or copy stamped by DLD", "Owner passport (valid, clear copy)", "Owner Emirates ID (UAE residents) or passport page (overseas owners)", "Developer NOC if required by community rules", "Property photos (interior and exterior)"] },
                  { title: "Permit Fees (2025)", items: ["Studio: AED 370/year", "1 Bedroom: AED 420/year", "2 Bedroom: AED 470/year", "3 Bedroom: AED 520/year", "Renewal: same fees apply annually"] },
                  { title: "Ongoing Compliance", items: ["DET permit must be displayed in the property", "Guest passport/ID must be collected and held for 5 years", "Ejari (tenancy contract) is NOT required for STR", "You must not rent for more than 90 consecutive days to one guest", "Trade licence is not required for individual owners (only for operators)"] },
                ].map(({ title, items }) => (
                  <div key={title} style={{ padding: "20px", background: colors.bgMain, borderRadius: "12px", border: `1px solid ${colors.border}` }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: colors.primary, marginBottom: "12px" }}>{title}</div>
                    {items.map(item => (
                      <div key={item} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start" }}>
                        <IconCheck color={colors.primary} size={15} />
                        <span style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.5 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ padding: "16px 20px", background: "#FEF3E2", borderRadius: "10px", border: "1px solid #E8D9BC", borderLeft: `3px solid ${colors.secondary}` }}>
                <p style={{ fontSize: "13px", color: "#7A5010", margin: 0, lineHeight: 1.6 }}><strong>Developer NOC:</strong> Emaar, Nakheel, and Damac typically require a NOC from their community management team before DET will approve the permit. Allow 5–15 working days and budget AED 500–2,000 for the NOC fee. Some buildings prohibit STR entirely — confirm before applying.</p>
              </div>
            </div>

            {/* 3. Operational Setup */}
            <div style={{ background: colors.bgSection, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: isMobile ? "28px 22px" : "40px 48px" }}>
              <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "14px" }}>OPERATIONS</div>
              <h2 style={{ fontSize: isMobile ? "22px" : "28px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "8px" }}>Operational Setup</h2>
              <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.6, marginBottom: "24px" }}>Your operational setup determines your review score. Poor guest experience is the single biggest reason self-managed STRs underperform.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { title: "Guest Communication System", items: ["Use a template library for every stage: booking confirmed, 3-day pre-arrival, 1-day pre-arrival (with check-in code), mid-stay check-in, checkout reminder", "Response time target: under 1 hour for all enquiries, under 15 minutes during business hours", "Airbnb's algorithm ranks faster-responding hosts higher — enable push notifications on your phone", "Keep a FAQ document in the unit covering WiFi, AC controls, parking, bin locations, and nearest supermarket"] },
                  { title: "Check-In Setup", items: ["Smart lock (August, Yale, Igloohome): best option — code changes per guest, no physical key needed", "Key safe: acceptable fallback — change code between each guest", "Building concierge key collection: use only as last resort — adds friction for late arrivals", "Send check-in instructions 24 hours before arrival, not at booking — guests forget early messages", "Include: door code, parking instructions, AC settings, WiFi password, and your contact number"] },
                  { title: "Cleaning & Linen System", items: ["Use a dedicated holiday home cleaning team — not a general cleaner. They understand standards.", "Standard turnaround: 2–3 hours for 1BR, 3–4 hours for 2BR", "Linen PAR stock: 3 sets per bed minimum (one in use, one clean on standby, one at laundry)", "Post-checkout checklist: all surfaces wiped, fridge emptied, AC set to 24°C, all lights off, towels folded display-style, DET permit visible", "Build a cleaning inspection checklist and have your cleaner sign it off per turn"] },
                  { title: "Maintenance Escalation", items: ["Keep a contacts list for: AC technician, plumber, electrician, locksmith, building management", "For anything requiring building access: submit a maintenance request to building management in writing", "Guest-facing rule: any issue reported by a guest must receive a response within 2 hours and resolution within 24 hours", "Budget AED 1,500–3,000/year per unit for minor maintenance and consumables (light bulbs, batteries, cleaning supplies)"] },
                ].map(({ title, items }) => (
                  <div key={title} style={{ padding: "20px 24px", background: colors.bgMain, borderRadius: "12px", border: `1px solid ${colors.border}` }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: colors.textMain, marginBottom: "12px", paddingBottom: "10px", borderBottom: `1px solid ${colors.border}` }}>{title}</div>
                    {items.map(item => (
                      <div key={item} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start" }}>
                        <IconCheck color={colors.primary} size={15} />
                        <span style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.55 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Technology Stack */}
            <div style={{ background: colors.bgSection, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: isMobile ? "28px 22px" : "40px 48px" }}>
              <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "14px" }}>TECHNOLOGY</div>
              <h2 style={{ fontSize: isMobile ? "22px" : "28px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "8px" }}>Technology Stack & Tools</h2>
              <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.6, marginBottom: "24px" }}>Self-managing 1–8 units without the right tools quickly becomes unmanageable. These are the tools that matter, in order of priority.</p>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
                {[
                  { category: "Property Management System (PMS)", priority: "Essential", tools: [{ name: "Hostaway", note: "Best for 2+ units. Unified inbox, automation, channel sync. ~$50/month." }, { name: "Guesty Lite", note: "Good for 1–3 units. Strong Airbnb integration." }, { name: "Lodgify", note: "Budget-friendly. Better if you want a direct booking website." }] },
                  { category: "Dynamic Pricing", priority: "Essential", tools: [{ name: "Pricelabs", note: "Market standard in Dubai. AI pricing with full manual override. ~$30/month per unit." }, { name: "Beyond Pricing", note: "Strong alternative with good Dubai market data." }, { name: "Airbnb Smart Pricing", note: "Free but often underprices — only use as a fallback." }] },
                  { category: "Smart Access", priority: "High Value", tools: [{ name: "Igloohome", note: "Best for Dubai buildings — works offline, no WiFi required at door." }, { name: "Yale Smart Lock", note: "Widely used, reliable. Requires WiFi." }, { name: "August Smart Lock", note: "Integrates directly with Airbnb for automatic code generation." }] },
                  { category: "Channel Manager", priority: "If on 3+ platforms", tools: [{ name: "Hostaway (built-in)", note: "Manages Airbnb, Booking.com, Vrbo, Agoda from one dashboard." }, { name: "Smoobu", note: "Simpler alternative for small portfolios." }, { name: "iGMS", note: "Good automation features, lower cost than Hostaway." }] },
                  { category: "Financial Tracking", priority: "Required", tools: [{ name: "Google Sheets template", note: "Minimum viable — track revenue, costs, net income per month per unit." }, { name: "Xero", note: "Accounting software if you have 3+ units and want proper P&L." }, { name: "GroundWorks Analyzer", note: "Use to benchmark your actual ADR and occupancy vs. community averages." }] },
                  { category: "Guest Communication", priority: "Time-Saver", tools: [{ name: "WhatsApp Business", note: "Set up automated greeting messages and quick replies." }, { name: "PMS unified inbox", note: "Your PMS should handle all channel messages in one place." }, { name: "Saved replies", note: "Build a library of 15–20 templates covering every common scenario." }] },
                ].map(({ category, priority, tools }) => (
                  <div key={category} style={{ padding: "20px", background: colors.bgMain, borderRadius: "12px", border: `1px solid ${colors.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: colors.textMain }}>{category}</div>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: priority === "Essential" ? colors.primary : colors.secondary, background: priority === "Essential" ? "#E8F5EE" : "#FEF3E2", padding: "3px 8px", borderRadius: "10px" }}>{priority}</span>
                    </div>
                    {tools.map(t => (
                      <div key={t.name} style={{ marginBottom: "8px", paddingBottom: "8px", borderBottom: `1px solid ${colors.border}` }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: colors.textMain }}>{t.name}</div>
                        <div style={{ fontSize: "12px", color: colors.textMuted, marginTop: "2px" }}>{t.note}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Financial Model */}
            <div style={{ background: colors.bgSection, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: isMobile ? "28px 22px" : "40px 48px" }}>
              <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "14px" }}>FINANCIAL MODEL</div>
              <h2 style={{ fontSize: isMobile ? "22px" : "28px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "8px" }}>Financial Tracking Framework</h2>
              <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.6, marginBottom: "24px" }}>Track these monthly — without numbers, you cannot manage a STR business. Use the GroundWorks Analyzer to benchmark your targets before you start.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
                {[
                  { label: "Gross Revenue", formula: "Nightly rate × booked nights", note: "Track per month. Compare to prior year same month." },
                  { label: "Platform Fees", formula: "~3% (Airbnb host fee) + ~15% (Booking.com commission)", note: "Deducted automatically. Factor into your nightly rate setting." },
                  { label: "Cleaning Costs", formula: "Cost per turn × number of stays", note: "Typically AED 150–400 per clean for a 1BR. Charge a cleaning fee to guests." },
                  { label: "Utilities (DEWA + AC + Internet)", formula: "Monthly actuals", note: "Expect AED 600–1,200/month for a 1BR in summer, AED 400–700 in winter." },
                  { label: "Maintenance & Consumables", formula: "AED 100–250/month budget", note: "Track actuals. Set aside a maintenance reserve of 2–3% of annual revenue." },
                  { label: "Furniture Amortisation", formula: "Setup cost ÷ 5 years ÷ 12", note: "A AED 45,000 fit-out = AED 750/month cost. Don't ignore this." },
                  { label: "Net Owner Income", formula: "Gross Revenue − Platform Fees − Cleaning − Utilities − Maintenance − Furniture Amort", note: "This is your actual take-home. Compare to what LTR would pay you annually." },
                ].map(({ label, formula, note }) => (
                  <div key={label} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.2fr 1fr", gap: "12px", padding: "14px 18px", background: colors.bgMain, borderRadius: "10px", border: `1px solid ${colors.border}`, alignItems: "start" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: colors.textMain }}>{label}</div>
                    <div style={{ fontSize: "12.5px", color: colors.primary, fontFamily: "monospace", background: `${colors.primary}0A`, padding: "4px 10px", borderRadius: "6px" }}>{formula}</div>
                    <div style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.5 }}>{note}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "20px", background: "#F0F8F4", borderRadius: "12px", border: "1px solid rgba(27,94,74,0.15)" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: colors.primary, marginBottom: "10px" }}>Key Metrics to Track Monthly</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
                  {[
                    { metric: "ADR", desc: "Average Daily Rate — total revenue ÷ booked nights" },
                    { metric: "Occupancy %", desc: "Booked nights ÷ available nights × 100" },
                    { metric: "RevPAR", desc: "Revenue Per Available Room = ADR × Occupancy" },
                    { metric: "STR vs LTR Delta", desc: "Annual STR net − annual LTR market rent. Must stay positive." },
                  ].map(({ metric, desc }) => (
                    <div key={metric} style={{ padding: "12px 14px", background: colors.bgSection, borderRadius: "8px", border: `1px solid ${colors.border}` }}>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: colors.primary, fontFamily: serifHeading }}>{metric}</div>
                      <div style={{ fontSize: "11.5px", color: colors.textMuted, marginTop: "4px", lineHeight: 1.4 }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. Weekly Operating Workflow */}
            <div style={{ background: colors.bgSection, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: isMobile ? "28px 22px" : "40px 48px" }}>
              <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "14px" }}>WEEKLY RHYTHM</div>
              <h2 style={{ fontSize: isMobile ? "22px" : "28px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "8px" }}>Weekly Operating Workflow</h2>
              <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.6, marginBottom: "24px" }}>Self-management requires a consistent weekly rhythm. Without a routine, things fall through the gaps — and guests notice.</p>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
                {[
                  { day: "Monday", label: "Pricing Review", tasks: ["Check occupancy for next 30 days", "Adjust rates for any gaps (lower price to fill)", "Review Pricelabs suggestions and override if needed", "Check competitor listing prices in your building"] },
                  { day: "Wednesday", label: "Guest Comms Audit", tasks: ["Review all open bookings and send pre-arrival messages due this week", "Respond to any unanswered enquiries", "Check review score on all platforms", "Send post-checkout review request to recent guests (if not automated)"] },
                  { day: "Friday", label: "Upcoming Stay Prep", tasks: ["Confirm weekend check-ins and cleaning slots", "Check cleaning team availability for weekend turns", "Ensure key/access is ready for each arriving guest", "Stock check: toiletries, coffee, tea, cleaning supplies"] },
                  { day: "Monthly", label: "Performance Review", tasks: ["Pull revenue, occupancy, ADR for the month", "Compare to prior month and prior year same month", "Review top-performing and worst-performing weeks — why?", "Update listing photos or description if review scores dropped", "Check DET permit expiry date"] },
                ].map(({ day, label, tasks }) => (
                  <div key={day} style={{ padding: "20px 24px", background: colors.bgMain, borderRadius: "12px", border: `1px solid ${colors.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                      <div style={{ padding: "4px 12px", background: colors.primary, color: "#fff", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>{day}</div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: colors.textMain }}>{label}</div>
                    </div>
                    {tasks.map(t => (
                      <div key={t} style={{ display: "flex", gap: "8px", marginBottom: "7px", alignItems: "flex-start" }}>
                        <IconCheck color={colors.secondary} size={14} />
                        <span style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.5 }}>{t}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Common Mistakes */}
            <div style={{ background: colors.bgSection, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: isMobile ? "28px 22px" : "40px 48px" }}>
              <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "14px" }}>AVOID THESE</div>
              <h2 style={{ fontSize: isMobile ? "22px" : "28px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "24px" }}>Common Mistakes & How to Avoid Them</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { mistake: "Setting a flat rate year-round", why: "Dubai has extreme seasonality — winter peak vs. summer low. A flat rate means you lose money in winter (underpriced) and have zero bookings in summer (overpriced). Use dynamic pricing from day one.", fix: "Install Pricelabs or Beyond in week one. Never use a flat rate." },
                  { mistake: "Poor listing photos", why: "Airbnb's algorithm surfaces listings with professional photos 40% more often. Guests decide in under 8 seconds based on the cover photo. A AED 500 photography session pays for itself in the first booking.", fix: "Hire a professional holiday home photographer before launching. Retake photos annually." },
                  { mistake: "Slow response times", why: "Airbnb's algorithm penalises response times over 1 hour with lower ranking. Enquiries often go to the fastest responder, not the best property.", fix: "Enable push notifications. Use Airbnb's Quick Reply feature. Target sub-30 minute response times." },
                  { mistake: "Using a regular house cleaner instead of an STR cleaner", why: "STR turnarounds require a specific checklist, specific timing, and knowledge of what guests notice. Regular cleaners miss items — stained pillowcases, soap scum, fingerprints on mirrors — that guests photograph and put in reviews.", fix: "Contract a cleaning company that specialises in holiday homes in Dubai. Expect to pay AED 150–400 per turn for a 1BR." },
                  { mistake: "Ignoring the DET permit renewal", why: "Operating without a valid permit carries fines up to AED 50,000. DET does conduct spot checks. The permit is only valid for 12 months.", fix: "Set a calendar reminder 45 days before the permit expiry date. Renew online via the DET portal." },
                  { mistake: "Not collecting guest ID", why: "It is a legal requirement in Dubai to collect a copy of the guest's passport or Emirates ID and retain it for 5 years. Failure to comply risks your permit.", fix: "Make ID collection part of your pre-arrival process. Many PMS tools automate this via guest verification flows." },
                  { mistake: "Over-investing in setup before verifying demand", why: "A AED 80,000 fit-out on a unit that achieves 40% occupancy due to poor location or STR-unfriendly building rules is a loss. Validate first.", fix: "Use the GroundWorks Analyzer to estimate realistic revenue before committing to the setup. Confirm building permit first." },
                ].map(({ mistake, why, fix }, i) => (
                  <div key={i} style={{ padding: "20px 24px", background: colors.bgMain, borderRadius: "12px", border: `1px solid ${colors.border}`, borderLeft: "3px solid #C75A5A" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#B03030", marginBottom: "8px" }}>✕ {mistake}</div>
                    <div style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.55, marginBottom: "10px" }}><strong style={{ color: colors.textMain }}>Why it hurts:</strong> {why}</div>
                    <div style={{ fontSize: "13px", color: "#1B5E4A", lineHeight: 1.55, padding: "10px 14px", background: "#F0F8F4", borderRadius: "8px" }}><strong>Fix:</strong> {fix}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 8. Readiness Score */}
            <ReadinessScore isMobile={isMobile} colors={colors} serifHeading={serifHeading} />

          </div>
        </section>
      )}

      {/* ─── BUNDLE SECTION ─── */}
      <section style={{ padding: isMobile ? "52px 20px" : "72px 40px", background: colors.bgSection, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div style={{ background: `linear-gradient(145deg, #FAFAF8 0%, #F4F0E8 100%)`, borderRadius: "20px", border: `1px solid ${colors.border}`, padding: isMobile ? "32px 22px" : "44px 52px", display: "flex", flexDirection: isMobile ? "column" : "row", gap: "32px", alignItems: isMobile ? "flex-start" : "center" }}>
            <div style={{ flex: 1 }}>
              <IconBundle size={32} />
              <h2 style={{ fontSize: isMobile ? "22px" : "28px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, margin: "14px 0 10px" }}>Want Both Playbooks?</h2>
              <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.65, marginBottom: "10px" }}>
                Get access to both the Owner Self-Management Playbook and the STR Sub-Leasing Playbook. Useful if you are deciding between owning and sub-leasing, or plan to do both.
              </p>
              <div style={{ fontSize: "13px", color: colors.secondary, fontWeight: 600 }}>Saves AED 99 compared to buying separately</div>
            </div>
            <div style={{ flexShrink: 0, textAlign: isMobile ? "left" : "right" }}>
              <div style={{ fontSize: "11px", color: colors.textMuted, marginBottom: "4px" }}>Bundle price</div>
              <div style={{ fontSize: "38px", fontWeight: 700, color: colors.textMain, fontFamily: serifHeading, marginBottom: "4px" }}>{BUNDLE_PRICE}</div>
              <div style={{ fontSize: "13px", color: colors.textMuted, textDecoration: "line-through", marginBottom: "16px" }}>AED 498 separately</div>
              <button onClick={() => openCheckout("bundle")} style={{ padding: "14px 28px", background: colors.secondary, color: "#fff", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", border: "none", whiteSpace: "nowrap" }}>
                Unlock Bundle →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ACCOUNT MANAGER UPSELL ─── */}
      <section id="setup" style={{ padding: isMobile ? "52px 20px" : "72px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ background: colors.bgSection, borderRadius: "20px", border: `1px solid ${colors.border}`, padding: isMobile ? "32px 22px" : "48px 56px", display: "flex", flexDirection: isMobile ? "column" : "row", gap: "36px", alignItems: isMobile ? "flex-start" : "center", boxShadow: colors.shadowSm }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "14px" }}>OPTIONAL SERVICE</div>
              <h2 style={{ fontSize: isMobile ? "22px" : "28px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "14px" }}>Want GroundWorks To Set This Up With You?</h2>
              <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.65, marginBottom: "16px" }}>Our account manager can help structure your tools, pricing strategy, guest communication workflows, cleaning systems, and launch roadmap — tailored to your specific units.</p>
              <div style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6 }}>
                This is a separate, optional service. The playbook gives you the full framework to do it yourself — setup support is for owners who want guided implementation.
              </div>
            </div>
            <div style={{ flexShrink: 0 }}>
              <div style={{ background: colors.bgMain, borderRadius: "16px", border: `1px solid ${colors.border}`, padding: "28px 32px", textAlign: "center", minWidth: "220px" }}>
                <div style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "4px" }}>Self-Manage Setup Support</div>
                <div style={{ fontSize: "32px", fontWeight: 700, color: colors.primary, fontFamily: serifHeading, marginBottom: "2px" }}>AED 2,500</div>
                <div style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "20px" }}>Starting from</div>
                <a
                  href={`/contact?service=self-manage-setup`}
                  style={{ display: "block", padding: "13px 20px", background: colors.primary, color: "#fff", borderRadius: "10px", fontSize: "14px", fontWeight: 700, textDecoration: "none" }}
                >
                  Request Setup Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: colors.bgSection, borderTop: `1px solid ${colors.border}`, padding: "40px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <GroundWorksLogo size={32} />
            <span style={{ fontSize: "14px", color: colors.textMuted }}>GroundWorks — Dubai Rental Intelligence</span>
          </div>
          <div style={{ fontSize: "13px", color: colors.textMuted }}>© {new Date().getFullYear()} GroundWorks. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
