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
- Conventional Commits를 강제하는 `commit-msg` 훅과 함께 사용한다.
- 설정 스크립트 실행: (Git Bash) 프롬프트에서 하위 실행
    ```bash
    bash scripts/git/setup-commit-template.sh
    bash scripts/git/setup-commit-msg-hook.sh
    ```
- 검증(테스트) 방법:
  1. `git config --local --get commit.template` 명령으로 템플릿 경로가 `<repo>/.github/COMMIT_TEMPLATE` 인지 확인한다.
  2. `git config --local --get core.hooksPath` 명령으로 `<repo>/.githooks` 가 설정되었는지 확인한다.
  3. `git commit` 실행 시 템플릿이 자동으로 로드되고, 메시지를 저장하면 Conventional Commits 규칙과 WBS/Task 정보가 모두 채워져 있어야 한다.
- 기본 브랜치는 `main` 이며, 모든 PR은 `main` 기준으로 생성한다.
- 작업 브랜치는 `feat/컴포넌트-이름`, `fix/버그-설명`, `docs/가이드` 처럼 `타입/설명` 규칙을 따른다.
- 작업 착수 시 `git switch -c feat/무엇` 처럼 새 토픽 브랜치를 생성한 뒤 개발을 진행하고, 완료 후 PR로 `main` 에 병합한다.
