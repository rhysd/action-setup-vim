import { getInput } from '@actions/core';

export type Os = 'macos' | 'linux' | 'windows';

export interface Config {
    readonly version: string;
    readonly neovim: boolean;
    readonly os: Os;
    readonly token: string | null;
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

function getVersion(neovim: boolean): string {
    const v = getInput('version').toLowerCase();
    if (v === '') {
        return 'stable';
    }
    if (v === 'stable' || v === 'nightly') {
        return v;
    }
    const re = neovim ? /^v\d+\.\d+\.\d+$/ : /^v\d+\.\d+\.\d{4}$/;

    if (!re.test(v)) {
        const repo = neovim ? 'neovim/neovim' : 'vim/vim';
        throw new Error(
            `'version' input '${v}' is not a format of Git tags in ${repo} repository. It should match to regex /${re}/`,
        );
    }

    return v;
}

function getNeovim(): boolean {
    return getBoolean('neovim', false);
}

function getGitHubToken(): string | null {
    return getInput('github-token') || null;
}

export function loadConfigFromInputs(): Config {
    const neovim = getNeovim();
    return {
        version: getVersion(neovim),
        neovim,
        os: getOs(),
        token: getGitHubToken(),
    };
}
