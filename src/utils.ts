import { tmpdir } from 'os';
import * as core from '@actions/core';
import { mkdirP } from '@actions/io';
import type { ExeName } from './install';

export type Os = 'macos' | 'linux' | 'windows';
export type Arch = 'arm64' | 'x86_64';

export async function makeTmpdir(): Promise<string> {
    const dir = tmpdir();
    await mkdirP(dir);
    core.debug(`Created temporary directory ${dir}`);
    return dir;
}

export function getOs(): Os {
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

export function getArch(): Arch {
    switch (process.arch) {
        case 'arm64':
            return 'arm64';
        case 'x64':
            return 'x86_64';
        default:
            throw new Error(`CPU arch '${process.arch}' is not supported`);
    }
}

export function exeName(isNeovim: boolean, os: Os): ExeName {
    if (os === 'windows') {
        return isNeovim ? 'nvim.exe' : 'vim.exe';
    } else {
        return isNeovim ? 'nvim' : 'vim';
    }
}

export function ensureError(err: unknown): Error {
    if (err instanceof Error) {
        return err;
    }
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return new Error(`Unknown fatal error: ${err}`);
}
