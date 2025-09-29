# Tier-1 SUMMARY Design System Base

## 1) 범위 (Scope)

- Packages:
  - @ara/tokens : 디자인 토큰(primitive/base, semantic, system) 3종 출력(CSS/TS/JSON)
  - @ara/theme : CSS 변수(--ara-\*) 기반 테마(라이트/다크/밀도/라운드) 마운트 유틸
  - @ara/icons : 원천 SVG 정규화 per-icon 컴포넌트(트리셰이킹)
  - @ara/docs : 문서앱(테마 토글, 아이콘 갤러리, 토큰 미러링 데모)
- 기술 원칙:
  - 한 스텝=한 행위, 게이트 통과 후 다음, SSR은 테마 마운트 시점만 DOM mutate
  - ESM + exports, sideEffects:false, CSS vars 접두사 --ara-

## 2) 게이트 (Gates)

- **G1(Local)**: 토큰 빌드 3종 산출 확인 / Docs 테마 토글(FOUC 없음) / 아이콘 단일 임포트 트리셰이킹
- **G2(CI/Repo)**: lint/test/build/e2e 올그린 + 브랜치 보호 PR 통과
- **G3(Freeze/Release)**: 태그/릴리스, Quickstart/CHANGELOG 확정

## 3) 산출물 (Deliverables)

- @ara/tokens : dist/_.css, dist/_.ts, dist/\*.json + 사용 가이드
- @ara/theme : mountLightTheme/mountDarkTheme 등 프로필 유틸 + SSR 주의 문서
- @ara/icons : 개별 컴포넌트({name}.tsx) + 갤러리 페이지
- @ara/docs : 테마 토글/토큰 뷰/아이콘 검색필터 데모

## 4) WBS 진행 포인터 (현재 위치)

| WBS ID | 항목                       | 상태 | 비고                |
| -----: | -------------------------- | ---- | ------------------- |
|  T1-00 | 범위/게이트 확정           | 완료 | 본 문서             |
|  T1-01 | 토큰 워크스페이스 스켈레톤 | 완료 | `packages/tokens`   |
|  T1-02 | Style Dictionary 베이스    | 완료 | SD 설치/기본 config |
|  T1-03 | 토큰 스키마 분리           | 대기 | base/semantic       |
|  T1-04 | 토큰 3종 출력              | 대기 | CSS/TS/JSON 빌드    |
|  T1-05 | 테마 스켈레톤              | 대기 | `@ara/theme`        |
|  T1-06 | 테마 프로필                | 대기 | light/dark/density  |
|  T1-07 | Docs 테마 토글 연동        | 대기 | FOUC 미발생         |
|  T1-08 | 아이콘 인바운드 파이프라인 | 대기 | SVG 정규화          |
|  T1-09 | per-icon 컴포넌트 빌드     | 대기 | 트리셰이킹 확인     |
|  T1-10 | 아이콘 갤러리              | 대기 | 검색/필터           |

## 5) 검증/증거

- 리포지토리에 docs/tier-1/TIER1_SUMMARY.md가 존재하고 위 4개 섹션이 포함되면 T1-00 문서화 **통과**.
