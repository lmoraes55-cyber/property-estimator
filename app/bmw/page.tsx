import type { Metadata, Viewport } from "next";
import BmwApp from "@/components/bmw/BmwApp";

export const metadata: Metadata = {
  title: "BMW 520i Companion",
  description: "Live OBD2 dashboard for a 2023 BMW 520i M Sport over a Bluetooth adapter.",
  manifest: "/bmw/manifest.webmanifest",
  robots: { index: false },
  appleWebApp: { capable: true, title: "520i", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0b0f14",
  width: "device-width",
  initialScale: 1,
};

export default function BmwPage() {
  return <BmwApp />;
}
