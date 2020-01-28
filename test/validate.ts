import * as path from 'path';
import { strict as A } from 'assert';
import { validateInstallation } from '../src/validate';
import { Installed } from '../src/install';

function getFakedInstallation(): Installed {
    // Use node executable instead of Vim or Neovim binaries
    const executable = process.argv[0];
    const bin = path.dirname(executable);
    return { executable, bin };
}

describe('validateInstallation()', function() {
    it('does nothing when correct installation is passed', async function() {
        const installed = getFakedInstallation();
        await validateInstallation(installed); // Check no exception
    });

    it("throws an error when 'bin' directory does not exist", async function() {
        const installed = { ...getFakedInstallation(), bin: '/path/to/somewhere/not/exist' };
        await A.rejects(() => validateInstallation(installed), /Could not stat installed directory/);
    });

    it("throws an error when 'bin' directory is actually a file", async function() {
        const installed = { ...getFakedInstallation(), bin: __filename };
        await A.rejects(() => validateInstallation(installed), /is not a directory for executable/);
    });

    it('throws an error when running executable failed', async function() {
        const installed = { ...getFakedInstallation(), executable: __filename };
        await A.rejects(() => validateInstallation(installed), /Could not get version from executable/);
    });
});
