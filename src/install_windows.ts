import * as core from '@actions/core';
import type { Installed } from './install';
import type { Config } from './config';
import type { System } from './system';
import { installNightlyVimOnWindows, installVimOnWindows } from './vim';
import { downloadNeovim, downloadStableNeovim } from './neovim';

export function install(config: Config, system: System): Promise<Installed> {
    core.debug(`Installing ${config.neovim ? 'Neovim' : 'Vim'} ${config.version} version on Windows`);
    if (config.neovim) {
        switch (config.version) {
            case 'stable':
                return downloadStableNeovim(system, config.token);
            default:
                return downloadNeovim(config.version, system);
        }
    } else {
        switch (config.version) {
            case 'stable':
                core.debug('Installing stable Vim on Windows');
                core.warning('No stable Vim release is officially provided for Windows. Installing nightly instead');
                return installNightlyVimOnWindows('stable');
            case 'nightly':
                return installNightlyVimOnWindows('nightly');
            default:
                return installVimOnWindows(config.version, config.version);
        }
    }
}
