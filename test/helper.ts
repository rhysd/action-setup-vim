import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Response } from 'node-fetch';
import esmock from 'esmock';

export const TESTDATA_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), 'testdata');

// Arguments of exec(): cmd: string, args: string[], options?: Options
export type ExecArgs = [string, string[], { env: Record<string, string> } | undefined];
export class ExecStub {
    called: ExecArgs[] = [];

    onCalled(args: ExecArgs): void {
        this.called.push(args);
    }

    reset(): void {
        this.called = [];
    }

    mockedExec(...args: ExecArgs): Promise<string> {
        this.onCalled(args);
        return Promise.resolve('');
    }

    importWithMock(path: string, otherMocks: object = {}): Promise<any> {
        const exec = this.mockedExec.bind(this);
        return esmock(path, {}, { ...otherMocks, '../src/shell.js': { exec } });
    }
}

export class FetchStub {
    fetchedUrls: string[] = [];
    lastAssetName: string | null = null;

    reset(): void {
        this.fetchedUrls = [];
        this.lastAssetName = null;
    }

    mockedFetch(url: string): Promise<Response> {
        this.fetchedUrls.push(url);
        if (url.startsWith('https://api.github.com/repos/')) {
            const ok = { status: 200, statusText: 'OK' };
            const body = JSON.stringify({
                assets: [
                    {
                        name: this.lastAssetName ?? 'dummy',
                        digest: 'deadbeef',
                    },
                ],
            });
            return Promise.resolve(new Response(body, ok));
        }
        if (url.includes('/releases/download/')) {
            this.lastAssetName = url.split('/').slice(-1)[0] ?? null;
            const ok = { status: 200, statusText: 'OK' };
            return Promise.resolve(new Response('dummy asset response', ok));
        }
        const notFound = { status: 404, statusText: 'Not found for dummy' };
        return Promise.resolve(new Response(`dummy response for ${url}`, notFound));
    }

    importFetchMocked(path: string, otherMocks: object = {}): Promise<any> {
        return esmock(path, {}, { ...otherMocks, 'node-fetch': { default: this.mockedFetch.bind(this) } });
    }

}
