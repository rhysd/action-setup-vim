import * as core from '@actions/core';
import { installNightlyVimOnWindows, installVimOnWindows } from './vim.js';
import { downloadNeovim, downloadStableNeovim } from './neovim.js';
export function install(config) {
    core.debug(`Installing ${config.neovim ? 'Neovim' : 'Vim'} ${config.version} version on Windows`);
    if (config.neovim) {
        switch (config.version) {
            case 'stable':
                return downloadStableNeovim('windows', config.arch, config.token);
            default:
                return downloadNeovim(config.version, 'windows', config.arch);
        }
    }
    else {
        switch (config.version) {
            case 'stable':
                core.debug('Installing stable Vim on Windows');
                core.warning('No stable Vim release is officially provided for Windows. Installing nightly instead');
                return installNightlyVimOnWindows('stable', config.arch);
            case 'nightly':
                return installNightlyVimOnWindows('nightly', config.arch);
            default:
                return installVimOnWindows(config.version, config.version, config.arch);
        }
    }
}
//# sourceMappingURL=install_windows.js.map