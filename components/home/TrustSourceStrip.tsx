import { colors } from "./theme";

export default function TrustSourceStrip({ isMobile }: { isMobile: boolean }) {
  return (
    <section style={{ borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}`, background: colors.bgSection }}>
      <div
        style={{
          maxWidth: 1520, margin: "0 auto", padding: isMobile ? "18px 20px" : "18px 48px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "12px",
        }}
      >
        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: colors.textMuted, textTransform: "uppercase" }}>
          Trusted Data &amp; Market Intelligence For Dubai Property Decisions
        </span>
        <span style={{ fontSize: "12.5px", color: colors.textMuted }}>
          Market intelligence informed by: <b style={{ color: colors.textMain }}>DLD transaction data</b> · <b style={{ color: colors.textMain }}>STR market signals</b> · <b style={{ color: colors.textMain }}>AssetIntel research</b>
        </span>
      </div>
    </section>
  );
}
