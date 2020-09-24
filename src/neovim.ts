import { homedir } from 'os';
import * as path from 'path';
import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import * as core from '@actions/core';
import * as io from '@actions/io';
import * as github from '@actions/github';
import { makeTmpdir } from './utils';
import { Os, exeName } from './utils';
import { exec } from './shell';
import type { Installed } from './install';

function assetFileName(os: Os) {
    switch (os) {
        case 'macos':
            return 'nvim-macos.tar.gz';
        case 'linux':
            return 'nvim-linux64.tar.gz';
        case 'windows':
            return 'nvim-win64.zip';
    }
}

function assetDirName(os: Os) {
    switch (os) {
        case 'macos':
            return 'nvim-osx64';
        case 'linux':
            return 'nvim-linux64';
        case 'windows':
            return 'Neovim';
    }
}

async function unarchiveAsset(asset: string, os: Os): Promise<string> {
    const dir = path.dirname(asset);
    if (asset.endsWith('.tar.gz')) {
        await exec('tar', ['xzf', asset], { cwd: dir });
        return path.join(dir, assetDirName(os));
    } else if (asset.endsWith('.zip')) {
        await exec('unzip', [asset], { cwd: dir });
        return path.join(dir, assetDirName(os));
    } else {
        throw new Error(`FATAL: Don't know how to unarchive ${asset} on ${os}`);
    }
}

// version = 'stable' or 'nightly' or version string
export async function downloadNeovim(version: string, os: Os): Promise<Installed> {
    const file = assetFileName(os);
    const destDir = path.join(homedir(), 'nvim');
    const url = `https://github.com/neovim/neovim/releases/download/${version}/${file}`;
    console.log(`Downloading Neovim ${version} on ${os} from ${url} to ${destDir}`);

    const dlDir = await makeTmpdir();
    const asset = path.join(dlDir, file);

    try {
        core.debug(`Downloading asset ${asset}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Downloading asset failed: ${response.statusText}`);
        }
        const buffer = await response.buffer();
        await fs.writeFile(asset, buffer, { encoding: null });
        core.debug(`Downloaded asset ${asset}`);

        const unarchived = await unarchiveAsset(asset, os);
        core.debug(`Unarchived asset ${unarchived}`);

        await io.mv(unarchived, destDir);
        core.debug(`Installed Neovim ${version} on ${os} to ${destDir}`);

        return {
            executable: exeName(true, os),
            binDir: path.join(destDir, 'bin'),
        };
    } catch (err) {
        core.debug(err.stack);
        let msg = `Could not download Neovim release from ${url}: ${err.message}. Please visit https://github.com/neovim/neovim/releases/tag/${version} to check the asset for ${os} was really uploaded`;
        if (version === 'nightly') {
            msg += ". Note that some assets are sometimes missing on nightly build due to Neovim's CI failure";
        }
        throw new Error(msg);
    }
}

async function fetchLatestVersion(token: string): Promise<string> {
    const octokit = github.getOctokit(token);
    const { data } = await octokit.repos.listReleases({ owner: 'neovim', repo: 'neovim' });
    const re = /^v\d+\.\d+\.\d+$/;
    for (const release of data) {
        const tagName = release.tag_name;
        if (re.test(tagName)) {
            core.debug(`Detected the latest stable version '${tagName}'`);
            return tagName;
        }
    }
    core.debug(`No stable version was found in releases: ${JSON.stringify(data, null, 2)}`);
    throw new Error(`No stable version was found in ${data.length} releases`);
}

// Download stable asset from 'stable' release. When the asset is not found, get the latest version
// using GitHub API and retry downloading an asset with the version as fallback (#5).
export async function downloadStableNeovim(os: Os, token: string | null = null): Promise<Installed> {
    try {
        return await downloadNeovim('stable', os); // `await` is necessary to catch excetipn
    } catch (err) {
        if (err.message.includes('Downloading asset failed:') && token !== null) {
            core.warning(
                `Could not download stable asset. Detecting the latest stable release from GitHub API as fallback: ${err.message}`,
            );
            const ver = await fetchLatestVersion(token);
            core.warning(`Fallback to install asset from '${ver}' release`);
            return downloadNeovim(ver, os);
        }
        throw err;
    }
}
