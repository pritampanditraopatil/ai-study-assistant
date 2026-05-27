'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  getMindmap,
  getSubject,
  getTopic,
  getTopics,
  type MindmapNode,
  type Subject,
  type Topic,
} from '@/lib/api';
import MindmapView from '@/components/MindmapView';
import ExplanationPanel from '@/components/ExplanationPanel';
import QuestionsPanel from '@/components/QuestionsPanel';
import ChatPanel from '@/components/ChatPanel';
import TopicSidebar from '@/components/TopicSidebar';

type TabId = 'explanation' | 'questions' | 'chat';
type TopicStatus = 'ready' | 'mindmap' | 'notes' | 'explanations';

interface TopicSidebarItem extends Topic {
  status?: TopicStatus;
  lastStudied?: string;
}

const STATUS_LABELS: Record<TopicStatus, string> = {
  ready: 'Mindmap + explanations',
  mindmap: 'Mindmap only',
  notes: 'Notes only',
  explanations: 'Mindmap + explanations',
};

const DUMMY_SUBJECT: Subject = {
  id: 'os-101',
  name: 'Operating Systems',
  code: 'CS301',
  created_at: '2026-01-15T10:00:00Z',
};

const DUMMY_TOPICS: TopicSidebarItem[] = [
  {
    id: 'topic-sched',
    subject_id: 'os-101',
    title: 'Process Scheduling',
    created_at: '2026-02-01T10:00:00Z',
    status: 'ready',
    lastStudied: '2 hours ago',
  },
  {
    id: 'topic-deadlock',
    subject_id: 'os-101',
    title: 'Deadlocks',
    created_at: '2026-02-02T10:00:00Z',
    status: 'mindmap',
    lastStudied: 'yesterday',
  },
  {
    id: 'topic-memory',
    subject_id: 'os-101',
    title: 'Memory Management',
    created_at: '2026-02-03T10:00:00Z',
    status: 'explanations',
    lastStudied: '3 days ago',
  },
  {
    id: 'topic-sync',
    subject_id: 'os-101',
    title: 'Synchronization',
    created_at: '2026-02-04T10:00:00Z',
    status: 'notes',
    lastStudied: 'last week',
  },
];

const DUMMY_MINDMAP: MindmapNode = {
  id: 'node-root',
  title: 'Process Scheduling',
  summary:
    'How the OS decides which process gets the CPU: algorithms, criteria, and trade-offs.',
  children: [
    {
      id: 'node-fcfs',
      title: 'FCFS (First Come First Served)',
      summary: 'Simple FIFO queue, non-preemptive, convoy effect risk.',
      children: [
        {
          id: 'node-fcfs-pros',
          title: 'Advantages',
          summary: 'Simple to implement, fair ordering, no starvation.',
          children: [],
        },
        {
          id: 'node-fcfs-cons',
          title: 'Disadvantages',
          summary: 'Convoy effect, poor average waiting time.',
          children: [],
        },
      ],
    },
    {
      id: 'node-sjf',
      title: 'Shortest Job First (SJF)',
      summary: 'Optimal average waiting time, but needs burst estimates.',
      children: [
        {
          id: 'node-sjf-preemptive',
          title: 'Preemptive SJF (SRTF)',
          summary: 'Switches to shorter jobs on arrival for better response.',
          children: [],
        },
        {
          id: 'node-sjf-estimation',
          title: 'Burst Time Estimation',
          summary: 'Use exponential averaging to predict bursts.',
          children: [],
        },
      ],
    },
    {
      id: 'node-rr',
      title: 'Round Robin (RR)',
      summary: 'Time-quantum based, good for interactive systems.',
      children: [
        {
          id: 'node-rr-quantum',
          title: 'Quantum Selection',
          summary: 'Balance context switching cost and response time.',
          children: [],
        },
      ],
    },
    {
      id: 'node-priority',
      title: 'Priority Scheduling',
      summary: 'CPU allocated by priority, aging prevents starvation.',
      children: [
        {
          id: 'node-priority-aging',
          title: 'Aging',
          summary: 'Increase priority over time to keep it fair.',
          children: [],
        },
      ],
    },
  ],
};

function withStatus(topics: Topic[]): TopicSidebarItem[] {
  return topics.map((topic, index) => {
    const fallback = DUMMY_TOPICS[index % DUMMY_TOPICS.length];
    return {
      ...topic,
      status: fallback.status,
      lastStudied: fallback.lastStudied,
    };
  });
}

function findNodeTitle(node: MindmapNode, nodeId: string): string | undefined {
  if (node.id === nodeId) return node.title;
  for (const child of node.children) {
    const found = findNodeTitle(child, nodeId);
    if (found) return found;
  }
  return undefined;
}

export default function TopicPage() {
  const params = useParams();
  const topicId = params.id as string;

  const [mindmap, setMindmap] = useState<MindmapNode>(DUMMY_MINDMAP);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-root');
  const [activeTab, setActiveTab] = useState<TabId>('explanation');
  const [topics, setTopics] = useState<TopicSidebarItem[]>(DUMMY_TOPICS);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [subject, setSubject] = useState<Subject | null>(DUMMY_SUBJECT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const topicData = await getTopic(topicId);
        if (!cancelled) setTopic(topicData);

        const [subjectData, topicsData, mindmapData] = await Promise.all([
          getSubject(topicData.subject_id),
          getTopics(topicData.subject_id),
          getMindmap(topicId),
        ]);

        if (!cancelled) {
          setSubject(subjectData);
          if (topicsData.length > 0) setTopics(withStatus(topicsData));
          if (mindmapData?.root) {
            setMindmap(mindmapData.root);
            setSelectedNodeId(mindmapData.root.id);
          }
        }
      } catch {
        if (!cancelled) {
          setTopics(DUMMY_TOPICS);
          setSubject(DUMMY_SUBJECT);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key === 'e') setActiveTab('explanation');
      if (key === 'q') setActiveTab('questions');
      if (key === 't') setActiveTab('chat');
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedNodeTitle = findNodeTitle(mindmap, selectedNodeId);
  const activeTopic = useMemo(
    () => topics.find((t) => t.id === topicId) || topics[0],
    [topics, topicId]
  );
  const statusLabel = activeTopic?.status ? STATUS_LABELS[activeTopic.status] : 'Mindmap ready';

  return (
    <>
      <nav className="navbar">
        <Link href="/" className="navbar-brand">
          <span className="brand-mark">SA</span>
          <span>AI Study Assistant</span>
        </Link>
        <div className="navbar-links">
          <Link href="/dashboard" className="navbar-link">
            Dashboard
          </Link>
          <Link href="/upload" className="navbar-link">
            Upload
          </Link>
        </div>
      </nav>

      <div className="container page-wrapper">
        <div className="topic-topbar">
          <div>
            <div className="breadcrumb">
              {subject?.name || 'Subject'} / {topic?.title || mindmap.title}
            </div>
            <div className="topic-title-row">
              <h1 className="page-title">{topic?.title || mindmap.title}</h1>
              <span className="status-pill status-pill-ready">{statusLabel}</span>
            </div>
            <p className="page-description">
              {topic?.description || mindmap.summary}
            </p>
          </div>
          <div className="topic-actions">
            <Link href="/dashboard" className="btn-ghost">
              Back to dashboard
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="workspace-grid">
            <div className="shimmer shimmer-block" style={{ minHeight: '500px' }} />
            <div className="shimmer shimmer-block" style={{ minHeight: '500px' }} />
            <div className="shimmer shimmer-block" style={{ minHeight: '500px' }} />
          </div>
        ) : (
          <div className="workspace-grid">
            <TopicSidebar
              topics={topics}
              activeTopicId={topic?.id || topicId}
              subjectName={subject?.name}
            />

            <div className="workspace-center panel">
              <div className="panel-header">
                <div className="panel-title">Concept map</div>
                <span className="badge badge-count">{countNodes(mindmap)} nodes</span>
              </div>
              <MindmapView
                mindmap={mindmap}
                selectedNodeId={selectedNodeId}
                onNodeSelect={setSelectedNodeId}
              />
            </div>

            <div className="workspace-right panel">
              <div className="panel-header">
                <div className="panel-title">Study tools</div>
                <span className="tab-hint">E / Q / T</span>
              </div>
              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'explanation' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('explanation')}
                >
                  Explain
                </button>
                <button
                  className={`tab ${activeTab === 'questions' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('questions')}
                >
                  Questions
                </button>
                <button
                  className={`tab ${activeTab === 'chat' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('chat')}
                >
                  Tutor
                </button>
              </div>
              <div className="panel-body panel-body-scroll">
                {activeTab === 'explanation' && (
                  <ExplanationPanel nodeId={selectedNodeId} topicId={topicId} />
                )}
                {activeTab === 'questions' && (
                  <QuestionsPanel nodeId={selectedNodeId} topicId={topicId} />
                )}
                {activeTab === 'chat' && (
                  <ChatPanel
                    topicId={topicId}
                    nodeId={selectedNodeId}
                    nodeTitle={selectedNodeTitle}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function countNodes(node: MindmapNode): number {
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
}