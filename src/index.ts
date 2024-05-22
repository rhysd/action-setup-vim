import { join } from 'path';
import * as core from '@actions/core';
import { getInputs } from './inputs';
import { install } from './install';
import { validateInstallation } from './validate';
import { detectSystem } from './system';
import { ensureError } from './error';

async function main(): Promise<void> {
    const inputs = getInputs();
    console.log('Extracted inputs:', inputs);

    const system = detectSystem();
    console.log('Detected system information:', system);

    const installed = await install(inputs, system);
    await validateInstallation(installed);

    core.addPath(installed.binDir);
    core.debug(`'${installed.binDir}' was added to $PATH`);

    const fullPath = join(installed.binDir, installed.executable);
    core.setOutput('executable', fullPath);
    console.log('Installed executable:', fullPath);
    console.log('Installation successfully done:', installed);
}

main().catch((e: unknown) => {
    const err = ensureError(e);
    if (err.stack) {
        core.debug(err.stack);
    }
    core.error(err.message);
    core.setFailed(err.message);
});
