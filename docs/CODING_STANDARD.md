# CODING STANDARD (Tier-0)

## 1. 디렉터리/파일

- 폴더: `kebab-case`, 파일: `kebab-case.ts`
- 배럴(`index.ts`)은 **공용 API만** 재노출. 내부 구현은 상대경로 import 금지.

## 2. TypeScript

- `strict: true` 유지. `any` 금지(불가피 시 주석으로 사유 명시).
- 각 패키지 `tsconfig.json`은 `tsconfig.base.json` 상속.

## 3. Imports

- 패키지 간 의존은 `package.json`에 명시 후 `import '@ara/<pkg>'`.
- 사용 안 하는 import 제거: `eslint-plugin-unused-imports`.

## 4. ESLint/Prettier

- ESLint Flat 우선, 경로별 override는 최소화.
- Prettier는 포맷 전용, 충돌 시 `eslint-config-prettier` 우선.

## 5. 커밋/PR

- 커밋: `type(scope): summary` (예: `feat(tokens): ...`)
- PR: CI 그린 + 변경 요약 + 영향 패키지 명시.

## 6. 번들/배포

- `sideEffects: false` 기본, 트리셰이킹 고려.
- tsup로 ESM/CJS/DTs 산출, 디자인 토큰은 Style Dictionary 산출물 사용.
