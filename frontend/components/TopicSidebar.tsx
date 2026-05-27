'use client';

import Link from 'next/link';
import type { Topic } from '@/lib/api';

type TopicStatus = 'ready' | 'mindmap' | 'notes' | 'explanations';

interface TopicSidebarItem extends Topic {
  status?: TopicStatus;
  lastStudied?: string;
}

interface TopicSidebarProps {
  topics: TopicSidebarItem[];
  activeTopicId: string;
  subjectName?: string;
}

const STATUS_LABELS: Record<TopicStatus, string> = {
  ready: 'Study-ready',
  mindmap: 'Mindmap',
  notes: 'Notes only',
  explanations: 'Explanations',
};

export default function TopicSidebar({ topics, activeTopicId, subjectName }: TopicSidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">{subjectName || 'Topics'}</div>
        <div className="sidebar-subtitle">{topics.length} topics</div>
      </div>

      {topics.length === 0 ? (
        <div className="empty-state compact">
          <div className="empty-state-icon">No topics yet</div>
          <p className="empty-state-text">Add a topic to start learning.</p>
        </div>
      ) : (
        topics.map((topic) => {
          const isActive = topic.id === activeTopicId;
          return (
            <Link key={topic.id} href={`/topic/${topic.id}`} className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}>
              <div className="sidebar-item-main">
                <span className="sidebar-item-title">{topic.title}</span>
                {topic.lastStudied && (
                  <span className="sidebar-item-meta">{topic.lastStudied}</span>
                )}
              </div>
              {topic.status && (
                <span className={`topic-status topic-status-${topic.status}`}>
                  {STATUS_LABELS[topic.status]}
                </span>
              )}
            </Link>
          );
        })
      )}
    </aside>
  );
}