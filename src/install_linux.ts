import * as core from '@actions/core';
import type { Installed } from './install';
import type { Config } from './config';
import { exec } from './shell';
import { buildVim } from './vim';
import { buildNightlyNeovim, downloadNeovim, downloadStableNeovim } from './neovim';

async function installVimStable(): Promise<Installed> {
    core.debug('Installing stable Vim on Linux using apt');
    await exec('sudo', ['apt-get', 'update', '-y']);
    await exec('sudo', ['apt-get', 'install', '-y', '--no-install-recommends', 'vim-gtk3']);
    return {
        executable: 'vim',
        binDir: '/usr/bin',
    };
}

export async function install(config: Config): Promise<Installed> {
    core.debug(`Installing ${config.neovim ? 'Neovim' : 'Vim'} version '${config.version}' on Linux`);
    if (config.neovim) {
        switch (config.version) {
            case 'stable':
                return downloadStableNeovim('linux', config.token);
            case 'nightly':
                try {
                    return await downloadNeovim(config.version, 'linux'); // await is necessary to catch error
                } catch (e) {
                    const message = e instanceof Error ? e.message : String(e);
                    core.warning(
                        `Neovim download failure for nightly on Linux: ${message}. Falling back to installing Neovim by building it from source`,
                    );
                    return buildNightlyNeovim('linux');
                }
            default:
                return downloadNeovim(config.version, 'linux');
        }
    } else {
        if (config.version === 'stable') {
            return installVimStable();
        } else {
            return buildVim(config.version, config.os, config.configureArgs);
        }
    }
}
