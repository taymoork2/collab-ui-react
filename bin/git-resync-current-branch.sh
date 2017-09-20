#!/bin/bash

function ex_usage {
    echo "usage: $(basename "$0") [--fork=<fork>]"
    echo ""
    echo "ex. catch up to mainline and resync current branch to your fork (assumes fork name is your CEC id)"
    echo "  $(basename "$0")"
    echo ""
    echo "ex. same as above, but specify a different fork"
    echo "  $(basename "$0") --fork=CBABU"
    exit 1
}

# early out if looking for usage
if [[ "$1" == "--help" \
    || "$1" == "-h" \
    || "$1" == "-?" ]]; then
    >&2 ex_usage
    exit 1
fi

for opt in "$@"; do
    case "$opt" in
        --fork=* )
            FORK_NAME="${opt##*=}"
            ;;
        --verbose )
            set -x
            ;;
    esac
done

CURRENT_BRANCH="$(git branch | grep '^\*' | awk '{print $2;}')"
MAINLINE_REMOTE_NAME="$(git remote -v | grep 'git@sqbu-github.cisco.com:WebExSquared/wx2-admin-web-client.git' | head -1 | awk '{print $1;}')"
CEC_ID="$(git config user.email)"
CEC_ID="${CEC_ID%%@*}"
FORK_NAME="${FORK_NAME:-$CEC_ID}"

git fetch -p "$MAINLINE_REMOTE_NAME"
git rebase "$MAINLINE_REMOTE_NAME/master"
git push -f "$FORK_NAME" "$CURRENT_BRANCH"
set +x
