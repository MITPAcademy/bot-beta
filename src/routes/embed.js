import express from 'express';
import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import validator from 'validator';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.login(process.env.DISCORD_TOKEN);

router.post('/send-message', async (req, res) => {
    const { channelId, messageContent, isEmbed, embedTitle, embedDescription, embedColor, embedFooter } = req.body;

    const isValidSnowflake = /^\d{17,19}$/.test(channelId);
    if (!isValidSnowflake || (isEmbed && (
        !validator.isLength(embedTitle || '', { min: 1 }) ||
        !validator.isLength(embedDescription || '', { min: 1 }) ||
        !validator.isHexColor(embedColor || '#000000') ||
        !validator.isLength(embedFooter || '', { min: 1 })
    ))) {
        return res.status(400).send('Invalid input data');
    }

    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel) {
            return res.status(404).send('Channel not found');
        }

        if (isEmbed) {
            const embed = new EmbedBuilder()
                .setTitle(embedTitle || 'Default Title')
                .setDescription(embedDescription || 'Default Description')
                .setColor(embedColor || 0x0099ff);

            if (embedFooter) {
                embed.setFooter({ text: embedFooter });
            }

            await channel.send({ embeds: [embed] });
        } else {
            if (!validator.isLength(messageContent || '', { min: 1 })) {
                return res.status(400).send('Invalid message content');
            }
            await channel.send(messageContent);
        }

        res.status(200).send('Message sent successfully');
    } catch (error) {
        Sentry.captureException(error);
        console.error('Error sending message:', error);
        res.status(500).send('Error sending message');
    }
});

export default router;
