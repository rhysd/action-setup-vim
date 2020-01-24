"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
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
function loadConfigFromInputs() {
    // TODO: Validate inputs
    const version = core_1.getInput('version').toLowerCase() || 'stable';
    const neovim = core_1.getInput('neovim').toLowerCase() === 'true';
    const os = getOs();
    const token = core_1.getInput('github-token') || null;
    return { version, neovim, os, token };
}
exports.loadConfigFromInputs = loadConfigFromInputs;
//# sourceMappingURL=config.js.map