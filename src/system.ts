import { tmpdir } from 'node:os';
import * as path from 'node:path';
import process from 'node:process';
import * as core from '@actions/core';
import { mkdirP, rmRF } from '@actions/io';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { getProxyForUrl } from 'proxy-from-env';

export type Os = 'macos' | 'linux' | 'windows';
export type Arch = 'arm64' | 'x86_64' | 'arm32';

export function ensureError(err: unknown): Error {
    if (err instanceof Error) {
        return err;
    }
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return new Error(`Unknown fatal error: ${err}`);
}

export class TmpDir {
    private constructor(public path: string) {}

    async cleanup(): Promise<void> {
        try {
            await rmRF(this.path);
        } catch (err) {
            core.debug(`Could not remove the temporary directory ${this.path}: ${ensureError(err)}`);
        }
    }

    static async create(): Promise<TmpDir> {
        const timestamp = new Date().getTime();
        const dir = path.join(tmpdir(), `action-setup-vim-${timestamp}`);
        await mkdirP(dir);
        core.debug(`Created temporary directory ${dir}`);
        return new TmpDir(dir);
    }
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
        case 'arm':
            return 'arm32';
        case 'arm64':
            return 'arm64';
        case 'x64':
            return 'x86_64';
        default:
            throw new Error(`CPU arch '${process.arch}' is not supported`);
    }
}

export function getSystemHttpsProxyAgent(url: string): HttpsProxyAgent<string> | undefined {
    const u = getProxyForUrl(url);
    return u ? new HttpsProxyAgent(u) : undefined;
}
