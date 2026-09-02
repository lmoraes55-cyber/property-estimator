"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DET_FULL_INVENTORY } from "@/lib/det-inventory";
import AssetIntelLogo from "@/components/AssetIntelLogo";

const C = {
  green: "#1B5E4A",
  greenDark: "#133D30",
  gold: "#B88A44",
  ivory: "#FFFFFF",
  bg: "#F7F9F8",
  border: "#E2E8E5",
  text: "#1B2A1F",
  muted: "#4E5D56",
};

const CAT_ICONS: Record<string, string> = {
  "Compliance & Safety": "🛡️",
  "Living & Dining": "🛋️",
  "Bedroom Essentials": "🛏️",
  "Kitchen & Appliances": "🍳",
  "Bathroom Amenities": "🚿",
  "Utilities & Upkeep": "🧹",
};

const UNIT_LABEL: Record<string, string> = {
  Studio: "Studio",
  "1BR": "1 Bedroom",
  "2BR": "2 Bedrooms",
  "3BR": "3 Bedrooms",
  "4BR": "4 Bedrooms",
};

function normalizeUnitSize(raw: string | null): string {
  if (!raw) return "1BR";
  const u = raw.toUpperCase().replace(/\s/g, "");
  if (u.includes("STUDIO")) return "Studio";
  if (u.includes("4")) return "4BR";
  if (u.includes("3")) return "3BR";
  if (u.includes("2")) return "2BR";
  return "1BR";
}

function ChecklistContent() {
  const params = useSearchParams();
  const rawUnit = params.get("unitSize");
  const propertyName = params.get("propertyName") || "";
  const buildingName = params.get("buildingName") || "";

  const unitKey = normalizeUnitSize(rawUnit);
  const items = DET_FULL_INVENTORY[unitKey] ?? DET_FULL_INVENTORY["1BR"];

  const categories = Array.from(new Set(items.map((i) => i.cat)));
  const grandTotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>

      {/* Nav — hidden on print */}
      <div className="no-print" style={{ position: "sticky", top: 0, zIndex: 100, padding: "12px 16px" }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          background: "rgba(255, 255, 255,0.96)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
          border: `1px solid ${C.border}`, borderRadius: 24,
          boxShadow: "0 2px 4px rgba(0,0,0,0.03), 0 8px 28px rgba(27,94,74,0.09)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px", height: 68, gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <AssetIntelLogo size={28} />
            <div style={{ borderLeft: `1px solid ${C.border}`, paddingLeft: 12 }}>
              <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>DET Compliance Checklist</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>
                {UNIT_LABEL[unitKey]}{buildingName ? ` · ${buildingName}` : ""}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="/DET_Holiday_Home_Compliance_Pricing_Master.xlsx" download style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 16px", borderRadius: 10,
              background: "transparent", color: C.green,
              border: `1.5px solid rgba(27,94,74,0.25)`,
              fontSize: 13, fontWeight: 600, textDecoration: "none", cursor: "pointer",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Excel
            </a>
            <button onClick={() => window.print()} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 16px", borderRadius: 10,
              background: C.green, color: "#fff", border: "none",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(27,94,74,0.22)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* Page body */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }} className="print-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div className="no-print" style={{ display: "inline-flex" }}>
              <AssetIntelLogo size={22} />
            </div>
            <span style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              DET Dubai Holiday Homes · Inventory Compliance Checklist
            </span>
          </div>
          <h1 style={{ fontSize: 31, fontWeight: 600, color: C.text, margin: "0 0 6px", fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif" }}>
            {UNIT_LABEL[unitKey]} Unit — DET Compliance Inventory
          </h1>
          {(propertyName || buildingName) && (
            <p style={{ fontSize: 14, color: C.muted, margin: "0 0 4px" }}>
              {[propertyName, buildingName].filter(Boolean).join(" · ")}
            </p>
          )}
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
            All items below are required to meet Dubai Economy & Tourism (DET) holiday home compliance standards.
            Quantities and prices are approximate guides — actual costs vary by supplier and finish tier.
          </p>
        </div>

        {/* Summary bar */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
          marginBottom: 32,
        }}>
          {[
            { label: "Total Items", value: items.length.toString() },
            { label: "Categories", value: categories.length.toString() },
            { label: "Estimated Total", value: `AED ${grandTotal.toLocaleString()}` },
          ].map(s => (
            <div key={s.label} style={{
              background: C.ivory, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "16px 20px",
            }}>
              <p style={{ fontSize: 11, color: C.muted, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: s.label === "Estimated Total" ? C.green : C.text, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Category sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {categories.map((cat) => {
            const catItems = items.filter(i => i.cat === cat);
            const catTotal = catItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);
            return (
              <div key={cat} style={{
                background: C.ivory, border: `1px solid ${C.border}`,
                borderRadius: 16, overflow: "hidden",
              }}>
                {/* Category header */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 20px", background: "#F2EFE9",
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{CAT_ICONS[cat] ?? "📦"}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{cat}</span>
                    <span style={{ fontSize: 11, color: C.muted, background: "#E8E4DC", padding: "2px 8px", borderRadius: 20 }}>
                      {catItems.length} items
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>
                    AED {catTotal.toLocaleString()}
                  </span>
                </div>

                {/* Items table */}
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {["Item", "DET Specification", "Qty", "Unit Price", "Total"].map((h, i) => (
                        <th key={h} style={{
                          padding: "9px 14px", textAlign: i >= 2 ? "center" : "left",
                          fontSize: 11, fontWeight: 700, color: C.muted,
                          textTransform: "uppercase", letterSpacing: "0.06em",
                          background: "#F8F6F2",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {catItems.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: `1px solid #F0EDE8` }}>
                        <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: C.text, width: "28%" }}>
                          {row.item}
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 12, color: C.muted, width: "38%" }}>
                          {row.spec}
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 13, color: C.text, textAlign: "center", width: "8%" }}>
                          {row.qty}
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 13, color: C.text, textAlign: "center", width: "13%" }}>
                          AED {row.unitPrice.toLocaleString()}
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: C.green, textAlign: "center", width: "13%" }}>
                          AED {(row.qty * row.unitPrice).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

        {/* Grand total */}
        <div style={{
          marginTop: 24,
          background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`,
          borderRadius: 16, padding: "20px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Total Estimated Setup Cost
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", margin: 0 }}>
              {UNIT_LABEL[unitKey]} · {items.length} items · prices are approximate guides
            </p>
          </div>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#fff", margin: 0 }}>
            AED {grandTotal.toLocaleString()}
          </p>
        </div>

        {/* Footer note */}
        <p style={{ fontSize: 11, color: "#AAA", textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
          Prepared by AssetIntel · assetintel.ae · Prices are indicative and subject to supplier variation. DET regulations updated periodically — verify with official DET portal before purchase.
        </p>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 20mm; }
        }
      `}</style>
    </div>
  );
}

export default function ChecklistPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F9F8" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #1B5E4A", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      </div>
    }>
      <ChecklistContent />
    </Suspense>
  );
}
