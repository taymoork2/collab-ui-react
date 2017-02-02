#!/bin/bash

set -e

if [ -z "${WX2_ADMIN_WEB_CLIENT_HOME}" ]; then
    >&2 echo "Error: WX2_ADMIN_WEB_CLIENT_HOME is not set, please export this environment variable first."
    exit 1
fi

WORK_DIR="${WX2_ADMIN_WEB_CLIENT_HOME}/.sauce"

READY_FILE="${WORK_DIR}/sc.ready"
PID_FILE="${WORK_DIR}/sc.pid"

echo "Disconnecting from Sauce Labs"
xargs kill -TERM < "$PID_FILE"
while [ -f "$READY_FILE" ] ;
do
  sleep 2
done
echo 'Done'
