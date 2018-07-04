#!/bin/bash

set -e
this_pwd="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

work_dir="${this_pwd}/../.sauce"
sc_ready_file="${work_dir}/sc.ready"
sc_pid_file="${work_dir}/sc.pid"

echo "[INFO] Disconnecting from Sauce Labs"
xargs kill -TERM < "$sc_pid_file"
while [ -f "$sc_ready_file" ] ;
do
  sleep 2
done
echo "[INFO] Done"
