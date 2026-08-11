import { colors, serif } from "./theme";

function MockBars() {
  const bars = [
    { h: 46, v: "AED 124,500", label: "STR ANNUAL INCOME", color: colors.primary },
    { h: 32, v: "AED 86,000", label: "LTR ANNUAL INCOME", color: colors.secondary },
  ];
  return (
    <div style={{ display: "flex", gap: "14px" }}>
      {bars.map(b => (
        <div key={b.label} style={{ flex: 1, background: "#fff", border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "14px 16px" }}>
          <div style={{ fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.08em", color: colors.textMuted, marginBottom: "8px" }}>{b.label}</div>
          <div style={{ fontFamily: serif, fontSize: "19px", fontWeight: 700, color: colors.textMain, marginBottom: "10px" }}>{b.v}</div>
          <div style={{ height: "6px", borderRadius: "3px", background: colors.bgSage, overflow: "hidden" }}>
            <div style={{ width: `${b.h + 30}%`, height: "100%", background: b.color, opacity: 0.75 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductShowcase({ isMobile, onTryAnalyzer }: { isMobile: boolean; onTryAnalyzer: () => void }) {
  return (
    <section style={{ padding: isMobile ? "56px 20px" : "88px 48px", background: colors.bgSage }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.15fr", gap: isMobile ? "36px" : "56px", alignItems: "center" }}>
          {/* Left — copy */}
          <div>
            <div style={{ fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.16em", color: colors.secondary, textTransform: "uppercase", marginBottom: "14px" }}>
              Rental Strategy Analyzer
            </div>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? "26px" : "36px", color: colors.primary, lineHeight: 1.16, margin: "0 0 18px" }}>
              Professional STR Analysis In Minutes
            </h2>
            <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.65, maxWidth: "440px", marginBottom: "28px" }}>
              Enter a property and instantly compare short-term and long-term rental performance, backed by live Dubai market data.
            </p>
            <button
              onClick={onTryAnalyzer}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "15px 26px", borderRadius: "12px", border: "none",
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDeep})`,
                color: "#fff", fontSize: "14.5px", fontWeight: 700,
                cursor: "pointer", boxShadow: "0 10px 26px rgba(27,94,74,0.24)",
              }}
            >
              Try The Analyzer
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={colors.secondaryLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          </div>

          {/* Right — premium mockup */}
          <div
            style={{
              background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "20px",
              boxShadow: colors.shadowLg, overflow: "hidden",
            }}
          >
            {/* Window chrome */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "14px 18px", borderBottom: `1px solid ${colors.border}` }}>
              <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#E4B4A8" }} />
              <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#EAD7A6" }} />
              <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#A9CFB8" }} />
              <span style={{ marginLeft: "12px", fontSize: "11.5px", color: colors.textMuted }}>assetintel.ae/estimator</span>
            </div>

            <div style={{ padding: isMobile ? "20px" : "28px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                <div style={{ fontFamily: serif, fontSize: "16px", color: colors.primary }}>Investment Overview</div>
                <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "999px", background: "rgba(27,94,74,0.10)", color: colors.primary }}>STR Recommended</span>
              </div>

              <MockBars />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "14px" }}>
                <div style={{ background: "#fff", border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "14px 16px" }}>
                  <div style={{ fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.08em", color: colors.textMuted, marginBottom: "6px" }}>NET RETURN</div>
                  <div style={{ fontFamily: serif, fontSize: "18px", fontWeight: 700, color: colors.textMain }}>8.7%</div>
                </div>
                <div style={{ background: "#fff", border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "14px 16px" }}>
                  <div style={{ fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.08em", color: colors.textMuted, marginBottom: "6px" }}>PRICE / SQFT</div>
                  <div style={{ fontFamily: serif, fontSize: "18px", fontWeight: 700, color: colors.textMain }}>AED 2,450</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "44px", marginTop: "18px" }}>
                {[38, 62, 48, 74, 55, 66, 40].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "3px 3px 0 0", background: i % 2 === 0 ? colors.primary : colors.secondary, opacity: 0.55 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
