# Contributing to Ara

Ara에 기여해 주셔서 감사합니다! 이 문서는 **브랜치 네이밍**, **커밋 메시지 규칙**, **PR 절차**를 안내합니다.

---

## 1) 준비 사항

- **Git 2.28+**, **Node.js 18+ (권장 20+)**, **pnpm 8+**
- OS 줄바꿈은 `.gitattributes`에 따라 **LF**로 통일됩니다.
- 리포 기본 브랜치: **`main`**

> ⚠️ `dist/`는 커밋하지 않습니다. 빌드는 CI/NPM 배포에서 처리합니다.

---

## 2) 브랜치 전략

- 기능: `feat/<scope>-<short-desc>`
- 수정: `fix/<scope>-<short-desc>`
- 문서/환경: `docs/...`, `chore/...`, `build/...`, `ci/...`

**scope 예시**

- `tokens`, `theme`, `react-headless`, `react`, `icons`, `docs`, `repo`

예) `feat/tokens-color-scale`, `fix/theme-ssr-flash`

---

## 3) 커밋 컨벤션 (Conventional Commits)

**형식**
`<type>(<scope>)<optional-!>: <subject>`

- **type**: `feat` | `fix` | `docs` | `style` | `refactor` | `perf` | `test` | `build` | `ci` | `chore` | `revert`
- **scope**: 변경 영역(예: `tokens`, `theme`, `react-headless`, `react`, `icons`, `docs`, `repo`, `tooling`, `release`)
- **subject**: 한 줄 요약(현재형·명령형, 마침표 X, 72자 이내)

**옵션**

- `!` : **호환성 깨짐(Breaking Change)** 표시 → 예: `feat(api)!: drop deprecated props`
- **본문(선택)**: 변경 이유/맥락, 설계 포인트
- **푸터(선택)**: `BREAKING CHANGE: ...` 또는 이슈/티켓 참조(`Closes #123`)

**예시**

- `feat(tokens): add semantic color tokens`
- `fix(theme): prevent SSR hydration mismatch`
- `docs(repo): clarify contributing guide`
- `ci(repo): add PR checks (build/lint/test)`
- `chore(release): prepare v0.1.0` ← Changesets 사용 시
- `revert(tokens): revert "add semantic color tokens"` ← 되돌리기

> PR 단위가 클 경우, 커밋은 **한 논리 변화**마다 작게 쪼개 주세요.

---

## 4) PR 규칙 & 체크리스트

- **PR 제목**: Conventional Commits 형식 권장
- **설명**: 변경 요약, 동기, 스크린샷/스크린리더 라벨(해당 시), 테스트 포인트
- **체크리스트**
  - [ ] 빌드/타입 검사 통과 (추가 예정 스크립트)
  - [ ] Lint/Format 통과 (Prettier/ESLint; Husky 훅 자동 실행)
  - [ ] 단위 테스트(해당 시) 통과
  - [ ] 접근성(A11y) 기본 규칙 준수 (role/aria-\*/키보드 트래핑)
  - [ ] 문서/스토리북(해당 시) 업데이트

> 리뷰어는 `CODEOWNERS` 기준으로 자동 지정됩니다.

---

## 5) 변경 로그 & 버전

- 릴리스는 **Changesets** 기반으로 관리 예정입니다.
- 기능/수정 PR에는 변경 로그에 들어갈 한 줄 요약을 포함해 주세요.

---

## 6) 스타일/설계 가이드(요약)

- **디자인 토큰 → CSS 변수(`--ara-*`)**를 1차 소스 오브 트루스로 사용
- **Headless**(로직)와 **Styled**(UI) 분리
- **SSR 주의**: 테마 마운트 유틸 사용 시 초기 깜빡임(FART) 예방 가이드 준수
- **접근성 기본값 강제**: 스크린리더 라벨/키보드 포커스 이동/ARIA 패턴

---

## 7) 문의

- 이슈는 GitHub Issues에 등록해 주세요. 보안 이슈는 공개 이슈 대신 보안 연락처(SECURITY.md)로 송부 바랍니다.
