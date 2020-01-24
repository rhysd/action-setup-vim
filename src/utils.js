"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const core = __importStar(require("@actions/core"));
const io_1 = require("@actions/io");
async function makeTmpdir() {
    const dir = os_1.tmpdir();
    await io_1.mkdirP(dir);
    core.debug(`Created temporary directory ${dir}`);
    return dir;
}
exports.makeTmpdir = makeTmpdir;
//# sourceMappingURL=utils.js.map