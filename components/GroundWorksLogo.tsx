export default function GroundWorksLogo({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top chevron/arrow pointing up - Deep Green */}
      <path
        d="M 40 90 L 100 40 L 160 90 L 160 105 L 100 60 L 40 105 Z"
        fill="#2F4F3E"
      />

      {/* Window frame with cross - Deep Green */}
      <rect
        x="70"
        y="95"
        width="60"
        height="40"
        fill="none"
        stroke="#2F4F3E"
        strokeWidth="5"
      />
      {/* Vertical line in window */}
      <line x1="100" y1="95" x2="100" y2="135" stroke="#2F4F3E" strokeWidth="5" />
      {/* Horizontal line in window */}
      <line x1="70" y1="115" x2="130" y2="115" stroke="#2F4F3E" strokeWidth="5" />

      {/* First horizontal layer - Deep Green */}
      <rect
        x="35"
        y="140"
        width="130"
        height="12"
        fill="#2F4F3E"
      />

      {/* Second horizontal layer - Muted Green (lighter) */}
      <rect
        x="35"
        y="158"
        width="130"
        height="12"
        fill="#3F6B54"
      />

      {/* Base layer - Rust/Brown */}
      <path
        d="M 35 176 Q 35 185 45 190 L 155 190 Q 165 185 165 176 Z"
        fill="#8B5E3C"
      />
    </svg>
  );
}
