# PERFORMANCE BUDGET (Tier-0)

## 1. 목표

- 컴포넌트 단위 경량/지연로딩을 기본 원칙으로 함.

## 2. 번들/의존성

- 패키지 기본: `sideEffects: false`, 트리셰이킹 전제.
- 외부 의존 도입 시: 대체재/크기/트리셰이킹 가능성 검토 필수(PR 체크리스트).

## 3. 빌드 산출

- ESM/CJS/DTs 모두 생성(tsup). 소스맵 포함.
- CSS 변수 기반 테마(런타임 계산 최소화).

## 4. 측정(초안)

- 번들 사이즈 체크(rollup-plugin-visualizer 또는 size-limit는 Tier-1에서 도입).
- CI에서 빌드 성공 시 산출물 크기 로그 수집(지표 도입은 추후).

## 5. 코드 가이드

- 런타임 분기 최소화, dead code 제거.
- 동적 import 활용(향후 문서/코드에 예시 추가).
