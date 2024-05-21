import * as core from '@actions/core';
import type { Installed } from './install';
import type { Inputs } from './inputs';
import type { System } from './system';
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

export async function install(inputs: Inputs, system: System): Promise<Installed> {
    core.debug(`Installing ${inputs.neovim ? 'Neovim' : 'Vim'} version '${inputs.version}' on Linux`);
    if (inputs.neovim) {
        switch (inputs.version) {
            case 'stable':
                return downloadStableNeovim(system, inputs.token);
            case 'nightly':
                try {
                    return await downloadNeovim(inputs.version, system); // await is necessary to catch error
                } catch (e) {
                    const message = e instanceof Error ? e.message : String(e);
                    core.warning(
                        `Neovim download failure for nightly on Linux: ${message}. Falling back to installing Neovim by building it from source`,
                    );
                    return buildNightlyNeovim('linux');
                }
            default:
                return downloadNeovim(inputs.version, system);
        }
    } else {
        if (inputs.version === 'stable') {
            return installVimStable();
        } else {
            return buildVim(inputs.version, system.os, inputs.configureArgs);
        }
    }
}
