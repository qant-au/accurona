#!/usr/bin/env bash
# Builds the verification image from the npm registry (no cache, so it takes
# what is published now) and serves it on http://localhost:2224.
#
#   bash verify/restart.sh
#   PORT=2225 bash verify/restart.sh
set -euo pipefail

PORT="${PORT:-2224}"
NAME="${NAME:-linework-verify}"
cd "$(dirname "$0")"

docker rm -f "$NAME" >/dev/null 2>&1 || true
docker build --no-cache --pull -t "$NAME" .
docker run -d --name "$NAME" -p "$PORT:8080" "$NAME" >/dev/null

for _ in $(seq 1 60); do
  if curl --silent --fail --output /dev/null "http://localhost:$PORT/"; then
    echo "==> Accurona packages from npm: http://localhost:$PORT/"
    exit 0
  fi
  sleep 1
done
echo "ERROR: the container did not answer on $PORT" >&2
exit 1
