import { strict as A } from 'node:assert';
import process from 'node:process';
import { getSystemHttpsProxyAgent, ensureError, getOs, getArch } from '../src/system.js';

describe('getSystemHttpsProxyAgent()', function () {
    let savedEnv: Record<string, string | undefined>;

    before(function () {
        savedEnv = { ...process.env };
    });

    afterEach(function () {
        process.env = { ...savedEnv };
    });

    it('returns `undefined` when no proxy is configured', function () {
        process.env = {};
        A.equal(getSystemHttpsProxyAgent('https://example.com'), undefined);
    });

    it('returns HTTPS proxy agent when $https_proxy is configured', function () {
        process.env = { https_proxy: 'https://example.com:8088' };
        A.ok(getSystemHttpsProxyAgent('https://example.com'));
    });

    it('looks at $no_proxy configuration', function () {
        process.env = { no_proxy: '*' };
        A.equal(getSystemHttpsProxyAgent('https://example.com'), undefined);
    });
});

describe('ensureError()', function () {
    it('passes through Error object', function () {
        const want = new Error('test');
        const have = ensureError(want);
        A.equal(want, have);
    });

    it('passes through custom error object', function () {
        class MyError extends Error {}
        const want = new MyError('test');
        const have = ensureError(want);
        A.equal(want, have);
    });

    it('wraps non-Error object as Error object', function () {
        const err = ensureError('this is test');
        A.ok(err instanceof Error);
        A.equal(err.message, 'Unknown fatal error: this is test');
    });
});

describe('getOs()', function () {
    it('returns OS name', function () {
        const o = getOs();
        A.ok(o === 'macos' || o === 'linux' || o === 'windows', `${o}`);
    });
});

describe('getArch()', function () {
    it('returns architecture name', function () {
        const a = getArch();
        A.ok(a === 'x86_64' || a === 'arm64' || a === 'arm32', `${a}`);
    });
});
