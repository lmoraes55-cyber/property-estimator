import { colors, serif } from "./theme";

const PILLARS = [
  { title: "Live DLD Data", text: "Powered by real, production-grade Dubai Land Department transaction data.", icon: "database" },
  { title: "Independent Research", text: "We don't sell property or manage yours — the data speaks for itself.", icon: "shield" },
  { title: "Built For Dubai", text: "Local. Accurate. Built specifically for the Dubai rental market.", icon: "pin" },
  { title: "STR Specialists", text: "Deep short-term rental expertise, not a generic listings site.", icon: "key" },
  { title: "No Operator Bias", text: "No commission tied to any single operator or management company.", icon: "scale" },
  { title: "Actionable Intelligence", text: "Insight that leads to a decision, not just a dashboard of numbers.", icon: "bolt" },
] as const;

function PillarIcon({ icon }: { icon: string }) {
  const p = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: colors.primary, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (icon) {
    case "database": return <svg {...p}><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" /><path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" /></svg>;
    case "shield": return <svg {...p}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg>;
    case "pin": return <svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>;
    case "key": return <svg {...p}><circle cx="8" cy="15" r="4" /><path d="M10.5 12.5L20 3" /><path d="M16 7l3 3" /><path d="M13 4l3 3" /></svg>;
    case "scale": return <svg {...p}><path d="M12 3v18" /><path d="M6 6l-4 8a4 4 0 008 0l-4-8z" /><path d="M18 6l-4 8a4 4 0 008 0l-4-8z" /><path d="M4 6h16" /><path d="M9 21h6" /></svg>;
    default: return <svg {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" /></svg>;
  }
}

export default function WhyAssetIntel({ isMobile }: { isMobile: boolean }) {
  return (
    <section style={{ padding: isMobile ? "48px 20px" : "64px 48px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div
          className="why-assetintel-card"
          style={{
            background: "rgba(253,251,247,0.97)",
            border: `1px solid ${colors.border}`,
            borderRadius: "28px",
            boxShadow: colors.shadowMd,
            padding: isMobile ? "36px 24px" : "48px 44px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: isMobile ? "28px" : "40px" }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.16em", color: colors.secondary, textTransform: "uppercase", marginBottom: "12px" }}>
              Why AssetIntel?
            </div>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? "24px" : "30px", color: colors.primary, margin: 0 }}>
              Property Intelligence You Can Trust
            </h2>
          </div>

          <div className="why-assetintel-grid" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(6, 1fr)", gap: isMobile ? "24px 16px" : "0" }}>
            {PILLARS.map((p, i) => (
              <div
                key={p.title}
                className="why-assetintel-item"
                style={{
                  textAlign: isMobile ? "left" : "center",
                  display: "flex", flexDirection: "column", alignItems: isMobile ? "flex-start" : "center",
                  padding: isMobile ? 0 : "0 18px",
                  borderLeft: !isMobile && i > 0 ? `1px solid ${colors.border}` : "none",
                }}
              >
                <div style={{
                  width: "42px", height: "42px", borderRadius: "12px", background: colors.bgSage,
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "13px", flexShrink: 0,
                }}>
                  <PillarIcon icon={p.icon} />
                </div>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: colors.textMain, marginBottom: "6px" }}>{p.title}</div>
                <p style={{ fontSize: "12px", color: colors.textMain, opacity: 0.72, lineHeight: 1.55, margin: 0 }}>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) and (max-width: 1023px) {
          .why-assetintel-grid { grid-template-columns: repeat(3, 1fr) !important; row-gap: 32px !important; }
          .why-assetintel-item { border-left: none !important; padding: 0 12px !important; }
        }
      `}</style>
    </section>
  );
}
