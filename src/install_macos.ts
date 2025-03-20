import * as core from '@actions/core';
import type { Installed } from './install';
import type { Config } from './config';
import type { Arch } from './system';
import { exec } from './shell';
import { buildVim } from './vim';
import { buildNightlyNeovim, downloadNeovim } from './neovim';

function homebrewBinDir(arch: Arch): string {
    switch (arch) {
        case 'arm64':
            return '/opt/homebrew/bin';
        case 'x86_64':
            return '/usr/local/bin';
        default:
            throw new Error(`CPU arch ${arch} is not supported by Homebrew`);
    }
}

async function installVimStable(arch: Arch): Promise<Installed> {
    core.debug('Installing stable Vim on macOS using Homebrew');
    await exec('brew', ['install', 'macvim', '--quiet']);
    return {
        executable: 'vim',
        binDir: homebrewBinDir(arch),
    };
}

async function installNeovimStable(arch: Arch): Promise<Installed> {
    core.debug('Installing stable Neovim on macOS using Homebrew');
    await exec('brew', ['install', 'neovim', '--quiet']);
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
