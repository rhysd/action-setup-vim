"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureError = void 0;
function ensureError(err) {
    if (err instanceof Error) {
        return err;
    }
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return new Error(`Unknown fatal error: ${err}`);
}
exports.ensureError = ensureError;
//# sourceMappingURL=error.js.map