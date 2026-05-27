"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookPlus, Brain, Zap, Upload, CheckCircle, FileText, Map, HelpCircle } from "lucide-react";

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

const ACTIONS: QuickAction[] = [
  {
    label: "New Subject",
    description: "Add a new subject area",
    href: "/dashboard",
    icon: <BookPlus size={14} />,
  },
  {
    label: "Generate Mind Map",
    description: "Create concept map from notes",
    href: "/upload",
    icon: <Brain size={14} />,
  },
  {
    label: "Start Quiz",
    description: "Test your understanding",
    href: "/dashboard",
    icon: <Zap size={14} />,
  },
  {
    label: "Upload Notes",
    description: "Add raw notes to process",
    href: "/upload",
    icon: <Upload size={14} />,
  },
];

const LEGEND = [
  { label: "STUDY-READY",      desc: "Notes, map, explanations & quiz all done",  color: "var(--color-accent)" },
  { label: "MINDMAP READY",    desc: "Concept map generated from notes",           color: "var(--color-blue)" },
  { label: "HAS EXPLANATIONS", desc: "AI explanations available for nodes",        color: "var(--color-warn)" },
  { label: "NOTES ONLY",       desc: "Raw notes uploaded, processing pending",     color: "var(--color-text-faint)" },
];

export default function QuickActions() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Quick Actions panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.32 }}
        className="card-shimmer"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1rem 1.25rem 0.75rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-base)", letterSpacing: "-0.01em" }}>
            Quick Actions
          </p>
        </div>
        <div style={{ padding: "0.75rem" }}>
          {ACTIONS.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 10px",
                borderRadius: "6px",
                border: "1px solid var(--color-border)",
                background: "transparent",
                marginBottom: "6px",
                textDecoration: "none",
                transition: "all 180ms var(--ease-spring)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "var(--color-surface-2)";
                el.style.borderColor = "var(--color-border-hover)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "transparent";
                el.style.borderColor = "var(--color-border)";
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-muted)",
                  flexShrink: 0,
                }}
              >
                {action.icon}
              </span>
              <div>
                <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-base)", lineHeight: 1.3 }}>
                  {action.label}
                </p>
                <p style={{ fontSize: "11px", color: "var(--color-text-faint)", lineHeight: 1.3 }}>
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Status Legend */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.38 }}
        className="card-shimmer"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1rem 1.25rem 0.75rem",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <HelpCircle size={13} style={{ color: "var(--color-text-faint)" }} />
          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-base)", letterSpacing: "-0.01em" }}>
            Status Legend
          </p>
        </div>
        <div style={{ padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "10px" }}>
          {LEGEND.map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: item.color,
                  marginTop: "5px",
                  flexShrink: 0,
                }}
              />
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: item.color,
                    lineHeight: 1.3,
                  }}
                >
                  {item.label}
                </p>
                <p style={{ fontSize: "11px", color: "var(--color-text-faint)", lineHeight: 1.4 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
