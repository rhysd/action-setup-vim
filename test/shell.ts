import { strict as A } from 'assert';
import mock = require('mock-require');

class ExecSpy {
    public called: any[] = [];

    async mocked(...args: any[]): Promise<number> {
        this.called = args;
        return Promise.resolve(0);
    }
}

function mockExec(): ExecSpy {
    const spy = new ExecSpy();
    mock('@actions/exec', { exec: spy.mocked.bind(spy) });
    return spy;
}

function reRequire(): typeof import('../src/shell') {
    return mock.reRequire('../src/shell');
}

describe('unzip()', function () {
    // let unzip: (file: string, cwd: string) => Promise<void>;
    let spy: ExecSpy;
    const savedDebugEnv = process.env['RUNNER_DEBUG'];

    before(function () {
        spy = mockExec();
    });

    after(function () {
        process.env['RUNNER_DEBUG'] = savedDebugEnv;
        mock.stop('@actions/exec');
    });

    beforeEach(function () {
        spy.called = [];
    });

    it('runs `unzip` command with given working directory', async function () {
        delete process.env['RUNNER_DEBUG'];
        const { unzip } = reRequire();

        const file = '/path/to/file.zip';
        const cwd = '/path/to/cwd';
        await unzip(file, cwd);
        const [cmd, args, opts] = spy.called;
        A.equal(cmd, 'unzip');
        A.deepEqual(args, ['-q', file]);
        A.equal(opts?.cwd, cwd);
    });

    it('removes `-q` option when RUNNER_DEBUG environment variable is set', async function () {
        process.env['RUNNER_DEBUG'] = 'true';
        const { unzip } = reRequire();

        const file = '/path/to/file.zip';
        const cwd = '/path/to/cwd';
        await unzip(file, cwd);
        const [cmd, args, opts] = spy.called;
        A.equal(cmd, 'unzip');
        A.deepEqual(args, [file]);
        A.equal(opts?.cwd, cwd);
    });
});
