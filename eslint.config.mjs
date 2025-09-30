// ESLint v9 Flat Config for Ara Monorepo (no meta deps)
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import pluginImport from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  // 1) 怨듯넻 ?쒖쇅
  { ignores: ['**/dist/**', '**/build/**', '**/node_modules/**'] },

  // 2) 湲곕낯 異붿쿇 援ъ꽦 (JS + import + prettier)
  js.configs.recommended,
  pluginImport.flatConfigs.recommended,
  pluginImport.flatConfigs.typescript,
  eslintConfigPrettier,

  // 3) TS ?꾩슜(硫뷀? ?⑦궎吏 ????뚮윭洹몄씤/?뚯꽌 吏곸젒 吏??
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        // type-aware linting? Tier-0 ?댄썑??project 湲곕컲?쇰줈 ?꾩엯
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      // @typescript-eslint 異붿쿇 洹쒖튃 ?곸슜
      ...tsPlugin.configs.recommended.rules,

      // ?꾨줈?앺듃 留욎땄
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

  // 4) ?ㅼ젙 ?뚯씪 ?먯껜??由고듃 ????꾨떂(?몄쭛湲??ㅽ깘 諛⑹?)
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
  // 6) @ara/theme 소스는 브라우저 전역 사용(HTMLElement 등)
  {
    files: ['packages/theme/src/**/*.ts'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
      },
    },
  },
  // 7) @ara/docs 소스는 브라우저 전역 사용(document, window 등)
  {
    files: ['packages/docs/src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
        getComputedStyle: 'readonly',
        console: 'readonly',
      },
    },
  },
];
