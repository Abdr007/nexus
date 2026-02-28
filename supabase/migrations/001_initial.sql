-- Enable pgvector extension (for Phase 2 long-term memory)
CREATE EXTENSION IF NOT EXISTS vector;

-- Request logs for observability
CREATE TABLE IF NOT EXISTS request_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  mode TEXT NOT NULL DEFAULT 'analyst',
  model_used TEXT,
  model_latency_ms INTEGER,
  tool_latency_ms INTEGER,
  memory_latency_ms INTEGER,
  total_latency_ms INTEGER,
  tools_used TEXT[] DEFAULT '{}',
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_request_logs_user ON request_logs(user_id);
CREATE INDEX idx_request_logs_created ON request_logs(created_at DESC);

-- Phase 2: Long-term memory table (created now for schema readiness)
CREATE TABLE IF NOT EXISTS memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(384),
  memory_type TEXT CHECK (memory_type IN ('preference', 'fact', 'portfolio', 'interaction')),
  importance FLOAT DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  access_count INTEGER DEFAULT 0
);

CREATE INDEX idx_memories_user ON memories(user_id);
