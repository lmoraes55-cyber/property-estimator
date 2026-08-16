import { colors, serif } from "./theme";

/** Self-contained — no isMobile prop needed, responsive via Tailwind classes so it can drop into any page. */
export default function ConsultationBanner() {
  return (
    <div className="px-5 md:px-12" style={{ paddingTop: "56px", paddingBottom: "56px" }}>
      <div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-6 md:px-9"
        style={{ maxWidth: 1200, margin: "0 auto", background: colors.bgSage, border: `1px solid ${colors.border}`, borderRadius: "18px" }}
      >
        <div>
          <div style={{ fontFamily: serif, fontSize: "16.5px", color: colors.primary, marginBottom: "4px" }}>Need independent, unbiased guidance?</div>
          <div style={{ fontSize: "13px", color: colors.textMuted }}>
            Book a 20-minute Property Advisory session. <span style={{ fontWeight: 700, color: colors.textMain }}>AED 199</span>
          </div>
        </div>
        <a href="/consultation" style={{
          textDecoration: "none", padding: "13px 24px", borderRadius: "12px", background: colors.secondary,
          color: "#fff", fontSize: "13.5px", fontWeight: 700, flexShrink: 0, textAlign: "center",
        }}>
          Book Consultation
        </a>
      </div>
    </div>
  );
}
