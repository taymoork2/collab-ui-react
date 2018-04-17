#!/bin/bash

function ex_usage {
    >&2 echo "usage: $(basename "$0") <usr_label>"
    >&2 echo ""
    >&2 echo "ex."
    >&2 echo "  # get user id of 'seattle-partner'"
    >&2 echo "  $(basename "$0") seattle-partner"
}

# early out if looking for usage
if [[ "$1" == "--help" \
    || "$1" == "-h" \
    || "$1" == "-?"
    || $# -eq 0 ]]; then
    ex_usage
    exit 1
fi

this_pwd="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usr_label="$1"

"$this_pwd/curl-cca" "$usr_label" GET 'https://identity.webex.com/identity/scim/v1/Users/me?disableCache=true' | jq '.id' | xargs echo
