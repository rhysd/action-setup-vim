"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const path = __importStar(require("path"));
const core = __importStar(require("@actions/core"));
const io_1 = require("@actions/io");
const shell_1 = require("./shell");
async function makeTmpdir() {
    const dir = os_1.tmpdir();
    await io_1.mkdirP(dir);
    core.debug(`Created temporary directory ${dir}`);
    return dir;
}
// Only available on macOS or Linux. Passing null to `version` means install HEAD
async function buildVim(version) {
    const installDir = path.join(os_1.homedir(), 'vim');
    core.debug(`Building and installing Vim to ${installDir} (version=${version})`);
    const dir = path.join(await makeTmpdir(), 'vim');
    await shell_1.exec('git', ['clone', '--depth=1', '--single-branch', '--no-tags', 'https://github.com/vim/vim', dir]);
    // TODO: Checkout specific version
    const opts = { cwd: dir };
    await shell_1.exec('./configure', [`--prefix=${installDir}`, '--with-features=huge', '--enable-fail-if-missing'], opts);
    await shell_1.exec('make', ['-j'], opts);
    await shell_1.exec('make', ['install'], opts);
    core.debug(`Built and installed Vim to ${installDir} (version=${version})`);
    return installDir;
}
exports.buildVim = buildVim;
//# sourceMappingURL=build_vim.js.map