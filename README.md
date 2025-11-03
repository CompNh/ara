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
   - 저장소 루트에서 `pnpm install --no-frozen-lockfile` 또는 CI와 동일하게 `pnpm -w install --no-frozen-lockfile`을 실행해 모든 패키지를 내려받는다.

## 모노레포 구조 한눈에 보기
```text
.
├─ apps/
│  ├─ showcase/        # 디자인 시스템 소비 예제를 모아둔 Vite 앱
│  └─ storybook/       # 컴포넌트 개발용 Storybook 인스턴스
├─ packages/
│  ├─ core/            # headless 로직과 테마 시스템
│  ├─ react/           # React 바인딩 및 컴포넌트 구현
│  ├─ tokens/          # 디자인 토큰 빌드 및 JSON 배포물
│  ├─ icons/           # SVG 아이콘과 타입 정의
│  ├─ eslint-config/   # Flat 구성 기반 ESLint 프리셋
│  └─ tsconfig/        # TypeScript 공유 설정(base/react-library)
├─ scripts/            # 빌드·거버넌스 자동화 스크립트
├─ docs/               # 운영 가이드 및 정책 문서
└─ planning/           # WBS/Task 정의 자료
```

> `pnpm -w list --depth -1` 명령으로 각 디렉터리가 워크스페이스에 올바르게 등록돼 있는지 수시로 점검한다.

### 패키지 역할과 의존 관계
| 패키지 | 유형 | 주요 역할 | 워크스페이스 의존성 |
| --- | --- | --- | --- |
| `@ara/tokens` | 라이브러리 | 디자인 토큰을 Rollup으로 번들해 JS/TS/JSON 으로 배포 | `@ara/tsconfig` |
| `@ara/core` | 라이브러리 | 토큰 기반 테마·headless 로직 제공 | `@ara/tokens`, `@ara/tsconfig` |
| `@ara/icons` | 라이브러리 | 공용 SVG 아이콘과 타입 정의 | `@ara/tsconfig` |
| `@ara/react` | 라이브러리 | React 컴포넌트와 테마 훅 제공 | `@ara/core`, `@ara/tsconfig` |
| `@ara/eslint-config` | 설정 | 모노레포 전반에서 공유하는 ESLint Flat 프리셋 | (외부 패키지 중심) |
| `@ara/tsconfig` | 설정 | `tsconfig.base.json` 및 React 라이브러리 확장 베이스 제공 | - |

### 공통 설정 참조 절차
1. **TypeScript**
   - 새 패키지를 생성하면 `tsconfig.build.json` 에서 `"extends": "../../tsconfig.base.json"` 로 루트 설정을 가져온다.
   - 런타임/테스트 구성용 `tsconfig.json` 은 `tsconfig.build.json` 을 재사용하고, 필요 시 `types` 만 추가한다.
   - 루트의 `tsconfig.base.json` 은 `@ara/tsconfig/base.json` 을 확장하므로, 공유 설정 변경은 `packages/tsconfig` 패키지에서 먼저 수행한다.
2. **ESLint**
   - `eslint.config.js` 또는 패키지별 Flat 설정에서 `import { configs } from "@ara/eslint-config";` 로 프리셋 묶음을 불러온다.
   - 필요한 override 가 있을 경우 `...configs.xxx` 배열 뒤에 패키지 전용 규칙을 추가한다. (예: 루트는 `configs.node` 사용)
3. **패키지 매니페스트**
   - 새 워크스페이스 패키지를 추가할 때는 `docs/package-governance.md` 의 메타데이터 체크리스트를 따르고, 마지막에 `pnpm run check:manifests` 로 검증한다.

### 패키지 스캐폴딩 순서 가이드
1. **디자인 토큰(`@ara/tokens`)** : 색상, 타이포그래피 등 기초 자산을 우선 정의하고 빌드 파이프라인을 확정한다.
2. **헤드리스 로직(`@ara/core`)** : 토큰을 소비하는 테마 시스템과 상태 훅을 구현한다.
3. **아이콘(`@ara/icons`)** : 컴포넌트에서 재사용할 SVG 아이콘과 타입을 생성한다.
4. **React 레이어(`@ara/react`)** : 위 패키지들을 소비하는 컴포넌트를 작성하고, 스토리/테스트를 붙인다.
5. **소비 앱(`apps/storybook`, `apps/showcase`)** : 새로운 컴포넌트를 Storybook과 쇼케이스에서 검증한다.

각 단계가 완료될 때마다 관련 의존 패키지를 `pnpm --filter <pkg> build` 로 미리 빌드해 dist 산출물이 존재하는지 확인하고, 최종적으로 `pnpm -w workspace:check` 를 실행해 전체 워크스페이스 일관성을 점검한다.

### 패키지 거버넌스 정책
- [패키지 거버넌스 가이드](docs/package-governance.md)를 참고해 `@ara/` 스코프, 공개/비공개 정책, 메타데이터(`engines`, `license`, `repository`)를 맞춘다.
- 새 패키지를 추가하거나 변경한 뒤에는 `pnpm run check:manifests` 로 자동 점검을 수행한다.

## 워크스페이스 검증 스크립트
- 루트에서 `pnpm -w lint`, `pnpm -w test`, `pnpm -w build`, `pnpm -w storybook:smoke` 를 실행하면 워크스페이스 전체에 동일한 명령이 순차적으로 적용된다.
- 위 명령을 한 번에 돌리고 싶다면 `pnpm -w workspace:check` 스크립트를 사용한다. 순서는 `lint → test → build → storybook:smoke` 이며 Storybook 단계는 개발 서버 대신 스모크 테스트 플래그를 사용해 빠르게 종료된다.
- Changesets 기반 배포 흐름(`pnpm release`)과는 별개의 사전 점검 라인이다. 배포가 필요한 경우에는 변경 사항을 Changeset으로 기록한 뒤 `pnpm release` 를 사용한다.

### 패키지별 테스트 실행 팁
- **패키지 전체 테스트:** `pnpm --filter @ara/react test`
- **단일 테스트 파일 실행:** `pnpm --filter @ara/react test -- src/components/button/Button.test.tsx`
  - `--` 뒤에 전달하는 경로는 **패키지 루트(`packages/react`) 기준**이어야 한다. 워크스페이스 루트 경로(예: `packages/react/...`)를 전달하면 Vitest가 테스트 파일을 찾지 못한다.

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
