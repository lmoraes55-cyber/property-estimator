import { colors, serif } from "./theme";

interface AudienceCard {
  icon: "home" | "search" | "briefcase" | "chart";
  tint: "primary" | "secondary";
  title: string;
  text: string;
  cta: string;
  href?: string;
  onClick?: () => void;
}

function CardIcon({ icon, color }: { icon: AudienceCard["icon"]; color: string }) {
  const p = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (icon === "home") return <svg {...p}><path d="M4 11.5L12 4l8 7.5V20a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-8.5z" /></svg>;
  if (icon === "search") return <svg {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>;
  if (icon === "briefcase") return <svg {...p}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>;
  return <svg {...p}><path d="M4 20h16" /><path d="M4 20l6-7 4 3 6-8" /></svg>;
}

const AUDIENCE: AudienceCard[] = [
  { icon: "home", tint: "primary", title: "I Own A Property", text: "Compare STR vs LTR, get furnishing guidance, review operator options, and decide whether to self-manage.", cta: "Explore Owner Tools", href: "/self-manage/owners" },
  { icon: "search", tint: "secondary", title: "I'm Buying A Property", text: "Research areas, assess investment potential, compare rental returns, and make confident purchase decisions.", cta: "Explore Investment Research", href: "/str-investment-research" },
  { icon: "briefcase", tint: "primary", title: "I'm A Real Estate Agent", text: "Generate investor-ready reports using live DLD sales data, LTR benchmarks, and STR intelligence.", cta: "Open Agent Tools", href: "/agent-tools" },
  { icon: "chart", tint: "secondary", title: "I Run An STR Business", text: "Streamline operations, improve pricing, review compliance, and access setup guidance.", cta: "Explore Operations" },
];

export default function AudienceCards({ isMobile, onOperationsClick }: { isMobile: boolean; onOperationsClick: () => void }) {
  const cols = isMobile ? "1fr" : "repeat(4, 1fr)";
  return (
    <section style={{ padding: isMobile ? "56px 20px" : "88px 48px" }}>
      <div style={{ maxWidth: 1520, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? "32px" : "48px" }}>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? "29px" : "36px", color: colors.primary, margin: "0 0 10px" }}>Who is AssetIntel built for?</h2>
          <p style={{ fontSize: "15px", color: colors.textMuted, margin: 0 }}>Powerful tools and insights for every property decision-maker.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: cols, gap: "20px" }}>
          {AUDIENCE.map(card => {
            const tintColor = card.tint === "primary" ? colors.primary : colors.secondary;
            const tintBg = card.tint === "primary" ? "rgba(27,94,74,0.10)" : "rgba(184,138,68,0.12)";
            const Wrapper = ({ children }: { children: React.ReactNode }) => card.href ? (
              <a href={card.href} style={{ textDecoration: "none", color: "inherit" }}>{children}</a>
            ) : (
              <div onClick={card.onClick ?? onOperationsClick} style={{ cursor: "pointer" }}>{children}</div>
            );
            return (
              <Wrapper key={card.title}>
                <div
                  style={{
                    background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "18px",
                    padding: "30px 24px", height: "100%", boxSizing: "border-box",
                    display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
                    transition: "transform 0.18s, box-shadow 0.18s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = colors.shadowMd; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: tintBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                    <CardIcon icon={card.icon} color={tintColor} />
                  </div>
                  <h3 style={{ fontFamily: serif, fontSize: "20px", color: colors.textMain, margin: "0 0 10px" }}>{card.title}</h3>
                  <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.6, margin: "0 0 20px", flex: 1 }}>{card.text}</p>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: tintColor, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    {card.cta}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={tintColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </span>
                </div>
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
