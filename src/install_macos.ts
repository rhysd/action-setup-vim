import * as core from '@actions/core';
import type { Installed } from './install';
import type { Config } from './config';
import { exec } from './shell';
import { buildVim } from './vim';
import { buildNightlyNeovim, downloadNeovim } from './neovim';

function homebrewBinDir(): string {
    return process.arch === 'arm64' ? '/opt/homebrew/bin' : '/usr/local/bin';
}

async function installVimStable(): Promise<Installed> {
    core.debug('Installing stable Vim on macOS using Homebrew');
    await exec('brew', ['install', 'macvim', '--quiet']);
    return {
        executable: 'vim',
        binDir: homebrewBinDir(),
    };
}

async function installNeovimStable(): Promise<Installed> {
    core.debug('Installing stable Neovim on macOS using Homebrew');
    await exec('brew', ['install', 'neovim', '--quiet']);
    return {
        executable: 'nvim',
        binDir: homebrewBinDir(),
    };
}

export async function install(config: Config): Promise<Installed> {
    core.debug(`Installing ${config.neovim ? 'Neovim' : 'Vim'} ${config.version} version on macOS`);
    if (config.neovim) {
        switch (config.version) {
            case 'stable':
                return installNeovimStable();
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
        if (config.version === 'stable') {
            return installNeovimStable();
        } else {
            return downloadNeovim(config.version, 'macos', config.arch);
        }
    } else {
        if (config.version === 'stable') {
            return installVimStable();
        } else {
            return buildVim(config.version, config.os, config.configureArgs);
        }
    }
}
