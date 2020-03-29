import * as path from 'path';
import { strict as A } from 'assert';
import { validateInstallation } from '../src/validate';
import { Installed } from '../src/install';

function getFakedInstallation(): Installed {
    // Use node executable instead of Vim or Neovim binaries
    const fullPath = process.argv[0];
    const executable = path.basename(fullPath);
    const bin = path.dirname(fullPath);
    return { executable, bin };
}

describe('validateInstallation()', function () {
    it('does nothing when correct installation is passed', async function () {
        const installed = getFakedInstallation();
        await validateInstallation(installed); // Check no exception
    });

    it("throws an error when 'bin' directory does not exist", async function () {
        const installed = { ...getFakedInstallation(), bin: '/path/to/somewhere/not/exist' };
        await A.rejects(() => validateInstallation(installed), /Could not stat installed directory/);
    });

    it("throws an error when 'bin' directory is actually a file", async function () {
        const installed = { ...getFakedInstallation(), bin: __filename };
        await A.rejects(() => validateInstallation(installed), /is not a directory for executable/);
    });

    it("throws an error when 'executable' file does not exist in 'bin' directory", async function () {
        const installed = { bin: __dirname, executable: 'this-file-does-not-exist-probably' };
        await A.rejects(() => validateInstallation(installed), /Could not access the installed executable/);
    });

    it("throws an error when file specified with 'executable' is actually not executable", async function () {
        // This file exists but not executable
        const installed = { executable: path.basename(__filename), bin: __dirname };
        await A.rejects(() => validateInstallation(installed), /Could not access the installed executable/);
    });

    it('throws an error when getting version from executable failed', async function () {
        // prepare-release.sh exists and executable but does not support --version option
        const bin = path.join(path.dirname(__dirname), 'scripts');
        const executable = 'prepare-release.sh';
        const installed = { executable, bin };
        await A.rejects(() => validateInstallation(installed), /Could not get version from executable/);
    });
});
