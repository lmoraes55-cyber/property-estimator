"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const colors = {
  primary: "#1B5E4A",
  secondary: "#B88A44",
  bgMain: "#FAFAF8",
  textMain: "#1A1A1A",
  textMuted: "#6B6B6B",
  border: "#E0DDD8",
};

function PaySuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const ref = params.get("ref") ?? "";

  return (
    <div style={{ minHeight: "100vh", background: colors.bgMain, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ maxWidth: 480, width: "100%", background: "#fff", borderRadius: 16, border: `1px solid ${colors.border}`, padding: "48px 40px", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#E8F5F0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M8 16L13 21L24 11" stroke={colors.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: colors.textMain, fontFamily: "'Georgia', serif", margin: "0 0 12px" }}>
          Payment Confirmed
        </h1>
        <p style={{ fontSize: 15, color: colors.textMuted, margin: "0 0 24px", lineHeight: 1.6 }}>
          Thank you — your GroundWorks session is booked. We&apos;ll reach out within 24 hours to schedule.
        </p>
        {ref && (
          <div style={{ background: "#F4F9F7", border: `1px solid ${colors.border}`, borderRadius: 8, padding: "12px 20px", margin: "0 0 32px" }}>
            <span style={{ fontSize: 12, color: colors.textMuted, display: "block", marginBottom: 4 }}>Reference</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: colors.primary, letterSpacing: "0.05em" }}>{ref}</span>
          </div>
        )}
        <button
          onClick={() => router.push("/")}
          style={{ padding: "12px 28px", background: colors.primary, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default function PaySuccess() {
  return (
    <Suspense>
      <PaySuccessContent />
    </Suspense>
  );
}
