#!/bin/bash

if [ -z "${WX2_ADMIN_WEB_CLIENT_HOME}" ]; then
    >&2 echo "Error: WX2_ADMIN_WEB_CLIENT_HOME is not set, please export this environment variable first."
    exit 1
fi

# import helper functions
source "${WX2_ADMIN_WEB_CLIENT_HOME}/bin/include/pid-helpers"
source "${WX2_ADMIN_WEB_CLIENT_HOME}/bin/include/curl-api-helpers"

# Update webdriver
npm run webdriver

# Cleanup tcp processed from previous jobs
kill_wait "lite-server"

npm run serve-dist &
# poll on web webserver at root context until it comes up
while [ $( curl_http_status "http://127.0.0.1:8000/" ) -ne 200 ]; do
    sleep 2;
done

# Run Protractor
npm run e2e -- --verbose --sauce
e2e_exit_code=$?

kill_wait "lite-server"

exit $e2e_exit_code
