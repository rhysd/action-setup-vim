import * as core from '@actions/core';
import type { Installed } from './install';
import type { Config } from './config';
import { exec } from './shell';
import { buildVim } from './vim';
import { downloadNeovim, downloadStableNeovim } from './neovim';

async function installVimStable(): Promise<Installed> {
    core.debug('Installing stable Vim on Linux using apt');
    await exec('sudo', ['apt', 'update', '-y']);
    await exec('sudo', ['apt', 'install', '-y', 'vim-gtk3']);
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
