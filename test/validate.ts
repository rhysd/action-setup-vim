import * as path from 'node:path';
import { strict as A } from 'node:assert';
import process from 'node:process';
import { validateInstallation } from '../src/validate.js';
import type { Installed, ExeName } from '../src/install.js';
import { TESTDATA_PATH } from './helper.js';

const TEST_DIR = path.join(TESTDATA_PATH, 'validate');
const TEST_VIM_DIR = path.join(TEST_DIR, 'vim_dir_vimver');

function getFakedInstallation(): Installed {
    const executable = (process.platform === 'win32' ? 'dummy.exe' : 'dummy.bash') as ExeName;
    return { executable, binDir: TEST_DIR, vimDir: TEST_VIM_DIR };
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
        const installed = { ...getFakedInstallation(), executable };
        await A.rejects(
            () => validateInstallation(installed),
            /Could not access the installed executable|Installed binary is not an executable file/,
        );
    });

    it("throws an error when file specified with 'executable' is actually not executable", async function () {
        // This file exists but not executable
        const installed = { ...getFakedInstallation(), executable: 'dummy_file' as ExeName };
        await A.rejects(
            () => validateInstallation(installed),
            /Could not access the installed executable|Installed binary is not an executable file/,
        );
    });

    it('throws an error when getting version from executable failed', async function () {
        const executable = (
            process.platform === 'win32' ? 'dummy_non_version.exe' : 'dummy_non_version.bash'
        ) as ExeName;
        const installed = { ...getFakedInstallation(), executable };
        await A.rejects(() => validateInstallation(installed), /Could not get version from executable/);
    });

    it('does nothing when correct $VIM directory is found', async function () {
        for (const dir of ['vim_dir_vimver', 'vim_dir_runtime', 'vim_dir_nvim']) {
            const installed = { ...getFakedInstallation(), vimDir: path.join(TEST_DIR, dir) };
            await validateInstallation(installed);
        }
    });

    it('throws an error when $VIM directory does not exist', async function () {
        const installed = { ...getFakedInstallation(), vimDir: path.join(TEST_DIR, 'this-dir-doesnt-exist') };
        await A.rejects(
            () => validateInstallation(installed),
            /Validation failed! Could not read the installed \$VIM directory /,
        );
    });

    it('throws an error when $VIM directory does not contain $VIMRUNTIME directory', async function () {
        const installed = { ...getFakedInstallation(), vimDir: path.join(TEST_DIR, 'vim_dir_empty') };
        await A.rejects(() => validateInstallation(installed), /contains no \$VIMRUNTIME directory/);
    });
});
