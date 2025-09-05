import { strict as A } from 'node:assert';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import esmock from 'esmock';
import { type exec } from '../src/shell.js';
import { HttpsProxyAgent } from 'https-proxy-agent';

class ExecSpy {
    public called: any[] = [];
    public exitCode = 0;

    async mockedExec(cmd: string, args: string[], opts?: any): Promise<number> {
        this.called = [cmd, args, opts];
        opts.listeners.stdout(Buffer.from('this is stdout'));
        opts.listeners.stderr(Buffer.from('this is stderr'));
        return Promise.resolve(this.exitCode);
    }

    reset(): void {
        this.called = [];
        this.exitCode = 0;
    }

    mockedImport(): Promise<typeof import('../src/shell.js')> {
        return esmock(
            '../src/shell.js',
            {},
            {
                '@actions/exec': {
                    exec: this.mockedExec.bind(this),
                },
            },
        );
    }
}

describe('shell', function () {
    // let unzip: (file: string, cwd: string) => Promise<void>;
    const spy = new ExecSpy();
    const savedDebugEnv = process.env['RUNNER_DEBUG'];

    after(function () {
        process.env['RUNNER_DEBUG'] = savedDebugEnv;
    });

    afterEach(function () {
        spy.reset();
    });

    describe('exec()', function () {
        let execMocked: typeof exec;

        before(async function () {
            const { exec } = await spy.mockedImport();
            execMocked = exec;
        });

        afterEach(function () {
            delete process.env['INPUT_THIS_IS_TEST'];
            delete process.env['WOOOO_THIS_IS_TEST'];
        });

        it('returns stdout of given command execution', async function () {
            const out = await execMocked('test', ['--foo', '-b', 'piyo']);
            A.equal(out, 'this is stdout');
            const [cmd, args] = spy.called;
            A.equal(cmd, 'test');
            A.deepEqual(args, ['--foo', '-b', 'piyo']);
        });

        it('throws an error when command fails', async function () {
            spy.exitCode = 1;
            await A.rejects(() => execMocked('test', []), {
                message: /exited non-zero status 1: this is stderr/,
            });
        });

        it('sets cwd', async function () {
            const cwd = '/path/to/cwd';
            await execMocked('test', [], { cwd });
            const [, , opts] = spy.called;
            A.equal(opts.cwd, cwd);
        });

        it('sets env', async function () {
            const v = 'this is env var';
            await execMocked('test', [], { env: { THIS_IS_TEST: v } });
            const [, , opts] = spy.called;
            A.equal(opts.env['THIS_IS_TEST'], v);
        });

        it('propagates outer env', async function () {
            process.env['WOOOO_THIS_IS_TEST'] = 'hello';
            await execMocked('test', []);
            const [, , opts] = spy.called;
            A.equal(opts.env['WOOOO_THIS_IS_TEST'], 'hello');
        });

        it('filters input env vars', async function () {
            process.env['INPUT_THIS_IS_TEST'] = 'hello';
            await execMocked('test', []);
            const [, , opts] = spy.called;
            A.equal(opts.env['INPUT_THIS_IS_TEST'], undefined);
        });
    });

    describe('unzip()', function () {
        it('runs `unzip` command with given working directory', async function () {
            delete process.env['RUNNER_DEBUG'];
            const { unzip } = await spy.mockedImport();

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
            const { unzip } = await spy.mockedImport();

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

const loadProxyModule = async (): Promise<typeof import('../src/shell.js')> => {
    return esmock('../src/shell.js', {
        '@actions/core': {
            warning: () => {},
        },
    });
};

const originalEnv = { ...process.env };

describe('getProxyAgent', function () {
    beforeEach(function () {
        process.env = { ...originalEnv };
    });

    afterEach(function () {
        process.env = originalEnv;
    });

    it('should return undefined when no proxy environment variables are set', async function () {
        delete process.env['HTTPS_PROXY'];
        delete process.env['https_proxy'];
        delete process.env['NO_PROXY'];
        delete process.env['no_proxy'];

        const { getProxyAgent } = await loadProxyModule();
        A.strictEqual(getProxyAgent('https://github.com'), undefined);
    });

    it('should return HttpsProxyAgent when HTTPS_PROXY is set and no NO_PROXY', async function () {
        process.env['HTTPS_PROXY'] = 'https://proxy.example.com:8080';
        delete process.env['https_proxy'];
        delete process.env['NO_PROXY'];
        delete process.env['no_proxy'];

        const { getProxyAgent } = await loadProxyModule();
        A.ok(getProxyAgent('https://github.com') instanceof HttpsProxyAgent);
    });

    it('should return HttpsProxyAgent when https_proxy is set and no NO_PROXY', async function () {
        delete process.env['HTTPS_PROXY'];
        process.env['https_proxy'] = 'https://proxy.example.com:8080';
        delete process.env['NO_PROXY'];
        delete process.env['no_proxy'];

        const { getProxyAgent } = await loadProxyModule();
        A.ok(getProxyAgent('https://github.com') instanceof HttpsProxyAgent);
    });

    it('should return undefined when NO_PROXY contains exact domain match', async function () {
        process.env['HTTPS_PROXY'] = 'https://proxy.example.com:8080';
        process.env['NO_PROXY'] = 'github.com,example.com';

        const { getProxyAgent } = await loadProxyModule();
        A.strictEqual(getProxyAgent('https://github.com'), undefined);
    });

    it('should return undefined when no_proxy contains subdomain wildcard', async function () {
        process.env['HTTPS_PROXY'] = 'https://proxy.example.com:8080';
        process.env['no_proxy'] = '.github.com,example.com';

        const { getProxyAgent } = await loadProxyModule();
        A.strictEqual(getProxyAgent('https://api.github.com'), undefined);
        A.strictEqual(getProxyAgent('https://github.com'), undefined);
    });

    it('should return HttpsProxyAgent when NO_PROXY does not match domain', async function () {
        process.env['HTTPS_PROXY'] = 'https://proxy.example.com:8080';
        process.env['NO_PROXY'] = 'example.com,test.com';

        const { getProxyAgent } = await loadProxyModule();
        A.ok(getProxyAgent('https://github.com') instanceof HttpsProxyAgent);
    });

    it('should return undefined when proxy URL is invalid', async function () {
        process.env['HTTPS_PROXY'] = 'invalid-proxy-url';
        delete process.env['NO_PROXY'];
        delete process.env['no_proxy'];

        const { getProxyAgent } = await loadProxyModule();
        A.strictEqual(getProxyAgent('https://github.com'), undefined);
    });

    it('should prioritize HTTPS_PROXY over https_proxy', async function () {
        process.env['HTTPS_PROXY'] = 'https://primary-proxy.com';
        process.env['https_proxy'] = 'https://secondary-proxy.com';
        delete process.env['NO_PROXY'];
        delete process.env['no_proxy'];

        const { getProxyAgent } = await loadProxyModule();
        const agent = getProxyAgent('https://github.com');
        A.ok(agent instanceof HttpsProxyAgent);
        A.ok(agent.proxy.href.includes('primary-proxy.com'));
    });

    it('should bypass proxy for domains in NO_PROXY but use for others', async function () {
        process.env['HTTPS_PROXY'] = 'https://proxy.example.com:8080';
        process.env['NO_PROXY'] = 'github.com,example.com';

        const { getProxyAgent } = await loadProxyModule();
        A.strictEqual(getProxyAgent('https://github.com'), undefined);
        A.ok(getProxyAgent('https://gitlab.com') instanceof HttpsProxyAgent);
        A.strictEqual(getProxyAgent('https://example.com'), undefined);
    });

    it('should handle subdomain matching correctly', async function () {
        process.env['HTTPS_PROXY'] = 'https://proxy.example.com:8080';
        process.env['NO_PROXY'] = '.github.com';

        const { getProxyAgent } = await loadProxyModule();
        A.strictEqual(getProxyAgent('https://github.com'), undefined);
        A.strictEqual(getProxyAgent('https://api.github.com'), undefined);
        A.strictEqual(getProxyAgent('https://www.github.com'), undefined);
        A.ok(getProxyAgent('https://github.io') instanceof HttpsProxyAgent);
    });

    it('should handle invalid URL parameter', async function () {
        process.env['HTTPS_PROXY'] = 'https://proxy.example.com:8080';
        delete process.env['NO_PROXY'];
        delete process.env['no_proxy'];

        const { getProxyAgent } = await loadProxyModule();
        A.strictEqual(getProxyAgent('invalid-url'), undefined);
    });
});
