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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.install = void 0;
const core = __importStar(require("@actions/core"));
const shell_1 = require("./shell");
const vim_1 = require("./vim");
const neovim_1 = require("./neovim");
function homebrewBinDir() {
    return process.arch === 'arm64' ? '/opt/homebrew/bin' : '/usr/local/bin';
}
async function installVimStable() {
    core.debug('Installing stable Vim on macOS using Homebrew');
    await (0, shell_1.exec)('brew', ['install', 'macvim']);
    return {
        executable: 'vim',
        binDir: homebrewBinDir(),
    };
}
async function installNeovimStable() {
    core.debug('Installing stable Neovim on macOS using Homebrew');
    await (0, shell_1.exec)('brew', ['install', 'neovim']);
    return {
        executable: 'nvim',
        binDir: homebrewBinDir(),
    };
}
async function install(config) {
    core.debug(`Installing ${config.neovim ? 'Neovim' : 'Vim'} ${config.version} version on macOS`);
    if (config.neovim) {
        switch (config.version) {
            case 'stable':
                return installNeovimStable();
            case 'nightly':
                try {
                    return await (0, neovim_1.downloadNeovim)(config.version, 'macos'); // await is necessary to catch error
                }
                catch (e) {
                    const message = e instanceof Error ? e.message : String(e);
                    core.warning(`Neovim download failure for nightly on macOS: ${message}. Falling back to installing Neovim by building it from source`);
                    return (0, neovim_1.buildNightlyNeovim)('macos');
                }
            default:
                return (0, neovim_1.downloadNeovim)(config.version, 'macos');
        }
        if (config.version === 'stable') {
            return installNeovimStable();
        }
        else {
            return (0, neovim_1.downloadNeovim)(config.version, 'macos');
        }
    }
    else {
        if (config.version === 'stable') {
            return installVimStable();
        }
        else {
            return (0, vim_1.buildVim)(config.version, config.os, config.configureArgs);
        }
    }
}
exports.install = install;
//# sourceMappingURL=install_macos.js.map