#!/bin/bash

source ./bin/include/setup-helpers
quick="false"

# optional CLI switches
if [ -n "$1" ]; then
    case "$1" in
        "-h"|"--help" )
            echo "useage: `basename $0` [--restore|--restore-soft] [--quick]"
            echo ""
            echo "ex. Run with no args to build dependencies"
            echo "  `basename $0`"
            echo ""
            echo "ex. Use '--restore' to restore the most recently built dependencies (if available)"
            echo "  `basename $0` --restore"
            echo ""
            echo "  Same as above, but prevent overwriting manifest files"
            echo "  `basename $0` --restore-soft"
            echo ""
            echo "ex. Run with '--quick' to skip removing component directores and clearing bower cache"
            echo ""
            exit 1
            ;;

        "--restore-soft" )
            # restore deps dirs, but keep manifest files if newer
            echo "Restoring previously built dependencies, but keeping newer files..."
            restore_latest_deps --keep-newer-files
            exit $?
            ;;

        "--restore" )
            echo "Restoring previously built dependencies..."
            restore_latest_deps
            exit $?
            ;;

        "--quick" )
            quick="true"
            ;;
    esac
fi

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

# Remove component directories and clear bower cache
if [ $quick = "false" ]; then
  echo "Removing component directories..."
  rm -rf bower_components
  rm -rf node_modules
  echo "Clearing bower cache..."
  bower cache clean
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
echo "Install all dependencies..."
npm install
npm update -g bower
npm prune

# npm install succeeded
# - make a tar archive of the npm-shrinkwrap.json file, and rm older versions
npm shrinkwrap --dev
mv_npm_shrinkwrap_file
rm_all_but_last 1 .cache/npm-shrinkwrap-for-*.json
mk_npm_shrinkwrap_tar
rm_all_but_last 1 .cache/npm-shrinkwrap-for-*.tar.gz

# - make a tar archive of the npm deps, and rm older versions
mk_npm_deps_tar
rm_all_but_last 1 .cache/npm-deps-for-*.tar.gz

time_npm=$(date +"%s")
npm_duration=$(($time_npm-$time_start))
echo "npm completed after $(($npm_duration / 60)) minutes and $(($npm_duration % 60)) seconds."

# bower install succeeded
(bower install && bower update) || exit $?

# - make a tar archive of the bower deps, and rm older versions
mk_bower_deps_tar
rm_all_but_last 1 .cache/bower-deps-for-*.tar.gz

time_bower=$(date +"%s")
bower_duration=$(($time_bower-$time_npm))
echo "bower completed after $(($bower_duration / 60)) minutes and $(($bower_duration % 60)) seconds."
