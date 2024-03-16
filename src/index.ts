import { join } from 'path';
import * as core from '@actions/core';
import { loadConfigFromInputs } from './config';
import { install } from './install';
import { validateInstallation } from './validate';

async function main(): Promise<void> {
    const config = loadConfigFromInputs();
    console.log('Extracted configuration:', config);

    const pathSep = process.platform === 'win32' ? ';' : ':';
    const installed = await install(config);
    await validateInstallation(installed);

    core.exportVariable('PATH', `${installed.binDir}${pathSep}${process.env['PATH']}`);
    core.debug(`'${installed.binDir}' was set to $PATH`);

    const fullPath = join(installed.binDir, installed.executable);
    core.setOutput('executable', fullPath);
    console.log('Installed executable:', fullPath);
    console.log('Installation successfully done:', installed);
}

main().catch((e: Error) => {
    core.debug(e.stack);
    core.error(e.message);
    core.setFailed(e.message);
});
