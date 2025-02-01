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
const vim_1 = require("./vim");
const neovim_1 = require("./neovim");
function install(config) {
    core.debug(`Installing ${config.neovim ? 'Neovim' : 'Vim'} ${config.version} version on Windows`);
    if (config.neovim) {
        switch (config.version) {
            case 'stable':
                return (0, neovim_1.downloadStableNeovim)('windows', config.arch, config.token);
            default:
                return (0, neovim_1.downloadNeovim)(config.version, 'windows', config.arch);
        }
    }
    else {
        switch (config.version) {
            case 'stable':
                core.debug('Installing stable Vim on Windows');
                core.warning('No stable Vim release is officially provided for Windows. Installing nightly instead');
                return (0, vim_1.installNightlyVimOnWindows)('stable');
            case 'nightly':
                return (0, vim_1.installNightlyVimOnWindows)('nightly');
            default:
                return (0, vim_1.installVimOnWindows)(config.version, config.version);
        }
    }
}
//# sourceMappingURL=install_windows.js.map