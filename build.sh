#!/bin/bash

# import helper functions
source ./bin/include/pid-helpers

# -----
# Phase 1: Pre-setup
# - look for any zombie instances of process names (there shouldn't be any when Jenkins runs this)
proc_names_to_scan="bin\\/sc gulp bin\\/spin"
for i in $proc_names_to_scan; do
    if [ -n "`get_pids $i`" ]; then
        echo "WARNING: stale process found: $i"
        kill_wait "$i"
    fi
done

# - setup a .cache dir
mkdir -p ./.cache


# -----
# Phase 2: Setup
source ./bin/include/setup-helpers

# ex.
echo "Inspecting checksums of $manifest_files from last successful build... "
checksums_ok=`is_checksums_ok $manifest_checksums_file && echo "true" || echo "false"`


echo "Checking dependency dirs ('node_modules' and 'bower_components') still exist..."
dirs_ok=`dirs_exist $dependency_dirs && echo "true" || echo "false"`

echo "Checking if it is time to refresh..."
min_refresh_period=$(( 60 * 60 * 24 ))  # 24 hours
time_to_refresh=`is_time_to_refresh $min_refresh_period $last_refreshed_file \
    && echo "true" || echo "false"`

echo "INFO: checksums_ok: $checksums_ok"
echo "INFO: dirs_ok: $dirs_ok"
echo "INFO: time_to_refresh: $time_to_refresh"
if [ "$checksums_ok"    = "true" -a \
     "$dirs_ok"         = "true" -a \
     "$time_to_refresh" = "false" ]; then
    echo "Install manifests haven't changed, dependency dirs still exist, and not yet time to" \
        "refresh, skipping 'setup.sh'..."
else
    ./setup.sh

    # setup succeeded
    if [ $? -eq 0 ]; then
        # - regenerate .manifest-checksums
        # - regenerate .last-refreshed
        mk_checksum_file $manifest_checksums_file $manifest_files
        mk_last_refreshed_file $last_refreshed_file

    # setup failed
    else
        # setup was triggered because one of the manifest files changed
        if [ "$checksums_ok" = "false" ]; then
            exit 1
        fi

        # setup was triggered only because refresh window has expired
        if [ "$time_to_refresh" = "true" ]; then
            echo "'setup.sh' failed, but was triggered only because the refresh window expired," \
                "falling back to recent successfully built dependencies..."
            # re-use deps from previous successful build (if possible)
            ./setup.sh --restore
        else
            # refresh window hasn't expired
            exit 1
        fi
    fi
fi


# -----
# Phase 3: Build
gulp clean || exit $?
gulp jsb:verify || exit $?
gulp e2e --sauce --production-backend --nolint | tee ./.cache/e2e-sauce-logs || exit $?

# groom logs for cleaner sauce labs output
source ./bin/include/sauce-results-helpers
mk_test_report ./.cache/e2e-sauce-logs | tee ./.cache/e2e-report-for-${BUILD_TAG}


# -----
# Phase 4: Package
# Check build number
if [ -n "$BUILD_NUMBER" ]; then
    echo "Build Number: $BUILD_NUMBER"
else
    echo "Build Number not set $BUILD_NUMBER"
    BUILD_NUMBER=0
fi
rm -f wx2-admin-web-client.*.tar.gz
tar -zcvf wx2-admin-web-client.$BUILD_NUMBER.tar.gz dist/*
tar -zcvf coverage.tar.gz coverage/unit/*

exit $?
