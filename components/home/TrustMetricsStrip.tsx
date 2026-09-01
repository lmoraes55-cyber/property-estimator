import { colors, serif } from "./theme";

const METRICS = [
  { title: "Live DLD Production Data", sub: "Real-time sales & rental transaction data" },
  { title: "Independent & Unbiased Guidance", sub: "We don't sell properties or manage yours" },
  { title: "Built Specifically For Dubai", sub: "Local. Accurate. Relevant." },
  { title: "No Operator Bias", sub: "No commission tied to any single operator" },
  { title: "Research Before Decisions", sub: "Data-led, not sales-led" },
  { title: "Property Intelligence First", sub: "Insight before advice, advice before action" },
];

function MetricIcon({ index }: { index: number }) {
  const p = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: colors.secondaryLight, strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (index === 0) return <svg {...p}><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" /><path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" /></svg>;
  if (index === 1) return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" /></svg>;
  if (index === 2) return <svg {...p}><path d="M12 3C8 3 5 6.4 5 10c0 6 7 11 7 11s7-5 7-11c0-3.6-3-7-7-7z" /><circle cx="12" cy="10" r="2" /></svg>;
  if (index === 3) return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M8 8l8 8M16 8l-8 8" /></svg>;
  if (index === 4) return <svg {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>;
  return <svg {...p}><path d="M7 3h7l4 4v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" /><path d="M14 3v4h4" /><path d="M9 13h6M9 17h6" /></svg>;
}

export default function TrustMetricsStrip({ isMobile }: { isMobile: boolean }) {
  return (
    <section style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDeep})`, padding: isMobile ? "40px 20px" : "48px 48px" }}>
      <div style={{ maxWidth: 1520, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? "28px" : "36px" }}>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? "22px" : "27px", color: "#fff", margin: 0 }}>Why Owners Trust AssetIntel</h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(6, 1fr)",
            gap: isMobile ? "28px 16px" : "0",
          }}
        >
          {METRICS.map((m, i) => (
            <div
              key={m.title}
              style={{
                display: "flex", flexDirection: "column", alignItems: isMobile ? "flex-start" : "center", textAlign: isMobile ? "left" : "center",
                padding: isMobile ? 0 : "0 14px",
                borderLeft: !isMobile && i > 0 ? "1px solid rgba(255,255,255,0.14)" : "none",
              }}
            >
              <MetricIcon index={i} />
              <div style={{ fontFamily: serif, fontSize: "16px", fontWeight: 600, color: "#fff", marginTop: "12px", marginBottom: "5px", lineHeight: 1.3 }}>{m.title}</div>
              <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
