#!/bin/bash

if [ -z "${WX2_ADMIN_WEB_CLIENT_HOME}" ]; then
    >&2 echo "Error: WX2_ADMIN_WEB_CLIENT_HOME is not set, please export this environment variable first."
    exit 1
fi

# shellcheck disable=SC1090
source "${WX2_ADMIN_WEB_CLIENT_HOME}/bin/include/env-var-helpers"

function ex_usage {
    echo "usage: $(basename "$0") (nightly|pipeline)"
    echo ""
    echo "ex."
    echo "  $(basename "$0") pipeline"
    exit 1
}

# early out if looking for usage
if [[ "$1" == "--help" \
    || "$1" == "-h" \
    || "$1" == "-?" \
    || $# -lt 1 ]]; then
    ex_usage
    exit 1
fi

inj_build_env_vars_for "$1"
exit $?
