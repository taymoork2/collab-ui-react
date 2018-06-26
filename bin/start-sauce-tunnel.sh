#!/bin/bash

set -e

this_pwd="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "${this_pwd}/include/env-var-helpers"

if ! is_ci; then
    echo "Warning: using limited-privilege Sauce creds."
    inj_build_env_vars_for "dev" >/dev/null
fi

# notes:
# - sauce connect proxy expects env var names 'SAUCE_USERNAME' and 'SAUCE_ACCESS_KEY'
# - so assign them using env vars injected from jenkins
# shellcheck disable=SC2153
export SAUCE_USERNAME="${SAUCE__USERNAME}"
# shellcheck disable=SC2153
export SAUCE_ACCESS_KEY="${SAUCE__ACCESS_KEY}"

PLATFORM=$(uname)
SC_VERSION="${SAUCE__SC_VERSION}"
WORK_DIR="${this_pwd}/../.sauce"

SC_DIR="${WORK_DIR}/sc"
READY_FILE="${WORK_DIR}/sc.ready"
PID_FILE="${WORK_DIR}/sc.pid"

if [[ $PLATFORM == 'Darwin' ]]; then
  SC_PACKAGE="sc-${SC_VERSION}-osx.zip"
else
  SC_PACKAGE="sc-${SC_VERSION}-linux.tar.gz"
fi

SC_URL="https://saucelabs.com/downloads/${SC_PACKAGE}"
SC_PACKAGE_PATH="${WORK_DIR}/${SC_PACKAGE}"

# 'SAUCE__RM_WORK_DIR' => jenkins job config env var
# - see: https://sqbu-jenkins.cisco.com:8443/job/team/job/atlas/job/atlas-web/configure
if [ "$SAUCE__RM_WORK_DIR" = "true" ]; then
  rm -rf "$WORK_DIR"
fi

mkdir -p "$WORK_DIR"

if [ ! -d "$SC_DIR" ]; then
  echo "Downloading Sauce Connect binary (v${SC_VERSION})"
  curl -o "$SC_PACKAGE_PATH" "$SC_URL"
  if [[ $PLATFORM == 'Darwin' ]]; then
    unzip "$SC_PACKAGE_PATH" -d "$WORK_DIR"
    mv "${WORK_DIR}/sc-${SC_VERSION}-osx" "$SC_DIR"
  else
    tar -xf "$SC_PACKAGE_PATH" -C "$WORK_DIR"
    mv "${WORK_DIR}/sc-${SC_VERSION}-linux" "$SC_DIR"
  fi
fi

cd "$SC_DIR"
rm -f sauce_connect.log
touch sauce_connect.log

i=0
while [ "$i" -lt 3 ]; do
  echo "Sauce Connect startup attempt ${i}"
  i=$((i+1))
  bin/sc \
    --direct-domains "*.wbx2.com,*.webex.com,*.sc-tx2.huron-dev.com,*.huron-int.com" \
    --no-ssl-bump-domains "*.atlasad.koalabait.com" \
    -vv \
    --logfile "sauce_connect.log" \
    --pidfile "$PID_FILE" \
    --readyfile "$READY_FILE" \
    --tunnel-identifier "$SAUCE__TUNNEL_ID" \
    > /dev/null 2>&1 \
    &

  echo 'Connecting to Sauce Labs - waiting a maximum 120s for ready file . . .'
  x=0
  while [ "$x" -lt 120 -a ! -e "$READY_FILE" ]; do
    x=$((x+1))
    sleep 1
  done

  if [ -e "$READY_FILE" ]; then
    echo 'Done'
    exit 0
  fi

  echo 'No ready file, killing sc process and trying again . . .'
  if [ -e "$PID_FILE" ]; then
    xargs kill -9 < "$PID_FILE"
  fi
done

echo 'Failed to connect to Sauce Labs after 3 tries!'
exit 1
