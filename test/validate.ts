import * as path from 'node:path';
import { strict as A } from 'node:assert';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { validateInstallation } from '../src/validate.js';
import type { Installed, ExeName } from '../src/install.js';

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

function getFakedInstallation(): Installed {
    // Use node executable instead of Vim or Neovim binaries
    const fullPath = process.argv[0];
    const executable = path.basename(fullPath) as ExeName;
    const binDir = path.dirname(fullPath);
    return { executable, binDir };
}

describe('validateInstallation()', function () {
    it('does nothing when correct installation is passed', async function () {
        const installed = getFakedInstallation();
        await validateInstallation(installed); // Check no exception
    });

    it("throws an error when 'bin' directory does not exist", async function () {
        const installed = { ...getFakedInstallation(), binDir: '/path/to/somewhere/not/exist' };
        await A.rejects(() => validateInstallation(installed), /Could not stat installed directory/);
    });

    it("throws an error when 'bin' directory is actually a file", async function () {
        const installed = { ...getFakedInstallation(), binDir: FILENAME };
        await A.rejects(() => validateInstallation(installed), /is not a directory for executable/);
    });

    it("throws an error when 'executable' file does not exist in 'bin' directory", async function () {
        const executable = 'this-file-does-not-exist-probably' as ExeName;
        const installed = { binDir: DIRNAME, executable };
        await A.rejects(
            () => validateInstallation(installed),
            /Could not access the installed executable|Installed binary is not an executable file/,
        );
    });

    it("throws an error when file specified with 'executable' is actually not executable", async function () {
        // This file exists but not executable
        const executable = path.basename(FILENAME) as ExeName;
        const installed = { binDir: DIRNAME, executable };
        await A.rejects(
            () => validateInstallation(installed),
            /Could not access the installed executable|Installed binary is not an executable file/,
        );
    });

    it('throws an error when getting version from executable failed', async function () {
        // Bash is not available on Windows
        if (process.platform === 'win32') {
            this.skip();
        }

        // prepare-release.sh exists and executable but does not support --version option
        const binDir = path.join(path.dirname(DIRNAME), 'scripts');
        const executable = 'prepare-release.sh' as ExeName;
        const installed = { executable, binDir };
        await A.rejects(() => validateInstallation(installed), /Could not get version from executable/);
    });
});
