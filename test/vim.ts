import { strict as A } from 'assert';
import mock = require('mock-require');
import { Response } from 'node-fetch';
import { installVimOnWindows, detectLatestWindowsReleaseTag } from '../src/vim';

function mockFetch(): typeof import('../src/vim') {
    mock('node-fetch', async (url: string) =>
        Promise.resolve(new Response(`dummy response for ${url}`, { status: 404, statusText: 'Not found for dummy' })),
    );
    return mock.reRequire('../src/vim');
}

describe('detectLatestWindowsReleaseTag()', function () {
    it('detects the latest release from redirect URL', async function () {
        const tag = await detectLatestWindowsReleaseTag();
        const re = /^v\d+\.\d+\.\d{4}$/;
        A.ok(re.test(tag), `'${tag}' did not match to ${re}`);
    });

    context('with mocking fetch()', function () {
        let detectLatestWindowsReleaseTagMocked: typeof detectLatestWindowsReleaseTag;

        before(function () {
            detectLatestWindowsReleaseTagMocked = mockFetch().detectLatestWindowsReleaseTag;
        });

        after(function () {
            mock.stop('../src/vim');
        });

        it('throws an error when response is other than 302', async function () {
            await A.rejects(
                () => detectLatestWindowsReleaseTagMocked(),
                /Expected status 302 \(Redirect\) but got 404/,
            );
        });
    });
});

describe('installVimOnWindows()', function () {
    it('throws an error when the specified version does not exist', async function () {
        await A.rejects(() => installVimOnWindows('v0.1.2'), /^Error: Could not download and unarchive asset/);
    });

    context('with mocking fetch()', function () {
        let installVimOnWindowsMocked: typeof installVimOnWindows;

        before(function () {
            installVimOnWindowsMocked = mockFetch().installVimOnWindows;
        });

        after(function () {
            mock.stop('../src/vim');
        });

        it('throws an error when receiving unsuccessful response', async function () {
            await A.rejects(
                () => installVimOnWindowsMocked('nightly'),
                /Downloading asset failed: Not found for dummy/,
            );
        });
    });
});
