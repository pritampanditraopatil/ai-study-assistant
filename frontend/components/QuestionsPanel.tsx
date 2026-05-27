'use client';

import { useEffect, useMemo, useState } from 'react';
import { getQuestions, type Question } from '@/lib/api';

interface QuestionsPanelProps {
  nodeId?: string;
  topicId?: string;
}

const DUMMY_QUESTIONS: Question[] = [
  {
    id: 'q1',
    question: 'What is the main disadvantage of FCFS scheduling?',
    answer:
      'The convoy effect: short processes wait behind long ones, causing poor average waiting time and lower throughput.',
    difficulty: 'easy',
    type: 'conceptual',
  },
  {
    id: 'q2',
    question: 'Compare preemptive SJF with non-preemptive SJF.',
    answer:
      'Preemptive SJF (SRTF) switches to shorter jobs as they arrive, improving response time. Non-preemptive SJF is simpler but slower to react to new short jobs.',
    difficulty: 'medium',
    type: 'comparison',
  },
  {
    id: 'q3',
    question:
      'A Round Robin scheduler uses quantum = 4ms. P1=5ms, P2=3ms, P3=8ms. What is the average waiting time?',
    answer:
      'Order: P1(4), P2(3), P3(4), P1(1), P3(4).\nWaiting: P1=7, P2=4, P3=8.\nAverage = (7 + 4 + 8) / 3 = 6.33ms.',
    difficulty: 'hard',
    type: 'scenario',
  },
];

export default function QuestionsPanel({ nodeId, topicId }: QuestionsPanelProps) {
  const [questions, setQuestions] = useState<Question[]>(DUMMY_QUESTIONS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!nodeId || !topicId) {
      setQuestions(DUMMY_QUESTIONS);
      return;
    }

    let cancelled = false;
    async function fetchQuestions() {
      setLoading(true);
      try {
        const data = await getQuestions(topicId, nodeId);
        if (!cancelled && data.length > 0) setQuestions(data);
        if (!cancelled && data.length === 0) setQuestions(DUMMY_QUESTIONS);
      } catch {
        if (!cancelled) setQuestions(DUMMY_QUESTIONS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchQuestions();
    return () => {
      cancelled = true;
    };
  }, [nodeId, topicId]);

  useEffect(() => {
    setCurrentIdx(0);
    setFlipped(false);
  }, [questions]);

  const current = questions[currentIdx];

  const difficultyClass =
    current?.difficulty === 'easy'
      ? 'badge-easy'
      : current?.difficulty === 'medium'
      ? 'badge-medium'
      : 'badge-hard';

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return ((currentIdx + 1) / questions.length) * 100;
  }, [currentIdx, questions.length]);

  if (!nodeId) {
    return (
      <div className="empty-state compact">
        <div className="empty-state-icon">Select a node</div>
        <p className="empty-state-text">Pick a concept to see practice questions.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="panel-body">
        <div className="shimmer shimmer-line" style={{ width: '70%' }} />
        <div className="shimmer shimmer-line" style={{ width: '100%' }} />
        <div className="shimmer shimmer-block" style={{ marginTop: 'var(--space-lg)' }} />
      </div>
    );
  }

  if (!current) return null;

  function goNext() {
    setFlipped(false);
    setCurrentIdx((prev) => (prev + 1) % questions.length);
  }

  function goPrev() {
    setFlipped(false);
    setCurrentIdx((prev) => (prev - 1 + questions.length) % questions.length);
  }

  return (
    <div className="questions-panel">
      <div className="question-progress-row">
        <span className="question-progress">
          Question {currentIdx + 1} of {questions.length}
        </span>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className={`flashcard ${flipped ? 'flashcard-flipped' : ''}`}>
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <div className="question-meta">
              <span className={`badge ${difficultyClass}`}>{current.difficulty}</span>
              <span className="badge badge-type">{current.type}</span>
            </div>
            <p className="question-text">{current.question}</p>
            <button className="btn-secondary" onClick={() => setFlipped(true)}>
              Show answer
            </button>
          </div>
          <div className="flashcard-back">
            <div className="question-meta">
              <span className={`badge ${difficultyClass}`}>{current.difficulty}</span>
              <span className="badge badge-type">Answer</span>
            </div>
            {current.answer.includes('\n') ? (
              <pre>
                <code>{current.answer}</code>
              </pre>
            ) : (
              <p className="body-text">{current.answer}</p>
            )}
            <button className="btn-secondary" onClick={() => setFlipped(false)}>
              Hide answer
            </button>
          </div>
        </div>
      </div>

      <div className="question-nav">
        <button className="btn-ghost" onClick={goPrev}>
          Previous
        </button>
        <div className="question-dots">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIdx(idx);
                setFlipped(false);
              }}
              className={`question-dot ${idx === currentIdx ? 'active' : ''}`}
              aria-label={`Go to question ${idx + 1}`}
            />
          ))}
        </div>
        <button className="btn-ghost" onClick={goNext}>
          Next
        </button>
      </div>
    </div>
  );
}