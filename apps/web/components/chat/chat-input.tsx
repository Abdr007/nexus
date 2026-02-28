'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isStreaming: boolean;
  onStop: () => void;
}

export function ChatInput({ onSend, isStreaming, onStop }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isStreaming) textareaRef.current?.focus();
  }, [isStreaming]);

  const handleSubmit = () => {
    if (input.trim() && !isStreaming) {
      onSend(input);
      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  return (
    <div className="border-t border-nexus-border bg-nexus-surface px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask about crypto markets, prices, news..."
          rows={1}
          className="flex-1 resize-none rounded-xl border border-nexus-border bg-nexus-bg px-4 py-3 text-sm text-nexus-text placeholder:text-nexus-muted focus:border-nexus-accent focus:outline-none"
        />
        {isStreaming ? (
          <button
            onClick={onStop}
            className="rounded-xl bg-nexus-red px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="rounded-xl bg-nexus-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-nexus-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
