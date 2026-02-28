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
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-72 flex-col glass-surface bg-nexus-surface/80 transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <span className="text-sm font-semibold text-nexus-text">Conversations</span>
          <button
            onClick={onNew}
            className="group flex items-center gap-1.5 rounded-lg bg-gradient-accent px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:shadow-glow-sm hover:brightness-110 active:scale-95"
          >
            <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-3 py-12 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                <svg className="h-5 w-5 text-nexus-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <p className="text-xs text-nexus-muted">No conversations yet.</p>
              <p className="text-xs text-nexus-muted/60">Start chatting to create one!</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {conversations.map(convo => (
                <div
                  key={convo.id}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-200 cursor-pointer ${
                    convo.id === activeId
                      ? 'bg-nexus-accent/10 text-nexus-accent shadow-glow-sm border border-nexus-accent/20'
                      : 'text-nexus-muted hover:bg-white/[0.04] hover:text-nexus-text border border-transparent'
                  }`}
                  onClick={() => onSelect(convo.id)}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      convo.id === activeId ? 'bg-nexus-accent shadow-glow-sm' : 'bg-nexus-border'
                    }`} />
                    <span className="truncate">{convo.title}</span>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDelete(convo.id);
                    }}
                    className="ml-2 hidden shrink-0 rounded-lg p-1.5 text-nexus-muted transition-all duration-200 hover:bg-nexus-red/10 hover:text-nexus-red group-hover:block"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.06] px-4 py-3">
          <p className="text-xs text-nexus-muted">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
      </aside>
    </>
  );
}
