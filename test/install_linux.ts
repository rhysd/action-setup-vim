import { strict as A } from 'assert';
import { type install } from '../src/install_linux';
import { type Config } from '../src/config';
import { type ExecStub, mockExec } from './helper';
import mock = require('mock-require');

function reRequire(): typeof import('../src/install_linux') {
    return mock.reRequire('../src/install_linux');
}

describe('Installation on Linux', function () {
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

    it('installs stable Vim by apt-get', async function () {
        const config: Config = {
            version: 'stable',
            neovim: false,
            os: 'linux',
            arch: 'x86_64',
            configureArgs: null,
            token: null,
        };

        const installed = await installMocked(config);
        A.equal(installed.executable, 'vim');
        A.equal(installed.binDir, '/usr/bin');

        A.deepEqual(stub.called[0], ['sudo', ['apt-get', 'update', '-y', '-q']]);
        A.deepEqual(stub.called[1], [
            'sudo',
            ['apt-get', 'install', '-y', '--no-install-recommends', '-q', 'vim-gtk3'],
        ]);
    });
});
