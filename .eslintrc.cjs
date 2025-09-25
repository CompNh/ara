/**
 * ESLint configuration for Ara projects.
 * 모노레포 전역 린트 규칙의 기반을 마련해 이후 패키지에서도 일관 적용
 *  Ara Tier-0: ESLint base config (no type-aware yet) */
module.exports = {
  root: true,
  env: { es2022: true, node: true, browser: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    // type-aware linting은 Tier-0 이후에 project 설정으로 분리 예정
  },
  plugins: ['@typescript-eslint', 'import', 'unused-imports'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  settings: {
    'import/resolver': {
      // 패키지별 tsconfig paths는 이후에 추가
      node: { extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'] },
    },
  },
  rules: {
    // 일반 규칙
    'no-console': 'off',
    'no-debugger': 'warn',

    // TypeScript 권장 규칙(타입 인식 필요 없는 범위)
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',

    // import 정리
    'import/order': [
      'warn',
      {
        groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index']],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],

    // 미사용 import 정리(컴파일 전 가벼운 정리용)
    'unused-imports/no-unused-imports': 'warn',
  },
  ignorePatterns: ['dist/', 'build/', 'node_modules/', '**/*.d.ts', 'coverage/', '.turbo/'],
};
