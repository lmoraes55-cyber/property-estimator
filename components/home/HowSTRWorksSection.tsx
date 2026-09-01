import { colors, serif } from "./theme";

const STEPS = ["Prepare", "Register", "Publish", "Bookings", "Guests", "Get Paid"];

export default function HowSTRWorksSection({ isMobile }: { isMobile: boolean }) {
  return (
    <section style={{ padding: isMobile ? "44px 20px" : "60px 48px", background: colors.bgSage }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.16em", color: colors.secondaryText, textTransform: "uppercase", marginBottom: "12px" }}>
          New To Short-Term Rental?
        </div>
        <h2 style={{ fontFamily: serif, fontSize: isMobile ? "27px" : "31px", color: colors.primary, margin: "0 0 32px" }}>
          The STR Owner Journey
        </h2>

        <a
          href="/how-str-works"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            flexWrap: "wrap", gap: isMobile ? "8px" : "0", textDecoration: "none",
          }}
        >
          {STEPS.map((step, i) => (
            <div key={step} style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                padding: "12px 20px", borderRadius: "999px", background: colors.bgSection,
                border: `1px solid ${colors.border}`, fontSize: "13.5px", fontWeight: 700, color: colors.textMain,
                transition: "border-color 0.15s, color 0.15s",
              }}>
                {step}
              </div>
              {i < STEPS.length - 1 && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 6px", flexShrink: 0 }}>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              )}
            </div>
          ))}
        </a>

        <div style={{ marginTop: "32px" }}>
          <a href="/how-str-works" style={{
            display: "inline-flex", alignItems: "center", gap: "7px", textDecoration: "none",
            fontSize: "13.5px", fontWeight: 700, color: colors.primary,
          }}>
            See Full STR Guide
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
        </div>
      </div>
    </section>
  );
}
