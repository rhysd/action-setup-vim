import * as path from 'path';
import * as core from '@actions/core';
import { Installed } from './install';
import { Config } from './config';
import { installNightlyVimOnWindows, installVimOnWindowsWithTag } from './vim';
import { downloadNeovim } from './neovim';

async function installVimNightly(token: string): Promise<Installed> {
    core.debug('Installing nightly Vim on Windows');
    const vimDir = await installNightlyVimOnWindows(token);
    return {
        executable: path.join(vimDir, 'vim.exe'),
        bin: vimDir,
    };
}

function installVimStable(token: string): Promise<Installed> {
    core.debug('Installing stable Vim on Windows');
    core.warning('No stable Vim release is officially provided for Windows. Installing nightly instead');
    return installVimNightly(token);
}

async function installVim(ver: string): Promise<Installed> {
    core.debug(`Installing Vim version '${ver}' on Windows`);
    const vimDir = await installVimOnWindowsWithTag(ver);
    return {
        executable: path.join(vimDir, 'vim.exe'),
        bin: vimDir,
    };
}

async function installNeovim(ver: string): Promise<Installed> {
    core.debug(`Installing Neovim version '${ver}' on Windows`);
    const nvimDir = await downloadNeovim(ver, 'windows');
    return {
        executable: path.join(nvimDir, 'bin', 'nvim.exe'),
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
        const { token } = config;
        if (token === null) {
            throw new Error("Please set 'github-token' input to get the latest installer from official Vim release");
        }
        switch (config.version) {
            case 'stable':
                return installVimStable(token);
            case 'nightly':
                return installVimNightly(token);
            default:
                return installVim(config.version);
        }
    }
}
