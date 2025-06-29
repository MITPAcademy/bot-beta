import { EmbedBuilder, Events } from 'discord.js';

export default function registerWelcomeEvent(client) {
    client.on(Events.GuildMemberAdd, async member => {
        try {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🎉 Welcome to PRACTA Beta!')
                .setDescription(`Hello **${member.user.username}**, we're glad to have you here!\n\nOur official launch is coming soon! 🚀`)
                .setFooter({ text: 'PRACTA Beta Access', iconURL: client.user.displayAvatarURL() });

            await member.send({ embeds: [embed] });
        } catch (err) {
            console.error('Could not DM new member:', err);
        }
    });
}