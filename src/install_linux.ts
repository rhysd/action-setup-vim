import * as path from 'path';
import * as core from '@actions/core';
import type { Installed } from './install';
import type { Config } from './config';
import { exec } from './shell';
import { buildVim } from './vim';
import { downloadNeovim, fetchLatestNeovimVersion } from './neovim';

async function installVimStable(): Promise<Installed> {
    core.debug('Installing stable Vim on Linux using apt');
    await exec('sudo', ['apt', 'update', '-y']);
    await exec('sudo', ['apt', 'install', '-y', 'vim-gnome']);
    return {
        executable: 'vim',
        binDir: '/usr/bin',
    };
}

async function installVim(ver: string | null): Promise<Installed> {
    core.debug(`Installing Vim version '${ver ?? 'HEAD'}' on Linux`);
    const vimDir = await buildVim(ver);
    return {
        executable: 'vim',
        binDir: path.join(vimDir, 'bin'),
    };
}

async function installNeovim(ver: string): Promise<Installed> {
    core.debug(`Installing Neovim version '${ver}' on Linux`);
    const nvimDir = await downloadNeovim(ver, 'linux');
    return {
        executable: 'nvim',
        binDir: path.join(nvimDir, 'bin'),
    };
}

async function installStableNeovim(token: string | null): Promise<Installed> {
    try {
        return installNeovim('stable');
    } catch (err) {
        if (err.message.includes('Downloading asset failed:') && token !== null) {
            core.warning(`Could not download stable asset. Trying fallback: ${err.message}`);
            const ver = await fetchLatestNeovimVersion(token);
            core.warning(`Fallback to install asset from '${ver}' release`);
            return installNeovim(ver);
        }
        throw err;
    }
}

export function install(config: Config): Promise<Installed> {
    if (config.neovim) {
        switch (config.version) {
            case 'stable':
                return installStableNeovim(config.token);
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
