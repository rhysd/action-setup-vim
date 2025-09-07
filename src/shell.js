import process from 'node:process';
import { exec as origExec } from '@actions/exec';
// Avoid leaking $INPUT_* variables to subprocess
//   ref: https://github.com/actions/toolkit/issues/309
function getEnv(base) {
    const ret = base ?? {};
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
export async function exec(cmd, args, opts) {
    const res = {
        stdout: '',
        stderr: '',
    };
    const execOpts = {
        cwd: opts?.cwd,
        env: getEnv(opts?.env),
        listeners: {
            stdout(data) {
                res.stdout += data.toString();
            },
            stderr(data) {
                res.stderr += data.toString();
            },
        },
        ignoreReturnCode: true, // Check exit status by myself for better error message
    };
    const code = await origExec(cmd, args, execOpts);
    if (code === 0) {
        return res.stdout;
    }
    else {
        const stderr = res.stderr.replace(/\r?\n/g, ' ');
        throw new Error(`Command '${cmd} ${args.join(' ')}' exited non-zero status ${code}: ${stderr}`);
    }
}
const IS_DEBUG = !!process.env['RUNNER_DEBUG'];
export async function unzip(file, cwd) {
    // Suppress large output on unarchiving assets when RUNNER_DEBUG is not set (#25)
    const args = IS_DEBUG ? [file] : ['-q', file];
    await exec('unzip', args, { cwd });
}
//# sourceMappingURL=shell.js.map