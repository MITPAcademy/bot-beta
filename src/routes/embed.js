import express from 'express';
import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import validator from 'validator';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.login(process.env.DISCORD_TOKEN);

/**
 * @swagger
 * /embed/send-message:
 *   post:
 *     summary: Send a message or embed to a Discord channel
 *     tags:
 *       - Embed
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - channelId
 *             properties:
 *               channelId:
 *                 type: string
 *                 description: Discord Channel ID (Snowflake)
 *                 example: "123456789012345678"
 *               messageContent:
 *                 type: string
 *                 description: Message content (required if not embed)
 *                 example: "Hello world!"
 *               isEmbed:
 *                 type: boolean
 *                 description: If true, send as embed
 *                 example: true
 *               embedTitle:
 *                 type: string
 *                 description: Embed title
 *                 example: "Nice Title"
 *               embedDescription:
 *                 type: string
 *                 description: Embed description
 *                 example: "Embed description"
 *               embedColor:
 *                 type: string
 *                 description: Embed color in hex
 *                 example: "#0099ff"
 *               embedFooter:
 *                 type: string
 *                 description: Embed footer
 *                 example: "Optional footer"
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Channel not found
 *       500:
 *         description: Error sending message
 */
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
        console.error('Error sending message:', error);
        res.status(500).send('Error sending message');
    }
});

export default router;