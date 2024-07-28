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
exports.makeTmpdir = exports.exeName = exports.detectSystem = void 0;
const os_1 = require("os");
const core = __importStar(require("@actions/core"));
const io_1 = require("@actions/io");
function getOs() {
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
function getArch() {
    switch (process.arch) {
        case 'x64':
        case 'arm64':
            return process.arch;
        default:
            return 'other';
    }
}
function detectSystem() {
    // TODO: Add more validation.
    // - GitHub Actions supports arm64 Windows but neither Neovim nor Vim supports it
    // - GitHub Actions supports arm 32bit Linux but Neovim doesn't provide prebuilt binaries for it
    // See: https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners
    return { os: getOs(), arch: getArch() };
}
exports.detectSystem = detectSystem;
function exeName(isNeovim, os) {
    if (os === 'windows') {
        return isNeovim ? 'nvim.exe' : 'vim.exe';
    }
    else {
        return isNeovim ? 'nvim' : 'vim';
    }
}
exports.exeName = exeName;
async function makeTmpdir() {
    const dir = (0, os_1.tmpdir)();
    await (0, io_1.mkdirP)(dir);
    core.debug(`Created temporary directory ${dir}`);
    return dir;
}
exports.makeTmpdir = makeTmpdir;
//# sourceMappingURL=system.js.map