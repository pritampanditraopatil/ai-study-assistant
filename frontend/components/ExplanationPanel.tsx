'use client';

import { useEffect, useMemo, useState } from 'react';
import { getExplanation, type Explanation } from '@/lib/api';

interface ExplanationPanelProps {
  nodeId?: string;
  topicId?: string;
}

const DUMMY_EXPLANATIONS: Record<string, Explanation> = {
  'node-root': {
    node_id: 'node-root',
    title: 'Process Scheduling',
    content:
      'Process scheduling is how an operating system decides which process gets CPU time. The scheduler picks a process from the ready queue and allocates the CPU to it.\n\nThe goal is to balance fairness, throughput, and response time. Different algorithms make different trade-offs, so the best choice depends on workload and system goals.',
    code_example: `// Round Robin scheduling example
function roundRobin(processes, quantum) {
  const queue = [...processes];
  let time = 0;

  while (queue.length > 0) {
    const proc = queue.shift();
    const execTime = Math.min(proc.burst, quantum);
    time += execTime;
    proc.burst -= execTime;

    if (proc.burst > 0) {
      queue.push(proc);
    }
  }
  return time;
}`,
    misconceptions: [
      {
        wrong: 'SJF is always the best scheduling algorithm.',
        right:
          'SJF minimizes average waiting time but needs burst estimates and can starve long jobs.',
      },
      {
        wrong: 'Preemptive and non-preemptive scheduling behave the same.',
        right:
          'Preemptive scheduling interrupts jobs for better response time; non-preemptive does not.',
      },
    ],
  },
  'node-fcfs': {
    node_id: 'node-fcfs',
    title: 'FCFS (First Come First Served)',
    content:
      'FCFS is the simplest scheduling algorithm. Processes are executed in the order they arrive. It is non-preemptive, so each process runs until it completes.\n\nIt is easy to implement, but it can cause long average waiting time because short processes may wait behind long ones.',
    code_example: `// FCFS scheduling
function fcfs(processes) {
  let time = 0;
  for (const p of processes) {
    p.waitTime = time - p.arrivalTime;
    time += p.burstTime;
    p.turnaroundTime = time - p.arrivalTime;
  }
}`,
    misconceptions: [
      {
        wrong: 'FCFS is unfair because it favors long processes.',
        right:
          'FCFS is fair in order, but its average wait time can be poor because of convoy effect.',
      },
    ],
  },
  'node-sjf': {
    node_id: 'node-sjf',
    title: 'Shortest Job First (SJF)',
    content:
      'SJF selects the process with the smallest CPU burst time. It offers the minimum average waiting time among non-preemptive algorithms.\n\nHowever, exact burst times are rarely known, so it relies on prediction, which can be inaccurate.',
    misconceptions: [
      {
        wrong: 'SJF can always be implemented perfectly.',
        right:
          'Exact CPU burst times are unknown in practice, so predictions can be wrong.',
      },
    ],
  },
};

const DUMMY_ANALOGIES: Record<string, string> = {
  'node-root': 'Think of the scheduler like a traffic signal deciding which lane gets to move next.',
  'node-fcfs': 'FCFS is like a single checkout line where the first person in line is always served next.',
  'node-sjf': 'SJF is like serving the shortest queue first to reduce average waiting time.',
  'node-rr': 'Round Robin is like time-boxed interviews where everyone gets a short slot in turns.',
};

export default function ExplanationPanel({ nodeId, topicId }: ExplanationPanelProps) {
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!nodeId) {
      setExplanation(null);
      return;
    }

    let cancelled = false;
    async function fetchExplanation() {
      setLoading(true);
      try {
        if (topicId) {
          const data = await getExplanation(topicId, nodeId);
          if (!cancelled) setExplanation(data);
        } else {
          throw new Error('No topic ID');
        }
      } catch {
        if (!cancelled) {
          setExplanation(DUMMY_EXPLANATIONS[nodeId] || DUMMY_EXPLANATIONS['node-root']);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchExplanation();
    return () => {
      cancelled = true;
    };
  }, [nodeId, topicId]);

  const analogy = useMemo(() => {
    if (!nodeId) return 'Select a node to see an analogy.';
    return DUMMY_ANALOGIES[nodeId] || 'Think of it as a system of queues managing limited time.';
  }, [nodeId]);

  if (!nodeId) {
    return (
      <div className="empty-state compact">
        <div className="empty-state-icon">Select a node</div>
        <p className="empty-state-text">
          Click a concept in the mindmap to read the explanation.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="panel-body">
        <div className="shimmer shimmer-line" style={{ width: '60%', height: '1.5rem' }} />
        <div className="shimmer shimmer-line" style={{ width: '100%', marginTop: 'var(--space-lg)' }} />
        <div className="shimmer shimmer-line" style={{ width: '90%' }} />
        <div className="shimmer shimmer-line" style={{ width: '95%' }} />
        <div className="shimmer shimmer-block" style={{ marginTop: 'var(--space-lg)' }} />
      </div>
    );
  }

  if (!explanation) return null;

  const misconceptions = explanation.misconceptions || [];

  return (
    <div className="explanation-content">
      <div className="explanation-section">
        <h3 className="section-heading">Simple explanation</h3>
        {explanation.content.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className="body-text">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="explanation-section">
        <h3 className="section-heading">Analogy</h3>
        <div className="analogy-card">{analogy}</div>
      </div>

      <div className="explanation-section">
        <h3 className="section-heading">Common mistakes</h3>
        {misconceptions.length === 0 ? (
          <p className="body-text">No common mistakes recorded yet.</p>
        ) : (
          <div className="mistake-list">
            {misconceptions.map((item, idx) => (
              <div key={idx} className="mistake-card">
                <span className="mistake-badge">Mistake</span>
                <p>{item.wrong}</p>
                <span className="mistake-badge success">Fix</span>
                <p>{item.right}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {explanation.code_example && (
        <div className="explanation-section">
          <h3 className="section-heading">Code example</h3>
          <pre>
            <code>{explanation.code_example}</code>
          </pre>
        </div>
      )}
    </div>
  );
}