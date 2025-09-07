import * as core from '@actions/core';
import { exec } from './shell.js';
import { buildVim } from './vim.js';
import { buildNightlyNeovim, downloadNeovim } from './neovim.js';
function homebrewBinDir(arch) {
    switch (arch) {
        case 'arm64':
            return '/opt/homebrew/bin';
        case 'x86_64':
            return '/usr/local/bin';
        default:
            throw new Error(`CPU arch ${arch} is not supported by Homebrew`);
    }
}
async function brewInstall(pkg) {
    await exec('brew', ['update', '--quiet']);
    await exec('brew', ['install', pkg, '--quiet']);
}
async function installVimStable(arch) {
    core.debug('Installing stable Vim on macOS using Homebrew');
    await brewInstall('macvim');
    return {
        executable: 'vim',
        binDir: homebrewBinDir(arch),
    };
}
async function installNeovimStable(arch) {
    core.debug('Installing stable Neovim on macOS using Homebrew');
    await brewInstall('neovim');
    return {
        executable: 'nvim',
        binDir: homebrewBinDir(arch),
    };
}
export async function install(config) {
    core.debug(`Installing ${config.neovim ? 'Neovim' : 'Vim'} ${config.version} version on macOS`);
    if (config.neovim) {
        switch (config.version) {
            case 'stable':
                return installNeovimStable(config.arch);
            case 'nightly':
                try {
                    return await downloadNeovim(config.version, 'macos', config.arch); // await is necessary to catch error
                }
                catch (e) {
                    const message = e instanceof Error ? e.message : String(e);
                    core.warning(`Neovim download failure for nightly on macOS: ${message}. Falling back to installing Neovim by building it from source`);
                    return buildNightlyNeovim('macos');
                }
            default:
                return downloadNeovim(config.version, 'macos', config.arch);
        }
    }
    else {
        if (config.version === 'stable') {
            return installVimStable(config.arch);
        }
        else {
            return buildVim(config.version, config.os, config.configureArgs);
        }
    }
}
//# sourceMappingURL=install_macos.js.map