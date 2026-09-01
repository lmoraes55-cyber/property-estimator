"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import AssetIntelLogo from "@/components/AssetIntelLogo";
import AuthBackground from "@/components/AuthBackground";
import { createClient } from "@/lib/supabase/client";

const C = {
  bg: "#F7F9F8",
  green: "#1B5E4A",
  bronze: "#B88A44",
  border: "#E2E8E5",
  text: "#2A2A2A",
  muted: "#4E5D56",
  error: "#C0392B",
};

function SignupForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/?welcome=1";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`.trim(),
          whatsapp,
        },
        // Confirmation links land on the homepage with a "you're signed in"
        // toast rather than dropping the user straight into the dashboard.
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    fontSize: 15,
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
    marginBottom: 6,
  };

  return (
    <AuthBackground>
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
          padding: "40px 36px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <AssetIntelLogo />
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif",
            fontSize: 22,
            fontWeight: 600,
            color: C.text,
            textAlign: "center",
            marginBottom: 6,
          }}
        >
          Create your account
        </h1>
        <p style={{ textAlign: "center", color: C.muted, fontSize: 14, marginBottom: 28 }}>
          Free access during AssetIntel beta
        </p>

        {/* Google Sign Up */}
        <button
          type="button"
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}` },
            });
          }}
          style={{
            width: "100%",
            padding: "11px 16px",
            background: "#fff",
            border: `1.5px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            color: C.text,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.8 2.5 30.2 0 24 0 14.7 0 6.7 5.4 2.7 13.3l7.8 6C12.4 13 17.8 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/>
            <path fill="#FBBC05" d="M10.5 28.7A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.7 10.7l7.8-6z"/>
            <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.2 0-11.5-4.2-13.4-9.9l-7.8 6C6.7 42.6 14.7 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ fontSize: 12, color: C.muted }}>or sign up with email</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        {success ? (
          <div
            style={{
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: 12,
              padding: "24px 20px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#166534", fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
              Check your email to confirm your account
            </p>
            <p style={{ color: C.muted, fontSize: 14 }}>
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and access your dashboard.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: 8,
                  padding: "12px 16px",
                  color: C.error,
                  fontSize: 14,
                  marginBottom: 20,
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>WhatsApp (optional)</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+971 50 000 0000"
                  style={inputStyle}
                />
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
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  marginBottom: 16,
                }}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p
              style={{
                fontSize: 12,
                color: C.muted,
                textAlign: "center",
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              Your details are used only for AssetIntel service delivery and are never shared.
            </p>

            <p style={{ textAlign: "center", fontSize: 14, color: C.muted }}>
              Already have an account?{" "}
              <a href={`/login?next=${encodeURIComponent(next)}`} style={{ color: C.green, fontWeight: 500, textDecoration: "none" }}>
                Sign in
              </a>
            </p>
          </>
        )}
      </div>
    </AuthBackground>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
