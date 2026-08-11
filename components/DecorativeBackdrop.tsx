import React from "react";

// Shared premium decorative background — soft radial green/gold glows, a
// diagonal hatch texture, a dot grid, and thin ring accents. Originally built
// for /login and /signup (see AuthBackground.tsx); this is the same layer
// factored out as a fixed, non-interactive backdrop so it can sit behind any
// page's content without affecting layout.
export default function DecorativeBackdrop() {
  return (
    <div aria-hidden="true" className="decorative-backdrop-no-print" style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 12% 12%, rgba(27,94,74,0.28) 0%, rgba(27,94,74,0) 48%),
            radial-gradient(circle at 90% 10%, rgba(184,138,68,0.32) 0%, rgba(184,138,68,0) 45%),
            radial-gradient(circle at 92% 95%, rgba(27,94,74,0.24) 0%, rgba(27,94,74,0) 48%),
            radial-gradient(circle at 6% 90%, rgba(184,138,68,0.26) 0%, rgba(184,138,68,0) 42%)
          `,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "repeating-linear-gradient(135deg, rgba(27,94,74,0.05) 0px, rgba(27,94,74,0.05) 1px, transparent 1px, transparent 22px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(27,94,74,0.32) 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(circle at 50% 40%, black 0%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 40%, black 0%, transparent 78%)",
        }}
      />
      <svg width="680" height="680" viewBox="0 0 680 680" style={{ position: "absolute", top: "-190px", right: "-190px" }}>
        <circle cx="340" cy="340" r="339" fill="none" stroke="#B88A44" strokeOpacity="0.38" strokeWidth="1.5" />
        <circle cx="340" cy="340" r="255" fill="none" stroke="#1B5E4A" strokeOpacity="0.30" strokeWidth="1.5" />
        <circle cx="340" cy="340" r="175" fill="none" stroke="#B88A44" strokeOpacity="0.22" strokeWidth="1.5" />
      </svg>
      <svg width="520" height="520" viewBox="0 0 520 520" style={{ position: "absolute", bottom: "-160px", left: "-160px" }}>
        <circle cx="260" cy="260" r="259" fill="none" stroke="#1B5E4A" strokeOpacity="0.32" strokeWidth="1.5" />
        <circle cx="260" cy="260" r="180" fill="none" stroke="#B88A44" strokeOpacity="0.24" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
