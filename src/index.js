"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const core = __importStar(require("@actions/core"));
const config_1 = require("./config");
const install_1 = require("./install");
const validate_1 = require("./validate");
async function main() {
    const config = (0, config_1.loadConfigFromInputs)();
    console.log('Extracted configuration:', config);
    const installed = await (0, install_1.install)(config);
    await (0, validate_1.validateInstallation)(installed);
    core.addPath(installed.binDir);
    core.debug(`'${installed.binDir}' was added to $PATH`);
    const fullPath = (0, path_1.join)(installed.binDir, installed.executable);
    core.setOutput('executable', fullPath);
    console.log('Installed executable:', fullPath);
    console.log('Installation successfully done:', installed);
}
main().catch((e) => {
    if (e.stack) {
        core.debug(e.stack);
    }
    core.error(e.message);
    core.setFailed(e.message);
});
//# sourceMappingURL=index.js.map