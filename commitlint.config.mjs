// commitlint v19+ ESM config
// 규칙: Conventional Commits 강제 + 자주 틀리는 subject 대문자 금지
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 예: "Fix:", "Chore:" 같은 대문자 시작 금지
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    // type 화이트리스트 (필요 시 추가/수정)
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
        'release',
      ],
    ],
    // 빈 subject 금지
    'subject-empty': [2, 'never'],
    // scope는 자유 (필요하면 enum으로 제한 가능)
  },
};
