"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfigFromInputs = loadConfigFromInputs;
const core_1 = require("@actions/core");
const utils_1 = require("./utils");
function getBoolean(input, def) {
    const i = (0, core_1.getInput)(input).toLowerCase();
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
function getVersion(neovim) {
    const v = (0, core_1.getInput)('version');
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
        let msg = `'version' input '${v}' is not a format of Git tags in ${repo} repository. It should match to regex /${re}/. NOTE: It requires 'v' prefix`;
        if (!neovim) {
            msg += ". And the patch version of Vim must be in 4-digits like 'v8.2.0126'";
        }
        throw new Error(msg);
    }
    return v;
}
function getNeovim() {
    return getBoolean('neovim', false);
}
function loadConfigFromInputs() {
    const neovim = getNeovim();
    return {
        version: getVersion(neovim),
        neovim,
        os: (0, utils_1.getOs)(),
        arch: (0, utils_1.getArch)(),
        configureArgs: (0, core_1.getInput)('configure-args') || null,
        token: (0, core_1.getInput)('token') || null,
    };
}
//# sourceMappingURL=config.js.map