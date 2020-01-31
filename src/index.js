"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const core = __importStar(require("@actions/core"));
const config_1 = require("./config");
const install_1 = require("./install");
const validate_1 = require("./validate");
async function main() {
    const config = config_1.loadConfigFromInputs();
    console.log('Extracted configuration:', config);
    const pathSep = process.platform === 'win32' ? ';' : ':';
    const installed = await install_1.install(config);
    await validate_1.validateInstallation(installed);
    core.exportVariable('PATH', `${installed.bin}${pathSep}${process.env.PATH}`);
    core.debug(`'${installed.bin}' was set to $PATH`);
    const fullPath = path_1.join(installed.bin, installed.executable);
    core.setOutput('executable', fullPath);
    console.log('Installed executable:', fullPath);
    console.log('Installation successfully done:', installed);
}
main().catch(e => {
    core.debug(e.stack);
    core.error(e.message);
    core.setFailed(e.message);
});
//# sourceMappingURL=index.js.map