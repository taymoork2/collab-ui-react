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

function kebab_case_to_pascal_case {
  sed -E 's/(^|-)([a-z])/\U\2/g'
}

function html_element_to_component_basename {
    echo "$1" | kebab_case_to_pascal_case
}

function subdir_path_to_ng_module_name {
    # remove './' prefix, then convert '/' chars to '.'
    echo "$1" | sed -e 's/^..//' | tr '/' .
}

function get_ng_module_name {
    local dir_name="$1"
    local THIS_PWD
    THIS_PWD="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

    # start search for relevant subdir from '.../app/modules'
    pushd "$THIS_PWD/../app/modules" > /dev/null
    local subdir_path
    subdir_path="$(find . -type d -name "${dir_name}")"
    subdir_path="$(subdir_path_to_ng_module_name "$subdir_path")"
    echo "$subdir_path"
    popd > /dev/null
}

dir_path="$1"
mkdir "$dir_path"

html_element_name="$(basename "$dir_path")"
js_component_file="${html_element_name}.component.ts"
js_component_file_no_ext="${html_element_name}.component"
js_component_spec_file="${html_element_name}.component.spec.ts"
template_file="${html_element_name}.html"
js_component_name="$(html_element_to_component_basename "$html_element_name")Component"
js_controller_name="$(html_element_to_component_basename "$html_element_name")Controller"
ng_module_name="$(get_ng_module_name "$html_element_name")"

function print_index_ts {
    cat << _EOF
import { $js_component_name } from './${js_component_file_no_ext}';

export default angular.module('${ng_module_name}', [
  require('angular-translate'),
  require('collab-ui-ng').default,
])
  .component('${html_element_name}', new ${js_component_name}())
  .name;
_EOF
}

function print_component_ts {
    cat << _EOF
class $js_controller_name implements ng.IComponentController {
}

export class $js_component_name implements ng.IComponentOptions {
  public controller = ${js_controller_name};
  public template = require('./${template_file}');
  public bindings = {};
}
_EOF
}

touch "${dir_path}/${template_file}"
touch "${dir_path}/${js_component_spec_file}"
print_component_ts > "${dir_path}/${js_component_file}"
print_index_ts > "${dir_path}/index.ts"
