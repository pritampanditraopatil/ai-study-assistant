const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_at: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  title: string;
  description?: string;
  created_at: string;
  status?: "study-ready" | "mindmap-ready" | "has-explanations" | "notes-only";
}

export interface Note {
  id: string;
  topic_id: string;
  raw_text: string;
  cleaned_text?: string;
  version: number;
  created_at: string;
}

export interface MindmapNode {
  id: string;
  title: string;
  summary: string;
  children: MindmapNode[];
}

export interface Mindmap {
  id: string;
  topic_id: string;
  root: MindmapNode;
  created_at: string;
}

// ─── Generic fetch helper ────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Subjects ────────────────────────────────────────────────────────────

export const listSubjects = () =>
  apiFetch<Subject[]>("/api/subjects");

export const getSubject = (id: string) =>
  apiFetch<Subject>(`/api/subjects/${id}`);

export const createSubject = (data: { name: string; code: string; description?: string }) =>
  apiFetch<Subject>("/api/subjects", { method: "POST", body: JSON.stringify(data) });

export const updateSubject = (id: string, data: Partial<Subject>) =>
  apiFetch<Subject>(`/api/subjects/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteSubject = (id: string) =>
  apiFetch<void>(`/api/subjects/${id}`, { method: "DELETE" });

// ─── Topics ──────────────────────────────────────────────────────────────

export const listTopics = (subject_id?: string) =>
  apiFetch<Topic[]>(`/api/topics${subject_id ? `?subject_id=${subject_id}` : ""}`);

export const getTopic = (id: string) =>
  apiFetch<Topic>(`/api/topics/${id}`);

export const createTopic = (data: { subject_id: string; title: string; description?: string }) =>
  apiFetch<Topic>("/api/topics", { method: "POST", body: JSON.stringify(data) });

export const updateTopic = (id: string, data: Partial<Topic>) =>
  apiFetch<Topic>(`/api/topics/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteTopic = (id: string) =>
  apiFetch<void>(`/api/topics/${id}`, { method: "DELETE" });

// ─── Notes ───────────────────────────────────────────────────────────────

export const ingestNote = (data: { topic_id: string; raw_text: string }) =>
  apiFetch<Note>("/api/notes/ingest", { method: "POST", body: JSON.stringify(data) });

export const getNotesByTopic = (topic_id: string) =>
  apiFetch<Note[]>(`/api/notes?topic_id=${topic_id}`);

// ─── Mind Maps ────────────────────────────────────────────────────────────

export const generateMap = (topic_id: string) =>
  apiFetch<Mindmap>("/api/maps/generate", {
    method: "POST",
    body: JSON.stringify({ topic_id }),
  });

export const getMapByTopic = (topic_id: string) =>
  apiFetch<Mindmap>(`/api/maps/${topic_id}`);
