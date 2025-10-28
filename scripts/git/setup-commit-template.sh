#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${repo_root}" ]]; then
  echo "Error: not inside a git repository" >&2
  exit 1
fi

template_path="${repo_root}/.commit-template"

if [[ ! -f "${template_path}" ]]; then
  echo "Error: commit template not found at ${template_path}" >&2
  exit 1
fi

relative_path="${template_path#${repo_root}/}"

git config commit.template "${relative_path}"

echo "Configured commit.template to ${relative_path}" 

