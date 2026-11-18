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
      { src: "/brand/assetintel-favicon-128.png", sizes: "128x128", type: "image/png" },
      { src: "/brand/assetintel-favicon-256.png", sizes: "256x256", type: "image/png" },
      { src: "/brand/assetintel-favicon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/assetintel-favicon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
