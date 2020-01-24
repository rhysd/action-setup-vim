"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const path = __importStar(require("path"));
const fs_1 = require("fs");
const node_fetch_1 = __importDefault(require("node-fetch"));
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@actions/io"));
const utils_1 = require("./utils");
const shell_1 = require("./shell");
function assetFileName(os) {
    switch (os) {
        case 'macos':
            return 'nvim-macos.tar.gz';
        case 'linux':
            return `nvim-linux64.tar.gz`;
        case 'windows':
            return `nvim-win64.zip`;
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
        await shell_1.exec('tar', ['xzf', asset], { cwd: dir });
        return path.join(dir, assetDirName(os));
    }
    else if (asset.endsWith('.zip')) {
        await shell_1.exec('unzip', [asset], { cwd: dir });
        return path.join(dir, assetDirName(os));
    }
    else {
        throw new Error(`FATAL: Don't know how to unarchive ${asset}`);
    }
}
// version = 'stable' or 'nightly' or version string
async function downloadNeovim(version, os) {
    const file = assetFileName(os);
    const destDir = path.join(os_1.homedir(), 'nvim');
    const url = `https://github.com/neovim/neovim/releases/download/${version}/${file}`;
    console.log(`Downloading Neovim ${version} on ${os} from ${url} to ${destDir}`);
    const dlDir = await utils_1.makeTmpdir();
    const asset = path.join(dlDir, file);
    try {
        core.debug(`Downloading asset ${asset}`);
        const response = await node_fetch_1.default(url);
        if (!response.ok) {
            throw new Error(`Downloading asset from ${url} failed: ${response.statusText}`);
        }
        const buffer = await response.buffer();
        await fs_1.promises.writeFile(asset, buffer, { encoding: null });
        core.debug(`Downloaded asset ${asset}`);
        const unarchived = await unarchiveAsset(asset, os);
        core.debug(`Unarchived asset ${unarchived}`);
        await io.mv(unarchived, destDir);
        core.debug(`Installed Neovim ${version} on ${os} to ${destDir}`);
        return destDir;
    }
    catch (err) {
        core.debug(err.stack);
        throw new Error(`Could not download Neovim release from ${url}: ${err.message}`);
    }
}
exports.downloadNeovim = downloadNeovim;
//# sourceMappingURL=neovim.js.map