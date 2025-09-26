# TEST STRATEGY (Tier-0)

## 1. 목표

- 변경 검증 속도와 신뢰성 확보.
- Gate-G1/G2에서 **typecheck · lint · test · build** 모두 그린.

## 2. 테스트 계층

- **Unit**: 함수/모듈 단위. 러닝타임 < 1s/파일 권장.
- **Integration(선택)**: 패키지 간 경계 확인. Tier-0에서는 최소화.
- **E2E(미적용)**: Tier-1 이후 도입.

## 3. 도구/러너

- **Vitest 1.x**: 단위 테스트 러너/어서션. `vitest run --reporter=default`
- **Turbo**: `test` 파이프라인으로 패키지 병렬 실행.

## 4. 조직/네이밍

- 테스트 위치: `src/__tests__/*.spec.ts`
- 케이스 네이밍: `should_<행동>_when_<조건>()`

## 5. 커버리지(초안)

- Tier-0: 수치 게이트 없음, 핵심 모듈 스모크 커버.
- Tier-1 계획: Lines/Branches **≥ 80%**(패키지별 설정 예정).

## 6. 실행 규칙

- 로컬: `pnpm -w run test`
- CI: `pnpm exec turbo run test --continue --no-daemon`

## 7. 실패 대응

- 재현 우선(단위 격리) → 최소 수정 → 재검증 → 회귀 테스트 추가.

## 8. 향후 과제

- 커버리지 리포트 도입(c8/istanbul)
- 통합 테스트 템플릿 추가
