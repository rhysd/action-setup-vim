import * as core from '@actions/core';
import { loadConfigFromInputs } from './config';
import { install } from './install';

async function main() {
    const config = loadConfigFromInputs();
    console.log('Extracted configuration:', config);

    const installed = await install(config);
    core.setOutput('executable', installed.executable);
    console.log('Installation successfully done:', installed);
}

try {
    main();
} catch (e) {
    core.debug(e.stack);
    core.setFailed(e.message);
}
