import { strict as A } from 'assert';
import * as path from 'path';
import mock = require('mock-require');
import { downloadNeovim, downloadStableNeovim, buildNightlyNeovimOnLinux } from '../src/neovim';
import { mockFetch, ExecStub, mockExec } from './helper';

function reRequire(): typeof import('../src/neovim') {
    return mock.reRequire('../src/neovim');
}

describe('Neovim installation', function () {
    describe('downloadNeovim()', function () {
        it('throws an error when release asset not found', async function () {
            await A.rejects(() => downloadNeovim('v0.4.999', 'linux'), /Downloading asset failed/);
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
                    const ret = await downloadNeovimMocked('nightly', 'linux');
                    A.ok(false, `Exception was not thrown: ${ret}`);
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
                    const ret = await downloadStableNeovimMocked('linux', token);
                    A.ok(false, `Exception was not thrown: ${ret}`);
                } catch (e) {
                    const err = e as Error;
                    // Matches to version tag like '/v0.4.4/' as part of download URL in error message
                    // Note: assert.match is not available in Node v12
                    A.ok(/\/v\d+\.\d+\.\d+\//.test(err.message), err.message);
                }
            });
        });
    });

    describe('buildNightlyNeovimOnLinux()', function () {
        let stub: ExecStub;
        let buildNightlyNeovimOnLinuxMocked: typeof buildNightlyNeovimOnLinux;

        before(function () {
            stub = mockExec();
            buildNightlyNeovimOnLinuxMocked = reRequire().buildNightlyNeovimOnLinux;
        });

        after(function () {
            mock.stop('../src/shell');
        });

        afterEach(function () {
            stub.reset();
        });

        it('builds nightly Neovim on Linux()', async function () {
            const installed = await buildNightlyNeovimOnLinuxMocked();
            A.equal(installed.executable, 'nvim');
            A.ok(installed.binDir.endsWith(path.join('nvim', 'bin')), installed.binDir);

            const installDir = path.dirname(installed.binDir);
            // apt-get -> git -> make
            const make = stub.called[2];
            A.equal(make[0], 'make');
            const makeArgs = make[1];
            A.ok(makeArgs[1].endsWith(installDir), `${makeArgs}`);
        });
    });
});
