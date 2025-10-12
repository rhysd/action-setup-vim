import { Response } from 'node-fetch';
import esmock from 'esmock';

function mockedFetch(url: string): Promise<Response> {
    const notFound = { status: 404, statusText: 'Not found for dummy' };
    return Promise.resolve(new Response(`dummy response for ${url}`, notFound));
}

export function importFetchMocked(path: string): Promise<any> {
    return esmock(path, {}, { 'node-fetch': { default: mockedFetch } });
}

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
