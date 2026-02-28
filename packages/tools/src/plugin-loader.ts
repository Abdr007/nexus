import type { ToolConfig, ToolParams, ToolResult } from '@nexus/shared';
import { log } from '@nexus/shared';

export interface PluginManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  endpoint: string;  // HTTP endpoint that handles tool calls
  timeout?: number;
  cacheTTL?: number;
  keywords: string[];  // Keywords that trigger this plugin
}

const plugins = new Map<string, PluginManifest>();

/**
 * Register an external plugin.
 * Plugins are HTTP endpoints that accept { query: string } and return { data: any }.
 */
export function registerPlugin(manifest: PluginManifest): ToolConfig {
  plugins.set(manifest.id, manifest);

  const tool: ToolConfig = {
    id: `plugin:${manifest.id}`,
    name: manifest.name,
    description: manifest.description,
    timeout: manifest.timeout || 5000,
    cacheTTL: manifest.cacheTTL || 0,
    execute: async (params: ToolParams): Promise<ToolResult> => {
      const start = Date.now();

      try {
        const res = await fetch(manifest.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: params.query, extras: params.extras }),
        });

        if (!res.ok) throw new Error(`Plugin ${manifest.id} returned ${res.status}`);
        const data = await res.json();

        return {
          data,
          source: `${manifest.name} (Plugin)`,
          timestamp: Date.now(),
          latency_ms: Date.now() - start,
          cached: false,
        };
      } catch (err) {
        log('error', `Plugin ${manifest.id} failed`, { error: (err as Error).message });
        throw err;
      }
    },
  };

  log('info', `Plugin registered: ${manifest.name} v${manifest.version}`);
  return tool;
}

export function getRegisteredPlugins(): PluginManifest[] {
  return Array.from(plugins.values());
}

export function unregisterPlugin(id: string): boolean {
  return plugins.delete(id);
}
