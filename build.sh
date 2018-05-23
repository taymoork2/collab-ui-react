#!/bin/bash

function ex_usage {
    echo "usage: $(basename "$0") [<phase-number> [<phase-number> ...]]"
    echo ""
    echo " phases:"
    echo " - 1: (dependencies) build or restore dependencies"
    echo " - 2: (build) build app, run lint, run unit-tests, run e2e tests"
    echo " - 3: (package) package assets into tar archives"
    echo ""
    echo "ex. Run all phases (default)"
    echo "  $(basename "$0")"
    echo "  $(basename "$0") 1 2 3 # <= same as above"
    echo ""
    echo "ex. Run only phase 1 and 2"
    echo "  $(basename "$0") 1 2"
    echo ""
    echo "ex. Run only phase 3"
    echo "  $(basename "$0") 3"
    exit 1
}

# early out if looking for usage
if [[ "$1" == "--help" \
    || "$1" == "-h" \
    || "$1" == "-?" ]]; then
    ex_usage
    exit 1
fi


# -----
# Phase 0: Pre-setup
# - import helper functions
# shellcheck disable=SC1091
source ./bin/include/pid-helpers
# shellcheck disable=SC1091
source ./bin/include/setup-helpers
# shellcheck disable=SC1091
source ./bin/include/env-var-helpers

# - detect if running in local dev environment, inject env vars as appropriate (this won't be needed
#   in a Jenkins build env, as env vars are injected via other means)
if ! is_ci; then
    echo "[INFO] detected running in local dev environment, injecting build env vars for \"dev\"."
    inj_build_env_vars_for "dev" >/dev/null
fi


# -----
# Phase 1: Dependencies
function phase_1 {
    if [ -f "$BUILD_DEPS_ARCHIVE" ]; then
        # unpack previously built dependencies (but don't overwrite anything newer)
        echo "[INFO] Restoring previous deps..."
        tar --keep-newer-files -xf "$BUILD_DEPS_ARCHIVE"
    fi

    # checksums still good, just restore and early out
    # shellcheck disable=SC2154
    echo "[INFO] Inspecting checksums of $manifest_files from last successful build... "
    # shellcheck disable=SC2154
    if is_checksums_ok "$manifest_checksums_file"; then
        echo "[INFO] Install manifests haven't changed, restore dependencies (keeping all newer files)..."
        ./setup.sh --restore-soft || exit $?  # <= use 'exit' for errors (ie. terminate the script)
        return 0                              # <= use 'return' to early out of this function
    fi

    # otherwise fresh install npm dependencies
    echo "[INFO] Running 'setup'..."
    ./setup.sh || exit 1

    # regenerate .manifest-checksums
    echo "[INFO] Generating new manifest checksums file..."
    mk_checksum_file "$manifest_checksums_file" "$manifest_files"

    # archive dependencies
    echo "[INFO] Generating new build deps archive for later re-use..."
    tar -cpf "$BUILD_DEPS_ARCHIVE" \
        "$manifest_checksums_file" \
        ./.cache/npm-deps-for-*.tar.gz

    # dump top-level node module versions for build record
    yarn list --depth=1 > ./.cache/yarn-list-log
}


# -----
# Phase 2: Build
function phase_2 {
    set -e

    # run linting tasks in parallel
    parallel yarn ::: eslint tslint stylelint

    yarn json-verify
    yarn languages-verify

    # generate a plain-text file defining custom HTTP headers for use by nginx (CSP-related headers currently)
    node ./utils/printCustomHttpHeaders.js --env int | tee ./int-headers.txt
    node ./utils/printCustomHttpHeaders.js --env cfe | tee ./cfe-headers.txt
    node ./utils/printCustomHttpHeaders.js --env prod | tee ./prod-headers.txt

    # build
    time nice -10 yarn build --env.nolint --env.noprogress --env.nocacheloader --devtool source-map

    # add build info
    ./bin/print-current-build-info.sh | tee "./dist/${APP_BUILD_INFO_FILE}" || :

    # unit test
    nice -15 yarn test --phantomjs --env.noprogress --env.coverage
    set +e

    # e2e test
    ./e2e.sh | tee ./.cache/e2e-sauce-logs

    # groom logs for cleaner sauce labs output
    # shellcheck disable=SC1091
    source ./bin/include/sauce-results-helpers
    mk_test_report ./.cache/e2e-sauce-logs | tee "./.cache/e2e-report-for-${BUILD_TAG}"
}


# -----
# Phase 3: Package
function phase_3 {
    # Check build number
    if [ -n "$BUILD_NUMBER" ]; then
        echo "Build Number: $BUILD_NUMBER"
    else
        echo "Build Number not set $BUILD_NUMBER"
        BUILD_NUMBER=0
    fi
    rm -f wx2-admin-web-client.*.tar.gz

    envsubst < "$APP_DEPLOY_DESCRIPTOR_TEMPLATE" > "$APP_DEPLOY_DESCRIPTOR" || :

    # important: we untar with '--strip-components=1', so use 'dist/*' and NOT './dist/*'
    tar -zcvf "$APP_ARCHIVE" dist/* &> "${APP_ARCHIVE}--files-list"
    tar -zcvf "$SOURCE_MAP_ARCHIVE" dist-source-map/* &> "${SOURCE_MAP_ARCHIVE}--files-list"
    tar -zcvf "$COVERAGE_ARCHIVE" ./test/coverage/ &> "${COVERAGE_ARCHIVE}--files-list"

    # archive e2e test results
    tar -cf "$E2E_TEST_RESULTS_ARCHIVE" "./test/e2e-protractor/reports/${BUILD_TAG}"
}


# -----
# determine which phases to run from CLI args
# - (default) run all phases if no args passed to script
args="$*"
if [ "$#" -eq 0 ]; then
    args="1 2 3"
fi
# run each phase in order
for i in $args; do
    phase_"$i"
done
