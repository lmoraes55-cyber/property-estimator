import { colors, serif } from "./theme";

const TRUST_ITEMS = [
  { title: "Live DLD Data", sub: "Production API" },
  { title: "Data-Backed", sub: "Real Market Insights" },
  { title: "Independent", sub: "Unbiased Advice" },
  { title: "Built For Dubai", sub: "Local. Accurate. Relevant." },
];

function TrustIcon({ index }: { index: number }) {
  const stroke = colors.primary;
  const props = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (index === 0) return <svg {...props}><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.657 3.134 3 7 3s7-1.343 7-3V6" /><path d="M5 12v6c0 1.657 3.134 3 7 3s7-1.343 7-3v-6" /></svg>;
  if (index === 1) return <svg {...props}><path d="M4 20h16" /><rect x="6" y="12" width="3" height="8" /><rect x="10.5" y="7" width="3" height="13" /><rect x="15" y="10" width="3" height="10" /></svg>;
  if (index === 2) return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" /></svg>;
  return <svg {...props}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" /></svg>;
}

export default function HomeHero({ isMobile, onAnalyze, onExploreIntel }: { isMobile: boolean; onAnalyze: () => void; onExploreIntel: () => void }) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: isMobile ? undefined : "740px",
        display: "flex",
        alignItems: "center",
        paddingTop: isMobile ? "128px" : "148px",
        paddingBottom: isMobile ? "56px" : "72px",
      }}
    >
      {/* Background image, right-anchored, masked (not painted over) so it
          dissolves into the existing cream backdrop/pattern rather than
          sitting on top of it as a rectangular photo. Two nested masks —
          one horizontal, one vertical — compose multiplicatively so all
          four edges fade independently without any opaque overlay. */}
      {!isMobile ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            maskImage: "linear-gradient(90deg, transparent 0%, transparent 6%, rgba(0,0,0,0.5) 30%, black 52%, black 100%)",
            WebkitMaskImage: "linear-gradient(90deg, transparent 0%, transparent 6%, rgba(0,0,0,0.5) 30%, black 52%, black 100%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url(/images/agent-tools-hero.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              maskImage: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.35) 14%, black 34%, black 88%, rgba(0,0,0,0.72) 100%)",
              WebkitMaskImage: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.35) 14%, black 34%, black 88%, rgba(0,0,0,0.72) 100%)",
            }}
          />
        </div>
      ) : (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(/images/agent-tools-hero.png)",
            backgroundSize: "cover",
            backgroundPosition: "70% center",
            opacity: 0.16,
          }}
        />
      )}
      {isMobile && (
        <div aria-hidden style={{ position: "absolute", inset: 0, background: colors.bgMain, opacity: 0.86 }} />
      )}

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1520, margin: "0 auto", padding: isMobile ? "0 20px" : "0 48px", width: "100%" }}>
        <div style={{ maxWidth: isMobile ? "100%" : "620px" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.16em", color: colors.secondary, textTransform: "uppercase", marginBottom: "18px" }}>
            Dubai&apos;s Property Intelligence Platform
          </div>

          <h1 style={{ fontFamily: serif, fontSize: isMobile ? "34px" : "48px", lineHeight: 1.14, fontWeight: 700, color: colors.primary, margin: "0 0 20px" }}>
            Make Smarter Property Decisions With{" "}
            <span style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Real Intelligence
            </span>
          </h1>

          <p style={{ fontSize: isMobile ? "15px" : "16.5px", color: colors.textMuted, lineHeight: 1.65, maxWidth: "480px", marginBottom: "30px" }}>
            Live DLD data, STR market intelligence, rental benchmarks, investment research and expert advisory — all in one platform.
          </p>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "38px" }}>
            <button
              onClick={onAnalyze}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "15px 26px", borderRadius: "12px", border: "none",
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDeep})`,
                color: "#fff", fontSize: "14.5px", fontWeight: 700, letterSpacing: "0.01em",
                cursor: "pointer", boxShadow: "0 10px 26px rgba(27,94,74,0.28)",
              }}
            >
              Analyze My Property
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={colors.secondaryLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
            <button
              onClick={onExploreIntel}
              style={{
                padding: "15px 26px", borderRadius: "12px",
                border: `1.5px solid ${colors.primary}`, background: "transparent",
                color: colors.primary, fontSize: "14.5px", fontWeight: 700, cursor: "pointer",
              }}
            >
              Explore Market Intelligence
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, auto)", gap: isMobile ? "18px 20px" : "0", columnGap: isMobile ? undefined : "30px" }}>
            {TRUST_ITEMS.map((t, i) => (
              <div key={t.title} style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
                <div style={{ marginTop: "1px", flexShrink: 0 }}><TrustIcon index={i} /></div>
                <div>
                  <div style={{ fontSize: "12.5px", fontWeight: 700, color: colors.textMain }}>{t.title}</div>
                  <div style={{ fontSize: "11px", color: colors.textMuted }}>{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
