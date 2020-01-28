"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
function getBoolean(input, def) {
    const v = core_1.getInput(input).toLowerCase();
    if (v === '') {
        return def;
    }
    if (v === 'true' || v === 'false') {
        return v === 'true';
    }
    throw new Error(`'${input}' input only accepts boolean value 'true' or 'false' but got '${v}'`);
}
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
function getVersion() {
    const v = core_1.getInput('version').toLowerCase();
    if (v === '') {
        return 'stable';
    }
    if (v === 'stable' || v === 'nightly') {
        return v;
    }
    throw new Error(`For now 'version' input only accepts 'stable' or 'nightly' but got '${v}'`);
}
function getNeovim() {
    return getBoolean('neovim', false);
}
function getGitHubToken() {
    return core_1.getInput('github-token') || null;
}
function loadConfigFromInputs() {
    return {
        version: getVersion(),
        neovim: getNeovim(),
        os: getOs(),
        token: getGitHubToken(),
    };
}
exports.loadConfigFromInputs = loadConfigFromInputs;
//# sourceMappingURL=config.js.map