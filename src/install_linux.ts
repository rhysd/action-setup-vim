import * as core from '@actions/core';
import { Installed } from './install';
import { Config } from './config';
import { exec } from './shell';

async function installVimStable(): Promise<Installed> {
    core.debug('Installing stable Vim on Linux');
    await exec('sudo', 'apt', 'install', '-y', 'vim-gnome');
    return {
        executable: '/usr/bin/vim',
        bin: '/usr/bin',
    };
}

async function installVimNightly(): Promise<Installed> {
    core.debug('Installing nightly Vim on Linux');
    throw new Error('Not implemented');
}

async function installVim(ver: string): Promise<Installed> {
    core.debug(`Installing Vim version '${ver}' on Linux`);
    throw new Error(`Installing Vim of specific version '${ver}' is not supported yet`);
}

async function installNeovimStable(): Promise<Installed> {
    core.debug('Installing stable Neovim on Linux');
    throw new Error('Not implemented');
}

async function installNeovimNightly(): Promise<Installed> {
    core.debug('Installing nightly Neovim on Linux');
    throw new Error('Not implemented');
}

async function installNeovim(ver: string): Promise<Installed> {
    core.debug(`Installing Neovim version '${ver}' on Linux`);
    throw new Error(`Installing NeoVim of specific version '${ver}' is not supported yet`);
}

export function install(config: Config): Promise<Installed> {
    if (config.neovim) {
        switch (config.version) {
            case 'stable':
                return installVimStable();
            case 'nightly':
                return installVimNightly();
            default:
                return installVim(config.version);
        }
    } else {
        switch (config.version) {
            case 'stable':
                return installNeovimStable();
            case 'nightly':
                return installNeovimNightly();
            default:
                return installNeovim(config.version);
        }
    }
}
