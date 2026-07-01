import Image from "next/image";

export default function AssetIntelLogo({ size = 64, variant = "horizontal" }: { size?: number; variant?: "horizontal" | "icon" }) {
  const src = variant === "icon" ? "/brand/assetintel-icon.png" : "/brand/assetintel-logo-horizontal.png";
  const aspectRatio = variant === "icon" ? 1 : 3.2; // horizontal is ~3.2:1
  return (
    <Image
      src={src}
      alt="AssetIntel"
      width={Math.round(size * aspectRatio)}
      height={size}
      priority
      style={{
        width: "auto",
        height: size,
        objectFit: "contain",
      }}
    />
  );
}
