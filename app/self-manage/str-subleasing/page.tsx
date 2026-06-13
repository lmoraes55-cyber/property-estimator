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
const IconWarning = ({ color = "#A37020", size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 3L22 20H2L12 3Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /><path d="M12 10V14" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><circle cx="12" cy="17.5" r="0.8" fill={color} /></svg>
);
const IconBuilding = ({ color = colors.secondary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M6 28V11L16 5L26 11V28" {...sk(color)} /><rect x="12" y="19" width="8" height="9" rx="1" {...sk(color)} /><rect x="9" y="14" width="4" height="4" rx="0.5" {...sk(color)} /><rect x="19" y="14" width="4" height="4" rx="0.5" {...sk(color)} /></svg>
);
const IconBundle = ({ color = colors.secondary, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><rect x="4" y="10" width="10" height="14" rx="1.5" {...sk(color)} /><rect x="18" y="10" width="10" height="14" rx="1.5" {...sk(color)} /><path d="M14 14H18" {...sk(color)} /><path d="M14 18H18" {...sk(color)} /></svg>
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
        <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "14px" }}>GROUNDWORKS</div>
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

// ─── Locked Section ───────────────────────────────────────────────────────────
function LockedSection({ title, contents, price, onUnlock }: { title: string; contents: string[]; price: string; onUnlock: () => void }) {
  return (
    <div style={{ background: colors.bgSection, borderRadius: "16px", border: `1px solid ${colors.border}`, overflow: "hidden", boxShadow: colors.shadowSm }}>
      <div style={{ padding: "24px 28px", borderBottom: `1px solid ${colors.border}`, filter: "blur(4px)", pointerEvents: "none", userSelect: "none", opacity: 0.55 }}>
        {contents.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: i < contents.length - 1 ? `1px solid ${colors.border}` : "none" }}>
            <IconCheck color={colors.secondary} />
            <span style={{ fontSize: "14px", color: colors.textMain }}>{c}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "28px", background: "linear-gradient(to bottom, rgba(250,250,248,0.0) 0%, rgba(250,250,248,1) 100%)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "14px", marginTop: "-40px", paddingTop: "0" }}>
        <div style={{ background: "#fff", borderRadius: "16px", border: `1px solid ${colors.border}`, padding: "28px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.09)", maxWidth: "380px", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}><IconLock size={28} /></div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: colors.secondary, letterSpacing: "0.1em", marginBottom: "8px" }}>LOCKED SECTION</div>
          <p style={{ fontSize: "14px", color: colors.textMain, fontWeight: 600, marginBottom: "6px" }}>{title}</p>
          <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "18px", lineHeight: 1.5 }}>Unlock the full STR Sub-Leasing Playbook to access this section.</p>
          <button onClick={onUnlock} style={{ width: "100%", padding: "12px", background: colors.secondary, color: "#fff", borderRadius: "9px", fontSize: "14px", fontWeight: 700, cursor: "pointer", border: "none" }}>
            Unlock for {price}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "44px", textAlign: "center" }}>
      <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>{label}</div>
      <h2 style={{ fontSize: "34px", fontFamily: serifHeading, fontWeight: 700, marginBottom: "12px", background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{title}</h2>
      {subtitle && <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.65, maxWidth: "580px", margin: "0 auto" }}>{subtitle}</p>}
    </div>
  );
}

const PRICE = "AED 299";
const BUNDLE_PRICE = "AED 399";

const PRODUCTS: Record<string, Product> = {
  subleasing: { name: "STR Sub-Leasing Playbook", price: PRICE, amount: 299 },
  bundle: { name: "Bundle — Both Playbooks", price: BUNDLE_PRICE, amount: 399 },
};

export default function STRSubleasingPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [hasAccess, setHasAccess] = useState(false);
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
              <a style={{ color: colors.secondary, fontSize: "15px", fontWeight: 600 }}>Sub-Leasing Playbook</a>
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
            <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.14em", marginBottom: "16px" }}>STR SUB-LEASING PLAYBOOK</div>
            <h1 style={{ fontSize: isMobile ? "32px" : "48px", fontFamily: serifHeading, fontWeight: 700, lineHeight: 1.15, marginBottom: "20px", background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Build a Short-Term Rental Business Without Owning Property
            </h1>
            <p style={{ fontSize: "16px", color: colors.textMuted, lineHeight: 1.65, marginBottom: "32px", maxWidth: "520px" }}>
              A practical roadmap for entrepreneurs who want to source safer units, secure landlord approval, calculate profitability, and reduce risk before signing leases.
            </p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              {!hasAccess && (
                <button onClick={() => openCheckout("subleasing")} style={{ padding: "14px 28px", background: colors.secondary, color: "#fff", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: "pointer", border: "none", boxShadow: "0 6px 20px rgba(184,138,68,0.22)" }}>
                  Unlock Sub-Leasing Playbook — {PRICE}
                </button>
              )}
              <a href="#contents" style={{ padding: "14px 24px", background: "transparent", color: colors.secondary, border: `2px solid ${colors.secondary}`, borderRadius: "10px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}>
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
            <div id="contents" style={{ background: colors.bgMain, borderRadius: "18px", border: `1.5px solid rgba(184,138,68,0.4)`, padding: "28px", boxShadow: "0 8px 32px rgba(184,138,68,0.08)" }}>
              <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "16px" }}>WHAT&apos;S INCLUDED</div>
              {[
                "Unit selection framework",
                "Area & building risk scoring",
                "Legal & permit checklist",
                "Financial model & break-even",
                "Landlord negotiation guide",
                "10-step setup roadmap",
                "Operating requirements",
                "Common mistakes & red flags",
                "Sub-leasing readiness score",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: `1px solid ${colors.border}` }}>
                  <IconCheck color={colors.secondary} />
                  <span style={{ fontSize: "13px", color: colors.textMuted }}>{item}</span>
                </div>
              ))}
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <div style={{ fontSize: "34px", fontWeight: 700, color: colors.textMain, fontFamily: serifHeading }}>{PRICE}</div>
                <div style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "16px" }}>One-time access</div>
                {!hasAccess ? (
                  <button onClick={() => openCheckout("subleasing")} style={{ width: "100%", padding: "13px", background: colors.secondary, color: "#fff", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", border: "none" }}>
                    Unlock Sub-Leasing Playbook
                  </button>
                ) : (
                  <div style={{ padding: "12px", background: "#F0F8F4", borderRadius: "10px", fontSize: "14px", fontWeight: 600, color: colors.primary }}>Access Active</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FREE: WHAT IS SUB-LEASING ─── */}
      <section style={{ padding: isMobile ? "52px 20px" : "72px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <SectionHeading label="THE MODEL" title="What Is STR Sub-Leasing?" />
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "40px", alignItems: "flex-start" }}>
            {/* Flow diagram */}
            <div style={{ flexShrink: 0, width: isMobile ? "100%" : "230px" }}>
              <div style={{ background: colors.bgSection, borderRadius: "16px", border: `1px solid ${colors.border}`, padding: "24px 20px" }}>
                {[
                  { label: "Landlord", sub: "Owns the property", color: colors.primary },
                  null,
                  { label: "STR Operator", sub: "Rents & operates", color: colors.secondary },
                  null,
                  { label: "Holiday Home Permit", sub: "DET registration", color: colors.primary },
                  null,
                  { label: "Guest Bookings", sub: "Platforms / Direct", color: colors.secondary },
                  null,
                  { label: "Profit / Loss", sub: "Revenue minus all costs", color: colors.primary },
                ].map((item, i) =>
                  item === null ? (
                    <div key={i} style={{ display: "flex", justifyContent: "center", padding: "5px 0" }}><IconArrow /></div>
                  ) : (
                    <div key={i} style={{ textAlign: "center", padding: "10px 14px", background: `${item.color}0D`, borderRadius: "9px", border: `1px solid ${item.color}22` }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: item.color }}>{item.label}</div>
                      <div style={{ fontSize: "11px", color: colors.textMuted, marginTop: "2px" }}>{item.sub}</div>
                    </div>
                  )
                )}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "16px", color: colors.textMain, lineHeight: 1.7, marginBottom: "18px" }}>
                STR sub-leasing is when an entrepreneur rents a property from a landlord and, with written approval and the required DET permit, operates it as a short-term holiday home generating nightly revenue from guests.
              </p>
              <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "24px" }}>
                The operator pays a fixed monthly rent regardless of guest bookings. Revenue from guest stays must cover rent, all operating costs, setup cost recovery, and produce net profit. The gap between fixed rent and variable STR income is the central risk of this model.
              </p>
              <div style={{ padding: "20px 22px", background: "#FFFBF5", borderRadius: "12px", border: "1px solid #E8D9BC", borderLeft: `3px solid ${colors.secondary}` }}>
                <p style={{ fontSize: "14px", color: colors.textMain, lineHeight: 1.65, margin: 0 }}>
                  <strong style={{ color: "#8A6020" }}>Key principle:</strong> This model can work, but only when the unit is selected carefully, landlord approval is secured in writing, cost structure is controlled, and expected STR revenue comfortably exceeds fixed rent across both high and low season.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FREE: IS THIS RIGHT FOR YOU ─── */}
      <section style={{ padding: isMobile ? "0 20px 52px" : "0 40px 72px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <SectionHeading label="SUITABILITY" title="Is STR Sub-Leasing Right For You?" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "22px" }}>
            {[
              { icon: <IconCheck color={colors.primary} size={22} />, title: "Best For", text: "Entrepreneurs who can handle guest communication, pricing, cleaning coordination, maintenance oversight, and monthly cash-flow risk without a guaranteed income floor.", accent: colors.primary },
              { icon: <IconWarning size={22} />, title: "Not Ideal For", text: "Anyone seeking passive income, people with limited or no cash buffer, or those unwilling to manage guests and operational issues every day of the week.", accent: "#A14B3D" },
              { icon: <IconBuilding size={22} />, title: "GroundWorks View", text: "Sub-leasing can scale faster than ownership, but risk is structurally higher because rent is fixed while STR income is seasonal, variable, and platform-dependent.", accent: colors.secondary },
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

      {/* ─── FREE: RISK OVERVIEW ─── */}
      <section style={{ padding: isMobile ? "0 20px 52px" : "0 40px 72px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ background: colors.bgSection, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: isMobile ? "28px 22px" : "40px 48px" }}>
            <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "14px" }}>HIGH-LEVEL RISK OVERVIEW</div>
            <h2 style={{ fontSize: isMobile ? "22px" : "28px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "22px" }}>Three risk levels — before you commit to a unit.</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "22px" }}>
              <div style={{ background: "#F0F8F4", borderRadius: "12px", border: "1px solid #B3D4C8", borderTop: `3px solid ${colors.primary}`, padding: "20px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: colors.primary, marginBottom: "8px" }}>Low Risk</div>
                <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6 }}>Strong STR demand, reasonable rent, low setup cost, clear approval route, stable occupancy year-round.</p>
              </div>
              <div style={{ background: "#FFFBF0", borderRadius: "12px", border: "1px solid #E8D89A", borderTop: "3px solid #C9A020", padding: "20px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#8A7020", marginBottom: "8px" }}>Medium Risk</div>
                <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6 }}>Good potential but higher rent pressure, seasonal demand, or operational complexity requiring stronger management.</p>
              </div>
              <div style={{ background: "#FDF3F2", borderRadius: "12px", border: "1px solid #E8C3BF", borderTop: "3px solid #A14B3D", padding: "20px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#A14B3D", marginBottom: "8px" }}>High Risk</div>
                <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6 }}>High fixed rent, weak tourist demand, difficult approvals, poor access, or uncertain guest appeal.</p>
              </div>
            </div>
            <div style={{ padding: "14px 18px", background: "#FFFBF5", borderRadius: "10px", border: "1px solid #E8D9BC", display: "flex", alignItems: "center", gap: "12px" }}>
              <IconLock size={18} />
              <p style={{ fontSize: "13px", color: "#8A6020", margin: 0 }}>The full area & building risk scoring framework — and how to calculate which category any unit falls into — is in the paid playbook.</p>
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
              <p style={{ fontSize: "15px", color: colors.textMuted, maxWidth: "520px", margin: "0 auto" }}>The following sections are included in the full STR Sub-Leasing Playbook.</p>
            </div>
            <LockedSection title="Minimum-Risk Unit & Area Estimator" price={PRICE} onUnlock={() => openCheckout("subleasing")} contents={["Area demand scoring", "Rent-to-revenue ratio check", "Break-even occupancy calculator", "Risk level output", "Proceed / Negotiate / Avoid recommendation"]} />
            <LockedSection title="Safe Unit Selection Framework" price={PRICE} onUnlock={() => openCheckout("subleasing")} contents={["Rent-to-revenue gap analysis", "Building demand criteria", "Unit type guidelines", "Access & guest experience check", "Furnishing cost threshold", "Exit flexibility requirement"]} />
            <LockedSection title="Area & Building Risk Scoring" price={PRICE} onUnlock={() => openCheckout("subleasing")} contents={["STR demand score method", "Rent pressure score", "Occupancy stability check", "Guest appeal factors", "Operational ease scoring", "Downside risk calculation"]} />
            <LockedSection title="Legal & Approval Requirements" price={PRICE} onUnlock={() => openCheckout("subleasing")} contents={["Written approval checklist", "DET permit process", "Required documents list", "Ejari and contract wording", "Trade licence considerations", "Compliance maintenance"]} />
            <LockedSection title="Financial Model & Break-Even Logic" price={PRICE} onUnlock={() => openCheckout("subleasing")} contents={["Revenue tracking framework", "Fixed and variable cost breakdown", "Setup cost payback calculator", "Break-even occupancy formula", "Minimum cash buffer guidance", "Low-season stress test method"]} />
            <LockedSection title="Landlord Negotiation Framework" price={PRICE} onUnlock={() => openCheckout("subleasing")} contents={["Full negotiation checklist", "Contract wording guidance", "Approval terms to secure", "Exit clause requirements", "Maintenance and utility terms"]} />
            <LockedSection title="10-Step Setup Roadmap" price={PRICE} onUnlock={() => openCheckout("subleasing")} contents={["Target area selection", "Unit sourcing criteria", "Break-even check process", "Landlord approval sequence", "Permit and furnishing steps", "Listing launch and monitoring"]} />
            <LockedSection title="Operating Requirements" price={PRICE} onUnlock={() => openCheckout("subleasing")} contents={["Guest communication system", "Cleaning & linen process", "Maintenance escalation", "Pricing management cadence", "Access management setup", "Monthly cash-flow tracking"]} />
            <LockedSection title="Common Mistakes & Red Flags" price={PRICE} onUnlock={() => openCheckout("subleasing")} contents={["10 most common sub-leasing failures", "How each mistake happens", "How to avoid each one before committing", "Red flags to identify during sourcing"]} />
            <LockedSection title="Sub-Leasing Readiness Score" price={PRICE} onUnlock={() => openCheckout("subleasing")} contents={["Interactive readiness checklist (10 items)", "Score interpretation guide", "Next-step recommendation by score", "When to delay vs. proceed"]} />

            {/* Unlock CTA */}
            <div style={{ background: colors.bgSection, borderRadius: "18px", border: `1.5px solid ${colors.secondary}`, padding: isMobile ? "28px 22px" : "40px", textAlign: "center", boxShadow: "0 8px 32px rgba(184,138,68,0.08)" }}>
              <IconLock color={colors.secondary} size={32} />
              <h3 style={{ fontSize: "24px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, margin: "16px 0 10px" }}>Unlock the Full STR Sub-Leasing Playbook</h3>
              <p style={{ fontSize: "15px", color: colors.textMuted, marginBottom: "28px", maxWidth: "480px", margin: "0 auto 28px" }}>One-time access. All frameworks, checklists, risk scoring, financial model, and readiness score included.</p>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <span style={{ fontSize: "38px", fontWeight: 700, color: colors.textMain, fontFamily: serifHeading }}>{PRICE}</span>
                <span style={{ fontSize: "14px", color: colors.textMuted }}>one-time</span>
              </div>
              <button onClick={() => openCheckout("subleasing")} style={{ padding: "16px 40px", background: colors.secondary, color: "#fff", borderRadius: "10px", fontSize: "16px", fontWeight: 700, cursor: "pointer", border: "none", boxShadow: "0 8px 24px rgba(184,138,68,0.22)" }}>
                Unlock Sub-Leasing Playbook →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ─── FULL CONTENT (when access granted) ─── */}
      {hasAccess && (
        <section style={{ padding: isMobile ? "0 20px 72px" : "0 40px 80px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ padding: "24px 28px", background: "#F0F8F4", borderRadius: "14px", border: "1px solid rgba(27,94,74,0.2)", marginBottom: "40px", display: "flex", alignItems: "center", gap: "14px" }}>
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8.5" stroke={colors.primary} strokeWidth="1.2" opacity="0.4" /><path d="M6.5 10L9 12.5L13.5 7.5" stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: colors.primary }}>Full playbook access is active.</div>
                <div style={{ fontSize: "13px", color: colors.textMuted }}>All sections, frameworks, and the readiness score are available below.</div>
              </div>
            </div>
            <p style={{ fontSize: "15px", color: colors.textMuted, textAlign: "center" }}>Full playbook content renders here when connected to payment and access verification.</p>
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
                Get access to both the Owner Self-Management Playbook and the STR Sub-Leasing Playbook. Useful if you are deciding between the two paths or plan to explore both.
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
      <section style={{ padding: isMobile ? "52px 20px" : "72px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ background: colors.bgSection, borderRadius: "20px", border: `1px solid ${colors.border}`, padding: isMobile ? "32px 22px" : "48px 56px", display: "flex", flexDirection: isMobile ? "column" : "row", gap: "36px", alignItems: isMobile ? "flex-start" : "center", boxShadow: colors.shadowSm }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "14px" }}>OPTIONAL SERVICE</div>
              <h2 style={{ fontSize: isMobile ? "22px" : "28px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "14px" }}>Want GroundWorks To Help You Build Your Sub-Leasing Setup?</h2>
              <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.65, marginBottom: "16px" }}>Our account manager can help with area selection, unit screening, break-even analysis, landlord negotiation checklist, permit application guidance, and launch planning.</p>
              <div style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6 }}>
                This is a separate, optional service. The playbook gives you the full framework to do it yourself — setup support is for entrepreneurs who want guided implementation.
              </div>
            </div>
            <div style={{ flexShrink: 0 }}>
              <div style={{ background: colors.bgMain, borderRadius: "16px", border: `1px solid ${colors.border}`, padding: "28px 32px", textAlign: "center", minWidth: "220px" }}>
                <div style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "4px" }}>STR Sub-Leasing Setup Support</div>
                <div style={{ fontSize: "32px", fontWeight: 700, color: colors.secondary, fontFamily: serifHeading, marginBottom: "2px" }}>AED 5,000</div>
                <div style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "20px" }}>Starting from</div>
                <a
                  href={`/contact?service=subleasing-setup`}
                  style={{ display: "block", padding: "13px 20px", background: colors.secondary, color: "#fff", borderRadius: "10px", fontSize: "14px", fontWeight: 700, textDecoration: "none" }}
                >
                  Request Sub-Leasing Setup
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
