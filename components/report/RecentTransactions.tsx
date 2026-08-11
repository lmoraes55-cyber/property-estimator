"use client";

import React, { useEffect, useState } from "react";
import { colors } from "@/lib/colors";
import { fmt } from "@/lib/estimator";

interface RecentContract {
  date: string;
  annualRent: number;
  areaSqft: number;
  aedPerSqft: number;
}

interface Props {
  buildingName: string;
  dldKey?: string;
  dldArea?: string;
  unitSize: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function RecentTransactions({ buildingName, dldKey, dldArea, unitSize }: Props) {
  const [contracts, setContracts] = useState<RecentContract[] | null>(null);

  useEffect(() => {
    const project = dldKey || buildingName;
    if (!project || !unitSize) { setContracts([]); return; }
    let cancelled = false;
    const qs = new URLSearchParams({ project, bedrooms: unitSize });
    if (dldArea) qs.set("area", dldArea);
    fetch(`/api/ltr-rents?${qs}`)
      .then(r => r.json())
      .then((data: { recentContracts?: RecentContract[] }) => {
        if (cancelled) return;
        setContracts((data.recentContracts ?? []).slice(0, 3));
      })
      .catch(() => { if (!cancelled) setContracts([]); });
    return () => { cancelled = true; };
  }, [buildingName, dldKey, dldArea, unitSize]);

  if (!contracts || contracts.length === 0) return null;

  return (
    <div className="pdf-section" style={{ borderRadius: 24, background: "#fff", border: `1px solid ${colors.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 10px 30px rgba(27,94,74,0.06)", padding: "22px 24px", breakInside: "avoid" as const }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: colors.textMain, marginBottom: 4 }}>Recent Long-Term Transactions</p>
      <p style={{ fontSize: 12, color: colors.textLight, marginBottom: 16 }}>Most recent registered {unitSize} contracts in {buildingName}, from live DLD Ejari data.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, padding: "0 4px" }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.textLight }}>Date</span>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.textLight }}>Annual Rent</span>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.textLight }}>Size</span>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.textLight }}>AED/sqft</span>
        </div>
        {contracts.map((c, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, alignItems: "center", padding: "10px 4px", borderTop: `1px solid ${colors.border}` }}>
            <span style={{ fontSize: 13, color: colors.textMuted }}>{formatDate(c.date)}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: colors.textMain }}>AED {fmt(c.annualRent)}</span>
            <span style={{ fontSize: 13, color: colors.textMuted }}>{c.areaSqft ? `${fmt(c.areaSqft)} sqft` : "—"}</span>
            <span style={{ fontSize: 13, color: colors.textMuted }}>{c.aedPerSqft ? `AED ${c.aedPerSqft}` : "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
