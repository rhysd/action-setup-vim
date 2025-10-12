import fs from 'node:fs/promises';
import * as core from '@actions/core';
import type { Installed } from './install.js';
import type { Config } from './config.js';
import type { Arch } from './system.js';
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

// `macvim` now depends on `python@3.14` however `python@3.13` is already installed and linked on macos-15-intel
// runner. This causes conflicts on `brew link`. Overwriting the package in advance can avoid this issue. (#52)
async function shouldOverwritePythonForIssue52(arch: Arch): Promise<boolean> {
    if (arch !== 'x86_64') {
        return false;
    }
    try {
        return (
            // Check python@3.13 is installed
            (await fs.stat(homebrewRootDir(arch) + '/Cellar/python@3.13')).isDirectory() &&
            // Check python@3.13 is linked
            (await fs.lstat(homebrewBinDir(arch) + '/python3')).isSymbolicLink()
        );
    } catch (_err) {
        return false;
    }
}

async function brewInstall(pkg: string, overwrites: string[] = []): Promise<void> {
    await exec('brew', ['update', '--quiet']);
    if (overwrites.length > 0) {
        core.debug(`Overwriting the following packages before installing ${pkg}: ${overwrites.join(' ')}`);
        await exec('brew', ['install', ...overwrites, '--quiet', '--overwrite']);
    }
    await exec('brew', ['install', pkg, '--quiet']);
}

async function installVimStable(arch: Arch): Promise<Installed> {
    core.debug('Installing stable Vim on macOS using Homebrew');
    const overwrites = [];
    if (await shouldOverwritePythonForIssue52(arch)) {
        core.info('Overwriting `python` package before installing `macvim` package not to cause conflicts (#52)');
        overwrites.push('python');
    }
    await brewInstall('macvim', overwrites);
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
