"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  BookOpen,
  MessageSquare,
  BarChart2,
  Settings,
  GraduationCap,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard",  icon: <LayoutDashboard size={16} /> },
  { href: "/upload",    label: "Upload Notes", icon: <Upload size={16} /> },
  { href: "/subjects",  label: "Subjects",   icon: <BookOpen size={16} /> },
];

const TOOLS_NAV: NavItem[] = [
  { href: "/chat",      label: "AI Tutor",   icon: <MessageSquare size={16} /> },
  { href: "/progress",  label: "Progress",   icon: <BarChart2 size={16} /> },
  { href: "/settings",  label: "Settings",   icon: <Settings size={16} /> },
];

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col h-full"
      style={{
        width: collapsed ? "56px" : "240px",
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        transition: "width 180ms var(--ease-spring)",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4"
        style={{ height: "56px", borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}
      >
        <div
          className="flex items-center justify-center rounded-lg flex-shrink-0"
          style={{
            width: "28px",
            height: "28px",
            background: "var(--color-text-base)",
            color: "var(--color-surface)",
          }}
        >
          <GraduationCap size={15} />
        </div>
        {!collapsed && (
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--color-text-base)",
              whiteSpace: "nowrap",
              letterSpacing: "-0.01em",
            }}
          >
            Study Assistant
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto" style={{ padding: "12px 8px" }}>
        {/* Main section */}
        {!collapsed && (
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "var(--color-text-faint)",
              padding: "0 8px",
              marginBottom: "4px",
            }}
          >
            MAIN
          </p>
        )}
        {MAIN_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} collapsed={collapsed} />
        ))}

        <div style={{ height: "16px" }} />

        {/* Tools section */}
        {!collapsed && (
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "var(--color-text-faint)",
              padding: "0 8px",
              marginBottom: "4px",
            }}
          >
            TOOLS
          </p>
        )}
        {TOOLS_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} collapsed={collapsed} />
        ))}
      </nav>

      {/* Footer user row */}
      <div
        className="flex items-center gap-3 px-3 py-3"
        style={{ borderTop: "1px solid var(--color-border)", flexShrink: 0 }}
      >
        <div
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{
            width: "26px",
            height: "26px",
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--color-text-muted)",
          }}
        >
          S
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-base)", lineHeight: 1.2 }}>
              Student
            </p>
            <p style={{ fontSize: "11px", color: "var(--color-text-faint)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              CSE 3rd Year
            </p>
          </div>
        )}
        {!collapsed && <ChevronRight size={13} style={{ color: "var(--color-text-faint)", flexShrink: 0 }} />}
      </div>
    </aside>
  );
}

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={item.href}
      className="nav-active-dot"
      title={collapsed ? item.label : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: collapsed ? "8px" : "7px 8px",
        borderRadius: "6px",
        marginBottom: "2px",
        position: "relative",
        color: active ? "var(--color-text-base)" : "var(--color-text-muted)",
        background: active ? "rgba(255,255,255,0.06)" : "transparent",
        fontSize: "13px",
        fontWeight: active ? 500 : 400,
        textDecoration: "none",
        transition: "all 180ms var(--ease-spring)",
        justifyContent: collapsed ? "center" : "flex-start",
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <span style={{ flexShrink: 0 }}>{item.icon}</span>
      {!collapsed && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
    </Link>
  );
}
