import * as core from '@actions/core';
import { exec } from './shell.js';
import { buildVim } from './vim.js';
import { buildNightlyNeovim, downloadNeovim, downloadStableNeovim } from './neovim.js';
async function installVimStable() {
    core.debug('Installing stable Vim on Linux using apt');
    await exec('sudo', ['apt-get', 'update', '-y', '-q']);
    await exec('sudo', ['apt-get', 'install', '-y', '--no-install-recommends', '-q', 'vim-gtk3']);
    return {
        executable: 'vim',
        binDir: '/usr/bin',
        vimDir: '/usr/share/vim',
    };
}
export async function install(config) {
    core.debug(`Installing ${config.neovim ? 'Neovim' : 'Vim'} version '${config.version}' on Linux`);
    if (config.neovim) {
        switch (config.version) {
            case 'stable':
                return downloadStableNeovim('linux', config.arch, config.token);
            case 'nightly':
                try {
                    return await downloadNeovim(config.version, 'linux', config.arch); // await is necessary to catch error
                }
                catch (e) {
                    const message = e instanceof Error ? e.message : String(e);
                    core.warning(`Neovim download failure for nightly on Linux: ${message}. Falling back to installing Neovim by building it from source`);
                    return buildNightlyNeovim('linux');
                }
            default:
                return downloadNeovim(config.version, 'linux', config.arch);
        }
    }
    else {
        if (config.version === 'stable') {
            return installVimStable();
        }
        else {
            return buildVim(config.version, config.os, config.configureArgs);
        }
    }
}
//# sourceMappingURL=install_linux.js.map