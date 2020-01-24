import { homedir } from 'os';
import * as path from 'path';
import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import * as core from '@actions/core';
import { GitHub } from '@actions/github';
import * as io from '@actions/io';
import { exec } from './shell';
import { makeTmpdir } from './utils';

// Only available on macOS or Linux. Passing null to `version` means install HEAD
export async function buildVim(version: string | null): Promise<string> {
    const installDir = path.join(homedir(), 'vim');
    core.debug(`Building and installing Vim to ${installDir} (version=${version})`);
    const dir = path.join(await makeTmpdir(), 'vim');
    await exec('git', ['clone', '--depth=1', '--single-branch', '--no-tags', 'https://github.com/vim/vim', dir]);

    // TODO: Checkout specific version

    const opts = { cwd: dir };
    await exec('./configure', [`--prefix=${installDir}`, '--with-features=huge', '--enable-fail-if-missing'], opts);
    await exec('make', ['-j'], opts);
    await exec('make', ['install'], opts);
    core.debug(`Built and installed Vim to ${installDir} (version=${version})`);

    return installDir;
}

async function getVimRootDirAt(dir: string): Promise<string> {
    // Search root Vim directory such as 'vim82' in unarchived directory
    const entries = await fs.readdir(dir);
    const re = /^vim\d+$/;
    for (const entry in entries) {
        if (!re.test(entry)) {
            continue;
        }
        const p = path.join(dir, entry);
        const s = await fs.stat(p);
        if (!s.isDirectory()) {
            continue;
        }
        return p;
    }
    throw new Error(
        `Vim directory such as 'vim82' was not found in ${JSON.stringify(entries)} in unarchived directory '${dir}'`,
    );
}

export async function installNightlyVimOnWindows(token: string) {
    const client = new GitHub(token);
    const release = await client.repos.getLatestRelease({
        owner: 'vim',
        repo: 'vim-win32-installer',
    });

    const asset = release.data.assets.find(asset => asset.name.endsWith('_x64.zip'));
    if (!asset) {
        throw new Error(
            `Could not get installer asset in releases of vim/vim-win32-installer: ${JSON.stringify(
                release.data.assets,
                null,
                2,
            )}`,
        );
    }
    core.debug(`Found installer asset: ${JSON.stringify(asset, null, 2)}`);

    const tmpdir = await makeTmpdir();
    const dlDir = path.join(tmpdir, 'vim-installer');
    await io.mkdirP(dlDir);

    const assetFile = path.join(dlDir, asset.name);
    const url = asset.browser_download_url;
    try {
        core.debug(`Downloading ${url} to ${dlDir}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Downloading asset from ${url} failed: ${response.statusText}`);
        }
        const buffer = await response.buffer();
        await fs.writeFile(assetFile, buffer, { encoding: null });
        core.debug(`Downloaded installer from ${url} to ${assetFile}`);

        await exec('unzip', [assetFile], { cwd: dlDir });
    } catch (err) {
        core.debug(err.stack);
        throw new Error(`Could not download and unarchive asset ${url} at ${dlDir}: ${err.message}`);
    }

    const unzippedDir = path.join(dlDir, 'vim'); // Unarchived to 'vim' directory
    const vimDir = await getVimRootDirAt(unzippedDir);
    core.debug(`Unzipped installer from ${url} and found Vim directory ${vimDir}`);

    const destDir = path.join(homedir(), 'vim');
    await io.mv(vimDir, destDir);
    core.debug(`Vim was installed to ${destDir}`);

    return destDir;
}
