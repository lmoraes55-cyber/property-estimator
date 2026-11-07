"use client";

import { usePathname } from "next/navigation";
import AssetIntelLogo from "@/components/AssetIntelLogo";

// White-label support. Everything under /dh is the Deluxe Holiday Homes
// internal report tool: same estimator + report, no AssetIntel name anywhere
// the BD team or their clients can see (screen, PDF, tab title).
export const ASSETINTEL = {
  key: "assetintel",
  name: "AssetIntel",
  tagline: "Property Intelligence. Smarter Decisions.",
  site: "assetintel.ae",
  base: "",
  pdfLogo: "/brand/assetintel-icon.png",
} as const;

export const DELUXE = {
  key: "deluxe",
  name: "Deluxe Holiday Homes",
  tagline: "Rental Performance Report",
  site: "deluxeholidayhomes.com",
  base: "/dh",
  // ponytail: no logo file yet — drop a square PNG at public/dh-logo.png and it
  // shows up in the PDF header automatically (a missing file is skipped).
  pdfLogo: "/dh-logo.png",
} as const;

export type Brand = typeof ASSETINTEL | typeof DELUXE;

export function useBrand(): Brand {
  const pathname = usePathname();
  return pathname?.startsWith("/dh") ? DELUXE : ASSETINTEL;
}

export function BrandLogo({ size = 64 }: { size?: number }) {
  const brand = useBrand();
  if (brand.key === "assetintel") return <AssetIntelLogo size={size} />;
  return (
    <span style={{
      fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif",
      fontSize: Math.max(16, size * 0.55), fontWeight: 600, color: "#1B5E4A",
      letterSpacing: "-0.01em", whiteSpace: "nowrap", lineHeight: 1,
    }}>
      Deluxe Holiday Homes
    </span>
  );
}
