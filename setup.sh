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
            echo "ex. Run with '--quick' to skip removing component directores"
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

# install brew as-needed
if [ "$(uname)" = "Darwin" ]; then
    if ! is_installed "brew"; then
        echo "\`brew\` not found, installing:"
        ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
    fi
fi

# TODO: replace this with check for nvm
# install npm as-needed
if ! is_installed "npm"; then
    echo "[INFO] \`npm\` not found, installing:"
    if [ "$(uname)" = "Darwin" ]; then
        brew install npm
    else
        echo "Please install npm (for CentOS, see: http://serverfault.com/questions/299288/how-do-you-install-node-js-on-centos )."
    fi
fi

# remove component directories
if [ $quick = "false" ]; then
    echo "[INFO] Removing component directories..."
    # remove deprecated bower_components to clean up workspace
    rm -rf bower_components
    rm -rf node_modules
fi

# check for and install GNU Parallel as-appropriate
install_parallel_as_needed || exit 1

function npm_install {
    local time_start
    local time_npm
    local npm_install_options
    local npm_duration
    time_start=$(date +"%s")

    if [ "${NPM__VERBOSE}" = "true" ]; then
        npm_install_options="--loglevel=verbose"
    fi
    npm install "${npm_install_options}"

    time_npm=$(date +"%s")
    npm_duration=$(($time_npm-$time_start))
    echo "npm completed after $(($npm_duration / 60)) minutes and $(($npm_duration % 60)) seconds."
    return $?
}

function yarn_install {
    yarn
    return $?
}

# install npm deps
echo "[INFO] Install npm dependencies..."
if is_installed "yarn"; then
    yarn_install || exit $?
else
    npm_install || exit $?
fi

# - make a tar archive of the npm deps, and rm older versions
echo "[INFO] Generating backup archive of npm dependencies..."
mk_npm_deps_tar
rm_all_but_last 1 .cache/npm-deps-for-*.tar.gz

echo "[INFO] Done ($(basename $0))"
