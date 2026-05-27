"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/components/AppShell";
import { listSubjects, listTopics, createTopic, ingestNote, generateMap, type Subject, type Topic } from "@/lib/api";
import { useEffect } from "react";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type Step = "idle" | "ingesting" | "generating" | "done" | "error";

export default function UploadPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [notesText, setNotesText] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    listSubjects().then(setSubjects).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      listTopics(selectedSubjectId).then(setTopics).catch(() => {});
    } else {
      setTopics([]);
    }
  }, [selectedSubjectId]);

  const filteredTopics = topics.filter((t) => t.subject_id === selectedSubjectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !notesText.trim()) return;

    setStep("ingesting");
    setErrorMsg("");
    try {
      // Resolve or create topic
      let topicId = selectedTopicId;
      if (!topicId && newTopicName.trim()) {
        const created = await createTopic({
          subject_id: selectedSubjectId,
          title: newTopicName.trim(),
        });
        topicId = created.id;
      }
      if (!topicId) throw new Error("Please select or create a topic.");

      await ingestNote({ topic_id: topicId, raw_text: notesText });
      setStep("generating");
      await generateMap(topicId);
      setStep("done");

      setTimeout(() => router.push(`/topic/${topicId}`), 1200);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStep("error");
    }
  };

  const isProcessing = step === "ingesting" || step === "generating";

  return (
    <AppShell crumbs={[{ label: "Upload Notes" }]}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ maxWidth: "640px" }}
      >
        <h1 className="text-display" style={{ marginBottom: "4px" }}>Upload Notes</h1>
        <p style={{ fontSize: "13px", color: "var(--color-text-faint)", marginBottom: "2rem" }}>
          Paste your lecture notes — we'll clean, process, and generate a concept map.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Subject */}
          <div>
            <label style={labelStyle}>Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => { setSelectedSubjectId(e.target.value); setSelectedTopicId(""); }}
              style={inputStyle}
              required
            >
              <option value="">Select a subject…</option>
              {subjects.length > 0
                ? subjects.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)
                : (
                  <>
                    <option value="s1">CS301 — Operating Systems</option>
                    <option value="s2">CS302 — Database Management</option>
                    <option value="s3">CS201 — Data Structures</option>
                    <option value="s4">CS304 — Computer Networks</option>
                  </>
                )}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label style={labelStyle}>Topic</label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              style={inputStyle}
              disabled={!selectedSubjectId}
            >
              <option value="">Select existing topic…</option>
              {filteredTopics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              <option value="__new__">+ Create new topic</option>
            </select>
          </div>

          {/* New topic name */}
          {selectedTopicId === "__new__" && (
            <div>
              <label style={labelStyle}>New Topic Name</label>
              <input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="e.g. Process Scheduling"
                style={inputStyle}
                required
              />
            </div>
          )}

          {/* Notes textarea */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Notes</label>
              <span style={{ fontSize: "11px", color: "var(--color-text-faint)" }}>
                {charCount.toLocaleString()} chars
              </span>
            </div>
            <div
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "10px",
                padding: "1px",
                transition: "border-color 180ms var(--ease-spring)",
              }}
              onFocusCapture={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-hover)";
              }}
              onBlurCapture={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
              }}
            >
              <textarea
                value={notesText}
                onChange={(e) => { setNotesText(e.target.value); setCharCount(e.target.value.length); }}
                placeholder={"Paste your lecture notes here…\n\nThe AI will:\n• Structure them into a concept map\n• Write plain-English explanations\n• Flag common misconceptions\n• Generate quiz questions"}
                rows={14}
                required
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  resize: "vertical",
                  fontSize: "13px",
                  color: "var(--color-text-base)",
                  lineHeight: 1.7,
                  fontFamily: "var(--font-sans)",
                }}
              />
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {step === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  fontSize: "12px",
                  color: "#f87171",
                }}
              >
                <AlertCircle size={14} />
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            disabled={isProcessing || !notesText.trim() || !selectedSubjectId}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              height: "40px",
              borderRadius: "8px",
              border: "none",
              background: "var(--color-text-base)",
              color: "var(--color-bg)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: isProcessing ? "not-allowed" : "pointer",
              opacity: (isProcessing || !notesText.trim() || !selectedSubjectId) ? 0.5 : 1,
              transition: "opacity 180ms var(--ease-spring)",
            }}
          >
            {step === "idle" && <><Upload size={14} /> Process Notes</>}
            {step === "ingesting" && <><Loader2 size={14} className="animate-spin" /> Ingesting notes…</>}
            {step === "generating" && <><Loader2 size={14} className="animate-spin" /> Generating concept map…</>}
            {step === "done" && <><CheckCircle2 size={14} /> Done! Redirecting…</>}
            {step === "error" && <><Upload size={14} /> Try Again</>}
          </button>
        </form>
      </motion.div>
    </AppShell>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.04em",
  color: "var(--color-text-faint)",
  textTransform: "uppercase",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "38px",
  padding: "0 12px",
  borderRadius: "8px",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  color: "var(--color-text-base)",
  fontSize: "13px",
  outline: "none",
  appearance: "none",
  transition: "border-color 180ms var(--ease-spring)",
};
