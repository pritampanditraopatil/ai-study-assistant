'use client';

import { useMemo, useState } from 'react';
import type { MindmapNode } from '@/lib/api';

interface MindmapViewProps {
  mindmap: MindmapNode;
  selectedNodeId?: string;
  onNodeSelect: (nodeId: string) => void;
}

interface TreeNodeProps {
  node: MindmapNode;
  depth: number;
  selectedNodeId?: string;
  onNodeSelect: (nodeId: string) => void;
}

function flattenNodes(node: MindmapNode, list: MindmapNode[] = []): MindmapNode[] {
  list.push(node);
  node.children.forEach((child) => flattenNodes(child, list));
  return list;
}

function getNodeBadge(node: MindmapNode, depth: number) {
  if (depth === 0) return { label: 'core', tone: 'chip-core' };
  const title = node.title.toLowerCase();
  if (title.includes('algorithm') || title.includes('scheduling')) {
    return { label: 'algorithm', tone: 'chip-algorithm' };
  }
  if (title.includes('example') || title.includes('case')) {
    return { label: 'example', tone: 'chip-example' };
  }
  if (title.includes('code') || title.includes('pseudocode')) {
    return { label: 'code', tone: 'chip-code' };
  }
  if (title.includes('advantages') || title.includes('disadvantages')) {
    return { label: 'note', tone: 'chip-note' };
  }
  return { label: 'concept', tone: 'chip-concept' };
}

function TreeNode({ node, depth, selectedNodeId, onNodeSelect }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = node.id === selectedNodeId;
  const badge = getNodeBadge(node, depth);

  return (
    <div className="mindmap-node-wrapper" style={{ paddingLeft: depth === 0 ? 0 : 'var(--space-lg)' }}>
      <div
        className={`mindmap-node ${isSelected ? 'mindmap-node-selected' : ''}`}
        onClick={() => onNodeSelect(node.id)}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasChildren ? expanded : undefined}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNodeSelect(node.id);
          }
        }}
      >
        <div className="mindmap-node-header">
          {hasChildren && (
            <button
              className="mindmap-toggle"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              aria-label={expanded ? 'Collapse node' : 'Expand node'}
            >
              {expanded ? '-' : '+'}
            </button>
          )}
          <div className="mindmap-node-content">
            <div className="mindmap-node-title">{node.title}</div>
            {node.summary && (
              <div className="mindmap-node-summary" title={node.summary}>
                {node.summary}
              </div>
            )}
          </div>
          <span className={`mindmap-node-chip ${badge.tone}`}>{badge.label}</span>
          {hasChildren && (
            <span className="badge badge-count">{node.children.length}</span>
          )}
        </div>
        {node.summary && <div className="mindmap-tooltip">{node.summary}</div>}
      </div>

      {hasChildren && expanded && (
        <div className="mindmap-children" role="group">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedNodeId={selectedNodeId}
              onNodeSelect={onNodeSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MindmapView({
  mindmap,
  selectedNodeId,
  onNodeSelect,
}: MindmapViewProps) {
  const nodeOrder = useMemo(() => flattenNodes(mindmap), [mindmap]);
  const selectedIndex = nodeOrder.findIndex((node) => node.id === selectedNodeId);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    if (selectedIndex === -1) return;

    const direction = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = (selectedIndex + direction + nodeOrder.length) % nodeOrder.length;
    onNodeSelect(nodeOrder[nextIndex].id);
  }

  return (
    <div className="mindmap-container" role="tree" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="mindmap-tree">
        <TreeNode
          node={mindmap}
          depth={0}
          selectedNodeId={selectedNodeId}
          onNodeSelect={onNodeSelect}
        />
      </div>
    </div>
  );
}