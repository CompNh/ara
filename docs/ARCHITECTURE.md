# ARCHITECTURE (Tier-0)

## 1. Monorepo 개요

- 패키지 매니저: pnpm (워크스페이스)
- 빌드/파이프라인: Turbo (typecheck, lint, test, build)
- 패키지: `@ara/tokens` (Tier-0 기준 패키지)

## 2. 패키지 경계(Ownership)

- `@ara/tokens`: 디자인 토큰 공급(ESM/CJS/DTs). 런타임 로직 금지, I/O 없음.
- 배포 산출물: `dist/`(코드), `dist/tokens/`(토큰 빌드 산출)

## 3. 빌드 & 릴리스 흐름

- Build: tsup(ESM/CJS/DTs), strict TS
- Tokens: Style Dictionary → `variables.css`, `tokens.json`
- Release: Changesets 기반 `patch/minor/major` bump, Release PR

## 4. 품질 게이트

- G1: 로컬 `typecheck · lint · test · build` 올그린
- G2: CI 동일 파이프라인 올그린 + 브랜치 보호
- G3: 태그/릴리스 노트, Freeze

## 5. 폴더 구조(요약)

ara(root)/
├─ .github/
│ └─ workflows/
│ └─ ci.yml
├─ .changeset/
│ ├─ config.json
│ ├─ README.md
│ └─ bright-hotels-guess.md
├─ docs/
│ └─ ARCHITECTURE.md
├─ packages/
│ └─ tokens/
│ ├─ package.json
│ ├─ tsconfig.json
│ ├─ tsup.config.ts
│ ├─ style-dictionary.config.cjs
│ ├─ src/
│ │ ├─ index.ts
│ │ └─ **tests**/
│ │ └─ smoke.spec.ts
│ ├─ tokens/
│ │ └─ base/
│ │ └─ colors.json
│ └─ dist/
│ ├─ index.js
│ ├─ index.js.map
│ ├─ index.cjs
│ ├─ index.cjs.map
│ ├─ index.d.ts
│ ├─ index.d.cts
│ └─ tokens/
│ ├─ variables.css
│ └─ tokens.json
├─ package.json
├─ turbo.json
├─ tsconfig.base.json
├─ eslint.config.mjs
└─ .prettierrc.json

## 6. 앞으로의 확장

- Step 10 문서 7종 추가: CODING_STANDARD, A11Y, PERFORMANCE_BUDGET, NAMING, TEST_STRATEGY, VERSIONING_RELEASE, TOKENS_PRINCIPLES
