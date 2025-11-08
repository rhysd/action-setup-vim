import { strict as A } from 'node:assert';
import { type install } from '../src/install_macos.js';
import { type Config } from '../src/config.js';
import { ExecStub } from './helper.js';

describe('Installation on macOS', function () {
    const stub = new ExecStub();
    let installMocked: typeof install;
    let dummyRealPath: string;

    before(async function () {
        const { install } = await stub.importWithMock('../src/install_macos.js', {
            'fs/promises': {
                realpath(path: string): Promise<string> {
                    // When using realpath() for $VIM directory, just pass through the path. Otherwise
                    // it is used for resolving Python symlinks so return the dummy path.
                    const ret = path.endsWith('/vim') || path.endsWith('/nvim') ? path : dummyRealPath;
                    return Promise.resolve(ret);
                },
            },
            '@actions/io': {
                rmRF: (): Promise<void> => Promise.resolve(),
            },
        });
        installMocked = install;
    });

    beforeEach(function () {
        stub.reset();
        dummyRealPath = '/Library/Frameworks/Python.framework/Versions/dummy';
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
        A.equal(installed.vimDir, '/opt/homebrew/opt/neovim/share/nvim');

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
        A.equal(installed.vimDir, '/opt/homebrew/opt/macvim/MacVim.app/Contents/Resources/vim');

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

        await installMocked(config);

        A.deepEqual(stub.called[0], ['brew', ['unlink', 'python@3', '--quiet']]);
        A.deepEqual(stub.called[1], ['brew', ['link', 'python@3', '--quiet', '--overwrite']]);
        A.deepEqual(stub.called[2], ['brew', ['update', '--quiet']]);
        A.deepEqual(stub.called[3], ['brew', ['install', 'macvim', '--quiet']]);
        A.equal(stub.called.length, 4);
    });

    it('does not do package conflict workaround when executables are not linked to Python.Framework', async function () {
        dummyRealPath = '/usr/local/opt/python@3/bin/dummy';
        const config: Config = {
            version: 'stable',
            neovim: false,
            os: 'macos',
            arch: 'x86_64',
            configureArgs: null,
            token: null,
        };

        await installMocked(config);

        A.deepEqual(stub.called[0], ['brew', ['update', '--quiet']]);
        A.deepEqual(stub.called[1], ['brew', ['install', 'macvim', '--quiet']]);
        A.equal(stub.called.length, 2);
    });
});
