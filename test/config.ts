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

    const errorCases: Array<{
        what: string;
        inputs: { [k: string]: string };
        expected: RegExp;
    }> = [
        {
            what: 'wrong version input',
            inputs: {
                version: 'foo!',
            },
            expected: /'version' input only accepts 'stable' or 'nightly' but got 'foo!'/,
        },
        {
            what: 'wrong neovim input',
            inputs: {
                neovim: 'undetermined',
            },
            expected: /'neovim' input only accepts boolean value 'true' or 'false' but got 'undetermined'/,
        },
    ];

    for (const t of errorCases) {
        it(`causes an error on ${t.what}`, function() {
            setInputs(t.inputs);
            A.throws(loadConfigFromInputs, t.expected);
        });
    }
});
