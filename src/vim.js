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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installNightlyVimOnWindows = exports.installVimOnWindows = exports.detectLatestWindowsReleaseTag = exports.buildVim = exports.versionIsOlderThan8_2_1119 = void 0;
const os_1 = require("os");
const path = __importStar(require("path"));
const fs_1 = require("fs");
const assert_1 = require("assert");
const node_fetch_1 = __importDefault(require("node-fetch"));
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@actions/io"));
const shell_1 = require("./shell");
const utils_1 = require("./utils");
// eslint-disable-next-line @typescript-eslint/naming-convention
function versionIsOlderThan8_2_1119(version) {
    var _a;
    // Note: Patch version may not exist on v7 or earlier
    const majorStr = (_a = version.match(/^v(\d+)\./)) === null || _a === void 0 ? void 0 : _a[1];
    if (!majorStr) {
        return false; // Invalid case. Should be unreachable
    }
    const major = parseInt(majorStr, 10);
    if (major !== 8) {
        return major < 8;
    }
    const m = version.match(/\.(\d+)\.(\d{4})$/); // Extract minor and patch versions
    if (!m) {
        return false; // Invalid case. Should be unreachable
    }
    const minor = parseInt(m[1], 10);
    if (minor !== 2) {
        return minor < 2;
    }
    const patch = parseInt(m[2], 10);
    return patch < 1119;
}
exports.versionIsOlderThan8_2_1119 = versionIsOlderThan8_2_1119;
async function getXcode11DevDir() {
    // Xcode10~12 are available at this point:
    // https://github.com/actions/virtual-environments/blob/main/images/macos/macos-10.15-Readme.md#xcode
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const dir = process.env.XCODE_11_DEVELOPER_DIR || '/Applications/Xcode_11.7.app/Contents/Developer';
    try {
        await fs_1.promises.access(dir);
        return dir;
    }
    catch (e) {
        return null;
    }
}
// Only available on macOS or Linux. Passing null to `version` means install HEAD
async function buildVim(version, os) {
    assert_1.strict.notEqual(version, 'stable');
    const installDir = path.join(os_1.homedir(), 'vim');
    core.debug(`Building and installing Vim to ${installDir} (version=${version !== null && version !== void 0 ? version : 'HEAD'})`);
    const dir = path.join(await utils_1.makeTmpdir(), 'vim');
    const args = ['clone', '--depth=1', '--single-branch'];
    if (version === 'nightly') {
        args.push('--no-tags');
    }
    else {
        args.push('--branch', version);
    }
    args.push('https://github.com/vim/vim', dir);
    await shell_1.exec('git', args);
    const env = {};
    if (os === 'macos' && versionIsOlderThan8_2_1119(version)) {
        const dir = await getXcode11DevDir();
        if (dir !== null) {
            // Vim before v8.2.1119 cannot be built with Xcode 12 or later. It requires Xcode 11.
            //   ref: https://github.com/vim/vim/commit/5289783e0b07cfc3f92ee933261ca4c4acdca007
            // By setting $DEVELOPER_DIR environment variable, Xcode11 is used to build Vim.
            //   ref: https://www.jessesquires.com/blog/2020/01/06/selecting-an-xcode-version-on-github-ci/
            // Note that xcode-select command is not available since it changes Xcode version in system global.
            env['DEVELOPER_DIR'] = dir;
            core.debug(`Building Vim older than 8.2.1119 on macOS with Xcode11 at ${dir} instead of the latest Xcode`);
        }
        else {
            core.warning(`Building Vim older than 8.2.1119 on macOS but proper Xcode is not found at ${dir}. Using the latest Xcode`);
        }
    }
    const opts = { cwd: dir, env };
    await shell_1.exec('./configure', [`--prefix=${installDir}`, '--with-features=huge', '--enable-fail-if-missing'], opts);
    await shell_1.exec('make', ['-j'], opts);
    await shell_1.exec('make', ['install'], opts);
    core.debug(`Built and installed Vim to ${installDir} (version=${version})`);
    return {
        executable: utils_1.exeName(false, os),
        binDir: path.join(installDir, 'bin'),
    };
}
exports.buildVim = buildVim;
async function getVimRootDirAt(dir) {
    // Search root Vim directory such as 'vim82' in unarchived directory
    const entries = await fs_1.promises.readdir(dir);
    const re = /^vim\d+$/;
    for (const entry of entries) {
        if (!re.test(entry)) {
            continue;
        }
        const p = path.join(dir, entry);
        const s = await fs_1.promises.stat(p);
        if (!s.isDirectory()) {
            continue;
        }
        return p;
    }
    throw new Error(`Vim directory such as 'vim82' was not found in ${JSON.stringify(entries)} in unarchived directory '${dir}'`);
}
async function detectLatestWindowsReleaseTag() {
    const url = 'https://github.com/vim/vim-win32-installer/releases/latest';
    try {
        const res = await node_fetch_1.default(url, {
            method: 'HEAD',
            redirect: 'manual',
        });
        if (res.status !== 302) {
            throw new Error(`Expected status 302 (Redirect) but got ${res.status} (${res.statusText})`);
        }
        const location = res.headers.get('location');
        if (!location) {
            throw new Error(`'Location' header is not included in a response: ${JSON.stringify(res.headers.raw())}`);
        }
        const m = location.match(/\/releases\/tag\/(.+)$/);
        if (m === null) {
            throw new Error(`Unexpected redirect to ${location}. Redirected URL is not for release`);
        }
        core.debug(`Latest Vim relese tag ${m[1]} was extracted from redirect`);
        return m[1];
    }
    catch (err) {
        core.error(err.message);
        core.debug(err.stack);
        throw new Error(`${err.message}: Could not get latest release tag from ${url}`);
    }
}
exports.detectLatestWindowsReleaseTag = detectLatestWindowsReleaseTag;
async function installVimAssetOnWindows(file, url) {
    const tmpdir = await utils_1.makeTmpdir();
    const dlDir = path.join(tmpdir, 'vim-installer');
    await io.mkdirP(dlDir);
    const assetFile = path.join(dlDir, file);
    try {
        core.debug(`Downloading asset at ${url} to ${dlDir}`);
        const response = await node_fetch_1.default(url);
        if (!response.ok) {
            throw new Error(`Downloading asset failed: ${response.statusText}`);
        }
        const buffer = await response.buffer();
        await fs_1.promises.writeFile(assetFile, buffer, { encoding: null });
        core.debug(`Downloaded installer from ${url} to ${assetFile}`);
        await shell_1.exec('unzip', [assetFile], { cwd: dlDir });
    }
    catch (err) {
        core.debug(err.stack);
        throw new Error(`Could not download and unarchive asset ${url} at ${dlDir}: ${err.message}`);
    }
    const unzippedDir = path.join(dlDir, 'vim'); // Unarchived to 'vim' directory
    const vimDir = await getVimRootDirAt(unzippedDir);
    core.debug(`Unzipped installer from ${url} and found Vim directory ${vimDir}`);
    const destDir = path.join(os_1.homedir(), 'vim');
    await io.mv(vimDir, destDir);
    core.debug(`Vim was installed to ${destDir}`);
    return destDir;
}
async function installVimOnWindows(tag) {
    const ver = tag.slice(1); // Strip 'v' prefix
    // e.g. https://github.com/vim/vim-win32-installer/releases/download/v8.2.0158/gvim_8.2.0158_x64.zip
    const url = `https://github.com/vim/vim-win32-installer/releases/download/${tag}/gvim_${ver}_x64.zip`;
    const file = `gvim_${ver}_x64.zip`;
    const destDir = await installVimAssetOnWindows(file, url);
    return {
        executable: utils_1.exeName(false, 'windows'),
        binDir: destDir,
    };
}
exports.installVimOnWindows = installVimOnWindows;
async function installNightlyVimOnWindows() {
    const latestTag = await detectLatestWindowsReleaseTag();
    return installVimOnWindows(latestTag);
}
exports.installNightlyVimOnWindows = installNightlyVimOnWindows;
//# sourceMappingURL=vim.js.map