import { tmpdir } from 'os';
import * as core from '@actions/core';
import { mkdirP } from '@actions/io';

export type Os = 'macos' | 'linux' | 'windows';

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

export function exeName(name: 'vim' | 'nvim', os: Os): string {
    return os === 'windows' ? name + '.exe' : name;
}
