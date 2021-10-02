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
const ubuntu_version_1 = require("ubuntu-version");
const shell_1 = require("./shell");
const vim_1 = require("./vim");
const neovim_1 = require("./neovim");
async function isUbuntu18OrEarlier() {
    const version = await (0, ubuntu_version_1.getUbuntuVersion)();
    if (version.length === 0) {
        core.error('Trying to install apt package but current OS is not Ubuntu');
        return false; // Should be unreachable
    }
    core.debug(`Ubuntu system version: ${version}`);
    return version[0] <= 18;
}
async function installVimStable() {
    core.debug('Installing stable Vim on Linux using apt');
    const pkg = (await isUbuntu18OrEarlier()) ? 'vim-gnome' : 'vim-gtk3';
    await (0, shell_1.exec)('sudo', ['apt-get', 'update', '-y']);
    await (0, shell_1.exec)('sudo', ['apt-get', 'install', '-y', '--no-install-recommends', pkg]);
    return {
        executable: 'vim',
        binDir: '/usr/bin',
    };
}
async function install(config) {
    core.debug(`Installing ${config.neovim ? 'Neovim' : 'Vim'} version '${config.version}' on Linux`);
    if (config.neovim) {
        switch (config.version) {
            case 'stable':
                return (0, neovim_1.downloadStableNeovim)('linux', config.token);
            case 'nightly':
                try {
                    return await (0, neovim_1.downloadNeovim)(config.version, 'linux'); // await is necessary to catch error
                }
                catch (e) {
                    const message = e instanceof Error ? e.message : e;
                    core.warning(`Neovim download failure for nightly on Linux: ${message}. Falling back to installing Neovim by building it from source`);
                    return (0, neovim_1.buildNightlyNeovim)('linux');
                }
            default:
                return (0, neovim_1.downloadNeovim)(config.version, 'linux');
        }
    }
    else {
        if (config.version === 'stable') {
            return installVimStable();
        }
        else {
            return (0, vim_1.buildVim)(config.version, config.os);
        }
    }
}
exports.install = install;
//# sourceMappingURL=install_linux.js.map