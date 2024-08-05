// @ts-check

import eslint from '@eslint/js';
import ts from 'typescript-eslint';
import mocha from 'eslint-plugin-mocha';
import n from 'eslint-plugin-n';

export default ts.config(
    eslint.configs.recommended,
    ...ts.configs.recommendedTypeChecked,
    // @ts-expect-error Types of typescript-eslint is not compatible with @types/eslint.
    // These packages provide their own types for eslint.config.mjs and they are not compatible with each other.
    // eslint-plugin-n uses @types/eslint but `ts.config()` does not accept the flat config of the plugin.
    // The maintainer of typescript-eslint won't improve this situation. So ignoring type error here is the best
    // we can do.
    // See https://github.com/typescript-eslint/typescript-eslint/issues/8613#issuecomment-1983488262
    n.configs['flat/recommended'],
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                project: 'tsconfig.json',
            },
        },
    },
    {
        rules: {
            'prefer-spread': 'off',
            '@typescript-eslint/explicit-member-accessibility': 'off',
            'n/no-missing-import': 'off',
            eqeqeq: 'error',
            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-unnecessary-type-arguments': 'error',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/no-empty-interface': 'error',
            '@typescript-eslint/restrict-plus-operands': 'error',
            '@typescript-eslint/no-extra-non-null-assertion': 'error',
            '@typescript-eslint/prefer-nullish-coalescing': 'error',
            '@typescript-eslint/prefer-optional-chain': 'error',
            '@typescript-eslint/prefer-includes': 'error',
            '@typescript-eslint/prefer-for-of': 'error',
            '@typescript-eslint/prefer-string-starts-ends-with': 'error',
            '@typescript-eslint/prefer-readonly': 'error',
            '@typescript-eslint/prefer-ts-expect-error': 'error',
            '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
            '@typescript-eslint/switch-exhaustiveness-check': 'error',
            '@typescript-eslint/ban-ts-comment': [
                'error',
                {
                    'ts-ignore': true,
                    'ts-nocheck': true,
                },
            ],
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'default',
                    format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
                    leadingUnderscore: 'allow',
                },
            ],
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/no-confusing-void-expression': 'error',
            '@typescript-eslint/non-nullable-type-assertion-style': 'error',
            'no-return-await': 'off',
            '@typescript-eslint/return-await': ['error', 'in-try-catch'],
            '@typescript-eslint/no-invalid-void-type': 'error',
            '@typescript-eslint/prefer-as-const': 'error',
            '@typescript-eslint/consistent-indexed-object-style': 'error',
            '@typescript-eslint/no-base-to-string': 'error',
            'n/handle-callback-err': 'error',
            'n/prefer-promises/fs': 'error',
            'n/no-sync': 'error',
        },
    },
    {
        files: ['scripts/*.ts'],
        rules: {
            'n/no-sync': 'off',
        },
    },
    {
        files: ['test/*.ts'],
        ...mocha.configs.flat.recommended,
    },
    {
        files: ['test/*.ts'],
        rules: {
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            'mocha/no-setup-in-describe': 'off',
            'mocha/no-hooks-for-single-case': 'off',
            'mocha/max-top-level-suites': 'off',
            'mocha/no-exclusive-tests': 'error',
            'mocha/no-pending-tests': 'error',
            'mocha/no-skipped-tests': 'error',
            'mocha/no-top-level-hooks': 'error',
        },
    },
    {
        files: ['eslint.config.mjs'],
        languageOptions: {
            parserOptions: {
                projectService: false,
                project: 'tsconfig.eslint.json',
            },
        },
        rules: {
            '@typescript-eslint/naming-convention': 'off',
            'n/no-extraneous-import': 'off',
        },
    },
);
