import * as core from '@actions/core';
import type { Installed } from './install';
import type { Config } from './config';
import { exec } from './shell';
import { buildVim } from './vim';
import { downloadNeovim } from './neovim';

async function installVimStable(): Promise<Installed> {
    core.debug('Installing stable Vim on macOS using Homebrew');
    await exec('brew', ['install', 'macvim']);
    return {
        executable: 'vim',
        binDir: '/usr/local/bin',
    };
}

async function installNeovimStable(): Promise<Installed> {
    core.debug('Installing stable Neovim on macOS using Homebrew');
    await exec('brew', ['install', 'neovim']);
    return {
        executable: 'nvim',
        binDir: '/usr/local/bin',
    };
}

export function install(config: Config): Promise<Installed> {
    core.debug(`Installing ${config.neovim ? 'Neovim' : 'Vim'} ${config.version} version on macOS`);
    if (config.neovim) {
        if (config.version === 'stable') {
            return installNeovimStable();
        } else {
            return downloadNeovim(config.version, 'macos');
        }
    } else {
        if (config.version === 'stable') {
            return installVimStable();
        } else {
            return buildVim(config.version, config.os);
        }
    }
}
