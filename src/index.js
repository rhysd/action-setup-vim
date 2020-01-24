"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const config_1 = require("./config");
const install_1 = require("./install");
const validate_1 = require("./validate");
async function main() {
    const config = config_1.loadConfigFromInputs();
    console.log('Extracted configuration:', config);
    const installed = await install_1.install(config);
    console.log(`::set-env name=PATH::${installed.bin}:${process.env.PATH}`);
    core.debug(`'${installed.bin}' was set to $PATH`);
    await validate_1.validateInstallation(installed);
    core.setOutput('executable', installed.executable);
    console.log('Installation successfully done:', installed);
}
main().catch(e => {
    core.debug(e.stack);
    core.setFailed(e.message);
});
//# sourceMappingURL=index.js.map