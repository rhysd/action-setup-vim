import { homedir } from 'os';
import { join } from 'path';
import { strict as assert } from 'assert';
import { spawnSync } from 'child_process';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function log(...args: any[]) {
    console.log('[post_action_check]:', ...args);
}

interface Args {
    neovim: boolean;
    isStable: boolean;
    output: string;
}

function parseArgs(args: string[]): Args {
    if (args.length !== 5) {
        throw new Error('3 arguments must be set: `node ./scripts/post_action_check.js {neovim?} {version} {output}`');
    }

    const neovim = args[2].toLowerCase() === 'true';
    let isStable;
    switch (args[3]) {
        case 'stable':
            isStable = true;
            break;
        case 'nightly':
            isStable = false;
            break;
        default:
            throw new Error(`version value is unexpected: ${args[3]}`);
    }

    return { neovim, isStable, output: args[4] };
}

function expectedExecutable(neovim: boolean, isStable: boolean): string {
    if (neovim) {
        switch (process.platform) {
            case 'darwin':
                if (isStable) {
                    return '/usr/local/bin/nvim';
                } else {
                    return join(homedir(), 'nvim/bin/nvim');
                }
            case 'linux':
                return join(homedir(), 'nvim/bin/nvim');
            case 'win32':
                return join(homedir(), 'nvim/bin/nvim.exe');
        }
    } else {
        // vim
        switch (process.platform) {
            case 'darwin':
                if (isStable) {
                    return '/usr/local/bin/vim';
                } else {
                    return join(homedir(), 'vim/bin/vim');
                }
            case 'linux':
                if (isStable) {
                    return '/usr/bin/vim';
                } else {
                    return join(homedir(), 'vim/bin/vim');
                }
            case 'win32':
                return join(homedir(), 'vim/vim.exe');
        }
    }
    throw new Error(`Unexpected platform '${process.platform}'`);
}

function main() {
    log('Running with argv:', process.argv);

    const args = parseArgs(process.argv);
    log('Command line arguments:', args);

    const exe = expectedExecutable(args.neovim, args.isStable);
    log('Validating output. Expected executable:', exe);
    assert.equal(exe, args.output);

    log('Validating executable');
    const proc = spawnSync(exe, ['-N', '-c', 'quit']);
    assert.equal(proc.status, 0);

    log('Validating version');
    const ver = spawnSync(exe, ['--version']);
    assert.equal(ver.status, 0);
    const stdout = ver.stdout.toString();
    const editorName = args.neovim ? 'NVIM' : 'Vi IMproved';
    assert.ok(stdout.includes(editorName), `'${editorName}' should be included in stdout: ${stdout}`);

    log('OK');
}

main();
