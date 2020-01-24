import { exec as execCommand } from '@actions/exec';

export async function exec(cmd: string, ...args: string[]): Promise<string> {
    const res = {
        stdout: '',
        stderr: '',
        code: null,
    };

    const code = await execCommand(cmd, args, {
        listeners: {
            stdout(data) {
                res.stdout += data.toString();
            },
            stderr(data) {
                res.stderr += data.toString();
            },
        },
    });

    if (code === 0) {
        return res.stdout;
    } else {
        throw new Error(`Command '${cmd} ${args.join(' ')}' exited non-zero status ${code}: ${res.stderr}`);
    }
}
