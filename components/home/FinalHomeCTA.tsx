import { colors, serif } from "./theme";

export default function FinalHomeCTA({ isMobile, onAnalyze, onBookConsultation }: { isMobile: boolean; onAnalyze: () => void; onBookConsultation: () => void }) {
  return (
    <section style={{ padding: isMobile ? "56px 20px 72px" : "96px 48px" }}>
      <div
        style={{
          maxWidth: 1200, margin: "0 auto", position: "relative", overflow: "hidden",
          borderRadius: "26px", background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDeep})`,
          padding: isMobile ? "48px 24px" : "72px 48px",
          boxShadow: "0 24px 60px rgba(15,62,51,0.28)",
          textAlign: "center",
        }}
      >
        <div aria-hidden style={{ position: "absolute", top: "-60px", right: "-60px", width: "220px", height: "220px", borderRadius: "50%", background: "rgba(184,138,68,0.14)" }} />
        <div aria-hidden style={{ position: "absolute", bottom: "-80px", left: "-40px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? "26px" : "34px", color: "#fff", lineHeight: 1.2, margin: "0 0 32px", maxWidth: "560px", marginLeft: "auto", marginRight: "auto" }}>
            Ready To Make Smarter Property Decisions?
          </h2>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={onAnalyze}
              style={{ padding: "15px 28px", borderRadius: "12px", border: "none", background: colors.secondary, color: "#fff", fontSize: "14.5px", fontWeight: 700, cursor: "pointer" }}
            >
              Analyze Property
            </button>
            <button
              onClick={onBookConsultation}
              style={{ padding: "15px 28px", borderRadius: "12px", border: "1.5px solid rgba(255,255,255,0.4)", background: "transparent", color: "#fff", fontSize: "14.5px", fontWeight: 700, cursor: "pointer" }}
            >
              Book Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
