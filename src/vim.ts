import { homedir } from 'os';
import * as path from 'path';
import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import * as core from '@actions/core';
import * as io from '@actions/io';
import { exec } from './shell';
import { makeTmpdir } from './utils';

// Only available on macOS or Linux. Passing null to `version` means install HEAD
export async function buildVim(version: string | null): Promise<string> {
    const installDir = path.join(homedir(), 'vim');
    core.debug(`Building and installing Vim to ${installDir} (version=${version ?? 'HEAD'})`);
    const dir = path.join(await makeTmpdir(), 'vim');

    const args = ['clone', '--depth=1', '--single-branch'];
    if (version === null) {
        args.push('--no-tags');
    } else {
        args.push('--branch', version);
    }
    args.push('https://github.com/vim/vim', dir);

    await exec('git', args);

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
    for (const entry of entries) {
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

export async function detectLatestWindowsReleaseTag(): Promise<string> {
    const url = 'https://github.com/vim/vim-win32-installer/releases/latest';
    try {
        const res = await fetch(url, {
            method: 'HEAD',
            redirect: 'manual',
        });

        if (res.status !== 302) {
            throw new Error(`Expected status 302 (Redirect) but got ${res.status} (${res.statusText})`);
        }

        const location = res.headers.get('location');
        if (!location) {
            throw new Error(`'Location' header is not included in a response: ${JSON.stringify(res.headers.raw())}`);
        }

        const m = location.match(/\/releases\/tag\/(.+)$/);
        if (m === null) {
            throw new Error(`Unexpected redirect to ${location}. Redirected URL is not for release`);
        }

        core.debug(`Latest Vim relese tag ${m[1]} was extracted from redirect`);
        return m[1];
    } catch (err) {
        core.error(err.message);
        core.debug(err.stack);
        throw new Error(`${err.message}: Could not get latest release tag from ${url}`);
    }
}

async function installVimAssetOnWindows(file: string, url: string) {
    const tmpdir = await makeTmpdir();
    const dlDir = path.join(tmpdir, 'vim-installer');
    await io.mkdirP(dlDir);
    const assetFile = path.join(dlDir, file);

    try {
        core.debug(`Downloading asset at ${url} to ${dlDir}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Downloading asset failed: ${response.statusText}`);
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

export async function installVimOnWindows(tag: string): Promise<string> {
    const ver = tag.slice(1); // Strip 'v' prefix
    // e.g. https://github.com/vim/vim-win32-installer/releases/download/v8.2.0158/gvim_8.2.0158_x64.zip
    const url = `https://github.com/vim/vim-win32-installer/releases/download/${tag}/gvim_${ver}_x64.zip`;
    const file = `gvim_${ver}_x64.zip`;
    return installVimAssetOnWindows(file, url);
}

export async function installNightlyVimOnWindows(): Promise<string> {
    const latestTag = await detectLatestWindowsReleaseTag();
    return installVimOnWindows(latestTag);
}
