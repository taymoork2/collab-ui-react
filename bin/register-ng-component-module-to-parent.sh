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

dest_dir="$1"

this_pwd="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck disable=SC1090
source "$this_pwd/include/core-helpers"

# shellcheck disable=SC1090
source "$this_pwd/include/ng-boilerplate-helpers"

function add_import_of_module_name {
    local dest_dir="$1"
    dest_dir="$(get_full_path "$dest_dir")"
    local parent_index_ts_file
    parent_index_ts_file="$(get_parent_index_ts_file "$dest_dir")"
    if [ ! -s "$parent_index_ts_file" ]; then
        >&2 echo "[WARNING] no parent 'index.ts' found, skipping parent registration for module '${dest_dir}'"
        return
    fi

    # grep for lines with 'import'-statement
    local line_num_of_last_import_statement
    line_num_of_last_import_statement="$(grep -n "^import " "$parent_index_ts_file" 2>/dev/null | tail -1 | cut -d: -f1)"

    local html_element_name
    html_element_name="$(basename "$dest_dir")"
    local js_directive_name
    js_directive_name="$(html_element_to_directive_name "$html_element_name")"
    local import_statement="import ${js_directive_name}ModuleName from './${html_element_name}';"

    # if no line found, insert at line 1, otherwise insert after last import statement
    if [ -z "$line_num_of_last_import_statement" ]; then
        sed -i -E "1i $import_statement" "$parent_index_ts_file"
    else
        sed -i -E "${line_num_of_last_import_statement}a $import_statement" "$parent_index_ts_file"
    fi
}

add_import_of_module_name "$dest_dir"
