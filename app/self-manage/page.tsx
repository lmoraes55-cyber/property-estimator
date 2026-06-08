"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { colors } from "@/lib/colors";
import GroundWorksLogo from "@/components/GroundWorksLogo";

function SelfManageContent() {
  const params = useSearchParams();
  const router = useRouter();

  const propertyName = params.get("propertyName") ?? "";

  const handleBack = () => router.back();

  const steps = [
    {
      step: "1",
      title: "DET Registration & Compliance",
      description: "Register your property with Dubai Municipality's DET (Department of Tourism & Commerce Marketing) for short-term rental approval. Ensure furnishing meets DET holiday home standards.",
    },
    {
      step: "2",
      title: "Set Competitive Pricing",
      description: "Research comparable properties in your area using Airbnb, Booking.com, and Vrbo. Price strategically by season to maximize occupancy and revenue.",
    },
    {
      step: "3",
      title: "List on OTA Platforms",
      description: "Create listings on multiple platforms: Airbnb, Booking.com, Vrbo, Agoda, and Expedia. Use professional photos and compelling descriptions to attract guests.",
    },
    {
      step: "4",
      title: "Guest Communication & Check-in",
      description: "Set up automated messaging for bookings. Establish clear check-in/check-out procedures. Consider offering self-check-in (keypad/smart lock) for convenience.",
    },
    {
      step: "5",
      title: "Cleaning & Maintenance",
      description: "Hire a reliable cleaning service to maintain high standards between guests. Schedule regular maintenance checks to prevent costly repairs.",
    },
    {
      step: "6",
      title: "Guest Reviews & Ratings",
      description: "Proactively request reviews from guests. Respond promptly to feedback. Maintain 4.8+ star ratings to stay competitive.",
    },
    {
      step: "7",
      title: "Financial & Tax Compliance",
      description: "Track all income and expenses. Consult with an accountant about UAE tax obligations (VAT, corporate tax). Maintain records for audits.",
    },
    {
      step: "8",
      title: "Legal & Insurance",
      description: "Verify your lease/tenancy agreement allows short-term rentals. Obtain appropriate property insurance coverage for holiday home rentals.",
    },
  ];

  const challenges = [
    "Time commitment: 24/7 guest communication and issue resolution",
    "Upfront costs: Photography, legal setup, insurance, initial marketing",
    "Operational complexity: Cleaning coordination, maintenance scheduling",
    "Lower occupancy rates: Professional operators achieve 10-20% higher occupancy",
    "Limited market reach: Operators have stronger OTA relationships and marketing reach",
  ];

  return (
    <div className="min-h-screen" style={{ background: `radial-gradient(ellipse 900px 700px at 50% 35%, ${colors.secondary}12 0%, transparent 60%), linear-gradient(135deg, #FFFFFF 0%, ${colors.bgMain} 30%, ${colors.bgSection} 100%)` }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
        style={{
          background: colors.bgMain + "f0",
          borderBottom: "1px solid " + colors.border,
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="text-xs px-3 py-1.5 rounded-lg transition hover:bg-white/10 font-medium"
            style={{ background: colors.bgSection, border: "1px solid #333", color: colors.primary }}
          >
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <GroundWorksLogo size={40} />
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-base font-bold" style={{ color: colors.textMain }}>Ground</span>
                <span className="text-base font-bold" style={{ color: colors.primary }}>Works</span>
              </div>
              <span className="text-xs tracking-widest" style={{ color: colors.textLight, letterSpacing: "0.14em" }}>We work, You Decide</span>
            </div>
          </div>
          <div className="w-px h-4" style={{ background: colors.textLight }} />
          <div>
            <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Self Management Guide</p>
            <p className="text-sm font-semibold" style={{ color: colors.textMain }}>{propertyName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Hero */}
        <div className="rounded-2xl p-8" style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: colors.primary }}>Self Management Guide</p>
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.secondary }}>Keep 100% of Your Income</h1>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            Manage your property independently and maximize your profits. Follow these 8 steps to launch and operate your short-term rental successfully in Dubai.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl p-6"
              style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}
            >
              <div className="flex gap-4">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                  style={{ background: colors.bgMain, color: colors.primary, border: "1px solid " + colors.primary }}
                >
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2" style={{ color: colors.secondary }}>
                    {item.title}
                  </h3>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Challenges Section */}
        <div className="rounded-2xl p-8" style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: colors.secondary }}>Key Challenges to Consider</h2>
          <ul className="space-y-3">
            {challenges.map((challenge) => (
              <li key={challenge} className="flex items-start gap-3">
                <span style={{ color: colors.primary, marginTop: "2px", fontWeight: "bold" }}>•</span>
                <span style={{ color: colors.textMuted }} className="text-sm">
                  {challenge}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Break-Even Timeline */}
        <div className="rounded-2xl p-8" style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: colors.secondary }}>Break-Even Timeline</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl p-4" style={{ background: colors.bgMain, border: "1px solid " + colors.border }}>
              <p className="text-xs font-semibold mb-2" style={{ color: colors.textMuted }}>Self-Managed</p>
              <p className="text-2xl font-bold" style={{ color: colors.secondary }}>6–12 months</p>
              <p className="text-xs mt-2" style={{ color: colors.textMuted }}>After setup costs, marketing, and operational overhead</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: colors.bgMain, border: "1px solid " + colors.border }}>
              <p className="text-xs font-semibold mb-2" style={{ color: colors.textMuted }}>With Professional Operator</p>
              <p className="text-2xl font-bold" style={{ color: colors.primary }}>2–4 months</p>
              <p className="text-xs mt-2" style={{ color: colors.textMuted }}>Operators handle all operational complexity</p>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="rounded-2xl p-8" style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: colors.secondary }}>Why Professional Operators Win</h2>
          <div className="space-y-3">
            {[
              "10–20% higher occupancy rates through advanced revenue management",
              "Stronger relationships with OTA platforms (Airbnb, Booking.com priority positioning)",
              "Professional photography and marketing expertise",
              "24/7 guest support in multiple languages",
              "Proven pricing strategies that maximize ADR",
              "Efficient cleaning and maintenance networks",
              "Compliance expertise and legal protection",
            ].map((reason) => (
              <div key={reason} className="flex items-start gap-3">
                <span style={{ color: colors.primary, marginTop: "2px" }}>✓</span>
                <span style={{ color: colors.textMuted }} className="text-sm">
                  {reason}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Account Manager CTA */}
        <div className="rounded-2xl p-8 text-center" style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: colors.primary }}>Expert Support</p>
          <h2 className="text-2xl font-bold mb-4" style={{ color: colors.secondary }}>Don't Navigate Alone</h2>
          <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
            Self-management requires expertise in compliance, pricing, marketing, and operations. Our account managers guide property owners through every step of the setup and ongoing management process.
          </p>
          <div className="mb-6 space-y-3">
            {[
              "Complete DET compliance setup and property registration",
              "Optimize pricing strategy for your community and property type",
              "Professional photography and listing creation",
              "OTA platform setup and integration",
              "Cleaning and maintenance vendor coordination",
              "Tax and financial tracking guidance",
            ].map((service) => (
              <div key={service} className="flex items-start gap-3 justify-center">
                <span style={{ color: colors.primary }}>✓</span>
                <span style={{ color: colors.textMuted }} className="text-sm text-left">
                  {service}
                </span>
              </div>
            ))}
          </div>
          <button
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-all"
            style={{ background: colors.primary, color: "#FFF" }}
          >
            Connect with Account Manager
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pb-10 space-y-2">
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm font-bold" style={{ color: colors.textLight }}>Ground</span>
              <span className="text-sm font-bold" style={{ color: colors.primary + "66" }}>Works</span>
            </div>
            <span className="text-xs tracking-widest" style={{ color: colors.textLight, letterSpacing: "0.14em" }}>We work, You Decide</span>
          </div>
          <p className="text-xs" style={{ color: colors.textLight }}>
            Self-management is viable but requires significant time and effort. Consider whether your time is better spent on other priorities, or partner with a professional operator to maximize returns.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SelfManagePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: colors.bgMain }}>
          <div className="text-center">
            <div
              className="w-8 h-8 rounded-full border-2 animate-spin mx-auto mb-4"
              style={{ borderColor: colors.primary, borderTopColor: "transparent" }}
            />
            <p className="text-sm" style={{ color: colors.textMuted }}>Loading self-management guide...</p>
          </div>
        </div>
      }
    >
      <SelfManageContent />
    </Suspense>
  );
}
