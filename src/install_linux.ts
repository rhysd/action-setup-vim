import * as core from '@actions/core';
import { getUbuntuVersion } from 'ubuntu-version';
import type { Installed } from './install';
import type { Config } from './config';
import { exec } from './shell';
import { buildVim } from './vim';
import { buildNightlyNeovim, downloadNeovim, downloadStableNeovim } from './neovim';

async function isUbuntu18OrEarlier(): Promise<boolean> {
    const version = await getUbuntuVersion();
    if (version.length === 0) {
        core.error('Trying to install apt package but current OS is not Ubuntu');
        return false; // Should be unreachable
    }

    core.debug(`Ubuntu system version: ${version.join('.')}`);

    return version[0] <= 18;
}

async function installVimStable(): Promise<Installed> {
    core.debug('Installing stable Vim on Linux using apt');
    const pkg = (await isUbuntu18OrEarlier()) ? 'vim-gnome' : 'vim-gtk3';
    await exec('sudo', ['apt-get', 'update', '-y']);
    await exec('sudo', ['apt-get', 'install', '-y', '--no-install-recommends', pkg]);
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
