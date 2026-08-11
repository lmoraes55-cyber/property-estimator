"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SERVICES, ServiceDef } from "@/lib/services";

const C = {
  green: "#1B5E4A",
  greenLight: "#EFF4F0",
  bronze: "#B88A44",
  bronzeLight: "#FFF8EC",
  border: "#E6E1D8",
  text: "#2A2A2A",
  muted: "#6B6B6B",
  card: "#fff",
};

interface Property {
  id: string;
  building_name: string;
  unit_size: string;
}

interface ServiceRequest {
  id: string;
  service_type: string;
  status: string;
  full_name: string;
  created_at: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  submitted: { bg: C.bronzeLight, color: C.bronze, label: "Submitted" },
  in_review: { bg: "#EFF6FF", color: "#1D4ED8", label: "In Review" },
  in_progress: { bg: C.greenLight, color: C.green, label: "In Progress" },
  more_info_needed: { bg: "#FFFBEB", color: "#B45309", label: "More Info Needed" },
  completed: { bg: C.greenLight, color: C.green, label: "Completed" },
};

// ---- Modal ----
interface ModalProps {
  service: ServiceDef;
  properties: Property[];
  onClose: () => void;
  onSuccess: () => void;
}

function ServiceRequestModal({ service, properties, onClose, onSuccess }: ModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("manual");
  const [notes, setNotes] = useState("");
  const [extraFields, setExtraFields] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Pre-fill from auth
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email || "");
        const fn = user.user_metadata?.full_name || "";
        setFullName(fn);
        setWhatsapp(user.user_metadata?.whatsapp || "");
      }
    });
  }, []);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 13px",
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

  function renderExtraFields() {
    const set = (k: string, v: string) => setExtraFields((prev) => ({ ...prev, [k]: v }));
    const val = (k: string) => extraFields[k] || "";

    switch (service.id) {
      case "photo-review":
      case "3d-walkthrough":
        return (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Photo / Video Links</label>
            <input type="text" placeholder="Google Drive, Dropbox, WeTransfer link..." value={val("photoLinks")} onChange={(e) => set("photoLinks", e.target.value)} style={inputStyle} />
          </div>
        );
      case "furnishing-quote":
        return (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Target STR Tier</label>
            <select value={val("targetTier")} onChange={(e) => set("targetTier", e.target.value)} style={inputStyle}>
              <option value="">Select...</option>
              <option>Budget (AED 10–15k all-in)</option>
              <option>Mid-range (AED 20–35k)</option>
              <option>Premium (AED 40–60k)</option>
              <option>Luxury (AED 70k+)</option>
            </select>
          </div>
        );
      case "investment-research":
        return (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Research Focus (building, area, or unit type)</label>
              <input type="text" value={val("researchFocus")} onChange={(e) => set("researchFocus", e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Budget Range (AED)</label>
              <input type="text" placeholder="e.g. 1.2M – 2M" value={val("budget")} onChange={(e) => set("budget", e.target.value)} style={inputStyle} />
            </div>
          </>
        );
      case "subleasing-review":
        return (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Tenancy Agreement Details</label>
            <textarea rows={3} placeholder="Paste key clauses or describe your situation..." value={val("agreementDetails")} onChange={(e) => set("agreementDetails", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
        );
      case "self-manage-setup":
        return (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Current Setup</label>
            <textarea rows={2} placeholder="What platforms or tools are you already using?" value={val("currentSetup")} onChange={(e) => set("currentSetup", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
        );
      default:
        return null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const propId = selectedProperty !== "manual" ? selectedProperty : undefined;

    const res = await fetch("/api/service-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_type: service.id,
        property_id: propId,
        full_name: fullName,
        email,
        whatsapp,
        notes,
        form_data: extraFields,
      }),
    });

    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      onSuccess();
    } else {
      const body = await res.json();
      setError(body.error || "Something went wrong. Please try again.");
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "32px 28px",
          width: "100%",
          maxWidth: 500,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 8px 40px rgba(0,0,0,0.16)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 20, color: C.text, marginBottom: 4 }}>
              {service.title}
            </h2>
            <span style={{ fontSize: 12, background: C.bronzeLight, color: C.bronze, padding: "3px 8px", borderRadius: 4, fontWeight: 600 }}>
              Free during testing
            </span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, color: C.muted, cursor: "pointer", lineHeight: 1, padding: "0 4px" }}>
            x
          </button>
        </div>

        {success ? (
          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "20px", textAlign: "center" }}>
            <p style={{ color: "#166534", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Request submitted</p>
            <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>
              Thank you — your request has been submitted. AssetIntel will review it and contact you with next steps. This service is currently free during testing.
            </p>
            <button
              onClick={onClose}
              style={{ marginTop: 16, padding: "9px 20px", background: C.green, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", color: "#C0392B", fontSize: 13, marginBottom: 14 }}>
                {error}
              </div>
            )}

            {properties.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Select Property</label>
                <select value={selectedProperty} onChange={(e) => setSelectedProperty(e.target.value)} style={inputStyle}>
                  <option value="manual">Enter manually / Not listed</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.building_name} {p.unit_size ? `(${p.unit_size})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>WhatsApp</label>
                <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            </div>

            {renderExtraFields()}

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Notes / Additional context</label>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                background: loading ? "#ccc" : C.green,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Submitting..." : "Submit Free Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ---- Main page ----
export default function RequestsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [activeService, setActiveService] = useState<ServiceDef | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    const supabase = createClient();
    const [{ data: props }, { data: reqs }] = await Promise.all([
      supabase.from("properties").select("id, building_name, unit_size").order("created_at", { ascending: false }),
      supabase.from("service_requests").select("*").order("created_at", { ascending: false }),
    ]);
    setProperties(props || []);
    setRequests(reqs || []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  function getServiceTitle(id: string) {
    return SERVICES.find((s) => s.id === id)?.title || id;
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontFamily: "'Georgia', serif", fontSize: 26, color: C.text, marginBottom: 8 }}>
        Service Requests
      </h1>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>
        Expert support for your Dubai STR property — all services are free during AssetIntel beta testing.
      </p>

      {/* Available services */}
      <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 18, color: C.text, marginBottom: 16 }}>
        Available Services
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
          marginBottom: 48,
        }}
      >
        {SERVICES.map((service) => (
          <div
            key={service.id}
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "20px 20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 11, background: C.bronzeLight, color: C.bronze, padding: "3px 8px", borderRadius: 4, fontWeight: 600 }}>
                Free during testing
              </span>
            </div>
            <h3 style={{ fontFamily: "'Georgia', serif", fontSize: 15, color: C.text, marginBottom: 8, marginTop: 10 }}>
              {service.title}
            </h3>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, flex: 1, marginBottom: 12 }}>
              {service.description}
            </p>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
              Delivery: {service.deliveryTime}
            </div>
            <button
              onClick={() => setActiveService(service)}
              style={{
                padding: "9px 0",
                background: C.green,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Start Request
            </button>
          </div>
        ))}
      </div>

      {/* My Requests */}
      <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 18, color: C.text, marginBottom: 16 }}>
        My Requests
      </h2>
      {loading ? (
        <p style={{ color: C.muted }}>Loading...</p>
      ) : requests.length === 0 ? (
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "32px",
            textAlign: "center",
            color: C.muted,
            fontSize: 14,
          }}
        >
          No requests submitted yet. Start a service request above.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {requests.map((req) => {
            const st = STATUS_STYLES[req.status] || STATUS_STYLES.submitted;
            return (
              <div
                key={req.id}
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                    {getServiceTitle(req.service_type)}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    {new Date(req.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: st.bg,
                    color: st.color,
                    flexShrink: 0,
                  }}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {activeService && (
        <ServiceRequestModal
          service={activeService}
          properties={properties}
          onClose={() => setActiveService(null)}
          onSuccess={() => { fetchData(); }}
        />
      )}
    </div>
  );
}
