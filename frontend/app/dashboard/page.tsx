"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/AppShell";
import StatsRow from "@/components/StatsRow";
import SubjectCard from "@/components/SubjectCard";
import ProgressPanel from "@/components/ProgressPanel";
import QuickActions from "@/components/QuickActions";
import { listSubjects, listTopics, type Subject, type Topic } from "@/lib/api";
import type { TopicStatus } from "@/components/StatusBadge";

// ─── Dummy fallback data ──────────────────────────────────────────────────

const DUMMY_SUBJECTS = [
  {
    id: "s1",
    name: "Operating Systems",
    code: "OS",
    courseId: "CS301",
    description: "Process management, memory, scheduling, deadlocks, and file systems.",
    created_at: new Date().toISOString(),
    topics: [
      { id: "t1", title: "Process Scheduling",        status: "study-ready"      as TopicStatus },
      { id: "t2", title: "Deadlocks",                 status: "mindmap-ready"    as TopicStatus },
      { id: "t3", title: "Memory Management",         status: "has-explanations" as TopicStatus },
      { id: "t4", title: "File Systems",              status: "notes-only"       as TopicStatus },
    ],
  },
  {
    id: "s2",
    name: "Database Management",
    code: "DBMS",
    courseId: "CS302",
    description: "Relational algebra, SQL, normalization, transactions, and indexing.",
    created_at: new Date().toISOString(),
    topics: [
      { id: "t5", title: "Normalization",             status: "study-ready"      as TopicStatus },
      { id: "t6", title: "SQL Queries",               status: "mindmap-ready"    as TopicStatus },
      { id: "t7", title: "Transactions & ACID",       status: "notes-only"       as TopicStatus },
    ],
  },
  {
    id: "s3",
    name: "Data Structures & Algorithms",
    code: "DSA",
    courseId: "CS201",
    description: "Arrays, trees, graphs, sorting, searching, and complexity analysis.",
    created_at: new Date().toISOString(),
    topics: [
      { id: "t8",  title: "Binary Trees",             status: "study-ready"      as TopicStatus },
      { id: "t9",  title: "Graph Traversal",          status: "study-ready"      as TopicStatus },
      { id: "t10", title: "Dynamic Programming",      status: "has-explanations" as TopicStatus },
    ],
  },
  {
    id: "s4",
    name: "Computer Networks",
    code: "CN",
    courseId: "CS304",
    description: "OSI model, TCP/IP, routing protocols, congestion control, and security.",
    created_at: new Date().toISOString(),
    topics: [
      { id: "t11", title: "TCP/IP Stack",             status: "mindmap-ready"    as TopicStatus },
      { id: "t12", title: "Routing Algorithms",       status: "notes-only"       as TopicStatus },
    ],
  },
];

// ─── Helper: derive a status for a topic (mocked — adapt when API returns it) ─

function deriveStatus(index: number): TopicStatus {
  const statuses: TopicStatus[] = ["study-ready", "mindmap-ready", "has-explanations", "notes-only"];
  return statuses[index % statuses.length];
}

// ─── Dashboard Page ────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [subjects, setSubjects] = useState(DUMMY_SUBJECTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [rawSubjects, rawTopics] = await Promise.all([
        listSubjects(),
        listTopics(),
      ]);

      if (rawSubjects.length === 0) {
        // Backend connected but empty — keep dummy data for demo
        setLoading(false);
        return;
      }

      const merged = rawSubjects.map((s) => {
        const subjectTopics = rawTopics
          .filter((t) => t.subject_id === s.id)
          .map((t, i) => ({
            id: t.id,
            title: t.title,
            status: deriveStatus(i),
          }));
        return {
          id: s.id,
          name: s.name,
          code: s.code,
          courseId: s.code,
          description: s.description ?? "",
          created_at: s.created_at,
          topics: subjectTopics,
        };
      });

      setSubjects(merged);
    } catch {
      // Backend not reachable — fallback to dummy data silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalTopics  = subjects.reduce((n, s) => n + s.topics.length, 0);
  const readyTopics  = subjects.reduce((n, s) => n + s.topics.filter((t) => t.status === "study-ready").length, 0);

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  };

  return (
    <AppShell
      crumbs={[{ label: "Dashboard" }]}
      showAddSubject
      showAddTopic
    >
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: "2rem" }}
      >
        <h1
          className="text-display"
          style={{ marginBottom: "4px" }}
        >
          Dashboard
        </h1>
        <p style={{ fontSize: "13px", color: "var(--color-text-faint)" }}>
          {loading ? "Loading your study data…" : `${subjects.length} subjects · ${totalTopics} topics · ${readyTopics} study-ready`}
        </p>
      </motion.div>

      {/* Stats row */}
      <div style={{ marginBottom: "2rem" }}>
        <StatsRow
          subjectCount={subjects.length}
          topicCount={totalTopics}
          readyCount={readyTopics}
          sessionCount={3}
        />
      </div>

      {/* Section label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <p
          style={{
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: "var(--color-text-base)",
          }}
        >
          Subjects
        </p>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.04em",
            padding: "2px 8px",
            borderRadius: "9999px",
            background: "var(--color-surface-2)",
            color: "var(--color-text-faint)",
            border: "1px solid var(--color-border)",
          }}
        >
          {subjects.length}
        </span>
      </motion.div>

      {/* Subjects grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {subjects.map((subject, i) => (
          <SubjectCard
            key={subject.id}
            id={subject.id}
            code={subject.code}
            courseId={subject.courseId}
            name={subject.name}
            description={subject.description}
            topics={subject.topics}
            delay={i * 0.07}
          />
        ))}
      </motion.div>

      {/* Bottom grid: progress + quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: "1rem",
          alignItems: "start",
        }}
      >
        <ProgressPanel />
        <QuickActions />
      </motion.div>
    </AppShell>
  );
}
