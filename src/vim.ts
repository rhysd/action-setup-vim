import { homedir } from 'os';
import * as path from 'path';
import { promises as fs } from 'fs';
import { strict as assert } from 'assert';
import fetch from 'node-fetch';
import * as core from '@actions/core';
import * as io from '@actions/io';
import { lt as semverLT } from 'semver';
import { exec, Env } from './shell';
import { makeTmpdir, exeName, Os } from './utils';
import type { Installed } from './install';

// Xcode10~12 are available at this point:
// https://github.com/actions/virtual-environments/blob/main/images/macos/macos-10.15-Readme.md#xcode
const XCODE11_DEVELOPER_DIR = '/Applications/Xcode_11.7.app/Contents/Developer';

async function dirExists(dir: string): Promise<boolean> {
    try {
        await fs.access(dir);
        return true;
    } catch (e) {
        return false;
    }
}

// Only available on macOS or Linux. Passing null to `version` means install HEAD
export async function buildVim(version: string, os: Os): Promise<Installed> {
    assert.notEqual(version, 'stable');
    const installDir = path.join(homedir(), 'vim');
    core.debug(`Building and installing Vim to ${installDir} (version=${version ?? 'HEAD'})`);
    const dir = path.join(await makeTmpdir(), 'vim');

    const args = ['clone', '--depth=1', '--single-branch'];
    if (version === 'nightly') {
        args.push('--no-tags');
    } else {
        args.push('--branch', version);
    }
    args.push('https://github.com/vim/vim', dir);

    await exec('git', args);

    const env: Env = {};
    if (os === 'macos' && version.startsWith('v') && semverLT(version.slice(1), '8.2.1119')) {
        if (await dirExists(XCODE11_DEVELOPER_DIR)) {
            // Vim before v8.2.1119 cannot be built with Xcode 12 or later. It requires Xcode 11.
            //   ref: https://github.com/vim/vim/commit/5289783e0b07cfc3f92ee933261ca4c4acdca007
            // By setting $DEVELOPER_DIR environment variable, Xcode11 is used to build Vim.
            //   ref: https://www.jessesquires.com/blog/2020/01/06/selecting-an-xcode-version-on-github-ci/
            // Note that xcode-select command is not available since it changes Xcode version in system global.
            env['DEVELOPER_DIR'] = XCODE11_DEVELOPER_DIR;
            core.debug(
                `Building Vim older than 8.2.1119 on macOS with Xcode11 at ${XCODE11_DEVELOPER_DIR} instead of the latest Xcode`,
            );
        } else {
            core.warning(
                `Building Vim older than 8.2.1119 on macOS but proper Xcode is not found at ${XCODE11_DEVELOPER_DIR}. Using the latest Xcode`,
            );
        }
    }

    const opts = { cwd: dir, env };
    await exec('./configure', [`--prefix=${installDir}`, '--with-features=huge', '--enable-fail-if-missing'], opts);
    await exec('make', ['-j'], opts);
    await exec('make', ['install'], opts);
    core.debug(`Built and installed Vim to ${installDir} (version=${version})`);

    return {
        executable: exeName(false, os),
        binDir: path.join(installDir, 'bin'),
    };
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

export async function installVimOnWindows(tag: string): Promise<Installed> {
    const ver = tag.slice(1); // Strip 'v' prefix
    // e.g. https://github.com/vim/vim-win32-installer/releases/download/v8.2.0158/gvim_8.2.0158_x64.zip
    const url = `https://github.com/vim/vim-win32-installer/releases/download/${tag}/gvim_${ver}_x64.zip`;
    const file = `gvim_${ver}_x64.zip`;
    const destDir = await installVimAssetOnWindows(file, url);
    return {
        executable: exeName(false, 'windows'),
        binDir: destDir,
    };
}

export async function installNightlyVimOnWindows(): Promise<Installed> {
    const latestTag = await detectLatestWindowsReleaseTag();
    return installVimOnWindows(latestTag);
}
