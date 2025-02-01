import { getInput } from '@actions/core';
import { type Os, getOs, type Arch, getArch } from './utils';

export interface Config {
    readonly version: string;
    readonly neovim: boolean;
    readonly os: Os;
    readonly arch: Arch;
    readonly token: string | null;
    readonly configureArgs: string | null;
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
        let msg = `'version' input '${v}' is not a format of Git tags in ${repo} repository. It should match to regex /${re}/. NOTE: It requires 'v' prefix`;
        if (!neovim) {
            msg += ". And the patch version of Vim must be in 4-digits like 'v8.2.0126'";
        }
        throw new Error(msg);
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
        arch: getArch(),
        configureArgs: getInput('configure-args') || null,
        token: getInput('token') || null,
    };
}
