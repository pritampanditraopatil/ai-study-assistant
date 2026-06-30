"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Home, Sun, Moon, Menu, Search, Bell, Flame } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

interface TopbarProps {
  crumbs: Crumb[];
  onMenuToggle?: () => void;
  showAddSubject?: boolean;
  showAddTopic?: boolean;
  onAddSubject?: () => void;
  onAddTopic?: () => void;
}

export default function Topbar({
  crumbs,
  onMenuToggle,
}: TopbarProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  return (
    <header
      style={{
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        background: "rgba(10, 10, 10, 0.6)",
        borderBottom: "1px solid var(--color-border)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        flexShrink: 0,
      }}
    >
      {/* Left: hamburger + breadcrumbs */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={onMenuToggle}
          className="md:hidden"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            border: "1px solid var(--color-border)",
            background: "transparent",
            color: "var(--color-text-muted)",
            cursor: "pointer",
          }}
        >
          <Menu size={16} />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex" style={{ alignItems: "center", gap: "6px" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              color: "var(--color-text-faint)",
              textDecoration: "none",
              transition: "color 180ms var(--ease-spring)",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-text-faint)")}
          >
            <Home size={14} />
          </Link>
          {crumbs.map((crumb, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ChevronRight size={14} style={{ color: "var(--color-text-faint)" }} />
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  style={{
                    fontSize: "13px",
                    color: i === crumbs.length - 1 ? "var(--color-text-base)" : "var(--color-text-faint)",
                    textDecoration: "none",
                    fontWeight: i === crumbs.length - 1 ? 500 : 400,
                  }}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  style={{
                    fontSize: "13px",
                    color: i === crumbs.length - 1 ? "var(--color-text-base)" : "var(--color-text-faint)",
                    fontWeight: i === crumbs.length - 1 ? 500 : 400,
                  }}
                >
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Middle: Search bar */}
      <div className="flex-1 max-w-md px-4 hidden md:block">
        <div className="relative flex items-center w-full h-9 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-colors px-3">
          <Search size={14} className="text-white/40 mr-2" />
          <input
            type="text"
            placeholder="Search notes, maps, flashes..."
            className="bg-transparent border-none outline-none text-[13px] text-white w-full placeholder:text-white/30"
          />
          <div className="flex items-center justify-center h-5 px-1.5 rounded bg-white/10 text-[10px] text-white/50 ml-2 font-medium tracking-wider">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right: action buttons, streak, avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        
        {/* Streak */}
        <div className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-[var(--color-orange-faint)] border border-[var(--color-orange-border)]">
          <Flame size={14} color="var(--color-orange)" />
          <span className="text-[12px] font-bold tabular-nums" style={{ color: "var(--color-orange)" }}>12</span>
        </div>

        {/* Notifications */}
        <button
          className="relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/5 transition-colors text-white/50 hover:text-white"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-orange)]" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/5 transition-colors text-white/50 hover:text-white"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-orange)] to-[#ff8c42] flex items-center justify-center text-white text-[13px] font-bold shadow-[0_0_15px_var(--color-orange-faint)] cursor-pointer ring-2 ring-transparent hover:ring-[var(--color-orange-border)] transition-all">
          PP
        </div>
      </div>
    </header>
  );
}
