"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import StatusBadge, { type TopicStatus } from "./StatusBadge";

interface TopicRow {
  id: string;
  title: string;
  status: TopicStatus;
}

interface SubjectCardProps {
  id: string;
  code: string;
  courseId: string;
  name: string;
  description?: string;
  topics: TopicRow[];
  delay?: number;
}

export default function SubjectCard({
  id,
  code,
  courseId,
  name,
  description,
  topics,
  delay = 0,
}: SubjectCardProps) {
  const readyCount = topics.filter((t) => t.status === "study-ready").length;
  // Abbreviation: first 2–3 letters of code
  const abbr = code.replace(/\d/g, "").slice(0, 2).toUpperCase() || code.slice(0, 2).toUpperCase();

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay },
        },
      }}
      whileHover={{
        y: -2,
        boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
        transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
      }}
      className="card-shimmer"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-card)",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        transition: "border-color 180ms var(--ease-spring)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          {/* Icon chip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--color-text-muted)",
              letterSpacing: "-0.01em",
              flexShrink: 0,
            }}
          >
            {abbr}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "11px", color: "var(--color-text-faint)", marginBottom: "1px" }}>
              {courseId}
            </p>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--color-text-base)",
                letterSpacing: "-0.01em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </p>
          </div>
        </div>
        {/* N Ready badge */}
        {readyCount > 0 && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.02em",
              padding: "2px 8px",
              borderRadius: "9999px",
              background: "var(--color-accent-faint)",
              color: "var(--color-accent)",
              border: "1px solid var(--color-accent-border)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {readyCount} Ready
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
          {description}
        </p>
      )}

      {/* Topic rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {topics.slice(0, 4).map((topic) => (
          <Link
            key={topic.id}
            href={`/topic/${topic.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 10px",
              borderRadius: "6px",
              background: "var(--color-surface-2)",
              border: "1px solid transparent",
              textDecoration: "none",
              transition: "all 180ms var(--ease-spring)",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "var(--color-border)";
              el.style.background = "var(--color-surface-3)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "transparent";
              el.style.background = "var(--color-surface-2)";
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "var(--color-text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {topic.title}
            </span>
            <StatusBadge status={topic.status} />
          </Link>
        ))}
        {topics.length > 4 && (
          <p style={{ fontSize: "11px", color: "var(--color-text-faint)", padding: "4px 10px" }}>
            +{topics.length - 4} more topics
          </p>
        )}
      </div>

      {/* Footer link */}
      <Link
        href={`/subjects/${id}`}
        style={{
          fontSize: "12px",
          fontWeight: 500,
          color: "var(--color-text-faint)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          marginTop: "auto",
          transition: "color 180ms var(--ease-spring)",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-text-faint)")}
      >
        View all topics →
      </Link>
    </motion.div>
  );
}
