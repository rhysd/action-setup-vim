import { getInput } from '@actions/core';

export type Os = 'macos' | 'linux' | 'windows';

export interface Config {
    version: string;
    neovim: boolean;
    os: Os;
    token: string | null;
}

function getBoolean(input: string, def: boolean): boolean {
    const v = getInput(input).toLowerCase();
    if (v === '') {
        return def;
    }
    if (v === 'true' || v === 'false') {
        return v === 'true';
    }
    throw new Error(`'${input}' input only accepts boolean value 'true' or 'false' but got '${v}'`);
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

function getVersion(): string {
    const v = getInput('version').toLowerCase();
    if (v === '') {
        return 'stable';
    }
    if (v === 'stable' || v === 'nightly') {
        return v;
    }
    throw new Error(`For now 'version' input only accepts 'stable' or 'nightly' but got '${v}'`);
}

function getNeovim(): boolean {
    return getBoolean('neovim', false);
}

function getGitHubToken(): string | null {
    return getInput('github-token') || null;
}

export function loadConfigFromInputs(): Config {
    return {
        version: getVersion(),
        neovim: getNeovim(),
        os: getOs(),
        token: getGitHubToken(),
    };
}
