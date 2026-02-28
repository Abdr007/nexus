import 'dotenv/config';
import { Bot, type Context } from 'grammy';
import { orchestrate } from '@nexus/orchestrator';
import { dispatchTools } from '@nexus/tools';
import type { Mode } from '@nexus/shared';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is required');
  process.exit(1);
}

const bot = new Bot(BOT_TOKEN);

// User mode preferences (in-memory for now)
const userModes = new Map<number, Mode>();

// /start command
bot.command('start', async (ctx) => {
  await ctx.reply(
    `*Welcome to Nexus* \\- Crypto Intelligence Bot\\!\n\n` +
    `Ask me anything about crypto markets\\. Try:\n` +
    `\\- "What's the price of Bitcoin?"\n` +
    `\\- "Market sentiment right now"\n` +
    `\\- "Latest crypto news"\n` +
    `\\- "Top DeFi protocols by TVL"\n` +
    `\\- "ETH gas fees"\n\n` +
    `*Commands:*\n` +
    `/price <token> \\- Get token price\n` +
    `/news \\- Latest crypto news\n` +
    `/sentiment \\- Fear & Greed Index\n` +
    `/gas \\- ETH gas tracker\n` +
    `/defi \\- Top DeFi protocols\n` +
    `/mode <analyst|trader|defi|risk> \\- Switch mode`,
    { parse_mode: 'MarkdownV2' }
  );
});

// /price command
bot.command('price', async (ctx) => {
  const token = ctx.match || 'bitcoin';
  await handleQuery(ctx, `What is the current price of ${token}?`);
});

// /news command
bot.command('news', async (ctx) => {
  await handleQuery(ctx, 'Give me the latest crypto news');
});

// /sentiment command
bot.command('sentiment', async (ctx) => {
  await handleQuery(ctx, 'What is the current market sentiment?');
});

// /gas command
bot.command('gas', async (ctx) => {
  await handleQuery(ctx, 'What are the current Ethereum gas fees?');
});

// /defi command
bot.command('defi', async (ctx) => {
  await handleQuery(ctx, 'What are the top DeFi protocols by TVL?');
});

// /mode command
bot.command('mode', async (ctx) => {
  const mode = ctx.match as Mode;
  const validModes: Mode[] = ['analyst', 'trader', 'defi', 'risk'];

  if (!validModes.includes(mode)) {
    await ctx.reply(`Valid modes: ${validModes.join(', ')}\nCurrent: ${userModes.get(ctx.from!.id) || 'analyst'}`);
    return;
  }

  userModes.set(ctx.from!.id, mode);
  await ctx.reply(`Mode switched to: ${mode}`);
});

// Handle all text messages
bot.on('message:text', async (ctx) => {
  await handleQuery(ctx, ctx.message.text);
});

async function handleQuery(ctx: Context, query: string) {
  const userId = `tg:${ctx.from!.id}`;
  const mode = userModes.get(ctx.from!.id) || 'analyst';

  // Send typing indicator
  await ctx.replyWithChatAction('typing');

  try {
    let fullResponse = '';
    const stream = orchestrate({ message: query, userId, mode });

    for await (const event of stream) {
      if (event.type === 'token' && event.content) {
        fullResponse += event.content;
      }
    }

    if (fullResponse) {
      // Telegram has a 4096 char limit per message
      const chunks = splitMessage(fullResponse, 4000);
      for (const chunk of chunks) {
        try {
          await ctx.reply(chunk, { parse_mode: 'Markdown' });
        } catch {
          // Fallback without markdown if parsing fails
          await ctx.reply(chunk);
        }
      }
    } else {
      await ctx.reply('Sorry, I couldn\'t generate a response. Please try again.');
    }
  } catch (err) {
    console.error('Bot error:', err);
    await ctx.reply('An error occurred. Please try again.');
  }
}

function splitMessage(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    // Try to split at a newline
    let splitIdx = remaining.lastIndexOf('\n', maxLen);
    if (splitIdx === -1 || splitIdx < maxLen / 2) {
      splitIdx = remaining.lastIndexOf(' ', maxLen);
    }
    if (splitIdx === -1) splitIdx = maxLen;

    chunks.push(remaining.slice(0, splitIdx));
    remaining = remaining.slice(splitIdx).trimStart();
  }

  return chunks;
}

// Start the bot
bot.start({
  onStart: () => console.log('Nexus Telegram bot is running!'),
});
