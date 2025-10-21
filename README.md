# Ara Project — UI Components (React/TypeScript)
> 상업화 가능한 UI 컴포넌트 제품군을 목표로 하는 Ara-Project.
> 코드(이슈/PR)와 계획(WBS/Tasks)을 연결해 **한눈에 파악 가능한 운영 체계**를 지향합니다.

## Goals & Scope
- **M0 (Foundations)**: Dev setup, lint/format/test, CI 스켈레톤
- **M1 (Core Components)**: Button/Modal/Input 등 핵심 5종
- **M2 (Docs & Site)**: Storybook 카탈로그, 문서 정비
- **M3 (Release)**: 버저닝·배포 파이프라인(npm) 정식 릴리즈

## Operating Rules
- **Commit**: `type(scope): summary [T-xxxx]`
  예) `feat(button): ripple effect [T-0003]`
- **Pull Request**: 템플릿 준수(What/Why/How, 링크드 WBS/Tasks)
- **Issues**: 기능요청/버그에 WBS_ID/Task_ID를 가능하면 명시
- **브랜치**: `feat/*`, `fix/*`, `chore/*` (기본: `main`)

## Source of Truth (고정 링크)
- **STATE**: 프로젝트 현황(자동 생성) → _추가 예정_: `STATE.md`
- **ROADMAP**: 장기 계획 → _추가 예정_: `templates/ROADMAP.md` 또는 `ROADMAP.md`
- **WBS/Tasks Snapshot**: `WBS.csv`, `Tasks.csv` (수동 반영)

## Next Steps
1. Ara Assistant Sync Pack 추가 및 워크플로 배치
2. ROADMAP.md 생성
3. WBS.csv·Tasks.csv 커밋 → STATE.md 자동 생성 확인
4. PR/이슈 템플릿 적용 및 운영 시작

