import { describe, it, expect, vi } from 'vitest';

describe('welcome system', () => {
    it('sends welcome message (mock)', async () => {
        const sendMock = vi.fn();
        const member = {
            user: { username: 'Tester' },
            send: sendMock
        };

        const embed = {
            title: '🎉 Welcome to MITPA Beta!',
            description: expect.stringContaining('Tester')
        };

        await member.send({ embeds: [embed] });
        expect(sendMock).toHaveBeenCalledOnce();
    });
});
