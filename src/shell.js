"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exec_1 = require("@actions/exec");
async function exec(cmd, args, opts) {
    const res = {
        stdout: '',
        stderr: '',
        code: null,
    };
    const execOpts = {
        ...opts,
        listeners: {
            stdout(data) {
                res.stdout += data.toString();
            },
            stderr(data) {
                res.stderr += data.toString();
            },
        },
    };
    const code = await exec_1.exec(cmd, args, execOpts);
    if (code === 0) {
        return res.stdout;
    }
    else {
        throw new Error(`Command '${cmd} ${args.join(' ')}' exited non-zero status ${code}: ${res.stderr}`);
    }
}
exports.exec = exec;
//# sourceMappingURL=shell.js.map