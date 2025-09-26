# NAMING (Tier-0)

## 1. 파일/폴더

- 폴더: `kebab-case`
- 파일: `kebab-case.ts` / 테스트: `*.spec.ts`

## 2. 심볼

- 타입/인터페이스: `PascalCase` (`TokenMap`)
- 함수/상수/변수: `camelCase` (`buildTokens`, `primaryColor`)
- enum: `PascalCase` + 멤버 `CamelCase`
- React 컴포넌트/Hook(향후): `PascalCase` / `useCamelCase`

## 3. 토큰/변수

- Style Dictionary CTI: `color.brand.primary`, `space.sm`
- CSS 변수: `--color-brand-primary`

## 4. 테스트

- 스위트: 기능단위 `describe('tokens: <feature>')`
- 케이스: `should_<행동>_when_<조건>`
