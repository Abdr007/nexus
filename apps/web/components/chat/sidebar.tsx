'use client';

import type { Conversation } from '@/lib/use-conversations';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  isOpen: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function Sidebar({ conversations, activeId, isOpen, onSelect, onNew, onDelete, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-72 flex-col border-r border-nexus-border bg-nexus-surface transition-transform lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-nexus-border px-4 py-3">
          <span className="text-sm font-semibold text-nexus-text">Conversations</span>
          <button
            onClick={onNew}
            className="rounded-lg bg-nexus-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-nexus-accent-hover"
          >
            + New
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-nexus-muted">
              No conversations yet. Start chatting!
            </p>
          ) : (
            <div className="space-y-1">
              {conversations.map(convo => (
                <div
                  key={convo.id}
                  className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer ${
                    convo.id === activeId
                      ? 'bg-nexus-accent/10 text-nexus-accent'
                      : 'text-nexus-muted hover:bg-nexus-bg hover:text-nexus-text'
                  }`}
                  onClick={() => onSelect(convo.id)}
                >
                  <span className="truncate flex-1">{convo.title}</span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDelete(convo.id);
                    }}
                    className="ml-2 hidden rounded p-1 text-nexus-muted hover:text-nexus-red group-hover:block"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-nexus-border px-4 py-3">
          <p className="text-xs text-nexus-muted">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
      </aside>
    </>
  );
}
