import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Events, ChannelType } from 'discord.js';
import registerRulesPrompt from '../src/events/apply.js';

describe('registerRulesPrompt', () => {
    let fakeClient, fakeChannel, fakeMember, fakeInteraction;

    beforeEach(() => {
        fakeChannel = {
            type: ChannelType.GuildText,
            send: vi.fn(),
        };

        fakeMember = {
            roles: {
                cache: {
                    has: vi.fn().mockReturnValue(false)
                },
                add: vi.fn()
            }
        };

        fakeClient = {
            user: {
                displayAvatarURL: () => 'https://example.com/avatar.png'
            },
            channels: {
                fetch: vi.fn().mockResolvedValue(fakeChannel)
            },
            once: vi.fn((event, cb) => {
                if (event === Events.ClientReady) cb();
            }),
            on: vi.fn()
        };

        fakeInteraction = {
            isButton: vi.fn().mockReturnValue(true),
            customId: 'accept_rules',
            member: fakeMember,
            reply: vi.fn(),
        };
    });

    it('sends the rules embed and button on client ready', async () => {
        await registerRulesPrompt(fakeClient);
        expect(fakeClient.channels.fetch).toHaveBeenCalled();
        expect(fakeChannel.send).toHaveBeenCalled();
        const sentPayload = fakeChannel.send.mock.calls[0][0];
        expect(sentPayload.embeds[0].data.title).toBe('📜 Community Rules');
        expect(sentPayload.components[0].components[0].data.label).toBe('I have read and agree to the rules');
    });

    it('adds the role and replies when the button is pressed', async () => {
        let handler;
        fakeClient.on = vi.fn((event, cb) => {
            if (event === Events.InteractionCreate) handler = cb;
        });

        registerRulesPrompt(fakeClient);
        await handler(fakeInteraction);

        expect(fakeMember.roles.add).toHaveBeenCalled();
        expect(fakeInteraction.reply).toHaveBeenCalledWith({
            content: '✅ You have been granted access to the chat!',
            ephemeral: true
        });
    });

    it('does not add the role if already present', async () => {
        fakeMember.roles.cache.has = vi.fn().mockReturnValue(true);
        let handler;
        fakeClient.on = vi.fn((event, cb) => {
            if (event === Events.InteractionCreate) handler = cb;
        });

        registerRulesPrompt(fakeClient);
        await handler(fakeInteraction);

        expect(fakeMember.roles.add).not.toHaveBeenCalled();
        expect(fakeInteraction.reply).toHaveBeenCalledWith({
            content: '✅ You have been granted access to the chat!',
            ephemeral: true
        });
    });

    it('sends error reply if adding role fails', async () => {
        fakeMember.roles.add = vi.fn().mockRejectedValue(new Error('fail!'));
        let handler;
        fakeClient.on = vi.fn((event, cb) => {
            if (event === Events.InteractionCreate) handler = cb;
        });

        registerRulesPrompt(fakeClient);
        await handler(fakeInteraction);

        expect(fakeInteraction.reply).toHaveBeenCalledWith({
            content: '❌ An error occurred while assigning the role.',
            ephemeral: true
        });
    });
});
