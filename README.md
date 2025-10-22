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

### PR Workflow Quick Guide
1. **브랜치 푸시 후 PR 생성**: 원격 브랜치를 올리면 GitHub 좌측 상단의 **Pull requests → New pull request** 또는 저장소 상단의 “Compare & pull request” 배너를 통해 PR 화면으로 이동합니다. 버튼을 눌러 템플릿에 맞춰 제목과 본문(What/Why/How, 관련 WBS/Tasks)을 채웁니다.
2. **검토 및 머지**: 리뷰·체크를 마치고 머지하면 PR 페이지 상단에 “Pull request successfully merged and closed” 메시지가 표시됩니다.
3. **머지 후 브랜치 정리**: 더 이상 사용하지 않는 기능 브랜치는 PR 페이지 하단의 **Delete branch** 버튼을 눌러 정리합니다. 필요하면 `git push origin --delete <branch>`로 원격 브랜치를 직접 지울 수도 있습니다. 로컬에서는 `git fetch --prune` 또는 `git branch -d <branch>`로 정리하면 히스토리가 깔끔합니다.
4. **최신 main 동기화**: 머지 이후 작업자는 `git checkout main && git pull --rebase`로 최신 상태를 가져온 뒤, 새 작업 브랜치를 만들어 다음 Task를 진행합니다.

### Repo Metadata Guards
- `.editorconfig`와 `.gitignore`를 저장소 루트에 추가해 기본 편집기/아티팩트 정책을 고정했습니다.
- 기존 `.gitattributes`는 UTF-16 인코딩 탓에 GitHub PR UI가 '바이너리 파일'로 간주해 PR 생성을 막는 이슈가 있어, 원본은 그대로 두고 `templates/gitattributes.utf8`에 신규 규칙을 정리했습니다. 추후 PR 파이프라인이 바이너리 처리를 허용하면 해당 템플릿을 실제 `.gitattributes`로 교체합니다.


## Source of Truth (고정 링크)
- **STATE**: 프로젝트 현황(자동 생성) → _추가 예정_: `STATE.md`
- **ROADMAP**: 장기 계획 → _추가 예정_: `templates/ROADMAP.md` 또는 `ROADMAP.md`
- **WBS/Tasks Snapshot**: `WBS.csv`, `Tasks.csv` (수동 반영)

## Project State
▶ [STATE.md (auto-updated)](./STATE.md)
▶ [Roadmap](./ROADMAP.md)

## Next Steps
1. Ara Assistant Sync Pack 추가 및 워크플로 배치
2. ROADMAP.md 생성
3. WBS.csv·Tasks.csv 커밋 → STATE.md 자동 생성 확인
4. PR/이슈 템플릿 적용 및 운영 시작

