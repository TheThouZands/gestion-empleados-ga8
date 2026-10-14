import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['backend/**/*.js', 'scripts/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  { ignores: ['node_modules/**', 'frontend/**', 'dist/**', '.local/**'] },
];
