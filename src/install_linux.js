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
const core = __importStar(require("@actions/core"));
const shell_1 = require("./shell");
const vim_1 = require("./vim");
const neovim_1 = require("./neovim");
async function installVimStable() {
    core.debug('Installing stable Vim on Linux using apt');
    await shell_1.exec('sudo', ['apt', 'update', '-y']);
    await shell_1.exec('sudo', ['apt', 'install', '-y', 'vim-gnome']);
    return {
        executable: 'vim',
        binDir: '/usr/bin',
    };
}
function install(config) {
    core.debug(`Installing ${config.neovim ? 'Neovim' : 'Vim'} version '${config.version}' on Linux`);
    if (config.neovim) {
        if (config.version === 'stable') {
            return neovim_1.downloadStableNeovim('linux', config.token);
        }
        else {
            return neovim_1.downloadNeovim(config.version, 'linux');
        }
    }
    else {
        if (config.version === 'stable') {
            return installVimStable();
        }
        else {
            return vim_1.buildVim(config.version, config.os);
        }
    }
}
exports.install = install;
//# sourceMappingURL=install_linux.js.map