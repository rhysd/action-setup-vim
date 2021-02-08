import * as core from '@actions/core';
import { getUbuntuVersion } from 'ubuntu-version';
import type { Installed } from './install';
import type { Config } from './config';
import { exec } from './shell';
import { buildVim } from './vim';
import { downloadNeovim, downloadStableNeovim } from './neovim';

async function isUbuntu18OrEarlier(): Promise<boolean> {
    const ver = await getUbuntuVersion();
    if (ver === null) {
        core.error('Trying to install apt package but current OS is not Ubuntu');
        return false; // Should be unreachable
    }

    const json = JSON.stringify(ver);
    core.debug(`Ubuntu system information ${json}`);

    const vers = ver.version;
    if (vers.length === 0) {
        core.error(`Could not get Ubuntu version from ${json}`);
        return false;
    }

    return vers[0] <= 18;
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
            return downloadNeovim(config.version, 'linux');
        }
    } else {
        if (config.version === 'stable') {
            return installVimStable();
        } else {
            return buildVim(config.version, config.os);
        }
    }
}
