import React from "react";
import DecorativeBackdrop from "./DecorativeBackdrop";

// Shared premium background for /login and /signup — centers the card over
// the decorative backdrop (see DecorativeBackdrop.tsx). This is applied
// locally per-page rather than site-wide: many other pages (e.g. /estimator)
// use translucent/glass-card surfaces that were designed against a plain
// backdrop, and a patterned background bleeds through and hurts legibility.
export default function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "#F8F4EE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <DecorativeBackdrop />
      <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}
