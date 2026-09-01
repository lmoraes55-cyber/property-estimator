"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/lib/useIsMobile";
import SiteNav from "@/components/SiteNav";
import DecorativeBackdrop from "@/components/DecorativeBackdrop";
import HomeHero from "@/components/home/HomeHero";
import WhyAssetIntel from "@/components/home/WhyAssetIntel";
import ProductShowcase from "@/components/home/ProductShowcase";
import PlatformToolGrid from "@/components/home/PlatformToolGrid";
import HowSTRWorksSection from "@/components/home/HowSTRWorksSection";
import SocialProof from "@/components/home/SocialProof";
import FinalHomeCTA from "@/components/home/FinalHomeCTA";

const colors = {
  primary: "#1B5E4A",
  secondary: "#B88A44",
  secondaryText: "#7D6338",
  secondaryOnDark: "#E5C9AB",
  bgMain: "#F7F9F8",
  bgSection: "#FFFFFF",
  textMain: "#0F1D18",
  textMuted: "#4E5D56",
  border: "#E2E8E5",
};

export default function HomePage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [showOpsModal, setShowOpsModal] = useState(false);
  const [opsForm, setOpsForm] = useState({
    name: "", email: "", phone: "", company: "",
    portfolioSize: "", serviceNeeded: "", stage: "", message: "",
  });
  const [opsSubmitted, setOpsSubmitted] = useState(false);
  const [opsSubmitting, setOpsSubmitting] = useState(false);
  const [opsError, setOpsError] = useState(false);

  const handleAnalyzeClick = () => {
    router.push("/estimator");
  };

  const handleExploreIntelClick = () => {
    router.push("/str-market-intel");
  };

  const handleOpsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpsSubmitting(true);
    setOpsError(false);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...opsForm, source: "Operational Setup Enquiry" }),
      });
      if (!res.ok) throw new Error("lead submission failed");
      setOpsSubmitted(true);
    } catch {
      setOpsError(true);
    } finally {
      setOpsSubmitting(false);
    }
  };

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh", position: "relative" }}>
      <DecorativeBackdrop />
      <div style={{ position: "relative", zIndex: 1 }}>
      <SiteNav active="home" />

      <HomeHero isMobile={isMobile} onAnalyze={handleAnalyzeClick} onExploreIntel={handleExploreIntelClick} />

      <WhyAssetIntel isMobile={isMobile} />

      <ProductShowcase isMobile={isMobile} onTryAnalyzer={handleAnalyzeClick} />

      <PlatformToolGrid isMobile={isMobile} />

      <HowSTRWorksSection isMobile={isMobile} />

      <SocialProof isMobile={isMobile} />

      <FinalHomeCTA isMobile={isMobile} onAnalyze={handleAnalyzeClick} onBookConsultation={() => router.push("/consultation")} />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* FOOTER */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <footer style={{ background: "#1B5E4A", color: "#fff" }}>
        {/* Independence note bar */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", padding: isMobile ? "20px 20px" : "20px 40px" }}>
          <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", alignItems: "center", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3zM9 12l2 2 4-4" stroke="rgba(255,255,255,0.65)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.65)", textAlign: "center" }}>
              AssetIntel is not a broker or operator. We provide data-led rental intelligence, strategy guidance, and setup advisory.
            </span>
          </div>
        </div>

        {/* Main footer */}
        <div style={{ maxWidth: "1360px", margin: "0 auto", padding: isMobile ? "48px 20px 36px" : "64px 40px 48px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr", gap: isMobile ? "40px" : "48px" }}>

          {/* Brand column */}
          <div>
            <div style={{ marginBottom: "18px" }}>
              <div style={{ fontSize: "20px", fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontWeight: 500, color: "#fff", letterSpacing: "-0.01em" }}>AssetIntel</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: "3px" }}>Property Intelligence. Smarter Decisions.</div>
            </div>
            <p style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.6)", lineHeight: 1.75, maxWidth: "320px" }}>
              AssetIntel helps Dubai property owners, investors, and operators make smarter rental, investment, and STR setup decisions through data-led intelligence and advisory support.
            </p>
            <a href="mailto:hello@assetintel.ae" style={{ display: "inline-flex", alignItems: "center", gap: "7px", marginTop: "20px", fontSize: "13px", color: colors.secondaryOnDark, fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.secondaryOnDark} strokeWidth="1.6" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 4l10 9 10-9"/></svg>
              hello@assetintel.ae
            </a>
          </div>

          {/* Services */}
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "18px" }}>Services</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Rental Strategy Analyzer", href: "/estimator" },
                { label: "Self-Manage", href: "/self-manage/owners" },
                { label: "STR Sub-Leasing", href: "/self-manage/str-subleasing" },
                { label: "STR Risk Estimator", href: "/self-manage/str-subleasing/estimator" },
                { label: "Operational Setup", href: "/operations-setup" },
              ].map(({ label, href }) => (
                <a key={label} href={href} style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.65)", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
                >{label}</a>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "18px" }}>Insights</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "2026 Handover Watchlist", href: "/investment-research/2026-handovers" },
                { label: "Operator Recommendations", href: null },
                { label: "Agent Recommendations", href: "/agents" },
                { label: "Furnishing Calculator", href: "/furnishing" },
              ].map(({ label, href }) => {
                const style = { fontSize: "13.5px", color: "rgba(255,255,255,0.65)", textDecoration: "none", transition: "color 0.15s", background: "none", border: "none", padding: 0, textAlign: "left" as const, cursor: "pointer", fontFamily: "inherit" };
                const hover = {
                  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.color = "#fff"),
                  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)"),
                };
                return href ? (
                  <a key={label} href={href} style={style} {...hover}>{label}</a>
                ) : (
                  <button key={label} onClick={() => setShowOpsModal(true)} style={style} {...hover}>{label}</button>
                );
              })}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "18px" }}>Contact</div>
            <button
              onClick={handleAnalyzeClick}
              style={{ display: "block", width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", color: "#fff", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", textAlign: "center", marginBottom: "12px", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            >
              Analyze Property
            </button>
            <button
              onClick={() => router.push("/self-manage")}
              style={{ display: "block", width: "100%", padding: "13px 16px", background: "#B88A44", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", textAlign: "center", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#8B6F3F")}
              onMouseLeave={e => (e.currentTarget.style.background = "#B88A44")}
            >
              Speak to an Advisor
            </button>
          </div>

        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: isMobile ? "20px 20px" : "20px 40px" }}>
          <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>© {new Date().getFullYear()} AssetIntel. All rights reserved. · assetintel.ae</span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>Dubai Property Intelligence & STR Advisory</span>
          </div>
        </div>
      </footer>

      {/* ── Operational Setup Enquiry Modal ── */}
      {showOpsModal && (
        <div
          onClick={() => { if (!opsSubmitting) { setShowOpsModal(false); setOpsSubmitted(false); setOpsError(false); setOpsForm({ name:"",email:"",phone:"",company:"",portfolioSize:"",serviceNeeded:"",stage:"",message:"" }); } }}
          style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(20,30,25,0.55)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background:"#FFFFFF", borderRadius:"20px", boxShadow:"0 32px 80px rgba(27,94,74,0.22), 0 8px 24px rgba(27,94,74,0.12)", width:"100%", maxWidth:"560px", maxHeight:"90vh", overflowY:"auto", padding: isMobile ? "28px 20px" : "40px 36px", position:"relative" }}
          >
            {/* Close */}
            <button
              onClick={() => { setShowOpsModal(false); setOpsSubmitted(false); setOpsError(false); setOpsForm({ name:"",email:"",phone:"",company:"",portfolioSize:"",serviceNeeded:"",stage:"",message:"" }); }}
              style={{ position:"absolute", top:"16px", right:"16px", background:"none", border:"none", cursor:"pointer", color:colors.textMuted, fontSize:"22px", lineHeight:1, padding:"4px 8px" }}
              aria-label="Close"
            >×</button>

            {/* Accent bar */}
            <div style={{ height:"3px", background:`linear-gradient(90deg,${colors.primary},rgba(27,94,74,0.18))`, borderRadius:"2px", marginBottom:"24px" }} />

            {opsSubmitted ? (
              <div style={{ textAlign:"center", padding:"20px 0 8px" }}>
                <div style={{ width:"52px", height:"52px", borderRadius:"50%", background:"#EEF5F1", border:`1.5px solid rgba(27,94,74,0.18)`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p style={{ fontSize:"17px", fontWeight:700, color:colors.primary, marginBottom:"10px" }}>Enquiry Received</p>
                <p style={{ fontSize:"14px", color:colors.textMuted, lineHeight:1.6 }}>
                  Thank you — your operational setup enquiry has been received. AssetIntel will review your details and contact you to discuss the right setup approach.
                </p>
              </div>
            ) : (
              <form onSubmit={handleOpsSubmit}>
                <p style={{ fontSize:"20px", fontWeight:800, color:colors.primary, marginBottom:"6px" }}>Operational Setup Enquiry</p>
                <p style={{ fontSize:"13px", color:colors.textMuted, lineHeight:1.55, marginBottom:"24px" }}>
                  Tell us about your STR operation and AssetIntel will review how we can support your setup, systems, team structure, and operational workflows.
                </p>

                {opsError && (
                  <div style={{ display:"flex", gap:"10px", alignItems:"flex-start", padding:"12px 14px", borderRadius:"10px", background:"#FDF1F1", border:"1.5px solid rgba(199,90,90,0.3)", marginBottom:"20px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0, marginTop:"1px" }}><circle cx="12" cy="12" r="9" stroke="#C75A5A" strokeWidth="1.6"/><path d="M12 8v5" stroke="#C75A5A" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="16" r="0.9" fill="#C75A5A"/></svg>
                    <p style={{ fontSize:"13px", color:"#8B3A3A", lineHeight:1.5, margin:0 }}>
                      Something went wrong sending your enquiry. Please try again, or email <a href="mailto:hello@assetintel.ae" style={{ color:"#8B3A3A", fontWeight:600 }}>hello@assetintel.ae</a> directly.
                    </p>
                  </div>
                )}

                {/* Field styles shared */}
                {[
                  { label:"Full Name", key:"name", type:"text", placeholder:"Your full name", required:true },
                  { label:"Email", key:"email", type:"email", placeholder:"your@email.com", required:true },
                  { label:"Phone / WhatsApp", key:"phone", type:"tel", placeholder:"+971 50 000 0000", required:false },
                  { label:"Company Name (if any)", key:"company", type:"text", placeholder:"Your company or brand", required:false },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom:"16px" }}>
                    <label style={{ display:"block", fontSize:"11px", fontWeight:700, letterSpacing:"0.10em", textTransform:"uppercase", color:colors.secondaryText, marginBottom:"6px" }}>{f.label}{f.required && <span style={{ color:colors.secondaryText }}> *</span>}</label>
                    <input
                      type={f.type}
                      required={f.required}
                      placeholder={f.placeholder}
                      value={(opsForm as any)[f.key]}
                      onChange={e => setOpsForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width:"100%", boxSizing:"border-box", padding:"10px 14px", borderRadius:"10px", border:`1.5px solid ${colors.border}`, background:"#FBF9F5", fontSize:"14px", color:colors.textMain, outline:"none", fontFamily:"inherit" }}
                    />
                  </div>
                ))}

                {[
                  { label:"Current Portfolio Size", key:"portfolioSize", required:true, options:["Not started yet","1–5 units","6–10 units","11–20 units","21+ units"] },
                  { label:"Service Needed", key:"serviceNeeded", required:true, options:["STR company setup","PMS and automation setup","Housekeeping / maintenance workflow setup","Guest communication setup","SOPs and team structure","Full operational setup","Not sure yet"] },
                  { label:"Current Stage", key:"stage", required:true, options:["Planning to start","Already operating","Scaling existing portfolio","Fixing operational issues"] },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom:"16px" }}>
                    <label style={{ display:"block", fontSize:"11px", fontWeight:700, letterSpacing:"0.10em", textTransform:"uppercase", color:colors.secondaryText, marginBottom:"6px" }}>{f.label}<span style={{ color:colors.secondaryText }}> *</span></label>
                    <select
                      required={f.required}
                      value={(opsForm as any)[f.key]}
                      onChange={e => setOpsForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width:"100%", boxSizing:"border-box", padding:"10px 14px", borderRadius:"10px", border:`1.5px solid ${colors.border}`, background:"#FBF9F5", fontSize:"14px", color:(opsForm as any)[f.key] ? colors.textMain : colors.textMuted, outline:"none", fontFamily:"inherit", appearance:"none" }}
                    >
                      <option value="" disabled>Select an option</option>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}

                <div style={{ marginBottom:"24px" }}>
                  <label style={{ display:"block", fontSize:"11px", fontWeight:700, letterSpacing:"0.10em", textTransform:"uppercase", color:colors.secondaryText, marginBottom:"6px" }}>Message / Notes</label>
                  <textarea
                    rows={4}
                    placeholder="Any additional context about your setup or what you need help with..."
                    value={opsForm.message}
                    onChange={e => setOpsForm(p => ({ ...p, message: e.target.value }))}
                    style={{ width:"100%", boxSizing:"border-box", padding:"10px 14px", borderRadius:"10px", border:`1.5px solid ${colors.border}`, background:"#FBF9F5", fontSize:"14px", color:colors.textMain, outline:"none", fontFamily:"inherit", resize:"vertical" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={opsSubmitting}
                  style={{ width:"100%", padding:"14px", borderRadius:"12px", background:colors.primary, color:"#fff", fontSize:"14px", fontWeight:700, letterSpacing:"0.06em", border:"none", cursor:opsSubmitting ? "not-allowed" : "pointer", opacity:opsSubmitting ? 0.7 : 1 }}
                >
                  {opsSubmitting ? "Submitting..." : "Submit Enquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
