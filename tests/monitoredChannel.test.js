import { describe, it, expect, vi, beforeAll } from 'vitest';
import { Client, GatewayIntentBits, Partials, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

// Handler para ser testado
const MONITORED_CHANNEL_ID = 'YOUR_MONITORED_CHANNEL_ID';

client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author?.bot) return;

    // Apenas monitora o canal específico
    if (message.channel?.id === MONITORED_CHANNEL_ID) {
        await message.delete?.();
        if (message.author?.send) {
            await message.author.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('⚠️ Notice')
                        .setDescription('This channel only supports slash commands.')
                ]
            });
        }
    }
});

describe('Monitored Channel', () => {
    it('should delete regular messages and send embed', async () => {
        const message = {
            channel: { id: MONITORED_CHANNEL_ID },
            author: { bot: false, send: vi.fn() },
            delete: vi.fn()
        };

        await client.emit('messageCreate', message);
        expect(message.delete).toHaveBeenCalled();
        expect(message.author.send).toHaveBeenCalled();
        const embed = message.author.send.mock.calls[0][0].embeds[0];
        expect(embed.data.title).toBe('⚠️ Notice');
        expect(embed.data.description).toBe('This channel only supports slash commands.');
    });

    it('should not delete bot messages', async () => {
        const message = {
            channel: { id: MONITORED_CHANNEL_ID },
            author: { bot: true },
            delete: vi.fn()
        };

        await client.emit('messageCreate', message);
        expect(message.delete).not.toHaveBeenCalled();
    });

    it('should not delete messages in other channels', async () => {
        const message = {
            channel: { id: 'OTHER_CHANNEL_ID' },
            author: { bot: false },
            delete: vi.fn()
        };

        await client.emit('messageCreate', message);
        expect(message.delete).not.toHaveBeenCalled();
    });
});