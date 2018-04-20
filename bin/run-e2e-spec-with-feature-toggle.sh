#!/bin/bash

function ex_usage {
    >&2 echo "usage: $(basename "$0") <usr_label> <feature_toggle_id> <path_to_spec_file>"
    >&2 echo ""
    >&2 echo "ex."
    >&2 echo "  # set feature-toggle 'atlas-f3745-auto-assign-licenses' temporarily to true for 'seattle-partner' and run spec 'foo_spec.js'"
    >&2 echo "  $(basename "$0") seattle-partner atlas-f3745-auto-assign-licenses ./test/e2e-protractor/foo_spec.js"
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
spec_file="$3"
pass_through_opts=${*:4}

# set feature-toggle
"${this_pwd}/curl-set-feature-toggle-for-user.sh" "$usr_label" "$feature_toggle_id" true 2>/dev/null
echo ""
echo "[INFO] enable feature-toggle: ${feature_toggle_id}: DONE"

# trap user-interrupt signal (ie. ctrl+c) and make sure feature-toggle is cleaned up
i=0
trap unset_feature_toggle INT
function unset_feature_toggle {
    let "i += 1"
    if [ $i -gt 1 ]; then
        return
    fi
    "${this_pwd}/curl-rm-feature-toggle-for-user.sh" "$usr_label" "$feature_toggle_id" 2>/dev/null
    echo "[INFO] remove feature-toggle: ${feature_toggle_id}: DONE"
}

# run spec, then unset feature-toggle
# shellcheck disable=SC2086
node ./protractor/e2e --production-backend --specs="$spec_file" $pass_through_opts
unset_feature_toggle
