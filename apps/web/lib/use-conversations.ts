'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Message } from './use-chat';

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

const STORAGE_KEY = 'nexus-conversations';
const MAX_CONVERSATIONS = 50;

function loadFromStorage(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(convos: Conversation[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convos.slice(0, MAX_CONVERSATIONS)));
}

function generateTitle(messages: Message[]): string {
  const firstUser = messages.find(m => m.role === 'user');
  if (!firstUser) return 'New Chat';
  const text = firstUser.content;
  return text.length > 40 ? text.slice(0, 40) + '...' : text;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setConversations(loadFromStorage());
  }, []);

  const save = useCallback((convos: Conversation[]) => {
    setConversations(convos);
    saveToStorage(convos);
  }, []);

  const createConversation = useCallback((): string => {
    const id = crypto.randomUUID();
    const newConvo: Conversation = {
      id,
      title: 'New Chat',
      messages: [],
      updatedAt: Date.now(),
    };
    save([newConvo, ...conversations]);
    setActiveId(id);
    return id;
  }, [conversations, save]);

  const updateConversation = useCallback((id: string, messages: Message[]) => {
    const updated = conversations.map(c =>
      c.id === id
        ? { ...c, messages, title: c.title === 'New Chat' ? generateTitle(messages) : c.title, updatedAt: Date.now() }
        : c
    );
    // Sort by most recent
    updated.sort((a, b) => b.updatedAt - a.updatedAt);
    save(updated);
  }, [conversations, save]);

  const deleteConversation = useCallback((id: string) => {
    const filtered = conversations.filter(c => c.id !== id);
    save(filtered);
    if (activeId === id) {
      setActiveId(filtered[0]?.id || null);
    }
  }, [conversations, activeId, save]);

  const switchConversation = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const activeConversation = conversations.find(c => c.id === activeId) || null;

  return {
    conversations,
    activeId,
    activeConversation,
    createConversation,
    updateConversation,
    deleteConversation,
    switchConversation,
  };
}
