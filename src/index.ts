import { join } from 'node:path';
import * as core from '@actions/core';
import { loadConfigFromInputs } from './config.js';
import { install } from './install.js';
import { validateInstallation } from './validate.js';

async function main(): Promise<void> {
    const config = loadConfigFromInputs();
    core.info(`Extracted configuration: ${JSON.stringify(config, null, 2)}`);

    const installed = await install(config);
    await validateInstallation(installed, config.os);

    core.addPath(installed.binDir);
    core.debug(`'${installed.binDir}' was added to $PATH`);

    const fullPath = join(installed.binDir, installed.executable);
    core.setOutput('executable', fullPath);
    core.info(`Installed executable: ${fullPath}`);

    core.setOutput('vim-dir', installed.vimDir);
    core.info(`Installed $VIM directory: ${installed.vimDir}`);

    core.info(`Installation successfully done: ${JSON.stringify(installed, null, 2)}`);
}

main().catch((e: Error) => {
    if (e.stack) {
        core.debug(e.stack);
    }
    core.error(e.message);
    core.setFailed(e.message);
});
