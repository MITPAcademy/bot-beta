import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';

export default function createCountdownEmbed(launchDate, client) {
    const now = new Date();
    const diff = launchDate - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const embed = new EmbedBuilder()
        .setColor('#FF4D00')
        .setTitle('🚀 MITPA Launch Countdown')
        .setDescription(
            `✨ The official launch is almost here!\n\n` +
            `**🗓️ ${days}d ${hours}h ${minutes}m ${seconds}s** remaining until the big moment!\n\n` +
            `📡 Stay tuned and get ready to join us!`
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter({ text: 'MITPA • Preparing for liftoff…', iconURL: client.user.displayAvatarURL() });

    const button = new ButtonBuilder()
        .setLabel('🌐 Visit the Website')
        .setStyle(ButtonStyle.Link)
        .setURL('https://mitpa.tech');

    const row = new ActionRowBuilder().addComponents(button);

    return { embeds: [embed], components: [row] };
}
