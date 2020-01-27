import { strict as A } from 'assert';
import { loadConfigFromInputs } from '../src/config';

function setInputs(inputs: { [k: string]: string }) {
    for (const key of Object.keys(inputs)) {
        const k = `INPUT_${key.toUpperCase().replace(' ', '_')}`;
        process.env[k] = inputs[key];
    }
}

describe('loadConfigFromInputs()', function() {
    let savedEnv: { [k: string]: string | undefined };

    before(function() {
        savedEnv = { ...process.env };
    });

    afterEach(function() {
        process.env = { ...savedEnv };
    });

    it('returns default configurations with no input', function() {
        const c = loadConfigFromInputs();
        A.equal(c.version, 'stable');
        A.equal(c.neovim, false);
        A.ok(['macos', 'linux', 'windows'].includes(c.os), c.os);
        A.equal(c.token, null);
    });

    it('returns validated configurations with user inputs', function() {
        setInputs({
            version: 'nightly',
            neovim: 'true',
            'github-token': 'this is token',
        });
        const c = loadConfigFromInputs();
        A.equal(c.version, 'nightly');
        A.equal(c.neovim, true);
        A.ok(['macos', 'linux', 'windows'].includes(c.os), c.os);
        A.equal(c.token, 'this is token');
    });
});
