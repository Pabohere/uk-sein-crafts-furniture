#!/bin/sh
set -eu
project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$project_root"
if [ -x "$project_root/.local-node/bin/node" ]; then
  PATH="$project_root/.local-node/bin:$PATH"
  export PATH
fi
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo 'Install Node.js 24 LTS, or restore the project-local .local-node runtime.' >&2
  exit 1
fi
exec npm run "${@:-dev}"
