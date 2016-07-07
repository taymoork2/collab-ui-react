#!/bin/bash

# Update webdriver
npm run webdriver

# Cleanup tcp processed from previous jobs
npm run kill

npm run server-dist &
while ! nc -z 127.0.0.1 8000; do sleep 1; done

# Run Protractor
npm run e2e -- --verbose --sauce
e2e_exit_code=$?

npm run kill

exit $e2e_exit_code
