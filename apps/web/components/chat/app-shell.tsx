'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useChat, type Message } from '@/lib/use-chat';
import { useConversations } from '@/lib/use-conversations';
import { Sidebar } from './sidebar';
import { ChatMessage } from './message';
import { ChatInput } from './chat-input';
import { ModeSelector } from './mode-selector';
import { UserMenu } from '@/components/auth/user-menu';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { messages, isStreaming, mode, setMode, sendMessage, stopStreaming, setMessages } = useChat();
  const {
    conversations, activeId, activeConversation,
    createConversation, updateConversation, deleteConversation, switchConversation,
  } = useConversations();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Sync messages to active conversation
  useEffect(() => {
    if (activeId && messages.length > 0) {
      updateConversation(activeId, messages);
    }
  }, [messages, activeId, updateConversation]);

  // Load messages when switching conversations
  useEffect(() => {
    if (activeConversation) {
      setMessages(activeConversation.messages);
    }
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback((content: string) => {
    if (!activeId) {
      createConversation();
    }
    sendMessage(content);
  }, [activeId, createConversation, sendMessage]);

  const handleNewChat = useCallback(() => {
    createConversation();
    setMessages([]);
    setSidebarOpen(false);
  }, [createConversation, setMessages]);

  const handleSelectConvo = useCallback((id: string) => {
    switchConversation(id);
    setSidebarOpen(false);
  }, [switchConversation]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        isOpen={sidebarOpen}
        onSelect={handleSelectConvo}
        onNew={handleNewChat}
        onDelete={deleteConversation}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-nexus-border px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-nexus-muted transition-colors hover:bg-nexus-surface hover:text-nexus-text lg:hidden"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-nexus-accent">N</span>exus
            </h1>
            <span className="hidden text-xs text-nexus-muted border border-nexus-border px-2 py-0.5 rounded sm:inline">
              Crypto Intelligence
            </span>
          </div>
          <UserMenu />
        </header>

        {/* Mode bar */}
        <div className="flex items-center justify-between border-b border-nexus-border px-4 py-2">
          <ModeSelector mode={mode} onModeChange={setMode} />
          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="text-xs text-nexus-muted hover:text-nexus-text transition-colors"
            >
              New Chat
            </button>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.length === 0 ? (
              <EmptyState onSuggestionClick={handleSend} />
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
        <ChatInput onSend={handleSend} isStreaming={isStreaming} onStop={stopStreaming} />
      </main>
    </div>
  );
}

function EmptyState({ onSuggestionClick }: { onSuggestionClick: (msg: string) => void }) {
  const suggestions = [
    "What's the current price of Bitcoin and Ethereum?",
    "What's the crypto market sentiment right now?",
    "Give me the latest crypto news",
    "What are the top DeFi protocols by TVL?",
    "What are the current ETH gas fees?",
    "Analyze the risk of investing in Solana",
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h2 className="mb-2 text-2xl font-bold">
        <span className="text-nexus-accent">N</span>exus
      </h2>
      <p className="mb-8 text-sm text-nexus-muted">Crypto & Finance Intelligence Engine</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
