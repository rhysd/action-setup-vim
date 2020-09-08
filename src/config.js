"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfigFromInputs = void 0;
const core_1 = require("@actions/core");
function getBoolean(input, def) {
    const i = core_1.getInput(input).toLowerCase();
    switch (i) {
        case '':
            return def;
        case 'true':
            return true;
        case 'false':
            return false;
        default:
            throw new Error(`'${input}' input only accepts boolean values 'true' or 'false' but got '${i}'`);
    }
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
function getVersion(neovim) {
    const v = core_1.getInput('version');
    if (v === '') {
        return 'stable';
    }
    const l = v.toLowerCase();
    if (l === 'stable' || l === 'nightly') {
        return l;
    }
    const re = neovim ? /^v\d+\.\d+\.\d+$/ : /^v7\.\d+(?:\.\d+)?$|^v\d+\.\d+\.\d{4}$/;
    if (!re.test(v)) {
        const repo = neovim ? 'neovim/neovim' : 'vim/vim';
        throw new Error(`'version' input '${v}' is not a format of Git tags in ${repo} repository. It should match to regex /${re}/`);
    }
    return v;
}
function getNeovim() {
    return getBoolean('neovim', false);
}
function loadConfigFromInputs() {
    var _a;
    const neovim = getNeovim();
    return {
        version: getVersion(neovim),
        neovim,
        os: getOs(),
        token: (_a = core_1.getInput('token')) !== null && _a !== void 0 ? _a : null,
    };
}
exports.loadConfigFromInputs = loadConfigFromInputs;
//# sourceMappingURL=config.js.map