#!/bin/bash

function ex_usage {
    >&2 echo "usage: $(basename "$0") <path-to-old-component-dir> <path-to-new-component-dir>"
    >&2 echo ""
    >&2 echo "ex."
    >&2 echo "  # rename foo-bar to foo-baz"
    >&2 echo "  $(basename "$0") ./app/modules/core/foo-bar ./app/modules/core/share/foo-baz"
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
# shellcheck disable=SC1090
source "$this_pwd/include/ng-boilerplate-helpers"

src_dir="$1"
dest_dir="$2"

if [ ! -d "$src_dir" ]; then
    abort "[ERROR] $src_dir does not exist"
elif [ -d "$dest_dir" ]; then
    abort "[ERROR] $dest_dir already exists"
fi

modules_root_dir="$this_pwd/../app/modules"
src_html_element_name="$(basename "$src_dir")"
src_js_directive_name="$(html_element_to_directive_name "$src_html_element_name")"
src_js_component_name="$(html_element_to_component_basename "$src_html_element_name")Component"
src_js_controller_name="$(html_element_to_component_basename "$src_html_element_name")Controller"
src_js_module_name="$(html_element_to_directive_name "$src_html_element_name")ModuleName"
src_ng_module_name="$(get_ng_module_name "$src_dir")"
src_es6_module_path="$(get_es6_module_path "$src_dir")"
dest_html_element_name="$(basename "$dest_dir")"
dest_js_directive_name="$(html_element_to_directive_name "$dest_html_element_name")"
dest_js_component_name="$(html_element_to_component_basename "$dest_html_element_name")Component"
dest_js_controller_name="$(html_element_to_component_basename "$dest_html_element_name")Controller"
dest_js_module_name="$(html_element_to_directive_name "$dest_html_element_name")ModuleName"
dest_ng_module_name="$(get_ng_module_name "$dest_dir")"
dest_es6_module_path="$(get_es6_module_path "$dest_dir")"

function swap_symbol_in_dir {
    local src_symbol="$1"
    local dest_symbol="$2"
    local start_dir="$3"

    results="$(grep -l -R "\b${src_symbol}\b" "$start_dir")"
    if [ -n "$results" ]; then
        echo "$results" | xargs sed -i -e "s,\b${src_symbol}\b,${dest_symbol},g"
    fi
}

function swap_symbol_in_dir_as_literal {
    local src_symbol="$1"
    local dest_symbol="$2"
    local start_dir="$3"
    results="$(grep -F -l -R "${src_symbol}" "$start_dir")"
    if [ -n "$results" ]; then
        echo "$results" | xargs sed -i -e "s,\b${src_symbol}\b,${dest_symbol},g"
    fi
}

function swap_html_element_name {
    local src_html_element_name="$1"
    local dest_html_element_name="$2"
    local start_dir="$3"
    local results
    results="$(grep -l -R "<\b${src_html_element_name}\b[^-]\?" "$start_dir")"
    if [ -n "$results" ]; then
        echo "$results" | xargs sed -i -E "s,<\b${src_html_element_name}\b([^-]?),<${dest_html_element_name}\1,g"
    fi
    results="$(grep -l -R "<\/\b${src_html_element_name}\b[^-]" "$start_dir")"
    if [ -n "$results" ]; then
        echo "$results" | xargs sed -i -E "s,<\/\b${src_html_element_name}\b([^-]),<\/${dest_html_element_name}\1,g"
    fi
}

function swap_relative_import_path {
    local src_html_element_name="$1"
    local dest_html_element_name="$2"
    local start_dir="$3"
    local results
    results="$(grep -l -R "^import.*\./${src_html_element_name}';")"
    if [ -n "$results" ]; then
        echo "$results" | xargs sed -i -E "s,(^import.*\./)(${src_html_element_name}),\1${dest_html_element_name},g"
    fi
}

# - swap symbols (in src dir only):
#   - sed swap 'core.users.path.to.foo-bar' -> 'core.users.newpath.to.foo-baz'
#   - sed swap '\bFooBarController\b' -> 'FooBazController'
#   - sed swap '\bFooBarComponent\b' -> 'FooBazComponent'
#   - sed swap '\bfoo-bar\b' -> 'foo-baz'
#   - sed swap '\bfooBar\b' -> 'fooBaz'
swap_symbol_in_dir_as_literal "$src_ng_module_name" "$dest_ng_module_name" "$src_dir"
swap_symbol_in_dir "$src_js_controller_name" "$dest_js_controller_name" "$src_dir"
swap_symbol_in_dir "$src_js_component_name" "$dest_js_component_name" "$src_dir"
swap_symbol_in_dir "$src_html_element_name" "$dest_html_element_name" "$src_dir"
swap_symbol_in_dir "$src_js_directive_name" "$dest_js_directive_name" "$src_dir"

# - swap symbols (project-wide):
#   - sed swap '\bfooBarModuleName\b' -> 'fooBazModuleName'
swap_symbol_in_dir "$src_js_module_name" "$dest_js_module_name" "$modules_root_dir"
#
#   - sed swap '\<\bfoo-bar\b' -> '\<foo-baz'
#   - sed swap '\</foo-bar\b' -> '\</foo-baz'
swap_html_element_name "$src_html_element_name" "$dest_html_element_name" "$modules_root_dir"

# - swap import paths (project-wide):
#   - sed swap "'./foo-bar'" -> "'./foo-baz'"
#   - sed swap 'core/users/path/to/foo-bar' -> 'core/users/newpath/to/foo-baz'
swap_relative_import_path "$src_html_element_name" "$dest_html_element_name" "$modules_root_dir"
swap_symbol_in_dir_as_literal "$src_es6_module_path" "$dest_es6_module_path" "$modules_root_dir"
