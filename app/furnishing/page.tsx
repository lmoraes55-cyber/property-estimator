"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { FURNISHING_COMPANIES, UPCOMING_OPERATORS, DET_INVENTORY_CHECKLIST } from "@/lib/furnishing";
import { colors } from "@/lib/colors";
import GroundWorksLogo from "@/components/GroundWorksLogo";

function FurnishingContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"self" | "3rdparty" | "operator">("self");

  const propertyName = params.get("propertyName") ?? "";
  const unitSize = params.get("unitSize") ?? "2BR";

  const handleBack = () => router.back();

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
            className="text-xs px-4 py-2 rounded-lg transition-all hover:bg-white/10 font-medium hover:-translate-y-0.5"
            style={{ background: colors.bgSection, border: "1px solid " + colors.border, color: colors.primary }}
          >
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <GroundWorksLogo size={40} />
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-base font-bold" style={{ color: colors.textMain }}>
                  Ground
                </span>
                <span className="text-base font-bold" style={{ color: colors.primary }}>
                  Works
                </span>
              </div>
              <span
                className="text-xs tracking-widest"
                style={{ color: colors.textLight, letterSpacing: "0.14em" }}
              >
                We work, You Decide
              </span>
            </div>
          </div>
          <div className="w-px h-4" style={{ background: colors.textLight }} />
          <div>
            <p className="text-xs font-medium" style={{ color: colors.textMuted }}>
              Furnishing Packages
            </p>
            <p className="text-sm font-semibold" style={{ color: colors.textMain }}>
              {propertyName}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Hero */}
        <div className="rounded-3xl p-10" style={{
          background: colors.bgSection,
          border: "1px solid " + colors.border,
          boxShadow: `0 1px 2px rgba(0,0,0,.04), 0 12px 32px rgba(0,0,0,.06), 0 24px 48px rgba(0,0,0,.04)`,
          backdropFilter: "blur(20px)"
        }}>
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: colors.primary, letterSpacing: "0.15em" }}>
            Part 3 of 3 · Furnishing Options
          </p>
          <h1 className="text-4xl font-bold mb-2" style={{ color: colors.secondary }}>
            Furnishing Your {unitSize}
          </h1>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            Choose your furnishing path: DIY compliance, professional interior design, or operator-handled. All options keep your property DET-compliant and guest-ready.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b" style={{ borderColor: colors.primary }}>
          {[
            { id: "self", label: "Self Furnish (DIY)" },
            { id: "3rdparty", label: "Interior Design Firms" },
            { id: "operator", label: "Operator Furnished" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="px-4 py-3 text-sm font-medium transition border-b-2"
              style={{
                borderColor: activeTab === tab.id ? colors.primary : "transparent",
                color: activeTab === tab.id ? colors.secondary : colors.textMuted,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Self Furnish Section */}
        {activeTab === "self" && (
          <div className="space-y-6">
            <div className="rounded-2xl p-6" style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
              <h2 className="text-2xl font-bold mb-3" style={{ color: colors.secondary }}>
                DIY Furnishing — DET Compliance Checklist
              </h2>
              <p style={{ color: colors.textMuted }} className="text-sm mb-6">
                Use this checklist to furnish your property to DET standards. Each category lists required items for a fully compliant, guest-ready home.
              </p>

              <div className="space-y-4">
                {DET_INVENTORY_CHECKLIST.map((section) => (
                  <div
                    key={section.category}
                    className="rounded-xl p-4"
                    style={{ background: colors.bgMain, border: "1px solid " + colors.primary }}
                  >
                    <h3 className="font-semibold mb-3" style={{ color: colors.secondary }}>
                      {section.category}
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {section.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm" style={{ color: colors.textMuted }}>
                          <span style={{ color: colors.primary, fontWeight: "bold" }}>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div
                className="rounded-xl p-4 mt-6"
                style={{ background: colors.bgMain, border: "1px solid " + colors.primary }}
              >
                <p className="text-xs font-semibold mb-2" style={{ color: colors.primary }}>
                  DET Compliance Tip
                </p>
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  Keep all receipts and product specs for DET audits. Focus on quality basics: DET requires mid-range furnishing (AED 15k–40k per 2BR). Budget for: furniture (~40%), appliances (~30%), soft goods (~20%), decor (~10%).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3rd Party Furnishing Section */}
        {activeTab === "3rdparty" && (
          <div className="space-y-6">
            <p style={{ color: colors.textMuted }} className="text-sm">
              Top 5 interior design firms specializing in DET-compliant holiday home furnishing. All handle end-to-end: design, sourcing, installation, and compliance handover.
            </p>

            {FURNISHING_COMPANIES.map((company, idx) => (
              <div
                key={company.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: colors.bgSection,
                  border: `1px solid ${idx === 0 ? colors.primary + "55" : colors.primary}`,
                }}
              >
                <div className="p-6">
                  {idx === 0 && (
                    <span
                      className="inline-block text-xs px-2.5 py-1 rounded-full font-semibold mb-3"
                      style={{ background: colors.bgMain, color: colors.secondary, border: "1px solid " + colors.primary }}
                    >
                      Top Rated
                    </span>
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: colors.textMain }}>
                        {company.name}
                      </h3>
                      <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                        {company.projectsCompleted}+ projects completed since {company.founded}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: colors.secondary }}>
                        {company.googleRating}
                      </div>
                      <p className="text-xs" style={{ color: colors.textMuted }}>
                        {company.googleReviewCount} reviews
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "Avg Timeline", value: `${company.avgProjectDays} days` },
                      { label: "DET Compliant", value: "Yes" },
                      { label: "2BR Cost", value: "AED 18k–80k" },
                      { label: "Coverage", value: company.communities.length + " areas" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-lg p-2 text-center"
                        style={{ background: colors.bgMain, border: "1px solid " + colors.primary }}
                      >
                        <p className="text-xs mb-1" style={{ color: colors.textMuted }}>
                          {stat.label}
                        </p>
                        <p className="text-sm font-bold" style={{ color: colors.secondary }}>
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-semibold mb-2" style={{ color: colors.textMuted }}>
                      Specialties
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {company.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="text-xs px-2 py-1 rounded"
                          style={{ background: colors.bgMain, color: colors.primary, border: "1px solid " + colors.primary }}
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-semibold mb-2" style={{ color: colors.textMuted }}>
                      Why Choose Them
                    </p>
                    <ul className="space-y-1">
                      {company.pros.map((pro) => (
                        <li key={pro} className="flex items-start gap-2 text-xs" style={{ color: colors.textMuted }}>
                          <span style={{ color: colors.primary }}>+</span> {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className="w-full py-2.5 rounded-lg text-sm font-bold transition"
                    style={{
                      background: idx === 0 ? "linear-gradient(135deg, " + colors.secondary + ", #B8844A)" : colors.bgMain,
                      color: idx === 0 ? "#FFF" : colors.secondary,
                      border: idx === 0 ? "none" : "1px solid " + colors.primary,
                    }}
                  >
                    {idx === 0 ? `Contact ${company.name} for Quote` : `Learn More about ${company.name}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Operator Furnished Section */}
        {activeTab === "operator" && (
          <div className="space-y-6">
            <div
              className="rounded-2xl p-8"
              style={{
                background: `linear-gradient(135deg, ${colors.bgSection} 0%, ${colors.bgSection} 100%)`,
                border: "1px solid " + colors.primary,
              }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ color: colors.secondary }}>
                Operator-Provided Furnishing
              </h2>
              <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
                Your chosen operator can provide fully DET-compliant furnishing as part of their service. This is often the easiest path — they handle everything from design to handover.
              </p>

              <div className="space-y-4">
                <div
                  className="rounded-xl p-4"
                  style={{ background: colors.bgMain, border: "1px solid " + colors.primary }}
                >
                  <p className="text-sm font-semibold mb-2" style={{ color: colors.secondary }}>
                    How It Works
                  </p>
                  <ol className="space-y-2">
                    {[
                      "Review the top operators you selected from the previous section",
                      "Contact 2–3 operators directly via their contact information",
                      "Request a furnishing quotation tailored to your property size",
                      "Operators will provide: design options, DET compliance guarantee, timeline, and pricing",
                      "Choose the best fit and hand over furnishing to them before your property goes live",
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm" style={{ color: colors.textMuted }}>
                        <span
                          className="font-bold flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full"
                          style={{ background: colors.bgSection, color: colors.secondary }}
                        >
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div
                  className="rounded-xl p-4"
                  style={{ background: colors.bgMain, border: "1px solid " + colors.primary }}
                >
                  <p className="text-xs font-semibold mb-3" style={{ color: colors.secondary }}>
                    Operator Advantages
                  </p>
                  <ul className="space-y-2">
                    {[
                      "They design for guest satisfaction — higher ADR potential",
                      "Full DET compliance — they know the standard inside-out",
                      "Faster turnaround — they have supplier relationships",
                      "Warranty coverage on furnishings they install",
                      "Optional ongoing maintenance as part of their service",
                      "Can be bundled into your partnership agreement or commission structure",
                    ].map((adv) => (
                      <li key={adv} className="flex items-start gap-2 text-xs" style={{ color: colors.textMuted }}>
                        <span style={{ color: colors.primary, fontWeight: "bold" }}>•</span> {adv}
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className="rounded-xl p-4"
                  style={{ background: "#1A3A1A22", border: "1px solid #1A4A1A44" }}
                >
                  <p className="text-sm font-semibold mb-2" style={{ color: colors.primary }}>
                    Next Step
                  </p>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    Go back to your operator match results (from the previous section) and reach out to your top 2–3 matches. They can prepare a turnkey furnishing proposal for you.
                  </p>
                  <button
                    onClick={() => router.back()}
                    className="mt-4 w-full py-2.5 rounded-lg text-sm font-bold"
                    style={{
                      background: colors.bgMain,
                      color: colors.primary,
                      border: "1px solid " + colors.primary,
                    }}
                  >
                    ← Back to Operators
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pb-10 space-y-2">
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm font-bold" style={{ color: colors.textLight }}>
                Ground
              </span>
              <span className="text-sm font-bold" style={{ color: colors.primary + "66" }}>
                Works
              </span>
            </div>
            <span className="text-xs tracking-widest" style={{ color: colors.textLight, letterSpacing: "0.14em" }}>
              We work, You Decide
            </span>
          </div>
          <p className="text-xs" style={{ color: colors.textLight }}>
            All furnishing options are DET-verified and guest-ready. Choose what suits your timeline and preferences.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FurnishingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: colors.bgMain }}>
          <div className="text-center">
            <div
              className="w-8 h-8 rounded-full border-2 animate-spin mx-auto mb-4"
              style={{ borderColor: colors.primary, borderTopColor: "transparent" }}
            />
            <p className="text-sm" style={{ color: colors.textMuted }}>
              Loading furnishing options...
            </p>
          </div>
        </div>
      }
    >
      <FurnishingContent />
    </Suspense>
  );
}
