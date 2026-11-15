#!/usr/bin/env bash
# Stop and remove the Prelegal container. Its database goes with it.
set -euo pipefail
CONTAINER=prelegal

if [ -n "$(docker ps -aq --filter "name=^${CONTAINER}$")" ]; then
  docker rm -f "$CONTAINER" >/dev/null
  echo "Prelegal stopped"
else
  echo "Prelegal was not running"
fi
