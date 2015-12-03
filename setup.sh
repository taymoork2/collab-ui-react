#!/bin/bash

# Check NPM local path
function set_local_npm_path {
    export PATH="$PATH:./node_modules/.bin"
    echo "export PATH=\"\$PATH:./node_modules/.bin\"" >> ~/.bashrc
}
echo "$PATH" | grep -q './node_modules/.bin' && echo "Local NPM path is set" || set_local_npm_path

# Check NPM global path
function set_global_npm_path {
    export PATH="$PATH:/usr/local/bin"
    echo "export PATH=\"\$PATH:/usr/local/bin\"" >> ~/.bashrc
}
echo "$PATH" | grep -q '/usr/local/bin' && echo "Global NPM path is set" || set_global_npm_path

# Check if rvm is installed, otherwise install it
# rvm --version > /dev/null 2>&1
# RVM_RET=$?
# if [ $RVM_RET -ne 0 ]; then
#     echo "RVM not found, installing:"
#     \curl -sSL https://get.rvm.io | bash -s stable --ruby
# else
#     echo "RVM is already installed"
# fi

# Check if brew is installed, otherwise install it
if [ "`uname`" = "Darwin" ]; then
  brew --version > /dev/null 2>&1
  BREW_RET=$?
  if [ $BREW_RET -ne 0 ]; then
      echo "BREW not found, installing:"
      ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"
  else
      echo "BREW is already installed"
  fi
fi

# Check and install npm
npm --version > /dev/null 2>&1
NPM_RET=$?
if [ $NPM_RET -ne 0 ]; then
    echo "npm not found, installing:"
    if [ "`uname`" = "Darwin" ]; then
      brew install npm
    else
      echo "Please install npm (for CentOS, see: http://serverfault.com/questions/299288/how-do-you-install-node-js-on-centos )."
    fi
else
    echo "NPM is already installed"
fi

# Check and install bower
which bower > /dev/null 2>&1
BOWER_RET=$?
if [ $BOWER_RET -ne 0 ]; then
  echo "bower not found, installing:"
  npm install -g bower
else
  echo "bower is already installed"
fi

# Updating bower to the latest
npm update -g bower

# Check and install gulp
which gulp > /dev/null 2>&1
GULP_RET=$?
if [ $GULP_RET -ne 0 ]; then
  echo "gulp not found, installing:"
  npm install -g gulp
else
  echo "gulp is already installed"
fi

# # Check for cleanup script and run
# ls -al ./cleanUpManagedOrgs.sh > /dev/null 2>&1
# CLEANUP_RET=$?
# if [ $CLEANUP_RET -ne 0 ]; then
#   echo "cleanup script not found, ignoring cleanup..."
# else
#   echo "cleanup script found, running cleanup"
#   ./cleanUpManagedOrgs.sh
# fi

time_start=$(date +"%s")

# Install dependecies
# bundle install
npm install
npm update -g bower

time_npm=$(date +"%s")
npm_duration=$(($time_npm-$time_start))
echo "npm completed after $(($npm_duration / 60)) minutes and $(($npm_duration % 60)) seconds."

bower cache clean
(bower install && bower update) || exit $?

time_bower=$(date +"%s")
bower_duration=$(($time_bower-$time_npm))
echo "bower completed after $(($bower_duration / 60)) minutes and $(($bower_duration % 60)) seconds."
