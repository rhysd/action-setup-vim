import { exec as execCommand } from '@actions/exec';

interface Options {
    cwd?: string;
}

type Env = { [k: string]: string };

// Avoid leaking $INPUT_* variables to subprocess
//   ref: https://github.com/actions/toolkit/issues/309
function getEnv(): Env {
    const ret: Env = {};
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
        ...opts,
        env: getEnv(),
        listeners: {
            stdout(data: Buffer) {
                res.stdout += data.toString();
            },
            stderr(data: Buffer) {
                res.stderr += data.toString();
            },
        },
        ignoreReturnCode: true, // Check exit status by myself for better error message
    };

    const code = await execCommand(cmd, args, execOpts);

    if (code === 0) {
        return res.stdout;
    } else {
        const stderr = res.stderr.replace(/\r?\n/g, ' ');
        throw new Error(`Command '${cmd} ${args.join(' ')}' exited non-zero status ${code}: ${stderr}`);
    }
}
