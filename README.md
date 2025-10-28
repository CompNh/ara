# Ara UI Components
> **목표:** Kendo/Crystal처럼 *상업화 가능한* UI 컴포넌트 제품군을 만든다.

## Stack (snapshot)
VS Code(Git Bash) · Windows · React+TypeScript · Node 22 LTS · pnpm(workspaces)+Corepack · Vite(dev)/Rollup(lib) · Vitest+RTL · Storybook · ESLint(Flat)+Prettier · Changesets · GitHub · .gitattributes(LF) · .editorconfig · commit-msg(amend)

## 일정 (WBS/Tasks)
 **경로** : root/planning
 **WBS** : WBS.CSV
 **Task** : Tasks.CSV

## Git 설정
- 커밋 템플릿은 `.github/COMMIT_TEMPLATE` 을 직접 사용한다.
- 설정 스크립트 실행: (Git Bash) 프롬프트에서 하위 실행 
    `bash scripts/git/setup-commit-template.sh`
- 검증(테스트) 방법:
  1. 스크립트 실행 후 `git config --local --get commit.template` 명령을 실행한다.
  2. 출력이 `<repo>/.github/COMMIT_TEMPLATE` 경로와 동일한지 확인한다.
  3. `git commit` 실행 시 템플릿이 자동으로 로드되는지 확인하면 끝.
