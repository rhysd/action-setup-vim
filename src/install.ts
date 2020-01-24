import * as core from '@actions/core';
import { Config } from './config';
import { install as installOnLinux } from './install_linux';
import { install as installOnMacOs } from './install_macos';
import { install as installOnWindows } from './install_windows';

export interface Installed {
    executable: string;
}

export function install(config: Config): Promise<Installed> {
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
