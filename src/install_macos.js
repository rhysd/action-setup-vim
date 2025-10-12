import fs from 'node:fs/promises';
import * as core from '@actions/core';
import { exec } from './shell.js';
import { buildVim } from './vim.js';
import { buildNightlyNeovim, downloadNeovim } from './neovim.js';
function homebrewRootDir(arch) {
    switch (arch) {
        case 'arm64':
            return '/opt/homebrew';
        case 'x86_64':
            return '/usr/local';
        default:
            throw new Error(`CPU arch ${arch} is not supported by Homebrew`);
    }
}
function homebrewBinDir(arch) {
    return homebrewRootDir(arch) + '/bin';
}
// `macvim` now depends on `python@3.14`. Now installing `macvim` fails due to link error on `python@3.14` installation
// on macos-15-intel runner (#52). The link error is caused by executable conflicts in /usr/local/bin. GitHub installs
// Python using the official Python installer. The installer puts symlinks in /usr/local/bin. Since symlinks not managed
// by Homebrew are already there, Homebrew cannot create its symlinks.
// We avoid this issue by forcing to overwrite the installer's symlinks by `brew link python@3.13` before installing the
// `python@3.14` dependency installation so that Homebrew can overwrite the python@3.13's symlinks.
//
// - https://github.com/rhysd/action-setup-vim/issues/52
// - https://github.com/Homebrew/homebrew-core/pull/248952
// - https://github.com/actions/runner-images/issues/9966
async function ensureHomebrewPythonIsLinked(arch) {
    if (arch !== 'x86_64') {
        return;
    }
    try {
        if (
        // Check python@3.13 installation
        !(await fs.stat(homebrewRootDir(arch) + '/Cellar/python@3.13')).isDirectory() ||
            // Check /usr/local/bin/python executable which is one of conflicts with python@3.13 package
            !(await fs.lstat(homebrewBinDir(arch) + '/python3')).isSymbolicLink()) {
            return;
        }
    }
    catch (_err) {
        return;
    }
    core.info("Ensure linking Homebrew's python@3.13 package to avoid conflicts in /usr/local/bin (#52)");
    await exec('brew', ['unlink', 'python@3.13', '--quiet']);
    await exec('brew', ['link', 'python@3.13', '--quiet', '--overwrite']);
}
async function brewInstall(pkg) {
    await exec('brew', ['update', '--quiet']);
    await exec('brew', ['install', pkg, '--quiet']);
}
async function installVimStable(arch) {
    core.debug('Installing stable Vim on macOS using Homebrew');
    await ensureHomebrewPythonIsLinked(arch);
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