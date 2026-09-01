"use client";

import React, { useState } from "react";
import { useIsMobile } from "@/lib/useIsMobile";
import SiteNav from "@/components/SiteNav";
import { colors, serif } from "@/components/home/theme";

const PROPERTY_STATUS = [
  "I already own a property",
  "I'm buying a property",
  "I'm researching",
  "I'm an investor",
  "I'm an agent",
];

const CONSULT_TYPES = ["Phone", "Google Meet", "Zoom"];

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: "10px",
  border: `1.5px solid ${colors.border}`, background: "#FBF9F5", fontSize: "14px",
  color: colors.textMain, outline: "none", fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
  textTransform: "uppercase", color: "#7A9A8A", marginBottom: "7px",
};

export default function ConsultationPage() {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", propertyStatus: "", building: "",
    consultType: "", date: "", time: "", description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          property: form.propertyStatus,
          building: form.building,
          support: form.consultType,
          message: `${form.description}${form.description ? " — " : ""}Preferred: ${form.date || "not specified"} ${form.time || ""}`.trim(),
          source: "Independent Property Advisory Consultation (AED 199)",
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("Something went wrong submitting your request. Please try again or email hello@assetintel.ae.");
    }
    setSubmitting(false);
  };

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh" }}>
      <SiteNav active="consultation" />

      {/* Hero */}
      <section style={{ paddingTop: isMobile ? "128px" : "148px", paddingBottom: isMobile ? "36px" : "48px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: isMobile ? "0 20px" : "0 48px", textAlign: "center" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.16em", color: colors.secondary, textTransform: "uppercase", marginBottom: "14px" }}>
            Independent Property Advisory
          </div>
          <h1 style={{ fontFamily: serif, fontSize: isMobile ? "28px" : "38px", color: colors.primary, lineHeight: 1.2, margin: "0 0 16px" }}>
            Book Your Independent Property Consultation
          </h1>
          <p style={{ fontSize: isMobile ? "14.5px" : "15.5px", color: colors.textMuted, lineHeight: 1.65, maxWidth: "600px", margin: "0 auto" }}>
            Receive personalised, unbiased property guidance backed by real Dubai market data and practical STR expertise.
          </p>
        </div>
      </section>

      {/* Form */}
      <section style={{ padding: isMobile ? "0 20px 64px" : "0 48px 88px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "22px", padding: isMobile ? "28px 22px" : "40px 44px", boxShadow: colors.shadowLg }}>

            {/* Price header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", paddingBottom: "22px", borderBottom: `1px solid ${colors.border}` }}>
              <div>
                <div style={{ fontFamily: serif, fontSize: "18px", color: colors.primary }}>Independent Property Advisory</div>
                <div style={{ fontSize: "12.5px", color: colors.textMuted }}>20 Minute Private Consultation</div>
              </div>
              <div style={{ fontFamily: serif, fontSize: "26px", fontWeight: 500, color: colors.secondary, whiteSpace: "nowrap" }}>AED 199</div>
            </div>

            {submitted ? (
              <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
                <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "#EEF5F1", border: "1.5px solid rgba(27,94,74,0.18)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <p style={{ fontSize: "18px", fontWeight: 700, color: colors.primary, marginBottom: "10px" }}>Request Received</p>
                <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.6, maxWidth: "420px", margin: "0 auto" }}>
                  Thank you — AssetIntel will confirm your Independent Property Advisory session and follow up with scheduling and payment details shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "10px 14px", color: "#C0392B", fontSize: "13px", marginBottom: "18px" }}>
                    {error}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={labelStyle}>Full Name <span style={{ color: colors.secondary }}>*</span></label>
                    <input required type="text" value={form.name} onChange={e => set("name", e.target.value)} style={inputStyle} placeholder="Your full name" />
                  </div>
                  <div>
                    <label style={labelStyle}>Email <span style={{ color: colors.secondary }}>*</span></label>
                    <input required type="email" value={form.email} onChange={e => set("email", e.target.value)} style={inputStyle} placeholder="your@email.com" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={labelStyle}>Phone <span style={{ color: colors.secondary }}>*</span></label>
                    <input required type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} style={inputStyle} placeholder="+971 50 000 0000" />
                  </div>
                  <div>
                    <label style={labelStyle}>Property Building <span style={{ color: colors.textMuted, fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                    <input type="text" value={form.building} onChange={e => set("building", e.target.value)} style={inputStyle} placeholder="Building or community" />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>Property Status <span style={{ color: colors.secondary }}>*</span></label>
                  <select required value={form.propertyStatus} onChange={e => set("propertyStatus", e.target.value)} style={{ ...inputStyle, appearance: "none", color: form.propertyStatus ? colors.textMain : colors.textMuted }}>
                    <option value="" disabled>Select an option</option>
                    {PROPERTY_STATUS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={labelStyle}>Consultation Type <span style={{ color: colors.secondary }}>*</span></label>
                    <select required value={form.consultType} onChange={e => set("consultType", e.target.value)} style={{ ...inputStyle, appearance: "none", color: form.consultType ? colors.textMain : colors.textMuted }}>
                      <option value="" disabled>Select</option>
                      {CONSULT_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Preferred Date</label>
                    <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Preferred Time</label>
                    <input type="time" value={form.time} onChange={e => set("time", e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div style={{ marginBottom: "26px" }}>
                  <label style={labelStyle}>What would you like to discuss?</label>
                  <textarea rows={4} value={form.description} onChange={e => set("description", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} placeholder="Tell us a little about your property or what you'd like guidance on..." />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: "100%", padding: "16px", borderRadius: "12px", border: "none",
                    background: colors.secondary, color: "#fff", fontSize: "15px", fontWeight: 700,
                    cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? "Submitting..." : "Book Consultation — AED 199"}
                </button>

                <p style={{ fontSize: "11px", color: colors.textMuted, lineHeight: 1.6, textAlign: "center", marginTop: "16px" }}>
                  Payment is arranged after booking confirmation. AssetIntel will follow up with scheduling and payment details.
                </p>
              </form>
            )}
          </div>

          <p style={{ fontSize: "11.5px", color: colors.textMuted, lineHeight: 1.6, textAlign: "center", maxWidth: "560px", margin: "24px auto 0" }}>
            AssetIntel provides independent property guidance based on available market data, research and operational experience. Consultations are intended to support property decision-making and should not be interpreted as regulated financial, legal or investment advice.
          </p>
        </div>
      </section>
    </div>
  );
}
