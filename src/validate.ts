import { promises as fs, constants as fsconsts } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import * as core from '@actions/core';
import type { Installed } from './install.js';
import { exec } from './shell.js';
import { ensureError } from './system.js';

async function validateExecutable(path: string): Promise<void> {
    if (process.platform === 'win32') {
        if (!path.endsWith('.exe') && !path.endsWith('.EXE')) {
            throw new Error(`Validation failed! Installed binary is not an executable file: ${path}`);
        }
    } else {
        try {
            await fs.access(path, fsconsts.X_OK);
        } catch (e) {
            const err = ensureError(e);
            throw new Error(`Validation failed! Could not access the installed executable '${path}': ${err.message}`);
        }
    }

    try {
        const ver = await exec(path, ['--version']);
        console.log(`Installed version:\n${ver}`);
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
        if (reVimRuntime.test(entry) || entry === 'runtime' || entry === 'nvim') {
            core.debug(`$VIM directory '${path}' was validated`);
            return; // OK
        }
    }

    throw new Error(
        `Validation failed! $VIM directory ${path} contains no $VIMRUNTIME directory: ${JSON.stringify(entries)}`,
    );
}

export async function validateInstallation(installed: Installed): Promise<void> {
    try {
        const s = await fs.stat(installed.binDir);
        if (!s.isDirectory()) {
            throw new Error(`Validation failed! '${installed.binDir}' is not a directory for executable`);
        }
    } catch (e) {
        const err = ensureError(e);
        throw new Error(`Validation failed! Could not stat installed directory '${installed.binDir}': ${err.message}`);
    }
    core.debug(`Installed directory '${installed.binDir}' was validated`);

    await validateExecutable(join(installed.binDir, installed.executable));
    await validateVimDir(installed.vimDir);

    core.debug(`Installation was successfully validated: ${JSON.stringify(installed)}`);
}
