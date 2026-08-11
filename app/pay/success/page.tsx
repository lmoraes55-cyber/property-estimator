"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const colors = {
  primary: "#1B5E4A",
  secondary: "#B88A44",
  bgMain: "#F8F4EE",
  textMain: "#1A1A1A",
  textMuted: "#6B6B6B",
  border: "#E6E1D8",
};

// The ref in the URL names an order; it never proves one was paid. The server
// asks Telr and answers with the real status, so a hand-typed ref shows
// "pending", not a confirmation.
type VerifyState = "checking" | "paid" | "pending" | "unknown";

function PaySuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const ref = params.get("ref") ?? "";
  const [state, setState] = useState<VerifyState>(ref ? "checking" : "unknown");

  useEffect(() => {
    if (!ref) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ref }),
        });
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok || !data?.ok) setState("unknown");
        else setState(data.status === "paid" ? "paid" : "pending");
      } catch {
        if (!cancelled) setState("pending");
      }
    })();
    return () => { cancelled = true; };
  }, [ref]);

  const heading =
    state === "paid" ? "Payment Confirmed"
    : state === "checking" ? "Confirming Payment…"
    : state === "pending" ? "Payment Processing"
    : "Order Not Found";

  const message =
    state === "paid"
      ? "Thank you — your AssetIntel session is booked. We'll reach out within 24 hours to schedule."
      : state === "checking"
      ? "Checking your payment with the gateway. This only takes a moment."
      : state === "pending"
      ? "We haven't had confirmation from the payment gateway yet. If you completed payment, it will settle shortly and we'll be in touch — keep your reference below."
      : "We couldn't find an order with that reference. If you've just paid, contact us with your receipt and we'll sort it out.";

  return (
    <div style={{ minHeight: "100vh", background: colors.bgMain, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ maxWidth: 480, width: "100%", background: "#fff", borderRadius: 16, border: `1px solid ${colors.border}`, padding: "clamp(28px,5vw,48px) clamp(20px,4vw,40px)", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: state === "paid" ? "#E8F5F0" : "#F4F1EA", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          {state === "paid" ? (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M8 16L13 21L24 11" stroke={colors.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="11" stroke={colors.secondary} strokeWidth="2.5" />
              <path d="M16 10v7l4 3" stroke={colors.secondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: colors.textMain, fontFamily: "'Georgia', serif", margin: "0 0 12px" }}>
          {heading}
        </h1>
        <p style={{ fontSize: 15, color: colors.textMuted, margin: "0 0 24px", lineHeight: 1.6 }}>
          {message}
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
