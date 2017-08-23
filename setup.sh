#!/bin/bash

# shellcheck disable=SC1091
source ./bin/include/setup-helpers
quick="false"

# optional CLI switches
if [ -n "$1" ]; then
    case "$1" in
        "-h"|"--help" )
            echo "useage: $(basename "$0") [--restore|--restore-soft] [--quick]"
            echo ""
            echo "ex. Run with no args to build dependencies"
            echo "  $(basename "$0")"
            echo ""
            echo "ex. Use '--restore' to restore the most recently built dependencies (if available)"
            echo "  $(basename "$0") --restore"
            echo ""
            echo "  Same as above, but prevent overwriting manifest files"
            echo "  $(basename "$0") --restore-soft"
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
        # shellcheck disable=SC2086
        echo "\`brew\` not found, installing:"
        ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
    fi
fi

# install nvm + node 6 as-needed
if ! is_installed "nvm"; then
    echo "[INFO] \`nvm\` not found, installing:"
    curl -o- "https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh" | bash

    # because 'nvm' is installed as a bash function, need to source it in before using it
    # shellcheck disable=SC1090
    source "$HOME/$(get_bash_conf_file)"
    nvm install 6
fi

# remove component directories
if [ $quick = "false" ]; then
    echo "[INFO] Removing component directories..."
    # remove deprecated bower_components to clean up workspace
    rm -rf bower_components
    rm -rf node_modules
fi

# check for and install GNU Parallel as-appropriate
if ! is_installed "parallel"; then
    echo "[INFO] GNU \`parallel\` not found, installing:"
    install_gnu_parallel || exit 1
fi

function install_npm_deps_via_npm {
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
    npm_duration=$((time_npm - time_start))
    echo "npm completed after $((npm_duration / 60)) minutes and $((npm_duration % 60)) seconds."
    return $?
}

function install_npm_deps_via_yarn {
    yarn
    return $?
}

# install npm deps
echo "[INFO] Install npm dependencies..."
if is_installed "yarn"; then
    install_npm_deps_via_yarn || exit $?
else
    install_npm_deps_via_npm || exit $?
fi

# - make a tar archive of the npm deps, and rm older versions
echo "[INFO] Generating backup archive of npm dependencies..."
mk_npm_deps_tar
rm_all_but_last 1 .cache/npm-deps-for-*.tar.gz

echo "[INFO] Done ($(basename "$0"))"
