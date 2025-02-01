import { strict as A } from 'assert';
import * as path from 'path';
import mock = require('mock-require');
import {
    downloadNeovim,
    type downloadStableNeovim,
    type buildNightlyNeovim,
    assetDirName,
    assetFileName,
} from '../src/neovim';
import { mockFetch, ExecStub, mockExec } from './helper';

function reRequire(): typeof import('../src/neovim') {
    return mock.reRequire('../src/neovim');
}

describe('Neovim installation', function () {
    describe('downloadNeovim()', function () {
        it('throws an error when release asset not found', async function () {
            await A.rejects(() => downloadNeovim('v0.4.999', 'linux', 'x86_64'), /Downloading asset failed/);
        });

        context('with mocking fetch()', function () {
            let downloadNeovimMocked: typeof downloadNeovim;
            let downloadStableNeovimMocked: typeof downloadStableNeovim;

            before(function () {
                mockFetch();
                const mod = reRequire();
                downloadNeovimMocked = mod.downloadNeovim;
                downloadStableNeovimMocked = mod.downloadStableNeovim;
            });

            after(function () {
                mock.stop('../src/neovim');
            });

            it('throws an error when receiving unsuccessful response', async function () {
                try {
                    const ret = await downloadNeovimMocked('nightly', 'linux', 'x86_64');
                    A.ok(false, `Exception was not thrown: ${JSON.stringify(ret)}`);
                } catch (err) {
                    const msg = (err as Error).message;
                    A.ok(msg.includes('Could not download Neovim release from'), msg);
                    A.ok(msg.includes('check the asset for linux was really uploaded'), msg);
                    // Special message only for nightly build
                    A.ok(msg.includes('Note that some assets are sometimes missing on nightly build'), msg);
                }
            });

            it('fallbacks to the latest version detected from GitHub API', async function () {
                const token = process.env['GITHUB_TOKEN'] ?? null;
                if (token === null) {
                    this.skip(); // GitHub API token is necessary
                }
                try {
                    const ret = await downloadStableNeovimMocked('linux', 'x86_64', token);
                    A.ok(false, `Exception was not thrown: ${JSON.stringify(ret)}`);
                } catch (e) {
                    const err = e as Error;
                    // Matches to version tag like '/v0.4.4/' as part of download URL in error message
                    // Note: assert.match is not available in Node v12
                    A.ok(/\/v\d+\.\d+\.\d+\//.test(err.message), err.message);
                }
            });
        });
    });

    describe('buildNightlyNeovim()', function () {
        let stub: ExecStub;
        let buildNightlyNeovimMocked: typeof buildNightlyNeovim;

        before(function () {
            stub = mockExec();
            buildNightlyNeovimMocked = reRequire().buildNightlyNeovim;
        });

        after(function () {
            mock.stop('../src/shell');
        });

        afterEach(function () {
            stub.reset();
        });

        it('builds nightly Neovim on Linux', async function () {
            const installed = await buildNightlyNeovimMocked('linux');
            A.equal(installed.executable, 'nvim');
            A.ok(installed.binDir.endsWith(path.join('nvim-nightly', 'bin')), installed.binDir);
            const installDir = path.dirname(installed.binDir);

            // apt-get -> git -> make
            const apt = stub.called[0];
            A.ok(apt[0] === 'sudo' && apt[1][0] === 'apt-get', JSON.stringify(apt));
            const make = stub.called[2];
            A.equal(make[0], 'make');
            const makeArgs = make[1];
            A.ok(makeArgs[1].endsWith(installDir), `${makeArgs}`);
        });

        it('builds nightly Neovim on macOS', async function () {
            const installed = await buildNightlyNeovimMocked('macos');
            A.equal(installed.executable, 'nvim');
            A.ok(installed.binDir.endsWith(path.join('nvim-nightly', 'bin')), installed.binDir);
            const installDir = path.dirname(installed.binDir);

            // brew -> git -> make
            const brew = stub.called[0];
            A.ok(brew[0] === 'brew', JSON.stringify(brew));
            const make = stub.called[2];
            A.equal(make[0], 'make');
            const makeArgs = make[1];
            A.ok(makeArgs[1].endsWith(installDir), `${makeArgs}`);
        });

        it('throws an error on Windows', async function () {
            await A.rejects(
                () => buildNightlyNeovimMocked('windows'),
                /Building Neovim from source is not supported for windows/,
            );
        });
    });

    describe('assetDirName', function () {
        it('returns "Neovim" when Neovim version is earlier than 0.7 on Windows', function () {
            A.equal(assetDirName('v0.6.1', 'windows', 'x86_64'), 'Neovim');
            A.equal(assetDirName('v0.4.3', 'windows', 'x86_64'), 'Neovim');
        });

        it('returns "nvim-win64" when Neovim version is 0.7 or later on Windows', function () {
            A.equal(assetDirName('v0.7.0', 'windows', 'x86_64'), 'nvim-win64');
            A.equal(assetDirName('v0.10.0', 'windows', 'x86_64'), 'nvim-win64');
            A.equal(assetDirName('v1.0.0', 'windows', 'x86_64'), 'nvim-win64');
            A.equal(assetDirName('nightly', 'windows', 'x86_64'), 'nvim-win64');
            A.equal(assetDirName('stable', 'windows', 'x86_64'), 'nvim-win64');
        });

        it('returns "nvim-osx64" when Neovim version is earlier than 0.7.1 on macOS', function () {
            A.equal(assetDirName('v0.7.0', 'macos', 'x86_64'), 'nvim-osx64');
            A.equal(assetDirName('v0.6.1', 'macos', 'x86_64'), 'nvim-osx64');
        });

        it('returns "nvim-macos" when Neovim version is 0.7.1 or later and 0.9.5 or earlier on macOS', function () {
            A.equal(assetDirName('v0.7.1', 'macos', 'x86_64'), 'nvim-macos');
            A.equal(assetDirName('v0.8.0', 'macos', 'x86_64'), 'nvim-macos');
            A.equal(assetDirName('v0.9.5', 'macos', 'x86_64'), 'nvim-macos');
        });

        it('returns "nvim-macos-arm64" or "nvim-macos-x86_64" based on the CPU arch when Neovim version is 0.10.0 later on macOS', function () {
            A.equal(assetDirName('v0.10.0', 'macos', 'x86_64'), 'nvim-macos-x86_64');
            A.equal(assetDirName('v1.0.0', 'macos', 'x86_64'), 'nvim-macos-x86_64');
            A.equal(assetDirName('stable', 'macos', 'x86_64'), 'nvim-macos-x86_64');
            A.equal(assetDirName('nightly', 'macos', 'x86_64'), 'nvim-macos-x86_64');
            A.equal(assetDirName('v0.10.0', 'macos', 'arm64'), 'nvim-macos-arm64');
            A.equal(assetDirName('v1.0.0', 'macos', 'arm64'), 'nvim-macos-arm64');
            A.equal(assetDirName('stable', 'macos', 'arm64'), 'nvim-macos-arm64');
            A.equal(assetDirName('nightly', 'macos', 'arm64'), 'nvim-macos-arm64');
        });

        it('returns "nvim-linux64" when Neovim version is earlier than 0.10.4 on Linux', function () {
            A.equal(assetDirName('v0.10.3', 'linux', 'x86_64'), 'nvim-linux64');
            A.equal(assetDirName('v0.9.5', 'linux', 'x86_64'), 'nvim-linux64');
            A.throws(
                () => assetDirName('v0.10.3', 'linux', 'arm64'),
                /^Error: Linux arm64 has been only supported since Neovim v0\.10\.4/,
            );
            A.throws(
                () => assetDirName('v0.9.5', 'linux', 'arm64'),
                /^Error: Linux arm64 has been only supported since Neovim v0\.10\.4/,
            );
        });

        it('returns "nvim-linux-x86_64" or "nvim-linux-arm64" when Neovim version is earlier than 0.10.4 on Linux', function () {
            A.equal(assetDirName('v0.10.4', 'linux', 'x86_64'), 'nvim-linux-x86_64');
            A.equal(assetDirName('v0.11.0', 'linux', 'x86_64'), 'nvim-linux-x86_64');
            A.equal(assetDirName('v0.10.4', 'linux', 'arm64'), 'nvim-linux-arm64');
            A.equal(assetDirName('v0.11.0', 'linux', 'arm64'), 'nvim-linux-arm64');
            A.equal(assetDirName('stable', 'linux', 'x86_64'), 'nvim-linux-x86_64');
            A.equal(assetDirName('stable', 'linux', 'arm64'), 'nvim-linux-arm64');
        });
    });

    describe('assetFileName', function () {
        it('returns asset file name following the Neovim version and CPU arch on Linux', function () {
            A.equal(assetFileName('v0.10.3', 'linux', 'x86_64'), 'nvim-linux64.tar.gz');
            A.equal(assetFileName('v0.10.4', 'linux', 'x86_64'), 'nvim-linux-x86_64.tar.gz');
            A.equal(assetFileName('v0.10.4', 'linux', 'arm64'), 'nvim-linux-arm64.tar.gz');
        });

        it('returns asset file name following the Neovim version and CPU arch on macOS', function () {
            A.equal(assetFileName('v0.7.0', 'macos', 'x86_64'), 'nvim-macos.tar.gz');
            A.equal(assetFileName('v0.7.1', 'macos', 'x86_64'), 'nvim-macos.tar.gz');
            A.equal(assetFileName('v0.10.4', 'macos', 'x86_64'), 'nvim-macos-x86_64.tar.gz');
            A.equal(assetFileName('v0.10.4', 'macos', 'arm64'), 'nvim-macos-arm64.tar.gz');
        });
    });
});
