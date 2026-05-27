"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Brain, Zap, MessageSquare } from "lucide-react";

interface Stat {
  label: string;
  value: number;
  suffix?: string;
  sub: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  icon: React.ReactNode;
}

interface StatsRowProps {
  subjectCount?: number;
  topicCount?: number;
  readyCount?: number;
  sessionCount?: number;
}

function useCountUp(target: number, duration = 900) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return count;
}

function StatCard({ stat, delay }: { stat: Stat; delay: number }) {
  const count = useCountUp(stat.value, 800);

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
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
        transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
      }}
      className="card-shimmer"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-card)",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        cursor: "default",
        transition: "border-color 180ms var(--ease-spring)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
      }}
    >
      {/* Top row: icon + badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-muted)",
          }}
        >
          {stat.icon}
        </div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.04em",
            padding: "2px 8px",
            borderRadius: "9999px",
            background: stat.badgeBg,
            color: stat.badgeColor,
            border: `1px solid ${stat.badgeColor}33`,
          }}
        >
          {stat.badge}
        </span>
      </div>

      {/* Number */}
      <div>
        <p
          className="tabular-nums"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "var(--color-text-base)",
          }}
        >
          {count}
          {stat.suffix ?? ""}
        </p>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--color-text-muted)",
            marginTop: "4px",
            letterSpacing: "-0.01em",
          }}
        >
          {stat.label}
        </p>
        <p style={{ fontSize: "11px", color: "var(--color-text-faint)", marginTop: "2px" }}>
          {stat.sub}
        </p>
      </div>
    </motion.div>
  );
}

export default function StatsRow({
  subjectCount = 4,
  topicCount = 12,
  readyCount = 5,
  sessionCount = 3,
}: StatsRowProps) {
  const stats: Stat[] = [
    {
      label: "Subjects",
      value: subjectCount,
      sub: "Active this semester",
      badge: "ACTIVE",
      badgeColor: "var(--color-accent)",
      badgeBg: "var(--color-accent-faint)",
      icon: <BookOpen size={15} />,
    },
    {
      label: "Topics",
      value: topicCount,
      sub: "Across all subjects",
      badge: "TOTAL",
      badgeColor: "var(--color-blue)",
      badgeBg: "var(--color-blue-faint)",
      icon: <Brain size={15} />,
    },
    {
      label: "Study Ready",
      value: readyCount,
      sub: "Topics fully processed",
      badge: "READY",
      badgeColor: "var(--color-accent)",
      badgeBg: "var(--color-accent-faint)",
      icon: <Zap size={15} />,
    },
    {
      label: "Chat Sessions",
      value: sessionCount,
      sub: "This week",
      badge: "WEEK",
      badgeColor: "var(--color-warn)",
      badgeBg: "var(--color-warn-faint)",
      icon: <MessageSquare size={15} />,
    },
  ];

  return (
    <motion.div
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
      initial="hidden"
      animate="show"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "1rem",
      }}
    >
      {stats.map((stat, i) => (
        <StatCard key={stat.label} stat={stat} delay={i * 0.07} />
      ))}
    </motion.div>
  );
}
