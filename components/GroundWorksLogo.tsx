import Image from "next/image";
import { colors } from "@/lib/colors";

export default function AssetIntelLogo({ size = 64 }: { size?: number }) {
  return (
    <Image
      src="/brand/assetintel-logo.svg"
      alt="AssetIntel Logo"
      width={size}
      height={size}
      priority
      style={{
        width: size,
        height: "auto",
        objectFit: "contain",
      }}
    />
  );
}
