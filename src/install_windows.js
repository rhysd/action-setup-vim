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
const vim_1 = require("./vim");
const neovim_1 = require("./neovim");
async function installVimNightly() {
    core.debug('Installing nightly Vim on Windows');
    const vimDir = await vim_1.installNightlyVimOnWindows();
    return {
        executable: 'vim.exe',
        binDir: vimDir,
    };
}
function installVimStable() {
    core.debug('Installing stable Vim on Windows');
    core.warning('No stable Vim release is officially provided for Windows. Installing nightly instead');
    return installVimNightly();
}
async function installVim(ver) {
    core.debug(`Installing Vim version '${ver}' on Windows`);
    const vimDir = await vim_1.installVimOnWindows(ver);
    return {
        executable: 'vim.exe',
        binDir: vimDir,
    };
}
function neovimInstalled(nvimDir) {
    return {
        executable: 'nvim.exe',
        binDir: path.join(nvimDir, 'bin'),
    };
}
async function installNeovim(ver) {
    core.debug(`Installing Neovim version '${ver}' on Windows`);
    return neovimInstalled(await neovim_1.downloadNeovim(ver, 'windows'));
}
async function installStableNeovim(token) {
    core.debug(`Installing Neovim version 'stable' on Windows`);
    return neovimInstalled(await neovim_1.downloadStableNeovim('windows', token));
}
function install(config) {
    if (config.neovim) {
        switch (config.version) {
            case 'stable':
                return installStableNeovim(config.token);
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
                return installVimNightly();
            default:
                return installVim(config.version);
        }
    }
}
exports.install = install;
//# sourceMappingURL=install_windows.js.map