import { promises as fs, constants as fsconsts } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import * as core from '@actions/core';
import { exec } from './shell.js';
import { ensureError } from './system.js';
async function validateExecutable(path) {
    if (process.platform === 'win32') {
        if (!path.endsWith('.exe') && !path.endsWith('.EXE')) {
            throw new Error(`Validation failed! Installed binary is not an executable file: ${path}`);
        }
    }
    else {
        try {
            await fs.access(path, fsconsts.X_OK);
        }
        catch (e) {
            const err = ensureError(e);
            throw new Error(`Validation failed! Could not access the installed executable '${path}': ${err.message}`);
        }
    }
}
export async function validateInstallation(installed) {
    try {
        const s = await fs.stat(installed.binDir);
        if (!s.isDirectory()) {
            throw new Error(`Validation failed! '${installed.binDir}' is not a directory for executable`);
        }
    }
    catch (e) {
        const err = ensureError(e);
        throw new Error(`Validation failed! Could not stat installed directory '${installed.binDir}': ${err.message}`);
    }
    core.debug(`Installed directory '${installed.binDir}' was validated`);
    const fullPath = join(installed.binDir, installed.executable);
    await validateExecutable(fullPath);
    try {
        const ver = await exec(fullPath, ['--version']);
        console.log(`Installed version:\n${ver}`);
    }
    catch (e) {
        const err = ensureError(e);
        throw new Error(`Validation failed! Could not get version from executable '${fullPath}': ${err.message}`);
    }
    core.debug(`Installed executable '${fullPath}' was validated`);
}
//# sourceMappingURL=validate.js.map