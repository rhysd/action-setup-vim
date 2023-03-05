import { strict as A } from 'assert';
import mock = require('mock-require');

class ExecSpy {
    public called: any[] = [];
    public exitCode = 0;

    async mocked(cmd: string, args: string[], opts?: any): Promise<number> {
        this.called = [cmd, args, opts];
        opts.listeners.stdout(Buffer.from('this is stdout'));
        opts.listeners.stderr(Buffer.from('this is stderr'));
        return Promise.resolve(this.exitCode);
    }

    reset(): void {
        this.called = [];
        this.exitCode = 0;
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

describe('shell', function () {
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

    afterEach(function () {
        spy.reset();
    });

    describe('exec()', function () {
        let exec: (cmd: string, args: string[], opts?: any) => Promise<string>;

        before(function () {
            exec = reRequire().exec;
        });

        afterEach(function () {
            delete process.env['INPUT_THIS_IS_TEST'];
            delete process.env['WOOOO_THIS_IS_TEST'];
        });

        it('returns stdout of given command execution', async function () {
            const out = await exec('test', ['--foo', '-b', 'piyo']);
            A.equal(out, 'this is stdout');
            const [cmd, args] = spy.called;
            A.equal(cmd, 'test');
            A.deepEqual(args, ['--foo', '-b', 'piyo']);
        });

        it('throws an error when command fails', async function () {
            spy.exitCode = 1;
            await A.rejects(() => exec('test', []), {
                message: /exited non-zero status 1: this is stderr/,
            });
        });

        it('sets cwd', async function () {
            const cwd = '/path/to/cwd';
            await exec('test', [], { cwd });
            const [, , opts] = spy.called;
            A.equal(opts.cwd, cwd);
        });

        it('sets env', async function () {
            const v = 'this is env var';
            await exec('test', [], { env: { THIS_IS_TEST: v } });
            const [, , opts] = spy.called;
            A.equal(opts.env['THIS_IS_TEST'], v);
        });

        it('propagates outer env', async function () {
            process.env['WOOOO_THIS_IS_TEST'] = 'hello';
            await exec('test', []);
            const [, , opts] = spy.called;
            A.equal(opts.env['WOOOO_THIS_IS_TEST'], 'hello');
        });

        it('filters input env vars', async function () {
            const { exec } = reRequire();
            process.env['INPUT_THIS_IS_TEST'] = 'hello';
            await exec('test', []);
            const [, , opts] = spy.called;
            A.equal(opts.env['INPUT_THIS_IS_TEST'], undefined);
        });
    });

    describe('unzip()', function () {
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
});
