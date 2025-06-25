import { describe, it, expect } from 'vitest';
import createCountdownEmbed from '../src/utils/createCountdownEmbed.js';

describe('createCountdownEmbed', () => {
    it('returns a valid embed with countdown', () => {
        const fakeClient = {
            user: {
                displayAvatarURL: () => 'https://example.com/avatar.png'
            }
        };

        const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
        const embed = createCountdownEmbed(futureDate, fakeClient);

        expect(embed).toBeDefined();
        expect(embed.embeds[0].data.title).toContain('MITPA Launch Countdown');
        expect(embed.embeds[0].data.description).toMatch(/\d+d \d+h \d+m \d+s/);
    });

    it('returns null if launch date is in the past', () => {
        const pastDate = new Date(Date.now() - 10000);
        const fakeClient = {
            user: {
                displayAvatarURL: () => 'https://example.com/avatar.png'
            }
        };

        const embed = createCountdownEmbed(pastDate, fakeClient);
        expect(embed).toBeNull();
    });
});
