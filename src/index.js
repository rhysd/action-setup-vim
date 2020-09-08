"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
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
    core.exportVariable('PATH', `${installed.binDir}${pathSep}${process.env.PATH}`);
    core.debug(`'${installed.binDir}' was set to $PATH`);
    const fullPath = path_1.join(installed.binDir, installed.executable);
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