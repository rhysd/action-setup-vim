// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import ts from 'typescript-eslint';
import mocha from 'eslint-plugin-mocha';
import n from 'eslint-plugin-n';

export default defineConfig(
    eslint.configs.recommended,
    ts.configs.recommendedTypeChecked,
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
            '@typescript-eslint/switch-exhaustiveness-check': ['error', { considerDefaultExhaustiveForUnions: true }],
            '@typescript-eslint/no-deprecated': 'error',
            'n/handle-callback-err': 'error',
            'n/prefer-promises/fs': 'error',
            'n/prefer-global/buffer': ['error', 'never'],
            'n/prefer-global/process': ['error', 'never'],
            'n/prefer-node-protocol': 'error',
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
        // The cast is workaround for https://github.com/lo1tuma/eslint-plugin-mocha/issues/392
        .../** @type {{recommended: import('eslint').Linter.Config}} */ (mocha.configs).recommended,
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
            '@typescript-eslint/naming-convention': 'off',
            'mocha/no-setup-in-describe': 'off',
            'mocha/no-hooks-for-single-case': 'off',
            'mocha/max-top-level-suites': 'off',
            'mocha/consistent-spacing-between-blocks': 'off', // Conflict with prettier
            'mocha/no-exclusive-tests': 'error',
            'mocha/no-pending-tests': 'error',
            'mocha/no-top-level-hooks': 'error',
            'mocha/consistent-interface': ['error', { interface: 'BDD' }],
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
