import { execFile } from 'child_process';

function isSystemError(e: Error): e is NodeJS.ErrnoException {
    return 'errno' in e;
}

function command(exe: string, args: string[]): Promise<string | null> {
    return new Promise((resolve, reject) => {
        execFile(exe, args, { encoding: 'utf8', shell: false }, (error, stdout, stderr) => {
            if (error) {
                if (isSystemError(error) && error.code === 'ENOENT') {
                    resolve(null); // When lsb_release is not found
                    return;
                }
                reject(new Error(`Could not execute \`${exe} ${args.join(' ')}\`: ${error} (stderr=${stderr})`));
                return;
            }
            resolve(stdout);
        });
    });
}

export async function getUbuntuVersion(): Promise<number[]> {
    if (process.platform !== 'linux') {
        return [];
    }

    const stdout = await command('lsb_release', ['-a']);
    if (stdout === null) {
        return [];
    }

    const reDistributor = /^Distributor ID:\s*(.+)$/;
    const reDescription = /^Description:\s*Ubuntu\s+(\d+)\.(\d+)(?:\.(\d+))?/;
    const reRelease = /^Release:\s*(\d+)\.(\d+)(?:\.(\d+))?$/;
    let description = null;
    let release = null;
    let distributorFound = false;
    for (const line of stdout.split('\n')) {
        const m = line.match(reDistributor);
        if (m !== null) {
            const distributor = m[1];
            if (distributor !== 'Ubuntu') {
                return [];
            }
            distributorFound = true;
        }

        const desc = line.match(reDescription);
        if (desc) {
            description = desc;
        }
        const rel = line.match(reRelease);
        if (rel) {
            release = rel;
        }

        if (distributorFound && description && release) {
            break;
        }
    }

    if (!distributorFound) {
        return [];
    }

    for (const m of [description, release]) {
        if (m) {
            const ss = [m[1], m[2]];
            if (m[3]) {
                ss.push(m[3]);
            }
            return ss.map(s => parseInt(s, 10));
        }
    }

    return [];
}
