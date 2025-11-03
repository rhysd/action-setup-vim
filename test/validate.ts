import * as path from 'node:path';
import { strict as A } from 'node:assert';
import process from 'node:process';
import { validateInstallation } from '../src/validate.js';
import type { Installed, ExeName } from '../src/install.js';
import { TESTDATA_PATH } from './helper.js';

const TEST_DIR = path.join(TESTDATA_PATH, 'validate');

function getFakedInstallation(): Installed {
    if (process.platform === 'win32') {
        // TODO: Temporary (.BAT file is not available because the validation only expects .exe
        const p = process.argv[0];
        return {
            executable: path.basename(p) as ExeName,
            binDir: path.dirname(p),
        };
    }
    return { executable: 'dummy.bash' as ExeName, binDir: TEST_DIR };
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
        const installed = { ...getFakedInstallation(), binDir: path.join(TEST_DIR, 'dummy_file') };
        await A.rejects(() => validateInstallation(installed), /is not a directory for executable/);
    });

    it("throws an error when 'executable' file does not exist in 'bin' directory", async function () {
        const executable = 'this-file-does-not-exist-probably' as ExeName;
        const installed = { binDir: TEST_DIR, executable };
        await A.rejects(
            () => validateInstallation(installed),
            /Could not access the installed executable|Installed binary is not an executable file/,
        );
    });

    it("throws an error when file specified with 'executable' is actually not executable", async function () {
        // This file exists but not executable
        const installed = { binDir: TEST_DIR, executable: 'dummy_file' as ExeName };
        await A.rejects(
            () => validateInstallation(installed),
            /Could not access the installed executable|Installed binary is not an executable file/,
        );
    });

    it('throws an error when getting version from executable failed', async function () {
        // TODO: Remove this skip
        if (process.platform === 'win32') {
            this.skip();
        }
        const installed = { executable: 'dummy_non_version.bash' as ExeName, binDir: TEST_DIR };
        await A.rejects(() => validateInstallation(installed), /Could not get version from executable/);
    });
});
