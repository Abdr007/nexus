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
        <header className="glass-surface flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-nexus-muted transition-all duration-200 hover:bg-white/[0.06] hover:text-nexus-text lg:hidden"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-gradient">N</span>exus
            </h1>
            <span className="badge-accent hidden sm:inline-flex">
              Crypto Intelligence
            </span>
          </div>
          <UserMenu />
        </header>

        {/* Mode bar */}
        <div className="flex items-center justify-between border-b border-white/[0.04] px-4 py-2">
          <ModeSelector mode={mode} onModeChange={setMode} />
          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-nexus-muted transition-all duration-200 hover:bg-white/[0.06] hover:text-nexus-text"
            >
              <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
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

const SUGGESTION_ICONS = [
  // Bitcoin price
  <svg key="btc" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  // Sentiment
  <svg key="sent" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-1.5 3 3 3-1.5 3 4.5" /></svg>,
  // News
  <svg key="news" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5" /></svg>,
  // DeFi
  <svg key="defi" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>,
  // Gas
  <svg key="gas" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" /></svg>,
  // Risk
  <svg key="risk" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
];

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
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      {/* Logo */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-nexus-accent/20 blur-2xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-accent shadow-glow">
          <span className="text-2xl font-bold text-white">N</span>
        </div>
      </div>

      <h2 className="mb-1 text-2xl font-bold text-nexus-text-bright">
        Nexus
      </h2>
      <p className="mb-10 text-sm text-nexus-muted">Crypto & Finance Intelligence Engine</p>

      <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((s, i) => (
          <button
            key={s}
            onClick={() => onSuggestionClick(s)}
            className={`group glass-card-sm flex items-start gap-3 px-4 py-3.5 text-left text-sm text-nexus-muted
                       transition-all duration-200 hover:border-nexus-accent/30 hover:text-nexus-text hover:shadow-glow-sm hover:scale-[1.02]
                       animate-slide-up opacity-0 fill-mode-forwards stagger-${i + 1}`}
            style={{ animationFillMode: 'forwards' }}
          >
            <span className="mt-0.5 shrink-0 text-nexus-accent/60 transition-colors duration-200 group-hover:text-nexus-accent">
              {SUGGESTION_ICONS[i]}
            </span>
            <span>{s}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
