import { strict as A } from 'assert';
import { type install } from '../src/install_macos.js';
import { type Config } from '../src/config.js';
import { type ExecStub, mockExec } from './helper.js';
import mock = require('mock-require');

function reRequire(): typeof import('../src/install_macos.js') {
    return mock.reRequire('../src/install_macos');
}

describe('Installation on macOS', function () {
    let stub: ExecStub;
    let installMocked: typeof install;

    before(function () {
        stub = mockExec();
        installMocked = reRequire().install;
    });

    after(function () {
        stub.stop();
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
