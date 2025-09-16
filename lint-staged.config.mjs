/**
 * lint-staged v16 config with banners
 * - 스테이징된 파일만 처리
 * - JS/TS: (배너) Prettier → (배너) ESLint --fix
 * - 텍스트/마크업: (배너) Prettier만
 * - 배너는 node -e 로 출력하므로 크로스플랫폼 OK
 */
export default {
  '*.{js,cjs,mjs,ts,tsx,jsx}': [
    // Prettier 배너
    `node -e "console.log('\\n=====================\\n*  Prettier(write)  *\\n=====================')"`,

    // 포맷
    'prettier --write',

    // ESLint 배너
    `node -e "console.log('\\n*********************\\n*   ESLint --fix    *\\n*********************')"`,

    // 린트 & 자동고침
    'eslint --fix --max-warnings=0',
  ],

  '*.{json,md,mdx,yml,yaml,css,scss,html}': [
    // Prettier 배너
    `node -e "console.log('\\n=====================\\n*  Prettier(write)  *\\n=====================')"`,

    // 포맷(텍스트/마크업 전용)
    'prettier --write',
  ],
};
