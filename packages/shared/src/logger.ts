import type { RequestLog } from './types';

export function createRequestLog(partial: Partial<RequestLog>): RequestLog {
  return {
    requestId: crypto.randomUUID(),
    userId: 'anonymous',
    mode: 'analyst',
    intent: { needsRealtime: false, needsTools: false, toolHints: [], complexity: 'low' },
    modelUsed: '',
    modelLatencyMs: 0,
    toolLatencyMs: 0,
    memoryLatencyMs: 0,
    totalLatencyMs: 0,
    toolsUsed: [],
    inputTokens: 0,
    outputTokens: 0,
    error: null,
    timestamp: new Date().toISOString(),
    ...partial,
  };
}

export function log(level: 'info' | 'warn' | 'error', message: string, data?: unknown) {
  const entry = {
    level,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}
