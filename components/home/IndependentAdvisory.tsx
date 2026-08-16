import { colors, serif } from "./theme";

const CHECKLIST = [
  "Should you choose STR or LTR?",
  "Is this property a good investment?",
  "Expected rental performance",
  "Property-specific risks",
  "Furnishing recommendations",
  "Operator guidance",
  "Self-manage vs operator",
  "Current Dubai market conditions",
  "Best next steps",
];

export default function IndependentAdvisory({ isMobile }: { isMobile: boolean }) {
  return (
    <section style={{ padding: isMobile ? "56px 20px" : "88px 48px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? "36px" : "52px" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.16em", color: colors.secondaryText, textTransform: "uppercase", marginBottom: "14px" }}>
            Independent Property Advisory
          </div>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? "26px" : "34px", color: colors.primary, margin: "0 auto 16px", maxWidth: "760px" }}>
            Get Unbiased Property Guidance Before You Make A Decision
          </h2>
          <p style={{ fontSize: "14.5px", color: colors.textMuted, lineHeight: 1.7, maxWidth: "680px", margin: "0 auto 12px" }}>
            Unlike developers, brokers or operators, AssetIntel provides independent guidance backed by live DLD market data, rental intelligence and practical STR experience.
          </p>
          <p style={{ fontSize: "14.5px", color: colors.textMuted, lineHeight: 1.7, maxWidth: "680px", margin: "0 auto" }}>
            Whether you&apos;re buying a property, already own one or simply want to understand your options, our role is to help you make the right decision — not sell you a property or management contract.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.1fr", gap: isMobile ? "28px" : "40px", alignItems: "stretch" }}>
          {/* Consultation card */}
          <div style={{
            background: `linear-gradient(160deg, ${colors.primary}, #0F3E33)`, borderRadius: "22px", padding: isMobile ? "32px 26px" : "40px 34px",
            color: "#fff", display: "flex", flexDirection: "column", boxShadow: "0 24px 56px rgba(15,62,51,0.26)", position: "relative", overflow: "hidden",
          }}>
            <div aria-hidden style={{ position: "absolute", top: "-50px", right: "-50px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(184,138,68,0.14)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "#D4A574", textTransform: "uppercase", marginBottom: "10px" }}>Independent &amp; Unbiased Guidance</div>
              <div style={{ fontFamily: serif, fontSize: "22px", marginBottom: "6px" }}>Independent Property Advisory</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontFamily: serif, fontSize: "40px", fontWeight: 700 }}>AED 199</span>
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginBottom: "20px" }}>20 Minute Private Consultation</div>
              <div style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.65)", marginBottom: "26px" }}>For owners, buyers, investors and agents.</div>

              <a href="/consultation" style={{
                display: "block", textAlign: "center", textDecoration: "none", padding: "15px", borderRadius: "12px",
                background: colors.secondary, color: "#fff", fontSize: "14px", fontWeight: 700, marginBottom: "12px",
              }}>
                Book Consultation — AED 199
              </a>
              <a href="/estimator" style={{
                display: "block", textAlign: "center", textDecoration: "none", padding: "14px", borderRadius: "12px",
                border: "1.5px solid rgba(255,255,255,0.35)", color: "#fff", fontSize: "13.5px", fontWeight: 700,
              }}>
                Analyze Property
              </a>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "22px", padding: isMobile ? "28px 24px" : "36px 34px" }}>
            <div style={{ fontFamily: serif, fontSize: "18px", color: colors.primary, marginBottom: "6px" }}>A personalised property strategy session.</div>
            <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "20px" }}>During your consultation we&apos;ll cover:</p>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px 20px" }}>
              {CHECKLIST.map(item => (
                <div key={item} style={{ display: "flex", gap: "9px", alignItems: "flex-start", fontSize: "13.5px", color: colors.textMain, lineHeight: 1.5 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}>
                    <circle cx="12" cy="12" r="9.5" stroke={colors.primary} strokeWidth="1.2" opacity="0.4" />
                    <path d="M7.5 12.3l2.8 2.8L16.5 9" stroke={colors.primary} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p style={{ fontSize: "11.5px", color: colors.textMuted, lineHeight: 1.6, textAlign: "center", maxWidth: "680px", margin: isMobile ? "28px auto 0" : "36px auto 0" }}>
          AssetIntel provides independent property guidance based on available market data, research and operational experience. Consultations are intended to support property decision-making and should not be interpreted as regulated financial, legal or investment advice.
        </p>
      </div>
    </section>
  );
}
