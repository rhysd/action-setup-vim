import { getInput } from '@actions/core';

export type Os = 'macos' | 'linux' | 'windows';

export interface Config {
    version: string;
    neovim: boolean;
    os: Os;
    token: string | null;
}

function getOs(): Os {
    switch (process.platform) {
        case 'darwin':
            return 'macos';
        case 'linux':
            return 'linux';
        case 'win32':
            return 'windows';
        default:
            throw new Error(`Platform '${process.platform}' is not supported`);
    }
}

export function loadConfigFromInputs(): Config {
    // TODO: Validate inputs
    const version = getInput('version').toLowerCase() || 'stable';
    const neovim = getInput('neovim').toLowerCase() === 'true';
    const os = getOs();
    const token = getInput('github-token') || null;
    return { version, neovim, os, token };
}
