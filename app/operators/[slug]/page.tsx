"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import GroundWorksLogo from "@/components/GroundWorksLogo";
import { getOperatorProfile, OperatorProfile, ScoreItem } from "@/lib/operator-profiles";

const colors = {
  primary: "#1B5E4A",
  secondary: "#B88A44",
  bgMain: "#FAFAF8",
  bgSection: "#FFFFFF",
  textMain: "#1A1A1A",
  textMuted: "#6B6B6B",
  border: "#E0DDD8",
  shadowSm: "0 1px 2px rgba(0, 0, 0, 0.05)",
  shadowMd: "0 4px 6px rgba(0, 0, 0, 0.1)",
  shadowLg: "0 20px 25px rgba(0, 0, 0, 0.15)",
};

const serif = "'Georgia', serif";
const st = (c: string, w = 1.2) => ({ stroke: c, strokeWidth: w, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

// ─── Icons ───
const IconCheck = ({ color = colors.primary }) => (
  <svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" {...st(color)} /><path d="M6.5 10L9 12.5L13.5 7.5" {...st(color)} /></svg>
);
const IconInfo = ({ color = colors.secondary }) => (
  <svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" {...st(color)} /><path d="M10 9V14" {...st(color)} /><circle cx="10" cy="6.2" r="0.6" fill={color} /></svg>
);
const IconYes = ({ color = colors.primary }) => (
  <svg width="18" height="18" viewBox="0 0 18 18"><path d="M4 9.5L7.5 13L14 5.5" {...st(color, 1.6)} /></svg>
);
const IconNo = ({ color = "#C75A5A" }) => (
  <svg width="18" height="18" viewBox="0 0 18 18"><path d="M5 5L13 13M13 5L5 13" {...st(color, 1.6)} /></svg>
);
const IconStar = ({ filled, color = colors.secondary }: { filled: boolean; color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <path d="M8 2L9.7 6L14 6.5L10.8 9.4L11.7 13.5L8 11.3L4.3 13.5L5.2 9.4L2 6.5L6.3 6L8 2Z" fill={filled ? color : "none"} stroke={color} strokeWidth="1" strokeLinejoin="round" />
  </svg>
);
const IconLocationPin = ({ color = colors.primary }) => (
  <svg width="28" height="28" viewBox="0 0 28 28"><path d="M14 4C10 4 7 7 7 11C7 16.5 14 24 14 24C14 24 21 16.5 21 11C21 7 18 4 14 4Z" {...st(color)} /><circle cx="14" cy="11" r="2.2" {...st(color)} /></svg>
);

// ─── Score Ring ───
function ScoreRing({ value, size = 160, label, sublabel, accent = colors.primary }: { value: number; size?: number; label?: string; sublabel?: string; accent?: string }) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.border} strokeWidth="8" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={accent} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: size > 120 ? "48px" : "30px", fontWeight: 700, fontFamily: serif, color: colors.textMain, lineHeight: 1 }}>{value}</div>
          {sublabel && <div style={{ fontSize: "13px", color: accent, fontWeight: 600, marginTop: "4px" }}>{sublabel}</div>}
        </div>
      </div>
      {label && <div style={{ fontSize: "14px", color: colors.textMuted, fontWeight: 500, marginTop: "12px" }}>{label}</div>}
    </div>
  );
}

// ─── Score bar row ───
function ScoreBar({ item, accent }: { item: ScoreItem; accent: string }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontSize: "14px", color: colors.textMain }}>{item.label}</span>
        <span style={{ fontSize: "14px", fontWeight: 700, color: accent }}>{item.score}</span>
      </div>
      <div style={{ height: "6px", background: colors.border, borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ width: `${item.score}%`, height: "100%", background: accent, borderRadius: "3px" }} />
      </div>
    </div>
  );
}

function SectionHeading({ label, title, subtitle }: { label?: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "40px" }}>
      {label && <div style={{ fontSize: "12px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.1em", marginBottom: "12px" }}>{label}</div>}
      <h2 style={{ fontSize: "34px", fontFamily: serif, fontWeight: 700, marginBottom: subtitle ? "12px" : 0, background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{title}</h2>
      {subtitle && <p style={{ fontSize: "16px", color: colors.textMuted, lineHeight: 1.6, maxWidth: "720px" }}>{subtitle}</p>}
    </div>
  );
}

function renderTermValue(value: string) {
  if (value === "Yes" || value === "Available" || value === "Included") {
    return <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: colors.primary, fontWeight: 600 }}><IconYes /> {value}</span>;
  }
  if (value === "No") {
    return <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#C75A5A", fontWeight: 600 }}><IconNo /> {value}</span>;
  }
  if (value === "TBC") {
    return <span style={{ color: colors.textMuted, fontWeight: 600 }}>TBC</span>;
  }
  return <span style={{ color: colors.textMain, fontWeight: 600 }}>{value}</span>;
}

export default function OperatorProfilePage() {
  const router = useRouter();
  const params = useParams();
  const slug = (Array.isArray(params.slug) ? params.slug[0] : params.slug) || "";
  const operator: OperatorProfile | undefined = getOperatorProfile(slug);

  const handleAnalyzeClick = () => router.push("/estimator");

  if (!operator) {
    return (
      <div style={{ background: colors.bgMain, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px", padding: "40px" }}>
        <h1 style={{ fontFamily: serif, fontSize: "32px", color: colors.textMain }}>Operator Not Found</h1>
        <p style={{ color: colors.textMuted }}>We couldn&apos;t find a profile for &quot;{slug}&quot;.</p>
        <button onClick={() => router.push("/operators")} style={{ padding: "12px 28px", background: colors.primary, color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>Back to Operators</button>
      </div>
    );
  }

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh" }}>
      {/* ─── HEADER ─── */}
      <header style={{ background: colors.bgSection, borderBottom: `1px solid ${colors.border}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "16px 40px", display: "flex", alignItems: "center", gap: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => router.push("/")}>
            <GroundWorksLogo size={40} />
            <div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: colors.textMain }}>Ground<span style={{ color: colors.primary }}>Works</span></div>
              <div style={{ fontSize: "10px", color: colors.textMuted, letterSpacing: "0.1em" }}>RENTAL INTELLIGENCE</div>
            </div>
          </div>
          <nav style={{ display: "flex", gap: "40px", flex: 1 }}>
            <a onClick={() => router.push("/")} style={{ cursor: "pointer", color: colors.textMuted, fontSize: "15px", fontWeight: 500 }}>Home</a>
            <a onClick={() => router.push("/operators")} style={{ cursor: "pointer", color: colors.primary, fontSize: "15px", fontWeight: 600 }}>Operators</a>
            <a onClick={handleAnalyzeClick} style={{ cursor: "pointer", color: colors.textMuted, fontSize: "15px", fontWeight: 500 }}>Analyzer</a>
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>

        {/* ─── 1. HERO ─── */}
        <section style={{ padding: "64px 0" }}>
          <div style={{ background: colors.bgSection, borderRadius: "20px", border: `1px solid ${colors.border}`, boxShadow: colors.shadowMd, padding: "48px", display: "grid", gridTemplateColumns: "1fr auto", gap: "48px", alignItems: "center" }}>
            {/* Left: identity */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px" }}>
                <div style={{ width: "72px", height: "72px", borderRadius: "16px", background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "26px", fontWeight: 700, fontFamily: serif }}>
                  {operator.logoInitials}
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: colors.secondary, fontWeight: 700, letterSpacing: "0.1em", marginBottom: "6px" }}>OPERATOR PROFILE</div>
                  <h1 style={{ fontSize: "38px", fontFamily: serif, fontWeight: 700, color: colors.textMain, lineHeight: 1.1 }}>{operator.name}</h1>
                </div>
              </div>
              {/* Sub-scores */}
              <div style={{ display: "flex", gap: "20px", marginTop: "8px" }}>
                <div style={{ flex: 1, background: colors.bgMain, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "20px" }}>
                  <div style={{ fontSize: "12px", color: colors.textMuted, fontWeight: 600, marginBottom: "8px" }}>OWNER SCORE</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "28px", fontWeight: 700, color: colors.primary, fontFamily: serif }}>{operator.ownerScore}</span>
                    <span style={{ fontSize: "14px", color: colors.textMuted }}>/100</span>
                  </div>
                  <div style={{ height: "6px", background: colors.border, borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${operator.ownerScore}%`, height: "100%", background: colors.primary }} />
                  </div>
                </div>
                <div style={{ flex: 1, background: colors.bgMain, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "20px" }}>
                  <div style={{ fontSize: "12px", color: colors.textMuted, fontWeight: 600, marginBottom: "8px" }}>GUEST SCORE</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "28px", fontWeight: 700, color: colors.secondary, fontFamily: serif }}>{operator.guestScore}</span>
                    <span style={{ fontSize: "14px", color: colors.textMuted }}>/100</span>
                  </div>
                  <div style={{ height: "6px", background: colors.border, borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${operator.guestScore}%`, height: "100%", background: colors.secondary }} />
                  </div>
                </div>
              </div>
            </div>
            {/* Right: GW Score ring */}
            <div style={{ textAlign: "center", paddingLeft: "32px", borderLeft: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: "12px", color: colors.textMuted, fontWeight: 700, letterSpacing: "0.1em", marginBottom: "16px" }}>GW SCORE™</div>
              <ScoreRing value={operator.gwScore} sublabel={operator.gwScoreLabel} accent={colors.primary} />
            </div>
          </div>
        </section>

        {/* ─── 2. ASSESSMENT ─── */}
        <section style={{ padding: "32px 0 64px 0" }}>
          <SectionHeading label="ANALYSIS" title="GroundWorks Assessment" />
          <div style={{ background: colors.bgSection, borderRadius: "16px", border: `1px solid ${colors.border}`, boxShadow: colors.shadowSm, padding: "40px", borderLeft: `4px solid ${colors.secondary}` }}>
            <p style={{ fontSize: "17px", color: colors.textMain, lineHeight: 1.7 }}>{operator.assessment}</p>
          </div>
        </section>

        {/* ─── 3. QUICK FACTS ─── */}
        <section style={{ padding: "0 0 64px 0" }}>
          <SectionHeading label="OVERVIEW" title="Quick Facts" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
            {operator.quickFacts.map((f) => (
              <div key={f.label} style={{ background: colors.bgSection, borderRadius: "12px", border: `1px solid ${colors.border}`, boxShadow: colors.shadowSm, padding: "24px" }}>
                <div style={{ fontSize: "12px", color: colors.textMuted, fontWeight: 600, letterSpacing: "0.04em", marginBottom: "10px" }}>{f.label.toUpperCase()}</div>
                <div style={{ fontSize: "24px", fontWeight: 700, fontFamily: serif, color: colors.textMain }}>{f.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 4. BEST FOR ─── */}
        <section style={{ padding: "0 0 64px 0" }}>
          <SectionHeading label="FIT" title="Who Is This Operator Best For?" />
          <div style={{ background: colors.bgSection, borderRadius: "16px", border: `1px solid ${colors.border}`, boxShadow: colors.shadowSm, padding: "40px", display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {operator.bestFor.map((tag) => (
              <span key={tag} style={{ padding: "10px 20px", background: colors.bgMain, border: `1px solid ${colors.border}`, borderRadius: "999px", fontSize: "14px", fontWeight: 600, color: colors.primary }}>{tag}</span>
            ))}
          </div>
        </section>

        {/* ─── 5. SCORE BREAKDOWN ─── */}
        <section style={{ padding: "0 0 64px 0" }}>
          <SectionHeading label="METHODOLOGY" title="How We Calculated The Score" subtitle="Every GW Score™ is built from independent owner and guest signals weighted across the metrics below." />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
            {/* Owner */}
            <div style={{ background: colors.bgSection, borderRadius: "16px", border: `1px solid ${colors.border}`, boxShadow: colors.shadowSm, padding: "36px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                <h3 style={{ fontSize: "20px", fontFamily: serif, fontWeight: 700, color: colors.textMain }}>GW Owner Score™</h3>
                <div style={{ fontSize: "32px", fontWeight: 700, fontFamily: serif, color: colors.primary }}>{operator.ownerScore}</div>
              </div>
              {operator.ownerScoreBreakdown.map((it) => <ScoreBar key={it.label} item={it} accent={colors.primary} />)}
            </div>
            {/* Guest */}
            <div style={{ background: colors.bgSection, borderRadius: "16px", border: `1px solid ${colors.border}`, boxShadow: colors.shadowSm, padding: "36px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                <h3 style={{ fontSize: "20px", fontFamily: serif, fontWeight: 700, color: colors.textMain }}>GW Guest Score™</h3>
                <div style={{ fontSize: "32px", fontWeight: 700, fontFamily: serif, color: colors.secondary }}>{operator.guestScore}</div>
              </div>
              {operator.guestScoreBreakdown.map((it) => <ScoreBar key={it.label} item={it} accent={colors.secondary} />)}
            </div>
          </div>
        </section>

        {/* ─── 6. CONTRACT TERMS ─── */}
        <section style={{ padding: "0 0 64px 0" }}>
          <SectionHeading label="THE DETAILS" title="Contract Terms & Operations" subtitle="The operational and contractual terms that matter most before signing with an operator." />
          <div style={{ background: colors.bgSection, borderRadius: "16px", border: `1px solid ${colors.border}`, boxShadow: colors.shadowSm, overflow: "hidden" }}>
            {operator.contractTerms.map((t, i) => (
              <div key={t.label} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "18px 32px", background: i % 2 === 0 ? colors.bgSection : colors.bgMain, borderBottom: i < operator.contractTerms.length - 1 ? `1px solid ${colors.border}` : "none" }}>
                <span style={{ fontSize: "14px", color: colors.textMuted, fontWeight: 500 }}>{t.label}</span>
                <span style={{ fontSize: "14px" }}>{renderTermValue(t.value)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 7 & 8. STRENGTHS + CONSIDERATIONS ─── */}
        <section style={{ padding: "0 0 64px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
          <div>
            <SectionHeading title="What They Do Well" />
            <div style={{ background: colors.bgSection, borderRadius: "16px", border: `1px solid ${colors.border}`, boxShadow: colors.shadowSm, padding: "36px" }}>
              {operator.strengths.map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "18px" }}>
                  <span style={{ flexShrink: 0, marginTop: "1px" }}><IconCheck color={colors.primary} /></span>
                  <span style={{ fontSize: "15px", color: colors.textMain, lineHeight: 1.5 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionHeading title="Considerations" />
            <div style={{ background: colors.bgSection, borderRadius: "16px", border: `1px solid ${colors.border}`, boxShadow: colors.shadowSm, padding: "36px" }}>
              {operator.considerations.map((c) => (
                <div key={c} style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "18px" }}>
                  <span style={{ flexShrink: 0, marginTop: "1px" }}><IconInfo color={colors.secondary} /></span>
                  <span style={{ fontSize: "15px", color: colors.textMain, lineHeight: 1.5 }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 9. COMMUNITIES ─── */}
        <section style={{ padding: "0 0 64px 0" }}>
          <SectionHeading label="GEOGRAPHY" title="Communities They Perform Best In" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "20px" }}>
            {operator.communities.map((c) => (
              <div key={c.area} style={{ background: colors.bgSection, borderRadius: "12px", border: `1px solid ${colors.border}`, boxShadow: colors.shadowSm, padding: "24px" }}>
                <div style={{ marginBottom: "14px" }}><IconLocationPin color={colors.primary} /></div>
                <div style={{ fontSize: "15px", fontWeight: 600, color: colors.textMain, marginBottom: "8px" }}>{c.area}</div>
                <div style={{ fontSize: "13px", color: colors.secondary, fontWeight: 600 }}>{c.performance}</div>
                {c.occupancy && <div style={{ fontSize: "12px", color: colors.textMuted, marginTop: "4px" }}>{c.occupancy} occupancy</div>}
              </div>
            ))}
          </div>
        </section>

        {/* ─── 10. VERIFIED OWNER REVIEWS ─── */}
        <section style={{ padding: "0 0 64px 0" }}>
          <SectionHeading label="OWNER FEEDBACK" title="Verified Owner Reviews" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {operator.reviews.map((r, i) => (
              <div key={i} style={{ background: colors.bgSection, borderRadius: "12px", border: `1px solid ${colors.border}`, boxShadow: colors.shadowSm, padding: "28px" }}>
                <div style={{ display: "flex", gap: "2px", marginBottom: "16px" }}>
                  {[1, 2, 3, 4, 5].map((n) => <IconStar key={n} filled={n <= r.rating} />)}
                </div>
                <p style={{ fontSize: "15px", color: colors.textMain, lineHeight: 1.6, marginBottom: "20px", fontStyle: "italic" }}>&ldquo;{r.quote}&rdquo;</p>
                <div style={{ fontSize: "13px", fontWeight: 600, color: colors.primary }}>{r.author}</div>
                <div style={{ fontSize: "12px", color: colors.textMuted, marginTop: "2px" }}>{r.property}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "13px", color: colors.textMuted, marginTop: "20px", textAlign: "center" }}>Verified owner reviews coming soon. Owners will be able to submit and verify their experience.</p>
        </section>

        {/* ─── 11. COMPARE ─── */}
        <section style={{ padding: "0 0 64px 0" }}>
          <SectionHeading label="BENCHMARK" title="Compare With Other Operators" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
            {operator.compareWith.map((c) => (
              <div key={c.slug} style={{ background: colors.bgSection, borderRadius: "12px", border: `1px solid ${colors.border}`, boxShadow: colors.shadowSm, padding: "28px", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "16px", fontWeight: 600, color: colors.textMain, marginBottom: "20px", minHeight: "44px" }}>{c.name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "13px", color: colors.textMuted }}>GW Score</span>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: colors.primary }}>{c.gwScore}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "13px", color: colors.textMuted }}>Owner Score</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: colors.textMain }}>{c.ownerScore}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                  <span style={{ fontSize: "13px", color: colors.textMuted }}>Guest Score</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: colors.textMain }}>{c.guestScore}</span>
                </div>
                <button onClick={() => router.push(`/operators/${c.slug}`)} style={{ marginTop: "auto", background: "transparent", border: "none", color: colors.secondary, fontSize: "14px", fontWeight: 600, cursor: "pointer", padding: 0, textAlign: "left" }}>
                  View Analysis →
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 12. FINAL CTA ─── */}
        <section style={{ padding: "0 0 80px 0" }}>
          <div style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #14513F 100%)`, borderRadius: "20px", padding: "64px 48px", textAlign: "center" }}>
            <h2 style={{ fontSize: "34px", fontFamily: serif, fontWeight: 700, color: "#fff", marginBottom: "16px" }}>Still Comparing Operators?</h2>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, maxWidth: "640px", margin: "0 auto 32px auto" }}>
              Use the Rental Strategy Analyzer first to determine whether STR or LTR is the right strategy for your property.
            </p>
            <button onClick={handleAnalyzeClick} style={{ padding: "16px 40px", background: colors.secondary, color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: 600, cursor: "pointer" }}>
              Analyze My Property
            </button>
          </div>
        </section>
      </div>

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
