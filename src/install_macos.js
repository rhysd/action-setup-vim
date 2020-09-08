"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
const path = __importStar(require("path"));
const core = __importStar(require("@actions/core"));
const shell_1 = require("./shell");
const vim_1 = require("./vim");
const neovim_1 = require("./neovim");
async function installVimStable() {
    core.debug('Installing stable Vim on macOS using Homebrew');
    await shell_1.exec('brew', ['install', 'macvim']);
    return {
        executable: 'vim',
        binDir: '/usr/local/bin',
    };
}
async function installVim(ver) {
    core.debug(`Installing Vim version '${ver !== null && ver !== void 0 ? ver : 'HEAD'}' on macOS`);
    const vimDir = await vim_1.buildVim(ver);
    return {
        executable: 'vim',
        binDir: path.join(vimDir, 'bin'),
    };
}
async function installNeovimStable() {
    core.debug('Installing stable Neovim on macOS using Homebrew');
    await shell_1.exec('brew', ['install', 'neovim']);
    return {
        executable: 'nvim',
        binDir: '/usr/local/bin',
    };
}
async function installNeovim(ver) {
    core.debug(`Installing Neovim version '${ver}' on macOS`);
    const nvimDir = await neovim_1.downloadNeovim(ver, 'macos');
    return {
        executable: 'nvim',
        binDir: path.join(nvimDir, 'bin'),
    };
}
function install(config) {
    if (config.neovim) {
        switch (config.version) {
            case 'stable':
                return installNeovimStable();
            case 'nightly':
                return installNeovim('nightly');
            default:
                return installNeovim(config.version);
        }
    }
    else {
        switch (config.version) {
            case 'stable':
                return installVimStable();
            case 'nightly':
                return installVim(null);
            default:
                return installVim(config.version);
        }
    }
}
exports.install = install;
//# sourceMappingURL=install_macos.js.map