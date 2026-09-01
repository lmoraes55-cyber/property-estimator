import React from "react";
import { colors, serif } from "./theme";

const REPORTS = [
  { title: "STR vs LTR Report", text: "Compare rental strategies side by side.", href: "/estimator", kind: "bars" },
  { title: "LTR Rental Report", text: "DLD-backed long-term rental benchmarks.", href: "/ltr-estimator", kind: "lines" },
  { title: "Investment Report", text: "Sales, rents, yields, and recommendations.", href: "/str-investment-research", kind: "grid" },
  { title: "Agent Investor Report", text: "Client-ready analysis for agents.", href: "/agent-tools", kind: "bars" },
  { title: "Operator Match Advisory", text: "Private operator matching and onboarding guidance.", href: null, kind: "lines" },
] as const;

function ReportPreview({ kind }: { kind: string }) {
  const barHeights = [38, 62, 48, 74, 55];
  return (
    <div style={{ height: "128px", borderRadius: "10px", background: colors.bgSage, border: `1px solid ${colors.border}`, padding: "14px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", gap: "6px" }}>
        <div style={{ width: "36px", height: "6px", borderRadius: "3px", background: colors.primary, opacity: 0.4 }} />
        <div style={{ width: "20px", height: "6px", borderRadius: "3px", background: colors.secondary, opacity: 0.4 }} />
      </div>
      {kind === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
          {[0, 1, 2].map(i => <div key={i} style={{ height: "34px", borderRadius: "6px", background: colors.bgSection, border: `1px solid ${colors.border}` }} />)}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "48px" }}>
          {barHeights.map((h, i) => (
            <div key={i} style={{ width: "12%", height: `${h}%`, borderRadius: "3px 3px 0 0", background: i % 2 === 0 ? colors.primary : colors.secondary, opacity: 0.55 }} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReportPreviewGrid({ isMobile, onOperatorClick }: { isMobile: boolean; onOperatorClick: () => void }) {
  return (
    <section style={{ padding: isMobile ? "56px 20px" : "88px 48px", background: colors.bgSage }}>
      <div style={{ maxWidth: 1520, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? "28px" : "40px" }}>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? "29px" : "36px", color: colors.primary, margin: "0 0 10px" }}>Example Reports You Can Generate</h2>
          <p style={{ fontSize: "15px", color: colors.textMuted, margin: 0 }}>Professional. Data-backed. Investor-ready.</p>
        </div>

        <div
          style={{
            display: isMobile ? "flex" : "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            overflowX: isMobile ? "auto" : "visible",
            gap: "18px",
            paddingBottom: isMobile ? "8px" : 0,
          }}
        >
          {REPORTS.map(r => {
            const style: React.CSSProperties = {
              textDecoration: "none", flexShrink: 0, width: isMobile ? "230px" : "auto",
              background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "16px",
              padding: "16px", boxShadow: colors.shadowSm, transition: "transform 0.15s, box-shadow 0.15s",
              display: "block", textAlign: "left", cursor: "pointer", boxSizing: "border-box",
            };
            const handlers = {
              onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = colors.shadowMd; },
              onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = colors.shadowSm; },
            };
            const inner = (
              <>
                <ReportPreview kind={r.kind} />
                <div style={{ fontSize: "14px", fontWeight: 700, color: colors.textMain, marginTop: "14px", marginBottom: "4px" }}>{r.title}</div>
                <div style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.5 }}>{r.text}</div>
              </>
            );
            return r.href ? (
              <a key={r.title} href={r.href} style={style} {...handlers}>{inner}</a>
            ) : (
              <button key={r.title} onClick={onOperatorClick} style={style} {...handlers}>{inner}</button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
