'use client';

import { useRef, useEffect } from 'react';
import { useChat } from '@/lib/use-chat';
import { ChatMessage } from './message';
import { ChatInput } from './chat-input';
import { ModeSelector } from './mode-selector';

export function ChatInterface() {
  const { messages, isStreaming, mode, setMode, sendMessage, stopStreaming, clearMessages } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Mode bar */}
      <div className="flex items-center justify-between border-b border-nexus-border px-6 py-2">
        <ModeSelector mode={mode} onModeChange={setMode} />
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="text-xs text-nexus-muted hover:text-nexus-text transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 ? (
            <EmptyState onSuggestionClick={sendMessage} />
          ) : (
            messages.map((msg, i) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
              />
            ))
          )}
        </div>
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} isStreaming={isStreaming} onStop={stopStreaming} />
    </div>
  );
}

function EmptyState({ onSuggestionClick }: { onSuggestionClick: (msg: string) => void }) {
  const suggestions = [
    "What's the current price of Bitcoin and Ethereum?",
    "What's the crypto market sentiment right now?",
    "Give me the latest crypto news",
    "Analyze the current state of the DeFi market",
  ];

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="mb-2 text-2xl font-bold">
        <span className="text-nexus-accent">N</span>exus
      </h2>
      <p className="mb-8 text-sm text-nexus-muted">
        Crypto & Finance Intelligence Engine
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {suggestions.map(s => (
          <button
            key={s}
            onClick={() => onSuggestionClick(s)}
            className="rounded-xl border border-nexus-border bg-nexus-surface px-4 py-3 text-left text-sm text-nexus-muted transition-colors hover:border-nexus-accent hover:text-nexus-text"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
