'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createSubject,
  createTopic,
  generateMindmap,
  getSubjects,
  ingestNote,
  type Subject,
} from '@/lib/api';

const FALLBACK_SUBJECTS: Subject[] = [
  { id: 'os-101', name: 'Operating Systems', code: 'CS301', created_at: '2026-01-15T10:00:00Z' },
  { id: 'dbms-101', name: 'Database Management', code: 'CS302', created_at: '2026-01-20T10:00:00Z' },
  { id: 'dsa-101', name: 'Data Structures & Algorithms', code: 'CS201', created_at: '2026-02-01T10:00:00Z' },
  { id: 'cn-101', name: 'Computer Networks', code: 'CS304', created_at: '2026-02-10T10:00:00Z' },
];

type ProcessingStep = 'idle' | 'ingesting' | 'generating' | 'done' | 'error';

export default function UploadPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>(FALLBACK_SUBJECTS);
  const [subjectMode, setSubjectMode] = useState<'existing' | 'new'>('existing');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [topicName, setTopicName] = useState('');
  const [notesText, setNotesText] = useState('');
  const [step, setStep] = useState<ProcessingStep>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadSubjects() {
      try {
        const data = await getSubjects();
        if (!cancelled && data.length > 0) setSubjects(data);
      } catch {
        // Keep fallback data in offline mode.
      }
    }
    loadSubjects();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const wordCount = useMemo(() => {
    const trimmed = notesText.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [notesText]);

  const qualityHint = useMemo(() => {
    if (wordCount === 0) {
      return { tone: 'muted', label: 'Paste notes to get instant feedback.' };
    }
    if (wordCount < 60) {
      return { tone: 'warn', label: 'Too short. Add definitions and key steps.' };
    }
    if (wordCount < 140) {
      return { tone: 'warn', label: 'Add one example or common mistake.' };
    }
    if (wordCount < 260) {
      return { tone: 'good', label: 'Good length. Add code or formulas if relevant.' };
    }
    return { tone: 'good', label: 'Strong input. You should get a detailed mindmap.' };
  }, [wordCount]);

  const canSubmit = useMemo(() => {
    const hasSubject =
      subjectMode === 'existing'
        ? Boolean(selectedSubject)
        : Boolean(newSubjectName.trim()) && Boolean(newSubjectCode.trim());
    return hasSubject && Boolean(topicName.trim()) && wordCount >= 20;
  }, [subjectMode, selectedSubject, newSubjectName, newSubjectCode, topicName, wordCount]);

  const processingMessage =
    step === 'ingesting'
      ? 'Finding key concepts and cleaning notes.'
      : step === 'generating'
      ? 'Building the mindmap and linking ideas.'
      : 'Preparing explanations and questions.';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setStep('ingesting');
    setErrorMsg('');

    try {
      let subjectId = selectedSubject;

      if (subjectMode === 'new') {
        const created = await createSubject({
          name: newSubjectName.trim(),
          code: newSubjectCode.trim(),
        });
        subjectId = created.id;
        setSubjects((prev) => [created, ...prev]);
      }

      const topic = await createTopic({
        subject_id: subjectId,
        title: topicName.trim(),
      });

      await ingestNote({
        topic_id: topic.id,
        raw_text: notesText,
      });

      setStep('generating');

      await generateMindmap(topic.id);

      setStep('done');
      setToast({ type: 'success', msg: 'Notes processed successfully.' });

      setTimeout(() => {
        router.push(`/topic/${topic.id}`);
      }, 1400);
    } catch (err) {
      setStep('error');
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setErrorMsg(message);
      setToast({ type: 'error', msg: 'Processing failed. Switching to demo topic.' });

      setTimeout(() => {
        setStep('idle');
        router.push('/topic/demo-topic');
      }, 1800);
    }
  }

  const stepIndex = step === 'ingesting' ? 0 : step === 'generating' ? 1 : step === 'done' ? 2 : 0;

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
          <Link href="/upload" className="navbar-link navbar-link-active">
            Upload
          </Link>
        </div>
      </nav>

      <div className="container page-wrapper">
        <Link href="/dashboard" className="back-link">
          Back to dashboard
        </Link>

        <div className="page-header">
          <div>
            <h1 className="page-title">Upload notes</h1>
            <p className="page-description">
              Paste notes and generate a full learning workspace in minutes.
            </p>
          </div>
        </div>

        <div className="progress-strip">
          {['Paste notes', 'Generate mindmap', 'Explain & questions'].map(
            (label, index) => (
              <div
                key={label}
                className={`progress-step ${index === 0 ? 'progress-step-active' : ''}`}
              >
                <span>{index + 1}</span>
                {label}
                {index === 2 && <em>coming next</em>}
              </div>
            )
          )}
        </div>

        <form onSubmit={handleSubmit} className="upload-layout">
          <div className="upload-panel">
            <div className="panel-header compact">
              <div>
                <h2>Setup</h2>
                <p>Select a subject, then name your topic.</p>
              </div>
            </div>

            <div className="panel-body">
              <div className="segmented">
                <button
                  type="button"
                  className={`segmented-btn ${subjectMode === 'existing' ? 'active' : ''}`}
                  onClick={() => setSubjectMode('existing')}
                  disabled={step !== 'idle'}
                >
                  Use existing
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${subjectMode === 'new' ? 'active' : ''}`}
                  onClick={() => setSubjectMode('new')}
                  disabled={step !== 'idle'}
                >
                  Create new
                </button>
              </div>

              {subjectMode === 'existing' ? (
                <div className="form-group">
                  <label className="form-label" htmlFor="subject">
                    Subject
                  </label>
                  <select
                    id="subject"
                    className="select"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    disabled={step !== 'idle'}
                  >
                    <option value="">Select a subject...</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="newSubject">
                      Subject name
                    </label>
                    <input
                      id="newSubject"
                      type="text"
                      className="input"
                      placeholder="Operating Systems"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      disabled={step !== 'idle'}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="newSubjectCode">
                      Subject code
                    </label>
                    <input
                      id="newSubjectCode"
                      type="text"
                      className="input"
                      placeholder="CS301"
                      value={newSubjectCode}
                      onChange={(e) => setNewSubjectCode(e.target.value)}
                      disabled={step !== 'idle'}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="topic">
                  Topic name
                </label>
                <input
                  id="topic"
                  type="text"
                  className="input"
                  placeholder="Process Scheduling"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  disabled={step !== 'idle'}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={!canSubmit || step !== 'idle'}
              >
                {step === 'idle' ? 'Generate workspace' : 'Processing...'}
              </button>

              {errorMsg && (
                <p className="form-error">{errorMsg}</p>
              )}
            </div>
          </div>

          <div className="upload-panel">
            <div className="panel-header compact">
              <div>
                <h2>Notes</h2>
                <p>Paste content, definitions, or code snippets.</p>
              </div>
              <div className="notes-meta">
                <span>{wordCount} words</span>
                <span>{notesText.length} chars</span>
              </div>
            </div>

            <div className="panel-body">
              <textarea
                id="notes"
                className="textarea"
                placeholder="Paste your OS notes on deadlocks here. Include:
- Conditions
- Detection algorithm
- Avoidance vs prevention
- A small example"
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                disabled={step !== 'idle'}
              />
              <div className={`quality-hint quality-hint-${qualityHint.tone}`}>
                {qualityHint.label}
              </div>
            </div>
          </div>
        </form>
      </div>

      {step !== 'idle' && step !== 'error' && (
        <div className="processing-overlay">
          <div className="processing-card">
            <div className="spinner" />
            <h3>Processing your notes</h3>
            <p>{processingMessage}</p>

            <div className="processing-steps">
              {['Mindmap', 'Explanations', 'Questions'].map((label, index) => {
                const isDone = index < stepIndex;
                const isActive = index === stepIndex;
                return (
                  <div
                    key={label}
                    className={`processing-step ${isActive ? 'processing-step-active' : ''} ${isDone ? 'processing-step-done' : ''}`}
                  >
                    <span className="step-indicator">
                      {isDone ? '✓' : index + 1}
                    </span>
                    {label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}