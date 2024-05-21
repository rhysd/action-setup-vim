import * as core from '@actions/core';
import type { Inputs } from './inputs';
import type { System, ExeName } from './system';
import { install as installOnLinux } from './install_linux';
import { install as installOnMacOs } from './install_macos';
import { install as installOnWindows } from './install_windows';

export interface Installed {
    readonly executable: ExeName;
    readonly binDir: string;
}

export function install(inputs: Inputs, system: System): Promise<Installed> {
    core.debug(`Detected operating system: ${system.os}`);
    switch (system.os) {
        case 'linux':
            return installOnLinux(inputs, system);
        case 'macos':
            return installOnMacOs(inputs, system);
        case 'windows':
            return installOnWindows(inputs, system);
    }
}
