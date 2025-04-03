import { strict as A } from 'assert';
import { type install } from '../src/install_macos.js';
import { type Config } from '../src/config.js';
import { ExecStub } from './helper.js';
import esmock from 'esmock';

describe('Installation on macOS', function () {
    const stub = new ExecStub();
    let installMocked: typeof install;

    before(async function () {
        const { install } = await esmock(
            '../src/install_macos.js',
            {},
            {
                '../src/shell.js': {
                    exec: stub.mockedExec(),
                },
            },
        );
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
    });
});
