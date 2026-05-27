'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getSubjects, type Subject } from '@/lib/api';

type TopicStatus = 'ready' | 'mindmap' | 'notes' | 'explanations';

interface TopicPreview {
  id: string;
  title: string;
  status: TopicStatus;
}

interface SubjectCard extends Subject {
  icon: string;
  accent: string;
  topics: TopicPreview[];
}

const DUMMY_SUBJECT_CARDS: SubjectCard[] = [
  {
    id: 'os-101',
    name: 'Operating Systems',
    code: 'CS301',
    description:
      'Scheduling, memory management, synchronization, and file systems.',
    created_at: '2026-01-15T10:00:00Z',
    icon: 'OS',
    accent: 'linear-gradient(135deg, rgba(35, 199, 184, 0.2), rgba(58, 160, 255, 0.2))',
    topics: [
      { id: 'topic-sched', title: 'Process Scheduling', status: 'ready' },
      { id: 'topic-deadlock', title: 'Deadlocks', status: 'mindmap' },
      { id: 'topic-memory', title: 'Memory Management', status: 'explanations' },
    ],
  },
  {
    id: 'dbms-101',
    name: 'Database Management',
    code: 'CS302',
    description: 'SQL, normalization, transactions, and indexing.',
    created_at: '2026-01-20T10:00:00Z',
    icon: 'DB',
    accent: 'linear-gradient(135deg, rgba(245, 179, 77, 0.2), rgba(244, 114, 182, 0.15))',
    topics: [
      { id: 'topic-sql', title: 'SQL Joins', status: 'ready' },
      { id: 'topic-normal', title: 'Normalization', status: 'explanations' },
      { id: 'topic-index', title: 'B+ Tree Indexing', status: 'mindmap' },
    ],
  },
  {
    id: 'dsa-101',
    name: 'Data Structures & Algorithms',
    code: 'CS201',
    description: 'Graphs, DP, sorting, and complexity analysis.',
    created_at: '2026-02-01T10:00:00Z',
    icon: 'DSA',
    accent: 'linear-gradient(135deg, rgba(94, 234, 212, 0.2), rgba(96, 165, 250, 0.2))',
    topics: [
      { id: 'topic-graphs', title: 'Graph Traversal', status: 'ready' },
      { id: 'topic-dp', title: 'Dynamic Programming', status: 'notes' },
      { id: 'topic-sort', title: 'Sorting Analysis', status: 'explanations' },
    ],
  },
  {
    id: 'cn-101',
    name: 'Computer Networks',
    code: 'CS304',
    description: 'TCP/IP, routing, congestion control, and security.',
    created_at: '2026-02-10T10:00:00Z',
    icon: 'CN',
    accent: 'linear-gradient(135deg, rgba(129, 140, 248, 0.2), rgba(56, 189, 248, 0.18))',
    topics: [
      { id: 'topic-tcp', title: 'TCP Congestion', status: 'mindmap' },
      { id: 'topic-osi', title: 'OSI Model', status: 'ready' },
      { id: 'topic-dns', title: 'DNS & HTTP', status: 'notes' },
    ],
  },
];

const STATUS_LABELS: Record<TopicStatus, string> = {
  ready: 'Study-ready',
  mindmap: 'Mindmap ready',
  notes: 'Notes only',
  explanations: 'Has explanations',
};

function withUiMeta(subjects: Subject[]): SubjectCard[] {
  return subjects.map((subject, index) => {
    const fallback = DUMMY_SUBJECT_CARDS[index % DUMMY_SUBJECT_CARDS.length];
    return {
      ...subject,
      icon: fallback.icon,
      accent: fallback.accent,
      description: subject.description || fallback.description,
      topics: fallback.topics,
    };
  });
}

export default function DashboardPage() {
  const [subjects, setSubjects] = useState<SubjectCard[]>(DUMMY_SUBJECT_CARDS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchSubjects() {
      try {
        const data = await getSubjects();
        if (!cancelled && data.length > 0) {
          setSubjects(withUiMeta(data));
        }
      } catch {
        // Keep dummy data in offline mode.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchSubjects();
    return () => {
      cancelled = true;
    };
  }, []);

  const readyCount = useMemo(() => {
    return subjects.reduce(
      (sum, subject) => sum + subject.topics.filter((t) => t.status === 'ready').length,
      0
    );
  }, [subjects]);

  return (
    <>
      <nav className="navbar">
        <Link href="/" className="navbar-brand">
          <span className="brand-mark">SA</span>
          <span>AI Study Assistant</span>
        </Link>
        <div className="navbar-links">
          <Link href="/dashboard" className="navbar-link navbar-link-active">
            Dashboard
          </Link>
          <Link href="/upload" className="navbar-link">
            Upload
          </Link>
        </div>
      </nav>

      <div className="container page-wrapper">
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-description">
              Subjects, topics, and study readiness at a glance.
            </p>
          </div>
          <div className="dashboard-actions">
            <button className="btn-secondary" type="button">
              Add subject
            </button>
            <Link href="/upload" className="btn-primary">
              Add topic
            </Link>
          </div>
        </div>

        <section className="section-block">
          <div className="section-header">
            <h2 className="section-title">Subjects</h2>
            <span className="section-meta">
              {readyCount} topics are study-ready
            </span>
          </div>

          {loading ? (
            <div className="grid grid-auto">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="subject-card skeleton-card">
                  <div className="shimmer shimmer-line" style={{ width: '45%' }} />
                  <div className="shimmer shimmer-line" style={{ width: '70%' }} />
                  <div className="shimmer shimmer-line" style={{ width: '90%' }} />
                  <div className="shimmer shimmer-block" style={{ height: '120px' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-auto">
              {subjects.map((subject) => (
                <article key={subject.id} className="subject-card">
                  <div className="subject-card-header">
                    <div
                      className="subject-icon"
                      style={{ background: subject.accent }}
                    >
                      {subject.icon}
                    </div>
                    <div className="subject-card-title-group">
                      <span className="subject-card-code">{subject.code}</span>
                      <h3>{subject.name}</h3>
                    </div>
                    <span className="status-pill status-pill-ready">
                      {subject.topics.filter((t) => t.status === 'ready').length} ready
                    </span>
                  </div>
                  {subject.description && (
                    <p className="subject-card-description">{subject.description}</p>
                  )}
                  <div className="subject-topics">
                    {subject.topics.map((topic) => (
                      <Link
                        key={topic.id}
                        href={`/topic/${topic.id}`}
                        className="topic-row"
                      >
                        <span className="topic-title">{topic.title}</span>
                        <span
                          className={`topic-status topic-status-${topic.status}`}
                        >
                          {STATUS_LABELS[topic.status]}
                        </span>
                      </Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}