import { exec as execCommand } from '@actions/exec';

interface Options {
    cwd?: string;
}

export async function exec(cmd: string, args: string[], opts?: Options): Promise<string> {
    const res = {
        stdout: '',
        stderr: '',
        code: null,
    };

    const execOpts = {
        ...opts,
        listeners: {
            stdout(data: Buffer) {
                res.stdout += data.toString();
            },
            stderr(data: Buffer) {
                res.stderr += data.toString();
            },
        },
    };

    const code = await execCommand(cmd, args, execOpts);

    if (code === 0) {
        return res.stdout;
    } else {
        throw new Error(`Command '${cmd} ${args.join(' ')}' exited non-zero status ${code}: ${res.stderr}`);
    }
}
