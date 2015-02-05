#!/bin/bash

# Setup
./setup.sh

# Build
grunt clean || exit $?
grunt js_verify || exit $?
grunt build || exit $?
npm test || exit $?

# Check build number
if [ -n "$BUILD_NUMBER" ]; then
    echo "Build Number: $BUILD_NUMBER"
else
    echo "Build Number not set $BUILD_NUMBER"
    BUILD_NUMBER=0
fi

# Package
rm -f wx2-admin-web-client.*.tar.gz
tar -zcvf wx2-admin-web-client.$BUILD_NUMBER.tar.gz dist/*
exit $?
