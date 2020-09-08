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
exports.install = void 0;
const core = __importStar(require("@actions/core"));
const install_linux_1 = require("./install_linux");
const install_macos_1 = require("./install_macos");
const install_windows_1 = require("./install_windows");
function install(config) {
    core.debug(`Detected operating system: ${config.os}`);
    switch (config.os) {
        case 'linux':
            return install_linux_1.install(config);
        case 'macos':
            return install_macos_1.install(config);
        case 'windows':
            return install_windows_1.install(config);
    }
}
exports.install = install;
//# sourceMappingURL=install.js.map