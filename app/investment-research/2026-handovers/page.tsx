/*
  DIRECTION CONTRACT (Impeccable new-work, surface scope — see PRODUCT.md / DESIGN.md)
  THESIS: A handover buyer has exactly one project they care about, not a catalog to
    browse — this page leads with finding it, not filtering a grid. Refuses the generic
    filter-bar + card-grid + modal default this page shipped with.
  OWN-WORLD: The Chartered Estate (unchanged, established brand commitment per
    PRODUCT.md) — forest green/bronze on warm ivory, Georgia serif, restrained
    lift+shadow. No new palette, no new type, no new material.
  STORY: A buyer searches for their project, and the page transforms into a dedicated
    countdown/strategy focus view for it — handover window, STR/LTR verdict, live DLD
    developer check, AssetIntel's read, and a concrete next-step checklist — promoted
    from a modal into the main event. The full browsable catalog is demoted to a
    secondary "Browse All" section for buyers who don't have a project yet.
  FIRST VIEWPORT: Serif H1 stating the real question, then the search box itself as the
    primary object — not a stat-pill row.
  FORM: Candidate 7 of 7 grounded structures (lookup-first single-project focus mode) —
    assigned by concept-seed.mjs (key ec51f4bc, surface scope, operate mode).
  FINISH: unreviewed and undocumented is unfinished; this build ends with the finish
    review, the verdict, and DESIGN.md.
*/
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import AccessGate from "@/components/AccessGate";
import type { DLDDeveloperResult } from "@/app/api/dld-developer/route";
import {
  HANDOVER_PROJECTS,
  UNIQUE_AREAS,
  UNIQUE_DEVELOPERS,
  STATS,
  getTierCategory,
  TIER_LABELS,
  TIER_COLORS,
  type HandoverProject,
} from "@/data/dubai-2026-handovers";
import { colors } from "@/lib/colors";

const QUARTERS = ["Q2 2026", "Q3 2026", "Q3 2026 / July 2026", "Q4 2026", "2026"];
const PRIORITIES = ["High", "Medium", "Low"];

const serif = "'Georgia', serif";

function TierBadge({ tier, size = "md" }: { tier: HandoverProject["strAreaTier"]; size?: "sm" | "md" }) {
  const cat = getTierCategory(tier);
  const c = TIER_COLORS[cat];
  const sm = size === "sm";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: sm ? 9.5 : 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      borderRadius: 20, padding: sm ? "3px 9px" : "4px 12px",
    }}>
      {TIER_LABELS[cat]}
    </span>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const col = priority === "High" ? colors.primary : priority === "Medium" ? colors.secondary : "#9A9A9A";
  return <span style={{ width: 7, height: 7, borderRadius: "50%", background: col, display: "inline-block", marginRight: 5 }} />;
}

// Live DLD developer verification badge — fetched via server-side DDA proxy.
function DeveloperBadge({ developerName }: { developerName: string }) {
  const [data, setData] = useState<DLDDeveloperResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/dld-developer?name=${encodeURIComponent(developerName)}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [developerName]);

  if (loading) {
    return (
      <span style={{ fontSize: 11.5, color: colors.textLight, display: "inline-flex", alignItems: "center", gap: 6 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" opacity="0.3" /><path d="M12 3a9 9 0 0 1 9 9" />
        </svg>
        Checking DLD…
      </span>
    );
  }

  if (data?.matched) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 11.5, fontWeight: 700, color: colors.primary,
        background: colors.bgSage, border: `1px solid ${colors.borderSage}`,
        borderRadius: 20, padding: "4px 11px",
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" />
        </svg>
        DLD Registered{data.registrationYear ? ` since ${data.registrationYear}` : ""}{data.developerNumber ? ` · #${data.developerNumber}` : ""}
      </span>
    );
  }

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11.5, color: colors.secondaryText,
      background: "rgba(184,138,68,0.08)", border: "1px solid rgba(184,138,68,0.25)",
      borderRadius: 20, padding: "4px 11px",
    }}>
      DLD record not found
    </span>
  );
}

const CHECKLIST = [
  "Unit size and bedroom count",
  "Floor number and view type",
  "Furnished or unfurnished requirement",
  "Expected service charges",
  "Building holiday-home licensing rules",
  "Comparable STR listings in the area",
  "Long-term rental benchmark (DLD data)",
  "Operator availability and fee structure",
  "Handover and snagging timeline",
];

// ── FOCUS PANEL — the promoted primary object. Was a modal; now the main event. ──
function FocusPanel({ project, onClear }: { project: HandoverProject; onClear: () => void }) {
  const router = useRouter();
  const analyzeUrl = `/estimator?buildingName=${encodeURIComponent(project.projectName)}&source=2026-handover`;

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
        Your 2026 Handover
      </p>
      <h2 style={{ fontFamily: serif, fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 700, color: colors.primary, lineHeight: 1.2, marginBottom: 14, maxWidth: 560 }}>
        {project.projectName}
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
        <TierBadge tier={project.strAreaTier} />
        <span style={{ fontSize: 11, fontWeight: 600, background: colors.bgSage, borderRadius: 20, padding: "4px 12px", color: colors.textMuted, display: "inline-flex", alignItems: "center" }}>
          <PriorityDot priority={project.leadPriority} />{project.leadPriority} Priority
        </span>
      </div>

      {/* Handover window — the real, sourced fact, not a fabricated countdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px 28px", marginBottom: 26, paddingBottom: 26, borderBottom: `1px solid ${colors.border}` }}>
        {[
          { label: "Handover Window", value: project.expectedHandover },
          { label: "Area", value: project.area },
          { label: "Property Type", value: project.propertyType },
          ...(project.launchPrice ? [{ label: "Launch Price", value: `AED ${project.launchPrice}` }] : []),
        ].map(({ label, value }) => (
          <div key={label}>
            <p style={{ fontSize: 10, fontWeight: 700, color: colors.textLight, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: colors.textMain, fontFamily: serif }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Developer */}
      <div style={{ marginBottom: 22, padding: "16px 18px", background: colors.bgMain, border: `1px solid ${colors.border}`, borderRadius: 14 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: colors.textLight, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 8 }}>Developer</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <p style={{ fontSize: 15.5, fontWeight: 700, color: colors.textMain, margin: 0 }}>{project.developer}</p>
          <DeveloperBadge developerName={project.developer} />
        </div>
      </div>

      {/* AssetIntel view — kept visually distinct from sourced data, per PRODUCT.md */}
      <div style={{
        background: colors.bgSage, border: `1px solid ${colors.borderSage}`,
        borderRadius: 14, padding: "18px 20px", marginBottom: 22,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(27,94,74,0.12)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
          </span>
          <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.primary, margin: 0 }}>
            AssetIntel's Initial View — Directional, Not Measured
          </p>
        </div>
        <p style={{ fontSize: 13.5, color: colors.textMain, lineHeight: 1.65, marginBottom: project.recommendedNextStep ? 12 : 0 }}>{project.notes}</p>
        {project.recommendedNextStep && (
          <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: colors.textMain }}>Recommended next step:</strong> {project.recommendedNextStep}
          </p>
        )}
      </div>

      {/* Best use case */}
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.textLight, marginBottom: 8 }}>
          Recommended Strategy Check
        </p>
        <p style={{ fontSize: 14, fontWeight: 700, color: colors.secondaryText }}>{project.bestUseCase}</p>
      </div>

      {/* Checklist */}
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.textLight, marginBottom: 14 }}>
          What To Check Before Handover
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "8px 20px" }}>
          {CHECKLIST.map(item => (
            <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                <circle cx="12" cy="12" r="9.5" stroke={colors.primary} strokeWidth="1.2" opacity="0.4" />
                <path d="M7.5 12.3l2.8 2.8L16.5 9" stroke={colors.primary} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.5, margin: 0 }}>{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Verification note */}
      <div style={{
        background: "rgba(184,138,68,0.08)", border: "1px solid rgba(184,138,68,0.25)",
        borderRadius: 12, padding: "14px 18px", marginBottom: 26,
        fontSize: 12, color: colors.secondaryText, lineHeight: 1.6,
      }}>
        <strong style={{ display: "block", marginBottom: 3, color: colors.textMain }}>Verification required:</strong>
        {project.verificationStatus}
        {project.sourceNote && <span style={{ display: "block", marginTop: 6, opacity: 0.85 }}>Source: {project.sourceNote}</span>}
      </div>

      <button
        onClick={() => router.push(analyzeUrl)}
        style={{
          padding: "15px 26px", borderRadius: 12,
          background: `linear-gradient(135deg, ${colors.primary} 0%, #0F3E33 100%)`,
          color: "#FFF", fontSize: 14.5, fontWeight: 700,
          border: "none", cursor: "pointer", boxShadow: "0 8px 20px rgba(27,94,74,0.25)",
        }}
      >
        Run Rental Strategy Analysis →
      </button>
    </section>
  );
}

// ── Search — the primary object of the first viewport. ──
function ProjectSearch({ onSelect }: { onSelect: (p: HandoverProject) => void }) {
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
    return HANDOVER_PROJECTS.filter(p =>
      p.projectName.toLowerCase().includes(q) || p.area.toLowerCase().includes(q) || p.developer.toLowerCase().includes(q)
    ).slice(0, 7);
  }, [query]);

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
          placeholder="Search your project, building, or area…"
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
              key={p.projectName}
              onClick={() => { onSelect(p); setQuery(""); setOpen(false); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                padding: "13px 18px", background: "transparent", border: "none", borderBottom: `1px solid ${colors.border}`,
                cursor: "pointer", textAlign: "left",
              }}
            >
              <span>
                <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: colors.textMain }}>{p.projectName}</span>
                <span style={{ fontSize: 12, color: colors.textMuted }}>{p.area} · {p.developer}</span>
              </span>
              <TierBadge tier={p.strAreaTier} size="sm" />
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
function ProjectCard({ project, onClick }: { project: HandoverProject; onClick: () => void }) {
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
        <TierBadge tier={project.strAreaTier} size="sm" />
        <span style={{ fontSize: 10, fontWeight: 600, background: colors.bgSage, borderRadius: 20, padding: "3px 10px", color: colors.textMuted }}>
          {project.expectedHandover}
        </span>
      </div>
      <div>
        <h3 style={{ fontSize: 15.5, fontWeight: 700, color: colors.textMain, marginBottom: 3, lineHeight: 1.3, fontFamily: serif }}>
          {project.projectName}
        </h3>
        <p style={{ fontSize: 12, color: colors.textLight, margin: 0 }}>{project.area} · {project.developer}</p>
      </div>
      <p style={{ fontSize: 12.5, color: colors.textMuted, lineHeight: 1.6, flexGrow: 1, margin: 0 }}>{project.notes}</p>
      <p style={{ fontSize: 11.5, fontWeight: 700, color: colors.secondaryText, margin: 0 }}>{project.bestUseCase}</p>
    </button>
  );
}

export default function HandoversPage() {
  const [selectedProject, setSelectedProject] = useState<HandoverProject | null>(null);
  const [showLead, setShowLead] = useState(false);
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterDeveloper, setFilterDeveloper] = useState("");
  const [filterQuarter, setFilterQuarter] = useState("");
  const [filterTier, setFilterTier] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const router = useRouter();
  const focusRef = useRef<HTMLDivElement>(null);

  function selectAndScroll(p: HandoverProject) {
    setSelectedProject(p);
    requestAnimationFrame(() => focusRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return HANDOVER_PROJECTS.filter(p => {
      if (q && !p.projectName.toLowerCase().includes(q) && !p.area.toLowerCase().includes(q) && !p.developer.toLowerCase().includes(q)) return false;
      if (filterArea && p.area !== filterArea) return false;
      if (filterDeveloper && p.developer !== filterDeveloper) return false;
      if (filterQuarter && p.expectedHandover !== filterQuarter) return false;
      if (filterPriority && p.leadPriority !== filterPriority) return false;
      if (filterTier && getTierCategory(p.strAreaTier) !== filterTier) return false;
      return true;
    });
  }, [search, filterArea, filterDeveloper, filterQuarter, filterTier, filterPriority]);

  const selectStyle: React.CSSProperties = {
    padding: "9px 12px", borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.bgSection,
    fontSize: 12, color: colors.textMain, cursor: "pointer", fontFamily: "inherit",
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.bgMain }}>
      {showLead && <LeadModal onClose={() => setShowLead(false)} />}
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
            Find your project below for its handover window, an STR/LTR read, live DLD developer verification, and what to check before you furnish, lease, or appoint an operator.
          </p>

          <ProjectSearch onSelect={selectAndScroll} />

          <p style={{ fontSize: 12, color: colors.textLight, marginTop: 18 }}>
            Tracking {STATS.total}+ 2026 handover projects across {STATS.areas} Dubai areas · {STATS.prime} flagged prime STR candidates
          </p>
        </div>

        <AccessGate source="investment-research-2026-handovers" title="Unlock the Handover Watchlist" subtitle="Free — sign up or log in to see every tracked project and its rental strategy read.">

          <div ref={focusRef} style={{ scrollMarginTop: 24 }}>
            {selectedProject && (
              <div style={{ marginBottom: 48 }}>
                <FocusPanel project={selectedProject} onClear={() => setSelectedProject(null)} />
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
              Filter by area, developer, quarter, or how strong the STR case looks — {TIER_LABELS["prime-str"]}, {TIER_LABELS["selective-str"]}, or {TIER_LABELS["ltr-preferred"]}.
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
                  placeholder="Search project, area, or developer…"
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
                {UNIQUE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <select style={selectStyle} value={filterDeveloper} onChange={e => setFilterDeveloper(e.target.value)}>
                <option value="">All Developers</option>
                {UNIQUE_DEVELOPERS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select style={selectStyle} value={filterQuarter} onChange={e => setFilterQuarter(e.target.value)}>
                <option value="">All Quarters</option>
                {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
              <select style={selectStyle} value={filterTier} onChange={e => setFilterTier(e.target.value)}>
                <option value="">All Tiers</option>
                <option value="prime-str">Prime STR</option>
                <option value="selective-str">Selective STR</option>
                <option value="ltr-preferred">LTR Preferred</option>
              </select>
              <select style={selectStyle} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                <option value="">All Priorities</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {(search || filterArea || filterDeveloper || filterQuarter || filterTier || filterPriority) && (
                <button
                  onClick={() => { setSearch(""); setFilterArea(""); setFilterDeveloper(""); setFilterQuarter(""); setFilterTier(""); setFilterPriority(""); }}
                  style={{ fontSize: 12, color: colors.textMuted, background: "none", border: "none", cursor: "pointer", padding: "8px 4px" }}
                >
                  Clear filters
                </button>
              )}
            </div>
            <p style={{ fontSize: 11, color: colors.textLight, marginTop: 10, marginBottom: 0 }}>
              Showing {filtered.length} of {HANDOVER_PROJECTS.length} projects
            </p>
          </div>

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, marginBottom: 56 }}>
            {filtered.map(p => (
              <ProjectCard key={p.projectName} project={p} onClick={() => selectAndScroll(p)} />
            ))}
            {filtered.length === 0 && (
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
              This watchlist is based on public-source handover information and AssetIntel's own internal classification. Handover dates, completion status, building rules, and rental suitability must be verified with official sources, developers, and relevant authorities before making investment or rental decisions. All projects are listed as leads requiring DLD/Mashrooi and developer verification.
            </p>
          </div>
        </AccessGate>
      </div>

      <style>{`
        .hh-card { transition: box-shadow 180ms ease, transform 180ms ease, border-color 180ms ease; }
        .hh-card:hover { box-shadow: ${colors.shadowMd}; transform: translateY(-2px); border-color: rgba(184,138,68,0.35); }
      `}</style>
    </div>
  );
}

// ── Lead capture modal — a genuinely protected-focus task, kept as a modal. ──
function LeadModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", project: "", area: "", handover: "",
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
