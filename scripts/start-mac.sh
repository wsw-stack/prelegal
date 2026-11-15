#!/usr/bin/env bash
# Build the Prelegal image and run it at http://localhost:8000.
set -euo pipefail
cd "$(dirname "$0")/.."

IMAGE=prelegal
CONTAINER=prelegal

docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
docker build -t "$IMAGE" .

ENV_ARGS=()
[ -f .env ] && ENV_ARGS=(--env-file .env)
# The ${..+..} form keeps an empty array safe under `set -u` in older bash.
docker run -d --name "$CONTAINER" -p 8000:8000 ${ENV_ARGS[@]+"${ENV_ARGS[@]}"} "$IMAGE" >/dev/null

echo "Prelegal is running at http://localhost:8000"
