"use client";

/**
 * RENT PROVENANCE
 *
 * Shows the three tiers a long-term rent figure can come from — this building,
 * its master community, and the pooled DLD administrative area — side by side,
 * and marks which one actually produced the number in the report.
 *
 * This exists because the gap between the tiers is large and invisible. Marsa
 * Dubai is one DLD area covering Dubai Marina, JBR, Dubai Harbour and
 * Bluewaters, whose 2-bed medians run 137,500 / 121,500 / 182,500 / 425,000
 * against a pooled area figure of 151,500 — a number no building in the area
 * actually charges. A report that quotes the area figure without saying so
 * reads as building-specific when it is not.
 *
 * Series colours come from the validated categorical palette in lib/colors.ts.
 * They are not interchangeable with brand colours — do not substitute by eye.
 */

import React from "react";
import { colors } from "@/lib/colors";
import {
  lookupDLDBuilding,
  lookupDLDMaster,
  lookupDLDArea,
  getMasterForBuilding,
  type RentStat,
} from "@/lib/building-rents";
import type { UnitSize } from "@/lib/estimator";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

type TierKey = "building" | "master" | "area";

interface Tier {
  key: TierKey;
  label: string;
  stat: RentStat;
  color: string;
}

export default function RentProvenance({
  buildingName,
  unitSize,
  dldArea,
  usedBasis,
}: {
  buildingName?: string;
  unitSize: UnitSize;
  dldArea?: string;
  /** Which tier the estimator actually used, so the chart can mark it. */
  usedBasis?: "dld-building" | "dld-master" | "dld-area" | "table";
}) {
  const tiers: Tier[] = [];

  const building = buildingName ? lookupDLDBuilding(buildingName, unitSize, dldArea) : null;
  if (building) {
    tiers.push({ key: "building", label: buildingName || "This building", stat: building, color: colors.series[0] });
  }

  const masterName = buildingName ? getMasterForBuilding(buildingName, dldArea) : null;
  const master = masterName ? lookupDLDMaster(masterName, unitSize) : null;
  if (master && masterName) {
    tiers.push({ key: "master", label: masterName, stat: master, color: colors.series[2] });
  }

  const area = dldArea ? lookupDLDArea(dldArea, unitSize) : null;
  if (area && dldArea) {
    tiers.push({ key: "area", label: `${dldArea} (all buildings)`, stat: area, color: colors.series[1] });
  }

  // Nothing to compare against — one tier alone tells no story worth a section.
  if (tiers.length < 2) return null;

  const used: TierKey | null =
    usedBasis === "dld-building" ? "building"
    : usedBasis === "dld-master" ? "master"
    : usedBasis === "dld-area" ? "area"
    : null;

  const max = Math.max(...tiers.map(t => t.stat.p75 ?? t.stat.median)) * 1.06;

  // The headline: how far the pooled area figure sits from the building's own.
  const b = tiers.find(t => t.key === "building")?.stat.median;
  const a = tiers.find(t => t.key === "area")?.stat.median;
  const gapPct = b && a ? Math.round(((a - b) / b) * 100) : null;

  return (
    <section
      style={{
        background: colors.bgSection,
        border: `1px solid ${colors.border}`,
        borderRadius: 22,
        padding: "24px 26px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono-ai), ui-monospace, monospace",
          fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase",
          color: colors.textLight, margin: "0 0 6px",
        }}
      >
        Where this rent comes from
      </p>
      <h2
        className="ai-title-grad"
        style={{
          fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif",
          fontSize: "clamp(19px, 2.1vw, 25px)", fontWeight: 400,
          letterSpacing: "-0.015em", lineHeight: 1.2, color: colors.textMain, margin: "0 0 6px",
        }}
      >
        Three tiers of DLD evidence
      </h2>
      <p style={{ fontSize: 13.5, color: colors.textMuted, margin: "0 0 18px", maxWidth: "62ch", lineHeight: 1.55 }}>
        The most specific tier with enough registered contracts wins. The gap between them is
        why the tier is worth naming{gapPct !== null && Math.abs(gapPct) >= 5
          ? ` — the pooled area figure sits ${Math.abs(gapPct)}% ${gapPct > 0 ? "above" : "below"} this building's own.`
          : "."}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {tiers.map(t => {
          const isUsed = used === t.key;
          const w = (t.stat.median / max) * 100;
          const hasRange = t.stat.p25 != null && t.stat.p75 != null;
          const rl = hasRange ? (t.stat.p25! / max) * 100 : 0;
          const rw = hasRange ? ((t.stat.p75! - t.stat.p25!) / max) * 100 : 0;

          return (
            <div
              key={t.key}
              title={`${t.label} — AED ${fmt(t.stat.median)} from ${t.stat.n} registered contracts`}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,150px) 1fr 112px",
                alignItems: "center", gap: 14,
                padding: "10px 12px", borderRadius: 12,
                background: isUsed ? "rgba(27,94,74,0.045)" : "transparent",
                border: `1px solid ${isUsed ? "rgba(27,94,74,0.14)" : "transparent"}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, background: t.color, flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: 13, color: colors.textMain,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    fontWeight: isUsed ? 500 : 400,
                  }}
                >
                  {t.label}
                </span>
              </div>

              <div style={{ position: "relative", height: 30 }}>
                <div style={{ position: "absolute", top: 3, left: 0, width: `${w}%`, height: 15, borderRadius: "0 4px 4px 0", background: t.color }} />
                {hasRange && (
                  <>
                    <div style={{ position: "absolute", top: 22, left: `${rl}%`, width: `${rw}%`, height: 3, borderRadius: 2, background: colors.borderStrong }} />
                    <div style={{ position: "absolute", top: 19, left: `${rl}%`, width: 2, height: 9, borderRadius: 1, background: colors.borderStrong }} />
                    <div style={{ position: "absolute", top: 19, left: `calc(${rl}% + ${rw}%)`, width: 2, height: 9, borderRadius: 1, background: colors.borderStrong }} />
                  </>
                )}
              </div>

              <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                <span style={{ fontFamily: "var(--font-mono-ai), ui-monospace, monospace", fontSize: 13, color: colors.textMain }}>
                  {fmt(t.stat.median)}
                </span>
                <span style={{ display: "block", fontSize: 10.5, color: colors.textLight, letterSpacing: "0.02em" }}>
                  n={t.stat.n}{isUsed ? " · used" : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex", flexWrap: "wrap", gap: 16,
          marginTop: 14, paddingTop: 14, borderTop: `1px solid ${colors.border}`,
        }}
      >
        {tiers.map(t => (
          <span key={t.key} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: colors.textMuted }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: t.color }} />
            {t.key === "building" ? "This building" : t.key === "master" ? "Community" : "Pooled DLD area"}
          </span>
        ))}
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: colors.textMuted }}>
          <span style={{ width: 14, height: 3, borderRadius: 2, background: colors.borderStrong }} />
          p25–p75, shown at n ≥ 10
        </span>
      </div>
    </section>
  );
}
