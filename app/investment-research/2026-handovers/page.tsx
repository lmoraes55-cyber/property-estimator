"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import AssetIntelLogo from "@/components/AssetIntelLogo";
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

const serifHeading: React.CSSProperties = { fontFamily: "'Georgia', serif" };

function TierBadge({ tier }: { tier: HandoverProject["strAreaTier"] }) {
  const cat = getTierCategory(tier);
  const c = TIER_COLORS[cat];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase",
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      borderRadius: 20, padding: "3px 10px",
    }}>
      {TIER_LABELS[cat]}
    </span>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const col = priority === "High" ? "#1B5E4A" : priority === "Medium" ? "#B88A44" : "#9A9A9A";
  return <span style={{ width: 7, height: 7, borderRadius: "50%", background: col, display: "inline-block", marginRight: 5 }} />;
}

// DLD developer verification badge — fetches live from DDA via our server-side proxy
function DeveloperBadge({ developerName }: { developerName: string }) {
  const [data, setData] = useState<DLDDeveloperResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/dld-developer?name=${encodeURIComponent(developerName)}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [developerName]);

  if (loading) {
    return (
      <span style={{ fontSize: 11, color: "#AAA", display: "inline-flex", alignItems: "center", gap: 5 }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" opacity="0.3"/><path d="M12 3a9 9 0 0 1 9 9"/>
        </svg>
        Checking DLD…
      </span>
    );
  }

  if (data?.matched) {
    const since = data.registrationYear;
    const num = data.developerNumber;
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 10.5, fontWeight: 700, color: "#1B5E4A",
        background: "#EEF5F1", border: "1px solid rgba(27,94,74,0.20)",
        borderRadius: 20, padding: "3px 10px",
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/>
        </svg>
        DLD Registered{since ? ` since ${since}` : ""}{num ? ` · #${num}` : ""}
      </span>
    );
  }

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 10.5, color: "#8B6914",
      background: "#FFF8EC", border: "1px solid #C9A84C40",
      borderRadius: 20, padding: "3px 10px",
    }}>
      DLD record not found
    </span>
  );
}

// Expanded project detail view
function ProjectDetail({ project, onClose }: { project: HandoverProject; onClose: () => void }) {
  const router = useRouter();
  const cat = getTierCategory(project.strAreaTier);

  const checklist = [
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

  const analyzeUrl = `/estimator?buildingName=${encodeURIComponent(project.projectName)}&source=2026-handover`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{
          background: "#F8F4EE",
          border: "1px solid #D8D4CC",
          boxShadow: "0 32px 80px rgba(27,94,74,0.18)",
          padding: "36px",
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 20, right: 20,
            width: 36, height: 36, borderRadius: "50%",
            background: "#F0EDEA", border: "1px solid #D8D4CC",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.secondary, marginBottom: 6 }}>
            2026 Handover Project
          </p>
          <h2 style={{ ...serifHeading, fontSize: 26, fontWeight: 700, color: colors.primary, lineHeight: 1.2, marginBottom: 12 }}>
            {project.projectName}
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <TierBadge tier={project.strAreaTier} />
            <span style={{ fontSize: 10, fontWeight: 600, background: "#F0F0F0", borderRadius: 20, padding: "3px 10px", color: "#555", display: "inline-flex", alignItems: "center" }}>
              <PriorityDot priority={project.leadPriority} />{project.leadPriority} Priority
            </span>
          </div>
        </div>

        {/* Details grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", marginBottom: 24 }}>
          {[
            { label: "Area", value: project.area },
            { label: "Property Type", value: project.propertyType },
            { label: "Expected Handover", value: project.expectedHandover },
            ...(project.launchPrice ? [{ label: "Launch Price", value: `AED ${project.launchPrice}` }] : []),
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "#9A9A9A", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: colors.textMain ?? "#1A1A1A" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Developer row with live DLD verification */}
        <div style={{ marginBottom: 20, padding: "14px 16px", background: "#FAFAF8", border: "1px solid #E8E4DE", borderRadius: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#9A9A9A", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Developer</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: colors.textMain ?? "#1A1A1A", margin: 0 }}>{project.developer}</p>
            <DeveloperBadge developerName={project.developer} />
          </div>
        </div>

        {/* AssetIntel view */}
        <div style={{
          background: "#F0F7F3",
          border: "1px solid rgba(27,94,74,0.15)",
          borderLeft: "3px solid #1B5E4A",
          borderRadius: 14, padding: "16px 18px", marginBottom: 20,
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: colors.primary, marginBottom: 6 }}>
            AssetIntel Initial View
          </p>
          <p style={{ fontSize: 13, color: "#333", lineHeight: 1.65 }}>{project.notes}</p>
        </div>

        {/* Best use case */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9A9A", marginBottom: 8 }}>
            Recommended Strategy Check
          </p>
          <p style={{ fontSize: 13, fontWeight: 600, color: colors.secondary }}>{project.bestUseCase}</p>
        </div>

        {/* Checklist */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9A9A", marginBottom: 12 }}>
            What AssetIntel Would Check Next
          </p>
          <div style={{ display: "grid", gap: 8 }}>
            {checklist.map(item => (
              <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                  <circle cx="12" cy="12" r="9.5" stroke={colors.primary} strokeWidth="1.2" opacity="0.4"/>
                  <path d="M7.5 12.3l2.8 2.8L16.5 9" stroke={colors.primary} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p style={{ fontSize: 13, color: "#444", lineHeight: 1.5 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Verification note */}
        <div style={{
          background: "#FFF8EC",
          border: "1px solid #C9A84C40",
          borderRadius: 12, padding: "12px 16px", marginBottom: 24,
          fontSize: 11, color: "#7A5C10", lineHeight: 1.6,
        }}>
          <strong style={{ display: "block", marginBottom: 3 }}>Verification required:</strong>
          {project.verificationStatus}
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push(analyzeUrl)}
          style={{
            width: "100%", padding: "14px 24px",
            borderRadius: 999,
            background: `linear-gradient(135deg, ${colors.primary} 0%, #2D7A5E 100%)`,
            color: "#FFF", fontSize: 14, fontWeight: 700,
            border: "none", cursor: "pointer",
            boxShadow: "0 8px 20px rgba(27,94,74,0.25)",
          }}
        >
          Run Rental Strategy Analysis
        </button>
      </div>
    </div>
  );
}

// Lead capture modal
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
    border: "1px solid #D8D4CC", background: "#FFF",
    fontSize: 13, color: "#1A1A1A", outline: "none",
    fontFamily: "inherit",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase", color: "#9A9A9A", marginBottom: 5, display: "block",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{
          background: "#F8F4EE",
          border: "1px solid #D8D4CC",
          boxShadow: "0 32px 80px rgba(27,94,74,0.18)",
          padding: "36px",
        }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{
          position: "absolute", top: 20, right: 20,
          width: 36, height: 36, borderRadius: "50%",
          background: "#F0EDEA", border: "1px solid #D8D4CC",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#EEF5F1", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>
              </svg>
            </div>
            <h3 style={{ ...serifHeading, fontSize: 22, fontWeight: 700, color: colors.primary, marginBottom: 12 }}>Enquiry Received</h3>
            <p style={{ fontSize: 14, color: "#555", lineHeight: 1.65, maxWidth: 360, margin: "0 auto" }}>
              Thank you — your enquiry has been received. AssetIntel will review your handover project and contact you with guidance on the right rental strategy.
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.secondary, marginBottom: 6 }}>
              2026 Handover Strategy Enquiry
            </p>
            <h2 style={{ ...serifHeading, fontSize: 22, fontWeight: 700, color: colors.primary, lineHeight: 1.25, marginBottom: 24 }}>
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
                <select
                  style={{ ...inputStyle, cursor: "pointer" }}
                  value={form.plan} onChange={e => set("plan", e.target.value)}
                >
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
                  padding: "13px 24px", borderRadius: 999,
                  background: `linear-gradient(135deg, ${colors.primary} 0%, #2D7A5E 100%)`,
                  color: "#FFF", fontSize: 14, fontWeight: 700,
                  border: "none", cursor: "pointer",
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

// Project card
function ProjectCard({ project, onClick }: { project: HandoverProject; onClick: () => void }) {
  const router = useRouter();
  const cat = getTierCategory(project.strAreaTier);
  const c = TIER_COLORS[cat];
  const analyzeUrl = `/estimator?buildingName=${encodeURIComponent(project.projectName)}&source=2026-handover`;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E0DDD8",
        borderRadius: 20,
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 8px 24px rgba(27,94,74,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "box-shadow 0.2s, transform 0.2s",
        cursor: "pointer",
      }}
      onClick={onClick}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.06), 0 16px 40px rgba(27,94,74,0.12)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.03), 0 8px 24px rgba(27,94,74,0.05)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Top badges */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <TierBadge tier={project.strAreaTier} />
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
          background: "#F5F5F5", borderRadius: 20, padding: "3px 10px",
          color: "#666", display: "inline-flex", alignItems: "center",
        }}>
          {project.expectedHandover}
        </span>
      </div>

      {/* Name + area */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", marginBottom: 3, lineHeight: 1.3 }}>
          {project.projectName}
        </h3>
        <p style={{ fontSize: 12, color: "#888" }}>{project.area} · {project.developer}</p>
      </div>

      {/* Notes */}
      <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6, flexGrow: 1 }}>
        {project.notes}
      </p>

      {/* Best use case */}
      <p style={{ fontSize: 11, fontWeight: 600, color: colors.secondary, letterSpacing: "0.05em" }}>
        {project.bestUseCase}
      </p>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          onClick={e => { e.stopPropagation(); router.push(analyzeUrl); }}
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 999,
            background: `linear-gradient(135deg, ${colors.primary} 0%, #2D7A5E 100%)`,
            color: "#FFF", fontSize: 12, fontWeight: 700,
            border: "none", cursor: "pointer",
          }}
        >
          Analyze This Project
        </button>
        <button
          onClick={e => { e.stopPropagation(); onClick(); }}
          style={{
            padding: "10px 14px", borderRadius: 999,
            background: "transparent",
            color: colors.primary, fontSize: 12, fontWeight: 600,
            border: `1px solid rgba(27,94,74,0.25)`, cursor: "pointer",
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default function HandoversPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterDeveloper, setFilterDeveloper] = useState("");
  const [filterQuarter, setFilterQuarter] = useState("");
  const [filterTier, setFilterTier] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [selectedProject, setSelectedProject] = useState<HandoverProject | null>(null);
  const [showLead, setShowLead] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return HANDOVER_PROJECTS.filter(p => {
      if (q && !p.projectName.toLowerCase().includes(q) && !p.area.toLowerCase().includes(q) && !p.developer.toLowerCase().includes(q)) return false;
      if (filterArea && p.area !== filterArea) return false;
      if (filterDeveloper && p.developer !== filterDeveloper) return false;
      if (filterQuarter && p.expectedHandover !== filterQuarter) return false;
      if (filterPriority && p.leadPriority !== filterPriority) return false;
      if (filterTier) {
        const cat = getTierCategory(p.strAreaTier);
        if (cat !== filterTier) return false;
      }
      return true;
    });
  }, [search, filterArea, filterDeveloper, filterQuarter, filterTier, filterPriority]);

  const selectStyle: React.CSSProperties = {
    padding: "9px 12px", borderRadius: 10,
    border: "1px solid #D8D4CC", background: "#FFF",
    fontSize: 12, color: "#333", cursor: "pointer",
    fontFamily: "inherit",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EE" }}>
      {/* Modals */}
      {selectedProject && <ProjectDetail project={selectedProject} onClose={() => setSelectedProject(null)} />}
      {showLead && <LeadModal onClose={() => setShowLead(false)} />}

      {/* Top nav */}
      <SiteNav active="insights" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Hero */}
        <div style={{ padding: "56px 0 40px", textAlign: "center", position: "relative" }}>
          {/* Subtle background gradient orb */}
          <div style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: 600, height: 300, borderRadius: "50%",
            background: `radial-gradient(ellipse, rgba(184,138,68,0.08) 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: colors.secondary, marginBottom: 16, position: "relative" }}>
            2026 Handover Intelligence · AssetIntel
          </p>
          <h1 style={{
            ...serifHeading,
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 700, lineHeight: 1.15,
            background: `linear-gradient(135deg, ${colors.primary} 0%, #4A8A6A 45%, ${colors.secondary} 100%)`,
            WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 16, position: "relative",
          }}>
            Your Dubai Property Is Handing Over in 2026.{" "}
            <br />
            Should You STR or LTR?
          </h1>
          <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, maxWidth: 580, margin: "0 auto 28px", position: "relative" }}>
            Explore upcoming handover projects and get a rental strategy view before you furnish, lease, or appoint an operator.
          </p>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 28, position: "relative" }}>
            {[
              { value: `${STATS.total}+`, label: "Projects tracked" },
              { value: `${STATS.prime}`, label: "Prime STR candidates" },
              { value: `${STATS.areas}`, label: "Dubai areas covered" },
            ].map(s => (
              <div key={s.label} style={{
                background: "#FFF", border: "1px solid #E0DDD8", borderRadius: 16,
                padding: "14px 22px", textAlign: "center",
                boxShadow: "0 2px 8px rgba(27,94,74,0.06)",
              }}>
                <p style={{ fontSize: 26, fontWeight: 700, color: colors.primary, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Hero CTAs */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
            <a href="#projects" style={{
              padding: "13px 28px", borderRadius: 999,
              background: `linear-gradient(135deg, ${colors.primary} 0%, #2D7A5E 100%)`,
              color: "#FFF", fontSize: 14, fontWeight: 700,
              textDecoration: "none", display: "inline-block",
              boxShadow: "0 8px 20px rgba(27,94,74,0.25)",
            }}>
              Check My Project
            </a>
            <button
              onClick={() => router.push("/estimator")}
              style={{
                padding: "13px 28px", borderRadius: 999,
                background: "transparent",
                border: `1.5px solid rgba(27,94,74,0.35)`,
                color: colors.primary, fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}
            >
              Analyze Rental Strategy
            </button>
          </div>
        </div>

        <AccessGate source="investment-research-2026-handovers" title="Unlock the Handover Watchlist" subtitle="Free — sign up or log in to see every tracked project and its rental strategy read.">
        {/* Strategy category legend */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12, marginBottom: 40,
        }}>
          {[
            { cat: "prime-str", icon: "M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z", desc: "Strong tourist/business areas where STR may be worth testing." },
            { cat: "selective-str", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", desc: "Can work, but depends heavily on unit, view, floor, and building rules." },
            { cat: "ltr-preferred", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", desc: "Likely better suited to long-term rental unless unit has strong STR appeal." },
            { cat: "needs-verification", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01", desc: "Handover timing, building rules, and market data need to be checked." },
          ].map(({ cat, icon, desc }) => {
            const key = cat as keyof typeof TIER_COLORS;
            const c = TIER_COLORS[key];
            return (
              <div key={cat} style={{
                background: c.bg, border: `1px solid ${c.border}`, borderRadius: 14,
                padding: "14px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icon}/>
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c.text }}>{TIER_LABELS[key]}</span>
                </div>
                <p style={{ fontSize: 11, color: "#666", lineHeight: 1.5 }}>{desc}</p>
              </div>
            );
          })}
        </div>

        {/* Search + filters */}
        <div id="projects" style={{
          background: "#FFF", border: "1px solid #E0DDD8", borderRadius: 20,
          padding: "20px 22px", marginBottom: 28,
          boxShadow: "0 2px 8px rgba(27,94,74,0.04)",
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            {/* Search */}
            <div style={{ position: "relative", flexGrow: 1, minWidth: 200 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round"
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                placeholder="Search project, area, or developer…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: "100%", padding: "9px 12px 9px 34px", borderRadius: 10,
                  border: "1px solid #D8D4CC", background: "#F8F4EE",
                  fontSize: 12, color: "#333", outline: "none", fontFamily: "inherit",
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
                style={{ fontSize: 12, color: "#888", background: "none", border: "none", cursor: "pointer", padding: "8px 4px" }}
              >
                Clear filters
              </button>
            )}
          </div>
          <p style={{ fontSize: 11, color: "#888", marginTop: 10 }}>
            Showing {filtered.length} of {HANDOVER_PROJECTS.length} projects
          </p>
        </div>

        {/* Projects grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
          gap: 16, marginBottom: 60,
        }}>
          {filtered.map(p => (
            <ProjectCard key={p.projectName} project={p} onClick={() => setSelectedProject(p)} />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", color: "#888" }}>
              <p style={{ fontSize: 14 }}>No projects match your filters.</p>
            </div>
          )}
        </div>

        {/* Lead capture CTA */}
        <div style={{
          borderRadius: 28, padding: "clamp(28px,5vw,48px) clamp(20px,4vw,40px)", textAlign: "center",
          background: `radial-gradient(ellipse 600px 300px at 50% 0%, rgba(27,94,74,0.06) 0%, transparent 70%), linear-gradient(135deg, #F7FAF8 0%, #FAFBF9 100%)`,
          border: "1px solid rgba(27,94,74,0.12)",
          boxShadow: "0 2px 8px rgba(27,94,74,0.04), 0 16px 48px rgba(27,94,74,0.07)",
          marginBottom: 36,
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: colors.secondary, marginBottom: 14 }}>
            Handover Strategy Advisory
          </p>
          <h2 style={{ ...serifHeading, fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, color: colors.primary, marginBottom: 12 }}>
            Need a Strategy Before Handover?
          </h2>
          <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, maxWidth: 500, margin: "0 auto 28px" }}>
            AssetIntel can help you decide whether to furnish, lease long-term, list short-term, self-manage, or appoint an operator before your unit is handed over.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setShowLead(true)}
              style={{
                padding: "13px 28px", borderRadius: 999,
                background: `linear-gradient(135deg, ${colors.primary} 0%, #2D7A5E 100%)`,
                color: "#FFF", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer",
                boxShadow: "0 8px 20px rgba(27,94,74,0.25)",
              }}
            >
              Request Handover Strategy Review
            </button>
            <button
              onClick={() => router.push("/estimator")}
              style={{
                padding: "13px 28px", borderRadius: 999,
                background: "transparent", border: "1.5px solid rgba(27,94,74,0.3)",
                color: colors.primary, fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}
            >
              Analyze Property
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          background: "#FFF8EC", border: "1px solid #C9A84C40",
          borderRadius: 16, padding: "18px 22px",
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#B88A44", marginBottom: 6 }}>
            Data Disclaimer
          </p>
          <p style={{ fontSize: 12, color: "#7A5C10", lineHeight: 1.7 }}>
            This watchlist is based on public-source handover information and AssetIntel internal classification. Handover dates, completion status, building rules, and rental suitability must be verified with official sources, developers, and relevant authorities before making investment or rental decisions. All projects are listed as leads requiring DLD/Mashrooi and developer verification.
          </p>
        </div>
        </AccessGate>

      </div>
    </div>
  );
}
