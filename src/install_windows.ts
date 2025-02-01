import * as core from '@actions/core';
import type { Installed } from './install';
import type { Config } from './config';
import { installNightlyVimOnWindows, installVimOnWindows } from './vim';
import { downloadNeovim, downloadStableNeovim } from './neovim';

export function install(config: Config): Promise<Installed> {
    core.debug(`Installing ${config.neovim ? 'Neovim' : 'Vim'} ${config.version} version on Windows`);
    if (config.neovim) {
        switch (config.version) {
            case 'stable':
                return downloadStableNeovim('windows', config.arch, config.token);
            default:
                return downloadNeovim(config.version, 'windows', config.arch);
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
