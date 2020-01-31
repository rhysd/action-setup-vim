import { join } from 'path';
import * as core from '@actions/core';
import { loadConfigFromInputs } from './config';
import { install } from './install';
import { validateInstallation } from './validate';

async function main() {
    const config = loadConfigFromInputs();
    console.log('Extracted configuration:', config);

    const pathSep = process.platform === 'win32' ? ';' : ':';
    const installed = await install(config);
    await validateInstallation(installed);

    core.exportVariable('PATH', `${installed.bin}${pathSep}${process.env.PATH}`);
    core.debug(`'${installed.bin}' was set to $PATH`);

    const fullPath = join(installed.bin, installed.executable);
    core.setOutput('executable', fullPath);
    console.log('Installed executable:', fullPath);
    console.log('Installation successfully done:', installed);
}

main().catch(e => {
    core.debug(e.stack);
    core.error(e.message);
    core.setFailed(e.message);
});
