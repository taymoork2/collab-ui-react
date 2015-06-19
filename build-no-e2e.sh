#!/bin/bash

# Setup
./setup.sh

# Build
gulp clean || exit $?
gulp build || exit $?

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
tar -zcvf coverage.tar.gz coverage/unit/*
exit $?
