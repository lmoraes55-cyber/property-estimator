"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const detail = searchParams.get("detail");
    const errParam = searchParams.get("error");
    if (detail) setError(`Google sign-in failed: ${detail}`);
    else if (errParam) setError("Google sign-in failed. Please try again.");
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      router.push(next);
    }
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}` },
    });
  }

  async function handleForgot() {
    if (!email) {
      setError("Enter your email address above, then click Forgot Password.");
      return;
    }
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard/account`,
    });
    setResetSent(true);
  }

  return (
    <AuthBackground>
      <div
        style={{
          width: "100%",
          maxWidth: 420,
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
          Sign in to AssetIntel
        </h1>
        <p style={{ textAlign: "center", color: C.muted, fontSize: 14, marginBottom: 28 }}>
          Dubai property intelligence
        </p>

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

        {resetSent && (
          <div
            style={{
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: 8,
              padding: "12px 16px",
              color: "#166534",
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            Password reset email sent. Check your inbox.
          </div>
        )}

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogle}
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
          <span style={{ fontSize: 12, color: C.muted }}>or sign in with email</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                fontSize: 15,
                color: C.text,
                background: "#FFFFFF",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                fontSize: 15,
                color: C.text,
                background: "#FFFFFF",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ textAlign: "right", marginBottom: 24 }}>
            <button
              type="button"
              onClick={handleForgot}
              style={{
                background: "none",
                border: "none",
                color: C.bronze,
                fontSize: 13,
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Forgot password?
            </button>
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
              marginBottom: 20,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 14, color: C.muted }}>
          Don&apos;t have an account?{" "}
          <a href={`/signup?next=${encodeURIComponent(next)}`} style={{ color: C.green, fontWeight: 500, textDecoration: "none" }}>
            Create account
          </a>
        </p>
      </div>
    </AuthBackground>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
