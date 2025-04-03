import { strict as A } from 'node:assert';
import process from 'node:process';
import { loadConfigFromInputs } from '../src/config.js';

function setInputs(inputs: Record<string, string>): void {
    for (const key of Object.keys(inputs)) {
        const k = `INPUT_${key.toUpperCase().replace(' ', '_')}`;
        process.env[k] = inputs[key];
    }
}

describe('loadConfigFromInputs()', function () {
    let savedEnv: Record<string, string | undefined>;

    before(function () {
        savedEnv = { ...process.env };
    });

    afterEach(function () {
        process.env = { ...savedEnv };
    });

    it('returns default configurations with no input', function () {
        const c = loadConfigFromInputs();
        A.equal(c.version, 'stable');
        A.equal(c.neovim, false);
        A.equal(c.configureArgs, null);
        A.ok(['macos', 'linux', 'windows'].includes(c.os), c.os);
        A.ok(['arm64', 'x86_64'].includes(c.arch), c.arch);
    });

    it('returns validated configurations with user inputs', function () {
        setInputs({
            version: 'nightly',
            neovim: 'true',
            'configure-args': '--with-features=huge --disable-nls',
        });
        const c = loadConfigFromInputs();
        A.equal(c.version, 'nightly');
        A.equal(c.neovim, true);
        A.equal(c.configureArgs, '--with-features=huge --disable-nls');
        A.ok(['macos', 'linux', 'windows'].includes(c.os), c.os);
        A.ok(['arm64', 'x86_64'].includes(c.arch), c.arch);
    });

    for (const version of ['STABLE', 'Nightly']) {
        it(`sets '${version}' for ${version.toLowerCase()}`, function () {
            setInputs({ version });
            const c = loadConfigFromInputs();
            A.equal(c.version, version.toLowerCase());
        });
    }

    for (const b of ['TRUE', 'False']) {
        it(`sets '${b}' for boolean value ${b.toLowerCase()}`, function () {
            setInputs({ neovim: b });
            const c = loadConfigFromInputs();
            const expected = b.toLowerCase() === 'true';
            A.equal(c.neovim, expected);
        });
    }

    const specificVersions: Array<{
        neovim: boolean;
        version: string;
    }> = [
        {
            neovim: false,
            version: 'v8.1.1111',
        },
        {
            neovim: false,
            version: 'v8.2.0001',
        },
        {
            neovim: false,
            version: 'v10.10.0001',
        },
        {
            neovim: false,
            version: 'v7.4.100',
        },
        {
            neovim: false,
            version: 'v7.4',
        },
        {
            neovim: true,
            version: 'v0.4.3',
        },
        {
            neovim: true,
            version: 'v1.0.0',
        },
        {
            neovim: true,
            version: 'v10.10.10',
        },
    ];

    for (const t of specificVersions) {
        const editor = t.neovim ? 'Neovim' : 'Vim';
        it(`verifies correct ${editor} version ${t.version}`, function () {
            setInputs({
                version: t.version,
                neovim: t.neovim.toString(),
            });
            const c = loadConfigFromInputs();
            A.equal(c.version, t.version);
            A.equal(c.neovim, t.neovim);
        });
    }

    const errorCases: Array<{
        what: string;
        inputs: Record<string, string>;
        expected: RegExp;
    }> = [
        {
            what: 'wrong neovim input',
            inputs: {
                neovim: 'latest',
            },
            expected: /'neovim' input only accepts boolean values 'true' or 'false' but got 'latest'/,
        },
        {
            what: 'vim version with wrong number of digits in patch version',
            inputs: {
                version: 'v8.2.100',
            },
            expected: /'version' input 'v8\.2\.100' is not a format of Git tags in vim\/vim repository/,
        },
        {
            what: 'vim version without prefix "v"',
            inputs: {
                version: '8.2.0100',
            },
            expected: /'version' input '8\.2\.0100' is not a format of Git tags in vim\/vim repository/,
        },
        {
            what: 'vim version with patch version',
            inputs: {
                version: 'v8.2',
            },
            expected: /'version' input 'v8\.2' is not a format of Git tags in vim\/vim repository/,
        },
        {
            what: 'vim version with only major version',
            inputs: {
                version: 'v8',
            },
            expected: /'version' input 'v8' is not a format of Git tags in vim\/vim repository/,
        },
        {
            what: 'vim version with wrong tag name',
            inputs: {
                version: 'latest',
            },
            expected: /'version' input 'latest' is not a format of Git tags in vim\/vim repository/,
        },
        {
            what: 'neovim version without prefix "v"',
            inputs: {
                neovim: 'true',
                version: '0.4.3',
            },
            expected: /'version' input '0\.4\.3' is not a format of Git tags in neovim\/neovim repository/,
        },
        {
            what: 'neovim version without patch version',
            inputs: {
                neovim: 'true',
                version: 'v0.4',
            },
            expected: /'version' input 'v0\.4' is not a format of Git tags in neovim\/neovim repository/,
        },
        {
            what: 'neovim version with only major version',
            inputs: {
                neovim: 'true',
                version: 'v1',
            },
            expected: /'version' input 'v1' is not a format of Git tags in neovim\/neovim repository/,
        },
        {
            what: 'neovim version with wrong tag name',
            inputs: {
                neovim: 'true',
                version: 'latest',
            },
            expected: /'version' input 'latest' is not a format of Git tags in neovim\/neovim repository/,
        },
    ];

    for (const t of errorCases) {
        it(`causes an error on ${t.what}`, function () {
            setInputs(t.inputs);
            A.throws(loadConfigFromInputs, t.expected);
        });
    }
});
