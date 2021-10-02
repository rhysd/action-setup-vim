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
exports.buildNightlyNeovim = exports.downloadStableNeovim = exports.downloadNeovim = void 0;
const os_1 = require("os");
const path = __importStar(require("path"));
const fs_1 = require("fs");
const node_fetch_1 = __importDefault(require("node-fetch"));
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@actions/io"));
const github = __importStar(require("@actions/github"));
const utils_1 = require("./utils");
const shell_1 = require("./shell");
function assetFileName(os) {
    switch (os) {
        case 'macos':
            return 'nvim-macos.tar.gz';
        case 'linux':
            return 'nvim-linux64.tar.gz';
        case 'windows':
            return 'nvim-win64.zip';
    }
}
function assetDirName(os) {
    switch (os) {
        case 'macos':
            return 'nvim-osx64';
        case 'linux':
            return 'nvim-linux64';
        case 'windows':
            return 'Neovim';
    }
}
async function unarchiveAsset(asset, os) {
    const dir = path.dirname(asset);
    if (asset.endsWith('.tar.gz')) {
        await (0, shell_1.exec)('tar', ['xzf', asset], { cwd: dir });
        return path.join(dir, assetDirName(os));
    }
    else if (asset.endsWith('.zip')) {
        await (0, shell_1.exec)('unzip', [asset], { cwd: dir });
        return path.join(dir, assetDirName(os));
    }
    else {
        throw new Error(`FATAL: Don't know how to unarchive ${asset} on ${os}`);
    }
}
// version = 'stable' or 'nightly' or version string
async function downloadNeovim(version, os) {
    var _a;
    const file = assetFileName(os);
    const destDir = path.join((0, os_1.homedir)(), `nvim-${version}`);
    const url = `https://github.com/neovim/neovim/releases/download/${version}/${file}`;
    console.log(`Downloading Neovim ${version} on ${os} from ${url} to ${destDir}`);
    const dlDir = await (0, utils_1.makeTmpdir)();
    const asset = path.join(dlDir, file);
    try {
        core.debug(`Downloading asset ${asset}`);
        const response = await (0, node_fetch_1.default)(url);
        if (!response.ok) {
            throw new Error(`Downloading asset failed: ${response.statusText}`);
        }
        const buffer = await response.buffer();
        await fs_1.promises.writeFile(asset, buffer, { encoding: null });
        core.debug(`Downloaded asset ${asset}`);
        const unarchived = await unarchiveAsset(asset, os);
        core.debug(`Unarchived asset ${unarchived}`);
        await io.mv(unarchived, destDir);
        core.debug(`Installed Neovim ${version} on ${os} to ${destDir}`);
        return {
            executable: (0, utils_1.exeName)(true, os),
            binDir: path.join(destDir, 'bin'),
        };
    }
    catch (e) {
        const err = (0, utils_1.ensureError)(e);
        core.debug((_a = err.stack) !== null && _a !== void 0 ? _a : err.message);
        let msg = `Could not download Neovim release from ${url}: ${err.message}. Please visit https://github.com/neovim/neovim/releases/tag/${version} to check the asset for ${os} was really uploaded`;
        if (version === 'nightly') {
            msg += ". Note that some assets are sometimes missing on nightly build due to Neovim's CI failure";
        }
        throw new Error(msg);
    }
}
exports.downloadNeovim = downloadNeovim;
async function fetchLatestVersion(token) {
    const octokit = github.getOctokit(token);
    const { data } = await octokit.rest.repos.listReleases({ owner: 'neovim', repo: 'neovim' });
    const re = /^v\d+\.\d+\.\d+$/;
    for (const release of data) {
        const tagName = release.tag_name;
        if (re.test(tagName)) {
            core.debug(`Detected the latest stable version '${tagName}'`);
            return tagName;
        }
    }
    core.debug(`No stable version was found in releases: ${JSON.stringify(data, null, 2)}`);
    throw new Error(`No stable version was found in ${data.length} releases`);
}
// Download stable asset from 'stable' release. When the asset is not found, get the latest version
// using GitHub API and retry downloading an asset with the version as fallback (#5).
async function downloadStableNeovim(os, token = null) {
    try {
        return await downloadNeovim('stable', os); // `await` is necessary to catch excetipn
    }
    catch (e) {
        const err = (0, utils_1.ensureError)(e);
        if (err.message.includes('Downloading asset failed:') && token !== null) {
            core.warning(`Could not download stable asset. Detecting the latest stable release from GitHub API as fallback: ${err.message}`);
            const ver = await fetchLatestVersion(token);
            core.warning(`Fallback to install asset from '${ver}' release`);
            return downloadNeovim(ver, os);
        }
        throw err;
    }
}
exports.downloadStableNeovim = downloadStableNeovim;
// Build nightly Neovim from sources as fallback of downloading nightly assets from the nightly release page of
// neovim/neovim repository (#18).
// https://github.com/neovim/neovim/wiki/Building-Neovim
async function buildNightlyNeovim(os) {
    core.debug(`Installing Neovim by building from source on ${os}`);
    switch (os) {
        case 'linux':
            core.debug('Installing build dependencies via apt');
            await (0, shell_1.exec)('sudo', [
                'apt-get',
                'install',
                '-y',
                '--no-install-recommends',
                'ninja-build',
                'gettext',
                'libtool',
                'libtool-bin',
                'autoconf',
                'automake',
                'cmake',
                'g++',
                'pkg-config',
                'unzip',
                'curl',
            ]);
            break;
        case 'macos':
            core.debug('Installing build dependencies via Homebrew');
            await (0, shell_1.exec)('brew', ['install', 'ninja', 'libtool', 'automake', 'cmake', 'pkg-config', 'gettext', 'curl']);
            break;
        default:
            throw new Error(`Building Neovim from soruce is not supported for ${os} platform`);
    }
    // Add -nightly suffix since building stable Neovim from source may be supported in the future
    const installDir = path.join((0, os_1.homedir)(), 'nvim-nightly');
    core.debug(`Building and installing Neovim to ${installDir}`);
    const dir = path.join(await (0, utils_1.makeTmpdir)(), 'build-nightly-neovim');
    await (0, shell_1.exec)('git', ['clone', '--depth=1', 'https://github.com/neovim/neovim.git', dir]);
    const opts = { cwd: dir };
    const makeArgs = ['-j', `CMAKE_EXTRA_FLAGS=-DCMAKE_INSTALL_PREFIX=${installDir}`, 'CMAKE_BUILD_TYPE=RelWithDebug'];
    await (0, shell_1.exec)('make', makeArgs, opts);
    core.debug(`Built Neovim in ${opts.cwd}. Installing it via 'make install'`);
    await (0, shell_1.exec)('make', ['install'], opts);
    core.debug(`Installed Neovim to ${installDir}`);
    return {
        executable: (0, utils_1.exeName)(true, os),
        binDir: path.join(installDir, 'bin'),
    };
}
exports.buildNightlyNeovim = buildNightlyNeovim;
//# sourceMappingURL=neovim.js.map