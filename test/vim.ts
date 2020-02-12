import { strict as A } from 'assert';
import { installVimOnWindows, detectLatestWindowsReleaseTag } from '../src/vim';

describe('detectLatestWindowsReleaseTag()', function() {
    it('detects the latest release from redirect URL', async function() {
        const tag = await detectLatestWindowsReleaseTag();
        const re = /^v\d+\.\d+\.\d{4}$/;
        A.ok(re.test(tag), `'${tag}' did not match to ${re}`);
    });
});

describe('installVimOnWindows()', function() {
    it('throws an error when the specified version does not exist', async function() {
        await A.rejects(() => installVimOnWindows('v0.1.2'), /^Error: Could not download and unarchive asset/);
    });
});
