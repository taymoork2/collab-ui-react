#!/bin/bash

if [ -z "${WX2_ADMIN_WEB_CLIENT_HOME}" ]; then
    >&2 echo "Error: WX2_ADMIN_WEB_CLIENT_HOME is not set, please export this environment variable first."
    exit 1
fi

source ${WX2_ADMIN_WEB_CLIENT_HOME}/.jenkins-build-env-vars
source ${WX2_ADMIN_WEB_CLIENT_HOME}/bin/include/jenkins-helpers

# log whether tests succeded (will determine if job is marked 'UNSTABLE' or not)
echo -n "[INFO] E2E tests succeded: "
e2e_tests_succeeded && echo true || echo false

# reset e2e-related env-vars file (these are injected into jenkins job environment)
> ${E2E_TEST_ENV_VARS_FILE}

# 'NUM_RETRIES' => retries used during e2e tests
NUM_RETRIES=$(basename `get_last_retry_dir ` | cut -d- -f2)
echo NUM_RETRIES=${NUM_RETRIES} >> ${E2E_TEST_ENV_VARS_FILE}

# 'RESULTS_URL' => url for jenkins job that publishes the e2e test results
RESULTS_URL=`print_last_triggered_job_url`
echo RESULTS_URL=${RESULTS_URL} >> $E2E_TEST_ENV_VARS_FILE

# 'BUILD_DESCR' => summary text, along with a link to the test results job
BUILD_DESCR="<a href=\"${RESULTS_URL}\">E2E Test Report</a>"
BUILD_DESCR="${BUILD_DESCR} (Retries: ${NUM_RETRIES})"
echo BUILD_DESCR=$BUILD_DESCR >> $E2E_TEST_ENV_VARS_FILE
