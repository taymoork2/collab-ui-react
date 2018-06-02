#!/bin/bash

function ex_usage {
    echo "Run jshint on *.json files."
    echo ""
    echo "usage: $(basename "$0") [--help|-h|-?] <json_file>"
    echo ""
    echo "ex. single json file"
    echo "  $(basename "$0") foo.json"
    echo ""
    echo "ex. all json files in the parent dir"
    echo "  $(basename "$0") ../*.json"
    echo ""
    echo "ex. all json files found under the './app/modules' dir"
    echo "  find ./app/modules -iname \\*.json | $(basename "$0")"
}

# early out if looking for usage
if [[ "$1" == "--help" || "$1" == "-h" || "$1" == "-?" ]]; then
    ex_usage
    exit 1
fi

# early out if 0 args, and no pipe connected to stdin
if [ -t 0 ] && [ "$#" -eq 0 ]; then
    ex_usage
    exit 1
fi

use_parallel=
args=( "$@" )
i=0
for opt in "${args[@]}"; do
    case "$opt" in
        --use-parallel )
            use_parallel="true"
            unset -v "args[$i]"
            ;;
    esac
    (( "i += 1" ))
done

# update positional params after filtering out '--*' args
set -- "${args[@]}"

# remap stdin to positional params
set -- "${1:-$(</dev/stdin)}" "${@:2}"

if [ -n "$use_parallel" ]; then
    # shellcheck disable=SC2068
    parallel -k jshint ::: $@
else
    # shellcheck disable=SC2068
    jshint $@
fi
