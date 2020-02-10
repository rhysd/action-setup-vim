import { homedir } from 'os';
import * as path from 'path';
import { strict as assert } from 'assert';
import { spawnSync } from 'child_process';

function log(...args: unknown[]) {
    console.log('[post_action_check]:', ...args);
}

function ok(x: unknown, m?: string): asserts x {
    assert.ok(x, m);
}

interface Args {
    neovim: boolean;
    version: string;
    output: string;
}

function parseArgs(args: string[]): Args {
    if (args.length !== 5) {
        throw new Error('3 arguments must be set: `node ./scripts/post_action_check.js {neovim?} {version} {output}`');
    }

    const neovim = args[2].toLowerCase() === 'true';

    return { neovim, version: args[3], output: args[4] };
}

function expectedExecutable(neovim: boolean, ver: string): string {
    if (neovim) {
        switch (process.platform) {
            case 'darwin':
                if (ver === 'stable') {
                    return '/usr/local/bin/nvim';
                } else {
                    // nightly or specific version
                    return path.join(homedir(), 'nvim/bin/nvim');
                }
            case 'linux':
                return path.join(homedir(), 'nvim/bin/nvim');
            case 'win32':
                return path.join(homedir(), 'nvim/bin/nvim.exe');
            default:
                break;
        }
    } else {
        // vim
        switch (process.platform) {
            case 'darwin':
                if (ver === 'stable') {
                    return '/usr/local/bin/vim';
                } else {
                    // nightly or specific version
                    return path.join(homedir(), 'vim/bin/vim');
                }
            case 'linux':
                if (ver === 'stable') {
                    return '/usr/bin/vim';
                } else {
                    // nightly or specific version
                    return path.join(homedir(), 'vim/bin/vim');
                }
            case 'win32':
                return path.join(homedir(), 'vim/vim.exe');
            default:
                break;
        }
    }
    throw new Error(`Unexpected platform '${process.platform}'`);
}

function main() {
    log('Running with argv:', process.argv);

    const args = parseArgs(process.argv);
    log('Command line arguments:', args);

    const exe = expectedExecutable(args.neovim, args.version);
    log('Validating output. Expected executable:', exe);
    assert.equal(exe, args.output);

    const bin = path.dirname(exe);
    log(`Validating '${bin}' is in $PATH`);
    ok(process.env.PATH);
    const pathSep = process.platform === 'win32' ? ';' : ':';
    const paths = process.env.PATH.split(pathSep);
    ok(paths.includes(bin), `'${bin}' is not included in '${process.env.PATH}'`);

    log('Validating executable');
    const proc = spawnSync(exe, ['-N', '-c', 'quit']);
    assert.equal(proc.status, 0);

    log('Validating version');
    const ver = spawnSync(exe, ['--version']);
    assert.equal(ver.status, 0);
    const stdout = ver.stdout.toString();

    if (args.version !== 'stable' && args.version !== 'nightly') {
        if (args.neovim) {
            const l = `NVIM ${args.version}`;
            ok(stdout.includes(l), `First line '${l}' should be included in stdout: ${stdout}`);
        } else {
            const m = args.version.match(/^v(\d+\.\d+)\.(\d+)$/);
            ok(m);
            const major = m[1];
            const patch = m[2];

            const l = `VIM - Vi IMproved ${major}`;
            ok(stdout.includes(l), `First line '${l}' should be included in stdout: ${stdout}`);

            // assert.match is not available since it is experimental
            ok(
                stdout.match(new RegExp(`Included patches: .*${patch}`)),
                `Patch ${patch} should be included in stdout: ${stdout}`,
            );
        }
    } else {
        const editorName = args.neovim ? 'NVIM' : 'VIM - Vi IMproved';
        ok(stdout.includes(editorName), `Editor name '${editorName}' should be included in stdout: ${stdout}`);
    }

    log('OK');
}

main();
