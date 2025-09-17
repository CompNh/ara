// ESLint v9 Flat Config
import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-config-prettier';

export default [
  // 0) 전역 무시(가장 앞: dist 등 산출물 무조건 제외)
  {
    ignores: [
      'node_modules/**',
      '**/dist/**',
      'packages/**/dist/**',
      'build/**',
      'packages/**/build/**',
      '.turbo/**',
      'coverage/**',
      'pnpm-lock.yaml',
      '**/*.map',
      '**/*.d.mts',
    ],
  },

  // 1) 기본 환경: Node + ES2022 (브라우저 전역은 아래 theme 범위에서만 허용)
  {
    files: ['**/*.{js,cjs,mjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022,
        ...globals.browser,
      },
    },
  },

  // 2) JS 권장 규칙
  js.configs.recommended,

  // 3) TypeScript: 전용 파서/룰
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        // 필요 시 project 지정 가능:
        // project: './tsconfig.json',
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...(tsPlugin.configs.recommended?.rules ?? {}),
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'warn',
    },
  },

  // 4) theme 패키지에만 브라우저 전역 허용(SSR/DOM 유틸 경고 방지)
  {
    files: ['packages/theme/**/*.{ts,tsx,js,cjs,mjs}'],
    languageOptions: {
      globals: {
        ...globals.browser, // window, document 등
        HTMLElement: 'readonly', // 명시(중복 무해)
      },
    },
  },

  {
    files: ['**/__tests__/**/*.{ts,tsx,js,jsx}', '**/*.{test,spec}.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        // 브라우저 전역(document, window 등)
        ...globals.browser,
        // (옵션) 테스트 내 Node 전역도 허용하려면 함께 둠
        ...globals.node,
        // Vitest 전역
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },

  // 5) Prettier와 충돌하는 규칙 비활성화(항상 마지막)
  prettier,
];
