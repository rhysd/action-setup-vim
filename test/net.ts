import { strict as A } from 'node:assert';
import process from 'node:process';
import esmock from 'esmock';
import { HttpsProxyAgent } from 'https-proxy-agent';

const loadProxyModule = async (): Promise<typeof import('../src/net.js')> => {
    return esmock('../src/net.js', {
        '@actions/core': {
            warning: () => {},
        },
    });
};

const originalEnv = { ...process.env };

describe('net', function () {
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
});
