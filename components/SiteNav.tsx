"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AssetIntelLogo from "./AssetIntelLogo";
import { createClient } from "@/lib/supabase/client";

const C = {
  primary:   "#1B5E4A",
  secondary: "#B88A44",
  secondaryText: "#7D6338",
  bg:        "#F8F4EE",
  border:    "#E6E1D8",
  text:      "#1A1A1A",
  muted:     "#6B6B6B",
};

const serifFont = "'Georgia', serif";

// ── Icons — 18px outline, single colour, consistent 1.6 stroke ──
const iconProps = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const Icons = {
  chart: () => <svg {...iconProps}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  book: () => <svg {...iconProps}><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>,
  settings: () => <svg {...iconProps}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
  home: () => <svg {...iconProps}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  users: () => <svg {...iconProps}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>,
  doc: () => <svg {...iconProps}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  shield: () => <svg {...iconProps}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  trending: () => <svg {...iconProps}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  search: () => <svg {...iconProps}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  building: () => <svg {...iconProps}><rect x="4" y="2" width="16" height="20" rx="1" /><line x1="9" y1="7" x2="9" y2="7" /><line x1="15" y1="7" x2="15" y2="7" /><line x1="9" y1="11" x2="9" y2="11" /><line x1="15" y1="11" x2="15" y2="11" /><line x1="9" y1="15" x2="9" y2="15" /><line x1="15" y1="15" x2="15" y2="15" /><line x1="10" y1="22" x2="10" y2="18" /><line x1="14" y1="22" x2="14" y2="18" /></svg>,
  mapPin: () => <svg {...iconProps}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
};

interface MenuItem {
  label: string;
  href?: string;
  desc: string;
  icon: keyof typeof Icons;
  soon?: boolean;
}

const SOLUTIONS_GROUPS: { title: string; items: MenuItem[] }[] = [
  {
    title: "Property Solutions",
    items: [
      { label: "Rental Analyzer", href: "/estimator", desc: "Compare STR vs LTR rental performance.", icon: "chart" },
      { label: "Self-Manage", href: "/self-manage", desc: "Learn how to self-manage your Dubai holiday home professionally.", icon: "book" },
      { label: "Co-Hosting", href: "/co-hosting", desc: "Get introduced to a partner co-host for guest comms and listing management.", icon: "users" },
      { label: "Operations Setup", href: "/operations-setup", desc: "Build and automate your holiday-home operations.", icon: "settings" },
    ],
  },
  {
    title: "STR Services",
    items: [
      { label: "Furnishing & STR Readiness", href: "/furnishing/guide", desc: "Get your unit STR-ready with furnishing guidance.", icon: "home" },
      { label: "STR Operator Matching", href: "/operator-match", desc: "Get matched with a vetted STR operator.", icon: "users" },
      { label: "Handover Snagging Inspection", href: "/snagging", desc: "A specialist inspector checks your unit before you accept handover.", icon: "doc" },
    ],
  },
  {
    title: "Professional Tools",
    items: [
      { label: "DLD Rental Estimate", href: "/ltr-estimator", desc: "Estimate long-term rental value using DLD data.", icon: "doc" },
      { label: "Sub-Leasing Risk Estimator", href: "/self-manage/str-subleasing", desc: "Assess risk and compliance for STR sub-leases.", icon: "shield" },
    ],
  },
];

const RESEARCH_GROUPS: { title: string; items: MenuItem[] }[] = [
  {
    title: "Market Intelligence",
    items: [
      { label: "STR Market Intelligence", href: "/str-market-intel", desc: "Live STR performance data across Dubai.", icon: "trending" },
      { label: "Investment Research", href: "/str-investment-research", desc: "In-depth analysis for Dubai property investors.", icon: "search" },
    ],
  },
  {
    title: "Opportunities",
    items: [
      { label: "Upcoming Projects", href: "/investment-research/2026-handovers", desc: "Track new developments and 2026 handovers.", icon: "building" },
      { label: "Area Insights", desc: "Community-level performance data.", icon: "mapPin", soon: true },
    ],
  },
];

const SOLUTIONS_ACTIVE = new Set(["services", "self-manage", "ltr-estimator", "how-str-works", "co-hosting", "snagging"]);
const RESEARCH_ACTIVE = new Set(["str-market-intel", "investment-research", "insights", "upcoming-projects"]);

interface Props {
  /** Highlight a specific nav item as active, e.g. "self-manage" */
  active?: string;
}

export default function SiteNav({ active }: Props) {
  const router = useRouter();
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [researchOpen, setResearchOpen]   = useState(false);
  const [mobileOpen,   setMobileOpen]       = useState(false);
  const [mobileSolutions, setMobileSolutions] = useState(false);
  const [mobileResearch, setMobileResearch] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const solutionsRef = useRef<HTMLDivElement>(null);
  const researchRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
    // Keep this reactive across tabs — e.g. a tab left open on an
    // unconfirmed signup should flip to "Dashboard" once the user
    // confirms their email and signs in from another tab.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  // Hide on scroll-down, show on scroll-up
  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      const delta = current - lastScrollY.current;
      const menuOpen = solutionsOpen || researchOpen || mobileOpen;

      setScrolled(current > 12);

      // Only act on meaningful scroll movements past the threshold
      if (Math.abs(delta) < 8) return;

      if (current < 80) {
        // Always show near top
        setNavVisible(true);
      } else if (!menuOpen) {
        // Hide on scroll-down, show on scroll-up
        setNavVisible(delta < 0);
      }

      lastScrollY.current = current;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [solutionsOpen, researchOpen, mobileOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (solutionsRef.current && !solutionsRef.current.contains(e.target as Node)) setSolutionsOpen(false);
      if (researchRef.current && !researchRef.current.contains(e.target as Node)) setResearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Keep nav visible while any menu is open
  useEffect(() => {
    if (solutionsOpen || researchOpen || mobileOpen) setNavVisible(true);
  }, [solutionsOpen, researchOpen, mobileOpen]);

  const shadow = scrolled
    ? "0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(27,94,74,0.12), 0 1px 0 rgba(255,255,255,0.8) inset"
    : "0 2px 4px rgba(0,0,0,0.03), 0 8px 28px rgba(27,94,74,0.09), 0 1px 0 rgba(255,255,255,0.7) inset";

  // Shared mega-dropdown panel style
  const dropdownPanel: React.CSSProperties = {
    position: "absolute",
    top: "calc(100% + 14px)",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 300,
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: 18,
    boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 20px 56px rgba(27,94,74,0.16)",
    padding: "20px",
    width: 450,
    animation: "navDropdownIn 190ms ease",
  };

  // Nav link style — soft cream highlight + bronze underline + darker text when active
  const navLink = (isActive: boolean): React.CSSProperties => ({
    fontSize: 14,
    fontWeight: isActive ? 600 : 500,
    color: isActive ? C.text : C.muted,
    textDecoration: "none",
    cursor: "pointer",
    transition: "color 180ms ease, background 180ms ease",
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "7px 12px",
    borderRadius: 8,
    background: isActive ? "rgba(184,138,68,0.08)" : "transparent",
    boxShadow: isActive ? `inset 0 -2px 0 ${C.secondary}` : "inset 0 -2px 0 transparent",
    letterSpacing: "0.01em",
  });

  function DropRow({ item }: { item: MenuItem }) {
    const [hov, setHov] = useState(false);
    const disabled = !item.href;
    const Icon = Icons[item.icon];
    const handle = () => {
      if (!item.href) return;
      setSolutionsOpen(false);
      setResearchOpen(false);
      router.push(item.href);
    };
    return (
      <button
        onClick={handle}
        onMouseEnter={() => !disabled && setHov(true)}
        onMouseLeave={() => setHov(false)}
        disabled={disabled}
        style={{
          display: "flex", alignItems: "flex-start", gap: 12, width: "100%", textAlign: "left",
          background: hov ? "#F0F7F3" : "transparent",
          border: "none", padding: "10px 12px",
          cursor: disabled ? "default" : "pointer", borderRadius: 12,
          transition: "background 150ms ease",
          opacity: disabled ? 0.55 : 1,
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0, marginTop: 1,
          background: hov ? "#fff" : "rgba(27,94,74,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: C.primary, transition: "background 150ms ease",
        }}>
          <Icon />
        </div>
        <div>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: hov ? C.primary : C.text, lineHeight: 1.3, display: "flex", alignItems: "center", gap: 8 }}>
            {item.label}
            {item.soon && (
              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", color: C.muted, background: C.border, padding: "2px 6px", borderRadius: 4 }}>
                SOON
              </span>
            )}
          </p>
          <p style={{ fontSize: 11.5, color: C.muted, marginTop: 3, lineHeight: 1.45 }}>{item.desc}</p>
        </div>
      </button>
    );
  }

  function MegaMenu({ groups }: { groups: { title: string; items: MenuItem[] }[] }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {groups.map((g, gi) => (
          <div key={g.title}>
            <p style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase",
              color: C.secondaryText, marginBottom: 6, paddingLeft: 12,
            }}>
              {g.title}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {g.items.map(item => <DropRow key={item.label} item={item} />)}
            </div>
            {gi < groups.length - 1 && <div style={{ height: 1, background: C.border, margin: "14px 4px 0" }} />}
          </div>
        ))}
      </div>
    );
  }

  const chevron = (open: boolean) => (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" style={{ transition: "transform 200ms ease", transform: open ? "rotate(180deg)" : "none", marginTop: 1 }}>
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <>
      {/* Outer wrapper — sticky, full-width, transparent */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 200,
          padding: "14px 16px",
          pointerEvents: "none",
          // Hide/show transition
          transform: navVisible ? "translateY(0)" : "translateY(-120%)",
          opacity: navVisible ? 1 : 0,
          transition: "transform 280ms ease, opacity 220ms ease",
        }}
      >
        {/* The floating card */}
        <div
          style={{
            maxWidth: 1420,
            margin: "0 auto",
            height: 84,
            background: `${C.bg}F2`,
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: `1px solid ${C.border}`,
            borderRadius: 28,
            boxShadow: shadow,
            display: "flex",
            alignItems: "center",
            padding: "0 34px",
            gap: 0,
            pointerEvents: "auto",
            transition: "box-shadow 0.3s ease",
          }}
        >
          {/* ── LOGO ── */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 11, cursor: "pointer", flexShrink: 0, marginRight: 40 }}
            onClick={() => router.push("/")}
          >
            <AssetIntelLogo size={38} />
          </div>

          {/* ── DESKTOP NAV ── */}
          <nav
            className="desktop-nav"
            style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}
          >
            {/* Home */}
            <a href="/#home" style={navLink(active === "home")}>Home</a>

            {/* Solutions dropdown */}
            <div ref={solutionsRef} style={{ position: "relative" }}>
              <button
                onClick={() => { setSolutionsOpen(o => !o); setResearchOpen(false); }}
                style={{ ...navLink(SOLUTIONS_ACTIVE.has(active || "") || solutionsOpen), background: "none", border: "none", cursor: "pointer" }}
              >
                Solutions {chevron(solutionsOpen)}
              </button>
              {solutionsOpen && (
                <div style={dropdownPanel}>
                  <MegaMenu groups={SOLUTIONS_GROUPS} />
                </div>
              )}
            </div>

            {/* Research dropdown */}
            <div ref={researchRef} style={{ position: "relative" }}>
              <button
                onClick={() => { setResearchOpen(o => !o); setSolutionsOpen(false); }}
                style={{ ...navLink(RESEARCH_ACTIVE.has(active || "") || researchOpen), background: "none", border: "none", cursor: "pointer" }}
              >
                Research {chevron(researchOpen)}
              </button>
              {researchOpen && (
                <div style={dropdownPanel}>
                  <MegaMenu groups={RESEARCH_GROUPS} />
                </div>
              )}
            </div>

            {/* About */}
            <a href="/about" style={navLink(active === "about")}>About</a>
          </nav>

          {/* ── CTAs ── */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, marginLeft: 24 }}>
            <button
              onClick={() => router.push(isLoggedIn ? "/dashboard" : "/login")}
              style={{
                padding: "9px 18px",
                borderRadius: 999,
                background: "transparent",
                color: C.muted,
                fontSize: 13,
                fontWeight: 600,
                border: `1.5px solid ${C.border}`,
                cursor: "pointer",
                transition: "color 0.18s, border-color 0.18s",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.primary; (e.currentTarget as HTMLButtonElement).style.borderColor = C.primary; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.muted; (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; }}
            >
              {isLoggedIn ? "Dashboard" : "Sign In"}
            </button>
            <button
              onClick={() => router.push("/consultation")}
              style={{
                padding: "9px 18px",
                borderRadius: 999,
                background: `linear-gradient(135deg, ${C.secondary} 0%, #8B6F3F 100%)`,
                color: "#FFF",
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(184,138,68,0.30)",
                transition: "transform 0.18s, box-shadow 0.18s",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 18px rgba(184,138,68,0.38)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(184,138,68,0.30)"; }}
            >
              Book Consultation
            </button>
            <button
              onClick={() => router.push("/estimator")}
              style={{
                padding: "9px 20px",
                borderRadius: 999,
                background: `linear-gradient(135deg, ${C.primary} 0%, #2D7A5E 100%)`,
                color: "#FFF",
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(27,94,74,0.28)",
                transition: "transform 0.18s, box-shadow 0.18s",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 18px rgba(27,94,74,0.36)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(27,94,74,0.28)"; }}
            >
              Analyze Property
            </button>
          </div>

          {/* ── HAMBURGER (mobile) ── */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            style={{
              display: "none",
              background: "transparent",
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              width: 40,
              height: 40,
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginLeft: "auto",
            }}
          >
            {mobileOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            )}
          </button>
        </div>

        {/* ── MOBILE DROPDOWN PANEL ── */}
        {mobileOpen && (
          <div
            style={{
              maxWidth: 1280,
              margin: "8px auto 0",
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 18,
              boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(27,94,74,0.14)",
              overflow: "hidden",
              pointerEvents: "auto",
            }}
          >
            <div style={{ padding: "8px" }}>
              {/* Home */}
              <MobileRow label="Home" onClick={() => { router.push("/"); setMobileOpen(false); }} />

              {/* Solutions */}
              <MobileExpand label="Solutions" open={mobileSolutions} toggle={() => setMobileSolutions(o => !o)}>
                {SOLUTIONS_GROUPS.flatMap(g => g.items).map(item => (
                  <MobileRow
                    key={item.label}
                    label={item.label}
                    desc={item.desc}
                    indent
                    onClick={() => { if (item.href) { router.push(item.href); setMobileOpen(false); } }}
                  />
                ))}
              </MobileExpand>

              {/* Research */}
              <MobileExpand label="Research" open={mobileResearch} toggle={() => setMobileResearch(o => !o)}>
                {RESEARCH_GROUPS.flatMap(g => g.items).map(item => (
                  <MobileRow
                    key={item.label}
                    label={item.label}
                    desc={item.desc}
                    indent
                    onClick={() => { if (item.href) { router.push(item.href); setMobileOpen(false); } }}
                  />
                ))}
              </MobileExpand>

              {/* About */}
              <MobileRow label="About" onClick={() => { router.push("/about"); setMobileOpen(false); }} />

              {/* Sign In / Dashboard */}
              <MobileRow label={isLoggedIn ? "Dashboard" : "Sign In"} onClick={() => { router.push(isLoggedIn ? "/dashboard" : "/login"); setMobileOpen(false); }} />
              {isLoggedIn && (
                <MobileRow label="Sign Out" onClick={() => { setMobileOpen(false); handleSignOut(); }} />
              )}

              {/* CTA */}
              <div style={{ padding: "10px 8px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={() => { router.push("/consultation"); setMobileOpen(false); }}
                  style={{
                    width: "100%", padding: "13px",
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${C.secondary} 0%, #8B6F3F 100%)`,
                    color: "#FFF", fontSize: 14, fontWeight: 700,
                    border: "none", cursor: "pointer",
                  }}
                >
                  Book Consultation
                </button>
                <button
                  onClick={() => { router.push("/estimator"); setMobileOpen(false); }}
                  style={{
                    width: "100%", padding: "13px",
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${C.primary} 0%, #2D7A5E 100%)`,
                    color: "#FFF", fontSize: 14, fontWeight: 700,
                    border: "none", cursor: "pointer",
                  }}
                >
                  Analyze Property
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Responsive styles */}
      <style>{`
        @keyframes navDropdownIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 768px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}

function MobileRow({ label, indent, desc, onClick }: { label: string; indent?: boolean; desc?: string; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "block", width: "100%", textAlign: "left",
        background: hov ? "#F0F7F3" : "transparent",
        border: "none",
        padding: indent ? "10px 14px 10px 28px" : "11px 14px",
        cursor: "pointer", borderRadius: 10, transition: "background 0.15s",
      }}
    >
      <p style={{ fontSize: 14, fontWeight: indent ? 500 : 600, color: hov ? "#1B5E4A" : C.text }}>{label}</p>
      {desc && <p style={{ fontSize: 11, color: "#888", marginTop: 2, lineHeight: 1.4 }}>{desc}</p>}
    </button>
  );
}

function MobileExpand({ label, open, toggle, children }: { label: string; open: boolean; toggle: () => void; children: React.ReactNode }) {
  const [hov, setHov] = useState(false);
  return (
    <div>
      <button
        onClick={toggle}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", textAlign: "left",
          background: hov ? "#F0F7F3" : "transparent",
          border: "none", padding: "11px 14px",
          cursor: "pointer", borderRadius: 10, transition: "background 0.15s",
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 600, color: hov ? "#1B5E4A" : C.text }}>{label}</p>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="#6B6B6B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}
