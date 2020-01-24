import { tmpdir, homedir } from 'os';
import * as path from 'path';
import * as core from '@actions/core';
import { mkdirP } from '@actions/io';
import { exec } from './shell';

async function makeTmpdir(): Promise<string> {
    const dir = tmpdir();
    await mkdirP(dir);
    core.debug(`Created temporary directory ${dir}`);
    return dir;
}

// Only available on macOS or Linux. Passing null to `version` means install HEAD
export async function buildVim(version: string | null): Promise<string> {
    const installDir = path.join(homedir(), 'vim');
    core.debug(`Building and installing Vim to ${installDir} (version=${version})`);
    const dir = path.join(await makeTmpdir(), 'vim');
    await exec('git', ['clone', '--depth=1', '--single-branch', '--no-tags', 'https://github.com/vim/vim', dir]);

    // TODO: Checkout specific version

    const opts = { cwd: dir };
    await exec('./configure', [`--prefix=${installDir}`, '--with-features=huge', '--enable-fail-if-missing'], opts);
    await exec('make', ['-j'], opts);
    await exec('make', ['install'], opts);
    core.debug(`Built and installed Vim to ${installDir} (version=${version})`);

    return installDir;
}
