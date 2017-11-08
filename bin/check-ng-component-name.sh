#!/bin/bash

function ex_usage {
    >&2 echo "usage: $(basename "$0") <path-to-new-component-dir>"
    >&2 echo ""
    >&2 echo "ex."
    >&2 echo "  # make component dir in current working dir"
    >&2 echo "  $(basename "$0") my-component"
    >&2 echo ""
    >&2 echo "  # or specify path"
    >&2 echo "  $(basename "$0") ./path/to/create/my-component"
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

# shellcheck disable=SC1090
source "$this_pwd/include/core-helpers"

function find_component_dir_name {
    local component_dir_name="$1"
    component_dir_name="$(basename "$component_dir_name")"
    local start_dir="$2"
    find "$start_dir" -type d -iname "$component_dir_name" 2>/dev/null
}

function dir_name_exists {
    local dir_names_found="$1"
    local num_dirs_found
    # early out if results is an empty string
    if [ -z "$dir_names_found" ]; then
        return 1
    fi
    num_dirs_found="$(echo "$dir_names_found" | wc -l)"
    test "$num_dirs_found" -ne 0
}

function rm_dir_if_empty {
    local dest_dir="$1"
    local results
    results="$(find "$dest_dir" -type f)"
    if [ -z "$results" ]; then
        rm -rf "$dest_dir"
    fi
}

function get_full_path {
    local dest_dir="$1"
    if [ -d "$dest_dir" ]; then
        dest_dir="$(cd -P "$dest_dir" && pwd)"
    else
        mkdir -p "$dest_dir"
        dest_dir="$(cd -P "$dest_dir" && pwd)"
        rm_dir_if_empty "$dest_dir"
    fi
    echo "$dest_dir"
}

function get_parent_dir_name {
    local dest_dir="$1"
    dest_dir="$(get_full_path "$dest_dir")"
    dest_dir="${dest_dir%/*}"  # <= chop from tail, shortest-match (e.g. 'foo/bar/baz' => 'foo/bar')
    basename "$dest_dir"
}

function is_white_list_name {
    local white_list_names="shared util"  # <= space-delimited names allowed
    local query="$1"
    echo "$white_list_names" | grep -q -e "\b${query}\b"
}

dest_dir="$1"
component_dir_name="$(basename "$dest_dir")"

this_pwd="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
pushd "${this_pwd}/../app/modules" >/dev/null
dir_name_search="$(find_component_dir_name "$component_dir_name" .)"
popd >/dev/null

if dir_name_exists "$dir_name_search" && \
    ! is_white_list_name "$component_dir_name"; then
    suggested_name="$(get_parent_dir_name "$dest_dir")"
    suggested_name="${suggested_name}-${component_dir_name}"
    echo_warn "'${component_dir_name}' already exists, 'find' results as follows:"
    >&2 echo "$dir_name_search"
    echo_info "Perhaps try alternate name: '$suggested_name'"
else
    echo "$component_dir_name"
fi
