import { strict as A } from 'assert';
import * as path from 'path';
import mock = require('mock-require');
import { Response } from 'node-fetch';
import { installVimOnWindows, detectLatestWindowsReleaseTag, versionIsOlderThan8_2_1119 } from '../src/vim';
import type { Installed } from '../src/install';
import type { Os } from '../src/utils';

function mockFetch(): typeof import('../src/vim') {
    mock('node-fetch', async (url: string) =>
        Promise.resolve(new Response(`dummy response for ${url}`, { status: 404, statusText: 'Not found for dummy' })),
    );
    return mock.reRequire('../src/vim');
}

// Arguments of exec(): cmd: string, args: string[], options?: Options
type ExecArgs = [string, string[], Object | undefined];
class ExecStub {
    called: ExecArgs[] = [];

    onCalled(args: ExecArgs) {
        this.called.push(args);
    }

    reset() {
        this.called = [];
    }
}

function mockExec(): ExecStub {
    const stub = new ExecStub();
    const exec = async (...args: ExecArgs) => {
        stub.onCalled(args);
        return '';
    };
    mock('../src/shell', { exec });
    mock.reRequire('../src/shell');
    return stub;
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

describe('buildVim()', function () {
    let stub: ExecStub;
    let buildVim: (v: string, os: Os) => Promise<Installed>;
    const savedXcode11Env = process.env.XCODE_11_DEVELOPER_DIR;

    before(function () {
        stub = mockExec();
        // Re-requiring ../src/vim is necessary because it depends on ../src/shell
        buildVim = mock.reRequire('../src/vim').buildVim;
        process.env.XCODE_11_DEVELOPER_DIR = './';
    });

    after(function () {
        mock.stop('../src/shell');
        mock.stop('../src/vim');
        process.env.XCODE_11_DEVELOPER_DIR = savedXcode11Env;
    });

    afterEach(function () {
        stub.reset();
    });

    it('builds nightly Vim from source', async function () {
        const installed = await buildVim('nightly', 'linux');
        A.equal(installed.executable, 'vim');
        A.ok(installed.binDir.endsWith('bin'), installed.binDir);
        A.ok(stub.called.length > 0);

        const [cmd, args] = stub.called[0];
        A.equal(cmd, 'git');
        A.equal(args[0], 'clone');
        A.equal(args[args.length - 2], 'https://github.com/vim/vim');
        // Nightly uses HEAD. It means tags are unnecessary
        A.equal(args[args.length - 3], '--no-tags');

        A.equal(stub.called[1][0], './configure');
        const configurePrefix = stub.called[1][1][0]; // --prefix=installDir
        A.equal(`--prefix=${path.dirname(installed.binDir)}`, configurePrefix);
    });

    it('builds recent Vim from source', async function () {
        const version = 'v8.2.2424';
        const installed = await buildVim(version, 'linux');
        A.equal(installed.executable, 'vim');
        A.ok(installed.binDir.endsWith('bin'), installed.binDir);
        A.ok(stub.called.length > 0);

        const [cmd, args] = stub.called[0];
        A.equal(cmd, 'git');
        A.equal(args[0], 'clone');
        A.equal(args[args.length - 2], 'https://github.com/vim/vim');
        // Specify tag name for cloning specific version
        A.equal(args[args.length - 4], '--branch');
        A.equal(args[args.length - 3], version);

        A.equal(stub.called[1][0], './configure');
        const configurePrefix = stub.called[1][1][0]; // --prefix=installDir
        A.equal(`--prefix=${path.dirname(installed.binDir)}`, configurePrefix);
    });

    it('builds older Vim from source on macOS', async function () {
        const version = 'v8.2.0000';
        await buildVim(version, 'macos');

        // For older Vim (before 8.2.1119), Xcode11 is necessary to build
        // Check `./configure`, `make` and `make install` are run with Xcode11
        for (let i = 1; i < 4; i++) {
            const opts = stub.called[i][2];
            A.ok(opts);
            A.ok('env' in opts);
            const env = opts['env'];
            A.ok('DEVELOPER_DIR' in env);
        }
    });
});

describe('versionIsOlderThan8_2_1119()', function () {
    const testCases: [string, boolean][] = [
        // Equal
        ['v8.2.1119', false],
        // Newer
        ['v8.2.1120', false],
        ['v8.3.0000', false],
        ['v8.3.1234', false],
        ['v8.3.0123', false],
        ['v9.0.0000', false],
        // Older
        ['v8.2.1118', true],
        ['v8.2.0000', true],
        ['v8.1.2000', true],
        ['v8.1.1000', true],
        ['v8.0.2000', true],
        ['v7.3.2000', true],
        ['v7.2', true],
        ['v6.4', true],
        // Invalid
        ['8.2.1119', false], // 'v' prefix not found
        ['8.2', false], // newer than v7 but patch version does not exist
    ];

    for (const tc of testCases) {
        const [v, expected] = tc;
        it(`${v} is ${expected ? 'older' : 'equal or newer than'} 8.2.1119`, function () {
            A.equal(versionIsOlderThan8_2_1119(v), expected);
        });
    }
});
