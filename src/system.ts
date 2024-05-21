export type Os = 'macos' | 'linux' | 'windows';
export type Arch = 'x64' | 'arm64' | 'other';
export type ExeName = 'vim' | 'nvim' | 'vim.exe' | 'nvim.exe';

function getOs(): Os {
    switch (process.platform) {
        case 'darwin':
            return 'macos';
        case 'linux':
            return 'linux';
        case 'win32':
            return 'windows';
        default:
            throw new Error(`Platform '${process.platform}' is not supported`);
    }
}

function getArch(): Arch {
    switch (process.arch) {
        case 'x64':
        case 'arm64':
            return process.arch;
        default:
            return 'other';
    }
}

export interface System {
    readonly os: Os;
    readonly arch: Arch;
}

export function detectSystem(): System {
    // TODO: Add more validation.
    // - GitHub Actions supports arm64 Windows but neither Neovim nor Vim supports it
    // - GitHub Actions supports arm 32bit Linux but Neovim doesn't provide prebuilt binaries for it
    // See: https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners
    return { os: getOs(), arch: getArch() };
}

export function exeName(isNeovim: boolean, os: Os): ExeName {
    if (os === 'windows') {
        return isNeovim ? 'nvim.exe' : 'vim.exe';
    } else {
        return isNeovim ? 'nvim' : 'vim';
    }
}
