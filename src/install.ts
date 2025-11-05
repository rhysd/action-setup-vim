import * as core from '@actions/core';
import type { Config } from './config.js';
import { install as installOnLinux } from './install_linux.js';
import { install as installOnMacOs } from './install_macos.js';
import { install as installOnWindows } from './install_windows.js';

export type ExeName = 'vim' | 'nvim' | 'vim.exe' | 'nvim.exe';

export interface Installed {
    readonly executable: ExeName;
    readonly binDir: string;
    readonly vimDir: string;
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
