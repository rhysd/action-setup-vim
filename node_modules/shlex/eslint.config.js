import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,ts}'],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      // Needed because we use console.log() in debug mode
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['test/**/*.{js,ts}'],
    languageOptions: {
      globals: globals.mocha,
    },
  },
  tseslint.configs.recommended,
])
