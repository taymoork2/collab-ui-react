#!/bin/bash

function ex_usage {
    >&2 echo "usage: $(basename "$0") <usr_label> <feature_toggle_id> (true|false)"
    >&2 echo ""
    >&2 echo "ex."
    >&2 echo "  # set feature-toggle 'atlas-email-suppress' for account 'seattle-partner' to 'true'"
    >&2 echo "  $(basename "$0") seattle-partner atlas-email-suppress true"
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
val="$3"
user_id="$("$this_pwd"/curl-get-user-id.sh "$usr_label")"
url="https://feature-a.wbx2.com/feature/api/v1/features/users/${user_id}/developer"
tmp_file="$(mktemp "tmp.XXXXX.json")"
printf '{ "key": "%s", "val": "%s" }' "$feature_toggle_id" "$val" > "$tmp_file"

"$this_pwd/curl-cca" "$usr_label" POST --data "@${tmp_file}" "$url"

rm "$tmp_file"
