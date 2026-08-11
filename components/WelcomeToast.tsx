"use client";

import { useEffect, useState } from "react";

// Shown once, right after a user confirms their email via the signup link —
// tells them they're signed in without dropping them straight into the
// dashboard. Reads ?welcome=1 client-side only (no useSearchParams/Suspense
// needed) and strips it from the URL immediately so refreshing doesn't re-show it.
export default function WelcomeToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("welcome") !== "1") return;

    setShow(true);
    params.delete("welcome");
    const newSearch = params.toString();
    const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "") + window.location.hash;
    window.history.replaceState({}, "", newUrl);

    const timer = setTimeout(() => setShow(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        top: 96,
        right: 20,
        zIndex: 9999,
        background: "#1B5E4A",
        color: "#fff",
        padding: "14px 20px",
        borderRadius: 12,
        boxShadow: "0 8px 28px rgba(0,0,0,0.22)",
        fontSize: 14,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 10,
        maxWidth: 340,
      }}
    >
      <span style={{ fontSize: 18 }}>✓</span>
      You&apos;re signed in to AssetIntel
    </div>
  );
}
