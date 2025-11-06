import { homedir } from 'node:os';
import * as path from 'node:path';
import { promises as fs } from 'node:fs';
import { Buffer } from 'node:buffer';
import fetch from 'node-fetch';
import * as core from '@actions/core';
import * as io from '@actions/io';
import * as github from '@actions/github';
import { TmpDir, type Os, type Arch, ensureError, getSystemHttpsProxyAgent } from './system.js';
import { exec, unzip } from './shell.js';
import type { Installed, ExeName } from './install.js';

function exeName(os: Os): ExeName {
    return os === 'windows' ? 'nvim.exe' : 'nvim';
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
        minor: parseInt(m[1], 10),
        patch: parseInt(m[2], 10),
    };
}

export function assetFileName(version: string, os: Os, arch: Arch): string {
    switch (os) {
        case 'macos': {
            const v = parseVersion(version);
            if (v !== null && v.minor < 10) {
                return 'nvim-macos.tar.gz';
            }
            switch (arch) {
                case 'arm64':
                    return 'nvim-macos-arm64.tar.gz';
                case 'x86_64':
                    return 'nvim-macos-x86_64.tar.gz';
                default:
                    throw Error(`Unsupported CPU architecture for Neovim ${version} on ${os}: ${arch}`); // Should be unreachable
            }
        }
        case 'linux': {
            return assetDirName(version, os, arch) + '.tar.gz';
        }
        case 'windows':
            switch (arch) {
                case 'x86_64':
                    return 'nvim-win64.zip';
                case 'arm64':
                    // At point of v0.11.4, arm64 build is not available. It may be released at the next version.
                    if (version === 'nightly') {
                        return 'nvim-win-arm64.zip';
                    } else {
                        return 'nvim-win64.zip';
                    }
                default:
                    throw Error(`Unsupported CPU architecture for Neovim ${version} on ${os}: ${arch}`); // Should be unreachable
            }
    }
}

export function assetDirName(version: string, os: Os, arch: Arch): string {
    switch (os) {
        case 'macos': {
            const v = parseVersion(version);
            if (v !== null) {
                // Until v0.7.0 release, 'nvim-osx64' was the asset directory name on macOS. However it was changed to
                // 'nvim-macos' from v0.7.1: https://github.com/neovim/neovim/pull/19029
                if (v.minor < 7 || (v.minor === 7 && v.patch < 1)) {
                    return 'nvim-osx64';
                }
                // Until v0.9.5, the single asset nvim-macos.tar.gz is released. From v0.10.0, Neovim provides
                // nvim-macos-arm64.tar.gz (for Apple Silicon) and nvim-macos-x86_64.tar.gz (for Intel Mac). (#30)
                if (v.minor < 10) {
                    return 'nvim-macos';
                }
            }
            switch (arch) {
                case 'arm64':
                    return 'nvim-macos-arm64';
                case 'x86_64':
                    return 'nvim-macos-x86_64';
                default:
                    throw Error(`Unsupported CPU architecture for Neovim ${version} on ${os}: ${arch}`); // Should be unreachable
            }
        }
        case 'linux': {
            const v = parseVersion(version);
            if (v !== null && (v.minor < 10 || (v.minor === 10 && v.patch < 4))) {
                switch (arch) {
                    case 'arm64':
                        throw Error(
                            `Linux arm64 has been only supported since Neovim v0.10.4 but the requested version is ${version}`,
                        );
                    case 'x86_64':
                        return 'nvim-linux64';
                    default:
                        break;
                }
            }
            switch (arch) {
                case 'arm64':
                    return 'nvim-linux-arm64';
                case 'x86_64':
                    return 'nvim-linux-x86_64';
                default:
                    throw Error(`Unsupported CPU architecture for Neovim ${version} on ${os}: ${arch}`); // Should be unreachable
            }
        }
        case 'windows': {
            // Until v0.6.1 release, 'Neovim' was the asset directory name on Windows. However it was changed to 'nvim-win64'
            // from v0.7.0. (#20)
            const v = parseVersion(version);
            if (v !== null && v.minor < 7) {
                return 'Neovim';
            }
            switch (arch) {
                case 'x86_64':
                    return 'nvim-win64';
                case 'arm64':
                    // At point of v0.11.4, arm64 build is not available. It may be released at the next version.
                    if (version === 'nightly') {
                        return 'nvim-win-arm64';
                    } else {
                        return 'nvim-win64';
                    }
                default:
                    throw Error(`Unsupported CPU architecture for Neovim ${version} on ${os}: ${arch}`); // Should be unreachable
            }
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
export async function downloadNeovim(version: string, os: Os, arch: Arch): Promise<Installed> {
    const file = assetFileName(version, os, arch);
    const destDir = path.join(homedir(), `nvim-${version}`);
    const url = `https://github.com/neovim/neovim/releases/download/${version}/${file}`;
    console.log(`Downloading Neovim ${version} on ${os} from ${url} to ${destDir}`);

    const tmpDir = await TmpDir.create();
    const asset = path.join(tmpDir.path, file);

    try {
        core.debug(`Downloading asset ${asset}`);
        const response = await fetch(url, { agent: getSystemHttpsProxyAgent(url) });
        if (!response.ok) {
            throw new Error(`Downloading asset failed: ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();
        await fs.writeFile(asset, Buffer.from(buffer), { encoding: null });
        core.debug(`Downloaded asset ${asset}`);

        const unarchived = await unarchiveAsset(asset, assetDirName(version, os, arch));
        core.debug(`Unarchived asset ${unarchived}`);

        await io.mv(unarchived, destDir);
        core.debug(`Installed Neovim ${version} on ${os} to ${destDir}`);

        return {
            executable: exeName(os),
            binDir: path.join(destDir, 'bin'),
            vimDir: path.join(destDir, 'share', 'nvim'),
        };
    } catch (e) {
        const err = ensureError(e);
        core.debug(err.stack ?? err.message);

        if (os === 'windows' && arch === 'arm64') {
            core.warning(
                `Fall back to x86_64 build because downloading Neovim for arm64 windows from ${url} failed: ${err}`,
            );
            return await downloadNeovim(version, os, 'x86_64');
        }

        let msg = `Could not download Neovim release from ${url}: ${err.message}. Please visit https://github.com/neovim/neovim/releases/tag/${version} to check the asset for ${os} was really uploaded`;
        if (version === 'nightly') {
            msg += ". Note that some assets are sometimes missing on nightly build due to Neovim's CI failure";
        }
        throw new Error(msg);
    } finally {
        await tmpDir.cleanup();
    }
}

async function fetchLatestVersion(token: string): Promise<string> {
    const octokit = github.getOctokit(token, {
        request: { agent: getSystemHttpsProxyAgent('https://api.github.com') },
    });
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
export async function downloadStableNeovim(os: Os, arch: Arch, token: string | null = null): Promise<Installed> {
    try {
        return await downloadNeovim('stable', os, arch); // `await` is necessary to catch excetipn
    } catch (e) {
        const err = ensureError(e);
        if (err.message.includes('Downloading asset failed:') && token !== null) {
            core.warning(
                `Could not download stable asset. Detecting the latest stable release from GitHub API as fallback: ${err.message}`,
            );
            const ver = await fetchLatestVersion(token);
            core.warning(`Fallback to install asset from '${ver}' release`);
            return downloadNeovim(ver, os, arch);
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
            await exec('brew', [
                'install',
                'ninja',
                'libtool',
                'automake',
                'cmake',
                'pkg-config',
                'gettext',
                'curl',
                '--quiet',
            ]);
            break;
        default:
            throw new Error(`Building Neovim from source is not supported for ${os} platform`);
    }

    // Add -nightly suffix since building stable Neovim from source may be supported in the future
    const installDir = path.join(homedir(), 'nvim-nightly');
    core.debug(`Building and installing Neovim to ${installDir}`);
    const tmpDir = await TmpDir.create();
    try {
        const dir = path.join(tmpDir.path, 'build-nightly-neovim');

        await exec('git', ['clone', '--depth=1', 'https://github.com/neovim/neovim.git', dir]);

        const opts = { cwd: dir };
        const makeArgs = [
            '-j',
            `CMAKE_EXTRA_FLAGS=-DCMAKE_INSTALL_PREFIX=${installDir}`,
            'CMAKE_BUILD_TYPE=RelWithDebug',
        ];
        await exec('make', makeArgs, opts);
        core.debug(`Built Neovim in ${opts.cwd}. Installing it via 'make install'`);
        await exec('make', ['install'], opts);
        core.debug(`Installed Neovim to ${installDir}`);
    } finally {
        await tmpDir.cleanup();
    }

    return {
        executable: exeName(os),
        binDir: path.join(installDir, 'bin'),
        vimDir: path.join(installDir, 'share', 'nvim'),
    };
}
