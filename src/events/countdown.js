import config from '../../config.json' with { type: "json" };
import createCountdownEmbed from '../utils/createCountdownEmbed.js';

const launchDate = new Date(config.launchTimestamp);

export default async function startCountdown(client) {
    async function updateEmbed() {
        const { embeds, components } = createCountdownEmbed(launchDate, client);
        if (!embeds || embeds.length === 0) return;

        const channel = await client.channels.fetch(config.welcomeChannelId);
        if (!channel) return;

        const messages = await channel.messages.fetch({ limit: 10 });
        const botMsg = messages.find(msg => msg.author.id === client.user.id && msg.embeds.length > 0);

        if (botMsg) {
            await botMsg.edit({ embeds, components });
        } else {
            await channel.send({ embeds, components });
        }

        setTimeout(updateEmbed, 1000);
    }

    await updateEmbed();
}
