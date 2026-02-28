'use client';

import ReactMarkdown from 'react-markdown';
import type { Message } from '@/lib/use-chat';

function ToolDataCard({ tool, data }: { tool: string; data: unknown }) {
  return (
    <div className="my-2 rounded-lg border border-nexus-border bg-nexus-bg p-3 text-xs">
      <div className="mb-1 font-semibold text-nexus-accent">{tool}</div>
      <pre className="overflow-x-auto whitespace-pre-wrap text-nexus-muted">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export function ChatMessage({ message, isStreaming }: { message: Message; isStreaming?: boolean }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-nexus-accent text-white'
            : 'bg-nexus-surface border border-nexus-border'
        }`}
      >
        {/* Tool data cards */}
        {!isUser && message.toolData && message.toolData.length > 0 && (
          <div className="mb-2">
            {message.toolData.map((td, i) => (
              <ToolDataCard key={i} tool={td.tool} data={td.data} />
            ))}
          </div>
        )}

        {/* Message content */}
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0">
            {message.content ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : isStreaming ? (
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-nexus-accent animate-pulse" />
                <div className="h-2 w-2 rounded-full bg-nexus-accent animate-pulse [animation-delay:0.2s]" />
                <div className="h-2 w-2 rounded-full bg-nexus-accent animate-pulse [animation-delay:0.4s]" />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
