# Ara Project – Roadmap

## Vision
상업화 가능한 React/TypeScript UI 컴포넌트 제품군. 접근성(A11y), 테마, 문서화/배포 자동화에 초점.

## Non-Goals (초기)
- 디자인 툴 연동, 사내 전용 테마 제작(후순위)
- 서버/백엔드 기능(비범위)

## Milestones
- **M0 Foundations**
  Dev setup(pnpm/TS/ESLint/Prettier), Storybook 스켈레톤, CI 스켈레톤, 테스트 러너
- **M1 Core Components (5종)**
  Button, Modal, Input, Select, Tabs (+A11y, Docs)
- **M2 Docs & Site**
  Storybook 품질(Controls/DocsPage), 배포 파이프라인, 예제 페이지
- **M3 Release**
  Changesets 버저닝, npm publish, 릴리즈 노트

## Deliverables
- 패키지: `@ara-ui/button` 등(모노레포 고려)
- 문서: Storybook + 가이드(Usage/Props/A11y)
- 자동화: CI(빌드/테스트), 릴리즈(npm)

## Quality Gates
- 유닛 테스트 통과, 타이핑 엄격(Strict TS)
- 접근성 체크(키보드/포커스/ARIA)
- 번들 사이즈 가드(각 컴포넌트)

## Risks & Mitigations
- 범위 확장 → M1 최소 범위 고정, 나머지 이슈화
- 디자인 변동 → 토큰/테마 레이어 분리

