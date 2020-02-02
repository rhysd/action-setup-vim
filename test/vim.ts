import { strict as A } from 'assert';
import { detectLatestWindowsReleaseTag } from '../src/vim';

describe('detectLatestWindowsReleaseTag()', function() {
    it('detects the latest release from redirect URL', async function() {
        const tag = await detectLatestWindowsReleaseTag();
        const re = /^v\d+\.\d+\.\d{4}$/;
        A.ok(re.test(tag), `'${tag}' did not match to ${re}`);
    });
});
