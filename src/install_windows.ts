import * as core from '@actions/core';
import type { Installed } from './install';
import type { Inputs } from './inputs';
import type { System } from './system';
import { installNightlyVimOnWindows, installVimOnWindows } from './vim';
import { downloadNeovim, downloadStableNeovim } from './neovim';

export function install(inputs: Inputs, system: System): Promise<Installed> {
    core.debug(`Installing ${inputs.neovim ? 'Neovim' : 'Vim'} ${inputs.version} version on Windows`);
    if (inputs.neovim) {
        switch (inputs.version) {
            case 'stable':
                return downloadStableNeovim(system, inputs.token);
            default:
                return downloadNeovim(inputs.version, system);
        }
    } else {
        switch (inputs.version) {
            case 'stable':
                core.debug('Installing stable Vim on Windows');
                core.warning('No stable Vim release is officially provided for Windows. Installing nightly instead');
                return installNightlyVimOnWindows('stable');
            case 'nightly':
                return installNightlyVimOnWindows('nightly');
            default:
                return installVimOnWindows(inputs.version, inputs.version);
        }
    }
}
