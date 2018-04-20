#!/bin/bash

THIS_PWD="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "$THIS_PWD/include/core-helpers"


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

function print_error_and_exit {
    echo "Please resolve your rebase before re-running \`$(basename "$0")\`." | print_notice_banner
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

# catch up to mainline
git fetch -p "$MAINLINE_REMOTE_NAME"
git rebase "$MAINLINE_REMOTE_NAME/master" || print_error_and_exit

# sync local branch to fork
git push -f "$FORK_NAME" "$CURRENT_BRANCH"
set +x
