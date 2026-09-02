"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AssetIntelLogo from "@/components/AssetIntelLogo";
import SiteNav from "@/components/SiteNav";
import DecorativeBackdrop from "@/components/DecorativeBackdrop";
import AccessGate from "@/components/AccessGate";
import { colors as libColors } from "@/lib/colors";
import { useIsMobile } from "@/lib/useIsMobile";

// Shares the site's design-system palette, with this page's original (slightly
// softer) shadow values preserved so the existing card styling doesn't shift.
const colors = {
  ...libColors,
  shadowSm: "0 1px 2px rgba(0,0,0,0.05)",
  shadowMd: "0 4px 12px rgba(0,0,0,0.09)",
};
const serifHeading = "var(--font-display), ui-sans-serif, system-ui, sans-serif";
const sk = (c: string) => ({ stroke: c, strokeWidth: 1.4, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const });
// Bronze fails AA contrast as small/bold TEXT on light backgrounds — swap to the AA-safe variant.
// Backgrounds, borders, and icon fills are unaffected (those only need 3:1, which bronze clears).
const textSafe = (c: string) => (c === colors.secondary ? colors.secondaryText : c);

// ─── Icons ───────────────────────────────────────────────────────────────────
const IconCheck = ({ color = colors.primary, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8.5" stroke={color} strokeWidth="1.2" opacity="0.35" /><path d="M6.5 10L9 12.5L13.5 7.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const IconWarning = ({ color = "#A37020", size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 3L22 20H2L12 3Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /><path d="M12 10V14" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><circle cx="12" cy="17.5" r="0.8" fill={color} /></svg>
);
const IconLock = ({ color = colors.secondary, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="4" y="10" width="16" height="12" rx="2.5" stroke={color} strokeWidth="1.5" /><path d="M8 10V7a4 4 0 018 0v3" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>
);
const IconTarget = ({ color = colors.primary, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" /><circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.5" /><circle cx="12" cy="12" r="1.5" fill={color} /></svg>
);
const IconDocument = ({ color = colors.secondary, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke={color} strokeWidth="1.5" /><path d="M8 7h8M8 11h8M8 15h5" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>
);
const IconTeam = ({ color = colors.primary, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke={color} strokeWidth="1.5" /><circle cx="17" cy="9" r="2.2" stroke={color} strokeWidth="1.5" /><path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><path d="M15 14c2.2 0 4 1.8 4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>
);
const IconSystem = ({ color = colors.secondary, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="14" rx="2" stroke={color} strokeWidth="1.5" /><path d="M8 18v2M16 18v2M6 20h12" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><path d="M7 10h4M13 10h4M7 13h2M11 13h2M15 13h2" stroke={color} strokeWidth="1.3" strokeLinecap="round" /></svg>
);
const IconShield = ({ color = colors.primary, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const IconEstimator = ({ color = colors.secondary, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="1.5" /><path d="M8 7h8M8 11h3M13 11h3M8 15h3M13 15h3" stroke={color} strokeWidth="1.3" strokeLinecap="round" /></svg>
);
const IconChevron = ({ color = colors.textMuted, open = false }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
    <path d="M4 6L8 10L12 6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Readiness Score ──────────────────────────────────────────────────────────
const SUBLEASING_READINESS_ITEMS = [
  "I have identified a prime or strong STR area to target",
  "I understand and have modelled the break-even occupancy for my target unit",
  "I have a minimum 5-month cash buffer to cover rent and costs",
  "I have confirmed at least one target building permits holiday home operation",
  "I am prepared to approach landlords professionally with a written pitch",
  "I can commit to daily guest communication (sub-1 hour response time)",
  "I have identified a reliable holiday home cleaning team",
  "I understand Dubai's seasonal occupancy (winter peak / summer low)",
  "I have reviewed the legal requirements and can obtain a DET permit",
  "I have an exit plan (break clause or savings to absorb a loss period)",
];

function SubleasingReadinessScore() {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setChecked(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const score = checked.size;
  const label = score >= 8 ? "Ready To Self-Manage" : score >= 5 ? "Partially Ready" : "High Setup Risk";
  const labelColor = score >= 8 ? "#2D7A4F" : score >= 5 ? "#A37020" : "#B83232";
  const labelBg = score >= 8 ? "#E8F5EE" : score >= 5 ? "#FEF3E2" : "#FDE8E8";
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}>
        {SUBLEASING_READINESS_ITEMS.map((item, i) => {
          const active = checked.has(i);
          return (
            <div key={i} onClick={() => toggle(i)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: active ? "#FFFBF5" : colors.bgMain, borderRadius: "9px", border: `1.5px solid ${active ? colors.secondary : colors.border}`, cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ width: "18px", height: "18px", borderRadius: "5px", border: `2px solid ${active ? colors.secondary : colors.border}`, background: active ? colors.secondary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {active && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <span style={{ fontSize: "13px", color: active ? colors.textMain : colors.textMuted, fontWeight: active ? 600 : 400 }}>{item}</span>
            </div>
          );
        })}
      </div>
      <div style={{ padding: "18px 22px", background: labelBg, borderRadius: "12px", border: `2px solid ${labelColor}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <div style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "2px" }}>Your readiness score</div>
          <div style={{ fontSize: "34px", fontWeight: 600, color: labelColor, fontFamily: serifHeading, lineHeight: 1 }}>{score} / 10</div>
        </div>
        <div style={{ fontSize: "17px", fontWeight: 700, color: labelColor }}>{label}</div>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function PillarBadge({ num, color }: { num: string; color: string }) {
  return (
    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, flexShrink: 0, marginTop: "2px" }}>{num}</div>
  );
}

function IconBadge({ icon, color }: { icon: React.ReactNode; color: string }) {
  return (
    <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#F5F0E8", border: `1.5px solid ${color}30`, boxShadow: `0 2px 10px ${color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px", flexShrink: 0 }}>
      {icon}
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return <div style={{ fontSize: "11px", color: colors.secondaryText, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>{text}</div>;
}

function SectionTitle({ children, size = "34px" }: { children: React.ReactNode; size?: string }) {
  return (
    <h2 style={{ fontSize: size, fontFamily: serifHeading, fontWeight: 600, marginBottom: "14px", background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
      {children}
    </h2>
  );
}

// ─── Pillar detail panels (collapsed by default, expanded via accordion) ─────
function PillarOneDetail({ isMobile }: { isMobile: boolean }) {
  return (
    <div>
      <p style={{ fontSize: "14.5px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "28px", maxWidth: "700px" }}>
        The property selection decision carries the most risk in STR sub-leasing. Rent is fixed while STR revenue is seasonal — choosing the wrong unit is how operators lose money before they start.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
        {[
          { title: "Location Criteria", pass: true, items: ["Prime STR area: Dubai Marina, JBR, Downtown, Palm Jumeirah, or Emaar Beachfront", "Walking distance to beach, marina, or major tourist attractions", "Strong Airbnb supply density — usually a sign of proven demand", "Building already listed on Airbnb and Booking.com by other operators — proof of concept"] },
          { title: "Property Criteria", pass: true, items: ["Higher floors can support stronger pricing in some buildings, but the impact varies by building, view, and comparable performance", "Sea, marina, Burj Khalifa, or city view — standard views may generate lower ADR, so the rent must still work under conservative revenue assumptions", "Studio or 1BR — smaller units have lower rent obligations, fill faster, and are easier to operate", "Building permits holiday home operation (confirm in writing before signing)"] },
          { title: "Financial Criteria", pass: true, items: ["Rent-to-revenue gap: projected annual STR revenue should exceed annual rent with a healthy margin", "Break-even occupancy comfortably below market norms — use the Risk Estimator to check before committing", "Setup cost (furnishing) recoverable within a reasonable payback period", "Minimum 3-month cash buffer covering rent, utilities, and cleaning if bookings are slow"] },
          { title: "Signals To Investigate Further", pass: false, items: ["Standard view or low/podium floor in a competitive building", "Rent that leaves little margin versus comparable STR performance in the same building", "Landlord unwilling to give written STR permission", "Building management has restricted or blocked holiday home permits", "Areas where LTR data suggests softer demand — worth deeper diligence"] },
        ].map(({ title, items, pass }) => (
          <div key={title} style={{ padding: "20px", background: colors.bgMain, borderRadius: "14px", border: `1px solid ${pass ? colors.border : "#F5C5C5"}`, borderTop: `3px solid ${pass ? colors.primary : "#C75A5A"}` }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: pass ? colors.primary : "#B03030", marginBottom: "12px" }}>{title}</div>
            {items.map(item => (
              <div key={item} style={{ display: "flex", gap: "8px", marginBottom: "9px", alignItems: "flex-start" }}>
                {pass ? <IconCheck color={colors.primary} size={15} /> : <IconWarning size={15} />}
                <span style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.55 }}>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ background: colors.bgMain, borderRadius: "16px", border: `1px solid ${colors.border}`, padding: isMobile ? "24px 20px" : "30px 34px", margin: "24px 0" }}>
        <div style={{ fontSize: "11px", color: colors.secondaryText, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "10px" }}>AREA & BUILDING RISK SCORING</div>
        <h3 style={{ fontSize: "21px", fontFamily: serifHeading, fontWeight: 600, color: colors.textMain, marginBottom: "6px" }}>Score Any Unit Across 5 Dimensions</h3>
        <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6, marginBottom: "18px" }}>Before signing any lease, score the unit. Aim for 18+ points before proceeding.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
          {[
            { dimension: "STR Demand Score", max: 5, desc: "Prime area (Marina/JBR/Downtown/Palm): 5 pts · Strong area (Business Bay/Creek/DIFC): 3 pts · Other: 1 pt" },
            { dimension: "View & Floor Score", max: 5, desc: "Higher floor with premium view: 5 pts · Mid-floor or city view: 3–4 pts · Lower floor or standard view: 1 pt" },
            { dimension: "Rent Pressure Score", max: 5, desc: "Break-even occupancy below 50%: 5 pts · 50–65%: 3 pts · 65–80%: 1 pt · Above 80%: 0 pts — reconsider" },
            { dimension: "Operational Ease Score", max: 3, desc: "Smart lock permitted + cooperative building reception: 3 pts · Key safe only: 2 pts · Difficult access: 0 pts" },
            { dimension: "Exit Flexibility Score", max: 2, desc: "1-month break clause: 2 pts · 3-month notice: 1 pt · No break clause: 0 pts" },
          ].map(({ dimension, max, desc }) => (
            <div key={dimension} style={{ padding: "12px 16px", background: colors.bgSection, borderRadius: "9px", border: `1px solid ${colors.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <div style={{ fontSize: "12.5px", fontWeight: 700, color: colors.textMain }}>{dimension}</div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: colors.secondaryText, background: "#FEF3E2", padding: "2px 9px", borderRadius: "12px" }}>max {max} pts</span>
              </div>
              <div style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
          {[
            { range: "18–20 pts", label: "Proceed", color: "#2D7A4F", bg: "#E8F5EE" },
            { range: "13–17 pts", label: "Negotiate", color: "#A37020", bg: "#FEF3E2" },
            { range: "Below 13", label: "Avoid", color: "#B83232", bg: "#FDE8E8" },
          ].map(({ range, label, color, bg }) => (
            <div key={range} style={{ padding: "12px", background: bg, borderRadius: "9px", textAlign: "center" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color, fontFamily: serifHeading }}>{label}</div>
              <div style={{ fontSize: "11px", color, marginTop: "3px", opacity: 0.8 }}>{range}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PillarTwoDetail({ isMobile }: { isMobile: boolean }) {
  return (
    <div>
      <p style={{ fontSize: "14.5px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "24px", maxWidth: "700px" }}>
        Before operating, secure landlord permission in writing, complete DET registration, and have all documentation in order. Operating without either is illegal in Dubai.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        {[
          { title: "Landlord Approval", color: colors.primary, items: ["Written permission for STR / holiday home operation", "Contract clause or addendum specifying holiday home use", "Permission to apply for DET holiday home permit", "Clarity on guest access and building rules", "If a landlord declines in writing, that unit is off the table"] },
          { title: "DET Portal Setup", color: colors.secondary, items: ["Create or access DET holiday home portal account", "Prepare and upload all required documents", "Submit unit details and property photos", "Track approval status — budget 3–7 working days", "Display permit in the property at all times after approval"] },
          { title: "Required Documents", color: colors.primary, items: ["Tenancy contract (signed, registered)", "Landlord NOC or written approval letter", "Passport or Emirates ID of operator", "DEWA bill for the property", "Property photos to DET standard", "Company documents if operating as a business"] },
          { title: "Ongoing Compliance", color: colors.secondary, items: ["Permit must be active before listing on any platform", "Collect guest ID (passport or Emirates ID) on every check-in", "Maintain a guest register — retained for 5 years", "Annual permit renewal — set reminder 45 days before expiry", "Tourism Dirham process where applicable"] },
        ].map(({ title, color, items }) => (
          <div key={title} style={{ padding: "20px 22px", background: colors.bgMain, borderRadius: "14px", border: `1px solid ${colors.border}`, borderTop: `3px solid ${color}` }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: textSafe(color), marginBottom: "12px" }}>{title}</div>
            {items.map(item => (
              <div key={item} style={{ display: "flex", gap: "8px", marginBottom: "9px", alignItems: "flex-start" }}>
                <div style={{ marginTop: "2px", flexShrink: 0 }}><IconCheck color={color} size={15} /></div>
                <span style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.55 }}>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ background: colors.bgMain, borderRadius: "16px", border: `1px solid ${colors.border}`, padding: isMobile ? "24px 20px" : "30px 34px", marginBottom: "18px" }}>
        <div style={{ fontSize: "11px", color: colors.secondaryText, fontWeight: 700, letterSpacing: "0.12em", marginBottom: "14px" }}>LANDLORD NEGOTIATION FRAMEWORK</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { step: "1", title: "Position yourself as a professional operator", body: "Say: 'I operate a registered holiday home management business and am looking for a property to manage as a licensed DET holiday home. I will maintain the property to a premium standard, provide monthly reports, and ensure full DET compliance.'" },
            { step: "2", title: "What to ask for in the contract", body: "Written STR permission clause, a 1-month break clause (or 3-month minimum), clarity on major vs minor maintenance, permission to install a smart lock, and agreement on how damage is handled beyond the security deposit." },
            { step: "3", title: "What to offer the landlord", body: "A premium above market rent (5–15% is typical for STR permission), guaranteed rent via post-dated cheques, a 2-month security deposit, monthly property condition reports, and a 1-year minimum term with renewal option." },
            { step: "4", title: "Handle objections before they arise", body: "'What about building rules?' → Confirm building eligibility before approaching the landlord. 'Is this legal?' → Show them the DET permit process." },
            { step: "5", title: "Contract wording to include", body: "'The tenant is permitted to operate the property as a holiday home registered with the Dubai Department of Economy and Tourism (DET). The tenant will maintain a valid DET permit at all times and comply with all applicable regulations.'" },
          ].map(({ step, title, body }) => (
            <div key={step} style={{ display: "flex", gap: "14px", padding: "16px", background: colors.bgSection, borderRadius: "11px", border: `1px solid ${colors.border}` }}>
              <PillarBadge num={step} color={colors.secondary} />
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: colors.textMain, marginBottom: "5px" }}>{title}</div>
                <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6, margin: 0 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 18px", background: "#FEF3E2", borderRadius: "10px", border: "1px solid #E8D9BC", borderLeft: `3px solid ${colors.secondary}` }}>
        <p style={{ fontSize: "12.5px", color: "#7A5010", margin: 0, lineHeight: 1.6 }}>
          This section is educational and not legal advice. Verify all licensing and approval requirements with the DET, building management, and a qualified advisor before signing any lease or operating a holiday home.
        </p>
      </div>
    </div>
  );
}

function PillarThreeDetail({ isMobile }: { isMobile: boolean }) {
  return (
    <div>
      <p style={{ fontSize: "14.5px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "24px", maxWidth: "700px" }}>
        STR sub-leasing is an active business, not passive income. These are the teams and workflows to have in place before the first guest checks in.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "16px" }}>
        {[
          { title: "Maintenance Team", color: colors.primary, items: ["Handyman on call (24hr response)", "AC service contact for summer", "Appliance repair — fridge, washer, dryer", "Emergency response protocol", "Damage reporting and documentation process"] },
          { title: "Housekeeping Team", color: colors.secondary, items: ["Same-day turnover cleaning capability", "Linen handling and laundry coordination", "3 sets of linen per bed minimum", "Inventory checks post-turnover", "Inspection photos after every clean"] },
          { title: "Guest Relations", color: colors.primary, items: ["Sub-1 hour message response at all times", "Check-in support on arrival day", "Complaint handling and empathy protocol", "Review management and response process", "Escalation chain when issues arise"] },
          { title: "Virtual Assistants", color: colors.secondary, items: ["Message templates for common scenarios", "Booking inquiries and pre-arrival communication", "Calendar and availability coordination", "Task follow-up and team coordination", "Guest support coverage across time zones"] },
          { title: "Access & Check-In", color: colors.primary, items: ["Smart lock (primary entry method)", "Backup physical key protocol", "Building access card coordination", "Parking instructions and security", "Late arrival and early departure handling"] },
          { title: "Quality Control", color: colors.secondary, items: ["Post-checkout inspection checklist", "Damage reporting before next check-in", "Maintenance log with response tracking", "Monthly replacement reserve (10–15% of revenue)", "Quarterly deep-clean schedule"] },
        ].map(({ title, color, items }) => (
          <div key={title} style={{ padding: "20px", background: colors.bgMain, borderRadius: "14px", border: `1px solid ${colors.border}`, borderTop: `3px solid ${color}` }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: textSafe(color), marginBottom: "12px", paddingBottom: "9px", borderBottom: `1px solid ${colors.border}` }}>{title}</div>
            {items.map(item => (
              <div key={item} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start" }}>
                <div style={{ marginTop: "2px", flexShrink: 0 }}><IconCheck color={color} size={14} /></div>
                <span style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.55 }}>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PillarFourDetail({ isMobile }: { isMobile: boolean }) {
  return (
    <div>
      <p style={{ fontSize: "14.5px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "24px", maxWidth: "700px" }}>
        Sub-leasing cannot be managed from WhatsApp and spreadsheets once bookings start. A proper system stack controls calendars, pricing, messages, tasks, and reporting.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "16px" }}>
        {[
          { title: "PMS / Channel Manager", examples: "Hostaway, Guesty, Hostfully", color: colors.secondary, purpose: "Sync calendars, manage bookings, avoid double bookings, centralise messages, and manage tasks across all platforms from one dashboard." },
          { title: "Dynamic Pricing", examples: "PriceLabs, Beyond, Wheelhouse", color: colors.primary, purpose: "Adjust nightly rates automatically by seasonality, demand signals, local events, and occupancy trends." },
          { title: "Guest Messaging", examples: "Hospitable, Host Tools, PMS automations", color: colors.secondary, purpose: "Automate confirmations, check-in instructions, checkout reminders, and review requests." },
          { title: "Task Management", examples: "Trello, ClickUp, Notion, PMS task tools", color: colors.primary, purpose: "Coordinate cleaners, maintenance vendors, inspections, and issue follow-ups." },
          { title: "Smart Access", examples: "Yale, Nuki, TTLock", color: colors.secondary, purpose: "Secure self-check-in without key handover risk. Guests receive a unique code per booking." },
          { title: "Finance Tracking", examples: "Google Sheets, Xero, Zoho Books", color: colors.primary, purpose: "Track gross revenue, rent, utilities, cleaning, platform fees, maintenance, and monthly net profit." },
        ].map(({ title, examples, color, purpose }) => (
          <div key={title} style={{ background: colors.bgSection, borderRadius: "14px", border: `1px solid ${colors.border}`, padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: `${color}12`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              <IconSystem color={color} size={18} />
            </div>
            <h3 style={{ fontSize: "16px", fontFamily: serifHeading, fontWeight: 600, color: colors.textMain, marginBottom: "5px" }}>{title}</h3>
            <div style={{ fontSize: "11px", color: textSafe(color), fontWeight: 600, background: `${color}0E`, borderRadius: "6px", padding: "3px 9px", display: "inline-block", marginBottom: "10px" }}>{examples}</div>
            <p style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.6, margin: 0 }}>{purpose}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const PILLARS = [
  { num: "01", icon: IconTarget, accentColor: colors.primary, label: "PROPERTY SELECTION", title: "Property Selection", body: "Find a unit that can survive seasonality and still produce acceptable returns.", points: ["Rent pressure", "Break-even occupancy", "Building suitability", "Unit economics"], cta: "Explore Property Selection", Detail: PillarOneDetail },
  { num: "02", icon: IconDocument, accentColor: colors.secondary, label: "LICENSING & COMPLIANCE", title: "Licensing & Compliance", body: "Understand the approvals, agreements and setup required before operating.", points: ["Landlord approval", "DET setup", "Required documentation", "Building rules"], cta: "Explore Licensing", Detail: PillarTwoDetail },
  { num: "03", icon: IconTeam, accentColor: colors.primary, label: "OPERATIONS SETUP", title: "Operations Setup", body: "Build the team and processes required to handle guests and property operations.", points: ["Housekeeping", "Maintenance", "Guest support", "Check-in & inspections"], cta: "Explore Operations", Detail: PillarThreeDetail },
  { num: "04", icon: IconSystem, accentColor: colors.secondary, label: "SYSTEMS & PRICING", title: "Systems & Pricing", body: "Use the right tools to manage listings, calendars, guest communication and pricing.", points: ["PMS", "Channel management", "Dynamic pricing", "Reporting"], cta: "Explore Systems", Detail: PillarFourDetail },
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function STRSubleasingPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [openPillar, setOpenPillar] = useState<number | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);
  const [showMistakes, setShowMistakes] = useState(false);

  const pad = isMobile ? "56px 20px" : "76px 40px";

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh", position: "relative" }}>
      <DecorativeBackdrop />
      <div style={{ position: "relative", zIndex: 1 }}>

      {/* ─── HEADER ─── */}
      <SiteNav active="self-manage" />

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 1. HERO + RISK ESTIMATOR                                               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", overflow: "hidden", isolation: "isolate", borderBottom: `1px solid ${colors.border}`, padding: isMobile ? "40px 20px 52px" : "72px 40px 80px" }}>

        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(to right, transparent 0%, rgba(184,138,68,0.18) 30%, rgba(184,138,68,0.22) 50%, rgba(184,138,68,0.18) 70%, transparent 100%)", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "36px" : "56px", alignItems: "center" }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ flex: "0 0 58%", maxWidth: isMobile ? "100%" : "58%" }}>

            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px 6px 8px", background: "#FDFBF4", border: "1px solid rgba(184,138,68,0.28)", borderRadius: "999px", boxShadow: "0 2px 8px rgba(184,138,68,0.09)", marginBottom: "20px" }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(184,138,68,0.11)", border: "1px solid rgba(184,138,68,0.24)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke={colors.secondary} strokeWidth="1.3"/><circle cx="8" cy="8" r="2.5" stroke={colors.secondary} strokeWidth="1.2"/><circle cx="8" cy="8" r="0.8" fill={colors.secondary}/></svg>
              </div>
              <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: colors.secondaryText }}>STR Sub-Leasing Risk Estimator</span>
            </div>

            <h1 style={{ fontSize: isMobile ? "clamp(28px,9vw,40px)" : "clamp(34px,3.4vw,50px)", fontFamily: serifHeading, fontWeight: 600, lineHeight: isMobile ? 1.08 : 1.05, letterSpacing: isMobile ? "-0.02em" : "-0.03em", marginBottom: "16px", background: `linear-gradient(130deg, ${colors.primary} 0%, #2A7A58 42%, ${colors.secondary} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", maxWidth: "780px" }}>
              Check The Unit Before You Sign The Lease
            </h1>

            <p style={{ fontSize: isMobile ? "14.5px" : "15.5px", color: "#4A4A42", lineHeight: 1.68, marginBottom: "24px", maxWidth: "560px" }}>
              AssetIntel helps you estimate whether a sub-leased unit can survive low season, cover fixed rent, and produce realistic profit — before you commit to the landlord.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "26px" }}>
              {[
                "Break-even clarity",
                "Monthly cash-flow forecast",
                "Risk level",
                "Minimum cash buffer guidance",
                "Proceed / Negotiate / Avoid",
              ].map(label => (
                <div key={label} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "8px 14px", background: "rgba(27,94,74,0.04)", borderRadius: "9px", border: "1px solid rgba(27,94,74,0.09)" }}>
                  <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(27,94,74,0.22)" }}>
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: colors.textMain }}>{label}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
              <button
                onClick={() => router.push("/self-manage/str-subleasing/estimator")}
                style={{ padding: "13px 26px", background: `linear-gradient(135deg, ${colors.secondary} 0%, #A07838 50%, #8B6530 100%)`, color: "#fff", borderRadius: "12px", fontSize: "14.5px", fontWeight: 700, cursor: "pointer", border: "none", boxShadow: "0 6px 20px rgba(184,138,68,0.30), 0 2px 6px rgba(184,138,68,0.16)", letterSpacing: "0.01em" }}
              >
                Open Risk Estimator →
              </button>
              <a
                href="#financial-snapshot"
                style={{ display: "inline-flex", alignItems: "center", padding: "13px 22px", background: "#FDFBF5", color: colors.primary, border: `1.5px solid ${colors.primary}`, borderRadius: "12px", fontSize: "14.5px", fontWeight: 600, textDecoration: "none", letterSpacing: "0.01em" }}
              >
                Learn How The Model Works
              </a>
            </div>
          </div>

          {/* ── RIGHT COLUMN — Sample card ── */}
          <div style={{ flex: 1, width: "100%", maxWidth: isMobile ? "100%" : "370px", flexShrink: 0, position: "relative" }}>
            <div style={{ position: "absolute", inset: "-30px", borderRadius: "50%", background: "radial-gradient(ellipse at 60% 50%, rgba(184,138,68,0.11) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "relative", zIndex: 1, background: "#FEFCF8", borderRadius: "24px", border: "1.5px solid rgba(184,138,68,0.28)", boxShadow: "0 20px 56px rgba(20,40,30,0.12), 0 6px 20px rgba(184,138,68,0.10), inset 0 1px 0 rgba(255,255,255,0.92)", overflow: "hidden" }}>

              <div style={{ padding: "16px 20px 14px", background: "linear-gradient(135deg, rgba(27,94,74,0.06) 0%, rgba(184,138,68,0.07) 100%)", borderBottom: "1px solid rgba(184,138,68,0.15)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: "rgba(184,138,68,0.12)", border: "1px solid rgba(184,138,68,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <IconEstimator color={colors.secondary} size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize: "9.5px", fontWeight: 700, color: colors.secondaryText, letterSpacing: "0.14em", textTransform: "uppercase" }}>Risk Estimator — Sample</div>
                    <div style={{ fontSize: "10.5px", color: colors.textMuted, marginTop: "1px" }}>Marina Gate 2 · 1BR · Floor 24</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid rgba(230,225,216,0.65)" }}>
                <div style={{ fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9A8A", marginBottom: "10px" }}>Inputs</div>
                {[
                  { label: "Building", value: "Marina Gate 2" },
                  { label: "Unit size", value: "1 Bedroom" },
                  { label: "Floor", value: "Floor 24 (High)" },
                  { label: "View", value: "Marina View" },
                  { label: "Asking rent", value: "AED 9,500 / month" },
                ].map(({ label, value }, i, arr) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(230,225,216,0.55)" : "none" }}>
                    <span style={{ fontSize: "11.5px", color: colors.textMuted }}>{label}</span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: colors.textMain }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding: "14px 18px 18px" }}>
                <div style={{ fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9A8A", marginBottom: "10px" }}>Estimator Outputs</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#EEF6F1", borderRadius: "9px", border: "1px solid rgba(27,94,74,0.12)" }}>
                    <span style={{ fontSize: "11.5px", color: colors.textMuted }}>Break-even occupancy</span>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: colors.primary }}>58%</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#EEF6F1", borderRadius: "9px", border: "1px solid rgba(27,94,74,0.12)" }}>
                    <span style={{ fontSize: "11.5px", color: colors.textMuted }}>Risk level</span>
                    <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#2D7A4F", background: "#D0EED9", padding: "3px 12px", borderRadius: "20px" }}>Low</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#FEF5E8", borderRadius: "9px", border: "1px solid rgba(184,138,68,0.18)" }}>
                    <span style={{ fontSize: "11.5px", color: colors.textMuted }}>Est. net profit / yr</span>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: colors.secondaryText }}>AED 42,800</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#F7F9F8", borderRadius: "9px", border: `1px solid ${colors.border}` }}>
                    <span style={{ fontSize: "11.5px", color: colors.textMuted }}>Cash buffer required</span>
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: colors.textMain }}>AED 57,000</span>
                  </div>
                  <div style={{ padding: "10px 14px", background: "linear-gradient(135deg, rgba(27,94,74,0.08) 0%, rgba(184,138,68,0.07) 100%)", borderRadius: "9px", border: "1px solid rgba(27,94,74,0.14)", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 7px rgba(27,94,74,0.26)" }}>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l5.5 2.3v4.6c0 3.4-2.4 6.2-5.5 7.5C5.0 14.6 2.5 11.8 2.5 8.4V3.8L8 1.5z" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5.5 8l2 2 3-3.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: "9.5px", fontWeight: 700, color: colors.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>Recommendation</div>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: colors.primary }}>Proceed</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/self-manage/str-subleasing/estimator")}
                  style={{ width: "100%", marginTop: "12px", padding: "12px", background: `linear-gradient(135deg, ${colors.secondary} 0%, #A07838 50%, #8B6530 100%)`, color: "#fff", borderRadius: "11px", fontSize: "13.5px", fontWeight: 700, cursor: "pointer", border: "none", boxShadow: "0 5px 16px rgba(184,138,68,0.28)", letterSpacing: "0.01em" }}
                >
                  Run Your Own Estimate →
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 2. THE 4 PILLARS                                                       */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <AccessGate source="str-subleasing" title="Unlock The Sub-Leasing Playbook" subtitle="Free — sign up or log in to see the full framework, financial methodology, and risk breakdown.">
      <section id="pillars" style={{ padding: pad }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <SectionLabel text="FRAMEWORK" />
            <SectionTitle>The 4 Pillars Of A Safe STR Sub-Leasing Setup</SectionTitle>
            <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.7, maxWidth: "560px", margin: "0 auto" }}>
              Before taking a unit, make sure the property, licensing, operations and systems can all support the business.
            </p>
          </div>

          <style>{`
            .pillar-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; align-items: stretch; }
            .pillar-card { background: #FDFBF8; border: 1px solid #E8E0D0; border-radius: 18px; padding: 26px 22px; display: flex; flex-direction: column; text-align: left; box-shadow: 0 2px 10px rgba(0,0,0,0.04); transition: border-color 0.2s ease; cursor: pointer; }
            .pillar-card:hover { border-color: #C9A86C; }
            .pillar-card.active { border-color: #B88A44; box-shadow: 0 4px 16px rgba(184,138,68,0.14); }
            @media (max-width: 1000px) { .pillar-grid { grid-template-columns: repeat(2, 1fr); } }
            @media (max-width: 560px) { .pillar-grid { grid-template-columns: 1fr; } .pillar-card { padding: 22px 20px; } }
          `}</style>

          <div className="pillar-grid">
            {PILLARS.map(({ num, icon: Icon, accentColor, label, title, body, points, cta }, i) => (
              <div key={num} className={`pillar-card${openPillar === i ? " active" : ""}`} onClick={() => setOpenPillar(openPillar === i ? null : i)}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: textSafe(accentColor), letterSpacing: "0.12em" }}>{num}</div>
                  <IconChevron color={accentColor} open={openPillar === i} />
                </div>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#F5F0E8", border: `1.5px solid ${accentColor}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                  <Icon color={accentColor} size={20} />
                </div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: colors.textMuted, letterSpacing: "0.1em", marginBottom: "6px" }}>{label}</div>
                <h3 style={{ fontFamily: serifHeading, fontSize: "18px", fontWeight: 600, color: colors.textMain, marginBottom: "8px", lineHeight: 1.3 }}>{title}</h3>
                <p style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.6, marginBottom: "12px" }}>{body}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                  {points.map(p => (
                    <span key={p} style={{ fontSize: "10.5px", fontWeight: 600, color: textSafe(accentColor), background: `${accentColor}0E`, padding: "3px 9px", borderRadius: "20px" }}>{p}</span>
                  ))}
                </div>
                <div style={{ marginTop: "auto", fontSize: "12.5px", fontWeight: 700, color: textSafe(accentColor) }}>
                  {openPillar === i ? "Hide details" : cta} →
                </div>
              </div>
            ))}
          </div>

          {openPillar !== null && (
            <div style={{ marginTop: "24px", background: colors.bgSection, borderRadius: "20px", border: `1px solid ${colors.border}`, padding: isMobile ? "28px 20px" : "40px 44px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px", background: `${PILLARS[openPillar].accentColor}10`, borderRadius: "20px", border: `1px solid ${PILLARS[openPillar].accentColor}25`, marginBottom: "18px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: textSafe(PILLARS[openPillar].accentColor), letterSpacing: "0.1em" }}>PILLAR {PILLARS[openPillar].num}</span>
              </div>
              <h3 style={{ fontSize: isMobile ? "25px" : "30px", fontFamily: serifHeading, fontWeight: 600, color: colors.textMain, marginBottom: "6px" }}>{PILLARS[openPillar].title}</h3>
              {React.createElement(PILLARS[openPillar].Detail, { isMobile })}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 3. FINANCIAL SNAPSHOT                                                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="financial-snapshot" style={{ padding: pad, background: colors.bgSection, borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <SectionLabel text="THE NUMBERS THAT MATTER" />
            <SectionTitle>Before You Sign, Check These 4 Numbers</SectionTitle>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
            {[
              { title: "Projected STR Revenue", body: "Your realistic annual and monthly revenue based on current STR assumptions." },
              { title: "Annual Landlord Rent", body: "Your largest fixed cost and the number the business must survive every month." },
              { title: "Break-Even Occupancy", body: "The occupancy level required before the unit begins generating positive cash flow." },
              { title: "Cash Buffer", body: "How much reserve capital may be needed to survive low season and unexpected costs." },
            ].map(({ title, body }) => (
              <div key={title} style={{ padding: "20px 18px", background: colors.bgMain, borderRadius: "14px", border: `1px solid ${colors.border}` }}>
                <h3 style={{ fontSize: "16px", fontFamily: serifHeading, fontWeight: 600, color: colors.textMain, marginBottom: "8px" }}>{title}</h3>
                <p style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.6, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", padding: "20px 24px", background: "#F0F8F4", borderRadius: "14px", border: "1px solid rgba(27,94,74,0.15)", marginBottom: "28px" }}>
            <p style={{ fontSize: "14.5px", color: colors.primary, fontWeight: 600, fontStyle: "italic", margin: 0, lineHeight: 1.6 }}>
              "The rule: if the property only works under optimistic ADR or occupancy assumptions, don't sign it."
            </p>
          </div>

          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <button
              onClick={() => router.push("/self-manage/str-subleasing/estimator")}
              style={{ padding: "14px 34px", background: `linear-gradient(135deg, ${colors.secondary} 0%, #8B6F3F 100%)`, color: "#fff", borderRadius: "11px", fontSize: "15px", fontWeight: 700, cursor: "pointer", border: "none", boxShadow: "0 6px 20px rgba(184,138,68,0.28)" }}
            >
              Check My Unit →
            </button>
          </div>

          <div style={{ textAlign: "center" }}>
            <button onClick={() => setShowMethodology(v => !v)} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: colors.textMuted, padding: "8px 0" }}>
              {showMethodology ? "Hide Financial Methodology" : "View Financial Methodology"} <IconChevron open={showMethodology} />
            </button>
          </div>

          {showMethodology && (
            <div style={{ marginTop: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                {[
                  { label: "Monthly Revenue", formula: "ADR × Occupied Nights", note: "Use the Risk Estimator for a realistic ADR projection. Avoid optimistic numbers." },
                  { label: "Break-Even Occupancy", formula: "Monthly Fixed Costs ÷ ADR ÷ Days in Month", note: "Break-even meaningfully above market norms should prompt a closer look." },
                  { label: "Monthly Profit", formula: "Gross Revenue − Rent − Platform Fees − Utilities − Cleaning − Maintenance Reserve − Furniture Amortisation", note: "Should be positive across the full year, including summer low-season months." },
                  { label: "Minimum Cash Buffer", formula: "3 to 6 months of rent and operating costs", note: "Model a conservative low-occupancy month before committing." },
                ].map(({ label, formula, note }) => (
                  <div key={label} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "190px 1fr 1fr", gap: "14px", padding: "16px 20px", background: colors.bgMain, borderRadius: "11px", border: `1px solid ${colors.border}`, alignItems: "start" }}>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: colors.textMain }}>{label}</div>
                    <div style={{ fontSize: "12.5px", color: colors.secondaryText, fontFamily: "monospace", background: "#FEF3E2", padding: "5px 11px", borderRadius: "7px", lineHeight: 1.5 }}>{formula}</div>
                    <div style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.6 }}>{note}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
                {[
                  { label: "Platform Fees", formula: "~18% of gross (Airbnb + Booking.com blended)", note: "Deducted automatically by platforms before payout." },
                  { label: "Landlord Rent", formula: "Monthly rent × 12 — fixed, paid regardless of occupancy", note: "Your biggest cost. Does not flex with your revenue." },
                  { label: "Utilities (DEWA, AC, Internet)", formula: "AED 600–1,200/month in summer, AED 400–700 in winter", note: "You pay these — the landlord does not." },
                  { label: "Cleaning Costs", formula: "AED 150–350 per turn × estimated turns per month", note: "A 1BR at strong occupancy can average 8–12 turns per month." },
                  { label: "Furniture Amortisation", formula: "Setup cost (AED 30–55k for 1BR) ÷ 5 years ÷ 12", note: "Spread over 5 years. You own the furniture — recovery possible on exit." },
                ].map(({ label, formula, note }) => (
                  <div key={label} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "190px 1fr 1fr", gap: "12px", padding: "13px 18px", background: colors.bgMain, borderRadius: "10px", border: `1px solid ${colors.border}`, alignItems: "start" }}>
                    <div style={{ fontSize: "12.5px", fontWeight: 700, color: colors.textMuted }}>{label}</div>
                    <div style={{ fontSize: "12px", color: colors.secondaryText, fontFamily: "monospace", background: "#FEF3E2", padding: "4px 10px", borderRadius: "6px" }}>{formula}</div>
                    <div style={{ fontSize: "11.5px", color: colors.textMuted, lineHeight: 1.5 }}>{note}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: "24px 28px", background: "#F0F8F4", borderRadius: "14px", border: "1px solid rgba(27,94,74,0.15)" }}>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: colors.primary, marginBottom: "10px" }}>Cash Buffer Requirement</div>
                <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "14px" }}>
                  A unit is not safe just because the annual forecast is positive. It must survive low-season months — June–August occupancy in Dubai typically softens, while rent stays fixed.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "10px" }}>
                  {[
                    { label: "Minimum buffer", value: "3 months rent + utilities" },
                    { label: "Recommended buffer", value: "5 months (covers full low season)" },
                    { label: "Setup cost (1BR)", value: "AED 30,000–55,000 fully furnished" },
                    { label: "Break-even target", value: "As low as achievable at market ADR" },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: "13px", background: colors.bgSection, borderRadius: "9px", border: `1px solid ${colors.border}` }}>
                      <div style={{ fontSize: "11px", color: colors.textMuted, marginBottom: "4px" }}>{label}</div>
                      <div style={{ fontSize: "12.5px", fontWeight: 700, color: colors.primary }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <button onClick={() => setShowMistakes(v => !v)} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: colors.textMuted, padding: "8px 0" }}>
              {showMistakes ? "Hide Common Mistakes & Red Flags" : "View Common Mistakes & Red Flags"} <IconChevron open={showMistakes} />
            </button>
          </div>

          {showMistakes && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
              {COMMON_MISTAKES.map(({ mistake, fix }, i) => (
                <div key={i} style={{ padding: "14px 18px", background: colors.bgMain, borderRadius: "11px", border: `1px solid ${colors.border}`, borderLeft: "3px solid #C75A5A" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#B03030", marginBottom: "7px" }}>{mistake}</div>
                  <div style={{ fontSize: "12.5px", color: colors.primary, lineHeight: 1.55, padding: "7px 11px", background: "#F0F8F4", borderRadius: "8px" }}><strong>Fix:</strong> {fix}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      </AccessGate>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 4. HOW ASSETINTEL CAN HELP                                             */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: pad, borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <SectionLabel text="ASSETINTEL SUPPORT" />
            <SectionTitle>Don't Want To Build All Of This Yourself?</SectionTitle>
            <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.7, maxWidth: "580px", margin: "0 auto" }}>
              AssetIntel can help you go from evaluating your first unit to setting up the operational structure needed to run it properly.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "stretch", gap: isMobile ? "10px" : "0", marginBottom: "32px" }}>
            {[
              { title: "Unit Screening", body: "Review rent, building, STR potential and risk before signing." },
              { title: "Licensing Guidance", body: "Understand landlord approval, DET setup and required documents." },
              { title: "Operations Setup", body: "Connect with experienced STR housekeeping, maintenance and guest-support teams." },
              { title: "Systems Setup", body: "Guidance on PMS, channels, pricing tools and operational workflows." },
            ].map(({ title, body }, i, arr) => (
              <React.Fragment key={title}>
                <div style={{ flex: 1, padding: "20px 18px", background: colors.bgSection, borderRadius: "14px", border: `1px solid ${colors.border}`, textAlign: "center" }}>
                  <h3 style={{ fontSize: "16px", fontFamily: serifHeading, fontWeight: 600, color: colors.textMain, marginBottom: "6px" }}>{title}</h3>
                  <p style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.55, margin: 0 }}>{body}</p>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "0" : "0 10px", transform: isMobile ? "rotate(90deg)" : "none" }}>
                    <IconArrowRight color={colors.secondary} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <a href="/contact?service=subleasing-setup" style={{ display: "inline-block", padding: "14px 34px", background: `linear-gradient(145deg, ${colors.primary} 0%, #0F3E33 100%)`, color: "#fff", borderRadius: "11px", fontSize: "15px", fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 24px rgba(27,94,74,0.24)" }}>
              Build My STR Setup →
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 5. READINESS CHECK                                                     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: pad, background: colors.bgSection, borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <SectionLabel text="READINESS CHECK" />
            <SectionTitle size="28px">Are You Ready To Run This Yourself?</SectionTitle>
            <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.7, maxWidth: "540px", margin: "0 auto" }}>
              Tick every item that applies to you today.
            </p>
          </div>
          <SubleasingReadinessScore />
          <div style={{ textAlign: "center", marginTop: "22px" }}>
            <a href="/contact?service=subleasing-setup" style={{ display: "inline-block", padding: "13px 28px", background: "transparent", color: colors.primary, border: `1.5px solid ${colors.primary}`, borderRadius: "11px", fontSize: "14px", fontWeight: 700, textDecoration: "none" }}>
              Get Setup Support →
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* PLAYBOOK — secondary resource                                          */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? "40px 20px" : "56px 40px", borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div style={{ background: colors.bgSection, borderRadius: "16px", border: `1px solid ${colors.border}`, padding: isMobile ? "24px 22px" : "28px 32px", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: "18px" }}>
            <div>
              <div style={{ fontSize: "10.5px", color: colors.textMuted, fontWeight: 700, letterSpacing: "0.1em", marginBottom: "8px" }}>STR SUB-LEASING PLAYBOOK</div>
              <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6, margin: 0, maxWidth: "440px" }}>
                Practical guidance covering selection, licensing, operations, systems, and financial planning.
              </p>
              <div style={{ fontSize: "12.5px", fontWeight: 600, color: colors.primary, marginTop: "8px" }}>Free — sign up or log in to view.</div>
            </div>
            <a href="#pillars" style={{ padding: "11px 22px", background: colors.secondary, color: "#fff", borderRadius: "10px", fontSize: "13.5px", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>View Playbook →</a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 6. FINAL CTA                                                           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: pad, borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ background: `linear-gradient(145deg, #1B5E4A 0%, #0F3E33 100%)`, borderRadius: "22px", padding: isMobile ? "40px 26px" : "56px 60px", textAlign: "center", boxShadow: "0 12px 40px rgba(27,94,74,0.24)" }}>
            <h2 style={{ fontSize: isMobile ? "27px" : "36px", fontFamily: serifHeading, fontWeight: 600, color: "#fff", marginBottom: "12px" }}>Ready To Evaluate Your First Unit?</h2>
            <p style={{ fontSize: "14.5px", color: "rgba(255,255,255,0.78)", lineHeight: 1.7, marginBottom: "28px", maxWidth: "540px", margin: "0 auto 28px" }}>
              Run the risk estimator first. If the numbers work, AssetIntel can help you structure the setup behind it.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "18px" }}>
              <button
                onClick={() => router.push("/self-manage/str-subleasing/estimator")}
                style={{ padding: "14px 30px", background: colors.secondary, color: "#fff", borderRadius: "11px", fontSize: "14.5px", fontWeight: 700, cursor: "pointer", border: "none", boxShadow: "0 6px 20px rgba(184,138,68,0.30)" }}
              >
                Open Risk Estimator →
              </button>
              <a href="/contact?service=subleasing-setup" style={{ padding: "14px 30px", background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: "11px", fontSize: "14.5px", fontWeight: 700, textDecoration: "none" }}>
                Build My STR Setup
              </a>
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>
              Independent, unbiased guidance available through AssetIntel Property Advisory.
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* LEGAL DISCLAIMER                                                       */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? "32px 20px" : "40px 40px", borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", padding: "20px 24px", background: colors.bgSection, borderRadius: "14px", border: `1px solid ${colors.border}` }}>
            <div style={{ marginTop: "2px", flexShrink: 0 }}><IconShield color={colors.textMuted} size={20} /></div>
            <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.7, margin: 0 }}>
              STR sub-leasing involves fixed rent exposure, licensing requirements, landlord approval, and operational risk. AssetIntel provides research, frameworks, and advisory tools, but users should verify all legal and licensing requirements with the relevant authorities and qualified advisors before signing any lease or operating a holiday home.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: colors.bgSection, borderTop: `1px solid ${colors.border}`, padding: "40px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <AssetIntelLogo size={32} />
            <span style={{ fontSize: "14px", color: colors.textMuted }}>AssetIntel — Dubai Property Intelligence</span>
          </div>
          <div style={{ fontSize: "13px", color: colors.textMuted }}>© {new Date().getFullYear()} AssetIntel. All rights reserved.</div>
        </div>
      </footer>
      </div>
    </div>
  );
}

function IconArrowRight({ color = colors.textMuted }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 10H16M16 10L12 6M16 10L12 14" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}
