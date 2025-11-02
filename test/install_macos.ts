import { strict as A } from 'node:assert';
import { type install } from '../src/install_macos.js';
import { type Config } from '../src/config.js';
import { ExecStub } from './helper.js';

describe('Installation on macOS', function () {
    const stub = new ExecStub();
    let installMocked: typeof install;

    before(async function () {
        const fsMock = {
            stat: (): Promise<unknown> => Promise.resolve({ isDirectory: () => true }),
            lstat: (): Promise<unknown> => Promise.resolve({ isSymbolicLink: () => true }),
        };
        const { install } = await stub.importWithMock('../src/install_macos.js', {
            'fs/promises': fsMock,
            '@actions/io': {
                rmRF(): Promise<void> {
                    return Promise.resolve();
                },
            },
        });
        installMocked = install;
    });

    afterEach(function () {
        stub.reset();
    });

    it('installs stable Neovim from Homebrew', async function () {
        const config: Config = {
            version: 'stable',
            neovim: true,
            os: 'macos',
            arch: 'arm64',
            configureArgs: null,
            token: null,
        };

        const installed = await installMocked(config);
        A.equal(installed.executable, 'nvim');
        A.equal(installed.binDir, '/opt/homebrew/bin');

        A.deepEqual(stub.called[0], ['brew', ['update', '--quiet']]);
        A.deepEqual(stub.called[1], ['brew', ['install', 'neovim', '--quiet']]);
    });

    it('installs stable Vim from Homebrew', async function () {
        const config: Config = {
            version: 'stable',
            neovim: false,
            os: 'macos',
            arch: 'arm64',
            configureArgs: null,
            token: null,
        };

        const installed = await installMocked(config);
        A.equal(installed.executable, 'vim');
        A.equal(installed.binDir, '/opt/homebrew/bin');

        A.deepEqual(stub.called[0], ['brew', ['update', '--quiet']]);
        A.deepEqual(stub.called[1], ['brew', ['install', 'macvim', '--quiet']]);
        A.equal(stub.called.length, 2);
    });

    it('avoids python package conflict on x86_64 (#52)', async function () {
        const config: Config = {
            version: 'stable',
            neovim: false,
            os: 'macos',
            arch: 'x86_64',
            configureArgs: null,
            token: null,
        };

        const installed = await installMocked(config);
        A.equal(installed.executable, 'vim');
        A.equal(installed.binDir, '/usr/local/bin');

        A.deepEqual(stub.called[0], ['brew', ['unlink', 'python@3.13', '--quiet']]);
        A.deepEqual(stub.called[1], ['brew', ['link', 'python@3.13', '--quiet', '--overwrite']]);
        A.deepEqual(stub.called[2], ['brew', ['update', '--quiet']]);
        A.deepEqual(stub.called[3], ['brew', ['install', 'macvim', '--quiet']]);
        A.equal(stub.called.length, 4);
    });
});
