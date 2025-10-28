#!/usr/bin/env bash
set -euo pipefail

# Configure git commit template for this repository.

repo_root="$(git rev-parse --show-toplevel)"
src_template="$repo_root/.github/COMMIT_TEMPLATE"

if [[ ! -f "$src_template" ]]; then
  echo "[setup-commit-template] source template not found: $src_template" >&2
  exit 1
fi

git config --local commit.template "$src_template"

echo "Configured git commit template: $src_template"
