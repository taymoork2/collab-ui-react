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
    inj_build_env_vars_for "dev"
fi


# -----
# Phase 1: Dependencies
function phase_1 {
    if [ -f "$BUILD_DEPS_ARCHIVE" ]; then
        # unpack previously built dependencies (but don't overwrite anything newer)
        echo "[INFO] Restoring previous deps..."
        tar --keep-newer-files -xf "$BUILD_DEPS_ARCHIVE"
    fi

    # shellcheck disable=SC2154
    echo "[INFO] Inspecting checksums of $manifest_files from last successful build... "
    # shellcheck disable=SC2154
    checksums_ok=$(is_checksums_ok "$manifest_checksums_file" && echo "true" || echo "false")

    echo "[INFO] Checking if it is time to refresh..."
    min_refresh_period=$(( 60 * 60 * 24 ))  # 24 hours
    # shellcheck disable=SC2154
    time_to_refresh=$(is_time_to_refresh $min_refresh_period "$last_refreshed_file" \
        && echo "true" || echo "false")

    echo "[INFO] checksums_ok: $checksums_ok"
    echo "[INFO] time_to_refresh: $time_to_refresh"
    if [ "$checksums_ok" = "true" ] && [ "$time_to_refresh" = "false" ]; then
        echo "[INFO] Install manifests haven't changed and not yet time to refresh, restore soft " \
            "dependencies..."
        ./setup.sh --restore
    else
        # we want to fresh install npm dependencies
        echo "[INFO] Running 'setup'..."
        ./setup.sh

        # setup succeeded
        # shellcheck disable=SC2181
        if [ $? -eq 0 ]; then
            # - regenerate .manifest-checksums
            echo "[INFO] Generating new manifest checksums file..."
            mk_checksum_file "$manifest_checksums_file" "$manifest_files"

            # - regenerate .last-refreshed
            echo "[INFO] Generating new last-refreshed file..."
            mk_last_refreshed_file "$last_refreshed_file"

            # archive dependencies
            echo "[INFO] Generating new build deps archive for later re-use..."
            tar -cpf "$BUILD_DEPS_ARCHIVE" \
                "$last_refreshed_file" \
                "$manifest_checksums_file" \
                .cache/npm-deps-for-*.tar.gz

        # setup failed
        else
            # setup was triggered because one of the manifest files changed
            if [ "$checksums_ok" = "false" ]; then
                exit 1
            fi

            # setup was triggered only because refresh window has expired
            if [ "$time_to_refresh" = "true" ]; then
                echo "[INFO] 'setup.sh' failed, but was triggered only because the refresh window " \
                    "expired, falling back to recent successfully built dependencies..."
                # re-use deps from previous successful build (if possible)
                ./setup.sh --restore
            else
                # refresh window hasn't expired
                exit 1
            fi
        fi
    fi

    # print top-level node module versions
    npm ls --depth=1
}


# -----
# Phase 2: Build
function phase_2 {
    set -e

    # notes:
    # - building the prod-version of webpack takes 5+ min.
    # - start it in the background at the beginning to leverage concurrency
    #   - it is single-threaded, so will not monopolize all the available cpu
    #   - capture the pid, so we can wait on it before proceeding to e2e tests
    (
        set +e
        # - 'typings' seems to be required for webpack to succeed
        npm run typings
        time nice -10 npm run build -- --env.nolint --env.noprogress --devtool source-map
        echo $? > ./.cache/webpack_exit_code
        set -e
    ) &
    webpack_pid=$!

    npm run lint
    npm run json-verify
    npm run languages-verify
    nice -15 npm run test -- --env.noprogress
    set +e


    # webpack must complete before running e2e tests
    set -x
    wait "$webpack_pid"
    read -r webpack_exit_code < ./.cache/webpack_exit_code
    [ "$webpack_exit_code" -eq 0 ] || exit "$webpack_exit_code"
    set +x


    # e2e tests
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
