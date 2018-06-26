#!/bin/bash

set -e
this_pwd="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

WORK_DIR="${this_pwd}/../.sauce"
READY_FILE="${WORK_DIR}/sc.ready"
PID_FILE="${WORK_DIR}/sc.pid"

echo "[INFO] Disconnecting from Sauce Labs"
xargs kill -TERM < "$PID_FILE"
while [ -f "$READY_FILE" ] ;
do
  sleep 2
done
echo 'Done'
