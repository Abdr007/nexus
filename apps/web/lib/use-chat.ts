'use client';

import { useState, useCallback, useRef } from 'react';
import type { Mode } from '@nexus/shared';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolData?: { tool: string; data: unknown }[];
  timestamp: number;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mode, setMode] = useState<Mode>('analyst');
  const abortRef = useRef<AbortController | null>(null);

  const sessionId = useRef(
    typeof window !== 'undefined'
      ? localStorage.getItem('nexus-session') || (() => {
          const id = crypto.randomUUID();
          localStorage.setItem('nexus-session', id);
          return id;
        })()
      : 'anonymous'
  );

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    const assistantId = crypto.randomUUID();
    const toolData: { tool: string; data: unknown }[] = [];

    setMessages(prev => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', toolData: [], timestamp: Date.now() },
    ]);

    try {
      abortRef.current = new AbortController();

      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId.current,
        },
        body: JSON.stringify({ message: content.trim(), mode }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === 'token') {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, content: m.content + event.content } : m
                )
              );
            } else if (event.type === 'tool_result') {
              toolData.push({ tool: event.tool, data: event.data });
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, toolData: [...toolData] } : m
                )
              );
            } else if (event.type === 'error') {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: m.content || event.content || 'An error occurred.' }
                    : m
                )
              );
            }
          } catch {
            // Skip malformed events
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: m.content || 'Failed to connect. Check your connection and try again.' }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [isStreaming, mode]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, setMessages, isStreaming, mode, setMode, sendMessage, stopStreaming, clearMessages };
}
