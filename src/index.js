import { Client, GatewayIntentBits, Partials, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import express from 'express';
import embedRouter from './routes/embed.js';

import registerWelcomeEvent from './events/welcome.js';
import registerRulesPrompt from './events/apply.js';
import startCountdown from './events/countdown.js';
import config from '../config.json' with { type: "json" };

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

client.once('ready', () => {
    console.log(`✅ Bot online as ${client.user.tag}`);
    startCountdown(client);
    registerSlashCommands();
});

registerWelcomeEvent(client);
registerRulesPrompt(client);

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'beta_status') {
        // GitHub workflow status check
        const statusMessage = await getWorkflowStatus();
        await interaction.reply({ content: `Beta status: ${statusMessage}`, ephemeral: true });
    } else if (commandName === 'timeline') {
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('📅 Project Timeline')
            .setDescription('**Pre-Beta:** July 1st\n**Beta Launch:** July 15th\n**Official Release:** August 15th');
        await interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (commandName === 'about') {
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('About MITPA')
            .setDescription('MITPA is an open-source community focused on helping students prepare for admission to the Massachusetts Institute of Technology (MIT). It provides a platform for students worldwide to discuss study strategies, share experiences, and connect with like-minded individuals. The primary language of the community is English, and it aims to foster collaboration, knowledge exchange, and academic growth.');
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
});

client.on('messageCreate', async message => {
    if (message.channel.id === config.monitoredChannelId && !message.author.bot) {
        await message.delete();
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('⚠️ Notice')
            .setDescription('This channel <#1373096880288039045> only supports slash commands.');
        await message.author.send({ embeds: [embed] });
    }
});

function registerSlashCommands() {
    const commands = [
        new SlashCommandBuilder().setName('beta_status').setDescription('Check the beta status'),
        new SlashCommandBuilder().setName('timeline').setDescription('Show the project timeline'),
        new SlashCommandBuilder().setName('about').setDescription('Learn about the MITPA Beta Bot')
    ].map(command => command.toJSON());

    client.application.commands.set(commands);
}

async function getWorkflowStatus() {
    const url = `https://api.github.com/repos/MITPAcademy/bot-beta/actions/workflows/test.yml/runs?branch=main&per_page=1`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        if (!response.ok) {
            return `⚠️ Could not fetch workflow status (GitHub API error: ${response.status}).`;
        }

        const data = await response.json();
        const run = data.workflow_runs && data.workflow_runs[0];

        if (!run) {
            return '❌ No workflow run found for the main branch.';
        }

        if (run.conclusion === 'success') {
            return '✅ All tests passed in the latest workflow.';
        } else if (run.conclusion === 'failure') {
            return '❌ The latest workflow failed.';
        } else if (run.status === 'in_progress' || run.status === 'queued') {
            return `⏳ The latest workflow is currently ${run.status.replace('_', ' ')}.`;
        } else {
            return `⚠️ Latest workflow status: ${run.status}, conclusion: ${run.conclusion ?? 'N/A'}`;
        }
    } catch (error) {
        return `⚠️ Error fetching workflow status: ${error.message}`;
    }
}

const app = express();
app.use(express.json());
app.use('/embed', embedRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});

client.login(process.env.DISCORD_TOKEN);
