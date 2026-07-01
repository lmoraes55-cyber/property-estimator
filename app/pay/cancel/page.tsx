"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const colors = {
  primary: "#1B5E4A",
  secondary: "#B88A44",
  bgMain: "#F8F4EE",
  textMain: "#1A1A1A",
  textMuted: "#6B6B6B",
  border: "#E6E1D8",
};

function PayCancelContent() {
  const params = useSearchParams();
  const router = useRouter();
  const reason = params.get("reason") ?? "cancelled";
  const isDeclined = reason === "declined";

  return (
    <div style={{ minHeight: "100vh", background: colors.bgMain, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ maxWidth: 480, width: "100%", background: "#fff", borderRadius: 16, border: `1px solid ${colors.border}`, padding: "clamp(28px,5vw,48px) clamp(20px,4vw,40px)", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: isDeclined ? "#FFF0F0" : "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M8 8L20 20M20 8L8 20" stroke={isDeclined ? "#C0392B" : colors.textMuted} strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: colors.textMain, fontFamily: "'Georgia', serif", margin: "0 0 12px" }}>
          {isDeclined ? "Payment Declined" : "Payment Cancelled"}
        </h1>
        <p style={{ fontSize: 15, color: colors.textMuted, margin: "0 0 32px", lineHeight: 1.6 }}>
          {isDeclined
            ? "Your card was declined. Please check your details and try again, or use a different card."
            : "No charge was made. You can return to pricing and try again whenever you're ready."}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => router.push("/self-manage#pricing")}
            style={{ padding: "12px 24px", background: colors.primary, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Back to Pricing
          </button>
          <button
            onClick={() => router.push("/")}
            style={{ padding: "12px 24px", background: "transparent", color: colors.textMuted, border: `1.5px solid ${colors.border}`, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PayCancel() {
  return (
    <Suspense>
      <PayCancelContent />
    </Suspense>
  );
}
