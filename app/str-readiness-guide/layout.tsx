import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "STR Readiness Guide | AssetIntel",
  description:
    "A practical short-term rental preparation guide for Dubai property owners covering furnishing, guest access, operator setup costs, insurance, maintenance, utilities, inventory, and go-live readiness.",
};

export default function STRReadinessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
