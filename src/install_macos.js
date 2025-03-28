"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.install = install;
const core = __importStar(require("@actions/core"));
const shell_1 = require("./shell");
const vim_1 = require("./vim");
const neovim_1 = require("./neovim");
function homebrewBinDir(arch) {
    switch (arch) {
        case 'arm64':
            return '/opt/homebrew/bin';
        case 'x86_64':
            return '/usr/local/bin';
        default:
            throw new Error(`CPU arch ${arch} is not supported by Homebrew`);
    }
}
async function brewInstall(pkg) {
    await (0, shell_1.exec)('brew', ['update', '--quiet']);
    await (0, shell_1.exec)('brew', ['install', pkg, '--quiet']);
}
async function installVimStable(arch) {
    core.debug('Installing stable Vim on macOS using Homebrew');
    await brewInstall('macvim');
    return {
        executable: 'vim',
        binDir: homebrewBinDir(arch),
    };
}
async function installNeovimStable(arch) {
    core.debug('Installing stable Neovim on macOS using Homebrew');
    await brewInstall('neovim');
    return {
        executable: 'nvim',
        binDir: homebrewBinDir(arch),
    };
}
async function install(config) {
    core.debug(`Installing ${config.neovim ? 'Neovim' : 'Vim'} ${config.version} version on macOS`);
    if (config.neovim) {
        switch (config.version) {
            case 'stable':
                return installNeovimStable(config.arch);
            case 'nightly':
                try {
                    return await (0, neovim_1.downloadNeovim)(config.version, 'macos', config.arch); // await is necessary to catch error
                }
                catch (e) {
                    const message = e instanceof Error ? e.message : String(e);
                    core.warning(`Neovim download failure for nightly on macOS: ${message}. Falling back to installing Neovim by building it from source`);
                    return (0, neovim_1.buildNightlyNeovim)('macos');
                }
            default:
                return (0, neovim_1.downloadNeovim)(config.version, 'macos', config.arch);
        }
    }
    else {
        if (config.version === 'stable') {
            return installVimStable(config.arch);
        }
        else {
            return (0, vim_1.buildVim)(config.version, config.os, config.configureArgs);
        }
    }
}
//# sourceMappingURL=install_macos.js.map