import { promises as fs } from 'fs';
import * as core from '@actions/core';
import { Installed } from './install';
import { exec } from './shell';

export async function validateInstallation(installed: Installed) {
    try {
        const s = await fs.stat(installed.bin);
        if (!s.isDirectory()) {
            throw new Error(`Validation failed! Installed directory '${installed.bin}' does not exist`);
        }
    } catch (err) {
        throw new Error(`Validation failed! Cannot stat installed directory '${installed.bin}': ${err.message}`);
    }
    core.debug(`Installed directory ${installed.bin} was validated`);

    try {
        const ver = await exec(installed.executable, '--version');
        console.log(`Installed version:\n${ver}`);
    } catch (err) {
        throw new Error(`Validation failed! Cannot get version with '${installed.executable}': ${err.message}`);
    }
    core.debug(`Installed executable ${installed.executable} was validated`);
}
