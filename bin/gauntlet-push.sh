#!/bin/bash

function ex_usage {
    echo "usage: $(basename "$0") [--fork=<fork>]"
    echo ""
    echo "ex. catch up to mainline and resync current branch to your fork (assumes fork name is your CEC id), then push to gauntlet."
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

THIS_PWD="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for opt in "$@"; do
    case "$opt" in
        --verbose )
            set -x
            ;;
    esac
done

# always catch up current branch to mainline, and resync to fork's branch
"$THIS_PWD/rebase-branch-and-update-fork.sh" "$@"

CURRENT_BRANCH="$(git branch | grep '^\*' | awk '{print $2;}')"
GAUNTLET_REMOTE_NAME="$(git remote -v | grep 'https://gauntlet.wbx2.com/api/git/atlas-web' | head -1 | awk '{print $1;}')"
git push "$GAUNTLET_REMOTE_NAME" "$CURRENT_BRANCH:master"

set +x
