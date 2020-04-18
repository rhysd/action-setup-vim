import * as path from 'path';
import * as core from '@actions/core';
import type { Installed } from './install';
import type { Config } from './config';
import { installNightlyVimOnWindows, installVimOnWindows } from './vim';
import { downloadNeovim } from './neovim';

async function installVimNightly(): Promise<Installed> {
    core.debug('Installing nightly Vim on Windows');
    const vimDir = await installNightlyVimOnWindows();
    return {
        executable: 'vim.exe',
        bin: vimDir,
    };
}

function installVimStable(): Promise<Installed> {
    core.debug('Installing stable Vim on Windows');
    core.warning('No stable Vim release is officially provided for Windows. Installing nightly instead');
    return installVimNightly();
}

async function installVim(ver: string): Promise<Installed> {
    core.debug(`Installing Vim version '${ver}' on Windows`);
    const vimDir = await installVimOnWindows(ver);
    return {
        executable: 'vim.exe',
        bin: vimDir,
    };
}

async function installNeovim(ver: string): Promise<Installed> {
    core.debug(`Installing Neovim version '${ver}' on Windows`);
    const nvimDir = await downloadNeovim(ver, 'windows');
    return {
        executable: 'nvim.exe',
        bin: path.join(nvimDir, 'bin'),
    };
}

export function install(config: Config): Promise<Installed> {
    if (config.neovim) {
        switch (config.version) {
            case 'stable':
                return installNeovim('stable');
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
                return installVimNightly();
            default:
                return installVim(config.version);
        }
    }
}
