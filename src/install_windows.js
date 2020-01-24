"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const core = __importStar(require("@actions/core"));
const vim_1 = require("./vim");
const neovim_1 = require("./neovim");
function installVimStable(token) {
    core.debug('Installing stable Vim on Windows');
    core.warning('No stable Vim release is officially created for Windows. Install nightly instead');
    return installVimNightly(token);
}
async function installVimNightly(token) {
    core.debug('Installing nightly Vim on Windows');
    const vimDir = await vim_1.installNightlyVimOnWindows(token);
    return {
        executable: path.join(vimDir, 'vim.exe'),
        bin: vimDir,
    };
}
async function installVim(ver) {
    core.debug(`Installing Vim version '${ver}' on Windows`);
    throw new Error(`Installing Vim of specific version '${ver}' is not supported yet`);
}
async function installNeovimStable() {
    core.debug('Installing stable Neovim on Windows');
    const nvimDir = await neovim_1.downloadNeovim('stable', 'windows');
    return {
        executable: path.join(nvimDir, 'bin', 'nvim.exe'),
        bin: path.join(nvimDir, 'bin'),
    };
}
async function installNeovimNightly() {
    core.debug('Installing nightly Neovim on Windows');
    const nvimDir = await neovim_1.downloadNeovim('nightly', 'windows');
    return {
        executable: path.join(nvimDir, 'bin', 'nvim.exe'),
        bin: path.join(nvimDir, 'bin'),
    };
}
async function installNeovim(ver) {
    core.debug(`Installing Neovim version '${ver}' on Windows`);
    throw new Error(`Installing NeoVim of specific version '${ver}' is not supported yet`);
}
function install(config) {
    if (config.neovim) {
        switch (config.version) {
            case 'stable':
                return installNeovimStable();
            case 'nightly':
                return installNeovimNightly();
            default:
                return installNeovim(config.version);
        }
    }
    else {
        const { token } = config;
        if (token === null) {
            throw new Error("Please set 'github-token' input to get the latest installer from official Vim release");
        }
        switch (config.version) {
            case 'stable':
                return installVimStable(token);
            case 'nightly':
                return installVimNightly(token);
            default:
                return installVim(config.version);
        }
    }
}
exports.install = install;
//# sourceMappingURL=install_windows.js.map