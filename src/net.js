import process from 'node:process';
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as core from '@actions/core';
export function getProxyAgent(url) {
    const proxy = process.env['HTTPS_PROXY'] ?? process.env['https_proxy'];
    if (!proxy) {
        return undefined;
    }
    try {
        const parsedUrl = new URL(url);
        const targetHost = parsedUrl.hostname;
        const noProxy = process.env['NO_PROXY'] ?? process.env['no_proxy'];
        const shouldBypassProxy = noProxy
            ? noProxy.split(',').some(domain => {
                const trimmedDomain = domain.trim();
                return (targetHost === trimmedDomain ||
                    (trimmedDomain.startsWith('.') &&
                        (targetHost.endsWith(trimmedDomain) || targetHost === trimmedDomain.slice(1))));
            })
            : false;
        if (shouldBypassProxy) {
            return undefined;
        }
        return new HttpsProxyAgent(proxy);
    }
    catch (err) {
        const msg = err.message;
        core.warning(`Trying to use an invalid proxy url: ${proxy}, err: ${msg}`);
        return undefined;
    }
}
//# sourceMappingURL=net.js.map