"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Home, Sun, Moon, Menu, Plus } from "lucide-react";

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
  showAddSubject = false,
  showAddTopic = false,
  onAddSubject,
  onAddTopic,
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
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        background: "var(--color-bg)",
        borderBottom: "1px solid var(--color-border)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        flexShrink: 0,
      }}
    >
      {/* Left: hamburger + breadcrumbs */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
          <Menu size={15} />
        </button>

        {/* Breadcrumbs */}
        <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
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
            <Home size={13} />
          </Link>
          {crumbs.map((crumb, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <ChevronRight size={12} style={{ color: "var(--color-text-faint)" }} />
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  style={{
                    fontSize: "13px",
                    color: i === crumbs.length - 1 ? "var(--color-text-muted)" : "var(--color-text-faint)",
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
                    color: i === crumbs.length - 1 ? "var(--color-text-muted)" : "var(--color-text-faint)",
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

      {/* Right: action buttons + theme toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {showAddSubject && (
          <button
            onClick={onAddSubject}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              height: "30px",
              padding: "0 12px",
              borderRadius: "6px",
              border: "1px solid var(--color-border)",
              background: "transparent",
              color: "var(--color-text-muted)",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 180ms var(--ease-spring)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "var(--color-border-hover)";
              el.style.color = "var(--color-text-base)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "var(--color-border)";
              el.style.color = "var(--color-text-muted)";
            }}
          >
            <Plus size={13} />
            Add Subject
          </button>
        )}
        {showAddTopic && (
          <button
            onClick={onAddTopic}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              height: "30px",
              padding: "0 12px",
              borderRadius: "6px",
              border: "none",
              background: "var(--color-text-base)",
              color: "var(--color-bg)",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "opacity 180ms var(--ease-spring)",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            <Plus size={13} />
            Add Topic
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "30px",
            height: "30px",
            borderRadius: "6px",
            border: "1px solid var(--color-border)",
            background: "transparent",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            transition: "all 180ms var(--ease-spring)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = "var(--color-border-hover)";
            el.style.color = "var(--color-text-base)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = "var(--color-border)";
            el.style.color = "var(--color-text-muted)";
          }}
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </header>
  );
}
