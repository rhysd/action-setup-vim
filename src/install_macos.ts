import fs from 'node:fs/promises';
import * as core from '@actions/core';
import { rmRF } from '@actions/io';
import type { Installed } from './install.js';
import type { Config } from './config.js';
import { type Arch, ensureError } from './system.js';
import { exec } from './shell.js';
import { buildVim } from './vim.js';
import { buildNightlyNeovim, downloadNeovim } from './neovim.js';

function homebrewRootDir(arch: Arch): string {
    switch (arch) {
        case 'arm64':
            return '/opt/homebrew';
        case 'x86_64':
            return '/usr/local';
        default:
            throw new Error(`CPU arch ${arch} is not supported by Homebrew`);
    }
}

function homebrewBinDir(arch: Arch): string {
    return homebrewRootDir(arch) + '/bin';
}

async function removePreinstalledPythonSymlink(bin: string): Promise<boolean> {
    const path = `/usr/local/bin/${bin}`;

    let realpath;
    try {
        realpath = await fs.realpath(path);
    } catch (err) {
        core.debug(`Cancel removing ${path} symlink: ${ensureError(err)}`);
        return false;
    }

    if (!realpath.startsWith('/Library/Frameworks/Python.framework/Versions')) {
        core.debug(`Symlink ${path} is not linked to Python.Framework: ${realpath}`);
        return false;
    }

    core.debug(`Removing ${path} symlinked to ${realpath} for workaround of #52`);
    await rmRF(path);
    return true;
}

// `macvim` now depends on `python@3.14`. Now installing `macvim` fails due to link error on `python@3.14` installation
// on macos-15-intel runner (#52). The link error is caused by executable conflicts in /usr/local/bin. GitHub installs
// Python using the official Python installer. The installer puts symlinks in /usr/local/bin. Since symlinks not managed
// by Homebrew are already there, Homebrew cannot create its symlinks.
// We avoid this issue by forcing to overwrite the installer's symlinks by `brew link python@3` before installing the
// MacVim's `python@3.14` dependency so that Homebrew can make the python@3.13's symlinks without confusion.
//
// - https://github.com/rhysd/action-setup-vim/issues/52
// - https://github.com/Homebrew/homebrew-core/pull/248952
// - https://github.com/actions/runner-images/issues/9966
async function ensureHomebrewPythonIsLinked(arch: Arch): Promise<void> {
    if (arch !== 'x86_64') {
        return;
    }

    let anyRemoved = false;
    for (const bin of ['idle3', 'pip3', 'pydoc3', 'python3', 'python3-config']) {
        const removed = await removePreinstalledPythonSymlink(bin);
        anyRemoved ||= removed;
    }
    if (!anyRemoved) {
        return;
    }

    // Create the removed symlinks again by Homebrew so that Homebrew is no longer confused by them
    core.info("Ensure linking Homebrew's python@3 package to avoid conflicts in /usr/local/bin (#52)");
    await exec('brew', ['unlink', 'python@3', '--quiet']);
    await exec('brew', ['link', 'python@3', '--quiet', '--overwrite']);
}

async function brewInstall(pkg: string): Promise<void> {
    await exec('brew', ['update', '--quiet']);
    await exec('brew', ['install', pkg, '--quiet']);
}

async function installVimStable(arch: Arch): Promise<Installed> {
    core.debug('Installing stable Vim on macOS using Homebrew');
    await ensureHomebrewPythonIsLinked(arch);
    await brewInstall('macvim');
    return {
        executable: 'vim',
        binDir: homebrewBinDir(arch),
    };
}

async function installNeovimStable(arch: Arch): Promise<Installed> {
    core.debug('Installing stable Neovim on macOS using Homebrew');
    await brewInstall('neovim');
    return {
        executable: 'nvim',
        binDir: homebrewBinDir(arch),
    };
}

export async function install(config: Config): Promise<Installed> {
    core.debug(`Installing ${config.neovim ? 'Neovim' : 'Vim'} ${config.version} version on macOS`);
    if (config.neovim) {
        switch (config.version) {
            case 'stable':
                return installNeovimStable(config.arch);
            case 'nightly':
                try {
                    return await downloadNeovim(config.version, 'macos', config.arch); // await is necessary to catch error
                } catch (e) {
                    const message = e instanceof Error ? e.message : String(e);
                    core.warning(
                        `Neovim download failure for nightly on macOS: ${message}. Falling back to installing Neovim by building it from source`,
                    );
                    return buildNightlyNeovim('macos');
                }
            default:
                return downloadNeovim(config.version, 'macos', config.arch);
        }
    } else {
        if (config.version === 'stable') {
            return installVimStable(config.arch);
        } else {
            return buildVim(config.version, config.os, config.configureArgs);
        }
    }
}
