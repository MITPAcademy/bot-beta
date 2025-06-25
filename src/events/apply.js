import { ChannelType, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Events } from 'discord.js';

const RULES_ROLE_ID = '1387566249877180436';
const CHANNEL_ID = '1376209757467054181';

export default function registerRulesPrompt(client) {
    client.once(Events.ClientReady, async () => {
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (!channel || channel.type !== ChannelType.GuildText) return;

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('📜 Community Rules')
            .setDescription(
                `Please read the server rules carefully! To participate, you must agree to all of them.\n\n` +
                `Click the button below to confirm that you have read and agree to the rules.`
            )
            .setFooter({ text: 'MITPA | Rules Confirmation', iconURL: client.user.displayAvatarURL() });

        const button = new ButtonBuilder()
            .setCustomId('accept_rules')
            .setLabel('I have read and agree to the rules')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(button);

        await channel.send({ embeds: [embed], components: [row] });
    });

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'accept_rules') return;

        try {
            const member = interaction.member;
            if (!member.roles.cache.has(RULES_ROLE_ID)) {
                await member.roles.add(RULES_ROLE_ID);
            }
            await interaction.reply({ content: '✅ You have been granted access to the chat!', ephemeral: true });
        } catch (err) {
            console.error('Error assigning role:', err);
            await interaction.reply({ content: '❌ An error occurred while assigning the role.', ephemeral: true });
        }
    });
}