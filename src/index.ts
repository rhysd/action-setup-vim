import { join } from 'node:path';
import * as core from '@actions/core';
import { loadConfigFromInputs } from './config.js';
import { install } from './install.js';
import { validateInstallation } from './validate.js';

async function main(): Promise<void> {
    const config = loadConfigFromInputs();
    console.log('Extracted configuration:', config);

    const installed = await install(config);
    await validateInstallation(installed);

    core.addPath(installed.binDir);
    core.debug(`'${installed.binDir}' was added to $PATH`);

    const fullPath = join(installed.binDir, installed.executable);
    core.setOutput('executable', fullPath);
    console.log('Installed executable:', fullPath);

    core.setOutput('vim-dir', installed.vimDir);
    console.log('Installed $VIM directory:', installed.vimDir);

    console.log('Installation successfully done:', installed);
}

main().catch((e: Error) => {
    if (e.stack) {
        core.debug(e.stack);
    }
    core.error(e.message);
    core.setFailed(e.message);
});
