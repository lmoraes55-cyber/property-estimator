export default function GroundWorksLogo({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* House icon - Layered chevrons */}
      <g>
        {/* Top chevron */}
        <path
          d="M 50 85 L 75 60 L 100 85"
          stroke="#2F4F3E"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Middle-top chevron */}
        <path
          d="M 45 105 L 100 50 L 155 105"
          stroke="#2F4F3E"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Middle chevron */}
        <path
          d="M 40 125 L 100 65 L 160 125"
          stroke="#2F4F3E"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Bottom base - rust color */}
        <rect x="40" y="135" width="120" height="20" fill="#8B5E3C" rx="2" />
      </g>

      {/* Vertical divider line */}
      <line x1="85" y1="55" x2="85" y2="155" stroke="#2F4F3E" strokeWidth="2" />
    </svg>
  );
}
