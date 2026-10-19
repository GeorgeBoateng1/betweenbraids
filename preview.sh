#!/usr/bin/env bash
# Between Braids local preview.
#
#   ./preview.sh
#
# Serves two things and leaves them running until you press Ctrl+C:
#   http://127.0.0.1:3303/                     the site itself (dist/)
#   http://127.0.0.1:3305/device-preview.html  the same site in device frames
#
# The device page iframes the site over the same scheme and host, which is
# why both have to be served rather than opened as files.

set -euo pipefail
cd "$(dirname "$0")"

SITE_PORT=3303
PREVIEW_PORT=3305

for port in "$SITE_PORT" "$PREVIEW_PORT"; do
  if lsof -ti tcp:"$port" >/dev/null 2>&1; then
    echo "Port $port is in use, freeing it."
    lsof -ti tcp:"$port" | xargs kill 2>/dev/null || true
    sleep 1
  fi
done

python3 -m http.server "$SITE_PORT" --bind 127.0.0.1 --directory dist >/dev/null 2>&1 &
SITE_PID=$!
python3 -m http.server "$PREVIEW_PORT" --bind 127.0.0.1 --directory . >/dev/null 2>&1 &
PREVIEW_PID=$!

cleanup(){ kill "$SITE_PID" "$PREVIEW_PID" 2>/dev/null || true; }
trap cleanup EXIT INT TERM

sleep 1
echo
echo "  Site            http://127.0.0.1:$SITE_PORT/"
echo "  Device preview  http://127.0.0.1:$PREVIEW_PORT/device-preview.html"
echo
echo "  Ctrl+C to stop."

command -v open >/dev/null && open "http://127.0.0.1:$PREVIEW_PORT/device-preview.html"

wait
