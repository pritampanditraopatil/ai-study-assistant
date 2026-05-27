'use client';

import { useEffect, useRef, useState } from 'react';
import { sendChatMessage, type ChatMessage } from '@/lib/api';

interface ChatPanelProps {
  topicId: string;
  nodeId?: string;
  nodeTitle?: string;
}

const CANNED_RESPONSES = [
  'The key trade-off is between throughput and response time. Interactive systems favor response time, batch systems favor throughput.',
  'The ready queue contains processes waiting for CPU, while the wait queue contains processes waiting on I/O or events.',
  'Context switching is overhead: saving state, loading registers, and switching memory mappings.',
  'Priority inversion happens when a low-priority process holds a resource needed by a high-priority one. Priority inheritance helps.',
  'Multilevel feedback queues help when burst times are unknown by moving CPU-bound jobs to lower-priority queues.',
];

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function ChatPanel({ topicId, nodeId, nodeTitle }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: `Hi. I can help with ${nodeTitle || 'this topic'}. Ask me anything.`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'ai',
        content: `Hi. I can help with ${nodeTitle || 'this topic'}. Ask me anything.`,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [nodeId, nodeTitle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isThinking) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await sendChatMessage({
        topic_id: topicId,
        node_id: nodeId,
        message: text,
      });

      const aiMessage: ChatMessage = {
        id: generateId(),
        role: 'ai',
        content: response.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      const aiMessage: ChatMessage = {
        id: generateId(),
        role: 'ai',
        content: CANNED_RESPONSES[messages.length % CANNED_RESPONSES.length],
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsThinking(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-context">
        Node: {nodeTitle || 'General'}
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}
          >
            {msg.content}
          </div>
        ))}

        {isThinking && (
          <div className="typing-indicator">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-bar">
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder="Ask a question"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isThinking}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!input.trim() || isThinking}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
}