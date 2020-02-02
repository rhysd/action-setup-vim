import { getInput } from '@actions/core';

export type Os = 'macos' | 'linux' | 'windows';

export interface Config {
    readonly version: string;
    readonly neovim: boolean;
    readonly os: Os;
}

function getBoolean(input: string, def: boolean): boolean {
    const i = getInput(input).toLowerCase();
    switch (i) {
        case '':
            return def;
        case 'true':
            return true;
        case 'false':
            return false;
        default:
            throw new Error(`'${input}' input only accepts boolean values 'true' or 'false' but got '${i}'`);
    }
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
    const v = getInput('version');
    if (v === '') {
        return 'stable';
    }

    const l = v.toLowerCase();
    if (l === 'stable' || l === 'nightly') {
        return l;
    }

    const re = neovim ? /^v\d+\.\d+\.\d+$/ : /^v7\.\d+(?:\.\d+)?$|^v\d+\.\d+\.\d{4}$/;
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

export function loadConfigFromInputs(): Config {
    const neovim = getNeovim();
    return {
        version: getVersion(neovim),
        neovim,
        os: getOs(),
    };
}
