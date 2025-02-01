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
exports.validateInstallation = validateInstallation;
const fs_1 = require("fs");
const path_1 = require("path");
const core = __importStar(require("@actions/core"));
const shell_1 = require("./shell");
const system_1 = require("./system");
async function validateInstallation(installed) {
    try {
        const s = await fs_1.promises.stat(installed.binDir);
        if (!s.isDirectory()) {
            throw new Error(`Validation failed! '${installed.binDir}' is not a directory for executable`);
        }
    }
    catch (e) {
        const err = (0, system_1.ensureError)(e);
        throw new Error(`Validation failed! Could not stat installed directory '${installed.binDir}': ${err.message}`);
    }
    core.debug(`Installed directory '${installed.binDir}' was validated`);
    const fullPath = (0, path_1.join)(installed.binDir, installed.executable);
    try {
        await fs_1.promises.access(fullPath, fs_1.constants.X_OK);
    }
    catch (e) {
        const err = (0, system_1.ensureError)(e);
        throw new Error(`Validation failed! Could not access the installed executable '${fullPath}': ${err.message}`);
    }
    try {
        const ver = await (0, shell_1.exec)(fullPath, ['--version']);
        console.log(`Installed version:\n${ver}`);
    }
    catch (e) {
        const err = (0, system_1.ensureError)(e);
        throw new Error(`Validation failed! Could not get version from executable '${fullPath}': ${err.message}`);
    }
    core.debug(`Installed executable '${fullPath}' was validated`);
}
//# sourceMappingURL=validate.js.map