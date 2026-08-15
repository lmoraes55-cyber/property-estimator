/*
  DIRECTION CONTRACT (Impeccable new-work, surface scope — see PRODUCT.md / DESIGN.md)
  THESIS: A handover buyer has exactly one project they care about, not a catalog to
    browse — this page leads with finding it, not filtering a grid. Refuses the generic
    filter-bar + card-grid + modal default this page shipped with.
  OWN-WORLD: The Chartered Estate (unchanged, established brand commitment per
    PRODUCT.md) — forest green/bronze on warm ivory, Georgia serif, restrained
    lift+shadow. No new palette, no new type, no new material.
  STORY: A buyer searches for their project, and the page transforms into a dedicated
    handover-status focus view for it — real DLD handover date, construction progress,
    STR/LTR area read — promoted from a modal into the main event. The full browsable
    catalog is demoted to a secondary "Browse All" section for buyers who don't have a
    project yet.
  FIRST VIEWPORT: Serif H1 stating the real question, then the search box itself as the
    primary object — not a stat-pill row.
  FORM: Candidate 7 of 7 grounded structures (lookup-first single-project focus mode) —
    assigned by concept-seed.mjs (key ec51f4bc, surface scope, operate mode).
  DATA: Rewired 2026-08-14 from a hand-curated/Bayut-scraped 38-project static list to
    live DLD data (dld_projects-open-api via the weekly dld-2026-handovers-refresh
    cron) — 309 real ACTIVE projects with a 2026 project_end_date, refreshed weekly.
    Every project here is DLD-verified by construction; no separate "verification
    status" field or per-project notes exist anymore, since curated editorial context
    doesn't exist for most of the 309. STR/LTR read is area-level (lib/dld-area-tier.ts,
    AssetIntel's own directional model), not per-project.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the finish
    review, the verdict, and DESIGN.md.
*/
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import AccessGate from "@/components/AccessGate";
import DecorativeBackdrop from "@/components/DecorativeBackdrop";
import type { DLD2026Handover } from "@/lib/dld-2026-handovers";
import type { STRTierCategory } from "@/lib/dld-area-tier";
import { colors } from "@/lib/colors";

const serif = "'Georgia', serif";

const TIER_LABELS: Record<STRTierCategory, string> = {
  "prime-str": "Prime STR Candidate",
  "selective-str": "Selective STR",
  "ltr-preferred": "LTR Preferred",
  "needs-verification": "Needs Verification",
};

const TIER_COLORS: Record<STRTierCategory, { bg: string; border: string; text: string }> = {
  "prime-str":          { bg: "#EEF5F1", border: "rgba(27,94,74,0.25)", text: "#1B5E4A" },
  "selective-str":      { bg: "#FBF6EE", border: "rgba(184,138,68,0.30)", text: "#8B6914" },
  "ltr-preferred":      { bg: "#F5F5F5", border: "#D0CCC8", text: "#555" },
  "needs-verification": { bg: "#FFF8EC", border: "#C9A84C", text: "#8B6914" },
};

function tierOf(p: DLD2026Handover): STRTierCategory {
  return (p.str_area_tier as STRTierCategory) ?? "needs-verification";
}

function displayName(p: DLD2026Handover): string {
  return p.project_name_en || p.master_project_en || p.area_name_en;
}

// The community/cluster context line under the name — shown whenever it adds
// information beyond the name itself (skipped if displayName already used it).
function displaySubtitle(p: DLD2026Handover): string {
  const name = displayName(p);
  const parts = [p.master_project_en, p.area_name_en].filter((v, i, arr) => v && v !== name && arr.indexOf(v) === i);
  return parts.length ? parts.join(" · ") : p.area_name_en;
}

function quarterOf(dateStr: string | null): string {
  if (!dateStr) return "Date pending";
  const d = new Date(dateStr);
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `Q${q} ${d.getFullYear()}`;
}

function TierBadge({ tier, size = "md" }: { tier: STRTierCategory; size?: "sm" | "md" }) {
  const c = TIER_COLORS[tier];
  const sm = size === "sm";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: sm ? 9.5 : 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      borderRadius: 20, padding: sm ? "3px 9px" : "4px 12px",
    }}>
      {TIER_LABELS[tier]}
    </span>
  );
}

// ── FOCUS PANEL — the promoted primary object. Was a modal; now the main event. ──
interface RecentSale {
  date: string;
  price: number;
  areaSqft: number;
  aedPerSqft: number;
  offPlan: boolean;
}
interface SaleStat {
  medianPrice: number;
  medianAedPerSqft: number;
  offPlanShare: number;
  n: number;
  asOf: string;
}

function FocusPanel({ project, onClear, onRequestReview }: { project: DLD2026Handover; onClear: () => void; onRequestReview: (project: DLD2026Handover) => void }) {
  const name = displayName(project);
  const tier = tierOf(project);

  const [saleStat, setSaleStat] = useState<SaleStat | null>(null);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);

  // Resale activity is only meaningful for the specific building — master_project_en
  // is a community name shared by many towers, so we skip the lookup rather than
  // blend unrelated buildings' transactions together under one project's name.
  useEffect(() => {
    setSaleStat(null);
    setRecentSales([]);
    if (!project.project_name_en) return;
    setSalesLoading(true);
    fetch(`/api/sale-transactions?project=${encodeURIComponent(project.project_name_en)}`)
      .then(r => r.json())
      .then(d => { setSaleStat(d.stat ?? null); setRecentSales(d.recentTransactions ?? []); })
      .catch(() => {})
      .finally(() => setSalesLoading(false));
  }, [project.project_name_en]);

  return (
    <section
      style={{
        background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 22,
        padding: "clamp(28px,4vw,40px)", boxShadow: colors.shadowMd, position: "relative",
      }}
    >
      <button
        onClick={onClear}
        style={{
          position: "absolute", top: 20, right: 20,
          fontSize: 12, fontWeight: 600, color: colors.textMuted,
          background: "transparent", border: `1px solid ${colors.border}`, borderRadius: 999,
          padding: "6px 14px", cursor: "pointer",
        }}
      >
        ← Search another project
      </button>

      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.secondaryText, marginBottom: 10 }}>
        Your 2026 Handover · Live DLD Data
      </p>
      <h2 style={{ fontFamily: serif, fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 700, color: colors.primary, lineHeight: 1.2, marginBottom: 6, maxWidth: 560 }}>
        {name}
      </h2>
      <p style={{ fontSize: 13.5, color: colors.textMuted, marginBottom: 20 }}>{displaySubtitle(project)}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
        <TierBadge tier={tier} />
        <span style={{ fontSize: 11, fontWeight: 600, background: colors.bgSage, borderRadius: 20, padding: "4px 12px", color: colors.textMuted, display: "inline-flex", alignItems: "center" }}>
          {project.project_status === "ACTIVE" ? "Under construction" : project.project_status}
        </span>
      </div>

      {/* Real DLD facts — no fabricated countdown, no invented certainty */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px 28px", marginBottom: 26, paddingBottom: 26, borderBottom: `1px solid ${colors.border}` }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: colors.textLight, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>Handover Window</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: colors.textMain, fontFamily: serif }}>{quarterOf(project.project_end_date)}</p>
        </div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: colors.textLight, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>DLD Area</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: colors.textMain, fontFamily: serif }}>{project.area_name_en}</p>
        </div>
        {project.percent_completed != null && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: colors.textLight, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>Construction Progress</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: colors.textMain, fontFamily: serif }}>{project.percent_completed.toFixed(0)}% complete</p>
          </div>
        )}
        {project.no_of_units != null && project.no_of_units > 0 && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: colors.textLight, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>Units</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: colors.textMain, fontFamily: serif }}>{project.no_of_units.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Recent resale activity — real DLD transaction data (dld_transactions-open-api),
          only looked up against the specific building's own project_name_en, never the
          shared community name, so numbers aren't blended across unrelated towers. */}
      {project.project_name_en && (
        <div style={{ marginBottom: 26, paddingBottom: 26, borderBottom: `1px solid ${colors.border}` }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.textLight, marginBottom: 12 }}>
            Recent Resale Activity — Live DLD Transactions
          </p>
          {salesLoading && (
            <p style={{ fontSize: 13, color: colors.textMuted }}>Checking DLD transaction records…</p>
          )}
          {!salesLoading && !saleStat && (
            <p style={{ fontSize: 13, color: colors.textMuted }}>No resale transactions recorded for this building yet — common for newer off-plan launches.</p>
          )}
          {!salesLoading && saleStat && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px 28px", marginBottom: 18 }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: colors.textLight, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>Median Resale Price</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: colors.textMain, fontFamily: serif }}>AED {saleStat.medianPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: colors.textLight, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>Price / sqft</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: colors.textMain, fontFamily: serif }}>AED {saleStat.medianAedPerSqft.toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: colors.textLight, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>Transactions (12mo)</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: colors.textMain, fontFamily: serif }}>{saleStat.n}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: colors.textLight, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>Off-Plan Share</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: colors.textMain, fontFamily: serif }}>{Math.round(saleStat.offPlanShare * 100)}%</p>
                </div>
              </div>
              {recentSales.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {recentSales.map((s, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                      fontSize: 12.5, padding: "8px 10px", background: colors.bgMain, borderRadius: 8,
                    }}>
                      <span style={{ color: colors.textLight, minWidth: 72 }}>{s.date}</span>
                      <span style={{ color: colors.textMain, fontWeight: 600, flexGrow: 1 }}>AED {s.price.toLocaleString()}</span>
                      <span style={{ color: colors.textMuted }}>{s.areaSqft.toLocaleString()} sqft</span>
                      <span style={{ color: colors.textMuted }}>AED {s.aedPerSqft.toLocaleString()}/sqft</span>
                      {s.offPlan && (
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: colors.secondaryText, background: "rgba(184,138,68,0.12)", borderRadius: 20, padding: "2px 8px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                          Off-Plan
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p style={{ fontSize: 10.5, color: colors.textLight, marginTop: 10 }}>As of {saleStat.asOf} · Dubai Land Department sales registry</p>
            </>
          )}
        </div>
      )}

      {/* Area-level STR/LTR read — AssetIntel's own directional model, kept visually
          distinct from the DLD-sourced facts above, per PRODUCT.md */}
      <div style={{
        background: colors.bgSage, border: `1px solid ${colors.borderSage}`,
        borderRadius: 14, padding: "18px 20px", marginBottom: 22,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(27,94,74,0.12)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
          </span>
          <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.primary, margin: 0 }}>
            AssetIntel's Area Read — Directional, Not Per-Project
          </p>
        </div>
        <p style={{ fontSize: 13.5, color: colors.textMain, lineHeight: 1.65, margin: 0 }}>
          {tier === "prime-str" && `${project.area_name_en} has strong tourist/business STR demand — worth testing short-term rental here, subject to your unit's view, floor, and furnishing.`}
          {tier === "selective-str" && `${project.area_name_en} can work for STR, but performance depends heavily on the specific unit, view, floor, and building rules — verify before committing.`}
          {tier === "ltr-preferred" && `${project.area_name_en} is likely better suited to long-term rental — this area doesn't currently show strong tourist-driven STR demand.`}
          {tier === "needs-verification" && `AssetIntel hasn't classified ${project.area_name_en}'s STR potential yet — run the full estimator for a property-level read.`}
        </p>
      </div>

      {/* Verification note */}
      <div style={{
        background: "rgba(184,138,68,0.08)", border: "1px solid rgba(184,138,68,0.25)",
        borderRadius: 12, padding: "14px 18px", marginBottom: 26,
        fontSize: 12, color: colors.secondaryText, lineHeight: 1.6,
      }}>
        Sourced directly from the Dubai Land Department's own project registry (dld_projects-open-api) and, where available, its sales transaction registry (dld_transactions-open-api) — not a third-party listing scrape. Construction progress, handover dates, and resale activity can still shift; confirm directly with the developer before making decisions.
      </div>

      <button
        onClick={() => onRequestReview(project)}
        style={{
          padding: "15px 26px", borderRadius: 12,
          background: `linear-gradient(135deg, ${colors.primary} 0%, #0F3E33 100%)`,
          color: "#FFF", fontSize: 14.5, fontWeight: 700,
          border: "none", cursor: "pointer", boxShadow: "0 8px 20px rgba(27,94,74,0.25)",
        }}
      >
        Request Handover Strategy Review →
      </button>
    </section>
  );
}

// ── Search — the primary object of the first viewport. ──
function ProjectSearch({ projects, onSelect }: { projects: DLD2026Handover[]; onSelect: (p: DLD2026Handover) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return projects.filter(p =>
      displayName(p).toLowerCase().includes(q) ||
      p.area_name_en.toLowerCase().includes(q) ||
      (p.master_project_en?.toLowerCase().includes(q) ?? false)
    ).slice(0, 7);
  }, [query, projects]);

  return (
    <div ref={ref} style={{ position: "relative", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ position: "relative" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.textLight} strokeWidth="2" strokeLinecap="round"
          style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)" }}>
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search your project or area…"
          style={{
            width: "100%", padding: "18px 20px 18px 50px", borderRadius: 999,
            border: `1.5px solid ${colors.border}`, background: colors.bgSection,
            fontSize: 15.5, color: colors.textMain, outline: "none", fontFamily: "inherit",
            boxShadow: colors.shadowMd, boxSizing: "border-box",
          }}
        />
      </div>
      {open && matches.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 30,
          background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 16,
          boxShadow: colors.shadowLg, overflow: "hidden", textAlign: "left",
        }}>
          {matches.map(p => (
            <button
              key={p.project_id}
              onClick={() => { onSelect(p); setQuery(""); setOpen(false); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                padding: "13px 18px", background: "transparent", border: "none", borderBottom: `1px solid ${colors.border}`,
                cursor: "pointer", textAlign: "left",
              }}
            >
              <span>
                <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: colors.textMain }}>{displayName(p)}</span>
                <span style={{ fontSize: 12, color: colors.textMuted }}>{displaySubtitle(p)} · {quarterOf(p.project_end_date)}</span>
              </span>
              <TierBadge tier={tierOf(p)} size="sm" />
            </button>
          ))}
        </div>
      )}
      {open && query.trim().length >= 2 && matches.length === 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 30,
          background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 16,
          boxShadow: colors.shadowLg, padding: "16px 18px", fontSize: 13, color: colors.textMuted, textAlign: "left",
        }}>
          No tracked project matches "{query}" yet — browse the full watchlist below.
        </div>
      )}
    </div>
  );
}

// ── Browse-all card — demoted secondary path for buyers without a project yet. ──
function ProjectCard({ project, onClick }: { project: DLD2026Handover; onClick: () => void }) {
  const tier = tierOf(project);
  return (
    <button
      onClick={onClick}
      className="hh-card"
      style={{
        background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 18,
        padding: 22, boxShadow: colors.shadowSm, display: "flex", flexDirection: "column", gap: 12,
        cursor: "pointer", textAlign: "left", fontFamily: "inherit",
      }}
    >
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <TierBadge tier={tier} size="sm" />
        <span style={{ fontSize: 10, fontWeight: 600, background: colors.bgSage, borderRadius: 20, padding: "3px 10px", color: colors.textMuted }}>
          {quarterOf(project.project_end_date)}
        </span>
      </div>
      <div>
        <h3 style={{ fontSize: 15.5, fontWeight: 700, color: colors.textMain, marginBottom: 3, lineHeight: 1.3, fontFamily: serif }}>
          {displayName(project)}
        </h3>
        <p style={{ fontSize: 12, color: colors.textLight, margin: 0 }}>{displaySubtitle(project)}</p>
      </div>
      <p style={{ fontSize: 12.5, color: colors.textMuted, lineHeight: 1.6, margin: 0 }}>
        {project.percent_completed != null ? `${project.percent_completed.toFixed(0)}% complete` : "Progress pending"}
        {project.no_of_units ? ` · ${project.no_of_units.toLocaleString()} units` : ""}
      </p>
    </button>
  );
}

export default function HandoversPage() {
  const [allProjects, setAllProjects] = useState<DLD2026Handover[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<DLD2026Handover | null>(null);
  const [showLead, setShowLead] = useState(false);
  const [leadPrefill, setLeadPrefill] = useState<{ project: string; area: string } | null>(null);
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterTier, setFilterTier] = useState("");
  const router = useRouter();
  const focusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/dld-2026-handovers")
      .then(r => r.json())
      .then(({ data }: { data: DLD2026Handover[] }) => setAllProjects(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function selectAndScroll(p: DLD2026Handover) {
    setSelectedProject(p);
    requestAnimationFrame(() => focusRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  const uniqueAreas = useMemo(() => Array.from(new Set(allProjects.map(p => p.area_name_en))).sort(), [allProjects]);
  const primeCount = useMemo(() => allProjects.filter(p => tierOf(p) === "prime-str").length, [allProjects]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allProjects.filter(p => {
      if (q &&
        !displayName(p).toLowerCase().includes(q) &&
        !p.area_name_en.toLowerCase().includes(q) &&
        !(p.master_project_en?.toLowerCase().includes(q) ?? false)
      ) return false;
      if (filterArea && p.area_name_en !== filterArea) return false;
      if (filterTier && tierOf(p) !== filterTier) return false;
      return true;
    });
  }, [allProjects, search, filterArea, filterTier]);

  const selectStyle: React.CSSProperties = {
    padding: "9px 12px", borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.bgSection,
    fontSize: 12, color: colors.textMain, cursor: "pointer", fontFamily: "inherit",
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.bgMain, position: "relative" }}>
      <DecorativeBackdrop />
      {showLead && (
        <LeadModal
          onClose={() => { setShowLead(false); setLeadPrefill(null); }}
          initialProject={leadPrefill?.project ?? ""}
          initialArea={leadPrefill?.area ?? ""}
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
      <SiteNav active="insights" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* ── HERO: the search itself is the thesis ── */}
        <div style={{ padding: "56px 0 44px", textAlign: "center" }}>
          <h1 style={{
            fontFamily: serif, fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 700, color: colors.primary,
            lineHeight: 1.2, marginBottom: 14, maxWidth: 640, margin: "0 auto 14px",
          }}>
            Your Dubai property hands over in 2026. Should you STR or LTR it?
          </h1>
          <p style={{ fontSize: 14.5, color: colors.textMuted, lineHeight: 1.65, maxWidth: 540, margin: "0 auto 32px" }}>
            Live Dubai Land Department project data — search your project for its real handover date, construction progress, and an area-level STR/LTR read.
          </p>

          <ProjectSearch projects={allProjects} onSelect={selectAndScroll} />

          <p style={{ fontSize: 12, color: colors.textLight, marginTop: 18 }}>
            {loading ? "Loading live DLD data…" : `Tracking ${allProjects.length} DLD-registered 2026 handovers across ${uniqueAreas.length} Dubai areas · ${primeCount} in prime STR areas`}
          </p>
        </div>

        <AccessGate source="investment-research-2026-handovers" title="Unlock the Handover Watchlist" subtitle="Free — sign up or log in to see every tracked project and its rental strategy read.">

          <div ref={focusRef} style={{ scrollMarginTop: 24 }}>
            {selectedProject && (
              <div style={{ marginBottom: 48 }}>
                <FocusPanel
                  project={selectedProject}
                  onClear={() => setSelectedProject(null)}
                  onRequestReview={(p) => { setLeadPrefill({ project: displayName(p), area: p.area_name_en }); setShowLead(true); }}
                />
              </div>
            )}
          </div>

          {/* ── BROWSE ALL — demoted secondary path ── */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.secondaryText, marginBottom: 10 }}>
              {selectedProject ? "Or Browse the Full Watchlist" : "Don't Know Your Project Yet?"}
            </p>
            <h2 style={{ fontFamily: serif, fontSize: "clamp(20px, 2.6vw, 26px)", fontWeight: 700, color: colors.primary, marginBottom: 8 }}>
              Browse tracked handover projects
            </h2>
            <p style={{ fontSize: 13.5, color: colors.textMuted, lineHeight: 1.6, maxWidth: 620 }}>
              Filter by area or how strong the STR case looks — {TIER_LABELS["prime-str"]}, {TIER_LABELS["selective-str"]}, or {TIER_LABELS["ltr-preferred"]}.
            </p>
          </div>

          {/* Filters */}
          <div style={{
            background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 18,
            padding: "18px 20px", marginBottom: 24, boxShadow: colors.shadowSm,
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <div style={{ position: "relative", flexGrow: 1, minWidth: 200 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textLight} strokeWidth="2" strokeLinecap="round"
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  placeholder="Search project or area…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: "100%", padding: "9px 12px 9px 34px", borderRadius: 10,
                    border: `1px solid ${colors.border}`, background: colors.bgMain,
                    fontSize: 12, color: colors.textMain, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                  }}
                />
              </div>
              <select style={selectStyle} value={filterArea} onChange={e => setFilterArea(e.target.value)}>
                <option value="">All Areas</option>
                {uniqueAreas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <select style={selectStyle} value={filterTier} onChange={e => setFilterTier(e.target.value)}>
                <option value="">All Tiers</option>
                <option value="prime-str">Prime STR</option>
                <option value="selective-str">Selective STR</option>
                <option value="ltr-preferred">LTR Preferred</option>
                <option value="needs-verification">Needs Verification</option>
              </select>
              {(search || filterArea || filterTier) && (
                <button
                  onClick={() => { setSearch(""); setFilterArea(""); setFilterTier(""); }}
                  style={{ fontSize: 12, color: colors.textMuted, background: "none", border: "none", cursor: "pointer", padding: "8px 4px" }}
                >
                  Clear filters
                </button>
              )}
            </div>
            <p style={{ fontSize: 11, color: colors.textLight, marginTop: 10, marginBottom: 0 }}>
              {loading ? "Loading…" : `Showing ${filtered.length} of ${allProjects.length} projects`}
            </p>
          </div>

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, marginBottom: 56 }}>
            {filtered.map(p => (
              <ProjectCard key={p.project_id} project={p} onClick={() => selectAndScroll(p)} />
            ))}
            {!loading && filtered.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "50px 20px", color: colors.textMuted }}>
                <p style={{ fontSize: 14 }}>No projects match your filters.</p>
              </div>
            )}
          </div>

          {/* Lead capture CTA */}
          <div style={{
            borderRadius: 22, padding: "clamp(28px,5vw,40px) clamp(20px,4vw,36px)", textAlign: "center",
            background: `radial-gradient(ellipse 600px 300px at 50% 0%, rgba(27,94,74,0.06) 0%, transparent 70%), linear-gradient(135deg, #F7FAF8 0%, #FAFBF9 100%)`,
            border: `1px solid ${colors.borderSage}`, boxShadow: colors.shadowSm, marginBottom: 32,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: colors.secondaryText, marginBottom: 12 }}>
              Handover Strategy Advisory
            </p>
            <h2 style={{ fontFamily: serif, fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, color: colors.primary, marginBottom: 12 }}>
              Need a strategy before handover?
            </h2>
            <p style={{ fontSize: 13.5, color: colors.textMuted, lineHeight: 1.65, maxWidth: 480, margin: "0 auto 26px" }}>
              AssetIntel can help you decide whether to furnish, lease long-term, list short-term, self-manage, or appoint an operator before your unit is handed over.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => setShowLead(true)}
                style={{
                  padding: "13px 26px", borderRadius: 12,
                  background: `linear-gradient(135deg, ${colors.primary} 0%, #0F3E33 100%)`,
                  color: "#FFF", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(27,94,74,0.25)",
                }}
              >
                Request Handover Strategy Review
              </button>
              <button
                onClick={() => router.push("/estimator")}
                style={{
                  padding: "13px 26px", borderRadius: 12,
                  background: "transparent", border: `1.5px solid ${colors.border}`,
                  color: colors.primary, fontSize: 14, fontWeight: 700, cursor: "pointer",
                }}
              >
                Analyze Property
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ background: "rgba(184,138,68,0.06)", border: "1px solid rgba(184,138,68,0.22)", borderRadius: 16, padding: "18px 22px" }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.secondaryText, marginBottom: 8 }}>
              Data Disclaimer
            </p>
            <p style={{ fontSize: 12, color: colors.secondaryText, lineHeight: 1.7, margin: 0 }}>
              Handover dates, construction progress, and unit counts come directly from Dubai Land Department's own project registry, refreshed weekly — not a third-party listing scrape. STR/LTR area classification is AssetIntel's own directional model, not a DLD-sourced figure. Confirm directly with the developer before making investment or rental decisions.
            </p>
          </div>
        </AccessGate>
      </div>
      </div>

      <style>{`
        .hh-card { transition: box-shadow 180ms ease, transform 180ms ease, border-color 180ms ease; }
        .hh-card:hover { box-shadow: ${colors.shadowMd}; transform: translateY(-2px); border-color: rgba(184,138,68,0.35); }
      `}</style>
    </div>
  );
}

// ── Lead capture modal — a genuinely protected-focus task, kept as a modal. ──
function LeadModal({ onClose, initialProject = "", initialArea = "" }: { onClose: () => void; initialProject?: string; initialArea?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", project: initialProject, area: initialArea, handover: "",
    unitType: "", propertyValue: "", plan: "", notes: "",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "2026-handover-enquiry" }),
      });
    } catch { /* ignore */ }
    setSubmitted(true);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: `1px solid ${colors.border}`, background: "#FFF",
    fontSize: 13, color: colors.textMain, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase", color: colors.textLight, marginBottom: 5, display: "block",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(23,48,31,0.45)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{ background: colors.bgMain, border: `1px solid ${colors.border}`, boxShadow: colors.shadowLg, padding: 36 }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{
          position: "absolute", top: 20, right: 20, width: 36, height: 36, borderRadius: "50%",
          background: colors.bgSection, border: `1px solid ${colors.border}`, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: colors.bgSage, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <h3 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: colors.primary, marginBottom: 12 }}>Enquiry Received</h3>
            <p style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.65, maxWidth: 360, margin: "0 auto" }}>
              Thank you — your enquiry has been received. AssetIntel will review your handover project and contact you with guidance on the right rental strategy.
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.secondaryText, marginBottom: 6 }}>
              2026 Handover Strategy Enquiry
            </p>
            <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: colors.primary, lineHeight: 1.25, marginBottom: 24 }}>
              Tell us about your property
            </h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input required style={inputStyle} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input required type="email" style={inputStyle} value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@email.com" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Phone / WhatsApp</label>
                <input style={inputStyle} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+971 50 000 0000" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Project / Building Name</label>
                  <input style={inputStyle} value={form.project} onChange={e => set("project", e.target.value)} placeholder="e.g. Marina Shores" />
                </div>
                <div>
                  <label style={labelStyle}>Area</label>
                  <input style={inputStyle} value={form.area} onChange={e => set("area", e.target.value)} placeholder="e.g. Dubai Marina" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Expected Handover</label>
                  <input style={inputStyle} value={form.handover} onChange={e => set("handover", e.target.value)} placeholder="e.g. Q4 2026" />
                </div>
                <div>
                  <label style={labelStyle}>Unit Type</label>
                  <input style={inputStyle} value={form.unitType} onChange={e => set("unitType", e.target.value)} placeholder="e.g. 2BR Apartment" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Property Value (AED) — if known</label>
                <input style={inputStyle} value={form.propertyValue} onChange={e => set("propertyValue", e.target.value)} placeholder="e.g. 2,500,000" />
              </div>
              <div>
                <label style={labelStyle}>Current Plan</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={form.plan} onChange={e => set("plan", e.target.value)}>
                  <option value="">Select your current thinking</option>
                  {["Not sure yet", "Short-term rental", "Long-term rental", "Self-manage", "Use operator", "Sell after handover"].map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Message / Notes</label>
                <textarea
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                  value={form.notes}
                  onChange={e => set("notes", e.target.value)}
                  placeholder="Any additional details or questions..."
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: "13px 24px", borderRadius: 12,
                  background: `linear-gradient(135deg, ${colors.primary} 0%, #0F3E33 100%)`,
                  color: "#FFF", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(27,94,74,0.25)",
                }}
              >
                Submit Enquiry
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
