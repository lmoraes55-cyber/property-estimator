"use client";

import React from "react";
import { colors } from "@/lib/colors";

interface LeadModalProps {
  open: boolean;
  target: string;        // operator/agent name, or service/package name
  targetType: "operator" | "agent" | "service";
  property?: string;     // building / unit context
  context?: Record<string, string | number | undefined>; // property + AssetIntel estimate snapshot
  onClose: () => void;
  onSuccess?: () => void; // called after a successful submit (e.g. proceed to contact)
}

export default function LeadModal({ open, target, targetType, property, context, onClose, onSuccess }: LeadModalProps) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = React.useState("");
  const [ref, setRef] = React.useState("");

  if (!open) return null;

  const reset = () => { setName(""); setPhone(""); setEmail(""); setStatus("idle"); setError(""); setRef(""); };
  const handleClose = () => { reset(); onClose(); };

  const submit = async () => {
    if (!name.trim() || (!phone.trim() && !email.trim())) {
      setError("Please enter your name and a phone or email.");
      return;
    }
    setStatus("submitting"); setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, target, targetType, property, ...(context || {}) }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || "Something went wrong.");
      setRef(j.ref || "");
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setError((e as Error).message || "Something went wrong.");
    }
  };

  const isService = targetType === "service";
  const labelType = targetType === "operator" ? "operator" : targetType === "agent" ? "leasing agent" : "service";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6 overflow-y-auto"
      style={{ background: "rgba(20,24,22,0.55)", backdropFilter: "blur(8px)" }}
      onClick={handleClose}>
      <div className="relative w-full my-auto rounded-[26px] overflow-hidden"
        style={{
          maxWidth: "460px",
          background: `linear-gradient(180deg, #FEFCF8 0%, ${colors.bgSection} 100%)`,
          border: `1px solid ${colors.secondary}40`,
          boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 26px 60px rgba(0,0,0,0.28)",
        }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ height: "3px", background: `linear-gradient(90deg, ${colors.secondary}00, ${colors.secondary}, ${colors.secondary}00)` }} />

        <div style={{ padding: "28px" }}>
          {status === "done" ? (
            <div className="text-center">
              <span className="inline-flex items-center justify-center rounded-full mb-4" style={{ width: "52px", height: "52px", background: `${colors.primary}12`, border: `1px solid ${colors.primary}30` }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.textMain, fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif" }}>Request received</h3>
              <p className="text-sm mb-4" style={{ color: colors.textMuted, lineHeight: 1.6 }}>
                Thanks{name ? `, ${name.split(" ")[0]}` : ""} — {isService
                  ? <>our team will be in touch shortly about <span style={{ color: colors.primary, fontWeight: 600 }}>{target}</span>.</>
                  : <>we&rsquo;ll connect you with <span style={{ color: colors.primary, fontWeight: 600 }}>{target}</span> and be in touch shortly.</>}
              </p>
              {ref && (
                <p className="text-xs mb-6 inline-block px-3 py-1.5 rounded-lg" style={{ background: colors.bgMain, border: `1px solid ${colors.border}`, color: colors.textMuted }}>
                  Your reference: <span style={{ color: colors.textMain, fontWeight: 700, letterSpacing: "0.04em" }}>{ref}</span>
                </p>
              )}
              <button onClick={() => { onSuccess?.(); handleClose(); }}
                className="w-full py-3 rounded-xl text-sm font-bold transition hover:brightness-105"
                style={{ background: colors.primary, color: "#fff", boxShadow: `0 8px 20px ${colors.primary}33` }}>
                Done
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs font-bold uppercase mb-2" style={{ color: colors.secondary, letterSpacing: "0.14em" }}>{isService ? "Get started" : "Request an introduction"}</p>
              <h3 className="text-xl font-bold mb-1.5" style={{ color: colors.textMain, fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif" }}>
                {isService ? target : `Connect with ${target}`}
              </h3>
              <p className="text-sm mb-5" style={{ color: colors.textMuted, lineHeight: 1.55 }}>
                {isService
                  ? <>Leave your details and our team will reach out to get you started{property ? ` (${property})` : ""}.</>
                  : <>Leave your details and we&rsquo;ll arrange an introduction with this {labelType}{property ? ` for ${property}` : ""}.</>}
              </p>

              <div className="space-y-3">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: colors.bgMain, border: `1px solid ${colors.border}`, color: colors.textMain }} />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (e.g. +971 50 123 4567)" inputMode="tel"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: colors.bgMain, border: `1px solid ${colors.border}`, color: colors.textMain }} />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" inputMode="email"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: colors.bgMain, border: `1px solid ${colors.border}`, color: colors.textMain }} />
              </div>

              {error && <p className="text-xs mt-3" style={{ color: "#B4453C" }}>{error}</p>}

              <button onClick={submit} disabled={status === "submitting"}
                className="w-full py-3 rounded-xl text-sm font-bold mt-5 transition hover:brightness-105"
                style={{ background: colors.primary, color: "#fff", boxShadow: `0 8px 20px ${colors.primary}33`, opacity: status === "submitting" ? 0.7 : 1 }}>
                {status === "submitting" ? "Sending…" : "Request Introduction →"}
              </button>
              <button onClick={handleClose} className="w-full text-xs mt-3 transition hover:opacity-70" style={{ color: colors.textLight }}>
                Maybe later
              </button>
              <p className="text-[11px] text-center mt-3" style={{ color: colors.textLight, lineHeight: 1.5 }}>
                Your details are used only to arrange this introduction.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
