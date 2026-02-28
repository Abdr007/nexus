import { ChatInterface } from '@/components/chat/chat-interface';
import { UserMenu } from '@/components/auth/user-menu';

export default function Home() {
  return (
    <main className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-nexus-border px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-nexus-accent">N</span>exus
          </h1>
          <span className="text-xs text-nexus-muted border border-nexus-border px-2 py-0.5 rounded">
            Crypto Intelligence
          </span>
        </div>
        <UserMenu />
      </header>

      {/* Chat */}
      <ChatInterface />
    </main>
  );
}
