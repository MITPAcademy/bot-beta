import { Client, GatewayIntentBits, Partials } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import registerWelcomeEvent from './events/welcome.js';
import startCountdown from './events/countdown.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ],
    partials: [Partials.Channel]
});

client.once('ready', () => {
    console.log(`✅ Bot online as ${client.user.tag}`);
    startCountdown(client);
});

registerWelcomeEvent(client);

client.login(process.env.DISCORD_TOKEN);
