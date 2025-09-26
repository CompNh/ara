# TOKENS PRINCIPLES (Tier-0)

## 1. 목적

- Ara 컴포넌트 전반의 일관된 테마/스케일을 보장.
- 소비자(앱)가 CSS 변수/JSON 중 하나로 손쉽게 활용.

## 2. 명명 규칙 (CTI)

- Category / Type / Item(옵션) → `kebab-case`
- 예: `color.brand.primary`, `space.sm`, `radius.md`

## 3. 스케일

- 색상: 브랜드 2축(primary, accent), 표면(surface), 텍스트(text)
- 여백(space): `xs, sm, md, lg, xl` (배수 기준 명세는 Tier-1에서 고정)
- 반경(radius): `sm, md, lg`
- 시간(time): ms 단위 입력 → seconds 변환 출력

## 4. 소스/출력

- 소스: `packages/tokens/tokens/**/*.json` (Style Dictionary)
- 출력: `dist/tokens/variables.css`(`:root` CSS vars), `dist/tokens/tokens.json`(nested)
- 변환: `attribute/cti`, `name/cti/kebab`, `size/rem`, `time/seconds`, `color/hex`

## 5. 사용 가이드(초안)

- CSS: `var(--color-brand-primary)` 형태로 사용
- JS/TS: `tokens.json` import 또는 런타임 로드

## 6. 변경 관리

- 변경은 Changesets 필수. 파괴적 변경 시 major bump.
- 새로운 스케일/토큰 추가는 문서(여기)와 샘플에 동시 반영.

## 7. 금지 사항

- 패키지 내 런타임 로직 추가 금지(I/O, fetch 등).
- 토큰 값에 테마별 런타임 분기 금지(정적 산출 유지).
