import mock = require('mock-require');
import { Response } from 'node-fetch';

export function mockFetch(): void {
    mock('node-fetch', async (url: string) =>
        Promise.resolve(new Response(`dummy response for ${url}`, { status: 404, statusText: 'Not found for dummy' })),
    );
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

    stop(): void {
        mock.stop('../src/shell');
    }
}

export function mockExec(): ExecStub {
    const stub = new ExecStub();
    // eslint-disable-next-line @typescript-eslint/require-await
    const exec = async (...args: ExecArgs): Promise<string> => {
        stub.onCalled(args);
        return '';
    };
    mock('../src/shell', { exec });
    mock.reRequire('../src/shell');
    return stub;
}
