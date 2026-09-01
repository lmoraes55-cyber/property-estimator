import { colors, serif } from "./theme";

const TOOLS = [
  { icon: "swap", title: "Rental Analyzer", text: "Compare short-term and long-term rental strategies.", href: "/estimator" },
  { icon: "search", title: "Market Intelligence", text: "Discover top-performing areas, buildings, and market trends.", href: "/str-market-intel" },
  { icon: "home", title: "Investment Research", text: "Research properties and expected returns before you buy.", href: "/str-investment-research" },
  { icon: "book", title: "Self-Manage", text: "Everything you need to run your Dubai holiday home independently using professional tools, systems and proven workflows.", href: "/self-manage" },
] as const;

function ToolIcon({ icon, color }: { icon: string; color: string }) {
  const p = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (icon) {
    case "swap": return <svg {...p}><path d="M7 7h11l-3-3M17 17H6l3 3" /></svg>;
    case "search": return <svg {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>;
    case "home": return <svg {...p}><path d="M4 11.5L12 4l8 7.5V20a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-8.5z" /></svg>;
    default: return <svg {...p}><path d="M4 5.5A2.5 2.5 0 016.5 3H20v15.5A2.5 2.5 0 0117.5 21H4V5.5z" /><path d="M4 5.5A2.5 2.5 0 006.5 8H20" /></svg>;
  }
}

export default function PlatformToolGrid({ isMobile }: { isMobile: boolean }) {
  const cols = isMobile ? "1fr 1fr" : "repeat(4, 1fr)";
  return (
    <section style={{ padding: isMobile ? "56px 20px" : "80px 48px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? "28px" : "48px" }}>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? "29px" : "36px", color: colors.primary, margin: "0 0 10px" }}>Core Solutions</h2>
          <p style={{ fontSize: "15px", color: colors.textMuted, margin: 0 }}>The tools most owners and investors start with.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: cols, gap: "18px" }}>
          {TOOLS.map((tool, i) => {
            const tintColor = i % 2 === 0 ? colors.primary : colors.secondary;
            const tintBg = i % 2 === 0 ? "rgba(27,94,74,0.10)" : "rgba(184,138,68,0.12)";
            return (
              <a
                key={tool.title}
                href={tool.href}
                style={{
                  display: "flex", flexDirection: "column", gap: "14px", textDecoration: "none",
                  background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "16px",
                  padding: "26px 22px", transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
                  boxSizing: "border-box",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = tintColor; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = colors.shadowMd; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: tintBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ToolIcon icon={tool.icon} color={tintColor} />
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: colors.textMain, marginBottom: "5px" }}>{tool.title}</div>
                  <div style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.55 }}>{tool.text}</div>
                </div>
                <span style={{ fontSize: "12.5px", fontWeight: 700, color: tintColor, display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "auto" }}>
                  Learn More
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tintColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
