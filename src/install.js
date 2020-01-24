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