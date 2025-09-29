# TIER-0 SUMMARY

## 1) 산출물 & 패키지

- Monorepo: `pnpm` + `turbo`
- 패키지: `@ara/tokens` (ESM/CJS/DTs)
- Tokens: Style Dictionary → `dist/tokens/variables.css`, `dist/tokens/tokens.json`

## 2) 게이트 상태

- G1 (로컬 올그린): ✅ `pnpm exec turbo run typecheck lint test build`
- G2 (CI 올그린): ✅ typecheck · lint · build · test
- G3 (Freeze): ⬜ 태그 `tier-0/v0.0.1` + 릴리스 노트

## 3) 문서 8종(완료 체크)

- ✅ ARCHITECTURE.md
- ✅ CODING_STANDARD.md
- ✅ TEST_STRATEGY.md
- ✅ TOKENS_PRINCIPLES.md
- ✅ A11Y.md
- ✅ NAMING.md
- ✅ PERFORMANCE_BUDGET.md
- ✅ VERSIONING_RELEASE.md (검토/승인 체크)
- ✅ 본 문서: TIER0_SUMMARY.md (이 파일)

## 4) 변경/릴리스 흐름(Changesets)

- `pnpm -w changeset` → 엔트리 생성
- `pnpm -w changeset status` → 프리뷰
- (Tier-1에서) `changeset version` + Release PR

## 5) 다음 페이즈(안)

- Step 11(G2 강화): 브랜치 보호 규칙 적용·검증
- Step 12(G3 & Freeze): 태그 `tier-0/v0.0.1` + 릴리스 노트 발행

## 6) 참고 명령어

```powershell
# 로컬 게이트 재검증
pnpm exec turbo run typecheck lint test build

# CI 수동 트리거는 push 로 발생
git push
```

> G2 PR ������ ���� (no-op)
