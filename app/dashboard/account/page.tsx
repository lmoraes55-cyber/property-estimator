"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const C = {
  green: "#1B5E4A",
  border: "#E2E8E5",
  text: "#2A2A2A",
  muted: "#4E5D56",
  card: "#fff",
  error: "#C0392B",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  fontSize: 14,
  color: C.text,
  background: "#FFFFFF",
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

export default function AccountPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveError, setSaveError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || "");
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFirstName(profile.first_name || "");
        setLastName(profile.last_name || "");
        setWhatsapp(profile.whatsapp || "");
        setPhone(profile.phone || "");
      } else {
        // Fall back to metadata
        const meta = user.user_metadata || {};
        const parts = (meta.full_name || "").split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
        setWhatsapp(meta.whatsapp || "");
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveMsg("");
    setSaveError("");
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        whatsapp,
        phone,
      });
    setSaving(false);
    if (error) {
      setSaveError(error.message);
    } else {
      setSaveMsg("Changes saved.");
      setTimeout(() => setSaveMsg(""), 3000);
    }
  }

  async function handlePasswordReset() {
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard/account`,
    });
    setResetSent(true);
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7D6338", marginBottom: 10 }}>
        Your Profile
      </p>
      <h1 style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontSize: 26, color: C.green, marginBottom: 28 }}>
        Account
      </h1>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: "28px 28px",
          boxShadow: "0 2px 8px rgba(27,94,74,0.06)",
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontSize: 17, color: C.text, marginBottom: 20 }}>
          Profile
        </h2>

        {saveMsg && (
          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "10px 14px", color: "#166534", fontSize: 13, marginBottom: 16 }}>
            {saveMsg}
          </div>
        )}
        {saveError && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", color: C.error, fontSize: 13, marginBottom: 16 }}>
            {saveError}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} readOnly style={{ ...inputStyle, background: "#F3F3F3", color: C.muted }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>WhatsApp</label>
              <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+971 50 000 0000" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
            </div>
          </div>
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
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Password */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: "24px 28px",
          boxShadow: "0 2px 8px rgba(27,94,74,0.06)",
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontSize: 17, color: C.text, marginBottom: 12 }}>
          Change Password
        </h2>
        {resetSent ? (
          <p style={{ color: "#166534", fontSize: 14 }}>Password reset email sent. Check your inbox.</p>
        ) : (
          <>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 14 }}>
              We will send a password reset link to your email address.
            </p>
            <button
              onClick={handlePasswordReset}
              style={{
                padding: "9px 20px",
                background: "none",
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                fontSize: 14,
                color: C.text,
                cursor: "pointer",
              }}
            >
              Send Reset Email
            </button>
          </>
        )}
      </div>

      <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
        Your details are used only for AssetIntel service delivery and are never shared with third parties.
      </p>
    </div>
  );
}
