"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exec = void 0;
const exec_1 = require("@actions/exec");
// Avoid leaking $INPUT_* variables to subprocess
//   ref: https://github.com/actions/toolkit/issues/309
function getEnv(base) {
    const ret = base !== null && base !== void 0 ? base : {};
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
async function exec(cmd, args, opts) {
    const res = {
        stdout: '',
        stderr: '',
        code: null,
    };
    const execOpts = {
        cwd: opts === null || opts === void 0 ? void 0 : opts.cwd,
        env: getEnv(opts === null || opts === void 0 ? void 0 : opts.env),
        listeners: {
            stdout(data) {
                res.stdout += data.toString();
            },
            stderr(data) {
                res.stderr += data.toString();
            },
        },
        ignoreReturnCode: true,
    };
    const code = await exec_1.exec(cmd, args, execOpts);
    if (code === 0) {
        return res.stdout;
    }
    else {
        const stderr = res.stderr.replace(/\r?\n/g, ' ');
        throw new Error(`Command '${cmd} ${args.join(' ')}' exited non-zero status ${code}: ${stderr}`);
    }
}
exports.exec = exec;
//# sourceMappingURL=shell.js.map