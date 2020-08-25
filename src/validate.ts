import { promises as fs, constants as fsconsts } from 'fs';
import { join } from 'path';
import * as core from '@actions/core';
import type { Installed } from './install';
import { exec } from './shell';

export async function validateInstallation(installed: Installed): Promise<void> {
    try {
        const s = await fs.stat(installed.bin);
        if (!s.isDirectory()) {
            throw new Error(`Validation failed! '${installed.bin}' is not a directory for executable`);
        }
    } catch (err) {
        throw new Error(`Validation failed! Could not stat installed directory '${installed.bin}': ${err.message}`);
    }
    core.debug(`Installed directory '${installed.bin}' was validated`);

    const fullPath = join(installed.bin, installed.executable);

    try {
        await fs.access(fullPath, fsconsts.X_OK);
    } catch (err) {
        throw new Error(`Validation failed! Could not access the installed executable '${fullPath}': ${err.message}`);
    }

    try {
        const ver = await exec(fullPath, ['--version']);
        console.log(`Installed version:\n${ver}`);
    } catch (err) {
        throw new Error(`Validation failed! Could not get version from executable '${fullPath}': ${err.message}`);
    }
    core.debug(`Installed executable '${fullPath}' was validated`);
}
