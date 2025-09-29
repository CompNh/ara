// ESLint v9 Flat Config for Ara Monorepo (no meta deps)
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import pluginImport from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  // 1) 공통 제외
  { ignores: ['**/dist/**', '**/build/**', '**/node_modules/**'] },

  // 2) 기본 추천 구성 (JS + import + prettier)
  js.configs.recommended,
  pluginImport.flatConfigs.recommended,
  pluginImport.flatConfigs.typescript,
  eslintConfigPrettier,

  // 3) TS 전용(메타 패키지 대신 플러그인/파서 직접 지정)
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        // type-aware linting은 Tier-0 이후에 project 기반으로 도입
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      // @typescript-eslint 추천 규칙 적용
      ...tsPlugin.configs.recommended.rules,

      // 프로젝트 맞춤
      'no-debugger': 'warn',
      'import/order': [
        'warn',
        {
          groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'unused-imports/no-unused-imports': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // 4) 설정 파일 자체는 린트 대상 아님(편집기 오탐 방지)
  { files: ['eslint.config.*'], rules: { 'import/no-unresolved': 'off' } },

  // 5) CJS configs: treat as Node/CommonJS ---
  {
    files: ['**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        module: 'writable',
        exports: 'writable',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
      },
    },
  },
];
