import { tmpdir } from 'os';
import * as core from '@actions/core';
import { mkdirP } from '@actions/io';

export async function makeTmpdir(): Promise<string> {
    const dir = tmpdir();
    await mkdirP(dir);
    core.debug(`Created temporary directory ${dir}`);
    return dir;
}

export function ensureError(err: unknown): Error {
    if (err instanceof Error) {
        return err;
    }
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return new Error(`Unknown fatal error: ${err}`);
}
