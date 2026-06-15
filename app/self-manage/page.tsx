"use client";

import React from "react";
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

export default function SelfManagePage() {
  const router = useRouter();
  const isMobile = useIsMobile();

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh" }}>

      {/* ─── HEADER ─── */}
      <header style={{ background: colors.bgSection, borderBottom: `1px solid ${colors.border}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: isMobile ? "14px 20px" : "16px 40px", display: "flex", alignItems: "center", justifyContent: isMobile ? "space-between" : "flex-start", gap: isMobile ? "12px" : "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => router.push("/")}>
            <GroundWorksLogo size={40} />
            <div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: colors.textMain }}>Ground<span style={{ color: colors.primary }}>Works</span></div>
              <div style={{ fontSize: "10px", color: colors.textMuted, letterSpacing: "0.1em" }}>RENTAL INTELLIGENCE</div>
            </div>
          </div>
          {isMobile && (
            <a href="#pricing" style={{ padding: "9px 16px", background: colors.secondary, color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>View Pricing</a>
          )}
          <nav style={{ display: isMobile ? "none" : "flex", gap: "40px", flex: 1 }}>
            <a onClick={() => router.push("/")} style={{ cursor: "pointer", color: colors.textMuted, fontSize: "15px", fontWeight: 500 }}>Home</a>
            <a onClick={() => router.push("/#services")} style={{ cursor: "pointer", color: colors.textMuted, fontSize: "15px", fontWeight: 500 }}>Services</a>
            <a style={{ color: colors.primary, fontSize: "15px", fontWeight: 600 }}>Self-Manage</a>
            <a href="#pricing" style={{ cursor: "pointer", color: colors.textMuted, fontSize: "15px", fontWeight: 500 }}>Pricing</a>
            <a onClick={() => router.push("/estimator")} style={{ cursor: "pointer", color: colors.textMuted, fontSize: "15px", fontWeight: 500 }}>Analyzer</a>
          </nav>
        </div>
      </header>

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
            <PlaybookCard
              icon={<IconSubLease color={colors.secondary} />}
              eyebrow="8+ UNITS"
              title="Self-Manage — Growing Portfolio"
              description="For owners scaling beyond 8 units who need professional systems, automation, and operational frameworks to manage a growing portfolio without the cost of a full management company."
              price="AED 499"
              accent={colors.secondary}
              includes={["Portfolio operations framework", "PMS & automation setup", "Team & process structure", "Multi-unit pricing strategy", "Financial reporting system", "Scaling roadmap", "Common scaling mistakes", "Portfolio readiness score"]}
              cta="View Portfolio Playbook"
              href="/self-manage/owners"
            />
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" style={{ padding: isMobile ? "52px 20px" : "80px 40px", background: colors.bgSection, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <SectionHeading label="PRICING" title="Structured Access. One-Time Fee." subtitle="Pay once, access the full playbook. No subscription, no recurring charges." />

          {/* Three product cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "22px", marginBottom: "44px" }}>
            {/* Owner Playbook */}
            <div style={{ background: colors.bgMain, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: "28px", boxShadow: colors.shadowSm, display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: "18px" }}><IconOwner color={colors.primary} /></div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: colors.primary, letterSpacing: "0.12em", marginBottom: "8px" }}>OWNER SELF-MANAGEMENT</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "6px" }}>
                <span style={{ fontSize: "32px", fontWeight: 700, color: colors.textMain, fontFamily: serifHeading }}>AED 199</span>
              </div>
              <div style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "20px" }}>One-time access</div>
              {["8-step setup roadmap", "DET permit checklist", "Ops & tech guide", "Financial model", "Readiness score"].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 0", borderBottom: `1px solid ${colors.border}` }}>
                  <IconCheck color={colors.primary} />
                  <span style={{ fontSize: "13.5px", color: colors.textMuted }}>{f}</span>
                </div>
              ))}
              <a href="/self-manage/owners" style={{ marginTop: "22px", padding: "13px", background: colors.primary, color: "#fff", borderRadius: "10px", fontSize: "14px", fontWeight: 700, textDecoration: "none", textAlign: "center" }}>Unlock Owner Playbook →</a>
            </div>

            {/* Sub-Leasing Playbook */}
            <div style={{ background: colors.bgMain, borderRadius: "18px", border: `1.5px solid ${colors.secondary}`, padding: "28px", boxShadow: "0 8px 32px rgba(184,138,68,0.10)", display: "flex", flexDirection: "column", position: "relative" }}>
              <span style={{ position: "absolute", top: "-11px", left: "22px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff", background: colors.secondary, padding: "3px 12px", borderRadius: "999px" }}>Most comprehensive</span>
              <div style={{ marginBottom: "18px" }}><IconSubLease color={colors.secondary} /></div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: colors.secondary, letterSpacing: "0.12em", marginBottom: "8px" }}>STR SUB-LEASING</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "6px" }}>
                <span style={{ fontSize: "32px", fontWeight: 700, color: colors.textMain, fontFamily: serifHeading }}>AED 299</span>
              </div>
              <div style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "20px" }}>One-time access</div>
              {["Unit selection framework", "Area risk scoring", "Break-even model", "Landlord negotiation guide", "10-step launch roadmap"].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 0", borderBottom: `1px solid ${colors.border}` }}>
                  <IconCheck color={colors.secondary} />
                  <span style={{ fontSize: "13.5px", color: colors.textMuted }}>{f}</span>
                </div>
              ))}
              <a href="/self-manage/str-subleasing" style={{ marginTop: "22px", padding: "13px", background: colors.secondary, color: "#fff", borderRadius: "10px", fontSize: "14px", fontWeight: 700, textDecoration: "none", textAlign: "center" }}>Unlock Sub-Leasing Playbook →</a>
            </div>

            {/* Bundle */}
            <div style={{ background: `linear-gradient(145deg, #FAFAF8 0%, #F4F0E8 100%)`, borderRadius: "18px", border: `1px solid ${colors.border}`, padding: "28px", boxShadow: colors.shadowSm, display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: "18px" }}><IconBundle /></div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: colors.textMuted, letterSpacing: "0.12em", marginBottom: "8px" }}>BUNDLE — BOTH PLAYBOOKS</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "4px" }}>
                <span style={{ fontSize: "32px", fontWeight: 700, color: colors.textMain, fontFamily: serifHeading }}>AED 399</span>
                <span style={{ fontSize: "13px", color: colors.textMuted, textDecoration: "line-through" }}>AED 498</span>
              </div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: colors.secondary, marginBottom: "20px" }}>Save AED 99 vs buying separately</div>
              {["Owner Self-Management Playbook", "STR Sub-Leasing Playbook", "All frameworks, checklists & models", "Readiness scores for both paths"].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 0", borderBottom: `1px solid ${colors.border}` }}>
                  <IconCheck color={colors.secondary} />
                  <span style={{ fontSize: "13.5px", color: colors.textMuted }}>{f}</span>
                </div>
              ))}
              <a href="/self-manage/owners" style={{ marginTop: "22px", padding: "13px", background: "transparent", color: colors.secondary, border: `2px solid ${colors.secondary}`, borderRadius: "10px", fontSize: "14px", fontWeight: 700, textDecoration: "none", textAlign: "center" }}>Unlock Bundle →</a>
            </div>
          </div>

          {/* Setup support note */}
          <div style={{ background: colors.bgMain, borderRadius: "16px", border: `1px solid ${colors.border}`, padding: isMobile ? "24px 20px" : "30px 36px", display: "flex", flexDirection: isMobile ? "column" : "row", gap: "24px", alignItems: isMobile ? "flex-start" : "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: colors.primary, letterSpacing: "0.12em", marginBottom: "8px" }}>ACCOUNT MANAGER SETUP SUPPORT</div>
              <h3 style={{ fontSize: "18px", fontFamily: serifHeading, fontWeight: 700, color: colors.textMain, marginBottom: "8px" }}>Want GroundWorks To Help You Build The Setup?</h3>
              <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.6 }}>After unlocking a playbook, you can request a dedicated account manager to help implement the systems, pricing, tools, and launch workflow.</p>
            </div>
            <div style={{ flexShrink: 0, textAlign: isMobile ? "left" : "right" }}>
              <div style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "4px" }}>Setup support from</div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: colors.primary, fontFamily: serifHeading, marginBottom: "12px" }}>AED 2,500</div>
              <a href="/self-manage/owners#setup" style={{ display: "inline-block", padding: "12px 24px", background: colors.primary, color: "#fff", borderRadius: "9px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>Learn More</a>
            </div>
          </div>

          <p style={{ fontSize: "12px", color: colors.textMuted, textAlign: "center", marginTop: "24px" }}>
            All prices in AED. One-time access fee per playbook. Setup support is a separate optional service.
          </p>
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
