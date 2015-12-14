#!/bin/sh

function abort {
    >&2 echo "Aborting '`basename $0`'"
    exit 1
}

cwd=`pwd`
# get project top-level dir (look for 'fabfile.py')
while [ ! -r fabfile.py -a "`pwd`" != "/" ]; do
  cd ..
done
top_dir=`pwd`
cd $cwd
if [ "${top_dir}" = "/" ]; then
    >&2 echo "Error: traversed to '/' while trying to find top-level dir"
    abort
fi

usr_label=${1}
if [ $# -lt 1 ]; then
  echo "usage: `basename $0` <usr_label>  # see: 'test_helper.coffee'"
  echo ""
  echo "ex."
  echo "  `basename $0` partner-admin"
  exit 1
fi

source ${top_dir}/bin/include/curl-api-helpers

# early out if we already have an active bearer token
bearer_token=`get_last_active_bearer_token ${usr_label}`
if [ -n "${bearer_token}" ]; then
    echo "${bearer_token}"
    exit 0
fi

# early out if no matching user label is found
auth_info="`get_auth_info ${usr_label}`"
[ $? -eq 0 ] || abort
user_id="`get_auth_info ${usr_label} | get_login`"
passwd="`get_auth_info ${usr_label} | get_passwd`"
org_id="`get_auth_info ${usr_label} | get_org_id`"
# echo "user_id: $user_id"
# echo "passwd: $passwd"
# echo "org_id: $org_id"

# clean up old oauth token metadata dirs (older than 7 days)
rm_old_token_metadata_dirs

# step 1 of 3 - login with creds, get SSO token
sso_token="`curl_get_sso_token ${user_id} ${passwd} ${org_id}`"

# step 2 of 3 - use SSO token, get authorization code
authz_code="`curl_get_authz_token ${sso_token}`"

# step 3 of 3 - use authorization code, get bearer token (also saves JSON payload to oauth token metadata dir)
bearer_token="`curl_get_bearer_token ${usr_label} ${authz_code}`"
if [ -z "${bearer_token}" ]; then
    echo "Error: no bearer_token was retrievable from CI"
    exit 1
fi
echo "${bearer_token}"
