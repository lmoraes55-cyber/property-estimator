"use client";

import React, { useState, useRef, useCallback } from "react";
import SiteNav from "@/components/SiteNav";
import type { TitleDeedExtract } from "@/app/api/parse-title-deed/route";

const C = {
  primary:   "#1B5E4A",
  secondary: "#B88A44",
  bg:        "#F8F4EE",
  card:      "#FDFBF7",
  border:    "#E6E1D8",
  text:      "#1A1A1A",
  muted:     "#6B6B6B",
};

interface LTRStat {
  median: number;
  p25: number;
  p75: number;
  n: number;
  aedPerSqft?: number;
  asOf?: string;
  source: string;
}

interface RecentContract {
  date: string;
  annualRent: number;
  areaSqft: number;
  aedPerSqft: number;
}

interface RentResult {
  stat: LTRStat | null;
  source: string;
  windowDays?: number;
  recentContracts?: RecentContract[];
}

type Stage = "idle" | "uploading" | "done" | "error";

const BEDROOM_OPTIONS = ["Studio", "1BR", "2BR", "3BR", "4BR", "5BR"];

// Map display labels → estimator UnitSize keys
const BEDROOM_TO_UNIT_SIZE: Record<string, string> = {
  "Studio": "STU",
  "1BR": "1BR",
  "2BR": "2BR",
  "3BR": "3BR",
  "4BR": "4BR APT",
  "5BR": "5BR APT",
};

function suggestBedrooms(sqft: number | null): string | null {
  if (!sqft) return null;
  if (sqft < 550)  return "Studio";
  if (sqft < 1000) return "1BR";
  if (sqft < 1600) return "2BR";
  if (sqft < 2400) return "3BR";
  if (sqft < 3500) return "4BR";
  return "5BR";
}

function fmt(n: number) {
  return n.toLocaleString("en-AE");
}

function ConfidencePip({ level }: { level: "high" | "medium" | "low" }) {
  const map = {
    high:   { color: "#1B5E4A", label: "High confidence" },
    medium: { color: "#B88A44", label: "Medium confidence" },
    low:    { color: "#C0392B", label: "Low confidence — verify fields" },
  };
  const { color, label } = map[level];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color, fontWeight: 600 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{String(value)}</p>
    </div>
  );
}

export default function TitleDeedPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [extract, setExtract] = useState<TitleDeedExtract | null>(null);
  const [selectedBedrooms, setSelectedBedrooms] = useState<string | null>(null);
  const [rent, setRent] = useState<RentResult | null>(null);
  const [rentLoading, setRentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchRent = useCallback(async (deed: TitleDeedExtract, bedrooms: string) => {
    if (!deed.projectName || !bedrooms) return;
    setRentLoading(true);
    setRent(null);
    try {
      const params = new URLSearchParams({ project: deed.projectName, bedrooms });
      if (deed.areaName) params.set("area", deed.areaName);
      const res = await fetch(`/api/ltr-rents?${params}`);
      const data = await res.json() as RentResult;
      setRent(data);
    } catch {
      // rent lookup is best-effort
    } finally {
      setRentLoading(false);
    }
  }, []);

  const onBedroomSelect = useCallback((beds: string) => {
    setSelectedBedrooms(beds);
    if (extract) fetchRent(extract, beds);
  }, [extract, fetchRent]);

  const processFile = useCallback(async (file: File) => {
    const supported = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!supported.includes(file.type)) {
      setErrorMsg("Please upload a JPEG, PNG, WEBP, or PDF file.");
      setStage("error");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg("File is too large. Please use an image under 8 MB.");
      setStage("error");
      return;
    }

    // Show preview for images
    if (file.type !== "application/pdf") {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }

    setExtract(null);
    setRent(null);
    setStage("uploading");
    setErrorMsg("");

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/parse-title-deed", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Failed to read the title deed.");
        setStage("error");
        return;
      }

      const deed = data as TitleDeedExtract;
      const beds = deed.bedrooms ?? suggestBedrooms(deed.areaSqft);
      setExtract(deed);
      setSelectedBedrooms(beds);
      setStage("done");
      if (beds) await fetchRent(deed, beds);
    } catch {
      setErrorMsg("Network error — please try again.");
      setStage("error");
    }
  }, [fetchRent]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const reset = () => {
    setStage("idle");
    setPreview(null);
    setExtract(null);
    setSelectedBedrooms(null);
    setRent(null);
    setErrorMsg("");
  };

  const estimatorHref = (() => {
    if (!extract) return "/estimator";
    const p = new URLSearchParams();
    if (extract.projectName) p.set("building", extract.projectName);
    if (selectedBedrooms)    p.set("type", BEDROOM_TO_UNIT_SIZE[selectedBedrooms] ?? selectedBedrooms);
    if (extract.floor)       p.set("floor", extract.floor);
    if (extract.areaSqft)    p.set("sizeSqm", String(Math.round(extract.areaSqft / 10.7639)));
    if (extract.areaName)    p.set("dldArea", extract.areaName);
    return `/estimator?${p}`;
  })();

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>
      <SiteNav active="services" />

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.secondary, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
            Title Deed Scanner
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: C.text, lineHeight: 1.2, margin: "0 0 12px" }}>
            Upload your title deed
          </h1>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.6, maxWidth: 460, margin: "0 auto" }}>
            We read the property details directly from your DLD title deed — no manual entry required.
          </p>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 10 }}>
            🔒 Owner name is never extracted or stored. Property details only.
          </p>
        </div>

        {/* Upload zone */}
        {stage === "idle" && (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            style={{
              border: `2px dashed ${dragOver ? C.primary : C.border}`,
              borderRadius: 20,
              background: dragOver ? "#F0F7F3" : C.card,
              padding: "60px 32px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.18s",
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: "0 auto", display: "block" }}>
                <rect x="6" y="4" width="28" height="36" rx="3" stroke={C.secondary} strokeWidth="1.5" />
                <path d="M34 4v10h8" stroke={C.secondary} strokeWidth="1.5" strokeLinecap="round" />
                <path d="M34 4l8 10" stroke={C.secondary} strokeWidth="1.5" strokeLinecap="round" />
                <path d="M13 20h16M13 26h10" stroke={C.muted} strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="38" cy="36" r="7" fill={C.primary} />
                <path d="M38 32v8M34 36h8" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>
              Drop your title deed here
            </p>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
              or click to browse · JPEG, PNG, WEBP, or PDF · max 8 MB
            </p>
            <div style={{
              display: "inline-block",
              padding: "10px 24px",
              borderRadius: 999,
              background: `linear-gradient(135deg, ${C.primary} 0%, #2D7A5E 100%)`,
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              boxShadow: "0 4px 14px rgba(27,94,74,0.28)",
            }}>
              Choose file
            </div>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" onChange={onFileChange} style={{ display: "none" }} />
          </div>
        )}

        {/* Loading state */}
        {stage === "uploading" && (
          <div style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            padding: "48px 32px",
            textAlign: "center",
          }}>
            {preview && (
              <img src={preview} alt="Title deed preview" style={{ maxHeight: 200, maxWidth: "100%", objectFit: "contain", borderRadius: 10, marginBottom: 24, border: `1px solid ${C.border}` }} />
            )}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                border: `3px solid ${C.border}`,
                borderTopColor: C.primary,
                animation: "spin 0.8s linear infinite",
              }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>Reading title deed…</p>
            <p style={{ fontSize: 13, color: C.muted }}>This usually takes 3–6 seconds</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error state */}
        {stage === "error" && (
          <div style={{
            background: "#FFF5F5",
            border: "1px solid #FCA5A5",
            borderRadius: 20,
            padding: "32px",
            textAlign: "center",
          }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#C0392B", marginBottom: 8 }}>Could not read deed</p>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>{errorMsg}</p>
            <button onClick={reset} style={{
              padding: "10px 24px", borderRadius: 999, background: C.primary,
              color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
            }}>Try another file</button>
          </div>
        )}

        {/* Results */}
        {stage === "done" && extract && (
          <>
            {/* Deed image thumbnail */}
            {preview && (
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <img src={preview} alt="Title deed" style={{ maxHeight: 160, maxWidth: "100%", objectFit: "contain", borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.07)" }} />
              </div>
            )}

            {/* Extracted fields card */}
            <div style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 20,
              overflow: "hidden",
              marginBottom: 20,
              boxShadow: "0 4px 16px rgba(27,94,74,0.07)",
            }}>
              {/* Card header */}
              <div style={{
                padding: "16px 24px",
                borderBottom: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#E8F5EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l3.5 3.5L12 3" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Extracted from title deed</p>
                </div>
                <ConfidencePip level={extract.confidence} />
              </div>

              {/* Fields grid */}
              <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
                <Field label="Building / Project" value={extract.projectName} />
                <Field label="Unit Number" value={extract.unitNumber} />

                {/* Bedrooms — selector if deed didn't have it */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Bedrooms{!extract.bedrooms ? " — not on deed" : ""}
                  </p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {BEDROOM_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => onBedroomSelect(opt)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          border: `1.5px solid ${selectedBedrooms === opt ? C.primary : C.border}`,
                          background: selectedBedrooms === opt ? "#E8F5EE" : "transparent",
                          color: selectedBedrooms === opt ? C.primary : C.muted,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >{opt}</button>
                    ))}
                  </div>
                  {!extract.bedrooms && extract.areaSqft && (
                    <p style={{ fontSize: 11, color: C.secondary }}>
                      Suggested based on {fmt(extract.areaSqft)} sq.ft.
                    </p>
                  )}
                </div>

                <Field label="Area (sq.ft.)" value={extract.areaSqft ? fmt(extract.areaSqft) : null} />
                <Field label="DLD Area" value={extract.areaName} />
                <Field label="Property Type" value={extract.propertyType} />
                {extract.floor && <Field label="Floor" value={extract.floor} />}
                {extract.isFreehold !== null && <Field label="Tenure" value={extract.isFreehold ? "Freehold" : "Leasehold"} />}
                {extract.titleDeedNumber && <Field label="Title Deed No." value={extract.titleDeedNumber} />}
              </div>
            </div>

            {/* LTR Estimate card */}
            <div style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 20,
              overflow: "hidden",
              marginBottom: 20,
              boxShadow: "0 4px 16px rgba(27,94,74,0.07)",
            }}>
              <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Long-term rental estimate</p>
                {extract.projectName && selectedBedrooms && (
                  <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                    {extract.projectName} · {selectedBedrooms}
                  </p>
                )}
              </div>

              <div style={{ padding: "20px 24px" }}>
                {!extract.projectName || !selectedBedrooms ? (
                  <p style={{ fontSize: 13, color: C.muted }}>
                    Select a bedroom type above to get the rental estimate.
                  </p>
                ) : rentLoading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${C.border}`, borderTopColor: C.primary, animation: "spin 0.8s linear infinite" }} />
                    <p style={{ fontSize: 13, color: C.muted }}>Looking up DLD Ejari data…</p>
                  </div>
                ) : rent?.stat ? (
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                      <p style={{ fontSize: 28, fontWeight: 800, color: C.primary }}>
                        AED {fmt(rent.stat.median)}
                      </p>
                      <p style={{ fontSize: 14, color: C.muted }}>/year</p>
                    </div>
                    <div style={{ display: "flex", gap: 24, marginBottom: 8 }}>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Range</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>AED {fmt(rent.stat.p25)} – {fmt(rent.stat.p75)}</p>
                      </div>
                      {rent.stat.aedPerSqft && (
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Per sq.ft.</p>
                          <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>AED {rent.stat.aedPerSqft}</p>
                        </div>
                      )}
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Contracts</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{rent.stat.n} Ejari</p>
                      </div>
                    </div>
                    {rent.stat.asOf && (
                      <p style={{ fontSize: 11, color: C.muted }}>
                        {rent.windowDays ? `Last ${rent.windowDays} days` : `As of ${rent.stat.asOf}`} · {rent.source === "dda-live" || rent.source === "dda-live-cached" ? "Live DLD Ejari" : "AssetIntel database"}
                      </p>
                    )}

                    {/* Recent transactions */}
                    {rent.recentContracts && rent.recentContracts.length > 0 && (
                      <div style={{ marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
                          Most recent Ejari registrations
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {rent.recentContracts.map((c, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: i === 0 ? "#F0F7F3" : "#FAFAF8", borderRadius: 8 }}>
                              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                <p style={{ fontSize: 12, color: C.muted, minWidth: 76 }}>{c.date}</p>
                                {c.areaSqft > 0 && <p style={{ fontSize: 11, color: C.muted }}>{fmt(c.areaSqft)} sq.ft.</p>}
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>AED {fmt(c.annualRent)}</p>
                                {c.aedPerSqft > 0 && <p style={{ fontSize: 10, color: C.muted }}>{c.aedPerSqft}/sqft</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: C.muted }}>
                    No recent Ejari contracts found for this building — try the full estimator for area-based estimates.
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href={estimatorHref}
                style={{
                  flex: 1, minWidth: 180,
                  display: "block", textAlign: "center",
                  padding: "14px 20px",
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${C.primary} 0%, #2D7A5E 100%)`,
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(27,94,74,0.28)",
                }}
              >
                STR vs LTR Analysis →
              </a>
              <button
                onClick={reset}
                style={{
                  flex: 1, minWidth: 140,
                  padding: "14px 20px",
                  borderRadius: 14,
                  background: "transparent",
                  border: `1.5px solid ${C.border}`,
                  color: C.muted, fontSize: 14, fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Scan another deed
              </button>
            </div>

            {extract.confidence === "low" && (
              <p style={{ fontSize: 12, color: "#C0392B", textAlign: "center", marginTop: 14 }}>
                ⚠ Low confidence — some fields may be inaccurate. Please verify before relying on these figures.
              </p>
            )}
          </>
        )}

        {/* Help text */}
        {stage === "idle" && (
          <div style={{ marginTop: 32, padding: "20px 24px", background: "#F0F7F3", borderRadius: 16, border: `1px solid #C8E6D0` }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 8 }}>What we read from your deed</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
              {["Building / project name", "Unit & floor number", "Area in sq.ft.", "Bedroom type", "DLD area / district", "Freehold / leasehold"].map(item => (
                <p key={item} style={{ fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.secondary, display: "inline-block", flexShrink: 0 }} />
                  {item}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
