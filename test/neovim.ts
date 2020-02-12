import { strict as A } from 'assert';
import { downloadNeovim } from '../src/neovim';

describe('downloadNeovim()', function() {
    it('throws an error when release asset not found', async function() {
        await A.rejects(() => downloadNeovim('v0.4.999', 'linux'), /Downloading asset failed/);
    });
});
