import globals from 'globals';
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import jestPlugin from 'eslint-plugin-jest';

const jestFlatRecommended = jestPlugin.configs?.['flat/recommended'] ?? {};

export default [
  {
    ignores: ['node_modules', 'dist', 'coverage'],
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2025,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...(eslintConfigPrettier.rules ?? {}),
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.test.{js,jsx,mjs,cjs,ts,tsx}', '**/__tests__/**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      ...(jestFlatRecommended.rules ?? {}),
    },
  },
];
