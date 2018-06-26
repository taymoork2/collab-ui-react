#!/bin/bash

set -e

this_pwd="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck disable=SC1090
source "${this_pwd}/include/env-var-helpers"

if ! is_ci; then
    echo "[WARN] Using limited-privilege Sauce creds."
    inj_build_env_vars_for "dev" >/dev/null
fi

# notes:
# - sauce connect proxy expects env var names 'SAUCE_USERNAME' and 'SAUCE_ACCESS_KEY'
# - so assign them using env vars injected from jenkins
# shellcheck disable=SC2153
export SAUCE_USERNAME="${SAUCE__USERNAME}"
# shellcheck disable=SC2153
export SAUCE_ACCESS_KEY="${SAUCE__ACCESS_KEY}"

platform=$(uname)
sc_version="${SAUCE__SC_VERSION}"
work_dir="${this_pwd}/../.sauce"

sc_dir="${work_dir}/sc"
sc_ready_file="${work_dir}/sc.ready"
sc_pid_file="${work_dir}/sc.pid"

if [[ $platform == 'Darwin' ]]; then
    sc_package="sc-${sc_version}-osx.zip"
else
    sc_package="sc-${sc_version}-linux.tar.gz"
fi

sc_url="https://saucelabs.com/downloads/${sc_package}"
sc_package_path="${work_dir}/${sc_package}"

# 'SAUCE__RM_WORK_DIR' => jenkins job config env var
# - see: https://sqbu-jenkins.cisco.com:8443/job/team/job/atlas/job/atlas-web/configure
if [ "$SAUCE__RM_WORK_DIR" = "true" ]; then
    rm -rf "$work_dir"
fi

mkdir -p "$work_dir"

if [ ! -d "$sc_dir" ]; then
    echo "[INFO] Downloading Sauce Connect binary (v${sc_version})"
    curl -o "$sc_package_path" "$sc_url"
    if [[ $platform == 'Darwin' ]]; then
        unzip "$sc_package_path" -d "$work_dir"
        mv "${work_dir}/sc-${sc_version}-osx" "$sc_dir"
    else
        tar -xf "$sc_package_path" -C "$work_dir"
        mv "${work_dir}/sc-${sc_version}-linux" "$sc_dir"
    fi
fi

cd "$sc_dir"
rm -f sauce_connect.log
touch sauce_connect.log

i=0
while [ "$i" -lt 3 ]; do
    echo "[INFO] Sauce Connect startup attempt ${i}"
    i=$((i+1))
    bin/sc \
        --direct-domains "*.wbx2.com,*.webex.com,*.sc-tx2.huron-dev.com,*.huron-int.com" \
        --no-ssl-bump-domains "*.atlasad.koalabait.com" \
        -vv \
        --logfile "sauce_connect.log" \
        --pidfile "$sc_pid_file" \
        --readyfile "$sc_ready_file" \
        --tunnel-identifier "$SAUCE__TUNNEL_ID" \
        > /dev/null 2>&1 \
        &

    echo '[INFO] Connecting to Sauce Labs - waiting a maximum 120s for ready file...'
    x=0
    while [ "$x" -lt 120 ] && [ ! -e "$sc_ready_file" ]; do
        x=$((x+1))
        sleep 1
    done

    if [ -e "$sc_ready_file" ]; then
        echo '[INFO] Done'
        exit 0
    fi

    echo '[WARN] No ready file, killing sc process and trying again...'
    if [ -e "$sc_pid_file" ]; then
        xargs kill -9 < "$sc_pid_file"
    fi
done

echo '[ERROR] Failed to connect to Sauce Labs after 3 tries!'
exit 1
