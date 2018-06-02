#!/bin/bash

this_pwd="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$this_pwd/.." || exit

# lint *.json files under './app' (except 'app/l10n', which will be done separately)
find ./app -iname \*.json | grep -v "app/l10n" | "${this_pwd}/json-lint.sh"

# lint *.json files under './test' (except 'test/coverage', which is machine generated)
find ./test -iname \*.json | grep -v "test/coverage" | "${this_pwd}/json-lint.sh"
