#!/bin/bash

if [ -z "${WX2_ADMIN_WEB_CLIENT_HOME}" ]; then
    >&2 echo "Error: WX2_ADMIN_WEB_CLIENT_HOME is not set, please export this environment variable first."
    exit 1
fi

# shellcheck disable=SC1090
. "${WX2_ADMIN_WEB_CLIENT_HOME}/.jenkins-build-env-vars"
# shellcheck disable=SC1090
. "${WX2_ADMIN_WEB_CLIENT_HOME}/bin/include/sauce-results-helpers"

function print_last_triggered_job_url {
    # otherwise fall back to parsing out the results url from jenkins environment
    local results_url
    local results_job_name
    local results_build_number
    results_url="$(echo "$JOB_URL" | sed -E 's,(.*job/).*,\1,')"
    results_job_name="$E2E_TEST_RESULTS_JOB_NAME"
    results_build_number="$(env | grep TRIGGERED_BUILD_NUMBER_ | grep "${LAST_TRIGGERED_JOB_NAME}" | cut -d= -f2)"

    echo "${results_url}${results_job_name}/${results_build_number}/"
}

# reset e2e-related env-vars file (these are injected into jenkins job environment)
> "$E2E_TEST_ENV_VARS_FILE"

# 'NUM_RETRIES' => retries used during e2e tests
# shellcheck disable=SC2154
NUM_RETRIES=$(get_last_run_from_log_file "$e2e_sauce_logs_file")
echo NUM_RETRIES="${NUM_RETRIES}" >> "$E2E_TEST_ENV_VARS_FILE"

# 'RESULTS_URL' => url for jenkins job that publishes the e2e test results
RESULTS_URL=$(print_last_triggered_job_url)
echo RESULTS_URL="${RESULTS_URL}" >> "$E2E_TEST_ENV_VARS_FILE"

# 'BUILD_DESCR' => summary text, along with a link to the test results job
BUILD_DESCR="<a href=\"${RESULTS_URL}\">E2E Test Report</a>"
BUILD_DESCR="${BUILD_DESCR} (Retries: ${NUM_RETRIES})"
echo "BUILD_DESCR=$BUILD_DESCR" >> "$E2E_TEST_ENV_VARS_FILE"
