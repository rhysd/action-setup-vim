import * as path from 'node:path';
import { strict as A } from 'node:assert';
import process from 'node:process';
import { validateInstallation } from '../src/validate.js';
import type { Installed, ExeName } from '../src/install.js';
import { TESTDATA_PATH } from './helper.js';
import { type Os, getOs } from '../src/system.js';

const TEST_DIR = path.join(TESTDATA_PATH, 'validate');
const TEST_VIM_DIR = path.join(TEST_DIR, 'vim_dir_vimver');

function getFakedInstallation(os: Os): Installed {
    const executable = (os === 'windows' ? 'dummy.exe' : 'dummy.bash') as ExeName;
    return { executable, binDir: TEST_DIR, vimDir: TEST_VIM_DIR };
}

describe('validateInstallation()', function () {
    const os = getOs();
    it('does nothing when correct installation is passed', async function () {
        await validateInstallation(getFakedInstallation(os), os); // Check no exception
    });

    it("throws an error when 'bin' directory does not exist", async function () {
        const installed = { ...getFakedInstallation(os), binDir: '/path/to/somewhere/not/exist' };
        await A.rejects(() => validateInstallation(installed, os), /Could not stat installed directory/);
    });

    it("throws an error when 'bin' directory is actually a file", async function () {
        const installed = { ...getFakedInstallation(os), binDir: path.join(TEST_DIR, 'dummy_file') };
        await A.rejects(() => validateInstallation(installed, os), /is not a directory for executable/);
    });

    it("throws an error when 'executable' file does not exist in 'bin' directory", async function () {
        const executable = 'this-file-does-not-exist-probably' as ExeName;
        const installed = { ...getFakedInstallation(os), executable };
        await A.rejects(
            () => validateInstallation(installed, os),
            /Could not access the installed executable|Installed binary is not an executable file/,
        );
    });

    it('throws an error when the executable file is actually not executable', async function () {
        // This file exists but not executable
        const installed = { ...getFakedInstallation(os), executable: 'dummy_file' as ExeName };
        await A.rejects(
            () => validateInstallation(installed, os),
            /Could not access the installed executable|Installed binary is not an executable file/,
        );
        // Check .exe or .EXE extensions are necessary instead of executable permission on Windows
        installed.executable = 'dummy.bash' as ExeName;
        await A.rejects(() => validateInstallation(installed, 'windows'), /Installed binary is not an executable file/);
    });

    it('throws an error when getting version from executable failed', async function () {
        const executable = (
            process.platform === 'win32' ? 'dummy_non_version.exe' : 'dummy_non_version.bash'
        ) as ExeName;
        const installed = { ...getFakedInstallation(os), executable };
        await A.rejects(() => validateInstallation(installed, os), /Could not get version from executable/);
    });

    it('does nothing when correct $VIM directory is found', async function () {
        for (const dir of ['vim_dir_vimver', 'vim_dir_runtime', 'vim_dir_nvim']) {
            const installed = { ...getFakedInstallation(os), vimDir: path.join(TEST_DIR, dir) };
            await validateInstallation(installed, os);
        }
    });

    it('throws an error when $VIM directory does not exist', async function () {
        const installed = { ...getFakedInstallation(os), vimDir: path.join(TEST_DIR, 'this-dir-doesnt-exist') };
        await A.rejects(
            () => validateInstallation(installed, os),
            /Validation failed! Could not read the installed \$VIM directory /,
        );
    });

    it('throws an error when $VIM directory does not contain $VIMRUNTIME directory', async function () {
        const installed = { ...getFakedInstallation(os), vimDir: path.join(TEST_DIR, 'vim_dir_empty') };
        await A.rejects(() => validateInstallation(installed, os), /contains no \$VIMRUNTIME directory/);
    });
});
