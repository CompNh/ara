# 패키지 거버넌스 가이드 (T-000014)

모든 `packages/*` 및 `apps/*` 매니페스트가 동일한 규칙을 따르도록 아래 정책을 유지한다. 규칙이 변경되면 본 문서를 먼저 업데이트한 뒤 자동 점검 스크립트를 수정한다.

## 1. 네이밍 및 공개 범위

| 구분 | name | private | publishConfig.access |
| --- | --- | --- | --- |
| 라이브러리(`packages/*`) | `@ara/<패키지>` | `false` (생략) | `public` |
| 애플리케이션(`apps/*`) | 자유 형식 (예: `ara-storybook`) | `true` | 설정 금지 |

- `packages/*` 경로의 패키지는 모두 `@ara/` 스코프를 사용한다.
- `publishConfig.access` 를 `public` 으로 고정해 Changesets → npm 배포 플로우에서 접근 수준이 바뀌지 않도록 한다.
- `apps/*` 경로는 브라우저 번들을 배포하지 않으므로 항상 `private: true` 로 유지하며, 실수로 공개 배포되지 않도록 `publishConfig` 를 사용하지 않는다.

## 2. 공통 메타데이터

| 필드 | 값/규칙 | 비고 |
| --- | --- | --- |
| `engines.node` | `">=22.0.0"` | Node 22 LTS 이상 고정 |
| `license` | 현재는 `UNLICENSED` | 상업화 단계에서 실제 라이선스를 지정한다. |
| `repository` | 깃 리포지터리 URL (예: `https://example.com/ara-monorepo.git`) | 실제 원격 주소로 교체 가능 |

> **주의:** 라이선스/저장소 값은 실제 배포 전략이 확정되면 재검토한다. 값이 달라지면 `scripts/package-governance/check-manifests.mjs` 의 검증 규칙도 함께 업데이트해야 한다.

## 3. 자동 검증 스크립트

`scripts/package-governance/check-manifests.mjs` 는 `packages/*` 와 `apps/*` 하위의 `package.json` 을 순회하며 다음 항목을 검사한다.

- `@ara/` 스코프 및 `publishConfig.access` = `public` (packages)
- `private: true` 및 `publishConfig` 미사용 (apps)
- `license`, `repository`, `engines.node (>=22)` 필드 존재 여부

### 실행 방법

```bash
pnpm run check:manifests
# 또는
node scripts/package-governance/check-manifests.mjs
```

샘플 출력:

```
✅ packages/tsconfig - 정책을 준수합니다.
```

여러 패키지가 존재하면 각 경로가 한 줄씩 보고된다. 새로운 패키지를 추가한 뒤에는 바로 실행해 규칙을 어기지 않았는지 확인한다.

## 4. README 반영 체크리스트

- README “모노레포 워크스페이스 경계” 섹션 아래에 본 문서를 링크한다.
- 새 패키지를 만들 때 아래 항목을 확인한다.
  1. `name` 스코프와 `private/publishConfig` 설정
  2. `engines`, `license`, `repository` 필드
  3. Changesets 릴리스 전에 `pnpm run check:manifests` 실행
