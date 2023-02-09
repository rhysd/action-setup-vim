import { exec as origExec } from '@actions/exec';

export type Env = Record<string, string>;

interface Options {
    readonly cwd?: string;
    readonly env?: Env;
}

// Avoid leaking $INPUT_* variables to subprocess
//   ref: https://github.com/actions/toolkit/issues/309
function getEnv(base?: Env): Env {
    const ret: Env = base ?? {};
    for (const key of Object.keys(process.env)) {
        if (!key.startsWith('INPUT_')) {
            const v = process.env[key];
            if (v !== undefined) {
                ret[key] = v;
            }
        }
    }
    return ret;
}

export async function exec(cmd: string, args: string[], opts?: Options): Promise<string> {
    const res = {
        stdout: '',
        stderr: '',
        code: null,
    };

    const execOpts = {
        cwd: opts?.cwd,
        env: getEnv(opts?.env),
        listeners: {
            stdout(data: Buffer): void {
                res.stdout += data.toString();
            },
            stderr(data: Buffer): void {
                res.stderr += data.toString();
            },
        },
        ignoreReturnCode: true, // Check exit status by myself for better error message
    };

    const code = await origExec(cmd, args, execOpts);

    if (code === 0) {
        return res.stdout;
    } else {
        const stderr = res.stderr.replace(/\r?\n/g, ' ');
        throw new Error(`Command '${cmd} ${args.join(' ')}' exited non-zero status ${code}: ${stderr}`);
    }
}
