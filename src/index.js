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
import { checkDocsUpdates } from './watcher/docWatcher.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

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

const ALLOWED_GUILD_ID = '1346664147600932949';

async function leaveUnauthorizedGuilds() {
    const guilds = await client.guilds.fetch();
    for (const [guildId, guild] of guilds) {
        if (guildId !== ALLOWED_GUILD_ID) {
            try {
                const g = await client.guilds.fetch(guildId);
                await g.leave();
                console.log(`Unauthorized server exit: ${guildId}`);
            } catch (err) {
                console.error(`Error exiting server: ${guildId}:`, err);
            }
        }
    }
}

client.once('ready', () => {
    console.log(`✅ Bot online as ${client.user.tag}`);
    startCountdown(client);
    registerSlashCommands();

    leaveUnauthorizedGuilds();

    client.on('guildCreate', async (guild) => {
        if (guild.id !== ALLOWED_GUILD_ID) {
            try {
                await guild.leave();
                console.log(`Left unauthorized server: ${guild.id}`);
            } catch (err) {
                console.error(`Error leaving server ${guild.id}:`, err);
            }
        }
    });

    setInterval(() => checkDocsUpdates(sendUpdate), 10 * 60 * 1000);
});

registerWelcomeEvent(client);
registerRulesPrompt(client);

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'beta_status') {
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
            .setTitle('About PRACTA')
            .setDescription('PRACTA is an open-source community focused on helping students prepare for the SAT with a focus on admission to MIT. It provides a platform for students worldwide to discuss study strategies, share experiences, and connect with like-minded individuals.\n\n🔤 Our primary language is **English**, and we are committed to fostering **collaboration**, **knowledge exchange**, and **academic growth**.');
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
        new SlashCommandBuilder().setName('about').setDescription('Learn about the PRACTA Beta Bot')
    ].map(command => command.toJSON());

    client.application.commands.set(commands);
}

async function getWorkflowStatus() {
    const url = `https://api.github.com/repos/PRACTAcademy/bot-beta/actions/workflows/test.yml/runs?branch=main&per_page=1`;

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

async function sendUpdate(updates) {
    const channel = await client.channels.fetch('1373355400706916352');
    let msg = `@everyone\n\n📝 **Documentation updated!**\n\n`;
    msg += updates.map(u => `- \`${u.file}\` (Last updated: ${new Date(u.lastUpdate).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' })} UTC)`).join('\n');
    channel.send(msg);
}

const app = express();
app.use(express.json());
app.use('/embed', embedRouter);

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PRACTA Bot API',
            version: '1.0.0',
            description: 'Automatic documentation for PRACTA Bot Express routes',
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Local server' }
        ],
    },
    apis: [path.join(__dirname, '/routes/*.js')],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});

client.login(process.env.DISCORD_TOKEN);