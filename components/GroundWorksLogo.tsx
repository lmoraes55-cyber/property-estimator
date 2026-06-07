import Image from "next/image";

export default function GroundWorksLogo({ size = 64 }: { size?: number }) {
  return (
    <Image
      src="/groundworks-logo.png"
      alt="GroundWorks Logo"
      width={size}
      height={size}
      priority
      style={{ width: size, height: "auto" }}
    />
  );
}
