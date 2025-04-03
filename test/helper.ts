import { Response } from 'node-fetch';

export function mockedFetch(url: string): Promise<Response> {
    const notFound = { status: 404, statusText: 'Not found for dummy' };
    return Promise.resolve(new Response(`dummy response for ${url}`, notFound));
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

    mockedExec(): (...args: ExecArgs) => Promise<string> {
        return (...args) => {
            this.onCalled(args);
            return Promise.resolve('');
        };
    }
}
