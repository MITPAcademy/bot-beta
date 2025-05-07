import { EmbedBuilder } from 'discord.js';

export default function createCountdownEmbed(launchDate, client) {
    const now = new Date();
    const diff = launchDate - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('⏳ MITPA Launch Countdown')
        .setDescription(`The official launch is coming!\n\n**${days}d ${hours}h ${minutes}m ${seconds}s** left!`)
        .setFooter({ text: 'Stay ready. It’s coming…', iconURL: client.user.displayAvatarURL() });
}

