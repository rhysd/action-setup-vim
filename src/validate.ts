import { promises as fs } from 'fs';
import { join } from 'path';
import * as core from '@actions/core';
import { Installed } from './install';
import { exec } from './shell';

export async function validateInstallation(installed: Installed) {
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
        const ver = await exec(fullPath, ['--version']);
        console.log(`Installed version:\n${ver}`);
    } catch (err) {
        throw new Error(`Validation failed! Could not get version from executable '${fullPath}': ${err.message}`);
    }
    core.debug(`Installed executable '${fullPath}' was validated`);
}
