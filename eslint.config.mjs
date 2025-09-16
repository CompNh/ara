// ESLint v9 Flat Config
import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-config-prettier';

export default [
  // 공통 설정(무시/글로벌/ECMA 옵션)
  {
    files: ['**/*.{js,cjs,mjs,ts,tsx}'],
    ignores: [
      'node_modules/**',
      'dist/**',
      'packages/**/dist/**',
      'build/**',
      'packages/**/build/**',
      '.turbo/**',
      'coverage/**',
      'pnpm-lock.yaml',
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2022,
      },
    },
  },

  // JS 권장 규칙
  js.configs.recommended,

  // TypeScript 권장 규칙 + 사용자 규칙
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        // tsconfig가 생기면 project 옵션을 추가 가능
        // project: './tsconfig.json'
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      // 권장 규칙 로드(플랫 구성에서는 rules를 전개)
      ...(tsPlugin.configs.recommended?.rules ?? {}),
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'warn',
    },
  },

  // Prettier와 충돌하는 ESLint 규칙 비활성화
  prettier,
];
