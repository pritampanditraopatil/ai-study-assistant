const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/* ──────────────────────────────────────────────────────────── */
/*  Types                                                       */
/* ──────────────────────────────────────────────────────────── */

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

export interface Explanation {
  node_id: string;
  title: string;
  content: string;
  code_example?: string;
  misconceptions: { wrong: string; right: string }[];
}

export interface Question {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'conceptual' | 'comparison' | 'scenario' | 'code';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

/* ──────────────────────────────────────────────────────────── */
/*  Generic fetch wrapper                                       */
/* ──────────────────────────────────────────────────────────── */

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new ApiError(errorBody, response.status);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json();
}

/* ──────────────────────────────────────────────────────────── */
/*  Subject CRUD                                                */
/* ──────────────────────────────────────────────────────────── */

export async function getSubjects(): Promise<Subject[]> {
  return request<Subject[]>('/subjects');
}

export async function getSubject(id: string): Promise<Subject> {
  return request<Subject>(`/subjects/${id}`);
}

export async function createSubject(data: {
  name: string;
  code: string;
  description?: string;
}): Promise<Subject> {
  return request<Subject>('/subjects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/* ──────────────────────────────────────────────────────────── */
/*  Topic CRUD                                                  */
/* ──────────────────────────────────────────────────────────── */

export async function getTopics(subjectId: string): Promise<Topic[]> {
  return request<Topic[]>(`/subjects/${subjectId}/topics`);
}

export async function getTopic(id: string): Promise<Topic> {
  return request<Topic>(`/topics/${id}`);
}

export async function createTopic(data: {
  subject_id: string;
  title: string;
  description?: string;
}): Promise<Topic> {
  return request<Topic>('/topics', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/* ──────────────────────────────────────────────────────────── */
/*  Note Ingest                                                 */
/* ──────────────────────────────────────────────────────────── */

export async function ingestNote(data: {
  topic_id: string;
  raw_text: string;
}): Promise<Note> {
  return request<Note>('/notes/ingest', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/* ──────────────────────────────────────────────────────────── */
/*  Mindmap                                                     */
/* ──────────────────────────────────────────────────────────── */

export async function generateMindmap(topicId: string): Promise<Mindmap> {
  return request<Mindmap>(`/topics/${topicId}/mindmap/generate`, {
    method: 'POST',
  });
}

export async function getMindmap(topicId: string): Promise<Mindmap> {
  return request<Mindmap>(`/topics/${topicId}/mindmap`);
}

/* ──────────────────────────────────────────────────────────── */
/*  Explanation                                                 */
/* ──────────────────────────────────────────────────────────── */

export async function getExplanation(
  topicId: string,
  nodeId: string
): Promise<Explanation> {
  return request<Explanation>(`/topics/${topicId}/nodes/${nodeId}/explanation`);
}

/* ──────────────────────────────────────────────────────────── */
/*  Questions                                                   */
/* ──────────────────────────────────────────────────────────── */

export async function getQuestions(
  topicId: string,
  nodeId: string
): Promise<Question[]> {
  return request<Question[]>(`/topics/${topicId}/nodes/${nodeId}/questions`);
}

/* ──────────────────────────────────────────────────────────── */
/*  Chat                                                        */
/* ──────────────────────────────────────────────────────────── */

export async function sendChatMessage(data: {
  topic_id: string;
  node_id?: string;
  message: string;
}): Promise<{ reply: string }> {
  return request<{ reply: string }>('/chat', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
