import type { ToolResult, Mode } from '@nexus/shared';

/**
 * Generates a structured response from tool data without an LLM.
 * Used when no GROQ_API_KEY is configured (demo mode).
 */
export function generateFallbackResponse(
  message: string,
  toolResults: ToolResult[] | null,
  mode: Mode
): string {
  const parts: string[] = [];
  parts.push(`**[Demo Mode — No LLM key configured]**\n`);
  parts.push(`> Add your free Groq API key to \`.env.local\` for full AI responses.\n`);

  if (!toolResults || toolResults.length === 0) {
    parts.push(`I received your message: "${message}"\n`);
    parts.push(`In full mode (with Groq API key), I would analyze this using the **${mode}** perspective with AI-powered reasoning.\n`);
    parts.push(`**To activate full mode:**`);
    parts.push(`1. Go to [console.groq.com](https://console.groq.com)`);
    parts.push(`2. Sign up (free, no credit card)`);
    parts.push(`3. Create an API key`);
    parts.push(`4. Add it to \`apps/web/.env.local\` as \`GROQ_API_KEY=gsk_...\``);
    parts.push(`5. Restart the dev server`);
    return parts.join('\n');
  }

  parts.push(`Here's the **live data** I fetched for your query:\n`);

  for (const result of toolResults) {
    parts.push(`### ${result.source}`);
    parts.push(`*Fetched in ${result.latency_ms}ms*\n`);

    if (result.source === 'CoinGecko') {
      const prices = result.data as Record<string, { usd: number; usd_24h_change?: number; usd_market_cap?: number }>;
      for (const [coin, info] of Object.entries(prices)) {
        const change = info.usd_24h_change;
        const changeStr = change !== undefined
          ? ` (${change >= 0 ? '+' : ''}${change.toFixed(2)}% 24h)`
          : '';
        const mcap = info.usd_market_cap
          ? ` | MCap: $${(info.usd_market_cap / 1e9).toFixed(1)}B`
          : '';
        parts.push(`- **${coin.charAt(0).toUpperCase() + coin.slice(1)}**: $${info.usd.toLocaleString()}${changeStr}${mcap}`);
      }
      parts.push('');
    } else if (result.source === 'Alternative.me Fear & Greed Index') {
      const fg = result.data as { value: number; label: string; description: string };
      parts.push(`- **Score**: ${fg.value}/100`);
      parts.push(`- **Label**: ${fg.label}`);
      parts.push(`- **Analysis**: ${fg.description}`);
      parts.push('');
    } else if (result.source === 'CryptoCompare') {
      const news = result.data as { articles: { title: string; source: string; url: string }[] };
      if (news.articles) {
        for (const article of news.articles.slice(0, 5)) {
          parts.push(`- **${article.title}** *(${article.source})*`);
        }
        parts.push('');
      }
    } else {
      parts.push('```json');
      parts.push(JSON.stringify(result.data, null, 2));
      parts.push('```\n');
    }
  }

  parts.push(`---\n*With a Groq API key, Nexus would provide AI analysis of this data in **${mode} mode**.*`);

  return parts.join('\n');
}
