"use client";

import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { BUILDINGS_DATABASE } from "@/lib/buildings-data";
import { BUILDING_DIRECTORY } from "@/lib/estimator";
import { getDLDBuildingList, type DLDBuildingEntry } from "@/lib/building-rents";
import { DLD_AREA_TO_COMMUNITY } from "@/lib/dld-area-map";

const C = {
  green: "#1B5E4A",
  greenLight: "#EFF4F0",
  bronze: "#B88A44",
  border: "#E6E1D8",
  text: "#2A2A2A",
  muted: "#6B6B6B",
  card: "#fff",
  bg: "#F8F4EE",
};

const DLD_BUILDINGS: DLDBuildingEntry[] = getDLDBuildingList();
const ALL_BUILDINGS = new Set([...Object.keys(BUILDINGS_DATABASE), ...Object.keys(BUILDING_DIRECTORY)]);

interface Property {
  id: string;
  building_name: string;
  area: string;
  unit_size: string;
  unit_type: string;
  floor: number;
  view: string;
  furnishing_status: string;
  property_condition: string;
  property_value: number;
  notes: string;
  created_at: string;
}

const UNIT_SIZES = ["STU", "1BR", "2BR", "3BR", "4BR", "5BR+"];
const UNIT_TYPES = ["Apartment", "Villa"];
const VIEWS = [
  "Burj / Downtown Skyline",
  "Marina / Waterfront",
  "Sea View",
  "Golf / Park View",
  "Community View",
  "Standard View",
];
const FURNISHING = ["Furnished", "Unfurnished"];
const CONDITIONS = ["Standard", "Semi Upgraded", "Fully Upgraded"];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  fontSize: 14,
  color: C.text,
  background: "#FDFBF7",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 500,
  color: C.text,
  marginBottom: 5,
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Building autocomplete
  const [buildingSearch, setBuildingSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dldKey, setDldKey] = useState("");
  const [dldArea, setDldArea] = useState("");
  const buildingRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    building_name: "",
    unit_size: "1BR",
    unit_type: "Apartment",
    floor: "",
    view: "Standard View",
    furnishing_status: "Furnished",
    property_condition: "Standard",
    property_value: "",
    notes: "",
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (buildingRef.current && !buildingRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const q = buildingSearch.toLowerCase();
  const filteredDLD: DLDBuildingEntry[] = q.length >= 2
    ? DLD_BUILDINGS.filter(b => b.displayName.toLowerCase().includes(q)).slice(0, 8)
    : [];
  const filteredCurated = q.length >= 2
    ? [...ALL_BUILDINGS]
        .filter(b => b.toLowerCase().includes(q) && !filteredDLD.some(d => d.displayName.toLowerCase() === b.toLowerCase()))
        .slice(0, Math.max(0, 8 - filteredDLD.length))
    : [];

  function selectBuilding(name: string, key = "", area = "") {
    setForm(f => ({ ...f, building_name: name }));
    setBuildingSearch("");
    setDldKey(key);
    setDldArea(area);
    setShowSuggestions(false);
  }

  async function fetchProperties() {
    const supabase = createClient();
    const { data } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });
    setProperties(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchProperties();
  }, []);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaveError("Not signed in."); setSaving(false); return; }
    const area = dldArea
      ? (DLD_AREA_TO_COMMUNITY[dldArea] ?? dldArea)
      : (BUILDING_DIRECTORY[form.building_name]?.community ?? BUILDINGS_DATABASE[form.building_name]?.area ?? "");
    const { error } = await supabase.from("properties").insert({
      user_id: user.id,
      building_name: form.building_name,
      area,
      unit_size: form.unit_size,
      unit_type: form.unit_type,
      floor: form.floor ? parseInt(form.floor) : null,
      view: form.view,
      furnishing_status: form.furnishing_status,
      property_condition: form.property_condition,
      property_value: form.property_value ? parseFloat(form.property_value) : null,
      notes: form.notes,
    });
    setSaving(false);
    if (error) {
      setSaveError(error.message);
    } else {
      setShowForm(false);
      setForm({ building_name: "", unit_size: "1BR", unit_type: "Apartment", floor: "", view: "Standard View", furnishing_status: "Furnished", property_condition: "Standard", property_value: "", notes: "" });
      setBuildingSearch(""); setDldKey(""); setDldArea("");
      fetchProperties();
    }
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Georgia', serif", fontSize: 26, color: C.text }}>
          My Properties
        </h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            padding: "10px 20px",
            background: C.green,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {showForm ? "Cancel" : "Add Property"}
        </button>
      </div>

      {/* Add property form */}
      {showForm && (
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "28px 28px",
            marginBottom: 28,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 18, color: C.text, marginBottom: 20 }}>
            Add a Property
          </h2>
          {saveError && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", color: "#C0392B", fontSize: 13, marginBottom: 16 }}>
              {saveError}
            </div>
          )}
          <form onSubmit={handleSave}>
            {/* Building Name autocomplete */}
            <div style={{ marginBottom: 16 }} ref={buildingRef}>
              <label style={labelStyle}>Building Name</label>
              <div style={{ position: "relative" }}>
                {form.building_name ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ ...inputStyle, flex: 1, background: "#EFF4F0", color: C.green, fontWeight: 600 }}>
                      {form.building_name}
                    </div>
                    <button type="button" onClick={() => { setForm(f => ({ ...f, building_name: "" })); setDldKey(""); setDldArea(""); }} style={{ padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, color: C.muted }}>
                      Change
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Search building name..."
                    value={buildingSearch}
                    onChange={e => { setBuildingSearch(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    required={!form.building_name}
                    style={inputStyle}
                    autoComplete="off"
                  />
                )}
                {showSuggestions && buildingSearch.length >= 2 && (filteredDLD.length > 0 || filteredCurated.length > 0) && (
                  <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 200, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.10)", maxHeight: 260, overflowY: "auto" }}>
                    {filteredDLD.length > 0 && (
                      <>
                        <div style={{ padding: "8px 14px 4px", fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>DLD Registered</div>
                        {filteredDLD.map(b => (
                          <div key={b.key} onMouseDown={() => selectBuilding(b.displayName, b.key, b.dldArea)}
                            style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, color: C.text, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#F0F7F3")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                            <span>{b.displayName}</span>
                            <span style={{ fontSize: 11, color: C.muted }}>{DLD_AREA_TO_COMMUNITY[b.dldArea] ?? b.dldArea}</span>
                          </div>
                        ))}
                      </>
                    )}
                    {filteredCurated.length > 0 && (
                      <>
                        <div style={{ padding: "8px 14px 4px", fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Buildings</div>
                        {filteredCurated.map(b => (
                          <div key={b} onMouseDown={() => selectBuilding(b)}
                            style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, color: C.text, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#F0F7F3")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                            <span>{b}</span>
                            <span style={{ fontSize: 11, color: C.muted }}>{BUILDING_DIRECTORY[b]?.community ?? BUILDINGS_DATABASE[b]?.area ?? ""}</span>
                          </div>
                        ))}
                      </>
                    )}
                    {buildingSearch.length >= 2 && (
                      <div onMouseDown={() => selectBuilding(buildingSearch)}
                        style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, color: C.muted, borderTop: `1px solid ${C.border}` }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#F0F7F3")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        + Use &ldquo;{buildingSearch}&rdquo; anyway
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Unit Size</label>
                <select value={form.unit_size} onChange={(e) => handleChange("unit_size", e.target.value)} style={inputStyle}>
                  {UNIT_SIZES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Unit Type</label>
                <select value={form.unit_type} onChange={(e) => handleChange("unit_type", e.target.value)} style={inputStyle}>
                  {UNIT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Floor</label>
                <input type="number" value={form.floor} onChange={(e) => handleChange("floor", e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>View</label>
                <select value={form.view} onChange={(e) => handleChange("view", e.target.value)} style={inputStyle}>
                  {VIEWS.map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Furnishing Status</label>
                <select value={form.furnishing_status} onChange={(e) => handleChange("furnishing_status", e.target.value)} style={inputStyle}>
                  {FURNISHING.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Property Condition</label>
                <select value={form.property_condition} onChange={(e) => handleChange("property_condition", e.target.value)} style={inputStyle}>
                  {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Property Value AED (optional)</label>
                <input type="number" value={form.property_value} onChange={(e) => handleChange("property_value", e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
              Your property details are used only to support your AssetIntel analysis and service requests.
            </p>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "10px 24px",
                background: saving ? "#ccc" : C.green,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Property"}
            </button>
          </form>
        </div>
      )}

      {/* Properties list */}
      {loading ? (
        <p style={{ color: C.muted }}>Loading...</p>
      ) : properties.length === 0 ? (
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "48px 32px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <p style={{ color: C.muted, fontSize: 15, marginBottom: 8 }}>No properties saved yet.</p>
          <p style={{ color: C.muted, fontSize: 14 }}>
            Add your first property to generate reports and request services.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {properties.map((p) => (
            <div
              key={p.id}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "20px 24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontFamily: "'Georgia', serif", fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                  {p.building_name}
                </div>
                <div style={{ fontSize: 13, color: C.muted, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {p.unit_size && <span>{p.unit_size}</span>}
                  {p.floor && <span>Floor {p.floor}</span>}
                  {p.view && <span>{p.view}</span>}
                  {p.furnishing_status && <span>{p.furnishing_status}</span>}
                  {p.area && <span>{p.area}</span>}
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
                  Added {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <a
                  href={`/estimator?building=${encodeURIComponent(p.building_name)}&type=${encodeURIComponent(p.unit_size)}&unitType=${encodeURIComponent(p.unit_type)}&floor=${p.floor || ""}&view=${encodeURIComponent(p.view || "")}&furnished=${encodeURIComponent(p.furnishing_status || "")}`}
                  style={{
                    padding: "8px 14px",
                    background: C.green,
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  Generate Report
                </a>
                <a
                  href="/dashboard/requests"
                  style={{
                    padding: "8px 14px",
                    background: "none",
                    color: C.green,
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  Request Service
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
