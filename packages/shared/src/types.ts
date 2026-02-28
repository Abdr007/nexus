// --- Intent ---
export interface Intent {
  needsRealtime: boolean;
  needsTools: boolean;
  toolHints: ToolHint[];
  complexity: 'low' | 'medium' | 'high';
}

export type ToolHint = 'price' | 'market' | 'news' | 'defi' | 'analysis' | 'fear' | 'portfolio' | 'search';

// --- Tools ---
export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  timeout: number;
  cacheTTL: number;
  execute: (params: ToolParams) => Promise<ToolResult>;
}

export interface ToolParams {
  query: string;
  symbol?: string;
  extras?: Record<string, string>;
}

export interface ToolResult {
  data: unknown;
  source: string;
  timestamp: number;
  latency_ms: number;
  cached: boolean;
}

// --- Memory ---
export interface MemoryEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  summary?: string;
}

export interface MemoryContext {
  shortTerm: string;
  longTerm: string;
}

// --- Chat ---
export interface ChatRequest {
  message: string;
  mode?: Mode;
  conversationId?: string;
}

export interface ChatEvent {
  type: 'token' | 'tool_start' | 'tool_result' | 'done' | 'error';
  content?: string;
  tool?: string;
  data?: unknown;
}

// --- Modes ---
export type Mode = 'analyst' | 'trader' | 'defi' | 'risk';

// --- Orchestrator ---
export interface PromptContext {
  systemPrompt: string;
  memoryContext: MemoryContext;
  toolResults: ToolResult[] | null;
  userMessage: string;
}

// --- Logging ---
export interface RequestLog {
  requestId: string;
  userId: string;
  mode: Mode;
  intent: Intent;
  modelUsed: string;
  modelLatencyMs: number;
  toolLatencyMs: number;
  memoryLatencyMs: number;
  totalLatencyMs: number;
  toolsUsed: string[];
  inputTokens: number;
  outputTokens: number;
  error: string | null;
  timestamp: string;
}
