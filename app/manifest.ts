import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AssetIntel — Dubai Property Intelligence",
    short_name: "AssetIntel",
    description: "Dubai property intelligence: STR/LTR rental estimates, market data, and reports.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F9F8",
    theme_color: "#1B5E4A",
    icons: [
      // White-background versions, not the transparent favicon PNGs — iOS and
      // Android both fill transparent home-screen-icon pixels with black
      // rather than respecting the alpha channel, which made the icon look
      // like it had a black background once installed.
      { src: "/brand/assetintel-app-icon-128.png", sizes: "128x128", type: "image/png" },
      { src: "/brand/assetintel-app-icon-256.png", sizes: "256x256", type: "image/png" },
      { src: "/brand/assetintel-app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/assetintel-app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
