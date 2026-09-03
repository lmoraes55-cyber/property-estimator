"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AssetIntelLogo from "@/components/AssetIntelLogo";
import SiteNav from "@/components/SiteNav";
import DecorativeBackdrop from "@/components/DecorativeBackdrop";
import AccessGate from "@/components/AccessGate";
import { colors } from "@/lib/colors";
import { useIsMobile } from "@/lib/useIsMobile";

const DISPLAY = "var(--font-display), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-mono-ai), ui-monospace, monospace";
const DANGER = "#B03030"; // 6.0:1 on white — AA for the red-flag labels

const ESTIMATOR = "/self-manage/str-subleasing/estimator";

/* ── Primitives, matching the report's sections ─────────────────────────── */

function Eyebrow({ children, tone = colors.textLight }: { children: React.ReactNode; tone?: string }) {
  return (
    <p style={{ fontFamily: MONO, fontSize: "10.5px", letterSpacing: "0.12em", textTransform: "uppercase", color: tone, margin: "0 0 8px" }}>
      {children}
    </p>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section
      style={{
        position: "relative", overflow: "hidden",
        // A 2.5% green wash over the first 180px keeps the surface from
        // reading as flat white against the near-white page ground.
        background: `linear-gradient(180deg, rgba(27,94,74,0.026) 0%, rgba(27,94,74,0) 180px), ${colors.bgSection}`,
        border: `1px solid ${colors.border}`, borderRadius: "22px", padding: "26px 28px", ...style,
      }}
    >
      {/* Crown: a hairline across the top edge, weighted bronze at the left. */}
      <span aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, ${colors.secondary} 0%, ${colors.secondary} 64px, rgba(184,138,68,0.22) 64px, rgba(184,138,68,0) 340px)` }} />
      {children}
    </section>
  );
}

function Head({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="ai-title-grad" style={{ fontFamily: DISPLAY, fontSize: "clamp(19px, 2.1vw, 25px)", fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.2, margin: "0 0 8px" }}>
        {title}
      </h2>
      {sub && <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.55, margin: 0, maxWidth: "64ch" }}>{sub}</p>}
      <div style={{ position: "relative", height: "1px", background: colors.border, marginTop: "20px" }}>
        <span aria-hidden="true" style={{ position: "absolute", left: 0, top: "-1px", width: "40px", height: "3px", background: colors.secondary, borderRadius: "2px" }} />
      </div>
    </div>
  );
}

function SubHead({ children, tone = colors.textLight }: { children: React.ReactNode; tone?: string }) {
  return (
    <p style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: tone, margin: "0 0 4px" }}>
      {children}
    </p>
  );
}

/** A divided list — the report's ledger, used everywhere a tinted card grid was. */
function List({ items }: { items: React.ReactNode[] }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ padding: "10px 0", borderTop: i === 0 ? "none" : `1px solid ${colors.border}`, fontSize: "13px", color: colors.textMuted, lineHeight: 1.6 }}>
          {item}
        </div>
      ))}
    </div>
  );
}

function Columns({ isMobile, cols, children }: { isMobile: boolean; cols: number; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : `repeat(${cols}, 1fr)`, gap: isMobile ? "26px" : "32px" }}>
      {children}
    </div>
  );
}

const Chevron = ({ open }: { open: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function FormulaRows({ rows, isMobile }: { rows: { label: string; formula: string; note: string }[]; isMobile: boolean }) {
  return (
    <div>
      {rows.map(({ label, formula, note }, i) => (
        <div key={label} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "190px 1fr 1fr", gap: isMobile ? "6px" : "20px", padding: "14px 0", borderTop: i === 0 ? "none" : `1px solid ${colors.border}`, alignItems: "start" }}>
          <span style={{ fontSize: "13.5px", color: colors.textMain }}>{label}</span>
          <span style={{ fontFamily: MONO, fontSize: "12px", color: colors.secondaryText, lineHeight: 1.55 }}>{formula}</span>
          <span style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.55 }}>{note}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Pillar detail panels ───────────────────────────────────────────────── */

function PillarOneDetail({ isMobile }: { isMobile: boolean }) {
  const groups = [
    { title: "Location criteria", flag: false, items: ["Prime STR area: Dubai Marina, JBR, Downtown, Palm Jumeirah, or Emaar Beachfront", "Walking distance to beach, marina, or major tourist attractions", "Strong Airbnb supply density — usually a sign of proven demand", "Building already listed on Airbnb and Booking.com by other operators — proof of concept"] },
    { title: "Property criteria", flag: false, items: ["Higher floors can support stronger pricing in some buildings, but the impact varies by building, view, and comparable performance", "Sea, marina, Burj Khalifa, or city view — standard views may generate lower ADR, so the rent must still work under conservative revenue assumptions", "Studio or 1BR — smaller units have lower rent obligations, fill faster, and are easier to operate", "Building permits holiday home operation (confirm in writing before signing)"] },
    { title: "Financial criteria", flag: false, items: ["Rent-to-revenue gap: projected annual STR revenue should exceed annual rent with a healthy margin", "Break-even occupancy comfortably below market norms — use the Risk Estimator to check before committing", "Setup cost (furnishing) recoverable within a reasonable payback period", "Minimum 3-month cash buffer covering rent, utilities, and cleaning if bookings are slow"] },
    { title: "Signals to investigate further", flag: true, items: ["Standard view or low/podium floor in a competitive building", "Rent that leaves little margin versus comparable STR performance in the same building", "Landlord unwilling to give written STR permission", "Building management has restricted or blocked holiday home permits", "Areas where LTR data suggests softer demand — worth deeper diligence"] },
  ];
  const dimensions = [
    { dimension: "STR demand", max: 5, desc: "Prime area (Marina/JBR/Downtown/Palm): 5 pts · Strong area (Business Bay/Creek/DIFC): 3 pts · Other: 1 pt" },
    { dimension: "View & floor", max: 5, desc: "Higher floor with premium view: 5 pts · Mid-floor or city view: 3–4 pts · Lower floor or standard view: 1 pt" },
    { dimension: "Rent pressure", max: 5, desc: "Break-even occupancy below 50%: 5 pts · 50–65%: 3 pts · 65–80%: 1 pt · Above 80%: 0 pts — reconsider" },
    { dimension: "Operational ease", max: 3, desc: "Smart lock permitted + cooperative building reception: 3 pts · Key safe only: 2 pts · Difficult access: 0 pts" },
    { dimension: "Exit flexibility", max: 2, desc: "1-month break clause: 2 pts · 3-month notice: 1 pt · No break clause: 0 pts" },
  ];
  const bands = [
    { range: "18–20 pts", label: "Proceed", tone: colors.primary },
    { range: "13–17 pts", label: "Negotiate", tone: colors.secondaryText },
    { range: "Below 13", label: "Avoid", tone: DANGER },
  ];

  return (
    <div>
      <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.6, margin: "0 0 26px", maxWidth: "64ch" }}>
        The property selection decision carries the most risk in STR sub-leasing. Rent is fixed while STR revenue is seasonal — choosing the wrong unit is how operators lose money before they start.
      </p>

      <Columns isMobile={isMobile} cols={2}>
        {groups.map(({ title, items, flag }) => (
          <div key={title}>
            <SubHead tone={flag ? DANGER : colors.textLight}>{title}</SubHead>
            <List items={items} />
          </div>
        ))}
      </Columns>

      <div style={{ marginTop: "32px", paddingTop: "26px", borderTop: `1px solid ${colors.border}` }}>
        <SubHead>Area &amp; building risk scoring</SubHead>
        <h3 style={{ fontFamily: DISPLAY, fontSize: "19px", fontWeight: 400, color: colors.textMain, margin: "0 0 6px" }}>Score any unit across 5 dimensions</h3>
        <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.55, margin: "0 0 18px", maxWidth: "64ch" }}>
          Before signing any lease, score the unit. Aim for 18+ points before proceeding.
        </p>

        <div>
          {dimensions.map(({ dimension, max, desc }, i) => (
            <div key={dimension} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "180px 1fr 56px", gap: "14px", padding: "12px 0", borderTop: i === 0 ? "none" : `1px solid ${colors.border}`, alignItems: "baseline" }}>
              <span style={{ fontSize: "13.5px", color: colors.textMain }}>{dimension}</span>
              <span style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.55 }}>{desc}</span>
              <span style={{ fontFamily: MONO, fontSize: "12px", color: colors.textLight, textAlign: isMobile ? "left" : "right", fontVariantNumeric: "tabular-nums" }}>{max} pts</span>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? "12px" : "28px", marginTop: "22px", paddingTop: "20px", borderTop: `1px solid ${colors.border}` }}>
          {bands.map(({ range, label, tone }) => (
            <div key={range}>
              <p style={{ fontFamily: DISPLAY, fontSize: "17px", fontWeight: 500, color: tone, margin: "0 0 2px" }}>{label}</p>
              <p style={{ fontFamily: MONO, fontSize: "11.5px", color: colors.textLight, margin: 0, fontVariantNumeric: "tabular-nums" }}>{range}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PillarTwoDetail({ isMobile }: { isMobile: boolean }) {
  const groups = [
    { title: "Landlord approval", items: ["Written permission for STR / holiday home operation", "Contract clause or addendum specifying holiday home use", "Permission to apply for DET holiday home permit", "Clarity on guest access and building rules", "If a landlord declines in writing, that unit is off the table"] },
    { title: "DET portal setup", items: ["Create or access DET holiday home portal account", "Prepare and upload all required documents", "Submit unit details and property photos", "Track approval status — budget 3–7 working days", "Display permit in the property at all times after approval"] },
    { title: "Required documents", items: ["Tenancy contract (signed, registered)", "Landlord NOC or written approval letter", "Passport or Emirates ID of operator", "DEWA bill for the property", "Property photos to DET standard", "Company documents if operating as a business"] },
    { title: "Ongoing compliance", items: ["Permit must be active before listing on any platform", "Collect guest ID (passport or Emirates ID) on every check-in", "Maintain a guest register — retained for 5 years", "Annual permit renewal — set reminder 45 days before expiry", "Tourism Dirham process where applicable"] },
  ];
  const steps = [
    { title: "Position yourself as a professional operator", body: "Say: 'I operate a registered holiday home management business and am looking for a property to manage as a licensed DET holiday home. I will maintain the property to a premium standard, provide monthly reports, and ensure full DET compliance.'" },
    { title: "What to ask for in the contract", body: "Written STR permission clause, a 1-month break clause (or 3-month minimum), clarity on major vs minor maintenance, permission to install a smart lock, and agreement on how damage is handled beyond the security deposit." },
    { title: "What to offer the landlord", body: "A premium above market rent (5–15% is typical for STR permission), guaranteed rent via post-dated cheques, a 2-month security deposit, monthly property condition reports, and a 1-year minimum term with renewal option." },
    { title: "Handle objections before they arise", body: "'What about building rules?' → Confirm building eligibility before approaching the landlord. 'Is this legal?' → Show them the DET permit process." },
    { title: "Contract wording to include", body: "'The tenant is permitted to operate the property as a holiday home registered with the Dubai Department of Economy and Tourism (DET). The tenant will maintain a valid DET permit at all times and comply with all applicable regulations.'" },
  ];

  return (
    <div>
      <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.6, margin: "0 0 26px", maxWidth: "64ch" }}>
        Before operating, secure landlord permission in writing, complete DET registration, and have all documentation in order. Operating without either is illegal in Dubai.
      </p>

      <Columns isMobile={isMobile} cols={2}>
        {groups.map(({ title, items }) => (
          <div key={title}>
            <SubHead>{title}</SubHead>
            <List items={items} />
          </div>
        ))}
      </Columns>

      <div style={{ marginTop: "32px", paddingTop: "26px", borderTop: `1px solid ${colors.border}` }}>
        <SubHead>Landlord negotiation framework</SubHead>
        <div style={{ marginTop: "14px" }}>
          {steps.map(({ title, body }, i) => (
            <div key={title} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: "14px", padding: "14px 0", borderTop: i === 0 ? "none" : `1px solid ${colors.border}` }}>
              <span style={{ fontFamily: MONO, fontSize: "12px", color: colors.textLight, lineHeight: 1.6, fontVariantNumeric: "tabular-nums" }}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p style={{ fontSize: "13.5px", color: colors.textMain, margin: "0 0 5px" }}>{title}</p>
                <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6, margin: 0 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p style={{ fontSize: "12.5px", color: colors.textLight, lineHeight: 1.6, margin: "24px 0 0", paddingTop: "18px", borderTop: `1px solid ${colors.border}` }}>
        This section is educational and not legal advice. Verify all licensing and approval requirements with the DET, building management, and a qualified advisor before signing any lease or operating a holiday home.
      </p>
    </div>
  );
}

function PillarThreeDetail({ isMobile }: { isMobile: boolean }) {
  const groups = [
    { title: "Maintenance team", items: ["Handyman on call (24hr response)", "AC service contact for summer", "Appliance repair — fridge, washer, dryer", "Emergency response protocol", "Damage reporting and documentation process"] },
    { title: "Housekeeping team", items: ["Same-day turnover cleaning capability", "Linen handling and laundry coordination", "3 sets of linen per bed minimum", "Inventory checks post-turnover", "Inspection photos after every clean"] },
    { title: "Guest relations", items: ["Sub-1 hour message response at all times", "Check-in support on arrival day", "Complaint handling and empathy protocol", "Review management and response process", "Escalation chain when issues arise"] },
    { title: "Virtual assistants", items: ["Message templates for common scenarios", "Booking inquiries and pre-arrival communication", "Calendar and availability coordination", "Task follow-up and team coordination", "Guest support coverage across time zones"] },
    { title: "Access & check-in", items: ["Smart lock (primary entry method)", "Backup physical key protocol", "Building access card coordination", "Parking instructions and security", "Late arrival and early departure handling"] },
    { title: "Quality control", items: ["Post-checkout inspection checklist", "Damage reporting before next check-in", "Maintenance log with response tracking", "Monthly replacement reserve (10–15% of revenue)", "Quarterly deep-clean schedule"] },
  ];
  return (
    <div>
      <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.6, margin: "0 0 26px", maxWidth: "64ch" }}>
        STR sub-leasing is an active business, not passive income. These are the teams and workflows to have in place before the first guest checks in.
      </p>
      <Columns isMobile={isMobile} cols={3}>
        {groups.map(({ title, items }) => (
          <div key={title}>
            <SubHead>{title}</SubHead>
            <List items={items} />
          </div>
        ))}
      </Columns>
    </div>
  );
}

function PillarFourDetail({ isMobile }: { isMobile: boolean }) {
  const tools = [
    { title: "PMS / channel manager", examples: "Hostaway, Guesty, Hostfully", purpose: "Sync calendars, manage bookings, avoid double bookings, centralise messages, and manage tasks across all platforms from one dashboard." },
    { title: "Dynamic pricing", examples: "PriceLabs, Beyond, Wheelhouse", purpose: "Adjust nightly rates automatically by seasonality, demand signals, local events, and occupancy trends." },
    { title: "Guest messaging", examples: "Hospitable, Host Tools, PMS automations", purpose: "Automate confirmations, check-in instructions, checkout reminders, and review requests." },
    { title: "Task management", examples: "Trello, ClickUp, Notion, PMS task tools", purpose: "Coordinate cleaners, maintenance vendors, inspections, and issue follow-ups." },
    { title: "Smart access", examples: "Yale, Nuki, TTLock", purpose: "Secure self-check-in without key handover risk. Guests receive a unique code per booking." },
    { title: "Finance tracking", examples: "Google Sheets, Xero, Zoho Books", purpose: "Track gross revenue, rent, utilities, cleaning, platform fees, maintenance, and monthly net profit." },
  ];
  return (
    <div>
      <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.6, margin: "0 0 20px", maxWidth: "64ch" }}>
        Sub-leasing cannot be managed from WhatsApp and spreadsheets once bookings start. A proper system stack controls calendars, pricing, messages, tasks, and reporting.
      </p>
      <div>
        {tools.map(({ title, examples, purpose }, i) => (
          <div key={title} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "200px 1fr", gap: isMobile ? "6px" : "24px", padding: "16px 0", borderTop: i === 0 ? "none" : `1px solid ${colors.border}` }}>
            <div>
              <p style={{ fontSize: "13.5px", color: colors.textMain, margin: "0 0 3px" }}>{title}</p>
              <p style={{ fontFamily: MONO, fontSize: "11px", color: colors.secondaryText, margin: 0, lineHeight: 1.5 }}>{examples}</p>
            </div>
            <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6, margin: 0 }}>{purpose}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const PILLARS = [
  { num: "01", title: "Property Selection", body: "Find a unit that can survive seasonality and still produce acceptable returns.", meta: "Rent pressure · Break-even occupancy · Building suitability · Unit economics", Detail: PillarOneDetail },
  { num: "02", title: "Licensing & Compliance", body: "Understand the approvals, agreements and setup required before operating.", meta: "Landlord approval · DET setup · Required documentation · Building rules", Detail: PillarTwoDetail },
  { num: "03", title: "Operations Setup", body: "Build the team and processes required to handle guests and property operations.", meta: "Housekeeping · Maintenance · Guest support · Check-in & inspections", Detail: PillarThreeDetail },
  { num: "04", title: "Systems & Pricing", body: "Use the right tools to manage listings, calendars, guest communication and pricing.", meta: "PMS · Channel management · Dynamic pricing · Reporting", Detail: PillarFourDetail },
];

const COMMON_MISTAKES = [
  { mistake: "Signing a lease without written STR permission", fix: "Verbal agreements are hard to enforce in a dispute. Get written approval in the lease contract before signing anything." },
  { mistake: "Choosing a lower-floor or standard-view unit to save on rent", fix: "The rent saving is often eaten by lower nightly rates and occupancy — check the numbers with the Risk Estimator rather than assuming." },
  { mistake: "Underestimating summer cash flow pressure", fix: "June–August occupancy typically drops. You still pay full rent. Model your P&L for a conservative low-occupancy month before committing." },
  { mistake: "Operating without a DET permit", fix: "Fines and permit blacklisting are possible. Apply before furnishing. Never list until the permit is confirmed." },
  { mistake: "Using optimistic ADR assumptions to make the numbers work", fix: "If the model only works with an ADR above what comparable listings in your building are achieving, treat that as a red flag." },
  { mistake: "No break clause in the lease", fix: "A 12-month lease with no break clause locks you into paying rent even if the unit underperforms. Negotiate a break option where possible." },
  { mistake: "Scaling too fast before proving unit one", fix: "Prove the model on unit one for a few months before signing a second lease." },
];

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function STRSubleasingPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [openPillar, setOpenPillar] = useState<number | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);
  const [showMistakes, setShowMistakes] = useState(false);

  const shell: React.CSSProperties = {
    maxWidth: "1080px", margin: "0 auto",
    padding: isMobile ? "0 20px" : "0 40px",
    display: "flex", flexDirection: "column", gap: "20px",
  };

  const sampleInputs = [
    ["Building", "Marina Gate 2"],
    ["Unit size", "1 Bedroom"],
    ["Floor", "24 (high)"],
    ["View", "Marina"],
    ["Asking rent", "AED 9,500 / mo"],
  ];
  const sampleOutputs = [
    ["Break-even occupancy", "58%"],
    ["Risk level", "Low"],
    ["Est. net profit / yr", "AED 42,800"],
    ["Cash buffer required", "AED 57,000"],
  ];

  const numbers = [
    { title: "Projected STR revenue", body: "Your realistic annual and monthly revenue based on current STR assumptions." },
    { title: "Annual landlord rent", body: "Your largest fixed cost and the number the business must survive every month." },
    { title: "Break-even occupancy", body: "The occupancy level required before the unit begins generating positive cash flow." },
    { title: "Cash buffer", body: "How much reserve capital may be needed to survive low season and unexpected costs." },
  ];

  const formulas = [
    { label: "Monthly revenue", formula: "ADR × Occupied Nights", note: "Use the Risk Estimator for a realistic ADR projection. Avoid optimistic numbers." },
    { label: "Break-even occupancy", formula: "Monthly Fixed Costs ÷ ADR ÷ Days in Month", note: "Break-even meaningfully above market norms should prompt a closer look." },
    { label: "Monthly profit", formula: "Gross Revenue − Rent − Platform Fees − Utilities − Cleaning − Maintenance Reserve − Furniture Amortisation", note: "Should be positive across the full year, including summer low-season months." },
    { label: "Minimum cash buffer", formula: "3 to 6 months of rent and operating costs", note: "Model a conservative low-occupancy month before committing." },
  ];
  const costs = [
    { label: "Platform fees", formula: "~18% of gross (Airbnb + Booking.com blended)", note: "Deducted automatically by platforms before payout." },
    { label: "Landlord rent", formula: "Monthly rent × 12 — fixed, paid regardless of occupancy", note: "Your biggest cost. Does not flex with your revenue." },
    { label: "Utilities (DEWA, AC, internet)", formula: "AED 600–1,200/month in summer, AED 400–700 in winter", note: "You pay these — the landlord does not." },
    { label: "Cleaning costs", formula: "AED 150–350 per turn × estimated turns per month", note: "A 1BR at strong occupancy can average 8–12 turns per month." },
    { label: "Furniture amortisation", formula: "Setup cost (AED 30–55k for 1BR) ÷ 5 years ÷ 12", note: "Spread over 5 years. You own the furniture — recovery possible on exit." },
  ];
  const buffers = [
    ["Minimum buffer", "3 months rent + utilities"],
    ["Recommended buffer", "5 months (covers full low season)"],
    ["Setup cost (1BR)", "AED 30,000–55,000 fully furnished"],
    ["Break-even target", "As low as achievable at market ADR"],
  ];
  const services = [
    { title: "Unit screening", body: "Review rent, building, STR potential and risk before signing." },
    { title: "Licensing guidance", body: "Understand landlord approval, DET setup and required documents." },
    { title: "Operations setup", body: "Connect with experienced STR housekeeping, maintenance and guest-support teams." },
    { title: "Systems setup", body: "Guidance on PMS, channels, pricing tools and operational workflows." },
  ];

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh", position: "relative" }}>
      <DecorativeBackdrop />
      <div style={{ position: "relative", zIndex: 1 }}>
        <SiteNav active="self-manage" />

        <style>{`
          .sl-pillar { display: grid; grid-template-columns: 34px 1fr auto; gap: 16px; align-items: baseline;
            width: 100%; text-align: left; background: none; border: none; cursor: pointer;
            padding: 20px 2px; color: inherit; font: inherit; transition: background 0.15s; }
          .sl-pillar:hover { background: rgba(27,94,74,0.028); }
          .sl-pillar:hover .sl-pillar-title { color: ${colors.primary}; }
          .sl-pillar-row { position: relative; }
          .sl-pillar-row.is-open::before { content: ""; position: absolute; left: -14px; top: 20px; bottom: 12px; width: 2px; border-radius: 2px; background: ${colors.secondary}; }
          @media (max-width: 640px) { .sl-hero { grid-template-columns: 1fr !important; } }
        `}</style>

        <div style={{ ...shell, paddingTop: isMobile ? "28px" : "44px", paddingBottom: isMobile ? "48px" : "72px" }}>

          {/* ── Hero ── */}
          <div className="sl-hero" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.15fr 0.85fr", gap: isMobile ? "24px" : "36px", alignItems: "center", marginBottom: "8px" }}>
            <div>
              <Eyebrow tone={colors.secondaryText}>STR sub-leasing risk estimator</Eyebrow>
              <h1 className="ai-title-grad" style={{ fontFamily: DISPLAY, fontSize: isMobile ? "clamp(28px,8vw,38px)" : "clamp(34px,3.4vw,48px)", fontWeight: 300, lineHeight: 1.08, letterSpacing: "-0.025em", margin: "0 0 16px" }}>
                Check the unit before you sign the lease
              </h1>
              <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.65, margin: "0 0 26px", maxWidth: "54ch" }}>
                AssetIntel helps you estimate whether a sub-leased unit can survive low season, cover fixed rent, and produce realistic profit — before you commit to the landlord.
              </p>
              <button
                onClick={() => router.push(ESTIMATOR)}
                style={{ padding: "13px 26px", background: colors.primary, color: "#fff", borderRadius: "10px", fontSize: "14px", fontWeight: 500, cursor: "pointer", border: "none", letterSpacing: "0.01em" }}
              >
                Open risk estimator →
              </button>
            </div>

            {/* Sample readout — the report's ledger, not a bordered brochure card. */}
            <Card style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", marginBottom: "16px" }}>
                <Eyebrow>Sample output</Eyebrow>
                <span style={{ fontSize: "11.5px", color: colors.textLight }}>Marina Gate 2 · 1BR</span>
              </div>

              <SubHead>Inputs</SubHead>
              <div style={{ marginBottom: "18px" }}>
                {sampleInputs.map(([k, v], i) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "7px 0", borderTop: i === 0 ? "none" : `1px solid ${colors.border}` }}>
                    <span style={{ fontSize: "12.5px", color: colors.textLight }}>{k}</span>
                    <span style={{ fontSize: "12.5px", color: colors.textMain, fontVariantNumeric: "tabular-nums" }}>{v}</span>
                  </div>
                ))}
              </div>

              <SubHead>Outputs</SubHead>
              <div>
                {sampleOutputs.map(([k, v], i) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", padding: "9px 0", borderTop: i === 0 ? "none" : `1px solid ${colors.border}` }}>
                    <span style={{ fontSize: "12.5px", color: colors.textLight }}>{k}</span>
                    <span style={{ fontFamily: DISPLAY, fontSize: "15px", fontWeight: 500, color: colors.primary, fontVariantNumeric: "tabular-nums" }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${colors.borderStrong}` }}>
                <span style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: colors.textLight }}>Recommendation</span>
                <span style={{ fontFamily: DISPLAY, fontSize: "18px", fontWeight: 500, color: colors.primary }}>Proceed</span>
              </div>
            </Card>
          </div>

          <AccessGate source="str-subleasing" title="Unlock The Sub-Leasing Playbook" subtitle="Free — sign up or log in to see the full framework, financial methodology, and risk breakdown.">
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* ── The 4 pillars ── */}
              <Card>
                <Head
                  eyebrow="Framework"
                  title="The four pillars of a safe setup"
                  sub="Before taking a unit, make sure the property, licensing, operations and systems can all support the business."
                />
                <div>
                  {PILLARS.map(({ num, title, body, meta }, i) => {
                    const open = openPillar === i;
                    return (
                      <div key={num} className={`sl-pillar-row${open ? " is-open" : ""}`} style={{ borderTop: i === 0 ? "none" : `1px solid ${colors.border}` }}>
                        <button
                          className="sl-pillar"
                          aria-expanded={open}
                          onClick={() => setOpenPillar(open ? null : i)}
                        >
                          <span style={{ fontFamily: MONO, fontSize: "12px", color: open ? colors.secondaryText : colors.textLight, fontVariantNumeric: "tabular-nums" }}>{num}</span>
                          <span style={{ minWidth: 0 }}>
                            <span className="sl-pillar-title" style={{ display: "block", fontFamily: DISPLAY, fontSize: "17px", fontWeight: 400, color: colors.textMain, lineHeight: 1.3, marginBottom: "4px", transition: "color 0.15s" }}>
                              {title}
                            </span>
                            <span style={{ display: "block", fontSize: "13px", color: colors.textMuted, lineHeight: 1.55, marginBottom: "5px" }}>{body}</span>
                            <span style={{ display: "block", fontFamily: MONO, fontSize: "11px", color: colors.textLight, lineHeight: 1.5 }}>{meta}</span>
                          </span>
                          <span style={{ color: open ? colors.primary : colors.textLight, display: "flex", alignItems: "center" }}><Chevron open={open} /></span>
                        </button>
                        {open && (
                          <div style={{ padding: isMobile ? "4px 0 26px" : "4px 0 30px 50px" }}>
                            {React.createElement(PILLARS[i].Detail, { isMobile })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* ── The numbers ── */}
              <Card>
                <Head eyebrow="The numbers that matter" title="Before you sign, check these four" />

                <Columns isMobile={isMobile} cols={4}>
                  {numbers.map(({ title, body }) => (
                    <div key={title}>
                      <SubHead>{title}</SubHead>
                      <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6, margin: "6px 0 0" }}>{body}</p>
                    </div>
                  ))}
                </Columns>

                <p style={{ fontFamily: DISPLAY, fontSize: isMobile ? "17px" : "19px", fontWeight: 400, color: colors.textMain, lineHeight: 1.45, margin: "30px 0 0", paddingLeft: "18px", borderLeft: `2px solid ${colors.secondary}`, maxWidth: "56ch" }}>
                  If the property only works under optimistic ADR or occupancy assumptions, don&apos;t sign it.
                </p>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginTop: "28px", paddingTop: "22px", borderTop: `1px solid ${colors.border}` }}>
                  <button
                    onClick={() => router.push(ESTIMATOR)}
                    style={{ padding: "11px 22px", background: colors.primary, color: "#fff", borderRadius: "10px", fontSize: "13.5px", fontWeight: 500, cursor: "pointer", border: "none" }}
                  >
                    Check my unit →
                  </button>
                  {([
                    ["Financial methodology", showMethodology, () => setShowMethodology(v => !v)],
                    ["Common mistakes", showMistakes, () => setShowMistakes(v => !v)],
                  ] as [string, boolean, () => void][]).map(([label, open, toggle]) => (
                    <button key={label} onClick={toggle} aria-expanded={open} style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "10px 16px", borderRadius: "999px", cursor: "pointer", fontSize: "13px", fontWeight: 500, background: open ? "rgba(27,94,74,0.06)" : "transparent", border: `1px solid ${open ? "rgba(27,94,74,0.22)" : colors.border}`, color: open ? colors.primary : colors.textMuted }}>
                      {label} <Chevron open={open} />
                    </button>
                  ))}
                </div>

                {showMethodology && (
                  <div style={{ marginTop: "26px", paddingTop: "22px", borderTop: `1px solid ${colors.border}` }}>
                    <SubHead>How each number is built</SubHead>
                    <div style={{ marginTop: "10px" }}><FormulaRows rows={formulas} isMobile={isMobile} /></div>

                    <div style={{ marginTop: "26px", paddingTop: "22px", borderTop: `1px solid ${colors.border}` }}>
                      <SubHead>What comes out of gross revenue</SubHead>
                      <div style={{ marginTop: "10px" }}><FormulaRows rows={costs} isMobile={isMobile} /></div>
                    </div>

                    <div style={{ marginTop: "26px", paddingTop: "22px", borderTop: `1px solid ${colors.border}` }}>
                      <SubHead>Cash buffer requirement</SubHead>
                      <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.6, margin: "8px 0 18px", maxWidth: "64ch" }}>
                        A unit is not safe just because the annual forecast is positive. It must survive low-season months — June–August occupancy in Dubai typically softens, while rent stays fixed.
                      </p>
                      <Columns isMobile={isMobile} cols={4}>
                        {buffers.map(([label, value]) => (
                          <div key={label}>
                            <p style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: colors.textLight, margin: "0 0 6px" }}>{label}</p>
                            <p style={{ fontSize: "13px", color: colors.primary, lineHeight: 1.5, margin: 0 }}>{value}</p>
                          </div>
                        ))}
                      </Columns>
                    </div>
                  </div>
                )}

                {showMistakes && (
                  <div style={{ marginTop: "26px", paddingTop: "22px", borderTop: `1px solid ${colors.border}` }}>
                    <SubHead tone={DANGER}>Common mistakes &amp; red flags</SubHead>
                    <div style={{ marginTop: "10px" }}>
                      {COMMON_MISTAKES.map(({ mistake, fix }, i) => (
                        <div key={mistake} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: "14px", padding: "14px 0", borderTop: i === 0 ? "none" : `1px solid ${colors.border}` }}>
                          <span style={{ fontFamily: MONO, fontSize: "12px", color: colors.textLight, lineHeight: 1.6, fontVariantNumeric: "tabular-nums" }}>{String(i + 1).padStart(2, "0")}</span>
                          <div>
                            <p style={{ fontSize: "13.5px", color: DANGER, margin: "0 0 5px" }}>{mistake}</p>
                            <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6, margin: 0 }}>{fix}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </AccessGate>

          {/* ── Work with AssetIntel ── */}
          <Card>
            <Head
              eyebrow="AssetIntel support"
              title="Don't want to build all of this yourself?"
              sub="AssetIntel can help you go from evaluating your first unit to setting up the operational structure needed to run it properly."
            />
            <Columns isMobile={isMobile} cols={4}>
              {services.map(({ title, body }) => (
                <div key={title}>
                  <SubHead>{title}</SubHead>
                  <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6, margin: "6px 0 0" }}>{body}</p>
                </div>
              ))}
            </Columns>
          </Card>

          {/* ── Closing card ── */}
          <div style={{ position: "relative", overflow: "hidden", borderRadius: "22px", background: `linear-gradient(135deg, ${colors.primary}, #0F3E33)`, padding: isMobile ? "38px 26px" : "56px 58px" }}>
            <svg aria-hidden="true" width="300" height="300" viewBox="0 0 300 300" style={{ position: "absolute", right: "-50px", top: "50%", transform: "translateY(-50%)", opacity: 0.09, pointerEvents: "none" }}>
              <g stroke="#D4A574" strokeWidth="0.9" fill="none">
                {[[45,40],[140,25],[250,65],[85,115],[205,135],[40,200],[160,225],[255,190]].map((p, i, arr) => (
                  <g key={i}>
                    <circle cx={p[0]} cy={p[1]} r="2.4" fill="#D4A574" stroke="none" />
                    {arr.slice(i + 1).map((q, j) => {
                      const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
                      return d < 125 ? <line key={j} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} /> : null;
                    })}
                  </g>
                ))}
              </g>
            </svg>

            <div style={{ position: "relative", zIndex: 1, maxWidth: "600px" }}>
              <p style={{ fontFamily: MONO, fontSize: "10.5px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#EAD2A0", margin: "0 0 12px" }}>Next step</p>
              <h2 className="ai-title-grad-i" style={{ fontFamily: DISPLAY, fontSize: isMobile ? "27px" : "36px", fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.15, color: "#FFFFFF", margin: "0 0 14px" }}>
                Ready to evaluate your first unit?
              </h2>
              <p style={{ fontSize: "14.5px", color: "rgba(255,255,255,0.78)", lineHeight: 1.7, margin: "0 0 30px", maxWidth: "50ch" }}>
                Run the risk estimator first. If the numbers work, AssetIntel can help you structure the setup behind it.
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "26px" }}>
                {/* White on bronze measured 3.11:1 — under AA. This clears at 7.65:1. */}
                <button
                  onClick={() => router.push(ESTIMATOR)}
                  style={{ padding: "13px 26px", background: "#FFFFFF", color: colors.primary, borderRadius: "10px", fontSize: "14px", fontWeight: 500, cursor: "pointer", border: "none" }}
                >
                  Open risk estimator →
                </button>
                <a href="/contact?service=subleasing-setup" style={{ display: "inline-flex", alignItems: "center", padding: "13px 26px", background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.28)", borderRadius: "10px", fontSize: "14px", fontWeight: 500, textDecoration: "none" }}>
                  Build my STR setup
                </a>
              </div>
              <p style={{ paddingTop: "22px", borderTop: "1px solid rgba(255,255,255,0.14)", fontSize: "12px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0 }}>
                Independent, unbiased guidance available through AssetIntel Property Advisory.
              </p>
            </div>
          </div>

          {/* ── Disclaimer ── */}
          <p style={{ fontSize: "12.5px", color: colors.textLight, lineHeight: 1.7, margin: "4px 0 0", maxWidth: "78ch" }}>
            STR sub-leasing involves fixed rent exposure, licensing requirements, landlord approval, and operational risk. AssetIntel provides research, frameworks, and advisory tools, but users should verify all legal and licensing requirements with the relevant authorities and qualified advisors before signing any lease or operating a holiday home.
          </p>
        </div>

        <footer style={{ background: colors.bgSection, borderTop: `1px solid ${colors.border}`, padding: isMobile ? "28px 20px" : "36px 40px" }}>
          <div style={{ maxWidth: "1080px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <AssetIntelLogo size={30} />
              <span style={{ fontSize: "13.5px", color: colors.textMuted }}>AssetIntel — Dubai Property Intelligence</span>
            </div>
            <div style={{ fontSize: "12.5px", color: colors.textLight }}>© {new Date().getFullYear()} AssetIntel. All rights reserved.</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
