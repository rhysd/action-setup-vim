declare module 'eslint-plugin-n' {
    import type { Linter } from 'eslint';

    interface Configs {
        configs: {
            'flat/recommended': Linter.FlatConfig;
        };
    }

    const mod: Configs;
    export default mod;
}
