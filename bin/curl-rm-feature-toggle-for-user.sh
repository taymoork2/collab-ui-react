#!/bin/bash

function ex_usage {
    >&2 echo "usage: $(basename "$0") <usr_label> <feature_toggle_id>"
    >&2 echo ""
    >&2 echo "ex."
    >&2 echo "  # delete feature-toggle 'atlas-f3745-auto-assign-licenses' for account 'account-admin'"
    >&2 echo "  $(basename "$0") seattle-partner atlas-f3745-auto-assign-licenses"
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
feature_toggle_id="$2"
user_id="$("$this_pwd"/curl-get-user-id.sh "$usr_label")"
url="https://feature-a.wbx2.com/feature/api/v1/features/users/${user_id}/developer/${feature_toggle_id}"

"$this_pwd/curl-cca" "$usr_label" DELETE "$url"
