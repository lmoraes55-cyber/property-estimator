import Image from "next/image";
import { colors } from "@/lib/colors";

export default function GroundWorksLogo({ size = 64 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: colors.bgMain,
        borderRadius: "4px",
      }}
    >
      <Image
        src="/groundworks-logo.png"
        alt="GroundWorks Logo"
        width={size}
        height={size}
        priority
        style={{
          width: size,
          height: "auto",
          objectFit: "contain",
        }}
      />
    </div>
  );
}
