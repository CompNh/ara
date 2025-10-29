# `main` 브랜치 보호 규칙 설정 가이드

> GitHub 저장소의 **Settings → Branches → Branch protection rules** 화면에서 아래와 같이 설정한다.

## 1. 규칙 범위 지정
- **Branch name pattern:** `main`

## 2. 기본 보호 옵션
- ✅ **Require a pull request before merging**
  - PR 당 최소 승인자 수는 현재 단독 개발이므로 1명으로 설정하지 않는다. (필요 시 향후 조정)
- ✅ **Require status checks to pass before merging**
  - **Status checks that are required:** `CI`
  - **Require branches to be up to date before merging:** 필요 시 활성화 (권장)
- ✅ **Require conversation resolution before merging** (선택 사항이나 권장)

## 3. 기타 권장 옵션
- ⚠️ **Lock branch** 는 main에서 직접 커밋이 필요할 수 있으므로 비활성 유지.
- ✅ **Do not allow bypassing the above settings**
- 필요하다면 **Restrict who can push to matching branches** 옵션으로 관리자만 강제할 수 있다.

## 4. 확인 방법
1. PR을 생성하면 GitHub가 자동으로 `CI` 워크플로를 실행한다.
2. `CI` 체크가 통과하지 않거나 PR 승인(선택)을 충족하지 않으면 Merge 버튼이 비활성화된다.
3. 모든 요구 사항이 충족되면 Merge가 가능해진다.

---

> 📝 **Tip:** GitHub CLI를 사용 중이라면 아래 명령으로 동일한 규칙을 적용할 수 있다. `${OWNER}` 와 `${REPO}` 는 저장소 정보를 입력한다.
>
> ```bash
> gh api \
>   -X PUT \
>   -H "Accept: application/vnd.github+json" \
>   repos/${OWNER}/${REPO}/branches/main/protection \
>   -f required_status_checks.strict=true \
>   -f required_status_checks.contexts[]='CI' \
>   -f enforce_admins=true \
>   -f required_pull_request_reviews.dismiss_stale_reviews=false \
>   -f restrictions='null'
> ```
>
> `gh auth login` 으로 인증이 되어 있어야 하며, 필요한 옵션은 상황에 맞게 조정한다.
