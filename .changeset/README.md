# Changesets

이 디렉터리는 [`@changesets/cli`](https://github.com/changesets/changesets) 설정을 통해 버전과 릴리스를 관리합니다.

## 기본 사용법

- `pnpm changeset` 명령으로 변경 사항을 기록하는 새 Changeset 파일을 생성합니다.
- `pnpm changeset version` 명령은 누적된 Changeset을 기반으로 패키지 버전과 체인질로그를 갱신합니다.
- `pnpm changeset publish` 명령은 버전이 갱신된 패키지를 배포(예: npm registry)할 때 사용합니다.

### 워크스페이스 경계
- 라이브러리 및 설정 패키지: `packages/*` (`tsconfig`, `eslint-config`, `tokens`, `core`, `react`, `icons` 등)
- 애플리케이션: `apps/*` (`storybook`, `showcase`)
- 내부 도구: `scripts/*`

Changeset 파일을 작성할 때 위 경로를 기준으로 패키지를 식별하고, `pnpm -w list --depth -1` 명령으로 현재 등록된 패키지를 확인합니다.

릴리스 작업은 항상 기본 브랜치(`main`) 기준으로 수행하고, 모든 변경 사항은 PR에 포함된 Changeset 파일을 통해 추적합니다.
