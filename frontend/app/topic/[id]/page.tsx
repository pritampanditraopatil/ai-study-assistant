"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/AppShell";
import { getMapByTopic, getTopic, type Mindmap, type MindmapNode, type Topic } from "@/lib/api";
import { ChevronRight, ChevronDown, Lightbulb, HelpCircle, MessageSquare, AlertTriangle } from "lucide-react";

// ─── Dummy mindmap data for offline preview ─────────────────────────────────

const DUMMY_MINDMAP: Mindmap = {
  id: "m1",
  topic_id: "t1",
  created_at: new Date().toISOString(),
  root: {
    id: "root",
    title: "Process Scheduling",
    summary: "How the OS decides which process runs on the CPU.",
    children: [
      {
        id: "n1",
        title: "Scheduling Goals",
        summary: "Maximize CPU utilization, throughput, and minimize wait time.",
        children: [
          { id: "n1a", title: "CPU Utilization",  summary: "Keep CPU as busy as possible.", children: [] },
          { id: "n1b", title: "Throughput",        summary: "Number of processes per unit time.", children: [] },
        ],
      },
      {
        id: "n2",
        title: "Scheduling Algorithms",
        summary: "Different strategies for selecting the next process.",
        children: [
          { id: "n2a", title: "FCFS", summary: "First-Come, First-Served — simple but can cause convoy effect.", children: [] },
          { id: "n2b", title: "SJF",  summary: "Shortest Job First — optimal average wait, but needs burst time.", children: [] },
          { id: "n2c", title: "Round Robin", summary: "Time-sliced preemptive scheduling — good for interactive systems.", children: [] },
        ],
      },
      {
        id: "n3",
        title: "Context Switching",
        summary: "Saving/restoring process state when switching the CPU.",
        children: [
          { id: "n3a", title: "PCB",         summary: "Process Control Block stores all state needed for context switch.", children: [] },
          { id: "n3b", title: "Overhead",    summary: "Context switching itself takes time — pure overhead.", children: [] },
        ],
      },
    ],
  },
};

const DUMMY_EXPLANATIONS: Record<string, { explanation: string; misconceptions: string[]; code?: string }> = {
  root:  { explanation: "Process scheduling is the OS subsystem that decides which runnable process gets CPU time next. It is fundamental to multitasking.", misconceptions: ["'Scheduling' and 'dispatching' are not the same — scheduling picks; dispatching switches."] },
  n1:    { explanation: "Schedulers optimize multiple metrics simultaneously. Throughput and CPU utilization can conflict with response time goals.", misconceptions: ["High CPU utilization alone doesn't mean the system is efficient."] },
  n2:    { explanation: "Each algorithm has trade-offs. FCFS is fair but slow; SJF minimizes wait but requires future knowledge; RR is balanced.", misconceptions: ["SJF is optimal in theory but impractical — burst times are unknown in advance."] },
  n2a:   { explanation: "FCFS is a non-preemptive algorithm where processes run to completion in arrival order. Simple to implement but the 'convoy effect' can dramatically increase average wait time.", misconceptions: ["FCFS is NOT fair to short jobs stuck behind long ones (convoy effect)."], code: "Queue<Process> ready = new LinkedList<>();\n// Each arriving process joins the back\nready.add(newProcess);\n// CPU always takes from the front\nProcess next = ready.poll();" },
  n2b:   { explanation: "SJF picks the process with the shortest estimated CPU burst. Provably optimal for minimizing average wait time in batch systems.", misconceptions: ["SJF can starve long processes indefinitely if short processes keep arriving."] },
  n2c:   { explanation: "Round Robin assigns a fixed time quantum to each process in a cyclic order. If a process doesn't finish within its quantum, it's preempted and rejoins the queue.", misconceptions: ["A larger time quantum doesn't always mean better performance — it approaches FCFS and increases wait time."], code: "// time_quantum = 4ms\nfor (Process p : readyQueue) {\n    run(p, time_quantum);\n    if (!p.isFinished()) readyQueue.add(p);\n}" },
  n3:    { explanation: "A context switch saves the complete CPU state (registers, PC, stack pointer) of the running process into its PCB, then restores another process's state.", misconceptions: ["Context switching itself produces zero useful work — it is pure overhead."] },
  n3a:   { explanation: "The PCB (Process Control Block) is the OS data structure representing a process. It stores PID, state, registers, memory maps, open files, and accounting info.", misconceptions: ["The PCB is NOT the process itself — it's the OS's record about the process."] },
  n3b:   { explanation: "Context switch overhead depends on hardware (register count), OS design, and TLB flushing. Modern CPUs reduce this via hardware thread support.", misconceptions: ["More context switches ≠ more concurrency. Too-short time quanta increase overhead."] },
  n1a:   { explanation: "CPU utilization measures what fraction of time the CPU spends doing actual work vs. waiting (idle). Target is 40–90% in practice.", misconceptions: ["100% utilization isn't ideal — it means no slack for bursts."] },
  n1b:   { explanation: "Throughput counts completed processes per unit time. Longer processes reduce throughput; preemption and shorter bursts increase it.", misconceptions: ["High throughput and low latency are often at odds — there's always a trade-off."] },
};

const DUMMY_QUESTIONS: Record<string, { question: string; answer: string; difficulty: "easy" | "medium" | "hard" }[]> = {
  root: [
    { question: "What is the primary job of a process scheduler?", answer: "To decide which runnable process gets CPU time next, optimizing metrics like throughput, wait time, and CPU utilization.", difficulty: "easy" },
    { question: "Why can't you achieve maximum CPU utilization AND minimum response time simultaneously?", answer: "These goals conflict: maximizing utilization favors long batch jobs; minimizing response time favors short interactive jobs. A real scheduler finds a balance.", difficulty: "hard" },
  ],
  n2a: [
    { question: "Explain the convoy effect in FCFS.", answer: "A long CPU-bound process at the front of the queue makes all shorter I/O-bound processes wait, creating a 'convoy' — drastically increasing average wait time.", difficulty: "medium" },
  ],
  n2c: [
    { question: "What happens when the time quantum in Round Robin is set very high?", answer: "It degenerates into FCFS — each process runs to completion before the scheduler steps in. Average wait time increases.", difficulty: "medium" },
    { question: "How would you choose the right time quantum for Round Robin?", answer: "It should be larger than 80% of CPU bursts (so most finish in one quantum) but small enough that interactive response feels instant — typically 10–100ms.", difficulty: "hard" },
  ],
};

// ─── Mindmap tree renderer ─────────────────────────────────────────────────

function MindmapNodeComponent({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: MindmapNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const isSelected = node.id === selectedId;

  return (
    <div style={{ marginLeft: depth > 0 ? "20px" : "0" }}>
      <div
        onClick={() => { onSelect(node.id); if (hasChildren) setExpanded(!expanded); }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "7px 10px",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "2px",
          background: isSelected ? "rgba(110,231,183,0.06)" : "transparent",
          border: `1px solid ${isSelected ? "rgba(110,231,183,0.2)" : "transparent"}`,
          transition: "all 180ms var(--ease-spring)",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          if (!isSelected) (e.currentTarget as HTMLElement).style.background = "var(--color-surface-2)";
        }}
        onMouseLeave={(e) => {
          if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        {hasChildren ? (
          expanded
            ? <ChevronDown size={12} style={{ color: "var(--color-text-faint)", flexShrink: 0 }} />
            : <ChevronRight size={12} style={{ color: "var(--color-text-faint)", flexShrink: 0 }} />
        ) : (
          <span style={{ width: "12px", flexShrink: 0 }} />
        )}
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontSize: depth === 0 ? "13px" : "12px",
            fontWeight: depth === 0 ? 600 : 500,
            color: isSelected ? "var(--color-accent)" : "var(--color-text-base)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            lineHeight: 1.3,
          }}>
            {node.title}
          </p>
          {depth === 0 && (
            <p style={{ fontSize: "11px", color: "var(--color-text-faint)", lineHeight: 1.3, marginTop: "1px" }}>
              {node.summary}
            </p>
          )}
        </div>
      </div>

      {hasChildren && expanded && (
        <div style={{ borderLeft: "1px solid var(--color-border)", marginLeft: "15px", paddingLeft: "4px" }}>
          {node.children.map((child) => (
            <MindmapNodeComponent
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Right panel tabs ──────────────────────────────────────────────────────

type PanelTab = "explanation" | "questions" | "chat";

function RightPanel({ nodeId, mindmap }: { nodeId: string | null; mindmap: Mindmap | null }) {
  const [tab, setTab] = useState<PanelTab>("explanation");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hello! I'm your AI tutor. Select a concept from the mind map and ask me anything about it." },
  ]);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());

  const explanation = nodeId ? DUMMY_EXPLANATIONS[nodeId] ?? DUMMY_EXPLANATIONS["root"] : null;
  const questions   = nodeId ? DUMMY_QUESTIONS[nodeId] ?? DUMMY_QUESTIONS["root"] ?? [] : [];

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [
      ...prev,
      { role: "user", text: msg },
      { role: "ai", text: `That's a great question about "${mindmap?.root.title}". Let me think through it with you. ${msg.toLowerCase().includes("why") ? "The reason is rooted in the core goals of the OS scheduler." : "The key here is understanding the trade-offs involved."} Would you like me to explain step by step?` },
    ]);
  };

  const tabs: { id: PanelTab; label: string; icon: React.ReactNode }[] = [
    { id: "explanation", label: "Explanation", icon: <Lightbulb size={13} /> },
    { id: "questions",   label: "Quiz",        icon: <HelpCircle size={13} /> },
    { id: "chat",        label: "Chat",        icon: <MessageSquare size={13} /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--color-surface)", borderRadius: "var(--radius-card)", border: "1px solid var(--color-border)", overflow: "hidden" }}>
      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", padding: "6px 6px 0" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "6px 14px",
              fontSize: "12px", fontWeight: 500,
              borderRadius: "6px 6px 0 0",
              border: "none", background: "transparent",
              color: tab === t.id ? "var(--color-text-base)" : "var(--color-text-faint)",
              borderBottom: tab === t.id ? "2px solid var(--color-accent)" : "2px solid transparent",
              cursor: "pointer", transition: "all 180ms var(--ease-spring)",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
        {!nodeId && (
          <p style={{ fontSize: "13px", color: "var(--color-text-faint)", textAlign: "center", paddingTop: "3rem" }}>
            ← Select a node from the mind map
          </p>
        )}

        {/* Explanation tab */}
        {nodeId && tab === "explanation" && explanation && (
          <motion.div key={`exp-${nodeId}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-base)", marginBottom: "12px", letterSpacing: "-0.01em" }}>
              {explanation.explanation.split(".")[0]}.
            </p>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
              {explanation.explanation}
            </p>

            {/* Misconceptions */}
            {explanation.misconceptions.length > 0 && (
              <div style={{ marginBottom: "1.25rem" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", color: "var(--color-text-faint)", marginBottom: "8px" }}>
                  COMMON MISCONCEPTIONS
                </p>
                {explanation.misconceptions.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", padding: "9px 12px", borderRadius: "8px", background: "var(--color-warn-faint)", border: "1px solid var(--color-warn-border)", marginBottom: "6px" }}>
                    <AlertTriangle size={13} style={{ color: "var(--color-warn)", flexShrink: 0, marginTop: "2px" }} />
                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)", lineHeight: 1.5 }}>{m}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Code example */}
            {explanation.code && (
              <div>
                <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", color: "var(--color-text-faint)", marginBottom: "8px" }}>CODE EXAMPLE</p>
                <pre style={{ fontSize: "12px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "12px", overflow: "auto", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                  <code>{explanation.code}</code>
                </pre>
              </div>
            )}
          </motion.div>
        )}

        {/* Questions tab */}
        {nodeId && tab === "questions" && (
          <motion.div key={`q-${nodeId}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {questions.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--color-text-faint)" }}>No questions for this node yet.</p>
            ) : (
              questions.map((q, i) => (
                <div key={i} style={{ marginBottom: "12px", padding: "14px", borderRadius: "8px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", padding: "2px 8px", borderRadius: "9999px", background: q.difficulty === "easy" ? "var(--color-accent-faint)" : q.difficulty === "medium" ? "var(--color-warn-faint)" : "rgba(239,68,68,0.08)", color: q.difficulty === "easy" ? "var(--color-accent)" : q.difficulty === "medium" ? "var(--color-warn)" : "#f87171", border: `1px solid ${q.difficulty === "easy" ? "var(--color-accent-border)" : q.difficulty === "medium" ? "var(--color-warn-border)" : "rgba(239,68,68,0.2)"}` }}>
                      {q.difficulty.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--color-text-base)", lineHeight: 1.5, marginBottom: "10px" }}>{q.question}</p>
                  {revealedAnswers.has(i) ? (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ padding: "10px 12px", borderRadius: "6px", background: "var(--color-accent-faint)", border: "1px solid var(--color-accent-border)" }}>
                      <p style={{ fontSize: "12px", color: "var(--color-text-muted)", lineHeight: 1.6 }}>{q.answer}</p>
                    </motion.div>
                  ) : (
                    <button onClick={() => setRevealedAnswers((prev) => new Set([...prev, i]))} style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-faint)", border: "1px solid var(--color-border)", background: "transparent", borderRadius: "6px", padding: "5px 12px", cursor: "pointer", transition: "all 180ms var(--ease-spring)" }}>
                      Show answer
                    </button>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Chat tab */}
        {tab === "chat" && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
              {chatMessages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: msg.role === "user" ? 12 : -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}
                  style={{ maxWidth: "85%", alignSelf: msg.role === "user" ? "flex-end" : "flex-start", padding: "9px 12px", borderRadius: msg.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px", background: msg.role === "user" ? "var(--color-text-base)" : "var(--color-surface-2)", border: msg.role === "user" ? "none" : "1px solid var(--color-border)", fontSize: "12px", color: msg.role === "user" ? "var(--color-bg)" : "var(--color-text-muted)", lineHeight: 1.5 }}
                >
                  {msg.text}
                </motion.div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChat()} placeholder="Ask about this topic…" style={{ flex: 1, height: "36px", padding: "0 12px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-surface-2)", color: "var(--color-text-base)", fontSize: "12px", outline: "none" }} />
              <button onClick={sendChat} style={{ height: "36px", padding: "0 14px", borderRadius: "8px", border: "none", background: "var(--color-text-base)", color: "var(--color-bg)", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Topic page ────────────────────────────────────────────────────────────

export default function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [mindmap, setMindmap] = useState<Mindmap | null>(null);
  const [topic, setTopic]     = useState<Topic | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMapByTopic(id).catch(() => DUMMY_MINDMAP),
      getTopic(id).catch(() => null),
    ]).then(([map, t]) => {
      setMindmap(map);
      setTopic(t);
      setSelectedId(map.root.id);
    }).finally(() => setLoading(false));
  }, [id]);

  const topicTitle = topic?.title ?? mindmap?.root.title ?? "Topic";

  return (
    <AppShell crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: topicTitle }]}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: "1.5rem" }}
      >
        <h1 className="text-display">{topicTitle}</h1>
        {mindmap && (
          <p style={{ fontSize: "12px", color: "var(--color-text-faint)", marginTop: "4px" }}>
            {mindmap.root.summary}
          </p>
        )}
      </motion.div>

      {/* 2-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1rem", alignItems: "start" }}>
        {/* Left: mind map */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
            padding: "1rem",
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
          }}
        >
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", color: "var(--color-text-faint)", marginBottom: "10px" }}>
            CONCEPT MAP
          </p>
          {mindmap ? (
            <MindmapNodeComponent
              node={mindmap.root}
              depth={0}
              selectedId={selectedId}
              onSelect={(nid) => setSelectedId(nid)}
            />
          ) : (
            <p style={{ fontSize: "12px", color: "var(--color-text-faint)" }}>
              {loading ? "Loading…" : "No concept map yet. Upload notes to generate one."}
            </p>
          )}
        </motion.div>

        {/* Right: panel */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          <RightPanel nodeId={selectedId} mindmap={mindmap} />
        </motion.div>
      </div>
    </AppShell>
  );
}
