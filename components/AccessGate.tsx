"use client";

import React, { useEffect, useState } from "react";
import { colors } from "@/lib/colors";
import { createClient } from "@/lib/supabase/client";

const serif = "var(--font-display), ui-sans-serif, system-ui, sans-serif";

// Wraps gated content: blurs it behind a Sign Up / Log In prompt until the
// visitor has a real AssetIntel account. Already-signed-in visitors (checked
// via the actual Supabase session, not a local flag) see content immediately.
export default function AccessGate({
  children,
  title = "Unlock This Data",
  subtitle = "Free — sign up or log in to see live data on this page.",
}: {
  children: React.ReactNode;
  source: string;
  title?: string;
  subtitle?: string;
}) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null); // null = session not checked yet (avoid flash)

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setUnlocked(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setUnlocked(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (unlocked !== false) {
    // null (checking) or true (signed in) — render content; avoids a flash of the gate for signed-in users.
    return <>{children}</>;
  }

  const next = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
  const encodedNext = encodeURIComponent(next);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ filter: "blur(7px)", pointerEvents: "none", userSelect: "none" }} aria-hidden="true">
        {children}
      </div>
      <div
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(247, 249, 248,0.4) 0%, rgba(247, 249, 248,0.92) 30%, rgba(247, 249, 248,0.97) 100%)",
        }}
      >
        {/* Sticky, not centered-in-content: gated sections can be very tall (a full
            area accordion), and centering within that height pushed the card well
            below the first viewport. Sticking near the top keeps it visible as soon
            as the gate appears, on any page length. */}
        <div style={{ position: "sticky", top: 110, display: "flex", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 400, width: "100%", background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 22, padding: "30px 28px", boxShadow: colors.shadowLg, textAlign: "center" }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.secondaryText, margin: "0 0 8px" }}>Free Access</p>
            <h3 style={{ fontSize: 24, fontFamily: serif, fontWeight: 600, color: colors.primary, margin: "0 0 8px" }}>{title}</h3>
            <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.55, margin: "0 0 22px" }}>{subtitle}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a
                href={`/signup?next=${encodedNext}`}
                style={{ padding: "13px", borderRadius: 12, background: colors.primary, color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}
              >
                Sign Up Free →
              </a>
              <a
                href={`/login?next=${encodedNext}`}
                style={{ padding: "13px", borderRadius: 12, background: "transparent", border: `1.5px solid ${colors.border}`, color: colors.textMain, fontSize: 14, fontWeight: 700, textDecoration: "none" }}
              >
                Log In
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
