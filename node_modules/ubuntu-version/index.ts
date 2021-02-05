import { execFile } from 'child_process';

export interface UbuntuVersion {
    description: string;
    release: string;
    codename: string;
}

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

export async function getUbuntuVersion(): Promise<UbuntuVersion | null> {
    if (process.platform !== 'linux') {
        return null;
    }

    const stdout = await command('lsb_release', ['-a']);
    if (stdout === null) {
        return null;
    }

    const reDistributor = /^Distributor ID:\s*(.+)$/;
    const reDescription = /^Description:\s*(.+)$/;
    const reRelease = /^Release:\s*(.+)$/;
    const reCodename = /^Codename:\s*(.+)$/;
    let description = null;
    let release = null;
    let codename = null;
    for (const line of stdout.split('\n')) {
        const m = line.match(reDistributor);
        if (m !== null) {
            const distributor = m[1];
            if (distributor !== 'Ubuntu') {
                return null;
            }
        }

        const desc = line.match(reDescription)?.[1];
        if (desc) {
            description = desc;
        }
        const rel = line.match(reRelease)?.[1];
        if (rel) {
            release = rel;
        }
        const code = line.match(reCodename)?.[1];
        if (code) {
            codename = code;
        }
    }

    if (description === null || release === null || codename === null) {
        return null;
    }

    return { description, release, codename };
}
