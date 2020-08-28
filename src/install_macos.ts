import * as path from 'path';
import * as core from '@actions/core';
import type { Installed } from './install';
import type { Config } from './config';
import { exec } from './shell';
import { buildVim } from './vim';
import { downloadNeovim } from './neovim';

async function installVimStable(): Promise<Installed> {
    core.debug('Installing stable Vim on macOS');
    await exec('brew', ['install', 'macvim']);
    return {
        executable: 'vim',
        binDir: '/usr/local/bin',
    };
}

async function installVim(ver: string | null): Promise<Installed> {
    core.debug(`Installing Vim version '${ver ?? 'HEAD'}' on macOS`);
    const vimDir = await buildVim(ver);
    return {
        executable: 'vim',
        binDir: path.join(vimDir, 'bin'),
    };
}

async function installNeovimStable(): Promise<Installed> {
    core.debug('Installing stable Neovim on macOS');
    await exec('brew', ['install', 'neovim']);
    return {
        executable: 'nvim',
        binDir: '/usr/local/bin',
    };
}

async function installNeovim(ver: string): Promise<Installed> {
    core.debug(`Installing Neovim version '${ver}' on macOS`);
    const nvimDir = await downloadNeovim(ver, 'macos');
    return {
        executable: 'nvim',
        binDir: path.join(nvimDir, 'bin'),
    };
}

export function install(config: Config): Promise<Installed> {
    if (config.neovim) {
        switch (config.version) {
            case 'stable':
                return installNeovimStable();
            case 'nightly':
                return installNeovim('nightly');
            default:
                return installNeovim(config.version);
        }
    } else {
        switch (config.version) {
            case 'stable':
                return installVimStable();
            case 'nightly':
                return installVim(null);
            default:
                return installVim(config.version);
        }
    }
}
