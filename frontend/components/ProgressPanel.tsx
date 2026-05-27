"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface SubjectProgress {
  name: string;
  code: string;
  percentage: number;
  color: string;
}

interface ActivityItem {
  id: string;
  title: string;
  subject: string;
  timestamp: string;
  dotColor: string;
}

interface ProgressPanelProps {
  subjects?: SubjectProgress[];
  activities?: ActivityItem[];
}

const defaultSubjects: SubjectProgress[] = [
  { name: "Operating Systems",              code: "OS",   percentage: 78, color: "var(--color-accent)" },
  { name: "Database Management",            code: "DBMS", percentage: 55, color: "var(--color-blue)" },
  { name: "Data Structures & Algorithms",   code: "DSA",  percentage: 90, color: "var(--color-accent)" },
  { name: "Computer Networks",              code: "CN",   percentage: 30, color: "var(--color-warn)" },
];

const defaultActivities: ActivityItem[] = [
  { id: "1", title: "Generated mindmap for Process Scheduling",   subject: "OS",   timestamp: "2h ago",  dotColor: "var(--color-accent)" },
  { id: "2", title: "Uploaded notes: Normalization",              subject: "DBMS", timestamp: "5h ago",  dotColor: "var(--color-blue)" },
  { id: "3", title: "Completed quiz on Binary Trees",             subject: "DSA",  timestamp: "1d ago",  dotColor: "var(--color-accent)" },
  { id: "4", title: "Viewed explanation: TCP Handshake",          subject: "CN",   timestamp: "2d ago",  dotColor: "var(--color-warn)" },
  { id: "5", title: "Chatted with AI Tutor on Deadlocks",         subject: "OS",   timestamp: "3d ago",  dotColor: "var(--color-text-faint)" },
];

export default function ProgressPanel({
  subjects = defaultSubjects,
  activities = defaultActivities,
}: ProgressPanelProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Readiness panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}
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
            Study Readiness
          </p>
          <p style={{ fontSize: "11px", color: "var(--color-text-faint)", marginTop: "2px" }}>
            Per-subject processing progress
          </p>
        </div>
        <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "14px" }}>
          {subjects.map((subject, i) => (
            <div key={subject.code}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      background: "var(--color-surface-2)",
                      color: "var(--color-text-faint)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    {subject.code}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                    {subject.name}
                  </span>
                </div>
                <span
                  className="tabular-nums"
                  style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-muted)" }}
                >
                  {subject.percentage}%
                </span>
              </div>
              {/* Track */}
              <div
                style={{
                  height: "4px",
                  borderRadius: "9999px",
                  background: "var(--color-surface-2)",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${subject.percentage}%` }}
                  transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.3 + i * 0.06,
                  }}
                  style={{
                    height: "100%",
                    borderRadius: "9999px",
                    background: subject.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Activity feed */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
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
            gap: "8px",
          }}
        >
          <Clock size={13} style={{ color: "var(--color-text-faint)" }} />
          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-base)", letterSpacing: "-0.01em" }}>
            Recent Activity
          </p>
        </div>
        <div style={{ padding: "0.5rem 0" }}>
          {activities.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.4 + i * 0.05,
              }}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                padding: "9px 1.25rem",
                borderBottom: i < activities.length - 1 ? "1px solid var(--color-border)" : "none",
                transition: "background 180ms var(--ease-spring)",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--color-surface-2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {/* Dot */}
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: item.dotColor,
                  marginTop: "5px",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-muted)",
                    lineHeight: 1.4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.title}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      color: "var(--color-text-faint)",
                      background: "var(--color-surface-2)",
                      padding: "0 5px",
                      borderRadius: "3px",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    {item.subject}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--color-text-faint)" }}>
                    {item.timestamp}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
