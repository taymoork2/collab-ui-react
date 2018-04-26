#!/bin/bash

commit_id="$GIT_COMMIT"
if [ -z "$commit_id" ]; then
    >&2 echo "[WARN] No environment variable 'GIT_COMMIT' defined, falling back to HEAD commit id."
    commit_id="$(git log -n1 --pretty="%H")"
fi
printf '{ "id": "%s" }\n' "$commit_id"
