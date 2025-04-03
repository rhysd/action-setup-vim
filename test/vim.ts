import { strict as A } from 'node:assert';
import * as path from 'node:path';
import process from 'node:process';
import esmock from 'esmock';
import { installVimOnWindows, detectLatestWindowsReleaseTag, versionIsOlderThan, type buildVim } from '../src/vim.js';
import { mockedFetch, ExecStub } from './helper.js';

describe('detectLatestWindowsReleaseTag()', function () {
    it('detects the latest release from redirect URL', async function () {
        const tag = await detectLatestWindowsReleaseTag();
        const re = /^v\d+\.\d+\.\d{4}$/;
        A.ok(re.test(tag), `'${tag}' did not match to ${re}`);
    });

    context('with mocking fetch()', function () {
        let detectLatestWindowsReleaseTagMocked: typeof detectLatestWindowsReleaseTag;

        before(async function () {
            const { detectLatestWindowsReleaseTag } = await esmock(
                '../src/vim.js',
                {},
                {
                    'node-fetch': {
                        default: mockedFetch,
                    },
                },
            );
            detectLatestWindowsReleaseTagMocked = detectLatestWindowsReleaseTag;
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
        await A.rejects(
            () => installVimOnWindows('v0.1.2', 'v0.1.2'),
            /^Error: Could not download and unarchive asset/,
        );
    });

    context('with mocking fetch()', function () {
        let installVimOnWindowsMocked: typeof installVimOnWindows;

        before(async function () {
            const { installVimOnWindows } = await esmock(
                '../src/vim.js',
                {},
                {
                    'node-fetch': {
                        default: mockedFetch,
                    },
                },
            );
            installVimOnWindowsMocked = installVimOnWindows;
        });

        it('throws an error when receiving unsuccessful response', async function () {
            await A.rejects(
                () => installVimOnWindowsMocked('nightly', 'nightly'),
                /Downloading asset failed: Not found for dummy/,
            );
        });
    });
});

describe('buildVim()', function () {
    const stub = new ExecStub();
    let buildVimMocked: typeof buildVim;
    const savedXcode11Env = process.env['XCODE_11_DEVELOPER_DIR'];

    before(async function () {
        const { buildVim } = await esmock(
            '../src/vim.js',
            {},
            {
                '../src/shell.js': {
                    exec: stub.mockedExec(),
                },
            },
        );
        buildVimMocked = buildVim;
        process.env['XCODE_11_DEVELOPER_DIR'] = './';
    });

    after(function () {
        process.env['XCODE_11_DEVELOPER_DIR'] = savedXcode11Env;
    });

    afterEach(function () {
        stub.reset();
    });

    it('builds nightly Vim from source', async function () {
        const installed = await buildVimMocked('nightly', 'linux', null);
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
        const installed = await buildVimMocked(version, 'linux', null);
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
        await buildVimMocked(version, 'macos', null);

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

    it('builds Vim from source with specified configure arguments', async function () {
        const version = 'v8.2.2424';
        const installed = await buildVimMocked(
            version,
            'linux',
            '--with-features=huge --enable-fail-if-missing --disable-nls',
        );

        const [cmd, args] = stub.called[1];
        A.equal(cmd, './configure');
        const expected = [
            `--prefix=${path.dirname(installed.binDir)}`,
            '--with-features=huge',
            '--enable-fail-if-missing',
            '--disable-nls',
        ];
        A.deepEqual(args, expected);
    });
});

describe('versionIsOlderThan()', function () {
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
        it(`${v} is ${expected ? 'older than' : 'equal or newer than'} 8.2.1119`, function () {
            A.equal(versionIsOlderThan(v, 8, 2, 1119), expected);
        });
    }
});
