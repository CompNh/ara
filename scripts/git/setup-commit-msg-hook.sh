#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
hooks_dir="$repo_root/.githooks"
hook_file="$hooks_dir/commit-msg"

if [[ ! -f "$hook_file" ]]; then
  echo "[setup-commit-msg-hook] commit-msg hook not found: $hook_file" >&2
  exit 1
fi

git config --local core.hooksPath "$hooks_dir"

echo "Configured git core.hooksPath -> $hooks_dir"
