import { promises as fs, constants as fsconsts } from 'node:fs';
import { join } from 'node:path';
import * as core from '@actions/core';
import type { Installed } from './install.js';
import { exec } from './shell.js';
import { ensureError, type Os } from './system.js';

async function validateExecutable(binDir: string, executable: string, os: Os): Promise<void> {
    try {
        const s = await fs.stat(binDir);
        if (!s.isDirectory()) {
            throw new Error(`Validation failed! '${binDir}' is not a directory for executable`);
        }
    } catch (e) {
        const err = ensureError(e);
        throw new Error(`Validation failed! Could not stat installed directory '${binDir}': ${err.message}`);
    }
    core.debug(`Installed directory '${binDir}' was validated`);

    const path = join(binDir, executable);
    try {
        await fs.access(path, fsconsts.X_OK);
    } catch (e) {
        const err = ensureError(e);
        throw new Error(`Validation failed! Could not access the installed executable '${path}': ${err.message}`);
    }
    // `X_OK` check does not work on Windows. Additional check is necessary.
    if (os === 'windows' && !executable.endsWith('.exe') && !executable.endsWith('.EXE')) {
        throw new Error(`Validation failed! Installed binary is not an executable file: ${executable}`);
    }

    try {
        const ver = await exec(path, ['--version']);
        core.info(`Installed version:\n${ver}`);
    } catch (e) {
        const err = ensureError(e);
        throw new Error(`Validation failed! Could not get version from executable '${path}': ${err.message}`);
    }

    core.debug(`Installed executable '${path}' was validated`);
}

async function validateVimDir(path: string): Promise<void> {
    let entries;
    try {
        entries = await fs.readdir(path);
    } catch (e) {
        throw new Error(`Validation failed! Could not read the installed $VIM directory ${path}: ${ensureError(e)}`);
    }

    const reVimRuntime = /^vim\d+$/;
    for (const entry of entries) {
        if (reVimRuntime.test(entry) || entry === 'runtime') {
            core.debug(`$VIM directory '${path}' was validated`);
            return; // OK
        }
    }

    throw new Error(
        `Validation failed! $VIM directory ${path} contains no $VIMRUNTIME directory: ${JSON.stringify(entries)}`,
    );
}

export async function validateInstallation(installed: Installed, os: Os): Promise<void> {
    core.debug(`Validating installation for ${os}: ${JSON.stringify(installed)}`);
    await validateExecutable(installed.binDir, installed.executable, os);
    await validateVimDir(installed.vimDir);
    core.debug('Installation was successfully validated');
}
