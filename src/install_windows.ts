import * as path from 'path';
import * as core from '@actions/core';
import { Installed } from './install';
import { Config } from './config';
import { downloadNeovim } from './neovim';

async function installVimStable(): Promise<Installed> {
    core.debug('Installing stable Vim on Windows');
    throw new Error('Not implemented');
}

async function installVimNightly(): Promise<Installed> {
    core.debug('Installing nightly Vim on Windows');
    throw new Error('Not implemented');
}

async function installVim(ver: string): Promise<Installed> {
    core.debug(`Installing Vim version '${ver}' on Windows`);
    throw new Error(`Installing Vim of specific version '${ver}' is not supported yet`);
}

async function installNeovimStable(): Promise<Installed> {
    core.debug('Installing stable Neovim on Windows');
    const nvimDir = await downloadNeovim('stable', 'macos');
    return {
        executable: path.join(nvimDir, 'bin', 'nvim.exe'),
        bin: path.join(nvimDir, 'bin'),
    };
}

async function installNeovimNightly(): Promise<Installed> {
    core.debug('Installing nightly Neovim on Windows');
    const nvimDir = await downloadNeovim('nightly', 'macos');
    return {
        executable: path.join(nvimDir, 'bin', 'nvim.exe'),
        bin: path.join(nvimDir, 'bin'),
    };
}

async function installNeovim(ver: string): Promise<Installed> {
    core.debug(`Installing Neovim version '${ver}' on Windows`);
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
