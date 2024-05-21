import { strict as A } from 'assert';
import { detectSystem } from '../src/system';

describe('detectSystem()', function () {
    it('returns current OS name', function () {
        const s = detectSystem();
        A.ok(['macos', 'linux', 'windows'].includes(s.os), s.os);
    });

    it('returns current arch name', function () {
        const s = detectSystem();
        A.ok(['x64', 'arm64', 'other'].includes(s.arch), s.arch);
    });
});
