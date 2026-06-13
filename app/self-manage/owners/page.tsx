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

const PRODUCTS: Record<string, Product> = {
  owner: { name: "Owner Self-Management Playbook", price: PRICE, amount: 199 },
  bundle: { name: "Bundle — Both Playbooks", price: BUNDLE_PRICE, amount: 399 },
};

export default function OwnersPage() {
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
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ padding: "24px 28px", background: "#F0F8F4", borderRadius: "14px", border: "1px solid rgba(27,94,74,0.2)", marginBottom: "40px", display: "flex", alignItems: "center", gap: "14px" }}>
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8.5" stroke={colors.primary} strokeWidth="1.2" opacity="0.4" /><path d="M6.5 10L9 12.5L13.5 7.5" stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: colors.primary }}>Full playbook access is active.</div>
                <div style={{ fontSize: "13px", color: colors.textMuted }}>All sections, checklists, and frameworks are available below.</div>
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
