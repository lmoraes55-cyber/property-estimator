"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { colors } from "@/lib/colors";
import { BrandLogo } from "@/lib/brand";

// Deluxe Holiday Homes BD sign-in / sign-up. Password only — Google OAuth and
// Supabase's emails would expose the AssetIntel project.
export default function DeluxeLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [f, setF] = useState({ name: "", email: "", password: "", code: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (mode === "signup") {
      const res = await fetch("/api/dh/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      if (!res.ok) {
        setError((await res.json().catch(() => ({}))).error || "Sign up failed.");
        setLoading(false);
        return;
      }
    }
    const { error: err } = await createClient().auth.signInWithPassword({ email: f.email.trim().toLowerCase(), password: f.password });
    setLoading(false);
    if (err) setError(err.message);
    else { router.push("/dh"); router.refresh(); }
  }

  const input = { width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${colors.border}`, fontSize: 14, marginBottom: 12 };

  return (
    <main style={{ minHeight: "100vh", background: colors.bgMain, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 400, background: "#fff", borderRadius: 16, boxShadow: "0 4px 32px rgba(0,0,0,0.08)", padding: "36px 28px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}><BrandLogo size={40} /></div>
        <h1 style={{ textAlign: "center", fontSize: 20, fontWeight: 600, color: colors.textMain, marginBottom: 24 }}>
          {mode === "login" ? "Sign in to Rental Reports" : "Create your BD account"}
        </h1>
        {error && <p style={{ background: "#FEF2F2", color: "#C0392B", borderRadius: 8, padding: "10px 14px", fontSize: 14, marginBottom: 16 }}>{error}</p>}
        {mode === "signup" && <input required placeholder="Full name" value={f.name} onChange={set("name")} style={input} />}
        <input required type="email" placeholder="Work email" autoComplete="email" value={f.email} onChange={set("email")} style={input} />
        <input required type="password" minLength={mode === "signup" ? 8 : undefined} placeholder="Password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={f.password} onChange={set("password")} style={input} />
        {mode === "signup" && <input required placeholder="Team access code" value={f.code} onChange={set("code")} style={input} />}
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 13, borderRadius: 10, border: "none", background: colors.primary, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 4 }}>
          {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
        <p style={{ textAlign: "center", fontSize: 13, color: colors.textMuted, marginTop: 18 }}>
          {mode === "login" ? "New to the team? " : "Already have an account? "}
          <button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} style={{ color: colors.primary, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </form>
    </main>
  );
}
