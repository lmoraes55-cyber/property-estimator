"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import DecorativeBackdrop from "@/components/DecorativeBackdrop";
import { colors } from "@/lib/colors";

const serif = "var(--font-display), ui-sans-serif, system-ui, sans-serif";

// ── Sample report data — an illustrative example, not a real customer's unit ──
type Severity = "Critical" | "Major" | "Minor" | "Cosmetic";

const SEVERITY_STYLE: Record<Severity, { bg: string; text: string; border: string }> = {
  Critical:  { bg: "#FDECEC", text: "#B0342A", border: "rgba(176,52,42,0.25)" },
  Major:     { bg: "#FBF1E4", text: "#8B6914", border: "rgba(184,138,68,0.3)" },
  Minor:     { bg: "#F5F5F5", text: "#555",    border: "#D0CCC8" },
  Cosmetic:  { bg: "#EEF5F1", text: "#1B5E4A", border: "rgba(27,94,74,0.2)" },
};

interface SampleFinding { room: string; issue: string; severity: Severity; }
const SAMPLE_FINDINGS: SampleFinding[] = [
  { room: "Kitchen", issue: "Cabinet door under sink misaligned, doesn't close flush", severity: "Minor" },
  { room: "Master Bathroom", issue: "Grout missing along shower tray edge — water ingress risk", severity: "Major" },
  { room: "Living Room", issue: "AC unit not cooling on lowest fan setting", severity: "Major" },
  { room: "Master Bedroom", issue: "Wardrobe sliding door off-track", severity: "Minor" },
  { room: "Balcony", issue: "Glass balustrade bracket loose — safety concern", severity: "Critical" },
  { room: "Entrance", issue: "Paint touch-up visible around door frame", severity: "Cosmetic" },
  { room: "Kitchen", issue: "Water heater not producing hot water at kitchen tap", severity: "Major" },
  { room: "Guest Bathroom", issue: "Toilet flush mechanism running continuously", severity: "Major" },
];

const SAMPLE_SUMMARY = {
  total: SAMPLE_FINDINGS.length,
  critical: SAMPLE_FINDINGS.filter(f => f.severity === "Critical").length,
  major: SAMPLE_FINDINGS.filter(f => f.severity === "Major").length,
  minor: SAMPLE_FINDINGS.filter(f => f.severity === "Minor").length,
  cosmetic: SAMPLE_FINDINGS.filter(f => f.severity === "Cosmetic").length,
};

interface Tier { key: string; pkgName: string; label: string; price: number; blurb: string; }
const TIERS: Tier[] = [
  { key: "small", pkgName: "Snagging Inspection — Studio/1BR", label: "Studio / 1BR", price: 699, blurb: "Full walkthrough for a studio or 1-bedroom apartment." },
  { key: "mid", pkgName: "Snagging Inspection — 2BR", label: "2BR", price: 899, blurb: "Full walkthrough for a 2-bedroom apartment." },
  { key: "large", pkgName: "Snagging Inspection — 3BR+/Villa", label: "3BR+ / Villa", price: 1199, blurb: "Full walkthrough for a 3-bedroom+ apartment or villa." },
];

const WHATS_INCLUDED = [
  "Room-by-room walkthrough of the full unit before you sign the handover acceptance form",
  "Electrical, plumbing, AC, and water-heater function checks",
  "Doors, windows, locks, and balcony/glass balustrade safety checks",
  "Finishes review — paint, tiling, grout, cabinetry, fixtures",
  "Every defect photographed and logged with severity and location",
  "A structured PDF report, organized by room and severity, delivered within 48 hours",
];

const FAQS = [
  { q: "When should I book the inspection?", a: "Ideally before you sign the handover acceptance form — once you accept, getting the developer to fix defects becomes harder. We can usually schedule within a few days of your notified handover date." },
  { q: "Do you fix the defects yourselves?", a: "No — the report is the tool you use to hold the developer to their contractual obligation to fix defects before or shortly after handover. We document; you (or your consultant) follow up with the developer." },
  { q: "What if my unit has serious issues?", a: "Critical and major findings are flagged clearly at the top of the report so you know what to escalate first, and whether it's worth delaying your acceptance signature." },
  { q: "Is this the same as a DLP (Defects Liability Period) claim?", a: "Related but different — this inspection happens at handover, before you accept. A DLP claim covers defects that appear after you move in, within your developer's warranty period." },
];

function InspectingForBanner() {
  const params = useSearchParams();
  const project = params.get("project");
  const area = params.get("area");
  if (!project) return null;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20,
      background: colors.bgSage, border: `1px solid ${colors.borderSage}`, borderRadius: 999,
      padding: "7px 16px", fontSize: 12.5, color: colors.primary, fontWeight: 600,
    }}>
      Inspecting for: {project}{area ? ` · ${area}` : ""}
    </div>
  );
}

async function handleCheckout(pkgName: string, setBusy: (v: string | null) => void) {
  setBusy(pkgName);
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pkg: pkgName }),
    });
    const data = await res.json();
    if (data.ok && data.url) { window.location.href = data.url; return; }
    alert("Payment unavailable right now — please try again shortly.");
  } catch {
    alert("Payment unavailable right now — please try again shortly.");
  }
  setBusy(null);
}

export default function SnaggingPage() {
  const [busyPkg, setBusyPkg] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: colors.bgMain, position: "relative" }}>
      <DecorativeBackdrop />
      <div style={{ position: "relative", zIndex: 1 }}>
        <SiteNav active="snagging" />

        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 80px" }}>

          {/* ── HERO ── */}
          <div style={{ padding: "56px 0 40px", textAlign: "center" }}>
            <Suspense fallback={null}><InspectingForBanner /></Suspense>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.secondaryText, marginBottom: 12 }}>
              Pre-Handover Snagging Inspection
            </p>
            <h1 style={{
              fontFamily: serif, fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 600, color: colors.primary,
              lineHeight: 1.2, marginBottom: 16, maxWidth: 680, margin: "0 auto 16px",
            }}>
              Don't accept handover until a specialist has checked it for you
            </h1>
            <p style={{ fontSize: 14.5, color: colors.textMuted, lineHeight: 1.65, maxWidth: 560, margin: "0 auto" }}>
              Once you sign your handover acceptance, getting the developer to fix defects gets much harder. AssetIntel sends a specialised property inspector to check your unit and hand you a detailed, room-by-room report — before you sign anything.
            </p>
          </div>

          {/* ── WHAT'S INCLUDED ── */}
          <section style={{
            background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 22,
            padding: "clamp(24px,4vw,36px)", boxShadow: colors.shadowMd, marginBottom: 40,
          }}>
            <h2 style={{ fontFamily: serif, fontSize: 25, fontWeight: 600, color: colors.primary, marginBottom: 18 }}>
              What's included
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px 24px" }}>
              {WHATS_INCLUDED.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, marginTop: 3, width: 16, height: 16, borderRadius: "50%", background: colors.bgSage, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </span>
                  <span style={{ fontSize: 13.5, color: colors.textMain, lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── SAMPLE REPORT ── */}
          <section style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.secondaryText, marginBottom: 10 }}>
              See What You Get
            </p>
            <h2 style={{ fontFamily: serif, fontSize: "clamp(20px, 2.6vw, 26px)", fontWeight: 600, color: colors.primary, marginBottom: 20 }}>
              Sample snagging report
            </h2>

            <div style={{
              background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 22,
              boxShadow: colors.shadowMd, overflow: "hidden",
            }}>
              {/* Report letterhead */}
              <div style={{
                padding: "24px clamp(20px,4vw,32px)", borderBottom: `1px solid ${colors.border}`,
                display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16,
                background: colors.bgSage,
              }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.secondaryText, marginBottom: 4 }}>
                    Illustrative Example — Not a Real Property
                  </p>
                  <p style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: colors.primary }}>
                    AssetIntel Snagging Report — Sample 2BR Unit
                  </p>
                </div>
                <div style={{ display: "flex", gap: 24, fontSize: 12 }}>
                  <div><span style={{ color: colors.textLight, display: "block" }}>Inspected</span><span style={{ color: colors.textMain, fontWeight: 600 }}>Sample Date</span></div>
                  <div><span style={{ color: colors.textLight, display: "block" }}>Inspector</span><span style={{ color: colors.textMain, fontWeight: 600 }}>AssetIntel Field Team</span></div>
                </div>
              </div>

              {/* Summary stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 1, background: colors.border }}>
                {[
                  { label: "Total Findings", value: SAMPLE_SUMMARY.total, color: colors.textMain },
                  { label: "Critical", value: SAMPLE_SUMMARY.critical, color: SEVERITY_STYLE.Critical.text },
                  { label: "Major", value: SAMPLE_SUMMARY.major, color: SEVERITY_STYLE.Major.text },
                  { label: "Minor", value: SAMPLE_SUMMARY.minor, color: SEVERITY_STYLE.Minor.text },
                  { label: "Cosmetic", value: SAMPLE_SUMMARY.cosmetic, color: SEVERITY_STYLE.Cosmetic.text },
                ].map((s, i) => (
                  <div key={i} style={{ background: colors.bgSection, padding: "16px 12px", textAlign: "center" }}>
                    <p style={{ fontFamily: serif, fontSize: 27, fontWeight: 600, color: s.color, marginBottom: 2 }}>{s.value}</p>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: colors.textLight }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Findings list */}
              <div style={{ padding: "8px clamp(16px,3vw,24px) clamp(16px,3vw,24px)" }}>
                {SAMPLE_FINDINGS.map((f, i) => {
                  const s = SEVERITY_STYLE[f.severity];
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "13px 4px",
                      borderBottom: i < SAMPLE_FINDINGS.length - 1 ? `1px solid ${colors.border}` : "none",
                    }}>
                      <div style={{
                        flexShrink: 0, width: 40, height: 40, borderRadius: 8, background: colors.bgSage,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textLight} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" />
                        </svg>
                      </div>
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: colors.secondaryText, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 2 }}>{f.room}</p>
                        <p style={{ fontSize: 13.5, color: colors.textMain, lineHeight: 1.4 }}>{f.issue}</p>
                      </div>
                      <span style={{
                        flexShrink: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
                        background: s.bg, border: `1px solid ${s.border}`, color: s.text, borderRadius: 20, padding: "4px 10px",
                      }}>
                        {f.severity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <p style={{ fontSize: 11, color: colors.textLight, marginTop: 10, textAlign: "center" }}>
              This is a sample layout to illustrate report format — findings shown are illustrative, not from a real inspection.
            </p>
          </section>

          {/* ── PRICING ── */}
          <section style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.secondaryText, marginBottom: 10, textAlign: "center" }}>
              Below Standard Market Rates
            </p>
            <h2 style={{ fontFamily: serif, fontSize: "clamp(20px, 2.6vw, 26px)", fontWeight: 600, color: colors.primary, marginBottom: 24, textAlign: "center" }}>
              Choose your unit size
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
              {TIERS.map(t => (
                <div key={t.key} style={{
                  background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 20,
                  padding: "28px 24px", boxShadow: colors.shadowSm, display: "flex", flexDirection: "column",
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.secondaryText, marginBottom: 8 }}>
                    {t.label}
                  </p>
                  <p style={{ fontFamily: serif, fontSize: 36, fontWeight: 600, color: colors.primary, marginBottom: 4 }}>
                    AED {t.price.toLocaleString()}
                  </p>
                  <p style={{ fontSize: 12.5, color: colors.textMuted, marginBottom: 22, lineHeight: 1.5, flexGrow: 1 }}>
                    {t.blurb}
                  </p>
                  <button
                    onClick={() => handleCheckout(t.pkgName, setBusyPkg)}
                    disabled={busyPkg === t.pkgName}
                    style={{
                      padding: "13px 20px", borderRadius: 12,
                      background: `linear-gradient(135deg, ${colors.primary} 0%, #0F3E33 100%)`,
                      color: "#FFF", fontSize: 13.5, fontWeight: 700, border: "none",
                      cursor: busyPkg === t.pkgName ? "default" : "pointer",
                      opacity: busyPkg === t.pkgName ? 0.7 : 1,
                      boxShadow: "0 8px 20px rgba(27,94,74,0.2)",
                    }}
                  >
                    {busyPkg === t.pkgName ? "Redirecting…" : "Book Inspection →"}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* ── FAQ ── */}
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: serif, fontSize: "clamp(20px, 2.6vw, 26px)", fontWeight: 600, color: colors.primary, marginBottom: 20 }}>
              Frequently asked questions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {FAQS.map((f, i) => (
                <div key={i} style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 14, overflow: "hidden" }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                      padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 700, color: colors.textMain }}>{f.q}</span>
                    <span style={{ fontSize: 18, color: colors.textLight, flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 150ms" }}>+</span>
                  </button>
                  {openFaq === i && (
                    <p style={{ padding: "0 20px 18px", fontSize: 13, color: colors.textMuted, lineHeight: 1.65 }}>{f.a}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── Disclaimer ── */}
          <div style={{ background: "rgba(184,138,68,0.06)", border: "1px solid rgba(184,138,68,0.22)", borderRadius: 16, padding: "18px 22px" }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.secondaryText, marginBottom: 8 }}>
              What This Isn't
            </p>
            <p style={{ fontSize: 12, color: colors.secondaryText, lineHeight: 1.7, margin: 0 }}>
              This inspection documents defects for you to raise with your developer — AssetIntel doesn't perform repairs or act as your legal representative. Findings are based on a visual walkthrough, not a structural or engineering certification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
