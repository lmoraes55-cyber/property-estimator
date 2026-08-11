"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/lib/useIsMobile";
import SiteNav from "@/components/SiteNav";
import { colors, serif } from "@/components/home/theme";
import IndependentAdvisory from "@/components/home/IndependentAdvisory";

// ── Data ─────────────────────────────────────────────────────────────────────

const READINESS_CHECKLIST = [
  { title: "Guest Access & Amenities", items: ["Access cards", "Parking access if applicable", "Pool, gym, lobby, and community access", "Building guest-entry rules", "Clear check-in instructions"] },
  { title: "Furnishing & Styling", items: ["Complete furniture setup", "Comfortable bedding", "Lighting", "Wall art", "Cushions, rugs, mirrors, and decorative elements", "Balcony furniture where applicable", "Visually appealing presentation for photography"] },
  { title: "Permit & Compliance Setup", items: ["Holiday-home registration", "Unit permit", "Relevant insurance", "Access or smart-lock requirements", "Building approvals where required"] },
  { title: "Property Condition", items: ["Maintenance inspection", "Developer warranty/DLP review", "AC, plumbing, appliances, and fixtures checked", "Repairs completed before listing"] },
  { title: "Photography & Listing Preparation", items: ["Professional photography", "Correct staging", "Complete amenity list", "Compelling title and description", "Accurate house rules"] },
  { title: "Inventory & Handover", items: ["Complete property inventory", "Documented furniture and appliance condition", "Owner/operator handover record", "Key and access-card record"] },
];

const BOOKING_TIMELINE = [
  { title: "Booking Received", text: "The reservation enters the booking platform or property-management system." },
  { title: "Guest Details Confirmed", text: "Guest identity and stay details are verified ahead of arrival." },
  { title: "Pre-Arrival Communication", text: "The guest receives access guidance, building instructions, and relevant stay information." },
  { title: "Guest Check-In", text: "The guest arrives and gains access to the property." },
  { title: "Stay Support", text: "Guest questions, maintenance issues, and operational requests are managed during the stay." },
  { title: "Checkout", text: "The guest departs, access is recovered or reset, and the unit is inspected." },
  { title: "Housekeeping & Inspection", text: "The property is cleaned, linen is replaced, damage is checked, and the unit is prepared for the next guest." },
  { title: "Review & Reporting", text: "Guest feedback is followed up and booking performance is added to the owner's reporting." },
];

const MONEY_FLOW = ["Guest Booking Revenue", "OTA / Payment Deductions", "Management Fee, If Applicable", "Utilities & Operating Costs", "Maintenance / Supplies / Other Deductions", "Net Income To Owner"];

const SETUP_COSTS = ["Registration or onboarding", "Holiday-home permit", "Third-party liability insurance", "All-risks asset insurance", "Photography", "Smart lock or access setup", "Linen and towel sets", "Guest starter supplies", "Inventory setup", "Furnishing or styling upgrades"];
const ONGOING_COSTS = ["Operator management fee", "Utilities", "Internet", "Housekeeping model where applicable", "Maintenance", "Linen replacement", "Guest supplies", "Insurance renewal", "Permit renewal", "Software where self-managed"];

const PERFORMANCE_FACTORS = ["Strong Building & Location", "Competitive Nightly Pricing", "Attractive Furnishing & Photography", "Full Guest Access To Amenities", "Fast Guest Communication", "Reliable Housekeeping & Maintenance"];

const REPORTING_ITEMS = ["Monthly income statement", "Booking revenue", "Management fee", "Utility deductions", "Maintenance deductions", "Other approved costs", "Owner stay details", "Payment transfer record", "Occupancy", "ADR", "Reservation performance", "Inventory updates where relevant"];

const FAQS = [
  { q: "Is STR guaranteed to earn more than LTR?", a: "No. Performance depends on the property, location, pricing, seasonality, furnishing quality, operational execution, and costs." },
  { q: "Do I need an operator?", a: "No. Owners may self-manage, but they must arrange the required systems, compliance, vendors, pricing, guest support, and reporting." },
  { q: "Can I stay in my own property?", a: "Usually yes, subject to the management agreement and confirmed availability. Owner stays can reduce bookable nights and annual income." },
  { q: "Who pays utilities?", a: "This depends on the management model. The owner may pay utilities directly, or the operator may pay and deduct them from rental income." },
  { q: "Who pays for maintenance?", a: "Normally the owner remains responsible for property maintenance, although the operator may coordinate repairs and deduct approved costs depending on the agreement." },
  { q: "What happens if the property is unfurnished?", a: "The unit must be furnished and guest-ready before listing. AssetIntel can guide owners through furnishing options and package estimates." },
  { q: "How long does setup take?", a: "Timing depends on property readiness, permit processing, furnishing, photography, access arrangements, and operator onboarding." },
  { q: "How often do owners get paid?", a: "Payment cycles vary by operator and agreement. Owners should confirm statement and settlement timing before signing." },
];

// ── Small building blocks ───────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.16em", color: colors.secondary, textTransform: "uppercase", marginBottom: "12px" }}>{children}</div>;
}

function SectionHeading({ eyebrow, heading, sub, isMobile }: { eyebrow?: string; heading: string; sub?: string; isMobile: boolean }) {
  return (
    <div style={{ textAlign: "center", marginBottom: isMobile ? "32px" : "44px" }}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 style={{ fontFamily: serif, fontSize: isMobile ? "24px" : "30px", color: colors.primary, margin: "0 auto 12px", maxWidth: "760px" }}>{heading}</h2>
      {sub && <p style={{ fontSize: "14.5px", color: colors.textMuted, lineHeight: 1.65, margin: "0 auto", maxWidth: "640px" }}>{sub}</p>}
    </div>
  );
}

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${colors.border}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", padding: "18px 4px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <span style={{ fontSize: "14.5px", fontWeight: 700, color: colors.textMain }}>{q}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.65, margin: "0 4px 18px", maxWidth: "720px" }}>{a}</p>}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HowSTRWorksPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchForm, setMatchForm] = useState({ name: "", email: "", phone: "", property: "" });
  const [matchSubmitting, setMatchSubmitting] = useState(false);
  const [matchSubmitted, setMatchSubmitted] = useState(false);

  const handleMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMatchSubmitting(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...matchForm, source: "Private Operator Match — How STR Works" }),
      });
    } catch {}
    setMatchSubmitting(false);
    setMatchSubmitted(true);
  };

  const closeMatchModal = () => {
    setShowMatchModal(false);
    setMatchSubmitted(false);
    setMatchForm({ name: "", email: "", phone: "", property: "" });
  };

  const sectionPad = isMobile ? "56px 20px" : "80px 48px";

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh" }}>
      <SiteNav active="how-str-works" />

      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", paddingTop: isMobile ? "128px" : "148px", paddingBottom: isMobile ? "48px" : "64px" }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "url(/furnishing-premium.png)", backgroundSize: "cover", backgroundPosition: "center", opacity: isMobile ? 0.14 : 0.9 }} />
        {!isMobile && (
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(252,248,241,1) 0%, rgba(252,248,241,0.97) 30%, rgba(252,248,241,0.7) 52%, rgba(252,248,241,0.22) 78%, rgba(252,248,241,0.05) 100%)" }} />
        )}
        {isMobile && <div aria-hidden style={{ position: "absolute", inset: 0, background: colors.bgMain, opacity: 0.88 }} />}
        {!isMobile && (
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(252,248,241,0) 62%, rgba(252,248,241,0.6) 82%, rgba(252,248,241,1) 100%)" }} />
        )}

        <div style={{ position: "relative", zIndex: 2, maxWidth: 1520, margin: "0 auto", padding: isMobile ? "0 20px" : "0 48px" }}>
          <div style={{ maxWidth: "640px" }}>
            <Eyebrow>Owner STR Guide</Eyebrow>
            <h1 style={{ fontFamily: serif, fontSize: isMobile ? "30px" : "42px", lineHeight: 1.16, fontWeight: 700, color: colors.primary, margin: "0 0 18px" }}>
              How Short-Term Rental Works — From Property Setup To Owner Income
            </h1>
            <p style={{ fontSize: isMobile ? "14.5px" : "16px", color: colors.textMuted, lineHeight: 1.65, marginBottom: "28px" }}>
              A clear guide to preparing, licensing, listing, operating, and earning from a Dubai short-term rental property.
            </p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <button onClick={() => router.push("/estimator")} style={{ padding: "15px 26px", borderRadius: "12px", border: "none", background: colors.primary, color: "#fff", fontSize: "14.5px", fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 26px rgba(27,94,74,0.24)" }}>
                Estimate My STR Income
              </button>
              <button onClick={() => router.push("/self-manage/owners")} style={{ padding: "15px 26px", borderRadius: "12px", border: `1.5px solid ${colors.primary}`, background: "transparent", color: colors.primary, fontSize: "14.5px", fontWeight: 700, cursor: "pointer" }}>
                Explore Self-Manage Guide
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 1 — WHAT STR MEANS ── */}
      <section style={{ padding: sectionPad }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <SectionHeading isMobile={isMobile} eyebrow="The Basics" heading="What Is Short-Term Rental?" />
          <p style={{ fontSize: "14.5px", color: colors.textMuted, lineHeight: 1.75, maxWidth: "760px", margin: "0 auto 14px" }}>
            Short-term rental allows a property to be offered to guests for shorter stays rather than being rented to one annual tenant under a traditional long-term lease.
          </p>
          <p style={{ fontSize: "14.5px", color: colors.textMuted, lineHeight: 1.75, maxWidth: "760px", margin: "0 auto 36px" }}>
            Bookings may come from platforms such as Airbnb, Booking.com, or other suitable channels, depending on the operator or management model.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px", marginBottom: "36px" }}>
            {[
              { title: "Short-Term Rental", tint: "primary", items: ["Nightly or short-stay bookings", "Variable pricing", "Frequent guest turnover", "Active operations", "Higher income potential with higher operating involvement"] },
              { title: "Long-Term Rental", tint: "secondary", items: ["One tenant", "Annual tenancy contract", "Stable rent", "Lower operating involvement", "Generally more predictable income"] },
            ].map(col => (
              <div key={col.title} style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "16px", padding: "24px" }}>
                <div style={{ fontFamily: serif, fontSize: "17px", color: col.tint === "primary" ? colors.primary : colors.secondary, marginBottom: "14px" }}>{col.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {col.items.map(item => (
                    <div key={item} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "13px", color: colors.textMain, lineHeight: 1.5 }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: col.tint === "primary" ? colors.primary : colors.secondary, marginTop: "6px", flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <button onClick={() => router.push("/estimator")} style={{ padding: "13px 24px", borderRadius: "12px", border: `1.5px solid ${colors.primary}`, background: "transparent", color: colors.primary, fontSize: "13.5px", fontWeight: 700, cursor: "pointer" }}>
              Compare STR vs LTR
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 2 — TWO MANAGEMENT PATHS ── */}
      <section style={{ padding: sectionPad, background: colors.bgSage }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <SectionHeading isMobile={isMobile} heading="Who Manages The Property?" />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>
            <div style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "18px", padding: "28px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: serif, fontSize: "19px", color: colors.primary, marginBottom: "14px" }}>Use An STR Operator</div>
              <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "14px" }}>The operator may handle:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "18px", flex: 1 }}>
                {["Registration and permits", "Listings", "Pricing", "Guest communication", "Check-in", "Housekeeping coordination", "Maintenance coordination", "Owner reporting", "Income settlement"].map(t => (
                  <div key={t} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "13px", color: colors.textMain }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}><circle cx="12" cy="12" r="9.5" stroke={colors.primary} strokeWidth="1.2" opacity="0.4" /><path d="M7.5 12.3l2.8 2.8L16.5 9" stroke={colors.primary} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {t}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "12px", color: colors.textMuted, fontStyle: "italic", marginBottom: "18px" }}>The exact scope, costs, and responsibilities vary between operators and should be confirmed before signing.</p>
              <button onClick={() => setShowMatchModal(true)} style={{ padding: "13px 20px", borderRadius: "12px", border: "none", background: colors.primary, color: "#fff", fontSize: "13.5px", fontWeight: 700, cursor: "pointer" }}>
                Request Private Operator Match
              </button>
            </div>

            <div style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "18px", padding: "28px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: serif, fontSize: "19px", color: colors.secondary, marginBottom: "14px" }}>Self-Manage</div>
              <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "14px" }}>The owner is responsible for arranging:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "18px", flex: 1 }}>
                {["Registration and compliance", "OTA accounts", "PMS or channel manager", "Dynamic pricing", "Guest communication", "Housekeeping", "Maintenance", "Access", "Linen", "Inspections", "Reporting"].map(t => (
                  <div key={t} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "13px", color: colors.textMain }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}><circle cx="12" cy="12" r="9.5" stroke={colors.secondary} strokeWidth="1.2" opacity="0.4" /><path d="M7.5 12.3l2.8 2.8L16.5 9" stroke={colors.secondary} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {t}
                  </div>
                ))}
              </div>
              <button onClick={() => router.push("/self-manage/owners")} style={{ padding: "13px 20px", borderRadius: "12px", border: `1.5px solid ${colors.secondary}`, background: "transparent", color: colors.secondary, fontSize: "13.5px", fontWeight: 700, cursor: "pointer" }}>
                View Self-Manage
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 — PRE-LAUNCH CHECKLIST ── */}
      <section style={{ padding: sectionPad }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <SectionHeading isMobile={isMobile} eyebrow="Pre-Launch Setup" heading="What Needs To Happen Before The First Booking?" />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "18px", marginBottom: "32px" }}>
            {READINESS_CHECKLIST.map((group, i) => (
              <div key={group.title} style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "14px", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: i % 2 === 0 ? "rgba(27,94,74,0.10)" : "rgba(184,138,68,0.12)", color: i % 2 === 0 ? colors.primary : colors.secondary, fontFamily: serif, fontWeight: 700, fontSize: "12.5px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: "13.5px", fontWeight: 700, color: colors.textMain }}>{group.title}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {group.items.map(item => (
                    <div key={item} style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.5, paddingLeft: "4px", borderLeft: `2px solid ${colors.border}` }}>{item}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <a href="/str-readiness-guide" style={{ fontSize: "13.5px", fontWeight: 700, color: colors.primary, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              View Full STR Readiness Guide
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── SECTION 4 — BOOKING TIMELINE ── */}
      <section style={{ padding: sectionPad, background: colors.bgSage }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <SectionHeading isMobile={isMobile} heading="What Happens During A Guest Booking?" />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: "16px" }}>
            {BOOKING_TIMELINE.map((step, i) => (
              <div key={step.title} style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "14px", padding: "18px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: colors.secondary, marginBottom: "8px" }}>STEP {i + 1}</div>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: colors.textMain, marginBottom: "6px" }}>{step.title}</div>
                <div style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.5 }}>{step.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5 — MONEY FLOW ── */}
      <section style={{ padding: sectionPad }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <SectionHeading isMobile={isMobile} eyebrow="Owner Financial Flow" heading="How Does The Owner Get Paid?" />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0", marginBottom: "28px" }}>
            {MONEY_FLOW.map((step, i) => (
              <React.Fragment key={step}>
                <div style={{
                  width: "100%", maxWidth: "480px", textAlign: "center", padding: "14px 20px", borderRadius: "12px",
                  background: i === MONEY_FLOW.length - 1 ? colors.primary : colors.bgSection,
                  border: i === MONEY_FLOW.length - 1 ? "none" : `1px solid ${colors.border}`,
                  color: i === MONEY_FLOW.length - 1 ? "#fff" : colors.textMain,
                  fontSize: "13.5px", fontWeight: 700,
                }}>
                  {step}
                </div>
                {i < MONEY_FLOW.length - 1 && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "6px 0" }}><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                )}
              </React.Fragment>
            ))}
          </div>

          <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.65, textAlign: "center", maxWidth: "680px", margin: "0 auto 24px" }}>
            The exact deduction structure depends on the selected operator, management agreement, platform setup, and whether certain costs are paid directly by the owner or deducted from rental income.
          </p>

          <div style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "14px", padding: "20px 24px", maxWidth: "480px", margin: "0 auto 20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: colors.secondary, textTransform: "uppercase", marginBottom: "10px" }}>Example Only</div>
            <div style={{ fontSize: "13px", color: colors.textMain, lineHeight: 2 }}>
              Gross booking revenue<br />
              minus management fees<br />
              minus utilities and approved operating costs<br />
              <span style={{ fontWeight: 700 }}>equals net owner income</span>
            </div>
          </div>

          <p style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.6, textAlign: "center", maxWidth: "640px", margin: "0 auto" }}>
            Some operators may pay utilities on the owner&apos;s behalf and deduct them from rental income to reduce administrative work for the owner.
          </p>
        </div>
      </section>

      {/* ── SECTION 6 — COMMON COSTS ── */}
      <section style={{ padding: sectionPad, background: colors.bgSage }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <SectionHeading isMobile={isMobile} heading="What Costs Should Owners Expect?" />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
            {[{ title: "One-Time / Setup Costs", list: SETUP_COSTS }, { title: "Ongoing Costs", list: ONGOING_COSTS }].map(col => (
              <div key={col.title} style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "16px", padding: "24px" }}>
                <div style={{ fontFamily: serif, fontSize: "16px", color: colors.primary, marginBottom: "14px" }}>{col.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {col.list.map(item => (
                    <div key={item} style={{ fontSize: "13px", color: colors.textMain, paddingBottom: "8px", borderBottom: `1px solid ${colors.border}` }}>{item}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "12.5px", color: colors.textMuted, textAlign: "center", maxWidth: "640px", margin: "0 auto 10px" }}>
            Each operator has its own standards and commercial model. Owners should request a clear written breakdown before signing.
          </p>
          <p style={{ fontSize: "12.5px", color: colors.textMuted, textAlign: "center", maxWidth: "640px", margin: "0 auto" }}>
            Owners should also consider all-risks insurance to protect the property and its contents. AssetIntel can guide owners toward a suitable insurance provider where support is needed.
          </p>
        </div>
      </section>

      {/* ── SECTION 7 — PERFORMANCE FACTORS ── */}
      <section style={{ padding: sectionPad }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <SectionHeading isMobile={isMobile} heading="What Gives A Property The Best Chance Of Performing Well?" sub="Income depends on more than the building name. Furnishing quality, availability, operational execution, pricing, guest experience, reviews, and property condition can materially affect performance." />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(6, 1fr)", gap: "14px", marginBottom: "32px" }}>
            {PERFORMANCE_FACTORS.map((f, i) => (
              <div key={f} style={{ textAlign: "center", padding: "18px 12px", background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "14px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: i % 2 === 0 ? "rgba(27,94,74,0.10)" : "rgba(184,138,68,0.12)", color: i % 2 === 0 ? colors.primary : colors.secondary, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontFamily: serif, fontWeight: 700, fontSize: "13px" }}>{i + 1}</div>
                <div style={{ fontSize: "12.5px", fontWeight: 700, color: colors.textMain, lineHeight: 1.4 }}>{f}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <button onClick={() => router.push("/estimator")} style={{ padding: "14px 26px", borderRadius: "12px", border: "none", background: colors.primary, color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
              Run My Property Analysis
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 8 — OWNER REPORTING ── */}
      <section style={{ padding: sectionPad, background: colors.bgSage }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <SectionHeading isMobile={isMobile} heading="What Should An Owner Receive From An Operator?" />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: "10px", marginBottom: "22px" }}>
            {REPORTING_ITEMS.map(item => (
              <div key={item} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "12.5px", color: colors.textMain, background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: "10px", padding: "10px 12px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}><circle cx="12" cy="12" r="9.5" stroke={colors.primary} strokeWidth="1.2" opacity="0.4" /><path d="M7.5 12.3l2.8 2.8L16.5 9" stroke={colors.primary} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {item}
              </div>
            ))}
          </div>
          <p style={{ fontSize: "12.5px", color: colors.textMuted, textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
            Owners should understand the operator&apos;s reporting and settlement cycle before the property goes live.
          </p>
        </div>
      </section>

      {/* ── SECTION 9 — FAQ ── */}
      <section style={{ padding: sectionPad }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <SectionHeading isMobile={isMobile} heading="Common Questions From New STR Owners" />
          <div>
            {FAQS.map(f => <Accordion key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      <IndependentAdvisory isMobile={isMobile} />

      {/* ── FINAL CTA ── */}
      <section style={{ padding: isMobile ? "48px 20px 72px" : "72px 48px" }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto", position: "relative", overflow: "hidden",
          borderRadius: "26px", background: `linear-gradient(135deg, ${colors.primary}, #0F3E33)`,
          padding: isMobile ? "40px 24px" : "56px 64px", boxShadow: "0 24px 60px rgba(15,62,51,0.28)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "28px",
        }}>
          <div style={{ maxWidth: "600px" }}>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? "22px" : "28px", color: "#fff", lineHeight: 1.25, margin: "0 0 12px" }}>
              Ready To See Whether STR Works For Your Property?
            </h2>
            <p style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.72)", lineHeight: 1.6, margin: 0 }}>
              Generate a property-specific report comparing estimated STR income, long-term rental benchmarks, occupancy, ADR, costs, and net owner returns.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button onClick={() => router.push("/estimator")} style={{ padding: "14px 24px", borderRadius: "12px", border: "none", background: colors.secondary, color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
              Analyze My Property
            </button>
            <button onClick={() => setShowMatchModal(true)} style={{ padding: "14px 24px", borderRadius: "12px", border: "1.5px solid rgba(255,255,255,0.4)", background: "transparent", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
              Request Private Operator Match
            </button>
          </div>
        </div>
      </section>

      {/* ── Private Operator Match modal ── */}
      {showMatchModal && (
        <div onClick={() => { if (!matchSubmitting) closeMatchModal(); }} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(20,30,25,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: colors.bgSection, borderRadius: "20px", boxShadow: "0 32px 80px rgba(20,48,38,0.22)", width: "100%", maxWidth: "480px", padding: isMobile ? "28px 20px" : "36px 32px", position: "relative" }}>
            <button onClick={closeMatchModal} aria-label="Close" style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: colors.textMuted, fontSize: "22px", lineHeight: 1, padding: "4px 8px" }}>×</button>
            <div style={{ height: "3px", background: `linear-gradient(90deg,${colors.primary},rgba(27,94,74,0.18))`, borderRadius: "2px", marginBottom: "22px" }} />

            {matchSubmitted ? (
              <div style={{ textAlign: "center", padding: "16px 0 4px" }}>
                <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#EEF5F1", border: "1.5px solid rgba(27,94,74,0.18)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <p style={{ fontSize: "16px", fontWeight: 700, color: colors.primary, marginBottom: "8px" }}>Request Received</p>
                <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6 }}>AssetIntel will review your property details privately and follow up with suitable operator options.</p>
              </div>
            ) : (
              <form onSubmit={handleMatchSubmit}>
                <p style={{ fontSize: "18px", fontWeight: 800, color: colors.primary, marginBottom: "6px" }}>Request Private Operator Match</p>
                <p style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.55, marginBottom: "20px" }}>
                  Suitable operator options are shared privately based on your property and priorities — never shown publicly.
                </p>
                {[
                  { label: "Full Name", key: "name", type: "text", required: true },
                  { label: "Email", key: "email", type: "email", required: true },
                  { label: "Phone / WhatsApp", key: "phone", type: "tel", required: false },
                  { label: "Property / Building", key: "property", type: "text", required: false },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7A9A8A", marginBottom: "6px" }}>{f.label}{f.required && <span style={{ color: colors.secondary }}> *</span>}</label>
                    <input
                      type={f.type}
                      required={f.required}
                      value={(matchForm as any)[f.key]}
                      onChange={e => setMatchForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: "10px", border: `1.5px solid ${colors.border}`, background: "#FBF9F5", fontSize: "14px", color: colors.textMain, outline: "none", fontFamily: "inherit" }}
                    />
                  </div>
                ))}
                <button type="submit" disabled={matchSubmitting} style={{ width: "100%", padding: "13px", borderRadius: "12px", background: colors.primary, color: "#fff", fontSize: "13.5px", fontWeight: 700, border: "none", cursor: matchSubmitting ? "not-allowed" : "pointer", opacity: matchSubmitting ? 0.7 : 1, marginTop: "4px" }}>
                  {matchSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
