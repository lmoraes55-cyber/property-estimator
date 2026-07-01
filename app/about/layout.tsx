import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About AssetIntel | Dubai Property Intelligence & STR Setup Advisory",
  description:
    "AssetIntel combines Dubai short-term rental, long-term leasing, property onboarding, and operations experience to help owners, investors, and operators make smarter property decisions.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
