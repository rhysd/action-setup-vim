import { homedir } from 'os';
import * as path from 'path';
import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import * as core from '@actions/core';
import * as io from '@actions/io';
import { makeTmpdir } from './utils';
import type { Os } from './config';
import { exec } from './shell';

function assetFileName(os: Os) {
    switch (os) {
        case 'macos':
            return 'nvim-macos.tar.gz';
        case 'linux':
            return `nvim-linux64.tar.gz`;
        case 'windows':
            return `nvim-win64.zip`;
    }
}

function assetDirName(os: Os) {
    switch (os) {
        case 'macos':
            return 'nvim-osx64';
        case 'linux':
            return 'nvim-linux64';
        case 'windows':
            return 'Neovim';
    }
}

async function unarchiveAsset(asset: string, os: Os): Promise<string> {
    const dir = path.dirname(asset);
    if (asset.endsWith('.tar.gz')) {
        await exec('tar', ['xzf', asset], { cwd: dir });
        return path.join(dir, assetDirName(os));
    } else if (asset.endsWith('.zip')) {
        await exec('unzip', [asset], { cwd: dir });
        return path.join(dir, assetDirName(os));
    } else {
        throw new Error(`FATAL: Don't know how to unarchive ${asset} on ${os}`);
    }
}

// version = 'stable' or 'nightly' or version string
export async function downloadNeovim(version: string, os: Os): Promise<string> {
    const file = assetFileName(os);
    const destDir = path.join(homedir(), 'nvim');
    const url = `https://github.com/neovim/neovim/releases/download/${version}/${file}`;
    console.log(`Downloading Neovim ${version} on ${os} from ${url} to ${destDir}`);

    const dlDir = await makeTmpdir();
    const asset = path.join(dlDir, file);

    try {
        core.debug(`Downloading asset ${asset}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Downloading asset failed: ${response.statusText}`);
        }
        const buffer = await response.buffer();
        await fs.writeFile(asset, buffer, { encoding: null });
        core.debug(`Downloaded asset ${asset}`);

        const unarchived = await unarchiveAsset(asset, os);
        core.debug(`Unarchived asset ${unarchived}`);

        await io.mv(unarchived, destDir);
        core.debug(`Installed Neovim ${version} on ${os} to ${destDir}`);

        return destDir;
    } catch (err) {
        core.debug(err.stack);
        let msg = `Could not download Neovim release from ${url}: ${err.message}. Please visit https://github.com/neovim/neovim/releases/tag/${version} to check the asset for ${os} was really uploaded`;
        if (version === 'nightly') {
            msg += ". Note that some assets are sometimes missing on nightly build due to Neovim's CI failure";
        }
        throw new Error(msg);
    }
}
