# Ara UI Components
> **목표:** Kendo/Crystal처럼 *상업화 가능한* UI 컴포넌트 제품군을 만든다.

## Stack (snapshot)
VS Code(Git Bash) · Windows · React+TypeScript · Node 22 LTS · pnpm(workspaces)+Corepack · Vite(dev)/Rollup(lib) · Vitest+RTL · Storybook · ESLint(Flat)+Prettier · Changesets · GitHub · .gitattributes(LF) · .editorconfig · commit-msg(amend)

## 로컬 개발 환경 준비
1. **Node.js 22 LTS 설치**
   - [공식 다운로드 페이지](https://nodejs.org/)에서 설치하거나 nvm 등 버전 관리 도구로 22 LTS를 활성화한다.
2. **Corepack 활성화**
   - Node 22 이상에는 Corepack이 기본 포함되어 있으므로 `corepack enable` 로 활성화한다.
3. **pnpm 10.5.2 지정**
   - `corepack use pnpm@10.5.2` 를 실행해 워크스페이스 요구 버전으로 고정한다.
4. **의존성 설치**
   - 저장소 루트에서 `pnpm install --frozen-lockfile` 또는 CI와 동일하게 `pnpm -w install`을 실행해 모든 패키지를 내려받는다.

## 모노레포 워크스페이스 경계
- `packages/*` : 디자인 시스템 라이브러리와 공통 설정 패키지(`tsconfig`, `eslint-config`, `tokens`, `core`, `react`, `icons` 등)
- `apps/*` : 스토리북과 쇼케이스 등 소비자 애플리케이션(`storybook`, `showcase`)
- `scripts/*` : 배포 자동화·스캐폴딩 등 내부 도구 패키지

> `pnpm -w list --depth -1` 명령으로 위 경로들이 워크스페이스에 인식되는지 수시로 점검한다.

### 패키지 거버넌스 정책
- [패키지 거버넌스 가이드](docs/package-governance.md)를 참고해 `@ara/` 스코프, 공개/비공개 정책, 메타데이터(`engines`, `license`, `repository`)를 맞춘다.
- 새 패키지를 추가하거나 변경한 뒤에는 `pnpm run check:manifests` 로 자동 점검을 수행한다.

## 일정 (WBS/Tasks)
 **경로** : root/planning
 **WBS** : WBS.CSV
 **Task** : Tasks.CSV

## Git 설정
- 커밋 템플릿은 `.github/COMMIT_TEMPLATE` 을 직접 사용한다.
- Conventional Commits를 강제하는 `commit-msg` 훅과 함께 사용한다.
- 모든 커밋 메시지와 PR 설명은 한국어로 작성한다.
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
- 워크플로우: `git switch -c feat/button` → 커밋 → `git push -u origin feat/button` → PR 생성 → CI+리뷰 통과 후 main에 머지
- `main` 브랜치 보호 규칙은 [가이드](docs/branch-protection.md)를 참고해 활성화하고, `CI` 워크플로 통과를 필수 상태 체크로 지정한다.
