import { homedir } from 'os';
import * as path from 'path';
import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import * as core from '@actions/core';
import * as io from '@actions/io';
import * as github from '@actions/github';
import { makeTmpdir, Os, exeName, ensureError } from './utils';
import { exec, unzip } from './shell';
import type { Installed } from './install';

function assetFileName(os: Os, version: string): string {
    switch (os) {
        case 'macos':
            if (version == 'nightly') {
                switch (process.arch) {
                    case 'arm64':
                        return 'nvim-macos-arm64.tar.gz';
                    case 'x64':
                        return 'nvim-macos-x86_64.tar.gz';
                }
            }
            return 'nvim-macos.tar.gz';
        case 'linux':
            return 'nvim-linux64.tar.gz';
        case 'windows':
            return 'nvim-win64.zip';
    }
}

interface Version {
    minor: number;
    patch: number;
}

function parseVersion(v: string): Version | null {
    const m = v.match(/^v0\.(\d+)\.(\d+)$/);
    if (m === null) {
        return null;
    }

    return {
        minor: parseInt(m[1]),
        patch: parseInt(m[2]),
    };
}

export function assetDirName(version: string, os: Os): string {
    switch (os) {
        case 'macos': {
            // Until v0.7.0 release, 'nvim-osx64' was the asset directory name on macOS. However it was changed to 'nvim-macos'
            // from v0.7.1: https://github.com/neovim/neovim/pull/19029
            const v = parseVersion(version);
            if (v !== null && (v.minor < 7 || (v.minor === 7 && v.patch < 1))) {
                return 'nvim-osx64';
            }
            // Until v0.9.5 release, 'nvim-macos' was the asset directory name on macOS. However it was changed to 'nvim-macos-arm64'
            // and 'nvim-macos-x86_64' from v0.10.0: https://github.com/neovim/neovim/pull/28000
            if (version == 'nightly') {
                switch (process.arch) {
                    case 'arm64':
                        return 'nvim-macos-arm64';
                    case 'x64':
                        return 'nvim-macos-x86_64';
                }
            }
            return 'nvim-macos';
        }
        case 'linux':
            return 'nvim-linux64';
        case 'windows': {
            // Until v0.6.1 release, 'Neovim' was the asset directory name on Windows. However it was changed to 'nvim-win64'
            // from v0.7.0. (#20)
            const v = parseVersion(version);
            if (v !== null && v.minor < 7) {
                return 'Neovim';
            }
            return 'nvim-win64';
        }
    }
}

async function unarchiveAsset(asset: string, dirName: string): Promise<string> {
    const dir = path.dirname(asset);
    const dest = path.join(dir, dirName);
    if (asset.endsWith('.tar.gz')) {
        await exec('tar', ['xzf', asset], { cwd: dir });
        return dest;
    }
    if (asset.endsWith('.zip')) {
        await unzip(asset, dir);
        return dest;
    }
    throw new Error(`FATAL: Don't know how to unarchive ${asset} to ${dest}`);
}

// version = 'stable' or 'nightly' or version string
export async function downloadNeovim(version: string, os: Os): Promise<Installed> {
    const file = assetFileName(os, version);
    const destDir = path.join(homedir(), `nvim-${version}`);
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

        const unarchived = await unarchiveAsset(asset, assetDirName(version, os));
        core.debug(`Unarchived asset ${unarchived}`);

        await io.mv(unarchived, destDir);
        core.debug(`Installed Neovim ${version} on ${os} to ${destDir}`);

        return {
            executable: exeName(true, os),
            binDir: path.join(destDir, 'bin'),
        };
    } catch (e) {
        const err = ensureError(e);
        core.debug(err.stack ?? err.message);
        let msg = `Could not download Neovim release from ${url}: ${err.message}. Please visit https://github.com/neovim/neovim/releases/tag/${version} to check the asset for ${os} was really uploaded`;
        if (version === 'nightly') {
            msg += ". Note that some assets are sometimes missing on nightly build due to Neovim's CI failure";
        }
        throw new Error(msg);
    }
}

async function fetchLatestVersion(token: string): Promise<string> {
    const octokit = github.getOctokit(token);
    const { data } = await octokit.rest.repos.listReleases({ owner: 'neovim', repo: 'neovim' });
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
    } catch (e) {
        const err = ensureError(e);
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

// Build nightly Neovim from sources as fallback of downloading nightly assets from the nightly release page of
// neovim/neovim repository (#18).
// https://github.com/neovim/neovim/wiki/Building-Neovim
export async function buildNightlyNeovim(os: Os): Promise<Installed> {
    core.debug(`Installing Neovim by building from source on ${os}`);

    switch (os) {
        case 'linux':
            core.debug('Installing build dependencies via apt');
            await exec('sudo', [
                'apt-get',
                'install',
                '-y',
                '--no-install-recommends',
                'ninja-build',
                'gettext',
                'libtool',
                'libtool-bin',
                'autoconf',
                'automake',
                'cmake',
                'g++',
                'pkg-config',
                'unzip',
                'curl',
            ]);
            break;
        case 'macos':
            core.debug('Installing build dependencies via Homebrew');
            await exec('brew', ['install', 'ninja', 'libtool', 'automake', 'cmake', 'pkg-config', 'gettext', 'curl']);
            break;
        default:
            throw new Error(`Building Neovim from soruce is not supported for ${os} platform`);
    }

    // Add -nightly suffix since building stable Neovim from source may be supported in the future
    const installDir = path.join(homedir(), 'nvim-nightly');
    core.debug(`Building and installing Neovim to ${installDir}`);
    const dir = path.join(await makeTmpdir(), 'build-nightly-neovim');

    await exec('git', ['clone', '--depth=1', 'https://github.com/neovim/neovim.git', dir]);

    const opts = { cwd: dir };
    const makeArgs = ['-j', `CMAKE_EXTRA_FLAGS=-DCMAKE_INSTALL_PREFIX=${installDir}`, 'CMAKE_BUILD_TYPE=RelWithDebug'];
    await exec('make', makeArgs, opts);
    core.debug(`Built Neovim in ${opts.cwd}. Installing it via 'make install'`);
    await exec('make', ['install'], opts);
    core.debug(`Installed Neovim to ${installDir}`);

    return {
        executable: exeName(true, os),
        binDir: path.join(installDir, 'bin'),
    };
}
