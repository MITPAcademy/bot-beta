import fetch from 'node-fetch';
import fs from 'fs/promises';

const OWNER = 'PRACTAcademy';
const REPO = 'docs.practa.tech';
const DOCS_PATH = 'docs';
const CACHE_FILE = './docs_cache.json';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function fetchDocsMdFiles() {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DOCS_PATH}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github+json',
        }
    });
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data.filter(item => item.name.endsWith('.md')).map(item => item.path);
}

async function fetchLastUpdateDate(mdPath) {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/commits?path=${mdPath}&per_page=1`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github+json',
        }
    });
    const data = await response.json();
    return data[0]?.commit?.committer?.date;
}

async function loadCache() {
    try {
        const str = await fs.readFile(CACHE_FILE, 'utf-8');
        return JSON.parse(str);
    } catch {
        return {};
    }
}

async function saveCache(cache) {
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

export async function checkDocsUpdates(sendUpdate) {
    const cache = await loadCache();
    const mdFiles = await fetchDocsMdFiles();

    let updates = [];

    for (const mdPath of mdFiles) {
        const lastUpdate = await fetchLastUpdateDate(mdPath);
        if (lastUpdate && cache[mdPath] !== lastUpdate) {
            updates.push({ file: mdPath, lastUpdate });
            cache[mdPath] = lastUpdate;
        }
    }

    if (updates.length > 0) {
        await saveCache(cache);
        await sendUpdate(updates);
    }
}