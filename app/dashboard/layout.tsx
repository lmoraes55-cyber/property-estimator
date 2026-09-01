"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import AssetIntelLogo from "@/components/AssetIntelLogo";
import { createClient } from "@/lib/supabase/client";
import DecorativeBackdrop from "@/components/DecorativeBackdrop";

const C = {
  bg: "#F7F9F8",
  green: "#1B5E4A",
  greenLight: "#EDF3F0",
  bronze: "#B88A44",
  border: "#E2E8E5",
  text: "#2A2A2A",
  muted: "#4E5D56",
  sidebar: "#FFFFFF",
};

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: OverviewIcon },
  { label: "Properties", href: "/dashboard/properties", icon: PropertiesIcon },
  { label: "Reports", href: "/dashboard/reports", icon: ReportsIcon },
  { label: "Support", href: "/dashboard/requests", icon: RequestsIcon },
  { label: "Account", href: "/dashboard/account", icon: AccountIcon },
];

function OverviewIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? C.green : C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function PropertiesIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? C.green : C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ReportsIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? C.green : C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function RequestsIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? C.green : C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function AccountIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? C.green : C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState("");
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || "");
        const fullName = user.user_metadata?.full_name || "";
        setFirstName(fullName.split(" ")[0] || "");
      }
    });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "transparent", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, background: C.bg, zIndex: -1 }} />
      <DecorativeBackdrop />
      {/* Sidebar — desktop */}
      <aside
        style={{
          width: 240,
          background: C.sidebar,
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
        }}
        className="hidden-mobile"
      >
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${C.border}` }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
            <AssetIntelLogo size={36} />
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.13em",
              textTransform: "uppercase",
              background: "linear-gradient(135deg, #1B5E4A 0%, #B88A44 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Owner Dashboard
            </span>
          </a>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "20px 14px", overflowY: "auto" }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "11px 14px",
                  borderRadius: 9,
                  marginBottom: 4,
                  textDecoration: "none",
                  background: active ? C.greenLight : "transparent",
                  color: active ? C.green : C.muted,
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  transition: "background 0.15s",
                }}
              >
                <Icon active={active} />
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Footer account */}
        <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {userEmail}
          </p>
          <button
            onClick={handleSignOut}
            style={{
              width: "100%",
              padding: "8px",
              background: "transparent",
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 12,
              color: C.muted,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Top bar — mobile only (account + sign out; sidebar with these is hidden below 769px) */}
      <div
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 60,
          alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", background: C.sidebar, borderBottom: `1px solid ${C.border}`,
        }}
        className="mobile-topbar"
      >
        <a href="/" style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          <AssetIntelLogo size={26} />
        </a>
        <p style={{ fontSize: 12, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: "0 10px", flex: 1, textAlign: "right" }}>
          {userEmail}
        </p>
        <button
          onClick={handleSignOut}
          style={{ padding: "6px 14px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.muted, cursor: "pointer", fontWeight: 500, flexShrink: 0 }}
        >
          Sign Out
        </button>
      </div>

      {/* Main content */}
      <main
        style={{
          marginLeft: 240,
          flex: 1,
          minHeight: "100vh",
          padding: "32px 40px",
          position: "relative",
          zIndex: 1,
        }}
        className="dashboard-main"
      >
        {children}
      </main>

      {/* Bottom tabs — mobile */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: C.sidebar,
          borderTop: `1px solid ${C.border}`,
          display: "flex",
          zIndex: 100,
          padding: "8px 0 max(8px, env(safe-area-inset-bottom))",
        }}
        className="mobile-tabs"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                textDecoration: "none",
                padding: "4px 0",
              }}
            >
              <Icon active={active} />
              <span style={{ fontSize: 10, color: active ? C.green : C.muted, fontWeight: active ? 600 : 400 }}>
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>

      <style>{`
        .mobile-topbar { display: none; }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .dashboard-main { margin-left: 0 !important; padding: 76px 16px 80px !important; }
          .mobile-tabs { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-tabs { display: none !important; }
          .mobile-topbar { display: none !important; }
        }
      `}</style>
    </div>
  );
}
