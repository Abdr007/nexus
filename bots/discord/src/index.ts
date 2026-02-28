import 'dotenv/config';
import {
  Client, GatewayIntentBits, REST, Routes,
  SlashCommandBuilder, EmbedBuilder,
  type ChatInputCommandInteraction, type Message,
} from 'discord.js';
import { orchestrate } from '@nexus/orchestrator';
import type { Mode } from '@nexus/shared';

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error('DISCORD_BOT_TOKEN and DISCORD_CLIENT_ID are required');
  process.exit(1);
}

// Slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask Nexus anything about crypto')
    .addStringOption(opt => opt.setName('query').setDescription('Your question').setRequired(true))
    .addStringOption(opt =>
      opt.setName('mode').setDescription('Analysis mode')
        .addChoices(
          { name: 'Analyst', value: 'analyst' },
          { name: 'Trader', value: 'trader' },
          { name: 'DeFi', value: 'defi' },
          { name: 'Risk', value: 'risk' },
        )
    ),
  new SlashCommandBuilder()
    .setName('price')
    .setDescription('Get crypto price')
    .addStringOption(opt => opt.setName('token').setDescription('Token name (e.g., bitcoin, eth)').setRequired(true)),
  new SlashCommandBuilder()
    .setName('sentiment')
    .setDescription('Get market sentiment (Fear & Greed Index)'),
  new SlashCommandBuilder()
    .setName('news')
    .setDescription('Get latest crypto news'),
  new SlashCommandBuilder()
    .setName('gas')
    .setDescription('Get current ETH gas fees'),
  new SlashCommandBuilder()
    .setName('defi')
    .setDescription('Get top DeFi protocols by TVL'),
].map(cmd => cmd.toJSON());

// Register commands
const rest = new REST().setToken(DISCORD_TOKEN);
(async () => {
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('Slash commands registered');
  } catch (err) {
    console.error('Failed to register commands:', err);
  }
})();

// Bot client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.on('ready', () => {
  console.log(`Nexus Discord bot is online as ${client.user!.tag}`);
});

// Handle slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const userId = `dc:${interaction.user.id}`;

  switch (interaction.commandName) {
    case 'ask': {
      const query = interaction.options.getString('query', true);
      const mode = (interaction.options.getString('mode') || 'analyst') as Mode;
      await handleInteraction(interaction, query, mode, userId);
      break;
    }
    case 'price': {
      const token = interaction.options.getString('token', true);
      await handleInteraction(interaction, `What is the current price of ${token}?`, 'analyst', userId);
      break;
    }
    case 'sentiment':
      await handleInteraction(interaction, 'What is the current market sentiment?', 'analyst', userId);
      break;
    case 'news':
      await handleInteraction(interaction, 'Give me the latest crypto news', 'analyst', userId);
      break;
    case 'gas':
      await handleInteraction(interaction, 'What are the current Ethereum gas fees?', 'trader', userId);
      break;
    case 'defi':
      await handleInteraction(interaction, 'What are the top DeFi protocols by TVL?', 'defi', userId);
      break;
  }
});

// Handle @mentions in messages
client.on('messageCreate', async (message: Message) => {
  if (message.author.bot) return;
  if (!message.mentions.has(client.user!.id)) return;

  const query = message.content.replace(/<@!?\d+>/g, '').trim();
  if (!query) return;

  const userId = `dc:${message.author.id}`;

  try {
    await message.channel.sendTyping();

    let fullResponse = '';
    const stream = orchestrate({ message: query, userId, mode: 'analyst' });

    for await (const event of stream) {
      if (event.type === 'token' && event.content) {
        fullResponse += event.content;
      }
    }

    if (fullResponse) {
      const chunks = splitMessage(fullResponse, 2000);
      for (const chunk of chunks) {
        await message.reply(chunk);
      }
    }
  } catch (err) {
    console.error('Message handler error:', err);
    await message.reply('An error occurred. Please try again.');
  }
});

async function handleInteraction(interaction: ChatInputCommandInteraction, query: string, mode: Mode, userId: string) {
  await interaction.deferReply();

  try {
    let fullResponse = '';
    const toolSummaries: string[] = [];
    const stream = orchestrate({ message: query, userId, mode });

    for await (const event of stream) {
      if (event.type === 'token' && event.content) {
        fullResponse += event.content;
      } else if (event.type === 'tool_result' && event.tool) {
        toolSummaries.push(event.tool);
      }
    }

    if (fullResponse) {
      const embed = new EmbedBuilder()
        .setColor(0x6366f1)
        .setAuthor({ name: `Nexus | ${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode` })
        .setDescription(fullResponse.slice(0, 4096))
        .setTimestamp();

      if (toolSummaries.length > 0) {
        embed.setFooter({ text: `Data: ${toolSummaries.join(', ')}` });
      }

      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.editReply('Sorry, I couldn\'t generate a response.');
    }
  } catch (err) {
    console.error('Interaction error:', err);
    await interaction.editReply('An error occurred. Please try again.');
  }
}

function splitMessage(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) { chunks.push(remaining); break; }
    let idx = remaining.lastIndexOf('\n', maxLen);
    if (idx === -1 || idx < maxLen / 2) idx = remaining.lastIndexOf(' ', maxLen);
    if (idx === -1) idx = maxLen;
    chunks.push(remaining.slice(0, idx));
    remaining = remaining.slice(idx).trimStart();
  }

  return chunks;
}

client.login(DISCORD_TOKEN);
