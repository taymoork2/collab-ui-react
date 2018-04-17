#!/usr/bin/env bats

# note: sourcing this file automatically runs 'export_project_root_env_var'
if type setup_helpers_unset >/dev/null 2>&1; then
    setup_helpers_unset
fi

source ./setup-helpers

# -----
@test "get_head_commit_id - should print the abbreviated hash of the head commit id (assuming a git repo is present)" {
    local tmp_git_dir=`mktemp -d -t atlas-web.XXXXX`
    cd ${tmp_git_dir}
    git init
    git commit --allow-empty -m'.' > /dev/null
    tmp_git_head_commit="`git log -n1 --pretty=format:'%h'`"

    run get_head_commit_id
    [ "$output" = "${tmp_git_head_commit}" ]

    cd ~-
    rm -rf ${tmp_git_dir}
}

@test "mk_npm_deps_tar - should make a 'npm-deps-for-*.tar.gz' archive in the './.cache' subdir" {
    local expected_archive_file=${WX2_ADMIN_WEB_CLIENT_HOME}/.cache/npm-deps-for-myid.tar.gz

    cd ${WX2_ADMIN_WEB_CLIENT_HOME}
    mkdir -p ./node_modules
    touch package.json
    run mk_npm_deps_tar "myid"

    [ -f ${expected_archive_file} ]

    rm -f ${expected_archive_file}
    cd ~-
}

@test "mk_deps_tar - should make a *.tar.gz archive in the './.cache' subdir" {
    local expected_archive_file=${WX2_ADMIN_WEB_CLIENT_HOME}/.cache/myarchive-for-myid.tar.gz

    touch foo
    mk_deps_tar "myarchive" "myid" ./foo
    [ -f ${expected_archive_file} ]
    [ "./foo" = "`tar -tf ${expected_archive_file}`" ]

    rm -f ${expected_archive_file}
    rm -f foo
}

@test "get_bash_conf_file - should print '.bash_profile' if os is OSX, otherwise '.bashrc'" {
    run get_bash_conf_file
    if [ "`uname`" = "Darwin" ]; then
        [ "$output" = ".bash_profile" ]
    else
        [ "$output" = ".bashrc" ]
    fi
}

@test "export_project_root_env_var - will already have been run, by virtue of sourcing, so ${project_root_env_var_name} will already have been set." {
    local bash_conf_file="${HOME}/`get_bash_conf_file`"
    grep -q ${project_root_env_var_name} ${bash_conf_file}
}

@test "export_project_root_env_var - when run from outside the project home dir, should error out." {
    cd $HOME
    run export_project_root_env_var
    [ $status -eq 1 ]
    [ "$output" = "[ERROR] traversed to '/' while trying to find top-level dir" ]
}

@test "export_project_root_env_var - should leave one and only one 'export ${project_root_env_var_name}' entry into the appropriate bash config file." {
    local bash_conf_file="${HOME}/`get_bash_conf_file`"
    run export_project_root_env_var
    [ 1 -eq `grep "^export ${project_root_env_var_name}=" ${bash_conf_file} | wc -l` ]
}
