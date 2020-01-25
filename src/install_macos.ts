import * as path from 'path';
import * as core from '@actions/core';
import { Installed } from './install';
import { Config } from './config';
import { exec } from './shell';
import { buildVim } from './vim';
import { downloadNeovim } from './neovim';

async function installVimStable(): Promise<Installed> {
    core.debug('Installing stable Vim on macOS');
    await exec('brew', ['install', 'macvim']);
    return {
        executable: '/usr/local/bin/vim',
        bin: '/usr/local/bin',
    };
}

async function installVimNightly(): Promise<Installed> {
    core.debug('Installing nightly Vim on macOS');
    const vimDir = await buildVim(null);
    return {
        executable: path.join(vimDir, 'bin', 'vim'),
        bin: path.join(vimDir, 'bin'),
    };
}

async function installVim(ver: string): Promise<Installed> {
    core.debug(`Installing Vim version '${ver}' on macOS`);
    throw new Error(`Installing Vim of specific version '${ver}' is not supported yet`);
}

async function installNeovimStable(): Promise<Installed> {
    core.debug('Installing stable Neovim on macOS');
    await exec('brew', ['install', 'neovim']);
    return {
        executable: '/usr/local/bin/nvim',
        bin: '/usr/local/bin',
    };
}

async function installNeovimNightly(): Promise<Installed> {
    core.debug('Installing nightly Neovim on macOS');
    const nvimDir = await downloadNeovim('stable', 'macos');
    return {
        executable: path.join(nvimDir, 'bin', 'nvim'),
        bin: path.join(nvimDir, 'bin'),
    };
}

async function installNeovim(ver: string): Promise<Installed> {
    core.debug(`Installing Neovim version '${ver}' on macOS`);
    throw new Error(`Installing NeoVim of specific version '${ver}' is not supported yet`);
}

export function install(config: Config): Promise<Installed> {
    if (config.neovim) {
        switch (config.version) {
            case 'stable':
                return installNeovimStable();
            case 'nightly':
                return installNeovimNightly();
            default:
                return installNeovim(config.version);
        }
    } else {
        switch (config.version) {
            case 'stable':
                return installVimStable();
            case 'nightly':
                return installVimNightly();
            default:
                return installVim(config.version);
        }
    }
}
