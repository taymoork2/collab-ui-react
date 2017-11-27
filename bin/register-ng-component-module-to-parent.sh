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
    >&2 echo ""
    >&2 echo "  # use '--unregister' to remove import statement and dependency line"
    >&2 echo "  $(basename "$0") --unregister ./path/to/create/my-component"
}


# early out if looking for usage
if [[ "$1" == "--help" \
    || "$1" == "-h" \
    || "$1" == "-?"
    || $# -eq 0 ]]; then
    ex_usage
    exit 1
fi

do_unregister=
if [ $# -eq 2 ]; then
    if [ "$1" = "--unregister" ]; then
        do_unregister="$1"
        shift
    fi
fi

dest_dir="$1"

this_pwd="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck disable=SC1090
source "$this_pwd/include/core-helpers"

# shellcheck disable=SC1090
source "$this_pwd/include/ng-boilerplate-helpers"

# early out if no parent 'index.ts' exists
parent_index_ts_file="$(get_parent_index_ts_file "$dest_dir")"
if [ ! -s "$parent_index_ts_file" ]; then
    >&2 echo "[WARNING] no parent 'index.ts' found, skipping parent registration for module '${dest_dir}'"
    exit 0
fi

function add_import_statement_to_parent {
    local dest_dir="$1"
    local parent_index_ts_file
    parent_index_ts_file="$(get_parent_index_ts_file "$dest_dir")"
    html_element_name="$(basename "$dest_dir")"
    js_directive_name="$(html_element_to_directive_name "$html_element_name")"

    # grep for lines with 'import'-statement
    line_num_of_last_import_statement="$(grep -n "^import " "$parent_index_ts_file" 2>/dev/null | tail -1 | cut -d: -f1)"

    # set up import statement
    import_statement="import ${js_directive_name}ModuleName from './${html_element_name}';"

    # if no line found, insert at line 1, otherwise insert after last import statement
    if [ -z "$line_num_of_last_import_statement" ]; then
        sed -i -E "1i $import_statement" "$parent_index_ts_file"
    else
        sed -i -E "${line_num_of_last_import_statement}a $import_statement" "$parent_index_ts_file"
    fi
}

function add_dependency_line_to_parent {
    local dest_dir="$1"
    local parent_index_ts_file
    parent_index_ts_file="$(get_parent_index_ts_file "$dest_dir")"
    html_element_name="$(basename "$dest_dir")"
    js_directive_name="$(html_element_to_directive_name "$html_element_name")"
    dependency_line="\ \ ${js_directive_name}ModuleName,"

    # notes:
    # - search for lines between 'export default angular' and '])'
    # - insert dependency line above tail
    sed -i -E "/^export default angular/,/^ *]\)/ H
    /^ *]\)/ i ${dependency_line}
    " "$parent_index_ts_file"
}

function rm_import_statement_from_parent {
    local dest_dir="$1"
    local parent_index_ts_file
    parent_index_ts_file="$(get_parent_index_ts_file "$dest_dir")"
    html_element_name="$(basename "$dest_dir")"
    js_directive_name="$(html_element_to_directive_name "$html_element_name")"
    import_statement_regex="import ${js_directive_name}ModuleName from.*;"

    sed -i -E "/${import_statement_regex}/ d" "$parent_index_ts_file"
}

function rm_dependency_line_from_parent {
    local dest_dir="$1"
    local parent_index_ts_file
    parent_index_ts_file="$(get_parent_index_ts_file "$dest_dir")"
    html_element_name="$(basename "$dest_dir")"
    js_directive_name="$(html_element_to_directive_name "$html_element_name")"
    dependency_line_regex="${js_directive_name}ModuleName,"

    sed -i -E "/${dependency_line_regex}/ d" "$parent_index_ts_file"
}

if [ -z "$do_unregister" ]; then
    add_import_statement_to_parent "$dest_dir"
    add_dependency_line_to_parent "$dest_dir"
else
    rm_import_statement_from_parent "$dest_dir"
    rm_dependency_line_from_parent "$dest_dir"
fi
