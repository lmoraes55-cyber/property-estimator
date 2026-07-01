"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AssetIntelLogo from "./AssetIntelLogo";

const C = {
  primary:   "#1B5E4A",
  secondary: "#B88A44",
  bg:        "#F8F4EE",
  border:    "#E6E1D8",
  text:      "#2A2A2A",
  muted:     "#6B6B6B",
};

const serifFont = "'Georgia', serif";

const SERVICES = [
  { label: "Rental Strategy Analyzer",   href: "/estimator" },
  { label: "Self-Manage Your Property",  href: "/self-manage" },
  { label: "STR Sub-Leasing",            href: "/self-manage/str-subleasing" },
  { label: "Operational Setup",          href: "/#services" },
];


interface Props {
  /** Highlight a specific nav item as active, e.g. "self-manage" */
  active?: string;
}

export default function SiteNav({ active }: Props) {
  const router = useRouter();
  const [servicesOpen, setServicesOpen]     = useState(false);
  const [mobileOpen,   setMobileOpen]       = useState(false);
  const [mobileServices, setMobileServices] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [navVisible, setNavVisible] = useState(true);

  const servicesRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  // Hide on scroll-down, show on scroll-up
  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      const delta = current - lastScrollY.current;
      const menuOpen = servicesOpen || mobileOpen;

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
  }, [servicesOpen, mobileOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) setServicesOpen(false);
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
    if (servicesOpen || mobileOpen) setNavVisible(true);
  }, [servicesOpen, mobileOpen]);

  const shadow = scrolled
    ? "0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(27,94,74,0.12), 0 1px 0 rgba(255,255,255,0.8) inset"
    : "0 2px 4px rgba(0,0,0,0.03), 0 8px 28px rgba(27,94,74,0.09), 0 1px 0 rgba(255,255,255,0.7) inset";

  // Shared dropdown panel style
  const dropdownPanel: React.CSSProperties = {
    position: "absolute",
    top: "calc(100% + 12px)",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 300,
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 16px 48px rgba(27,94,74,0.14)",
    padding: "8px",
    minWidth: 230,
    whiteSpace: "nowrap",
  };

  // Nav link style
  const navLink = (isActive: boolean): React.CSSProperties => ({
    fontSize: 14,
    fontWeight: isActive ? 600 : 500,
    color: isActive ? C.primary : C.muted,
    textDecoration: "none",
    cursor: "pointer",
    transition: "color 0.18s",
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 0",
    borderBottom: isActive ? `1.5px solid ${C.secondary}` : "1.5px solid transparent",
    letterSpacing: "0.01em",
  });

  // Dropdown row button
  function DropRow({ label, href, desc, onClick }: { label: string; href?: string; desc?: string; onClick?: () => void }) {
    const [hov, setHov] = useState(false);
    const handle = () => {
      setServicesOpen(false);
      if (href) router.push(href);
      if (onClick) onClick();
    };
    return (
      <button
        onClick={handle}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "block", width: "100%", textAlign: "left",
          background: hov ? "#F0F7F3" : "transparent",
          border: "none", padding: desc ? "12px 14px" : "11px 14px",
          cursor: "pointer", borderRadius: 10, transition: "background 0.15s",
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 600, color: hov ? C.primary : C.text, lineHeight: 1.3 }}>{label}</p>
        {desc && <p style={{ fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>{desc}</p>}
      </button>
    );
  }

  const chevron = (open: boolean) => (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none", marginTop: 1 }}>
      <path d="M2 3.5L5 6.5L8 3.5" stroke={C.muted} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
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
          padding: "12px 16px",
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
            height: 80,
            background: `${C.bg}F2`,
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: `1px solid ${C.border}`,
            borderRadius: 28,
            boxShadow: shadow,
            display: "flex",
            alignItems: "center",
            padding: "0 32px",
            gap: 0,
            pointerEvents: "auto",
            transition: "box-shadow 0.3s ease",
          }}
        >
          {/* ── LOGO ── */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 11, cursor: "pointer", flexShrink: 0 }}
            onClick={() => router.push("/")}
          >
            <AssetIntelLogo size={38} />
          </div>

          {/* ── DIVIDER ── */}
          <div style={{ width: 1, height: 28, background: C.border, margin: "0 24px", flexShrink: 0 }} className="hidden-mobile" />

          {/* ── DESKTOP NAV ── */}
          <nav
            className="desktop-nav"
            style={{ display: "flex", alignItems: "center", gap: 28, flex: 1 }}
          >
            {/* Home */}
            <a href="/#home" style={navLink(active === "home")}>Home</a>

            {/* Services dropdown */}
            <div ref={servicesRef} style={{ position: "relative" }}>
              <button
                onClick={() => { setServicesOpen(o => !o); }}
                style={{ ...navLink(active === "services"), background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}
              >
                Services {chevron(servicesOpen)}
              </button>
              {servicesOpen && (
                <div style={dropdownPanel}>
                  {SERVICES.map(s => <DropRow key={s.label} label={s.label} href={s.href} />)}
                </div>
              )}
            </div>

            {/* STR Market Intel */}
            <a href="/str-market-intel" style={navLink(active === "str-market-intel")}>STR Market Intel</a>

            {/* Investment Research */}
            <a href="/str-investment-research" style={navLink(active === "investment-research")}>Investment Research</a>

            {/* Upcoming Projects */}
            <a href="/investment-research/2026-handovers" style={navLink(active === "upcoming-projects")}>Upcoming Projects</a>

            {/* About */}
            <a href="/about" style={navLink(active === "about")}>About Us</a>
          </nav>

          {/* ── CTA ── */}
          <button
            className="desktop-nav"
            onClick={() => router.push("/estimator")}
            style={{
              flexShrink: 0,
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

              {/* Services */}
              <MobileExpand
                label="Services"
                open={mobileServices}
                toggle={() => setMobileServices(o => !o)}
              >
                {SERVICES.map(s => (
                  <MobileRow key={s.label} label={s.label} indent onClick={() => { router.push(s.href); setMobileOpen(false); }} />
                ))}
              </MobileExpand>

              {/* STR Market Intel */}
              <MobileRow label="STR Market Intel" onClick={() => { router.push("/str-market-intel"); setMobileOpen(false); }} />

              {/* Investment Research */}
              <MobileRow label="Investment Research" onClick={() => { router.push("/str-investment-research"); setMobileOpen(false); }} />

              {/* Upcoming Projects */}
              <MobileRow label="Upcoming Projects" onClick={() => { router.push("/investment-research/2026-handovers"); setMobileOpen(false); }} />

              {/* About */}
              <MobileRow label="About Us" onClick={() => { router.push("/about"); setMobileOpen(false); }} />

              {/* CTA */}
              <div style={{ padding: "10px 8px 8px" }}>
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
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .hidden-mobile { display: none !important; }
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
      <p style={{ fontSize: 14, fontWeight: indent ? 500 : 600, color: hov ? "#1B5E4A" : "#2A2A2A" }}>{label}</p>
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
        <p style={{ fontSize: 14, fontWeight: 600, color: hov ? "#1B5E4A" : "#2A2A2A" }}>{label}</p>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="#6B6B6B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}
