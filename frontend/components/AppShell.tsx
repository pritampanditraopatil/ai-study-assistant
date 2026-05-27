"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface AppShellProps {
  children: React.ReactNode;
  crumbs?: { label: string; href?: string }[];
  showAddSubject?: boolean;
  showAddTopic?: boolean;
  onAddSubject?: () => void;
  onAddTopic?: () => void;
}

export default function AppShell({
  children,
  crumbs = [],
  showAddSubject = false,
  showAddTopic = false,
  onAddSubject,
  onAddTopic,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--color-bg)",
      }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 20,
            display: "block",
          }}
          className="lg:hidden"
        />
      )}

      {/* Sidebar — hidden on mobile, shown on md+ */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 30,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 180ms var(--ease-spring)",
        }}
        className="lg:static lg:transform-none lg:translate-x-0 lg:z-auto lg:flex-shrink-0"
      >
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Right column: topbar + scrollable content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <Topbar
          crumbs={crumbs}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          showAddSubject={showAddSubject}
          showAddTopic={showAddTopic}
          onAddSubject={onAddSubject}
          onAddTopic={onAddTopic}
        />
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "2rem",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
