#!/bin/bash

if [ -z "${WX2_ADMIN_WEB_CLIENT_HOME}" ]; then
    >&2 echo "Error: WX2_ADMIN_WEB_CLIENT_HOME is not set, please export this environment variable first."
    exit 1
fi

source "${WX2_ADMIN_WEB_CLIENT_HOME}/bin/include/sauce-results-helpers"
source "${WX2_ADMIN_WEB_CLIENT_HOME}/bin/include/env-var-helpers"

function ex_usage {
    echo "usage: $(basename "$0") <unauthenticated_sauce_link>"
    echo ""
    echo "ex."
    echo "  $(basename "$0") http://saucelabs.com/jobs/deadbeef3502489cbb640d8d5fffc3ab"
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

if ! is_ci; then
    echo "Warning: using limited-privilege Sauce creds (NOT compatible with urls from CI builds)."
    inj_build_env_vars_for "dev" >/dev/null
fi

mk_proper_sauce_link "$1"
