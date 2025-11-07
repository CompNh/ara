# Changesets Canary 프리릴리스 드라이런 가이드

Button v0 컴포넌트를 canary 채널로 배포하기 위해 Changesets 프리릴리스 흐름을 연습하는 절차를 정리했습니다. 명령은 모두 워크스페이스 루트에서 실행합니다.

## 1. 사전 확인
- `pnpm install`로 의존성을 최신 상태로 맞춥니다.
- `pnpm -w workspace:check`로 린트/테스트/빌드/스토리북 스모크를 한 번에 점검합니다.
- `pnpm --filter @ara/react pack --dry-run`으로 패키징 산출물이 누락되지 않았는지 확인합니다. 필요한 경우 `@ara/core`, `@ara/tokens`도 동일하게 실행합니다.

## 2. 프리릴리스 모드 진입
```bash
pnpm exec changeset status
pnpm exec changeset pre enter canary
```
- `status`로 포함될 변경 로그와 버전 범위를 확인합니다.
- `pre enter` 명령은 버전을 `-canary.x` 형태로 만들도록 Changesets에 지시합니다.

## 3. 버전 산출 및 패키지 점검
```bash
pnpm exec changeset version
pnpm --filter @ara/core pack --dry-run
pnpm --filter @ara/react pack --dry-run
pnpm --filter @ara/tokens pack --dry-run
```
- `changeset version`은 `package.json`과 `CHANGELOG.md`를 프리릴리스 버전으로 갱신합니다.
- 각 패키지를 `pack --dry-run`으로 감싸 tarball에 포함될 파일과 엔트리 포인트를 검증합니다.

## 4. 로컬 설치 검증
```bash
pnpm pack --filter @ara/react --pack-destination ./.canary
pnpm pack --filter @ara/core --pack-destination ./.canary
pnpm pack --filter @ara/tokens --pack-destination ./.canary
pnpm dlx create-vite@latest canary-consumer -- --template react-ts
cd canary-consumer
pnpm install ../.canary/ara-react-*.tgz
pnpm install ../.canary/ara-core-*.tgz ../.canary/ara-tokens-*.tgz
pnpm exec vite build
```
- 새 샌드박스를 만들어 실제 설치 및 빌드가 성공하는지 확인합니다.
- 검증이 끝나면 샌드박스와 `./.canary` 폴더를 제거합니다.

## 5. canary 태그로 배포
```bash
pnpm exec changeset publish --tag canary
pnpm exec changeset pre exit
```
- `publish --tag canary`로 npm에 canary 채널로 올립니다. CI 런너에서 `NPM_TOKEN`이 설정되어 있어야 합니다.
- 배포 후 `pre exit`으로 프리릴리스 모드를 빠져나오고, 버전 변경 커밋을 리셋/되돌려서 main 브랜치를 청결하게 유지합니다.

## 6. 릴리스 메모 기록
- canary 설치에 사용한 샌드박스에서 Button을 임포트/렌더한 예시와 결과를 메모로 남깁니다.
- 설치가 정상 동작했음을 WBS Task(T-000035) 코멘트나 PR 본문에 링크합니다.

> 💡 이 가이드는 실제 배포 전 드라이런을 위한 것이며, 정식 배포 시에는 Changesets 릴리스 브랜치 전략과 CI 플로우에 맞춰 조정해야 합니다.
