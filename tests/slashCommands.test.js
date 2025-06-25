import { describe, it, expect, vi } from 'vitest';
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

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'beta_status') {
        await interaction.reply({
            content: 'Beta status: All tests are running correctly.',
            ephemeral: true
        });
    } else if (interaction.commandName === 'timeline') {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('📅 Project Timeline')
                    .setDescription('Pre-Beta: July 1st\nBeta Launch: July 15th\nOfficial Release: August 15th')
            ]
        });
    } else if (interaction.commandName === 'about') {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('About MITPA Beta Bot')
                    .setDescription('MITPA Beta Bot is designed to welcome new members and provide a countdown to the official launch.')
            ]
        });
    }
});

describe('Slash Commands', () => {
    it('should respond to /beta_status command', async () => {
        const interaction = {
            isCommand: () => true,
            commandName: 'beta_status',
            reply: vi.fn()
        };

        await client.emit('interactionCreate', interaction);
        expect(interaction.reply).toHaveBeenCalledWith({ content: 'Beta status: All tests are running correctly.', ephemeral: true });
    });

    it('should respond to /timeline command', async () => {
        const interaction = {
            isCommand: () => true,
            commandName: 'timeline',
            reply: vi.fn()
        };

        await client.emit('interactionCreate', interaction);
        expect(interaction.reply).toHaveBeenCalled();
        const embed = interaction.reply.mock.calls[0][0].embeds[0];
        expect(embed.data.title).toBe('📅 Project Timeline');
        expect(embed.data.description).toContain('Pre-Beta: July 1st');
        expect(embed.data.description).toContain('Beta Launch: July 15th');
        expect(embed.data.description).toContain('Official Release: August 15th');
    });

    it('should respond to /about command', async () => {
        const interaction = {
            isCommand: () => true,
            commandName: 'about',
            reply: vi.fn()
        };

        await client.emit('interactionCreate', interaction);
        expect(interaction.reply).toHaveBeenCalled();
        const embed = interaction.reply.mock.calls[0][0].embeds[0];
        expect(embed.data.title).toBe('About MITPA Beta Bot');
        expect(embed.data.description).toBe('MITPA Beta Bot is designed to welcome new members and provide a countdown to the official launch.');
    });
});