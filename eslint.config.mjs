import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importX from 'eslint-plugin-import-x';

import { boundaries } from './tools/quality/boundary-rules.mjs';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  prettier,
  globalIgnores([
    '**/node_modules/**',
    '**/.next/**',
    '**/out/**',
    'coverage/**',
  ]),
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    plugins: { 'import-x': importX, architecture: { rules: { boundaries } } },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: 'tsconfig.json',
        }),
      ],
    },
    rules: {
      'max-lines': [
        'error',
        { max: 200, skipBlankLines: true, skipComments: true },
      ],
      'max-lines-per-function': [
        'error',
        { max: 60, skipBlankLines: true, skipComments: true },
      ],
      complexity: ['error', 10],
      'max-params': ['error', 4],
      'import-x/no-cycle': 'error',
      'architecture/boundaries': 'error',
      '@next/next/no-img-element': 'error',
    },
  },
  {
    files: ['src/app/**/{page,layout,route}.tsx', 'src/app/**/route.ts'],
    rules: {
      'max-lines': [
        'error',
        { max: 60, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx,mjs}'],
    rules: {
      'max-lines': [
        'error',
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
    },
  },
]);
