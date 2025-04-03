import { promises as fs, constants as fsconsts } from 'fs';
import { join } from 'path';
import * as core from '@actions/core';
import type { Installed } from './install.js';
import { exec } from './shell.js';
import { ensureError } from './system.js';

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

    const fullPath = join(installed.binDir, installed.executable);

    try {
        await fs.access(fullPath, fsconsts.X_OK);
    } catch (e) {
        const err = ensureError(e);
        throw new Error(`Validation failed! Could not access the installed executable '${fullPath}': ${err.message}`);
    }

    try {
        const ver = await exec(fullPath, ['--version']);
        console.log(`Installed version:\n${ver}`);
    } catch (e) {
        const err = ensureError(e);
        throw new Error(`Validation failed! Could not get version from executable '${fullPath}': ${err.message}`);
    }
    core.debug(`Installed executable '${fullPath}' was validated`);
}
