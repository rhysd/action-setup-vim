import * as core from '@actions/core';
import { install as installOnLinux } from './install_linux.js';
import { install as installOnMacOs } from './install_macos.js';
import { install as installOnWindows } from './install_windows.js';
export function install(config) {
    core.debug(`Detected operating system: ${config.os}`);
    switch (config.os) {
        case 'linux':
            return installOnLinux(config);
        case 'macos':
            return installOnMacOs(config);
        case 'windows':
            return installOnWindows(config);
    }
}
//# sourceMappingURL=install.js.map