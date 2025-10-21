#!/usr/bin/env bash
set -euo pipefail

sanitize(){ iconv -c -f UTF-8 -t ASCII//TRANSLIT 2>/dev/null || cat; }

echo "[SYNC PACKET]"
echo "Datetime: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Flags:"
echo "Changes (WBS/Tasks):"
echo "  - "
echo "Today's Top 3:"
echo "  1) "
echo "  2) "
echo "  3) "
echo "Activity (Git):"
echo "  - Recent commits:"
git log --since="yesterday" --oneline | sanitize | sed 's/^/    /' | head -n 20 || true
echo "  - Diff summary:"
git diff --stat origin/main...HEAD | sanitize | sed 's/^/    /' || true
echo "Artifacts/Links:"
echo "  - "
echo "Blockers/Questions:"
echo "  - "
echo "Next Actions:"
echo "  - [ ] "
echo "  - [ ] "
echo "  - [ ] "
