/**
 * 코드 포맷 규칙을 고정해 팀 전체 스타일을 통일.
 * Ara Tier-0: Prettier base config (LF enforced via .gitattributes) */
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',
};
