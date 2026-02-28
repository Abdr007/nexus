'use client';

import type { Mode } from '@nexus/shared';

const MODES: { id: Mode; label: string; icon: string }[] = [
  { id: 'analyst', label: 'Analyst', icon: 'A' },
  { id: 'trader', label: 'Trader', icon: 'T' },
  { id: 'defi', label: 'DeFi', icon: 'D' },
  { id: 'risk', label: 'Risk', icon: 'R' },
];

interface ModeSelectorProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {MODES.map(m => (
        <button
          key={m.id}
          onClick={() => onModeChange(m.id)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === m.id
              ? 'bg-nexus-accent text-white'
              : 'text-nexus-muted hover:bg-nexus-surface hover:text-nexus-text'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
