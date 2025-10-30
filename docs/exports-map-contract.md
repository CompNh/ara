# 빌드 산출물 Exports 계약 (T-000023)

`packages/*` 라이브러리가 배포하는 ESM 번들과 타입 선언의 엔트리 포인트를 고정해 소비자 애플리케이션이 일관된 방식으로 모듈을 로딩할 수 있도록 한다.

## 공통 규칙

- `package.json` 필드
  - `type = "module"`
  - `main`, `module`, `types` 는 모두 `dist/` 산출물을 가리킨다.
  - `sideEffects = false` 로 트리쉐이킹이 안전함을 명시한다.
  - `exports` 에는 기본 엔트리(`.`)와 문서화된 서브패스를 모두 선언한다.
  - `typesVersions` 는 `dist/*.d.ts` 파일과 서브패스를 연결해 오래된 TypeScript 모듈 해상 모드에서도 타입을 찾을 수 있도록 한다.
  - `./package.json` 은 항상 `exports` 에 노출해 도구가 메타데이터를 읽을 수 있게 한다.
- Rollup 빌드는 `preserveModules` + 선언 파일 생성을 사용하여 `dist/` 경로가 `src/` 구조와 1:1 로 매핑되도록 유지한다.

## 패키지별 엔트리 포인트

| 패키지 | 기본 엔트리 | 추가 엔트리 |
| --- | --- | --- |
| `@ara/tokens` | `.` | `./colors`, `./typography`, `./tokens.json`, `./package.json` |
| `@ara/core` | `.` | `./theme`, `./package.json` |
| `@ara/icons` | `.` | `./icons/arrow-right`, `./types`, `./package.json` |
| `@ara/react` | `.` | `./theme`, `./components`, `./components/button`, `./button`, `./package.json` |

각 엔트리는 `types + import(default)` 페어를 제공한다. CJS 번들을 제공하지 않으므로 `require` 조건은 노출하지 않는다.

## 타입 선언 해상 규칙

- 모든 패키지는 `typesVersions` 를 통해 `dist/*.d.ts` 산출물과 서브패스를 직접 연결한다.
- React 패키지처럼 `components/*/index.d.ts` 구조를 사용하는 경우, `typesVersions` 에 동일한 패턴(`"components/*": ["dist/components/*/index.d.ts"]`)을 등록한다.
- 추가 엔트리를 늘릴 때에는 `exports` 와 `typesVersions` 를 동시에 업데이트하고, 해당 경로가 `dist/` 에 생성되는지 `pnpm --filter <패키지> build` 후 확인한다.

## 검증 절차

1. `pnpm --filter @ara/* build` 로 모든 패키지의 산출물을 생성한다.
2. `pnpm --filter @ara/* pack --dry-run` 을 실행해 패키지 메타데이터(`exports`, `types`, `sideEffects`)가 기대값과 일치하는지 확인한다.
3. 샘플 소비자(예: `apps/showcase`)에서 `@ara/<패키지>` 와 서브패스 import 를 테스트한다.
