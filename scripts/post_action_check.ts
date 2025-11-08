import { homedir } from 'node:os';
import * as path from 'node:path';
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import process from 'node:process';

function log(...args: unknown[]): void {
    console.log('[post_action_check]:', ...args);
}

interface Args {
    neovim: boolean;
    version: string;
    executable: string;
    vimdir: string;
    runtimeDir: string;
}

function parseArgs(args: string[]): Args {
    if (args.length !== 5) {
        throw new Error('3 arguments must be set: `node ./scripts/post_action_check.js {neovim?} {version} {outputs}`');
    }
    const neovim = args[2].toLowerCase() === 'true';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const outputs = JSON.parse(args[4]);
    return {
        neovim,
        version: args[3],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        executable: outputs.executable as string,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        vimdir: outputs['vim-dir'] as string,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        runtimeDir: outputs['runtime-dir'] as string,
    };
}

// e.g. ~/vim-stable/vim91
function getRuntimeDirOnWindows(version: string): string {
    const vimdir = path.join(homedir(), `vim-${version}`);
    for (const entry of readdirSync(vimdir)) {
        if (/^vim\d+$/.test(entry)) {
            return path.join(vimdir, entry);
        }
    }
    // The $VIMDIR change on Windows is not released on CI. Not to break the weekly post-release check,
    // this script allows the old directory structure.
    // TODO: Remove this `if` statement after the next release.
    if (process.env['GITHUB_WORKFLOW'] === 'Post-release check' && existsSync(path.join(vimdir, 'vim.exe'))) {
        return vimdir;
    }
    throw new Error(`vim{ver} directory for version ${version} is not found in $VIMDIR ${vimdir}`);
}

function expectedExecutable(neovim: boolean, ver: string): string {
    if (neovim) {
        switch (process.platform) {
            case 'darwin':
                if (ver === 'stable') {
                    if (process.arch === 'arm64') {
                        return '/opt/homebrew/bin/nvim';
                    } else {
                        return '/usr/local/bin/nvim';
                    }
                } else {
                    // nightly or specific version
                    return path.join(homedir(), `nvim-${ver}/bin/nvim`);
                }
            case 'linux':
                return path.join(homedir(), `nvim-${ver}/bin/nvim`);
            case 'win32':
                return path.join(homedir(), `nvim-${ver}/bin/nvim.exe`);
            default:
                break;
        }
    } else {
        // vim
        switch (process.platform) {
            case 'darwin':
                if (ver === 'stable') {
                    if (process.arch === 'arm64') {
                        return '/opt/homebrew/bin/vim';
                    } else {
                        return '/usr/local/bin/vim';
                    }
                } else {
                    // nightly or specific version
                    return path.join(homedir(), `vim-${ver}/bin/vim`);
                }
            case 'linux':
                if (ver === 'stable') {
                    return '/usr/bin/vim';
                } else {
                    // nightly or specific version
                    return path.join(homedir(), `vim-${ver}/bin/vim`);
                }
            case 'win32':
                return path.join(getRuntimeDirOnWindows(ver), 'vim.exe');
            default:
                break;
        }
    }
    throw new Error(`Unexpected platform '${process.platform}'`);
}

function getVimVariable(variable: string, exe: string, neovim: boolean): string {
    const args = ['-c', 'redir! > tmp_command_output.txt', '-c', `echon ${variable}`, '-c', 'redir END', '-c', 'qa!'];
    if (neovim) {
        args.unshift('--headless', '--clean');
    } else {
        args.unshift('--not-a-term', '-u', 'NONE', '-i', 'NONE', '-N', '-n', '-e', '-s', '--noplugin');
    }
    const proc = spawnSync(exe, args, { timeout: 5000 });
    assert.equal(proc.error, undefined, `stderr=${proc.stderr.toString()}`);
    return readFileSync('tmp_command_output.txt', 'utf-8').trim();
}

function main(): void {
    log('Running with argv:', process.argv);

    const args = parseArgs(process.argv);
    log('Command line arguments:', args);

    const exe = expectedExecutable(args.neovim, args.version);
    log('Validating executable path. Expected executable:', exe);
    assert.equal(exe, args.executable);
    assert.ok(existsSync(exe));

    const bin = path.dirname(exe);
    log(`Validating '${bin}' is in $PATH`);
    assert.ok(process.env['PATH']);
    const pathSep = process.platform === 'win32' ? ';' : ':';
    const paths = process.env['PATH'].split(pathSep);
    assert.ok(paths.includes(bin), `'${bin}' is not included in '${process.env['PATH']}'`);

    log('Validating executable');
    const proc = spawnSync(exe, ['-N', '-c', 'quit'], { timeout: 5000 });
    let stderr = proc.stderr.toString();
    assert.equal(proc.error, undefined);
    assert.equal(proc.status, 0, `stderr: ${stderr}`);
    assert.equal(proc.signal, null, `stderr: ${stderr}`);

    log('Validating version');
    const ver = spawnSync(exe, ['--version'], { timeout: 5000 });
    stderr = ver.stderr.toString();
    assert.equal(ver.error, undefined);
    assert.equal(ver.status, 0, `stderr: ${stderr}`);
    assert.equal(ver.signal, null, `stderr: ${stderr}`);
    const stdout = ver.stdout.toString();
    if (args.version !== 'stable' && args.version !== 'nightly') {
        if (args.neovim) {
            const l = `NVIM ${args.version}`;
            assert.ok(stdout.includes(l), `First line '${l}' should be included in stdout: ${stdout}`);
        } else {
            const m = args.version.match(/^v(\d+\.\d+)\.(\d+)$/);
            assert.ok(m);
            const major = m[1];
            const patch = parseInt(m[2], 10);

            const l = `VIM - Vi IMproved ${major}`;
            assert.ok(stdout.includes(l), `First line '${l}' should be included in stdout: ${stdout}`);

            // assert.match is not available since it is experimental
            assert.ok(
                stdout.includes(`Included patches: 1-${patch}`),
                `Patch 1-${patch} should be included in stdout: ${stdout}`,
            );
        }
    } else {
        const editorName = args.neovim ? 'NVIM' : 'VIM - Vi IMproved';
        assert.ok(stdout.includes(editorName), `Editor name '${editorName}' should be included in stdout: ${stdout}`);
    }

    // TODO: Remove this `if` condition after the next release.
    if (process.env['GITHUB_WORKFLOW'] !== 'Post-release check') {
        log('Validating $VIM directory', args.vimdir);
        const vimdir = realpathSync(args.vimdir);
        if (vimdir !== args.vimdir) {
            log('vim-dir path is resolved to', vimdir);
        }
        let expectedVimDir = getVimVariable('$VIM', exe, args.neovim);
        if (process.platform === 'win32') {
            // Neovim mixes '\' and '/' in $VIM value (\path\to\nvim-nightly\share/nvim)
            expectedVimDir = path.win32.normalize(expectedVimDir);
        }
        assert.equal(expectedVimDir, vimdir);

        log('Validating $VIMRUNTIME directory', args.runtimeDir);
        const runtimeDir = realpathSync(args.runtimeDir);
        if (runtimeDir !== args.runtimeDir) {
            log('vim-dir path is resolved to', runtimeDir);
        }
        let expectedRuntimeDir = getVimVariable('$VIMRUNTIME', exe, args.neovim);
        if (process.platform === 'win32') {
            // Neovim mixes '\' and '/' in $VIM value (\path\to\nvim-nightly\share/nvim)
            expectedRuntimeDir = path.win32.normalize(expectedRuntimeDir);
        }
        assert.equal(expectedRuntimeDir, runtimeDir);
    }

    log('OK');
}

main();
