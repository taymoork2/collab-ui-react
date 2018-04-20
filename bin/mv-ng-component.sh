#!/bin/bash

###
### ag -l cr-services-panels | sed -i -e 's/cr-services-panels/cr-services-panels-legacy/g'
###

function ex_usage {
    >&2 echo "usage: $(basename "$0") <path-to-old-component-dir> <path-to-new-component-dir>"
    >&2 echo ""
    >&2 echo "ex."
    >&2 echo "  # rename foo-bar to foo-baz"
    >&2 echo "  $(basename "$0") ./app/modules/core/foo-bar ./app/modules/core/share/foo-baz"
}

function abort {
    >&2 echo "$*"
    exit 1
}

# early out if looking for usage
if [[ "$1" == "--help" \
    || "$1" == "-h" \
    || "$1" == "-?"
    || $# -eq 0 ]]; then
    ex_usage
    exit 1
fi

src_dir="$1"
dest_dir="$2"
src_html_element_name="$(basename "$src_dir")"
dest_html_element_name="$(basename "$dest_dir")"

if [ ! -d "$src_dir" ]; then
    abort "[ERROR] $src_dir does not exist"
elif [ -d "$dest_dir" ]; then
    abort "[ERROR] $dest_dir already exists"
fi

this_pwd="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck disable=SC1090
source "$this_pwd/include/core-helpers"
# shellcheck disable=SC1090
source "$this_pwd/include/ng-boilerplate-helpers"

# unregister component from parent (if any)
"$this_pwd/register-ng-component-module-to-parent.sh" --unregister "$src_dir"

# do string swaps for all relevant symbols
"$this_pwd/string-swap-ng-component-name.sh" "$src_dir" "$dest_dir"

# rename files under component dir, e.g.:
# - '.../foo-bar/foo-bar.component.ts' -> '.../foo-baz/foo-baz.component.ts'
# - '.../foo-bar/foo-bar.html' -> '.../foo-baz/foo-baz.html'
for i in "${src_dir}/${src_html_element_name}"*; do
    filename_suffix="${i##*${src_html_element_name}}"
    mv "$i" "${src_dir}/${dest_html_element_name}${filename_suffix}"
done

# mv dir
mv "$src_dir" "$dest_dir" || exit 1

# register component to parent (if any)
"$this_pwd/register-ng-component-module-to-parent.sh" "$dest_dir"
