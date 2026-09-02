import { colors, serif } from "./theme";

const STEPS = [
  { title: "Enter Property Details", text: "Add the building, unit type, size, condition, and relevant property information." },
  { title: "AssetIntel Analyzes", text: "We use live data and AssetIntel modelling to assess the property." },
  { title: "Get Insights & Reports", text: "Receive clear financial estimates, comparisons, and recommendations." },
  { title: "Take Action Confidently", text: "Use the analysis to buy, rent, furnish, list, or manage more effectively." },
];

export default function HowItWorks({ isMobile }: { isMobile: boolean }) {
  return (
    <section style={{ padding: isMobile ? "56px 20px" : "88px 48px" }}>
      <div style={{ maxWidth: 1520, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? "32px" : "48px" }}>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? "29px" : "36px", color: colors.primary, margin: "0 0 10px" }}>How AssetIntel Works</h2>
          <p style={{ fontSize: "15px", color: colors.textMuted, margin: 0 }}>Four simple steps to better property decisions.</p>
        </div>

        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", gap: isMobile ? "0" : "0" }}>
          {STEPS.map((step, i) => (
            <div key={step.title} style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", flex: 1, width: "100%" }}>
              <div
                style={{
                  background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "16px",
                  padding: "24px 20px", flex: 1, width: "100%", boxSizing: "border-box",
                  marginBottom: isMobile && i < STEPS.length - 1 ? "0" : undefined,
                }}
              >
                <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: colors.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: serif, fontWeight: 600, fontSize: "16px", marginBottom: "14px" }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: colors.textMain, marginBottom: "6px" }}>{step.title}</div>
                <div style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.55 }}>{step.text}</div>
              </div>

              {i < STEPS.length - 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: isMobile ? "10px 0" : "0 10px", transform: isMobile ? "rotate(90deg)" : "none" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
