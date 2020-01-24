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
const shell_1 = require("./shell");
const vim_1 = require("./vim");
const neovim_1 = require("./neovim");
async function installVimStable() {
    core.debug('Installing stable Vim on macOS');
    await shell_1.exec('brew', ['install', 'macvim']);
    return {
        executable: '/usr/local/bin/vim',
        bin: '/usr/local/bin',
    };
    throw new Error('Not implemented');
}
async function installVimNightly() {
    core.debug('Installing nightly Vim on macOS');
    const vimDir = await vim_1.buildVim(null);
    return {
        executable: path.join(vimDir, 'bin', 'vim'),
        bin: path.join(vimDir, 'bin'),
    };
}
async function installVim(ver) {
    core.debug(`Installing Vim version '${ver}' on macOS`);
    throw new Error(`Installing Vim of specific version '${ver}' is not supported yet`);
}
async function installNeovimStable() {
    core.debug('Installing stable Neovim on macOS');
    const nvimDir = await neovim_1.downloadNeovim('stable', 'macos');
    return {
        executable: path.join(nvimDir, 'bin', 'nvim'),
        bin: path.join(nvimDir, 'bin'),
    };
}
async function installNeovimNightly() {
    core.debug('Installing nightly Neovim on macOS');
    const nvimDir = await neovim_1.downloadNeovim('nightly', 'macos');
    return {
        executable: path.join(nvimDir, 'bin', 'nvim'),
        bin: path.join(nvimDir, 'bin'),
    };
}
async function installNeovim(ver) {
    core.debug(`Installing Neovim version '${ver}' on macOS`);
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
//# sourceMappingURL=install_macos.js.map