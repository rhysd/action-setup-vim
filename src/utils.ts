import { tmpdir } from 'os';
import * as core from '@actions/core';
import { mkdirP } from '@actions/io';

export async function makeTmpdir(): Promise<string> {
    const dir = tmpdir();
    await mkdirP(dir);
    core.debug(`Created temporary directory ${dir}`);
    return dir;
}
