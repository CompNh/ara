#!/usr/bin/env bash
set -euo pipefail
echo "[SYNC PACKET]"
echo "날짜/시간: $(date '+%Y-%m-%d %H:%M:%S')"
echo "플래그: "
echo "WBS/Task 변화:"
echo "  - "
echo "오늘 목표(Top 3):"
echo "  1) "
echo "  2) "
echo "  3) "
echo "진행 로그(깃):"
echo "  - 최근 커밋(요약):"
git log --since="yesterday" --oneline | sed 's/^/    /' | head -n 20 || true
echo "  - 변경 요약:"
git diff --stat origin/main...HEAD | sed 's/^/    /' || true
echo "산출물/링크:"
echo "  - "
echo "막힌 점/질문:"
echo "  - "
echo "다음 액션:"
echo "  - [ ] "
echo "  - [ ] "
echo "  - [ ] "
