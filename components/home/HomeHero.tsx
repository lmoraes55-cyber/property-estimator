import { colors, serif } from "./theme";

const TRUST_ITEMS = [
  { title: "500+ Reports Generated" },
  { title: "150+ Dubai Buildings Analysed" },
  { title: "Thousands Of Market Data Points" },
];

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
            maskImage: "linear-gradient(90deg, transparent 0%, transparent 42%, rgba(0,0,0,0.5) 54%, black 66%, black 100%)",
            WebkitMaskImage: "linear-gradient(90deg, transparent 0%, transparent 42%, rgba(0,0,0,0.5) 54%, black 66%, black 100%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url(/images/hero-desk-scene.png)",
              backgroundSize: "cover",
              backgroundPosition: "85% 62%",
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
            backgroundImage: "url(/images/hero-desk-scene.png)",
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
          <div style={{ fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.16em", color: colors.secondaryText, textTransform: "uppercase", marginBottom: "18px" }}>
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
              Analyze Property
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

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: isMobile ? "8px 14px" : "10px 16px" }}>
            {TRUST_ITEMS.map((t, i) => (
              <div key={t.title} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {i > 0 && <span aria-hidden style={{ width: "3px", height: "3px", borderRadius: "50%", background: colors.border, flexShrink: 0 }} />}
                <span style={{ fontSize: "12px", fontWeight: 600, color: colors.textMuted, letterSpacing: "0.01em" }}>{t.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
