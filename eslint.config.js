import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/'] },
  js.configs.recommended,
  {
    files: ['js/**/*.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: globals.browser },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['sw.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'script', globals: globals.serviceworker },
  },
  {
    files: ['tests/**/*.js', '*.config.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
  },
];
