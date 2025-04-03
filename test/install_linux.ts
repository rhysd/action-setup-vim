import { strict as A } from 'assert';
import { type install } from '../src/install_linux.js';
import { type Config } from '../src/config.js';
import { ExecStub } from './helper.js';
import esmock from 'esmock';

describe('Installation on Linux', function () {
    const stub = new ExecStub();
    let installMocked: typeof install;

    before(async function () {
        const { install } = await esmock(
            '../src/install_linux.js',
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
