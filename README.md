# Ara — UI Component Suite (Tier-0: Foundation)

> 상업화 가능한 **프리미엄 컴포넌트 스위트**.  
> 현재 단계: **Tier-0 Foundation**(Tokens/Theme/A11y/Headless 베이스).

## Why (목적)

- 디자인 토큰 + CSS 변수 + Tailwind 프리셋으로 **일관된 테마/밀도/라운드/모션** 제공
- 모든 컴포넌트에 **A11y 기본값**과 **Headless 훅** 제공

## Roadmap (요약)

- v0.1: Tokens/Theme + Button/Input/Select/Modal/Toast/Tooltip/Tabs/Accordion/Table
- v0.3: DatePicker/Combobox/Drawer/Pagination/Sidebar/Navbar
- v1.0 (Pro 시작): DataGrid 1차 + 라이선스/결제/지원 오픈

## Packages (초기 구조)

- @ara/tokens, @ara/theme, @ara/react-headless, @ara/react, @ara/icons, @ara/docs

## Status

- Repo 초기화 완료 (branch: `main`)
- Step 1-2 진행 중: 정책 파일 세트 구성

## License

- MIT (LICENSE 참조)

## Testing (Ara Team Rules)

1. 단위·인터랙션 테스트는 **해당 컴포넌트 폴더 옆**에 둔다: `components/X/X.test.tsx`.
2. **공용 테스트 유틸**은 `src/testing/`에만 둔다(렌더·userEvent 등).
3. **교차-컴포넌트 통합 시나리오**가 필요할 때만 `src/__tests__/`를 사용한다.
4. e2e·접근성 점검은 최상위 **`/e2e`(Playwright + Axe)** 에서만 운영한다.
5. 커버리지 목표는 **라인 80% 이상**이며, PR은 CI의 `test/typecheck/e2e`가 **그린**이어야 머지한다.
