#!/bin/bash

# Setup
./setup.sh

# Build
gulp clean || exit $?
gulp jsb:verify || exit $?
gulp e2e --sauce --nolint || exit $?

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
tar -zcvf wx2-admin-web-client.coverage.$BUILD_NUMBER.tar.gz coverage/unit/*
exit $?
