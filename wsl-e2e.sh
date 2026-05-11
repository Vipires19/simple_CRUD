#!/usr/bin/env bash
set -eu
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT/backend"
if [ ! -x .venv/bin/python ]; then
  python3 -m venv .venv
fi
. .venv/bin/activate
pip install -q -r requirements.txt
export E2E_DJANGO_PYTHON="$ROOT/backend/.venv/bin/python"
cd "$ROOT/frontend"
npm install
npx playwright install chromium
npm run test:e2e
