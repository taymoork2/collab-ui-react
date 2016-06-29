#!/bin/bash

# Update webdriver
npm run webdriver

# Cleanup tcp processed from previous jobs
npm run kill

npm run server-dist &
while ! nc -z 127.0.0.1 8000; do sleep 1; done

# Run Protractor
node ./protractor/e2e.js --production-backend --verbose --suite jenkins --sauce
e2e_exit_code=$?

npm run kill

exit $e2e_exit_code
