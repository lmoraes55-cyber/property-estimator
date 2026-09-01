import { colors, serif } from "./theme";

const STATS = [
  { value: "500+", label: "Reports Generated" },
  { value: "150+", label: "Dubai Buildings Analysed" },
  { value: "Thousands", label: "Market Data Points" },
];

export default function SocialProof({ isMobile }: { isMobile: boolean }) {
  return (
    <section style={{ padding: isMobile ? "48px 20px" : "64px 48px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? "32px" : "0" }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{ borderLeft: !isMobile && i > 0 ? `1px solid ${colors.border}` : "none" }}>
              <div style={{ fontFamily: serif, fontSize: isMobile ? "36px" : "45px", fontWeight: 600, color: colors.primary, marginBottom: "6px" }}>
                {s.value}
              </div>
              <div style={{ fontSize: "12.5px", fontWeight: 600, letterSpacing: "0.06em", color: colors.textMuted, textTransform: "uppercase" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: isMobile ? "32px" : "40px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: isMobile ? "10px" : "14px" }}>
          {["Property Owners", "Investors", "Real Estate Agents", "STR Operators"].map(t => (
            <span key={t} style={{
              fontSize: "12px", fontWeight: 600, color: colors.textMuted,
              padding: "8px 16px", borderRadius: "999px", border: `1px solid ${colors.border}`, background: colors.bgSection,
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
