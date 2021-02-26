import { strict as A } from 'assert';
import mock = require('mock-require');
import { Response } from 'node-fetch';
import { downloadNeovim } from '../src/neovim';

describe('downloadNeovim()', function () {
    it('throws an error when release asset not found', async function () {
        await A.rejects(() => downloadNeovim('v0.4.999', 'linux'), /Downloading asset failed/);
    });

    context('with mocking fetch()', function () {
        let downloadNeovim: (tag: string, os: string) => Promise<unknown>;
        let downloadStableNeovim: (os: string, token: string | null) => Promise<unknown>;

        before(function () {
            mock('node-fetch', async (url: string) =>
                Promise.resolve(new Response(`dummy response for ${url}`, { status: 404, statusText: 'Not found' })),
            );
            const mod = mock.reRequire('../src/neovim');
            downloadNeovim = mod.downloadNeovim;
            downloadStableNeovim = mod.downloadStableNeovim;
        });

        after(function () {
            mock.stop('../src/neovim');
        });

        it('throws an error when receiving unsuccessful response', async function () {
            try {
                const ret = await downloadNeovim('nightly', 'linux');
                A.ok(false, `Exception was not thrown: ${ret}`);
            } catch (err) {
                const msg = err.message;
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
                const ret = await downloadStableNeovim('linux', token);
                A.ok(false, `Exception was not thrown: ${ret}`);
            } catch (err) {
                // Matches to version tag like '/v0.4.4/' as part of download URL in error message
                // Note: assert.match is not available in Node v12
                A.ok(/\/v\d+\.\d+\.\d+\//.test(err.message), err.message);
            }
        });
    });
});
