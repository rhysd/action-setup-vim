import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import fetch from 'node-fetch';
import * as core from '@actions/core';
import { ensureError, getSystemHttpsProxyAgent } from './system.js';

type ReleaseAsset = {
    name?: string;
    digest?: string;
};

async function fetchSha256FromRelease(
    slug: string,
    tag: string,
    assetName: string,
): Promise<string | null> {
    const apiUrl = `https://api.github.com/repos/${slug}/releases/tags/${tag}`;
    core.debug(`Fetching release metadata from ${apiUrl}`);

    let response;
    try {
        response = await fetch(apiUrl, { agent: getSystemHttpsProxyAgent(apiUrl) });
    } catch (e) {
        const err = ensureError(e);
        throw new Error(`Checksum fetch failed for ${apiUrl}: ${err.message}`, { cause: e });
    }

    if (response.status === 404) {
        core.debug(`Checksum: release metadata not found at ${apiUrl}`);
        return null;
    }
    if (!response.ok) {
        throw new Error(`Checksum fetch failed for ${apiUrl}: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { assets?: ReleaseAsset[] };
    const assets = data.assets ?? [];
    const digest = assets.find((a) => a.name === assetName)?.digest;
    if (!digest) {
        core.debug(`Checksum: digest not found for asset ${assetName} in ${apiUrl}`);
        return null;
    }

    core.debug(`Checksum: digest found for ${assetName} from ${apiUrl}`);
    return digest.toLowerCase();
}

export async function verifySha256IfAvailable(
    filePath: string,
    slug: string,
    tag: string,
    assetName: string,
): Promise<void> {
    const expected = await fetchSha256FromRelease(slug, tag, assetName);
    if (!expected) {
        core.debug(`No checksum found for ${slug}@${tag}:${assetName}. Skipping verification.`);
        return;
    }

    const buffer = await fs.readFile(filePath);
    const actual = createHash('sha256').update(buffer).digest('hex');
    if (actual !== expected) {
        throw new Error(`SHA256 mismatch for ${slug}@${tag}:${assetName}. expected ${expected} got ${actual}`);
    }

    core.info(`Verified SHA256 for ${slug}@${tag}:${assetName}`);
}
