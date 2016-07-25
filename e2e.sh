#!/bin/bash

# Update webdriver
npm run webdriver

# Cleanup tcp processed from previous jobs
npm run kill

npm run serve-dist &
# poll on web webserver at root context until it comes up
while [ $( curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/ ) -ne 200 ]; do
    sleep 2;
done

# Run Protractor
npm run e2e -- --verbose --sauce
e2e_exit_code=$?

npm run kill

exit $e2e_exit_code
