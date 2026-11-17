import type { Metadata } from "next";

// Deluxe Holiday Homes white-label shell — overrides the root AssetIntel
// title, description and favicon for everything under /dh.
export const metadata: Metadata = {
  title: "Deluxe Holiday Homes · Rental Reports",
  description: "Internal rental projection tool for the Deluxe Holiday Homes BD team.",
  icons: { icon: "data:,", apple: "data:," },
  robots: { index: false, follow: false },
};

export default function DeluxeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
