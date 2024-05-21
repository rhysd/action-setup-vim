import * as core from '@actions/core';
import type { Installed } from './install';
import type { Inputs } from './inputs';
import type { System } from './system';
import { exec } from './shell';
import { buildVim } from './vim';
import { buildNightlyNeovim, downloadNeovim } from './neovim';

function homebrewBinDir(): string {
    return process.arch === 'arm64' ? '/opt/homebrew/bin' : '/usr/local/bin';
}

async function installVimStable(): Promise<Installed> {
    core.debug('Installing stable Vim on macOS using Homebrew');
    await exec('brew', ['install', 'macvim']);
    return {
        executable: 'vim',
        binDir: homebrewBinDir(),
    };
}

async function installNeovimStable(): Promise<Installed> {
    core.debug('Installing stable Neovim on macOS using Homebrew');
    await exec('brew', ['install', 'neovim']);
    return {
        executable: 'nvim',
        binDir: homebrewBinDir(),
    };
}

export async function install(inputs: Inputs, system: System): Promise<Installed> {
    core.debug(`Installing ${inputs.neovim ? 'Neovim' : 'Vim'} ${inputs.version} version on macOS`);
    if (inputs.neovim) {
        switch (inputs.version) {
            case 'stable':
                return installNeovimStable();
            case 'nightly':
                try {
                    return await downloadNeovim(inputs.version, system); // await is necessary to catch error
                } catch (e) {
                    const message = e instanceof Error ? e.message : String(e);
                    core.warning(
                        `Neovim download failure for nightly on macOS: ${message}. Falling back to installing Neovim by building it from source`,
                    );
                    return buildNightlyNeovim('macos');
                }
            default:
                return downloadNeovim(inputs.version, system);
        }
        if (inputs.version === 'stable') {
            return installNeovimStable();
        } else {
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
