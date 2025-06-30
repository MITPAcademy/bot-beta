import { describe, it, beforeEach, beforeAll, expect, vi } from 'vitest';

let cacheContent = '{}';

const mockReadFile = vi.fn((filePath) => {
    if (mockReadFile.shouldThrow) {
        return Promise.reject(new Error('File not found'));
    }
    return Promise.resolve(cacheContent);
});
mockReadFile.shouldThrow = false;

const mockWriteFile = vi.fn((filePath, data) => {
    cacheContent = data;
    return Promise.resolve();
});

vi.mock('fs/promises', () => ({
    __esModule: true,
    default: {
        readFile: mockReadFile,
        writeFile: mockWriteFile,
    }
}));

const mockFetch = vi.fn();
vi.mock('node-fetch', () => ({
    __esModule: true,
    default: mockFetch,
}));

const mockMdFiles = [
    { name: 'file1.md', path: 'docs/file1.md' },
    { name: 'file2.md', path: 'docs/file2.md' },
    { name: 'notMd.txt', path: 'docs/notMd.txt' }
];

const mockCommits = [
    [{ commit: { committer: { date: '2025-06-30T12:00:00Z' } } }],
    [{ commit: { committer: { date: '2025-06-29T10:00:00Z' } } }]
];

describe('docWatcher', () => {
    let checkDocsUpdates;

    beforeAll(async () => {
        ({ checkDocsUpdates } = await import('../src/watcher/docWatcher.js'));
    });

    beforeEach(() => {
        vi.clearAllMocks();
        cacheContent = '{}';
        mockReadFile.shouldThrow = false;
        mockWriteFile.mockClear();
        mockFetch.mockClear();
    });

    it('should call sendUpdate with updated files and update cache', async () => {
        cacheContent = JSON.stringify({ 'docs/file1.md': '2025-06-29T11:00:00Z' });
        mockFetch
            .mockResolvedValueOnce({
                json: async () => mockMdFiles,
                ok: true
            })
            .mockResolvedValueOnce({
                json: async () => mockCommits[0],
                ok: true
            })
            .mockResolvedValueOnce({
                json: async () => mockCommits[1],
                ok: true
            });

        const sendUpdate = vi.fn();

        await checkDocsUpdates(sendUpdate);

        expect(sendUpdate).toHaveBeenCalledTimes(1);
        expect(sendUpdate).toHaveBeenCalledWith([
            { file: 'docs/file1.md', lastUpdate: '2025-06-30T12:00:00Z' },
            { file: 'docs/file2.md', lastUpdate: '2025-06-29T10:00:00Z' }
        ]);
        expect(mockWriteFile).toHaveBeenCalledTimes(1);
        expect(mockWriteFile).toHaveBeenCalledWith(
            './docs_cache.json',
            JSON.stringify({
                'docs/file1.md': '2025-06-30T12:00:00Z',
                'docs/file2.md': '2025-06-29T10:00:00Z'
            }, null, 2)
        );
    });

    it('should not call sendUpdate if no updates', async () => {
        cacheContent = JSON.stringify({
            'docs/file1.md': '2025-06-30T12:00:00Z',
            'docs/file2.md': '2025-06-29T10:00:00Z'
        });
        mockFetch
            .mockResolvedValueOnce({
                json: async () => mockMdFiles,
                ok: true
            })
            .mockResolvedValueOnce({
                json: async () => mockCommits[0],
                ok: true
            })
            .mockResolvedValueOnce({
                json: async () => mockCommits[1],
                ok: true
            });

        const sendUpdate = vi.fn();

        await checkDocsUpdates(sendUpdate);

        expect(sendUpdate).not.toHaveBeenCalled();
        expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it('should handle missing cache file', async () => {
        mockReadFile.shouldThrow = true;
        mockFetch
            .mockResolvedValueOnce({
                json: async () => mockMdFiles,
                ok: true
            })
            .mockResolvedValueOnce({
                json: async () => mockCommits[0],
                ok: true
            })
            .mockResolvedValueOnce({
                json: async () => mockCommits[1],
                ok: true
            });

        const sendUpdate = vi.fn();

        await checkDocsUpdates(sendUpdate);

        expect(sendUpdate).toHaveBeenCalledTimes(1);
        expect(sendUpdate).toHaveBeenCalledWith([
            { file: 'docs/file1.md', lastUpdate: '2025-06-30T12:00:00Z' },
            { file: 'docs/file2.md', lastUpdate: '2025-06-29T10:00:00Z' }
        ]);
        expect(mockWriteFile).toHaveBeenCalledTimes(1);
        expect(mockWriteFile).toHaveBeenCalledWith(
            './docs_cache.json',
            JSON.stringify({
                'docs/file1.md': '2025-06-30T12:00:00Z',
                'docs/file2.md': '2025-06-29T10:00:00Z'
            }, null, 2)
        );
    });

    it('should skip non-.md files', async () => {
        cacheContent = '{}';
        mockFetch
            .mockResolvedValueOnce({
                json: async () => mockMdFiles,
                ok: true
            })
            .mockResolvedValueOnce({
                json: async () => mockCommits[0],
                ok: true
            })
            .mockResolvedValueOnce({
                json: async () => mockCommits[1],
                ok: true
            });

        const sendUpdate = vi.fn();

        await checkDocsUpdates(sendUpdate);

        expect(sendUpdate).toHaveBeenCalledTimes(1);
        expect(sendUpdate).toHaveBeenCalledWith([
            { file: 'docs/file1.md', lastUpdate: '2025-06-30T12:00:00Z' },
            { file: 'docs/file2.md', lastUpdate: '2025-06-29T10:00:00Z' }
        ]);
        expect(mockWriteFile).toHaveBeenCalledTimes(1);
        expect(mockWriteFile).toHaveBeenCalledWith(
            './docs_cache.json',
            JSON.stringify({
                'docs/file1.md': '2025-06-30T12:00:00Z',
                'docs/file2.md': '2025-06-29T10:00:00Z'
            }, null, 2)
        );
    });
});