import * as core from '@actions/core';
import { getUbuntuVersion } from 'ubuntu-version';
import type { Installed } from './install';
import type { Config } from './config';
import { exec } from './shell';
import { buildVim } from './vim';
import { buildNeovim, downloadNeovim, downloadStableNeovim } from './neovim';

async function isUbuntu18OrEarlier(): Promise<boolean> {
    const version = await getUbuntuVersion();
    if (version.length === 0) {
        core.error('Trying to install apt package but current OS is not Ubuntu');
        return false; // Should be unreachable
    }

    core.debug(`Ubuntu system version: ${version}`);

    return version[0] <= 18;
}

async function installVimStable(): Promise<Installed> {
    core.debug('Installing stable Vim on Linux using apt');
    const pkg = (await isUbuntu18OrEarlier()) ? 'vim-gnome' : 'vim-gtk3';
    await exec('sudo', ['apt', 'update', '-y']);
    await exec('sudo', ['apt', 'install', '-y', pkg]);
    return {
        executable: 'vim',
        binDir: '/usr/bin',
    };
}

export function install(config: Config): Promise<Installed> {
    core.debug(`Installing ${config.neovim ? 'Neovim' : 'Vim'} version '${config.version}' on Linux`);
    if (config.neovim) {
        if (config.version === 'stable') {
            return downloadStableNeovim('linux', config.token);
        } else {
            try {
                return downloadNeovim(config.version, 'linux');
            } catch (e) {
                const message = e instanceof Error ? e.message : e;
                core.debug(`Neovim download failure: ${message}.`);
            }
            return buildNeovim(config.version, 'linux');
        }
    } else {
        if (config.version === 'stable') {
            return installVimStable();
        } else {
            return buildVim(config.version, config.os);
        }
    }
}
