# VERSIONING & RELEASE (Tier-0)

## 1. 버전 정책

- SemVer 준수: major/minor/patch.
- 파괴적 변경은 **major**로만, 문서/마이그레이션 노트 필수.

## 2. Changesets 플로우

- 변경 시 `pnpm -w changeset`으로 엔트리 생성(패키지/범위/요약).
- 릴리스 전 `changeset status`로 프리뷰, `changeset version`으로 버전/CHANGELOG 반영.
- Release PR 병합 후 배포(퍼블리시는 Tier-1에서 CI 연계).

## 3. 태그/동결

- G3 시점: 태그 `tier-0/v0.0.1` 생성, 릴리스 노트 기록, 동결.
- `exports`/`sideEffects:false` 재확인.

## 4. 브랜치/보호

- 기본 브랜치: `main`. 보호 규칙: CI 그린 + 리뷰 1명 이상.

## 5. 핫픽스

- patch 전용 changeset → 빠른 배포, 이후 문서 반영.
